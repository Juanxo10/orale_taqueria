import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { API_URL } from './config'
import Index from './pages/index'
import Menu from './pages/menu'
import Ubicacion from './pages/ubicacion'
import Sugerencias from './pages/sugerencias'
import Pago from './pages/pago'
import Admin from './pages/admin'
import Login from './pages/login'
import PedidoConfirmado from './pages/pedidoConfirmado'
import Privacidad from './pages/privacidad'
import Terminos from './pages/terminos'
import ErrorBoundary from './components/ErrorBoundary'
import { almacenLocal } from './data/almacen'
import { apiFetch } from './data/api'

// Carga diferida y aislada: si un bloqueador de rastreadores bloquea este archivo, el resto del sitio sigue funcionando
const AvisoDatos = lazy(() => import('./components/AvisoDatos'))

function ProtectedAdmin() {
  const [auth, setAuth] = useState(null); // null=loading, true, false

  useEffect(() => {
    const token = almacenLocal.get("token");
    if (!token) { setAuth(false); return; }

    apiFetch(`${API_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => setAuth(true))
      .catch(() => {
        almacenLocal.remove("token");
        almacenLocal.remove("adminUser");
        setAuth(false);
      });
  }, []);

  if (auth === null) return null;
  if (!auth) return <Navigate to="/login" replace />;
  return <Admin />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/ubicacion" element={<Ubicacion />} />
        <Route path="/sugerencias" element={<Sugerencias />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedAdmin />} />
      </Routes>
      <ErrorBoundary><Suspense fallback={null}><AvisoDatos /></Suspense></ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
