-- Esquema base (las migraciones_*.sql agregan columnas encima de esto)
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(50) PRIMARY KEY,
  valor NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo   VARCHAR(20)  NOT NULL,
  precio INTEGER      NOT NULL DEFAULT 0,
  activo BOOLEAN      NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS staff (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'empleado')),
  activo        BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id             SERIAL PRIMARY KEY,
  numero_pedido  VARCHAR(30) NOT NULL UNIQUE,
  nombre_cliente VARCHAR(100) NOT NULL,
  telefono       VARCHAR(30)  NOT NULL,
  direccion      TEXT NOT NULL,
  barrio         VARCHAR(100) NOT NULL,
  referencia     TEXT,
  notas          TEXT,
  metodo_pago    VARCHAR(50) NOT NULL,
  subtotal       INTEGER NOT NULL,
  domicilio      INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  estado         VARCHAR(20) NOT NULL DEFAULT 'nuevo',
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bowls (
  id        SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  base_id   INTEGER REFERENCES productos(id),
  bebida_id INTEGER REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS bowl_items (
  id          SERIAL PRIMARY KEY,
  bowl_id     INTEGER NOT NULL REFERENCES bowls(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pedido_extras (
  id          SERIAL PRIMARY KEY,
  pedido_id   INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad    INTEGER NOT NULL
);
