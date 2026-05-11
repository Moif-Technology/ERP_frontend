import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import { SelectDateButton } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon  from '../../../shared/assets/icons/cancel.svg';
import SearchIcon  from '../../../shared/assets/icons/search2.svg';

const primary          = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

// Sl No | Job No | Jobcode | Job Description | Tech. Code | Technician Name | Punching Type | Time In | Time Out | Time Worked (Hrs)
const COL_PCT = [4, 10, 9, 16, 9, 14, 10, 9, 9, 10];

const TECH_NAMES     = ['Ahmed Al-Rashid', 'Carlos Mendes', 'David Osei', 'Faisal Khan', 'Ivan Petrov', 'Rajan Pillai'];
const TECH_CODES     = ['TC-001', 'TC-002', 'TC-003', 'TC-004', 'TC-005', 'TC-006'];
const PUNCHING_TYPES = ['Regular', 'Overtime', 'Break', 'Shift Change'];
const JOB_DESCS      = [
  'Engine Oil Change', 'Brake Pad Replacement', 'Wheel Alignment',
  'Air Filter Replacement', 'Coolant Flush', 'Timing Belt Replacement',
  'Tyre Rotation', 'Battery Replacement', 'Clutch Overhaul', 'AC Service',
];

function pad(n) { return String(n).padStart(2, '0'); }

function buildRows(count) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const baseHour  = 7 + (i % 10);
    const inMin     = (i * 17) % 60;
    const worked    = 0.5 + (i % 5) * 0.5;
    const outHour   = Math.floor(baseHour + worked);
    const outMin    = (inMin + Math.round((worked % 1) * 60)) % 60;
    const dateOffset = i % 28;
    const d         = new Date(2026, 3, 1 + dateOffset);
    const dateIso   = d.toISOString().slice(0, 10);

    rows.push({
      id:           String(i + 1),
      jobNo:        `JOB-${String(10000 + i * 7).slice(-5)}`,
      jobCode:      `JC-${String(1000 + (i * 3) % 20).padStart(4, '0')}`,
      jobDesc:      JOB_DESCS[i % JOB_DESCS.length],
      techCode:     TECH_CODES[i % TECH_CODES.length],
      techName:     TECH_NAMES[i % TECH_NAMES.length],
      punchingType: PUNCHING_TYPES[i % PUNCHING_TYPES.length],
      timeIn:       `${pad(baseHour)}:${pad(inMin)}`,
      timeOut:      `${pad(outHour)}:${pad(outMin)}`,
      timeWorked:   worked.toFixed(1),
      dateIso,
    });
  }
  return rows;
}

const DUMMY_ROWS = buildRows(45);

const SEARCH_COL_OPTIONS = [
  { value: 'all',          label: 'All columns' },
  { value: 'jobNo',        label: 'Job No' },
  { value: 'jobCode',      label: 'Jobcode' },
  { value: 'techCode',     label: 'Tech. Code' },
  { value: 'techName',     label: 'Technician Name' },
  { value: 'punchingType', label: 'Punching Type' },
];

const figmaOutline    = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox  = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

