const { Router } = require("express");
const { authenticate, requireAdmin } = require("../middlewares/authMiddleware");
const { extractoVentas } = require("../services/facturacionService");

const router = Router();
router.use(authenticate, requireAdmin);

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/facturacion?desde=AAAA-MM-DD&hasta=AAAA-MM-DD&entregados=true|false
router.get("/", async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    if (!FECHA.test(desde || "") || !FECHA.test(hasta || "")) {
      return res.status(400).json({ error: "Indica desde y hasta (AAAA-MM-DD)" });
    }
    if (desde > hasta) return res.status(400).json({ error: "La fecha inicial es posterior a la final" });
    res.json(await extractoVentas(desde, hasta, req.query.entregados !== "false"));
  } catch (err) { next(err); }
});

module.exports = router;
