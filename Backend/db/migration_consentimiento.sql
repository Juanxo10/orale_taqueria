-- Prueba de la autorización de tratamiento de datos (Ley 1581 de 2012): cuándo aceptó el cliente la política y los términos al pedir. Idempotente.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS acepto_terminos_en TIMESTAMPTZ;
