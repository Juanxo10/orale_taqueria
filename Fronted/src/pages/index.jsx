import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logo from "../assets/Logo_tacos.jpg";
import heroImg from "../assets/taco4.jpg";
import img5 from "../assets/taco5.jpg";
import img1 from "../assets/taco1.jpg";
import img3 from "../assets/taco3.jpg";
import img6 from "../assets/taco6.jpg";
import img7 from "../assets/taco7.jpg";
import img8 from "../assets/taco8.jpg";
import experienceImg from "../assets/taco2.jpg";
import tacoSide from "../assets/tacoinicio.png";
import video2 from "../assets/videotaco2.mp4";
import video3 from "../assets/videotaco3.mp4";
import video4 from "../assets/videotaco4.mp4";
import video5 from "../assets/videotaco5.mp4";

const TICKER = ["Tacos al momento", "Salsas de la casa", "Limón y cilantro", "Tortilla recién hecha", "Nachos con queso", "Órale, pide ya"];

const ANTOJOS = [
  { title: "Tacos Cochinita Pibil", tag: "Tacos", text: "Cochinita al pibil con cebolla morada, salsas de la casa y limón.", img: img6, alt: "Tacos de cochinita pibil sobre tabla de madera" },
  { title: "Nachos Órale", tag: "Para picar", text: "Totopos crujientes con queso, pico de gallo y guacamole.", img: img5, alt: "Nachos con queso derretido y pico de gallo" },
  { title: "Charola de Tacos", tag: "Para compartir", text: "Varios tacos en una charola, con salsas y limón al lado.", img: heroImg, alt: "Charola de tacos con salsas" },
  { title: "Directo del comal", tag: "Del comal", text: "Mira cómo los armamos: todo se hace al momento.", img: img7, video: video2, alt: "Preparación de tacos" },
];

const PASOS = [
  { title: "Eliges tus tacos", text: "Escoge tus tacos, tus salsas y los extras que quieras desde el menú.", chips: ["Tacos", "Salsas", "Extras"], img: img3, alt: "Tacos con salsa goteando", bg: "#fe2b24", fg: "#ffffff", accent: "#fbba24" },
  { title: "Al comal, al momento", text: "Tortilla recién calentada, carne jugosa y todo armado cuando lo pides.", chips: ["Sin congelados", "Bien calientitos"], img: img1, video: video3, alt: "Taco con limón", bg: "#1d1210", fg: "#fbf1e3", accent: "#fe2b24" },
  { title: "A tu puerta", text: "Lo llevamos en 30–45 minutos. Pagas en línea, sin complicaciones.", chips: ["30–45 min", "Domicilio $6.000", "Pago en línea"], img: img8, alt: "Plato de tacos servido", bg: "#fbba24", fg: "#2a1204", accent: "#fe2b24" },
];

// Taco decorativo que asoma en diagonal desde un costado (PNG 360x360: no ampliar de ~260px).
function SideTaco({ className = "", rot = 0, flip = false, delay = 0 }) {
  return (
    <img
      src={tacoSide}
      alt=""
      aria-hidden="true"
      className={`float-diag hidden md:block absolute z-0 pointer-events-none select-none w-44 lg:w-60 drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)] ${className}`}
      style={{ "--r": `${rot}deg`, "--sx": flip ? -1 : 1, animationDelay: `${delay}s` }}
    />
  );
}

