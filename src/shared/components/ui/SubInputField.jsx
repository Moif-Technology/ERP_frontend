import React from 'react';
import { inputField, colors } from '../../constants/theme';

/**
 * Sub input field — fixed width/height; parent gap controls spacing.
 */
const SubInputField = React.forwardRef(function SubInputField(
  { label, suffix, type = 'text', widthPx, heightPx, className, labelClassName, inputStyle, fullWidth, ...props },
  ref,
) {
  const boxWidth = widthPx != null ? `${widthPx}px` : inputField.subBox.width;
  const boxHeight = heightPx != null ? `${heightPx}px` : inputField.subBox.height;
  return (
    <div
      className={`flex flex-col gap-0.5 ${fullWidth ? 'min-w-0 w-full max-w-full' : 'shrink-0'}`}
      style={fullWidth ? { width: '100%' } : { width: boxWidth }}
    >
      {label && (
        <label
          className={labelClassName || 'text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]'}
          style={labelClassName ? undefined : { color: inputField.label.color }}
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          ref={ref}
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          className={`box-border w-full max-w-full border border-gray-200 bg-white px-1.5 py-0 text-[8px] outline-none sm:px-2 sm:text-[9px] ${className ?? ''}`.trim()}
          style={{
            width: '100%',
            height: boxHeight,
            minHeight: boxHeight,
            boxSizing: 'border-box',
            borderRadius: inputField.subBox.borderRadius,
            background: colors.input?.background ?? '#fff',
            borderColor: '#e2e8f0',
            paddingRight: suffix ? '16px' : undefined,
            ...inputStyle,
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
});

export default SubInputField;
