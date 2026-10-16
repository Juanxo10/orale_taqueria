const pool = require("../db");

const ESTADOS_VALIDOS = ["nuevo", "preparando", "camino", "entregado", "cancelado"];
const METODOS_VALIDOS = ["Contraentrega en efectivo", "Transferencia Wompi"];
const TIPOS_ENTREGA_VALIDOS = ["domicilio", "recogida"];

// ── Caché en memoria para pedidos ───────────────────────
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL = 30_000; // 30 s de TTL máximo

function invalidarCache() {
  _cache = null;
  _cacheTs = 0;
}

// ── Crear pedido ─────────────────────────────────────────
async function crearPedido({ bowls, extraItems, frappesAlmond, cliente, metodo_pago, tipo_entrega = "domicilio" }) {
  if (!METODOS_VALIDOS.includes(metodo_pago)) {
    throw { status: 400, message: "Método de pago no disponible" };
  }

  if (!TIPOS_ENTREGA_VALIDOS.includes(tipo_entrega)) {
    throw { status: 400, message: "Tipo de entrega no válido" };
  }

  const esRecogida = tipo_entrega === "recogida";
  const { nombre, telefono, direccion, barrio, referencia, notas } = cliente || {};

  if (!nombre || !telefono) {
    throw { status: 400, message: "Faltan datos del cliente" };
  }
  if (!esRecogida && (!direccion || !barrio)) {
    throw { status: 400, message: "Faltan datos de entrega (dirección y barrio requeridos para domicilio)" };
  }
  if (!Array.isArray(bowls)) {
    throw { status: 400, message: "Formato de pedido inválido" };
  }
  const hasExtras = Object.values(extraItems || {}).some((q) => q > 0);
  if (bowls.length === 0 && !hasExtras) {
    throw { status: 400, message: "El pedido debe tener al menos un bowl o un producto adicional" };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Leer toda la configuración de precios desde la DB (case-insensitive)
    const confRes = await client.query("SELECT LOWER(clave) AS clave, valor FROM configuracion");
    const conf = {};
    for (const row of confRes.rows) conf[row.clave] = Number(row.valor);

    const DOMICILIO_CONFIG = conf.domicilio        ?? conf.precio_domicilio        ?? 6000;
    const DOMICILIO       = esRecogida ? 0 : DOMICILIO_CONFIG;
    const BOWL_BASE       = conf.bowl_base         ?? conf.precio_base_bowl        ?? 12000;
    const TOPPINGS_GRATIS = conf.toppings_gratis   ?? conf.toppings_incluidos      ?? 4;
    const TOPPING_EXTRA   = conf.topping_extra      ?? conf.precio_topping_extra   ?? 3000;
    const LECHE_ALMENDRAS_PRECIO = conf.leche_almendras ?? 2500;
    const CAJA            = conf.caja              ?? 1000;
    const VASO            = conf.vaso              ?? 1000;

    // Recopilar todos los nombres de productos necesarios
    const allNames = new Set();
    for (const bowl of bowls) {
      if (bowl.carb) allNames.add(bowl.carb);
      (bowl.tops || []).forEach((t) => allNames.add(t));
      (bowl.prots || []).forEach((p) => allNames.add(p));
      if (bowl.bev) allNames.add(bowl.bev);
      if (bowl.lechuga) allNames.add("Lechuga");
      if (bowl.vinagreta) allNames.add("Vinagreta");
    }
    for (const name of Object.keys(extraItems || {})) {
      allNames.add(name);
    }

    // Obtener productos de la DB en una sola consulta
    const prodRes = await client.query(
      "SELECT id, nombre, tipo, precio FROM productos WHERE nombre = ANY($1) AND activo = true",
      [Array.from(allNames)]
    );
    const prodMap = {};
    for (const p of prodRes.rows) {
      prodMap[p.nombre] = p;
    }

    // Calcular precios y preparar datos de bowls
    let subtotal = 0;
    const bowlsData = [];

    for (const bowl of bowls) {
      const base = prodMap[bowl.carb];
      if (!base) throw { status: 400, message: `Producto no encontrado: ${bowl.carb}` };

      // Precio base fijo del bowl (leído de configuracion)
      let bowlPrice = BOWL_BASE;
      const toppingIds = [];
      const proteinIds = [];

      const topsArr = bowl.tops || [];
      for (let ti = 0; ti < topsArr.length; ti++) {
        const prod = prodMap[topsArr[ti]];
        if (!prod) throw { status: 400, message: `Producto no encontrado: ${topsArr[ti]}` };
        // Los primeros TOPPINGS_GRATIS son gratis; los demás usan el precio del producto en DB
        if (ti >= TOPPINGS_GRATIS) bowlPrice += prod.precio > 0 ? prod.precio : TOPPING_EXTRA;
        toppingIds.push(prod.id);
      }

      for (const p of bowl.prots || []) {
        const prod = prodMap[p];
        if (!prod) throw { status: 400, message: `Producto no encontrado: ${p}` };
        bowlPrice += prod.precio;
        proteinIds.push(prod.id);
      }

      let bebidaId = null;
      if (bowl.bev) {
        const prod = prodMap[bowl.bev];
        if (!prod) throw { status: 400, message: `Producto no encontrado: ${bowl.bev}` };
        bowlPrice += prod.precio;
        bowlPrice += VASO; // cargo por vaso
        bebidaId = prod.id;
      }

      // Cargo por caja (siempre en bowl)
      bowlPrice += CAJA;

      // Incluidos (precio 0 pero se registran)
      const incluidoIds = [];
      if (bowl.lechuga && prodMap["Lechuga"]) incluidoIds.push(prodMap["Lechuga"].id);
      if (bowl.vinagreta && prodMap["Vinagreta"]) incluidoIds.push(prodMap["Vinagreta"].id);

      const cajaCargo = CAJA;
      const vasoCargo = bowl.bev ? VASO : 0;
      subtotal += bowlPrice;
      bowlsData.push({ baseId: base.id, bebidaId, toppingIds, proteinIds, incluidoIds, caja: cajaCargo, vaso: vasoCargo });
    }

    // Calcular extras
    const extrasData = [];
    for (const [name, qty] of Object.entries(extraItems || {})) {
      if (qty <= 0) continue;
      const prod = prodMap[name];
      if (!prod) throw { status: 400, message: `Producto no encontrado: ${name}` };
      subtotal += prod.precio * qty;
      extrasData.push({ productoId: prod.id, cantidad: qty });
    }

    // Leche de almendras para frappes (precio desde configuracion)
    const FRAPPES_SET = new Set([
      "Frappe de café", "Frappe mocca", "Frappe arequipe", "Frappe baileys",
      "Frappe té chai", "Caños cristales", "Caños negros", "Macarena",
    ]);
    const almondInfo = [];
    for (const [name, hasAlmond] of Object.entries(frappesAlmond || {})) {
      if (hasAlmond && FRAPPES_SET.has(name)) {
        const qty = (extraItems || {})[name] || 0;
        if (qty > 0) {
          subtotal += LECHE_ALMENDRAS_PRECIO * qty;
          almondInfo.push(`${name} x${qty} (leche almendras)`);
        }
      }
    }
    let notasFinal = notas || null;
    if (almondInfo.length > 0) {
      const almondNote = "Leche almendras: " + almondInfo.join(", ");
      notasFinal = notasFinal ? notasFinal + " | " + almondNote : almondNote;
    }

    const total = subtotal + DOMICILIO;
    const numero_pedido = "P" + Date.now();

    // Insertar pedido
    // Pedidos Wompi arrancan como 'pendiente_pago' — se activan solo cuando el webhook confirma
    const estadoInicial = metodo_pago === "Transferencia Wompi" ? "pendiente_pago" : "nuevo";

    const pedidoRes = await client.query(
      `INSERT INTO pedidos
        (numero_pedido, nombre_cliente, telefono, direccion, barrio, referencia, notas, metodo_pago, subtotal, domicilio, total, estado, tipo_entrega)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, numero_pedido, total`,
      [numero_pedido, nombre, telefono, esRecogida ? null : direccion, esRecogida ? null : barrio, referencia || null, notasFinal, metodo_pago, subtotal, DOMICILIO, total, estadoInicial, tipo_entrega]
    );
    const pedidoId = pedidoRes.rows[0].id;

    // Insertar bowls + items
    for (const bd of bowlsData) {
      const bowlRes = await client.query(
        "INSERT INTO bowls (pedido_id, base_id, bebida_id, caja, vaso) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        [pedidoId, bd.baseId, bd.bebidaId, bd.caja, bd.vaso]
      );
      const bowlId = bowlRes.rows[0].id;

      const allItemIds = [...bd.toppingIds, ...bd.proteinIds, ...bd.incluidoIds];
      for (const prodId of allItemIds) {
        await client.query(
          "INSERT INTO bowl_items (bowl_id, producto_id) VALUES ($1,$2)",
          [bowlId, prodId]
        );
      }
    }

    // Insertar extras
    for (const ext of extrasData) {
      await client.query(
        "INSERT INTO pedido_extras (pedido_id, producto_id, cantidad) VALUES ($1,$2,$3)",
        [pedidoId, ext.productoId, ext.cantidad]
      );
    }

    await client.query("COMMIT");
    return pedidoRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── Listar pedidos ───────────────────────────────────────
async function listarPedidos() {
  if (_cache && Date.now() - _cacheTs < CACHE_TTL) return _cache;
  // 1 sola query para pedidos
  const pedidosRes = await pool.query(
    "SELECT * FROM pedidos WHERE estado != 'pendiente_pago' ORDER BY creado_en DESC"
  );
  if (!pedidosRes.rows.length) return [];

  const pedidoIds = pedidosRes.rows.map((p) => p.id);

  // 3 queries en paralelo para bowls, bowl_items y extras de todos los pedidos
  const [bowlsRes, itemsRes, extrasRes] = await Promise.all([
    pool.query(
      `SELECT b.id, b.pedido_id, b.caja, b.vaso, base.nombre AS base, beb.nombre AS bebida
       FROM bowls b
       LEFT JOIN productos base ON b.base_id = base.id
       LEFT JOIN productos beb  ON b.bebida_id = beb.id
       WHERE b.pedido_id = ANY($1)`,
      [pedidoIds]
    ),
    pool.query(
      `SELECT bi.bowl_id, pr.nombre, pr.tipo
       FROM bowl_items bi
       JOIN productos pr ON bi.producto_id = pr.id
       WHERE bi.bowl_id IN (
         SELECT id FROM bowls WHERE pedido_id = ANY($1)
       )`,
      [pedidoIds]
    ),
    pool.query(
      `SELECT pe.pedido_id, pr.nombre, pe.cantidad
       FROM pedido_extras pe
       JOIN productos pr ON pe.producto_id = pr.id
       WHERE pe.pedido_id = ANY($1)`,
      [pedidoIds]
    ),
  ]);

  // Indexar bowls por pedido_id
  const bowlsByPedido = {};
  for (const b of bowlsRes.rows) {
    if (!bowlsByPedido[b.pedido_id]) bowlsByPedido[b.pedido_id] = [];
    bowlsByPedido[b.pedido_id].push({ id: b.id, base: b.base, bebida: b.bebida, caja: b.caja, vaso: b.vaso });
  }

  // Indexar items por bowl_id
  const itemsByBowl = {};
  for (const i of itemsRes.rows) {
    if (!itemsByBowl[i.bowl_id]) itemsByBowl[i.bowl_id] = [];
    itemsByBowl[i.bowl_id].push(i);
  }

  // Indexar extras por pedido_id
  const extrasByPedido = {};
  for (const e of extrasRes.rows) {
    if (!extrasByPedido[e.pedido_id]) extrasByPedido[e.pedido_id] = {};
    extrasByPedido[e.pedido_id][e.nombre] = e.cantidad;
  }

  const result = pedidosRes.rows.map((p) => {
    const bowls = (bowlsByPedido[p.id] || []).map((b) => {
      const items = itemsByBowl[b.id] || [];
      return {
        base: b.base,
        bebida: b.bebida,
        caja: b.caja ?? 0,
        vaso: b.vaso ?? 0,
        toppings:  items.filter((i) => i.tipo === "topping").map((i) => i.nombre),
        proteinas: items.filter((i) => i.tipo === "proteina").map((i) => i.nombre),
        incluidos: items.filter((i) => i.tipo === "incluido").map((i) => i.nombre),
      };
    });
    return {
      id: p.id,
      numero_pedido: p.numero_pedido,
      nombre: p.nombre_cliente,
      tel: p.telefono,
      addr: p.direccion,
      barrio: p.barrio,
      ref: p.referencia,
      notas: p.notas,
      pago: p.metodo_pago,
      tipo_entrega: p.tipo_entrega || "domicilio",
      status: p.estado,
      estado_pago: p.estado_pago,
      subtotal: p.subtotal,
      domicilio: p.domicilio,
      total: p.total,
      hora: p.creado_en,
      bowls,
      extraItems: extrasByPedido[p.id] || {},
    };
  });

  _cache = result;
  _cacheTs = Date.now();
  return result;
}

// ── Cambiar estado ───────────────────────────────────────
async function cambiarEstado(id, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw { status: 400, message: "Estado inválido" };
  }
  const res = await pool.query(
    "UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING id, estado",
    [estado, id]
  );
  if (!res.rows.length) {
    throw { status: 404, message: "Pedido no encontrado" };
  }
  invalidarCache();
  return res.rows[0];
}

// ── Actualizar pago Wompi ─────────────────────────────────
// Llamado desde el webhook de Wompi para registrar el resultado
async function updateWompiPayment(numero_pedido, wompiTransactionId, estadoPago) {
  // Si el pago fue aprobado → activar el pedido (pasa a 'nuevo' y aparece en admin)
  // Si fue rechazado/error  → cancelar el pedido (no aparece en admin)
  const nuevoEstado = estadoPago === "aprobado" ? "nuevo" : "cancelado";

  const res = await pool.query(
    `UPDATE pedidos
     SET wompi_transaction_id = $1, estado_pago = $2, estado = $3
     WHERE numero_pedido = $4
     RETURNING id, numero_pedido, estado_pago, estado`,
    [wompiTransactionId, estadoPago, nuevoEstado, numero_pedido]
  );
  if (!res.rows.length) {
    throw { status: 404, message: "Pedido no encontrado" };
  }
  invalidarCache();
  return res.rows[0];
}

// ── Warmup: conecta al DB en cuanto arranca el servidor ──
async function warmup() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB warmup OK");
  } catch (e) {
    console.error("⚠️  DB warmup falló:", e.message);
  }
}

