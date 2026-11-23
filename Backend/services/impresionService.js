const crypto = require("crypto");
const pool = require("../db");

// Ticket para impresoras Epson con Server Direct Print: la impresora pregunta cada pocos segundos y aquí le entregamos el siguiente pedido sin imprimir.

const VENTANA_HORAS = 12; // no reimprime pedidos viejos aunque queden sin marcar

// La impresora puede no tener la página de códigos con tildes: se quitan para que no salgan caracteres raros
const limpio = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const xml = (s) => limpio(s).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]));
const NL = "&#10;";
const fmt = (n) => "$" + Number(n).toLocaleString("es-CO");

function claveValida(recibida) {
  const esperada = process.env.IMPRESORA_KEY || "";
  if (esperada.length < 16 || typeof recibida !== "string") return false; // sin clave configurada se rechaza todo
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function ticketXml(p, extras) {
  const unidades = extras.reduce((s, e) => s + e.cantidad, 0);
  const hora = new Date(p.creado_en).toLocaleString("es-CO", { timeZone: "America/Bogota", hour12: false });
  const linea = "------------------------------------------------";
  const items = extras.map((e) => `${e.cantidad} x ${xml(e.nombre)}`).join(NL);
  const entrega = p.tipo_entrega === "recogida"
    ? `RECOGE EN TIENDA`
    : `DOMICILIO${NL}${xml(p.direccion)}, ${xml(p.barrio)}${p.referencia ? NL + xml(p.referencia) : ""}`;

  return `<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">` +
    `<text align="center"/><text width="2" height="2"/><text em="true"/><text>ORALE TACOS${NL}</text>` +
    `<text width="1" height="1"/><text em="false"/><text>Ticket de cocina${NL}${xml(hora)}${NL}</text>` +
    `<text em="true"/><text>Pedido #${p.id}${NL}</text><text em="false"/>` +
    `<text align="left"/><text>${linea}${NL}</text>` +
    `<text em="true"/><text>${xml(p.nombre_cliente)}${NL}${xml(p.telefono)}${NL}</text><text em="false"/>` +
    `<text>${linea}${NL}</text>` +
    `<text em="true"/><text>${items}${NL}</text><text em="false"/>` +
    `<text>${linea}${NL}</text>` +
    `<text>DESECHABLE x${unidades}${NL}${linea}${NL}</text>` +
    (p.notas ? `<text>NOTAS: ${xml(p.notas)}${NL}${linea}${NL}</text>` : "") +
    `<text>${entrega}${NL}</text>` +
    `<text>${linea}${NL}</text>` +
    `<text em="true"/><text width="2" height="2"/><text>TOTAL ${fmt(p.total)}${NL}</text>` +
    `<feed line="3"/><cut type="feed"/></epos-print>`;
}

// Devuelve el XML de respuesta para la impresora, o null si no hay nada que imprimir
async function siguienteTrabajo() {
  const { rows } = await pool.query(
    `SELECT * FROM pedidos
     WHERE estado = 'nuevo' AND impreso_en IS NULL AND creado_en > NOW() - ($1 || ' hours')::interval
     ORDER BY id LIMIT 1`,
    [VENTANA_HORAS]
  );
  if (!rows.length) return null;
  const p = rows[0];
  const extras = (await pool.query(
    `SELECT pr.nombre, pe.cantidad FROM pedido_extras pe JOIN productos pr ON pr.id = pe.producto_id WHERE pe.pedido_id = $1 ORDER BY pe.id`,
    [p.id]
  )).rows;

  return `<?xml version="1.0" encoding="utf-8"?><PrintRequestInfo Version="2.00"><ePOSPrint>` +
    `<Parameter><devid>local_printer</devid><timeout>10000</timeout><printjobid>${p.id}</printjobid></Parameter>` +
    `<PrintData>${ticketXml(p, extras)}</PrintData></ePOSPrint></PrintRequestInfo>`;
}

// La impresora avisa el resultado: solo si imprimió bien se marca el pedido (si falla, se reintenta)
async function registrarResultado(responseFile) {
  const id = Number(/<printjobid>(\d+)<\/printjobid>/.exec(responseFile || "")?.[1]);
  if (!Number.isInteger(id) || !/success="true"/.test(responseFile)) return false;
  await pool.query("UPDATE pedidos SET impreso_en = NOW() WHERE id = $1 AND impreso_en IS NULL", [id]);
  return true;
}

module.exports = { claveValida, siguienteTrabajo, registrarResultado, ticketXml };
