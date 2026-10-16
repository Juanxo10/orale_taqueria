const pool = require('../db');

async function main() {
  const hash = '$2b$10$88DBH4F9YMZ9DXJU1za5wu2sq2Bv3CdjkHIWTAPQq/NMkJmF57yIm';
  const { rows } = await pool.query(
    `INSERT INTO staff (nombre, email, password_hash, rol, activo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, activo = true
     RETURNING id, nombre, email, rol`,
    ['Admin', 'judaropa98@gmail.com', hash, 'admin']
  );
  console.log('Usuario creado/actualizado:', rows[0]);
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
