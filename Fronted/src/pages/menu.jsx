import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from "../components/MenuIcons";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";
import { MENU, ALL_EXTRAS, DOM } from "../data/menuData";

const fmt = (n) => "$" + n.toLocaleString("es-CO");
const slug = (s) => "cat-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--red:#fe2b24;--red-d:#c81812;--yel:#fbba24;--bg:#140c0a;--card:#261715;--card2:#301c19;--line:#4a302b;--txt:#fbf1e3;--mut:#d9c3b0;}
.mn{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;}
.mn *{box-sizing:border-box;}
.mn-hero{max-width:1200px;margin:0 auto;padding:2rem 1.25rem 1rem;}
.mn-hero h1{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:800;line-height:1.1;}
.mn-hero h1 span{color:var(--yel);}
.mn-hero p{color:var(--mut);margin-top:.4rem;font-size:.95rem;}
.mn-tabs{position:sticky;top:0;z-index:60;background:rgba(20,12,10,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);}
.mn-tabs-in{max-width:1200px;margin:0 auto;padding:.7rem 1.25rem;display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;}
.mn-tabs-in::-webkit-scrollbar{display:none;}
@media(min-width:960px){.mn-tabs-in{flex-wrap:wrap;overflow:visible;}}
.mn-tab{display:flex;align-items:center;gap:.45rem;flex-shrink:0;border:1.5px solid var(--line);background:transparent;color:var(--mut);border-radius:999px;padding:.45rem .95rem;font:600 .85rem 'Plus Jakarta Sans',sans-serif;cursor:pointer;white-space:nowrap;transition:all .15s;}
.mn-tab:hover{color:var(--txt);border-color:var(--mut);}
.mn-tab.on{background:var(--yel);border-color:var(--yel);color:#2a1204;}
.mn-wrap{max-width:1200px;margin:0 auto;padding:1rem 1.25rem 7rem;display:grid;grid-template-columns:minmax(0,1fr);gap:2rem;}
@media(min-width:960px){.mn-wrap{grid-template-columns:minmax(0,1fr) 340px;padding-bottom:3rem;}}
.mn-sec{scroll-margin-top:80px;margin-bottom:2.2rem;}
@media(min-width:960px){.mn-sec{scroll-margin-top:130px;}}
.mn-sec h2{font-size:1.35rem;font-weight:800;display:flex;align-items:center;gap:.6rem;margin-bottom:.35rem;color:var(--txt);}
.mn-sec h2 svg{color:var(--yel);}
.mn-note{color:var(--yel);font-size:.82rem;font-weight:600;margin-bottom:.8rem;}
.mn-grid{display:grid;grid-template-columns:1fr;gap:.75rem;margin-top:.8rem;}
@media(min-width:620px){.mn-grid{grid-template-columns:1fr 1fr;}}
.mn-item{background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:1rem;display:flex;flex-direction:column;gap:.5rem;transition:border-color .15s;}
.mn-item.sel{border-color:var(--yel);}
.mn-item.off{opacity:.5;}
.mn-name{font-weight:700;font-size:1rem;line-height:1.25;}
.mn-desc{color:var(--mut);font-size:.8rem;line-height:1.5;flex:1;}
.mn-foot{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-top:auto;padding-top:.3rem;}
.mn-price{color:var(--yel);font-weight:800;font-size:1.05rem;}
.mn-add{background:var(--red);color:#fff;border:none;border-radius:999px;padding:.5rem 1.1rem;font:700 .85rem 'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:background .15s;}
.mn-add:hover{background:var(--red-d);}
.mn-step{display:flex;align-items:center;background:var(--card2);border-radius:999px;border:1.5px solid var(--yel);}
.mn-step button{width:34px;height:34px;border:none;background:transparent;color:var(--yel);font-size:1.2rem;font-weight:700;cursor:pointer;border-radius:50%;}
.mn-step span{min-width:1.4rem;text-align:center;font-weight:800;font-size:.9rem;}
.mn-out{font-size:.72rem;font-weight:700;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:.3rem .7rem;}
.mn-cart{background:var(--card);border:1.5px solid var(--line);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;}
.mn-aside{display:none;}
@media(min-width:960px){.mn-aside{display:block;position:sticky;top:130px;align-self:start;}}
.mn-cart h3{font-size:1.05rem;font-weight:800;padding:1rem 1.2rem;border-bottom:1px solid var(--line);}
.mn-lines{padding:.5rem 1.2rem;max-height:46vh;overflow-y:auto;}
.mn-empty{color:var(--mut);font-size:.88rem;text-align:center;padding:1.8rem 0;}
.mn-line{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.65rem 0;border-bottom:1px solid var(--line);}
.mn-line:last-child{border-bottom:none;}
.mn-line-n{font-size:.88rem;font-weight:600;line-height:1.25;}
.mn-line-p{color:var(--mut);font-size:.78rem;margin-top:.1rem;}
.mn-line .mn-step button{width:28px;height:28px;font-size:1rem;}
.mn-tot{padding:1rem 1.2rem;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:.35rem;}
.mn-row{display:flex;justify-content:space-between;font-size:.85rem;color:var(--mut);}
.mn-row.big{color:var(--txt);font-size:1.05rem;font-weight:800;margin-top:.2rem;}
.mn-go{margin-top:.6rem;width:100%;background:var(--red);color:#fff;border:none;border-radius:12px;padding:.85rem;font:800 .95rem 'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:background .15s;}
.mn-go:hover{background:var(--red-d);}
.mn-go:disabled{background:var(--line);color:var(--mut);cursor:not-allowed;}
.mn-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;padding:.75rem 1rem calc(.75rem + env(safe-area-inset-bottom));background:linear-gradient(transparent,var(--bg) 35%);}
@media(min-width:960px){.mn-bar{display:none;}}
.mn-bar button{width:100%;background:var(--red);color:#fff;border:none;border-radius:14px;padding:.95rem 1.1rem;font:800 .95rem 'Plus Jakarta Sans',sans-serif;display:flex;justify-content:space-between;align-items:center;cursor:pointer;box-shadow:0 6px 24px rgba(254,43,36,.45);}
.mn-sheet-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:50;display:flex;align-items:flex-end;}
.mn-sheet{width:100%;max-height:85vh;overflow-y:auto;border-radius:20px 20px 0 0;}
.mn-sheet .mn-cart{border-radius:20px 20px 0 0;border-bottom:none;}
.mn-sheet .mn-lines{max-height:40vh;}
.mn-close{float:right;background:none;border:none;color:var(--mut);font-size:1.2rem;cursor:pointer;}
.mn-closed{max-width:480px;margin:0 auto;text-align:center;padding:5rem 1.5rem;}
.mn-closed h2{font-size:1.5rem;font-weight:800;margin:.6rem 0;}
.mn-closed p{color:var(--mut);margin-bottom:1.4rem;}
`;

export default function Menu() {
  const navigate = useNavigate();
  const [tiendaAbierta, setTiendaAbierta] = useState(null);
  const [desactivados, setDesactivados] = useState(new Set());
  const [extraItems, setExtraItems] = useState({});
  const [activeCat, setActiveCat] = useState(null);
  const [sheet, setSheet] = useState(false);
  const clickLock = useRef(false);

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

  // Resalta la categoría visible al hacer scroll; sin selección al inicio.
  // La barra de categorías se pega arriba del todo (el navbar rojo no es sticky: .glass-nav fuerza position:relative).
  useEffect(() => {
    if (tiendaAbierta !== true) return;
    const io = new IntersectionObserver((entries) => {
      if (clickLock.current) return;
      if (window.scrollY < 120) { setActiveCat(null); return; }
      const vis = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
      if (vis) setActiveCat(vis.target.dataset.cat);
    }, { rootMargin: "-80px 0px -60% 0px" });
    document.querySelectorAll(".mn-sec").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tiendaAbierta]);

  const goCat = (cat) => {
    setActiveCat(cat);
    clickLock.current = true;
    document.getElementById(slug(cat))?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { clickLock.current = false; }, 800);
    document.querySelector(".mn-tab.on")?.scrollIntoView({ inline: "center", block: "nearest" });
  };

  const setQty = (name, delta) => setExtraItems((prev) => {
    const q = (prev[name] || 0) + delta;
    if (q <= 0) { const n = { ...prev }; delete n[name]; return n; }
    return { ...prev, [name]: q };
  });

  const lines = ALL_EXTRAS.filter(({ name }) => extraItems[name] > 0);
  const totalQty = lines.reduce((s, { name }) => s + extraItems[name], 0);
  const extrasTotal = lines.reduce((s, { name, price }) => s + extraItems[name] * price, 0);

  const irAPago = () => {
    if (!totalQty) return;
    try { localStorage.setItem("pepas_order", JSON.stringify({ bowls: [], extraItems })); } catch { /* sin storage */ }
    navigate("/pago");
  };

  const cart = (
    <div className="mn-cart">
      <h3>
        Tu pedido
        {sheet && <button className="mn-close" onClick={() => setSheet(false)} aria-label="Cerrar">✕</button>}
      </h3>
      <div className="mn-lines">
        {!lines.length && <p className="mn-empty">Aún no has agregado nada. Toca "Agregar" en cualquier producto.</p>}
        {lines.map(({ name, price }) => (
          <div key={name} className="mn-line">
            <div>
              <div className="mn-line-n">{name}</div>
              <div className="mn-line-p">{fmt(price * extraItems[name])}</div>
            </div>
            <div className="mn-step">
              <button onClick={() => setQty(name, -1)} aria-label={`Quitar ${name}`}>−</button>
              <span>{extraItems[name]}</span>
              <button onClick={() => setQty(name, 1)} aria-label={`Agregar ${name}`}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mn-tot">
        <div className="mn-row"><span>Productos</span><span>{fmt(extrasTotal)}</span></div>
        <div className="mn-row"><span>Domicilio (centro)</span><span>{fmt(DOM)}</span></div>
        <div className="mn-row big"><span>Total estimado</span><span>{totalQty ? fmt(extrasTotal + DOM) : "—"}</span></div>
        <button className="mn-go" disabled={!totalQty} onClick={irAPago}>Confirmar pedido</button>
      </div>
    </div>
  );

  return (
    <div className="mn">
      <style>{CSS}</style>
      <Navbar active="menu" position="sticky" showLinks={false} />

      {tiendaAbierta === null && (
        <div className="mn-closed"><h2>Verificando disponibilidad…</h2></div>
      )}

      {tiendaAbierta === false && (
        <div className="mn-closed">
          
          <h2>No estamos recibiendo pedidos</h2>
          <p>En este momento la tienda está cerrada. Vuelve más tarde durante nuestro horario de servicio.</p>
          <button className="mn-add" onClick={() => navigate("/")}>← Volver al inicio</button>
        </div>
      )}

      {tiendaAbierta === true && (
        <>
          <header className="mn-hero">
            <h1>Nuestro <span>menú</span></h1>
            <p>Elige lo que se te antoje, compa. Te lo llevamos o lo recoges.</p>
          </header>

          <nav className="mn-tabs" aria-label="Categorías">
            <div className="mn-tabs-in">
              {MENU.map(({ cat }) => (
                <button key={cat} className={`mn-tab${activeCat === cat ? " on" : ""}`} onClick={() => goCat(cat)}>
                  <MenuIcon cat={cat} size={18} /> {cat}
                </button>
              ))}
            </div>
          </nav>

          <div className="mn-wrap">
            <main>
              {MENU.map(({ cat, note, items }) => (
                <section key={cat} id={slug(cat)} data-cat={cat} className="mn-sec">
                  <h2><MenuIcon cat={cat} size={26} />{cat}</h2>
                  {note && <div className="mn-note">{note}</div>}
                  <div className="mn-grid">
                    {items.map(({ name, price, desc }) => {
                      const qty = extraItems[name] || 0;
                      const off = desactivados.has(name);
                      return (
                        <article key={name} className={`mn-item${qty ? " sel" : ""}${off ? " off" : ""}`}>
                          <div className="mn-name">{name}</div>
                          {desc && <p className="mn-desc">{desc}</p>}
                          <div className="mn-foot">
                            <span className="mn-price">{fmt(price)}</span>
                            {off ? <span className="mn-out">Agotado</span>
                              : qty ? (
                                <div className="mn-step">
                                  <button onClick={() => setQty(name, -1)} aria-label={`Quitar ${name}`}>−</button>
                                  <span>{qty}</span>
                                  <button onClick={() => setQty(name, 1)} aria-label={`Agregar ${name}`}>+</button>
                                </div>
                              ) : <button className="mn-add" onClick={() => setQty(name, 1)}>Agregar</button>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </main>
            <aside className="mn-aside">{cart}</aside>
          </div>

          {totalQty > 0 && (
            <div className="mn-bar">
              <button onClick={() => setSheet(true)}>
                <span>Ver pedido · {totalQty} producto{totalQty !== 1 ? "s" : ""}</span>
                <span>{fmt(extrasTotal)}</span>
              </button>
            </div>
          )}

          {sheet && (
            <div className="mn-sheet-bg" onClick={() => setSheet(false)}>
              <div className="mn-sheet" onClick={(e) => e.stopPropagation()}>{cart}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
