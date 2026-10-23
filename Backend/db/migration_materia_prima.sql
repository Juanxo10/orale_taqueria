-- Materia prima cruda vs preparada, sub-recetas de preparados y menú administrable desde la BD. Idempotente.
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) NOT NULL DEFAULT 'crudo';

-- Preparados del seed inicial: solo en la primera corrida (antes de existir el constraint), para no pisar cambios del admin
UPDATE insumos SET tipo = 'preparado'
WHERE tipo = 'crudo' AND nombre IN (
  'Birria de res', 'Carnitas de cerdo', 'Puerco al pastor', 'Cochinita pibil', 'Frijol refrito', 'Guacamole',
  'Pico de gallo', 'Salsa de la casa', 'Salsa Veracruz', 'Salsa chipotle', 'Salsa cheddar', 'Salsa mexicana',
  'Caldo de birria', 'Masa de pizza', 'Agua de jamaica', 'Agua de tamarindo', 'Agua de horchata')
  AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insumos_tipo_chk');

UPDATE insumos SET unidad = CASE lower(unidad) WHEN 'l' THEN 'L' WHEN 'unidad' THEN 'unidades' ELSE lower(unidad) END
WHERE unidad NOT IN ('kg', 'g', 'lb', 'L', 'ml', 'gal', 'unidades');

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insumos_tipo_chk') THEN
    ALTER TABLE insumos ADD CONSTRAINT insumos_tipo_chk CHECK (tipo IN ('crudo', 'preparado'));
    ALTER TABLE insumos ADD CONSTRAINT insumos_unidad_chk CHECK (unidad IN ('kg', 'g', 'lb', 'L', 'ml', 'gal', 'unidades'));
  END IF;
END $$;

-- Sub-receta: cuánto de cada crudo lleva 1 unidad del preparado (1 kg de birria, 1 masa de pizza…)
CREATE TABLE IF NOT EXISTS preparaciones (
  preparado_id INTEGER NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
  crudo_id     INTEGER NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
  cantidad     NUMERIC NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (preparado_id, crudo_id)
);

-- Menú en la BD: categoría, descripción, foto y orden por producto; archivado = ya no sale en el menú
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria   VARCHAR(60);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS foto        TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS orden       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS archivado   BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS categorias (
  nombre VARCHAR(60) PRIMARY KEY,
  nota   TEXT,
  orden  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.preparaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
