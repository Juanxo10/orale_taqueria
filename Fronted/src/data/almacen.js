// localStorage/sessionStorage lanzan SecurityError si el navegador bloquea cookies y datos del sitio (Brave, modo estricto…).
// Estas funciones nunca lanzan: si el navegador no deja guardar, usan la memoria de la pestaña (dura mientras no se recargue).
const memoria = { local: new Map(), session: new Map() };

const crear = (tipo) => ({
  get(k) {
    try { const v = window[`${tipo}Storage`].getItem(k); if (v !== null) return v; } catch { /* bloqueado */ }
    return memoria[tipo].get(k) ?? null;
  },
  set(k, v) {
    memoria[tipo].set(k, String(v));
    try { window[`${tipo}Storage`].setItem(k, v); } catch { /* bloqueado */ }
  },
  remove(k) {
    memoria[tipo].delete(k);
    try { window[`${tipo}Storage`].removeItem(k); } catch { /* bloqueado */ }
  },
});

export const almacenLocal = crear("local");
export const almacenSesion = crear("session");
