const pool = require("../db");

const TZ = "'America/Bogota'";
// Todas las fechas/horas se calculan en hora de Colombia (la BD guarda UTC: una venta de las 8 pm caería en el día siguiente).
const local = (col) => `(${col} AT TIME ZONE ${TZ})`;
// $1 = desde, $2 = hasta (ambos opcionales, inclusivos)
const rango = (col) =>
  `AND ($1::date IS NULL OR ${local(col)}::date >= $1::date) AND ($2::date IS NULL OR ${local(col)}::date <= $2::date)`;

async function obtenerEstadisticas(desde, hasta) {
  const params = [desde || null, hasta || null];
  const q = async (sql) => (await pool.query(sql, params)).rows;

  // Pedidos válidos = no cancelados y con pago confirmado. Los cancelados solo cuentan en el resumen y la tasa de cancelación.
  const validos = `estado NOT IN ('cancelado', 'pendiente_pago')`;

  const [resumen] = await q(`
    SELECT
      COUNT(*)::int AS total_pedidos,
      COUNT(*) FILTER (WHERE estado = 'entregado')::int AS entregados,
      COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados,
      COALESCE(SUM(total) FILTER (WHERE estado != 'cancelado'), 0)::int AS ingresos_totales,
      COALESCE(SUM(domicilio) FILTER (WHERE estado != 'cancelado'), 0)::int AS ingresos_domicilio,
      COALESCE(ROUND(AVG(total) FILTER (WHERE estado != 'cancelado')), 0)::int AS ticket_promedio,
      COUNT(DISTINCT telefono) FILTER (WHERE estado != 'cancelado')::int AS clientes_unicos,
      COUNT(*) FILTER (WHERE ${validos} AND tipo_entrega = 'recogida')::int AS recogida,
      COUNT(*) FILTER (WHERE ${validos} AND tipo_entrega != 'recogida')::int AS domicilio
    FROM pedidos WHERE estado != 'pendiente_pago' ${rango("creado_en")}
  `);

  const ingresosPorDia = await q(`
    SELECT ${local("creado_en")}::date::text AS fecha, COUNT(*)::int AS pedidos,
      COALESCE(SUM(total) FILTER (WHERE estado != 'cancelado'), 0)::int AS ingresos
    FROM pedidos WHERE estado != 'pendiente_pago' ${rango("creado_en")}
    GROUP BY 1 ORDER BY 1
  `);

  const pedidosPorHora = await q(`
    SELECT EXTRACT(HOUR FROM ${local("creado_en")})::int AS hora, COUNT(*)::int AS cantidad
    FROM pedidos WHERE ${validos} ${rango("creado_en")}
    GROUP BY 1 ORDER BY 1
  `);

  const pedidosPorDiaSemana = await q(`
    SELECT EXTRACT(DOW FROM ${local("creado_en")})::int AS dia, COUNT(*)::int AS cantidad
    FROM pedidos WHERE ${validos} ${rango("creado_en")}
    GROUP BY 1 ORDER BY 1
  `);

  // Unidades e ingreso por producto vendido (ingreso = cantidad × precio actual del producto)
  const productos = await q(`
    SELECT p.nombre, SUM(pe.cantidad)::int AS cantidad, (SUM(pe.cantidad) * p.precio)::int AS ingresos
    FROM pedido_extras pe JOIN productos p ON pe.producto_id = p.id JOIN pedidos ped ON pe.pedido_id = ped.id
    WHERE ped.${validos} ${rango("ped.creado_en")}
    GROUP BY p.id ORDER BY cantidad DESC, p.nombre
  `);

  const topClientes = await q(`
    SELECT MAX(nombre_cliente) AS nombre, telefono, COUNT(*)::int AS pedidos, SUM(total)::int AS gastado
    FROM pedidos WHERE ${validos} ${rango("creado_en")}
    GROUP BY telefono ORDER BY pedidos DESC, gastado DESC LIMIT 10
  `);

  const topBarrios = await q(`
    SELECT barrio, COUNT(*)::int AS pedidos
    FROM pedidos WHERE ${validos} AND barrio IS NOT NULL AND barrio != '' ${rango("creado_en")}
    GROUP BY barrio ORDER BY pedidos DESC LIMIT 10
  `);

  const metodosPago = await q(`
    SELECT metodo_pago, COUNT(*)::int AS cantidad, SUM(total)::int AS ingresos
    FROM pedidos WHERE ${validos} ${rango("creado_en")}
    GROUP BY metodo_pago ORDER BY cantidad DESC
  `);

  const cancelacionSemanal = await q(`
    SELECT DATE_TRUNC('week', ${local("creado_en")})::date::text AS semana, COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados
    FROM pedidos WHERE estado != 'pendiente_pago' ${rango("creado_en")}
    GROUP BY 1 ORDER BY 1
  `);

  return { resumen, ingresosPorDia, pedidosPorHora, pedidosPorDiaSemana, productos, topClientes, topBarrios, metodosPago, cancelacionSemanal };
}

module.exports = { obtenerEstadisticas };
