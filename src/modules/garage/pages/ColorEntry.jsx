import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import httpClient from '../../../services/http/httpClient';

const primary   = colors.primary?.main  || '#790728';
const primaryLt = colors.primary?.[50]  || '#F2E6EA';
const primaryMd = colors.primary?.[100] || '#E4CDD3';

const NAMED_COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Dark Red', hex: '#8B0000' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Hot Pink', hex: '#FF69B4' },
  { name: 'Deep Pink', hex: '#FF1493' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Dark Orange', hex: '#FF8C00' },
  { name: 'Orange Red', hex: '#FF4500' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Yellow Green', hex: '#9ACD32' },
  { name: 'Green', hex: '#008000' },
  { name: 'Lime Green', hex: '#32CD32' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Dark Green', hex: '#006400' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Dark Cyan', hex: '#008B8B' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Steel Blue', hex: '#4682B4' },
  { name: 'Dodger Blue', hex: '#1E90FF' },
  { name: 'Midnight Blue', hex: '#191970' },
  { name: 'Cornflower Blue', hex: '#6495ED' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Dark Purple', hex: '#4B0082' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Plum', hex: '#DDA0DD' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Saddle Brown', hex: '#8B4513' },
  { name: 'Chocolate', hex: '#D2691E' },
  { name: 'Sienna', hex: '#A0522D' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Khaki', hex: '#F0E68C' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Snow White', hex: '#FFFAFA' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Pearl White', hex: '#F0EAD6' },
  { name: 'Off White', hex: '#FAF9F6' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Light Gray', hex: '#D3D3D3' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Dark Gray', hex: '#A9A9A9' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Slate Gray', hex: '#708090' },
  { name: 'Black', hex: '#000000' },
  { name: 'Gunmetal', hex: '#2A3439' },
  { name: 'Champagne', hex: '#FAD6A5' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Copper', hex: '#B87333' },
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Metallic Silver', hex: '#A8A9AD' },
];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function nearestColorName(hex) {
  if (!hex || hex.length < 7) return '';
  try {
    const [r, g, b] = hexToRgb(hex);
    let nearest = NAMED_COLORS[0];
    let minDist = Infinity;
    for (const c of NAMED_COLORS) {
      const [cr, cg, cb] = hexToRgb(c.hex);
      const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (dist < minDist) { minDist = dist; nearest = c; }
    }
    return nearest.name;
  } catch {
    return '';
  }
}

/* Checkerboard SVG for swatches with no color assigned */
const checkerSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Crect width='6' height='6' fill='%23e2e8f0'/%3E%3Crect x='6' y='6' width='6' height='6' fill='%23e2e8f0'/%3E%3C/svg%3E")`;

function SkeletonRow({ i }) {
  return (
    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
      <td className="px-4 py-2.5">
        <div className="h-2.5 w-4 animate-pulse rounded bg-slate-100" />
      </td>
      <td className="px-4 py-2.5">
        <div className="h-6 w-12 animate-pulse rounded-md bg-slate-100" />
      </td>
      <td className="px-4 py-2.5">
        <div className="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
      </td>
      <td className="px-4 py-2.5">
        <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
      </td>
      <td className="px-4 py-2.5 text-center">
        <div className="mx-auto h-5 w-5 animate-pulse rounded bg-slate-100" />
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-14">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: primaryLt }}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill={primary} />
          <circle cx="17.5" cy="10.5" r=".5" fill={primary} />
          <circle cx="8.5" cy="7.5" r=".5" fill={primary} />
          <circle cx="6.5" cy="12.5" r=".5" fill={primary} />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-slate-600">No colors yet</p>
        <p className="mt-0.5 text-[9px] text-slate-400">Pick a color above and save to build your palette.</p>
      </div>
    </div>
  );
}

const emptyForm = () => ({ colorName: '', colorCode: '' });

const outlineBtn = [
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-gray-200',
  'bg-white px-2.5 text-[10px] font-semibold text-slate-600 shadow-sm',
  'transition hover:border-gray-300 hover:bg-slate-50 active:scale-95',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
].join(' ');

const primaryBtn = [
  'inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5',
  'text-[10px] font-semibold text-white shadow-sm',
  'transition hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
].join(' ');

export default function ColorEntry() {
  const [form, setForm]         = useState(emptyForm());
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [fadingId, setFadingId]   = useState(null);
  const nameRef = useRef(null);

  const fetchColors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await httpClient.get('/api/garage/colors');
      setList(data.colors || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load colors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColors(); }, [fetchColors]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleColorPick = (e) => {
    const hex = e.target.value;
    setForm((p) => ({ ...p, colorCode: hex, colorName: nearestColorName(hex) }));
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const lower = val.trim().toLowerCase();
    const match =
      NAMED_COLORS.find((c) => c.name.toLowerCase() === lower) ||
      NAMED_COLORS.find((c) => c.name.toLowerCase().startsWith(lower) && lower.length >= 3);
    setForm((p) => ({ ...p, colorName: val, ...(match ? { colorCode: match.hex } : {}) }));
  };

  const handleNew = () => { setForm(emptyForm()); setError(''); setConfirmId(null); nameRef.current?.focus(); };

  const handleSave = async () => {
    if (!form.colorName.trim()) { setError('Color name is required'); return; }
    setError('');
    setSaving(true);
    try {
      await httpClient.post('/api/garage/colors', {
        colorName: form.colorName.trim(),
        colorCode: form.colorCode.trim() || null,
      });
      setForm(emptyForm());
      await fetchColors();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save color');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (colorId) => {
    setFadingId(colorId);
    await new Promise((r) => setTimeout(r, 180));
    try {
      await httpClient.delete(`/api/garage/colors/${colorId}`);
      setList((prev) => prev.filter((c) => c.colorId !== colorId));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete color');
    } finally {
      setFadingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col -mx-[13px] w-[calc(100%+26px)] overflow-hidden bg-white">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: primaryLt }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill={primary} />
              <circle cx="17.5" cy="10.5" r=".5" fill={primary} />
              <circle cx="8.5" cy="7.5" r=".5" fill={primary} />
              <circle cx="6.5" cy="12.5" r=".5" fill={primary} />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[11px] font-bold uppercase tracking-widest leading-none" style={{ color: primary }}>
              Color Master
            </h1>
            <p className="mt-0.5 text-[9px] font-normal text-slate-400 leading-none">Vehicle color registry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNew}
            className={outlineBtn}
            style={{ '--tw-ring-color': primary }}
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={primaryBtn}
            style={{ background: primary, borderColor: primary, '--tw-ring-color': primary }}
          >
            {saving ? (
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Entry Form ── */}
      <div className="shrink-0 border-b border-gray-100 px-5 py-4">
        <div className="flex items-start gap-5">

          {/* Big color swatch — click to open native picker */}
          <label
            className="group relative shrink-0 cursor-pointer"
            title="Click to open color picker"
          >
            <div
              className="h-[68px] w-[68px] rounded-xl border-2 transition-all duration-150 group-hover:scale-[1.03] group-hover:shadow-md"
              style={{
                background: form.colorCode || undefined,
                backgroundImage: form.colorCode ? undefined : checkerSvg,
                backgroundSize: form.colorCode ? undefined : '12px 12px',
                borderColor: form.colorCode || '#e2e8f0',
                boxShadow: form.colorCode ? `0 0 0 3px ${form.colorCode}22` : undefined,
              }}
            />
            {!form.colorCode && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <svg className="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </div>
            )}
            <input
              type="color"
              value={form.colorCode || '#790728'}
              onChange={handleColorPick}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              tabIndex={-1}
            />
          </label>

          {/* Fields */}
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-end gap-3">

              {/* Hex code */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Hex Code
                </label>
                <div className="flex items-center gap-1.5">
                  {form.colorCode && (
                    <div
                      className="h-5 w-5 shrink-0 rounded border border-gray-200"
                      style={{ background: form.colorCode }}
                    />
                  )}
                  <input
                    type="text"
                    value={form.colorCode}
                    onChange={set('colorCode')}
                    placeholder="#FFFFFF"
                    maxLength={7}
                    className="h-7 w-24 rounded-md border border-gray-200 bg-slate-50 px-2.5 font-mono text-[10px] text-slate-700 outline-none transition focus-visible:border-[--p] focus-visible:ring-1 focus-visible:ring-[--p] focus-visible:bg-white"
                    style={{ '--p': primary }}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Color Name <span className="text-red-400">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.colorName}
                  onChange={handleNameChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. Pearl White"
                  className="h-7 w-48 rounded-md border border-gray-200 bg-slate-50 px-2.5 text-[11px] font-medium text-slate-800 outline-none transition focus-visible:border-[--p] focus-visible:ring-1 focus-visible:ring-[--p] focus-visible:bg-white"
                  style={{ '--p': primary }}
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-[10px] font-medium text-red-500">
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Color List ── */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: primary }}>
              {['#', 'Swatch', 'Color Name', 'Hex Code', 'Action'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2 text-[8.5px] font-bold uppercase tracking-widest text-white/90 ${i === 4 ? 'text-center' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} i={i} />)}

            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState />
                </td>
              </tr>
            )}

            {!loading && list.map((c, i) => {
              const isConfirm = confirmId === c.colorId;
              const isFading  = fadingId  === c.colorId;

              return (
                <tr
                  key={c.colorId}
                  className={[
                    'border-b border-gray-50 transition-all duration-200',
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                    isConfirm ? 'bg-red-50/80' : 'hover:bg-[--pl]',
                    isFading  ? 'opacity-0 scale-y-0 origin-top' : 'opacity-100',
                  ].join(' ')}
                  style={{ '--pl': primaryLt }}
                >
                  {/* # */}
                  <td className="px-4 py-2.5 text-[10px] tabular-nums text-slate-400">{i + 1}</td>

                  {/* Swatch */}
                  <td className="px-4 py-2.5">
                    <div
                      className="h-6 w-12 rounded-md border border-gray-200/80"
                      style={{
                        background: c.colorCode || undefined,
                        backgroundImage: c.colorCode ? undefined : checkerSvg,
                        backgroundSize: c.colorCode ? undefined : '8px 8px',
                      }}
                      title={c.colorCode || 'No color code'}
                    />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-2.5 font-medium text-slate-700">{c.colorName}</td>

                  {/* Hex */}
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">
                    {c.colorCode || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-2.5 text-center">
                    {isConfirm ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[9px] font-medium text-red-500 mr-1">Delete?</span>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="h-5 rounded px-1.5 text-[9px] font-semibold text-slate-500 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.colorId)}
                          className="h-5 rounded bg-red-500 px-1.5 text-[9px] font-semibold text-white hover:bg-red-600 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                        >
                          Delete
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(c.colorId)}
                        className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-300"
                        title="Delete"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
