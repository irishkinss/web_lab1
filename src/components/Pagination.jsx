function Pagination({ skip, limit, total, onPageChange, disabled }) {
  const page = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = skip > 0 && !disabled;
  const canNext = skip + limit < total && !disabled;

  return (
    <div className="flex items-center justify-center gap-4 mt-8 py-2">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => onPageChange(Math.max(0, skip - limit))}
        className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50"
      >
        Назад
      </button>
      <span className="text-sm text-emerald-800">
        Страница {page} из {totalPages} (всего товаров: {total})
      </span>
      <button
        type="button"
        disabled={!canNext}
        onClick={() => onPageChange(skip + limit)}
        className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50"
      >
        Вперёд
      </button>
    </div>
  );
}

export default Pagination;
