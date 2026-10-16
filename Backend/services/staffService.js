const bcrypt = require("bcrypt");
const pool = require("../db");

async function listarUsuarios() {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, activo, created_at
     FROM staff ORDER BY created_at DESC`
  );
  return rows;
}

async function crearUsuario({ nombre, email, password, rol }) {
  // Verificar email duplicado
  const { rows: existing } = await pool.query(
    `SELECT id FROM staff WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  if (existing.length) {
    throw { status: 409, message: "Ya existe un usuario con ese email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO staff (nombre, email, password_hash, rol, activo)
     VALUES ($1, $2, $3, $4, true)
     RETURNING id, nombre, email, rol, activo, created_at`,
    [nombre, email, passwordHash, rol]
  );
  return rows[0];
}

async function actualizarUsuario(id, { nombre, email, password, rol }) {
  // Verificar que existe
  const { rows: current } = await pool.query(`SELECT id FROM staff WHERE id = $1`, [id]);
  if (!current.length) throw { status: 404, message: "Usuario no encontrado" };

  // Verificar email duplicado (excluyendo al actual)
  const { rows: dup } = await pool.query(
    `SELECT id FROM staff WHERE LOWER(email) = LOWER($1) AND id != $2`,
    [email, id]
  );
  if (dup.length) throw { status: 409, message: "Ese email ya está en uso por otro usuario" };

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `UPDATE staff SET nombre = $1, email = $2, password_hash = $3, rol = $4 WHERE id = $5
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre, email, passwordHash, rol, id]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      `UPDATE staff SET nombre = $1, email = $2, rol = $3 WHERE id = $4
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre, email, rol, id]
    );
    return rows[0];
  }
}

async function toggleActivo(id) {
  const { rows } = await pool.query(
    `UPDATE staff SET activo = NOT activo WHERE id = $1
     RETURNING id, nombre, email, rol, activo, created_at`,
    [id]
  );
  if (!rows.length) throw { status: 404, message: "Usuario no encontrado" };
  return rows[0];
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, toggleActivo };
