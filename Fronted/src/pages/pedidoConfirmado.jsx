import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { groupExtras, useMenu } from "../data/menuData";
import logo from "../assets/Logo_tacos.jpg";

import { almacenSesion } from "../data/almacen";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bowlby+One&display=swap');
:root{--g900:#1c1210;--g800:#fe2b24;--g700:#c81812;--g600:#e0241d;--g400:#fbba24;--g200:#f6d9b5;--g100:#fff1de;--gold:#fbba24;--cream:#f8f0e4;--border:#ecdcc6;--text:#1c1210;--muted:#7a6a60;--white:#fff;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:radial-gradient(circle at top,#f9f5ea 0,#f8f0e4 42%,#fff1de 100%);color:var(--text);min-height:100vh;}
.topnav{background:var(--g800);display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.5rem;position:sticky;top:0;z-index:50;}
.brand-name{font-size:1.35rem;font-weight:800;color:#fff;letter-spacing:-.5px;}
.brand-sub{font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--g400);margin-top:.1rem;}
.back-link{display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:8px;padding:.4rem .9rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:background .15s;}
.back-link:hover{background:rgba(255,255,255,.18);}
.wrap{max-width:860px;margin:0 auto;padding:2rem 1.2rem 5rem;}
.hero{background:linear-gradient(135deg,var(--white),#fff8ee);border:1px solid var(--border);border-radius:24px;padding:1.8rem;box-shadow:0 20px 50px rgba(26,46,27,.08);margin-bottom:1.4rem;overflow:hidden;position:relative;}
.hero::after{content:"";position:absolute;inset:auto -40px -55px auto;width:180px;height:180px;background:radial-gradient(circle,var(--g200),transparent 70%);opacity:.9;pointer-events:none;}
.eyebrow{font-size:.68rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--g600);margin-bottom:.75rem;}
.hero h1{font-size:clamp(1.7rem,4vw,2.5rem);line-height:1.05;font-weight:800;max-width:10ch;margin-bottom:.55rem;}
.hero p{font-size:.92rem;color:var(--muted);max-width:52ch;line-height:1.6;}
.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;margin-top:1.5rem;align-items:end;}
.confirm-chip{display:inline-flex;align-items:center;gap:.55rem;background:var(--g100);color:var(--g800);border:1px solid var(--g200);border-radius:999px;padding:.45rem .85rem;font-size:.82rem;font-weight:700;}
.amount-card{background:var(--g800);color:#fff;border-radius:18px;padding:1.2rem 1.25rem;position:relative;z-index:1;}
.amount-card span{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.16em;color:var(--g400);margin-bottom:.45rem;}
.amount-card strong{display:block;font-size:2rem;font-weight:800;letter-spacing:-.03em;}
.amount-card small{display:block;margin-top:.45rem;color:#f1dcc0;font-size:.78rem;line-height:1.5;}
.layout{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;}
.card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:1.2rem 1.25rem;box-shadow:0 10px 26px rgba(26,46,27,.05);}
.section-title{font-size:.78rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem;display:block;}
.line-list{display:flex;flex-direction:column;gap:.85rem;}
.line-item{padding:.9rem 1rem;border:1px solid #efe8df;border-radius:14px;background:#fffdf9;}
.line-item strong{display:block;font-size:.96rem;margin-bottom:.2rem;color:var(--g800);}
.line-item p{font-size:.8rem;color:var(--muted);line-height:1.55;}
.line-meta{margin-top:.45rem;font-size:.76rem;font-weight:700;color:var(--g600);}
.summary-list{display:flex;flex-direction:column;gap:.8rem;}
.summary-row{display:flex;justify-content:space-between;gap:1rem;font-size:.85rem;color:var(--muted);}
.summary-row strong{color:var(--text);font-size:.95rem;}
.summary-row.total{padding-top:.85rem;border-top:1px solid var(--border);color:var(--text);font-weight:800;}
.pill{display:inline-flex;align-items:center;gap:.35rem;background:#f8f4ea;border:1px solid #ebdcc0;border-radius:999px;padding:.25rem .6rem;font-size:.72rem;font-weight:700;color:#8a5d08;}
.customer-block{display:flex;flex-direction:column;gap:.55rem;font-size:.84rem;color:var(--text);}
.customer-block div span{display:block;font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;margin-bottom:.15rem;}
.actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.2rem;}
.btn-primary,.btn-secondary{border:none;border-radius:12px;padding:.9rem 1.2rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .15s;}
.btn-primary{background:var(--g800);color:#fff;}
.btn-primary:hover{background:var(--g700);}
.btn-secondary{background:#fff;border:1px solid var(--border);color:var(--g800);}
.btn-secondary:hover{background:var(--g100);}
@media(max-width:760px){.hero-grid,.layout{grid-template-columns:1fr;}.wrap{padding:1.2rem .9rem 4rem;}.hero{padding:1.35rem;}}

/* Recibo: solo se ve al imprimir / guardar como PDF (A4, una columna, sin cortar filas entre páginas) */
.recibo{display:none;}
@media print{
  @page{size:A4;margin:14mm;}
  body{background:#fff !important;min-height:0;}
  .topnav,.wrap{display:none !important;}
  .recibo,.recibo *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .recibo{display:block;color:#1c1210;font-size:12px;line-height:1.5;}
  .recibo .banda{background:#fe2b24;color:#fff;border-radius:10px 10px 0 0;padding:12px 16px;display:flex;align-items:center;gap:14px;}
  .recibo .banda img{width:76px;height:76px;margin:-6px 0;border-radius:12px;object-fit:cover;flex-shrink:0;}
  .recibo .marca{flex:1;}
  .recibo .marca strong{display:block;font-family:'Bowlby One',Impact,sans-serif;font-weight:400;font-size:22px;line-height:1.1;}
  .recibo .marca span{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#ffe3a1;}
  .recibo .folio{text-align:right;background:#fbba24;color:#1c1210;border-radius:8px;padding:6px 12px;}
  .recibo .folio span{display:block;font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;}
  .recibo .folio strong{font-size:15px;}
  .recibo .guirnalda{height:14px;margin-bottom:18px;background:conic-gradient(from 150deg at 12px 0,#fbba24 60deg,transparent 0),conic-gradient(from 150deg at 36px 0,#fff5e6 60deg,transparent 0),conic-gradient(from 150deg at 60px 0,#fe2b24 60deg,transparent 0);background-size:72px 14px;background-repeat:repeat-x;}
  .recibo h2{font-family:'Bowlby One',Impact,sans-serif;font-weight:400;font-size:20px;color:#fe2b24;margin:0 0 2px;}
  .recibo .sub{color:#7a6a60;margin-bottom:14px;}
  .recibo dl{display:grid;grid-template-columns:96px 1fr;gap:4px 12px;margin-bottom:18px;padding:10px 12px;border:1px solid #ecdcc6;border-left:4px solid #fbba24;border-radius:6px;background:#fffaf2;}
  .recibo dt{color:#7a6a60;}
  .recibo dd{font-weight:700;}
  .recibo table{width:100%;border-collapse:collapse;}
  .recibo th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#fe2b24;border-bottom:2px solid #fe2b24;padding:6px 4px;}
  .recibo td{padding:8px 4px;border-bottom:1px dashed #d9c3a5;vertical-align:top;}
  .recibo tr{break-inside:avoid;}
  .recibo .n{text-align:right;white-space:nowrap;}
  .recibo td.n{color:#000;font-weight:600;font-variant-numeric:tabular-nums;}
  .recibo .det{display:block;font-size:11px;color:#7a6a60;}
  .recibo .total{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:10px 14px;border-radius:8px;background:#fff1de;border:1.5px solid #fe2b24;font-size:16px;font-weight:800;break-inside:avoid;}
  .recibo .total strong{font-weight:800;font-size:20px;color:#000;font-variant-numeric:tabular-nums;letter-spacing:-.01em;}
  .recibo footer{margin-top:26px;padding-top:12px;border-top:1px dashed #d9c3a5;text-align:center;break-inside:avoid;}
  .recibo footer strong{display:block;font-family:'Bowlby One',Impact,sans-serif;font-weight:400;font-size:15px;color:#fe2b24;margin-bottom:2px;}
  .recibo footer span{font-size:11px;color:#7a6a60;}
}
`;

const formatCurrency = (value) => "$" + Number(value || 0).toLocaleString("es-CO");

export default function PedidoConfirmado() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(() => location.state?.order ?? null);
  const menu = useMenu(); // también re-renderiza al cargar el menú de la BD (groupExtras lo usa)
  const precios = Object.fromEntries(menu.flatMap((c) => c.items).map((i) => [i.name, i.price]));
  // Estado real del pago Wompi: "aprobado" | "pendiente" | "rechazado" | "error" | null (no aplica, ej. contraentrega)
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    let ord = location.state?.order ?? null;
    if (!ord) {
      try {
        const raw = almacenSesion.get("orale_ultimo_pedido");
        if (raw) ord = JSON.parse(raw);
      } catch (_) {
        // noop
      }
    }

    if (!ord) {
      navigate("/menu", { replace: true });
      return;
    }
    setOrder(ord);

    // Pagos contraentrega no requieren verificación: se confirman al crear el pedido
    if (ord.metodo_pago !== "Transferencia Wompi") {
      setPaymentStatus("aprobado");
      return;
    }

    // Wompi: hay que confirmar con la API real si el pago fue aprobado o rechazado
    // antes de mostrar "pedido confirmado" — Wompi redirige aquí sin importar el resultado.
    const params = new URLSearchParams(window.location.search);
    const txId = params.get("id");
    if (!txId) {
      setPaymentStatus("pendiente");
      return;
    }

    const verificar = () =>
      fetch(`${API_URL}/api/wompi/verificar/${txId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => d?.estadoPago || "pendiente")
        .catch(() => "pendiente");

    verificar().then((estado) => {
      if (estado !== "pendiente") {
        setPaymentStatus(estado);
        return;
      }
      // El banco puede tardar unos segundos en confirmar la transferencia (PSE) — reintentar una vez
      setTimeout(() => {
        verificar().then(setPaymentStatus);
      }, 4000);
    });
  }, [location.state, navigate]);

  const extras = useMemo(() => Object.entries(order?.extraItems || {}).filter(([, quantity]) => quantity > 0), [order]);

  if (!order) {
    return null;
  }

  const metodoPagoLabel = order.metodo_pago === "Transferencia Wompi" ? "Transferencia Wompi" : "Contraentrega en efectivo";
  const esRechazado = paymentStatus === "rechazado" || paymentStatus === "error";
  const esPendiente = paymentStatus !== "aprobado" && !esRechazado;

  return (
    <>
      <style>{CSS}</style>

      <div className="topnav">
        <div>
          <div className="brand-name">Órale Taquería</div>
          <div className="brand-sub">Tacos y antojitos mexicanos</div>
        </div>
        <button className="back-link" onClick={() => navigate("/menu")}>Pedir de nuevo</button>
      </div>

      <div className="wrap">
        <section className="hero">
          <div className="eyebrow">{esRechazado ? "Pago rechazado" : esPendiente ? "Verificando pago" : "Pedido confirmado"}</div>
          <div className="hero-grid">
            <div>
              <div
                className="confirm-chip"
                style={esRechazado ? { background: "#fbe6e6", color: "#8a2020", borderColor: "#f3caca" } : undefined}
              >
                {esRechazado
                  ? "✕ Tu pago no fue aprobado"
                  : esPendiente
                  ? "⏳ Estamos confirmando tu pago"
                  : "✓ Tu pedido salió correctamente"}
              </div>
              <h1>{esRechazado ? "Tu pedido no se pudo confirmar." : esPendiente ? "Casi listo…" : "Ya recibimos tu pedido."}</h1>
              <p>
                {esRechazado
                  ? "Tu banco no autorizó la transferencia, así que el pedido quedó cancelado y no se realizó ningún cobro. Puedes volver al menú e intentarlo de nuevo."
                  : esPendiente
                  ? "Tu banco está confirmando la transferencia. Puede tardar unos minutos — si tarda mucho, escríbenos con tu número de pedido."
                  : "Estamos preparando tu orden y pronto saldrá a entrega. Guarda este resumen para tener claro qué pediste y cuánto pagarás al recibirlo."}
              </p>
            </div>
            <div className="amount-card" style={esRechazado ? { background: "#5a2323" } : undefined}>
              <span>{esRechazado ? "Total no cobrado" : "Total a pagar"}</span>
              <strong>{formatCurrency(order.total)}</strong>
              <small>Pedido {order.numero_pedido} · {metodoPagoLabel}</small>
            </div>
          </div>
        </section>

        <div className="layout">
          <section className="card">
            <span className="section-title">Lo que pediste</span>
            <div className="line-list">
              {groupExtras(order?.extraItems).map(({ cat, items }) => (
                <article key={cat} className="line-item">
                  <strong>{cat}</strong>
                  <p>{items.map(([name, quantity]) => `${name} x${quantity}`).join(" · ")}</p>
                </article>
              ))}
            </div>
          </section>

          <div style={{ display: "grid", gap: "1rem" }}>
            <section className="card">
              <span className="section-title">Resumen</span>
              <div className="summary-list">
                <div className="summary-row">
                  <span>Número de pedido</span>
                  <strong>{order.numero_pedido}</strong>
                </div>
                {extras.length > 0 && (
                  <div className="summary-row">
                    <span>Productos</span>
                    <strong>{extras.reduce((sum, [, quantity]) => sum + quantity, 0)}</strong>
                  </div>
                )}
                <div className="summary-row">
                  <span>Método de pago</span>
                  <strong>{metodoPagoLabel}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </div>
            </section>

            <section className="card">
              <span className="section-title">Entrega</span>
              <div className="customer-block">
                <div>
                  <span>Cliente</span>
                  {order.cliente.nombre}
                </div>
                <div>
                  <span>Contacto</span>
                  {order.cliente.telefono}
                </div>
                <div>
                  <span>Dirección</span>
                  {order.cliente.direccion}, {order.cliente.barrio}
                </div>
                {order.cliente.referencia && (
                  <div>
                    <span>Referencia</span>
                    {order.cliente.referencia}
                  </div>
                )}
                {order.cliente.notas && (
                  <div>
                    <span>Notas</span>
                    {order.cliente.notas}
                  </div>
                )}
                <div className="pill">Entrega estimada 30-45 min</div>
              </div>
            </section>
          </div>
        </div>

        <div className="actions">
          <button className="btn-primary" onClick={() => navigate("/menu")}>
            {esRechazado ? "Volver al menú e intentar de nuevo" : "Hacer otro pedido"}
          </button>
          {!esRechazado && (
            <button className="btn-secondary" onClick={() => window.print()}>Imprimir resumen</button>
          )}
        </div>
      </div>

      <section className="recibo" aria-hidden="true">
        <div className="banda">
          <img src={logo} alt="" />
          <div className="marca">
            <strong>Órale Taquería</strong>
            <span>Tacos y antojitos mexicanos</span>
          </div>
          <div className="folio"><span>Pedido</span><strong>{order.numero_pedido}</strong></div>
        </div>
        <div className="guirnalda" />
        <h2>¡Órale! Ya recibimos tu pedido</h2>
        <p className="sub">{new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}</p>
        <dl>
          <dt>Cliente</dt><dd>{order.cliente.nombre} · {order.cliente.telefono}</dd>
          <dt>Entrega</dt><dd>{order.cliente.direccion ? `${order.cliente.direccion}, ${order.cliente.barrio}` : "Recoger en tienda"}</dd>
          {order.cliente.referencia && <><dt>Referencia</dt><dd>{order.cliente.referencia}</dd></>}
          {order.cliente.notas && <><dt>Notas</dt><dd>{order.cliente.notas}</dd></>}
          <dt>Pago</dt><dd>{metodoPagoLabel}</dd>
        </dl>
        <table>
          <thead><tr><th>Lo que pediste</th><th className="n">Cant.</th><th className="n">Valor</th></tr></thead>
          <tbody>
            {extras.map(([name, quantity]) => (
              <tr key={name}>
                <td>{name}</td>
                <td className="n">{quantity}</td>
                <td className="n">{precios[name] ? formatCurrency(precios[name] * quantity) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total"><span>Total a pagar</span><strong>{formatCurrency(order.total)}</strong></div>
        <footer>
          <strong>¡Gracias por pedir en Órale!</strong>
          <span>
            {order.cliente.direccion ? "Entrega estimada 30-45 min. " : ""}
            El total incluye domicilio y empaques cuando aplican. Si algo no está bien, escríbenos con tu número de pedido.
          </span>
        </footer>
      </section>
    </>
  );
}