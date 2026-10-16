-- =============================================
-- Migración: Tipo de entrega (domicilio / recogida en tienda)
-- =============================================

-- 1. Agregar columna tipo_entrega a pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS tipo_entrega VARCHAR(20) NOT NULL DEFAULT 'domicilio';

-- 2. Permitir que direccion y barrio sean nulos (para pedidos de recogida)
ALTER TABLE pedidos ALTER COLUMN direccion DROP NOT NULL;
ALTER TABLE pedidos ALTER COLUMN barrio    DROP NOT NULL;
