// Одна карточка товара (плитка). Фото из public/images/{id}.jpg (если файла нет — показывается заглушка)
import { useState } from 'react';

function ProductCard({ product, onAddToCart, onSelect }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = `/images/${product.id}.jpg`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(product)}
      className="bg-white rounded-lg overflow-hidden border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col"
    >
      {/* Превью фото: сверху плитки. Если картинки нет — блок с иконкой-заглушкой */}
      <div className="aspect-[4/3] bg-emerald-100 relative overflow-hidden flex items-center justify-center flex-shrink-0">
        {!imageError ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      {/* Текст и кнопка всегда видны: не используем h-full, чтобы блок не схлопывался */}
      <div className="p-4 flex flex-col flex-shrink-0">
        {/* Категория товара (мелким текстом сверху) */}
        <span className="text-xs text-emerald-600 uppercase tracking-wide">
          {product.category}
        </span>
        {/* Название товара */}
        <h3 className="text-emerald-900 font-semibold mt-1 mb-2 line-clamp-2">
          {product.name}
        </h3>
        {/* Цена в рублях с разделителями тысяч (например 54 990 ₽) */}
        <p className="text-emerald-700 font-bold mb-3">
          {product.price.toLocaleString('ru-RU')} ₽
        </p>
        {/* stopPropagation — чтобы клик по кнопке не открывал детальную карточку */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full py-2 px-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors text-sm"
        >
          В корзину
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
