import React, { useEffect, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField } from '../../../shared/components/ui';
import { leaveTypes } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

export default function LeaveTypeMaster() {
  const primary = colors.primary?.main || '#790728';
  const [types, setTypes] = useState(leaveTypes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    leaveName: '',
    maxDaysPerYear: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrLeaveTypes();
        if (cancelled) return;
        const rows = (data?.leaveTypes || []).map((t) => ({
          name: t.leaveName,
          days: t.maxDaysPerYear,
          carryForward: 'Yes',
          requiresApproval: 'Manager + HR',
        }));
        if (rows.length) setTypes(rows);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setError('');
    if (!form.leaveName || !form.maxDaysPerYear) {
      setError('Leave name and max days are required.');
      return;
    }
    setSaving(true);
    try {
      await hrApi.createHrLeaveType(form);
      const { data } = await hrApi.listHrLeaveTypes();
      const rows = (data?.leaveTypes || []).map((t) => ({
        name: t.leaveName,
        days: t.maxDaysPerYear,
        carryForward: 'Yes',
        requiresApproval: 'Manager + HR',
      }));
      if (rows.length) setTypes(rows);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save leave type.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 mx-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">Human Resources</p>
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        LEAVE TYPE MASTER
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Leave policy setup belongs in HR master data because approvals and balances depend on it.
      </p>

      <div className="mt-3 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="w-full p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4">
            <InputField label="Leave name" fullWidth value={form.leaveName} onChange={(e) => update('leaveName', e.target.value)} />
            <InputField label="Max days per year" type="number" fullWidth value={form.maxDaysPerYear} onChange={(e) => update('maxDaysPerYear', e.target.value)} />
          </div>

          <div className="mt-4 flex justify-end">
            {error ? <p className="mr-3 self-center text-xs text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving...' : 'Save Leave Type'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-bold text-slate-900">Current leave policies</h2>
          <div className="mt-3 space-y-2">
            {types.map((type) => (
              <div key={type.name} className="rounded-xl border border-white bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{type.name}</p>
                  <span className="text-[10px] font-bold text-slate-500">{type.days} days</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Carry forward: {type.carryForward} • Approval: {type.requiresApproval}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
