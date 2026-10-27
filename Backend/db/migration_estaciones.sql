-- Cocina / Barra: cada categoria pertenece a una estacion y cada pedido avanza por estacion.
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS estacion VARCHAR(10) NOT NULL DEFAULT 'cocina'
  CHECK (estacion IN ('cocina', 'barra'));

UPDATE categorias SET estacion = 'barra'
WHERE nombre IN ('Bebidas de la casa', 'Sodas artesanales', 'Otras bebidas', 'Cocteles');

CREATE TABLE IF NOT EXISTS pedido_estaciones (
  pedido_id      INTEGER     NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estacion       VARCHAR(10) NOT NULL CHECK (estacion IN ('cocina', 'barra')),
  estado         VARCHAR(12) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparando', 'listo')),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (pedido_id, estacion)
);
ALTER TABLE public.pedido_estaciones ENABLE ROW LEVEL SECURITY;

ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_rol_check;
ALTER TABLE staff ADD CONSTRAINT staff_rol_check CHECK (rol IN ('admin', 'empleado', 'cocina', 'barra'));

-- Pedidos existentes: una fila por estacion con items; ya despachados/cancelados quedan 'listo'
INSERT INTO pedido_estaciones (pedido_id, estacion, estado)
SELECT DISTINCT pe.pedido_id,
       COALESCE(c.estacion, 'cocina'),
       CASE WHEN p.estado IN ('camino', 'entregado', 'cancelado') THEN 'listo'
            WHEN p.estado = 'preparando' THEN 'preparando'
            ELSE 'pendiente' END
FROM pedido_extras pe
JOIN pedidos p ON p.id = pe.pedido_id
JOIN productos pr ON pr.id = pe.producto_id
LEFT JOIN categorias c ON c.nombre = pr.categoria
ON CONFLICT DO NOTHING;
