import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;}
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a2e1b 0%,#2D4A2F 50%,#3a5e3c 100%);padding:1.5rem;}
.login-card{background:#fff;border-radius:20px;padding:2.5rem 2rem;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.3);}
.login-logo{text-align:center;margin-bottom:2rem;}
.login-logo h1{font-size:2rem;font-weight:800;color:#1a2e1b;letter-spacing:-1px;}
.login-logo p{font-size:.72rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#6b7a6b;margin-top:.25rem;}
.login-badge{display:inline-block;background:#c8a84b;color:#1a2e1b;border-radius:999px;font-size:.65rem;font-weight:700;padding:.2rem .7rem;margin-top:.5rem;}
.form-group{margin-bottom:1.25rem;}
.form-group label{display:block;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6b7a6b;margin-bottom:.4rem;}
.form-group input{width:100%;border:1.5px solid #e2ddd6;border-radius:10px;padding:.7rem 1rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.88rem;color:#1a2e1b;outline:none;transition:border-color .15s;background:#f5f3ef;}
.form-group input:focus{border-color:#4A7C59;background:#fff;}
.login-btn{width:100%;border:none;border-radius:10px;padding:.75rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;background:#2D4A2F;color:#fff;margin-top:.5rem;}
.login-btn:hover{background:#3a5e3c;}
.login-btn:disabled{opacity:.6;cursor:not-allowed;}
.login-error{background:#fee2e2;color:#991b1b;border-radius:8px;padding:.55rem .8rem;font-size:.78rem;font-weight:600;margin-bottom:1rem;text-align:center;}
.login-footer{text-align:center;margin-top:1.5rem;font-size:.72rem;color:#6b7a6b;}
@media(max-width:480px){
  .login-card{padding:2rem 1.5rem;border-radius:16px;}
  .login-logo h1{font-size:1.6rem;}
  .form-group input{padding:.6rem .85rem;font-size:.82rem;}
  .login-btn{padding:.65rem;font-size:.85rem;}
}
`;

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

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      navigate("/admin");
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <h1>pepas coffee</h1>
            <p>Panel de administración</p>
            <span className="login-badge">Acceso staff</span>
          </div>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>
          <div className="login-footer">Solo personal autorizado</div>
        </div>
      </div>
    </>
  );
}
