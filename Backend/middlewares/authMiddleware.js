const { verifyAccessToken } = require("../utils/token");
const logger = require("../utils/logger");

/**
 * Middleware que verifica el access token JWT en el header Authorization.
 * Adjunta el payload decodificado a req.user.
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = verifyAccessToken(auth.split(" ")[1]);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn({ ip: req.ip }, "Token inválido o expirado");
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * Middleware que verifica que el usuario autenticado tenga rol admin.
 * Debe usarse DESPUÉS de authenticate.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    logger.warn({ userId: req.user?.id, ip: req.ip }, "Intento de acceso sin permisos de admin");
    return res.status(403).json({ error: "No tienes permisos de administrador" });
  }
  next();
}

/**
 * Middleware que verifica que el usuario sea staff (admin o empleado).
 * Debe usarse DESPUÉS de authenticate.
 */
function requireStaff(req, res, next) {
  if (!req.user || (req.user.rol !== "admin" && req.user.rol !== "empleado")) {
    logger.warn({ userId: req.user?.id, ip: req.ip }, "Intento de acceso sin permisos de staff");
    return res.status(403).json({ error: "No tienes permisos para acceder" });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireStaff };
