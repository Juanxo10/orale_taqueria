// Preferencia de cookies del visitante: "todas" | "necesarias" | null (aún no decide).
// Lo estrictamente necesario (carrito, sesión) funciona siempre; lo de terceros (mapa de Google) solo con "todas".
import { useEffect, useState } from "react";
import { almacenLocal } from "./almacen";
import { NEGOCIO } from "./legalData";

const KEY = "orale_cookies";
const META = "orale_cookies_meta"; // versión de los textos y fecha en que decidió
const CAMBIO = "orale:consent";
const ABRIR = "orale:cookies-abrir";

// Si la Política cambió desde que decidió, vuelve a preguntar
export const leerConsentimiento = () => {
  const meta = almacenLocal.get(META);
  return meta && meta.includes(NEGOCIO.actualizado) ? almacenLocal.get(KEY) : null;
};

export function guardarConsentimiento(valor) {
  almacenLocal.set(KEY, valor);
  almacenLocal.set(META, `${NEGOCIO.actualizado}|${new Date().toISOString()}`);
  window.dispatchEvent(new Event(CAMBIO));
}

// Reabre el aviso (enlace "Preferencias de cookies" del pie de página)
export const abrirPreferencias = () => window.dispatchEvent(new Event(ABRIR));
export const alAbrirPreferencias = (fn) => { addEventListener(ABRIR, fn); return () => removeEventListener(ABRIR, fn); };

export function useConsentimiento() {
  const [valor, setValor] = useState(leerConsentimiento);
  useEffect(() => {
    const f = () => setValor(leerConsentimiento());
    addEventListener(CAMBIO, f);
    return () => removeEventListener(CAMBIO, f);
  }, []);
  return valor;
}
