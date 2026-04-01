import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../constants/theme';
import PayIcon from '../../assets/icons/pay.svg';

const primary = colors.primary?.main || '#790728';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'thisWeek', label: 'This week' },
  { id: 'lastWeek', label: 'Last week' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'thisYear', label: 'This year' },
  { id: 'lastYear', label: 'Last year' },
  { id: 'all', label: 'All' },
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatDDMMYYYY(d) {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDDMMYYYY(s) {
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : startOfDay(d);
}

/** ISO week number for a date (week starts Monday). */
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - y) / 86400000 + 1) / 7);
}

function getCalendarGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startPad = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, monthIndex, 1 - startPad);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const cell = new Date(gridStart);
    cell.setDate(gridStart.getDate() + i);
    days.push(cell);
  }
  return days;
}

function presetRange(id) {
  const now = new Date();
  const today = startOfDay(now);

  if (id === 'today') return { from: today, to: today };

  if (id === 'thisWeek') {
    const dow = (now.getDay() + 6) % 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - dow);
    return { from: startOfDay(mon), to: today };
  }

  if (id === 'lastWeek') {
    const dow = (now.getDay() + 6) % 7;
    const thisMon = new Date(now);
    thisMon.setDate(now.getDate() - dow);
    const lastMon = new Date(thisMon);
    lastMon.setDate(thisMon.getDate() - 7);
    const lastSun = new Date(lastMon);
    lastSun.setDate(lastMon.getDate() + 6);
    return { from: startOfDay(lastMon), to: startOfDay(lastSun) };
  }

  if (id === 'thisMonth') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: startOfDay(from), to: startOfDay(to) };
  }

  if (id === 'lastMonth') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: startOfDay(from), to: startOfDay(to) };
  }

  if (id === 'thisYear') {
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    return { from: startOfDay(from), to: startOfDay(to) };
  }

  if (id === 'lastYear') {
    const y = now.getFullYear() - 1;
    const from = new Date(y, 0, 1);
    const to = new Date(y, 11, 31);
    return { from: startOfDay(from), to: startOfDay(to) };
  }

  if (id === 'all') return { from: null, to: null };

  return { from: today, to: today };
}

/**
 * Quotation date range picker modal (Figma: sidebar presets + calendar + DD/MM/YYYY + Apply).
 */
