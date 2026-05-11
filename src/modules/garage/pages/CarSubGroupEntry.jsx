import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import httpClient from '../../../services/http/httpClient';

const primary   = colors.primary?.main  || '#790728';
const primaryLt = colors.primary?.[50]  || '#F2E6EA';

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

const inputCls = [
  'h-7 rounded-md border border-gray-200 bg-slate-50 px-2.5',
  'text-[11px] font-medium text-slate-800 outline-none',
  'transition focus-visible:border-[--p] focus-visible:ring-1 focus-visible:ring-[--p] focus-visible:bg-white',
].join(' ');

const selectCls = [
  'h-7 rounded-md border border-gray-200 bg-slate-50 px-2.5',
  'text-[11px] font-medium text-slate-800 outline-none appearance-none cursor-pointer',
  'transition focus-visible:border-[--p] focus-visible:ring-1 focus-visible:ring-[--p] focus-visible:bg-white',
].join(' ');

function SkeletonRow({ i }) {
  return (
    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
      <td className="px-4 py-2.5"><div className="h-2.5 w-4 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-4 py-2.5"><div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-4 py-2.5"><div className="h-2.5 w-8 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-4 py-2.5"><div className="h-2.5 w-28 animate-pulse rounded bg-slate-100" /></td>
      <td className="px-4 py-2.5 text-center"><div className="mx-auto h-5 w-5 animate-pulse rounded bg-slate-100" /></td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-14">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: primaryLt }}>
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="9" height="9" rx="1" />
          <rect x="13" y="2" width="9" height="5" rx="1" />
          <rect x="2" y="13" width="9" height="9" rx="1" />
          <rect x="13" y="10" width="9" height="11" rx="1" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-slate-600">No sub groups yet</p>
        <p className="mt-0.5 text-[9px] text-slate-400">Select a group above and add sub groups to it.</p>
      </div>
    </div>
  );
}

const emptyForm = () => ({ carGroupId: '', carSubGroupName: '' });

