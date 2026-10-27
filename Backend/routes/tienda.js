const { Router } = require("express");
const { authenticate, requireStaff } = require("../middlewares/authMiddleware");
const pool = require("../db");
const logger = require("../utils/logger");
const { conCache, limpiarCache } = require("../utils/cacheCorto");

const router = Router();

// Estado persistido en `configuracion` (tienda_abierta 1/0): un reinicio o deploy ya no cierra la tienda.
// Si nunca se ha cambiado, arranca cerrada.
const estadoTienda = async () => {
  const { rows } = await pool.query("SELECT valor FROM configuracion WHERE clave = 'tienda_abierta'");
  return rows.length > 0 && Number(rows[0].valor) === 1;
};

// GET /api/tienda/estado — público
router.get("/estado", async (_req, res, next) => {
  try {
    res.json({ abierto: await conCache("tienda:estado", 5_000, estadoTienda) });
  } catch (err) { next(err); }
});

// PATCH /api/tienda/estado — admin o empleado (alterna abierto/cerrado)
router.patch("/estado", authenticate, requireStaff, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO configuracion (clave, valor) VALUES ('tienda_abierta', 1)
       ON CONFLICT (clave) DO UPDATE SET valor = 1 - configuracion.valor
       RETURNING valor`
    );
    limpiarCache("tienda:");
    res.json({ abierto: Number(rows[0].valor) === 1 });
  } catch (err) { next(err); }
});

const listarDesactivados = async () => {
  const { rows } = await pool.query("SELECT DISTINCT nombre FROM productos WHERE activo = false AND NOT archivado");
  return rows.map((r) => r.nombre);
};

// GET /api/tienda/productos — público, devuelve lista de productos desactivados (sin stock)
router.get("/productos", async (_req, res, next) => {
  try {
    res.json({ desactivados: await conCache("tienda:productos", 5_000, listarDesactivados) });
  } catch (err) { next(err); }
});

// PATCH /api/tienda/productos/:nombre — admin o empleado, activa/desactiva un producto
// Persiste productos.activo y deja quién/cuándo lo cambió (activo_por, activo_en) + log
router.patch("/productos/:nombre", authenticate, requireStaff, async (req, res, next) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const { rows } = await pool.query(
      `UPDATE productos SET activo = NOT activo, activo_por = $2, activo_en = NOW()
       WHERE nombre = $1 AND NOT archivado RETURNING activo`,
      [nombre, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    logger.info({ producto: nombre, activo: rows[0].activo, userId: req.user.id, email: req.user.email }, "Producto activado/desactivado");
    limpiarCache("tienda:");
    res.json({ desactivados: await listarDesactivados() });
  } catch (err) { next(err); }
});

module.exports = router;
