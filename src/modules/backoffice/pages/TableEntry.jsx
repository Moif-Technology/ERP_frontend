import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
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
    return () => {
      cancelled = true;
    };
  }, [user?.stationId]);

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
    return () => {
      cancelled = true;
    };
  }, [form.branchId]);

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
    return () => {
      cancelled = true;
    };
  }, [form.branchId, form.areaId]);

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: String(b.branchId), label: `${b.branchCode} - ${b.branchName}` })),
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
      setSuccess(`Saved table "${data.tableName}" (No. ${data.tableNo}) in area id ${data.areaId}.`);
      setTables((prev) => [...prev, data]);
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

  const fieldHeight = 34;
  const inputClass =
    'rounded-md px-2.5 !text-[14px] font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#79072820] disabled:cursor-not-allowed disabled:opacity-60';
  const labelClassName =
    '!flex !h-4 !items-center !truncate !text-[11px] !font-bold !uppercase !leading-4 !tracking-[0.12em] !text-slate-500';
  const cardStyle = 'rounded-lg border border-slate-200 bg-white shadow-sm';
  const sectionTitle = 'text-[12px] font-bold uppercase tracking-[0.16em] text-slate-700';
  const sectionSubtle = 'text-[11px] font-medium text-slate-500';
  const primaryButton =
    'inline-flex h-8 cursor-pointer items-center justify-center rounded-md px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white shadow-sm transition duration-200 ease-out hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#79072830] disabled:cursor-not-allowed disabled:opacity-60';

  const req = (text) => (
    <span className="inline-flex items-center gap-1">
      {text}
      <span className="text-red-600" aria-hidden>
        *
      </span>
    </span>
  );

  const formatBadgeColor = {
    SQUARE: 'bg-blue-50 text-blue-700 border-blue-200',
    ROUND: 'bg-purple-50 text-purple-700 border-purple-200',
    RECTANGLE: 'bg-amber-50 text-amber-700 border-amber-200',
    CUSTOM: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <span>Data Entry</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700">Tables</span>
              </nav>
              <h1 className="mt-1 text-[18px] font-bold leading-tight text-slate-900">Table Entry</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {loadError ? (
                <span className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-800" role="alert">
                  {loadError}
                </span>
              ) : null}
              {areasError ? (
                <span className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-800" role="alert">
                  {areasError}
                </span>
              ) : null}
              {saveError ? (
                <span className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-700" role="alert">
                  {saveError}
                </span>
              ) : null}
              {success ? (
                <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700" role="status" aria-live="polite">
                  {success}
                </span>
              ) : null}
              <button
                type="button"
                disabled={saving || loadingBranches || !form.branchId || !form.areaId}
                onClick={handleSave}
                className={primaryButton}
                style={{ backgroundColor: primary }}
              >
                {saving ? 'Saving...' : 'Save table'}
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#faf8f9] p-3">
          <div className="grid min-h-full grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-3">
              <section className={`${cardStyle} overflow-hidden`}>
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className={sectionTitle}>Table Details</p>
                  <p className={sectionSubtle}>Create a physical table inside a POS area.</p>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                    <DropdownInput
                      label={req('Branch')}
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.branchId}
                      onChange={(v) => update('branchId', v)}
                      options={branchOptions}
                      placeholder={loadingBranches ? 'Loading branches...' : branches.length ? 'Select branch' : 'No branches'}
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
                            ? 'Loading areas...'
                            : areas.length
                              ? 'Select area'
                              : 'No areas for this branch'
                      }
                    />

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
                      placeholder="e.g. T1"
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

                    <div className="md:col-span-2 xl:col-span-3">
                      <label
                        className="mb-1 flex h-4 items-center truncate text-[11px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-500"
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
                        className="box-border h-[34px] w-full max-w-full rounded-md border border-slate-200 bg-white px-2.5 !text-[14px] font-medium text-slate-800 outline-none transition duration-200 ease-out placeholder:font-normal placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#79072820] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[12px] font-semibold leading-5 text-slate-600">
                      Required fields are marked with an asterisk. Table number and name must be unique within the selected area.
                    </p>
                  </div>
                </div>
              </section>

              {form.areaId ? (
                <section className={`${cardStyle} overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div>
                      <p className={sectionTitle}>Tables In This Area</p>
                      <p className={sectionSubtle}>Recently loaded and newly added tables.</p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {loadingTables ? 'Loading' : `${tables.length} table${tables.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {!loadingTables && tables.length === 0 ? (
                    <p className="px-5 py-6 text-center text-[13px] font-medium text-slate-400">
                      No tables yet for this area. Add one above.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-[13px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">No.</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Name</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Arabic</th>
                            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Chairs</th>
                            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Shape</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tables.map((t) => (
                            <tr key={t.tableId ?? t.id} className="transition duration-200 ease-out hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-semibold text-slate-700">{t.tableNo}</td>
                              <td className="px-4 py-2.5 font-medium text-slate-800">{t.tableName}</td>
                              <td className="px-4 py-2.5 text-slate-500" dir="rtl">{t.tableNameArabic || '-'}</td>
                              <td className="px-4 py-2.5 text-center font-medium text-slate-700">{t.noOfChairs}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${formatBadgeColor[t.tableFormat] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
            </main>

            <aside className={`${cardStyle} overflow-hidden`} aria-label="Table entry context">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className={sectionTitle}>Context</p>
                <p className={sectionSubtle}>Company, branch, area, and table shape guidance.</p>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Company</p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-800">{company?.companyName || 'Current company'}</p>
                  {company?.companyId != null ? (
                    <p className="mt-0.5 text-[12px] font-medium text-slate-500">ID {company.companyId}</p>
                  ) : null}
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Loaded areas</p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-800">{areas.length}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-500">Areas are loaded from the selected branch.</p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[12px] font-semibold leading-5 text-slate-600">
                    Create areas first in Area Entry before adding restaurant tables.
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Shape legend</p>
                  <div className="flex flex-wrap gap-2">
                    {TABLE_FORMAT_OPTIONS.map((opt) => (
                      <span
                        key={opt.value}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${formatBadgeColor[opt.value]}`}
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
      </div>
    </div>
  );
}
