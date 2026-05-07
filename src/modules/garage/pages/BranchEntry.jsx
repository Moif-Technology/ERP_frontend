import React, { useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { InputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';

const primary = colors.primary?.main || '#790728';

const EMIRATE_OPTS = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
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
  workshopName: '',
  address: '',
  emirate: '',
  telephone: '',
  faxNo: '',
});

export default function BranchEntry() {
  const [form, setForm] = useState(emptyForm());

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const reset = () => setForm(emptyForm());
  const handleSave = () => console.log('Save branch', form);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          BRANCH ENTRY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} aria-label="Post">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" />
            Post
          </button>
          <button type="button" className={`${figmaBtn} font-semibold text-black`} onClick={reset} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
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
            aria-label="New branch"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Branch</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body ── */}
      <div className="mt-1 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <InputField
              label="Workshop Name"
              fullWidth
              value={form.workshopName}
              onChange={set('workshopName')}
              placeholder="Workshop name"
            />

            <DropdownInput
              label="Emirate"
              fullWidth
              value={form.emirate}
              onChange={setDrop('emirate')}
              options={EMIRATE_OPTS}
              placeholder="Select emirate"
            />

            <InputField
              label="Telephone"
              fullWidth
              value={form.telephone}
              onChange={set('telephone')}
              placeholder="Telephone number"
            />

            <InputField
              label="Fax No."
              fullWidth
              value={form.faxNo}
              onChange={set('faxNo')}
              placeholder="Fax number"
            />

            {/* Address textarea spans both columns */}
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <label
                className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]"
                style={{ color: inputField.label.color }}
              >
                Address
              </label>
              <textarea
                value={form.address}
                onChange={set('address')}
                placeholder="Full address"
                rows={4}
                className="box-border w-full resize-none rounded border border-gray-200 bg-white px-2 py-1 text-[9px] leading-relaxed outline-none focus:border-gray-400 sm:text-[10px]"
                style={{ borderRadius: inputField.box.borderRadius }}
              />
            </div>

          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save Branch
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
