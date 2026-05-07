import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';

const primary = colors.primary?.main || '#790728';

const JOB_NOS        = ['JOB-00007', 'JOB-00014', 'JOB-00021', 'JOB-00028', 'JOB-00035', 'JOB-00042'];
const PUNCHING_TYPES = ['Regular', 'Overtime', 'Break', 'Shift Change'];

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

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const now = () => {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
};

const emptyForm = () => {
  const { date, time } = now();
  return {
    jobNo: '', technicianCode: '', technicianName: '',
    punchingType: '', date, time, inOut: 'In', remarks: '',
  };
};

export default function PunchingEntry() {
  const [form, setForm] = useState(emptyForm());

  const set     = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const reset      = () => setForm(emptyForm());
  const handleSave = () => console.log('Save punching entry', form);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          PUNCHING ENTRY
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
            aria-label="New punching entry"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body ── */}
      <div className="mt-1 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <DropdownInput
              label="Job No"
              fullWidth
              value={form.jobNo}
              onChange={setDrop('jobNo')}
              options={JOB_NOS}
              placeholder="Select job no"
            />

            <InputField
              label="Technician Code"
              fullWidth
              value={form.technicianCode}
              onChange={set('technicianCode')}
              placeholder="Tech code"
            />

            <InputField
              label="Technician Name"
              fullWidth
              value={form.technicianName}
              onChange={set('technicianName')}
              placeholder="Full name"
            />

            <DropdownInput
              label="Punching Type"
              fullWidth
              value={form.punchingType}
              onChange={setDrop('punchingType')}
              options={PUNCHING_TYPES}
              placeholder="Select punching type"
            />

            {/* Date / Time / In-Out — combined card */}
            <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white p-3">
              <div className="flex flex-wrap items-end gap-3">

                {/* Date */}
                <div className="flex-1 min-w-[130px]">
                  <InputField label="Date" fullWidth type="date" value={form.date} onChange={set('date')} />
                </div>

                {/* Time */}
                <div className="flex-1 min-w-[110px]">
                  <InputField label="Time" fullWidth type="time" value={form.time} onChange={set('time')} />
                </div>

                {/* In / Out toggle */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-medium leading-tight tracking-wide text-gray-500 sm:text-[11px]">
                    In / Out
                  </span>
                  <div className="flex overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                    {['In', 'Out'].map((opt, i) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, inOut: opt }))}
                        className={[
                          'relative flex h-[30px] min-w-[52px] items-center justify-center gap-1 px-4 text-[10px] font-bold transition-all duration-200',
                          i === 0 ? '' : 'border-l border-gray-300',
                          form.inOut === opt ? 'text-white shadow-inner' : 'bg-white text-gray-500 hover:bg-gray-50',
                        ].join(' ')}
                        style={form.inOut === opt ? { backgroundColor: primary } : {}}
                      >
                        {opt === 'In' && (
                          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 6h8M6 2l4 4-4 4" />
                          </svg>
                        )}
                        {opt === 'Out' && (
                          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 6H2M6 2L2 6l4 4" />
                          </svg>
                        )}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <InputField
              label="Remarks"
              fullWidth
              value={form.remarks}
              onChange={set('remarks')}
              placeholder="Remarks"
            />

          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
