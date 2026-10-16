const { Pool } = require("pg");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.message);
  } else {
    console.log("✅ Conectado a PostgreSQL —", process.env.DB_NAME);
  }
});

module.exports = pool;
