// Поле поиска. value — что сейчас написано в поле, onChange — функция, которую вызываем при каждом вводе (передаём новый текст)
// placeholder — подсказка внутри поля (по умолчанию «Поиск по названию...»)
function SearchBar({ value, onChange, placeholder = 'Поиск по названию...' }) {
  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg bg-white text-emerald-900 placeholder-emerald-400 border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
      />
    </div>
  );
}

export default SearchBar;
