const { Router } = require("express");
const { body, validationResult, matchedData } = require("express-validator");
const { authenticate, requireAdmin } = require("../middlewares/authMiddleware");
const {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleActivo,
} = require("../services/staffService");

const router = Router();

// Todas las rutas requieren admin autenticado
router.use(authenticate, requireAdmin);

const userValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre es requerido"),
  body("email").trim().notEmpty().withMessage("El email es requerido").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("rol").isIn(["admin", "empleado"]).withMessage("Rol debe ser admin o empleado"),
];

const createValidation = [
  ...userValidation,
  body("password").notEmpty().withMessage("La contraseña es requerida").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
];

const updateValidation = [
  ...userValidation,
  body("password").optional({ values: "falsy" }).isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
];

function handleErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map((e) => e.msg).join(", ") });
  }
  const sanitized = matchedData(req, { locations: ["body"], includeOptionals: true });
  req.body = { ...req.body, ...sanitized };
  next();
}

// GET /api/staff
router.get("/", async (_req, res) => {
  try {
    const users = await listarUsuarios();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al listar usuarios" });
  }
});

// POST /api/staff
router.post("/", createValidation, handleErrors, async (req, res) => {
  try {
    const user = await crearUsuario(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error("Error al crear usuario:", err);
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// PUT /api/staff/:id
router.put("/:id", updateValidation, handleErrors, async (req, res) => {
  try {
    const user = await actualizarUsuario(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// PATCH /api/staff/:id/toggle
router.patch("/:id/toggle", async (req, res) => {
  try {
    const user = await toggleActivo(req.params.id);
    res.json(user);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

module.exports = router;
