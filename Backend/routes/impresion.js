const { Router } = require("express");
const express = require("express");
const logger = require("../utils/logger");
const { claveValida, siguienteTrabajo, registrarResultado } = require("../services/impresionService");

const router = Router();

// POST /api/impresion/epson?key=...  (Epson Server Direct Print: la impresora llama aquí cada pocos segundos)
router.post("/epson", express.urlencoded({ extended: false, limit: "50kb" }), async (req, res) => {
  if (!claveValida(req.query.key)) return res.sendStatus(401);
  try {
    if (req.body?.ConnectionType === "SetResponse") {
      await registrarResultado(req.body.ResponseFile);
      return res.sendStatus(200);
    }
    const trabajo = await siguienteTrabajo();
    if (!trabajo) return res.sendStatus(200); // sin pedidos: respuesta vacía
    res.type("text/xml; charset=utf-8").send(trabajo);
  } catch (err) {
    logger.error({ err }, "Error en la impresión Epson");
    res.sendStatus(500);
  }
});

module.exports = router;
