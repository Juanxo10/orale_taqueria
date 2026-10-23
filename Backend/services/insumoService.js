const pool = require("../db");

// Unidades vendidas por producto en un pedido (cantidad de cada extra).
const CONSUMO = `SELECT pedido_id, producto_id, cantidad FROM pedido_extras`;

// Cierre de caja: insumos gastados entre dos fechas inclusive (hora de Bogotá) = receta × unidades vendidas,
// sin pedidos cancelados ni pagos pendientes. desde null = hoy; hasta null = el mismo día de desde.
// Los preparados se cuentan tal cual y además se desglosan en sus crudos (sub-receta × preparado gastado).
async function consumo(desde, hasta) {
  const { rows } = await pool.query(
    `WITH d AS (SELECT COALESCE($1::date, (NOW() AT TIME ZONE 'America/Bogota')::date) AS desde,
                       COALESCE($2::date, $1::date, (NOW() AT TIME ZONE 'America/Bogota')::date) AS hasta),
          v AS (SELECT c.producto_id, SUM(c.cantidad) AS q
                FROM (${CONSUMO}) c JOIN pedidos o ON o.id = c.pedido_id, d
                WHERE o.estado NOT IN ('cancelado', 'pendiente_pago')
                  AND (o.creado_en AT TIME ZONE 'America/Bogota')::date BETWEEN d.desde AND d.hasta
                GROUP BY 1),
          g AS (SELECT r.insumo_id, SUM(r.cantidad * v.q) AS q FROM v JOIN recetas r USING (producto_id) GROUP BY 1),
          t AS (SELECT insumo_id, q FROM g
                UNION ALL SELECT p.crudo_id, g.q * p.cantidad FROM g JOIN preparaciones p ON p.preparado_id = g.insumo_id)
     SELECT i.nombre, i.unidad, i.tipo, SUM(t.q)::float8 AS gastado
     FROM t JOIN insumos i ON i.id = t.insumo_id
     GROUP BY i.id ORDER BY i.nombre`,
    [desde, hasta]
  );
  return {
    crudos: rows.filter((r) => r.tipo === "crudo"),
    preparados: rows.filter((r) => r.tipo === "preparado"),
  };
}

// Historial: días con ventas (más recientes primero), para consultar o descargar cierres pasados.
async function diasConVentas() {
  const { rows } = await pool.query(
    `SELECT (creado_en AT TIME ZONE 'America/Bogota')::date::text AS fecha, COUNT(*)::int AS pedidos
     FROM pedidos WHERE estado NOT IN ('cancelado', 'pendiente_pago')
     GROUP BY 1 ORDER BY 1 DESC LIMIT 90`
  );
  return rows;
}

const COLS = "id, nombre, unidad, tipo";

const listar = async () => (await pool.query(`SELECT ${COLS} FROM insumos ORDER BY nombre`)).rows;

const duplicado = (e) => {
  if (e.code === "23505") throw { status: 409, message: "Ya existe un insumo con ese nombre" };
  throw e;
};

async function crear({ nombre, unidad, tipo }) {
  try {
    const { rows } = await pool.query(`INSERT INTO insumos (nombre, unidad, tipo) VALUES ($1,$2,$3) RETURNING ${COLS}`, [nombre, unidad, tipo]);
    return rows[0];
  } catch (e) { return duplicado(e); }
}

// Transacción: fn(client) y COMMIT, o ROLLBACK si algo falla.
async function enTransaccion(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await fn(client);
    await client.query("COMMIT");
    return r;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// Al cambiar de tipo se borran las sub-recetas que dejarían de tener sentido (un preparado solo lleva crudos).
const actualizar = (id, { nombre, unidad, tipo }) => enTransaccion(async (client) => {
  let rows;
  try {
    ({ rows } = await client.query(`UPDATE insumos SET nombre = $2, unidad = $3, tipo = $4 WHERE id = $1 RETURNING ${COLS}`, [id, nombre, unidad, tipo]));
  } catch (e) { return duplicado(e); }
  if (!rows.length) throw { status: 404, message: "Insumo no encontrado" };
  await client.query(`DELETE FROM preparaciones WHERE ${tipo === "crudo" ? "preparado_id" : "crudo_id"} = $1`, [id]);
  return rows[0];
});

async function eliminar(id) {
  const { rowCount } = await pool.query("DELETE FROM insumos WHERE id = $1", [id]);
  if (!rowCount) throw { status: 404, message: "Insumo no encontrado" };
}

const listarRecetas = async () =>
  (await pool.query("SELECT producto_id, insumo_id, cantidad::float8 AS cantidad FROM recetas")).rows;

const guardarReceta = (productoId, items) => enTransaccion(async (client) => {
  const { rowCount } = await client.query("SELECT 1 FROM productos WHERE id = $1", [productoId]);
  if (!rowCount) throw { status: 404, message: "Producto no encontrado" };
  await client.query("DELETE FROM recetas WHERE producto_id = $1", [productoId]);
  for (const it of items) {
    await client.query("INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES ($1,$2,$3)", [productoId, it.insumo_id, it.cantidad]);
  }
});

const listarPreparaciones = async () =>
  (await pool.query("SELECT preparado_id, crudo_id, cantidad::float8 AS cantidad FROM preparaciones")).rows;

// Sub-receta de 1 unidad del preparado: solo crudos (un nivel, sin ciclos).
const guardarPreparacion = (preparadoId, items) => enTransaccion(async (client) => {
  const { rows } = await client.query("SELECT tipo FROM insumos WHERE id = $1", [preparadoId]);
  if (!rows.length) throw { status: 404, message: "Insumo no encontrado" };
  if (rows[0].tipo !== "preparado") throw { status: 400, message: "Solo los preparados llevan receta" };
  const ids = items.map((i) => i.insumo_id);
  const crudos = await client.query("SELECT COUNT(*)::int AS n FROM insumos WHERE id = ANY($1) AND tipo = 'crudo'", [ids]);
  if (crudos.rows[0].n !== ids.length) throw { status: 400, message: "Un preparado solo puede llevar materia prima cruda" };
  await client.query("DELETE FROM preparaciones WHERE preparado_id = $1", [preparadoId]);
  for (const it of items) {
    await client.query("INSERT INTO preparaciones (preparado_id, crudo_id, cantidad) VALUES ($1,$2,$3)", [preparadoId, it.insumo_id, it.cantidad]);
  }
});

module.exports = {
  consumo, diasConVentas, listar, crear, actualizar, eliminar,
  listarRecetas, guardarReceta, listarPreparaciones, guardarPreparacion,
};
