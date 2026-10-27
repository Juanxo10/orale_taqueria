const { Router } = require("express");
const { authenticate, requireAdmin, requireStaff } = require("../middlewares/authMiddleware");
const limiters = require("../middlewares/limiters");
const { crearPedido, listarPedidos, cambiarEstado } = require("../services/pedidoService");
const { obtenerEstadisticas } = require("../services/estadisticaService");

const router = Router();

// GET /api/pedidos/estadisticas — estadísticas para el admin
router.get("/estadisticas", authenticate, requireAdmin, async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const stats = await obtenerEstadisticas(desde || null, hasta || null);
    res.json(stats);
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// GET /api/pedidos — listar todos los pedidos (personal autenticado: incluye datos de clientes)
router.get("/", authenticate, requireStaff, async (_req, res) => {
  try {
    const pedidos = await listarPedidos();
    res.json(pedidos);
  } catch (err) {
    console.error("Error al listar pedidos:", err);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

// POST /api/pedidos — crear un pedido nuevo
router.post("/", limiters.crearPedido, async (req, res) => {
  try {
    const result = await crearPedido({ ...req.body, ip: req.ip, user_agent: req.get("user-agent") });
    res.status(201).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Error al crear pedido:", err);
    res.status(500).json({ error: "Error interno al crear el pedido" });
  }
});

// PATCH /api/pedidos/:id/estado — cambiar estado (personal autenticado)
router.patch("/:id/estado", authenticate, requireStaff, async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Id inválido" });
    const { estado } = req.body;
    const updated = await cambiarEstado(req.params.id, estado);
    res.json(updated);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Error al cambiar estado:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
