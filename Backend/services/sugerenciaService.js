const pool = require("../db");

const TIPOS = ["sugerencia", "queja", "reclamo"];

// ── Crear sugerencia / queja / reclamo ────────────────────
async function crearSugerencia({ nombre, mensaje, tipo = "sugerencia" }) {
  if (!TIPOS.includes(tipo)) {
    throw { status: 400, message: "Tipo inválido: usa sugerencia, queja o reclamo" };
  }
  if (!mensaje || mensaje.trim().length < 5) {
    throw { status: 400, message: "El mensaje debe tener al menos 5 caracteres" };
  }
  if (mensaje.length > 1000) {
    throw { status: 400, message: "El mensaje no puede superar 1000 caracteres" };
  }

  const nombreSanitizado = nombre ? nombre.trim().slice(0, 100) : null;
  const mensajeSanitizado = mensaje.trim();

  const { rows } = await pool.query(
    `INSERT INTO sugerencias (nombre, mensaje, tipo)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, tipo, created_at`,
    [nombreSanitizado, mensajeSanitizado, tipo]
  );

  return rows[0];
}

// ── Listar sugerencias (admin) ────────────────────────────
async function listarSugerencias({ soloNoLeidas = false } = {}) {
  const where = soloNoLeidas ? "WHERE leida = false" : "";
  const { rows } = await pool.query(
    `SELECT id, nombre, mensaje, tipo, leida, created_at
     FROM sugerencias
     ${where}
     ORDER BY created_at DESC`
  );
  return rows;
}

// ── Marcar como leída (admin) ─────────────────────────────
async function marcarLeida(id) {
  const { rows } = await pool.query(
    `UPDATE sugerencias SET leida = true WHERE id = $1 RETURNING id`,
    [id]
  );
  if (rows.length === 0) throw { status: 404, message: "Sugerencia no encontrada" };
  return rows[0];
}

module.exports = { crearSugerencia, listarSugerencias, marcarLeida };
