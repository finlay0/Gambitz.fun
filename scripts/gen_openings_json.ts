import fs from "fs";
import { parse } from "csv-parse/sync";

const rows = parse(fs.readFileSync("openings.csv", "utf8"), { columns: false });
const map: Record<string, string> = {};

for (const r of rows) {
  // r[0]: eco, r[2]: mint
  if (!r[0] || !r[2]) continue;
  map[r[0].trim()] = r[2].split(",")[0].replace(/(^\")|(\"$)/g, '').trim();
}

fs.mkdirSync("web/lib", { recursive: true });
fs.writeFileSync("web/lib/openings.json", JSON.stringify(map, null, 2));
console.log(`✅ openings.json written with ${Object.keys(map).length} entries`); 