const bcrypt = require("bcrypt");
const pool = require("../db");
const logger = require("../utils/logger");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeAllUserTokens,
} = require("../utils/token");

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MIN = 15;

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario activo
    const { rows } = await pool.query(
      `SELECT id, nombre, email, password_hash, rol, failed_login_attempts, locked_until
       FROM staff
       WHERE LOWER(email) = LOWER($1) AND activo = true`,
      [email]
    );

    if (!rows.length) {
      logger.warn({ email, ip: req.ip }, "Login fallido — usuario no encontrado");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = rows[0];

    // 2. Verificar si la cuenta está bloqueada
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      logger.warn({ userId: user.id, ip: req.ip }, "Login bloqueado — cuenta temporalmente bloqueada");
      return res.status(423).json({
        error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minuto(s).`,
      });
    }

    // 3. Validar contraseña
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      const attempts = (user.failed_login_attempts || 0) + 1;

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        // Bloquear cuenta
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MIN * 60 * 1000);
        await pool.query(
          `UPDATE staff SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
          [attempts, lockedUntil, user.id]
        );
        logger.warn({ userId: user.id, ip: req.ip, attempts }, "Cuenta bloqueada tras múltiples intentos fallidos");
        return res.status(423).json({
          error: `Cuenta bloqueada temporalmente tras ${MAX_FAILED_ATTEMPTS} intentos fallidos. Intenta en ${LOCKOUT_DURATION_MIN} minutos.`,
        });
      }

      await pool.query(
        `UPDATE staff SET failed_login_attempts = $1 WHERE id = $2`,
        [attempts, user.id]
      );

      logger.warn({ userId: user.id, ip: req.ip, attempts }, "Login fallido — contraseña incorrecta");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // 4. Verificar rol admin o empleado
    if (user.rol !== "admin" && user.rol !== "empleado") {
      logger.warn({ userId: user.id, ip: req.ip }, "Login fallido — usuario sin permisos de staff");
      return res.status(403).json({ error: "No tienes permisos para acceder" });
    }

    // 5. Resetear intentos fallidos
    await pool.query(
      `UPDATE staff SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [user.id]
    );

    // 6. Generar tokens
    const tokenPayload = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(user.id);

    logger.info({ userId: user.id, ip: req.ip }, "Login exitoso");

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (err) {
    logger.error({ err, ip: req.ip }, "Error interno en login");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * POST /api/auth/refresh
 */
async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token es requerido" });
  }

  try {
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      logger.warn({ ip: req.ip }, "Refresh token inválido o expirado");
      return res.status(401).json({ error: "Refresh token inválido o expirado" });
    }

    // Buscar datos actualizados del usuario
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol FROM staff WHERE id = $1 AND activo = true`,
      [userId]
    );

    if (!rows.length) {
      logger.warn({ userId, ip: req.ip }, "Refresh — usuario no encontrado o inactivo");
      return res.status(401).json({ error: "Usuario no válido" });
    }

    const user = rows[0];
    const tokenPayload = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(user.id);

    logger.info({ userId: user.id, ip: req.ip }, "Token refrescado exitosamente");

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logger.error({ err, ip: req.ip }, "Error interno en refresh");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * GET /api/auth/verify
 */
async function verify(req, res) {
  // req.user viene del middleware authenticate
  res.json({
    user: {
      id: req.user.id,
      nombre: req.user.nombre,
      email: req.user.email,
      rol: req.user.rol,
    },
  });
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    await revokeAllUserTokens(req.user.id);
    logger.info({ userId: req.user.id, ip: req.ip }, "Logout — todos los tokens revocados");
    res.json({ message: "Sesión cerrada correctamente" });
  } catch (err) {
    logger.error({ err, userId: req.user.id }, "Error en logout");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { login, refresh, verify, logout };
