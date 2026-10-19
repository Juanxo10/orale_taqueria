import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo_tacos.jpg";

const LINKS = [
  { label: "Menú", to: "/menu" },
  { label: "Ubicación", to: "/ubicacion" },
  { label: "Sugerencias", to: "/sugerencias" },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="tex-warm border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-gutter py-14 md:py-section-gap grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        <div>
          <div className="flex items-center mb-5 md:mb-6">
            <img alt="Órale Tacos" className="h-16 w-auto object-contain rounded-xl" src={logo} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            Tacos hechos al momento, con salsa de la casa y mucho sabor.
          </p>
          <p className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant mb-6">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            Diagonal 8 #8-99, Acacías, Meta
          </p>
          <a
            className="w-11 h-11 rounded-full border border-primary-container flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-white transition-all"
            href="https://www.instagram.com/_oraletaqueria/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Órale Tacos"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-primary mb-4 md:mb-6 uppercase tracking-widest">Navegación</h4>
          <ul className="space-y-3 md:space-y-4">
            {LINKS.map((l) => (
              <li key={l.to}>
                <a
                  className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  href={l.to}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(l.to);
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
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
  );
}
