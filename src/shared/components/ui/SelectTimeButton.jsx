import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colors, inputField } from '../../constants/theme';

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const defaultButtonClass =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-2 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const PERIODS = ['AM', 'PM'];

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V12L15 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatTime(timeValue) {
  if (!timeValue) return '';
  const [hourText, minuteText] = String(timeValue).split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return timeValue;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function parseTimeParts(timeValue, fallback = '09:00') {
  const source = timeValue || fallback;
  const [hourText, minuteText] = String(source).split(':');
  const hour24 = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) {
    return { hour: 9, minute: 0, period: 'AM' };
  }
  return {
    hour: hour24 % 12 || 12,
    minute: Math.min(59, Math.max(0, minute)),
    period: hour24 >= 12 ? 'PM' : 'AM',
  };
}

function composeTimeValue({ hour, minute, period }) {
  let hour24 = hour % 12;
  if (period === 'PM') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getCircularOption(options, index) {
  const length = options.length;
  return options[((index % length) + length) % length];
}

function TimeWheelColumn({ options, value, formatValue, onChange, ariaLabel }) {
  const selectedIndex = Math.max(0, options.findIndex((option) => option === value));
  const offsets = [-2, -1, 0, 1, 2];
  const isPeriodColumn = options.length === 2;

  const move = (delta) => {
    onChange(getCircularOption(options, selectedIndex + delta));
  };

  if (isPeriodColumn) {
    const inactiveOption = options.find((option) => option !== value) || options[0];
    const inactiveOffsetPx = value === 'AM' ? 30 : -30;

    const handleWheel = (event) => {
      event.preventDefault();
      const nextValue = event.deltaY > 0 ? 'PM' : 'AM';
      if (nextValue !== value) onChange(nextValue);
    };

    return (
      <div
        className="relative flex h-[154px] min-w-0 flex-1 flex-col items-stretch justify-center overflow-hidden"
        onWheel={handleWheel}
        role="listbox"
        aria-label={ariaLabel}
      >
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[38px] -translate-y-1/2 border-y border-gray-200 bg-white/70" />
        <button
          type="button"
          role="option"
          aria-selected="false"
          className="absolute left-0 right-0 top-1/2 z-[1] h-[30px] rounded text-center text-[16px] font-medium leading-[30px] text-gray-400 transition-all duration-300 ease-out"
          style={{ transform: `translateY(calc(-50% + ${inactiveOffsetPx}px))` }}
          onClick={() => onChange(inactiveOption)}
        >
          {inactiveOption}
        </button>
        <button
          type="button"
          role="option"
          aria-selected="true"
          className="absolute left-0 right-0 top-1/2 z-[2] h-[30px] -translate-y-1/2 rounded text-center text-[20px] font-semibold leading-[30px] text-gray-900 transition-all duration-300 ease-out"
          onClick={() => onChange(value)}
        >
          {value}
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-[154px] min-w-0 flex-1 flex-col items-stretch justify-center overflow-hidden"
      onWheel={(event) => {
        event.preventDefault();
        move(event.deltaY > 0 ? 1 : -1);
      }}
      role="listbox"
      aria-label={ariaLabel}
    >
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[38px] -translate-y-1/2 border-y border-gray-200 bg-white/70" />
      {offsets.map((offset) => {
        const option = getCircularOption(options, selectedIndex + offset);
        const active = offset === 0;
        return (
          <button
            key={`${option}-${offset}`}
            type="button"
            role="option"
            aria-selected={active}
            className={`relative z-[1] h-[30px] shrink-0 rounded text-center leading-none transition ${
              active
                ? 'text-[20px] font-semibold text-gray-900'
                : Math.abs(offset) === 1
                  ? 'text-[16px] font-medium text-gray-400'
                  : 'text-[12px] font-medium text-gray-200'
            }`}
            onClick={() => onChange(option)}
          >
            {formatValue ? formatValue(option) : option}
          </button>
        );
      })}
    </div>
  );
}

function TimeWheelPicker({ label, value, onChange, fallback }) {
  const parts = parseTimeParts(value, fallback);

  const updatePart = (patch) => {
    onChange(composeTimeValue({ ...parts, ...patch }));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-gray-600">{label}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
          {formatTime(value) || '--:-- --'}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-1 rounded-md bg-gray-50 px-2">
        <TimeWheelColumn
          options={HOURS}
          value={parts.hour}
          onChange={(hour) => updatePart({ hour })}
          ariaLabel={`${label} hour`}
        />
        <span className="relative z-[1] pb-1 text-[22px] font-semibold text-gray-900">:</span>
        <TimeWheelColumn
          options={MINUTES}
          value={parts.minute}
          formatValue={(minute) => String(minute).padStart(2, '0')}
          onChange={(minute) => updatePart({ minute })}
          ariaLabel={`${label} minute`}
        />
        <TimeWheelColumn
          options={PERIODS}
          value={parts.period}
          onChange={(period) => updatePart({ period })}
          ariaLabel={`${label} period`}
        />
      </div>
    </div>
  );
}

export default function SelectTimeButton({
  label,
  value,
  onChange,
  startValue,
  endValue,
  onApplyRange,
  modalTitle = 'Select time',
  placeholder = 'Select Time',
  className = '',
  buttonClassName = '',
  textClassName = 'min-w-0 flex-1 truncate text-left',
  ariaLabel,
  fullWidth,
}) {
  const timeRef = useRef(null);
  const displayValue = useMemo(() => formatTime(value), [value]);
  const isRangeMode =
    startValue !== undefined || endValue !== undefined || typeof onApplyRange === 'function';
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(startValue || '');
  const [draftEnd, setDraftEnd] = useState(endValue || '');
  const boxWidth = inputField.box.width;
  const primary = colors.primary?.main || '#790728';

  const rangeDisplayValue = useMemo(() => {
    const start = formatTime(startValue);
    const end = formatTime(endValue);
    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - End time`;
    if (end) return `Start time - ${end}`;
    return '';
  }, [endValue, startValue]);

  useEffect(() => {
    if (!open) return;
    setDraftStart(startValue || '');
    setDraftEnd(endValue || '');
  }, [endValue, open, startValue]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const openPicker = () => {
    const input = timeRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.click();
  };

  if (isRangeMode) {
    return (
      <div
        className={`relative flex min-w-0 max-w-full flex-col gap-0.5 ${fullWidth ? 'w-full' : 'shrink-0'} ${className}`.trim()}
        style={fullWidth ? { width: '100%' } : { width: boxWidth }}
      >
        {label ? (
          <span className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
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
          <ClockIcon />
          <span className={textClassName}>{rangeDisplayValue || placeholder}</span>
          <ToolbarChevron />
        </button>

        {open ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="select-time-dialog-title"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:max-w-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: primary }}
                  >
                    <ClockIcon />
                  </span>
                  <div className="min-w-0">
                    <h2 id="select-time-dialog-title" className="truncate text-sm font-bold text-gray-900">
                      {modalTitle}
                    </h2>
                    <p className="text-[10px] font-medium text-gray-500">Set shift working time</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  onClick={() => setOpen(false)}
                  aria-label="Close select time"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-3 bg-slate-50/70 px-4 py-4 sm:grid-cols-2">
                <TimeWheelPicker
                  label="Start time"
                  value={draftStart}
                  fallback="09:00"
                  onChange={setDraftStart}
                />
                <TimeWheelPicker
                  label="End time"
                  value={draftEnd}
                  fallback="18:00"
                  onChange={setDraftEnd}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-4 py-3">
                <button
                  type="button"
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    setDraftStart('');
                    setDraftEnd('');
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                  style={{ backgroundColor: primary }}
                  onClick={() => {
                    onApplyRange?.({ startTime: draftStart, endTime: draftEnd });
                    setOpen(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-w-0 max-w-full flex-col gap-0.5 ${fullWidth ? 'w-full' : 'shrink-0'} ${className}`.trim()}
      style={fullWidth ? { width: '100%' } : { width: boxWidth }}
    >
      {label ? (
        <span className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
          {label}
        </span>
      ) : null}
      <button
        type="button"
        className={`${buttonClassName || defaultButtonClass} box-border h-[26px] min-h-[26px] w-full`}
        onClick={openPicker}
        aria-label={ariaLabel || label || placeholder}
      >
        <ClockIcon />
        <span className={textClassName}>{displayValue || placeholder}</span>
        <ToolbarChevron />
      </button>
      <input
        ref={timeRef}
        type="time"
        className="absolute h-0 w-0 opacity-0"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
