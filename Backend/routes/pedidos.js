const { Router } = require("express");
const { authenticate, requireAdmin, requireStaff, requireEstacion } = require("../middlewares/authMiddleware");
const limiters = require("../middlewares/limiters");
const { crearPedido, listarPedidos, cambiarEstado, cambiarEstadoEstacion } = require("../services/pedidoService");
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
router.get("/", authenticate, requireStaff, async (req, res) => {
  try {
    let pedidos = await listarPedidos();
    // Cocina y barra solo reciben los pedidos (y productos) de su estación, sin datos del cliente
    const rol = req.user.rol;
    if (rol === "cocina" || rol === "barra") {
      pedidos = pedidos
        .filter((p) => p.estaciones[rol] && !["camino", "entregado", "cancelado"].includes(p.status))
        .map((p) => ({
          id: p.id, numero_pedido: p.numero_pedido, notas: p.notas, hora: p.hora,
          tipo_entrega: p.tipo_entrega, status: p.status,
          estaciones: { [rol]: p.estaciones[rol] },
        }));
    }
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

// PATCH /api/pedidos/:id/estacion/:estacion — avance de cocina o barra
router.patch("/:id/estacion/:estacion", authenticate, requireStaff, requireEstacion, async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Id inválido" });
    const updated = await cambiarEstadoEstacion(req.params.id, req.params.estacion, req.body.estado);
    res.json(updated);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Error al cambiar estado de estación:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
