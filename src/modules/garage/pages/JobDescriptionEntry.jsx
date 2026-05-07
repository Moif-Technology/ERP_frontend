import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { InputField, SubInputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const CAR_GROUPS = ['BMW', 'NISSAN', 'MERCEDES', 'AUDI', 'TOYOTA', 'CHRYSLER', 'HYUNDAI'];
const JOB_SECTIONS = ['Body Shop', 'Mechanical', 'Electrical'];
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const LINE_COL_PCT = [32, 28, 28, 12];

function buildDummyLines(count) {
  const items = [
    ['BS-001', 'Full body respray – passenger side panels and roof repainted to factory finish', 'BMW 3 Series', 'Body Shop', '8.00', '350.00'],
    ['BS-002', 'Dent removal from door panel using PDR method', 'NISSAN Patrol', 'Body Shop', '3.00', '120.00'],
    ['ME-010', 'Engine oil and filter change with OEM grade lubricant', 'TOYOTA Camry', 'Mechanical', '0.50', '50.00'],
    ['EL-005', 'AC system regas and pressure check', 'MERCEDES C-Class', 'Electrical', '1.00', '95.00'],
    ['ME-015', 'Brake pad and rotor replacement on all four wheels', 'AUDI A4', 'Mechanical', '2.50', '180.00'],
    ['EL-009', 'Electrical fault diagnosis and wiring harness repair', 'HYUNDAI Sonata', 'Electrical', '3.00', '220.00'],
  ];
  const rows = [];
  for (let i = 0; i < count; i++) {
    const [code, desc, sub, sec, std, price] = items[i % items.length];
    rows.push({
      id: `jd-${i + 1}`,
      jobCode: `${code.split('-')[0]}-${String(Number(code.split('-')[1]) + i * 3).padStart(3, '0')}`,
      description: desc,
      carSubGroup: sub,
      jobSection: sec,
      stdTime: std,
      stdPrice: price,
    });
  }
  return rows;
}

const DUMMY_LINES = buildDummyLines(16);

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

export default function JobDescriptionEntry() {
  const [tableData, setTableData] = useState(() => DUMMY_LINES.map((r) => ({ ...r })));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);

  // entry form state
  const [jobCode, setJobCode] = useState('');
  const [description, setDescription] = useState('');
  const [carGroup, setCarGroup] = useState('');
  const [jobSection, setJobSection] = useState('Body Shop');
  const [stdTime, setStdTime] = useState('');
  const [stdPrice, setStdPrice] = useState('');

  const filteredRows = tableData;

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const clearForm = useCallback(() => {
    setJobCode(''); setDescription(''); setCarGroup(''); setJobSection('Body Shop');
    setStdTime(''); setStdPrice('');
  }, []);

  const handleAddLine = useCallback(() => {
    if (!jobCode.trim()) return;
    setTableData((prev) => [{
      id: `jd-${Date.now()}`,
      jobCode: jobCode.trim(),
      description: description.trim() || '—',
      carSubGroup: carGroup || '—',
      jobSection,
      stdTime: stdTime.trim() || '0.00',
      stdPrice: stdPrice.trim() || '0.00',
    }, ...prev]);
    setPage(1);
    clearForm();
  }, [jobCode, description, carGroup, jobSection, stdTime, stdPrice, clearForm]);

  const handleViewLine = useCallback((id) => { setEditingRowId(null); setDetailRowId(id); }, []);
  const handleEditLine = useCallback((id) => { setDetailRowId(null); setEditingRowId((prev) => (prev === id ? null : id)); }, []);
  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => cur === id ? null : cur);
    setEditingRowId((cur) => cur === id ? null : cur);
  }, []);

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const detailRow = useMemo(
    () => detailRowId ? tableData.find((r) => r.id === detailRowId) : null,
    [detailRowId, tableData]
  );
  const detailSlNo = useMemo(() => {
    if (!detailRowId) return 0;
    const i = filteredRows.findIndex((r) => r.id === detailRowId);
    return i >= 0 ? i + 1 : 0;
  }, [detailRowId, filteredRows]);

  useEffect(() => {
    if (!detailRowId) return;
    const onKey = (e) => { if (e.key === 'Escape') setDetailRowId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailRowId]);

  const handleDeleteDocument = useCallback(() => {
    setTableData([]); clearForm(); setPage(1);
    setEditingRowId(null); setDetailRowId(null);
  }, [clearForm]);

  const handleNewDocument = useCallback(() => {
    setTableData([]); clearForm(); setPage(1);
    setEditingRowId(null); setDetailRowId(null);
  }, [clearForm]);

  const tableBodyRows = useMemo(() =>
    paginatedRows.map((r, idx) => {
      const sl = (page - 1) * pageSize + idx + 1;
      const editing = editingRowId === r.id;

      const textCell = (key, field) =>
        editing ? (
          <input
            key={key}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={r[field] ?? ''}
            onChange={(e) => updateLine(r.id, { [field]: e.target.value })}
          />
        ) : (r[field] ?? '');

      return [
        textCell(`cg-${r.id}`, 'carSubGroup'),
        textCell(`st-${r.id}`, 'stdTime'),
        textCell(`sp-${r.id}`, 'stdPrice'),
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
  [paginatedRows, page, pageSize, editingRowId, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

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
      <div className="flex min-w-0 shrink-0 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
            JOB DESCRIPTION ENTRY
          </h1>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:h-7 sm:flex-nowrap sm:gap-2">
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
                <span className="hidden min-[420px]:inline">New Job Description</span>
                <span className="min-[420px]:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── entry panel ── */}
      <div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">

        {/* Job Code */}
        <div className="shrink-0">
          <SubInputField
            label="Job Code"
            value={jobCode}
            onChange={(e) => setJobCode(e.target.value)}
            placeholder="Code"
          />
        </div>

        {/* Job Description – textarea */}
        <div className="flex shrink-0 flex-col gap-0.5">
          <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>
            Job Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter job description…"
            rows={3}
            className="box-border resize-none rounded border border-gray-200 bg-white px-2 py-1 text-[9px] leading-relaxed outline-none focus:border-gray-400 sm:text-[10px]"
            style={{ width: 220, borderRadius: 4 }}
          />
        </div>

        {/* Car Group – dropdown */}
        <div className="shrink-0">
          <DropdownInput
            label="Car Group"
            value={carGroup}
            onChange={setCarGroup}
            options={CAR_GROUPS}
            placeholder="Select car group"
          />
        </div>

        {/* Job Section – radio */}
        <div className="flex shrink-0 flex-col gap-1">
          <span className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: '#6b7280' }}>
            Job Section
          </span>
          <div className="flex flex-col gap-1.5">
            {JOB_SECTIONS.map((sec) => (
              <label key={sec} className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="jobSection"
                  value={sec}
                  checked={jobSection === sec}
                  onChange={() => setJobSection(sec)}
                  className="h-3 w-3 cursor-pointer accent-[#790728]"
                />
                <span className="text-[9px] font-medium text-gray-700 sm:text-[10px]">{sec}</span>
              </label>
            ))}
          </div>
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
          headers={['Car Sub Group', 'Std. Time', 'Std. Price', 'Action']}
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
              Job Description – #{detailSlNo}
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Car Sub Group" fullWidth readOnly value={detailRow.carSubGroup ?? ''} />
              <InputField label="Std. Time" fullWidth readOnly value={detailRow.stdTime ?? ''} />
              <InputField label="Std. Price" fullWidth readOnly value={detailRow.stdPrice ?? ''} />
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
