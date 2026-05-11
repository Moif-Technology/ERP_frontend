import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';

const primary = colors.primary?.main || '#790728';

const SKILL_CODES = ['SK-ENG', 'SK-BRK', 'SK-ELC', 'SK-ACS', 'SK-GEN', 'SK-TYR', 'SK-DGN'];
const STATUS_OPTS = ['ACTIVE', 'INACTIVE', 'ON LEAVE'];
const SHIFT_OPTS = ['Morning', 'Afternoon', 'Night', 'Rotating'];
const STATION_OPTS = ['Main Workshop', 'Branch A', 'Branch B', 'Branch C'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';


function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const emptyForm = () => ({
  technicianCode: '',
  technicianName: '',
  skillCode: '',
  status: 'ACTIVE',
  shift: '',
  station: '',
  mobileNo: '',
  email: '',
  hourlyRate: '',
  joinDate: new Date().toISOString().slice(0, 10),
  remarks: '',
});

export default function TechnicianEntry() {
  const [form, setForm] = useState(emptyForm());

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const reset = () => setForm(emptyForm());

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          TECHNICIAN ENTRY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={primaryBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={reset}
            aria-label="New technician"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Technician</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body — ShiftMaster layout ── */}
      <div className="mt-1 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <InputField
              label="Technician Code"
              fullWidth
              value={form.technicianCode}
              onChange={set('technicianCode')}
              placeholder="Auto"
            />

            <InputField
              label="Technician Name"
              fullWidth
              value={form.technicianName}
              onChange={set('technicianName')}
              placeholder="Full name"
            />

            <DropdownInput
              label="Skill Code"
              fullWidth
              value={form.skillCode}
              onChange={setDrop('skillCode')}
              options={SKILL_CODES}
              placeholder="Select skill code"
            />

            <DropdownInput
              label="Status"
              fullWidth
              value={form.status}
              onChange={setDrop('status')}
              options={STATUS_OPTS}
              placeholder="Select status"
            />

            <DropdownInput
              label="Shift"
              fullWidth
              value={form.shift}
              onChange={setDrop('shift')}
              options={SHIFT_OPTS}
              placeholder="Select shift"
            />

            <DropdownInput
              label="Station"
              fullWidth
              value={form.station}
              onChange={setDrop('station')}
              options={STATION_OPTS}
              placeholder="Select station"
            />

            <InputField
              label="Mobile No."
              fullWidth
              value={form.mobileNo}
              onChange={set('mobileNo')}
              placeholder="Mobile number"
            />

            <InputField
              label="Email"
              fullWidth
              value={form.email}
              onChange={set('email')}
              placeholder="Email address"
            />

            <InputField
              label="Hourly Rate"
              fullWidth
              type="number"
              value={form.hourlyRate}
              onChange={set('hourlyRate')}
              placeholder="0.00"
            />

            <InputField
              label="Join Date"
              fullWidth
              type="date"
              value={form.joinDate}
              onChange={set('joinDate')}
            />

            <InputField
              label="Remarks"
              fullWidth
              value={form.remarks}
              onChange={set('remarks')}
              placeholder="Remarks"
            />

          </div>

        </div>
      </div>

    </div>
  );
}
