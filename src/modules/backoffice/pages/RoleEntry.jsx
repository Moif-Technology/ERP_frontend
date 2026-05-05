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
  const surfaceTint = colors.primary?.[50] || '#F2E6EA';
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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="border-b border-gray-100 bg-gradient-to-br from-white via-white to-slate-50/60 px-4 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <nav className="text-xs font-medium text-gray-500" aria-label="Breadcrumb">
                <span>Data entry</span>
                <span className="mx-2 text-gray-300">/</span>
                <span style={{ color: primary }}>Role</span>
              </nav>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Role entry</h1>
            </div>
            <button
              type="button"
              onClick={handleNew}
              className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              New role
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-gray-200 bg-slate-50/60 p-4 lg:border-b-0 lg:border-r">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Roles</p>
              {loading ? (
                <p className="px-2 py-3 text-sm text-gray-600">Loading...</p>
              ) : (
                <div className="space-y-1">
                  {roles.map((role) => (
                    <button
                      key={role.roleId}
                      type="button"
                      onClick={() => handleSelectRole(String(role.roleId))}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        String(role.roleId) === String(selectedRoleId)
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={String(role.roleId) === String(selectedRoleId) ? { backgroundColor: primary } : undefined}
                    >
                      {role.roleName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <main className="bg-white p-4 sm:p-6">
            <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4" style={{ backgroundColor: surfaceTint }}>
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedRole ? `Edit ${selectedRole.roleName}` : 'Create role'}
                </h2>
              </div>
              <div className="space-y-4 p-5">
                <InputField
                  label={req('Role name')}
                  fullWidth
                  heightPx={fieldHeight}
                  className={inputClass}
                  labelClassName={labelClassName}
                  value={form.roleName}
                  onChange={(event) => update('roleName', event.target.value)}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                {error ? (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                    {error}
                  </p>
                ) : null}
                {success ? (
                  <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
                    {success}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {selectedRoleId ? (
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      disabled={saving || deactivating}
                      className="h-10 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {deactivating ? 'Deactivating...' : 'Deactivate'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || deactivating}
                    className="h-10 min-w-[140px] rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
                    style={{ backgroundColor: primary }}
                  >
                    {saving ? 'Saving...' : selectedRoleId ? 'Update role' : 'Save role'}
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
