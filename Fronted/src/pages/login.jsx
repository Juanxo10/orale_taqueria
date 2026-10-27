import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { API_URL } from "../config";
import logo from "../assets/Logo_tacos.jpg";
import { SideTaco } from "../components/PageHeader";

import { almacenLocal } from "../data/almacen";
const input =
  "w-full bg-white border-2 border-[#e6d3b8] rounded-2xl px-4 py-3 font-body-md text-base text-on-primary placeholder:text-[#8c6f64] outline-none transition-all focus:border-primary-container focus:ring-4 focus:ring-primary-container/20";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || (Array.isArray(data.errors) ? data.errors.join(", ") : null) || "Error al iniciar sesión";
        setError(msg);
        setLoading(false);
        return;
      }

      almacenLocal.set("token", data.accessToken);
      almacenLocal.set("refreshToken", data.refreshToken);
      almacenLocal.set("adminUser", JSON.stringify(data.user));
      navigate({ cocina: "/cocina", barra: "/barra" }[data.user.rol] || "/admin");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="tex-ember min-h-[100svh] overflow-hidden flex items-center justify-center px-gutter py-16 font-body-md text-on-surface">
        <SideTaco className="-left-20 lg:-left-24 bottom-4" rot={-20} />
        <SideTaco className="-right-16 top-10" rot={22} flip delay={1.2} />

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
          className="relative z-10 w-full max-w-md"
        >
          <img
            src={logo}
            alt="Órale Tacos"
            className="spin-slow absolute -top-10 left-1/2 -translate-x-1/2 z-10 w-20 h-20 rounded-full object-cover border-4 border-background shadow-xl"
          />

          <div className="bg-primary-fixed rounded-[2rem] p-3 shadow-[0_30px_60px_-20px_rgba(254,43,36,0.6)] border-4 border-primary">
            <div className="rounded-[1.4rem] border-2 border-dashed border-[#c9a77d] px-6 pt-14 pb-8 sm:px-8 bg-[#fff5e6]">
              <div className="text-center mb-7">
                <h1 className="font-display-lg text-[28px] sm:text-3xl leading-tight text-on-primary">
                  Panel <span className="text-primary-container inline-block -rotate-2">Órale</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 mt-3 bg-primary text-on-primary rounded-full px-3 py-1 font-label-md text-xs">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  Acceso staff
                </span>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, height: 0, x: -8 }}
                    animate={{ opacity: 1, height: "auto", x: [-8, 6, -4, 0] }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 rounded-2xl bg-[#ffdad6] text-[#7a0f0a] px-4 py-3 mb-5 font-body-md text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">error</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block font-label-md text-label-md text-on-primary-fixed-variant">Email</label>
                  <input id="login-email" type="email" autoComplete="username" placeholder="tu@email.com" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="login-pass" className="block font-label-md text-label-md text-on-primary-fixed-variant">Contraseña</label>
                  <input id="login-pass" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña" className={input} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? undefined : { y: 3 }}
                  whileTap={loading ? undefined : { y: 6 }}
                  className="w-full inline-flex items-center justify-center gap-3 bg-primary-container text-white px-8 py-4 min-h-[56px] rounded-full font-label-md text-base shadow-[0_6px_0_#8f0f0b] disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                      Verificando…
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </motion.button>
              </form>

              <p className="text-center mt-6 font-label-md text-xs text-on-primary-fixed-variant">Solo personal autorizado</p>
            </div>
          </div>
        </motion.div>
      </main>
    </MotionConfig>
  );
}
