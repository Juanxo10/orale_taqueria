-- Materia prima: insumos y recetas (cuánto insumo gasta cada producto del menú)
CREATE TABLE IF NOT EXISTS insumos (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  unidad VARCHAR(20)  NOT NULL DEFAULT 'unidades'
);

CREATE TABLE IF NOT EXISTS recetas (
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  insumo_id   INTEGER NOT NULL REFERENCES insumos(id)   ON DELETE CASCADE,
  cantidad    NUMERIC NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (producto_id, insumo_id)
);
