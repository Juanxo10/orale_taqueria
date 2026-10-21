const pool = require("../db");

const LOCAL = "(creado_en AT TIME ZONE 'America/Bogota')";

// Extracto de ventas entre dos fechas inclusive (hora de Colombia). soloEntregados=false incluye pedidos en curso.
// Nunca incluye cancelados ni pagos pendientes.
async function extractoVentas(desde, hasta, soloEntregados) {
  const { rows } = await pool.query(
    `SELECT id, numero_pedido, to_char(${LOCAL}, 'YYYY-MM-DD') AS fecha, to_char(${LOCAL}, 'HH24:MI') AS hora,
            nombre_cliente AS cliente, telefono, metodo_pago, tipo_entrega, estado, subtotal, domicilio, total
     FROM pedidos
     WHERE ${LOCAL}::date BETWEEN $1::date AND $2::date
       AND (CASE WHEN $3::boolean THEN estado = 'entregado' ELSE estado NOT IN ('cancelado', 'pendiente_pago') END)
     ORDER BY creado_en, id`,
    [desde, hasta, soloEntregados]
  );
  return rows;
}

module.exports = { extractoVentas };
