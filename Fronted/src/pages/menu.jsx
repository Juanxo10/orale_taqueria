import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";
import {
  CARBOS, TOPPINGS, PROTEINAS, BEBIDAS, CAFETERIA, ALL_EXTRAS,
  FRAPPES_NAMES, calcBowlPrice, DOM, LECHE_ALMENDRAS,
} from "../data/menuData";

const fmt = (n) => "$" + n.toLocaleString("es-CO");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--g900:#1a2e1b;--g800:#2D4A2F;--g700:#3a5e3c;--g600:#4A7C59;--g400:#7ab87a;--g200:#d4ead4;--g100:#edf7ed;--gold:#c8a84b;--cream:#f5f3ef;--border:#e2ddd6;--text:#1a2e1b;--muted:#6b7a6b;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--cream);color:var(--text);min-height:100vh;}
.bowl-badge{background:var(--gold);color:var(--g900);border-radius:999px;font-size:.78rem;font-weight:700;padding:.3rem .9rem;display:flex;align-items:center;gap:.35rem;}
.home-btn{background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:8px;padding:.38rem .9rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .15s;display:flex;align-items:center;gap:.4rem;white-space:nowrap;}
.home-btn:hover{background:rgba(255,255,255,.18);}
.dot{width:7px;height:7px;background:var(--g900);border-radius:50%;}
.layout{display:grid;grid-template-columns:1fr 340px;max-width:1100px;margin:0 auto;}
.left-panel{padding:1.5rem 1.5rem 7rem;border-right:1px solid var(--border);}
.sec-label{font-size:.65rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:.7rem;display:block;}
.always-row{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.5rem;}
.tag-ck{display:flex;align-items:center;gap:.4rem;background:var(--g800);color:#fff;border-radius:999px;padding:.35rem .9rem;font-size:.8rem;font-weight:600;cursor:pointer;user-select:none;border:2px solid var(--g800);transition:all .15s;}
.tag-ck.off{background:#fff;color:var(--muted);border-color:var(--border);}
.tag-ck.off .chk{background:transparent;border-color:#bbb;color:transparent;}
.chk{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:.6rem;color:var(--g900);background:var(--g400);border-color:var(--g400);flex-shrink:0;}
.sec-card{background:#fff;border-radius:14px;padding:1.2rem 1.3rem;margin-bottom:1rem;border:1px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,.06);}
.sec-head{display:flex;align-items:center;gap:.7rem;margin-bottom:1rem;}
.sec-num{width:26px;height:26px;border-radius:50%;background:var(--g800);color:#fff;font-size:.8rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sec-title{font-size:.95rem;font-weight:700;}
.sec-hint{font-size:.68rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:.1rem;}
.pill-grid{display:flex;flex-wrap:wrap;gap:.5rem;}
.pill{display:flex;align-items:center;gap:.4rem;border:1.5px solid var(--border);border-radius:999px;padding:.38rem .85rem;cursor:pointer;font-size:.82rem;font-weight:500;background:#fff;color:var(--text);transition:all .15s;user-select:none;}
.pk{width:14px;height:14px;border-radius:50%;border:1.5px solid #bbb;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:transparent;transition:all .15s;}
.pill.sel{border-color:var(--g600);background:var(--g100);color:var(--g800);font-weight:600;}
.pill.sel .pk{background:var(--g600);border-color:var(--g600);color:#fff;}
.cp{background:var(--g800);color:#fff;border-radius:999px;font-size:.7rem;font-weight:700;padding:.15rem .55rem;margin-left:.4rem;}
.cp.full{background:var(--gold);color:var(--g900);}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem;}
.pc{border:1.5px solid var(--border);border-radius:10px;padding:.75rem .9rem;cursor:pointer;background:#fff;transition:all .15s;user-select:none;}
.pc.sel{border-color:var(--g600);background:var(--g100);}
.pn{font-size:.85rem;font-weight:600;display:block;}
.pp{font-size:.78rem;color:var(--g600);font-weight:600;display:block;margin-top:.15rem;}
.pc.sel .pn{color:var(--g800);}
.add-wrap{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--border);padding:1rem 1.5rem;margin:0 -1.5rem;}
.add-btn{width:100%;padding:.85rem;background:var(--g800);color:#fff;border:none;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem;transition:all .15s;}
.add-btn:hover{background:var(--g700);}
.plus-ic{width:20px;height:20px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;line-height:1;}
.rp{background:#fff;display:flex;flex-direction:column;border-left:1px solid var(--border);position:sticky;top:96px;height:calc(100vh - 96px);overflow:hidden;}
.rt{padding:1.1rem 1.3rem .8rem;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;}
.rt h3{font-size:1rem;font-weight:700;}
.rt .sub{font-size:.75rem;color:var(--muted);margin-top:.1rem;}
.olist{flex:1;overflow-y:auto;padding:.8rem 1.3rem;display:flex;flex-direction:column;gap:.75rem;}
.bc{border:1.5px solid var(--border);border-radius:12px;padding:.9rem 1rem;position:relative;}
.bn{position:absolute;top:-.55rem;left:.8rem;background:var(--g600);color:#fff;font-size:.65rem;font-weight:700;padding:.1rem .55rem;border-radius:999px;}
.bclose{position:absolute;top:.6rem;right:.7rem;background:#f5f3ef;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:.75rem;color:var(--muted);display:flex;align-items:center;justify-content:center;}
.bcarb{font-size:.92rem;font-weight:700;margin:.3rem 0 .5rem;}
.btags{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.6rem;}
.bt{background:var(--g100);color:var(--g800);border-radius:6px;font-size:.7rem;font-weight:600;padding:.15rem .45rem;}
.bt.p{background:#fff3e0;color:#b45309;}
.bt.b{background:#e8f0fe;color:#3730a3;}
.bprice{font-size:.9rem;font-weight:700;}
.cbtn{border:1.5px dashed var(--border);border-radius:12px;padding:.85rem;cursor:pointer;background:transparent;width:100%;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:600;color:var(--g600);display:flex;align-items:center;justify-content:center;gap:.4rem;transition:all .15s;}
.cbtn:hover{border-color:var(--g600);background:var(--g100);}
.rf{border-top:1px solid var(--border);padding:1rem 1.3rem;}
.pr{display:flex;justify-content:space-between;font-size:.82rem;color:var(--muted);margin-bottom:.4rem;}
.pr.tot{color:var(--text);font-weight:700;font-size:1rem;border-top:1px solid var(--border);padding-top:.6rem;margin-top:.2rem;}
.cfbtn{width:100%;padding:.9rem;background:var(--g800);color:#fff;border:none;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;}
.cfbtn:hover{background:var(--g700);}
.abowl-btn{width:100%;padding:.7rem;background:transparent;color:var(--g600);border:1.5px dashed var(--g400);border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s;margin-bottom:.6rem;display:flex;align-items:center;justify-content:center;gap:.4rem;}
.abowl-btn:hover{background:var(--g100);border-color:var(--g600);}
.cafgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem;}
.caf-item{border:1.5px solid var(--border);border-radius:10px;padding:.75rem .9rem;background:#fff;display:flex;flex-direction:column;gap:.3rem;}
.caf-item.sel{border-color:var(--g600);background:var(--g100);}
.caf-name{font-size:.85rem;font-weight:600;}
.caf-price{font-size:.78rem;color:var(--g600);font-weight:600;}
.qt-row{display:flex;align-items:center;gap:.5rem;margin-top:.3rem;}
.qt-btn{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--border);background:#fff;cursor:pointer;font-size:1.1rem;line-height:1;display:flex;align-items:center;justify-content:center;color:var(--g800);font-weight:700;}
.qt-btn:hover{border-color:var(--g600);background:var(--g100);}
.qt-val{font-size:.88rem;font-weight:700;min-width:16px;text-align:center;}
.bt.caf{background:#fdf0ff;color:#6b21a8;}
.acc-head{display:flex;align-items:center;justify-content:space-between;padding:.7rem .9rem;background:var(--g100);border:1.5px solid var(--border);border-radius:10px;cursor:pointer;margin-bottom:.5rem;user-select:none;transition:all .15s;}
.acc-head:hover{border-color:var(--g400);background:var(--g200);}
.acc-head.open{border-color:var(--g600);background:var(--g200);border-radius:10px 10px 0 0;margin-bottom:0;}
.acc-label{font-size:.88rem;font-weight:700;color:var(--g800);display:flex;align-items:center;gap:.45rem;}
.acc-badge{background:var(--gold);color:var(--g900);border-radius:999px;font-size:.65rem;font-weight:700;padding:.1rem .5rem;min-width:18px;text-align:center;}
.acc-arrow{font-size:.8rem;color:var(--muted);transition:transform .2s;}
.acc-arrow.open{transform:rotate(180deg);}
.acc-body{border:1.5px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:.6rem;margin-bottom:.5rem;background:#fff;}
.caf-desc{font-size:.7rem;color:var(--muted);line-height:1.4;margin-top:.15rem;}
.closed-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:var(--cream);}
.closed-icon{font-size:3.5rem;margin-bottom:1.2rem;}
.closed-title{font-size:clamp(1.6rem,5vw,2.4rem);font-weight:800;letter-spacing:-.03em;color:var(--g900);margin-bottom:.6rem;}
.closed-sub{font-size:.95rem;color:var(--muted);line-height:1.65;max-width:38ch;margin:0 auto 2rem;}
.closed-badge{display:inline-flex;align-items:center;gap:.5rem;background:#fee2e2;color:#991b1b;border:1.5px solid #fca5a5;border-radius:999px;padding:.45rem 1.1rem;font-size:.82rem;font-weight:700;margin-bottom:1.6rem;}
.closed-badge .cd{width:8px;height:8px;border-radius:50%;background:#991b1b;}
@media(max-width:720px){.layout{grid-template-columns:1fr;}.rp{position:static;height:auto;border-left:none;border-top:1px solid var(--border);}.pgrid{grid-template-columns:repeat(2,1fr);}.home-btn{padding:.32rem .65rem;font-size:.72rem;}.bowl-badge{font-size:.7rem;padding:.25rem .7rem;}.cafgrid{grid-template-columns:1fr;}}
.pill.disabled{opacity:.5;cursor:not-allowed;background:#f5f3ef;border-color:var(--border);color:var(--muted);}
.pill-remove{margin-left:auto;padding-left:.4rem;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.85rem;line-height:1;opacity:.6;transition:opacity .15s;}
.pill:hover .pill-remove{opacity:1;}
.pc-remove{position:absolute;top:.35rem;right:.4rem;background:rgba(0,0,0,.07);border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;font-size:.7rem;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:background .15s;}
.pc-remove:hover{background:rgba(220,38,38,.15);color:#dc2626;}
.pc{position:relative;}
.pill.disabled .pk{background:transparent;border-color:#ccc;}
.pc.disabled{opacity:.5;cursor:not-allowed;background:#f9f7f5;border-color:var(--border);}
.pc.disabled .pn{color:var(--muted);}
.pc.disabled .pp{color:var(--muted);}
.caf-item.disabled{opacity:.55;background:#faf9f7;border-color:var(--border);}
.no-stock-tag{font-size:.6rem;font-weight:700;color:#991b1b;background:#fee2e2;border-radius:999px;padding:.1rem .45rem;white-space:nowrap;}
.mode-selector{display:flex;gap:.5rem;margin-bottom:1.5rem;background:var(--g100);border-radius:12px;padding:.3rem;border:1px solid var(--border);}
.mode-btn{flex:1;padding:.6rem 1rem;border:none;border-radius:9px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s;background:transparent;color:var(--muted);}
.mode-btn.active{background:var(--g800);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15);}
`;

export default function Menu() {
  const navigate = useNavigate();
  const [tiendaAbierta, setTiendaAbierta] = useState(null);
  const [desactivados, setDesactivados] = useState(new Set());
  const [bowls, setBowls] = useState([]);
  const [bid, setBid] = useState(0);
  const [carb, setCarb] = useState("");
  const [toppings, setToppings] = useState([]);
  const [proteins, setProteins] = useState([]);
  const [bev, setBev] = useState("");
  const [extraItems, setExtraItems] = useState({});
  const [openCats, setOpenCats] = useState({});
  const [frappesAlmond, setFrappesAlmond] = useState({});

  const [lechuga, setLechuga] = useState(true);
  const [vinagreta, setVinagreta] = useState(true);
  const [mode, setMode] = useState("bowl");

  useEffect(() => {
    fetch(`${API_URL}/api/tienda/estado`)
      .then((r) => r.json())
      .then((d) => setTiendaAbierta(d.abierto))
      .catch(() => setTiendaAbierta(false));
    fetch(`${API_URL}/api/tienda/productos`)
      .then((r) => r.json())
      .then((d) => setDesactivados(new Set(d.desactivados)))
      .catch(() => {});
  }, []);

  const toggleCat = (cat) => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  // Precio visual del bowl en construcción
  const previewPrice = calcBowlPrice(toppings, proteins, bev);

  // Totales visuales
  const bowlsTotal = bowls.reduce((s, b) => s + calcBowlPrice(b.tops, b.prots, b.bev), 0);
  const extrasTotal = ALL_EXTRAS.reduce((s, { name, price }) => {
    const qty = extraItems[name] || 0;
    const almondCost = (FRAPPES_NAMES.has(name) && frappesAlmond[name]) ? LECHE_ALMENDRAS * qty : 0;
    return s + qty * price + almondCost;
  }, 0);
  const grand = bowlsTotal + extrasTotal + DOM;

  const toggleTopping = (val) => {
    setToppings((prev) => {
      const count = prev.filter((t) => t === val).length;
      if (count === 0) return [...prev, val];
      if (count === 1) return [...prev, val];
      if (count === 2) return [...prev, val];
      return prev;
    });
  };

  const removeTopping = (val) => setToppings((prev) => prev.filter((t) => t !== val));

  const toggleProtein = (name) => {
    setProteins((prev) => {
      const count = prev.filter((x) => x === name).length;
      if (count === 0) return [...prev, name];
      if (count === 1) return [...prev, name];
      if (count === 2) return [...prev, name];
      return prev;
    });
  };

  const removeProtein = (name) => setProteins((prev) => prev.filter((x) => x !== name));

  const incExtra = (name) => setExtraItems((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  const decExtra = (name) => {
    setExtraItems((prev) => {
      const q = (prev[name] || 0) - 1;
      if (q <= 0) {
        if (FRAPPES_NAMES.has(name)) setFrappesAlmond(fa => { const n = { ...fa }; delete n[name]; return n; });
        const n = { ...prev }; delete n[name]; return n;
      }
      return { ...prev, [name]: q };
    });
  };

  const addBowl = () => {
    if (!carb) { alert("Elige un carbohidrato."); return; }
    if (!toppings.length) { alert("Elige al menos 1 topping."); return; }
    if (!proteins.length) { alert("Elige al menos una proteina."); return; }
    const newId = bid + 1;
    setBid(newId);
    setBowls((prev) => [
      ...prev,
      { id: newId, carb, tops: [...toppings], prots: [...proteins], bev: bev || null, lechuga, vinagreta },
    ]);
    setCarb("");
    setToppings([]);
    setProteins([]);
    setBev("");
  };

  const removeBowl = (id) => setBowls((prev) => prev.filter((b) => b.id !== id));

  const n = bowls.length;

  const hasExtras = Object.values(extraItems).some((q) => q > 0);

  const irAPago = () => {
    if (!n && !hasExtras) { alert("Agrega al menos un bowl o un producto adicional."); return; }
    try { localStorage.setItem("pepas_order", JSON.stringify({ bowls, extraItems, frappesAlmond })); } catch (_) {}
    navigate("/pago");
  };

  return (
    <>
      <style>{CSS}</style>

      <Navbar
        active="menu"
        position="sticky"
        showLinks={false}
        rightSlot={
          <div className="bowl-badge">
            <span className="dot"></span>
            <span id="bowl-count">{n} bowl{n !== 1 ? "s" : ""}</span>
          </div>
        }
      />

      {tiendaAbierta === null && (
        <div className="closed-screen">
          <div className="closed-icon">⏳</div>
          <h2 className="closed-title">Verificando disponibilidad…</h2>
        </div>
      )}

      {tiendaAbierta === false && (
        <div className="closed-screen">
          <div className="closed-badge"><span className="cd" /> Cerrado ahora</div>
          <div className="closed-icon"></div>
          <h2 className="closed-title">No estamos recibiendo pedidos</h2>
          <p className="closed-sub">
            En este momento la tienda está cerrada. Vuelve más tarde durante nuestro horario de servicio para armar tu bowl.
          </p>
          <button className="home-btn" style={{ fontSize: "1rem", padding: ".75rem 1.6rem", borderRadius: "12px", background: "var(--g800)", color: "#fff", border: "none" }} onClick={() => navigate("/")}>
            ← Volver al inicio
          </button>
        </div>
      )}

      {tiendaAbierta === true && (
      <div className="layout">
        {/* ── Left panel ── */}
        <div className="left-panel">

          <div className="mode-selector">
            <button className={`mode-btn${mode === "bowl" ? " active" : ""}`} onClick={() => setMode("bowl")}>Armar bowl</button>
            <button className={`mode-btn${mode === "extras" ? " active" : ""}`} onClick={() => setMode("extras")}>Solo adicionales</button>
          </div>

          {mode === "bowl" && <span className="sec-label">Incluye siempre</span>}
          {mode === "bowl" && (
          <div className="always-row">
            <div className={`tag-ck${lechuga ? "" : " off"}`} onClick={() => setLechuga((v) => !v)}>
              <span className="chk">{lechuga ? "✓" : ""}</span> Lechuga
            </div>
            <div className={`tag-ck${vinagreta ? "" : " off"}`} onClick={() => setVinagreta((v) => !v)}>
              <span className="chk">{vinagreta ? "✓" : ""}</span> Vinagreta
            </div>
          </div>
          )}

          {/* 1 · Carbohidrato */}
          {mode === "bowl" && <div className="sec-card">
            <div className="sec-head">
              <div className="sec-num">1</div>
              <div>
                <div className="sec-title">Carbohidrato</div>
                <div className="sec-hint">Elige una opción</div>
              </div>
            </div>
            <div className="pill-grid">
              {CARBOS.map((c) => {
                const dis = desactivados.has(c);
                return (
                  <label key={c} className={`pill${carb === c ? " sel" : ""}${dis ? " disabled" : ""}`} onClick={() => !dis && setCarb(c)}>
                    <span className="pk">{carb === c ? "✓" : ""}</span>
                    <span>{c}</span>
                    {dis && <span className="no-stock-tag">Sin stock</span>}
                  </label>
                );
              })}
            </div>
          </div>}

          {mode === "bowl" && <div className="sec-card">
            <div className="sec-head">
              <div className="sec-num">2</div>
              <div>
                <div className="sec-title">
                  Toppings{" "}
                  <span className={`cp${toppings.length > 4 ? " full" : ""}`}>
                    {toppings.length} {toppings.length > 4 ? `(+${toppings.length - 4} extra)` : "/4"}
                  </span>
                </div>
                <div className="sec-hint">4 incluidos · extras $3.000 · toca 2 o 3 veces para doble o triple</div>
              </div>
            </div>
            <div className="pill-grid">
              {TOPPINGS.map((t) => {
                const count = toppings.filter((x) => x === t).length;
                const sel = count > 0;
                const dis = desactivados.has(t);
                return (
                  <label
                    key={t}
                    className={`pill${sel ? " sel" : ""}${dis ? " disabled" : ""}`}
                    onClick={() => !dis && toggleTopping(t)}
                  >
                    <span className="pk">{count >= 2 ? count : (sel ? "✓" : "")}</span>
                    <span>{t}</span>
                    {count === 2 && <span style={{ fontSize: ".6rem", fontWeight: 700, background: "var(--gold)", color: "var(--g900)", borderRadius: "999px", padding: ".1rem .4rem", marginLeft: ".2rem" }}>×2</span>}
                    {count === 3 && <span style={{ fontSize: ".6rem", fontWeight: 700, background: "#f97316", color: "#fff", borderRadius: "999px", padding: ".1rem .4rem", marginLeft: ".2rem" }}>×3</span>}
                    {dis && <span className="no-stock-tag">Sin stock</span>}
                    {sel && !dis && (
                      <span className="pill-remove" onClick={(e) => { e.stopPropagation(); removeTopping(t); }} title="Quitar">✕</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>}

          {mode === "bowl" && <div className="sec-card">
            <div className="sec-head">
              <div className="sec-num">3</div>
              <div>
                <div className="sec-title">Proteina</div>
                <div className="sec-hint">Una o más · toca 2 o 3 veces para doble o triple porción</div>
              </div>
            </div>
            <div className="pgrid">
              {PROTEINAS.map(({ name, price }) => {
                const count = proteins.filter((x) => x === name).length;
                const sel = count > 0;
                const dis = desactivados.has(name);
                return (
                  <div key={name} className={`pc${sel ? " sel" : ""}${dis ? " disabled" : ""}`} onClick={() => !dis && toggleProtein(name)}>
                    {sel && !dis && (
                      <button className="pc-remove" onClick={(e) => { e.stopPropagation(); removeProtein(name); }} title="Quitar">✕</button>
                    )}
                    <span className="pn">{name}{count === 2 ? " ×2" : count === 3 ? " ×3" : ""}</span>
                    {dis
                      ? <span className="no-stock-tag" style={{ marginTop: ".2rem", alignSelf: "flex-start" }}>Sin stock</span>
                      : <span className="pp">{fmt(price * (count || 1))}</span>}
                  </div>
                );
              })}
            </div>
          </div>}

          {mode === "bowl" && <div className="sec-card">
            <div className="sec-head">
              <div className="sec-num">4</div>
              <div>
                <div className="sec-title">Bebida</div>
                <div className="sec-hint">Opcional · +$1.000 por vaso</div>
              </div>
            </div>
            <div className="pill-grid">
              {[...BEBIDAS, ""].map((b, i) => {
                const dis = b !== "" && desactivados.has(b);
                return (
                  <label key={i} className={`pill${bev === b ? " sel" : ""}${dis ? " disabled" : ""}`} onClick={() => !dis && setBev(b)}>
                    <span className="pk">{bev === b ? "✓" : ""}</span>
                    <span>{b || "Sin bebida"}</span>
                    {dis && <span className="no-stock-tag">Sin stock</span>}
                  </label>
                );
              })}
            </div>
          </div>}

          {/* 5 · Productos adicionales */}
          <div className="sec-card">
            <div className="sec-head">
              <div className="sec-num">5</div>
              <div>
                <div className="sec-title">Productos adicionales</div>
                <div className="sec-hint">Opcional · Toca una categoría para desplegar</div>
              </div>
            </div>
            {CAFETERIA.map(({ cat, items, note }) => {
              const open = !!openCats[cat];
              const catQty = items.reduce((s, it) => s + (extraItems[it.name] || 0), 0);
              return (
                <div key={cat}>
                  <div className={`acc-head${open ? " open" : ""}`} onClick={() => toggleCat(cat)}>
                    <span className="acc-label">
                      {cat}
                      {catQty > 0 && <span className="acc-badge">{catQty}</span>}
                    </span>
                    <span className={`acc-arrow${open ? " open" : ""}`}>▼</span>
                  </div>
                  {open && (
                    <div className="acc-body">
                      {note && (
                        <div style={{ background: "#fdf0ff", border: "1.5px solid #d8b4fe", borderRadius: "8px", padding: ".5rem .75rem", marginBottom: ".6rem", fontSize: ".75rem", color: "#6b21a8", fontWeight: 600 }}>
                          ⚠️ {note}
                        </div>
                      )}
                      <div className="cafgrid">
                        {items.map(({ name, price, desc }) => {
                          const qty = extraItems[name] || 0;
                          const dis = desactivados.has(name);
                          return (
                            <div key={name} className={`caf-item${qty > 0 ? " sel" : ""}${dis ? " disabled" : ""}`}>
                              <span className="caf-name">{name}</span>
                              {desc && <span className="caf-desc">{desc}</span>}
                              {dis
                                ? <span className="no-stock-tag" style={{ alignSelf: "flex-start" }}>Sin stock</span>
                                : <>
                                    <span className="caf-price">{fmt(price)}{FRAPPES_NAMES.has(name) && frappesAlmond[name] ? " +$2.500" : ""}</span>
                                    <div className="qt-row">
                                      <button className="qt-btn" onClick={() => decExtra(name)}>−</button>
                                      <span className="qt-val">{qty}</span>
                                      <button className="qt-btn" onClick={() => incExtra(name)}>+</button>
                                    </div>
                                    {FRAPPES_NAMES.has(name) && qty > 0 && (
                                      <label
                                        style={{ display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer", marginTop: ".4rem", fontSize: ".7rem", fontWeight: 600, color: "#6b21a8", userSelect: "none" }}
                                        onClick={(e) => { e.stopPropagation(); setFrappesAlmond(prev => ({ ...prev, [name]: !prev[name] })); }}
                                      >
                                        <span style={{ width: "14px", height: "14px", borderRadius: "3px", border: "1.5px solid #6b21a8", display: "flex", alignItems: "center", justifyContent: "center", background: frappesAlmond[name] ? "#6b21a8" : "transparent", color: "#fff", fontSize: ".6rem", flexShrink: 0 }}>
                                          {frappesAlmond[name] ? "✓" : ""}
                                        </span>
                                        Leche almendras +$2.500
                                      </label>
                                    )}
                                  </>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {mode === "bowl" && (
          <div className="add-wrap">
            <button className="add-btn" onClick={addBowl}>
              <span className="plus-ic">+</span> Agregar bowl
              {proteins.length > 0 && <span style={{ marginLeft: ".5rem", fontSize: ".82rem", opacity: .85 }}>· {fmt(previewPrice)}</span>}
            </button>
          </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="rp">
          <div className="rt">
            <div>
              <h3>Tu pedido</h3>
              <div className="sub">
                {n > 0 && <>{n} bowl{n !== 1 ? "s" : ""}{hasExtras ? " + adicionales" : ""}</>}
                {n === 0 && hasExtras && <>Solo productos adicionales</>}
                {n === 0 && !hasExtras && <>Aún vacío</>}
              </div>
            </div>
            <span style={{ color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem" }}>···</span>
          </div>

          <div className="olist">
            {!n && !hasExtras ? (
              <p style={{ color: "var(--muted)", fontSize: ".82rem", textAlign: "center", padding: "2rem 0" }}>
                Agrega un bowl o un producto adicional 🥗
              </p>
            ) : n > 0 ? (
              <>
                {bowls.map((b, i) => (
                  <div key={b.id} className="bc">
                    <span className="bn">Bowl {i + 1}</span>
                    <button className="bclose" onClick={() => removeBowl(b.id)}>✕</button>
                    <div className="bcarb">{b.carb}</div>
                    <div className="btags">
                      {(() => { const m = {}; b.tops.forEach(t => m[t] = (m[t]||0)+1); return Object.entries(m).map(([t,c]) => <span key={t} className="bt">{t}{c>1?" ×2":""}</span>); })()}
                      {(() => { const m = {}; b.prots.forEach(p => m[p] = (m[p]||0)+1); return Object.entries(m).map(([p,c]) => <span key={p} className="bt p">{p}{c>1?" ×2":""}</span>); })()}
                      {b.bev && <span className="bt b">{b.bev}</span>}
                    </div>
                    <div style={{ fontSize: ".7rem", color: "var(--muted)", marginBottom: ".3rem" }}>Caja +$1.000{b.bev ? " · Vaso +$1.000" : ""}</div>
                    <div className="bprice">{fmt(calcBowlPrice(b.tops, b.prots, b.bev))}</div>
                  </div>
                ))}
                <button className="cbtn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  + Crear otro bowl
                </button>
              </>
            ) : null}
            {Object.keys(extraItems).some((k) => extraItems[k] > 0) && (
              <div className="bc">
                <span className="bn" style={{ background: "#6b21a8" }}>Adicionales</span>
                <div className="bcarb" style={{ marginTop: ".3rem" }}>Productos adicionales</div>
                <div className="btags">
                  {ALL_EXTRAS.filter(({ name }) => (extraItems[name] || 0) > 0).map(({ name }) => (
                    <span key={name} className="bt caf">{name} ×{extraItems[name]}{FRAPPES_NAMES.has(name) && frappesAlmond[name] ? " · almendras" : ""}</span>
                  ))}
                </div>
                <div className="bprice">{fmt(extrasTotal)}</div>
              </div>
            )}
          </div>

          <div className="rf">
            {n > 0 && (
              <div className="pr">
                <span>{n} bowl{n !== 1 ? "s" : ""}</span>
                <span>{fmt(bowlsTotal)}</span>
              </div>
            )}
            {extrasTotal > 0 && (
              <div className="pr">
                <span>Productos</span>
                <span>{fmt(extrasTotal)}</span>
              </div>
            )}
            <div className="pr">
              <span>Domicilio (centro)</span>
              <span>{fmt(DOM)}</span>
            </div>
            <div className="pr tot">
              <span>Total estimado</span>
              <span>{(n || hasExtras) ? fmt(grand) : "—"}</span>
            </div>
            <button className="abowl-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              + Agregar bowl
            </button>
            <button className="cfbtn" onClick={irAPago}>Confirmar pedido</button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
