// useState — хук для хранения данных, которые могут меняться (поиск, корзина и т.д.)
// useMemo — хук, чтобы не пересчитывать список товаров при каждом обновлении, а только когда меняются категория или поиск
import { useState, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CategoryTabs, { ALL_CATEGORIES } from './components/CategoryTabs';
import CartSidebar from './components/CartSidebar';
import ProductDetail from './components/ProductDetail';
import { products } from './data/products';

// Получаем уникальные названия категорий из списка товаров (для вкладок)
const CATEGORIES = [...new Set(products.map((p) => p.category))];

function App() {
  // Текст, который пользователь вводит в поле поиска
  const [searchQuery, setSearchQuery] = useState('');
  // Какая вкладка категории сейчас выбрана (по умолчанию — «Все категории»)
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  // Открыта ли боковая панель корзины (true/false)
  const [cartOpen, setCartOpen] = useState(false);
  // Массив товаров в корзине: каждый элемент — { product, quantity } (товар и количество)

  const [cartItems, setCartItems] = useState([]);
  // Товар, чья детальная карточка открыта (null — ничего не открыто)
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Список товаров после фильтрации по категории и по поиску. useMemo пересчитывает его только при смене activeCategory или searchQuery
  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== ALL_CATEGORIES) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }
    return list;
  }, [activeCategory, searchQuery]);

  // Добавляем товар в корзину. Если он уже есть — увеличиваем количество, иначе добавляем новую позицию
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

  // Удаляем из корзины позицию по id товара
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Общее количество товаров в корзине (сумма всех quantity). Нужно для бейджа на иконке корзины
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Разметка страницы: шапка, вкладки, поиск, список товаров и боковая панель корзины
  return (
    <div className="min-h-screen">
      {/* Шапка: передаём количество в корзине и функцию открытия корзины по клику на иконку */}
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Вкладки категорий: список категорий, активная и функция смены категории */}
        <CategoryTabs
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Товары</h2>
          {/* Поле поиска: значение и функция обновления при вводе */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        {/* Список карточек товаров: при клике на плитку открывается детальная карточка */}
        <ProductList
          products={filteredProducts}
          onAddToCart={addToCart}
          onSelectProduct={setSelectedProduct}
        />
      </main>

      {/* Детальная карточка товара (фото, название, цена, «В корзину»): показывается при выборе товара */}
      <ProductDetail
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Боковая панель корзины: открыта/закрыта, закрыть, список товаров, удалить позицию */}
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
