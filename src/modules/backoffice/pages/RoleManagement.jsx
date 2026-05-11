import { useEffect, useMemo, useState } from 'react';
import { syncAccessIfChanged } from '../../../core/auth/auth.service.js';
import * as roleApi from '../../../services/roleManagement.api.js';
import { colors } from '../../../shared/constants/theme';

const ACTION_ORDER = ['view', 'create', 'edit', 'delete', 'approve', 'delete_bulk'];
const ACTION_LABELS = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  delete_bulk: 'Bulk delete',
};

function sortActions(actions) {
  return [...actions].sort((a, b) => {
    const ai = ACTION_ORDER.indexOf(a);
    const bi = ACTION_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function groupPermissions(permissions) {
  const packs = new Map();
  for (const permission of permissions) {
    const packCode = permission.packCode || 'other';
    const featureCode = permission.featureCode || 'misc';
    if (!packs.has(packCode)) packs.set(packCode, { packCode, features: new Map() });
    const pack = packs.get(packCode);
    if (!pack.features.has(featureCode)) {
      pack.features.set(featureCode, {
        featureCode,
        featureName: permission.featureName || featureCode,
        permissions: [],
      });
    }
    pack.features.get(featureCode).permissions.push(permission);
  }
  return [...packs.values()].map((pack) => ({
    ...pack,
    features: [...pack.features.values()],
  }));
}

export default function RoleManagement() {
  const primary = colors.primary?.main || '#790728';
  const surfaceTint = colors.primary?.[50] || '#F2E6EA';
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [granted, setGranted] = useState(() => new Set());
  const [originalGranted, setOriginalGranted] = useState(() => new Set());
  const [activePack, setActivePack] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [roleRes, permissionRes] = await Promise.all([
          roleApi.listRoles(),
          roleApi.listPermissionCatalog(),
        ]);
        if (cancelled) return;
        const roleList = roleRes.data?.roles || [];
        setRoles(roleList);
        setPermissions(permissionRes.data?.permissions || []);
        setSelectedRoleId(roleList[0] ? String(roleList[0].roleId) : '');
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load roles and permissions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setGranted(new Set());
      setOriginalGranted(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      setError('');
      setSuccess('');
      try {
        const { data } = await roleApi.getRolePermissions(selectedRoleId);
        if (cancelled) return;
        const next = new Set(
          (data.permissions || [])
            .filter((permission) => permission.isAllowed !== false)
            .map((permission) => permission.permissionCode)
        );
        setGranted(next);
        setOriginalGranted(new Set(next));
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load role permissions.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRoleId]);

  const grouped = useMemo(() => groupPermissions(permissions), [permissions]);
  const packs = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...grouped.map((pack) => ({ value: pack.packCode, label: pack.packCode.toUpperCase() })),
    ],
    [grouped]
  );

  const visibleGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    return grouped
      .filter((pack) => activePack === 'all' || pack.packCode === activePack)
      .map((pack) => ({
        ...pack,
        features: pack.features.filter((feature) => {
          if (!term) return true;
          return (
            feature.featureName.toLowerCase().includes(term) ||
            feature.featureCode.toLowerCase().includes(term) ||
            feature.permissions.some((permission) => permission.permissionCode.toLowerCase().includes(term))
          );
        }),
      }))
      .filter((pack) => pack.features.length > 0);
  }, [activePack, grouped, query]);

  const selectedRole = roles.find((role) => String(role.roleId) === String(selectedRoleId));
  const hasChanges = useMemo(() => {
    if (granted.size !== originalGranted.size) return true;
    for (const code of granted) if (!originalGranted.has(code)) return true;
    return false;
  }, [granted, originalGranted]);

  const togglePermission = (permissionCode) => {
    setSuccess('');
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(permissionCode)) next.delete(permissionCode);
      else next.add(permissionCode);
      return next;
    });
  };

  const setFeaturePermissions = (featurePermissions, checked) => {
    setSuccess('');
    setGranted((prev) => {
      const next = new Set(prev);
      for (const permission of featurePermissions) {
        if (checked) next.add(permission.permissionCode);
        else next.delete(permission.permissionCode);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await roleApi.updateRolePermissions(selectedRoleId, [...granted].sort());
      const next = new Set(
        (data.permissions || [])
          .filter((permission) => permission.isAllowed !== false)
          .map((permission) => permission.permissionCode)
      );
      setGranted(next);
      setOriginalGranted(new Set(next));
      setSuccess('Role permissions saved.');
      await syncAccessIfChanged().catch(() => null);
    } catch (err) {
      const invalid = err.response?.data?.invalidCodes;
      setError(
        invalid?.length
          ? `Invalid permission: ${invalid.slice(0, 3).join(', ')}`
          : err.response?.data?.message || 'Could not save role permissions.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="border-b border-gray-100 bg-slate-50/70 px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <nav className="text-xs font-medium text-gray-500" aria-label="Breadcrumb">
                <span>Configuration</span>
                <span className="mx-2 text-gray-300">/</span>
                <span style={{ color: primary }}>Roles</span>
              </nav>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Role permissions</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(event.target.value)}
                className="h-10 min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#790728]/20"
              >
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedRoleId || !hasChanges}
                className="h-10 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
                style={{ backgroundColor: primary }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-b border-gray-200 bg-white p-4 lg:border-b-0 lg:border-r">
            <div className="rounded-xl border border-gray-200 p-4" style={{ backgroundColor: surfaceTint }}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Selected role</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{selectedRole?.roleName || 'No role'}</p>
              <p className="mt-2 text-sm text-gray-700">
                {granted.size} of {permissions.length} permissions granted
              </p>
            </div>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search permissions"
              className="mt-4 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-[#790728]/20"
            />

            <div className="mt-4 flex flex-wrap gap-2 lg:flex-col">
              {packs.map((pack) => (
                <button
                  key={pack.value}
                  type="button"
                  onClick={() => setActivePack(pack.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                    activePack === pack.value
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activePack === pack.value ? { backgroundColor: primary } : undefined}
                >
                  {pack.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 bg-slate-50/60 p-4 sm:p-5">
            {error ? (
              <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
                {success}
              </p>
            ) : null}

            {loading ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading...</div>
            ) : (
              <div className="space-y-5">
                {visibleGroups.map((pack) => (
                  <section key={pack.packCode} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-4 py-3">
                      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-700">{pack.packCode}</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {pack.features.map((feature) => {
                        const featureCodes = feature.permissions.map((permission) => permission.permissionCode);
                        const selectedCount = featureCodes.filter((code) => granted.has(code)).length;
                        const allSelected = selectedCount === featureCodes.length;
                        const actions = sortActions(feature.permissions.map((permission) => permission.actionCode));
                        return (
                          <div key={feature.featureCode} className="grid gap-3 px-4 py-3 xl:grid-cols-[minmax(220px,1fr)_minmax(420px,2fr)]">
                            <div className="min-w-0">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  ref={(input) => {
                                    if (input) input.indeterminate = selectedCount > 0 && !allSelected;
                                  }}
                                  onChange={(event) => setFeaturePermissions(feature.permissions, event.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300"
                                  style={{ accentColor: primary }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-gray-900">{feature.featureName}</p>
                                  <p className="truncate text-xs text-gray-500">{feature.featureCode}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                              {actions.map((action) => {
                                const permission = feature.permissions.find((item) => item.actionCode === action);
                                if (!permission) return null;
                                return (
                                  <label
                                    key={permission.permissionCode}
                                    className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700"
                                    title={permission.permissionCode}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={granted.has(permission.permissionCode)}
                                      onChange={() => togglePermission(permission.permissionCode)}
                                      className="h-4 w-4 rounded border-gray-300"
                                      style={{ accentColor: primary }}
                                    />
                                    <span className="truncate">{ACTION_LABELS[action] || action}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
