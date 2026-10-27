const { Router } = require("express");
const crypto = require("crypto");
const express = require("express");
const { updateWompiPayment } = require("../services/pedidoService");
const logger = require("../utils/logger");
const limiters = require("../middlewares/limiters");
const pool = require("../db");

const router = Router();

// ─── Verificación de firma Wompi ─────────────────────────────────────────────
// Wompi firma el evento con SHA256 sobre los valores de las propiedades
// listadas en signature.properties + timestamp + WOMPI_EVENTS_SECRET.
function verifyWompiSignature(body) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) {
    // Sin secreto no se puede comprobar quién envía el evento: se rechaza (si no, cualquiera podría aprobar o cancelar pedidos)
    logger.error("WOMPI_EVENTS_SECRET no configurado — webhook rechazado");
    return false;
  }

  const properties = body?.signature?.properties ?? [];
  const checksum   = body?.signature?.checksum;
  const timestamp  = body?.timestamp;

  if (!checksum || !timestamp) return false;

  // Concatenar valores de cada propiedad (navegación por punto). Según la documentación de Wompi,
  // las propiedades (p. ej. "transaction.id") se leen dentro de `data`, no en la raíz del evento.
  let toHash = "";
  for (const prop of properties) {
    const parts = prop.split(".");
    let value = body?.data;
    for (const part of parts) value = value?.[part];
    toHash += value !== undefined && value !== null ? String(value) : "";
  }
  toHash += String(timestamp) + secret;

  const hash = crypto.createHash("sha256").update(toHash).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(String(checksum));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ─── POST /api/wompi/webhook ─────────────────────────────────────────────────
// Wompi necesita raw body para calcular la firma → express.raw() antes de json()
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let body;
    try {
      body = JSON.parse(req.body.toString("utf8"));
    } catch (_) {
      return res.status(400).json({ error: "Cuerpo inválido" });
    }

    if (!verifyWompiSignature(body)) {
      logger.warn({ body }, "Webhook Wompi: firma inválida");
      return res.status(401).json({ error: "Firma inválida" });
    }

    const event = body?.event;
    if (event !== "transaction.updated") {
      // Otros eventos los ignoramos con 200 para que Wompi no reintente
      return res.json({ received: true });
    }

    const tx = body?.data?.transaction;
    if (!tx) {
      return res.status(400).json({ error: "Datos de transacción ausentes" });
    }

    const { id: wompiId, status, reference } = tx;

    // Mapear estado Wompi → nuestro estado_pago
    const estadoPagoMap = {
      APPROVED: "aprobado",
      DECLINED: "rechazado",
      ERROR:    "error",
      VOIDED:   "rechazado",
      PENDING:  "pendiente",
    };
    const estadoPago = estadoPagoMap[status] ?? "pendiente";

    try {
      await updateWompiPayment(reference, wompiId, estadoPago);
      logger.info({ reference, wompiId, estadoPago }, "Pago Wompi actualizado");
    } catch (err) {
      if (err.status === 404) {
        // Pedido no encontrado — puede pasar en sandbox con pruebas viejas
        logger.warn({ reference }, "Webhook Wompi: pedido no encontrado");
        return res.json({ received: true, warning: "Pedido no encontrado" });
      }
      logger.error({ err, reference }, "Error actualizando pago Wompi");
      return res.status(500).json({ error: "Error interno" });
    }

    res.json({ received: true });
  }
);

// ─── POST /api/wompi/integrity-hash ─────────────────────────────────────────
// El frontend llama este endpoint para obtener el hash de integridad requerido
// por Wompi en el checkout. Se genera en el backend para no exponer el secreto.
// El monto NO se toma de lo que envía el navegador: se lee del pedido guardado, así nadie puede pedir una firma por otro valor.
router.post("/integrity-hash", limiters.wompi, async (req, res) => {
  const { reference } = req.body || {};
  const currency = "COP";

  if (typeof reference !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(reference)) {
    return res.status(400).json({ error: "Referencia inválida" });
  }

  let amountInCents;
  try {
    const { rows } = await pool.query(
      "SELECT total FROM pedidos WHERE numero_pedido = $1 AND metodo_pago = 'Transferencia Wompi' AND estado = 'pendiente_pago'",
      [reference]
    );
    if (!rows.length) return res.status(404).json({ error: "Pedido no encontrado o ya pagado" });
    amountInCents = Math.round(Number(rows[0].total) * 100);
  } catch (err) {
    logger.error({ err }, "Error leyendo el pedido para firmar el pago");
    return res.status(500).json({ error: "Error interno" });
  }

  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret || secret === "TU_LLAVE_DE_INTEGRIDAD_AQUI") {
    logger.error("WOMPI_INTEGRITY_SECRET no configurado");
    return res.status(500).json({ error: "Llave de integridad no configurada" });
  }

  // SHA256(reference + amountInCents + currency + integritySecret)
  const toHash = String(reference) + String(amountInCents) + String(currency) + secret;
  const integrity = crypto.createHash("sha256").update(toHash).digest("hex");

  res.json({ integrity, amountInCents });
});

// ─── GET /api/wompi/verificar/:transactionId ──────────────────────────────────
// El frontend llama esto al volver del checkout de Wompi para confirmar el pago
router.get("/verificar/:transactionId", limiters.wompi, async (req, res) => {
  const { transactionId } = req.params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(transactionId)) return res.status(400).json({ error: "Id de transacción inválido" });
  try {
    // Usar producción o sandbox según el tipo de llave privada configurada
    const privateKey = process.env.WOMPI_PRIVATE_KEY || "";
    const baseUrl = privateKey.startsWith("prv_prod")
      ? "https://production.wompi.co/v1"
      : "https://sandbox.wompi.co/v1";
    const r = await fetch(`${baseUrl}/transactions/${transactionId}`, { signal: AbortSignal.timeout(8_000) });
    if (!r.ok) return res.status(502).json({ error: "No se pudo consultar Wompi" });
    const data = await r.json();
    const tx = data?.data;
    if (!tx) return res.status(502).json({ error: "Respuesta inválida de Wompi" });

    const estadoPagoMap = { APPROVED: "aprobado", DECLINED: "rechazado", ERROR: "error", VOIDED: "rechazado", PENDING: "pendiente" };
    const estadoPago = estadoPagoMap[tx.status] ?? "pendiente";

    if (estadoPago === "aprobado" || estadoPago === "rechazado" || estadoPago === "error") {
      try {
        await updateWompiPayment(tx.reference, tx.id, estadoPago);
      } catch (e) {
        if (e.status !== 404) logger.error({ e }, "Error actualizando pago en verificar");
      }
    }

    res.json({ status: tx.status, estadoPago, reference: tx.reference });
  } catch (err) {
    logger.error({ err }, "Error verificando transacción Wompi");
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
