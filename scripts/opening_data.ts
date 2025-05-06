const urls = [
  'https://raw.githubusercontent.com/lmbell89/chess-eco-json/master/ecoA.json',
  'https://raw.githubusercontent.com/lmbell89/chess-eco-json/master/ecoB.json',
  'https://raw.githubusercontent.com/lmbell89/chess-eco-json/master/ecoC.json',
  'https://raw.githubusercontent.com/lmbell89/chess-eco-json/master/ecoD.json',
  'https://raw.githubusercontent.com/lmbell89/chess-eco-json/master/ecoE.json',
];

const memes = [
  { eco: "Z01", name: "Bongcloud Attack",         pgn: "1. e4 e5 2. Ke2", ecos: ["Z01"] },
  { eco: "Z02", name: "Botez Gambit",             pgn: "1. Qxd8+", ecos: ["Z02"] },
  { eco: "Z03", name: "Grob Attack",              pgn: "1. g4", ecos: ["Z03"] },
  { eco: "Z04", name: "Ware Opening",             pgn: "1. a4", ecos: ["Z04"] },
  { eco: "Z05", name: "Crab Opening",             pgn: "1. a4 h5", ecos: ["Z05"] },
  { eco: "Z06", name: "Jerome Gambit",            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Bxf7+", ecos: ["Z06"] },
  { eco: "Z07", name: "Englund Gambit Trap",      pgn: "1. d4 e5 2. dxe5 Nc6", ecos: ["Z07"] },
  { eco: "Z08", name: "St. George Defence",       pgn: "1. e4 a6", ecos: ["Z08"] },
  { eco: "Z09", name: "Dracula–Frankenstein",     pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4", ecos: ["Z09"] },
  { eco: "Z10", name: "Bongcloud Counter-Gambit", pgn: "1. e4 e5 2. Ke2 Ke7", ecos: ["Z10"] }
];

function ply(pgn) { return (pgn.match(/\d+\./g) || []).length * 2; }

async function main() {
  const all = [];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`❌ Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        continue;
      }
      const arr = await res.json();
      if (!Array.isArray(arr)) {
        console.error(`❌ Expected array from ${url}, got:`, arr);
        continue;
      }
      all.push(...arr);
      console.log(`✅ Downloaded ${arr.length} entries from ${url}`);
    } catch (err) {
      console.error(`❌ Error fetching ${url}:`, err);
    }
  }

  // Normalize all rows to {eco, name, variant, pgn}
  const allRows = all.map(o => ({
    eco: o.code || o.eco,
    name: o.title || o.name,
    variant: o.variant || "",
    pgn: o.moves || o.pgn
  }));

  // 1. Group by name+variant, keep deepest PGN (by string length), merge ecos
  const byKey = new Map();
  for (const o of allRows) {
    if (typeof o.name === "string" && typeof o.eco === "string" && typeof o.pgn === "string") {
      const key = o.variant && o.variant.trim() ? `${o.name.trim()}: ${o.variant.trim()}` : o.name.trim();
      const entry = byKey.get(key);
      if (!entry || o.pgn.length > entry.pgn.length) {
        byKey.set(key, {
          eco: o.eco,
          name: o.name,
          variant: o.variant,
          pgn: o.pgn.replace(/\s+/g, " "),
          ecos: new Set(entry?.ecos)
        });
      }
      byKey.get(key).ecos.add(o.eco);
    }
  }

  // 2. Ensure each ECO code appears in only one ecos list (deepest PGN wins)
  const ecoToKey = new Map();
  for (const [key, entry] of byKey.entries()) {
    for (const eco of entry.ecos) {
      const prev = ecoToKey.get(eco);
      if (!prev || (entry.pgn && entry.pgn.length > (prev.pgnLen || 0))) {
        ecoToKey.set(eco, { key, pgnLen: entry.pgn ? entry.pgn.length : 0 });
      }
    }
  }
  // Now, rebuild ecos sets so each ECO is only in one opening
  let droppedEcos = [];
  for (const [key, entry] of byKey.entries()) {
    const before = new Set(entry.ecos);
    entry.ecos = new Set(Array.from(entry.ecos).filter(eco => ecoToKey.get(eco)?.key === key));
    for (const eco of before) {
      if (!entry.ecos.has(eco)) droppedEcos.push({ eco, key });
    }
  }

  // Convert map to array with unique ecos, filter out any with ecos: []
  const canonical = Array.from(byKey.values())
    .map(e => {
      const obj = {
        eco: e.eco,
        name: e.name,
        pgn: e.pgn,
        ecos: Array.from(e.ecos)
      };
      if (e.variant && e.variant.trim()) obj.variant = e.variant;
      return obj;
    })
    .filter(e => e.ecos.length > 0); // Remove any with no ecos

  const openings = [...canonical, ...memes];
  const file = `const openings = ${JSON.stringify(openings, null, 2)};\nexport default openings;\nconsole.log('✅ openings:', openings.length);\n`;
  await import('fs/promises').then(fs => fs.writeFile('scripts/opening_data_out.ts', file));
  console.log('✅ openings:', openings.length);
  if (droppedEcos.length > 0) {
    console.warn('⚠️ Dropped ECO codes due to conflict:', droppedEcos);
  }
}

main();
