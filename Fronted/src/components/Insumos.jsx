import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { apiFetch } from "../data/api";
import { esc } from "../data/html";

const CSS = `
.ins-wrap{display:flex;flex-direction:column;gap:1.25rem;}
.ins-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.06);min-width:0;}
.ins-card h3{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem;}
.ins-card h4{font-size:.75rem;font-weight:800;margin:.2rem 0 .4rem;}
.ins-hint{font-size:.78rem;color:var(--muted);margin-bottom:.8rem;}
.ins-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.25rem;align-items:start;}
.ins-scroll{max-height:68vh;overflow-y:auto;}
.ins-table{width:100%;border-collapse:collapse;}
.ins-table th{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.4rem;border-bottom:1.5px solid var(--border);position:sticky;top:0;background:#fff;}
.ins-table td{font-size:.85rem;font-weight:600;padding:.45rem .4rem;border-bottom:1px solid #f0ede8;vertical-align:middle;}
.ins-table td.num{text-align:right;white-space:nowrap;}
.ins-table tr.falta td:first-child{box-shadow:inset 3px 0 0 #f59e0b;}
.ins-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;}
.ins-in{border:1.5px solid var(--border);border-radius:8px;padding:.3rem .5rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;width:6rem;background:#fff;}
.ins-in.wide{width:12rem;}
.ins-in.grow{flex:1;min-width:8rem;}
.ins-in.full{width:100%;}
.ins-in.bad{border-color:#dc2626;}
.ins-btn{border:none;border-radius:8px;padding:.32rem .75rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.74rem;font-weight:700;cursor:pointer;background:var(--brand);color:#fff;white-space:nowrap;}
.ins-btn.alt{background:#eee;color:#333;}
.ins-btn.del{background:#fee2e2;color:#991b1b;}
.ins-btn:disabled{opacity:.5;cursor:not-allowed;}
.ins-err{color:#991b1b;font-size:.8rem;font-weight:600;}
.ins-two{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.ins-chip{border:1.5px solid var(--border);background:#fff;border-radius:999px;padding:.25rem .7rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:700;cursor:pointer;color:var(--muted);white-space:nowrap;}
.ins-chip.on{background:var(--brand);border-color:var(--brand);color:#fff;}
.ins-chips{display:flex;gap:.4rem;overflow-x:auto;padding-bottom:.2rem;margin-bottom:.8rem;}
.ins-form{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem;margin-bottom:.8rem;}
.ins-form label{display:flex;flex-direction:column;gap:.2rem;font-size:.7rem;font-weight:700;color:var(--muted);}
.ins-form label.span{grid-column:1/-1;}
.ins-cat{font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:#fafaf7;cursor:pointer;user-select:none;}
.ins-ok{color:#15803d;}
.ins-no{color:#b45309;font-size:.72rem;font-weight:700;}
.ins-tag{font-size:.65rem;font-weight:700;color:#7c3aed;background:#f3e8ff;border-radius:6px;padding:.05rem .35rem;margin-left:.3rem;}
.ins-add{background:#fafaf7;border:1px dashed var(--border);border-radius:12px;padding:.6rem;margin-bottom:.8rem;}
.ins-add label{font-size:.68rem;font-weight:700;color:var(--muted);display:flex;flex-direction:column;gap:.15rem;}
.ins-over{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:flex-start;justify-content:center;padding:4vh 1rem;overflow-y:auto;}
.ins-modal{background:#fff;border-radius:16px;padding:1.2rem;width:100%;max-width:640px;box-shadow:0 12px 40px rgba(0,0,0,.3);display:flex;flex-direction:column;gap:.6rem;}
.ins-modal h2{font-size:1rem;font-weight:800;margin:0;}
.ins-drop{border:2px dashed var(--border);border-radius:12px;padding:.8rem;text-align:center;font-size:.78rem;font-weight:600;color:var(--muted);cursor:pointer;background:#fafaf7;}
.ins-drop.over{border-color:var(--brand);background:#fff7ed;}
.ins-drop img{max-height:120px;max-width:100%;border-radius:8px;display:block;margin:0 auto .4rem;}
.ins-conf{max-width:440px;}
.ins-conf p{font-size:.88rem;line-height:1.5;margin:0;color:#333;}
.ins-conf p.warn{color:#991b1b;font-weight:700;}
@media(max-width:1000px){.ins-grid{grid-template-columns:minmax(0,1fr);}.ins-scroll{max-height:none;}}
@media(max-width:700px){.ins-two{grid-template-columns:1fr;}}
`;

