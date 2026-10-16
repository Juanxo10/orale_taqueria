const pool = require("../db");

async function obtenerEstadisticas(desde, hasta) {
  // Construir filtro de fecha
  const params = [];
  let dateFilter = "";
  let dateFilterPed = "";

  if (desde && hasta) {
    params.push(desde, hasta);
    dateFilter = `AND creado_en >= $1::date AND creado_en < ($2::date + INTERVAL '1 day')`;
    dateFilterPed = `AND ped.creado_en >= $1::date AND ped.creado_en < ($2::date + INTERVAL '1 day')`;
  } else if (desde) {
    params.push(desde);
    dateFilter = `AND creado_en >= $1::date`;
    dateFilterPed = `AND ped.creado_en >= $1::date`;
  } else if (hasta) {
    params.push(hasta);
    dateFilter = `AND creado_en < ($1::date + INTERVAL '1 day')`;
    dateFilterPed = `AND ped.creado_en < ($1::date + INTERVAL '1 day')`;
  }

  const resumenRes = await pool.query(`
    SELECT
      COUNT(*)::int AS total_pedidos,
      COUNT(*) FILTER (WHERE estado = 'entregado')::int AS entregados,
      COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados,
      COALESCE(SUM(total) FILTER (WHERE estado != 'cancelado'), 0)::int AS ingresos_totales,
      COALESCE(ROUND(AVG(total) FILTER (WHERE estado != 'cancelado')), 0)::int AS ticket_promedio,
      COUNT(DISTINCT nombre_cliente)::int AS clientes_unicos
    FROM pedidos WHERE estado != 'pendiente_pago' ${dateFilter}
  `, params);

  const ingresosDiaRes = await pool.query(`
    SELECT creado_en::date AS fecha, COUNT(*)::int AS pedidos,
      COALESCE(SUM(total) FILTER (WHERE estado != 'cancelado'), 0)::int AS ingresos
    FROM pedidos WHERE estado != 'pendiente_pago' ${dateFilter}
    GROUP BY creado_en::date ORDER BY fecha
  `, params);

  const porHoraRes = await pool.query(`
    SELECT EXTRACT(HOUR FROM creado_en)::int AS hora, COUNT(*)::int AS cantidad
    FROM pedidos WHERE estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilter}
    GROUP BY hora ORDER BY hora
  `, params);

  const topBasesRes = await pool.query(`
    SELECT p.nombre, COUNT(*)::int AS cantidad
    FROM bowls b JOIN productos p ON b.base_id = p.id JOIN pedidos ped ON b.pedido_id = ped.id
    WHERE ped.estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilterPed}
    GROUP BY p.nombre ORDER BY cantidad DESC LIMIT 10
  `, params);

  const topProteinasRes = await pool.query(`
    SELECT p.nombre, COUNT(*)::int AS cantidad
    FROM bowl_items bi JOIN productos p ON bi.producto_id = p.id JOIN bowls b ON bi.bowl_id = b.id JOIN pedidos ped ON b.pedido_id = ped.id
    WHERE p.tipo = 'proteina' AND ped.estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilterPed}
    GROUP BY p.nombre ORDER BY cantidad DESC LIMIT 10
  `, params);

  const topToppingsRes = await pool.query(`
    SELECT p.nombre, COUNT(*)::int AS cantidad
    FROM bowl_items bi JOIN productos p ON bi.producto_id = p.id JOIN bowls b ON bi.bowl_id = b.id JOIN pedidos ped ON b.pedido_id = ped.id
    WHERE p.tipo = 'topping' AND ped.estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilterPed}
    GROUP BY p.nombre ORDER BY cantidad DESC LIMIT 10
  `, params);

  const topBebidasRes = await pool.query(`
    SELECT p.nombre, COUNT(*)::int AS cantidad
    FROM bowls b JOIN productos p ON b.bebida_id = p.id JOIN pedidos ped ON b.pedido_id = ped.id
    WHERE ped.estado NOT IN ('cancelado', 'pendiente_pago') AND b.bebida_id IS NOT NULL ${dateFilterPed}
    GROUP BY p.nombre ORDER BY cantidad DESC LIMIT 10
  `, params);

  const topClientesRes = await pool.query(`
    SELECT nombre_cliente AS nombre, COUNT(*)::int AS pedidos,
      COALESCE(SUM(total) FILTER (WHERE estado != 'cancelado'), 0)::int AS gastado
    FROM pedidos WHERE estado != 'pendiente_pago' ${dateFilter}
    GROUP BY nombre_cliente ORDER BY pedidos DESC LIMIT 10
  `, params);

  const topBarriosRes = await pool.query(`
    SELECT barrio, COUNT(*)::int AS pedidos
    FROM pedidos WHERE estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilter}
    GROUP BY barrio ORDER BY pedidos DESC LIMIT 10
  `, params);

  const porDiaSemanaRes = await pool.query(`
    SELECT EXTRACT(DOW FROM creado_en)::int AS dia, COUNT(*)::int AS cantidad
    FROM pedidos WHERE estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilter}
    GROUP BY dia ORDER BY dia
  `, params);

  const metodoPagoRes = await pool.query(`
    SELECT metodo_pago, COUNT(*)::int AS cantidad
    FROM pedidos WHERE estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilter}
    GROUP BY metodo_pago ORDER BY cantidad DESC
  `, params);

  const cancelacionRes = await pool.query(`
    SELECT DATE_TRUNC('week', creado_en)::date AS semana, COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados
    FROM pedidos WHERE estado != 'pendiente_pago' ${dateFilter}
    GROUP BY semana ORDER BY semana
  `, params);

  const topExtrasRes = await pool.query(`
    SELECT p.nombre, SUM(pe.cantidad)::int AS cantidad
    FROM pedido_extras pe JOIN productos p ON pe.producto_id = p.id JOIN pedidos ped ON pe.pedido_id = ped.id
    WHERE ped.estado NOT IN ('cancelado', 'pendiente_pago') ${dateFilterPed}
    GROUP BY p.nombre ORDER BY cantidad DESC LIMIT 10
  `, params);

  return {
    resumen: resumenRes.rows[0],
    ingresosPorDia: ingresosDiaRes.rows,
    pedidosPorHora: porHoraRes.rows,
    topBases: topBasesRes.rows,
    topProteinas: topProteinasRes.rows,
    topToppings: topToppingsRes.rows,
    topBebidas: topBebidasRes.rows,
    topClientes: topClientesRes.rows,
    topBarrios: topBarriosRes.rows,
    pedidosPorDiaSemana: porDiaSemanaRes.rows,
    metodosPago: metodoPagoRes.rows,
    cancelacionSemanal: cancelacionRes.rows,
    topExtras: topExtrasRes.rows,
  };
}

module.exports = { obtenerEstadisticas };
