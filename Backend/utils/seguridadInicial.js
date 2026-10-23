const bcrypt = require("bcrypt");
const pool = require("../db");
const logger = require("./logger");

const PRODUCCION = process.env.NODE_ENV === "production";
const CLAVES_POR_DEFECTO = ["admin123"]; // la que crea scripts/setup.js en desarrollo

// En producción el servidor no arranca si la configuración es insegura (mejor fallar al desplegar que quedar expuesto).
function validarEntorno() {
  if (!PRODUCCION) return;
  const problemas = [];
  if (!process.env.CORS_ORIGIN) problemas.push("CORS_ORIGIN (la URL del sitio, ej. https://tu-dominio.com)");
  for (const k of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
    if ((process.env[k] || "").length < 32) problemas.push(`${k} (mínimo 32 caracteres aleatorios)`);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    problemas.push("JWT_SECRET y JWT_REFRESH_SECRET deben ser distintos");
  }
  if (problemas.length) {
    logger.fatal({ problemas }, "Configuración insegura: corrige estas variables de entorno antes de arrancar");
    process.exit(1);
  }
}

// Ninguna cuenta del personal puede conservar una contraseña conocida. En producción es motivo para no arrancar.
async function revisarClavesPorDefecto() {
  const { rows } = await pool.query("SELECT email, password_hash FROM staff WHERE activo = true");
  const inseguras = [];
  for (const u of rows) {
    for (const clave of CLAVES_POR_DEFECTO) {
      if (await bcrypt.compare(clave, u.password_hash)) inseguras.push(u.email);
    }
  }
  if (!inseguras.length) return;
  const msg = "Hay cuentas del personal con una contraseña por defecto. Cámbiala desde el panel: Usuarios → Editar → nueva contraseña";
  if (PRODUCCION) {
    logger.fatal({ cuentas: inseguras }, msg);
    process.exit(1);
  }
  logger.warn({ cuentas: inseguras }, msg);
}

module.exports = { validarEntorno, revisarClavesPorDefecto };