function ToolbarChevron() {
  return (
    <svg className="h-2 w-2 shrink-0 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PunchingList() {
  const [rows]                        = useState(() => DUMMY_ROWS.map((r) => ({ ...r })));
  const [search,      setSearch]      = useState('');
  const [searchCol,   setSearchCol]   = useState('all');
  const [sortBy,      setSortBy]      = useState('default');
  const [dateRange,   setDateRange]   = useState(null);
  const [viewRow,     setViewRow]     = useState(null);
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  useEffect(() => { setPage(1); }, [search, searchCol, sortBy, dateRange]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (!q) return true;
      if (searchCol === 'jobNo')        return r.jobNo.toLowerCase().includes(q);
      if (searchCol === 'jobCode')      return r.jobCode.toLowerCase().includes(q);
      if (searchCol === 'techCode')     return r.techCode.toLowerCase().includes(q);
      if (searchCol === 'techName')     return r.techName.toLowerCase().includes(q);
      if (searchCol === 'punchingType') return r.punchingType.toLowerCase().includes(q);
      return (
        r.jobNo.toLowerCase().includes(q)        ||
        r.jobCode.toLowerCase().includes(q)      ||
        r.jobDesc.toLowerCase().includes(q)      ||
        r.techCode.toLowerCase().includes(q)     ||
        r.techName.toLowerCase().includes(q)     ||
        r.punchingType.toLowerCase().includes(q)
      );
    });
    if (dateRange?.from) list = list.filter((r) => new Date(r.dateIso) >= new Date(dateRange.from));
    if (dateRange?.to)   list = list.filter((r) => new Date(r.dateIso) <= new Date(dateRange.to));
    const sorted = [...list];
    if (sortBy === 'jobNo')       sorted.sort((a, b) => a.jobNo.localeCompare(b.jobNo));
    if (sortBy === 'techName')    sorted.sort((a, b) => a.techName.localeCompare(b.techName));
    if (sortBy === 'timeInAsc')   sorted.sort((a, b) => a.timeIn.localeCompare(b.timeIn));
    if (sortBy === 'timeInDesc')  sorted.sort((a, b) => b.timeIn.localeCompare(a.timeIn));
    return sorted;
  }, [search, searchCol, sortBy, dateRange, rows]);

  const totalFiltered = filteredRows.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalFiltered);

  const tableRows = useMemo(() =>
    paginatedRows.map((r, idx) => [
      (page - 1) * pageSize + idx + 1,
      r.jobNo,
      r.jobCode,
      r.jobDesc,
      r.techCode,
      r.techName,
      r.punchingType,
      r.timeIn,
      r.timeOut,
      r.timeWorked,
    ]),
  [paginatedRows, page, pageSize]);

  const selectedRowIndex = useMemo(() => {
    if (!viewRow) return null;
    const i = paginatedRows.findIndex((r) => r.id === viewRow.id);
    return i >= 0 ? i : null;
  }, [viewRow, paginatedRows]);

  const viewModalFields = useMemo(() => {
    if (!viewRow) return [];
    return [
      { label: 'Job No',           value: viewRow.jobNo },
      { label: 'Jobcode',          value: viewRow.jobCode },
      { label: 'Job Description',  value: viewRow.jobDesc },
      { label: 'Tech. Code',       value: viewRow.techCode },
      { label: 'Technician Name',  value: viewRow.techName },
      { label: 'Punching Type',    value: viewRow.punchingType },
      { label: 'Time In',          value: viewRow.timeIn },
      { label: 'Time Out',         value: viewRow.timeOut },
      { label: 'Time Worked (Hrs)', value: viewRow.timeWorked },
    ];
  }, [viewRow]);

  const pageNumbers = useMemo(() => {
    const max = 3;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end   = Math.min(totalPages, start + max - 1);
    start     = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">

      {/* ── header ── */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          PUNCHING LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={CancelIcon} alt="" className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </div>

      {/* ── toolbar ── */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Job No, Jobcode, Tech. Code, Technician Name…"
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:font-semibold placeholder:text-neutral-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:h-7 sm:shrink-0 sm:flex-nowrap">
          {/* Search column */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={searchCol}
              onChange={(e) => setSearchCol(e.target.value)}
              className="h-7 min-w-[7rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
              aria-label="Search column"
            >
              {SEARCH_COL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          {/* Sort */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="jobNo">Sort: Job No</option>
              <option value="techName">Sort: Tech. Name</option>
              <option value="timeInAsc">Sort: Time In (Asc)</option>
              <option value="timeInDesc">Sort: Time In (Desc)</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          <SelectDateButton
            value={dateRange}
            title="Punch Date Range"
            onApply={(range) => setDateRange(range)}
          />
        </div>
      </div>

      <TableRowViewModal
        open={Boolean(viewRow)}
        title="View Punch Record"
        fields={viewModalFields}
        onClose={() => setViewRow(null)}
      />

      {/* ── table ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          onBodyRowClick={(rowIdx) => setViewRow(paginatedRows[rowIdx] ?? null)}
          selectedBodyRowIndex={selectedRowIndex}
          columnWidthPercents={COL_PCT}
          tableClassName="min-w-[960px] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize, 24)}
          headers={['Sl No', 'Job No', 'Jobcode', 'Job Description', 'Tech. Code', 'Technician Name', 'Punching Type', 'Time In', 'Time Out', 'Time Worked (Hrs)']}
          rows={tableRows}
        />

        {/* ── pagination ── */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300"
                aria-label="Rows per page"
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          <span className="hidden sm:block" aria-hidden />

          <div
            className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end"
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
    </div>
  );
}
