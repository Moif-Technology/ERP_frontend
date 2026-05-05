import React from 'react';
import { inputField, uiFontSizes, colors } from '../../constants/theme';
import DatePickerInput from './DatePickerInput';
import TimePickerInput from './TimePickerInput';

/**
 * Input field with label above. Size from theme `inputField.box` (default 180×26px).
 */
export default function InputField({ label, widthPx, heightPx, type, className, fullWidth, ...props }) {
  const boxWidth  = widthPx  != null ? `${widthPx}px`  : inputField.box.width;
  const boxHeight = heightPx != null ? `${heightPx}px` : inputField.box.height;

  return (
    <div
      className={`flex flex-col gap-0.5 ${fullWidth ? 'min-w-0 w-full max-w-full' : 'shrink-0'}`}
      style={fullWidth ? { width: '100%' } : { width: boxWidth }}
    >
      {label && (
        <label style={{ fontSize: uiFontSizes.label, lineHeight: '18px', color: inputField.label.color }}>{label}</label>
      )}

      {type === 'date' ? (
        <DatePickerInput
          fullWidth={fullWidth}
          widthPx={widthPx}
          heightPx={heightPx != null ? heightPx : parseInt(inputField.box.height)}
          borderRadius={parseInt(inputField.box.borderRadius)}
          {...props}
        />
      ) : type === 'time' ? (
        <TimePickerInput
          fullWidth={fullWidth}
          widthPx={widthPx}
          heightPx={heightPx != null ? heightPx : parseInt(inputField.box.height)}
          borderRadius={parseInt(inputField.box.borderRadius)}
          {...props}
        />
      ) : (
        <input
          type={type ?? 'text'}
          className={`box-border w-full max-w-full border border-gray-200 bg-white px-1.5 py-0 outline-none sm:px-2 ${className ?? ''}`.trim()}
          style={{
            fontSize: uiFontSizes.input,
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
      )}
    </div>
  );
}
