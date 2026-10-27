// Regenera db/seed.sql desde la fuente única del frontend.
import { writeFileSync } from "fs";
import { MENU } from "../../Fronted/src/data/menuData.js";
const q = (s) => s.replace(/'/g, "''");
const rows = MENU.flatMap((c) => [`  -- ${c.cat}`, ...c.items.map((i) => `  ('${q(i.name)}', 'extra', ${i.price}),`)]);
rows[rows.length - 1] = rows[rows.length - 1].replace(/,$/, ";");
writeFileSync(new URL("../db/seed.sql", import.meta.url),
`-- Generado por scripts/genSeed.mjs desde Fronted/src/data/menuData.js (Orale Taquería)
INSERT INTO configuracion (clave, valor) VALUES ('domicilio', 7000)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO productos (nombre, tipo, precio) VALUES
${rows.join("\n")}
`);

// Categoría, descripción y orden de cada producto (menú en la BD). Solo rellena lo que aún no tiene categoría.
const nul = (s) => (s ? `'${q(s)}'` : "NULL");
const cats = MENU.map((c, ci) => `  ('${q(c.cat)}', ${nul(c.note)}, ${ci})`);
const prods = MENU.flatMap((c) => c.items.map((i, ii) => `  ('${q(i.name)}', '${q(c.cat)}', ${nul(i.desc)}, ${ii})`));
writeFileSync(new URL("../db/seed_menu.sql", import.meta.url),
`-- Generado por scripts/genSeed.mjs desde Fronted/src/data/menuData.js (Orale Taquería)
INSERT INTO categorias (nombre, nota, orden) VALUES
${cats.join(",\n")}
ON CONFLICT (nombre) DO NOTHING;

UPDATE productos p SET categoria = v.cat, descripcion = v.descr, orden = v.orden
FROM (VALUES
${prods.join(",\n")}
) AS v(nombre, cat, descr, orden)
WHERE p.nombre = v.nombre AND p.tipo = 'extra' AND p.categoria IS NULL;
`);
