import React from 'react';

/**
 * Switch component - From Uiverse.io by namecho
 * Description/label on the right side.
 */
export default function Switch({ checked, onChange, description, disabled, id, ...props }) {
  const inputId = id ?? `switch-${Math.random().toString(36).slice(2)}`;

  return (
    <label
      className="inline-flex items-center gap-2 cursor-pointer select-none"
      htmlFor={inputId}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <span className="switch">
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
        <span className="text-[11px] leading-[15px] text-black">{description}</span>
      )}
    </label>
  );
}
