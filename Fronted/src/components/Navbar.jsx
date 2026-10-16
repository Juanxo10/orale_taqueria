import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/image.png";

const LINKS = [
  { id: "inicio", label: "Inicio", to: "/" },
  { id: "ubicacion", label: "Ubicación", to: "/ubicacion" },
  { id: "sugerencias", label: "Sugerencias", to: "/sugerencias" },
];

const POSITION_CLASS = {
  fixed: "fixed top-0 left-0",
  sticky: "sticky top-0",
  static: "",
};

export default function Navbar({ active, position = "static", rightSlot, showLinks = true }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <nav
      className={`w-full z-50 glass-nav shadow-[0px_4px_20px_rgba(45,74,47,0.05)] ${POSITION_CLASS[position]}`}
    >
      <div className="flex justify-between items-center gap-3 w-full px-gutter max-w-container-max mx-auto py-3 md:py-4">
        <button
          className="flex items-center flex-shrink-0"
          onClick={() => goTo("/")}
          aria-label="Ir al inicio"
        >
          <img alt="Pepas Coffee" className="h-12 md:h-16 w-auto object-contain" src={logo} />
        </button>

        {showLinks && (
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => (
              <a
                key={link.id}
                className={
                  active === link.id
                    ? "font-label-md text-label-md text-white border-b-2 border-on-primary-container pb-1 transition-colors"
                    : "font-label-md text-label-md text-on-primary-container hover:text-white transition-colors"
                }
                href={link.to}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(link.to);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-0">
          {rightSlot ?? (
            <button
              className="bg-surface-container-lowest text-primary flex-shrink-0 whitespace-nowrap px-5 py-2.5 md:px-8 md:py-3 rounded-full font-label-md text-label-md hover:bg-primary hover:text-white transition-all duration-300"
              onClick={() => goTo("/menu")}
            >
              Pedir Ahora
            </button>
          )}

          {showLinks && (
            <button
              className="md:hidden flex-shrink-0 w-11 h-11 flex items-center justify-center text-on-primary-container hover:text-white transition-colors"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              <span className="material-symbols-outlined text-3xl">{menuOpen ? "close" : "menu"}</span>
            </button>
          )}
        </div>
      </div>

      {showLinks && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-64" : "max-h-0"
          }`}
        >
          <div className="flex flex-col px-gutter pb-4 border-t border-white/10">
            {LINKS.map((link) => (
              <a
                key={link.id}
                className={
                  active === link.id
                    ? "font-label-md text-label-md text-white py-3 border-b border-white/10 transition-colors"
                    : "font-label-md text-label-md text-on-primary-container hover:text-white py-3 border-b border-white/10 transition-colors"
                }
                href={link.to}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(link.to);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
