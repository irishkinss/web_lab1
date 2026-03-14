// Боковая панель корзины. isOpen — открыта ли панель, onClose — закрыть, cartItems — массив { product, quantity }, onRemove — удалить позицию по id товара
function CartSidebar({ isOpen, onClose, cartItems, onRemove }) {
  // Считаем общую сумму: для каждой позиции цена × количество, потом складываем
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      {/* Затемнённый фон: при клике закрываем корзину. pointer-events-none когда закрыто — клики проходят «сквозь» */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Сама панель справа: выезжает по translate-x. Когда isOpen — на месте, иначе сдвинута вправо за экран */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-30 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-emerald-200">
          <h2 className="text-lg font-bold text-emerald-900">Корзина</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Если в корзине пусто — показываем текст, иначе список позиций */}
          {cartItems.length === 0 ? (
            <p className="text-emerald-600 text-center py-8">Корзина пуста</p>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li
                  key={item.product.id}
                  className="flex justify-between items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-emerald-900 truncate">{item.product.name}</p>
                    <p className="text-sm text-emerald-600">
                      {item.product.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
                    </p>
                  </div>
                  {/* Кнопка удаления: передаём id товара в onRemove */}
                  <button
                    type="button"
                    onClick={() => onRemove(item.product.id)}
                    className="shrink-0 p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Блок «Итого» показываем только если в корзине есть товары */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-emerald-200">
            <p className="text-lg font-bold text-emerald-900 mb-2">
              Итого: {total.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartSidebar;
