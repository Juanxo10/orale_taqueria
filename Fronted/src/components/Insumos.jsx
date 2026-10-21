import { useState, useEffect } from "react";
import { API_URL } from "../config";

const CSS = `
.ins-wrap{display:flex;flex-direction:column;gap:1.5rem;}
.ins-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow-x:auto;}
.ins-card h3{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.8rem;}
.ins-table{width:100%;border-collapse:collapse;}
.ins-table th{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.4rem;border-bottom:1.5px solid var(--border);}
.ins-table td{font-size:.85rem;font-weight:600;padding:.5rem .4rem;border-bottom:1px solid #f0ede8;vertical-align:middle;}
.ins-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;}
.ins-in{border:1.5px solid var(--border);border-radius:8px;padding:.3rem .5rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;width:6rem;}
.ins-in.wide{width:9rem;}
.ins-btn{border:none;border-radius:8px;padding:.32rem .75rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.74rem;font-weight:700;cursor:pointer;background:var(--brand);color:#fff;}
.ins-btn.alt{background:#eee;color:#333;}
.ins-btn.del{background:#fee2e2;color:#991b1b;}
.ins-btn:disabled{opacity:.5;cursor:not-allowed;}
.ins-err{color:#991b1b;font-size:.8rem;font-weight:600;}
`;

const redondear = (n) => Math.round(n * 1000) / 1000;

