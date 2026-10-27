const { Pool } = require("pg");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Tope de conexiones y tiempos máximos: una consulta lenta no deja peticiones colgadas ni agota la base
  max: 10,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
  statement_timeout: 15_000,
  query_timeout: 20_000,
  // Con DATABASE_CA (certificado de Supabase en formato PEM) se verifica la identidad del servidor; sin él se mantiene el comportamiento anterior
  ssl: /localhost|127.0.0.1/.test(process.env.DATABASE_URL)
    ? false
    : process.env.DATABASE_CA
      ? { ca: process.env.DATABASE_CA.replace(/\\n/g, "\n"), rejectUnauthorized: true }
      : { rejectUnauthorized: false },
});

pool.connect((err, _c, release) => {
  if (err) console.error("❌ Error conectando a PostgreSQL:", err.message);
  else { console.log("✅ Conectado a PostgreSQL"); release(); }
});

module.exports = pool;
