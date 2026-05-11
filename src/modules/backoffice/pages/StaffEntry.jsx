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
        label: `${b.branchCode} - ${b.branchName}`,
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
        `Saved: ${data.staffName} (${data.staffCode}) - they can sign in with this email and password.`
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

  const fieldHeight = 34;
  const inputClass =
    'rounded-md px-2.5 !text-[14px] font-medium text-slate-800 placeholder:font-normal ' +
    'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#79072820] ' +
    'disabled:cursor-not-allowed disabled:opacity-60';
  const labelClassName =
    '!flex !h-4 !items-center !truncate !text-[11px] !font-bold !uppercase ' +
    '!leading-4 !tracking-[0.12em] !text-slate-500';

  const primaryBtn =
    'inline-flex h-8 min-h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-4 ' +
    'text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
  const secondaryBtn =
    'inline-flex h-8 min-h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 ' +
    'text-[11px] font-semibold text-slate-600 shadow-sm transition-opacity hover:opacity-90';

  const cardStyle = {
    borderColor: '#e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(15,23,42,0.06)',
  };
  const accentCardStyle = {
    borderColor: `${primary}28`,
    boxShadow: '0 1px 2px 0 rgba(15,23,42,0.06)',
  };

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
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200"
        style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.08)' }}
      >
        <div
          className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-2.5"
          style={{ background: '#f8fafc' }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Data Entry / Staff
            </p>
            <h1 className="text-[13px] font-bold leading-tight text-slate-800">
              New Staff Member
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {loadError ? (
              <p className="max-w-xs truncate text-[11px] font-medium text-amber-700" role="alert">
                {loadError}
              </p>
            ) : null}
            {saveError ? (
              <p className="max-w-xs truncate text-[11px] font-medium text-red-600" role="alert">
                {saveError}
              </p>
            ) : null}
            {success ? (
              <p className="max-w-70 truncate text-[11px] font-medium text-emerald-600" role="status" aria-live="polite">
                {success}
              </p>
            ) : null}
            <button type="button" onClick={reloadStaffRows} className={secondaryBtn}>
              Refresh
            </button>
            <button
              type="button"
              disabled={saving || loadingBranches || !branches.length || !roles.length}
              onClick={handleSave}
              className={primaryBtn}
              style={{ backgroundColor: primary, borderColor: `${primary}99` }}
            >
              {saving ? 'Saving...' : 'Save staff'}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#faf8f9] p-3">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] xl:items-start">
            <div className="space-y-3">
              <section className="rounded-lg border bg-white" style={accentCardStyle}>
                <div className="px-4 pb-2.5 pt-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>
                    Staff details
                  </h2>
                </div>
                <div className="px-4 pb-3.5 pt-3">
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-2">
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
                      placeholder={loadingBranches ? 'Loading...' : 'Select'}
                    />
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

              <section className="rounded-lg border bg-white" style={cardStyle}>
                <div className="px-4 pb-2.5 pt-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Sign-in &amp; access
                  </h2>
                </div>
                <div className="px-4 pb-3.5 pt-3">
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-2">
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
              </section>
            </div>

            <div className="space-y-3">
              <section className="rounded-lg border bg-white" style={cardStyle}>
                <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Role assignment
                  </h2>
                  <button type="button" onClick={reloadStaffRows} className={secondaryBtn}>
                    Refresh
                  </button>
                </div>
                <div className="px-4 pb-3.5 pt-3">
                  {roleMessage ? (
                    <p className="mb-3 rounded-md border border-gray-100 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-600">
                      {roleMessage}
                    </p>
                  ) : null}

                  <div className="max-h-[395px] space-y-2 overflow-y-auto pr-1">
                    {staffRows.length ? (
                      staffRows.map((staff) => {
                        const draft = roleDrafts[String(staff.staffId)] ?? '';
                        const changed = String(staff.roleId ?? '') !== String(draft);
                        return (
                          <div key={staff.staffId} className="rounded-md border border-gray-200 bg-slate-50/70 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-slate-800">{staff.staffName}</p>
                              <p className="truncate text-[11px] text-slate-500">
                                {staff.staffCode || `U${staff.staffId}`} {staff.email ? `- ${staff.email}` : ''}
                              </p>
                            </div>
                            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                              <select
                                value={draft}
                                onChange={(event) => handleStaffRoleChange(staff.staffId, event.target.value)}
                                className="h-[34px] min-w-0 cursor-pointer rounded-md border border-gray-300 bg-white px-2 text-[13px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#790728]/20"
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
                                className="h-[34px] cursor-pointer rounded-md px-3 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                style={{ backgroundColor: primary }}
                              >
                                {roleSavingId === staff.staffId ? 'Saving' : 'Apply'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-md border border-gray-200 bg-slate-50 px-3 py-4 text-[13px] font-medium text-slate-600">
                        No staff loaded.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-5 py-2"
          style={{ background: '#f8fafc' }}
        >
          <span className="text-[11px] text-slate-400">
            Fields marked <span style={{ color: '#dc2626' }}>*</span> are required. Password minimum is 8 characters.
          </span>
        </div>
      </div>
    </div>
  );
}
