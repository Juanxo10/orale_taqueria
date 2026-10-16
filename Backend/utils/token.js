const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../db");
const logger = require("./logger");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  logger.fatal("JWT_SECRET y JWT_REFRESH_SECRET deben estar definidos en las variables de entorno");
  process.exit(1);
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Genera un access token JWT de corta duración.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Genera un refresh token opaco, lo hashea y lo almacena en la base de datos.
 * Retorna el token en texto plano (para enviar al cliente).
 */
async function generateRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return token;
}

/**
 * Valida un refresh token: busca su hash en la DB, verifica expiración y lo revoca (rotación).
 * Devuelve el user_id si es válido, o null.
 */
async function verifyRefreshToken(token) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const { rows } = await pool.query(
    `DELETE FROM refresh_tokens
     WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()
     RETURNING user_id`,
    [tokenHash]
  );

  if (!rows.length) return null;
  return rows[0].user_id;
}

/**
 * Revoca todos los refresh tokens de un usuario (para logout global).
 */
async function revokeAllUserTokens(userId) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`,
    [userId]
  );
}

/**
 * Verifica un access token JWT. Retorna el payload decodificado o lanza error.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeAllUserTokens,
  verifyAccessToken,
};
