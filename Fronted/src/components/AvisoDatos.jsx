import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { almacenLocal } from "../data/almacen";
import { alAbrirPreferencias, guardarConsentimiento, leerConsentimiento } from "../data/preferencias";

const CSS = `
.ck{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:1000;max-width:520px;background:#fff;color:#1c1210;border:1px solid #ecdcc6;border-top:4px solid #fe2b24;border-radius:14px;padding:1rem 1.1rem;box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:'Plus Jakarta Sans',sans-serif;}
.ck strong{display:block;font-size:.95rem;margin-bottom:.3rem;}
.ck p{font-size:.8rem;line-height:1.55;color:#4a3d36;margin:0 0 .8rem;}
.ck a{color:#c81812;font-weight:700;text-decoration:underline;}
.ck-row{display:flex;gap:.5rem;flex-wrap:wrap;}
.ck button{flex:1;min-width:9rem;border-radius:10px;padding:.6rem .9rem;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;border:1.5px solid #fe2b24;}
.ck .si{background:#fe2b24;color:#fff;}
.ck .no{background:#fff;color:#c81812;}
@media(min-width:600px){.ck{left:1.25rem;right:auto;bottom:1.25rem;}}
`;

// Se muestra la primera vez (y cuando se pulsa "Preferencias de cookies").
export default function AvisoDatos() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(() => leerConsentimiento() === null);
  useEffect(() => alAbrirPreferencias(() => setVisible(true)), []);

  // El personal (admin/empleados) no ve este aviso: ni en el login ni en su panel, ni al navegar el sitio con su sesión iniciada.
  const esPersonal = pathname.startsWith("/admin") || pathname.startsWith("/login") || !!almacenLocal.get("token");
  if (!visible || esPersonal) return null;
  const elegir = (v) => { guardarConsentimiento(v); setVisible(false); };

  return (
    <div className="ck" role="dialog" aria-live="polite" aria-label="Preferencias de cookies">
      <style>{CSS}</style>
      <strong>Tu privacidad en Órale</strong>
      <p>
        No usamos cookies de publicidad. Guardamos en tu navegador lo necesario para que funcione tu carrito. Si aceptas todas,
        también cargamos el mapa de Google en la página de Ubicación, que puede usar cookies de Google.{" "}
        <a href="/privacidad#cookies" target="_blank" rel="noopener noreferrer">Más información</a>
      </p>
      <div className="ck-row">
        <button className="no" onClick={() => elegir("necesarias")}>Solo necesarias</button>
        <button className="si" onClick={() => elegir("todas")}>Aceptar todas</button>
      </div>
    </div>
  );
}
