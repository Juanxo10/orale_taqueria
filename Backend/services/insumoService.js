const pool = require("../db");

// Unidades vendidas por producto en un pedido: extras por cantidad; base, bebida, toppings, proteínas e incluidos de cada bowl a 1.
const CONSUMO = `
  SELECT pedido_id, producto_id, cantidad FROM pedido_extras
  UNION ALL SELECT pedido_id, base_id, 1 FROM bowls WHERE base_id IS NOT NULL
  UNION ALL SELECT pedido_id, bebida_id, 1 FROM bowls WHERE bebida_id IS NOT NULL
  UNION ALL SELECT b.pedido_id, bi.producto_id, 1 FROM bowl_items bi JOIN bowls b ON b.id = bi.bowl_id`;

// Cierre de caja: insumos gastados entre dos fechas inclusive (hora de Bogotá) = receta × unidades vendidas,
// sin pedidos cancelados ni pagos pendientes. desde null = hoy; hasta null = el mismo día de desde.
async function consumo(desde, hasta) {
  const { rows } = await pool.query(
    `WITH d AS (SELECT COALESCE($1::date, (NOW() AT TIME ZONE 'America/Bogota')::date) AS desde,
                       COALESCE($2::date, $1::date, (NOW() AT TIME ZONE 'America/Bogota')::date) AS hasta),
          v AS (SELECT c.producto_id, SUM(c.cantidad) AS q
                FROM (${CONSUMO}) c JOIN pedidos o ON o.id = c.pedido_id, d
                WHERE o.estado NOT IN ('cancelado', 'pendiente_pago')
                  AND (o.creado_en AT TIME ZONE 'America/Bogota')::date BETWEEN d.desde AND d.hasta
                GROUP BY 1)
     SELECT i.nombre, i.unidad, SUM(r.cantidad * v.q)::float8 AS gastado
     FROM v JOIN recetas r USING (producto_id) JOIN insumos i ON i.id = r.insumo_id
     GROUP BY i.id ORDER BY i.nombre`,
    [desde, hasta]
  );
  return rows;
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

const COLS = "id, nombre, unidad";

const listar = async () => (await pool.query(`SELECT ${COLS} FROM insumos ORDER BY nombre`)).rows;

const duplicado = (e) => {
  if (e.code === "23505") throw { status: 409, message: "Ya existe un insumo con ese nombre" };
  throw e;
};

async function crear({ nombre, unidad }) {
  try {
    const { rows } = await pool.query(`INSERT INTO insumos (nombre, unidad) VALUES ($1,$2) RETURNING ${COLS}`, [nombre, unidad]);
    return rows[0];
  } catch (e) { return duplicado(e); }
}

async function actualizar(id, { nombre, unidad }) {
  let rows;
  try {
    ({ rows } = await pool.query(`UPDATE insumos SET nombre = $2, unidad = $3 WHERE id = $1 RETURNING ${COLS}`, [id, nombre, unidad]));
  } catch (e) { return duplicado(e); }
  if (!rows.length) throw { status: 404, message: "Insumo no encontrado" };
  return rows[0];
}

async function eliminar(id) {
  const { rowCount } = await pool.query("DELETE FROM insumos WHERE id = $1", [id]);
  if (!rowCount) throw { status: 404, message: "Insumo no encontrado" };
}

const listarRecetas = async () =>
  (await pool.query(
    `SELECT p.nombre AS producto, r.insumo_id, r.cantidad::float8 AS cantidad
     FROM recetas r JOIN productos p ON p.id = r.producto_id`
  )).rows;

async function guardarReceta(producto, items) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT id FROM productos WHERE nombre = $1 LIMIT 1", [producto]);
    if (!rows.length) throw { status: 404, message: "Producto no encontrado" };
    await client.query("DELETE FROM recetas WHERE producto_id = $1", [rows[0].id]);
    for (const it of items) {
      await client.query("INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES ($1,$2,$3)", [rows[0].id, it.insumo_id, it.cantidad]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { consumo, diasConVentas, listar, crear, actualizar, eliminar, listarRecetas, guardarReceta };