// Cada insumo se guarda y se compra en su unidad (kg, L…); al escribir recetas se elige una unidad
// más chica (g, ml). FACTOR convierte a la unidad "grande" de su familia; FAMILIA = unidades que se ofrecen
// (la primera es la chica y es la de por defecto); VISTA = en qué unidades se muestra, de mayor a menor.
const FACTOR = { kg: 1, g: 0.001, lb: 0.45359237, L: 1, ml: 0.001, gal: 3.785411784, unidades: 1 };
const FAMILIA = { kg: ["g", "kg", "lb"], lb: ["g", "kg", "lb"], g: ["g", "kg"], L: ["ml", "L", "gal"], gal: ["ml", "L", "gal"], ml: ["ml", "L"], unidades: ["unidades"] };
const VISTA = { kg: ["kg", "g"], lb: ["lb", "g"], g: ["g"], L: ["L", "ml"], gal: ["gal", "L", "ml"], ml: ["ml"], unidades: ["unidades"] };
const UNIDADES_COMPRA = ["kg", "lb", "L", "gal", "unidades", "g", "ml"];

const redondear = (n) => Math.round(n * 1000) / 1000;
const aBase = (cant, u, base) => Math.round((cant * FACTOR[u] / FACTOR[base]) * 1e6) / 1e6;
// 0.15 kg -> { n: 150, u: "g" }; 1.5 kg -> { n: 1.5, u: "kg" }
const legible = (cant, base) => {
  const vista = VISTA[base] || [base];
  const u = vista.find((x) => (cant * FACTOR[base]) / FACTOR[x] >= 1) || vista.at(-1);
  return { n: redondear((cant * FACTOR[base]) / FACTOR[u]), u };
};
const fmt = (cant, base) => { const { n, u } = legible(cant, base); return `${n} ${u}`; };
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

// Filas { insumo_id, texto, cantidad, unidad }: el ingrediente se busca escribiendo su nombre y la unidad
// ofrece solo opciones compatibles con la unidad de compra del insumo.
function RecetaEditor({ draft, setDraft, opciones, porId }) {
  const setFila = (idx, cambios) => setDraft(draft.map((x, k) => (k === idx ? { ...x, ...cambios } : x)));
  const elegir = (idx, texto) => {
    const ins = opciones.find((o) => norm(o.nombre) === norm(texto));
    if (!ins) return setFila(idx, { texto, insumo_id: null });
    setFila(idx, { texto, insumo_id: ins.id, unidad: ins.id === draft[idx].insumo_id ? draft[idx].unidad : FAMILIA[ins.unidad][0] });
  };
  return (
    <>
      <datalist id="ins-lista">
        {opciones.map((o) => <option key={o.id} value={o.nombre} label={`${o.tipo === "preparado" ? "preparado" : "crudo"} · se compra en ${o.unidad}`} />)}
      </datalist>
      {draft.map((d, idx) => {
        const ins = porId[d.insumo_id];
        return (
          <div key={idx} className="ins-row">
            <input className={`ins-in grow${d.texto && !ins ? " bad" : ""}`} list="ins-lista" placeholder="Escribe para buscar…" value={d.texto}
              onChange={(e) => elegir(idx, e.target.value)} />
            <input className="ins-in" type="number" min="0" step="any" placeholder="Cantidad" value={d.cantidad} onChange={(e) => setFila(idx, { cantidad: e.target.value })} />
            <select className="ins-in" disabled={!ins} value={d.unidad || ""} onChange={(e) => setFila(idx, { unidad: e.target.value })}>
              {ins ? FAMILIA[ins.unidad].map((u) => <option key={u}>{u}</option>) : <option value="">—</option>}
            </select>
            <button className="ins-btn del" onClick={() => setDraft(draft.filter((_, k) => k !== idx))}>Quitar</button>
          </div>
        );
      })}
      {draft.length === 0 && <span style={{ fontSize: ".85rem" }}>Sin ingredientes todavía.</span>}
      <div>
        <button className="ins-btn alt" onClick={() => setDraft([...draft, { insumo_id: null, texto: "", cantidad: "", unidad: "" }])}>+ Ingrediente</button>
      </div>
    </>
  );
}

