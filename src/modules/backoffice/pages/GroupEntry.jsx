import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import { getSessionCompany, getSessionUser } from '../../../core/auth/auth.service.js';
import * as groupEntryApi from '../../../services/groupEntry.api.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';

export default function GroupEntry() {
  const primary = colors.primary?.main || '#790728';
  const company = getSessionCompany();
  const user = getSessionUser();

  const [form, setForm] = useState({
    branchId: '',
    groupCode: '',
    groupDescription: '',
    groupDescriptionArabic: '',
    keyCode: '',
    keyShift: '',
  });
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [groupsError, setGroupsError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);

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
        label: `${b.branchCode} - ${b.branchName}`,
      })),
    [branches]
  );

  useEffect(() => {
    const bid = form.branchId;
    if (!bid) {
      setGroups([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingGroups(true);
      setGroupsError('');
      try {
        const { data } = await groupEntryApi.fetchGroups(Number(bid));
        if (cancelled) return;
        setGroups(data.groups || []);
      } catch {
        if (!cancelled) {
          setGroups([]);
          setGroupsError('Could not load groups for this branch.');
        }
      } finally {
        if (!cancelled) setLoadingGroups(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.branchId]);

  const handleSave = async () => {
    const code = form.groupCode.trim();
    if (!code) {
      setSaveError('Enter a group code.');
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
      const { data } = await groupEntryApi.createGroup({
        branchId: Number(form.branchId),
        groupCode: code,
        groupDescription: form.groupDescription.trim() || undefined,
        groupDescriptionArabic: form.groupDescriptionArabic.trim() || undefined,
        keyCode: form.keyCode.trim() || undefined,
        keyShift: form.keyShift.trim() || undefined,
      });
      setSuccess(`Saved group ${data.groupCode} (branch ${data.branchId}, id ${data.groupId}).`);
      setGroups((prev) => [...prev, data]);
      setForm((prev) => ({
        ...prev,
        groupCode: '',
        groupDescription: '',
        groupDescriptionArabic: '',
        keyCode: '',
        keyShift: '',
      }));
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save group.');
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <span>Data Entry</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-700">Groups</span>
              </nav>
              <h1 className="mt-1 text-[18px] font-bold leading-tight text-slate-900">Group Entry</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {loadError ? (
                <span
                  className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-800"
                  role="alert"
                >
                  {loadError}
                </span>
              ) : null}
              {groupsError ? (
                <span
                  className="rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-800"
                  role="alert"
                >
                  {groupsError}
                </span>
              ) : null}
              {saveError ? (
                <span
                  className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-700"
                  role="alert"
                >
                  {saveError}
                </span>
              ) : null}
              {success ? (
                <span
                  className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700"
                  role="status"
                  aria-live="polite"
                >
                  {success}
                </span>
              ) : null}
              <button
                type="button"
                disabled={saving || loadingBranches || !branches.length || !form.branchId}
                onClick={handleSave}
                className={primaryButton}
                style={{ backgroundColor: primary }}
              >
                {saving ? 'Saving...' : 'Save group'}
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#faf8f9] p-3">
          <div className="grid min-h-full grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-3">
              <section className={`${cardStyle} overflow-hidden`}>
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className={sectionTitle}>Group Details</p>
                  <p className={sectionSubtle}>Create a product group for the selected branch.</p>
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

                  <InputField
                    label={req('Group code')}
                    fullWidth
                    heightPx={fieldHeight}
                    className={inputClass}
                    labelClassName={labelClassName}
                    value={form.groupCode}
                    onChange={(e) => update('groupCode', e.target.value)}
                  />

                  <InputField
                    label="Key code"
                    fullWidth
                    heightPx={fieldHeight}
                    className={inputClass}
                    labelClassName={labelClassName}
                    value={form.keyCode}
                    onChange={(e) => update('keyCode', e.target.value)}
                  />

                  <InputField
                    label="Key shift"
                    fullWidth
                    heightPx={fieldHeight}
                    className={inputClass}
                    labelClassName={labelClassName}
                    value={form.keyShift}
                    onChange={(e) => update('keyShift', e.target.value)}
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Description"
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.groupDescription}
                      onChange={(e) => update('groupDescription', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <label
                      className="mb-1 flex h-4 items-center truncate text-[11px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-500"
                      htmlFor="group-desc-ar"
                    >
                      Description (Arabic)
                    </label>
                    <textarea
                      id="group-desc-ar"
                      rows={3}
                      value={form.groupDescriptionArabic}
                      onChange={(e) => update('groupDescriptionArabic', e.target.value)}
                      className="box-border w-full max-w-full resize-y rounded-md border border-slate-200 bg-white px-2.5 py-2 !text-[14px] font-medium leading-5 text-slate-800 outline-none transition duration-200 ease-out placeholder:font-normal placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#79072820] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  </div>

                  <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-[12px] font-semibold leading-5 text-slate-600">
                      Required fields are marked with an asterisk. Group code must be unique within the selected branch.
                    </p>
                  </div>
                </div>
              </section>

              {form.branchId ? (
                <section className={`${cardStyle} overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div>
                      <p className={sectionTitle}>Groups In This Branch</p>
                      <p className={sectionSubtle}>Existing and newly added product groups.</p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {loadingGroups ? 'Loading' : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {!loadingGroups && groups.length === 0 ? (
                    <p className="px-5 py-6 text-center text-[13px] font-medium text-slate-400">
                      No groups yet for this branch. Add one above.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-[13px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Code</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Description</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Arabic</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Key</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {groups.map((group) => (
                            <tr key={group.groupId ?? group.groupCode} className="transition duration-200 ease-out hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-semibold text-slate-800">{group.groupCode}</td>
                              <td className="px-4 py-2.5 font-medium text-slate-700">{group.groupDescription || '-'}</td>
                              <td className="px-4 py-2.5 text-slate-500" dir="rtl">{group.groupDescriptionArabic || '-'}</td>
                              <td className="px-4 py-2.5 text-slate-500">{[group.keyCode, group.keyShift].filter(Boolean).join(' / ') || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ) : null}
            </main>

            <aside className={`${cardStyle} overflow-hidden`} aria-label="Group entry context">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className={sectionTitle}>Context</p>
                <p className={sectionSubtle}>Company and branch defaults from your login.</p>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Company</p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-800">
                    {company?.companyName || 'Current company'}
                  </p>
                  {company?.companyId != null ? (
                    <p className="mt-0.5 text-[12px] font-medium text-slate-500">ID {company.companyId}</p>
                  ) : null}
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Your branch</p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-800">
                    {company?.stationName || 'Branch from login'}
                  </p>
                  {user?.stationId != null ? (
                    <p className="mt-0.5 text-[12px] font-medium text-slate-500">Branch ID {user.stationId}</p>
                  ) : null}
                </div>

                <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[12px] font-semibold leading-5 text-slate-600">
                    Descriptions and shortcut keys are optional. Arabic description is stored for bilingual labels.
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Loaded groups</p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-800">{groups.length}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-500">Groups are loaded from the selected branch.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
