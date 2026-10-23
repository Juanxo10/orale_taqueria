import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { NEGOCIO } from "../data/legalData";

// Estructura común de las páginas legales: encabezado, índice y secciones numeradas.
export function Sec({ id, n, titulo, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display-lg text-2xl text-on-surface mb-3">
        <span className="text-primary mr-2">{n}.</span>{titulo}
      </h2>
      <div className="space-y-3 font-body-md text-base leading-relaxed text-on-surface-variant">{children}</div>
    </section>
  );
}

export const Ul = ({ children }) => <ul className="list-disc pl-6 space-y-1.5 marker:text-primary">{children}</ul>;
export const B = ({ children }) => <strong className="text-on-surface">{children}</strong>;

export function Contacto() {
  return (
    <Ul>
      <li><B>{NEGOCIO.nombre}</B>{NEGOCIO.nit ? `, NIT ${NEGOCIO.nit}` : ""}</li>
      <li>Dirección: {NEGOCIO.direccion}</li>
      <li>Teléfono / WhatsApp: <a className="text-primary underline" href={`tel:+57${NEGOCIO.telefono.replace(/\D/g, "")}`}>{NEGOCIO.telefono}</a></li>
      {NEGOCIO.correo && <li>Correo: <a className="text-primary underline" href={`mailto:${NEGOCIO.correo}`}>{NEGOCIO.correo}</a></li>}
      <li>También puedes escribirnos desde <a className="text-primary underline" href="/sugerencias">Sugerencias y reclamos</a>.</li>
    </Ul>
  );
}

export default function LegalPage({ titulo, intro, secciones, children }) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const el = id && document.getElementById(id);
    if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background text-on-surface font-body-md overflow-x-clip min-h-screen flex flex-col">
        <Navbar />
        <header className="tex-ember px-gutter pt-16 pb-14 text-center">
          <h1 className="font-display-lg text-[36px] leading-[1.1] md:text-display-lg text-on-surface mb-3">{titulo}</h1>
          <p className="font-label-md text-sm text-on-surface-variant">Última actualización: {NEGOCIO.actualizado}</p>
        </header>

        <main className="flex-1 tex-warm py-12 md:py-16 px-gutter">
          <div className="max-w-3xl mx-auto">
            <p className="font-body-lg text-lg leading-relaxed text-on-surface-variant mb-8">{intro}</p>

            <nav aria-label="Contenido" className="mb-10 rounded-2xl border border-outline-variant p-5">
              <p className="font-label-md text-sm text-on-surface mb-3">En esta página</p>
              <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 list-none p-0 m-0">
                {secciones.map((s, i) => (
                  <li key={s.id}>
                    <a className="font-body-md text-sm text-on-surface-variant hover:text-primary" href={`#${s.id}`}>{i + 1}. {s.titulo}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-10">{children}</div>
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
