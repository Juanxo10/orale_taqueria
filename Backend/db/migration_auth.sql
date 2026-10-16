-- =============================================
-- Migración: Sistema de autenticación producción
-- =============================================

-- 1. Agregar columnas de control de intentos fallidos a staff
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ DEFAULT NULL;

-- 2. Tabla de refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  token_hash    VARCHAR(128) NOT NULL UNIQUE,
  revoked       BOOLEAN DEFAULT false,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user  ON refresh_tokens (user_id);

-- 3. Limpieza periódica de tokens expirados (ejecutar con pg_cron o manualmente)
-- DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true;
