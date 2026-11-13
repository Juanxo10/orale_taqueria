import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { apiFetch } from "../data/api";

const CSS = `
.ins-wrap{display:flex;flex-direction:column;gap:1.25rem;}
.ins-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.06);min-width:0;}
.ins-card h3{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem;}
.ins-kpi{font-size:2rem;font-weight:800;line-height:1;}
.ins-hint{font-size:.78rem;color:var(--muted);margin-bottom:.8rem;}
.ins-scroll{max-height:68vh;overflow-y:auto;}
.ins-table{width:100%;border-collapse:collapse;}
.ins-table td{font-size:.85rem;font-weight:600;padding:.45rem .4rem;border-bottom:1px solid #f0ede8;vertical-align:middle;}
.ins-table td.num{text-align:right;white-space:nowrap;}
.ins-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;}
.ins-in{border:1.5px solid var(--border);border-radius:8px;padding:.3rem .5rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;width:6rem;background:#fff;}
.ins-in.grow{flex:1;min-width:8rem;}
.ins-in.full{width:100%;}
.ins-btn{border:none;border-radius:8px;padding:.32rem .75rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.74rem;font-weight:700;cursor:pointer;background:var(--brand);color:#fff;white-space:nowrap;}
.ins-btn.alt{background:#eee;color:#333;}
.ins-btn.del{background:#fee2e2;color:#991b1b;}
.ins-btn:disabled{opacity:.5;cursor:not-allowed;}
.ins-err{color:#991b1b;font-size:.8rem;font-weight:600;}
.ins-form{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem;margin-bottom:.8rem;}
.ins-form label{display:flex;flex-direction:column;gap:.2rem;font-size:.7rem;font-weight:700;color:var(--muted);}
.ins-form .span{grid-column:1/-1;}
.ins-cat{font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:#fafaf7;cursor:pointer;user-select:none;}
.ins-over{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:flex-start;justify-content:center;padding:4vh 1rem;overflow-y:auto;}
.ins-modal{background:#fff;border-radius:16px;padding:1.2rem;width:100%;max-width:640px;box-shadow:0 12px 40px rgba(0,0,0,.3);display:flex;flex-direction:column;gap:.6rem;}
.ins-modal h2{font-size:1rem;font-weight:800;margin:0;}
.ins-drop{border:2px dashed var(--border);border-radius:12px;padding:.8rem;text-align:center;font-size:.78rem;font-weight:600;color:var(--muted);cursor:pointer;background:#fafaf7;}
.ins-drop.over{border-color:var(--brand);background:#fff7ed;}
.ins-drop img{max-height:120px;max-width:100%;border-radius:8px;display:block;margin:0 auto .4rem;}
.ins-conf{max-width:440px;}
.ins-conf p{font-size:.88rem;line-height:1.5;margin:0;color:#333;}
.ins-conf p.warn{color:#991b1b;font-weight:700;}
@media(max-width:1000px){.ins-scroll{max-height:none;}}
`;

const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const VACIO = { nombre: "", categoria: "", precio: "", descripcion: "", foto: "" };

// Reduce la imagen a 800px máx. y la devuelve como data URL JPEG (cabe en el límite de 1 MB del backend)
const imagenADataUrl = (file) => new Promise((ok, fail) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, 800 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    ok(c.toDataURL("image/jpeg", 0.8));
  };
  img.onerror = () => { URL.revokeObjectURL(url); fail(new Error("No se pudo leer la imagen")); };
  img.src = url;
});

