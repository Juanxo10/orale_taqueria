const pool = require('../db');
async function main() {
  const r = await pool.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'staff' ORDER BY ordinal_position`);
  console.table(r.rows);
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
