-- Generado por scripts/genSeed.mjs desde Fronted/src/data/menuData.js (Orale Taquería)
INSERT INTO configuracion (clave, valor) VALUES ('domicilio', 6000)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO productos (nombre, tipo, precio) VALUES
  -- Entradas
  ('Nachada', 'extra', 30000),
  ('Las Tostaditas', 'extra', 18000),
  ('Totopos Chingones', 'extra', 16000),
  -- Tacos
  ('Tacos Carnitas', 'extra', 24000),
  ('Tacos de Birria', 'extra', 26000),
  ('Tacos Rancheros', 'extra', 24000),
  ('Tacos al Pastor', 'extra', 24000),
  ('Tacos de Cochinita Pibil', 'extra', 25000),
  ('La Hijuebirria', 'extra', 36000),
  ('Taquiza Órale', 'extra', 35000),
  -- Bebidas de la casa
  ('Flor de Jamaica', 'extra', 7000),
  ('Tamarindo', 'extra', 7000),
  ('Agua de Horchata', 'extra', 8000),
  -- Sodas artesanales
  ('Frutos Rojos', 'extra', 16000),
  ('Frutos Amarillos', 'extra', 16000),
  ('Sandía Limón', 'extra', 16000),
  -- Otras bebidas
  ('Gaseosa', 'extra', 5000),
  ('Cervezas', 'extra', 5000),
  ('Estella', 'extra', 6000),
  ('Botella de Tequila', 'extra', 180000),
  -- Cocteles
  ('Margarita', 'extra', 22000),
  ('Paloma', 'extra', 23000),
  ('Cantarito', 'extra', 25000),
  ('Sunrise', 'extra', 22000),
  ('El Caporal', 'extra', 27000),
  ('Shot de Tequila', 'extra', 15000),
  ('Tinto Mexicano', 'extra', 3000),
  -- Quesadillas
  ('Quesadilla al Estilo Michoacán', 'extra', 20000),
  ('Gringa al Pastor', 'extra', 20000),
  ('Quesabirria Órale', 'extra', 24000),
  -- Pizzas
  ('Pizzeta de Cochinita Pibil', 'extra', 36000),
  ('Pizzeta de Carnitas', 'extra', 36000),
  ('Pizzeta al Pastor', 'extra', 36000),
  ('Pizzeta de Birria', 'extra', 36000),
  -- Exclusivos del restaurante
  ('Ramen de Birria', 'extra', 25000),
  ('Plátano Chingón', 'extra', 24000),
  ('La Mestiza', 'extra', 32000),
  ('La Mera Burger', 'extra', 32000),
  ('Burrito El Patrón', 'extra', 29000),
  ('Burrito Ranchero', 'extra', 29000);
