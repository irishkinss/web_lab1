import { localizeProductTitle, rawProductMatchesTitleQuery } from '../i18n/ruCatalog';
import { usdToRub } from '../config/pricing';

const BASE = 'https://dummyjson.com';
/** Должно совпадать с ALL_CATEGORIES в CategoryTabs.jsx */
const ALL_CATEGORIES = 'Все категории';

/** Обычные запросы (категории, одна страница каталога, карточка товара). */
const FETCH_TIMEOUT_MS = 45000;
/** Постраничная выгрузка всего каталога / категории — несколько крупных ответов подряд, нужен больший лимит. */
const BULK_FETCH_TIMEOUT_MS = 120000;

/**
 * Обычный fetch с таймаутом: без этого зависший запрос держит экран в «Загрузка…» бесконечно.
 * @param {number} [timeoutMs] — для тяжёлых цепочек запросов передайте BULK_FETCH_TIMEOUT_MS.
 */
async function timedFetch(url, init = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа от сервера');
    }
    throw e;
  } finally {
    clearTimeout(tid);
  }
}

/** Абсолютный URL картинки (DummyJSON иногда отдаёт относительные пути) */
export function normalizeImageUrl(url) {
  if (url == null || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  if (t.startsWith('/')) return `${BASE}${t}`;
  return t;
}

/**
 * Кодирует сегменты пути (апостроф в dior-j'adore и т.п.), чтобы <img src> стабильно грузился.
 */
function encodePathInUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter((s) => s.length > 0);
    const path =
      '/' +
      segs
        .map((seg) => {
          try {
            return encodeURIComponent(decodeURIComponent(seg));
          } catch {
            return encodeURIComponent(seg);
          }
        })
        .join('/');
    u.pathname = path || '/';
    return u.href;
  } catch {
    return url;
  }
}

/** Все варианты картинки с сырого объекта API: thumbnail часто надёжнее, чем images[0] */
function collectRawImageUrls(p) {
  if (!p || typeof p !== 'object') return [];
  const out = [];
  const add = (u) => {
    const n = normalizeImageUrl(u);
    if (!n) return;
    if (!out.includes(n)) out.push(n);
    const enc = encodePathInUrl(n);
    if (enc && enc !== n && !out.includes(enc)) out.push(enc);
  };
  if (p.thumbnail) add(p.thumbnail);
  if (Array.isArray(p.images)) {
    for (const im of p.images.slice(0, 6)) add(im);
  }
  return out;
}

/** Первое фото для поля imageUrl в карточке (предпочитаем thumbnail) */
function pickPrimaryImageUrl(p) {
  const urls = collectRawImageUrls(p);
  return urls[0] || '';
}

/** В dev картинки грузим через Vite proxy (тот же origin). */
function imageUrlForApp(absoluteUrl) {
  if (!absoluteUrl) return '';
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && absoluteUrl.startsWith('https://cdn.dummyjson.com')) {
    return absoluteUrl.replace('https://cdn.dummyjson.com', '/cdn-proxy');
  }
  return absoluteUrl;
}

