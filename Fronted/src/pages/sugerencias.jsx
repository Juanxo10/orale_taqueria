import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHeader, { SideTaco } from "../components/PageHeader";
import { API_URL } from "../config";

const TICKER = ["Te escuchamos", "Sugerencias", "Quejas", "Reclamos", "Órale, escríbenos"];
const MAX = 1000;

// Cada tipo es una "boleta" del talonario: color, textos y tono propios.
const TIPOS = {
  sugerencia: {
    label: "Sugerencia", icon: "lightbulb", bg: "#fbba24", fg: "#2a1204", shadow: "#7a4d00",
    hint: "Una idea para que cada taco quede mejor.",
    placeholder: "Me encantaría que tuvieran…",
    gracias: "¡Gracias por tu sugerencia!", cuerpo: "Ya la recibimos y la vamos a tener en cuenta para seguir mejorando.",
  },
  queja: {
    label: "Queja", icon: "sentiment_dissatisfied", bg: "#fff5e6", fg: "#2a1204", shadow: "#a8927a",
    hint: "Algo no te gustó: cuéntanos con calma.",
    placeholder: "Lo que no me gustó fue…",
    gracias: "Sentimos lo ocurrido", cuerpo: "Recibimos tu queja y la vamos a revisar para que no se repita.",
  },
  reclamo: {
    label: "Reclamo", icon: "report", bg: "#fe2b24", fg: "#ffffff", shadow: "#8f0f0b",
    hint: "Algo salió mal con tu pedido: dinos qué pasó y cuándo.",
    placeholder: "Mi pedido llegó… (indica el día y qué ocurrió)",
    gracias: "Recibimos tu reclamo", cuerpo: "Lo vamos a revisar con atención y lo resolveremos lo antes posible.",
  },
};

const field =
  "w-full bg-surface-container-lowest border-2 px-4 py-3 rounded-2xl outline-none transition-all font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/25";

