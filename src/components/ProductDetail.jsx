import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchProductById, addProductMock, deleteProductMock } from '../api/dummyJson';
import { categoryLabelRu, localizeProductTitle } from '../i18n/ruCatalog';
import ProductImage from './ProductImage';

/** Не закрывать модалку тем же жестом, что открыл карточку (mouseup/click попадает на backdrop). */
const BACKDROP_IGNORE_MS = 350;

function ProductDetail({ product, onClose, onAddToCart }) {
  const [detail, setDetail] = useState(null);
  const [mockBusy, setMockBusy] = useState(false);
  const ignoreBackdropUntilRef = useRef(0);

  useEffect(() => {
    setDetail(null);
    if (!product?.id) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const full = await fetchProductById(product.id);
        if (!cancelled) setDetail(full);
      } catch {
        if (!cancelled) setDetail(product);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    ignoreBackdropUntilRef.current = Date.now() + BACKDROP_IGNORE_MS;
  }, [product?.id]);

  const handleBackdropClose = () => {
    if (Date.now() < ignoreBackdropUntilRef.current) return;
    onClose();
  };

  // Все хуки до любого return — иначе при product=null и при открытой карточке разный порядок хуков и React ломает дерево (пустой экран).
  const p = product ? detail || product : null;
  const descriptionRu = useMemo(() => {
    if (!p?.description) return '';
    const capped = String(p.description).slice(0, 4000);
    return localizeProductTitle(capped);
  }, [p?.description]);

  if (!product) return null;

  const priceNum = Number(p.price ?? 0);
  const priceLabel = `${priceNum.toLocaleString('ru-RU')} ₽`;

  const handleMockPost = async () => {
    setMockBusy(true);
    try {
      const res = await addProductMock({
        title: p.raw?.title ?? p.name,
        price: p.raw?.price ?? p.price,
      });
      window.alert(`POST /products/add (mock): ${JSON.stringify(res)}`);
    } catch (e) {
      window.alert(String(e.message || e));
    } finally {
      setMockBusy(false);
    }
  };

  const handleMockDelete = async () => {
    setMockBusy(true);
    try {
      const res = await deleteProductMock(p.id);
      window.alert(`DELETE /products/${p.id} (mock): ${JSON.stringify(res)}`);
    } catch (e) {
      window.alert(String(e.message || e));
    } finally {
      setMockBusy(false);
    }
  };

  const modal = (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleBackdropClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="fixed inset-0 bg-black/60 z-[100]"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pt-24 pointer-events-none">
        <article
          className="pointer-events-auto w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto border border-emerald-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-[4/3] flex items-center justify-center bg-emerald-100">
            <ProductImage product={p} className="w-full h-full object-cover" alt={p.name} loading="eager" />
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
          <div className="p-5">
            <span className="text-xs text-emerald-600 uppercase tracking-wide">
              {categoryLabelRu(p.category)}
            </span>
            <h2 className="text-xl font-bold text-emerald-900 mt-1 mb-2">
              {p.name}
            </h2>
            {descriptionRu ? (
              <p className="text-sm text-emerald-800/90 mb-3 line-clamp-6">{descriptionRu}</p>
            ) : null}
            <p className="text-lg font-bold text-emerald-700 mb-4">
              {priceLabel}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(p);
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
              <p className="text-xs text-emerald-600 text-center">Клиент-сервер (mock API)</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={mockBusy}
                  onClick={handleMockPost}
                  className="flex-1 py-2 px-3 text-sm rounded-lg border border-emerald-400 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                >
                  POST (добавить)
                </button>
                <button
                  type="button"
                  disabled={mockBusy}
                  onClick={handleMockDelete}
                  className="flex-1 py-2 px-3 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}

export default ProductDetail;
