// Специальное значение «все категории» — когда оно выбрано, фильтр по категории не применяется
const ALL_CATEGORIES = 'Все категории';

// Вкладки категорий. categories — массив названий (Электроника, Одежда и т.д.), activeCategory — какая вкладка активна, onSelect — функция смены вкладки
function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-emerald-200 pb-4 mb-4">
      {/* Кнопка «Все категории»: при клике вызываем onSelect(ALL_CATEGORIES) */}
      <button
        type="button"
        onClick={() => onSelect(ALL_CATEGORIES)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeCategory === ALL_CATEGORIES
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
        }`}
      >
        {ALL_CATEGORIES}
      </button>
      {/* Для каждой категории из списка рисуем кнопку. Активная подсвечивается зелёным */}
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeCategory === cat
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
export { ALL_CATEGORIES };
