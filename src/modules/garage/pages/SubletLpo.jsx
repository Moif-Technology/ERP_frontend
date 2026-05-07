import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { InputField, SubInputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';

const primary  = colors.primary?.main     || '#790728';
const gradient = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';

const SUPPLIERS      = ['Al-Rashid Auto Parts', 'Gulf Motors Supply', 'Desert Tech Spares', 'Khalid & Sons Trading'];
const TECH_CODES     = ['TECH-001', 'TECH-002', 'TECH-003', 'TECH-004', 'TECH-005'];
const PLATE_COLOURS  = ['White', 'Yellow', 'Red', 'Blue', 'Black', 'Silver'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT      = [42, 14, 14, 14, 16];   // Job Description | Qty | Unit Cost | Total | Action

const MOCK_VEHICLES = {
  'KWI-1234': { brand: 'TOYOTA', colour: 'Silver', model: 'Land Cruiser 200' },
  'KWI-5678': { brand: 'NISSAN', colour: 'White',  model: 'Patrol Y62' },
  'KWI-9012': { brand: 'HONDA',  colour: 'Black',  model: 'Pilot 2022' },
};

function buildDummyLines(n) {
  const items = [
    ['Radiator replacement – complete unit', '1', '180.000'],
    ['AC compressor overhaul', '1', '220.000'],
    ['Gearbox oil seal replacement', '2', '45.000'],
    ['Engine mount replacement (pair)', '1', '130.000'],
    ['Exhaust manifold gasket set', '1', '60.000'],
  ];
  return Array.from({ length: n }, (_, i) => {
    const [desc, qty, unit] = items[i % items.length];
    const total = (parseFloat(qty) * parseFloat(unit)).toFixed(3);
    return { id: `sl-${i + 1}`, description: desc, qty, unitCost: unit, total };
  });
}
const DUMMY_LINES = buildDummyLines(6);

const figmaOutline    = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn   = 'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const cellInputClass  = 'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

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

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export default function SubletLpo() {
  /* ── header state ── */
  const [subletNo,       setSubletNo]       = useState('');
  const [lpoNo,          setLpoNo]          = useState('');
  const [supplierName,   setSupplierName]   = useState('');
  const [supplierQuot,   setSupplierQuot]   = useState('');
  const [lpoDate,        setLpoDate]        = useState(new Date().toISOString().slice(0, 10));
  const [jobNo,          setJobNo]          = useState('');

  /* ── vehicle state ── */
  const [regNo,       setRegNo]       = useState('');
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [chassisNo,   setChassissNo]  = useState('');
  const [engineNo,    setEngineNo]    = useState('');

  /* ── entry line state ── */
  const [entryDesc,     setEntryDesc]     = useState('');
  const [entryQty,      setEntryQty]      = useState('');
  const [entryUnitCost, setEntryUnitCost] = useState('');
  const entryTotal = useMemo(() => {
    const q = parseFloat(entryQty), u = parseFloat(entryUnitCost);
    return isNaN(q) || isNaN(u) ? '' : (q * u).toFixed(3);
  }, [entryQty, entryUnitCost]);

  /* ── table state ── */
  const [tableData,    setTableData]    = useState(() => DUMMY_LINES.map((r) => ({ ...r })));
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId,  setDetailRowId]  = useState(null);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  /* ── bottom state ── */
  const [reqTechCode, setReqTechCode] = useState('');
  const [remark,      setRemark]      = useState('');

  const totalAmount = useMemo(
    () => tableData.reduce((s, r) => s + (parseFloat(r.total) || 0), 0).toFixed(3),
    [tableData],
  );

  const totalFiltered = tableData.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const s = (page - 1) * pageSize;
    return tableData.slice(s, s + pageSize);
  }, [tableData, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalFiltered);

  /* ── vehicle search ── */
  const handleVehicleSearch = () => {
    setVehicleInfo(MOCK_VEHICLES[regNo.toUpperCase().trim()] || null);
  };

  /* ── line actions ── */
  const clearEntry = useCallback(() => { setEntryDesc(''); setEntryQty(''); setEntryUnitCost(''); }, []);

  const handleAddLine = useCallback(() => {
    if (!entryDesc.trim()) return;
    const q = parseFloat(entryQty) || 0, u = parseFloat(entryUnitCost) || 0;
    setTableData((prev) => [{
      id: `sl-${Date.now()}`,
      description: entryDesc.trim(),
      qty: String(q || 1),
      unitCost: u.toFixed(3),
      total: (q * u).toFixed(3),
    }, ...prev]);
    setPage(1); clearEntry();
  }, [entryDesc, entryQty, entryUnitCost, clearEntry]);

  const updateLine    = useCallback((id, patch) => setTableData((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r)), []);
  const handleView    = useCallback((id) => { setEditingRowId(null); setDetailRowId(id); }, []);
  const handleEdit    = useCallback((id) => { setDetailRowId(null); setEditingRowId((p) => p === id ? null : id); }, []);
  const handleDelete  = useCallback((id) => { setTableData((p) => p.filter((r) => r.id !== id)); setDetailRowId((c) => c === id ? null : c); setEditingRowId((c) => c === id ? null : c); }, []);

  const handleNewDoc  = useCallback(() => {
    setTableData([]); clearEntry(); setPage(1); setEditingRowId(null); setDetailRowId(null);
    setSubletNo(''); setLpoNo(''); setSupplierName(''); setSupplierQuot(''); setJobNo('');
    setLpoDate(new Date().toISOString().slice(0, 10));
    setRegNo(''); setVehicleInfo(null); setChassissNo(''); setEngineNo('');
    setReqTechCode(''); setRemark('');
  }, [clearEntry]);

  const closeDetail = useCallback(() => setDetailRowId(null), []);
  const detailRow   = useMemo(() => detailRowId ? tableData.find((r) => r.id === detailRowId) : null, [detailRowId, tableData]);
  const detailSlNo  = useMemo(() => { if (!detailRowId) return 0; const i = tableData.findIndex((r) => r.id === detailRowId); return i >= 0 ? i + 1 : 0; }, [detailRowId, tableData]);

  useEffect(() => {
    if (!detailRowId) return;
    const h = (e) => { if (e.key === 'Escape') setDetailRowId(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [detailRowId]);

  /* ── table rows ── */
  const tableBodyRows = useMemo(() => {
    const dataRows = paginatedRows.map((r) => {
      const editing = editingRowId === r.id;
      const cell = (field, align = 'center') =>
        editing
          ? <input key={field} type="text" className={`${cellInputClass} text-${align}`} value={r[field] ?? ''} onChange={(e) => updateLine(r.id, { [field]: e.target.value })} />
          : (r[field] ?? '');
      return [
        cell('description', 'left'),
        cell('qty'),
        cell('unitCost'),
        cell('total'),
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className={actionIconBtn} onClick={() => handleView(r.id)}><img src={ViewIcon}   alt="view"   className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
          <button type="button" className={actionIconBtn} onClick={() => handleEdit(r.id)}><img src={EditIcon}   alt="edit"   className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
          <button type="button" className={actionIconBtn} onClick={() => handleDelete(r.id)}><img src={DeleteIcon} alt="delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
        </div>,
      ];
    });

    const totalRow = [
      { content: <span className="font-bold text-gray-700">Total Amount</span>, colSpan: 3, className: 'text-right align-middle' },
      <span key="total-amt" className="font-extrabold" style={{ color: primary }}>{totalAmount}</span>,
      '',
    ];

    return [...dataRows, totalRow];
  }, [paginatedRows, editingRowId, updateLine, handleView, handleEdit, handleDelete, totalAmount, primary]);

  const pageNumbers = useMemo(() => {
    const max = 3;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let s = Math.max(1, page - 1), e = Math.min(totalPages, s + max - 1);
    s = Math.max(1, e - max + 1);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          SUBLET LPO
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={() => setTableData([])} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button type="button" className={figmaToolbarBtn} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
            Save
          </button>
          <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNewDoc}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New LPO</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── header panel — all 7 fields in one row ── */}
      <div className="rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="grid grid-cols-4 gap-x-2 gap-y-2 xl:grid-cols-7">
          {[
            { label: 'Sublet No',          value: subletNo,     set: setSubletNo,     placeholder: 'Auto-generated', type: 'text' },
            { label: 'LPO No',             value: lpoNo,        set: setLpoNo,        placeholder: 'LPO number',     type: 'text' },
            { label: 'Supplier Name',      value: supplierName, set: setSupplierName, placeholder: 'Supplier name',  type: 'text' },
            { label: 'Supplier Quot. No.', value: supplierQuot, set: setSupplierQuot, placeholder: 'Quotation no',  type: 'text' },
            { label: 'LPO Date',           value: lpoDate,      set: setLpoDate,      placeholder: '',               type: 'date' },
            { label: 'Chassis No.',        value: chassisNo,    set: setChassissNo,   placeholder: 'Chassis number', type: 'text' },
            { label: 'Job No.',            value: jobNo,        set: setJobNo,        placeholder: 'Job number',     type: 'text' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label} className="flex flex-col gap-0.5 min-w-0">
              <label className="truncate text-[9px] leading-tight sm:text-[10px] sm:leading-[15px]" style={{ color: '#6b7280' }}>{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="box-border h-[26px] w-full min-w-0 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-semibold text-gray-800 outline-none focus:border-gray-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── combined section: vehicle + entry + req tech + remark ── */}
      <div className="flex min-w-0 gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white p-3">

        {/* Left 3/4: subheading + fields */}
        <div className="flex flex-1 min-w-0 flex-col gap-2">
          {/* Subheading */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-extrabold tracking-widest uppercase" style={{ color: primary }}>
              {vehicleInfo ? vehicleInfo.brand : 'BRAND TYPE'}
            </span>
            <span className="text-[11px] font-semibold text-gray-400">|</span>
            <span className="text-[11px] font-semibold text-gray-500">
              {vehicleInfo ? `${vehicleInfo.colour} — ${vehicleInfo.model}` : 'Colour — Model'}
            </span>
          </div>

          {/* All entry fields in one row */}
          <div className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-2">
            <SubInputField label="Reg. No."   value={regNo}        onChange={(e) => setRegNo(e.target.value)}        placeholder="e.g. KWI-1234" widthPx={105} />
            <SubInputField label="Engine No." value={engineNo}     onChange={(e) => setEngineNo(e.target.value)}     placeholder="Engine number"  widthPx={105} />
            <div className="flex shrink-0 flex-col gap-0.5">
              <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>Job Description</label>
              <input type="text" value={entryDesc} onChange={(e) => setEntryDesc(e.target.value)} placeholder="Describe the job"
                className="box-border h-[26px] rounded border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-800 outline-none focus:border-gray-400" style={{ width: 190 }} />
            </div>
            <SubInputField label="Quantity"   value={entryQty}      onChange={(e) => setEntryQty(e.target.value)}      placeholder="0"     type="number" widthPx={65} />
            <SubInputField label="Unit Price" value={entryUnitCost}  onChange={(e) => setEntryUnitCost(e.target.value)} placeholder="0.000" type="number" widthPx={75} />
            <div className="flex shrink-0 flex-col gap-0.5">
              <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>Total</label>
              <input type="text" readOnly value={entryTotal} placeholder="0.000"
                className="box-border h-[26px] rounded border border-gray-200 bg-gray-100 px-2 text-[10px] font-semibold text-gray-600 outline-none" style={{ width: 75 }} />
            </div>
            <div className="flex items-end pb-0.5">
              <button type="button" onClick={handleAddLine}
                className="inline-flex h-[26px] shrink-0 items-center justify-center rounded border px-4 text-[10px] font-semibold text-white"
                style={{ backgroundColor: primary, borderColor: primary }}>
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-gray-200" />

        {/* Right 1/4: Req. Tech. Code + Remark */}
        <div className="flex w-[25%] min-w-[140px] shrink-0 flex-col gap-2">
          <DropdownInput
            label="Req. Tech. Code"
            fullWidth
            value={reqTechCode}
            onChange={setReqTechCode}
            options={TECH_CODES}
            placeholder="Select tech code"
          />
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>Remark</label>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Remarks..."
              className="w-full resize-none rounded-[3px] border border-gray-200 bg-[#F5F5F5] px-2 py-1 text-[11px] text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── table ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          truncateHeader
          truncateBody={editingRowId == null}
          columnWidthPercents={LINE_COL_PCT}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={['Job Description', 'Quantity', 'Unit Cost', 'Total', 'Action']}
          rows={tableBodyRows}
        />

        {/* pagination */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <span className="hidden sm:block" aria-hidden />
          <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button key={n} type="button" onClick={() => setPage(n)}
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}>
                    {n}
                  </button>
                );
              })}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>


      {/* ── detail modal ── */}
      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
          onClick={closeDetail} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6"
            onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={closeDetail} aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Sublet LPO Line – #{detailSlNo}</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Job Description" fullWidth readOnly value={detailRow.description ?? ''} />
              <InputField label="Quantity"         fullWidth readOnly value={detailRow.qty       ?? ''} />
              <InputField label="Unit Cost"        fullWidth readOnly value={detailRow.unitCost   ?? ''} />
              <InputField label="Total"            fullWidth readOnly value={detailRow.total      ?? ''} />
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
