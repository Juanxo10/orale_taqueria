// Caché en memoria de pocos segundos para rutas públicas: muchas visitas simultáneas comparten una sola consulta a la base.
// Guarda la promesa, así que las peticiones que llegan mientras se consulta también esperan la misma (no se duplican).
const guardados = new Map();

function conCache(clave, ttlMs, fn) {
  const hit = guardados.get(clave);
  if (hit && Date.now() < hit.vence) return hit.promesa;
  const promesa = fn();
  guardados.set(clave, { promesa, vence: Date.now() + ttlMs });
  promesa.catch(() => guardados.delete(clave)); // un error no se queda en caché
  return promesa;
}

// Llamar tras escribir (cambiar estado de la tienda, productos…) para que el cambio se vea al instante
const limpiarCache = (prefijo = "") => {
  for (const k of guardados.keys()) if (k.startsWith(prefijo)) guardados.delete(k);
};

module.exports = { conCache, limpiarCache };
