import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../constants/theme';

const primary      = colors.primary?.main || '#790728';
const gradient     = colors.primary?.gradient || `linear-gradient(180deg,#C44972 0%,#790728 100%)`;
const primaryLight = '#fdf2f5';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const PRESETS = [
  { id: 'today',     label: 'Today' },
  { id: 'thisWeek',  label: 'This Week' },
  { id: 'lastWeek',  label: 'Last Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'thisYear',  label: 'This Year' },
  { id: 'lastYear',  label: 'Last Year' },
  { id: 'all',       label: 'All' },
];

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

export function formatDDMMYYYY(d) {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function parseDDMMYYYY(s) {
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
  return isNaN(d.getTime()) ? null : startOfDay(d);
}

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
    const mon = new Date(now); mon.setDate(now.getDate() - dow);
    return { from: startOfDay(mon), to: today };
  }
  if (id === 'lastWeek') {
    const dow = (now.getDay() + 6) % 7;
    const thisMon = new Date(now); thisMon.setDate(now.getDate() - dow);
    const lastMon = new Date(thisMon); lastMon.setDate(thisMon.getDate() - 7);
    const lastSun = new Date(lastMon); lastSun.setDate(lastMon.getDate() + 6);
    return { from: startOfDay(lastMon), to: startOfDay(lastSun) };
  }
  if (id === 'thisMonth') {
    return { from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: startOfDay(new Date(now.getFullYear(), now.getMonth()+1, 0)) };
  }
  if (id === 'lastMonth') {
    return { from: startOfDay(new Date(now.getFullYear(), now.getMonth()-1, 1)), to: startOfDay(new Date(now.getFullYear(), now.getMonth(), 0)) };
  }
  if (id === 'thisYear') {
    return { from: startOfDay(new Date(now.getFullYear(), 0, 1)), to: startOfDay(new Date(now.getFullYear(), 11, 31)) };
  }
  if (id === 'lastYear') {
    const y = now.getFullYear()-1;
    return { from: startOfDay(new Date(y, 0, 1)), to: startOfDay(new Date(y, 11, 31)) };
  }
  if (id === 'all') return { from: null, to: null };
  return { from: today, to: today };
}