// Video que solo carga y reproduce cuando está visible (videotaco1 pesa ~32 MB).
function LazyVideo({ src, poster, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className={className} src={src} poster={poster} muted loop playsInline preload="none" />;
}

// Los videos son verticales (720x1280): se muestran completos, sin recorte ni zoom,
// sobre un fondo difuminado del póster para rellenar el marco horizontal.
function VerticalVideo({ src, poster }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-60" />
      <LazyVideo src={src} poster={poster} className="relative z-10 h-full w-auto max-w-full mx-auto object-contain" />
    </div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setActive((i) => (i + 1) % ANTOJOS.length);
      setTick((t) => t + 1);
    }, 5000);
    return () => clearTimeout(id);
  }, [active, paused]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll("section:not([data-stack]) > div");
    targets.forEach((el) => {
      el.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-10");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">
      <Navbar active="inicio" position="fixed" />

      {/* Hero */}
      <header className="tex-ember min-h-[100svh] w-full flex items-center overflow-hidden pt-32 pb-20 md:pt-28 md:pb-16">
        <svg className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" aria-hidden="true">
          <path className="draw-line" d="M0 120 H140 Q170 120 170 150 V260" fill="none" stroke="#fbba24" strokeWidth="2" strokeDasharray="6 10" />
        </svg>

        <SideTaco className="-left-24 lg:-left-28 -bottom-6" rot={-22} />
        <SideTaco className="-right-16 top-28 !w-36 lg:!w-44" rot={24} flip delay={1.2} />
        <div className="relative z-10 max-w-container-max mx-auto w-full px-gutter grid md:grid-cols-2 items-center gap-10 md:gap-6">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="rise inline-flex items-center gap-3 mb-6 px-3 py-2 rounded-full bg-white/5 border border-outline-variant" style={{ animationDelay: "0.1s" }}>
              <span className="w-6 h-6 rounded-md bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-base flame" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </span>
              <span className="font-label-md text-xs sm:text-sm text-on-surface">Tortilla al comal, salsa picando</span>
            </div>
            <h1 className="rise font-display-lg text-[44px] leading-[1.05] sm:text-display-lg-mobile md:text-display-lg text-on-surface mb-5 md:mb-7" style={{ animationDelay: "0.25s" }}>
              Tacos que te hacen decir{" "}
              <span className="keyword inline-block -rotate-2 hover:rotate-0 transition-transform">¡Órale!</span>
            </h1>
            <p className="rise font-body-lg text-base sm:text-xl text-on-surface-variant mb-8 md:mb-10 max-w-xl" style={{ animationDelay: "0.4s" }}>
              Elige tus tacos, tu salsa y tus extras. Los armamos al momento, bien calientitos, y los llevamos hasta tu puerta.
            </p>
            <div className="rise flex flex-col sm:flex-row gap-3 w-full sm:w-auto" style={{ animationDelay: "0.55s" }}>
              <button
                className="btn-orale btn-orale--rojo btn-orale--grande"
                onClick={() => navigate("/menu")}
              >
                <span className="material-symbols-outlined" aria-hidden="true">local_fire_department</span>Pedir mis tacos
              </button>
              <button
                className="bg-transparent border-2 border-primary text-primary px-8 py-4 md:px-10 md:py-5 rounded-full font-label-md text-base md:text-lg hover:bg-primary hover:text-on-primary transition-colors duration-300"
                onClick={() => navigate("/ubicacion")}
              >
                Dónde estamos
              </button>
            </div>
          </div>

          <div className="rise relative mx-auto w-full max-w-sm md:max-w-md" style={{ animationDelay: "0.4s" }}>
            <div className="float-soft relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border-4 border-primary shadow-[0_30px_60px_-20px_rgba(254,43,36,0.6)] rotate-2">
              <img className="w-full h-full object-cover" alt="Charola de tacos con salsas y limón" src={heroImg} />
            </div>
            <div className="float-tilt absolute -left-3 sm:-left-8 bottom-16 bg-white text-on-primary rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 font-label-md text-sm">
              <span className="w-3 h-3 rounded-full bg-primary-container pulse-live" />
              Recién hecho · en comal
            </div>
            <img
              src={logo}
              alt="Órale Tacos"
              className="spin-slow absolute -top-6 -right-3 sm:-right-8 w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-background shadow-xl"
            />
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <span className="material-symbols-outlined text-primary text-3xl">expand_more</span>
        </div>
      </header>

      {/* Cinta de tacos */}
      <div className="bg-primary-container border-y-4 border-primary overflow-hidden py-3 -rotate-1 scale-[1.02]" aria-hidden="true">
        <div className="marquee">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center font-display-lg text-xl md:text-2xl text-white uppercase whitespace-nowrap">
              <span className="px-6">{t}</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </span>
          ))}
        </div>
      </div>

      {/* Elige tu antojo: lista interactiva + media que cambia (video incluido) */}
      <section id="antojo" className="tex-grid overflow-hidden py-16 md:py-section-gap px-gutter">
        <SideTaco className="-right-16 lg:-right-20 top-8" rot={20} flip />
        <div className="relative z-10 max-w-container-max mx-auto">
          <div className="mb-10 md:mb-14 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/15 text-primary rounded-full font-label-md text-label-md mb-4">
              <span className="material-symbols-outlined text-sm">restaurant</span> EL MENÚ DE LA CASA
            </span>
            <h2 className="font-headline-md text-[30px] md:text-headline-md text-on-surface leading-tight">
              ¿Qué se te <span className="keyword">antoja</span> hoy?
            </h2>
          </div>

          <div className="grid md:grid-cols-[1fr_1.05fr] gap-8 md:gap-14 items-center">
            <ul className="order-2 md:order-1 space-y-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              {ANTOJOS.map((a, i) => (
                <li key={a.title}>
                  <button
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    className={`relative w-full text-left rounded-2xl px-5 py-4 border-2 transition-all duration-300 overflow-hidden ${
                      active === i ? "bg-surface-container border-primary-container" : "border-transparent hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <span className={`font-display-lg text-2xl md:text-3xl ${active === i ? "text-primary" : "text-outline"}`}>0{i + 1}</span>
                      <span className="flex-1">
                        <span className={`block font-headline-sm text-lg md:text-xl ${active === i ? "text-on-surface" : "text-on-surface-variant"}`}>{a.title}</span>
                        <span className={`block font-body-md text-sm text-on-surface-variant transition-all duration-500 overflow-hidden ${active === i ? "max-h-24 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                          {a.text}
                        </span>
                      </span>
                      <span className={`material-symbols-outlined transition-transform ${active === i ? "text-primary-container rotate-45" : "text-outline"}`}>add</span>
                    </span>
                    {active === i && !paused && <span key={tick} className="absolute left-0 bottom-0 h-1 bg-primary progress-bar" />}
                  </button>
                </li>
              ))}
              <li className="pt-4">
                <button
                  className="bg-primary-container text-white px-8 py-4 rounded-full font-label-md text-label-md shadow-[0_5px_0_#8f0f0b] hover:translate-y-[2px] hover:shadow-[0_3px_0_#8f0f0b] transition-all"
                  onClick={() => navigate("/menu")}
                >
                  Ver el menú completo
                </button>
              </li>
            </ul>

            <div className="order-1 md:order-2 relative aspect-[4/5] max-h-[620px] w-full mx-auto rounded-[2rem] overflow-hidden border-4 border-primary shadow-[0_30px_60px_-24px_rgba(254,43,36,0.55)]">
              {ANTOJOS.map((a, i) => (
                <div key={a.title} className={`absolute inset-0 transition-opacity duration-700 ${active === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  {a.video ? (
                    <VerticalVideo src={a.video} poster={a.img} />
                  ) : (
                    <img className="w-full h-full object-cover" src={a.img} alt={a.alt} loading="lazy" />
                  )}
                </div>
              ))}
              <span className="absolute top-4 left-4 bg-primary text-on-primary rounded-full px-3 py-1 font-label-md text-label-md">{ANTOJOS[active].tag}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Del comal a tu puerta: paneles que se apilan al hacer scroll */}
      <section id="proceso" className="tex-warm py-16 md:py-section-gap px-gutter">
        <div className="max-w-container-max mx-auto">
          <h2 className="font-headline-md text-[30px] md:text-headline-md text-on-surface text-center mb-10 md:mb-16">
            Del comal a <span className="keyword">tu puerta</span>
          </h2>
          <div className="space-y-8 md:space-y-14">
            {PASOS.map((p, i) => (
              <article
                key={p.title}
                className="grid md:grid-cols-2 gap-0 rounded-[2rem] overflow-hidden border-2 border-outline-variant shadow-2xl md:h-[460px]"
                style={{ background: p.bg, color: p.fg }}
              >
                <div className={`p-8 md:p-12 flex flex-col justify-center gap-4 ${i % 2 ? "md:order-2" : ""}`}>
                  <span className="font-display-lg text-6xl md:text-8xl opacity-90" style={{ color: p.accent }}>0{i + 1}</span>
                  <h3 className="font-headline-md text-[26px] md:text-3xl leading-tight">{p.title}</h3>
                  <p className="font-body-md text-body-md opacity-90 max-w-md">{p.text}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.chips.map((c) => (
                      <span key={c} className="px-3 py-1.5 rounded-full text-sm font-label-md" style={{ background: "rgba(0,0,0,0.22)" }}>{c}</span>
                    ))}
                  </div>
                </div>
                <div className={`relative min-h-[320px] md:min-h-0 ${p.video ? "min-h-[460px]" : ""}`}>
                  {p.video ? (
                    <VerticalVideo src={p.video} poster={p.img} />
                  ) : (
                    <img className="absolute inset-0 w-full h-full object-cover" src={p.img} alt={p.alt} loading="lazy" />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mosaico tipo bento con fotos y video */}
      <section id="mosaico" className="tex-grid overflow-hidden py-16 md:py-section-gap px-gutter">
        <SideTaco className="-left-14 top-10 !w-36 lg:!w-48" rot={-16} delay={0.6} />
        <SideTaco className="-right-14 top-10 !w-36 lg:!w-48" rot={16} flip delay={1.8} />
        <div className="relative z-10 max-w-container-max mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-headline-md text-[30px] md:text-headline-md text-primary mb-4">Pura casa, pura sazón</h2>
            <div className="w-24 h-1.5 bg-primary-container mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3 md:gap-5">
            <figure className="group relative col-span-2 row-span-2 rounded-[2rem] overflow-hidden card-hot border-2 border-transparent">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={img6} alt="Tacos cochinita pibil con cebolla morada y salsas" loading="lazy" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                <span className="font-display-lg text-2xl md:text-3xl text-primary">Cochinita Pibil</span>
              </figcaption>
            </figure>
            <figure className="group relative row-span-2 rounded-[2rem] overflow-hidden card-hot border-2 border-transparent">
              <LazyVideo src={video4} poster={img7} className="w-full h-full object-cover" />
            </figure>
            <figure className="group relative rounded-[2rem] overflow-hidden card-hot border-2 border-transparent">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={img7} alt="Limón exprimido sobre tacos" loading="lazy" />
            </figure>
            <div className="rounded-[2rem] bg-primary text-on-primary p-5 flex flex-col justify-between card-hot border-2 border-transparent">
              <span className="material-symbols-outlined text-4xl flame" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <div>
                <p className="font-display-lg text-3xl md:text-4xl leading-none">30–45</p>
                <p className="font-label-md text-label-md">minutos a tu puerta</p>
              </div>
            </div>
            <figure className="group relative col-span-2 rounded-[2rem] overflow-hidden card-hot border-2 border-transparent">
              <img className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" src={img8} alt="Tacos dorados servidos en plato azul con limón" loading="lazy" />
            </figure>
            <button
              onClick={() => navigate("/menu")}
              className="group col-span-2 rounded-[2rem] bg-primary-container text-white p-5 md:p-8 flex flex-col justify-between text-left card-hot border-2 border-transparent"
            >
              <span className="font-display-lg text-2xl md:text-3xl leading-tight">¡Pide ya!</span>
              <span className="material-symbols-outlined text-3xl self-end group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Cierre: texto + video vertical en su formato */}
      <section id="experience" className="tex-ember py-16 md:py-24 px-gutter overflow-hidden">
        <div className="relative z-10 max-w-container-max mx-auto grid md:grid-cols-[1.1fr_0.9fr] items-center gap-10 md:gap-16">
          <div className="text-center md:text-left">
            <h2 className="font-headline-md text-[30px] md:text-headline-md mb-4 md:mb-6 text-primary">Calientitos, a tu Puerta</h2>
            <p className="font-body-lg text-base md:text-body-lg mb-8 md:mb-10 text-on-surface-variant max-w-xl mx-auto md:mx-0">
              Sin filas ni complicaciones: pides, nosotros armamos los tacos al momento y tú esperas en casa con la salsa lista.
            </p>
            <button
              className="btn-orale btn-orale--grande w-full max-w-xs sm:w-auto sm:max-w-none"
              onClick={() => navigate("/menu")}
            >
              <span className="material-symbols-outlined" aria-hidden="true">local_fire_department</span>Pedir ahora
            </button>
            <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 border-t border-outline-variant pt-8 md:pt-10 text-on-surface">
              <div className="flex flex-row sm:flex-col items-center md:items-start justify-center gap-3 sm:gap-2">
                <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">schedule</span>
                <span className="font-label-md text-label-md">Entrega en 30–45 min</span>
              </div>
              <div className="flex flex-row sm:flex-col items-center md:items-start justify-center gap-3 sm:gap-2">
                <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">moped</span>
                <span className="font-label-md text-label-md">Domicilio $6.000</span>
              </div>
              <div className="flex flex-row sm:flex-col items-center md:items-start justify-center gap-3 sm:gap-2">
                <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">payments</span>
                <span className="font-label-md text-label-md">Pago en línea</span>
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[300px] md:max-w-[340px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border-4 border-primary shadow-[0_30px_60px_-20px_rgba(254,43,36,0.6)] float-soft">
            <LazyVideo src={video5} poster={experienceImg} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
