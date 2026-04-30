import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { SubInputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';

const primary = colors.primary?.main || '#790728';

const JOB_NOS        = ['JOB-00007', 'JOB-00014', 'JOB-00021', 'JOB-00028', 'JOB-00035'];
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

function useClock() {
  const fmt = () =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const INIT_JOB_CODES = [
  { id: 'jc-1', jobCode: 'JC-0010', description: 'Engine Oil Change',       stdTime: '0:30' },
  { id: 'jc-2', jobCode: 'JC-0011', description: 'Brake Pad Replacement',   stdTime: '1:00' },
  { id: 'jc-3', jobCode: 'JC-0012', description: 'Wheel Alignment',         stdTime: '0:45' },
  { id: 'jc-4', jobCode: 'JC-0013', description: 'Air Filter Replacement',  stdTime: '0:20' },
  { id: 'jc-5', jobCode: 'JC-0014', description: 'Coolant Flush',           stdTime: '0:40' },
  { id: 'jc-6', jobCode: 'JC-0015', description: 'Timing Belt Replacement', stdTime: '2:30' },
];

const INIT_ALLOC = [
  { id: 'al-1', jobCode: 'JC-0010', description: 'Engine Oil Change',     timeIn: '09:15', techName: 'Ahmed Al-Rashid' },
  { id: 'al-2', jobCode: 'JC-0011', description: 'Brake Pad Replacement', timeIn: '10:30', techName: 'Carlos Mendes'   },
  { id: 'al-3', jobCode: 'JC-0012', description: 'Wheel Alignment',       timeIn: '11:00', techName: 'David Osei'      },
];

// col pcts must each sum to 100
const JC_COLS   = [25, 52, 23]; // Job Code | Description | Std Time
const ALLOC_COLS = [22, 38, 20, 20]; // Job Code | Description | Time IN | Tech. Name

export default function JobCodePunching() {
  const clock = useClock();

  const [jobNo,        setJobNo]        = useState('');
  const [techCode,     setTechCode]     = useState('');
  const [techName,     setTechName]     = useState('');
  const [punchingType, setPunchingType] = useState('');

  const [lineCode, setLineCode] = useState('');
  const [lineDesc, setLineDesc] = useState('');
  const [jobCodes,  setJobCodes]  = useState(INIT_JOB_CODES);
  const [allocList, setAllocList] = useState(INIT_ALLOC);

  const handleAddLine = useCallback(() => {
    if (!lineCode.trim()) return;
    setJobCodes((prev) => [{
      id: `jc-${Date.now()}`,
      jobCode: lineCode.trim(),
      description: lineDesc.trim() || '—',
      stdTime: '0:00',
    }, ...prev]);
    setLineCode('');
    setLineDesc('');
  }, [lineCode, lineDesc]);

  const handleSave   = () => console.log('Save job code punching');
  const handleNew    = () => {
    setJobNo(''); setTechCode(''); setTechName(''); setPunchingType('');
    setLineCode(''); setLineDesc('');
  };
  const handleDelete = () => { setJobCodes([]); setAllocList([]); handleNew(); };

  const jobCodeRows = useMemo(() =>
    jobCodes.map((r) => [r.jobCode, r.description, r.stdTime]),
  [jobCodes]);

  const allocRows = useMemo(() =>
    allocList.map((r) => [r.jobCode, r.description, r.timeIn, r.techName]),
  [allocList]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          JOB CODE PUNCHING
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} aria-label="Post">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" />
            Post
          </button>
          <button type="button" className={`${figmaBtn} font-semibold text-black`} onClick={handleDelete} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button type="button" className={figmaBtn} onClick={handleSave} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
            Save
          </button>
          <button type="button" className={primaryBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNew}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── header info panel ── */}
      <div className="flex min-w-0 flex-wrap items-end gap-x-4 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <DropdownInput
            label="Job No"
            value={jobNo}
            onChange={setJobNo}
            options={JOB_NOS}
            placeholder="Select job no"
          />
        </div>

        {/* live clock */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] leading-tight text-gray-500 sm:text-[11px]">Time</span>
          <div className="flex h-[26px] items-center rounded border border-gray-200 bg-white px-2.5">
            <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: primary }}>
              {clock}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <SubInputField
            label="Tech. Code"
            value={techCode}
            onChange={(e) => setTechCode(e.target.value)}
            placeholder="Tech code"
            widthPx={130}
          />
        </div>

        <div className="shrink-0">
          <DropdownInput
            label="Punching Type"
            value={punchingType}
            onChange={setPunchingType}
            options={PUNCHING_TYPES}
            placeholder="Select type"
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] leading-tight text-gray-500 sm:text-[11px]">Technician Name</span>
          <input
            type="text"
            value={techName}
            onChange={(e) => setTechName(e.target.value)}
            placeholder="Full name"
            className="box-border h-[26px] rounded border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-800 outline-none focus:border-gray-400"
            style={{ width: 190 }}
          />
        </div>
      </div>

      {/* ── entry line panel ── */}
      <div className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <SubInputField
            label="Job Code"
            value={lineCode}
            onChange={(e) => setLineCode(e.target.value)}
            placeholder="Job code"
            widthPx={120}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-0.5">
          <label className="text-[9px] leading-tight text-gray-500 sm:text-[11px]">Job Description</label>
          <input
            type="text"
            value={lineDesc}
            onChange={(e) => setLineDesc(e.target.value)}
            placeholder="Job description"
            className="box-border h-[26px] rounded border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-800 outline-none focus:border-gray-400"
            style={{ width: 220 }}
          />
        </div>

        <div className="ml-auto flex items-end self-stretch pb-0.5">
          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-4 py-0 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            Add
          </button>
        </div>
      </div>

      {/* ── two tables (side-by-side on lg, stacked on sm) ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row">

        {/* Table 1 — Job Codes */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200">
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white px-3 py-2">
            <span
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: primary }}
            >
              1
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700">Job Codes</span>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-500">
              {jobCodes.length} rows
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <CommonTable
              fitParentWidth
              truncateHeader
              truncateBody
              columnWidthPercents={JC_COLS}
              hideVerticalCellBorders
              cellAlign="center"
              headerFontSize="clamp(7px, 0.85vw, 10px)"
              headerTextColor="#6b7280"
              bodyFontSize="clamp(8px, 1vw, 10px)"
              cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
              headers={['Job Code', 'Description', 'Std Time']}
              rows={jobCodeRows}
            />
          </div>
        </div>

        {/* Table 2 — Allocated Technician List */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200">
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-white px-3 py-2">
            <span
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: primary }}
            >
              2
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700">Allocated Technician List</span>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-500">
              {allocList.length} rows
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <CommonTable
              fitParentWidth
              truncateHeader
              truncateBody
              columnWidthPercents={ALLOC_COLS}
              hideVerticalCellBorders
              cellAlign="center"
              headerFontSize="clamp(7px, 0.85vw, 10px)"
              headerTextColor="#6b7280"
              bodyFontSize="clamp(8px, 1vw, 10px)"
              cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
              headers={['Job Code', 'Description', 'Time IN', 'Tech. Name']}
              rows={allocRows}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
