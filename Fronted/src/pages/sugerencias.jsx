import { useState } from "react";
import Navbar from "../components/Navbar";
import logoDark from "../assets/log.png";
import { API_URL } from "../config";

export default function Sugerencias() {
  const [form, setForm] = useState({ nombre: "", mensaje: "" });
  const [state, setState] = useState("idle"); // idle | loading | ok | error
  const [error, setError] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    if (form.mensaje.trim().length < 5) {
      setState("error");
      setError("El mensaje debe tener al menos 5 caracteres");
      return;
    }
    setState("loading");
    setError("");
    let res;
    try {
      res = await fetch(`${API_URL}/api/sugerencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col">
      <Navbar active="sugerencias" />

      {/* Header */}
      <header className="bg-primary px-gutter py-16 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-tertiary-fixed rounded-full mb-5">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          <span className="font-label-md text-label-md">TU OPINIÓN IMPORTA</span>
        </div>
        <h1 className="font-headline-md text-headline-md md:text-display-lg-mobile text-white leading-tight">
          Cuéntanos tu Opinión
        </h1>
        <p className="font-body-md text-body-md text-white/70 mt-4 max-w-xl mx-auto">
          Tu sugerencia nos ayuda a mejorar cada bowl y cada entrega. Cuéntanos qué te gustó, qué cambiarías o
          qué quieres ver en el menú.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 py-section-gap px-gutter bg-surface-container-lowest">
        <div className="max-w-xl mx-auto">
          {state === "ok" ? (
            <div className="bg-surface-container rounded-xl p-10 text-center shadow-[0px_4px_20px_rgba(45,74,47,0.05)]">
              <div className="w-16 h-16 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-primary mb-2">¡Gracias por tu sugerencia!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Ya la recibimos y la vamos a tener en cuenta para seguir mejorando.
              </p>
              <button
                className="bg-primary-container text-white px-8 py-3 rounded-full font-label-md text-label-md hover:bg-primary transition-all duration-300"
                onClick={() => setState("idle")}
              >
                Enviar otra sugerencia
              </button>
            </div>
          ) : (
            <form
              onSubmit={enviar}
              className="bg-surface-container rounded-xl p-8 md:p-10 space-y-6 shadow-[0px_4px_20px_rgba(45,74,47,0.05)]"
            >
              <div className="space-y-2">
                <label htmlFor="sug-nombre" className="font-label-md text-label-md text-primary">
                  Tu nombre (opcional)
                </label>
                <input
                  id="sug-nombre"
                  type="text"
                  maxLength={100}
                  placeholder="Ej: María García"
                  className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-container outline-none transition-all font-body-md"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sug-mensaje" className="font-label-md text-label-md text-primary">
                  Tu sugerencia *
                </label>
                <textarea
                  id="sug-mensaje"
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={6}
                  placeholder="Escribe aquí tu idea, comentario o sugerencia..."
                  className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-container outline-none transition-all font-body-md resize-y"
                  value={form.mensaje}
                  onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
                />
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface-variant normal-case tracking-normal">
                    {form.mensaje.length}/1000 caracteres
                  </span>
                </div>
              </div>

              {state === "error" && (
                <p className="font-body-md text-body-md text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-4 rounded-full font-label-md text-label-md hover:bg-primary transition-all duration-300 disabled:opacity-60"
              >
                {state === "loading" ? "Enviando…" : "Enviar Sugerencia"}
              </button>
            </form>
          )}
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
