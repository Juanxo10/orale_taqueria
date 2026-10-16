const { Router } = require("express");
const { authenticate, requireStaff } = require("../middlewares/authMiddleware");

const router = Router();

// Estado en memoria — arranca cerrado por defecto
let abierto = false;

// Productos sin stock — conjunto de nombres desactivados
const desactivados = new Set();

// GET /api/tienda/estado — público
router.get("/estado", (_req, res) => {
  res.json({ abierto });
});

// PATCH /api/tienda/estado — admin o empleado
router.patch("/estado", authenticate, requireStaff, (_req, res) => {
  abierto = !abierto;
  res.json({ abierto });
});

// GET /api/tienda/productos — público, devuelve lista de productos desactivados
router.get("/productos", (_req, res) => {
  res.json({ desactivados: [...desactivados] });
});

// PATCH /api/tienda/productos/:nombre — admin o empleado, activa/desactiva un producto
router.patch("/productos/:nombre", authenticate, requireStaff, (req, res) => {
  const nombre = decodeURIComponent(req.params.nombre);
  if (desactivados.has(nombre)) {
    desactivados.delete(nombre);
  } else {
    desactivados.add(nombre);
  }
  res.json({ desactivados: [...desactivados] });
});

module.exports = router;
