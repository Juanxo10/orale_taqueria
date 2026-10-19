const { Router } = require("express");
const { authenticate, requireStaff } = require("../middlewares/authMiddleware");
const pool = require("../db");
const logger = require("../utils/logger");

const router = Router();

// Estado en memoria — arranca cerrado por defecto
let abierto = false;

// GET /api/tienda/estado — público
router.get("/estado", (_req, res) => {
  res.json({ abierto });
});

// PATCH /api/tienda/estado — admin o empleado
router.patch("/estado", authenticate, requireStaff, (_req, res) => {
  abierto = !abierto;
  res.json({ abierto });
});

const listarDesactivados = async () => {
  const { rows } = await pool.query("SELECT DISTINCT nombre FROM productos WHERE activo = false");
  return rows.map((r) => r.nombre);
};

// GET /api/tienda/productos — público, devuelve lista de productos desactivados (sin stock)
router.get("/productos", async (_req, res, next) => {
  try {
    res.json({ desactivados: await listarDesactivados() });
  } catch (err) { next(err); }
});

// PATCH /api/tienda/productos/:nombre — admin o empleado, activa/desactiva un producto
// Persiste productos.activo y deja quién/cuándo lo cambió (activo_por, activo_en) + log
router.patch("/productos/:nombre", authenticate, requireStaff, async (req, res, next) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const { rows } = await pool.query(
      `UPDATE productos SET activo = NOT activo, activo_por = $2, activo_en = NOW()
       WHERE nombre = $1 RETURNING activo`,
      [nombre, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    logger.info({ producto: nombre, activo: rows[0].activo, userId: req.user.id, email: req.user.email }, "Producto activado/desactivado");
    res.json({ desactivados: await listarDesactivados() });
  } catch (err) { next(err); }
});

module.exports = router;
