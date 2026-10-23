import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { apiFetch } from "../data/api";
import { esc } from "../data/html";

const CSS = `
.fac-wrap{display:flex;flex-direction:column;gap:1.5rem;}
.fac-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow-x:auto;}
.fac-card h3{font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.8rem;}
.fac-row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;}
.fac-row label{font-size:.8rem;font-weight:600;color:var(--muted);}
.fac-in{border:1.5px solid var(--border);border-radius:8px;padding:.3rem .5rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;}
.fac-btn{border:none;border-radius:8px;padding:.35rem .8rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;background:var(--brand);color:#fff;}
.fac-btn.alt{background:#eee;color:#333;}
.fac-btn:disabled{opacity:.5;cursor:not-allowed;}
.fac-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.8rem;}
.fac-kpi{background:var(--g100);border-radius:12px;padding:.8rem;text-align:center;}
.fac-kpi b{display:block;font-size:1.05rem;color:var(--g800);}
.fac-kpi span{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);}
.fac-table{width:100%;border-collapse:collapse;}
.fac-table th{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.4rem;border-bottom:1.5px solid var(--border);white-space:nowrap;}
.fac-table td{font-size:.82rem;font-weight:600;padding:.45rem .4rem;border-bottom:1px solid #f0ede8;white-space:nowrap;}
.fac-table .n{text-align:right;}
.fac-table tfoot td{font-weight:800;border-top:1.5px solid var(--border);border-bottom:none;}
.fac-note{font-size:.75rem;color:var(--muted);line-height:1.5;}
.fac-err{color:#991b1b;font-size:.8rem;font-weight:600;}
`;

const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");
const sum = (rows, k) => rows.reduce((t, r) => t + r[k], 0);
const agrupar = (rows, key) => {
  const g = {};
  for (const r of rows) {
    const x = (g[r[key]] ||= { clave: r[key], pedidos: 0, subtotal: 0, domicilio: 0, total: 0 });
    x.pedidos++; x.subtotal += r.subtotal; x.domicilio += r.domicilio; x.total += r.total;
  }
  return Object.values(g).sort((a, b) => (a.clave < b.clave ? -1 : 1));
};

const hoyBogota = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
const mesAnterior = (hoy) => {
  const [y, m] = hoy.split("-").map(Number);
  const ini = new Date(Date.UTC(y, m - 2, 1)), fin = new Date(Date.UTC(y, m - 1, 0));
  return [ini.toISOString().slice(0, 10), fin.toISOString().slice(0, 10)];
};