export default function Insumos({ token, isAdmin, menu, recargarMenu }) {
  const [insumos, setInsumos] = useState([]); // { id, nombre, unidad, tipo }
  const [recetas, setRecetas] = useState([]); // { producto_id, insumo_id, cantidad }
  const [preparaciones, setPreparaciones] = useState([]); // { preparado_id, crudo_id, cantidad }
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({ nombre: "", unidad: "kg", tipo: "crudo" });
  const [edit, setEdit] = useState(null); // insumo en edición
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [consumo, setConsumo] = useState({ crudos: [], preparados: [] });
  const [dias, setDias] = useState([]); // historial: { fecha, pedidos }
  const [filtro, setFiltro] = useState("todos"); // ingredientes: todos | crudo | preparado
  const [busqIns, setBusqIns] = useState("");
  const [busqProd, setBusqProd] = useState("");
  const [cerradas, setCerradas] = useState({}); // categorías colapsadas
  const [draft, setDraft] = useState([]); // receta en edición: { insumo_id, texto, cantidad, unidad }
  const [prod, setProd] = useState(null); // modal de producto: { id?, nombre, categoria, precio, descripcion, foto }
  const [prep, setPrep] = useState(null); // modal de receta de un preparado: insumo
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

  const cargar = () =>
    Promise.all([api("/insumos"), api("/insumos/recetas"), api("/insumos/preparaciones")])
      .then(([i, r, p]) => { setInsumos(i); setRecetas(r); setPreparaciones(p); })
      .catch(() => {});

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api("/insumos/dias").then(setDias).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api(`/insumos/consumo?desde=${desde}&hasta=${hasta}`).then(setConsumo).catch(() => {});
  }, [desde, hasta]); // eslint-disable-line react-hooks/exhaustive-deps

  const porId = Object.fromEntries(insumos.map((i) => [i.id, i]));
  const crudos = insumos.filter((i) => i.tipo === "crudo");
  const preparados = insumos.filter((i) => i.tipo === "preparado");
  const periodo = desde === hasta ? desde : `${desde} a ${hasta}`;
  const hayConsumo = consumo.crudos.length + consumo.preparados.length > 0;
  const SECCIONES = [["Preparados gastados", consumo.preparados], ["Materia prima cruda gastada", consumo.crudos]];

  const descargarCsv = () => {
    const filas = SECCIONES.flatMap(([t, l]) => l.map((c) => { const { n, u } = legible(c.gastado, c.unidad); return `"${t}","${c.nombre}",${n},${u}`; }));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + ["Sección,Insumo,Gastado,Unidad", ...filas].join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = `insumos-${periodo.replace(" a ", "_a_")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Abre el diálogo de impresión: ahí se elige "Guardar como PDF" (mismo método que el ticket de pedidos).
  const descargarPdf = () => {
    const tablas = SECCIONES.filter(([, l]) => l.length).map(([t, l]) =>
      `<h2>${t}</h2><table><thead><tr><th>Insumo</th><th style="text-align:right">Gastado</th></tr></thead><tbody>${
        l.map((c) => `<tr><td>${esc(c.nombre)}</td><td style="text-align:right">${esc(fmt(c.gastado, c.unidad))}</td></tr>`).join("")
      }</tbody></table>`).join("");
    const w = window.open("", "_blank");
    if (!w) return setError("El navegador bloqueó la ventana. Permite pop-ups para descargar el PDF.");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Insumos ${esc(periodo)}</title><style>
      body{font-family:Arial,sans-serif;padding:32px;color:#222}h1{font-size:20px;margin:0}h2{font-size:15px;margin:24px 0 6px}p{color:#666;margin:4px 0 12px}
      table{width:100%;border-collapse:collapse}th,td{padding:8px 6px;border-bottom:1px solid #ddd;font-size:14px;text-align:left}
    </style></head><body><h1>Órale Taquería — Insumos gastados</h1><p>${esc(periodo)}</p>${tablas}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const accion = (fn) => async () => { try { await fn(); await cargar(); } catch { /* error ya mostrado */ } };

  // Receta guardada (en la unidad de compra) -> filas del editor en la unidad más legible
  const filasDe = (lista, idDe) => lista.map((r) => {
    const ins = porId[idDe(r)];
    const v = ins ? legible(r.cantidad, ins.unidad) : { n: r.cantidad, u: "" };
    return { insumo_id: ins?.id ?? null, texto: ins?.nombre ?? "", cantidad: v.n, unidad: v.u };
  });

  // Filas del editor -> [{ insumo_id, cantidad }] en la unidad de compra de cada insumo
  const aItems = (d) => {
    if (d.some((x) => !x.insumo_id)) { setError("Elige cada ingrediente de la lista (escribe y selecciona)."); throw new Error("fila sin ingrediente"); }
    return { items: d.map((x) => ({ insumo_id: x.insumo_id, cantidad: aBase(Number(x.cantidad), x.unidad, porId[x.insumo_id].unidad) })) };
  };

  const abrirPrep = (i) => { setPrep(i); setDraft(filasDe(preparaciones.filter((p) => p.preparado_id === i.id), (p) => p.crudo_id)); };

  const soltarFoto = async (e) => {
    e.preventDefault();
    setArrastrando(false);
    const f = (e.dataTransfer?.files || e.target.files)?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("El archivo debe ser una imagen (JPG, PNG o WebP).");
    try { setProd((p) => ({ ...p, foto: "" })); const foto = await imagenADataUrl(f); setProd((p) => ({ ...p, foto })); setError(""); }
    catch (err) { setError(err.message); }
  };

  const abrirProducto = (p) => {
    setCatNueva(false);
    setError("");
    setProd(p);
    setDraft(p.id ? filasDe(recetas.filter((r) => r.producto_id === p.id), (r) => r.insumo_id) : []);
  };

  const guardarProducto = accion(async () => {
    const items = aItems(draft);
    const { id } = await api(prod.id ? `/productos/${prod.id}` : "/productos", prod.id ? "PUT" : "POST", prod);
    if (!prod.id) setProd((p) => ({ ...p, id })); // si la receta falla, reintentar no duplica el producto
    await api(`/insumos/recetas/${id}`, "PUT", items);
    setProd(null);
    await recargarMenu();
  });

  const guardarInsumo = accion(async () => {
    const orig = porId[edit.id];
    const usado = recetas.some((r) => r.insumo_id === edit.id) || preparaciones.some((p) => p.crudo_id === edit.id);
    if (orig.unidad !== edit.unidad && usado &&
      !window.confirm(`"${orig.nombre}" ya está en recetas. Las cantidades guardadas NO se convierten: ahora se leerán en ${edit.unidad}. ¿Continuar?`)) return;
    await api(`/insumos/${edit.id}`, "PUT", edit);
    setEdit(null);
  });

  const nombreDe = (p) => p.name;
  const sinReceta = (p) => !recetas.some((r) => r.producto_id === p.id);
  const q = norm(busqProd);
  const productosFiltrados = menu
    .map((c) => ({ ...c, items: c.items.filter((p) => !q || norm(nombreDe(p)).includes(q)) }))
    .filter((c) => c.items.length);
  const qi = norm(busqIns);
  const insFiltrados = insumos.filter((i) => (filtro === "todos" || i.tipo === filtro) && (!qi || norm(i.nombre).includes(qi)));
  const fechaCorta = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short" });

  return (
    <div className="ins-wrap">
      <style>{CSS}</style>
      {error && <div className="ins-err">{error}</div>}

      <div className="ins-card">
        <h3>Cierre del día — insumos gastados</h3>
        <p className="ins-hint">Calculado con lo vendido (sin pedidos cancelados ni pagos pendientes) y la receta de cada producto. Los preparados también se desglosan en su materia prima cruda.</p>
        <div className="ins-chips">
          {dias.slice(0, 14).map((d) => (
            <button key={d.fecha} className={`ins-chip${desde === d.fecha && hasta === d.fecha ? " on" : ""}`} onClick={() => { setDesde(d.fecha); setHasta(d.fecha); }}>
              {fechaCorta(d.fecha)} · {d.pedidos}
            </button>
          ))}
          {dias.length === 0 && <span className="ins-hint" style={{ margin: 0 }}>Aún no hay ventas.</span>}
        </div>
        <div className="ins-row" style={{ marginBottom: ".8rem" }}>
          <label>Desde <input className="ins-in wide" type="date" value={desde} max={hasta}
            onChange={(e) => e.target.value && setDesde(e.target.value)} /></label>
          <label>Hasta <input className="ins-in wide" type="date" value={hasta} min={desde}
            onChange={(e) => e.target.value && setHasta(e.target.value)} /></label>
          <button className="ins-btn" onClick={descargarPdf} disabled={!hayConsumo}>Descargar PDF</button>
          <button className="ins-btn alt" onClick={descargarCsv} disabled={!hayConsumo}>Descargar CSV</button>
        </div>
        <div className="ins-two">
          {SECCIONES.map(([titulo, lista]) => (
            <div key={titulo}>
              <h4>{titulo}</h4>
              <table className="ins-table">
                <tbody>
                  {lista.length === 0 && <tr><td colSpan={2}>Sin consumo en este periodo.</td></tr>}
                  {lista.map((c) => <tr key={c.nombre}><td>{c.nombre}</td><td className="num">{fmt(c.gastado, c.unidad)}</td></tr>)}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className="ins-grid">
        <div className="ins-card">
          <h3>Productos del menú</h3>
          <p className="ins-hint">Lo que se vende. Cada producto gasta ingredientes por unidad vendida. Los marcados en naranja aún no tienen receta.</p>
          <div className="ins-row" style={{ marginBottom: ".8rem" }}>
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
                      <tr key={p.name} className={sinReceta(p) ? "falta" : ""}>
                        <td>{p.name}<div className="ins-no" style={{ color: "var(--muted)", fontWeight: 600 }}>${p.price.toLocaleString("es-CO")}</div></td>
                        <td>{sinReceta(p) ? <span className="ins-no">Sin receta</span> : <span className="ins-ok">✓ receta</span>}</td>
                        {isAdmin && (
                          <td className="num">
                            <div className="ins-row" style={{ justifyContent: "flex-end" }}>
                              <button className="ins-btn alt" disabled={!p.id}
                                onClick={() => abrirProducto({ id: p.id, nombre: p.name, categoria: c.cat, precio: p.price, descripcion: p.desc || "", foto: p.foto || "" })}>
                                Receta / editar
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

        <div className="ins-card">
          <h3>Ingredientes</h3>
          <p className="ins-hint"><b>Cruda</b>: lo que compras en el mercado. <b>Preparado</b>: lo que cocinas en casa con crudos (salsas, masa…). La unidad es en la que lo compras; las recetas se escriben en g o ml y se convierten solas.</p>
          {isAdmin && (
            <div className="ins-add">
              <div className="ins-row">
                <label className="grow" style={{ flex: 1, minWidth: "9rem" }}>Nuevo ingrediente
                  <input className="ins-in full" placeholder="Ej. Harina de trigo" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
                </label>
                <label>Tipo
                  <select className="ins-in" value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>
                    <option value="crudo">Cruda</option>
                    <option value="preparado">Preparado</option>
                  </select>
                </label>
                <label>Se compra en
                  <select className="ins-in" value={nuevo.unidad} onChange={(e) => setNuevo({ ...nuevo, unidad: e.target.value })}>
                    {UNIDADES_COMPRA.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </label>
                <button className="ins-btn" style={{ alignSelf: "flex-end" }} onClick={accion(async () => {
                  await api("/insumos", "POST", nuevo);
                  setNuevo({ ...nuevo, nombre: "" });
                })}>Agregar</button>
              </div>
            </div>
          )}
          <div className="ins-row" style={{ marginBottom: ".6rem" }}>
            <input className="ins-in grow" placeholder="Buscar ingrediente…" value={busqIns} onChange={(e) => setBusqIns(e.target.value)} />
            {[["todos", `Todos (${insumos.length})`], ["crudo", `Crudos (${crudos.length})`], ["preparado", `Preparados (${preparados.length})`]].map(([k, l]) => (
              <button key={k} className={`ins-chip${filtro === k ? " on" : ""}`} onClick={() => setFiltro(k)}>{l}</button>
            ))}
          </div>
          <div className="ins-scroll">
            <table className="ins-table">
              <thead><tr><th>Ingrediente</th><th>Se compra en</th>{isAdmin && <th></th>}</tr></thead>
              <tbody>
                {insFiltrados.length === 0 && <tr><td colSpan={3}>Sin resultados.</td></tr>}
                {insFiltrados.map((i) => edit?.id === i.id ? (
                  <tr key={i.id}>
                    <td>
                      <input className="ins-in full" value={edit.nombre} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} />
                      <select className="ins-in" style={{ marginTop: ".3rem", width: "auto" }} value={edit.tipo} onChange={(e) => setEdit({ ...edit, tipo: e.target.value })}>
                        <option value="crudo">Cruda</option>
                        <option value="preparado">Preparado</option>
                      </select>
                    </td>
                    <td>
                      <select className="ins-in" value={edit.unidad} onChange={(e) => setEdit({ ...edit, unidad: e.target.value })}>
                        {UNIDADES_COMPRA.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="ins-row">
                        <button className="ins-btn" onClick={guardarInsumo}>Guardar</button>
                        <button className="ins-btn alt" onClick={() => setEdit(null)}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={i.id} className={i.tipo === "preparado" && !preparaciones.some((p) => p.preparado_id === i.id) ? "falta" : ""}>
                    <td>
                      {i.nombre}
                      {i.tipo === "preparado" && <span className="ins-tag">preparado</span>}
                      {i.tipo === "preparado" && !preparaciones.some((p) => p.preparado_id === i.id) && <span className="ins-no"> · sin receta</span>}
                    </td>
                    <td>{i.unidad}</td>
                    {isAdmin && (
                      <td>
                        <div className="ins-row" style={{ justifyContent: "flex-end" }}>
                          {i.tipo === "preparado" && <button className="ins-btn alt" onClick={() => abrirPrep(i)}>Receta</button>}
                          <button className="ins-btn alt" onClick={() => setEdit({ ...i })}>Editar</button>
                          <button className="ins-btn del" onClick={() => setConf({ nombre: i.nombre, detalle: "También se quitará de todas las recetas donde se use.", onOk: accion(() => api(`/insumos/${i.id}`, "DELETE")) })}>Eliminar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <h4>Ingredientes que gasta 1 unidad vendida</h4>
          <RecetaEditor draft={draft} setDraft={setDraft} porId={porId} opciones={[...preparados, ...crudos]} />
          {error && <div className="ins-err">{error}</div>}
          <div className="ins-row" style={{ marginTop: ".4rem" }}>
            <button className="ins-btn" onClick={guardarProducto}>Guardar producto</button>
            <button className="ins-btn alt" onClick={() => setProd(null)}>Cancelar</button>
          </div>
        </Modal>
      )}

      {prep && (
        <Modal titulo={`Receta de 1 ${prep.unidad === "unidades" ? "unidad" : prep.unidad} de ${prep.nombre}`} onClose={() => setPrep(null)}>
          <p className="ins-hint" style={{ margin: 0 }}>Materia prima cruda que lleva cada {prep.unidad === "unidades" ? "unidad" : prep.unidad} que preparas.</p>
          <RecetaEditor draft={draft} setDraft={setDraft} porId={porId} opciones={crudos} />
          <div className="ins-row" style={{ marginTop: ".4rem" }}>
            <button className="ins-btn" onClick={accion(async () => { await api(`/insumos/preparaciones/${prep.id}`, "PUT", aItems(draft)); setPrep(null); })}>Guardar receta</button>
            <button className="ins-btn alt" onClick={() => setPrep(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
