import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../../constants/theme';

const primary      = colors.primary?.main     || '#790728';
const gradient     = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';
const primaryLight = '#f2e6ea';

const HOURS   = Array.from({ length: 12 }, (_, i) => i + 1);          // 1–12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);          // 0,5,10…55

/* ── helpers ── */
function parseValue(v) {
  if (!v) return { h12: 12, min: 0, ampm: 'AM' };
  const [hh, mm] = v.split(':').map(Number);
  if (isNaN(hh) || isNaN(mm)) return { h12: 12, min: 0, ampm: 'AM' };
  return { h12: hh % 12 || 12, min: mm, ampm: hh < 12 ? 'AM' : 'PM' };
}

function toISO(h12, min, ampm) {
  let h = h12 % 12;
  if (ampm === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function toDisplay(v) {
  if (!v) return '';
  const { h12, min, ampm } = parseValue(v);
  return `${String(h12).padStart(2, '0')} : ${String(min).padStart(2, '0')} ${ampm}`;
}

/* ── shared button helpers ── */
const cellBase = { border: 'none', borderRadius: 7, padding: '5px 2px', fontWeight: 600, fontSize: 11, cursor: 'pointer', transition: 'background 0.12s, color 0.12s' };

export default function TimePickerInput({
  value, onChange, placeholder = 'HH : MM',
  disabled, heightPx = 26, borderRadius = 4, fullWidth, widthPx,
}) {
  const [open,  setOpen]  = useState(false);
  const [h12,   setH12]   = useState(12);
  const [min,   setMin]   = useState(0);
  const [ampm,  setAmpm]  = useState('AM');
  const wrapRef = useRef(null);

  /* sync internal state when picker opens or value changes */
  useEffect(() => {
    const p = parseValue(value);
    setH12(p.h12); setMin(p.min); setAmpm(p.ampm);
  }, [value, open]);

  /* outside click */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  /* Escape */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  const pickHour = (v) => setH12(v);
  const pickMin  = (v) => setMin(v);
  const pickAmpm = (v) => setAmpm(v);

  const handleOk = () => {
    onChange?.({ target: { value: toISO(h12, min, ampm) } });
    setOpen(false);
  };

  const setNow = () => {
    const now  = new Date();
    const rawH = now.getHours(), rawM = now.getMinutes();
    setAmpm(rawH < 12 ? 'AM' : 'PM');
    setH12(rawH % 12 || 12);
    setMin(Math.round(rawM / 5) * 5 % 60);
  };

  const clear = () => { onChange?.({ target: { value: '' } }); setOpen(false); };

  const containerW = fullWidth ? '100%' : widthPx ? `${widthPx}px` : '100%';

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: containerW }}>

      {/* ── trigger ── */}
      <div
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: heightPx, minHeight: heightPx, borderRadius,
          border: '1px solid #e2e8f0', background: '#F5F5F5',
          padding: '0 8px', boxSizing: 'border-box',
          cursor: disabled ? 'default' : 'pointer',
          width: '100%', opacity: disabled ? 0.55 : 1,
        }}
      >
        {/* clock icon */}
        <svg viewBox="0 0 16 16" style={{ width: 12, height: 12, flexShrink: 0, color: primary }}
          fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 4.5V8l2.5 1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: value ? '#111' : '#9ca3af', userSelect: 'none', letterSpacing: '0.02em' }}>
          {value ? toDisplay(value) : placeholder}
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
          width: 260, background: '#fff', borderRadius: 14,
          border: '1px solid #e5e7eb',
          boxShadow: '0 12px 32px -4px rgba(121,7,40,0.18), 0 4px 12px -2px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>

          {/* gradient header */}
          <div style={{ background: gradient, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, color: '#fff', flexShrink: 0 }}
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Select Time</span>
            {/* live preview */}
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.95)', fontWeight: 800, fontSize: 15, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
              {String(h12).padStart(2, '0')} : {String(min).padStart(2, '0')}
              <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 4, opacity: 0.85 }}>{ampm}</span>
            </span>
          </div>

          {/* AM / PM toggle */}
          <div style={{ display: 'flex', gap: 8, padding: '10px 14px 4px' }}>
            {['AM', 'PM'].map(a => (
              <button
                key={a}
                type="button"
                onClick={() => pickAmpm(a)}
                style={{
                  ...cellBase,
                  flex: 1, padding: '6px 0', fontSize: 12, borderRadius: 9,
                  background: ampm === a ? primary : primaryLight,
                  color:      ampm === a ? '#fff'   : primary,
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* hour + minute grids */}
          <div style={{ display: 'flex', padding: '8px 14px 10px', gap: 10 }}>

            {/* hours */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 5px', fontSize: 9, fontWeight: 800, color: primary, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
                Hour
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
                {HOURS.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => pickHour(v)}
                    style={{ ...cellBase, background: h12 === v ? primary : 'transparent', color: h12 === v ? '#fff' : '#374151' }}
                    onMouseEnter={e => { if (h12 !== v) e.currentTarget.style.background = primaryLight; }}
                    onMouseLeave={e => { if (h12 !== v) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {String(v).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* divider */}
            <div style={{ width: 1, background: '#f0f0f0', flexShrink: 0 }} />

            {/* minutes */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 5px', fontSize: 9, fontWeight: 800, color: primary, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
                Minute
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
                {MINUTES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => pickMin(v)}
                    style={{ ...cellBase, background: min === v ? primary : 'transparent', color: min === v ? '#fff' : '#374151' }}
                    onMouseEnter={e => { if (min !== v) e.currentTarget.style.background = primaryLight; }}
                    onMouseLeave={e => { if (min !== v) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {String(v).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* footer */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 14px', display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={setNow}
              style={{ flex: 1, background: primaryLight, border: 'none', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 700, color: primary, cursor: 'pointer' }}
            >
              Now
            </button>
            <button
              type="button"
              onClick={handleOk}
              style={{ flex: 2, border: 'none', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', background: gradient }}
            >
              OK
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
