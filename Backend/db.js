const { Pool } = require("pg");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: /localhost|127.0.0.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
});

pool.connect((err, _c, release) => {
  if (err) console.error("❌ Error conectando a PostgreSQL:", err.message);
  else { console.log("✅ Conectado a PostgreSQL"); release(); }
});

module.exports = pool;
