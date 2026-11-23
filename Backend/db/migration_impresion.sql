-- =============================================
-- Migración: impresión automática de tickets (Epson Server Direct Print)
-- =============================================
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS impreso_en TIMESTAMPTZ;

-- Los pedidos que ya existen cuentan como impresos: si no, la impresora los sacaría todos de golpe
UPDATE pedidos SET impreso_en = NOW() WHERE impreso_en IS NULL;
