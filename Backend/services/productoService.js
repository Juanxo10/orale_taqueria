const pool = require("../db");

// Menú público agrupado por categoría, mismo formato que MENU del frontend: [{ cat, note, items: [{ id, name, price, desc, foto }] }]
async function menu() {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.precio, p.descripcion, p.foto, p.categoria, c.nota
     FROM productos p LEFT JOIN categorias c ON c.nombre = p.categoria
     WHERE p.tipo = 'extra' AND NOT p.archivado AND p.categoria IS NOT NULL
     ORDER BY COALESCE(c.orden, 999), p.categoria, p.orden, p.id`
  );
  const cats = [];
  for (const r of rows) {
    if (cats.at(-1)?.cat !== r.categoria) cats.push({ cat: r.categoria, note: r.nota || undefined, items: [] });
    cats.at(-1).items.push({ id: r.id, name: r.nombre, price: r.precio, desc: r.descripcion || undefined, foto: r.foto || undefined });
  }
  return cats;
}

async function nombreLibre(client, nombre, id) {
  const { rowCount } = await client.query(
    "SELECT 1 FROM productos WHERE nombre = $1 AND tipo = 'extra' AND NOT archivado AND id IS DISTINCT FROM $2",
    [nombre, id]
  );
  if (rowCount) throw { status: 409, message: "Ya existe un producto con ese nombre en el menú" };
}

// Categoría nueva = va al final del menú
const asegurarCategoria = (client, cat) =>
  client.query(
    "INSERT INTO categorias (nombre, orden) SELECT $1, COALESCE(MAX(orden), 0) + 1 FROM categorias ON CONFLICT (nombre) DO NOTHING",
    [cat]
  );

async function crear({ nombre, categoria, precio, descripcion, foto }) {
  await nombreLibre(pool, nombre, null);
  await asegurarCategoria(pool, categoria);
  const { rows } = await pool.query(
    `INSERT INTO productos (nombre, tipo, precio, categoria, descripcion, foto, orden)
     SELECT $1, 'extra', $2, $3::varchar, $4::text, $5::text, COALESCE(MAX(orden), -1) + 1 FROM productos WHERE categoria = $3::varchar
     RETURNING id`,
    [nombre, precio, categoria, descripcion, foto]
  );
  return rows[0];
}

async function actualizar(id, { nombre, categoria, precio, descripcion, foto }) {
  await nombreLibre(pool, nombre, id);
  await asegurarCategoria(pool, categoria);
  const { rows } = await pool.query(
    `UPDATE productos SET nombre = $2, categoria = $3, precio = $4, descripcion = $5, foto = $6
     WHERE id = $1 AND tipo = 'extra' AND NOT archivado RETURNING id`,
    [id, nombre, categoria, precio, descripcion, foto]
  );
  if (!rows.length) throw { status: 404, message: "Producto no encontrado" };
  return rows[0];
}

// Archiva en vez de borrar: los pedidos viejos lo siguen referenciando. activo = false para que ya no se pueda pedir.
async function archivar(id) {
  const { rowCount } = await pool.query(
    "UPDATE productos SET archivado = true, activo = false WHERE id = $1 AND tipo = 'extra' AND NOT archivado",
    [id]
  );
  if (!rowCount) throw { status: 404, message: "Producto no encontrado" };
}

module.exports = { menu, crear, actualizar, archivar };
