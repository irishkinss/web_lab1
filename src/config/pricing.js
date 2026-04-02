/** Условный курс для отображения (API отдаёт цены в USD). */
export const USD_TO_RUB = 100;

export function usdToRub(usd) {
  const n = Number(usd);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * USD_TO_RUB);
}
