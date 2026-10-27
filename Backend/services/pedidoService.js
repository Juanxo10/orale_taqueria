const pool = require("../db");

const ESTADOS_VALIDOS = ["nuevo", "preparando", "listo", "camino", "entregado", "cancelado"];
const ESTACIONES = ["cocina", "barra"];
const ESTADOS_ESTACION = ["pendiente", "preparando", "listo"];
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
async function crearPedido({ extraItems, cliente, metodo_pago, tipo_entrega = "domicilio", acepta_terminos }) {
  // Autorización previa y expresa del cliente (Ley 1581 de 2012): sin ella no se guarda ningún dato
  if (acepta_terminos !== true) {
    throw { status: 400, message: "Debes aceptar la Política de Privacidad y los Términos de Servicio para hacer tu pedido" };
  }

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
  // Límites de entrada: el formulario ya los aplica, aquí se exigen también en el servidor
  const largo = (v, max) => v == null || (typeof v === "string" && v.length <= max);
  if (!/^\d{7,10}$/.test(String(telefono).replace(/\D/g, "")) || typeof telefono !== "string" || typeof nombre !== "string") {
    throw { status: 400, message: "Datos del cliente no válidos" };
  }
  if (!largo(nombre, 80) || !largo(direccion, 200) || !largo(barrio, 60) || !largo(referencia, 150) || !largo(notas, 300)) {
    throw { status: 400, message: "Alguno de los textos es demasiado largo" };
  }
  if (!extraItems || typeof extraItems !== "object" || Array.isArray(extraItems)) {
    throw { status: 400, message: "Formato de pedido inválido" };
  }
  const lineas = Object.entries(extraItems).filter(([, q]) => q !== 0);
  if (lineas.length > 30 || lineas.some(([, q]) => !Number.isInteger(q) || q < 1 || q > 50)) {
    throw { status: 400, message: "Cantidades no válidas (entre 1 y 50 por producto)" };
  }
  if (!lineas.length) {
    throw { status: 400, message: "El pedido debe tener al menos un producto" };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Leer toda la configuración de precios desde la DB (case-insensitive)
    const confRes = await client.query("SELECT LOWER(clave) AS clave, valor FROM configuracion");
    const conf = {};
    for (const row of confRes.rows) conf[row.clave] = Number(row.valor);

    const DOMICILIO_CONFIG = conf.domicilio        ?? conf.precio_domicilio        ?? 7000;
    const DOMICILIO       = esRecogida ? 0 : DOMICILIO_CONFIG;

    // Recopilar todos los nombres de productos necesarios
    const allNames = new Set();
    for (const name of Object.keys(extraItems || {})) {
      allNames.add(name);
    }

    // Obtener productos de la DB en una sola consulta
    const prodRes = await client.query(
      `SELECT p.id, p.nombre, p.tipo, p.precio, COALESCE(c.estacion, 'cocina') AS estacion
       FROM productos p LEFT JOIN categorias c ON c.nombre = p.categoria
       WHERE p.nombre = ANY($1) AND p.activo = true`,
      [Array.from(allNames)]
    );
    const prodMap = {};
    for (const p of prodRes.rows) {
      prodMap[p.nombre] = p;
    }

    let subtotal = 0;

    // Calcular extras
    const extrasData = [];
    for (const [name, qty] of Object.entries(extraItems || {})) {
      if (qty <= 0) continue;
      const prod = prodMap[name];
      if (!prod) throw { status: 400, message: `Producto no encontrado: ${name}` };
      subtotal += prod.precio * qty;
      extrasData.push({ productoId: prod.id, cantidad: qty, estacion: prod.estacion });
    }

    const notasFinal = notas || null;

    const total = subtotal + DOMICILIO;
    const numero_pedido = "P" + Date.now();

    // Insertar pedido
    // Pedidos Wompi arrancan como 'pendiente_pago' — se activan solo cuando el webhook confirma
    const estadoInicial = metodo_pago === "Transferencia Wompi" ? "pendiente_pago" : "nuevo";

    const pedidoRes = await client.query(
      `INSERT INTO pedidos
        (numero_pedido, nombre_cliente, telefono, direccion, barrio, referencia, notas, metodo_pago, subtotal, domicilio, total, estado, tipo_entrega, acepto_terminos_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
       RETURNING id, numero_pedido, total`,
      [numero_pedido, nombre, telefono, esRecogida ? null : direccion, esRecogida ? null : barrio, referencia || null, notasFinal, metodo_pago, subtotal, DOMICILIO, total, estadoInicial, tipo_entrega]
    );
    const pedidoId = pedidoRes.rows[0].id;

    // Insertar extras
    for (const ext of extrasData) {
      await client.query(
        "INSERT INTO pedido_extras (pedido_id, producto_id, cantidad) VALUES ($1,$2,$3)",
        [pedidoId, ext.productoId, ext.cantidad]
      );
    }

    // Una fila por estación que tenga productos en este pedido
    for (const estacion of new Set(extrasData.map((e) => e.estacion))) {
      await client.query("INSERT INTO pedido_estaciones (pedido_id, estacion) VALUES ($1,$2)", [pedidoId, estacion]);
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

  const extrasRes = await pool.query(
    `SELECT pe.pedido_id, pr.nombre, pe.cantidad, COALESCE(c.estacion, 'cocina') AS estacion
     FROM pedido_extras pe
     JOIN productos pr ON pe.producto_id = pr.id
     LEFT JOIN categorias c ON c.nombre = pr.categoria
     WHERE pe.pedido_id = ANY($1)`,
    [pedidoIds]
  );
  const estRes = await pool.query(
    "SELECT pedido_id, estacion, estado FROM pedido_estaciones WHERE pedido_id = ANY($1)",
    [pedidoIds]
  );

  // Indexar extras por pedido_id
  const extrasByPedido = {};
  const estacionesByPedido = {};
  for (const e of extrasRes.rows) {
    if (!extrasByPedido[e.pedido_id]) extrasByPedido[e.pedido_id] = {};
    extrasByPedido[e.pedido_id][e.nombre] = e.cantidad;
    // Items por estación para las pantallas de cocina y barra
    const est = (estacionesByPedido[e.pedido_id] ||= {});
    (est[e.estacion] ||= { estado: "pendiente", items: {} }).items[e.nombre] = e.cantidad;
  }
  for (const r of estRes.rows) {
    const est = estacionesByPedido[r.pedido_id];
    if (est?.[r.estacion]) est[r.estacion].estado = r.estado;
  }

  const result = pedidosRes.rows.map((p) => {
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
      extraItems: extrasByPedido[p.id] || {},
      estaciones: estacionesByPedido[p.id] || {},
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

// ── Cambiar estado de una estación (cocina / barra) ─────
// Recalcula el estado global: alguna preparando → 'preparando'; todas listas → 'listo'
async function cambiarEstadoEstacion(id, estacion, estado) {
  if (!ESTACIONES.includes(estacion) || !ESTADOS_ESTACION.includes(estado)) {
    throw { status: 400, message: "Estación o estado inválido" };
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ped = await client.query("SELECT estado FROM pedidos WHERE id = $1 FOR UPDATE", [id]);
    if (!ped.rows.length) throw { status: 404, message: "Pedido no encontrado" };
    if (["camino", "entregado", "cancelado", "pendiente_pago"].includes(ped.rows[0].estado)) {
      throw { status: 409, message: "El pedido ya no admite cambios en cocina o barra" };
    }
    const upd = await client.query(
      "UPDATE pedido_estaciones SET estado = $1, actualizado_en = NOW() WHERE pedido_id = $2 AND estacion = $3",
      [estado, id, estacion]
    );
    if (!upd.rowCount) throw { status: 404, message: "Este pedido no tiene productos de esa estación" };

    const todas = (await client.query("SELECT estado FROM pedido_estaciones WHERE pedido_id = $1", [id])).rows.map((r) => r.estado);
    const global = todas.every((e) => e === "listo") ? "listo" : todas.some((e) => e !== "pendiente") ? "preparando" : "nuevo";
    await client.query("UPDATE pedidos SET estado = $1 WHERE id = $2", [global, id]);
    await client.query("COMMIT");
    invalidarCache();
    return { id: Number(id), estacion, estado, status: global };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
       AND metodo_pago = 'Transferencia Wompi'
       AND estado IN ('pendiente_pago', 'nuevo')
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

module.exports = { crearPedido, listarPedidos, cambiarEstado, cambiarEstadoEstacion, updateWompiPayment, warmup, invalidarCache, revisarPendientesWompi };
