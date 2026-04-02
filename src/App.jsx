// Lab 2: UX-модель каталога. Lab 3: данные с DummyJSON Products (сеть, пагинация, query).
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CategoryTabs, { ALL_CATEGORIES } from './components/CategoryTabs';
import CartSidebar from './components/CartSidebar';
import ProductDetail from './components/ProductDetail';
import Pagination from './components/Pagination';
import { fetchCategories, fetchProducts, prefetchCatalogForSearch } from './api/dummyJson';

const PAGE_LIMIT = 12;

function readInitialFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const cat = params.get('cat') || ALL_CATEGORIES;
  const pageRaw = parseInt(params.get('page') || '1', 10);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  const skip = Math.max(0, (page - 1) * PAGE_LIMIT);
  return { q, cat, skip, limit: PAGE_LIMIT };
}

const initialUrl = readInitialFromUrl();

/** Сравнение query по смыслу (порядок cat/page/q в строке не должен вызывать лишний replaceState). */
function locationMatchesState(
  search,
  { debouncedQuery, activeCategory, skip, limit }
) {
  const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const qState = debouncedQuery.trim();
  const qUrl = (sp.get('q') || '').trim();
  if (qState !== qUrl) return false;

  const catExpected = activeCategory === ALL_CATEGORIES ? '' : activeCategory;
  const catUrl = sp.get('cat') || '';
  if (catExpected !== catUrl) return false;

  const lim = limit > 0 ? limit : PAGE_LIMIT;
  const pageState = Math.floor(Math.max(0, skip) / lim) + 1;
  const pageRaw = parseInt(sp.get('page') || '1', 10);
  const pageUrl = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  return pageState === pageUrl;
}

const initialUxState = {
  status: 'loading',
  listLoading: true,
  catalog: [],
  total: 0,
  skip: initialUrl.skip,
  limit: initialUrl.limit,
  query: initialUrl.q,
  activeCategory: initialUrl.cat,
  selectedProduct: null,
  errorMessage: null,
};

function nextBrowseStatus(catalogLen, wasViewing) {
  if (wasViewing) return 'viewing';
  return catalogLen > 0 ? 'list' : 'empty';
}

function uxReducer(state, action) {
  switch (action.type) {
    case 'FETCH_LIST_START':
      return {
        ...state,
        listLoading: true,
        errorMessage: null,
      };
    case 'FETCH_LIST_SUCCESS': {
      const { products: rawProducts, total, skip: rawSkip, limit: rawLimit } = action.payload;
      const products = Array.isArray(rawProducts) ? rawProducts : [];
      const wasViewing = state.status === 'viewing';
      const skipNum = Number(rawSkip);
      const limitNum = Number(rawLimit);
      const skip = Number.isFinite(skipNum) && skipNum >= 0 ? skipNum : 0;
      const limit =
        Number.isFinite(limitNum) && limitNum > 0 ? limitNum : state.limit || PAGE_LIMIT;

      // Пока открыта карточка товара, пустой ответ списка (гонка с поиском/категорией) не должен
      // обнулять каталог — иначе пропадает сетка и кажется, что «остался только фон».
      const preserveWhileModal =
        wasViewing &&
        state.selectedProduct != null &&
        products.length === 0 &&
        state.catalog.length > 0;

      if (preserveWhileModal) {
        return {
          ...state,
          listLoading: false,
          errorMessage: null,
        };
      }

      return {
        ...state,
        listLoading: false,
        catalog: products,
        total: Number.isFinite(Number(total)) ? Number(total) : 0,
        skip,
        limit,
        status: nextBrowseStatus(products.length, wasViewing),
        errorMessage: null,
      };
    }
    case 'FETCH_LIST_ERROR':
      return {
        ...state,
        listLoading: false,
        catalog: [],
        total: 0,
        status: 'error',
        errorMessage: action.payload || 'Ошибка загрузки данных каталога',
      };
    case 'INPUT_QUERY': {
      const nextQuery = action.payload;
      if (state.status === 'viewing') {
        return { ...state, query: nextQuery };
      }
      if (state.status === 'loading' || state.status === 'error') {
        return { ...state, query: nextQuery };
      }
      return { ...state, query: nextQuery };
    }
    case 'SEARCH_CLEAR':
      return uxReducer(state, { type: 'INPUT_QUERY', payload: '' });
    case 'SELECT_CATEGORY': {
      const nextCategory = action.payload;
      const nextSkip = 0;
      if (state.activeCategory === nextCategory && state.skip === nextSkip) {
        return state;
      }
      if (state.status === 'viewing') {
        return { ...state, activeCategory: nextCategory, skip: nextSkip };
      }
      if (state.status === 'loading' || state.status === 'error') {
        return { ...state, activeCategory: nextCategory, skip: nextSkip };
      }
      return { ...state, activeCategory: nextCategory, skip: nextSkip };
    }
    case 'SET_SKIP': {
      const next = Number(action.payload);
      const s = Number.isFinite(next) && next >= 0 ? next : 0;
      if (state.skip === s) return state;
      return { ...state, skip: s };
    }
    case 'RESET_SKIP':
      if (state.skip === 0) return state;
      return { ...state, skip: 0 };
    case 'SELECT_PRODUCT':
      return { ...state, selectedProduct: action.payload, status: 'viewing' };
    case 'CLOSE_PRODUCT': {
      const filteredLen = state.catalog.length;
      return {
        ...state,
        selectedProduct: null,
        status: filteredLen > 0 ? 'list' : 'empty',
      };
    }
    default:
      return state;
  }
}

