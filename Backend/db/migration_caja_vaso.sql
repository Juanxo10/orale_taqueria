-- =============================================
-- Migración: Cargos de caja y vaso en bowls
-- Ejecutar en la base de datos pepasygranos
-- =============================================

-- 1. Agregar columnas caja y vaso a la tabla bowls
ALTER TABLE bowls
  ADD COLUMN IF NOT EXISTS caja INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vaso INTEGER NOT NULL DEFAULT 0;

-- 2. Registrar valores en configuracion (para que el backend los pueda leer/cambiar)
INSERT INTO configuracion (clave, valor) VALUES ('caja', 1000)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO configuracion (clave, valor) VALUES ('vaso', 1000)
ON CONFLICT (clave) DO NOTHING;
