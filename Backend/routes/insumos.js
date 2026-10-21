const { Router } = require("express");
const { authenticate, requireAdmin } = require("../middlewares/authMiddleware");
const s = require("../services/insumoService");

const router = Router();
router.use(authenticate, requireAdmin);

const num = (v) => (v === undefined || v === null || v === "" ? NaN : Number(v));
const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); }
  catch (err) { err.status ? res.status(err.status).json({ error: err.message }) : next(err); }
};
const bad = (message) => { throw { status: 400, message }; };

function datosInsumo(b) {
  const nombre = String(b.nombre || "").trim();
  const unidad = String(b.unidad || "").trim();
  if (!nombre || !unidad) bad("Nombre y unidad son requeridos");
  return { nombre, unidad };
}

router.get("/", wrap(() => s.listar()));

router.get("/consumo", wrap((req) => {
  const desde = req.query.desde || null;
  const hasta = req.query.hasta || null;
  for (const f of [desde, hasta]) if (f && !/^\d{4}-\d{2}-\d{2}$/.test(f)) bad("Fecha inválida (AAAA-MM-DD)");
  return s.consumo(desde, hasta);
}));

router.get("/dias", wrap(() => s.diasConVentas()));

router.get("/recetas", wrap(() => s.listarRecetas()));

router.post("/", wrap((req) => s.crear(datosInsumo(req.body))));

router.put("/recetas/:producto", wrap(async (req) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.some((i) => !Number.isInteger(i.insumo_id) || !(num(i.cantidad) > 0))) {
    bad("Cada insumo necesita una cantidad mayor que 0");
  }
  if (new Set(items.map((i) => i.insumo_id)).size !== items.length) bad("Insumo repetido en la receta");
  await s.guardarReceta(decodeURIComponent(req.params.producto), items.map((i) => ({ insumo_id: i.insumo_id, cantidad: num(i.cantidad) })));
  return { ok: true };
}));

router.put("/:id", wrap((req) => s.actualizar(req.params.id, datosInsumo(req.body))));

router.delete("/:id", wrap(async (req) => { await s.eliminar(req.params.id); return { ok: true }; }));

module.exports = router;
