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
        // className="relative flex items-center"
          className="relative w-full text-[9px] bg-transparent outline-none flex items-center"

        style={{
          ...inputField.dropdown,
          width: `min(100%, ${inputField.dropdown.width})`,
          height: inputField.dropdown.height,
          boxSizing: 'border-box',
          background: colors.input.background,
          border: '1px solid #e2e8f0',
        }}
      >
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full appearance-none bg-transparent border-none outline-none pl-2 pr-6 py-0 text-[9px] cursor-pointer h-full ${className ?? ''}`.trim()}
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
