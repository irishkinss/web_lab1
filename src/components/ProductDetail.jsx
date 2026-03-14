// Карточка товара (детальный просмотр): открывается по клику на плитку. Показывает фото, название, категорию, цену и кнопку «В корзину»
// Фото берётся из папки public/images/: имена файлов 1.jpg, 2.jpg, ... по id товара (можно .png — замените расширение ниже)
import { useState, useEffect } from 'react';

function ProductDetail({ product, onClose, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    setImageError(false);
  }, [product?.id]);
  if (!product) return null;

  const imageUrl = `/images/${product.id}.jpg`;
  const colors = ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857'];
  const bgColor = colors[product.id % colors.length];

  return (
    <>
      {/* Затемнённый фон: клик закрывает карточку */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
      />
      {/* Сама карточка по центру экрана */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <article
          className="pointer-events-auto w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Блок с фото: ваша картинка из public/images/{id}.jpg или заглушка, если файла нет */}
          <div className="relative aspect-[4/3] flex items-center justify-center bg-emerald-100">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                <svg className="w-1/3 h-1/3 text-emerald-700/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="absolute bottom-2 left-2 right-2 text-center text-sm text-emerald-800/70 font-medium truncate px-2">
                  {product.name}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-emerald-800 hover:bg-white transition-colors"
              aria-label="Закрыть"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Текст и кнопки */}
          <div className="p-5">
            <span className="text-xs text-emerald-600 uppercase tracking-wide">
              {product.category}
            </span>
            <h2 className="text-xl font-bold text-emerald-900 mt-1 mb-2">
              {product.name}
            </h2>
            <p className="text-lg font-bold text-emerald-700 mb-4">
              {product.price.toLocaleString('ru-RU')} ₽
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
              >
                В корзину
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-lg border border-emerald-300 text-emerald-700 font-medium hover:bg-emerald-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

export default ProductDetail;
