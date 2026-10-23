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

const UNIDADES = ["kg", "g", "lb", "L", "ml", "gal", "unidades"];

function datosInsumo(b) {
  const nombre = String(b.nombre || "").trim();
  if (!nombre) bad("El nombre es requerido");
  if (!UNIDADES.includes(b.unidad)) bad("Unidad inválida");
  if (!["crudo", "preparado"].includes(b.tipo)) bad("Tipo inválido");
  return { nombre, unidad: b.unidad, tipo: b.tipo };
}

// Lista de { insumo_id, cantidad } sin repetidos y con cantidad > 0.
function itemsReceta(items) {
  if (!Array.isArray(items) || items.some((i) => !Number.isInteger(i.insumo_id) || !(num(i.cantidad) > 0))) {
    bad("Cada insumo necesita una cantidad mayor que 0");
  }
  if (new Set(items.map((i) => i.insumo_id)).size !== items.length) bad("Insumo repetido en la receta");
  return items.map((i) => ({ insumo_id: i.insumo_id, cantidad: num(i.cantidad) }));
}

const idParam = (v) => (/^\d+$/.test(v) ? Number(v) : bad("Id inválido"));

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

router.put("/recetas/:productoId", wrap(async (req) => {
  await s.guardarReceta(idParam(req.params.productoId), itemsReceta(req.body.items));
  return { ok: true };
}));

router.get("/preparaciones", wrap(() => s.listarPreparaciones()));

router.put("/preparaciones/:id", wrap(async (req) => {
  const id = idParam(req.params.id);
  const items = itemsReceta(req.body.items);
  if (items.some((i) => i.insumo_id === id)) bad("Un preparado no puede llevarse a sí mismo");
  await s.guardarPreparacion(id, items);
  return { ok: true };
}));

router.put("/:id", wrap((req) => s.actualizar(idParam(req.params.id), datosInsumo(req.body))));

router.delete("/:id", wrap(async (req) => { await s.eliminar(idParam(req.params.id)); return { ok: true }; }));

module.exports = router;
