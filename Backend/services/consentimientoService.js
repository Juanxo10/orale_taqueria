// Misma fecha que NEGOCIO.actualizado del front: súbela cuando cambien la Política o los Términos.
const VERSION_TEXTOS = "2026-10-27";

// `db` es el pool o el cliente de la transacción en curso
async function registrar(db, { tipos, pedidoId = null, sugerenciaId = null, ip, userAgent }) {
  for (const tipo of tipos) {
    await db.query(
      `INSERT INTO consentimientos (tipo, version, pedido_id, sugerencia_id, ip, user_agent) VALUES ($1,$2,$3,$4,$5,$6)`,
      [tipo, VERSION_TEXTOS, pedidoId, sugerenciaId, ip || null, (userAgent || "").slice(0, 300) || null]
    );
  }
}

module.exports = { registrar };
