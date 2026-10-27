const { Router } = require("express");
const { crearSugerencia, listarSugerencias, marcarLeida, eliminarSugerencia } = require("../services/sugerenciaService");
const { authenticate, requireAdmin } = require("../middlewares/authMiddleware");
const limiters = require("../middlewares/limiters");

const router = Router();

// POST /api/sugerencias — enviar sugerencia (público)
router.post("/", limiters.sugerencia, async (req, res) => {
  try {
    const { nombre, mensaje, tipo, acepta_datos } = req.body;
    const result = await crearSugerencia({ nombre, mensaje, tipo, acepta_datos, ip: req.ip, user_agent: req.get("user-agent") });
    res.status(201).json({ ok: true, id: result.id });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Error al guardar la sugerencia" });
  }
});

// GET /api/sugerencias — listar todas (solo admin)
router.get("/", authenticate, async (req, res) => {
  try {
    const soloNoLeidas = req.query.noLeidas === "true";
    const sugerencias = await listarSugerencias({ soloNoLeidas });
    res.json(sugerencias);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener sugerencias" });
  }
});

// PATCH /api/sugerencias/:id/leida — marcar como leída (solo admin)
router.patch("/:id/leida", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
    const result = await marcarLeida(id);
    res.json({ ok: true, id: result.id });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Error al actualizar sugerencia" });
  }
});

// DELETE /api/sugerencias/:id — eliminar un mensaje ya leído (solo admin)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
    await eliminarSugerencia(id);
    res.json({ ok: true, id });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Error al eliminar sugerencia" });
  }
});

module.exports = router;
