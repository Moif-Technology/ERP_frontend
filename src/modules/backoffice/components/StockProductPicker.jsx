import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import * as productEntryApi from '../../../services/productEntry.api.js';

const primary = colors.primary?.main || '#790728';

function mapApiProductToPicker(p) {
  const inv = p.inventory || {};
  return {
    productId: p.productId,
    barcode: p.barcode || p.productCode || '',
    shortDescription: (p.shortName || p.productName || '').trim() || '-',
    productName: p.productName || '',
    packQty: p.packQty != null ? String(p.packQty) : '',
    packDescription: p.packDescription || p.unitName || '',
    qtyOnHand: inv.qtyOnHand != null ? String(inv.qtyOnHand) : '',
    unitPrice: inv.unitPrice != null ? Number(inv.unitPrice) : 0,
    brandName: p.brandName || '',
    groupId: p.groupId != null ? String(p.groupId) : '',
    subgroupId: p.subgroupId != null ? String(p.subgroupId) : '',
    lastSupplierId: p.lastSupplierId != null ? String(p.lastSupplierId) : '',
  };
}

export default function StockProductPicker({ open, initialSearch = '', onClose, onPick }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSearch(initialSearch != null ? String(initialSearch) : '');
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, initialSearch]);

  useEffect(() => {
    if (!open || hasLoaded) return;
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    productEntryApi.fetchProducts()
      .then(({ data }) => {
        if (cancelled) return;
        setProducts((data?.products || []).map(mapApiProductToPicker));
        setHasLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setProducts([]);
        setHasLoaded(true);
        setLoadError(err.response?.data?.message || err.message || 'Could not load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, hasLoaded, reloadKey]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const barcode = String(p.barcode || '').toLowerCase();
      const shortDescription = String(p.shortDescription || '').toLowerCase();
      const productName = String(p.productName || '').toLowerCase();
      return barcode.includes(q) || shortDescription.includes(q) || productName.includes(q);
    });
  }, [products, search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-product-picker-title"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{ border: '1px solid #e2dfd9' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 4, background: `linear-gradient(90deg,${primary} 0%,#85203E 45%,#C44972 100%)` }} />
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 px-4 py-2.5">
          <h2 id="stock-product-picker-title" className="text-sm font-bold" style={{ color: primary }}>Pick product</h2>
          <button
            type="button"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close product picker"
            onClick={onClose}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="shrink-0 border-b border-stone-100 px-4 py-2.5">
          <div className="relative">
            <img src={SearchIcon} alt="" className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search barcode or short description..."
              className="box-border w-full rounded-lg border border-stone-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-rose-900/40 sm:text-sm"
            />
          </div>
          {loadError ? (
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-amber-800">
              <p className="min-w-0">{loadError}</p>
              <button
                type="button"
                className="shrink-0 rounded border border-amber-200 px-2 py-1 font-semibold text-amber-900 hover:bg-amber-50"
                onClick={() => {
                  setHasLoaded(false);
                  setReloadKey((key) => key + 1);
                }}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1 sm:px-2">
          {loading ? (
            <p className="px-2 py-8 text-center text-xs text-stone-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-stone-500">
              {products.length === 0 ? 'No products found.' : 'No matches. Try another search.'}
            </p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {filteredProducts.map((p) => (
                <li key={p.productId}>
                  <button
                    type="button"
                    className="grid w-full grid-cols-[minmax(5.5rem,0.9fr)_minmax(0,1.6fr)_minmax(3rem,0.45fr)_minmax(3rem,0.45fr)] gap-2 px-2 py-2 text-left text-[11px] hover:bg-rose-50/90 sm:text-xs"
                    onClick={() => onPick(p)}
                  >
                    <span className="min-w-0 truncate font-mono text-stone-900">{p.barcode || '-'}</span>
                    <span className="min-w-0 truncate text-stone-700">{p.shortDescription}</span>
                    <span className="shrink-0 text-right tabular-nums text-stone-600">{p.qtyOnHand || '0'}</span>
                    <span className="shrink-0 text-right tabular-nums text-stone-600">{Number(p.unitPrice || 0).toFixed(2)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
