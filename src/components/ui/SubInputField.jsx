import React from 'react';
import { inputField, colors } from '../../constants/theme';

/**
 * Sub input field - smaller size (82.57 x 20.08).
 * Label above, input box below.
 */
export default function SubInputField({ label, suffix, type = 'text', className, ...props }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {label && (
        <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>{label}</label>
      )}
      <div className="relative min-w-0">
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          className={`w-full min-w-0 border border-gray-200 bg-white px-1.5 py-1 text-[8px] outline-none sm:px-2 sm:py-1.5 sm:text-[9px] ${className ?? ''}`.trim()}
          style={{
            width: `min(100%, ${inputField.subBox.width})`,
            minHeight: '24px',
            height: 'auto',
            boxSizing: 'border-box',
            borderRadius: inputField.subBox.borderRadius,
            background: colors.input?.background ?? '#fff',
            borderColor: '#e2e8f0',
            paddingRight: suffix ? '16px' : undefined,
          }}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-gray-600 sm:text-[9px]">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
