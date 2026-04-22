import React, { useState } from 'react';
import CalendarIcon from '../../assets/icons/calendar.svg';
import QuotationDateRangeModal, { formatDDMMYYYY } from './QuotationDateRangeModal';

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const defaultButtonClass =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-2 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SelectDateButton({
  label,
  value,
  onApply,
  title = 'Select Date',
  placeholder = 'Select Date',
  separator = ' - ',
  className = '',
  buttonClassName = '',
  textClassName = 'min-w-0 flex-1 truncate text-left',
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const displayValue = value
    ? `${formatDDMMYYYY(value.from)}${separator}${formatDDMMYYYY(value.to)}`
    : placeholder;

  return (
    <div className={`relative flex min-w-0 w-full max-w-full flex-col gap-0.5 ${className}`.trim()}>
      {label ? (
        <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>
          {label}
        </span>
      ) : null}
      <button
        type="button"
        className={`${buttonClassName || defaultButtonClass} box-border h-[26px] min-h-[26px] w-full`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel || label || placeholder}
      >
        <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
        <span className={textClassName}>{displayValue}</span>
        <ToolbarChevron />
      </button>
      <QuotationDateRangeModal
        open={open}
        title={title}
        initialRange={value}
        onClose={() => setOpen(false)}
        onApply={onApply}
      />
    </div>
  );
}
