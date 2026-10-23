const { Router } = require("express");
const { authenticate, requireAdmin } = require("../middlewares/authMiddleware");
const s = require("../services/productoService");

const router = Router();

const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); }
  catch (err) { err.status ? res.status(err.status).json({ error: err.message }) : next(err); }
};
const bad = (message) => { throw { status: 400, message }; };
const idParam = (v) => (/^\d+$/.test(v) ? Number(v) : bad("Id inválido"));
const texto = (v, max) => String(v ?? "").trim().slice(0, max);

function datosProducto(b) {
  const nombre = texto(b.nombre, 100);
  const categoria = texto(b.categoria, 60);
  const precio = Number(b.precio);
  if (!nombre || !categoria) bad("Nombre y categoría son requeridos");
  if (!Number.isInteger(precio) || precio <= 0) bad("El precio debe ser un entero mayor que 0");
  // shortcut: la foto arrastrada se guarda como data URL (ya reducida en el navegador) en la BD, sin storage externo; migrar a un bucket si el menú crece
  const foto = texto(b.foto, 400000) || null;
  if (foto && !/^https?:\/\/\S{1,500}$/i.test(foto) && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(foto)) bad("La foto debe ser un enlace http(s) o una imagen");
  return { nombre, categoria, precio, descripcion: texto(b.descripcion, 1000) || null, foto };
}

// GET /api/productos/menu — público
router.get("/menu", wrap(() => s.menu()));

router.post("/", authenticate, requireAdmin, wrap((req) => s.crear(datosProducto(req.body))));
router.put("/:id", authenticate, requireAdmin, wrap((req) => s.actualizar(idParam(req.params.id), datosProducto(req.body))));
router.delete("/:id", authenticate, requireAdmin, wrap(async (req) => { await s.archivar(idParam(req.params.id)); return { ok: true }; }));

module.exports = router;