export default function CarSubGroupEntry() {
  const [form, setForm]           = useState(emptyForm());
  const [groups, setGroups]       = useState([]);
  const [list, setList]           = useState([]);
  const [filterGroupId, setFilterGroupId] = useState('');
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [fadingId, setFadingId]   = useState(null);
  const nameRef = useRef(null);

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await httpClient.get('/api/garage/car-groups');
      setGroups(data.carGroups || []);
    } catch {
      /* silent — user will see empty dropdown */
    }
  }, []);

  const fetchSubGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await httpClient.get('/api/garage/car-sub-groups');
      setList(data.carSubGroups || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load sub groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchSubGroups();
  }, [fetchGroups, fetchSubGroups]);

  const handleNew = () => {
    setForm(emptyForm());
    setError('');
    setConfirmId(null);
    nameRef.current?.focus();
  };

  const handleSave = async () => {
    if (!form.carGroupId)       { setError('Please select a group');      return; }
    if (!form.carSubGroupName.trim()) { setError('Sub group name is required'); return; }
    setError('');
    setSaving(true);
    try {
      await httpClient.post('/api/garage/car-sub-groups', {
        carGroupId:      Number(form.carGroupId),
        carSubGroupName: form.carSubGroupName.trim(),
      });
      setForm((p) => ({ ...p, carSubGroupName: '' }));
      await fetchSubGroups();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save sub group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carSubGroupId) => {
    setFadingId(carSubGroupId);
    await new Promise((r) => setTimeout(r, 180));
    try {
      await httpClient.delete(`/api/garage/car-sub-groups/${carSubGroupId}`);
      setList((prev) => prev.filter((s) => s.carSubGroupId !== carSubGroupId));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete sub group');
    } finally {
      setFadingId(null);
      setConfirmId(null);
    }
  };

  const displayed = filterGroupId
    ? list.filter((s) => String(s.carGroupId) === filterGroupId)
    : list;

  const arrowSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

  return (
    <div className="flex h-full min-h-0 flex-col -mx-[13px] w-[calc(100%+26px)] overflow-hidden bg-white">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: primaryLt }}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <rect x="13" y="2" width="9" height="5" rx="1" />
              <rect x="2" y="13" width="9" height="9" rx="1" />
              <rect x="13" y="10" width="9" height="11" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-[11px] font-bold uppercase tracking-widest leading-none" style={{ color: primary }}>
              Car Sub Group Master
            </h1>
            <p className="mt-0.5 text-[9px] font-normal text-slate-400 leading-none">Sub classifications under each group</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={handleNew} className={outlineBtn} style={{ '--tw-ring-color': primary }}>
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
        <div className="flex flex-wrap items-end gap-4">
          {/* Group selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Car Group <span className="text-red-400">*</span>
            </label>
            <select
              value={form.carGroupId}
              onChange={(e) => setForm((p) => ({ ...p, carGroupId: e.target.value }))}
              className={`${selectCls} w-44 pr-7`}
              style={{
                '--p': primary,
                backgroundImage: arrowSvg,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value="">— Select Group —</option>
              {groups.map((g) => (
                <option key={g.carGroupId} value={g.carGroupId}>{g.carGroupName}</option>
              ))}
            </select>
          </div>

          {/* Code (readonly) */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Code</label>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              placeholder="Auto"
              value=""
              className="h-7 w-16 rounded-md border border-gray-200 bg-slate-100 px-2.5 text-center text-[10px] font-mono text-slate-400 outline-none cursor-default"
            />
          </div>

          {/* Sub group name */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Sub Group Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={form.carSubGroupName}
              onChange={(e) => setForm((p) => ({ ...p, carSubGroupName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. COMPACT, LUXURY…"
              className={`${inputCls} w-56`}
              style={{ '--p': primary }}
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 pb-0.5 text-[10px] font-medium text-red-500">
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

      {/* ── Filter bar ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-5 py-2">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Filter:</span>
        <select
          value={filterGroupId}
          onChange={(e) => setFilterGroupId(e.target.value)}
          className="h-6 rounded border border-gray-200 bg-white px-2 text-[10px] text-slate-600 outline-none appearance-none cursor-pointer"
          style={{
            backgroundImage: arrowSvg,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
            paddingRight: '22px',
          }}
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g.carGroupId} value={g.carGroupId}>{g.carGroupName}</option>
          ))}
        </select>
        {filterGroupId && (
          <span className="text-[9px] text-slate-400">{displayed.length} sub group{displayed.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ── List ── */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: primary }}>
              {['#', 'Group', 'Code', 'Sub Group Name', 'Action'].map((h, i) => (
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
            {loading && Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} i={i} />)}

            {!loading && displayed.length === 0 && (
              <tr><td colSpan={5}><EmptyState /></td></tr>
            )}

            {!loading && displayed.map((s, i) => {
              const isConfirm = confirmId === s.carSubGroupId;
              const isFading  = fadingId  === s.carSubGroupId;
              return (
                <tr
                  key={s.carSubGroupId}
                  className={[
                    'border-b border-gray-50 transition-all duration-200',
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                    isConfirm ? 'bg-red-50/80' : 'hover:bg-[--pl]',
                    isFading ? 'opacity-0 scale-y-0 origin-top' : 'opacity-100',
                  ].join(' ')}
                  style={{ '--pl': primaryLt }}
                >
                  <td className="px-4 py-2.5 text-[10px] tabular-nums text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: primaryLt, color: primary }}>
                      {s.carGroupName || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px] font-semibold text-slate-500">{s.carSubGroupId}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{s.carSubGroupName}</td>
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
                          onClick={() => handleDelete(s.carSubGroupId)}
                          className="h-5 rounded bg-red-500 px-1.5 text-[9px] font-semibold text-white hover:bg-red-600 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                        >
                          Delete
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(s.carSubGroupId)}
                        className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-300"
                        title="Delete"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
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