// ── Job: revisar pedidos Wompi pendientes ──────────────────
async function revisarPendientesWompi() {
  let pendientes;
  try {
    const res = await pool.query(
      `SELECT numero_pedido, wompi_transaction_id
       FROM pedidos
       WHERE metodo_pago = 'Transferencia Wompi'
         AND estado = 'pendiente_pago'
         AND creado_en < NOW() - INTERVAL '2 minutes'
         AND creado_en > NOW() - INTERVAL '24 hours'`
    );
    pendientes = res.rows;
  } catch (e) {
    console.error("⚠️  Job Wompi - error consultando BD:", e.message);
    return;
  }

  // Cancelar automáticamente pedidos pendientes de pago con más de 24h
  try {
    const cancelados = await pool.query(
      `UPDATE pedidos SET estado = 'cancelado'
       WHERE estado = 'pendiente_pago'
         AND creado_en < NOW() - INTERVAL '24 hours'
       RETURNING numero_pedido`
    );
    if (cancelados.rowCount > 0) {
      console.log(`Job Wompi: cancelados ${cancelados.rowCount} pedido(s) expirado(s):`, cancelados.rows.map((r) => r.numero_pedido));
      invalidarCache();
    }
  } catch (e) {
    console.error("⚠️  Job Wompi - error cancelando expirados:", e.message);
  }

  if (!pendientes.length) {
    console.log("Job Wompi: sin pendientes recientes");
    return;
  }

  console.log(`Job Wompi: revisando ${pendientes.length} pedido(s) pendiente(s)`);

  // Siempre usar sandbox mientras WOMPI_PRIVATE_KEY sea de pruebas
  const privateKey = process.env.WOMPI_PRIVATE_KEY || "";
  const baseUrl = privateKey.startsWith("prv_prod")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
  const headers = { Authorization: `Bearer ${privateKey}` };

  for (const pedido of pendientes) {
    try {
      const url = `${baseUrl}/transactions?reference=${pedido.numero_pedido}`;
      console.log(`Job Wompi: consultando ${url}`);

      const r = await fetch(url, { headers });
      const text = await r.text();
      console.log(`Job Wompi: respuesta ${r.status} → ${text.slice(0, 200)}`);
      if (!r.ok) continue;

      const data = JSON.parse(text);
      const tx = Array.isArray(data?.data) ? data.data[0] : data?.data;
      if (!tx) { console.log(`Job Wompi: sin transacción para ${pedido.numero_pedido}`); continue; }

      console.log(`Job Wompi: ${pedido.numero_pedido} status=${tx.status}`);

      const estadoPagoMap = { APPROVED: "aprobado", DECLINED: "rechazado", ERROR: "error", VOIDED: "rechazado" };
      const estadoPago = estadoPagoMap[tx.status];
      if (!estadoPago) { console.log(`Job Wompi: ${pedido.numero_pedido} aún PENDING`); continue; }

      await updateWompiPayment(tx.reference, tx.id, estadoPago);
      console.log(`✅ Pago recuperado: ${tx.reference} → ${estadoPago}`);
    } catch (e) {
      console.error(`⚠️  Job Wompi - error en ${pedido.numero_pedido}:`, e.message);
    }
  }
}

module.exports = { crearPedido, listarPedidos, cambiarEstado, updateWompiPayment, warmup, invalidarCache, revisarPendientesWompi };
