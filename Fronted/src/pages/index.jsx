import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/image.png";
import logoDark from "../assets/log.png";
import heroImg from "../assets/imageninicio.jpg";
import img5 from "../assets/5.jpeg";
import img1 from "../assets/1-crop.jpeg";
import img3 from "../assets/3.jpeg";
import img4 from "../assets/4.jpeg";
import experienceImg from "../assets/imaggg.jpg";

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

      {/* Hero Section */}
      <header className="relative min-h-[100svh] md:h-screen w-full flex items-center justify-center overflow-hidden pt-28 pb-24 md:pt-0 md:pb-0">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
            style={{ backgroundImage: `url(${heroImg})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/34" />
        </div>
        <div className="relative z-10 text-center px-gutter max-w-4xl mx-auto flex flex-col items-center">
          <img
            alt="Pepas Coffee"
            src={logo}
            className="h-20 sm:h-28 md:h-36 w-auto object-contain mb-6 md:mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          />
          <p className="font-label-md text-xs sm:text-base md:text-lg font-bold text-white uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-6 hero-text-shadow">
            Nutriendo tu alma en cada sorbo y bocado
          </p>
          <h1 className="font-display-lg text-[34px] leading-[1.15] sm:text-display-lg-mobile md:text-display-lg text-white mb-5 md:mb-8 hero-text-shadow">
            Bowls armados por ti
          </h1>
          <p className="font-body-lg text-base sm:text-xl md:text-2xl font-semibold text-white mb-8 md:mb-12 max-w-2xl mx-auto hero-text-shadow">
            Elige tu base, tus toppings favoritos y la proteína que prefieras. Lo preparamos al momento y lo
            llevamos a tu puerta.
          </p>
          <button
            className="bg-primary-container text-white w-full max-w-xs md:w-auto md:max-w-none px-8 py-4 md:px-12 md:py-5 rounded-full font-label-md text-base md:text-lg hover:scale-105 hover:bg-primary transition-all duration-300 shadow-xl"
            onClick={() => navigate("/menu")}
          >
            Armar mi Bowl
          </button>
        </div>
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="material-symbols-outlined text-white text-3xl md:text-4xl">expand_more</span>
        </div>
      </header>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-16 md:py-section-gap px-gutter bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 items-center gap-10 md:gap-16">
          <div className="relative">
            <div className="aspect-[4/3] sm:aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
              <img
                className="w-full h-full object-cover"
                alt="Bowl armado de Pepas Coffee con pollo, carne, papas criollas, brócoli y una bebida natural."
                src={img5}
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary-container rounded-full items-center justify-center text-white hidden md:flex">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
          </div>
          <div className="space-y-5 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/10 text-primary-container rounded-full">
              <span className="material-symbols-outlined text-sm">potted_plant</span>
              <span className="font-label-md text-label-md">NUESTRA ESENCIA</span>
            </div>
            <h2 className="font-headline-md text-[26px] md:text-headline-md text-primary leading-tight">
              Un Compromiso con la Claridad, la Calidad y el Bienestar.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Armamos cada bowl al momento con ingredientes frescos, sin conservantes ni congelados. Tú eliges tu
              base, tus toppings y tu proteína, y lo llevamos hasta tu puerta en 30–45 minutos, con precios
              siempre transparentes.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant italic border-l-4 border-primary-container pl-4 md:pl-6">
              "No solo servimos comida; servimos vitalidad. Nuestro menú es un recorrido curado por sabores de
              temporada que respetan tanto el paladar como el cuerpo."
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">check_circle</span>
                <span className="font-label-md text-label-md">Ingredientes Frescos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">check_circle</span>
                <span className="font-label-md text-label-md">Entrega en 30–45 min</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">check_circle</span>
                <span className="font-label-md text-label-md">Pago Contraentrega</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section (Bento Style) */}
      <section className="py-16 md:py-section-gap px-gutter bg-surface-container">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-10 md:mb-20">
            <h2 className="font-headline-md text-[26px] md:text-headline-md text-primary mb-4">
              La Curaduría de Temporada
            </h2>
            <div className="w-24 h-1 bg-primary-container mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1 */}
            <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(45,74,47,0.05)] hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/5] overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="Croissant relleno de paté de pollo, queso sabanero, lechuga y pepino."
                  src={img4}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary font-label-md text-label-md">
                  Panadería
                </div>
              </div>
              <div className="p-6 md:p-8 text-center">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Croissant de Paté de Pollo</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Horneado y relleno con paté de pollo, queso sabanero, lechuga y pepino fresco.
                </p>
                <span className="font-headline-sm text-headline-sm text-primary-container">$12.500</span>
              </div>
            </div>

            {/* Card 2 (Highlight) */}
            <div className="group bg-primary-container text-white rounded-xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/5] overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="Bowl Pepas con arroz integral, pollo a la plancha, aguacate, tomate cherry, repollo morado y mango."
                  src={img1}
                />
                <div className="absolute top-4 left-4 bg-tertiary-fixed text-primary px-3 py-1 rounded-full font-label-md text-label-md">
                  Favorito de la Casa
                </div>
              </div>
              <div className="p-6 md:p-8 text-center">
                <h3 className="font-headline-sm text-headline-sm mb-2">Bowl Pepas Clásico</h3>
                <p className="font-body-md text-body-md text-on-primary-container mb-6">
                  Arroz integral, aguacate, tomate cherry, repollo morado, mango y pollo a la plancha. Arma el
                  tuyo eligiendo base, toppings y proteína.
                </p>
                <span className="font-headline-sm text-headline-sm text-tertiary-fixed">Desde $12.000</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(45,74,47,0.05)] hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/5] overflow-hidden relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="Latte con arte latte servido en taza de cerámica."
                  src={img3}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary font-label-md text-label-md">
                  Café
                </div>
              </div>
              <div className="p-6 md:p-8 text-center">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Latte</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Espresso y leche vaporizada, suave y equilibrado. El acompañante perfecto para tu bowl.
                </p>
                <span className="font-headline-sm text-headline-sm text-primary-container">$9.700</span>
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-16 text-center">
            <button
              className="inline-flex items-center gap-2 font-label-md text-label-md text-primary border-b-2 border-primary-container pb-1 hover:text-primary-container transition-all"
              onClick={() => navigate("/menu")}
            >
              Ver Menú Completo
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section (Atmospheric) */}
      <section id="experience" className="relative min-h-[520px] md:min-h-[600px] py-16 md:py-24 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-scroll md:bg-fixed bg-cover bg-center"
          role="img"
          aria-label="Mesa de madera oscura servida con un desayuno completo: omelette, jugo de naranja, capuchino, fruta fresca, sándwich y bowl de açaí."
          style={{ backgroundImage: `url(${experienceImg})` }}
        />
        <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" />
        <div className="relative z-10 text-center text-white px-gutter max-w-3xl mx-auto">
          <h2 className="font-headline-md text-[26px] md:text-headline-md mb-4 md:mb-6 italic">
            Frescura que Llega a tu Puerta
          </h2>
          <p className="font-body-lg text-base md:text-body-lg mb-8 md:mb-10 text-white/90">
            Cada bowl se prepara al momento con ingredientes reales, listo para disfrutar donde estés. Sin
            filas, sin complicaciones: solo pides y esperas en casa.
          </p>
          <button
            className="bg-white text-primary w-full max-w-xs sm:w-auto sm:max-w-none px-10 py-4 rounded-full font-label-md text-label-md hover:bg-primary-fixed transition-colors"
            onClick={() => navigate("/menu")}
          >
            Pedir Ahora
          </button>
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 border-t border-white/20 pt-8 md:pt-10">
            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl text-tertiary-fixed">schedule</span>
              <span className="font-label-md text-label-md">Entrega en 30–45 min</span>
            </div>
            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl text-tertiary-fixed">moped</span>
              <span className="font-label-md text-label-md">Domicilio $6.000</span>
            </div>
            <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
              <span className="material-symbols-outlined text-2xl md:text-3xl text-tertiary-fixed">payments</span>
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
              <img alt="Pepas Coffee" className="h-12 w-auto object-contain" src={logoDark} />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Nutriendo tu cuerpo, mente y alma desde 2018. Ingredientes puros, intención pura.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full border border-primary-container flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-white transition-all"
                href="https://www.instagram.com/pepascoffee/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Pepas Coffee"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
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
              © {new Date().getFullYear()} Pepas Coffee. Nutriendo tu cuerpo, mente y alma.
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
