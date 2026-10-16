import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--g900:#1a2e1b;--g800:#2D4A2F;--g700:#3a5e3c;--g600:#4A7C59;--g400:#7ab87a;--g200:#d4ead4;--g100:#edf7ed;--gold:#c8a84b;--cream:#f5f3ef;--border:#e2ddd6;--text:#1a2e1b;--muted:#6b7a6b;--white:#fff;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:radial-gradient(circle at top,#f9f5ea 0,#f5f3ef 42%,#edf7ed 100%);color:var(--text);min-height:100vh;}
.topnav{background:var(--g800);display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.5rem;position:sticky;top:0;z-index:50;}
.brand-name{font-size:1.35rem;font-weight:800;color:#fff;letter-spacing:-.5px;}
.brand-sub{font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--g400);margin-top:.1rem;}
.back-link{display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:8px;padding:.4rem .9rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:background .15s;}
.back-link:hover{background:rgba(255,255,255,.18);}
.wrap{max-width:860px;margin:0 auto;padding:2rem 1.2rem 5rem;}
.hero{background:linear-gradient(135deg,var(--white),#f6fbf6);border:1px solid var(--border);border-radius:24px;padding:1.8rem;box-shadow:0 20px 50px rgba(26,46,27,.08);margin-bottom:1.4rem;overflow:hidden;position:relative;}
.hero::after{content:"";position:absolute;inset:auto -40px -55px auto;width:180px;height:180px;background:radial-gradient(circle,var(--g200),transparent 70%);opacity:.9;pointer-events:none;}
.eyebrow{font-size:.68rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--g600);margin-bottom:.75rem;}
.hero h1{font-size:clamp(1.7rem,4vw,2.5rem);line-height:1.05;font-weight:800;max-width:10ch;margin-bottom:.55rem;}
.hero p{font-size:.92rem;color:var(--muted);max-width:52ch;line-height:1.6;}
.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;margin-top:1.5rem;align-items:end;}
.confirm-chip{display:inline-flex;align-items:center;gap:.55rem;background:var(--g100);color:var(--g800);border:1px solid var(--g200);border-radius:999px;padding:.45rem .85rem;font-size:.82rem;font-weight:700;}
.amount-card{background:var(--g800);color:#fff;border-radius:18px;padding:1.2rem 1.25rem;position:relative;z-index:1;}
.amount-card span{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.16em;color:var(--g400);margin-bottom:.45rem;}
.amount-card strong{display:block;font-size:2rem;font-weight:800;letter-spacing:-.03em;}
.amount-card small{display:block;margin-top:.45rem;color:#d8e6d8;font-size:.78rem;line-height:1.5;}
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
`;

const protName = (protein) => (typeof protein === "string" ? protein : protein?.name ?? "");
const formatCurrency = (value) => "$" + Number(value || 0).toLocaleString("es-CO");

export default function PedidoConfirmado() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(() => location.state?.order ?? null);
  // Estado real del pago Wompi: "aprobado" | "pendiente" | "rechazado" | "error" | null (no aplica, ej. contraentrega)
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    let ord = location.state?.order ?? null;
    if (!ord) {
      try {
        const raw = sessionStorage.getItem("pepas_last_order");
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
          <div className="brand-name">pepas coffee</div>
          <div className="brand-sub">Bowls frescos · Vida saludable</div>
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
              {order.bowls.map((bowl, index) => (
                <article key={`${bowl.carb}-${index}`} className="line-item">
                  <strong>Bowl {index + 1} · {bowl.carb}</strong>
                  <p>
                    Proteínas: {bowl.prots.map(protName).join(", ")}
                    {bowl.tops?.length ? ` · Toppings: ${bowl.tops.join(", ")}` : ""}
                    {bowl.bev ? ` · Bebida: ${bowl.bev}` : ""}
                  </p>
                  <div className="line-meta">
                    {bowl.lechuga ? "Incluye lechuga" : "Sin lechuga"}
                    {" · "}
                    {bowl.vinagreta ? "Incluye vinagreta" : "Sin vinagreta"}
                    {" · "}
                    Caja +$1.000{bowl.bev ? " · Vaso +$1.000" : ""}
                  </div>
                </article>
              ))}

              {extras.length > 0 && (
                <article className="line-item">
                  <strong>Adicionales de cafetería</strong>
                  <p>{extras.map(([name, quantity]) => `${name} x${quantity}`).join(" · ")}</p>
                </article>
              )}
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
                <div className="summary-row">
                  <span>Bowls</span>
                  <strong>{order.bowls.length}</strong>
                </div>
                {extras.length > 0 && (
                  <div className="summary-row">
                    <span>Extras</span>
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
    </>
  );
}