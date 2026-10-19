-- =============================================
-- Migración: Tabla de sugerencias de clientes
-- =============================================

CREATE TABLE IF NOT EXISTS sugerencias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100),
  mensaje     TEXT        NOT NULL,
  leida       BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sugerencias_leida      ON sugerencias (leida);
CREATE INDEX IF NOT EXISTS idx_sugerencias_created_at ON sugerencias (created_at DESC);

-- Tipo de mensaje: sugerencia, queja o reclamo (los registros anteriores quedan como sugerencia)
ALTER TABLE sugerencias ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'sugerencia';
DO $$ BEGIN
  ALTER TABLE sugerencias ADD CONSTRAINT sugerencias_tipo_check CHECK (tipo IN ('sugerencia', 'queja', 'reclamo'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
