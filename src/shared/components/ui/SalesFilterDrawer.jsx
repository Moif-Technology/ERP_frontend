import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../constants/theme';

const primary = colors.primary?.main || '#790728';

function SelectChevron({ className = 'h-2.5 w-2.5 shrink-0 text-neutral-500' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApplyCheckIcon() {
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: primary }}
      aria-hidden
    >
      <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

const DEFAULT_FILTER_LABELS = {
  station: 'Station',
  postStatus: 'post status',
  transactionType: 'Transaction type',
};

const DEFAULT_FIELD_ORDER = ['station', 'postStatus', 'transactionType'];

/**
 * Right-slide filter panel: station, post status, and a third list (transaction type or voucher group, etc.).
 * Use `fieldOrder` + `filterLabels` to reorder fields and rename labels (e.g. purchase voucher list).
 */
export default function SalesFilterDrawer({
  open,
  stations = [],
  postStatusOptions = [],
  transactionTypeOptions = [],
  applied = { station: null, postStatus: null, transactionType: null },
  onClose,
  onApply,
  fieldOrder = DEFAULT_FIELD_ORDER,
  filterLabels: filterLabelsProp,
}) {
  const labels = { ...DEFAULT_FILTER_LABELS, ...filterLabelsProp };
  const titleId = useId();
  const [station, setStation] = useState('');
  const [postStatus, setPostStatus] = useState('');
  const [transactionType, setTransactionType] = useState('');

  useEffect(() => {
    if (!open) return;
    setStation(applied.station ?? '');
    setPostStatus(applied.postStatus ?? '');
    setTransactionType(applied.transactionType ?? '');
  }, [open, applied.station, applied.postStatus, applied.transactionType]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleApply = () => {
    onApply({
      station: station || null,
      postStatus: postStatus || null,
      transactionType: transactionType || null,
    });
    onClose();
  };

  const selectWrap =
    'relative flex h-8 w-full items-center rounded border border-neutral-300 bg-white pr-1.5 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]';

  const selectCls =
    'h-full w-full cursor-pointer appearance-none rounded border-0 bg-transparent py-0 pl-2 pr-6 font-["Open_Sans",sans-serif] text-[10px] font-semibold text-neutral-800 outline-none focus:ring-0 sm:text-[11px]';

  const labelCls = 'mb-1 block text-left text-[8px] font-bold uppercase tracking-wide text-neutral-600 sm:text-[9px]';

  const node = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-end transition-[visibility] duration-300 ${open ? 'visible' : 'invisible pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-neutral-900/45 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Close filter"
        onClick={onClose}
      />
      <aside
        className={`relative flex h-[70vh] max-h-[70vh] w-full max-w-[min(100vw,340px)] flex-col overflow-hidden bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out sm:rounded-l-xl ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5 sm:px-5 sm:pt-6">
          <h2 id={titleId} className="mb-4 text-center font-serif text-base font-bold sm:text-lg" style={{ color: primary }}>
            Filter
          </h2>

          <div className="flex flex-col gap-3.5 sm:gap-4">
            {fieldOrder.map((field) => {
              if (field === 'station') {
                return (
                  <div key="station">
                    <label className={labelCls} htmlFor="sales-filter-station">
                      {labels.station}
                    </label>
                    <div className={selectWrap}>
                      <select
                        id="sales-filter-station"
                        className={selectCls}
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                      >
                        <option value="">Select</option>
                        {stations.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                        <SelectChevron />
                      </span>
                    </div>
                  </div>
                );
              }
              if (field === 'postStatus') {
                return (
                  <div key="postStatus">
                    <label className={labelCls} htmlFor="sales-filter-post">
                      {labels.postStatus}
                    </label>
                    <div className={selectWrap}>
                      <select
                        id="sales-filter-post"
                        className={selectCls}
                        value={postStatus}
                        onChange={(e) => setPostStatus(e.target.value)}
                      >
                        <option value="">Select</option>
                        {postStatusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                        <SelectChevron />
                      </span>
                    </div>
                  </div>
                );
              }
              if (field === 'transactionType') {
                return (
                  <div key="transactionType">
                    <label className={labelCls} htmlFor="sales-filter-tx">
                      {labels.transactionType}
                    </label>
                    <div className={selectWrap}>
                      <select
                        id="sales-filter-tx"
                        className={selectCls}
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                      >
                        <option value="">Select</option>
                        {transactionTypeOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                        <SelectChevron />
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={handleApply}
            className="mx-auto flex w-full max-w-[180px] items-center justify-center gap-1.5 rounded-md border-2 bg-white px-3 py-2 font-['Open_Sans',sans-serif] text-[10px] font-bold transition-colors hover:bg-rose-50/50 sm:max-w-[200px] sm:text-[11px]"
            style={{ borderColor: primary, color: primary }}
          >
            <ApplyCheckIcon />
            Apply
          </button>
        </div>
      </aside>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}
