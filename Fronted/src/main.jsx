import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary
      fallback={
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center', background: '#140c0a', color: '#fbf1e3', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Órale, algo salió mal</h1>
          <p style={{ maxWidth: '28rem', margin: 0, color: '#d9c3b0' }}>
            No pudimos mostrar la página. Recárgala; si tienes un bloqueador de rastreadores o cookies, prueba a desactivarlo para este sitio.
          </p>
          <button onClick={() => location.reload()} style={{ background: '#fe2b24', color: '#fff', border: 0, borderRadius: '999px', padding: '.7rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
            Recargar
          </button>
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
