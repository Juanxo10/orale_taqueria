// Postgres local embebido (sin instalar nada): datos en Backend/.pgdata, puerto 5433.
// Uso: npm run db  (déjalo corriendo en una terminal)
const EmbeddedPostgres = require("embedded-postgres").default;
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", ".pgdata");
const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port: 5433, persistent: true, initdbFlags: ["--encoding=UTF8", "--locale=C"] });

(async () => {
  const nuevo = !fs.existsSync(path.join(dir, "PG_VERSION"));
  if (nuevo) await pg.initialise();
  await pg.start();
  if (nuevo) await pg.createDatabase("tacos");
  console.log("✅ Postgres listo en postgresql://postgres:postgres@localhost:5433/tacos");
  process.on("SIGINT", async () => { await pg.stop(); process.exit(0); });
})();