/** SVG data-URL — всегда отображается без внешней сети */
export function svgPlaceholderDataUrl(id) {
  const n = Number(id);
  const num = Number.isFinite(n) ? n : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="#d1fae5" width="100%" height="100%"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#047857" font-family="system-ui,sans-serif" font-size="18">Фото</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#047857" font-size="14">№ ${num}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Один основной URL превью (thumbnail приоритетно) + SVG в конце — без перебора десятка URL по сети.
 */
export function getProductImageCandidates(product) {
  const svg = svgPlaceholderDataUrl(product?.id ?? 0);
  let primary = '';
  if (product?.raw) {
    primary = pickPrimaryImageUrl(product.raw);
  } else if (product?.imageUrl) {
    primary = normalizeImageUrl(product.imageUrl);
  }
  primary = primary ? normalizeImageUrl(primary) : '';
  if (!primary) return [svg];
  const forApp =
    typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? imageUrlForApp(primary) || primary
      : primary;
  return [forApp, svg];
}

/** Первый кандидат (совместимость) */
export function getProductImageUrl(product) {
  const c = getProductImageCandidates(product);
  return c[0] ?? svgPlaceholderDataUrl(product?.id);
}

/** Нормализация товара с DummyJSON к полям, которые ждут компоненты */
export function mapProduct(p) {
  const category =
    typeof p.category === 'string'
      ? p.category
      : p.category?.name || '—';
  const imageUrl = pickPrimaryImageUrl(p);
  return {
    id: p.id,
    name: localizeProductTitle(p.title ?? ''),
    price: usdToRub(p.price),
    category,
    imageUrl,
    // Описание не прогоняем через ~120 regex здесь — длинный текст × 12 товаров блокирует UI.
    // Русский текст для описания — в ProductDetail (один раз на экран).
    description: (p.description ?? '').trim(),
    currency: 'RUB',
    raw: p,
  };
}

export async function fetchCategories() {
  const res = await timedFetch(`${BASE}/products/categories`);
  if (!res.ok) throw new Error(`Категории: HTTP ${res.status}`);
  return res.json();
}

/** DummyJSON: до 250 товаров за запрос — весь каталог (~194) укладывается в один round-trip. */
const BULK_PAGE_LIMIT = 250;

/** Клиентский поиск по русским названиям: нужна полная выгрузка; латиница идёт через /products/search на сервере. */
function hasCyrillic(text) {
  return /[\u0400-\u04FF]/.test(String(text ?? ''));
}

/** Кэш + один общий in-flight запрос: без этого каждый поиск снова тянет весь каталог → «вечная» загрузка. */
let catalogRawCache = null;
let catalogRawInFlight = null;
const categoryRawCache = new Map();
const categoryRawInFlight = new Map();

async function getCachedAllCatalogRaw() {
  if (catalogRawCache) return catalogRawCache;
  if (catalogRawInFlight) return catalogRawInFlight;
  catalogRawInFlight = fetchAllCatalogProducts()
    .then((rows) => {
      catalogRawCache = rows;
      return rows;
    })
    .finally(() => {
      catalogRawInFlight = null;
    });
  return catalogRawInFlight;
}

async function getCachedCategoryRaw(category) {
  if (categoryRawCache.has(category)) return categoryRawCache.get(category);
  const inflight = categoryRawInFlight.get(category);
  if (inflight) return inflight;
  const p = fetchAllCategoryProducts(category)
    .then((rows) => {
      categoryRawCache.set(category, rows);
      return rows;
    })
    .catch((e) => {
      categoryRawInFlight.delete(category);
      throw e;
    })
    .finally(() => {
      categoryRawInFlight.delete(category);
    });
  categoryRawInFlight.set(category, p);
  return p;
}

async function fetchJsonBulk(url, errLabel) {
  const res = await timedFetch(url, {}, BULK_FETCH_TIMEOUT_MS);
  if (!res.ok) throw new Error(`${errLabel}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Вся выборка по пути вида /products или /products/category/…
 * Сначала одна крупная страница, остальное — параллельно (если каталог вырастет).
 */
async function fetchAllProductsPaged(basePath, errLabel) {
  const first = await fetchJsonBulk(
    `${basePath}?limit=${BULK_PAGE_LIMIT}&skip=0`,
    errLabel
  );
  const batch = first.products || [];
  const total = Number(first.total) || 0;
  if (batch.length >= total || batch.length < BULK_PAGE_LIMIT) {
    return batch;
  }
  const skips = [];
  for (let s = batch.length; s < total; s += BULK_PAGE_LIMIT) {
    skips.push(s);
  }
  const pages = await Promise.all(
    skips.map((skip) =>
      fetchJsonBulk(`${basePath}?limit=${BULK_PAGE_LIMIT}&skip=${skip}`, errLabel)
    )
  );
  const rest = pages.flatMap((p) => p.products || []);
  return [...batch, ...rest];
}

async function fetchAllCatalogProducts() {
  return fetchAllProductsPaged(`${BASE}/products`, 'Каталог');
}

async function fetchAllCategoryProducts(category) {
  return fetchAllProductsPaged(
    `${BASE}/products/category/${encodeURIComponent(category)}`,
    'Категория'
  );
}

function mapServerListResponse(data, skip, limit) {
  const rawTotal = Math.max(0, Number(data.total) || 0);
  return {
    products: (data.products || []).map(mapProduct),
    total: rawTotal,
    skip: data.skip ?? skip,
    limit: data.limit ?? limit,
  };
}

/**
 * Поиск по названию: полная выборка каталога или категории, фильтр по сырым данным,
 * mapProduct только для текущей страницы — иначе ~200× mapProduct блокирует UI («вечная» загрузка).
 */
async function fetchProductsRussianSearch({ skip, limit, qTrim, category }) {
  let raw;
  if (category && category !== ALL_CATEGORIES) {
    raw = await getCachedCategoryRaw(category);
  } else {
    raw = await getCachedAllCatalogRaw();
  }
  const rawFiltered = raw.filter((p) => rawProductMatchesTitleQuery(p, qTrim));
  const total = rawFiltered.length;
  const pageRaw = rawFiltered.slice(skip, skip + limit);
  const products = pageRaw.map(mapProduct);
  return {
    products,
    total,
    skip,
    limit,
  };
}

/**
 * Загрузка списка товаров с пагинацией (DummyJSON Products).
 */
export async function fetchProducts({
  skip = 0,
  limit = 12,
  q = '',
  category,
}) {
  const qTrim = q.trim();
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });

  if (qTrim) {
    const allCategories = !category || category === ALL_CATEGORIES;
    /** Серверный поиск без полной выгрузки — только для латиницы/цифр (как в API). */
    if (allCategories && !hasCyrillic(qTrim)) {
      const sp = new URLSearchParams({
        q: qTrim,
        limit: String(limit),
        skip: String(skip),
      });
      const res = await timedFetch(`${BASE}/products/search?${sp}`);
      if (!res.ok) throw new Error(`Поиск: HTTP ${res.status}`);
      const data = await res.json();
      return mapServerListResponse(data, skip, limit);
    }
    return fetchProductsRussianSearch({ skip, limit, qTrim, category });
  }

  if (category && category !== ALL_CATEGORIES) {
    const res = await timedFetch(
      `${BASE}/products/category/${encodeURIComponent(category)}?${params}`
    );
    if (!res.ok) throw new Error(`Категория: HTTP ${res.status}`);
    const data = await res.json();
    return mapServerListResponse(data, skip, limit);
  }

  const res = await timedFetch(`${BASE}/products?${params}`);
  if (!res.ok) throw new Error(`Каталог: HTTP ${res.status}`);
  const data = await res.json();
  return mapServerListResponse(data, skip, limit);
}

/** Фоновая подгрузка полного каталога для поиска (первая страница уже с сервера, без ожидания этого). */
export function prefetchCatalogForSearch() {
  return getCachedAllCatalogRaw().catch(() => {});
}

export async function fetchProductById(id) {
  const res = await timedFetch(`${BASE}/products/${id}`);
  if (!res.ok) throw new Error(`Товар: HTTP ${res.status}`);
  const p = await res.json();
  return mapProduct(p);
}

export async function addProductMock(payload) {
  const res = await timedFetch(`${BASE}/products/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST: HTTP ${res.status}`);
  return res.json();
}

export async function deleteProductMock(id) {
  const res = await timedFetch(`${BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE: HTTP ${res.status}`);
  return res.json();
}