function Modal({ titulo, onClose, children, className = "" }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="ins-over" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ins-modal ${className}`} role="dialog" aria-label={titulo}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

export default function Productos({ token, isAdmin, menu, recargarMenu }) {
  const [error, setError] = useState("");
  const [vendidos, setVendidos] = useState({}); // nombre -> unidades vendidas (histórico, sin cancelados ni pagos pendientes)
  const [busqProd, setBusqProd] = useState("");
  const [cerradas, setCerradas] = useState({}); // categorías colapsadas
  const [prod, setProd] = useState(null); // modal de producto: { id?, nombre, categoria, precio, descripcion, foto }
  const [conf, setConf] = useState(null); // confirmación de borrado: { nombre, detalle, onOk }
  const [arrastrando, setArrastrando] = useState(false);
  const [catNueva, setCatNueva] = useState(false); // categoría escrita a mano en vez de elegida

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const api = async (path, method = "GET", body) => {
    const res = await apiFetch(`${API_URL}/api${path}`, { method, headers, body: body && JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Error"); throw new Error(data.error); }
    setError("");
    return data;
  };

  const cargarVendidos = () =>
    api("/pedidos/estadisticas")
      .then((s) => setVendidos(Object.fromEntries(s.productos.map((x) => [x.nombre, x.cantidad]))))
      .catch(() => {});

  useEffect(() => { cargarVendidos(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = Object.values(vendidos).reduce((t, n) => t + n, 0);

  const accion = (fn) => async () => { try { await fn(); await cargarVendidos(); } catch { /* error ya mostrado */ } };

  const soltarFoto = async (e) => {
    e.preventDefault();
    setArrastrando(false);
    const f = (e.dataTransfer?.files || e.target.files)?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("El archivo debe ser una imagen (JPG, PNG o WebP).");
    try { setProd((p) => ({ ...p, foto: "" })); const foto = await imagenADataUrl(f); setProd((p) => ({ ...p, foto })); setError(""); }
    catch (err) { setError(err.message); }
  };

  const abrirProducto = (p) => { setCatNueva(false); setError(""); setProd(p); };

  const guardarProducto = accion(async () => {
    await api(prod.id ? `/productos/${prod.id}` : "/productos", prod.id ? "PUT" : "POST", prod);
    setProd(null);
    await recargarMenu();
  });

  const q = norm(busqProd);
  const productosFiltrados = menu
    .map((c) => ({ ...c, items: c.items.filter((p) => !q || norm(p.name).includes(q)) }))
    .filter((c) => c.items.length);

  return (
    <div className="ins-wrap">
      <style>{CSS}</style>
      {error && <div className="ins-err">{error}</div>}

      <div className="ins-card">
        <h3>Productos vendidos</h3>
        <div className="ins-kpi">{total.toLocaleString("es-CO")}</div>
        <p className="ins-hint" style={{ marginTop: ".4rem" }}>Unidades vendidas en total (sin pedidos cancelados ni pagos pendientes).</p>
      </div>

      <div className="ins-card">
        <h3>Productos del menú</h3>
        <div className="ins-row" style={{ margin: ".5rem 0 .8rem" }}>
          <input className="ins-in grow" placeholder="Buscar producto…" value={busqProd} onChange={(e) => setBusqProd(e.target.value)} />
          {isAdmin && <button className="ins-btn" onClick={() => abrirProducto(VACIO)}>+ Nuevo producto</button>}
        </div>
        <div className="ins-scroll">
          <table className="ins-table">
            <tbody>
              {productosFiltrados.length === 0 && <tr><td>Sin resultados.</td></tr>}
              {productosFiltrados.map((c) => {
                const cerrada = cerradas[c.cat] && !q;
                return [
                  <tr key={c.cat}>
                    <td colSpan={3} className="ins-cat" onClick={() => setCerradas({ ...cerradas, [c.cat]: !cerradas[c.cat] })}>
                      {cerrada ? "▸" : "▾"} {c.cat} ({c.items.length})
                    </td>
                  </tr>,
                  ...(cerrada ? [] : c.items.map((p) => (
                    <tr key={p.name}>
                      <td>{p.name}<div style={{ color: "var(--muted)", fontWeight: 600, fontSize: ".72rem" }}>${p.price.toLocaleString("es-CO")}</div></td>
                      <td className="num">{vendidos[p.name] || 0} vendidos</td>
                      {isAdmin && (
                        <td className="num">
                          <div className="ins-row" style={{ justifyContent: "flex-end" }}>
                            <button className="ins-btn alt" disabled={!p.id}
                              onClick={() => abrirProducto({ id: p.id, nombre: p.name, categoria: c.cat, precio: p.price, descripcion: p.desc || "", foto: p.foto || "" })}>
                              Editar
                            </button>
                            <button className="ins-btn del" disabled={!p.id}
                              onClick={() => setConf({ nombre: p.name, detalle: "Dejará de aparecer en el menú. Los pedidos anteriores se conservan.", onOk: accion(async () => { await api(`/productos/${p.id}`, "DELETE"); await recargarMenu(); }) })}>
                              Quitar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      {conf && (
        <Modal titulo="Confirmar eliminación" className="ins-conf" onClose={() => setConf(null)}>
          <p>¿Está seguro de que desea eliminar <b>«{conf.nombre}»</b>?</p>
          <p>{conf.detalle}</p>
          <p className="warn">Esta acción no se puede deshacer.</p>
          <div className="ins-row" style={{ justifyContent: "flex-end", marginTop: ".4rem" }}>
            <button className="ins-btn alt" onClick={() => setConf(null)}>Cancelar</button>
            <button className="ins-btn" style={{ background: "#b91c1c" }} onClick={() => { const f = conf.onOk; setConf(null); f(); }}>Sí, eliminar</button>
          </div>
        </Modal>
      )}

      {prod && (
        <Modal titulo={prod.id ? `Editar ${prod.nombre}` : "Nuevo producto"} onClose={() => setProd(null)}>
          <div className="ins-form">
            <label>Nombre<input className="ins-in full" value={prod.nombre} onChange={(e) => setProd({ ...prod, nombre: e.target.value })} /></label>
            <label>Categoría
              {catNueva ? (
                <div className="ins-row" style={{ flexWrap: "nowrap" }}>
                  <input className="ins-in grow" autoFocus placeholder="Nombre de la nueva categoría" value={prod.categoria}
                    onChange={(e) => setProd({ ...prod, categoria: e.target.value })} />
                  <button type="button" className="ins-btn alt" onClick={() => { setCatNueva(false); setProd({ ...prod, categoria: "" }); }}>Cancelar</button>
                </div>
              ) : (
                <select className="ins-in full" value={prod.categoria}
                  onChange={(e) => e.target.value === "__nueva" ? (setCatNueva(true), setProd({ ...prod, categoria: "" })) : setProd({ ...prod, categoria: e.target.value })}>
                  <option value="" disabled>Elige una categoría…</option>
                  {menu.map((c) => <option key={c.cat} value={c.cat}>{c.cat}</option>)}
                  <option value="__nueva">+ Nueva categoría…</option>
                </select>
              )}
            </label>
            <label>Precio (COP)<input className="ins-in full" type="number" min="0" step="500" value={prod.precio} onChange={(e) => setProd({ ...prod, precio: e.target.value })} /></label>
            <div className="span" style={{ display: "flex", flexDirection: "column", gap: ".2rem", fontSize: ".7rem", fontWeight: 700, color: "var(--muted)" }}>Foto (opcional)
              <div className={`ins-drop${arrastrando ? " over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)}
                onDrop={soltarFoto} onClick={(e) => e.currentTarget.querySelector("input").click()}>
                {prod.foto && <img src={prod.foto} alt="Vista previa" />}
                {prod.foto ? "Arrastra otra imagen o haz clic para cambiarla" : "Arrastra una imagen desde tu computador o haz clic para elegirla"}
                <input type="file" accept="image/*" hidden onChange={soltarFoto} onClick={(e) => e.stopPropagation()} />
              </div>
              {prod.foto && <button type="button" className="ins-btn del" style={{ alignSelf: "flex-start" }} onClick={() => setProd({ ...prod, foto: "" })}>Quitar foto</button>}
            </div>
            <label className="span">Descripción
              <textarea className="ins-in full" rows={3} value={prod.descripcion} onChange={(e) => setProd({ ...prod, descripcion: e.target.value })} />
            </label>
          </div>
          {error && <div className="ins-err">{error}</div>}
          <div className="ins-row" style={{ marginTop: ".4rem" }}>
            <button className="ins-btn" onClick={guardarProducto}>Guardar producto</button>
            <button className="ins-btn alt" onClick={() => setProd(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
