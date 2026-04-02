/**
 * Русские названия категорий (slug из DummyJSON → отображаемое имя).
 */
export const CATEGORY_LABEL_RU = {
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

/**
 * Русское название категории по slug или по строке из API.
 */
export function categoryLabelRu(slugOrName) {
  if (!slugOrName) return '—';
  const key = String(slugOrName).toLowerCase().trim();
  if (CATEGORY_LABEL_RU[key]) return CATEGORY_LABEL_RU[key];
  return slugOrName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Подстановки для перевода названий и описаний (англ. каталог API → русский интерфейс).
 * Порядок важен: сначала более длинные фразы.
 */
const TITLE_REPLACEMENTS = [
  [/women's/gi, 'Женские'],
  [/men's/gi, 'Мужские'],
  [/sunglasses/gi, 'солнцезащитные очки'],
  [/smartphone/gi, 'смартфон'],
  [/headphones/gi, 'наушники'],
  [/earbuds/gi, 'наушники'],
  [/eyeshadow/gi, 'тени для век'],
  [/mascara/gi, 'тушь для ресниц'],
  [/lipstick/gi, 'помада'],
  [/foundation/gi, 'тональный крем'],
  [/moisturizer/gi, 'увлажняющий крем'],
  [/serum/gi, 'сыворотка'],
  [/cleanser/gi, 'очищающее средство'],
  [/sunscreen/gi, 'солнцезащитный крем'],
  [/nail polish/gi, 'лак для ногтей'],
  [/perfume/gi, 'парфюм'],
  [/fragrance/gi, 'аромат'],
  [/eau de toilette/gi, 'туалетная вода'],
  [/laptop/gi, 'ноутбук'],
  [/macbook/gi, 'MacBook'],
  [/tablet/gi, 'планшет'],
  [/iphone/gi, 'iPhone'],
  [/samsung galaxy/gi, 'Samsung Galaxy'],
  [/galaxy/gi, 'Galaxy'],
  [/watch/gi, 'часы'],
  [/watches/gi, 'часы'],
  [/shirt/gi, 'рубашка'],
  [/shirts/gi, 'рубашки'],
  [/shoe/gi, 'обувь'],
  [/shoes/gi, 'обувь'],
  [/sneaker/gi, 'кроссовки'],
  [/sneakers/gi, 'кроссовки'],
  [/boots/gi, 'сапоги'],
  [/sandals/gi, 'сандалии'],
  [/dress/gi, 'платье'],
  [/dresses/gi, 'платья'],
  [/bag/gi, 'сумка'],
  [/bags/gi, 'сумки'],
  [/handbag/gi, 'сумка'],
  [/backpack/gi, 'рюкзак'],
  [/jewellery/gi, 'украшения'],
  [/jewelry/gi, 'украшения'],
  [/necklace/gi, 'ожерелье'],
  [/ring/gi, 'кольцо'],
  [/bracelet/gi, 'браслет'],
  [/earrings/gi, 'серьги'],
  [/chair/gi, 'стул'],
  [/table/gi, 'стол'],
  [/bed/gi, 'кровать'],
  [/sofa/gi, 'диван'],
  [/shelf/gi, 'полка'],
  [/cabinet/gi, 'шкаф'],
  [/lamp/gi, 'лампа'],
  [/decoration/gi, 'декор'],
  [/kitchen/gi, 'кухонный'],
  [/groceries/gi, 'продукты'],
  [/milk/gi, 'молоко'],
  [/honey/gi, 'мёд'],
  [/rice/gi, 'рис'],
  [/pasta/gi, 'макароны'],
  [/oil/gi, 'масло'],
  [/water/gi, 'вода'],
  [/eggs/gi, 'яйца'],
  [/meat/gi, 'мясо'],
  [/fish/gi, 'рыба'],
  [/chicken/gi, 'курица'],
  [/motorcycle/gi, 'мотоцикл'],
  [/vehicle/gi, 'автотовар'],
  [/car /gi, 'авто '],
  [/tire/gi, 'шина'],
  [/wheel/gi, 'колесо'],
  [/sports/gi, 'спортивные'],
  [/accessories/gi, 'аксессуары'],
  [/charger/gi, 'зарядное устройство'],
  [/cable/gi, 'кабель'],
  [/case/gi, 'чехол'],
  [/cover/gi, 'чехол'],
  [/screen protector/gi, 'защитное стекло'],
  [/holder/gi, 'держатель'],
  [/stand/gi, 'подставка'],
  [/speaker/gi, 'колонка'],
  [/camera/gi, 'камера'],
  [/glasses/gi, 'очки'],
  [/cream/gi, 'крем'],
  [/lotion/gi, 'лосьон'],
  [/powder/gi, 'пудра'],
  [/brush/gi, 'кисть'],
  [/set/gi, 'набор'],
  [/pack/gi, 'упаковка'],
  [/organic/gi, 'органический'],
  [/natural/gi, 'натуральный'],
  [/premium/gi, 'премиум'],
  [/classic/gi, 'классический'],
  [/modern/gi, 'современный'],
  [/vintage/gi, 'винтажный'],
  [/slim/gi, 'приталенный'],
  [/leather/gi, 'кожаный'],
  [/cotton/gi, 'хлопковый'],
  [/silk/gi, 'шёлковый'],
  [/denim/gi, 'джинсовый'],
  [/black/gi, 'чёрный'],
  [/white/gi, 'белый'],
  [/blue/gi, 'синий'],
  [/red/gi, 'красный'],
  [/green/gi, 'зелёный'],
  [/pink/gi, 'розовый'],
  [/gold/gi, 'золотой'],
  [/silver/gi, 'серебряный'],
  [/brown/gi, 'коричневый'],
  [/grey/gi, 'серый'],
  [/gray/gi, 'серый'],
  [/\bfor\b/gi, 'для'],
  [/\band\b/gi, 'и'],
  [/\bwith\b/gi, 'с'],
  [/\bin\b/gi, 'в'],
  [/\bon\b/gi, 'на'],
];

/**
 * Локализация названия/описания товара (эвристика поверх англ. текста API).
 */
export function localizeProductTitle(text) {
  if (!text || typeof text !== 'string') return '';
  let out = text;
  for (const [re, ru] of TITLE_REPLACEMENTS) {
    out = out.replace(re, ru);
  }
  return out.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').trim();
}

/**
 * Поиск по подстроке: русское имя (после localizeProductTitle) или оригинальный title из API.
 */
export function productMatchesTitleQuery(product, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  const ru = String(product?.name ?? '').toLowerCase();
  const en = String(product?.raw?.title ?? '').toLowerCase();
  return ru.includes(q) || en.includes(q);
}

/**
 * То же правило, но по сырому объекту API (без mapProduct) — для фильтрации до тяжёлой нормализации карточек.
 */
export function rawProductMatchesTitleQuery(rawProduct, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  const ru = localizeProductTitle(rawProduct?.title ?? '').toLowerCase();
  const en = String(rawProduct?.title ?? '').toLowerCase();
  return ru.includes(q) || en.includes(q);
}
