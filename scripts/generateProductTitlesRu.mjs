/**
 * Генерация src/data/productTitlesRu.json (en→ru через translate.googleapis.com gtx).
 * Запуск: node scripts/generateProductTitlesRu.mjs
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../src/data/productTitlesRu.json');

async function fetchAllProducts() {
  const out = [];
  let skip = 0;
  const limit = 100;
  for (;;) {
    const r = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
    const d = await r.json();
    const batch = d.products || [];
    out.push(...batch);
    if (batch.length < limit || out.length >= (d.total ?? 0)) break;
    skip += limit;
  }
  return out;
}

async function translateGtx(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = await r.json();
  const out = json?.[0]?.[0]?.[0];
  if (typeof out !== 'string') throw new Error('bad response');
  return out;
}

const products = await fetchAllProducts();
const map = {};
let n = 0;
for (const p of products) {
  n += 1;
  let ru = p.title;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      ru = await translateGtx(p.title);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  map[p.id] = ru;
  if (n % 20 === 0) console.log(`${n}/${products.length}`);
  await new Promise((r) => setTimeout(r, 120));
}

writeFileSync(outPath, JSON.stringify(map, null, 0), 'utf8');
console.log('OK:', outPath, Object.keys(map).length);
