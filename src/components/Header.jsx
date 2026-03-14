// Компонент шапки сайта. Получает из App: cartCount (сколько товаров в корзине) и onOpenCart (открыть корзину по клику)
function Header({ cartCount, onOpenCart }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-emerald-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-emerald-800">Каталог товаров</h1>
        {/* Кнопка-иконка корзины: при клике вызывается onOpenCart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
          aria-label="Корзина"
        >
          {/* Иконка корзины (SVG) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {/* Бейдж с числом товаров показывается только если в корзине что-то есть */}
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
