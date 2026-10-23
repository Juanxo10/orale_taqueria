import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo_tacos.jpg";
import { abrirPreferencias } from "../data/preferencias";

const LINKS = [
  { label: "Menú", to: "/menu" },
  { label: "Ubicación", to: "/ubicacion" },
  { label: "Sugerencias y reclamos", to: "/sugerencias" },
];

const LEGAL = [
  { label: "Política de Privacidad", to: "/privacidad" },
  { label: "Términos de Servicio", to: "/terminos" },
];

const SOCIAL =
  "w-11 h-11 rounded-full border border-primary-container flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-white transition-all";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="tex-warm border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-gutter py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img alt="Órale Tacos" className="h-14 w-auto object-contain rounded-xl" src={logo} />
          <p className="flex items-start justify-center md:justify-start gap-2 font-body-md text-sm text-on-surface-variant max-w-xs">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">location_on</span>
            <span>Calle 16 # 31-38, Barrio El Bachué, Acacías, Meta</span>
          </p>
        </div>

        <nav aria-label="Pie de página" className="flex justify-center gap-x-6 gap-y-2 flex-wrap">
          {LINKS.map((l) => (
            <a
              key={l.to}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
              href={l.to}
              onClick={(e) => {
                e.preventDefault();
                navigate(l.to);
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex justify-center gap-3">
          <a className={SOCIAL} href="https://www.facebook.com/p/%C3%93rale-Taquer%C3%ADa-61576360812694/" target="_blank" rel="noopener noreferrer" aria-label="Facebook de Órale Tacos">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.2-2.4-.2-2.5 0-4.2 1.5-4.2 4.3v2.6H7.5v3.3h2.8V22h3.2z" />
            </svg>
          </a>
          <a className={SOCIAL} href="https://www.instagram.com/_oraletaqueria/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Órale Tacos">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-outline-variant py-4">
        <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
          <span className="font-label-md text-xs text-on-surface-variant">
            © {new Date().getFullYear()} Órale Tacos. Todos los derechos reservados.
          </span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {LEGAL.map((l) => (
              <a
                key={l.to}
                className="font-label-md text-xs text-on-surface-variant hover:text-primary"
                href={l.to}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(l.to);
                }}
              >
                {l.label}
              </a>
            ))}
            <button type="button" className="font-label-md text-xs text-on-surface-variant hover:text-primary" onClick={abrirPreferencias}>
              Preferencias de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
