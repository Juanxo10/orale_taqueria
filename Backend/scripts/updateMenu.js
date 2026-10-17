// Migra una BD existente al menú nuevo: borra los productos viejos (si hay pedidos que los referencian, falla) y carga db/seed.sql. Correr UNA sola vez.
const fs = require("fs");
const path = require("path");
const pool = require("../db");

(async () => {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const off = await c.query("DELETE FROM productos");
    await c.query(fs.readFileSync(path.join(__dirname, "..", "db", "seed.sql"), "utf8"));
    await c.query("COMMIT");
    const { rows } = await c.query("SELECT COUNT(*)::int AS n FROM productos WHERE activo");
    console.log(`✅ ${off.rowCount} productos viejos borrados, ${rows[0].n} activos`);
  } catch (e) { await c.query("ROLLBACK"); throw e; }
  finally { c.release(); await pool.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
