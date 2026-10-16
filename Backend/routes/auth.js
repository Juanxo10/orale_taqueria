const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { body, validationResult, matchedData } = require("express-validator");
const { authenticate, requireStaff } = require("../middlewares/authMiddleware");
const { login, refresh, verify, logout } = require("../controllers/authController");

const router = Router();

// ─── Rate Limiter para /login ────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de login. Intenta de nuevo en 15 minutos." },
});

// ─── Validaciones ────────────────────────────────────────────────────────────
const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("El email es requerido")
    .isEmail().withMessage("Formato de email inválido")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];

const refreshValidation = [
  body("refreshToken")
    .trim()
    .notEmpty().withMessage("El refresh token es requerido")
    .isHexadecimal().withMessage("Refresh token con formato inválido"),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
  }
  // express-validator v7: los sanitizadores (trim, normalizeEmail) no modifican
  // req.body directamente — se debe usar matchedData para obtener valores sanitizados
  const sanitized = matchedData(req, { locations: ['body'] });
  Object.assign(req.body, sanitized);
  next();
}

// ─── Rutas ───────────────────────────────────────────────────────────────────

// POST /api/auth/login
router.post("/login", loginLimiter, loginValidation, handleValidationErrors, login);

// POST /api/auth/refresh
router.post("/refresh", refreshValidation, handleValidationErrors, refresh);

// GET /api/auth/verify  (requiere access token válido + rol staff)
router.get("/verify", authenticate, requireStaff, verify);

// POST /api/auth/logout (requiere access token válido)
router.post("/logout", authenticate, logout);

module.exports = router;
