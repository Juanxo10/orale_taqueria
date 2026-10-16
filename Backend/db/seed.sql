-- =====================================
-- SEED: Configuración
-- =====================================
INSERT INTO configuracion (clave, valor) VALUES ('domicilio', 6000)
ON CONFLICT (clave) DO NOTHING;

-- =====================================
-- SEED: Productos
-- =====================================

-- Bases (precio incluido en BOWL_BASE, se pone 12000)
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Arroz integral', 'base', 12000),
  ('Papa criolla',   'base', 12000),
  ('Quinoa',         'base', 12000);

-- Toppings (los primeros 4 son gratis, desde el 5to +2000 c/u — precio 0; lógica en backend)
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Aguacate',       'topping', 0),
  ('Champiñones',    'topping', 0),
  ('Cherry',         'topping', 0),
  ('Maíz',           'topping', 0),
  ('Zanahoria',      'topping', 0),
  ('Pepino',         'topping', 0),
  ('Guacamole',      'topping', 0),
  ('Repollo morado', 'topping', 0),
  ('Piña asada',     'topping', 0),
  ('Mango',          'topping', 0),
  ('Pico de gallo',  'topping', 0),
  ('Tomate cherry',  'topping', 0),
  ('Nueces',         'topping', 0),
  ('Nachos',         'topping', 0),
  ('Brócoli',        'topping', 0),
  ('Queso',          'topping', 0);

-- Proteínas
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Pollo',        'proteina', 8500),
  ('Atún',         'proteina', 8500),
  ('Carne molida', 'proteina', 6500),
  ('Falafel',      'proteina', 5000),
  ('Huevo',        'proteina', 4000),
  ('Lomo de res',  'proteina', 10000),
  ('Cerdo',        'proteina', 8500);

-- Bebidas
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Limonada',      'bebida', 0),
  ('Agua y limón',  'bebida', 0);

-- Incluidos (siempre gratis)
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Lechuga',   'incluido', 0),
  ('Vinagreta', 'incluido', 0);

-- Extras / Productos adicionales
INSERT INTO productos (nombre, tipo, precio) VALUES
  -- Brunch
  ('Pizzeta pesto',      'extra', 31000),
  ('Pizzeta carne',      'extra', 31000),
  ('Picada especial',    'extra', 52200),
  ('Sopa de tomate',     'extra', 24000),
  -- Emparedados
  ('Emparedado de lomo',   'extra', 25000),
  ('Choripan',             'extra', 20500),
  ('Emparedado integral',  'extra', 26500),
  ('Emparedado de cerdo',  'extra', 24000),
  ('Emparedado de huevo',  'extra', 21000),
  ('Emparedado de salami', 'extra', 21000),
  -- Desayunos
  ('Criollito',          'extra', 22800),
  ('Hayaca',             'extra', 17500),
  ('Wraps de espinaca',  'extra', 17300),
  ('Wraps de cerdo',     'extra', 27500),
  ('Desayuno Llanero',   'extra', 14800),
  -- Omelet
  ('Omelet Opción 1',   'extra', 18800),
  ('Omelet Opción 2',   'extra', 18800),
  ('Omelet Opción 3',   'extra', 18800),
  -- Montaditos
  ('Montadito de huevo',      'extra', 12500),
  ('Montadito napolitano',    'extra', 17200),
  ('Montadito de carne',      'extra', 15000),
  -- Bowls y Fruta
  ('Bowl de yogurt',          'extra', 23000),
  ('Mini bowl de yogurt',     'extra', 16500),
  ('Bowl de avena',           'extra', 16000),
  ('Bowl de açaí',            'extra', 23000),
  ('Cuchareable de açaí',     'extra', 16000),
  ('Fruta fresca',            'extra', 14200),
  -- Bebidas
  ('Soda Hatsu',            'extra', 8000),
  ('Colombiano',            'extra', 5900),
  ('Acacireño',             'extra', 6600),
  ('Capuchino',             'extra', 8200),
  -- Batidos
  ('Batido Guayuriba',      'extra', 12500),
  ('Batido Corocora',       'extra', 12500),
  ('Batido Sardinata',      'extra', 12500),
  -- Frappes
  ('Frappe de café',        'extra', 18000),
  ('Frappe mocca',          'extra', 18000),
  ('Frappe arequipe',       'extra', 18000),
  ('Frappe baileys',        'extra', 22300),
  ('Frappe té chai',        'extra', 18000),
  ('Caños cristales',       'extra', 18000),
  ('Caños negros',          'extra', 18000),
  ('Macarena',              'extra', 18000),
  -- Combos
  ('Hayaca + Chocolate',   'extra', 24000),
  ('Hayaca + Capuchino',   'extra', 24000),
  ('Hayaca + Aguapanela',  'extra', 24000),
  ('Hayaca + Colombiano',  'extra', 24000),
  ('Combo chocolate',                       'extra', 14800),
  ('Combo aguapanela',                      'extra', 12500),
  ('Croissant jamón y queso + capuchino',   'extra', 17500),
  ('Croissant arequipe + capuchino',        'extra', 15000);

