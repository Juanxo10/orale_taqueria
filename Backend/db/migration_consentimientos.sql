-- Prueba de cada autorización (Decreto 1377 de 2013): qué aceptó, qué versión de los textos, cuándo y desde dónde. Idempotente.
CREATE TABLE IF NOT EXISTS consentimientos (
  id            SERIAL PRIMARY KEY,
  tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('terminos', 'datos')),
  version       VARCHAR(20) NOT NULL,
  pedido_id     INTEGER,
  sugerencia_id INTEGER,
  ip            VARCHAR(64),
  user_agent    VARCHAR(300),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consentimientos_pedido ON consentimientos (pedido_id);
ALTER TABLE public.consentimientos ENABLE ROW LEVEL SECURITY;
