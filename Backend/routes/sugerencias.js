const { Router } = require("express");
const { crearSugerencia, listarSugerencias, marcarLeida } = require("../services/sugerenciaService");
const { authenticate } = require("../middlewares/authMiddleware");

const router = Router();

// POST /api/sugerencias — enviar sugerencia (público)
router.post("/", async (req, res) => {
  try {
    const { nombre, mensaje } = req.body;
    const result = await crearSugerencia({ nombre, mensaje });
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

module.exports = router;
