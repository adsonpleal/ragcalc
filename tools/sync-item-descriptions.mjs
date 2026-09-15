// Build src/lib/exp-descriptions.json — the in-game description of every item
// in the Conjunto de EXP list, shown in the hover popover (src/components/item-tooltip.ts).
//
// Source of truth is the sibling project ragassets, which extracts the item
// table straight from the LATAM client:
//   https://assets.latam-tools.com.br/raw/items.json
// That file is ~9.5 MB for ~17k items. The app needs ~170 of them, so this
// script cuts it down to the ids src/lib/exp-items.json lists, keeping the raw
// client text (color codes and all) — formatting is src/lib/item-desc.ts's job.
//
// Upstream shape — a JSON array, one record per item:
//   { "id": 19242, "name": "Tiara Felina" | null, "description": "…" | "", … }
//
// Items the client has no text for (`description: ""`) are left out and listed
// on stdout, as are items whose client name differs from exp-items.json's: both
// are worth a look after a client update, neither is fatal.
//
// Usage:
//   node tools/sync-item-descriptions.mjs                       # fetch from ragassets
//   node tools/sync-item-descriptions.mjs --input items.json    # use a local copy instead of fetching
//   node tools/sync-item-descriptions.mjs --url <url>           # override the source URL
//   node tools/sync-item-descriptions.mjs --out <path>          # override the output file

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_URL = "https://assets.latam-tools.com.br/raw/items.json";
const DEFAULT_OUT = "src/lib/exp-descriptions.json";
const ITEMS_FILE = "src/lib/exp-items.json";

/**
 * Pick the descriptions of `items` (exp-items.json's entries) out of ragassets'
 * /raw/items.json. Pure: returns what to write plus what to report.
 */
export function projectDescriptions(raw, items) {
  if (!Array.isArray(raw)) throw new Error("Expected items.json to be a JSON array of item objects.");

  const byId = new Map(raw.map((i) => [i.id, i]));
  const descriptions = {};
  const missing = [];
  const renamed = [];

  // Ascending id: a stable order, so a client update shows up as a readable diff.
  const ids = [...new Set(items.map((i) => i.id))].sort((a, b) => a - b);
  const nameById = new Map(items.map((i) => [i.id, i.name]));
  for (const id of ids) {
    const upstream = byId.get(id);
    if (!upstream?.description) {
      missing.push(id);
      continue;
    }
    descriptions[id] = upstream.description;
    if (upstream.name && upstream.name !== nameById.get(id)) {
      renamed.push({ id, local: nameById.get(id), client: upstream.name });
    }
  }

  return { descriptions, missing, renamed };
}

async function main(argv) {
  const args = parseArgs(argv);
  const outPath = resolve(args.out ?? DEFAULT_OUT);
  const { items } = JSON.parse(readFileSync(resolve(ITEMS_FILE), "utf8"));
  const { descriptions, missing, renamed } = projectDescriptions(await loadSource(args), items);

  const body = Object.entries(descriptions)
    .map(([id, desc]) => `${JSON.stringify(id)}:${JSON.stringify(desc)}`)
    .join(",\n");
  writeFileSync(outPath, `{\n${body}\n}\n`);

  console.log(`exp-descriptions.json: ${Object.keys(descriptions).length} descriptions → ${outPath}`);
  if (missing.length) {
    const label = (id) => `${id} ${items.find((i) => i.id === id)?.name ?? ""}`.trim();
    console.log(`No client text for ${missing.length} item(s):\n  - ${missing.map(label).join("\n  - ")}`);
  }
  if (renamed.length) {
    console.log(
      `Named differently in the client:\n  - ${renamed
        .map((r) => `${r.id}: "${r.local}" here, "${r.client}" in the client`)
        .join("\n  - ")}`,
    );
  }
}

async function loadSource(args) {
  if (args.input) {
    const p = resolve(args.input);
    console.log(`Reading ${p}`);
    return JSON.parse(readFileSync(p, "utf8"));
  }
  const url = args.url ?? DEFAULT_URL;
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input") out.input = argv[++i];
    else if (a === "--url") out.url = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else {
      console.error("usage: node tools/sync-item-descriptions.mjs [--input <items.json>] [--url <url>] [--out <path>]");
      process.exit(1);
    }
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
