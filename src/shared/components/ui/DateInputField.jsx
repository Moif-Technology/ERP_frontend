import React, { useMemo, useRef } from 'react';
import { inputField, colors } from '../../constants/theme';

function formatDate(dateValue) {
  if (!dateValue) return '';
  const [year, month, day] = dateValue.split('-');
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}/${year}`;
}

export default function DateInputField({ label, value, onChange, widthPx, heightPx, fullWidth }) {
  const dateRef = useRef(null);
  const boxWidth = widthPx != null ? `${widthPx}px` : inputField.dateBox.width;
  const boxHeight = heightPx != null ? `${heightPx}px` : inputField.dateBox.height;
  const displayValue = useMemo(() => formatDate(value), [value]);

  const openPicker = () => {
    const input = dateRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.click();
  };

  return (
    <div
      className={`flex flex-col gap-0.5 ${fullWidth ? 'min-w-0 w-full max-w-full' : 'shrink-0'}`}
      style={fullWidth ? { width: '100%' } : { width: boxWidth }}
    >
      {label ? (
        <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
          {label}
        </label>
      ) : null}
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          value={displayValue}
          placeholder="DD/MM/YYYY"
          className="box-border w-full max-w-full border border-gray-200 bg-white px-1.5 py-0 pr-6 text-[8px] outline-none sm:px-2 sm:text-[9px]"
          style={{
            background: colors.input?.background ?? '#fff',
            borderColor: '#e2e8f0',
            borderRadius: inputField.dateBox.borderRadius,
            width: '100%',
            height: boxHeight,
            minHeight: boxHeight,
          }}
          onClick={openPicker}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:text-gray-700"
          aria-label={`Open ${label || 'date'} picker`}
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <input
          ref={dateRef}
          type="date"
          className="absolute h-0 w-0 opacity-0"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          tabIndex={-1}
          aria-hidden
        />
      </div>
    </div>
  );
}
