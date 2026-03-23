import React from 'react';
import { inputField, colors } from '../../constants/theme';

/**
 * Input field with label above. Standard size (165.13 x 20.08).
 */
export default function InputField({ label, widthPx, type, className, ...props }) {
  const boxWidth = widthPx ? `${widthPx}px` : inputField.box.width;
  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <label style={inputField.label}>{label}</label>
      )}
      <input
        type={type ?? 'text'}
        className={`border outline-none px-2 text-[9px] w-full ${className ?? ''}`.trim()}

        style={{
          // Keep the input height fixed while still allowing responsive width.
          background: colors.input.background,
          borderColor: '#e2e8f0',
          boxSizing: 'border-box',
          height: inputField.box.height,
          borderRadius: inputField.box.borderRadius,
          width: `min(100%, ${boxWidth})`,
        }}
        {...props}
      />
    </div>
  );
}
