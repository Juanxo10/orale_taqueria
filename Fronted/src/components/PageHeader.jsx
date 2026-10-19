import { motion } from "motion/react";
import tacoSide from "../assets/tacoinicio.png";

// Taco decorativo en diagonal (mismo recurso que el inicio; PNG 360x360, no ampliar de ~260px).
export function SideTaco({ className = "", rot = 0, flip = false, delay = 0 }) {
  return (
    <img
      src={tacoSide}
      alt=""
      aria-hidden="true"
      className={`float-diag hidden md:block absolute z-0 pointer-events-none select-none w-40 lg:w-56 drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)] ${className}`}
      style={{ "--r": `${rot}deg`, "--sx": flip ? -1 : 1, animationDelay: `${delay}s` }}
    />
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } },
};

// Encabezado de página: chip, título con palabras clave (children), texto y cinta inclinada.
export default function PageHeader({ icon, chip, children, text, ticker }) {
  return (
    <>
      <header className="tex-ember overflow-hidden px-gutter pt-20 pb-24 md:pt-24 md:pb-28">
        <SideTaco className="-left-20 lg:-left-24 bottom-0" rot={-20} />
        <SideTaco className="-right-16 top-4" rot={22} flip delay={1.2} />
        <motion.div className="relative z-10 max-w-3xl mx-auto text-center" variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="inline-flex items-center gap-3 mb-6 px-3 py-2 rounded-full bg-white/5 border border-outline-variant">
            <span className="w-6 h-6 rounded-md bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </span>
            <span className="font-label-md text-xs sm:text-sm text-on-surface">{chip}</span>
          </motion.div>
          <motion.h1 variants={item} className="font-display-lg text-[40px] leading-[1.08] sm:text-display-lg-mobile md:text-display-lg text-on-surface mb-5 md:mb-6">
            {children}
          </motion.h1>
          <motion.p variants={item} className="font-body-lg text-base sm:text-xl text-on-surface-variant max-w-xl mx-auto">
            {text}
          </motion.p>
        </motion.div>
      </header>

      {/* Cinta que corre sin fin, igual que la del inicio */}
      <div className="relative z-10 -mt-6 bg-primary-container border-y-4 border-primary overflow-hidden py-3 -rotate-1 scale-[1.02]" aria-hidden="true">
        <div className="marquee">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center font-display-lg text-xl md:text-2xl text-white uppercase whitespace-nowrap">
              <span className="px-6">{t}</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
