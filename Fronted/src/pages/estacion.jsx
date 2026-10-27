import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "../config";
import { apiFetch } from "../data/api";
import { almacenLocal } from "../data/almacen";
import { useMenu } from "../data/menuData";

// Pantalla de cocina y barra: solo los productos de su estación, explícitos (cantidad grande, categoría, qué lleva),
// en tres columnas Por hacer → Preparando → Listos.
const hora = (d) => new Date(d).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
const minutos = (d) => Math.max(0, Math.floor((Date.now() - new Date(d)) / 60000));

const beep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    o.connect(ctx.destination);
    o.frequency.value = 880;
    o.start();
    o.stop(ctx.currentTime + 0.25);
  } catch { /* sin audio: se ignora */ }
};

const COLUMNAS = [
  { clave: "pendiente", titulo: "Por hacer", color: "#e0241d" },
  { clave: "preparando", titulo: "Preparando", color: "#d98a00" },
  { clave: "listo", titulo: "Listos", color: "#2f9e5b" },
];

const CSS = `
.es{min-height:100vh;background:#fff7e3;color:#3a1a10;font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:1rem;}
.es-top{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;background:#e0241d;color:#fff7e3;border-radius:16px;padding:.8rem 1.1rem;}
.es-top h1{font-size:1.7rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase;}
.es-top button{background:#fbba24;color:#3a1a10;border:none;border-radius:10px;padding:.5rem 1.1rem;cursor:pointer;font-weight:800;}
.es-err{background:#ffe0dd;color:#b3140f;border:2px solid #e0241d;padding:.6rem .9rem;border-radius:10px;margin-bottom:1rem;font-weight:700;}
.es-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;align-items:start;}
@media(max-width:900px){.es-cols{grid-template-columns:1fr;}}
.es-col h2{font-size:1rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin:0 0 .7rem;display:flex;justify-content:space-between;border-bottom:4px solid currentColor;padding-bottom:.4rem;}
.es-vacio{opacity:.5;text-align:center;padding:1.5rem 0;font-weight:600;color:#3a1a10;}
.es-card{background:#fff;color:#3a1a10;border-radius:16px;padding:1rem;margin-bottom:1rem;border:3px solid #f6d9a8;box-shadow:0 2px 8px rgba(224,36,29,.08);}
.es-card.pendiente{border-color:#f4a09b;}
.es-card.preparando{border-color:#fbba24;background:#fffbea;}
.es-card.listo{border-color:#8bd3a8;background:#f1fbf4;}
.es-head{display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.4rem;}
.es-num{font-size:1.5rem;font-weight:900;color:#e0241d;}
.es-tipo{font-size:.75rem;font-weight:800;padding:.25rem .7rem;border-radius:999px;background:#fbba24;color:#3a1a10;text-transform:uppercase;}
.es-tipo.dom{background:#e0241d;color:#fff;}
.es-tiempo{font-size:.85rem;font-weight:700;opacity:.7;}
.es-tiempo.tarde{color:#e0241d;opacity:1;font-weight:900;}
.es-item{display:flex;gap:.8rem;align-items:flex-start;padding:.7rem 0;border-top:2px dashed #f0d9b0;}
.es-qty{flex:none;min-width:3.4rem;height:3.4rem;border-radius:12px;background:#fbba24;color:#3a1a10;font-size:2rem;font-weight:900;display:flex;align-items:center;justify-content:center;}
.es-qty.multi{background:#e0241d;color:#fff;}
.es-name{font-size:1.35rem;font-weight:900;line-height:1.15;}
.es-cat{display:inline-block;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;background:#ffe9b0;color:#7a4a00;border-radius:6px;padding:.1rem .45rem;margin-bottom:.25rem;}
.es-desc{font-size:.85rem;line-height:1.35;margin-top:.25rem;opacity:.8;}
.es-total{font-weight:800;font-size:.9rem;margin:.3rem 0 .4rem;}
.es-nota{background:#ffeb99;border-left:6px solid #e0241d;border-radius:8px;padding:.55rem .7rem;margin:.6rem 0;font-weight:700;}
.es-nota b{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:#b3140f;}
.es-btn{width:100%;border:none;border-radius:12px;padding:1rem;font-size:1.1rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;}
.es-ok{font-weight:900;color:#1f7a45;text-align:center;padding:.6rem 0;text-transform:uppercase;}
`;

