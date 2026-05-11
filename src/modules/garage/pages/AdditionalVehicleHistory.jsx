import React, { useState } from 'react';
import { colors, inputField, uiFontSizes } from '../../../shared/constants/theme';
import { InputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';

const primary  = colors.primary?.main     || '#790728';
const gradient = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';

const PLATE_COLOURS = ['White', 'Yellow', 'Red', 'Blue', 'Green', 'Black', 'Silver', 'Orange'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn     = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn   = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function DeleteIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const emptyForm = () => ({
  regNo: '', plateCode: '', plateColour: '',
  workDoneOn: new Date().toISOString().slice(0, 10),
  description: '', amount: '',
});

export default function AdditionalVehicleHistory() {
  const [form, setForm] = useState(emptyForm());

  const set     = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const reset      = () => setForm(emptyForm());
  const handleSave = () => console.log('Save additional vehicle history', form);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          ADDITIONAL VEHICLE HISTORY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} onClick={reset} aria-label="Delete">
            <DeleteIcon className="h-3.5 w-3.5 shrink-0" />
            Delete
          </button>
          <button type="button" className={figmaBtn} onClick={handleSave} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
            Save
          </button>
          <button
            type="button"
            className={primaryBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={reset}
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body ── */}
      <div className="mt-1 flex justify-center overflow-y-auto">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* Reg No */}
            <InputField
              label="Reg No"
              fullWidth
              value={form.regNo}
              onChange={set('regNo')}
              placeholder="Registration number"
            />

            {/* Plate Code */}
            <InputField
              label="Plate Code"
              fullWidth
              value={form.plateCode}
              onChange={set('plateCode')}
              placeholder="Plate code"
            />

            {/* Plate Colour */}
            <DropdownInput
              label="Plate Colour"
              fullWidth
              value={form.plateColour}
              onChange={setDrop('plateColour')}
              options={PLATE_COLOURS}
              placeholder="Select plate colour"
            />

            {/* Work Done On */}
            <InputField
              label="Work Done On"
              fullWidth
              type="date"
              value={form.workDoneOn}
              onChange={set('workDoneOn')}
            />

            {/* Description — full width textarea */}
            <div className="sm:col-span-2">
              <label
                className="mb-0.5 block"
                style={{ fontSize: uiFontSizes.label, lineHeight: '18px', color: inputField.label.color }}
              >
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the work done..."
                className="w-full resize-none rounded-[3px] border border-gray-200 bg-[#F5F5F5] px-2 py-1 text-[12px] text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
                style={{ minHeight: 80 }}
              />
            </div>

            {/* Amount */}
            <InputField
              label="Amount"
              fullWidth
              type="number"
              value={form.amount}
              onChange={set('amount')}
              placeholder="0.000"
            />

          </div>

          {/* bottom buttons */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-5 py-2 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: gradient }}
            >
              <span className="flex items-center gap-1.5">
                <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
                Save
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