export default function QuotationDateRangeModal({ open, title = 'Quotation Date', initialRange, onClose, onApply }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [rangeFrom, setRangeFrom] = useState(null);
  const [rangeTo, setRangeTo] = useState(null);
  const [fromStr, setFromStr] = useState('');
  const [toStr, setToStr] = useState('');

  const syncFromRange = useCallback((from, to) => {
    setRangeFrom(from);
    setRangeTo(to);
    setFromStr(from ? formatDDMMYYYY(from) : '');
    setToStr(to ? formatDDMMYYYY(to) : '');
  }, []);

  useEffect(() => {
    if (!open) return;
    if (initialRange?.from && initialRange?.to) {
      const f = startOfDay(initialRange.from);
      const t = startOfDay(initialRange.to);
      syncFromRange(f, t);
      setVisibleMonth(new Date(f.getFullYear(), f.getMonth(), 1));
    } else {
      syncFromRange(null, null);
      setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    }
  }, [open, initialRange, syncFromRange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const year = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth();
  const gridDays = useMemo(() => getCalendarGrid(year, monthIndex), [year, monthIndex]);

  const isInRange = (d) => {
    if (!rangeFrom) return false;
    const t = startOfDay(d).getTime();
    const f = rangeFrom.getTime();
    const e = (rangeTo ?? rangeFrom).getTime();
    return t >= f && t <= e;
  };

  const isRangeEndpoint = (d) => {
    const t = startOfDay(d).getTime();
    if (rangeFrom && !rangeTo) return t === rangeFrom.getTime();
    if (!rangeFrom || !rangeTo) return false;
    return t === rangeFrom.getTime() || t === rangeTo.getTime();
  };

  const onDayClick = (d) => {
    const day = startOfDay(d);
    if (!rangeFrom || (rangeFrom && rangeTo)) {
      syncFromRange(day, null);
      return;
    }
    let from = rangeFrom;
    let to = day;
    if (to < from) [from, to] = [to, from];
    syncFromRange(from, to);
  };

  const onPreset = (id) => {
    const { from, to } = presetRange(id);
    if (id === 'all') {
      syncFromRange(null, null);
      return;
    }
    syncFromRange(from, to);
    if (from) setVisibleMonth(new Date(from.getFullYear(), from.getMonth(), 1));
  };

  const goMonth = (delta) => {
    setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const handleApply = () => {
    let from = rangeFrom ?? parseDDMMYYYY(fromStr);
    let to = rangeTo ?? parseDDMMYYYY(toStr);
    if (!fromStr.trim() && !toStr.trim() && !rangeFrom && !rangeTo) {
      onApply?.(null);
      onClose?.();
      return;
    }
    if (from && !to) to = from;
    if (!from && to) from = to;
    if (from && to) {
      if (from > to) [from, to] = [to, from];
      onApply?.({ from, to });
      onClose?.();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3 py-6 backdrop-blur-sm sm:px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quotation-date-modal-title"
    >
      <div
        className="max-h-[min(92vh,640px)] w-full max-w-[720px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="quotation-date-modal-title" className="border-b border-gray-100 py-3 text-center text-sm font-bold sm:text-base" style={{ color: primary }}>
          {title}
        </h2>

        <div className="flex max-h-[min(75vh,520px)] min-h-[280px] flex-col sm:flex-row">
          <nav className="flex shrink-0 flex-row flex-wrap gap-1 border-b border-gray-200 p-2 sm:w-[140px] sm:flex-col sm:border-b-0 sm:border-r sm:p-3 sm:pr-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPreset(p.id)}
                className="rounded px-2 py-1.5 text-left text-[10px] text-gray-800 hover:bg-rose-50 sm:text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-auto p-2 sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <button type="button" className="rounded p-1 text-gray-600 hover:bg-gray-100" aria-label="Previous month" onClick={() => goMonth(-1)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {MONTH_NAMES[monthIndex]} {year}
              </span>
              <button type="button" className="rounded p-1 text-gray-600 hover:bg-gray-100" aria-label="Next month" onClick={() => goMonth(1)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-[2rem_repeat(7,minmax(0,1fr))] gap-y-0.5 text-center text-[9px] sm:text-[10px]">
              <div />
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1 font-medium text-gray-600">
                  {w}
                </div>
              ))}

              {Array.from({ length: 6 }, (_, row) => {
                const rowDays = gridDays.slice(row * 7, row * 7 + 7);
                const weekNo = getISOWeek(rowDays[0]);
                return (
                  <React.Fragment key={row}>
                    <div className="flex items-center justify-center text-[8px] text-gray-400">{String(weekNo).padStart(2, '0')}</div>
                    {rowDays.map((d, i) => {
                      const inMonth = d.getMonth() === monthIndex;
                      const inR = isInRange(d);
                      const isEnd = isRangeEndpoint(d);
                      return (
                        <button
                          key={`${d.getTime()}-${i}`}
                          type="button"
                          onClick={() => onDayClick(d)}
                          className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] sm:h-8 sm:w-8 sm:text-[11px] ${
                            inMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${inR ? 'font-medium' : ''} ${inR && !isEnd ? 'bg-rose-100/80' : ''}`}
                          style={isEnd ? { backgroundColor: primary, color: '#fff' } : undefined}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 p-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={fromStr}
              onChange={(e) => setFromStr(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-[108px] rounded border border-gray-300 px-2 py-1.5 text-[10px] text-gray-900 placeholder:text-gray-400 sm:w-[118px] sm:text-[11px]"
            />
            <span className="text-gray-400">—</span>
            <input
              type="text"
              value={toStr}
              onChange={(e) => setToStr(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-[108px] rounded border border-gray-300 px-2 py-1.5 text-[10px] text-gray-900 placeholder:text-gray-400 sm:w-[118px] sm:text-[11px]"
            />
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-2 self-end rounded border-2 bg-white px-4 py-2 text-xs font-semibold sm:self-auto"
            style={{ borderColor: primary, color: primary }}
          >
            <img src={PayIcon} alt="" className="h-4 w-4 shrink-0" width={16} height={16} aria-hidden />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