export default function Estacion({ estacion }) {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState("");
  const [, setTick] = useState(0);
  const conocidos = useRef(null);
  const menu = useMenu();

  // nombre → { cat, desc } para explicar cada producto
  const info = {};
  for (const c of menu || []) for (const it of c.items || []) info[it.name] = { cat: c.cat, desc: it.desc };

  let user = {};
  try { user = JSON.parse(almacenLocal.get("adminUser") || "{}"); } catch { /* sesión corrupta */ }
  // cocina y barra solo entran a su pantalla; admin y empleado a cualquiera
  const puede = user.rol === "admin" || user.rol === "empleado" || user.rol === estacion;

  const cargar = () =>
    apiFetch(`${API_URL}/api/pedidos?_=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        // admin/empleado reciben todo: se filtra aquí a esta estación y a lo que aún no está despachado
        const mios = data.filter((p) => p.estaciones?.[estacion] && !["camino", "entregado", "cancelado"].includes(p.status))
          .reverse(); // más antiguos primero
        const ids = new Set(mios.map((p) => p.id));
        if (conocidos.current && [...ids].some((id) => !conocidos.current.has(id))) beep();
        conocidos.current = ids;
        setPedidos(mios);
        setError("");
      })
      .catch(() => setError("Sin conexión, reintentando…"));

  useEffect(() => {
    if (!puede) return;
    cargar();
    const t = setInterval(cargar, 15000);
    const reloj = setInterval(() => setTick((n) => n + 1), 30000); // refresca "hace X min"
    return () => { clearInterval(t); clearInterval(reloj); };
  }, [estacion]);

  if (!puede) return <Navigate to={`/${user.rol === "barra" ? "barra" : "cocina"}`} replace />;

  const mover = async (id, estado) => {
    const r = await apiFetch(`${API_URL}/api/pedidos/${id}/estacion/${estacion}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    const msg = r.ok ? "" : (await r.json().catch(() => ({}))).error || `No se pudo guardar (${r.status})`;
    await cargar();
    if (msg) setError(msg); // después de cargar(), que limpia el error
  };

  const salir = () => {
    for (const k of ["token", "refreshToken", "adminUser"]) almacenLocal.remove(k);
    location.assign("/login");
  };

  const unidad = estacion === "barra" ? "bebida" : "plato";

  return (
    <main className="es">
      <style>{CSS}</style>
      <header className="es-top">
        <h1>{estacion === "barra" ? "BARRA" : "COCINA"} · {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"}</h1>
        <button onClick={salir}>Salir</button>
      </header>
      {error && <div className="es-err">{error}</div>}
      <div className="es-cols">
        {COLUMNAS.map(({ clave, titulo, color }) => {
          const lista = pedidos.filter((p) => p.estaciones[estacion].estado === clave);
          return (
            <section key={clave} className="es-col" style={{ color }}>
              <h2><span>{titulo}</span><span>{lista.length}</span></h2>
              {!lista.length && <div className="es-vacio">Nada aquí</div>}
              {lista.map((p) => {
                const { estado, items } = p.estaciones[estacion];
                const min = minutos(p.hora);
                const total = Object.values(items).reduce((s, q) => s + q, 0);
                return (
                  <article key={p.id} className={`es-card ${estado}`}>
                    <div className="es-head">
                      <span className="es-num">Pedido #{p.id}</span>
                      <span className={`es-tipo${p.tipo_entrega === "recogida" ? "" : " dom"}`}>{p.tipo_entrega === "recogida" ? "Recoge / aquí" : "Domicilio"}</span>
                    </div>
                    <div className={`es-tiempo${estado !== "listo" && min >= 15 ? " tarde" : ""}`}>
                      Pidió a las {hora(p.hora)} · hace {min} min{estado !== "listo" && min >= 15 ? " · TARDE" : ""}
                    </div>
                    <div className="es-total">Preparar {total} {unidad}{total === 1 ? "" : "s"} en total:</div>
                    {Object.entries(items).map(([nombre, q]) => (
                      <div key={nombre} className="es-item">
                        <div className={`es-qty${q > 1 ? " multi" : ""}`}>{q}</div>
                        <div>
                          {info[nombre]?.cat && <span className="es-cat">{info[nombre].cat}</span>}
                          <div className="es-name">{nombre}</div>
                          {info[nombre]?.desc && <div className="es-desc">{info[nombre].desc}</div>}
                        </div>
                      </div>
                    ))}
                    {p.notas && <div className="es-nota"><b>Nota del cliente</b>{p.notas}</div>}
                    {estado === "pendiente" && <button className="es-btn" onClick={() => mover(p.id, "preparando")} style={{ background: "#fbba24", color: "#3a1a10" }}>Empezar a preparar</button>}
                    {estado === "preparando" && <button className="es-btn" onClick={() => mover(p.id, "listo")} style={{ background: "#e0241d", color: "#fff" }}>Marcar como listo</button>}
                    {estado === "listo" && <div className="es-ok">Listo · esperando despacho</div>}
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
    </main>
  );
}
