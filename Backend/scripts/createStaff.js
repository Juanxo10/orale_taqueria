require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Client } = require("pg");

// Parámetros individuales para evitar problemas con
// caracteres especiales (@, #, %, etc.) en la contraseña
const client = new Client({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS staff (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'empleado')),
  activo        BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);
`;

async function run() {
  await client.connect();
  console.log("✅ Conectado a Supabase");
  await client.query(sql);
  console.log("✅ Tabla 'staff' creada correctamente");
  await client.end();
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
