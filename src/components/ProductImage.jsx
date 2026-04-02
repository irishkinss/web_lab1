import { useState, useEffect, useMemo } from 'react';
import { getProductImageCandidates } from '../api/dummyJson';

/**
 * Картинка товара: прокси CDN → прямой URL → SVG (см. vite.config и dummyJson).
 */
function ProductImage({ product, className = '', alt = '', loading = 'eager' }) {
  // Зависимость от всего product: иначе при тех же id/imageUrl теряется raw и цепочка URL не обновляется.
  const candidates = useMemo(
    () => getProductImageCandidates(product),
    [product]
  );
  const [idx, setIdx] = useState(0);
  const safeIdx = Math.min(idx, Math.max(0, candidates.length - 1));
  const src = candidates[safeIdx] ?? candidates[0];

  useEffect(() => {
    setIdx(0);
  }, [product]);

  return (
    <img
      key={`${product?.id ?? 'x'}-${safeIdx}`}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
    />
  );
}

export default ProductImage;
