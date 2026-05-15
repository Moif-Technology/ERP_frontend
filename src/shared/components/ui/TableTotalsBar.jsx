import React from 'react';
import { colors } from '../../constants/theme';

const primary = colors.primary?.main || colors.primary?.DEFAULT || '#790728';

export default function TableTotalsBar({
  items = [],
  borderColor = '#e2dfd9',
  className = '',
  columns = 8,
}) {
  const mdColumns = Math.max(1, Math.min(Number(columns) || 8, 12));

  return (
    <div
      className={`shrink-0 border-t px-2 py-2 sm:px-2.5 sm:py-2.5 ${className}`}
      style={{
        borderColor,
        background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
      }}
    >
      <div
        className="table-total-grid grid grid-cols-2 gap-1.5 sm:gap-2"
        style={{ '--table-total-md-cols': `repeat(${mdColumns}, minmax(0, 1fr))` }}
      >
        <style>{`
          @media (min-width: 768px) {
            .table-total-grid {
              grid-template-columns: var(--table-total-md-cols);
            }
          }
        `}</style>
        {items.map((item) => {
          const label = item.label ?? item[0];
          const value = item.value ?? item[1];
          const strong = item.strong ?? item[2];
          return (
            <div
              key={String(label)}
              className="flex min-w-0 flex-col justify-center gap-0.5 rounded-lg border px-2 py-1.5 sm:px-2.5 sm:py-2"
              style={{
                borderColor: strong ? 'rgba(121, 7, 40, 0.22)' : '#e7e5e4',
                background: strong
                  ? 'linear-gradient(165deg, rgba(121, 7, 40, 0.07) 0%, #ffffff 55%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
                boxShadow: strong
                  ? '0 1px 2px rgba(28, 25, 23, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  : '0 1px 2px rgba(28, 25, 23, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
              }}
            >
              <span
                data-total-label
                className="block min-w-0 truncate text-[10px] font-semibold leading-tight tracking-wide text-stone-500 sm:text-[11px]"
                style={strong ? { color: primary } : undefined}
              >
                {label}
              </span>
              <span
                data-total-value
                data-total-strong={strong ? 'true' : undefined}
                className="block min-w-0 truncate text-right text-[13px] font-bold tabular-nums leading-tight tracking-tight text-stone-900 sm:text-sm"
                style={strong ? { color: primary, fontWeight: 800 } : undefined}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
