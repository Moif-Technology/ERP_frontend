import React from 'react';
import { inputField, colors } from '../../constants/theme';

/**
 * Input field with label above. Size from theme `inputField.box` (default 180×26px).
 */
export default function InputField({ label, widthPx, heightPx, type, className, labelClassName, fullWidth, ...props }) {
  const boxWidth = widthPx != null ? `${widthPx}px` : inputField.box.width;
  const boxHeight = heightPx != null ? `${heightPx}px` : inputField.box.height;
  return (
    <div
      className={`flex flex-col gap-0.5 ${fullWidth ? 'min-w-0 w-full max-w-full' : 'shrink-0'}`}
      style={fullWidth ? { width: '100%' } : { width: boxWidth }}
    >
      {label && (
        <label
          className={`text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px] ${labelClassName ?? ''}`.trim()}
          style={{ color: inputField.label.color }}
        >
          {label}
        </label>
      )}
      <input
        type={type ?? 'text'}
        className={`box-border w-full max-w-full border border-gray-200 bg-white px-2 py-0 text-sm leading-normal text-gray-900 outline-none sm:px-2.5 ${className ?? ''}`.trim()}
        style={{
          background: colors.input?.background ?? '#fff',
          borderColor: '#e2e8f0',
          boxSizing: 'border-box',
          borderRadius: inputField.box.borderRadius,
          width: '100%',
          height: boxHeight,
          minHeight: boxHeight,
        }}
        {...props}
      />
    </div>
  );
}