export default function Facturacion({ token }) {
  const hoy = hoyBogota();
  const [desde, setDesde] = useState(hoy.slice(0, 8) + "01");
  const [hasta, setHasta] = useState(hoy);
  const [soloEntregados, setSoloEntregados] = useState(true);
  const [impuesto, setImpuesto] = useState(() => { try { return localStorage.getItem("fac_impuesto") || "0"; } catch { return "0"; } });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`${API_URL}/api/facturacion?desde=${desde}&hasta=${hasta}&entregados=${soloEntregados}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Error");
        setRows(d); setError("");
      })
      .catch((e) => { setRows([]); setError(e.message); });
  }, [desde, hasta, soloEntregados, token]);

  const cambiarImpuesto = (v) => {
    setImpuesto(v);
    try { localStorage.setItem("fac_impuesto", v); } catch { /* sin storage */ }
  };

  const tasa = Math.max(Number(impuesto) || 0, 0);
  const total = sum(rows, "total");
  const base = total / (1 + tasa / 100); // los precios del menú ya incluyen el impuesto
  const porMetodo = agrupar(rows, "metodo_pago");
  const porDia = agrupar(rows, "fecha");
  const periodo = desde === hasta ? desde : `${desde} a ${hasta}`;
  const filtro = soloEntregados ? "Solo pedidos entregados" : "Todos los pedidos válidos (incluye en curso)";

  const resumenHtml = `
    <tr><td>Pedidos</td><td class="n">${rows.length}</td></tr>
    <tr><td>Ventas de productos</td><td class="n">${fmt(sum(rows, "subtotal"))}</td></tr>
    <tr><td>Domicilios</td><td class="n">${fmt(sum(rows, "domicilio"))}</td></tr>
    <tr><td><b>Total facturado</b></td><td class="n"><b>${fmt(total)}</b></td></tr>
    ${tasa > 0 ? `<tr><td>Base gravable (${tasa}% incluido)</td><td class="n">${fmt(base)}</td></tr><tr><td>Impuesto (${tasa}%)</td><td class="n">${fmt(total - base)}</td></tr>` : ""}`;
  const filasHtml = (lista) => lista.map((g) => `<tr><td>${esc(g.clave)}</td><td class="n">${g.pedidos}</td><td class="n">${fmt(g.subtotal)}</td><td class="n">${fmt(g.domicilio)}</td><td class="n">${fmt(g.total)}</td></tr>`).join("");
  const cabHtml = (t) => `<tr><th>${t}</th><th class="n">Pedidos</th><th class="n">Productos</th><th class="n">Domicilio</th><th class="n">Total</th></tr>`;

  // Abre el diálogo de impresión: ahí se elige "Guardar como PDF".
  const descargarPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return setError("El navegador bloqueó la ventana. Permite pop-ups para descargar el PDF.");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Extracto de ventas ${esc(periodo)}</title><style>
      body{font-family:Arial,sans-serif;padding:28px;color:#222;font-size:12px}h1{font-size:20px;margin:0}h2{font-size:13px;margin:22px 0 6px;text-transform:uppercase;letter-spacing:.08em}
      p{color:#666;margin:3px 0}table{width:100%;border-collapse:collapse}th,td{padding:5px 6px;border-bottom:1px solid #ddd;text-align:left}.n{text-align:right}
      @media print{@page{margin:12mm}}
    </style></head><body>
      <h1>Órale Taquería — Extracto de ventas</h1>
      <p>Periodo: ${esc(periodo)} (hora de Colombia)</p><p>${esc(filtro)}</p>
      <h2>Resumen</h2><table>${resumenHtml}</table>
      <h2>Por método de pago</h2><table>${cabHtml("Método")}${filasHtml(porMetodo)}</table>
      <h2>Por día</h2><table>${cabHtml("Día")}${filasHtml(porDia)}</table>
      <h2>Detalle de pedidos</h2>
      <table><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Teléfono</th><th>Pago</th><th>Entrega</th><th class="n">Productos</th><th class="n">Domicilio</th><th class="n">Total</th></tr>
      ${rows.map((r) => `<tr><td>#${r.id}</td><td>${r.fecha} ${r.hora}</td><td>${esc(r.cliente)}</td><td>${esc(r.telefono)}</td><td>${esc(r.metodo_pago)}</td><td>${esc(r.tipo_entrega)}</td><td class="n">${fmt(r.subtotal)}</td><td class="n">${fmt(r.domicilio)}</td><td class="n">${fmt(r.total)}</td></tr>`).join("")}</table>
      <p style="margin-top:18px">Extracto informativo de ventas; no reemplaza la factura electrónica.</p>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const descargarCsv = () => {
    const cab = ["Pedido", "Fecha", "Hora", "Cliente", "Telefono", "Metodo de pago", "Entrega", "Estado", "Productos", "Domicilio", "Total"];
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cab.join(","), ...rows.map((r) => [r.id, r.fecha, r.hora, q(r.cliente), q(r.telefono), q(r.metodo_pago), r.tipo_entrega, r.estado, r.subtotal, r.domicilio, r.total].join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `ventas-${desde}_a_${hasta}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabla = (lista, titulo) => (
    <table className="fac-table">
      <thead><tr><th>{titulo}</th><th className="n">Pedidos</th><th className="n">Productos</th><th className="n">Domicilio</th><th className="n">Total</th></tr></thead>
      <tbody>
        {lista.map((g) => <tr key={g.clave}><td>{g.clave}</td><td className="n">{g.pedidos}</td><td className="n">{fmt(g.subtotal)}</td><td className="n">{fmt(g.domicilio)}</td><td className="n">{fmt(g.total)}</td></tr>)}
      </tbody>
    </table>
  );

  return (
    <div className="fac-wrap">
      <style>{CSS}</style>
      {error && <div className="fac-err">{error}</div>}

      <div className="fac-card">
        <h3>Periodo</h3>
        <div className="fac-row">
          <label>Desde <input className="fac-in" type="date" value={desde} max={hasta} onChange={(e) => e.target.value && setDesde(e.target.value)} /></label>
          <label>Hasta <input className="fac-in" type="date" value={hasta} min={desde} onChange={(e) => e.target.value && setHasta(e.target.value)} /></label>
          <button className="fac-btn alt" onClick={() => { setDesde(hoy); setHasta(hoy); }}>Hoy</button>
          <button className="fac-btn alt" onClick={() => { setDesde(hoy.slice(0, 8) + "01"); setHasta(hoy); }}>Este mes</button>
          <button className="fac-btn alt" onClick={() => { const [d, h] = mesAnterior(hoy); setDesde(d); setHasta(h); }}>Mes anterior</button>
        </div>
        <div className="fac-row" style={{ marginTop: ".7rem" }}>
          <label>Incluir
            <select className="fac-in" style={{ marginLeft: 6 }} value={soloEntregados ? "e" : "t"} onChange={(e) => setSoloEntregados(e.target.value === "e")}>
              <option value="e">Solo entregados</option>
              <option value="t">Todos los válidos (con los que van en curso)</option>
            </select>
          </label>
          <label>Impuesto incluido en el precio (%)
            <input className="fac-in" style={{ width: "4.5rem", marginLeft: 6 }} type="number" min="0" step="any" value={impuesto} onChange={(e) => cambiarImpuesto(e.target.value)} />
          </label>
        </div>
        <p className="fac-note" style={{ marginTop: ".6rem" }}>
          Nunca incluye pedidos cancelados ni pagos pendientes. Si pones un % de impuesto (ej. impuesto al consumo), se separa base e impuesto asumiendo que el precio ya lo incluye. Confírmalo con tu contador.
        </p>
      </div>

      <div className="fac-card">
        <h3>Resumen</h3>
        <div className="fac-kpis">
          <div className="fac-kpi"><b>{rows.length}</b><span>Pedidos</span></div>
          <div className="fac-kpi"><b>{fmt(sum(rows, "subtotal"))}</b><span>Productos</span></div>
          <div className="fac-kpi"><b>{fmt(sum(rows, "domicilio"))}</b><span>Domicilios</span></div>
          <div className="fac-kpi"><b>{fmt(total)}</b><span>Total facturado</span></div>
          {tasa > 0 && <div className="fac-kpi"><b>{fmt(base)}</b><span>Base gravable</span></div>}
          {tasa > 0 && <div className="fac-kpi"><b>{fmt(total - base)}</b><span>Impuesto {tasa}%</span></div>}
        </div>
        <div className="fac-row" style={{ marginTop: "1rem" }}>
          <button className="fac-btn" onClick={descargarPdf} disabled={!rows.length}>Descargar PDF</button>
          <button className="fac-btn alt" onClick={descargarCsv} disabled={!rows.length}>Descargar CSV</button>
        </div>
      </div>

      <div className="fac-card"><h3>Por método de pago</h3>{rows.length ? tabla(porMetodo, "Método") : <p className="fac-note">Sin ventas en este periodo.</p>}</div>
      <div className="fac-card"><h3>Por día</h3>{rows.length ? tabla(porDia, "Día") : <p className="fac-note">Sin ventas en este periodo.</p>}</div>

      <div className="fac-card">
        <h3>Detalle de pedidos</h3>
        {rows.length === 0 ? <p className="fac-note">Sin ventas en este periodo.</p> : (
          <table className="fac-table">
            <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Teléfono</th><th>Pago</th><th>Entrega</th><th className="n">Productos</th><th className="n">Domicilio</th><th className="n">Total</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td><td>{r.fecha} {r.hora}</td><td>{r.cliente}</td><td>{r.telefono}</td><td>{r.metodo_pago}</td><td>{r.tipo_entrega}</td>
                  <td className="n">{fmt(r.subtotal)}</td><td className="n">{fmt(r.domicilio)}</td><td className="n">{fmt(r.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan={6}>Totales</td><td className="n">{fmt(sum(rows, "subtotal"))}</td><td className="n">{fmt(sum(rows, "domicilio"))}</td><td className="n">{fmt(total)}</td></tr></tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
