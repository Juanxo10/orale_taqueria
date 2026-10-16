require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");

const { warmup, revisarPendientesWompi } = require("./services/pedidoService");
const pedidosRoutes = require("./routes/pedidos");
const authRoutes = require("./routes/auth");
const staffRoutes = require("./routes/staff");
const sugerenciasRoutes = require("./routes/sugerencias");
const tiendaRoutes = require("./routes/tienda");
const wompiRoutes = require("./routes/wompi");

const app = express();

// ─── Seguridad HTTP ──────────────────────────────────────────────────────────
app.use(helmet());

const corsOptions = {
  origin: [
    "https://pepascoffee.com",
    "https://www.pepascoffee.com",
    process.env.CORS_ORIGIN || "http://localhost:5173",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// ─── Wompi webhook necesita el body crudo para verificar la firma ───────────
// Debe montarse ANTES del parser JSON global: si no, express.json() ya
// consume el body y el webhook nunca puede leerlo (siempre falla).
app.use("/api/wompi/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

// ─── Trust proxy (necesario para rate-limit detrás de reverse proxy / HTTPS) ─
app.set("trust proxy", 1);

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/sugerencias", sugerenciasRoutes);
app.use("/api/tienda", tiendaRoutes);
app.use("/api/wompi", wompiRoutes);

// ─── Manejo de errores global ────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error({ err, method: req.method, url: req.originalUrl }, "Error no controlado");
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  warmup();
  // Revisar pagos Wompi pendientes: inmediatamente y cada 1 minuto
  setTimeout(revisarPendientesWompi, 10_000); // 10s después de arrancar
  setInterval(revisarPendientesWompi, 60_000);
});
