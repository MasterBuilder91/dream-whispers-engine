/**
 * Build-time script: extracts dream interpretation entries from both SQLite
 * databases and writes a compact JSON index for the Netlify edge function.
 * Run automatically as part of `npm run build`.
 */
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

async function main() {
  const SQL = await initSqlJs({
    locateFile: (f) => join(ROOT, 'node_modules/sql.js/dist/', f),
  });

  const entries = [];

  // ── Al-Nabulsi ───────────────────────────────────────────────────────────
  const alBuf = readFileSync(join(ROOT, 'public/databases/al_nabulsi.db'));
  const alDb = new SQL.Database(new Uint8Array(alBuf));

  const alRows = alDb.exec(
    "SELECT symbol_name, interpretation_text FROM dream_symbols WHERE length(symbol_name) > 0 AND length(symbol_name) < 100"
  );

  let alCount = 0;
  for (const row of alRows[0]?.values ?? []) {
    const title = String(row[0]).trim();
    const content = String(row[1]).trim();
    if (!title || content.length < 30) continue;
    // Skip rows where the content is just book metadata (publisher, title page)
    if (content.includes('الناشر:') && content.indexOf('الناشر:') < 80) continue;
    entries.push({ t: title, c: content.slice(0, 700), s: 'N' });
    alCount++;
  }
  alDb.close();
  console.log(`Al-Nabulsi: ${alCount} entries`);

  // ── Ibn Sirin ─────────────────────────────────────────────────────────────
  const ibnBuf = readFileSync(join(ROOT, 'public/databases/ibn_sirin.db'));
  const ibnDb = new SQL.Database(new Uint8Array(ibnBuf));

  const ibnRows = ibnDb.exec(
    "SELECT page_title, clean_text FROM pages WHERE length(clean_text) > 100"
  );

  let ibnCount = 0;
  for (const row of ibnRows[0]?.values ?? []) {
    const title = String(row[0]).trim();
    const content = String(row[1]).trim();
    if (content.length < 100) continue;
    if (content.includes('الناشر:') && content.indexOf('الناشر:') < 80) continue;
    entries.push({ t: title, c: content.slice(0, 700), s: 'I' });
    ibnCount++;
  }
  ibnDb.close();
  console.log(`Ibn Sirin: ${ibnCount} pages`);

  console.log(`Total entries: ${entries.length}`);

  const outDir = join(ROOT, 'netlify/edge-functions');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'db-index.json');
  writeFileSync(outPath, JSON.stringify(entries));

  const sizeKb = Math.round(readFileSync(outPath).length / 1024);
  console.log(`Written ${outPath} (${sizeKb} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
