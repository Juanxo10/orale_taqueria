import { motion, MotionConfig } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHeader, { SideTaco } from "../components/PageHeader";

const TICKER = ["Ven por tus tacos", "Acacías, Meta", "Salsa de la casa", "Te esperamos", "Órale, pásale"];
const DIRECCION = "Diagonal 8 #8-99, Acacías, Meta";

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, delay: i * 0.12, ease: [0.2, 0.7, 0.2, 1] },
});

const DATOS = [
  { icon: "location_on", label: "Dirección", value: DIRECCION, tilt: -1.2 },
  { icon: "call", label: "Teléfono", value: "313 2664332", tilt: 1.2 },
];

export default function Ubicacion() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background text-on-surface font-body-md overflow-x-clip min-h-screen flex flex-col">
        <Navbar active="ubicacion" />

        <PageHeader
          icon="location_on"
          chip="Pásate por el comal"
          ticker={TICKER}
          text="Estamos en Acacías, Meta. Escríbenos o llámanos si tienes cualquier duda con tu pedido."
        >
          Nuestra <span className="keyword inline-block -rotate-2 hover:rotate-0 transition-transform">ubicación</span>
        </PageHeader>

        <main className="flex-1 tex-warm overflow-hidden py-16 md:py-section-gap px-gutter">
          <SideTaco className="-left-32 bottom-6" rot={-16} delay={0.6} />
          <div className="relative z-10 max-w-container-max mx-auto grid md:grid-cols-2 items-center gap-12 md:gap-16">
            <div className="space-y-8">
              <div className="space-y-5">
                {DATOS.map((d, i) => (
                  <motion.div
                    key={d.label}
                    {...reveal(i)}
                    whileHover={{ y: -6, rotate: d.tilt, boxShadow: "0 20px 40px -12px rgba(254,43,36,0.45)" }}
                    className="flex items-center gap-4 sm:gap-5 bg-surface-container rounded-[1.5rem] p-5 sm:p-6 border-2 border-outline-variant hover:border-primary-container transition-colors"
                  >
                    <span className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-primary-container flex items-center justify-center shadow-[0_5px_0_#8f0f0b]">
                      <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{d.icon}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-primary">{d.label}</p>
                      <p className="font-display-lg text-xl sm:text-2xl leading-tight text-on-surface break-words">{d.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div {...reveal(2)} className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="https://www.google.com/maps/dir/?api=1&destination=Diagonal%208%20%238-99%2C%20Acac%C3%ADas%2C%20Meta"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: 3 }}
                  whileTap={{ y: 6 }}
                  className="inline-flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-4 min-h-[56px] rounded-full font-label-md text-base shadow-[0_6px_0_#8f0f0b]"
                >
                  <span className="material-symbols-outlined text-xl">directions</span>
                  Cómo llegar
                </motion.a>
                <motion.a
                  href="tel:+573132664332"
                  whileHover={{ y: 3 }}
                  whileTap={{ y: 6 }}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 min-h-[56px] rounded-full font-label-md text-base shadow-[0_6px_0_#7a4d00]"
                >
                  <span className="material-symbols-outlined text-xl">call</span>
                  Llamar
                </motion.a>
              </motion.div>
            </div>

            {/* Mapa con marco de marca y guirnalda de papel picado */}
            <motion.div
              initial={{ opacity: 0, y: 36, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1.5 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
              className="relative"
            >
              <div className="papel-picado" aria-hidden="true" />
              <div className="rounded-[2rem] overflow-hidden border-4 border-primary shadow-[0_30px_60px_-20px_rgba(254,43,36,0.6)] aspect-[4/3] bg-surface-container">
                <iframe
                  title="Ubicación de Órale Tacos en Acacías, Meta"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Diagonal%208%20%238-99%2C%20Acac%C3%ADas%2C%20Meta%2C%20Colombia&output=embed"
                />
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
