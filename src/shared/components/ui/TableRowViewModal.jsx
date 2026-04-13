import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../constants/theme';

const primary = colors.primary?.main || '#790728';

/**
 * Centered read-only popup for a table row (backdrop + panel).
 * @param {{ open: boolean; title: string; fields: { label: string; value: React.ReactNode }[]; onClose: () => void }} props
 */
export default function TableRowViewModal({ open, title, fields = [], onClose }) {
  const titleId = useId();

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

  if (!open || typeof document === 'undefined') return null;

  const node = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/50 transition-opacity"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[1] flex max-h-[min(85vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div
          className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-3 sm:px-5"
          style={{ backgroundColor: `${primary}08` }}
        >
          <h2 id={titleId} className="font-serif text-base font-bold sm:text-lg" style={{ color: primary }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/80 hover:text-neutral-800"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-[minmax(0,38%)_1fr] sm:gap-y-3">
            {fields.map(({ label, value }) => (
              <React.Fragment key={label}>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-neutral-500 sm:text-[10px]">
                  {label}
                </dt>
                <dd className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-neutral-900 sm:text-[11px]">
                  {value ?? '—'}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
        <div className="shrink-0 border-t border-neutral-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border-2 py-2 font-['Open_Sans',sans-serif] text-[10px] font-bold transition-colors hover:bg-rose-50/40 sm:text-[11px]"
            style={{ borderColor: primary, color: primary }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
