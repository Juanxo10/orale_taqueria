const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:yyyy-mm-dd HH:MM:ss" } }
      : undefined,
  redact: ["req.headers.authorization", "password", "password_hash", "token"],
});

module.exports = logger;