export default function Sugerencias() {
  const [form, setForm] = useState({ nombre: "", mensaje: "" });
  const [state, setState] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("sugerencia");
  const [acepta, setAcepta] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (form.mensaje.trim().length < 5) {
      setState("error");
      setError("El mensaje debe tener al menos 5 caracteres");
      return;
    }
    if (!acepta) {
      setState("error");
      setError("Debes autorizar el tratamiento de tus datos para enviar el mensaje");
      return;
    }
    setState("loading");
    setError("");
    let res;
    try {
      res = await fetch(`${API_URL}/api/sugerencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tipo, acepta_datos: acepta }),
      });
    } catch {
      setState("error");
      setError("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setError(data.error || "Ocurrió un error. Intenta de nuevo.");
      return;
    }
    setState("ok");
    setForm({ nombre: "", mensaje: "" });
  };

  const hayError = state === "error";
  const t = TIPOS[tipo];
  const cerca = form.mensaje.length >= MAX * 0.9;

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background text-on-surface font-body-md overflow-x-clip min-h-screen flex flex-col">
        <Navbar active="sugerencias" />

        <PageHeader
          icon="forum"
          chip="Tu voz importa"
          ticker={TICKER}
          text="Elige si es una sugerencia, una queja o un reclamo y cuéntanos. Cada mensaje lo lee el equipo."
        >
          Sugerencias, quejas o <span className="keyword inline-block -rotate-2 hover:rotate-0 transition-transform">reclamos</span>
        </PageHeader>

        <main className="flex-1 tex-warm overflow-hidden py-16 md:py-section-gap px-gutter">
          <SideTaco className="-right-20 top-10" rot={20} flip delay={0.4} />
          <SideTaco className="-left-24 bottom-10" rot={-18} delay={1} />
          <div className="relative z-10 max-w-xl mx-auto">
            <AnimatePresence mode="wait">
              {state === "ok" ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  role="status"
                  className="bg-primary text-on-primary rounded-[2rem] p-8 md:p-12 text-center border-4 border-primary-container shadow-[0_30px_60px_-20px_rgba(254,43,36,0.6)]"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }}
                    className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6 shadow-[0_6px_0_#8f0f0b]"
                  >
                    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                    </svg>
                  </motion.div>
                  <h2 className="font-display-lg text-3xl md:text-4xl leading-tight mb-3">{t.gracias}</h2>
                  <p className="font-body-lg text-base md:text-lg mb-8 max-w-sm mx-auto">{t.cuerpo}</p>
                  <motion.button
                    whileHover={{ y: 3 }}
                    whileTap={{ y: 6 }}
                    className="bg-primary-container text-white px-8 py-4 min-h-[52px] rounded-full font-label-md text-base shadow-[0_6px_0_#8f0f0b]"
                    onClick={() => setState("idle")}
                  >
                    Enviar otro mensaje
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={enviar}
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                  className="bg-surface-container rounded-[2rem] p-6 sm:p-8 md:p-10 space-y-6 border-2 border-outline-variant shadow-[0_30px_60px_-30px_rgba(254,43,36,0.5)]"
                >
                  <fieldset className="space-y-3">
                    <legend className="font-label-md text-label-md text-primary mb-3">¿Qué quieres contarnos? *</legend>
                    <div role="radiogroup" aria-label="Tipo de mensaje" className="grid grid-cols-3 gap-2 sm:gap-3">
                      {Object.entries(TIPOS).map(([k, v]) => {
                        const on = tipo === k;
                        return (
                          <motion.button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setTipo(k)}
                            animate={{ rotate: on ? -2 : 0, y: on ? -4 : 0 }}
                            whileHover={{ y: -6 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            className={`flex flex-col items-center justify-center gap-1.5 min-h-[88px] px-1 py-3 rounded-2xl border-2 font-label-md text-sm ${
                              on ? "border-transparent" : "border-dashed border-outline text-on-surface-variant hover:text-on-surface"
                            }`}
                            style={on ? { background: v.bg, color: v.fg, boxShadow: `0 5px 0 ${v.shadow}` } : undefined}
                          >
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: `'FILL' ${on ? 1 : 0}` }}>{v.icon}</span>
                            {v.label}
                          </motion.button>
                        );
                      })}
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tipo}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-body-md text-sm text-on-surface-variant"
                      >
                        {t.hint}
                      </motion.p>
                    </AnimatePresence>
                  </fieldset>
                  <div className="space-y-2">
                    <label htmlFor="sug-nombre" className="font-label-md text-label-md text-primary">
                      Tu nombre (opcional)
                    </label>
                    <input
                      id="sug-nombre"
                      type="text"
                      maxLength={100}
                      placeholder="Ej: María García"
                      className={`${field} border-outline-variant`}
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sug-mensaje" className="font-label-md text-label-md text-primary">
                      Tu {t.label.toLowerCase()} *
                    </label>
                    <div className="relative">
                      <textarea
                        id="sug-mensaje"
                        required
                        minLength={5}
                        maxLength={MAX}
                        rows={6}
                        aria-invalid={hayError}
                        aria-describedby={hayError ? "sug-error" : undefined}
                        placeholder={t.placeholder}
                        className={`${field} pb-9 resize-y ${hayError ? "border-error" : "border-outline-variant"}`}
                        value={form.mensaje}
                        onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
                      />
                      <span
                        className={`absolute right-4 bottom-3 rounded-full px-2 py-0.5 text-xs font-label-md bg-surface-container-lowest ${cerca ? "text-primary" : "text-on-surface-variant"}`}
                        aria-live="polite"
                      >
                        {form.mensaje.length}/{MAX}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {hayError && (
                      <motion.p
                        id="sug-error"
                        role="alert"
                        initial={{ opacity: 0, height: 0, x: -8 }}
                        animate={{ opacity: 1, height: "auto", x: [-8, 6, -4, 0] }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 rounded-2xl bg-error-container text-on-error-container px-4 py-3 font-body-md text-body-md"
                      >
                        <span className="material-symbols-outlined text-error shrink-0">error</span>
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <label className="flex items-start gap-3 text-xs leading-relaxed cursor-pointer">
                    <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-[#fe2b24]" />
                    <span>
                      Autorizo el tratamiento de mi mensaje y mi nombre (opcional) solo para atender esta solicitud, según la{" "}
                      <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline font-bold">Política de Privacidad</a>.
                    </span>
                  </label>

                  <motion.button
                    type="submit"
                    disabled={state === "loading"}
                    whileHover={state === "loading" ? undefined : { y: 3 }}
                    whileTap={state === "loading" ? undefined : { y: 6 }}
                    className="w-full inline-flex items-center justify-center gap-3 bg-primary-container text-white px-8 py-4 min-h-[56px] rounded-full font-label-md text-base shadow-[0_6px_0_#8f0f0b] disabled:opacity-70 disabled:cursor-wait"
                  >
                    {state === "loading" ? (
                      <>
                        <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl">send</span>
                        Enviar {t.label.toLowerCase()}
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