export default function QuotationDateRangeModal({ open, title = 'Select Date Range', initialRange, onClose, onApply }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [rangeFrom,    setRangeFrom]    = useState(null);
  const [rangeTo,      setRangeTo]      = useState(null);
  const [fromStr,      setFromStr]      = useState('');
  const [toStr,        setToStr]        = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const syncFromRange = useCallback((from, to) => {
    setRangeFrom(from); setRangeTo(to);
    setFromStr(from ? formatDDMMYYYY(from) : '');
    setToStr(to   ? formatDDMMYYYY(to)   : '');
  }, []);

  useEffect(() => {
    if (!open) return;
    setActivePreset(null);
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
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const year       = visibleMonth.getFullYear();
  const monthIndex = visibleMonth.getMonth();
  const gridDays   = useMemo(() => getCalendarGrid(year, monthIndex), [year, monthIndex]);

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
  const isRangeStart = (d) => rangeFrom && startOfDay(d).getTime() === rangeFrom.getTime();
  const isRangeEnd   = (d) => rangeTo   && startOfDay(d).getTime() === rangeTo.getTime();

  const onDayClick = (d) => {
    setActivePreset(null);
    const day = startOfDay(d);
    if (!rangeFrom || (rangeFrom && rangeTo)) { syncFromRange(day, null); return; }
    let from = rangeFrom, to = day;
    if (to < from) [from, to] = [to, from];
    syncFromRange(from, to);
  };

  const onPreset = (id) => {
    setActivePreset(id);
    const { from, to } = presetRange(id);
    if (id === 'all') { syncFromRange(null, null); return; }
    syncFromRange(from, to);
    if (from) setVisibleMonth(new Date(from.getFullYear(), from.getMonth(), 1));
  };

  const goMonth = (delta) =>
    setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const handleApply = () => {
    let from = rangeFrom ?? parseDDMMYYYY(fromStr);
    let to   = rangeTo   ?? parseDDMMYYYY(toStr);
    if (!fromStr.trim() && !toStr.trim() && !rangeFrom && !rangeTo) {
      onApply?.(null); onClose?.(); return;
    }
    if (from && !to) to = from;
    if (!from && to) from = to;
    if (from && to) {
      if (from > to) [from, to] = [to, from];
      onApply?.({ from, to }); onClose?.();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3 py-6 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-modal-title"
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: `1.5px solid ${primary}22` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── header ── */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: gradient }}>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="3" width="16" height="15" rx="2" />
              <path d="M2 8h16M6 1v3M14 1v3" />
            </svg>
            <h2 id="date-modal-title" className="text-sm font-bold tracking-wide text-white">{title}</h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition hover:bg-white/20 hover:text-white"
            aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── date inputs row ── */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-2.5">
          <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-gray-400">
            <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: primary }}>
              <rect x="1" y="2" width="14" height="13" rx="1.5"/><path d="M1 6h14M5 1v2M11 1v2" strokeLinecap="round"/>
            </svg>
            <span className="text-[9px] font-bold text-gray-400">FROM</span>
            <input type="text" value={fromStr} onChange={(e) => setFromStr(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="min-w-0 flex-1 border-0 bg-transparent text-[11px] font-semibold text-gray-800 outline-none placeholder:text-gray-300" />
          </div>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-gray-400">
            <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: primary }}>
              <rect x="1" y="2" width="14" height="13" rx="1.5"/><path d="M1 6h14M5 1v2M11 1v2" strokeLinecap="round"/>
            </svg>
            <span className="text-[9px] font-bold text-gray-400">TO</span>
            <input type="text" value={toStr} onChange={(e) => setToStr(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="min-w-0 flex-1 border-0 bg-transparent text-[11px] font-semibold text-gray-800 outline-none placeholder:text-gray-300" />
          </div>
        </div>

        <div className="flex">
          {/* ── presets ── */}
          <div className="flex w-[118px] shrink-0 flex-col gap-0.5 border-r border-gray-100 p-2.5">
            <p className="pb-1 text-[8px] font-bold uppercase tracking-widest text-gray-400">Quick Select</p>
            {PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => onPreset(p.id)}
                className="rounded-md px-2 py-1.5 text-left text-[10px] font-medium transition-all"
                style={activePreset === p.id
                  ? { background: gradient, color: '#fff', fontWeight: 700 }
                  : { color: '#4b5563' }}
                onMouseEnter={(e) => { if (activePreset !== p.id) e.currentTarget.style.backgroundColor = primaryLight; }}
                onMouseLeave={(e) => { if (activePreset !== p.id) e.currentTarget.style.backgroundColor = ''; }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* ── calendar ── */}
          <div className="min-w-0 flex-1 p-3">
            {/* month nav */}
            <div className="mb-2 flex items-center justify-between">
              <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:text-white"
                onMouseEnter={(e) => { e.currentTarget.style.background = primary; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <span className="text-[12px] font-extrabold tracking-wide" style={{ color: primary }}>
                {MONTH_NAMES[monthIndex]} {year}
              </span>
              <button type="button" onClick={() => goMonth(1)} aria-label="Next month"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition"
                onMouseEnter={(e) => { e.currentTarget.style.background = primary; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* grid */}
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: primary }}>
                  {w}
                </div>
              ))}
              {Array.from({ length: 6 }, (_, row) => {
                const rowDays = gridDays.slice(row * 7, row * 7 + 7);
                return rowDays.map((d, i) => {
                  const inMonth = d.getMonth() === monthIndex;
                  const inR     = isInRange(d);
                  const isEnd   = isRangeEndpoint(d);
                  const isStart = isRangeStart(d);
                  const isLast  = isRangeEnd(d);
                  const isToday = startOfDay(new Date()).getTime() === startOfDay(d).getTime();

                  return (
                    <button
                      key={`${d.getTime()}-${row}-${i}`}
                      type="button"
                      onClick={() => onDayClick(d)}
                      className="relative mx-auto flex h-7 w-7 items-center justify-center text-[10px] font-medium transition-all"
                      style={{
                        borderRadius: isStart && isLast ? '50%'
                          : isStart ? '50% 0 0 50%'
                          : isLast  ? '0 50% 50% 0'
                          : inR     ? '0'
                          : '50%',
                        background: isEnd
                          ? gradient
                          : inR
                          ? `${primary}18`
                          : 'transparent',
                        color: isEnd ? '#fff' : inMonth ? '#111' : '#ccc',
                        fontWeight: isEnd ? 800 : inR ? 600 : isToday ? 700 : 400,
                        outline: isToday && !isEnd ? `2px solid ${primary}55` : 'none',
                        outlineOffset: '-2px',
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                });
              })}
            </div>
          </div>
        </div>

        {/* ── footer ── */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-5 py-3">
          <button type="button" onClick={() => { syncFromRange(null, null); setActivePreset(null); }}
            className="text-[10px] font-semibold text-gray-400 underline underline-offset-2 transition hover:text-gray-600">
            Clear
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100">
              Cancel
            </button>
            <button type="button" onClick={handleApply}
              className="rounded-lg px-5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ background: gradient }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
