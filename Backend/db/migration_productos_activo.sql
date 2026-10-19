-- =============================================
-- Migración: trazabilidad de productos agotados
-- productos.activo (false = sin stock) ya existe; aquí se guarda quién y cuándo lo cambió
-- =============================================

ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo_por INTEGER REFERENCES staff(id) ON DELETE SET NULL;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo_en  TIMESTAMPTZ;
