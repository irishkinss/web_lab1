// Одна карточка товара (плитка).
import { categoryLabelRu } from '../i18n/ruCatalog';
import ProductImage from './ProductImage';

function ProductCard({ product, onAddToCart, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(product)}
      className="bg-white rounded-lg overflow-hidden border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col h-full min-w-0"
    >
      <div className="aspect-[4/3] bg-emerald-100 relative overflow-hidden flex items-center justify-center shrink-0">
        <ProductImage product={product} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col flex-1 min-h-0 min-w-0 gap-2">
        <span className="text-xs text-emerald-600 uppercase tracking-wide">
          {categoryLabelRu(product.category)}
        </span>
        <h3 className="text-emerald-900 font-semibold line-clamp-2">
          {product.name}
        </h3>
        <p className="text-emerald-700 font-bold">
          {Number(product.price ?? 0).toLocaleString('ru-RU')} ₽
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="mt-auto w-full shrink-0 py-2 px-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors text-sm text-center"
        >
          В корзину
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
