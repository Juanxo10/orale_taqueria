-- Quita las tablas del producto anterior (bowls). Los pedidos ahora solo tienen productos del menú (pedido_extras). Idempotente.
DROP TABLE IF EXISTS public.bowl_items;
DROP TABLE IF EXISTS public.bowls;
