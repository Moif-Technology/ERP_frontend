import React from 'react';

/**
 * Switch component - From Uiverse.io by namecho
 * Description/label on the right side.
 */
export default function Switch({ checked, onChange, description, disabled, id, size = 'md', ...props }) {
  const inputId = id ?? `switch-${Math.random().toString(36).slice(2)}`;
  const isSm = size === 'sm';

  return (
    <label
      className={`inline-flex cursor-pointer select-none items-center ${isSm ? 'gap-1.5' : 'gap-2'}`}
      htmlFor={inputId}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <span className={`switch${isSm ? ' switch-sm' : ''}`}>
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          {...props}
        />
        <span className="slider" />
      </span>
      {description && (
        <span
          className={
            isSm
              ? 'text-[8px] leading-tight text-gray-600 sm:text-[9px]'
              : 'text-[11px] leading-[15px] text-black'
          }
        >
          {description}
        </span>
      )}
    </label>
  );
}
