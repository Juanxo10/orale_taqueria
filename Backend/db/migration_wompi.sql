-- =============================================
-- Migración: Soporte de pagos Wompi
-- Ejecutar en la base de datos pepasygranos
-- =============================================

-- 1. Agregar columna para el ID de transacción de Wompi en pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS wompi_transaction_id VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estado_pago          VARCHAR(20)  DEFAULT 'pendiente';

-- Valores posibles de estado_pago:
--   pendiente  → pedido creado, aún sin pago confirmado (Wompi o contraentrega nueva)
--   aprobado   → Wompi confirmó el pago (APPROVED)
--   rechazado  → Wompi rechazó el pago (DECLINED)
--   error      → Error en la transacción (ERROR)
--   N/A        → Para contraentrega (no aplica pago en línea)

-- Actualizar pedidos existentes de contraentrega
UPDATE pedidos SET estado_pago = 'N/A' WHERE metodo_pago = 'Contraentrega en efectivo';

CREATE INDEX IF NOT EXISTS idx_pedidos_wompi_transaction ON pedidos (wompi_transaction_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago       ON pedidos (estado_pago);
