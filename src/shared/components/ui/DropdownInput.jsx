import React from 'react';
import { inputField, colors } from '../../constants/theme';
import DropdownIcon from '../../assets/icons/dropdown.svg';

/**
 * Dropdown input with label above, arrow icon on the right.
 * Same styling as inputField.box, with dropdown.svg on the right.
 */
const DropdownInput = React.forwardRef(function DropdownInput(
  {
    label,
    value,
    onChange,
    options = [],
    placeholder,
    widthPx,
    heightPx,
    fullWidth = false,
    className,
    labelClassName,
    ...props
  },
  ref,
) {
  const boxWidth = fullWidth ? '100%' : (widthPx != null ? `${widthPx}px` : inputField.dropdown.width);
  const boxHeight = heightPx != null ? `${heightPx}px` : inputField.dropdown.height;
  return (
    <div
      className={`flex flex-col gap-0.5 ${fullWidth ? 'min-w-0 w-full max-w-full' : 'shrink-0'}`}
      style={{ width: boxWidth }}
    >
      {label && (
        <label style={inputField.label} className={labelClassName}>
          {label}
        </label>
      )}
      <div
        className="relative flex w-full items-center bg-white text-sm leading-normal text-gray-900 outline-none"
        style={{
          width: '100%',
          height: boxHeight,
          minHeight: boxHeight,
          boxSizing: 'border-box',
          borderRadius: inputField.dropdown.borderRadius,
          background: colors.input?.background ?? '#fff',
          border: '1px solid #e2e8f0',
        }}
      >
        <select
          ref={ref}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`dropdown-select box-border h-full w-full max-w-full cursor-pointer appearance-none border-none bg-transparent pl-2 pr-6 py-0 text-sm leading-normal text-gray-900 outline-none sm:pl-2.5 ${className ?? ''}`.trim()}
          style={{
            height: '100%',
            boxSizing: 'border-box',
            color: '#000',
            accentColor: '#BB8295',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <img
          src={DropdownIcon}
          alt=""
          className="absolute right-2 w-2 h-2 pointer-events-none flex-shrink-0"
          aria-hidden
        />
      </div>
    </div>
  );
});

export default DropdownInput;
