import React, { useEffect } from 'react';
import { colors } from '../../constants/theme';

/**
 * Modal confirmation dialog (e.g. delete verification).
 * Renders null when `open` is false. Closes on backdrop click and Escape.
 */
export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  danger = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const primary = colors.primary?.main || '#790728';

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:max-w-md sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-sm font-bold text-gray-900 sm:text-base">
          {title}
        </h2>
        {message ? <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">{message}</p> : null}
        {children}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1.5 text-xs font-medium text-white sm:text-sm ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'hover:opacity-95'
            }`}
            style={danger ? undefined : { backgroundColor: primary }}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
