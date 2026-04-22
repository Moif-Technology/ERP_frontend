import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField, SelectTimeButton } from '../../../shared/components/ui';

export default function ShiftMaster() {
  const primary = colors.primary?.main || '#790728';
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

  const handleSave = () => {
    console.log('Shift Master Save', form);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 mx-3">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        SHIFT MASTER
      </h1>

      <div className="mt-3 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
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
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save Shift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
