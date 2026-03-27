import React from 'react';
import { inputField, colors } from '../../constants/theme';

/**
 * Input field with label above. Standard size (165.13 x 20.08).
 */
export default function InputField({ label, widthPx, type, className, fullWidth, ...props }) {
  const boxWidth = widthPx ? `${widthPx}px` : inputField.box.width;
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {label && (
        <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>{label}</label>
      )}
      <input
        type={type ?? 'text'}
        className={`w-full min-w-0 border border-gray-200 bg-white outline-none px-1.5 py-1 text-[8px] sm:px-2 sm:py-1.5 sm:text-[9px] ${className ?? ''}`.trim()}
        style={{
          background: colors.input?.background ?? '#fff',
          borderColor: '#e2e8f0',
          boxSizing: 'border-box',
          borderRadius: inputField.box.borderRadius,
          minHeight: '24px',
          height: 'auto',
          width: fullWidth ? '100%' : `min(100%, ${boxWidth})`,
          maxWidth: fullWidth ? '100%' : undefined,
        }}
        {...props}
      />
    </div>
  );
}
