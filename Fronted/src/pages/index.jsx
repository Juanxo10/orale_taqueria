import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/Logo_tacos.jpg";
import heroImg from "../assets/taco4.jpg";
import img5 from "../assets/taco5.jpg";
import img1 from "../assets/taco1.jpg";
import img3 from "../assets/taco3.jpg";
import experienceImg from "../assets/taco2.jpg";

const TICKER = ["Tacos al momento", "Salsas de la casa", "Limón y cilantro", "Tortilla recién hecha", "Nachos con queso", "Órale, pide ya"];

const FAVORITOS = [
  { img: img1, alt: "Taco de carne desmechada con limón", tag: "Tacos", title: "Tacos de la Casa", text: "Tortilla doblada al comal, carne jugosa, cebolla, cilantro y limón al gusto.", hot: false },
  { img: heroImg, alt: "Charola de tacos con salsas", tag: "Favorito de la Casa", title: "Charola Órale", text: "La charola completa para compartir, con salsas y limón. Arma la tuya desde el menú.", hot: true },
  { img: img3, alt: "Nachos con queso derretido y pico de gallo", tag: "Para picar", title: "Nachos Órale", text: "Totopos crujientes con queso, pico de gallo y guacamole. Perfectos para acompañar.", hot: false },
];

export default function Index() {
  const navigate = useNavigate();

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

    const targets = document.querySelectorAll("section > div");
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
      <header className="relative min-h-[100svh] w-full flex items-center overflow-hidden pt-32 pb-20 md:pt-28 md:pb-16">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(254,43,36,0.55),transparent_60%),radial-gradient(ellipse_at_10%_90%,rgba(251,186,36,0.14),transparent_50%)]" />
        <svg className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" aria-hidden="true">
          <path className="draw-line" d="M0 120 H140 Q170 120 170 150 V260" fill="none" stroke="#fbba24" strokeWidth="2" strokeDasharray="6 10" />
        </svg>

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
                className="bg-primary-container text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-label-md text-base md:text-lg shadow-[0_6px_0_#8f0f0b] hover:translate-y-[3px] hover:shadow-[0_3px_0_#8f0f0b] active:translate-y-[6px] active:shadow-none transition-all duration-200"
                onClick={() => navigate("/menu")}
              >
                Pedir mis tacos
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

      {/* Esencia */}
      <section id="philosophy" className="py-16 md:py-section-gap px-gutter bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 items-center gap-10 md:gap-16">
          <div className="relative">
            <div className="aspect-[4/3] sm:aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-outline-variant">
              <img className="w-full h-full object-cover" alt="Nachos con queso, pico de gallo y guacamole" src={img5} />
            </div>
            <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-primary rounded-full items-center justify-center text-on-primary hidden md:flex rotate-12 shadow-xl">
              <span className="material-symbols-outlined text-7xl flame" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
          </div>
          <div className="space-y-5 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/15 text-primary rounded-full">
              <span className="material-symbols-outlined text-sm">restaurant</span>
              <span className="font-label-md text-label-md">NUESTRA ESENCIA</span>
            </div>
            <h2 className="font-headline-md text-[28px] md:text-headline-md text-primary leading-tight">
              Sabor de taquería, hecho al momento.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Cada pedido sale del comal directo a tu mesa: tortilla calientita, carne jugosa, salsas de la casa, limón y cilantro.
              Sin congelados ni atajos, y con precios siempre claros.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant italic border-l-4 border-primary-container pl-4 md:pl-6">
              "Un buen taco no se explica: se prueba, se exprime un limón encima y se repite."
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label-md text-label-md">Tortilla al comal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label-md text-label-md">Entrega en 30–45 min</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-label-md text-label-md">Pago Contraentrega</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Favoritos */}
      <section className="py-16 md:py-section-gap px-gutter bg-surface-container">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-10 md:mb-20">
            <h2 className="font-headline-md text-[28px] md:text-headline-md text-primary mb-4">
              Los Favoritos de la Casa
            </h2>
            <div className="w-24 h-1.5 bg-primary-container mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {FAVORITOS.map((c) => (
              <div
                key={c.title}
                className={`group card-hot rounded-xl overflow-hidden border-2 ${c.hot ? "bg-primary-container text-white border-primary shadow-2xl" : "bg-surface-container-lowest border-outline-variant"}`}
              >
                <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/5] overflow-hidden relative">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={c.alt} src={c.img} />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full font-label-md text-label-md ${c.hot ? "bg-primary text-on-primary" : "bg-black/70 backdrop-blur text-primary"}`}>
                    {c.tag}
                  </div>
                </div>
                <div className="p-6 md:p-8 text-center">
                  <h3 className="font-headline-sm text-headline-sm mb-2 text-primary">{c.title}</h3>
                  <p className={`font-body-md text-body-md mb-6 ${c.hot ? "text-white/90" : "text-on-surface-variant"}`}>{c.text}</p>
                  <button
                    className={`inline-flex items-center gap-1 font-label-md text-label-md ${c.hot ? "text-white" : "text-primary-container"} group-hover:gap-3 transition-all`}
                    onClick={() => navigate("/menu")}
                  >
                    Pedir ahora <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 md:mt-16 text-center">
            <button
              className="inline-flex items-center gap-2 font-label-md text-label-md text-primary border-b-2 border-primary-container pb-1 hover:gap-4 transition-all"
              onClick={() => navigate("/menu")}
            >
              Ver Menú Completo
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Experiencia */}
      <section id="experience" className="relative min-h-[520px] md:min-h-[600px] py-16 md:py-24 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-scroll md:bg-fixed bg-cover bg-center"
          role="img"
          aria-label="Totopo con guacamole sobre fondo rojo"
          style={{ backgroundImage: `url(${experienceImg})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-gutter max-w-3xl mx-auto">
          <h2 className="font-headline-md text-[28px] md:text-headline-md mb-4 md:mb-6 text-primary">
            Calientitos, a tu Puerta
          </h2>
          <p className="font-body-lg text-base md:text-body-lg mb-8 md:mb-10 text-white/90">
            Sin filas ni complicaciones: pides, nosotros armamos los tacos al momento y tú esperas en casa con la salsa lista.
          </p>
          <button
            className="bg-primary text-on-primary w-full max-w-xs sm:w-auto sm:max-w-none px-10 py-4 rounded-full font-label-md text-label-md shadow-[0_5px_0_#7a4d00] hover:translate-y-[2px] hover:shadow-[0_3px_0_#7a4d00] transition-all"
            onClick={() => navigate("/menu")}
          >
            Pedir Ahora
          </button>
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 border-t border-white/20 pt-8 md:pt-10">
            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">schedule</span>
              <span className="font-label-md text-label-md">Entrega en 30–45 min</span>
            </div>
            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">moped</span>
              <span className="font-label-md text-label-md">Domicilio $6.000</span>
            </div>
            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl text-primary">payments</span>
              <span className="font-label-md text-label-md">Pago Contraentrega</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter py-14 md:py-section-gap grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          <div>
            <div className="flex items-center mb-5 md:mb-6">
              <img alt="Órale Tacos" className="h-16 w-auto object-contain rounded-xl" src={logo} />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Tacos hechos al momento, con salsa de la casa y mucho sabor.
            </p>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-primary mb-4 md:mb-6 uppercase tracking-widest">
              Navegación
            </h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a
                  className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  href="/menu"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/menu");
                  }}
                >
                  Menú
                </a>
              </li>
              <li>
                <a
                  className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  href="/ubicacion"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/ubicacion");
                  }}
                >
                  Ubicación
                </a>
              </li>
              <li>
                <a
                  className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  href="/sugerencias"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/sugerencias");
                  }}
                >
                  Sugerencias
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant py-6 md:py-8">
          <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
            <span className="font-label-md text-label-md text-on-surface-variant">
              © {new Date().getFullYear()} Órale Tacos. Todos los derechos reservados.
            </span>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary" href="#">
                Política de Privacidad
              </a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary" href="#">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
