import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const fmt = (n) => "$" + n.toLocaleString("es-CO");

const fmtHora = (d) =>
  new Date(d).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

const initials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const statusLabel = (s, estadoPago) => {
  // Un pedido "cancelado" por pago rechazado no es lo mismo que uno cancelado manualmente por el staff
  if (s === "cancelado" && (estadoPago === "rechazado" || estadoPago === "error")) return "Rechazado";
  return { nuevo: "Nuevo", preparando: "Preparando", camino: "En camino", entregado: "Entregado", cancelado: "Cancelado" }[s] || s;
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--g900:#1a2e1b;--g800:#2D4A2F;--g700:#3a5e3c;--g600:#4A7C59;--g400:#7ab87a;--g200:#d4ead4;--g100:#edf7ed;--gold:#c8a84b;--cream:#f5f3ef;--border:#e2ddd6;--text:#1a2e1b;--muted:#6b7a6b;
  --status-nuevo:#2D4A2F;--status-nuevo-bg:#edf7ed;
  --status-prep:#92400e;--status-prep-bg:#fef3c7;
  --status-camino:#1e40af;--status-camino-bg:#dbeafe;
  --status-entregado:#374151;--status-entregado-bg:#f3f4f6;
  --status-cancelado:#991b1b;--status-cancelado-bg:#fee2e2;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--cream);color:var(--text);min-height:100vh;}
.topnav{background:var(--g800);display:flex;align-items:center;justify-content:space-between;padding:.85rem .75rem;position:sticky;top:0;z-index:50;}
.brand-wrap{display:flex;align-items:center;gap:.75rem;}
.brand-name{font-size:1.35rem;font-weight:800;color:#fff;letter-spacing:-.5px;}
.brand-sub{font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--g400);margin-top:.1rem;}
.admin-badge{background:var(--gold);color:var(--g900);border-radius:999px;font-size:.72rem;font-weight:700;padding:.25rem .75rem;letter-spacing:.03em;}
.nav-right{display:flex;align-items:center;gap:.8rem;}
.live-dot{display:flex;align-items:center;gap:.4rem;color:var(--g400);font-size:.75rem;font-weight:600;}
.live-dot span{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
.stats-bar{background:#fff;border-bottom:1px solid var(--border);padding:.8rem .75rem;display:flex;gap:1.5rem;overflow-x:auto;}
.stat{display:flex;flex-direction:column;align-items:center;min-width:80px;}
.stat-num{font-size:1.5rem;font-weight:800;color:var(--g800);line-height:1;}
.stat-lbl{font-size:.62rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:.2rem;}
.stat-sep{width:1px;background:var(--border);align-self:stretch;}
.toolbar{display:flex;align-items:center;justify-content:space-between;padding:.9rem .75rem;gap:.75rem;flex-wrap:wrap;}
.filter-tabs{display:flex;gap:.4rem;flex-wrap:wrap;}
.ftab{border:1.5px solid var(--border);background:#fff;border-radius:999px;padding:.3rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--muted);transition:all .15s;}
.ftab:hover{border-color:var(--g400);}
.ftab.active{background:var(--g800);color:#fff;border-color:var(--g800);}
.btn-print{background:#fff;border:1.5px solid var(--border);color:var(--muted);border-radius:8px;padding:.35rem .65rem;font-size:.78rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.3rem;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif;}
.btn-print:hover{border-color:var(--g600);color:var(--g800);}
.toolbar-right{display:flex;gap:.6rem;align-items:center;}
.search-wrap{position:relative;}
.search-wrap input{border:1.5px solid var(--border);border-radius:999px;padding:.35rem 1rem .35rem 3.8rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;color:var(--text);outline:none;width:220px;background:#fff;transition:border-color .15s;}
.search-wrap input:focus{border-color:var(--g600);}
.search-wrap .si{position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:var(--muted);font-size:.72rem;font-weight:600;pointer-events:none;}
.orders-wrap{padding:0 .75rem 3rem;max-width:100%;width:100%;}
.orders-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.75rem;}
.order-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05);transition:box-shadow .15s;}
.order-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);}
.oc-head{background:var(--g800);padding:.85rem 1.1rem;display:flex;align-items:center;justify-content:space-between;}
.oc-num{color:#fff;font-size:.95rem;font-weight:800;letter-spacing:-.3px;}
.oc-body{padding:1rem 1.1rem;}
.oc-client{display:flex;align-items:center;gap:.5rem;margin-bottom:.85rem;}
.avatar{width:34px;height:34px;border-radius:50%;background:var(--g200);display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:800;color:var(--g800);flex-shrink:0;}
.client-name{font-size:.9rem;font-weight:700;}
.client-phone{font-size:.72rem;color:var(--muted);}
.oc-section-lbl{font-size:.6rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:.45rem;display:block;}
.bowl-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.85rem;}
.bowl-item{background:var(--g100);border-radius:10px;padding:.6rem .8rem;}
.bowl-item-title{font-size:.82rem;font-weight:700;color:var(--g800);margin-bottom:.25rem;}
.bowl-tags{display:flex;flex-wrap:wrap;gap:.25rem;}
.btag{border-radius:5px;font-size:.65rem;font-weight:600;padding:.1rem .38rem;}
.btag.topping{background:#fff;border:1px solid var(--border);color:var(--text);}
.btag.prot{background:#fff3e0;color:#b45309;}
.btag.bev{background:#e8f0fe;color:#3730a3;}
.btag.caf{background:#fdf0ff;color:#6b21a8;}
.btag.inc{background:#d4ead4;color:#2D4A2F;font-weight:700;}
.btag.carbo{background:#e8f5e9;border:1.5px solid #4A7C59;color:#2D4A2F;font-weight:700;}
.addr-row{display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.85rem;}
.addr-icon{font-size:.95rem;flex-shrink:0;margin-top:.05rem;}
.addr-text{font-size:.8rem;color:var(--text);line-height:1.5;}
.addr-ref{font-size:.72rem;color:var(--muted);}
.oc-footer{border-top:1px solid var(--border);padding:.75rem 1.1rem;display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap;}
.price-total{font-size:1rem;font-weight:800;color:var(--g800);}
.price-sub{font-size:.68rem;color:var(--muted);font-weight:500;}
.footer-actions{display:flex;align-items:center;gap:.5rem;}
.status-badge{border-radius:999px;font-size:.68rem;font-weight:700;padding:.22rem .7rem;display:inline-flex;align-items:center;gap:.3rem;white-space:nowrap;}
.status-badge.nuevo{background:var(--status-nuevo-bg);color:var(--status-nuevo);}
.status-badge.preparando{background:var(--status-prep-bg);color:var(--status-prep);}
.status-badge.camino{background:var(--status-camino-bg);color:var(--status-camino);}
.status-badge.entregado{background:var(--status-entregado-bg);color:var(--status-entregado);}
.status-badge.cancelado{background:var(--status-cancelado-bg);color:var(--status-cancelado);}
.status-select{border:1.5px solid var(--border);border-radius:8px;padding:.28rem .55rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:600;cursor:pointer;color:var(--text);background:#fff;outline:none;transition:border-color .15s;}
.status-select:focus{border-color:var(--g600);}
.action-btn{border:none;border-radius:8px;padding:.3rem .7rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:.3rem;}
.btn-wa{background:#25D366;color:#fff;}
.btn-wa:hover{background:#1fb356;}
.btn-del{background:#fee2e2;color:#991b1b;}
.btn-del:hover{background:#fca5a5;}
.btn-advance{background:var(--g600);color:#fff;}
.btn-advance:hover{background:var(--g700);}
.btn-cancel{background:#fee2e2;color:#991b1b;}
.btn-cancel:hover{background:#fca5a5;}
.done-text{font-size:.75rem;font-weight:700;color:var(--muted);padding:.3rem 0;}
.pay-tag{display:inline-flex;align-items:center;gap:.3rem;background:#f5f3ef;border:1px solid var(--border);border-radius:6px;font-size:.68rem;font-weight:600;color:var(--muted);padding:.15rem .5rem;}
.empty-state{text-align:center;padding:4rem 1rem;color:var(--muted);}
.empty-state .ei{font-size:1.8rem;margin-bottom:.75rem;color:var(--muted);font-weight:800;}
.empty-state p{font-size:.9rem;}
.order-seq{background:var(--gold);color:var(--g900);border-radius:999px;font-size:.65rem;font-weight:800;padding:.1rem .5rem;margin-left:.4rem;}
.btn-historial{border:1.5px solid var(--g400);background:transparent;color:#fff;border-radius:999px;padding:.3rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:.02em;}
.btn-historial:hover{background:var(--g400);color:var(--g900);}
.btn-historial.active{background:var(--gold);color:var(--g900);border-color:var(--gold);}
.btn-logout{border:1.5px solid #f87171;background:transparent;color:#fca5a5;border-radius:999px;padding:.3rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;}
.btn-logout:hover{background:#991b1b;color:#fff;border-color:#991b1b;}
.caja-btn{display:flex;align-items:center;gap:.45rem;border:none;border-radius:999px;padding:.35rem .95rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .18s;line-height:1;}
.caja-btn.abierta{background:#4ade80;color:#14532d;}
.caja-btn.abierta:hover{background:#22c55e;}
.caja-btn.cerrada{background:#fee2e2;color:#991b1b;}
.caja-btn.cerrada:hover{background:#fca5a5;}
.caja-btn:disabled{opacity:.55;cursor:not-allowed;}
.caja-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.caja-btn.abierta .caja-dot{background:#14532d;}
.caja-btn.cerrada .caja-dot{background:#991b1b;}
.hist-toolbar{display:flex;align-items:center;justify-content:space-between;padding:.9rem .75rem;gap:.75rem;flex-wrap:wrap;background:#fff;border-bottom:1px solid var(--border);}
.hist-toolbar-left{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;}
.hist-toolbar-left label{font-size:.78rem;font-weight:600;color:var(--muted);}
.hist-toolbar-left input[type=date]{border:1.5px solid var(--border);border-radius:8px;padding:.3rem .6rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.78rem;font-weight:600;color:var(--text);background:#fff;outline:none;}
.hist-toolbar-left input[type=date]:focus{border-color:var(--g600);}
.hist-summary{display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap;}
.hist-stat{font-size:.82rem;font-weight:700;color:var(--g800);}
.hist-stat span{font-weight:500;color:var(--muted);font-size:.72rem;}
.hist-date-group{margin-bottom:1.5rem;}
.hist-date-label{font-size:.75rem;font-weight:700;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;padding:.5rem 0;border-bottom:1px solid var(--border);margin-bottom:.75rem;}
/* ─── MENÚ HAMBURGUESA MÓVIL ─── */
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:.4rem;}
.hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .2s;}
.mobile-menu{display:none;}
@media(max-width:768px){
  .hamburger{display:flex;}
  .nav-right{display:none !important;}
  .mobile-menu{
    display:block;
    position:fixed;top:0;right:0;bottom:0;width:75vw;max-width:280px;
    background:var(--g900);z-index:200;
    transform:translateX(100%);transition:transform .25s ease;
    padding:1.2rem 1rem;
    overflow-y:auto;
  }
  .mobile-menu.open{transform:translateX(0);}
  .mobile-menu-overlay{
    display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:199;
  }
  .mobile-menu-overlay.open{display:block;}
  .mobile-menu-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;}
  .mobile-menu-header .brand-name{color:#fff;font-size:1.1rem;}
  .btn-close-menu{background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;padding:.2rem;}
  .mobile-nav-btn{
    display:block;width:100%;text-align:left;
    background:rgba(255,255,255,.07);border:none;border-radius:10px;
    color:#fff;font-family:'Plus Jakarta Sans',sans-serif;
    font-size:.88rem;font-weight:600;padding:.7rem 1rem;
    margin-bottom:.5rem;cursor:pointer;transition:background .15s;
  }
  .mobile-nav-btn:hover,.mobile-nav-btn.active{background:rgba(255,255,255,.15);}
  .mobile-nav-btn.danger{color:#fca5a5;}
  .mobile-caja-btn{
    display:flex;align-items:center;gap:.5rem;width:100%;
    border:none;border-radius:10px;padding:.7rem 1rem;
    font-family:'Plus Jakarta Sans',sans-serif;font-size:.88rem;font-weight:700;
    cursor:pointer;margin-bottom:.5rem;
  }
  .mobile-caja-btn.abierta{background:#4ade80;color:#14532d;}
  .mobile-caja-btn.cerrada{background:#fee2e2;color:#991b1b;}
  .mobile-live{display:flex;align-items:center;gap:.4rem;color:var(--g400);font-size:.78rem;font-weight:600;padding:.5rem 0;}
  .mobile-live span{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pulse 1.5s infinite;}
  .topnav{padding:.6rem .7rem;gap:.4rem;}
  .brand-name{font-size:1rem;}
  .brand-sub{display:none;}
  .brand-wrap{gap:.45rem;}
  .admin-badge{font-size:.58rem;padding:.15rem .45rem;}
  .nav-right{gap:.5rem;}
  .live-dot{font-size:.65rem;gap:.3rem;}
  .live-dot span{width:6px;height:6px;}

  .stats-bar{padding:.55rem .5rem;gap:0;justify-content:space-around;}
  .stat{min-width:0;flex:1;}
  .stat-num{font-size:1.05rem;}
  .stat-lbl{font-size:.5rem;letter-spacing:.05em;}
  .stat-sep{display:none;}

  .toolbar{padding:.5rem;flex-direction:column;align-items:stretch;gap:.5rem;}
  .filter-tabs{display:flex;overflow-x:auto;flex-wrap:nowrap;gap:0;padding:0;background:#fff;border:1.5px solid var(--border);border-radius:10px;-webkit-overflow-scrolling:touch;}
  .filter-tabs::-webkit-scrollbar{display:none;}
  .ftab{flex:1;min-width:0;font-size:.68rem;padding:.5rem .1rem;white-space:nowrap;border:none;border-radius:0;text-align:center;border-right:1px solid var(--border);}
  .ftab:first-child{border-radius:8px 0 0 8px;}
  .ftab:last-child{border-radius:0 8px 8px 0;border-right:none;}
  .ftab.active{border-radius:8px;margin:-1px;border:none;}
  .toolbar-right{width:100%;}
  .search-wrap{width:100%;}
  .search-wrap input{width:100%;padding-left:3.2rem;font-size:.78rem;}
  .search-wrap .si{font-size:.65rem;left:.7rem;}

  .orders-wrap{padding:0 .4rem 1.5rem;}
  .orders-grid{grid-template-columns:1fr;gap:.6rem;}

  .order-card{border-radius:12px;}
  .oc-head{padding:.6rem .7rem;}
  .oc-num{font-size:.8rem;}
  .order-seq{font-size:.58rem;padding:.08rem .4rem;}
  .status-badge{font-size:.6rem;padding:.18rem .5rem;}

  .oc-body{padding:.7rem .7rem;}
  .oc-client{margin-bottom:.6rem;gap:.4rem;}
  .avatar{width:30px;height:30px;font-size:.75rem;}
  .client-name{font-size:.82rem;}
  .client-phone{font-size:.65rem;}
  .oc-section-lbl{font-size:.55rem;margin-bottom:.3rem;}

  .bowl-list{gap:.4rem;margin-bottom:.6rem;}
  .bowl-item{padding:.45rem .6rem;border-radius:8px;}
  .bowl-item-title{font-size:.75rem;margin-bottom:.2rem;}
  .bowl-tags{gap:.2rem;}
  .btag{font-size:.58rem;padding:.08rem .3rem;border-radius:4px;}

  .addr-row{gap:.35rem;margin-bottom:.6rem;}
  .addr-text{font-size:.72rem;}
  .addr-ref{font-size:.65rem;}
  .pay-tag{font-size:.6rem;padding:.1rem .4rem;}

  .oc-footer{padding:.55rem .7rem;flex-direction:column;align-items:stretch;gap:.5rem;}
  .price-total{font-size:.9rem;}
  .price-sub{font-size:.6rem;}
  .footer-actions{display:grid;grid-template-columns:1fr 1fr;gap:.35rem;width:100%;}
  .action-btn{justify-content:center;padding:.45rem .4rem;font-size:.7rem;border-radius:6px;min-width:0;}
  .btn-wa{grid-column:span 1;}
  .done-text{font-size:.7rem;text-align:center;}

  .empty-state{padding:2.5rem .75rem;}
  .empty-state .ei{font-size:1.4rem;}
  .empty-state p{font-size:.8rem;}

  .btn-historial{font-size:.65rem;padding:.22rem .6rem;}
  .btn-logout{font-size:.62rem;padding:.18rem .5rem;}
  .hist-toolbar{padding:.5rem;flex-direction:column;align-items:stretch;gap:.5rem;}
  .hist-toolbar-left{flex-direction:column;gap:.4rem;}
  .hist-summary{gap:.8rem;}
  .hist-stat{font-size:.75rem;}
  .hist-date-label{font-size:.68rem;}
}

@media(max-width:380px){
  .stats-bar{padding:.45rem .3rem;}
  .stat-num{font-size:.9rem;}
  .stat-lbl{font-size:.45rem;}
  .orders-wrap{padding:0 .25rem 1rem;}
  .oc-head{padding:.5rem .55rem;}
  .oc-body{padding:.55rem .55rem;}
  .oc-footer{padding:.45rem .55rem;}
  .footer-actions{grid-template-columns:1fr;gap:.3rem;}
  .filter-tabs{gap:0;}
  .ftab{font-size:.58rem;padding:.4rem .05rem;}
}

/* ─── ESTADÍSTICAS ─── */
.stats-page{padding:1.5rem 2rem 3rem;max-width:100%;width:100%;}
.stats-page h2{font-size:1.5rem;font-weight:800;color:var(--g800);margin-bottom:1.5rem;letter-spacing:-.5px;}
.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.2rem;margin-bottom:1.5rem;}
.stats-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:1.4rem 1.6rem;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.stats-card h3{font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem;}
.kpi-row{display:grid;grid-template-columns:repeat(6,1fr);gap:1rem;margin-bottom:1.8rem;}
.kpi{background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:1.2rem .8rem;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.kpi-val{font-size:1.8rem;font-weight:800;color:var(--g800);line-height:1;}
.kpi-lbl{font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:.35rem;}
.bar-chart{display:flex;flex-direction:column;gap:.4rem;}
.bar-row{display:flex;align-items:center;gap:.5rem;}
.bar-label{font-size:.82rem;font-weight:600;color:var(--text);min-width:110px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bar-track{flex:1;height:26px;background:var(--g100);border-radius:6px;overflow:hidden;position:relative;}
.bar-fill{height:100%;border-radius:6px;transition:width .4s ease;}
.bar-fill.green{background:var(--g600);}
.bar-fill.gold{background:var(--gold);}
.bar-fill.blue{background:#3b82f6;}
.bar-fill.orange{background:#f59e0b;}
.bar-fill.purple{background:#8b5cf6;}
.bar-fill.red{background:#ef4444;}
.bar-val{font-size:.72rem;font-weight:700;color:var(--muted);min-width:30px;}
.mini-table{width:100%;border-collapse:collapse;}
.mini-table th{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.4rem .3rem;border-bottom:1px solid var(--border);}
.mini-table td{font-size:.82rem;font-weight:600;padding:.45rem .3rem;border-bottom:1px solid #f0ede8;}
.mini-table tr:last-child td{border-bottom:none;}
.rank{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-size:.65rem;font-weight:800;background:var(--g100);color:var(--g800);}
.rank.gold-r{background:#fef3c7;color:#92400e;}
.day-chart{display:flex;align-items:flex-end;gap:.5rem;height:130px;padding-top:.5rem;}
.day-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:.25rem;}
.day-bar{width:100%;border-radius:4px 4px 0 0;background:var(--g600);transition:height .4s ease;min-height:2px;}
.day-lbl{font-size:.6rem;font-weight:700;color:var(--muted);}
.day-val{font-size:.6rem;font-weight:700;color:var(--g800);}
.hora-chart{display:flex;align-items:flex-end;gap:3px;height:120px;}
.hora-bar{flex:1;background:var(--g400);border-radius:3px 3px 0 0;min-height:2px;transition:height .4s ease;position:relative;}
.hora-bar:hover{background:var(--g600);}
.hora-labels{display:flex;gap:3px;margin-top:.3rem;}
.hora-labels span{flex:1;text-align:center;font-size:.5rem;color:var(--muted);font-weight:600;}
.ingreso-chart{display:flex;flex-direction:column;gap:.4rem;max-height:300px;overflow-y:auto;}
.ingreso-row{display:flex;align-items:center;gap:.5rem;font-size:.78rem;}
.ingreso-date{min-width:75px;font-weight:600;color:var(--muted);font-size:.7rem;}
.ingreso-bar-wrap{flex:1;height:18px;background:var(--g100);border-radius:4px;overflow:hidden;}
.ingreso-bar{height:100%;background:var(--g600);border-radius:4px;}
.ingreso-val{min-width:65px;text-align:right;font-weight:700;color:var(--g800);font-size:.72rem;}
.stats-loading{text-align:center;padding:4rem 1rem;color:var(--muted);font-size:.9rem;font-weight:600;}
@media(max-width:1024px){
  .stats-page{padding:1rem 1rem 2rem;}
  .kpi-row{grid-template-columns:repeat(3,1fr);gap:.7rem;}
  .stats-grid{grid-template-columns:repeat(2,1fr);gap:.8rem;}
}
@media(max-width:768px){
  .stats-page{padding:.75rem .5rem 2rem;}
  .stats-page h2{font-size:1.1rem;margin-bottom:1rem;}
  .stats-grid{grid-template-columns:1fr;gap:.7rem;}
  .stats-card{padding:1rem;border-radius:12px;}
  .stats-card h3{font-size:.68rem;margin-bottom:.7rem;}
  .kpi-row{grid-template-columns:repeat(2,1fr);gap:.5rem;}
  .kpi{padding:.9rem .6rem;border-radius:12px;}
  .kpi-val{font-size:1.3rem;}
  .kpi-lbl{font-size:.58rem;}
  .bar-label{min-width:75px;font-size:.72rem;}
  .bar-track{height:20px;}
  .bar-val{font-size:.65rem;}
  .hora-chart{height:90px;}
  .day-chart{height:100px;gap:.3rem;}
  .day-lbl{font-size:.55rem;}
  .day-val{font-size:.55rem;}
  .mini-table th{font-size:.55rem;padding:.3rem .2rem;}
  .mini-table td{font-size:.75rem;padding:.35rem .2rem;}
  .ingreso-chart{max-height:180px;}
  .ingreso-date{min-width:55px;font-size:.62rem;}
  .ingreso-val{min-width:55px;font-size:.65rem;}
  .btn-stats{font-size:.62rem;padding:.2rem .55rem;}
}
@media(max-width:380px){
  .kpi-row{grid-template-columns:repeat(2,1fr);gap:.35rem;}
  .kpi{padding:.7rem .4rem;}
  .kpi-val{font-size:1.05rem;}
  .kpi-lbl{font-size:.5rem;}
  .stats-card{padding:.75rem;}
  .bar-label{min-width:60px;font-size:.65rem;}
}

/* ─── TOAST NUEVO PEDIDO ─── */
.new-order-toast{
  position:fixed;bottom:1.2rem;right:1.2rem;z-index:500;
  background:var(--g800);color:#fff;
  border-radius:14px;padding:.9rem 1.2rem;
  box-shadow:0 8px 32px rgba(0,0,0,.28);
  display:flex;align-items:center;gap:.75rem;
  animation:toastIn .3s ease;
  max-width:320px;
  border-left:4px solid #4ade80;
}
@keyframes toastIn{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.toast-icon{font-size:1.4rem;flex-shrink:0;}
.toast-body{flex:1;min-width:0;}
.toast-title{font-size:.88rem;font-weight:800;margin-bottom:.15rem;}
.toast-sub{font-size:.72rem;color:var(--g400);font-weight:500;}
.toast-close{background:none;border:none;color:rgba(255,255,255,.55);font-size:1rem;cursor:pointer;padding:.15rem;line-height:1;flex-shrink:0;}
.toast-close:hover{color:#fff;}

/* ─── PERMISOS NOTIFICACIÓN ─── */
.notif-banner{
  background:#fef3c7;border-bottom:1px solid #f5d88a;
  display:flex;align-items:center;justify-content:space-between;
  padding:.55rem .75rem;gap:.75rem;flex-wrap:wrap;
}
.notif-banner-text{font-size:.78rem;font-weight:600;color:#78350f;}
.btn-allow-notif{border:none;border-radius:8px;padding:.3rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;background:#92400e;color:#fff;transition:all .15s;}
.btn-allow-notif:hover{background:#78350f;}
.btn-dismiss-banner{background:none;border:none;font-size:.85rem;cursor:pointer;color:#92400e;padding:.15rem;}

/* ─── SUGERENCIAS ─── */
.sug-page{padding:1.5rem 2rem 3rem;width:100%;}
.sug-page h2{font-size:1.5rem;font-weight:800;color:var(--g800);margin-bottom:1.2rem;letter-spacing:-.5px;}
.sug-table-wrap{background:#fff;border:1.5px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.sug-table{width:100%;border-collapse:collapse;}
.sug-table th{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.75rem 1rem;border-bottom:1.5px solid var(--border);background:var(--g100);}
.sug-table td{font-size:.85rem;font-weight:500;padding:.75rem 1rem;border-bottom:1px solid #f0ede8;vertical-align:top;}
.sug-table tr:last-child td{border-bottom:none;}
.sug-table tr:hover td{background:#fafaf7;}
.sug-msg{font-size:.83rem;color:var(--text);line-height:1.55;max-width:480px;}
.sug-nombre{font-weight:700;color:var(--g800);font-size:.85rem;}
.sug-anon{color:var(--muted);font-size:.78rem;font-style:italic;}
.sug-date{font-size:.72rem;color:var(--muted);white-space:nowrap;}
.sug-badge-nueva{display:inline-block;background:var(--g100);color:var(--g700);border:1px solid var(--g200);border-radius:999px;font-size:.6rem;font-weight:700;padding:.12rem .55rem;letter-spacing:.05em;}
.sug-badge-leida{display:inline-block;background:#f3f4f6;color:var(--muted);border:1px solid #e5e7eb;border-radius:999px;font-size:.6rem;font-weight:700;padding:.12rem .55rem;letter-spacing:.05em;}
.btn-mark-read{border:1.5px solid var(--border);background:#fff;border-radius:8px;padding:.28rem .65rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:600;cursor:pointer;color:var(--g800);transition:all .15s;white-space:nowrap;}
.btn-mark-read:hover{border-color:var(--g600);background:var(--g100);}
.sug-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;flex-wrap:wrap;gap:.75rem;}
.sug-filter-btn{border:1.5px solid var(--border);background:#fff;border-radius:999px;padding:.3rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--muted);transition:all .15s;}
.sug-filter-btn.active{background:var(--g800);color:#fff;border-color:var(--g800);}
.sug-empty{text-align:center;padding:3rem;color:var(--muted);font-size:.9rem;}
@media(max-width:768px){
  .sug-page{padding:.75rem .5rem 2rem;}
  .sug-page h2{font-size:1.1rem;}
  .sug-table-wrap{border-radius:12px;}
  .sug-table th{font-size:.6rem;padding:.55rem .5rem;}
  .sug-table td{font-size:.78rem;padding:.55rem .5rem;}
  .sug-msg{font-size:.75rem;}
  .col-sug-date{display:none;}
}
.users-page{padding:1.5rem 2rem 3rem;width:100%;}
.users-page h2{font-size:1.5rem;font-weight:800;color:var(--g800);margin-bottom:1.2rem;letter-spacing:-.5px;}
.users-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;flex-wrap:wrap;gap:.75rem;}
.btn-new-user{border:none;border-radius:10px;padding:.55rem 1.2rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;background:var(--g800);color:#fff;transition:all .15s;display:flex;align-items:center;gap:.4rem;}
.btn-new-user:hover{background:var(--g700);}
.users-table-wrap{background:#fff;border:1.5px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.users-table{width:100%;border-collapse:collapse;}
.users-table th{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:.75rem 1rem;border-bottom:1.5px solid var(--border);background:var(--g100);}
.users-table td{font-size:.85rem;font-weight:500;padding:.7rem 1rem;border-bottom:1px solid #f0ede8;vertical-align:middle;}
.users-table tr:last-child td{border-bottom:none;}
.users-table tr:hover td{background:#fafaf7;}
.user-name{font-weight:700;color:var(--g800);}
.user-email{font-size:.78rem;color:var(--muted);}
.role-badge{display:inline-block;border-radius:999px;font-size:.68rem;font-weight:700;padding:.2rem .65rem;}
.role-badge.admin{background:#fef3c7;color:#92400e;}
.role-badge.empleado{background:var(--g100);color:var(--g800);}
.active-dot{display:inline-flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;}
.active-dot .dot{width:8px;height:8px;border-radius:50%;}
.active-dot .dot.on{background:#4ade80;}
.active-dot .dot.off{background:#f87171;}
.user-actions{display:flex;gap:.4rem;}
.btn-edit{border:1.5px solid var(--border);background:#fff;border-radius:8px;padding:.3rem .65rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:600;cursor:pointer;color:var(--g800);transition:all .15s;}
.btn-edit:hover{border-color:var(--g600);background:var(--g100);}
.btn-toggle{border:none;border-radius:8px;padding:.3rem .65rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .15s;}
.btn-toggle.deactivate{background:#fee2e2;color:#991b1b;}
.btn-toggle.deactivate:hover{background:#fca5a5;}
.btn-toggle.activate{background:var(--g100);color:var(--g800);}
.btn-toggle.activate:hover{background:var(--g200);}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:100;padding:1rem;}
.modal-card{background:#fff;border-radius:18px;padding:2rem;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,.2);}
.modal-card h3{font-size:1.1rem;font-weight:800;color:var(--g800);margin-bottom:1.2rem;}
.modal-field{margin-bottom:1rem;}
.modal-field label{display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem;}
.modal-field input,.modal-field select{width:100%;border:1.5px solid var(--border);border-radius:10px;padding:.6rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;color:var(--text);outline:none;background:#f5f3ef;transition:border-color .15s;}
.modal-field input:focus,.modal-field select:focus{border-color:var(--g600);background:#fff;}
.modal-actions{display:flex;gap:.6rem;margin-top:1.2rem;}
.modal-actions button{flex:1;border:none;border-radius:10px;padding:.6rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .15s;}
.btn-modal-save{background:var(--g800);color:#fff;}
.btn-modal-save:hover{background:var(--g700);}
.btn-modal-save:disabled{opacity:.5;cursor:not-allowed;}
.btn-modal-cancel{background:#f0ede8;color:var(--muted);}
.btn-modal-cancel:hover{background:var(--border);}
.modal-error{background:#fee2e2;color:#991b1b;border-radius:8px;padding:.5rem .75rem;font-size:.78rem;font-weight:600;margin-bottom:.8rem;}
.users-empty{text-align:center;padding:3rem;color:var(--muted);font-size:.9rem;}
@media(max-width:768px){
  .users-page{padding:.75rem .5rem 2rem;}
  .users-page h2{font-size:1.1rem;}
  .users-table-wrap{border-radius:12px;}
  .users-table th{font-size:.6rem;padding:.55rem .5rem;}
  .users-table td{font-size:.78rem;padding:.55rem .5rem;}
  .user-email{font-size:.68rem;}
  .role-badge{font-size:.6rem;padding:.15rem .5rem;}
  .btn-edit,.btn-toggle{font-size:.65rem;padding:.25rem .5rem;}
  .btn-new-user{font-size:.75rem;padding:.45rem .9rem;}
  .modal-card{padding:1.5rem;border-radius:14px;}
  .col-date{display:none;}
}
@media(max-width:380px){
  .users-table th,.users-table td{padding:.4rem .3rem;}
  .user-actions{flex-direction:column;gap:.25rem;}
}

/* ─── INVENTARIO ─── */
.inv-page{padding:1.5rem 2rem 3rem;max-width:960px;width:100%;}
.inv-page h2{font-size:1.5rem;font-weight:800;color:var(--g800);margin-bottom:1.5rem;letter-spacing:-.5px;}
.inv-section{margin-bottom:1.8rem;}
.inv-section-title{font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem;padding-bottom:.4rem;border-bottom:1px solid var(--border);}
.inv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.6rem;}
.inv-item{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid var(--border);border-radius:12px;padding:.65rem .9rem;gap:.5rem;transition:border-color .15s;}
.inv-item.agotado{background:#fff5f5;border-color:#fca5a5;}
.inv-name{font-size:.82rem;font-weight:600;color:var(--text);flex:1;}
.inv-item.agotado .inv-name{color:#991b1b;}
.inv-toggle{border:none;border-radius:8px;padding:.28rem .7rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap;}
.inv-toggle.disponible{background:var(--g100);color:var(--g800);}
.inv-toggle.disponible:hover{background:var(--g200);}
.inv-toggle.agotado{background:#fee2e2;color:#991b1b;}
.inv-toggle.agotado:hover{background:#fca5a5;}
.inv-toggle:disabled{opacity:.5;cursor:not-allowed;}
@media(max-width:768px){
  .inv-page{padding:.75rem .5rem 2rem;}
  .inv-page h2{font-size:1.1rem;margin-bottom:1rem;}
  .inv-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.45rem;}
  .inv-item{padding:.5rem .65rem;}
  .inv-name{font-size:.75rem;}
  .inv-toggle{font-size:.65rem;padding:.22rem .5rem;}
}
`;

const CARBOS_INV = ["Arroz integral", "Papa criolla", "Quinoa"];
const TOPPINGS_INV = [
  "Aguacate", "Champiñones", "Cherry", "Maíz", "Zanahoria", "Pepino",
  "Guacamole", "Repollo morado", "Piña asada", "Mango", "Pico de gallo",
  "Tomate cherry", "Nueces", "Nachos", "Brócoli", "Queso",
];
const PROTEINAS_INV = ["Pollo", "Atún", "Carne molida", "Falafel", "Huevo", "Lomo de res", "Cerdo"];
const BEBIDAS_INV = ["Limonada", "Agua y limón"];
const CAFETERIA_INV = [
  { cat: "Brunch", items: ["Pizzeta pesto", "Pizzeta carne", "Picada especial", "Sopa de tomate"] },
  { cat: "Emparedados", items: ["Emparedado de lomo", "Choripan", "Emparedado integral", "Emparedado de cerdo", "Emparedado de huevo", "Emparedado de salami"] },
  { cat: "Desayunos", items: ["Criollito", "Hayaca", "Wraps de espinaca", "Wraps de cerdo", "Desayuno Llanero"] },
  { cat: "Omelet", items: ["Omelet Opción 1", "Omelet Opción 2", "Omelet Opción 3"] },
  { cat: "Montaditos", items: ["Montadito de huevo", "Montadito napolitano", "Montadito de carne"] },
  { cat: "Bowls y Fruta", items: ["Bowl de yogurt", "Mini bowl de yogurt", "Bowl de avena", "Bowl de açaí", "Cuchareable de açaí", "Fruta fresca"] },
  { cat: "Bebidas cafetería", items: ["Soda Hatsu", "Colombiano", "Capuchino"] },
  { cat: "Combos", items: ["Hayaca + Chocolate", "Hayaca + Capuchino", "Hayaca + Aguapanela", "Hayaca + Colombiano", "Combo chocolate", "Combo aguapanela", "Croissant jamón y queso + capuchino", "Croissant arequipe + capuchino"] },
];
const INVENTARIO_GRUPOS = [
  { cat: "Carbohidratos", items: CARBOS_INV },
  { cat: "Toppings", items: TOPPINGS_INV },
  { cat: "Proteínas", items: PROTEINAS_INV },
  { cat: "Bebidas bowl", items: BEBIDAS_INV },
  ...CAFETERIA_INV,
];

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "nuevo", label: "Nuevos" },
  { key: "preparando", label: "Preparando" },
  { key: "camino", label: "En camino" },
  { key: "entregado", label: "Entregados" },
  { key: "cancelado", label: "Cancelados" },
];

const isToday = (d) => {
  const now = new Date();
  const date = new Date(d);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("hoy"); // "hoy" | "historial" | "stats" | "usuarios"
  const [histDate, setHistDate] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDesde, setStatsDesde] = useState("");
  const [statsHasta, setStatsHasta] = useState("");
  // Usuarios
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugSoloNuevas, setSugSoloNuevas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "empleado" });
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  // Caja (tienda abierta / cerrada)
  const [tiendaAbierta, setTiendaAbierta] = useState(null);
  const [cajaCargando, setCajaCargando] = useState(false);
  // Inventario (productos sin stock)
  const [productosDesactivados, setProductosDesactivados] = useState(new Set());
  const [invCargando, setInvCargando] = useState(false);
  // Modal de confirmación genérico
  const [confirmModal, setConfirmModal] = useState(null); // { mensaje, onConfirm }
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Notificaciones de nuevo pedido ────────────────────────
  const knownIdsRef = useRef(null); // null = primera carga (no notificar)
  const [newOrderToast, setNewOrderToast] = useState(null); // { count, nombre }
  const [showNotifBanner, setShowNotifBanner] = useState(
    () => typeof Notification !== "undefined" && Notification.permission === "default"
  );
  const toastTimerRef = useRef(null);
  const audioCtxRef = useRef(null); // AudioContext persistente (requiere gesto del usuario)
  const [soundReady, setSoundReady] = useState(false); // true = audio desbloqueado

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  useEffect(() => {
    fetch(`${API_URL}/api/tienda/estado`)
      .then((r) => r.json())
      .then((d) => setTiendaAbierta(d.abierto))
      .catch(() => setTiendaAbierta(false));
  }, []);

  const toggleCaja = () => {
    setConfirmModal({
      mensaje: tiendaAbierta
        ? "¿Seguro que quieres cerrar la caja? Los clientes no podrán hacer pedidos."
        : "¿Seguro que quieres abrir la caja?",
      onConfirm: async () => {
        setConfirmModal(null);
        setCajaCargando(true);
        try {
          const res = await fetch(`${API_URL}/api/tienda/estado`, { method: "PATCH", headers: authHeaders });
          const d = await res.json();
          setTiendaAbierta(d.abierto);
        } catch (err) {
          console.error("Error al cambiar estado de caja:", err);
        }
        setCajaCargando(false);
      },
    });
  };

  const fetchProductos = () => {
    fetch(`${API_URL}/api/tienda/productos`)
      .then((r) => r.json())
      .then((d) => setProductosDesactivados(new Set(d.desactivados)))
      .catch(() => {});
  };

  const toggleProducto = (nombre) => {
    const estaDesactivado = productosDesactivados.has(nombre);
    const ejecutar = async () => {
      setInvCargando(true);
      try {
        const res = await fetch(`${API_URL}/api/tienda/productos/${encodeURIComponent(nombre)}`, {
          method: "PATCH",
          headers: authHeaders,
        });
        const d = await res.json();
        setProductosDesactivados(new Set(d.desactivados));
      } catch (err) {
        console.error("Error al cambiar estado del producto:", err);
      }
      setInvCargando(false);
    };
    if (!estaDesactivado) {
      // Solo pide confirmación al DESACTIVAR
      setConfirmModal({
        mensaje: `¿Desactivar "${nombre}"? Se marcará como sin stock y no aparecerá disponible para los clientes.`,
        onConfirm: () => { setConfirmModal(null); ejecutar(); },
      });
    } else {
      ejecutar();
    }
  };

  const beep = (ctx) => {
    // 3 pitidos con onda cuadrada (más fuerte y penetrante)
    [0, 0.28, 0.56].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      osc.connect(gain);
      gain.connect(compressor);
      compressor.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(1.0, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.22);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.22);
    });
  };

  const activarSonido = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const run = () => { beep(ctx); setSoundReady(true); };
      if (ctx.state === "suspended") {
        ctx.resume().then(run);
      } else {
        run();
      }
    } catch (_) {}
  };

  const playAlertSound = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === "suspended") return;
      beep(ctx);
    } catch (_) {}
  };

  const fetchOrders = () => {
    fetch(`${API_URL}/api/pedidos?_=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setOrdersLoading(false);

        // ── Detección de pedidos nuevos ──────────────────────
        const incoming = data.filter((o) => isToday(o.hora));
        const incomingIds = new Set(incoming.map((o) => o.id));

        if (knownIdsRef.current === null) {
          // Primera carga: registrar IDs sin notificar
          knownIdsRef.current = incomingIds;
          return;
        }

        const nuevos = incoming.filter((o) => !knownIdsRef.current.has(o.id));
        if (nuevos.length > 0) {
          knownIdsRef.current = incomingIds;

          // Sonido
          playAlertSound();

          // Toast visual
          const primerNombre = nuevos[0].nombre?.split(" ")[0] || "cliente";
          const toastInfo = {
            count: nuevos.length,
            nombre: nuevos.length === 1 ? primerNombre : `${nuevos.length} nuevos pedidos`,
          };
          setNewOrderToast(toastInfo);
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => setNewOrderToast(null), 8000);

          // Notificación nativa del navegador
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const title = nuevos.length === 1
              ? `🛵 Nuevo pedido de ${primerNombre}`
              : `🛵 ${nuevos.length} nuevos pedidos`;
            new Notification(title, {
              body: nuevos.length === 1
                ? `Valor: ${fmt(nuevos[0].total)} · ${nuevos[0].addr}`
                : "Revisa el panel de administración",
              icon: "/favicon.ico",
              tag: "nuevo-pedido",
            });
          }
        } else {
          knownIdsRef.current = incomingIds;
        }
      })
      .catch((err) => { console.error("Error al cargar pedidos:", err); setOrdersLoading(false); });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // refresca cada 15s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = () => {
    setStatsLoading(true);
    const params = new URLSearchParams();
    if (statsDesde) params.set("desde", statsDesde);
    if (statsHasta) params.set("hasta", statsHasta);
    const qs = params.toString();
    fetch(`${API_URL}/api/pedidos/estadisticas${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((data) => { setStats(data); setStatsLoading(false); })
      .catch((err) => { console.error("Error al cargar estadísticas:", err); setStatsLoading(false); });
  };

  useEffect(() => {
    if (view !== "stats") return;
    fetchStats();
  }, [view]);

  const token = localStorage.getItem("token");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const isAdmin = adminUser.rol === "admin";
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchStaff = () => {
    setStaffLoading(true);
    fetch(`${API_URL}/api/staff`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setStaffList(data); setStaffLoading(false); })
      .catch(() => setStaffLoading(false));
  };

  useEffect(() => { if (view === "usuarios") fetchStaff(); }, [view]);

  const fetchSugerencias = (soloNuevas = false) => {
    setSugLoading(true);
    const qs = soloNuevas ? "?noLeidas=true" : "";
    fetch(`${API_URL}/api/sugerencias${qs}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setSugerencias(Array.isArray(data) ? data : []); setSugLoading(false); })
      .catch(() => setSugLoading(false));
  };

  useEffect(() => { if (view === "sugerencias") fetchSugerencias(sugSoloNuevas); }, [view]);

  useEffect(() => { if (view === "inventario") fetchProductos(); }, [view]);

  const marcarLeida = async (id) => {
    await fetch(`${API_URL}/api/sugerencias/${id}/leida`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    setSugerencias((prev) => prev.map((s) => s.id === id ? { ...s, leida: true } : s));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ nombre: "", email: "", password: "", rol: "empleado" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({ nombre: u.nombre, email: u.email, password: "", rol: u.rol });
    setFormError("");
    setShowModal(true);
  };

  const saveUser = async () => {
    setFormError("");
    setFormSaving(true);
    try {
      const url = editingUser ? `${API_URL}/api/staff/${editingUser.id}` : `${API_URL}/api/staff`;
      const method = editingUser ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Error al guardar"); setFormSaving(false); return; }
      setShowModal(false);
      fetchStaff();
    } catch (err) { setFormError("Error de conexión: " + err.message); }
    setFormSaving(false);
  };

  const toggleUser = async (id) => {
    try {
      await fetch(`${API_URL}/api/staff/${id}/toggle`, { method: "PATCH", headers: authHeaders });
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  const changeStatus = async (id, val) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: val } : o)));
    try {
      await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: val }),
      });
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const groupItems = (arr) => {
    const counts = {};
    arr.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  };

  const printOrder = (o) => {
    const grp = (arr) => {
      const c = {}; arr.forEach(x => { c[x] = (c[x] || 0) + 1; });
      return Object.entries(c).map(([n, cnt]) => cnt > 1 ? `${n} x${cnt}` : n).join(", ");
    };
    const bowlRows = o.bowls.map((b, i) => {
      const allIngredients = [];
      if (b.base) allIngredients.push(`<b>${b.base.toUpperCase()}</b>`);
      (b.incluidos || []).forEach(x => allIngredients.push(x));
      grp(b.toppings).split(", ").filter(Boolean).forEach(x => allIngredients.push(x));
      grp(b.proteinas).split(", ").filter(Boolean).forEach(x => allIngredients.push(`<b>${x}</b>`));
      if (b.bebida) allIngredients.push(`Bebida: ${b.bebida}`);
      if (b.caja > 0) allIngredients.push(`Caja`);
      if (b.vaso > 0) allIngredients.push(`Vaso`);
      return `<div class="bowl"><div class="bowl-num">&#9632; BOWL ${i + 1}</div><div class="ingredients">${allIngredients.join(" &nbsp;|&nbsp; ")}</div></div>`;
    }).join("");
    const extras = Object.keys(o.extraItems || {}).length
      ? `<div class="divider"></div><div class="section-lbl">PRODUCTOS ADICIONALES</div><div class="extra-list">${Object.entries(o.extraItems).map(([n,q]) => `<div class="extra-row"><span>${n}</span><span>x${q}</span></div>`).join("")}</div>`
      : "";
    const entrega = o.tipo_entrega === "recogida"
      ? `<div class="addr-type">&#9632; RECOGE EN TIENDA</div>`
      : `<div class="addr-type">&#9632; DOMICILIO</div><div class="addr-text">${o.addr}, ${o.barrio}${o.ref ? `<br>${o.ref}` : ""}</div>`;
    const now = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const date = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Pedido #${o.id}</title><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#000;padding:8px;width:72mm;background:#fff;}
      .header{text-align:center;padding-bottom:10px;margin-bottom:10px;border-bottom:3px double #000;}
      .brand{font-size:22px;font-weight:900;letter-spacing:3px;text-transform:uppercase;}
      .sub{font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin-top:2px;}
      .meta{font-size:12px;margin-top:6px;line-height:1.6;}
      .pedido-num{font-size:17px;font-weight:900;margin-top:4px;}
      .client-block{margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #000;}
      .client-name{font-size:16px;font-weight:900;text-transform:uppercase;line-height:1.3;}
      .client-tel{font-size:13px;font-weight:700;margin-top:2px;}
      .section-lbl{font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:10px 0 5px;}
      .bowl{border:2px solid #000;padding:7px 9px;margin-bottom:7px;}
      .bowl-num{font-size:13px;font-weight:900;letter-spacing:1px;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #000;}
      .ingredients{font-size:13px;line-height:1.8;}
      .extra-list{border:2px solid #000;padding:6px 9px;}
      .extra-row{display:flex;justify-content:space-between;font-size:13px;font-weight:700;padding:2px 0;border-bottom:1px dashed #000;}
      .extra-row:last-child{border-bottom:none;}
      .entrega-block{margin-top:10px;padding-top:8px;border-top:2px solid #000;}
      .addr-type{font-size:13px;font-weight:900;margin-bottom:3px;}
      .addr-text{font-size:13px;font-weight:700;line-height:1.6;}
      .total-block{margin-top:10px;padding-top:8px;border-top:3px double #000;display:flex;justify-content:space-between;align-items:baseline;}
      .total-lbl{font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;}
      .total-val{font-size:20px;font-weight:900;}
      .divider{border-top:1px dashed #000;margin:8px 0;}
      @media print{body{width:auto;}@page{margin:3mm;size:72mm auto;}}
    </style></head><body>
      <div class="header">
        <div class="brand">Pepas Coffee</div>
        <div class="sub">Ticket de cocina</div>
        <div class="meta">${date} &nbsp;&#9679;&nbsp; ${now}</div>
        <div class="pedido-num">Pedido #${o.id}</div>
      </div>
      <div class="client-block">
        <div class="client-name">${o.nombre}</div>
        <div class="client-tel">${o.tel}</div>
      </div>
      <div class="section-lbl">Bowls</div>
      ${bowlRows}${extras}
      <div class="entrega-block">${entrega}</div>
      <div class="total-block"><span class="total-lbl">Total</span><span class="total-val">${fmt(o.total)}</span></div>
    </body></html>`;
    const w = window.open("", "_blank", "width=420,height=650");
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const sendWA = (o, tipo) => {
    const lines = o.bowls
      .map((b, i) =>
        `Bowl ${i + 1}: ${b.base}${(b.incluidos || []).length ? " | Incluye: " + b.incluidos.join(", ") : ""} | Toppings: ${groupItems(b.toppings).map(({name,count}) => count > 1 ? `${name} x${count}` : name).join(", ")} | Proteína: ${groupItems(b.proteinas).map(({name,count}) => count > 1 ? `${name} x${count}` : name).join(", ")}${b.bebida ? " | Bebida: " + b.bebida : ""}`
      )
      .join("\n");
    const msg = tipo === "entregado"
      ? `Hola ${o.nombre}, tu pedido Pepas Coffee fue entregado. ¡Gracias por tu compra! 🌿\n\n${lines}\n\nTotal: ${fmt(o.total)}`
      : `Hola ${o.nombre}, tu pedido Pepas Coffee esta en camino.\n\n${lines}\n\nTotal: ${fmt(o.total)}\n\nLlega en aprox. 15 min.`;
    const num = o.tel.replace(/\D/g, "");
    window.open(`https://wa.me/57${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const todayOrders = orders.filter((o) => isToday(o.hora));
  const pastOrders = orders.filter((o) => !isToday(o.hora));

  const filtered = todayOrders.filter((o) => {
    const matchFilter = filterStatus === "todos" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o.nombre.toLowerCase().includes(q) || o.tel.includes(q) || o.addr.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  }).sort((a, b) => a.id - b.id);

  const histFiltered = pastOrders.filter((o) => {
    if (histDate) {
      const d = new Date(o.hora);
      const sel = histDate; // "YYYY-MM-DD"
      const oDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (oDate !== sel) return false;
    }
    const q = search.toLowerCase();
    return !q || o.nombre.toLowerCase().includes(q) || o.tel.includes(q) || o.addr.toLowerCase().includes(q);
  }).sort((a, b) => b.id - a.id);

  // Group history by date
  const histByDate = {};
  histFiltered.forEach((o) => {
    const d = new Date(o.hora);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (!histByDate[key]) histByDate[key] = [];
    histByDate[key].push(o);
  });
  const histDates = Object.keys(histByDate).sort((a, b) => b.localeCompare(a));

  // Stats (today only)
  const stNuevo = todayOrders.filter((o) => o.status === "nuevo").length;
  const stPrep = todayOrders.filter((o) => o.status === "preparando").length;
  const stCamino = todayOrders.filter((o) => o.status === "camino").length;
  const stEntregado = todayOrders.filter((o) => o.status === "entregado").length;
  const ingresos = todayOrders.filter((o) => o.status !== "cancelado").reduce((s, o) => s + o.total, 0);
  const histIngresos = histFiltered.filter((o) => o.status !== "cancelado").reduce((s, o) => s + o.total, 0);

  return (
    <>
      <style>{CSS}</style>

      {/* TOAST: nuevo pedido */}
      {newOrderToast && (
        <div className="new-order-toast">
          <div className="toast-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div>
          <div className="toast-body">
            <div className="toast-title">
              {newOrderToast.count === 1 ? `Nuevo pedido de ${newOrderToast.nombre}` : newOrderToast.nombre}
            </div>
            <div className="toast-sub">Revisa el panel</div>
          </div>
          <button className="toast-close" onClick={() => setNewOrderToast(null)}>✕</button>
        </div>
      )}

      {/* BANNER: solicitar permiso notificaciones */}
      {showNotifBanner && (
        <div className="notif-banner">
          <span className="notif-banner-text">Activa las notificaciones para recibir alertas cuando llegue un pedido nuevo</span>
          <div style={{display:"flex",gap:".5rem",alignItems:"center"}}>
            <button className="btn-allow-notif" onClick={() => {
              Notification.requestPermission().then((p) => {
                setShowNotifBanner(false);
              });
            }}>Activar</button>
            <button className="btn-dismiss-banner" onClick={() => setShowNotifBanner(false)}>✕</button>
          </div>
        </div>
      )}

      {/* NAV */}
      {/* Overlay menú móvil */}
      <div className={`mobile-menu-overlay${mobileMenuOpen ? " open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      {/* Drawer menú móvil */}
      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="brand-name">pepas coffee</div>
          <button className="btn-close-menu" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>
        <div className="mobile-live"><span></span> En vivo</div>
        {tiendaAbierta !== null && (
          <button className={`mobile-caja-btn${tiendaAbierta ? " abierta" : " cerrada"}`} onClick={() => { setMobileMenuOpen(false); toggleCaja(); }} disabled={cajaCargando}>
            <span className="caja-dot" style={{width:8,height:8,borderRadius:'50%',background:tiendaAbierta?'#14532d':'#991b1b'}} />
            {cajaCargando ? "…" : tiendaAbierta ? "Caja abierta" : "Caja cerrada"}
          </button>
        )}
        {isAdmin && <button className={`mobile-nav-btn${view==="sugerencias"?" active":""}`} onClick={() => { setView(view==="sugerencias"?"hoy":"sugerencias"); setMobileMenuOpen(false); }}>Sugerencias</button>}
        {isAdmin && <button className={`mobile-nav-btn${view==="usuarios"?" active":""}`} onClick={() => { setView(view==="usuarios"?"hoy":"usuarios"); setSearch(""); setFilterStatus("todos"); setMobileMenuOpen(false); }}>Usuarios</button>}
        {isAdmin && <button className={`mobile-nav-btn${view==="stats"?" active":""}`} onClick={() => { setView(view==="stats"?"hoy":"stats"); setSearch(""); setFilterStatus("todos"); setMobileMenuOpen(false); }}>Estadísticas</button>}
        {isAdmin && <button className={`mobile-nav-btn${view==="historial"?" active":""}`} onClick={() => { setView(view==="historial"?"hoy":"historial"); setSearch(""); setFilterStatus("todos"); setMobileMenuOpen(false); }}>Historial</button>}
        <button className={`mobile-nav-btn${view==="inventario"?" active":""}`} onClick={() => { setView(view==="inventario"?"hoy":"inventario"); setMobileMenuOpen(false); }}>Inventario</button>
        <button className="mobile-nav-btn danger" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>Salir</button>
      </div>

      <div className="topnav">
        <div className="brand-wrap">
          <div>
            <div className="brand-name">pepas coffee</div>
            <div className="brand-sub">Panel de administración</div>
          </div>
          <span className="admin-badge">{isAdmin ? "Admin" : "Empleado"}</span>
        </div>
        {/* Botones desktop */}
        <div className="nav-right">
          {isAdmin && <button className={`btn-historial${view==="sugerencias"?" active":""}`} onClick={() => setView(view==="sugerencias"?"hoy":"sugerencias")}>{view==="sugerencias"?"Volver":"Sugerencias"}</button>}
          {isAdmin && <button className={`btn-historial${view==="usuarios"?" active":""}`} onClick={() => { setView(view==="usuarios"?"hoy":"usuarios"); setSearch(""); setFilterStatus("todos"); }}>{view==="usuarios"?"Volver":"Usuarios"}</button>}
          {isAdmin && <button className={`btn-historial${view==="stats"?" active":""}`} onClick={() => { setView(view==="stats"?"hoy":"stats"); setSearch(""); setFilterStatus("todos"); }}>{view==="stats"?"Volver":"Estadísticas"}</button>}
          {isAdmin && <button className={`btn-historial${view==="historial"?" active":""}`} onClick={() => { setView(view==="historial"?"hoy":"historial"); setSearch(""); setFilterStatus("todos"); }}>{view==="historial"?"Volver a hoy":"Historial"}</button>}
          <button className={`btn-historial${view==="inventario"?" active":""}`} onClick={() => setView(view==="inventario"?"hoy":"inventario")}>{view==="inventario"?"Volver":"Inventario"}</button>
          {tiendaAbierta !== null && (
            <button className={`caja-btn${tiendaAbierta ? " abierta" : " cerrada"}`} onClick={toggleCaja} disabled={cajaCargando}>
              <span className="caja-dot" />
              {cajaCargando ? "…" : tiendaAbierta ? "Caja abierta" : "Caja cerrada"}
            </button>
          )}
          <button
            className="btn-historial"
            style={soundReady ? {background:"#4ade80",color:"#14532d",borderColor:"#4ade80"} : {borderColor:"#f59e0b",color:"#fbbf24"}}
            onClick={activarSonido}
            title={soundReady ? "Sonido activo" : "Haz clic para activar el sonido de alertas"}
          >
            {soundReady ? "Sonido activo" : "Activar sonido"}
          </button>
          <div className="live-dot"><span></span> En vivo</div>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
        {/* Botón hamburguesa móvil */}
        <button className="hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Menú">
          <span /><span /><span />
        </button>
      </div>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat"><div className="stat-num">{todayOrders.length}</div><div className="stat-lbl">Total hoy</div></div>
        <div className="stat-sep"></div>
        <div className="stat"><div className="stat-num">{stNuevo}</div><div className="stat-lbl">Nuevos</div></div>
        <div className="stat-sep"></div>
        <div className="stat"><div className="stat-num">{stPrep}</div><div className="stat-lbl">Preparando</div></div>
        <div className="stat-sep"></div>
        <div className="stat"><div className="stat-num">{stCamino}</div><div className="stat-lbl">En camino</div></div>
        <div className="stat-sep"></div>
        <div className="stat"><div className="stat-num">{stEntregado}</div><div className="stat-lbl">Entregados</div></div>
        <div className="stat-sep"></div>
        <div className="stat"><div className="stat-num">{fmt(ingresos)}</div><div className="stat-lbl">Ingresos</div></div>
      </div>

      {/* TOOLBAR + ORDERS — Today */}
      {view === "hoy" && (<>
      <div className="toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={`ftab${filterStatus === f.key ? " active" : ""}`} onClick={() => setFilterStatus(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="search-wrap">
            <span className="si">Buscar</span>
            <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="orders-wrap">
        <div className="orders-grid">
          {ordersLoading ? (
            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
              <div className="ei" style={{ fontSize: "1rem", color: "var(--g600)" }}>Cargando pedidos...</div>
            </div>
          ) : !filtered.length ? (
            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
              <div className="ei">--</div>
              <p>No hay pedidos hoy</p>
            </div>
          ) : (
            filtered.map((o) => {
              const payIcon = o.pago.includes("efectivo") ? "Efectivo" : o.pago.includes("Nequi") ? "Nequi" : "Tarjeta";
              const pagoLabel = (o.tipo_entrega === "recogida" && o.pago.includes("efectivo")) ? "Pagar en caja" : o.pago;
              return (
                <div key={o.id} className="order-card">
                  <div className="oc-head">
                    <div className="oc-num">
                      Pedido #{o.id} <span className="order-seq">{fmtHora(o.hora)}</span>
                    </div>
                    <span className={`status-badge ${o.status}`}>{statusLabel(o.status, o.estado_pago)}</span>
                  </div>
                  <div className="oc-body">
                    <div className="oc-client">
                      <div className="avatar">{initials(o.nombre)}</div>
                      <div>
                        <div className="client-name">{o.nombre}</div>
                        <div className="client-phone">{o.tel}</div>
                      </div>
                    </div>
                    <span className="oc-section-lbl">Bowls</span>
                    <div className="bowl-list">
                      {o.bowls.map((b, i) => (
                        <div key={i} className="bowl-item">
                          <div className="bowl-item-title">Bowl {i + 1}</div>
                          <div className="bowl-tags">
                            {b.base && <span className="btag carbo">{b.base}</span>}
                            {(b.incluidos || []).map((inc) => <span key={inc} className="btag inc">{inc}</span>)}
                            {groupItems(b.toppings).map(({name,count}) => <span key={name} className="btag topping">{count > 1 ? `${name} x${count}` : name}</span>)}
                            {groupItems(b.proteinas).map(({name,count}) => <span key={name} className="btag prot">{count > 1 ? `${name} x${count}` : name}</span>)}
                            {b.bebida && <span className="btag bev">{b.bebida}</span>}
                            {b.caja > 0 && <span className="btag" style={{background:"#fef9ec",color:"#92400e",border:"1px solid #f5d88a"}}>Caja +{fmt(b.caja)}</span>}
                            {b.vaso > 0 && <span className="btag" style={{background:"#eff6ff",color:"#1e40af",border:"1px solid #bfdbfe"}}>Vaso +{fmt(b.vaso)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.keys(o.extraItems || {}).length > 0 && (
                      <>
                        <span className="oc-section-lbl">Productos cafetería</span>
                        <div className="bowl-item" style={{ marginBottom: ".85rem" }}>
                          <div className="bowl-tags">
                            {Object.entries(o.extraItems).map(([name, qty]) => (
                              <span key={name} className="btag caf">{name} ×{qty}</span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <span className="oc-section-lbl">Entrega</span>
                    <div className="addr-row">
                      <span className="addr-icon"></span>
                      <div>
                        {o.tipo_entrega === "recogida"
                          ? <div className="addr-text" style={{color:"var(--g700)",fontWeight:600}}>Recogida en tienda / Come aquí</div>
                          : <><div className="addr-text">{o.addr}, {o.barrio}</div>{o.ref && <div className="addr-ref">{o.ref}</div>}</>
                        }
                      </div>
                    </div>
                    <span className="pay-tag">{payIcon} {pagoLabel}</span>
                  </div>
                  <div className="oc-footer">
                    <div>
                      <div className="price-total">{fmt(o.total)}</div>
                      <div className="price-sub">{o.bowls.length} bowl{o.bowls.length !== 1 ? "s" : ""}{Object.keys(o.extraItems || {}).length > 0 ? " + productos" : ""}{o.tipo_entrega === "recogida" ? " · recogida" : " + domicilio"}</div>
                    </div>
                    <div className="footer-actions">
                      <button className="btn-print" onClick={() => printOrder(o)} title="Imprimir ticket de cocina">🖨️ Imprimir</button>
                      {o.status === "nuevo" && (
                        <>
                          <button className="action-btn btn-advance" onClick={() => changeStatus(o.id, "preparando")}>Preparar pedido</button>
                          <button className="action-btn btn-cancel" onClick={() => changeStatus(o.id, "cancelado")}>Cancelar</button>
                        </>
                      )}
                      {o.status === "preparando" && (
                        <>
                          <button className="action-btn btn-advance" onClick={() => changeStatus(o.id, "camino")}>Enviar pedido</button>
                          <button className="action-btn btn-cancel" onClick={() => changeStatus(o.id, "cancelado")}>Cancelar</button>
                        </>
                      )}
                      {o.status === "camino" && (
                        <>
                          <button className="action-btn btn-advance" onClick={() => changeStatus(o.id, "entregado")}>Marcar como entregado</button>
                          <button className="action-btn btn-wa" onClick={() => sendWA(o, "camino")}>WhatsApp</button>
                        </>
                      )}
                      {o.status === "entregado" && (
                        <>
                          <span className="done-text">Pedido finalizado</span>
                          <button className="action-btn btn-wa" onClick={() => sendWA(o, "entregado")}>WhatsApp</button>
                        </>
                      )}
                      {o.status === "cancelado" && (
                        <span className="done-text">
                          {o.estado_pago === "rechazado" || o.estado_pago === "error" ? "Pago rechazado" : "Pedido cancelado"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>)}

      {/* HISTORIAL */}
      {view === "historial" && (<>
      <div className="hist-toolbar">
        <div className="hist-toolbar-left">
          <label>Filtrar por fecha:</label>
          <input type="date" value={histDate} onChange={(e) => setHistDate(e.target.value)} />
          {histDate && <button className="ftab" onClick={() => setHistDate("")} style={{cursor:"pointer"}}>Limpiar filtro</button>}
          <div className="search-wrap">
            <span className="si">Buscar</span>
            <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="hist-summary">
          <div className="hist-stat">{histFiltered.length} <span>pedidos</span></div>
          <div className="hist-stat">{fmt(histIngresos)} <span>ingresos</span></div>
        </div>
      </div>
      <div className="orders-wrap">
        {!histFiltered.length ? (
          <div className="empty-state">
            <div className="ei">--</div>
            <p>{histDate ? "No hay pedidos en esta fecha" : "No hay pedidos anteriores"}</p>
          </div>
        ) : (
          histDates.map((dateKey) => (
            <div key={dateKey} className="hist-date-group">
              <div className="hist-date-label">{fmtDate(dateKey + "T12:00:00")}</div>
              <div className="orders-grid">
                {histByDate[dateKey].map((o) => {
                  const payIcon = o.pago.includes("efectivo") ? "Efectivo" : o.pago.includes("Nequi") ? "Nequi" : "Tarjeta";
                  const pagoLabel = (o.tipo_entrega === "recogida" && o.pago.includes("efectivo")) ? "Pagar en caja" : o.pago;
                  return (
                    <div key={o.id} className="order-card">
                      <div className="oc-head">
                        <div className="oc-num">
                          Pedido #{o.id} <span className="order-seq">{fmtHora(o.hora)}</span>
                        </div>
                        <span className={`status-badge ${o.status}`}>{statusLabel(o.status, o.estado_pago)}</span>
                      </div>
                      <div className="oc-body">
                        <div className="oc-client">
                          <div className="avatar">{initials(o.nombre)}</div>
                          <div>
                            <div className="client-name">{o.nombre}</div>
                            <div className="client-phone">{o.tel}</div>
                          </div>
                        </div>
                        <span className="oc-section-lbl">Bowls</span>
                        <div className="bowl-list">
                          {o.bowls.map((b, i) => (
                            <div key={i} className="bowl-item">
                              <div className="bowl-item-title">Bowl {i + 1}</div>
                              <div className="bowl-tags">
                                {b.base && <span className="btag carbo">{b.base}</span>}
                                {(b.incluidos || []).map((inc) => <span key={inc} className="btag inc">{inc}</span>)}
                                {groupItems(b.toppings).map(({name,count}) => <span key={name} className="btag topping">{count > 1 ? `${name} x${count}` : name}</span>)}
                                {groupItems(b.proteinas).map(({name,count}) => <span key={name} className="btag prot">{count > 1 ? `${name} x${count}` : name}</span>)}
                                {b.bebida && <span className="btag bev">{b.bebida}</span>}
                                {b.caja > 0 && <span className="btag" style={{background:"#fef9ec",color:"#92400e",border:"1px solid #f5d88a"}}>Caja +{fmt(b.caja)}</span>}
                                {b.vaso > 0 && <span className="btag" style={{background:"#eff6ff",color:"#1e40af",border:"1px solid #bfdbfe"}}>Vaso +{fmt(b.vaso)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                        {Object.keys(o.extraItems || {}).length > 0 && (
                          <>
                            <span className="oc-section-lbl">Productos cafetería</span>
                            <div className="bowl-item" style={{ marginBottom: ".85rem" }}>
                              <div className="bowl-tags">
                                {Object.entries(o.extraItems).map(([name, qty]) => (
                                  <span key={name} className="btag caf">{name} ×{qty}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        <span className="oc-section-lbl">Entrega</span>
                        <div className="addr-row">
                          <span className="addr-icon"></span>
                          <div>
                            {o.tipo_entrega === "recogida"
                              ? <div className="addr-text" style={{color:"var(--g700)",fontWeight:600}}>Recogida en tienda / Come aquí</div>
                              : <><div className="addr-text">{o.addr}, {o.barrio}</div>{o.ref && <div className="addr-ref">{o.ref}</div>}</>
                            }
                          </div>
                        </div>
                        <span className="pay-tag">{payIcon} {pagoLabel}</span>
                      </div>
                      <div className="oc-footer">
                        <div>
                          <div className="price-total">{fmt(o.total)}</div>
                          <div className="price-sub">{o.bowls.length} bowl{o.bowls.length !== 1 ? "s" : ""}{Object.keys(o.extraItems || {}).length > 0 ? " + productos" : ""}{o.tipo_entrega === "recogida" ? " · recogida" : " + domicilio"}</div>
                        </div>
                        <div className="footer-actions">
                          <span className="done-text">{statusLabel(o.status, o.estado_pago)}</span>
                          {(o.status === "camino" || o.status === "entregado") && (
                            <button className="action-btn btn-wa" onClick={() => sendWA(o, o.status)}>WhatsApp</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      </>)}

      {/* ESTADÍSTICAS */}
      {view === "stats" && (<>
        {statsLoading || !stats ? (
          <div className="stats-loading">Cargando estadísticas...</div>
        ) : (
          <div className="stats-page">
            <h2>Estadísticas del negocio</h2>

            {/* Filtro de fechas */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              <label style={{ fontSize: ".85rem", color: "var(--muted)" }}>Desde:
                <input type="date" value={statsDesde} onChange={(e) => setStatsDesde(e.target.value)}
                  style={{ marginLeft: 6, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: ".85rem" }} />
              </label>
              <label style={{ fontSize: ".85rem", color: "var(--muted)" }}>Hasta:
                <input type="date" value={statsHasta} onChange={(e) => setStatsHasta(e.target.value)}
                  style={{ marginLeft: 6, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: ".85rem" }} />
              </label>
              <button onClick={fetchStats}
                style={{ padding: "4px 14px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontSize: ".85rem", fontWeight: 600 }}>
                Aplicar
              </button>
              {(statsDesde || statsHasta) && (
                <button onClick={() => { setStatsDesde(""); setStatsHasta(""); setTimeout(fetchStats, 0); }}
                  style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--accent)", cursor: "pointer", fontSize: ".82rem" }}>
                  Limpiar filtro
                </button>
              )}
            </div>

            {/* KPIs */}
            <div className="kpi-row">
              <div className="kpi"><div className="kpi-val">{stats.resumen.total_pedidos}</div><div className="kpi-lbl">Total pedidos</div></div>
              <div className="kpi"><div className="kpi-val">{stats.resumen.entregados}</div><div className="kpi-lbl">Entregados</div></div>
              <div className="kpi"><div className="kpi-val">{stats.resumen.cancelados}</div><div className="kpi-lbl">Cancelados</div></div>
              <div className="kpi"><div className="kpi-val">{fmt(stats.resumen.ingresos_totales)}</div><div className="kpi-lbl">Ingresos totales</div></div>
              <div className="kpi"><div className="kpi-val">{fmt(stats.resumen.ticket_promedio)}</div><div className="kpi-lbl">Ticket promedio</div></div>
              <div className="kpi"><div className="kpi-val">{stats.resumen.clientes_unicos}</div><div className="kpi-lbl">Clientes únicos</div></div>
            </div>

            <div className="stats-grid">
              {/* Ingresos últimos 30 días */}
              <div className="stats-card" style={{ gridColumn: "1 / -1" }}>
                <h3>Ingresos por día</h3>
                {stats.ingresosPorDia.length === 0 ? <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos aún</p> : (
                  <div className="ingreso-chart">
                    {stats.ingresosPorDia.map((d) => {
                      const max = Math.max(...stats.ingresosPorDia.map((x) => x.ingresos), 1);
                      return (
                        <div key={d.fecha} className="ingreso-row">
                          <span className="ingreso-date">{new Date(d.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span>
                          <div className="ingreso-bar-wrap"><div className="ingreso-bar" style={{ width: `${(d.ingresos / max) * 100}%` }}></div></div>
                          <span className="ingreso-val">{fmt(d.ingresos)}</span>
                          <span style={{ fontSize: ".65rem", color: "var(--muted)", minWidth: 45 }}>{d.pedidos} ped.</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pedidos por hora */}
              <div className="stats-card">
                <h3>Pedidos por hora del día</h3>
                {(() => {
                  const full = Array.from({ length: 24 }, (_, i) => {
                    const found = stats.pedidosPorHora.find((x) => x.hora === i);
                    return { hora: i, cantidad: found ? found.cantidad : 0 };
                  });
                  const max = Math.max(...full.map((x) => x.cantidad), 1);
                  return (
                    <>
                      <div className="hora-chart">
                        {full.map((h) => (
                          <div key={h.hora} className="hora-bar" style={{ height: `${(h.cantidad / max) * 100}%` }} title={`${h.hora}:00 — ${h.cantidad} pedidos`}></div>
                        ))}
                      </div>
                      <div className="hora-labels">
                        {full.map((h) => <span key={h.hora}>{h.hora % 4 === 0 ? `${h.hora}h` : ""}</span>)}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Pedidos por día de la semana */}
              <div className="stats-card">
                <h3>Pedidos por día de la semana</h3>
                {(() => {
                  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                  const full = dias.map((lbl, i) => {
                    const found = stats.pedidosPorDiaSemana.find((x) => x.dia === i);
                    return { lbl, cantidad: found ? found.cantidad : 0 };
                  });
                  const max = Math.max(...full.map((x) => x.cantidad), 1);
                  return (
                    <div className="day-chart">
                      {full.map((d) => (
                        <div key={d.lbl} className="day-col">
                          <span className="day-val">{d.cantidad}</span>
                          <div className="day-bar" style={{ height: `${(d.cantidad / max) * 100}%` }}></div>
                          <span className="day-lbl">{d.lbl}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Top bases */}
              <div className="stats-card">
                <h3>Bases más pedidas</h3>
                <div className="bar-chart">
                  {stats.topBases.map((b, i) => {
                    const max = stats.topBases[0]?.cantidad || 1;
                    return (
                      <div key={b.nombre} className="bar-row">
                        <span className="bar-label">{b.nombre}</span>
                        <div className="bar-track"><div className="bar-fill green" style={{ width: `${(b.cantidad / max) * 100}%` }}></div></div>
                        <span className="bar-val">{b.cantidad}</span>
                      </div>
                    );
                  })}
                  {!stats.topBases.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Top proteínas */}
              <div className="stats-card">
                <h3>Proteínas favoritas</h3>
                <div className="bar-chart">
                  {stats.topProteinas.map((b) => {
                    const max = stats.topProteinas[0]?.cantidad || 1;
                    return (
                      <div key={b.nombre} className="bar-row">
                        <span className="bar-label">{b.nombre}</span>
                        <div className="bar-track"><div className="bar-fill orange" style={{ width: `${(b.cantidad / max) * 100}%` }}></div></div>
                        <span className="bar-val">{b.cantidad}</span>
                      </div>
                    );
                  })}
                  {!stats.topProteinas.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Top toppings */}
              <div className="stats-card">
                <h3>Toppings más elegidos</h3>
                <div className="bar-chart">
                  {stats.topToppings.map((b) => {
                    const max = stats.topToppings[0]?.cantidad || 1;
                    return (
                      <div key={b.nombre} className="bar-row">
                        <span className="bar-label">{b.nombre}</span>
                        <div className="bar-track"><div className="bar-fill gold" style={{ width: `${(b.cantidad / max) * 100}%` }}></div></div>
                        <span className="bar-val">{b.cantidad}</span>
                      </div>
                    );
                  })}
                  {!stats.topToppings.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Top bebidas */}
              <div className="stats-card">
                <h3>Bebidas populares</h3>
                <div className="bar-chart">
                  {stats.topBebidas.map((b) => {
                    const max = stats.topBebidas[0]?.cantidad || 1;
                    return (
                      <div key={b.nombre} className="bar-row">
                        <span className="bar-label">{b.nombre}</span>
                        <div className="bar-track"><div className="bar-fill blue" style={{ width: `${(b.cantidad / max) * 100}%` }}></div></div>
                        <span className="bar-val">{b.cantidad}</span>
                      </div>
                    );
                  })}
                  {!stats.topBebidas.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Top clientes */}
              <div className="stats-card">
                <h3>Clientes frecuentes</h3>
                <table className="mini-table">
                  <thead><tr><th>#</th><th>Cliente</th><th>Pedidos</th><th>Gastado</th></tr></thead>
                  <tbody>
                    {stats.topClientes.map((c, i) => (
                      <tr key={c.nombre}>
                        <td><span className={`rank${i < 3 ? " gold-r" : ""}`}>{i + 1}</span></td>
                        <td>{c.nombre}</td>
                        <td>{c.pedidos}</td>
                        <td>{fmt(c.gastado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!stats.topClientes.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
              </div>

              {/* Top barrios */}
              <div className="stats-card">
                <h3>Barrios con más pedidos</h3>
                <div className="bar-chart">
                  {stats.topBarrios.map((b) => {
                    const max = stats.topBarrios[0]?.pedidos || 1;
                    return (
                      <div key={b.barrio} className="bar-row">
                        <span className="bar-label">{b.barrio}</span>
                        <div className="bar-track"><div className="bar-fill purple" style={{ width: `${(b.pedidos / max) * 100}%` }}></div></div>
                        <span className="bar-val">{b.pedidos}</span>
                      </div>
                    );
                  })}
                  {!stats.topBarrios.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="stats-card">
                <h3>Métodos de pago</h3>
                <div className="bar-chart">
                  {stats.metodosPago.map((m) => {
                    const max = stats.metodosPago[0]?.cantidad || 1;
                    return (
                      <div key={m.metodo_pago} className="bar-row">
                        <span className="bar-label">{m.metodo_pago}</span>
                        <div className="bar-track"><div className="bar-fill green" style={{ width: `${(m.cantidad / max) * 100}%` }}></div></div>
                        <span className="bar-val">{m.cantidad}</span>
                      </div>
                    );
                  })}
                  {!stats.metodosPago.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Productos adicionales más pedidos */}
              <div className="stats-card">
                <h3>Productos adicionales más pedidos</h3>
                <div className="bar-chart">
                  {(stats.topExtras || []).map((b) => {
                    const max = (stats.topExtras || [])[0]?.cantidad || 1;
                    return (
                      <div key={b.nombre} className="bar-row">
                        <span className="bar-label">{b.nombre}</span>
                        <div className="bar-track"><div className="bar-fill purple" style={{ width: `${(b.cantidad / max) * 100}%` }}></div></div>
                        <span className="bar-val">{b.cantidad}</span>
                      </div>
                    );
                  })}
                  {!(stats.topExtras || []).length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
                </div>
              </div>

              {/* Tasa de cancelación semanal */}
              <div className="stats-card">
                <h3>Cancelaciones por semana</h3>
                <table className="mini-table">
                  <thead><tr><th>Semana</th><th>Total</th><th>Cancelados</th><th>Tasa</th></tr></thead>
                  <tbody>
                    {stats.cancelacionSemanal.map((w) => (
                      <tr key={w.semana}>
                        <td>{new Date(w.semana).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</td>
                        <td>{w.total}</td>
                        <td>{w.cancelados}</td>
                        <td style={{ color: w.total > 0 && (w.cancelados / w.total) > 0.15 ? "#991b1b" : "var(--g800)", fontWeight: 700 }}>
                          {w.total > 0 ? Math.round((w.cancelados / w.total) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!stats.cancelacionSemanal.length && <p style={{color:"var(--muted)",fontSize:".82rem"}}>Sin datos</p>}
              </div>
            </div>
          </div>
        )}
      </>)}

      {/* SUGERENCIAS */}
      {view === "sugerencias" && (
        <div className="sug-page">
          <div className="sug-header">
            <h2>Sugerencias de clientes</h2>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <button
                className={`sug-filter-btn${!sugSoloNuevas ? " active" : ""}`}
                onClick={() => { setSugSoloNuevas(false); fetchSugerencias(false); }}
              >Todas</button>
              <button
                className={`sug-filter-btn${sugSoloNuevas ? " active" : ""}`}
                onClick={() => { setSugSoloNuevas(true); fetchSugerencias(true); }}
              >Sin leer</button>
            </div>
          </div>

          {sugLoading ? (
            <div className="stats-loading">Cargando sugerencias...</div>
          ) : !sugerencias.length ? (
            <div className="sug-empty">No hay sugerencias{sugSoloNuevas ? " sin leer" : ""} aún.</div>
          ) : (
            <div className="sug-table-wrap">
              <table className="sug-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Mensaje</th>
                    <th className="col-sug-date">Fecha</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sugerencias.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {s.nombre
                          ? <span className="sug-nombre">{s.nombre}</span>
                          : <span className="sug-anon">Anónimo</span>}
                      </td>
                      <td><p className="sug-msg">{s.mensaje}</p></td>
                      <td className="col-sug-date">
                        <span className="sug-date">
                          {new Date(s.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                          {" "}
                          {new Date(s.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td>
                        {s.leida
                          ? <span className="sug-badge-leida">Leída</span>
                          : <span className="sug-badge-nueva">Nueva</span>}
                      </td>
                      <td>
                        {!s.leida && (
                          <button className="btn-mark-read" onClick={() => marcarLeida(s.id)}>
                            Marcar leída
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USUARIOS */}
      {view === "usuarios" && (<>
        <div className="users-page">
          <div className="users-header">
            <h2>Gestión de usuarios</h2>
            <button className="btn-new-user" onClick={openCreateModal}>+ Nuevo usuario</button>
          </div>

          {staffLoading ? (
            <div className="stats-loading">Cargando usuarios...</div>
          ) : !staffList.length ? (
            <div className="users-empty">No hay usuarios registrados</div>
          ) : (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th className="col-date">Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-name">{u.nombre}</div>
                        <div className="user-email">{u.email}</div>
                      </td>
                      <td><span className={`role-badge ${u.rol}`}>{u.rol === "admin" ? "Admin" : "Empleado"}</span></td>
                      <td>
                        <span className="active-dot">
                          <span className={`dot ${u.activo ? "on" : "off"}`}></span>
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="col-date">{new Date(u.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td>
                        <div className="user-actions">
                          <button className="btn-edit" onClick={() => openEditModal(u)}>Editar</button>
                          <button className={`btn-toggle ${u.activo ? "deactivate" : "activate"}`} onClick={() => toggleUser(u.id)}>
                            {u.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal crear/editar */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>{editingUser ? "Editar usuario" : "Crear usuario"}</h3>
              {formError && <div className="modal-error">{formError}</div>}
              <div className="modal-field">
                <label>Nombre</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Nombre completo" />
              </div>
              <div className="modal-field">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="correo@ejemplo.com" />
              </div>
              <div className="modal-field">
                <label>{editingUser ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? "••••••" : "Mínimo 6 caracteres"} />
              </div>
              <div className="modal-field">
                <label>Rol</label>
                <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
                  <option value="empleado">Empleado</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-modal-save" onClick={saveUser} disabled={formSaving}>{formSaving ? "Guardando..." : "Guardar"}</button>
              </div>
            </div>
          </div>
        )}
      </>)}

      {/* INVENTARIO */}
      {view === "inventario" && (
        <div className="inv-page">
          <h2>Inventario — Disponibilidad de productos</h2>
          {INVENTARIO_GRUPOS.map(({ cat, items }) => (
            <div key={cat} className="inv-section">
              <div className="inv-section-title">{cat}</div>
              <div className="inv-grid">
                {items.map((nombre) => {
                  const agotado = productosDesactivados.has(nombre);
                  return (
                    <div key={nombre} className={`inv-item${agotado ? " agotado" : ""}`}>
                      <span className="inv-name">{nombre}</span>
                      <button
                        className={`inv-toggle ${agotado ? "agotado" : "disponible"}`}
                        onClick={() => toggleProducto(nombre)}
                        disabled={invCargando}
                      >
                        {agotado ? "Sin stock" : "Disponible"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <h3>Confirmar acción</h3>
            <p style={{ fontSize: ".9rem", color: "var(--text)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              {confirmModal.mensaje}
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setConfirmModal(null)}>Cancelar</button>
              <button className="btn-modal-save" onClick={confirmModal.onConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );  
}
