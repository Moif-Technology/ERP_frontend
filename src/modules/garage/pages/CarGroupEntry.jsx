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

function SkeletonRow({ i }) {
  return (
    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
      <td className="px-4 py-2.5"><div className="h-2.5 w-4 animate-pulse rounded bg-slate-100" /></td>
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
          <rect x="13" y="2" width="9" height="9" rx="1" />
          <rect x="2" y="13" width="9" height="9" rx="1" />
          <rect x="13" y="13" width="9" height="9" rx="1" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-slate-600">No car groups yet</p>
        <p className="mt-0.5 text-[9px] text-slate-400">Add your first group above. Sub groups link to these.</p>
      </div>
    </div>
  );
}

const emptyForm = () => ({ carGroupName: '' });

export default function CarGroupEntry() {
  const [form, setForm]         = useState(emptyForm());
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [fadingId, setFadingId]   = useState(null);
  const nameRef = useRef(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await httpClient.get('/api/garage/car-groups');
      setList(data.carGroups || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load car groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleNew = () => {
    setForm(emptyForm());
    setError('');
    setConfirmId(null);
    nameRef.current?.focus();
  };

  const handleSave = async () => {
    if (!form.carGroupName.trim()) { setError('Group name is required'); return; }
    setError('');
    setSaving(true);
    try {
      await httpClient.post('/api/garage/car-groups', { carGroupName: form.carGroupName.trim() });
      setForm(emptyForm());
      await fetchGroups();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save car group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carGroupId) => {
    setFadingId(carGroupId);
    await new Promise((r) => setTimeout(r, 180));
    try {
      await httpClient.delete(`/api/garage/car-groups/${carGroupId}`);
      setList((prev) => prev.filter((g) => g.carGroupId !== carGroupId));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete car group');
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
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: primaryLt }}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <rect x="13" y="2" width="9" height="9" rx="1" />
              <rect x="2" y="13" width="9" height="9" rx="1" />
              <rect x="13" y="13" width="9" height="9" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-[11px] font-bold uppercase tracking-widest leading-none" style={{ color: primary }}>
              Car Group Master
            </h1>
            <p className="mt-0.5 text-[9px] font-normal text-slate-400 leading-none">Vehicle classification groups</p>
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

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Group Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={form.carGroupName}
              onChange={(e) => setForm({ carGroupName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. SEDAN, SUV, TRUCK…"
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

      {/* ── List ── */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: primary }}>
              {['#', 'Code', 'Group Name', 'Action'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2 text-[8.5px] font-bold uppercase tracking-widest text-white/90 ${i === 3 ? 'text-center' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} i={i} />)}

            {!loading && list.length === 0 && (
              <tr><td colSpan={4}><EmptyState /></td></tr>
            )}

            {!loading && list.map((g, i) => {
              const isConfirm = confirmId === g.carGroupId;
              const isFading  = fadingId  === g.carGroupId;
              return (
                <tr
                  key={g.carGroupId}
                  className={[
                    'border-b border-gray-50 transition-all duration-200',
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60',
                    isConfirm ? 'bg-red-50/80' : 'hover:bg-[--pl]',
                    isFading ? 'opacity-0 scale-y-0 origin-top' : 'opacity-100',
                  ].join(' ')}
                  style={{ '--pl': primaryLt }}
                >
                  <td className="px-4 py-2.5 text-[10px] tabular-nums text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] font-semibold text-slate-500">{g.carGroupId}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{g.carGroupName}</td>
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
                          onClick={() => handleDelete(g.carGroupId)}
                          className="h-5 rounded bg-red-500 px-1.5 text-[9px] font-semibold text-white hover:bg-red-600 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                        >
                          Delete
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(g.carGroupId)}
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