export default function Insumos({ token, isAdmin, productos }) {
  const [insumos, setInsumos] = useState([]);
  const [recetas, setRecetas] = useState([]); // { producto, insumo_id, cantidad }
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({ nombre: "", unidad: "kg" });
  const [edit, setEdit] = useState(null); // insumo en edición
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [consumo, setConsumo] = useState([]);
  const [dias, setDias] = useState([]); // historial: { fecha, pedidos }
  const [prod, setProd] = useState("");
  const [draft, setDraft] = useState([]); // receta en edición: { insumo_id, cantidad }

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const api = async (path, method = "GET", body) => {
    const res = await fetch(`${API_URL}/api/insumos${path}`, { method, headers, body: body && JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Error"); throw new Error(data.error); }
    setError("");
    return data;
  };

  const cargar = () =>
    Promise.all([api(""), api("/recetas")]).then(([i, r]) => { setInsumos(i); setRecetas(r); }).catch(() => {});

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api("/dias").then(setDias).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api(`/consumo?desde=${desde}&hasta=${hasta}`).then(setConsumo).catch(() => {});
  }, [desde, hasta]); // eslint-disable-line react-hooks/exhaustive-deps

  const periodo = desde === hasta ? desde : `${desde} a ${hasta}`;

  const descargarCsv = () => {
    const csv = ["Insumo,Unidad,Gastado", ...consumo.map((c) => `"${c.nombre}",${c.unidad},${redondear(c.gastado)}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `insumos-${periodo.replace(" a ", "_a_")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Abre el diálogo de impresión: ahí se elige "Guardar como PDF" (mismo método que el ticket de pedidos).
  const descargarPdf = () => {
    const esc = (t) => String(t).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch]);
    const filas = consumo.map((c) => `<tr><td>${esc(c.nombre)}</td><td style="text-align:right">${redondear(c.gastado)} ${esc(c.unidad)}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return setError("El navegador bloqueó la ventana. Permite pop-ups para descargar el PDF.");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Insumos ${esc(periodo)}</title><style>
      body{font-family:Arial,sans-serif;padding:32px;color:#222}h1{font-size:20px;margin:0}p{color:#666;margin:4px 0 20px}
      table{width:100%;border-collapse:collapse}th,td{padding:8px 6px;border-bottom:1px solid #ddd;font-size:14px;text-align:left}
    </style></head><body><h1>Órale Taquería — Insumos gastados</h1><p>${esc(periodo)}</p>
    <table><thead><tr><th>Insumo</th><th style="text-align:right">Gastado</th></tr></thead><tbody>${filas}</tbody></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const seleccionarProducto = (nombre) => {
    setProd(nombre);
    setDraft(recetas.filter((r) => r.producto === nombre).map(({ insumo_id, cantidad }) => ({ insumo_id, cantidad })));
  };

  const accion = (fn) => async () => { try { await fn(); await cargar(); } catch { /* error ya mostrado */ } };

  const unidadDe = (id) => insumos.find((i) => i.id === id)?.unidad || "";
  const setD = (idx, campo, valor) => setDraft(draft.map((x, k) => (k === idx ? { ...x, [campo]: valor } : x)));

  return (
    <div className="ins-wrap">
      <style>{CSS}</style>
      {error && <div className="ins-err">{error}</div>}

      <div className="ins-card">
        <h3>Cierre de caja — insumos gastados</h3>
        <div className="ins-row" style={{ marginBottom: ".8rem" }}>
          <label>Desde <input className="ins-in wide" type="date" value={desde} max={hasta}
            onChange={(e) => e.target.value && setDesde(e.target.value)} /></label>
          <label>Hasta <input className="ins-in wide" type="date" value={hasta} min={desde}
            onChange={(e) => e.target.value && setHasta(e.target.value)} /></label>
          <button className="ins-btn" onClick={descargarPdf} disabled={!consumo.length}>Descargar PDF</button>
          <button className="ins-btn alt" onClick={descargarCsv} disabled={!consumo.length}>Descargar CSV</button>
        </div>
        <table className="ins-table">
          <thead><tr><th>Insumo</th><th>Gastado</th></tr></thead>
          <tbody>
            {consumo.length === 0 && <tr><td colSpan={2}>Sin ventas en este periodo.</td></tr>}
            {consumo.map((c) => <tr key={c.nombre}><td>{c.nombre}</td><td>{redondear(c.gastado)} {c.unidad}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="ins-card">
        <h3>Historial de cierres</h3>
        <table className="ins-table">
          <thead><tr><th>Día</th><th>Pedidos</th><th></th></tr></thead>
          <tbody>
            {dias.length === 0 && <tr><td colSpan={3}>Aún no hay ventas.</td></tr>}
            {dias.map((d) => (
              <tr key={d.fecha}>
                <td>{d.fecha}</td>
                <td>{d.pedidos}</td>
                <td><button className="ins-btn alt" onClick={() => { setDesde(d.fecha); setHasta(d.fecha); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Ver / descargar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ins-card">
        <h3>Insumos</h3>
        <table className="ins-table">
          <thead><tr><th>Insumo</th><th>Unidad</th>{isAdmin && <th>Acciones</th>}</tr></thead>
          <tbody>
            {insumos.length === 0 && <tr><td colSpan={3}>Aún no hay insumos.</td></tr>}
            {insumos.map((i) => edit?.id === i.id ? (
              <tr key={i.id}>
                <td><input className="ins-in wide" value={edit.nombre} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} /></td>
                <td><input className="ins-in" value={edit.unidad} onChange={(e) => setEdit({ ...edit, unidad: e.target.value })} /></td>
                <td>
                  <div className="ins-row">
                    <button className="ins-btn" onClick={accion(async () => { await api(`/${i.id}`, "PUT", edit); setEdit(null); })}>Guardar</button>
                    <button className="ins-btn alt" onClick={() => setEdit(null)}>Cancelar</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>{i.unidad}</td>
                {isAdmin && (
                  <td>
                    <div className="ins-row">
                      <button className="ins-btn alt" onClick={() => setEdit({ ...i })}>Editar</button>
                      <button className="ins-btn del" onClick={() => window.confirm(`¿Eliminar "${i.nombre}"? También se quita de las recetas.`) && accion(() => api(`/${i.id}`, "DELETE"))()}>Eliminar</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {isAdmin && (
          <div className="ins-row" style={{ marginTop: ".8rem" }}>
            <input className="ins-in wide" placeholder="Nuevo insumo" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
            <input className="ins-in" placeholder="Unidad" value={nuevo.unidad} onChange={(e) => setNuevo({ ...nuevo, unidad: e.target.value })} />
            <button className="ins-btn" onClick={accion(async () => { await api("", "POST", nuevo); setNuevo({ nombre: "", unidad: nuevo.unidad }); })}>Agregar</button>
          </div>
        )}
      </div>

      <div className="ins-card">
        <h3>Recetas — qué gasta cada producto por unidad vendida</h3>
        <select className="ins-in wide" style={{ width: "auto", maxWidth: "100%" }} value={prod} onChange={(e) => seleccionarProducto(e.target.value)}>
          <option value="">Elige un producto…</option>
          {productos.map((n) => <option key={n} value={n}>{n}{recetas.some((r) => r.producto === n) ? " ✓" : ""}</option>)}
        </select>
        {prod && (
          <div style={{ marginTop: ".8rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            {draft.map((d, idx) => (
              <div key={idx} className="ins-row">
                <select className="ins-in wide" disabled={!isAdmin} value={d.insumo_id} onChange={(e) => setD(idx, "insumo_id", Number(e.target.value))}>
                  {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
                <input className="ins-in" type="number" min="0" step="any" disabled={!isAdmin} value={d.cantidad} onChange={(e) => setD(idx, "cantidad", e.target.value)} />
                <span>{unidadDe(d.insumo_id)}</span>
                {isAdmin && <button className="ins-btn del" onClick={() => setDraft(draft.filter((_, k) => k !== idx))}>Quitar</button>}
              </div>
            ))}
            {draft.length === 0 && <span style={{ fontSize: ".85rem" }}>Sin receta: este producto no cuenta insumos.</span>}
            {isAdmin && (
              <div className="ins-row">
                <button className="ins-btn alt" disabled={!insumos.length}
                  onClick={() => setDraft([...draft, { insumo_id: (insumos.find((i) => !draft.some((d) => d.insumo_id === i.id)) || insumos[0]).id, cantidad: "" }])}>
                  + Insumo
                </button>
                <button className="ins-btn" onClick={accion(() => api(`/recetas/${encodeURIComponent(prod)}`, "PUT",
                  { items: draft.map((d) => ({ insumo_id: d.insumo_id, cantidad: d.cantidad })) }))}>
                  Guardar receta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
