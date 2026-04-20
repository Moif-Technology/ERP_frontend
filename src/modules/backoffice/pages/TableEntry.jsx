import { useEffect, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import { getSessionCompany, getSessionUser } from '../../../core/auth/auth.service.js';
import * as tableEntryApi from '../../../services/tableEntry.api.js';
import * as areaEntryApi from '../../../services/areaEntry.api.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';

const TABLE_FORMAT_OPTIONS = [
  { value: 'SQUARE', label: 'Square' },
  { value: 'ROUND', label: 'Round' },
  { value: 'RECTANGLE', label: 'Rectangle' },
  { value: 'CUSTOM', label: 'Custom' },
];

const CHAIRS_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} chair${i + 1 === 1 ? '' : 's'}`,
}));

export default function TableEntry() {
  const primary = colors.primary?.main || '#790728';
  const company = getSessionCompany();
  const user = getSessionUser();

  const [form, setForm] = useState({
    branchId: '',
    areaId: '',
    tableNo: '',
    tableName: '',
    tableNameArabic: '',
    noOfChairs: '4',
    tableFormat: 'SQUARE',
  });

  const [branches, setBranches] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tables, setTables] = useState([]);

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [areasError, setAreasError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError('');
    setSuccess('');
  };

  // ── Load branches on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      setLoadError('');
      try {
        const { data } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        const list = data.branches || [];
        setBranches(list);
        const station = user?.stationId != null ? String(user.stationId) : '';
        const inList = list.some((b) => String(b.branchId) === station);
        if (list.length === 1) {
          setForm((prev) => ({ ...prev, branchId: String(list[0].branchId) }));
        } else if (inList) {
          setForm((prev) => ({ ...prev, branchId: station }));
        }
      } catch {
        if (!cancelled) setLoadError('Could not load branches. Check API and login.');
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.stationId]);

  // ── Load areas when branch changes ─────────────────────────────────────
  useEffect(() => {
    if (!form.branchId) {
      setAreas([]);
      setTables([]);
      setForm((prev) => ({ ...prev, areaId: '' }));
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingAreas(true);
      setAreasError('');
      setAreas([]);
      setTables([]);
      setForm((prev) => ({ ...prev, areaId: '' }));
      try {
        const { data } = await areaEntryApi.fetchAreas(form.branchId);
        if (cancelled) return;
        const list = data.areas || [];
        setAreas(list);
        if (list.length === 1) {
          setForm((prev) => ({ ...prev, areaId: String(list[0].areaId) }));
        }
      } catch {
        if (!cancelled) setAreasError('Could not load areas for this branch.');
      } finally {
        if (!cancelled) setLoadingAreas(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form.branchId]);

  // ── Load existing tables when area changes ─────────────────────────────
  useEffect(() => {
    if (!form.branchId || !form.areaId) {
      setTables([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingTables(true);
      setTables([]);
      try {
        const { data } = await tableEntryApi.fetchTables(form.branchId, form.areaId);
        if (cancelled) return;
        setTables(data.tables || []);
      } catch {
        if (!cancelled) setTables([]);
      } finally {
        if (!cancelled) setLoadingTables(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form.branchId, form.areaId]);

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: String(b.branchId), label: `${b.branchCode} — ${b.branchName}` })),
    [branches]
  );

  const areaOptions = useMemo(
    () => areas.map((a) => ({ value: String(a.areaId), label: a.areaName })),
    [areas]
  );

  const handleSave = async () => {
    const tableNo = Number(form.tableNo);
    if (!form.tableNo || isNaN(tableNo) || tableNo < 1) {
      setSaveError('Enter a valid table number (1 or higher).');
      return;
    }
    const tableName = form.tableName.trim();
    if (!tableName) {
      setSaveError('Enter a table name.');
      return;
    }
    if (!form.branchId) {
      setSaveError('Select a branch.');
      return;
    }
    if (!form.areaId) {
      setSaveError('Select an area.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSuccess('');
    try {
      const { data } = await tableEntryApi.createTable({
        branchId: Number(form.branchId),
        areaId: Number(form.areaId),
        tableNo,
        tableName,
        tableNameArabic: form.tableNameArabic.trim() || undefined,
        noOfChairs: Number(form.noOfChairs) || 4,
        tableFormat: form.tableFormat,
      });
      setSuccess(
        `Saved table "${data.tableName}" (No. ${data.tableNo}) in area id ${data.areaId}.`
      );
      // Add to displayed list
      setTables((prev) => [...prev, data]);
      // Reset only table-specific fields
      setForm((prev) => ({
        ...prev,
        tableNo: '',
        tableName: '',
        tableNameArabic: '',
        noOfChairs: '4',
        tableFormat: 'SQUARE',
      }));
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save table.');
    } finally {
      setSaving(false);
    }
  };

  const boxRadius = inputField.box.borderRadius;
  const surfaceTint = colors.primary?.[50] || '#F2E6EA';
  const fieldHeight = 36;
  const inputClass =
    '!text-base placeholder:text-gray-400 transition-[box-shadow] focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#790728]/25 focus-visible:ring-offset-1 disabled:opacity-60';
  const labelClassName = '!text-sm !font-medium !text-gray-700 !leading-snug sm:!text-[0.9375rem]';

  const req = (text) => (
    <span className="inline-flex items-center gap-1">
      {text}
      <span className="text-red-600" aria-hidden>*</span>
    </span>
  );

  const formatBadgeColor = {
    SQUARE: 'bg-blue-50 text-blue-700 border-blue-200',
    ROUND: 'bg-purple-50 text-purple-700 border-purple-200',
    RECTANGLE: 'bg-amber-50 text-amber-700 border-amber-200',
    CUSTOM: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col overflow-x-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md">

        {/* ── Header ── */}
        <div className="shrink-0 border-b border-gray-100 bg-gradient-to-br from-white via-white to-slate-50/40 px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex gap-4 sm:gap-5">
            <div
              className="w-1 shrink-0 rounded-full sm:w-1.5"
              style={{ backgroundColor: primary }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <nav className="text-[11px] font-medium text-gray-500 sm:text-xs" aria-label="Breadcrumb">
                    <span>Data entry</span>
                    <span className="mx-2 text-gray-300" aria-hidden>/</span>
                    <span style={{ color: primary }}>Table</span>
                  </nav>
                  <h1 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    Add restaurant table
                  </h1>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Define a physical table inside a POS area. Table numbers and names must be unique within the area.
                    Company is taken from your login token.
                  </p>
                </div>
                <div
                  className="shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 sm:text-[11px]"
                  style={{ borderColor: `${primary}66`, backgroundColor: surfaceTint }}
                >
                  New table
                </div>
              </div>

              {company ? (
                <p className="mt-4 rounded-lg border border-gray-200/80 bg-slate-50/80 px-3 py-2 text-[10px] text-slate-700 sm:text-xs">
                  <span className="font-semibold text-gray-800">Company:</span> {company.companyName}{' '}
                  <span className="text-slate-500">(id {company.companyId})</span>
                  {user?.stationId != null ? (
                    <>
                      {' '}·{' '}
                      <span className="font-semibold text-gray-800">Your branch:</span> {company.stationName}{' '}
                      <span className="text-slate-500">(branch id {user.stationId})</span>
                    </>
                  ) : null}
                </p>
              ) : null}

              {loadError ? (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {loadError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="bg-slate-50/40 px-4 py-5 sm:px-8 sm:py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">

            {/* Left: form */}
            <div className="min-w-0 flex-1 space-y-5">

              {/* Section 1 – Branch & Area */}
              <section
                className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
                aria-labelledby="table-branch-area-heading"
              >
                <div
                  className="flex items-center gap-3 border-b border-gray-200/90 px-4 py-3 sm:px-5 sm:py-3.5"
                  style={{ backgroundColor: surfaceTint }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                    aria-hidden
                  >
                    1
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Step</p>
                    <h2 id="table-branch-area-heading" className="text-sm font-semibold text-gray-900 sm:text-base">
                      Select branch &amp; area
                    </h2>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="mx-auto max-w-xl">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <DropdownInput
                        label={req('Branch')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.branchId}
                        onChange={(v) => update('branchId', v)}
                        options={branchOptions}
                        placeholder={
                          loadingBranches ? 'Loading branches…' : branches.length ? 'Select branch' : 'No branches'
                        }
                      />
                      <DropdownInput
                        label={req('Area')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.areaId}
                        onChange={(v) => update('areaId', v)}
                        options={areaOptions}
                        placeholder={
                          !form.branchId
                            ? 'Select branch first'
                            : loadingAreas
                            ? 'Loading areas…'
                            : areas.length
                            ? 'Select area'
                            : 'No areas for this branch'
                        }
                      />
                    </div>
                    {areasError ? (
                      <p className="mt-2 text-xs text-amber-700">{areasError}</p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Section 2 – Table details */}
              <section
                className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
                aria-labelledby="table-details-heading"
              >
                <div
                  className="flex items-center gap-3 border-b border-gray-200/90 px-4 py-3 sm:px-5 sm:py-3.5"
                  style={{ backgroundColor: surfaceTint }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                    aria-hidden
                  >
                    2
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Step</p>
                    <h2 id="table-details-heading" className="text-sm font-semibold text-gray-900 sm:text-base">
                      Table details
                    </h2>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="mx-auto max-w-xl space-y-3.5 sm:space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <InputField
                        label={req('Table number')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.tableNo}
                        onChange={(e) => update('tableNo', e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 1"
                        type="text"
                        inputMode="numeric"
                      />
                      <InputField
                        label={req('Table name')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.tableName}
                        onChange={(e) => update('tableName', e.target.value)}
                        placeholder="e.g. T1 or Window Table"
                      />
                      <DropdownInput
                        label={req('No. of chairs')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.noOfChairs}
                        onChange={(v) => update('noOfChairs', v)}
                        options={CHAIRS_OPTIONS}
                        placeholder="Select"
                      />
                      <DropdownInput
                        label={req('Table shape')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.tableFormat}
                        onChange={(v) => update('tableFormat', v)}
                        options={TABLE_FORMAT_OPTIONS}
                        placeholder="Select"
                      />
                    </div>

                    <div className="flex min-w-0 w-full max-w-full flex-col gap-1">
                      <label
                        className="text-sm font-medium leading-snug text-gray-700 sm:text-[0.9375rem]"
                        style={{ color: inputField.label.color }}
                        htmlFor="table-name-ar"
                      >
                        Table name (Arabic)
                      </label>
                      <input
                        id="table-name-ar"
                        type="text"
                        dir="rtl"
                        value={form.tableNameArabic}
                        onChange={(e) => update('tableNameArabic', e.target.value)}
                        placeholder="اسم الطاولة"
                        className="box-border h-9 w-full max-w-full border border-gray-200 px-2.5 !text-base text-gray-900 outline-none transition-[box-shadow] placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#790728]/25 focus-visible:ring-offset-1"
                        style={{
                          background: colors.input?.background ?? '#fff',
                          borderColor: '#e2e8f0',
                          borderRadius: boxRadius,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 – Existing tables list */}
              {form.areaId ? (
                <section
                  className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
                  aria-labelledby="table-list-heading"
                >
                  <div
                    className="flex items-center justify-between gap-3 border-b border-gray-200/90 px-4 py-3 sm:px-5 sm:py-3.5"
                    style={{ backgroundColor: surfaceTint }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: primary }}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Saved</p>
                        <h2 id="table-list-heading" className="text-sm font-semibold text-gray-900 sm:text-base">
                          Tables in this area
                        </h2>
                      </div>
                    </div>
                    {loadingTables ? (
                      <span className="text-xs text-gray-400">Loading…</span>
                    ) : (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: `${primary}18`, color: primary }}
                      >
                        {tables.length} table{tables.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {!loadingTables && tables.length === 0 ? (
                    <p className="px-5 py-6 text-center text-sm text-gray-400">
                      No tables yet for this area. Add one above.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-slate-50/70">
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">No.</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">Name</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">Arabic</th>
                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">Chairs</th>
                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">Shape</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {tables.map((t) => (
                            <tr key={t.tableId ?? t.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-2.5 font-semibold text-gray-700">{t.tableNo}</td>
                              <td className="px-4 py-2.5 text-gray-800">{t.tableName}</td>
                              <td className="px-4 py-2.5 text-gray-500" dir="rtl">{t.tableNameArabic || '—'}</td>
                              <td className="px-4 py-2.5 text-center text-gray-700">{t.noOfChairs}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span
                                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${formatBadgeColor[t.tableFormat] ?? 'bg-gray-100 text-gray-600'}`}
                                >
                                  {t.tableFormat}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ) : null}
            </div>

            {/* Right: tips */}
            <aside className="w-full shrink-0 xl:w-[min(100%,320px)] xl:pt-1" aria-label="Table entry tips">
              <div
                className="rounded-2xl border border-gray-200 p-5 shadow-md ring-1 ring-black/[0.04] sm:p-6 xl:sticky xl:top-2"
                style={{ background: `linear-gradient(165deg, #ffffff 0%, ${surfaceTint} 88%)` }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: primary }} aria-hidden />
                  <p className="text-sm font-semibold text-gray-900">Before you save</p>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                  <span className="font-medium text-gray-800">Table number</span> and{' '}
                  <span className="font-medium text-gray-800">table name</span> must both be unique within the selected
                  area. This data feeds directly into the Flutter POS table-selection dialog.
                </p>
                <ul className="mt-4 space-y-2.5 border-t border-gray-200/80 pt-4 text-xs text-gray-700 sm:text-sm">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    Create your <strong>areas first</strong> (Area entry) before adding tables.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    <strong>Table shape</strong> (Round / Square / Rectangle) controls how tables are drawn in the POS floor view.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    <strong>No. of chairs</strong> sets the seat count visible to waiters on the POS.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    You can keep adding tables for the same area without re-selecting branch/area.
                  </li>
                </ul>

                {/* Shape legend */}
                <div className="mt-5 border-t border-gray-200/80 pt-4">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Shape legend</p>
                  <div className="flex flex-wrap gap-2">
                    {TABLE_FORMAT_OPTIONS.map((opt) => (
                      <span
                        key={opt.value}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${formatBadgeColor[opt.value]}`}
                      >
                        {opt.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Footer / Save bar ── */}
        <div
          className="shrink-0 border-t border-gray-200/80 bg-white px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-8 sm:py-3.5"
          style={{ boxShadow: `inset 0 3px 0 0 ${surfaceTint}` }}
        >
          <p className="mb-3 hidden text-xs text-gray-500 sm:mb-0 sm:block lg:max-w-md">
            <span className="font-medium text-gray-700">Required:</span> branch, area, table number, name, chairs, shape{' '}
            (<span className="text-red-600">*</span>).
          </p>
          <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md sm:items-end">
            {saveError ? (
              <p
                className="w-full rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800 sm:text-sm"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}
            {success ? (
              <p
                className="w-full rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 sm:text-sm"
                role="status"
                aria-live="polite"
              >
                {success}
              </p>
            ) : null}
            <button
              type="button"
              disabled={saving || loadingBranches || !form.branchId || !form.areaId}
              onClick={handleSave}
              className="inline-flex w-full items-center justify-center rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-[opacity,transform,box-shadow] hover:opacity-95 hover:shadow-lg active:scale-[0.99] active:opacity-90 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[168px]"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving…' : 'Save table'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
