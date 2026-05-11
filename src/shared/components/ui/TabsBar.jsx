import React from 'react';
import { colors } from '../../constants/theme';

export default function TabsBar({ tabs = [], activeTab, onChange, className = '' }) {
  const primary = colors.primary?.main || '#790728';

  return (
    <div
      className={`inline-flex max-w-full shrink-0 items-stretch gap-px self-start rounded-md px-0.5 py-0.5 ${className}`}
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
          className="min-h-[22px] whitespace-nowrap rounded px-2 py-0.5 text-center text-[8px] font-medium leading-tight transition-colors sm:min-h-[24px] sm:px-2.5 sm:text-[9px]"
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
