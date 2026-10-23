const rateLimit = require("express-rate-limit");

// Límites por IP (Railway deja pasar la IP real con `trust proxy`). Los mensajes se devuelven en español porque los muestra la página.
const limitar = (windowMs, max, error) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error } });

const MIN15 = 15 * 60 * 1000;

module.exports = {
  // Margen amplio: varios equipos del restaurante consultan los pedidos cada 15 s desde la misma red
  global: limitar(MIN15, 1500, "Demasiadas solicitudes. Intenta de nuevo en unos minutos."),
  crearPedido: limitar(MIN15, 20, "Has enviado demasiados pedidos seguidos. Intenta de nuevo en unos minutos."),
  sugerencia: limitar(60 * 60 * 1000, 5, "Has enviado varios mensajes seguidos. Intenta de nuevo más tarde."),
  refresh: limitar(MIN15, 60, "Demasiados intentos. Vuelve a iniciar sesión."),
};
