import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from './config'
import Index from './pages/index'
import Menu from './pages/menu'
import Ubicacion from './pages/ubicacion'
import Sugerencias from './pages/sugerencias'
import Pago from './pages/pago'
import Admin from './pages/admin'
import Login from './pages/login'
import PedidoConfirmado from './pages/pedidoConfirmado'

function ProtectedAdmin() {
  const [auth, setAuth] = useState(null); // null=loading, true, false

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setAuth(false); return; }

    fetch(`${API_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => setAuth(true))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("adminUser");
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
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
