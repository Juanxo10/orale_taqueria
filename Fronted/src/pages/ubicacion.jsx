import Navbar from "../components/Navbar";
import logoDark from "../assets/log.png";

export default function Ubicacion() {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col">
      <Navbar active="ubicacion" />

      {/* Header */}
      <header className="bg-primary px-gutter py-16 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-tertiary-fixed rounded-full mb-5">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="font-label-md text-label-md">VISÍTANOS</span>
        </div>
        <h1 className="font-headline-md text-headline-md md:text-display-lg-mobile text-white leading-tight">
          Nuestra Ubicación
        </h1>
        <p className="font-body-md text-body-md text-white/70 mt-4 max-w-xl mx-auto">
          Encuéntranos en Acacías, Meta. Escríbenos o llámanos si tienes cualquier duda con tu pedido.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 py-section-gap px-gutter bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 items-center gap-16">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex items-start gap-4 bg-surface-container rounded-xl p-5 shadow-[0px_4px_20px_rgba(45,74,47,0.05)]">
                <span className="material-symbols-outlined text-primary-container">location_on</span>
                <div>
                  <p className="font-label-md text-label-md text-primary">Dirección</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Cl. 13 #15-01, Acacías, Meta</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-surface-container rounded-xl p-5 shadow-[0px_4px_20px_rgba(45,74,47,0.05)]">
                <span className="material-symbols-outlined text-primary-container">call</span>
                <div>
                  <p className="font-label-md text-label-md text-primary">Teléfono</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">313 2664332</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Cl.%2013%20%2315-01%2C%20Acac%C3%ADas%2C%20Meta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary-container text-white px-8 py-3 rounded-full font-label-md text-label-md hover:bg-primary transition-all duration-300"
              >
                <span className="material-symbols-outlined text-lg">directions</span>
                Cómo Llegar
              </a>
              <a
                href="tel:+573132664332"
                className="inline-flex items-center gap-2 border border-primary-container text-primary px-8 py-3 rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-white transition-all duration-300"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                Llamar
              </a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl aspect-[4/3]">
            <iframe
              title="Ubicación de Pepas Coffee en Acacías, Meta"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Cl.%2013%20%2315-01%2C%20Acac%C3%ADas%2C%20Meta%2C%20Colombia&output=embed"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img alt="Pepas Coffee" className="h-10 w-auto object-contain" src={logoDark} />
            <span className="font-label-md text-label-md text-on-surface-variant">
              © {new Date().getFullYear()} Pepas Coffee
            </span>
          </div>
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
      </footer>
    </div>
  );
}
