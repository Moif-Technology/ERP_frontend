import React from 'react';
import { inputField, colors } from '../../constants/theme';

/**
 * Sub input field - smaller size (82.57 x 20.08).
 * Label above, input box below.
 */
export default function SubInputField({ label, suffix, type = 'text', className, ...props }) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <label style={inputField.label}>{label}</label>
      )}
      <div className="relative">
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          className={`border outline-none px-2 text-[9px] w-full ${className ?? ''}`.trim()}

          style={{
            ...inputField.subBox,
            width: `min(100%, ${inputField.subBox.width})`,
          height: inputField.subBox.height,
          boxSizing: 'border-box',
            background: colors.input.background,
            borderColor: '#e2e8f0',
            paddingRight: suffix ? '16px' : undefined,
          }}
          {...props}
        />
        {suffix ? (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-600 pointer-events-none">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
