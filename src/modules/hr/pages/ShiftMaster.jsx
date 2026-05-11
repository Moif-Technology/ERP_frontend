import React, { useEffect, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField, SelectTimeButton } from '../../../shared/components/ui';
import { shiftTemplates } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

export default function ShiftMaster() {
  const primary = colors.primary?.main || '#790728';
  const [templates, setTemplates] = useState(shiftTemplates);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    shiftName: '',
    shiftType: '',
    startTime: '',
    endTime: '',
    minWorkHours: '',
    lateGraceMinutes: '',
    earlyGraceMinutes: '',
    autoBreakMinutes: '',
    otStartAfterMinutes: '',
  });

  const shiftTypes = ['Regular', 'Flexible', 'Night'];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrShifts();
        if (cancelled) return;
        const rows = (data?.shifts || []).map((s) => ({
          name: s.shiftName,
          type: s.shiftType,
          time: `${s.startTime || '--:--'} - ${s.endTime || '--:--'}`,
          workHours: `${s.minWorkHours}h`,
          grace: `${s.lateGraceMinutes}m`,
          overtime: `After ${s.otStartAfterMinutes}m`,
        }));
        if (rows.length) setTemplates(rows);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setError('');
    if (!form.shiftName || !form.shiftType) {
      setError('Shift name and shift type are required.');
      return;
    }
    setSaving(true);
    try {
      await hrApi.createHrShift(form);
      const { data } = await hrApi.listHrShifts();
      const rows = (data?.shifts || []).map((s) => ({
        name: s.shiftName,
        type: s.shiftType,
        time: `${s.startTime || '--:--'} - ${s.endTime || '--:--'}`,
        workHours: `${s.minWorkHours}h`,
        grace: `${s.lateGraceMinutes}m`,
        overtime: `After ${s.otStartAfterMinutes}m`,
      }));
      if (rows.length) setTemplates(rows);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save shift.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 mx-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">Human Resources</p>
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        SHIFT MASTER
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Shifts are foundational because attendance, overtime, and payroll all depend on them.
      </p>

      <div className="mt-3 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="w-full p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Shift name" fullWidth value={form.shiftName} onChange={(e) => update('shiftName', e.target.value)} />
            <DropdownInput label="Shift type" fullWidth value={form.shiftType} onChange={(v) => update('shiftType', v)} options={shiftTypes} placeholder="Select type" />
            <InputField label="Min work hours" type="number" fullWidth value={form.minWorkHours} onChange={(e) => update('minWorkHours', e.target.value)} />
            <InputField label="Auto break minutes" type="number" fullWidth value={form.autoBreakMinutes} onChange={(e) => update('autoBreakMinutes', e.target.value)} />

            <InputField label="Late grace minutes" type="number" fullWidth value={form.lateGraceMinutes} onChange={(e) => update('lateGraceMinutes', e.target.value)} />
            <InputField label="Early grace minutes" type="number" fullWidth value={form.earlyGraceMinutes} onChange={(e) => update('earlyGraceMinutes', e.target.value)} />
            
            <InputField label="OT start after (mins)" type="number" fullWidth value={form.otStartAfterMinutes} onChange={(e) => update('otStartAfterMinutes', e.target.value)} />
            <SelectTimeButton
              label="Select time"
              fullWidth
              startValue={form.startTime}
              endValue={form.endTime}
              onApplyRange={({ startTime, endTime }) =>
                setForm((prev) => ({ ...prev, startTime, endTime }))
              }
            />
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
              {saving ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-bold text-slate-900">Configured shift templates</h2>
          <div className="mt-3 space-y-2">
            {templates.map((shift) => (
              <div key={shift.name} className="rounded-xl border border-white bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{shift.name}</p>
                  <span className="text-[10px] font-bold text-slate-500">{shift.type}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {shift.time} • {shift.workHours} • Grace {shift.grace}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Overtime starts {shift.overtime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
