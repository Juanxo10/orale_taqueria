// Regenera db/seed.sql desde la fuente única del frontend.
import { writeFileSync } from "fs";
import { MENU } from "../../Fronted/src/data/menuData.js";
const q = (s) => s.replace(/'/g, "''");
const rows = MENU.flatMap((c) => [`  -- ${c.cat}`, ...c.items.map((i) => `  ('${q(i.name)}', 'extra', ${i.price}),`)]);
rows[rows.length - 1] = rows[rows.length - 1].replace(/,$/, ";");
writeFileSync(new URL("../db/seed.sql", import.meta.url),
`-- Generado por scripts/genSeed.mjs desde Fronted/src/data/menuData.js (Orale Taquería)
INSERT INTO configuracion (clave, valor) VALUES ('domicilio', 6000)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO productos (nombre, tipo, precio) VALUES
${rows.join("\n")}
`);
