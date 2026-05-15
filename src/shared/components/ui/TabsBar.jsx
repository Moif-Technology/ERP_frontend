import React from 'react';
import { colors } from '../../constants/theme';

export default function TabsBar({ tabs = [], activeTab, onChange, className = '', fullWidth = false }) {
  const primary = colors.primary?.main || '#790728';

  const trackClass = fullWidth
    ? 'flex w-full max-w-full shrink-0 items-stretch gap-px rounded-md px-0.5 py-0.5'
    : 'inline-flex max-w-full shrink-0 items-stretch gap-px self-start rounded-md px-0.5 py-0.5';

  const btnClass = fullWidth
    ? 'flex-1 min-w-0 min-h-8 whitespace-nowrap rounded px-2 py-1 text-center text-[11px] font-semibold leading-tight transition-colors'
    : 'min-h-9 whitespace-nowrap rounded px-3 py-1 text-center text-sm font-semibold leading-tight transition-colors';

  return (
    <div
      className={`${trackClass} ${className}`.trim()}
      style={{ backgroundColor: '#EDEDED' }}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange?.(tab.id)}
          className={btnClass}
          style={
            activeTab === tab.id
              ? { backgroundColor: primary, color: '#fff' }
              : { backgroundColor: 'transparent', color: '#111827' }
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
