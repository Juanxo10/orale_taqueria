// Crea tablas, aplica migraciones, carga productos y crea el admin local.
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const pool = require("../db");

const sql = (f) => fs.readFileSync(path.join(__dirname, "..", "db", f), "utf8");

(async () => {
  for (const f of ["schema.sql", "migration_auth.sql", "migration_caja_vaso.sql", "migration_sugerencias.sql", "migration_tipo_entrega.sql", "migration_wompi.sql"]) {
    await pool.query(sql(f));
  }
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM productos");
  if (rows[0].n === 0) await pool.query(sql("seed.sql"));

  const email = process.env.ADMIN_EMAIL || "admin@tacos.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  await pool.query(
    `INSERT INTO staff (nombre, email, password_hash, rol) VALUES ('Admin', $1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, activo = true`,
    [email, await bcrypt.hash(password, 10)]
  );
  console.log(`✅ BD lista. Login admin: ${email} / ${password}`);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
