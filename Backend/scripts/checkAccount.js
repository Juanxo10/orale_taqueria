const pool = require('../db');

async function main() {
  await pool.query(
    `UPDATE staff SET failed_login_attempts = 0, locked_until = NULL WHERE LOWER(email) = LOWER($1)`,
    ['judaropa98@gmail.com']
  );
  console.log('✅ Cuenta reseteada: failed_login_attempts = 0, locked_until = NULL');
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
