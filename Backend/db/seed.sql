-- Generado por scripts/genSeed.mjs desde Fronted/src/data/menuData.js (Orale Taquería)
INSERT INTO configuracion (clave, valor) VALUES ('domicilio', 7000)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO productos (nombre, tipo, precio) VALUES
  -- Entradas
  ('Nachada', 'extra', 31000),
  ('Las Tostaditas', 'extra', 19000),
  ('Totopos Chingones', 'extra', 17000),
  -- Tacos
  ('Tacos Carnitas', 'extra', 25000),
  ('Tacos de Birria', 'extra', 27000),
  ('Tacos Rancheros', 'extra', 25000),
  ('Tacos al Pastor', 'extra', 25000),
  ('Tacos de Cochinita Pibil', 'extra', 26000),
  ('La Hijuebirria', 'extra', 37000),
  ('Taquiza Órale', 'extra', 36000),
  -- Bebidas de la casa
  ('Flor de Jamaica', 'extra', 8000),
  ('Tamarindo', 'extra', 8000),
  ('Agua de Horchata', 'extra', 9000),
  -- Sodas artesanales
  ('Frutos Rojos', 'extra', 17000),
  ('Frutos Amarillos', 'extra', 17000),
  ('Sandía Limón', 'extra', 17000),
  -- Otras bebidas
  ('Coca-Cola', 'extra', 6000),
  ('Ginger', 'extra', 6000),
  ('Corona', 'extra', 6000),
  ('Estella', 'extra', 7000),
  ('Michelob Ultra', 'extra', 6000),
  ('Sol', 'extra', 6000),
  ('Botella de Tequila', 'extra', 181000),
  -- Quesadillas
  ('Quesadilla al Estilo Michoacán', 'extra', 21000),
  ('Gringa al Pastor', 'extra', 21000),
  ('Quesabirria Órale', 'extra', 25000),
  -- Pizzas
  ('Pizzeta de Cochinita Pibil', 'extra', 37000),
  ('Pizzeta de Carnitas', 'extra', 37000),
  ('Pizzeta al Pastor', 'extra', 37000),
  ('Pizzeta de Birria', 'extra', 37000),
  -- Exclusivos del restaurante
  ('Ramen de Birria', 'extra', 26000),
  ('Plátano Chingón', 'extra', 25000),
  ('La Mestiza', 'extra', 33000),
  ('La Mera Burger', 'extra', 33000),
  ('Burrito El Patrón', 'extra', 30000),
  ('Burrito Ranchero', 'extra', 26000);
