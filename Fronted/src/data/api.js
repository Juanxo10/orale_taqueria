// fetch autenticado para el panel del personal. El token de acceso dura 15 min: si el servidor responde 401 se renueva solo
// con el refresh token (una sola renovación a la vez, porque cada refresh token sirve una vez) y se repite la petición.
import { API_URL } from "../config";
import { almacenLocal } from "./almacen";

let renovando = null;

const cerrarSesion = () => {
  for (const k of ["token", "refreshToken", "adminUser"]) almacenLocal.remove(k);
  if (location.pathname !== "/login") location.assign("/login");
};

function renovar() {
  renovando ||= (async () => {
    const refreshToken = almacenLocal.get("refreshToken");
    if (!refreshToken) return false;
    try {
      const r = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!r.ok) return false;
      const d = await r.json();
      almacenLocal.set("token", d.accessToken);
      if (d.refreshToken) almacenLocal.set("refreshToken", d.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => { renovando = null; });
  return renovando;
}

const conToken = (opts) => ({ ...opts, headers: { ...opts.headers, Authorization: `Bearer ${almacenLocal.get("token")}` } });

export async function apiFetch(url, opts = {}) {
  const res = await fetch(url, conToken(opts));
  if (res.status !== 401) return res;
  if (await renovar()) return fetch(url, conToken(opts));
  cerrarSesion();
  return res;
}
