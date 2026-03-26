// Lab 2: дискретно-событийная UX-модель каталога.
// Идея: интерфейс описывается как состояние (loading/list/empty/viewing/error) + события,
// которые переводят приложение между состояниями.
import { useEffect, useMemo, useReducer, useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CategoryTabs, { ALL_CATEGORIES } from './components/CategoryTabs';
import CartSidebar from './components/CartSidebar';
import ProductDetail from './components/ProductDetail';
import { products } from './data/products';

// Уникальные категории нужны для вкладок.
const CATEGORIES = [...new Set(products.map((p) => p.category))];

// Вспомогательная функция: фильтруем «каталог» по активной категории и поисковому запросу.
const filterProducts = (catalog, query, activeCategory) => {
  let list = catalog;
  if (activeCategory !== ALL_CATEGORIES) {
    list = list.filter((p) => p.category === activeCategory);
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  return list;
};

// По результату фильтра выбираем состояние list/empty (это и есть переход по событию).
const toListOrEmpty = (list) => (list.length > 0 ? 'list' : 'empty');

// Начальные данные для UX-модели.
const initialUxState = {
  status: 'loading', // loading | list | empty | viewing | error
  catalog: [],
  query: '',
  activeCategory: ALL_CATEGORIES,
  selectedProduct: null,
  errorMessage: null,
};

function uxReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START': {
      // Старт загрузки каталога: очищаем данные и переводим UI в loading.
      return {
        ...state,
        status: 'loading',
        catalog: [],
        selectedProduct: null,
        errorMessage: null,
      };
    }
    case 'LOAD_SUCCESS': {
      // Каталог загружен: кладём его в состояние и решаем, list или empty показывать сейчас.
      const nextCatalog = action.payload;
      const filtered = filterProducts(nextCatalog, state.query, state.activeCategory);
      return {
        ...state,
        status: toListOrEmpty(filtered),
        catalog: nextCatalog,
        selectedProduct: null,
        errorMessage: null,
      };
    }
    case 'LOAD_ERROR': {
      // Ошибка получения данных.
      return {
        ...state,
        status: 'error',
        catalog: [],
        selectedProduct: null,
        errorMessage: action.payload || 'Ошибка загрузки данных каталога',
      };
    }
    case 'INPUT_QUERY': {
      // Ввод/изменение текста поиска.
      const nextQuery = action.payload;
      if (state.status === 'viewing') {
        // Пока открыт просмотр товара — меняем query, но состояние остаётся viewing.
        return { ...state, query: nextQuery };
      }
      if (state.status === 'loading' || state.status === 'error') {
        return { ...state, query: nextQuery };
      }
      // В list/empty пересчитываем и выбираем list или empty.
      const filtered = filterProducts(state.catalog, nextQuery, state.activeCategory);
      return { ...state, query: nextQuery, status: toListOrEmpty(filtered) };
    }
    case 'SEARCH_CLEAR': {
      // Очистка поиска (в отчёте это отдельное событие из задания).
      return uxReducer(state, { type: 'INPUT_QUERY', payload: '' });
    }
    case 'SELECT_CATEGORY': {
      // Выбор вкладки категории.
      const nextCategory = action.payload;
      if (state.status === 'viewing') {
        return { ...state, activeCategory: nextCategory };
      }
      if (state.status === 'loading' || state.status === 'error') {
        return { ...state, activeCategory: nextCategory };
      }
      const filtered = filterProducts(state.catalog, state.query, nextCategory);
      return { ...state, activeCategory: nextCategory, status: toListOrEmpty(filtered) };
    }
    case 'SELECT_PRODUCT': {
      // Выбор товара: открываем детальную карточку => state = viewing.
      return { ...state, selectedProduct: action.payload, status: 'viewing' };
    }
    case 'CLOSE_PRODUCT': {
      // Закрываем просмотр: возвращаемся в list или empty в зависимости от текущих фильтров.
      const nextSelected = null;
      const filtered = filterProducts(state.catalog, state.query, state.activeCategory);
      return { ...state, selectedProduct: nextSelected, status: toListOrEmpty(filtered) };
    }
    default:
      return state;
  }
}

function App() {
  // UX-модель (Lab 2) для экрана каталога/поиска/просмотра карточки.
  const [ux, dispatch] = useReducer(uxReducer, initialUxState);

  // Состояние корзины (это часть Lab 1, но оно может сосуществовать с UX-моделью).
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

  // Список товаров для отрисовки (зависит от ux.catalog + поиска + категории).
  const filteredProducts = useMemo(
    () => filterProducts(ux.catalog, ux.query, ux.activeCategory),
    [ux.catalog, ux.query, ux.activeCategory]
  );

  // Имитация загрузки каталога (UX: loading => list/empty или error).
  useEffect(() => {
    const shouldSimulateError = new URLSearchParams(window.location.search).get('error') === '1';

    dispatch({ type: 'LOAD_START' });

    const timer = window.setTimeout(() => {
      if (shouldSimulateError) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Ошибка получения данных каталога' });
      } else {
        dispatch({ type: 'LOAD_SUCCESS', payload: products });
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, []);

  const closeProduct = () => dispatch({ type: 'CLOSE_PRODUCT' });

  // Главный рендер по состояниям UX-модели.
  return (
    <div className="min-h-screen">
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {ux.status === 'loading' && (
          <div className="text-center py-16 text-emerald-800">
            Загрузка каталога...
          </div>
        )}

        {ux.status === 'error' && (
          <div className="text-center py-16 text-emerald-800">
            <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
            <p className="text-sm">{ux.errorMessage}</p>
          </div>
        )}

        {ux.status !== 'loading' && ux.status !== 'error' && (
          <>
            <CategoryTabs
              categories={CATEGORIES}
              activeCategory={ux.activeCategory}
              onSelect={(cat) => dispatch({ type: 'SELECT_CATEGORY', payload: cat })}
            />

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Товары</h2>
              <SearchBar
                value={ux.query}
                onChange={(val) => dispatch({ type: 'INPUT_QUERY', payload: val })}
              />
            </div>

            <ProductList
              products={filteredProducts}
              onAddToCart={addToCart}
              onSelectProduct={(product) => dispatch({ type: 'SELECT_PRODUCT', payload: product })}
            />
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
