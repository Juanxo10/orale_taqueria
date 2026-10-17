// Íconos SVG de línea por categoría del menú (heredan el color con currentColor).
const PATHS = {
  "Entradas": <><path d="M4 19 12 4l8 15Z" /><circle cx="12" cy="12" r=".9" fill="currentColor" /><circle cx="9.6" cy="16" r=".9" fill="currentColor" /><circle cx="14.4" cy="16" r=".9" fill="currentColor" /></>,
  "Tacos": <><path d="M3 18a9 9 0 0 1 18 0Z" /><path d="M7 18a5 5 0 0 1 10 0" /></>,
  "Bebidas de la casa": <><path d="M6 8h12l-1.5 12h-9Z" /><path d="m13 8 2-5h3" /><path d="M7 13h10" /></>,
  "Sodas artesanales": <><path d="M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3Z" /><path d="M8 14h8" /></>,
  "Otras bebidas": <><path d="M5 8h10v12H5Z" /><path d="M15 10.5h2.5a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H15" /><path d="M5 8a2.5 2.5 0 0 1 5-2 2.5 2.5 0 0 1 5 2" /></>,
  "Cocteles": <><path d="M4 4h16l-8 9Z" /><path d="M12 13v7M8 20h8" /></>,
  "Quesadillas": <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><circle cx="8" cy="8.5" r=".9" fill="currentColor" /><circle cx="15" cy="16" r=".9" fill="currentColor" /></>,
  "Pizzas": <><path d="M12 21 3.5 6.5a15 15 0 0 1 17 0Z" /><circle cx="12" cy="9" r="1.1" fill="currentColor" /><circle cx="9" cy="12" r="1.1" fill="currentColor" /></>,
  "Exclusivos del restaurante": <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
};

export default function MenuIcon({ cat, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {PATHS[cat]}
    </svg>
  );
}
