import React from 'react';
import { inputField, colors } from '../../constants/theme';
import DropdownIcon from '../../assets/icons/dropdown.svg';

/**
 * Dropdown input with label above, arrow icon on the right.
 * Same styling as inputField.box, with dropdown.svg on the right.
 */
export default function DropdownInput({ label, value, onChange, options = [], placeholder, className, ...props }) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <label style={inputField.label}>{label}</label>
      )}
      <div
        className="relative flex min-h-[24px] w-full min-w-0 items-center bg-white text-[8px] outline-none sm:min-h-[28px] sm:text-[9px]"
        style={{
          width: `min(100%, ${inputField.dropdown.width})`,
          boxSizing: 'border-box',
          borderRadius: inputField.dropdown.borderRadius,
          background: colors.input?.background ?? '#fff',
          border: '1px solid #e2e8f0',
        }}
      >
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`h-full min-h-[24px] w-full min-w-0 cursor-pointer appearance-none border-none bg-transparent pl-1.5 pr-6 py-1 text-[8px] outline-none sm:pl-2 sm:py-1.5 sm:text-[9px] ${className ?? ''}`.trim()}
          style={{
            height: '100%',
            boxSizing: 'border-box',
            color: '#000',
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
}
