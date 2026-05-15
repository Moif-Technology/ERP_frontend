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
          className={`pos-label text-[13px] leading-tight text-black ${labelClassName ?? ''}`.trim()}
          style={{ color: inputField.label.color, fontSize: inputField.label.fontSize, lineHeight: inputField.label.lineHeight }}
        >
          {label}
        </label>
      )}
      <input
        type={type ?? 'text'}
        className={`box-border w-full max-w-full border border-gray-200 bg-white px-2.5 py-0 text-base leading-normal text-gray-900 outline-none ${className ?? ''}`.trim()}
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
