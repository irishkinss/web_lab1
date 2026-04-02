import { categoryLabelRu } from '../i18n/ruCatalog';

// Специальное значение «все категории» — когда оно выбрано, фильтр по категории не применяется
const ALL_CATEGORIES = 'Все категории';

function slugFromCategory(cat) {
  if (typeof cat === 'string') return cat;
  if (cat && typeof cat === 'object' && cat.slug) return cat.slug;
  return '';
}

function labelFromCategory(cat) {
  if (typeof cat === 'string') {
    return categoryLabelRu(cat);
  }
  if (cat && typeof cat === 'object') {
    if (cat.slug) return categoryLabelRu(cat.slug);
    if (cat.name) return cat.name;
    const s = slugFromCategory(cat);
    return s ? categoryLabelRu(s) : '';
  }
  return '';
}

// Вкладки категорий. categories — slug-строки или объекты { slug, name } с API
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
      {categories.map((cat) => {
        const slug = slugFromCategory(cat);
        if (!slug) return null;
        return (
        <button
          key={slug}
          type="button"
          onClick={() => onSelect(slug)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeCategory === slug
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          {labelFromCategory(cat)}
        </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;
export { ALL_CATEGORIES };
