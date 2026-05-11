import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import * as roleApi from '../../../services/roleManagement.api.js';

const SOFTWARE_OPTIONS = [
  { value: 'ERP', label: 'ERP' },
  { value: 'POS', label: 'POS' },
  { value: 'BACKOFFICE', label: 'Backoffice' },
];

const blankForm = {
  roleName: '',
  discountPercentAllowed: '0',
  softwareType: 'ERP',
};

export default function RoleEntry() {
  const primary = colors.primary?.main || '#790728';
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedRole = useMemo(
    () => roles.find((role) => String(role.roleId) === String(selectedRoleId)),
    [roles, selectedRoleId]
  );

  const loadRoles = async () => {
    const { data } = await roleApi.listRoles();
    setRoles(data.roles || []);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await roleApi.listRoles();
        if (cancelled) return;
        setRoles(data.roles || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load roles.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    setSuccess('');
    setError('');
    const role = roles.find((item) => String(item.roleId) === String(roleId));
    if (!role) {
      setForm(blankForm);
      return;
    }
    setForm({
      roleName: role.roleName || '',
      discountPercentAllowed: String(role.discountPercentAllowed ?? 0),
      softwareType: role.softwareType || 'ERP',
    });
  };

  const handleNew = () => {
    setSelectedRoleId('');
    setForm(blankForm);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const roleName = form.roleName.trim();
    if (!roleName) {
      setError('Role name is required.');
      return;
    }
    const discount = Number(form.discountPercentAllowed || 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setError('Discount allowed must be between 0 and 100.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        roleName,
        discountPercentAllowed: discount,
        softwareType: form.softwareType,
      };
      const { data } = selectedRoleId
        ? await roleApi.updateRole(selectedRoleId, payload)
        : await roleApi.createRole(payload);
      await loadRoles();
      setSelectedRoleId(String(data.roleId));
      setForm({
        roleName: data.roleName || roleName,
        discountPercentAllowed: String(data.discountPercentAllowed ?? discount),
        softwareType: data.softwareType || form.softwareType,
      });
      setSuccess(selectedRoleId ? 'Role updated.' : 'Role created.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedRoleId || !selectedRole) return;
    const ok = window.confirm(`Deactivate role "${selectedRole.roleName}"? This is blocked if staff are assigned.`);
    if (!ok) return;

    setDeactivating(true);
    setError('');
    setSuccess('');
    try {
      await roleApi.deactivateRole(selectedRoleId);
      await loadRoles();
      setSelectedRoleId('');
      setForm(blankForm);
      setSuccess('Role deactivated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not deactivate role.');
    } finally {
      setDeactivating(false);
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
  const secondaryButton =
    'inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm transition duration-200 ease-out hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#79072820] disabled:cursor-not-allowed disabled:opacity-60';
  const dangerButton =
    'inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-red-200 bg-white px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-red-700 shadow-sm transition duration-200 ease-out hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60';

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
                <span className="text-slate-700">Roles</span>
              </nav>
              <h1 className="mt-1 text-[18px] font-bold leading-tight text-slate-900">Role Entry</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {error ? (
                <span
                  className="rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-700"
                  role="alert"
                >
                  {error}
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
              <button type="button" onClick={handleNew} className={secondaryButton}>
                New role
              </button>
              {selectedRoleId ? (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={saving || deactivating}
                  className={dangerButton}
                >
                  {deactivating ? 'Deactivating...' : 'Deactivate'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || deactivating}
                className={primaryButton}
                style={{ backgroundColor: primary }}
              >
                {saving ? 'Saving...' : selectedRoleId ? 'Update role' : 'Save role'}
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#faf8f9] p-3">
          <div className="grid min-h-full grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className={`${cardStyle} flex min-h-[220px] flex-col overflow-hidden`}>
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={sectionTitle}>Roles</p>
                    <p className={sectionSubtle}>Select a role to edit existing access settings.</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                    {roles.length}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-2">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="h-9 animate-pulse rounded-md bg-slate-100" />
                    ))}
                  </div>
                ) : roles.length ? (
                  <div className="space-y-1">
                    {roles.map((role) => {
                      const active = String(role.roleId) === String(selectedRoleId);
                      return (
                        <button
                          key={role.roleId}
                          type="button"
                          onClick={() => handleSelectRole(String(role.roleId))}
                          className={`flex min-h-[36px] w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-[13px] font-semibold transition duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#79072820] ${
                            active
                              ? 'text-white shadow-sm'
                              : 'border border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                          style={active ? { backgroundColor: primary } : undefined}
                        >
                          <span className="min-w-0 truncate">{role.roleName}</span>
                          <span className={active ? 'text-[11px] text-white/75' : 'text-[11px] text-slate-400'}>
                            {role.softwareType || 'ERP'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-[12px] font-medium text-slate-500">
                    No roles found.
                  </div>
                )}
              </div>
            </aside>

            <main className={`${cardStyle} overflow-hidden`}>
              <div className="border-b border-slate-200 px-4 py-3">
                <p className={sectionTitle}>{selectedRole ? 'Edit Role' : 'New Role'}</p>
                <p className={sectionSubtle}>
                  Maintain role name, discount limit, and the software area where this role applies.
                </p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="md:col-span-2 xl:col-span-2">
                    <InputField
                      label={req('Role name')}
                      fullWidth
                      heightPx={fieldHeight}
                      className={inputClass}
                      labelClassName={labelClassName}
                      value={form.roleName}
                      onChange={(event) => update('roleName', event.target.value)}
                    />
                  </div>

                  <InputField
                    label="Discount allowed %"
                    fullWidth
                    heightPx={fieldHeight}
                    className={inputClass}
                    labelClassName={labelClassName}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.discountPercentAllowed}
                    onChange={(event) => update('discountPercentAllowed', event.target.value)}
                  />

                  <DropdownInput
                    label="Software type"
                    fullWidth
                    heightPx={fieldHeight}
                    className={inputClass}
                    labelClassName={labelClassName}
                    value={form.softwareType}
                    onChange={(value) => update('softwareType', value)}
                    options={SOFTWARE_OPTIONS}
                  />
                </div>

                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[12px] font-semibold leading-5 text-slate-600">
                    Required fields are marked with an asterisk. Discount allowed must stay between 0 and 100.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
