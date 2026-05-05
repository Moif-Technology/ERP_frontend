import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DESIGNATION_OPTIONS } from '../../../shared/constants/designationOptions.js';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import * as staffEntryApi from '../../../services/staffEntry.api.js';

export default function StaffEntry() {
  const primary = colors.primary?.main || '#790728';
  const [form, setForm] = useState({
    staffName: '',
    designation: '',
    email: '',
    password: '',
    confirmPassword: '',
    branchId: '',
    roleId: '',
    mobileNo: '',
  });
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [staffRows, setStaffRows] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [roleSavingId, setRoleSavingId] = useState(null);
  const [roleMessage, setRoleMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const designationChoices = useMemo(() => DESIGNATION_OPTIONS, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError('');
    setSuccess('');
  };

  const applyStaffRows = (rows) => {
    setStaffRows(rows);
    setRoleDrafts(
      Object.fromEntries(
        rows.map((staff) => [String(staff.staffId), staff.roleId != null ? String(staff.roleId) : ''])
      )
    );
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      setLoadError('');
      try {
        const [branchRes, roleRes, staffRes] = await Promise.all([
          staffEntryApi.fetchStaffBranches(),
          staffEntryApi.fetchStaffRoles(),
          staffEntryApi.listStaffMembers({ limit: 500 }),
        ]);
        if (cancelled) return;
        const list = branchRes.data.branches || [];
        const roleList = roleRes.data.roles || [];
        const staffList = staffRes.data.staff || [];
        setBranches(list);
        setRoles(roleList);
        applyStaffRows(staffList);
        if (list.length === 1) {
          setForm((prev) => ({ ...prev, branchId: String(list[0].branchId) }));
        }
        const staffRole = roleList.find((role) => String(role.roleName).toLowerCase() === 'staff') || roleList[0];
        if (staffRole) {
          setForm((prev) => ({ ...prev, roleId: String(staffRole.roleId) }));
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
  }, []);

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.branchId),
        label: `${b.branchCode} — ${b.branchName}`,
      })),
    [branches]
  );

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: String(role.roleId),
        label: role.roleName,
      })),
    [roles]
  );

  const reloadStaffRows = async () => {
    const { data } = await staffEntryApi.listStaffMembers({ limit: 500 });
    applyStaffRows(data.staff || []);
  };

  const handleStaffRoleChange = (staffId, roleId) => {
    setRoleMessage('');
    setRoleDrafts((prev) => ({ ...prev, [String(staffId)]: roleId }));
  };

  const handleUpdateStaffRole = async (staff) => {
    const nextRoleId = roleDrafts[String(staff.staffId)];
    if (!nextRoleId) return;
    setRoleSavingId(staff.staffId);
    setRoleMessage('');
    try {
      await staffEntryApi.updateStaffRole(staff.staffId, Number(nextRoleId));
      await reloadStaffRows();
      setRoleMessage(`Updated role for ${staff.staffName}.`);
    } catch (err) {
      setRoleMessage(err.response?.data?.message || 'Could not update staff role.');
    } finally {
      setRoleSavingId(null);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    setSuccess('');
    if (!form.staffName.trim()) {
      setSaveError('Staff name is required.');
      return;
    }
    if (!form.designation) {
      setSaveError('Designation is required.');
      return;
    }
    if (!form.email.trim()) {
      setSaveError('Email (login) is required.');
      return;
    }
    if (!form.password || form.password.length < 8) {
      setSaveError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setSaveError('Passwords do not match.');
      return;
    }
    if (!form.branchId) {
      setSaveError('Branch is required.');
      return;
    }
    if (!form.roleId) {
      setSaveError('Role is required.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await staffEntryApi.createStaffMember({
        staffName: form.staffName.trim(),
        designation: form.designation,
        email: form.email.trim(),
        password: form.password,
        branchId: Number(form.branchId),
        roleId: Number(form.roleId),
        mobileNo: form.mobileNo.trim() || undefined,
      });
      setSuccess(
        `Saved: ${data.staffName} (${data.staffCode}) — they can sign in with this email and password.`
      );
      setForm((prev) => ({
        ...prev,
        staffName: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNo: '',
      }));
      await reloadStaffRows();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save staff.');
    } finally {
      setSaving(false);
    }
  };

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

  const surfaceTint = colors.primary?.[50] || '#F2E6EA';

  return (
    /* Single scroll on <main> (Layout): avoid nested overflow-y-auto here — it breaks mouse wheel in many browsers. */
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
                    <span style={{ color: primary }}>Staff</span>
                  </nav>
                  <h1 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Add staff member</h1>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Add a user for your company. They sign in to this ERP with the email and password you set (same rules
                    as Moifone registration).
                  </p>
                </div>
                <div
                  className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 sm:text-[11px]"
                  style={{ borderColor: `${primary}66`, backgroundColor: surfaceTint }}
                >
                  New user
                </div>
              </div>

              {loadError ? (
                <p
                  className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:text-sm"
                  role="alert"
                >
                  {loadError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-slate-50/40 px-4 py-5 sm:px-8 sm:py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
            <div className="min-w-0 flex-1 space-y-6">
              <section
                className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
                aria-labelledby="staff-entry-details-heading"
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
                    <h2 id="staff-entry-details-heading" className="text-sm font-semibold text-gray-900 sm:text-base">
                      Staff details
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 p-4 sm:space-y-4 sm:p-5">
                  <div className="mx-auto max-w-xl space-y-3.5 sm:space-y-4">
                    <InputField
                      label={req('Staff name')}
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.staffName}
                      onChange={(e) => update('staffName', e.target.value)}
                    />

                    <DropdownInput
                      label={req('Designation')}
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.designation}
                      onChange={(v) => update('designation', v)}
                      options={designationChoices}
                      placeholder={loadingBranches ? 'Loading…' : 'Select'}
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <InputField
                        label={req('Email (login)')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        type="email"
                        autoComplete="off"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                      />
                      <InputField
                        label="Mobile no."
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        value={form.mobileNo}
                        onChange={(e) => update('mobileNo', e.target.value)}
                      />
                    </div>

                    <DropdownInput
                      label={req('Branch')}
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.branchId}
                      onChange={(v) => update('branchId', v)}
                      options={branchOptions}
                      placeholder={loadingBranches ? 'Loading branches…' : branches.length ? 'Select branch' : 'No branches'}
                    />

                    <DropdownInput
                      label={req('Role')}
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.roleId}
                      onChange={(v) => update('roleId', v)}
                      options={roleOptions}
                      placeholder={loadingBranches ? 'Loading roles...' : roles.length ? 'Select role' : 'No roles'}
                    />
                  </div>
                </div>
              </section>

              <section
                className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.02]"
                aria-labelledby="staff-entry-access-heading"
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
                    <h2 id="staff-entry-access-heading" className="text-sm font-semibold text-gray-900 sm:text-base">
                      Sign-in &amp; access
                    </h2>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="mx-auto max-w-xl">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <InputField
                        label={req('Password')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                      />
                      <InputField
                        label={req('Confirm password')}
                        fullWidth
                        heightPx={fieldHeight}
                        className={inputClass}
                        labelClassName={labelClassName}
                        type="password"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside
              className="w-full shrink-0 xl:w-[min(100%,320px)] xl:pt-1"
              aria-label="Account setup tips"
            >
              <div
                className="rounded-2xl border border-gray-200 p-5 shadow-md ring-1 ring-black/[0.04] sm:p-6 xl:sticky xl:top-2"
                style={{
                  background: `linear-gradient(165deg, #ffffff 0%, ${surfaceTint} 88%)`,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: primary }} aria-hidden />
                  <p className="text-sm font-semibold text-gray-900">Account setup</p>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                  The staff member will use <span className="font-medium text-gray-800">email + password</span> to sign in.
                  Choose a branch and role. The role controls what pages and actions they can use after sign-in.
                </p>
                <ul className="mt-4 space-y-2.5 border-t border-gray-200/80 pt-4 text-xs text-gray-700 sm:text-sm">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    Password at least 8 characters; must match confirmation.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    Use a work email they check — it is their login username.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: primary }} />
                    Mobile is optional; add it if you use it for contact on file.
                  </li>
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Existing staff</p>
                    <h3 className="text-sm font-semibold text-gray-900">Role assignment</h3>
                  </div>
                  <button
                    type="button"
                    onClick={reloadStaffRows}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                </div>

                {roleMessage ? (
                  <p className="mb-3 rounded-lg border border-gray-100 bg-slate-50 px-3 py-2 text-xs text-gray-700">
                    {roleMessage}
                  </p>
                ) : null}

                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {staffRows.length ? (
                    staffRows.map((staff) => {
                      const draft = roleDrafts[String(staff.staffId)] ?? '';
                      const changed = String(staff.roleId ?? '') !== String(draft);
                      return (
                        <div key={staff.staffId} className="rounded-xl border border-gray-200 bg-slate-50/70 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{staff.staffName}</p>
                            <p className="truncate text-xs text-gray-500">
                              {staff.staffCode || `U${staff.staffId}`} {staff.email ? `- ${staff.email}` : ''}
                            </p>
                          </div>
                          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                            <select
                              value={draft}
                              onChange={(event) => handleStaffRoleChange(staff.staffId, event.target.value)}
                              className="h-9 min-w-0 rounded-lg border border-gray-300 bg-white px-2 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#790728]/20"
                            >
                              <option value="" disabled>
                                Select role
                              </option>
                              {roles.map((role) => (
                                <option key={role.roleId} value={role.roleId}>
                                  {role.roleName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={!changed || roleSavingId === staff.staffId}
                              onClick={() => handleUpdateStaffRole(staff)}
                              className="h-9 rounded-lg px-3 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
                              style={{ backgroundColor: primary }}
                            >
                              {roleSavingId === staff.staffId ? 'Saving' : 'Apply'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-4 text-sm text-gray-600">
                      No staff loaded.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div
          className="shrink-0 border-t border-gray-200/80 bg-white px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-8 sm:py-3.5"
          style={{ boxShadow: `inset 0 3px 0 0 ${surfaceTint}` }}
        >
          <p className="mb-3 hidden text-xs text-gray-500 sm:mb-0 sm:block lg:max-w-md">
            <span className="font-medium text-gray-700">Required:</span> fields marked with <span className="text-red-600">*</span>
            . Password min. 8 characters.
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
              disabled={saving || loadingBranches || !branches.length || !roles.length}
              onClick={handleSave}
              className="inline-flex w-full items-center justify-center rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-[opacity,transform,box-shadow] hover:opacity-95 hover:shadow-lg active:scale-[0.99] active:opacity-90 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[168px]"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving…' : 'Save staff'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
