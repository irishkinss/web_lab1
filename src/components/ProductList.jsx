import ProductCard from './ProductCard';

// Список карточек товаров. products — массив товаров, onAddToCart — «добавить в корзину», onSelectProduct — открыть детальную карточку товара
function ProductList({ products, onAddToCart, onSelectProduct }) {
  // Если после фильтрации ничего не осталось — показываем сообщение вместо сетки карточек
  if (!products.length) {
    return (
      <div className="text-center py-16 text-emerald-600">
        <p className="text-lg">Ничего не найдено</p>
        <p className="text-sm mt-1">Попробуйте изменить запрос поиска или категорию</p>
      </div>
    );
  }

  // Рисуем сетку: на маленьком экране 1 колонка, на среднем 2, на большом 3, на очень большом 4
  // key={product.id} нужен React, чтобы различать карточки при обновлении списка
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onSelect={onSelectProduct}
        />
      ))}
    </div>
  );
}

export default ProductList;
