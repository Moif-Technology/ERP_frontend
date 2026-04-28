import React, { useCallback, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { SubInputField, CommonTable } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const INP = 'box-border w-full border border-gray-200 bg-white px-1.5 py-0 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]';
const INP_S = {
  height: inputField.box.height,
  minHeight: inputField.box.height,
  borderRadius: inputField.box.borderRadius,
  background: colors.input?.background ?? '#fff',
  borderColor: '#e2e8f0',
};

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
function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function SearchInput({ label, value, onChange, placeholder, width }) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5" style={{ width: width ?? inputField.box.width }}>
      <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="box-border min-w-0 flex-1 border border-gray-200 bg-white px-1.5 py-0 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
          style={INP_S}
        />
        <button
          type="button"
          aria-label={`Search ${label}`}
          className="inline-flex shrink-0 items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          style={{ height: inputField.box.height, width: inputField.box.height, borderRadius: inputField.box.borderRadius }}
        >
          <SearchIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

const today = new Date().toISOString().slice(0, 10);

const DUMMY_LINES = [
  { id: 'p-1', jobNo: 'JC-2024-001', partsNo: 'BP-0042', description: 'Front Bumper Assembly', qty: '1', requestDate: '2024-11-10', status: 'ISSUED',   requestedBy: 'Ahmed K.' },
  { id: 'p-2', jobNo: 'JC-2024-001', partsNo: 'DH-0018', description: 'Door Hinge Set (RH)',   qty: '2', requestDate: '2024-11-10', status: 'ISSUED',   requestedBy: 'Ahmed K.' },
  { id: 'p-3', jobNo: 'JC-2024-002', partsNo: 'WG-1105', description: 'Windshield Glass',      qty: '1', requestDate: '2024-11-11', status: 'PENDING',  requestedBy: 'Fatima R.' },
  { id: 'p-4', jobNo: 'JC-2024-002', partsNo: 'OS-0077', description: 'Oil Seal Kit',           qty: '1', requestDate: '2024-11-11', status: 'PARTIAL',  requestedBy: 'Fatima R.' },
  { id: 'p-5', jobNo: 'JC-2024-003', partsNo: 'HL-0033', description: 'Headlamp Assembly (LH)', qty: '1', requestDate: '2024-11-12', status: 'PENDING',  requestedBy: 'Omar S.' },
  { id: 'p-6', jobNo: 'JC-2024-003', partsNo: 'BR-0091', description: 'Brake Pad Set (Front)',  qty: '1', requestDate: '2024-11-12', status: 'CANCELLED', requestedBy: 'Omar S.' },
];

const STATUS_COLOR = {
  ISSUED:    'text-green-600',
  PENDING:   'text-amber-600',
  PARTIAL:   'text-blue-600',
  CANCELLED: 'text-red-500',
};

export default function PartsMonitor() {
  /* vehicle header */
  const [jobNo, setJobNo]         = useState('');
  const [regNo, setRegNo]         = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo]   = useState('');

  /* table */
  const [lines, setLines] = useState(DUMMY_LINES);

  const deleteRow = useCallback((id) => setLines((prev) => prev.filter((r) => r.id !== id)), []);

  const tableRows = useMemo(() => lines.map((r, idx) => [
    idx + 1,
    r.jobNo,
    r.partsNo,
    r.description,
    r.qty,
    r.requestDate,
    <span key={r.id} className={`font-semibold ${STATUS_COLOR[r.status] ?? ''}`}>{r.status}</span>,
    r.requestedBy,
    <button key={`d-${r.id}`} type="button" onClick={() => deleteRow(r.id)}
      className="inline-flex h-5 w-5 items-center justify-center rounded text-red-400 hover:text-red-600" aria-label="Delete">
      <TrashIcon className="h-3 w-3" />
    </button>,
  ]), [lines, deleteRow]);

  const reset = useCallback(() => {
    setJobNo(''); setRegNo(''); setChassisNo(''); setEngineNo('');
    setLines([]);
  }, []);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          PARTS MONITOR
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <span className="shrink-0 text-[10px] font-semibold text-gray-600 sm:text-[11px]">
            Count : {lines.length}
          </span>
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${figmaBtn} font-semibold text-black`} onClick={reset} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" /> Delete
          </button>
          <button type="button" className={figmaBtn} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" /> Save
          </button>
          <button type="button" className={figmaBtn} aria-label="LPO">
            LPO
          </button>
          <button type="button" className={figmaBtn} aria-label="Return">
            Return
          </button>
          <button type="button" className={figmaBtn} aria-label="Request">
            Request
          </button>
          <button type="button" className={primaryBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={reset}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Parts Monitor</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── scrollable body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-w-0 flex-col gap-3">

          {/* ── Section 1: Vehicle Header ── */}
          <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
            <div className="flex min-w-0 flex-wrap items-end gap-2 sm:gap-3">
              <SearchInput label="Job No." value={jobNo} onChange={(e) => setJobNo(e.target.value)} placeholder="Job card no." />
              <SearchInput label="Reg. No." value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="Registration no." />
              <div className="shrink-0">
                <SubInputField label="Chassis No." value={chassisNo} onChange={(e) => setChassisNo(e.target.value)} placeholder="Chassis no." />
              </div>
              <div className="shrink-0">
                <SubInputField label="Engine No." value={engineNo} onChange={(e) => setEngineNo(e.target.value)} placeholder="Engine no." />
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <CommonTable
            fitParentWidth
            hideVerticalCellBorders
            headerFontSize="clamp(7px, 0.85vw, 10px)"
            headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-1.5 py-1 sm:px-2 sm:py-1.5"
            bodyRowHeightRem={2}
            columnWidthPercents={[4, 10, 10, 22, 6, 10, 11, 13, 4]}
            headers={['#', 'Job No', 'Parts No', 'Description', 'Qty', 'Request Date', 'Request Status', 'Requested By', '']}
            rows={tableRows}
          />

        </div>
      </div>
    </div>
  );
}
