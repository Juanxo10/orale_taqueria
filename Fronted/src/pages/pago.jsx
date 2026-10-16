import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/image.png";
import { API_URL } from "../config";
import {
  ALL_EXTRAS, FRAPPES_NAMES, LECHE_ALMENDRAS, CAJA, VASO, DOM, calcBowlPrice,
} from "../data/menuData";

// Precio de cada adicional derivado de la misma fuente que usa menu.jsx,
// para que nunca queden desincronizados (bug: productos nuevos cobrándose $0).
const CAFETERIA_PRECIOS = Object.fromEntries(ALL_EXTRAS.map((it) => [it.name, it.price]));
const FRAPPES_NOMBRES = FRAPPES_NAMES;

const fmt = (n) => "$" + Number(n).toLocaleString("es-CO");

const protName = (p) => (typeof p === "string" ? p : p?.name ?? "");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--g900:#1a2e1b;--g800:#2D4A2F;--g700:#3a5e3c;--g600:#4A7C59;--g400:#7ab87a;--g200:#d4ead4;--g100:#edf7ed;--gold:#c8a84b;--cream:#f5f3ef;--border:#e2ddd6;--text:#1a2e1b;--muted:#6b7a6b;--red:#dc2626;--red-bg:#fef2f2;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--cream);color:var(--text);min-height:100vh;}
.topnav{background:var(--g800);display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.5rem;position:sticky;top:0;z-index:50;}
.brand-wrap{display:flex;align-items:center;gap:.65rem;}
.brand-logo{width:68px;height:68px;object-fit:contain;border-radius:8px;flex-shrink:0;}
.brand-name{font-size:1.35rem;font-weight:800;color:#fff;letter-spacing:-.5px;}
.brand-sub{font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--g400);margin-top:.1rem;}
.back-link{display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:8px;padding:.4rem .9rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;text-decoration:none;transition:background .15s;}
.back-link:hover{background:rgba(255,255,255,.18);}
.wrap{max-width:680px;margin:0 auto;padding:1.8rem 1.2rem 5rem;}
.page-title{font-size:1.5rem;font-weight:800;margin-bottom:.25rem;}
.page-sub{font-size:.82rem;color:var(--muted);}
.slabel{font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:.65rem;display:block;}
.summary-card{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:1.5rem;}
.summary-head{background:var(--g800);padding:.85rem 1.2rem;display:flex;justify-content:space-between;align-items:center;}
.summary-head span{color:var(--g400);font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;font-weight:600;}
.summary-head strong{color:var(--gold);font-size:1.2rem;font-weight:800;}
.summary-rows{padding:.6rem 1.2rem;}
.srow{display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid #f5f3ef;font-size:.83rem;}
.srow:last-child{border-bottom:none;}
.srow .sl{color:var(--muted);font-size:.75rem;}
.srow .sv{font-weight:500;}
.srow.stot .sl{font-weight:700;color:var(--text);font-size:.85rem;}
.srow.stot .sv{font-size:1.05rem;font-weight:800;color:var(--g800);}
.timebadge{display:flex;align-items:center;gap:.75rem;background:#fff;border-radius:14px;padding:1rem 1.3rem;margin-bottom:1.5rem;border:1px solid var(--border);}
.timebadge .ticon{font-size:1.7rem;flex-shrink:0;}
.timebadge strong{display:block;font-size:.92rem;color:var(--g800);}
.timebadge small{font-size:.73rem;color:var(--muted);}
.form-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:1.3rem 1.4rem;margin-bottom:1.2rem;}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;}
.form-group{display:flex;flex-direction:column;gap:.35rem;}
.form-group.full{grid-column:1/-1;}
label.fl{font-size:.75rem;font-weight:700;color:var(--g800);}
label.fl .req{color:var(--red);margin-left:.15rem;}
input.fi,textarea.fi,select.fi{border:1.5px solid var(--border);border-radius:10px;padding:.6rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.87rem;color:var(--text);background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;}
input.fi:focus,textarea.fi:focus,select.fi:focus{border-color:var(--g600);box-shadow:0 0 0 3px rgba(74,124,89,.12);}
input.fi.err,textarea.fi.err{border-color:var(--red);box-shadow:0 0 0 3px rgba(220,38,38,.1);}
textarea.fi{resize:vertical;min-height:70px;}
.err-msg{font-size:.7rem;color:var(--red);display:none;}
.err-msg.show{display:block;}
.pm-grid{display:flex;flex-direction:column;gap:.65rem;margin-bottom:1.2rem;}
.pm{background:#fff;border:1.5px solid var(--border);border-radius:12px;padding:1rem 1.2rem;cursor:pointer;display:flex;align-items:center;gap:.9rem;transition:all .15s;}
.pm:hover{border-color:var(--g400);}
.pm.sel{border-color:var(--g600);background:var(--g100);}
.pm-icon{font-size:1.6rem;flex-shrink:0;width:42px;text-align:center;}
.pm-info strong{display:block;font-size:.9rem;font-weight:700;}
.pm-info span{font-size:.73rem;color:var(--muted);line-height:1.4;}
.pm-radio{margin-left:auto;width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:transparent;transition:all .15s;flex-shrink:0;}
.pm.sel .pm-radio{background:var(--g600);border-color:var(--g600);color:#fff;}
.pm-badge{background:var(--g200);color:var(--g800);font-size:.6rem;font-weight:700;padding:.1rem .45rem;border-radius:999px;margin-left:.5rem;text-transform:uppercase;letter-spacing:.05em;}
.extra-panel{display:none;background:var(--g100);border:1px solid var(--g200);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.2rem;font-size:.82rem;color:var(--g800);line-height:1.65;}
.extra-panel.show{display:block;}
.extra-panel strong{display:block;margin-bottom:.4rem;font-size:.87rem;}
.extra-panel ul{padding-left:1.1rem;}
.extra-panel li{margin-bottom:.25rem;}
.nequi-num{display:inline-flex;align-items:center;gap:.55rem;background:#fff;border:1px solid var(--g200);border-radius:8px;padding:.45rem .85rem;font-size:.92rem;font-weight:700;color:var(--g800);margin-top:.5rem;}
.nequi-num .nicon{font-size:1rem;}
.copy-btn{background:var(--g800);color:#fff;border:none;border-radius:6px;padding:.25rem .65rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.7rem;font-weight:700;cursor:pointer;transition:background .15s;}
.copy-btn:hover{background:var(--g700);}
.copy-btn.copied{background:var(--g600);}
.btn-wa{width:100%;padding:1rem;background:#25D366;color:#fff;border:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.98rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.55rem;transition:all .15s;box-shadow:0 4px 18px rgba(37,211,102,.3);}
.btn-wa:hover{background:#1fb356;}
.btn-card{width:100%;padding:1rem;background:var(--g800);color:#fff;border:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.98rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.55rem;transition:all .15s;}
.btn-card:hover{background:var(--g700);}
.btn-card:disabled{opacity:.7;cursor:not-allowed;}
.btn-wompi{width:100%;padding:1rem;background:#5c2ded;color:#fff;border:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.98rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.55rem;transition:all .15s;box-shadow:0 4px 18px rgba(92,45,237,.3);}
.btn-wompi:hover{background:#4a22c7;}
.btn-wompi:disabled{opacity:.7;cursor:not-allowed;}
.fine{text-align:center;font-size:.7rem;color:#aaa;margin-top:.85rem;line-height:1.6;}
.success-card{background:#edf7ed;border:1px solid var(--g200);border-radius:14px;padding:1rem 1.2rem;margin-bottom:1.2rem;color:var(--g800);}
.success-card strong{display:block;font-size:.95rem;margin-bottom:.25rem;}
@media(max-width:560px){.form-grid{grid-template-columns:1fr;}.form-group.full{grid-column:1;}.wrap{padding:1.2rem .9rem 5rem;}}
`;

export default function Pago() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  // Delivery fields
  const [fname, setFname] = useState("");
  const [fphone, setFphone] = useState("");
  const [faddr, setFaddr] = useState("");
  const [fbarrio, setFbarrio] = useState("");
  const [freferencia, setFreferencia] = useState("");
  const [fnotes, setFnotes] = useState("");

  // Field errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payMethod, setPayMethod] = useState("efectivo"); // "efectivo" | "wompi"
  const [tipoEntrega, setTipoEntrega] = useState("domicilio"); // "domicilio" | "recogida"

  const fnameRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pepas_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed?.bowls?.length && !Object.keys(parsed?.extraItems ?? {}).length) {
          navigate("/menu");
          return;
        }
        setOrderData(parsed);
      } else {
        navigate("/menu");
      }
    } catch (_) {
      navigate("/menu");
    }
  }, []);

  const bowls = orderData?.bowls || [];
  const extraItems = orderData?.extraItems || {};
  const frappesAlmond = orderData?.frappesAlmond || {};

  const extrasSubtotal = Object.entries(extraItems).reduce((s, [n, qty]) => {
    if (!qty) return s;
    const almondExtra = (FRAPPES_NOMBRES.has(n) && frappesAlmond[n]) ? LECHE_ALMENDRAS * qty : 0;
    return s + (CAFETERIA_PRECIOS[n] ?? 0) * qty + almondExtra;
  }, 0);
  const domicilioCosto = tipoEntrega === "recogida" ? 0 : DOM;
  const grandTotal = bowls.reduce((s, b) => s + calcBowlPrice(b.tops, b.prots, b.bev), 0) + extrasSubtotal + domicilioCosto;

  const validateDelivery = () => {
    const e = {};
    const name = fname.trim();
    const phone = fphone.trim().replace(/\s/g, "");
    const addr = faddr.trim();
    const barrio = fbarrio.trim();

    if (!name) {
      e.fname = "Ingresa tu nombre";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,80}$/.test(name)) {
      e.fname = "Solo letras, entre 2 y 80 caracteres";
    }

    if (!phone) {
      e.fphone = "Ingresa tu número";
    } else if (!/^\d{7,10}$/.test(phone)) {
      e.fphone = "Solo dígitos, entre 7 y 10 cifras";
    }

    if (tipoEntrega === "domicilio") {
      if (!addr) {
        e.faddr = "Ingresa tu dirección";
      } else if (addr.length < 5) {
        e.faddr = "Dirección demasiado corta";
      } else if (addr.length > 200) {
        e.faddr = "Máximo 200 caracteres";
      }

      if (!barrio) {
        e.fbarrio = "Ingresa el barrio";
      } else if (barrio.length < 2) {
        e.fbarrio = "Barrio demasiado corto";
      } else if (barrio.length > 60) {
        e.fbarrio = "Máximo 60 caracteres";
      }

      if (freferencia.trim().length > 150) {
        e.freferencia = "Máximo 150 caracteres";
      }
    }

    if (fnotes.trim().length > 300) {
      e.fnotes = "Máximo 300 caracteres";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    if (!validateDelivery()) {
      fnameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Guardar pedido en backend
    const payload = {
      bowls,
      extraItems,
      frappesAlmond,
      cliente: {
        nombre: fname.trim(),
        telefono: fphone.trim(),
        direccion: tipoEntrega === "domicilio" ? faddr.trim() : "",
        barrio: tipoEntrega === "domicilio" ? fbarrio.trim() : "",
        referencia: tipoEntrega === "domicilio" ? freferencia.trim() : "",
        notas: fnotes.trim(),
      },
      metodo_pago: "Contraentrega en efectivo",
      tipo_entrega: tipoEntrega,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        alert(data.error || "Error al crear el pedido");
        return;
      }

      const data = await res.json();
      const confirmedOrder = {
        ...data,
        bowls,
        extraItems,
        cliente: payload.cliente,
        metodo_pago: payload.metodo_pago,
      };

      try {
        sessionStorage.setItem("pepas_last_order", JSON.stringify(confirmedOrder));
      } catch (_) {
        // noop
      }

      try {
        localStorage.removeItem("pepas_order");
      } catch (_) {
        // noop
      }

      navigate("/pedido-confirmado", {
        replace: true,
        state: { order: confirmedOrder },
      });
    } catch (err) {
      console.error("Error al crear pedido:", err);
      alert("No se pudo conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWompiPay = async () => {
    if (isSubmitting) return;

    if (!validateDelivery()) {
      fnameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = {
      bowls,
      extraItems,
      frappesAlmond,
      cliente: {
        nombre: fname.trim(),
        telefono: fphone.trim(),
        direccion: tipoEntrega === "domicilio" ? faddr.trim() : "",
        barrio: tipoEntrega === "domicilio" ? fbarrio.trim() : "",
        referencia: tipoEntrega === "domicilio" ? freferencia.trim() : "",
        notas: fnotes.trim(),
      },
      metodo_pago: "Transferencia Wompi",
      tipo_entrega: tipoEntrega,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        alert(data.error || "Error al crear el pedido");
        return;
      }

      const data = await res.json();
      const confirmedOrder = {
        ...data,
        bowls,
        extraItems,
        cliente: payload.cliente,
        metodo_pago: payload.metodo_pago,
      };

      try {
        sessionStorage.setItem("pepas_last_order", JSON.stringify(confirmedOrder));
      } catch (_) {
        // noop
      }

      try {
        localStorage.removeItem("pepas_order");
      } catch (_) {
        // noop
      }

      // Calcular total para enviar a Wompi (en centavos)
      const total = grandTotal;
      const amountInCents = total * 100;

      // Usar numero_pedido como referencia única
      const reference = data.numero_pedido || String(data.id);

      // ─── Pega tu llave pública de Wompi en Fronted/.env como VITE_WOMPI_PUBLIC_KEY ───
      const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "";

      // Obtener hash de integridad desde el backend (requerido por Wompi)
      const hashRes = await fetch(`${API_URL}/api/wompi/integrity-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, amountInCents, currency: "COP" }),
      });
      if (!hashRes.ok) {
        const err = await hashRes.json().catch(() => ({}));
        alert(err.error || "Error al generar el hash de pago");
        return;
      }
      const { integrity } = await hashRes.json();

      const wompiUrl = new URL("https://checkout.wompi.co/p/");
      wompiUrl.searchParams.set("public-key", publicKey);
      wompiUrl.searchParams.set("currency", "COP");
      wompiUrl.searchParams.set("amount-in-cents", String(amountInCents));
      wompiUrl.searchParams.set("reference", reference);
      wompiUrl.searchParams.set("signature:integrity", integrity);
      // Solo incluir redirect-url en producción (HTTPS); localhost no está permitido por Wompi
      if (window.location.protocol === "https:") {
        wompiUrl.searchParams.set("redirect-url", `${window.location.origin}/pedido-confirmado`);
      }

      window.location.href = wompiUrl.toString();
    } catch (err) {
      console.error("Error al iniciar pago Wompi:", err);
      alert("No se pudo conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="topnav">
        <div className="brand-wrap">
          <img src={logo} alt="Pepas logo" className="brand-logo" />
          <div>
            <div className="brand-name">pepas coffee</div>
            <div className="brand-sub">Bowls frescos · Vida saludable</div>
          </div>
        </div>
        <button className="back-link" onClick={() => navigate("/menu")}>← Volver al pedido</button>
      </div>

      <div className="wrap">
        <div style={{ marginBottom: "1.4rem" }}>
          <div className="page-title">Confirmar pedido</div>
          <div className="page-sub">Revisa tu pedido, elige cómo recibirlo y confirma.</div>
        </div>

        {/* Resumen del pedido */}
        <span className="slabel">Resumen del pedido</span>
        <div className="summary-card">
          <div className="summary-head">
            <span>Resumen</span>
            <strong>
              {bowls.length > 0 && <>{bowls.length} bowl{bowls.length !== 1 ? "s" : ""}{Object.values(extraItems).some(q=>q>0) ? " + adicionales" : ""}</>}
              {bowls.length === 0 && <>Solo adicionales</>}
            </strong>
          </div>
          <div className="summary-rows">
            {bowls.map((b, i) => (
              <div key={i} style={{ marginBottom: ".4rem" }}>
                <div className="srow">
                  <span className="sl">Bowl {i + 1} · {b.carb} · {b.prots.map(protName).join(", ")}{b.bev ? " · " + b.bev : ""}</span>
                  <span className="sv">{fmt(calcBowlPrice(b.tops, b.prots, b.bev))}</span>
                </div>
                <div className="srow" style={{ opacity: .7, fontSize: ".75rem", paddingLeft: ".5rem" }}>
                  <span className="sl">Caja</span>
                  <span className="sv">+{fmt(CAJA)}</span>
                </div>
                {b.bev && (
                  <div className="srow" style={{ opacity: .7, fontSize: ".75rem", paddingLeft: ".5rem" }}>
                    <span className="sl">Vaso</span>
                    <span className="sv">+{fmt(VASO)}</span>
                  </div>
                )}
              </div>
            ))}
            {Object.keys(extraItems).filter((nombre) => (extraItems[nombre] || 0) > 0).map((nombre) => {
              const qty = extraItems[nombre];
              const almondExtra = (FRAPPES_NOMBRES.has(nombre) && frappesAlmond[nombre]) ? LECHE_ALMENDRAS * qty : 0;
              return (
                <div key={nombre} className="srow">
                  <span className="sl">{nombre} ×{qty}{FRAPPES_NOMBRES.has(nombre) && frappesAlmond[nombre] ? " · leche almendras" : ""}</span>
                  <span className="sv">{fmt((CAFETERIA_PRECIOS[nombre] ?? 0) * qty + almondExtra)}</span>
                </div>
              );
            })}
            <div className="srow">
              <span className="sl">Domicilio</span>
              <span className="sv">{tipoEntrega === "recogida" ? <span style={{color:"var(--g600)",fontWeight:700}}>Gratis (recogida)</span> : fmt(DOM)}</span>
            </div>
            <div className="srow stot">
              <span className="sl">Total estimado</span>
              <span className="sv">{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Tipo de entrega */}
        <span className="slabel">Cómo quieres recibir tu pedido</span>
        <div className="pm-grid" style={{marginBottom:"1.2rem"}}>
          <div className={`pm${tipoEntrega === "domicilio" ? " sel" : ""}`} onClick={() => setTipoEntrega("domicilio")}>
            <div className="pm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--g700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
            <div className="pm-info">
              <strong>Domicilio a tu dirección</strong>
              <span>Te lo llevamos donde estés. Costo adicional de {fmt(DOM)}.</span>
            </div>
            <div className="pm-radio">{tipoEntrega === "domicilio" ? "✓" : ""}</div>
          </div>
          <div className={`pm${tipoEntrega === "recogida" ? " sel" : ""}`} onClick={() => setTipoEntrega("recogida")}>
            <div className="pm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--g700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <div className="pm-info">
              <strong>Recoger en tienda / Comer aquí</strong>
              <span>Ven a Pepas Coffee y recoge tu pedido. Sin costo de domicilio.</span>
              <span className="pm-badge">Gratis</span>
            </div>
            <div className="pm-radio">{tipoEntrega === "recogida" ? "✓" : ""}</div>
          </div>
        </div>

        {/* Datos de entrega */}
        <span className="slabel">{tipoEntrega === "recogida" ? "Tus datos de contacto" : "Datos de entrega"}</span>
        <div className="form-card">
          <div className="form-grid">
            <div className="form-group">
              <label className="fl" htmlFor="fname">Nombre completo<span className="req">*</span></label>
              <input ref={fnameRef} className={`fi${errors.fname ? " err" : ""}`} type="text" id="fname" placeholder="Tu nombre" autoComplete="name" maxLength={80} value={fname} onChange={(e) => setFname(e.target.value)} />
              {errors.fname && <span className="err-msg show">{errors.fname}</span>}
            </div>
            <div className="form-group">
              <label className="fl" htmlFor="fphone">WhatsApp / Celular<span className="req">*</span></label>
              <input className={`fi${errors.fphone ? " err" : ""}`} type="tel" id="fphone" placeholder="300 000 0000" autoComplete="tel" maxLength={10} value={fphone} onChange={(e) => setFphone(e.target.value.replace(/[^\d\s]/g, ""))} />
              {errors.fphone && <span className="err-msg show">{errors.fphone}</span>}
            </div>
            {tipoEntrega === "domicilio" && (
              <>
                <div className="form-group full">
                  <label className="fl" htmlFor="faddr">Dirección<span className="req">*</span></label>
                  <input className={`fi${errors.faddr ? " err" : ""}`} type="text" id="faddr" placeholder="Calle, carrera, número, apartamento…" autoComplete="street-address" maxLength={200} value={faddr} onChange={(e) => setFaddr(e.target.value)} />
                  {errors.faddr && <span className="err-msg show">{errors.faddr}</span>}
                </div>
                <div className="form-group">
                  <label className="fl" htmlFor="fbarrio">Barrio<span className="req">*</span></label>
                  <input className={`fi${errors.fbarrio ? " err" : ""}`} type="text" id="fbarrio" placeholder="Ej: El Prado" maxLength={60} value={fbarrio} onChange={(e) => setFbarrio(e.target.value)} />
                  {errors.fbarrio && <span className="err-msg show">{errors.fbarrio}</span>}
                </div>
                <div className="form-group">
                  <label className="fl" htmlFor="freferencia">Referencia (opcional)</label>
                  <input className={`fi${errors.freferencia ? " err" : ""}`} type="text" id="freferencia" placeholder="Ej: casa amarilla, portón negro" maxLength={150} value={freferencia} onChange={(e) => setFreferencia(e.target.value)} />
                  {errors.freferencia && <span className="err-msg show">{errors.freferencia}</span>}
                </div>
              </>
            )}
            <div className="form-group full">
              <label className="fl" htmlFor="fnotes">Notas adicionales (opcional)</label>
              <textarea className={`fi${errors.fnotes ? " err" : ""}`} id="fnotes" placeholder="Alergias, instrucciones especiales, sin picante…" maxLength={300} value={fnotes} onChange={(e) => setFnotes(e.target.value)} />
              {errors.fnotes && <span className="err-msg show">{errors.fnotes}</span>}
            </div>
          </div>
        </div>

        {/* Forma de pago */}
        <span className="slabel">Forma de pago</span>
        <div className="pm-grid">
          <div className={`pm${payMethod === "efectivo" ? " sel" : ""}`} onClick={() => setPayMethod("efectivo")}>
            <div className="pm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--g700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 9v6M10 10h3a1 1 0 0 1 0 2h-2a1 1 0 0 0 0 2h3"/></svg></div>
            <div className="pm-info">
              <strong>{tipoEntrega === "recogida" ? "Pagar en caja" : "Contraentrega en efectivo"}</strong>
              <span>{tipoEntrega === "recogida" ? "Pagas directamente en la tienda al recoger tu pedido." : "Pagas al domiciliario cuando llegue tu pedido."}</span>
            </div>
            <div className="pm-radio">{payMethod === "efectivo" ? "✓" : ""}</div>
          </div>
          <div className={`pm${payMethod === "wompi" ? " sel" : ""}`} onClick={() => setPayMethod("wompi")}>
            <div className="pm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--g700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg></div>
            <div className="pm-info">
              <strong>Pago en transferencia</strong>
              <span>Paga en línea con tarjeta, PSE o Nequi mediante Wompi.</span>
              <span className="pm-badge">En línea</span>
            </div>
            <div className="pm-radio">{payMethod === "wompi" ? "✓" : ""}</div>
          </div>
        </div>

        {/* Panel contraentrega */}
        {payMethod === "efectivo" && (
          <div className="extra-panel show">
            <strong>¿Cómo funciona?</strong>
            <ul>
              <li>Confirmas tu pedido desde esta página</li>
              <li>Preparamos tu pedido</li>
              {tipoEntrega === "recogida"
                ? <li>Vienes a la tienda y pagas en caja</li>
                : <li>Despachamos y pagas en efectivo al domiciliario</li>
              }
              <li>¡Disfruta!</li>
            </ul>
          </div>
        )}

        {/* Panel Wompi */}
        {payMethod === "wompi" && (
          <div className="extra-panel show">
            <strong>Pago seguro en línea</strong>
            <ul>
              <li>Serás redirigido a la plataforma de pagos Wompi</li>
              <li>Puedes pagar con tarjeta débito/crédito, PSE o Nequi</li>
              <li>Una vez confirmado el pago, tu pedido entra al sistema</li>
              <li>¡Disfruta!</li>
            </ul>
          </div>
        )}

        {/* CTA */}
        <div>
          {payMethod === "efectivo" ? (
            <button className="btn-card" onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Creando pedido..." : "Confirmar pedido"}
            </button>
          ) : (
            <button className="btn-wompi" onClick={handleWompiPay} disabled={isSubmitting}>
              {isSubmitting ? "Redirigiendo..." : "Pagar con transferencia"}
            </button>
          )}
          <p className="fine">Al confirmar, el pedido se guarda directamente en el sistema para que aparezca en administración.</p>
        </div>
      </div>
    </>
  );
}
