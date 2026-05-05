import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../constants/theme';

const primary      = colors.primary?.main      || '#790728';
const gradient     = colors.primary?.gradient  || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';
const primaryLight = '#f2e6ea';

const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

/* ── helpers ── */
function sod(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

function grid(year, month) {
  const first    = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const origin   = new Date(year, month, 1 - startPad);
  return Array.from({ length: 42 }, (_, i) => {
    const c = new Date(origin); c.setDate(origin.getDate() + i); return c;
  });
}

function toISO(d)  { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fromISO(s) {
  if (!s) return null;
  const p = String(s).split('-');
  if (p.length !== 3) return null;
  const d = new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
  return isNaN(d.getTime()) ? null : sod(d);
}
function display(s) {
  const d = fromISO(s);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

/* ── styles (inline so the component is self-contained) ── */
const S = {
  navBtn: {
    background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 7,
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', flexShrink: 0,
  },
  day: (isSelected, isToday, inMonth) => ({
    width: '100%', aspectRatio: '1', border: isToday && !isSelected ? `1.5px solid ${primary}` : 'none',
    borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: isSelected || isToday ? 700 : 400, transition: 'background 0.12s',
    background: isSelected ? primary : 'transparent',
    color: isSelected ? '#fff' : inMonth ? '#111827' : '#d1d5db',
    padding: 0,
  }),
};

/* ── component ── */
export default function DatePickerInput({
  value, onChange, placeholder = 'DD / MM / YYYY',
  disabled, heightPx = 26, borderRadius = 4, fullWidth, widthPx,
}) {
  const [open,      setOpen]      = useState(false);
  const [viewYear,  setViewYear]  = useState(() => { const d = fromISO(value); return d ? d.getFullYear() : new Date().getFullYear(); });
  const [viewMonth, setViewMonth] = useState(() => { const d = fromISO(value); return d ? d.getMonth()    : new Date().getMonth();    });
  const [showYear,  setShowYear]  = useState(false);
  const wrapRef = useRef(null);

  const selected = fromISO(value);
  const today    = sod(new Date());

  /* sync view when value changes externally */
  useEffect(() => {
    const d = fromISO(value);
    if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
  }, [value]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  const days = useMemo(() => grid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goMonth = (d) => {
    const next = new Date(viewYear, viewMonth + d, 1);
    setViewYear(next.getFullYear()); setViewMonth(next.getMonth());
  };

  const pick = (d) => {
    onChange?.({ target: { value: toISO(d) } });
    setOpen(false); setShowYear(false);
  };

  const clear = () => { onChange?.({ target: { value: '' } }); setOpen(false); };

  /* year grid: ±6 years from current view */
  const yearList = Array.from({ length: 18 }, (_, i) => viewYear - 6 + i);

  const triggerStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    height: heightPx, minHeight: heightPx,
    borderRadius, border: '1px solid #e2e8f0',
    background: '#F5F5F5', padding: '0 8px',
    boxSizing: 'border-box', cursor: disabled ? 'default' : 'pointer',
    width: fullWidth ? '100%' : widthPx ? `${widthPx}px` : '100%',
    opacity: disabled ? 0.55 : 1,
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: fullWidth ? '100%' : widthPx ? `${widthPx}px` : '100%' }}>

      {/* ── trigger ── */}
      <div style={triggerStyle} onClick={() => !disabled && setOpen(v => !v)}>
        <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, flexShrink: 0, color: primary }}
          fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="2" width="14" height="13" rx="1.5" />
          <path d="M1 6h14M5 1v2M11 1v2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: value ? '#111' : '#9ca3af', letterSpacing: '0.01em', userSelect: 'none' }}>
          {value ? display(value) : placeholder}
        </span>
        <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, flexShrink: 0, color: '#9ca3af', transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }}
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* ── dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 5, zIndex: 1200,
          width: 270, background: '#fff', borderRadius: 14,
          border: '1px solid #e5e7eb',
          boxShadow: '0 12px 32px -4px rgba(121,7,40,0.18), 0 4px 12px -2px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>

          {/* gradient header */}
          <div style={{ background: gradient, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <button type="button" style={S.navBtn} onClick={() => goMonth(-1)} aria-label="Previous month">
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* month / year label — click to toggle year grid */}
            <button
              type="button"
              onClick={() => setShowYear(v => !v)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '3px 10px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {showYear ? viewYear : `${MONTHS[viewMonth]} ${viewYear}`}
              <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, transition: 'transform .15s', transform: showYear ? 'rotate(180deg)' : 'none' }}
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <button type="button" style={S.navBtn} onClick={() => goMonth(1)} aria-label="Next month">
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* year grid */}
          {showYear && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, padding: '10px 10px 6px' }}>
              {yearList.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setViewYear(y); setShowYear(false); }}
                  style={{
                    border: 'none', borderRadius: 8, padding: '5px 0', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    background: y === viewYear ? primary : y === new Date().getFullYear() ? primaryLight : 'transparent',
                    color: y === viewYear ? '#fff' : y === new Date().getFullYear() ? primary : '#374151',
                  }}
                  onMouseEnter={e => { if (y !== viewYear) e.currentTarget.style.background = primaryLight; }}
                  onMouseLeave={e => { if (y !== viewYear) e.currentTarget.style.background = y === new Date().getFullYear() ? primaryLight : 'transparent'; }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* weekday headers */}
          {!showYear && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '8px 10px 3px', gap: 2 }}>
                {WEEKDAYS.map(w => (
                  <div key={w} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {w}
                  </div>
                ))}
              </div>

              {/* day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 10px 10px', gap: 2 }}>
                {days.map((d, i) => {
                  const inMonth    = d.getMonth() === viewMonth;
                  const isSelected = selected && d.toDateString() === selected.toDateString();
                  const isToday    = d.toDateString() === today.toDateString();
                  return (
                    <button
                      key={i}
                      type="button"
                      style={S.day(isSelected, isToday, inMonth)}
                      onClick={() => pick(d)}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = primaryLight; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* footer */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 10px', display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => pick(today)}
              style={{ flex: 1, background: primaryLight, border: 'none', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 700, color: primary, cursor: 'pointer' }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={clear}
              style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
