/**
 * Генерация русских подписей без перевода API: «Категория» — позиция № id.
 * Запуск: node scripts/generateSyntheticTitlesRu.mjs
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../src/data/productTitlesRu.json');

const CATEGORY_LABEL_RU = {
  beauty: 'Красота и уход',
  fragrances: 'Парфюмерия',
  furniture: 'Мебель',
  groceries: 'Продукты',
  'home-decoration': 'Декор для дома',
  'kitchen-accessories': 'Кухонные принадлежности',
  laptops: 'Ноутбуки',
  'mens-shirts': 'Мужские рубашки',
  'mens-shoes': 'Мужская обувь',
  'mens-watches': 'Мужские часы',
  'mobile-accessories': 'Аксессуары для телефонов',
  motorcycle: 'Мотоциклы',
  'skin-care': 'Уход за кожей',
  smartphones: 'Смартфоны',
  'sports-accessories': 'Спортивные аксессуары',
  sunglasses: 'Солнцезащитные очки',
  tablets: 'Планшеты',
  tops: 'Верхняя одежда',
  vehicle: 'Автотовары',
  'womens-bags': 'Женские сумки',
  'womens-dresses': 'Женские платья',
  'womens-jewellery': 'Женские украшения',
  'womens-shoes': 'Женская обувь',
  'womens-watches': 'Женские часы',
};

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

const products = await fetchAllProducts();
const map = {};
for (const p of products) {
  const slug = typeof p.category === 'string' ? p.category : '';
  const cat = CATEGORY_LABEL_RU[slug] || slug;
  map[p.id] = `«${cat}» — позиция № ${p.id}`;
}
writeFileSync(outPath, JSON.stringify(map, null, 0), 'utf8');
console.log('OK:', outPath, Object.keys(map).length);
