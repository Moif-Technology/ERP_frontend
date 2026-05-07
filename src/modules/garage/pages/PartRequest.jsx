import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { InputField, SubInputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const JOB_NOS = ['JOB-00007', 'JOB-00014', 'JOB-00021', 'JOB-00028', 'JOB-00035', 'JOB-00042'];
const TECH_NAMES = ['Ahmed Al-Rashid', 'Carlos Mendes', 'David Osei', 'Faisal Khan', 'Ivan Petrov', 'Rajan Pillai'];
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const LINE_COL_PCT = [22, 46, 18, 14];

function buildDummyLines(count) {
  const items = [
    ['OIL-001', 'Engine Oil 5W-30 (4L)', '2'],
    ['FLT-002', 'Oil Filter – OEM Grade', '1'],
    ['BRK-010', 'Brake Pad Set – Front Axle', '1'],
    ['BLT-005', 'Serpentine Belt 6PK1875', '1'],
    ['SPK-003', 'Spark Plug Set (Iridium)', '4'],
    ['AIR-007', 'Air Filter – Panel Type', '1'],
  ];
  const rows = [];
  for (let i = 0; i < count; i++) {
    const [code, desc, qty] = items[i % items.length];
    rows.push({
      id: `pr-${i + 1}`,
      code: `${code.split('-')[0]}-${String(Number(code.split('-')[1]) + i * 2).padStart(3, '0')}`,
      description: desc,
      requestedQty: qty,
    });
  }
  return rows;
}

const DUMMY_LINES = buildDummyLines(10);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn = 'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const tableCellInputClass = 'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function PartRequest() {
  const [tableData, setTableData] = useState(() => DUMMY_LINES.map((r) => ({ ...r })));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);

  // header form state
  const [jobNo, setJobNo] = useState('');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().slice(0, 10));
  const [techCode, setTechCode] = useState('');
  const [techName, setTechName] = useState('');

  // entry line state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [requestedQty, setRequestedQty] = useState('');

  const totalFiltered = tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const clearEntryForm = useCallback(() => {
    setCode(''); setDescription(''); setRequestedQty('');
  }, []);

  const handleAddLine = useCallback(() => {
    if (!code.trim()) return;
    setTableData((prev) => [{
      id: `pr-${Date.now()}`,
      code: code.trim(),
      description: description.trim() || '—',
      requestedQty: requestedQty.trim() || '1',
    }, ...prev]);
    setPage(1);
    clearEntryForm();
  }, [code, description, requestedQty, clearEntryForm]);

  const handleViewLine = useCallback((id) => { setEditingRowId(null); setDetailRowId(id); }, []);
  const handleEditLine = useCallback((id) => { setDetailRowId(null); setEditingRowId((prev) => (prev === id ? null : id)); }, []);
  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
  }, []);

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const detailRow = useMemo(
    () => (detailRowId ? tableData.find((r) => r.id === detailRowId) : null),
    [detailRowId, tableData],
  );
  const detailSlNo = useMemo(() => {
    if (!detailRowId) return 0;
    const i = tableData.findIndex((r) => r.id === detailRowId);
    return i >= 0 ? i + 1 : 0;
  }, [detailRowId, tableData]);

  useEffect(() => {
    if (!detailRowId) return;
    const onKey = (e) => { if (e.key === 'Escape') setDetailRowId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailRowId]);

  const handleDeleteDocument = useCallback(() => {
    setTableData([]); clearEntryForm(); setPage(1);
    setEditingRowId(null); setDetailRowId(null);
  }, [clearEntryForm]);

  const handleNewDocument = useCallback(() => {
    setTableData([]); clearEntryForm(); setPage(1);
    setEditingRowId(null); setDetailRowId(null);
    setJobNo(''); setTechCode(''); setTechName('');
    setRequestedDate(new Date().toISOString().slice(0, 10));
  }, [clearEntryForm]);

  const tableBodyRows = useMemo(() =>
    paginatedRows.map((r) => {
      const editing = editingRowId === r.id;
      const textCell = (key, field, align = 'center') =>
        editing ? (
          <input
            key={key}
            type="text"
            className={`${tableCellInputClass} text-${align}`}
            value={r[field] ?? ''}
            onChange={(e) => updateLine(r.id, { [field]: e.target.value })}
          />
        ) : (r[field] ?? '');

      return [
        textCell(`cd-${r.id}`, 'code'),
        textCell(`ds-${r.id}`, 'description', 'left'),
        textCell(`qty-${r.id}`, 'requestedQty'),
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className={actionIconBtn} aria-label="View" onClick={() => handleViewLine(r.id)}>
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} aria-label="Edit" onClick={() => handleEditLine(r.id)}>
            <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} aria-label="Delete" onClick={() => handleDeleteLine(r.id)}>
            <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ];
    }),
  [paginatedRows, editingRowId, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          PART REQUEST
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDeleteDocument} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button
            type="button"
            className={primaryToolbarBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={handleNewDocument}
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Request</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── header info panel ── */}
      <div className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <DropdownInput
            label="Job No"
            value={jobNo}
            onChange={setJobNo}
            options={JOB_NOS}
            placeholder="Select job no"
          />
        </div>

        <div className="shrink-0 flex flex-col gap-0.5">
          <span className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>
            Requested Date
          </span>
          <input
            type="date"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            className="box-border h-[26px] rounded border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-800 outline-none focus:border-gray-400"
            style={{ width: 130 }}
          />
        </div>

        <div className="shrink-0">
          <SubInputField
            label="Requested Tech. Code"
            value={techCode}
            onChange={(e) => setTechCode(e.target.value)}
            placeholder="Tech code"
            widthPx={180}
          />
        </div>

        <div className="shrink-0">
          <DropdownInput
            label="Requested Tech. Name"
            value={techName}
            onChange={setTechName}
            options={TECH_NAMES}
            placeholder="Select technician"
          />
        </div>
      </div>

      {/* ── entry line panel ── */}
      <div className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <SubInputField
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Part code"
          />
        </div>

        <div className="flex shrink-0 flex-col gap-0.5">
          <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Part description"
            className="box-border h-[26px] rounded border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-800 outline-none focus:border-gray-400"
            style={{ width: 220 }}
          />
        </div>

        <div className="shrink-0">
          <SubInputField
            label="Requested Qty"
            value={requestedQty}
            onChange={(e) => setRequestedQty(e.target.value)}
            placeholder="0"
            type="number"
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
          headers={['Code', 'Description', 'Requested Qty', 'Action']}
          rows={tableBodyRows}
        />

        {/* ── pagination ── */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-700">
              Rows
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300"
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          <span className="hidden sm:block" aria-hidden />

          <div
            className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end"
            role="navigation"
            aria-label="Pagination"
          >
            <button
              type="button"
              className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── detail modal ── */}
      {detailRowId && detailRow ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
          onClick={closeDetailModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              onClick={closeDetailModal}
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>
              Part Request – #{detailSlNo}
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Code"          fullWidth readOnly value={detailRow.code ?? ''} />
              <InputField label="Description"   fullWidth readOnly value={detailRow.description ?? ''} />
              <InputField label="Requested Qty" fullWidth readOnly value={detailRow.requestedQty ?? ''} />
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