function App() {
  const [ux, dispatch] = useReducer(uxReducer, initialUxState);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState(() => initialUrl.q);
  const debounceBootstrapped = useRef(false);
  /** Совпадает с последним применённым debouncedQuery — чтобы не сбрасывать страницу без смены поиска */
  const appliedQueryRef = useRef(initialUrl.q);
  const fetchGenerationRef = useRef(0);
  const catalogFetchParamsRef = useRef({
    skip: initialUrl.skip,
    limit: initialUrl.limit,
    q: initialUrl.q,
    category: initialUrl.cat,
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  /** Если каталог успел обнулиться при открытой карточке — хотя бы выбранный товар остаётся в сетке. */
  const gridProducts = useMemo(() => {
    if (ux.catalog.length > 0) return ux.catalog;
    if (ux.status === 'viewing' && ux.selectedProduct) return [ux.selectedProduct];
    return [];
  }, [ux.catalog, ux.status, ux.selectedProduct]);

  catalogFetchParamsRef.current = {
    skip: ux.skip,
    limit: ux.limit,
    q: debouncedQuery,
    category: ux.activeCategory,
  };

  useEffect(() => {
    // Первый раз значение уже совпадает с URL — не ждём 400 ms лишний раз.
    if (!debounceBootstrapped.current) {
      debounceBootstrapped.current = true;
      return;
    }
    const t = window.setTimeout(() => {
      const next = ux.query;
      if (appliedQueryRef.current === next) return;
      appliedQueryRef.current = next;
      setDebouncedQuery(next);
      // Вместе с новой строкой поиска — иначе первый fetch после смены q уходит со старым skip (пустая выдача).
      dispatch({ type: 'RESET_SKIP' });
    }, 400);
    return () => window.clearTimeout(t);
  }, [ux.query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCategories();
        if (!cancelled) {
          // DummyJSON отдаёт либо строки, либо { slug, name, url } — нужны slug-строки для вкладок и URL.
          const normalized = Array.isArray(list)
            ? list
                .map((c) => (typeof c === 'string' ? c : c?.slug))
                .filter(Boolean)
            : [];
          setCategories(normalized);
          setCategoriesError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setCategories([]);
          setCategoriesError(String(e.message || e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Полный каталог в фоне — к моменту ввода в поиск кэш чаще уже готов, без блокировки первой страницы. */
  useEffect(() => {
    prefetchCatalogForSearch();
  }, []);

  useEffect(() => {
    let stale = false;
    const myGen = ++fetchGenerationRef.current;
    const p = { ...catalogFetchParamsRef.current };
    const shouldError = new URLSearchParams(window.location.search).get('error') === '1';

    dispatch({ type: 'FETCH_LIST_START' });

    (async () => {
      try {
        if (shouldError) {
          throw new Error('Ошибка получения данных каталога (?error=1)');
        }
        const data = await fetchProducts({
          skip: p.skip,
          limit: p.limit,
          q: p.q,
          category: p.category,
        });
        if (stale) return;
        if (myGen !== fetchGenerationRef.current) return;
        dispatch({ type: 'FETCH_LIST_SUCCESS', payload: data });
      } catch (e) {
        if (stale) return;
        if (myGen !== fetchGenerationRef.current) return;
        dispatch({ type: 'FETCH_LIST_ERROR', payload: e.message || String(e) });
      }
    })();

    return () => {
      stale = true;
    };
  }, [debouncedQuery, ux.activeCategory, ux.skip, ux.limit]);

  useEffect(() => {
    const lim = ux.limit > 0 ? ux.limit : PAGE_LIMIT;
    const page = Math.floor(Math.max(0, ux.skip) / lim) + 1;
    if (
      locationMatchesState(window.location.search, {
        debouncedQuery,
        activeCategory: ux.activeCategory,
        skip: ux.skip,
        limit: ux.limit,
      })
    ) {
      return;
    }
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
    if (ux.activeCategory !== ALL_CATEGORIES) params.set('cat', ux.activeCategory);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next === current) return;
    window.history.replaceState(null, '', next);
  }, [debouncedQuery, ux.activeCategory, ux.skip, ux.limit]);

  const closeProduct = () => dispatch({ type: 'CLOSE_PRODUCT' });

  const showCatalogShell =
    ux.status !== 'loading' && ux.status !== 'error' && (ux.status === 'list' || ux.status === 'empty' || ux.status === 'viewing');

  return (
    <div className="min-h-screen">
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {(ux.status === 'loading' || ux.listLoading) && ux.catalog.length === 0 && (
          <div className="text-center py-16 text-emerald-800">Загрузка каталога...</div>
        )}

        {ux.status === 'error' && (
          <div className="text-center py-16 text-emerald-800">
            <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
            <p className="text-sm">{ux.errorMessage}</p>
          </div>
        )}

        {categoriesError && (
          <p className="text-sm text-amber-700 mb-2">Категории: {categoriesError}</p>
        )}

        {showCatalogShell && (
          <>
            <CategoryTabs
              categories={categories}
              activeCategory={ux.activeCategory}
              onSelect={(cat) => dispatch({ type: 'SELECT_CATEGORY', payload: cat })}
            />

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Товары</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
                <SearchBar
                  value={ux.query}
                  onChange={(val) => dispatch({ type: 'INPUT_QUERY', payload: val })}
                  placeholder="Поиск по названию (русский или английский)…"
                />
              </div>
            </div>

            {ux.listLoading && ux.catalog.length > 0 && (
              <p className="text-sm text-emerald-600 mb-2">Обновление списка...</p>
            )}

            {ux.status === 'empty' && !ux.listLoading && (
              <p className="text-center py-8 text-emerald-700">Нет товаров по заданным условиям.</p>
            )}

            {(ux.status === 'list' || ux.status === 'viewing') && gridProducts.length > 0 && (
              <>
                <ProductList
                  products={gridProducts}
                  onAddToCart={addToCart}
                  onSelectProduct={(product) =>
                    dispatch({ type: 'SELECT_PRODUCT', payload: product })
                  }
                />
                <Pagination
                  skip={ux.skip}
                  limit={ux.limit}
                  total={ux.total}
                  disabled={ux.listLoading}
                  onPageChange={(nextSkip) => dispatch({ type: 'SET_SKIP', payload: nextSkip })}
                />
              </>
            )}
          </>
        )}
      </main>

      <ProductDetail
        product={ux.selectedProduct}
        onClose={closeProduct}
        onAddToCart={addToCart}
      />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
      />
    </div>
  );
}

export default App;