-- Nuevos productos (jul 2026) — precios de lista + $1.000
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Bowl salado',                          'extra', 24000),
  ('Batido Açaí',                          'extra', 14000),
  ('Hayaca + bebida',                      'extra', 24000),
  -- Café
  ('Espresso',                             'extra', 6300),
  ('Espresso doble',                       'extra', 7700),
  ('CapuChai',                             'extra', 12500),
  ('Capuchino saborizado',                 'extra', 11700),
  ('Mocaccino',                            'extra', 11800),
  ('Capuchino Baileys',                    'extra', 16200),
  ('Latte',                                'extra', 9700),
  ('Café Irlandés',                        'extra', 19400),
  ('Carajillo',                            'extra', 11400),
  -- Bebidas calientes sin café
  ('Chocolate llanero',                    'extra', 11400),
  ('Chúcula',                              'extra', 11400),
  ('Infusiones en tisana',                 'extra', 6800),
  ('Infusión de la casa',                  'extra', 9000),
  ('Aguapanela',                           'extra', 7000),
  ('Té carbón activado',                   'extra', 11400),
  ('Té azul relajante',                    'extra', 11400),
  ('Té matcha',                            'extra', 11400),
  ('Té chai',                              'extra', 11400),
  ('Té leche dorada',                      'extra', 11400),
  -- Bebidas frías con café
  ('Café acacireño frío',                  'extra', 10000),
  ('Vencejo llanero',                      'extra', 12500),
  ('Latte frío',                           'extra', 11000),
  ('Latte frío Baileys',                   'extra', 17800),
  ('Affogato llanero',                     'extra', 16500),
  ('Limonada de café',                     'extra', 12500),
  -- Bebidas frías sin café
  ('Alborada llanera',                     'extra', 12500),
  ('Vespertina llanera',                   'extra', 12500),
  ('Puesta del sol',                       'extra', 13600),
  ('Sol naciente',                         'extra', 14500),
  ('Cuarzo',                               'extra', 12500),
  ('Flor de jamaica',                      'extra', 9700),
  ('Aguapanela fría',                      'extra', 7000),
  -- Hojaldres
  ('Croissant de jamón y queso',           'extra', 12500),
  ('Croissant de arequipe',                'extra', 9000),
  ('Croissant de paté de pollo',           'extra', 12500),
  -- Vinos y cócteles
  ('Espresso Martini',                     'extra', 22000),
  ('Campari Spritz',                       'extra', 24000),
  ('Mexican Mule',                         'extra', 25000),
  ('Vino de verano',                       'extra', 16000),
  ('Copa de vino',                         'extra', 12500);

-- Nuevos productos (jul 2026, parte 2)
-- 'Hayaca' generico queda reemplazado por las 2 variantes de abajo (desactivado en DB, no se borra)
INSERT INTO productos (nombre, tipo, precio) VALUES
  ('Croburger',            'extra', 26000),
  ('Hayaca tradicional',   'extra', 17500),
  ('Hayaca picante',       'extra', 17500);
