const pool = require('../db');
async function main() {
  await pool.query(`ALTER TABLE staff DROP CONSTRAINT staff_rol_check`);
  await pool.query(`ALTER TABLE staff ADD CONSTRAINT staff_rol_check CHECK (rol IN ('admin', 'staff', 'empleado'))`);
  // Actualizar los que tengan 'staff' a 'empleado' para consistencia
  await pool.query(`UPDATE staff SET rol = 'empleado' WHERE rol = 'staff'`);
  console.log('✅ Constraint actualizado: admin, staff, empleado permitidos');
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
