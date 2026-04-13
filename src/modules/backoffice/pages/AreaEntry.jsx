import { useEffect, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import { getSessionCompany, getSessionUser } from '../../../core/auth/auth.service.js';
import * as areaEntryApi from '../../../services/areaEntry.api.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';

const SUPPLY_TYPE_OPTIONS = [
  { value: 'GENERAL', label: 'General' },
  { value: 'DINE_IN', label: 'Dine in' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PARCEL', label: 'Parcel' },
  { value: 'TAKEAWAY', label: 'Takeaway' },
];

const TABLET_SHOW_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export default function AreaEntry() {
  const primary = colors.primary?.main || '#790728';
  const company = getSessionCompany();
  const user = getSessionUser();

  const [form, setForm] = useState({
    branchId: '',
    areaName: '',
    areaNameArabic: '',
    supplyType: 'GENERAL',
    kotPrefix: '',
    isTabletShow: 'true',
  });
  const [branches, setBranches] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);

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
        const stationInList = list.some((b) => String(b.branchId) === station);
        if (list.length === 1) {
          setForm((prev) => ({ ...prev, branchId: String(list[0].branchId) }));
        } else if (stationInList) {
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

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.branchId),
        label: `${b.branchCode} — ${b.branchName}`,
      })),
    [branches]
  );

  const handleSave = async () => {
    const name = form.areaName.trim();
    if (!name) {
      setSaveError('Enter an area name.');
      return;
    }
    if (!form.branchId) {
      setSaveError('Select a branch.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSuccess('');
    try {
      const { data } = await areaEntryApi.createArea({
        branchId: Number(form.branchId),
        areaName: name,
        areaNameArabic: form.areaNameArabic.trim() || undefined,
        supplyType: form.supplyType,
        kotPrefix: form.kotPrefix.trim() || undefined,
        isTabletShow: form.isTabletShow === 'true',
      });
      setSuccess(`Saved area “${data.areaName}” (branch ${data.branchId}, id ${data.areaId}).`);
      setForm((prev) => ({
        ...prev,
        areaName: '',
        areaNameArabic: '',
        kotPrefix: '',
        supplyType: 'GENERAL',
        isTabletShow: 'true',
      }));
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save area.');
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
      <span className="text-red-600" aria-hidden>
        *
      </span>
    </span>
  );

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col overflow-x-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md">
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
                    <span className="mx-2 text-gray-300" aria-hidden>
                      /
                    </span>
                    <span style={{ color: primary }}>Area</span>
                  </nav>
                  <h1 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    Add dining / service area
                  </h1>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Define a POS area (e.g. Dining, VIP, Delivery) for a branch. Names must be unique per branch.
                    Company is taken from your login token.
                  </p>
                </div>
                <div
                  className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 sm:text-[11px]"
                  style={{ borderColor: `${primary}66`, backgroundColor: surfaceTint }}
                >
                  New area
                </div>
              </div>

              {company ? (
                <p className="mt-4 rounded-lg border border-gray-200/80 bg-slate-50/80 px-3 py-2 text-[10px] text-slate-700 sm:text-xs">
                  <span className="font-semibold text-gray-800">Company:</span> {company.companyName}{' '}
                  <span className="text-slate-500">(id {company.companyId})</span>
                  {user?.stationId != null ? (
                    <>
                      {' '}
                      · <span className="font-semibold text-gray-800">Your branch:</span> {company.stationName}{' '}
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

        <div className="bg-slate-50/40 px-4 py-5 sm:px-8 sm:py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
            <div className="min-w-0 flex-1">
              <section
                className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
                aria-labelledby="area-entry-form-heading"
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
                    <h2 id="area-entry-form-heading" className="text-sm font-semibold text-gray-900 sm:text-base">
                      Area details
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 p-4 sm:space-y-4 sm:p-5">
                  <div className="mx-auto max-w-xl space-y-3.5 sm:space-y-4">
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
                      <InputField
                        label={req('Area name')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.areaName}
                        onChange={(e) => update('areaName', e.target.value)}
                      />
                      <DropdownInput
                        label={req('Supply type')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.supplyType}
                        onChange={(v) => update('supplyType', v)}
                        options={SUPPLY_TYPE_OPTIONS}
                        placeholder="Select"
                      />
                      <DropdownInput
                        label="Show on tablet POS"
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.isTabletShow}
                        onChange={(v) => update('isTabletShow', v)}
                        options={TABLET_SHOW_OPTIONS}
                        placeholder="Select"
                      />
                      <InputField
                        label="KOT prefix (optional)"
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.kotPrefix}
                        onChange={(e) => update('kotPrefix', e.target.value)}
                      />
                    </div>
                    <div className="flex min-w-0 w-full max-w-full flex-col gap-1">
                      <label
                        className="text-sm font-medium leading-snug text-gray-700 sm:text-[0.9375rem]"
                        style={{ color: inputField.label.color }}
                        htmlFor="area-name-ar"
                      >
                        Area name (Arabic)
                      </label>
                      <textarea
                        id="area-name-ar"
                        rows={2}
                        value={form.areaNameArabic}
                        onChange={(e) => update('areaNameArabic', e.target.value)}
                        className="box-border w-full max-w-full resize-y border border-gray-200 px-2.5 py-2 !text-base leading-normal text-gray-900 outline-none transition-[box-shadow] placeholder:text-gray-400 placeholder:text-base focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#790728]/25 focus-visible:ring-offset-1"
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
            </div>

            <aside className="w-full shrink-0 xl:w-[min(100%,320px)] xl:pt-1" aria-label="Area entry tips">
              <div
                className="rounded-2xl border border-gray-200 p-5 shadow-md ring-1 ring-black/[0.04] sm:p-6 xl:sticky xl:top-2"
                style={{
                  background: `linear-gradient(165deg, #ffffff 0%, ${surfaceTint} 88%)`,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: primary }} aria-hidden />
                  <p className="text-sm font-semibold text-gray-900">Before you save</p>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                  <span className="font-medium text-gray-800">Area name</span> must be unique within the selected
                  branch. Supply type drives POS behaviour (dine-in vs delivery, etc.) per Moifone{' '}
                  <code className="rounded bg-gray-100 px-1 text-[10px] sm:text-xs">core.area_master</code>.
                </p>
                <ul className="mt-4 space-y-2.5 border-t border-gray-200/80 pt-4 text-xs text-gray-700 sm:text-sm">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    KOT prefix is optional; use it if kitchen tickets should carry a short code per area.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    Tablet visibility controls whether the area appears on tablet POS layouts.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>

        <div
          className="shrink-0 border-t border-gray-200/80 bg-white px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-8 sm:py-3.5"
          style={{ boxShadow: `inset 0 3px 0 0 ${surfaceTint}` }}
        >
          <p className="mb-3 hidden text-xs text-gray-500 sm:mb-0 sm:block lg:max-w-md">
            <span className="font-medium text-gray-700">Required:</span> branch, area name, supply type (
            <span className="text-red-600">*</span>).
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
              disabled={saving || loadingBranches || !branches.length || !form.branchId}
              onClick={handleSave}
              className="inline-flex w-full items-center justify-center rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-[opacity,transform,box-shadow] hover:opacity-95 hover:shadow-lg active:scale-[0.99] active:opacity-90 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[168px]"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving…' : 'Save area'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
