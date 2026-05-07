import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const STATUS_COLORS = {
  'Active':    { bg: '#e6f4ea', text: '#1a7f37' },
  'On Break':  { bg: '#fff8e1', text: '#a06000' },
  'Idle':      { bg: '#f3f4f6', text: '#6b7280' },
  'Completed': { bg: '#e8f0fe', text: '#1a56db' },
};

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const TECHNICIANS  = ['Ahmed Al-Rashid', 'Carlos Mendes', 'David Osei', 'Faisal Khan', 'Ivan Petrov', 'Rajan Pillai', 'Tom Richards'];
const JOB_TYPES    = ['Full Service', 'Oil Change', 'Brake Repair', 'AC Service', 'Tyre Rotation', 'Diagnostics', 'Electrical'];
const BAYS         = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4', 'Bay 5', 'Bay 6'];
const STATUSES     = ['Active', 'On Break', 'Idle', 'Completed'];
const SKILL_CODES  = ['SK-ENG', 'SK-BRK', 'SK-ELC', 'SK-ACS', 'SK-GEN', 'SK-TYR', 'SK-DGN'];

const SEARCH_COLUMN_OPTIONS = [
  { value: 'all',       label: 'All columns' },
  { value: 'techCode',  label: 'Technician Code' },
  { value: 'techName',  label: 'Technician Name' },
  { value: 'jobNo',     label: 'Job No' },
];

/** Checkbox + 6 data columns — pct sum = 100 */
const COL_PCT = [2, 16, 22, 14, 16, 15, 15];

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(h, m) { return `${pad(h)}:${pad(m)}`; }

function buildRows(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const startH = 7 + (i * 2) % 9;
    const startM = (i * 13) % 60;
    const etaH   = startH + 1 + (i % 3);
    const etaM   = (startM + i * 7) % 60;
    rows.push({
      id:        String(i + 1),
      techCode:  `TECH-${String(100 + i).slice(-3)}`,
      techName:  TECHNICIANS[i % TECHNICIANS.length],
      skillCode: SKILL_CODES[i % SKILL_CODES.length],
      jobNo:     `JOB-${String(10000 + i * 7).slice(-5)}`,
      timeIn:    fmtTime(startH, startM),
      status:    STATUSES[i % STATUSES.length],
      bay:       BAYS[i % BAYS.length],
      jobType:   JOB_TYPES[i % JOB_TYPES.length],
    });
  }
  return rows;
}

const DUMMY_ROWS = buildRows(54);

const figmaOutline      = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn   = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox    = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function ToolbarChevron() {
  return (
    <svg className="h-2 w-2 shrink-0 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusPill({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold leading-none sm:text-[9px]"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function KpiCard({ label, value, total, subtitle, color, icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color}0d 0%, #ffffff 55%)` }}
    >
      <div className="flex items-center justify-between px-2 pt-2 sm:px-2.5 sm:pt-2.5">
        <span className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-gray-500">{label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1a` }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between px-2 pb-2 sm:px-2.5 sm:pb-2.5">
        <span className="text-[24px] font-extrabold leading-none tracking-tight text-gray-900">{value}</span>
        <span className="flex items-center gap-1 text-[9px] text-gray-400">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          {subtitle}
        </span>
      </div>
      <div className="h-[2px] w-full bg-gray-100">
        <div className="h-full rounded-r-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="px-2 py-1 sm:px-2.5">
        <span className="text-[9px] font-bold tabular-nums" style={{ color }}>{pct}% of total</span>
      </div>
    </div>
  );
}

export default function TechnicianMonitor() {
  const [rows, setRows]                         = useState(() => DUMMY_ROWS.map((r) => ({ ...r })));
  const [search, setSearch]                     = useState('');
  const [searchCol, setSearchCol]               = useState('all');
  const [statusFilter, setStatusFilter]         = useState('all');
  const [sortBy, setSortBy]                     = useState('default');
  const [page, setPage]                         = useState(1);
  const [pageSize, setPageSize]                 = useState(10);
  const [viewRow, setViewRow]                   = useState(null);
  const [selectedIds, setSelectedIds]           = useState(() => new Set());
  const selectedIdsRef                          = useRef(selectedIds);
  selectedIdsRef.current                        = selectedIds;

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (ids.size === 0) return;
    setRows((prev) => prev.filter((r) => !ids.has(r.id)));
    setSelectedIds(new Set());
    setViewRow((v) => (v && ids.has(v.id) ? null : v));
  }, []);

  useEffect(() => { setPage(1); }, [search, searchCol, statusFilter, sortBy]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(rows.map((r) => r.id));
      const next = new Set();
      let changed = false;
      prev.forEach((id) => { if (ids.has(id)) next.add(id); else changed = true; });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (!q) return true;
      if (searchCol === 'techCode') return r.techCode.toLowerCase().includes(q);
      if (searchCol === 'techName') return r.techName.toLowerCase().includes(q);
      if (searchCol === 'jobNo')    return r.jobNo.toLowerCase().includes(q);
      return r.techCode.toLowerCase().includes(q) || r.techName.toLowerCase().includes(q) || r.jobNo.toLowerCase().includes(q);
    });
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    const sorted = [...list];
    if (sortBy === 'techName')  sorted.sort((a, b) => a.techName.localeCompare(b.techName));
    if (sortBy === 'skillCode') sorted.sort((a, b) => a.skillCode.localeCompare(b.skillCode));
    if (sortBy === 'timeIn')    sorted.sort((a, b) => a.timeIn.localeCompare(b.timeIn));
    if (sortBy === 'status')    sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  }, [search, searchCol, statusFilter, sortBy, rows]);

  const totalFiltered = filteredRows.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalFiltered);

  const filteredIdSet    = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);
  const selectedRowCount = useMemo(() => {
    let n = 0; selectedIds.forEach((id) => { if (filteredIdSet.has(id)) n += 1; }); return n;
  }, [filteredIdSet, selectedIds]);

  const tableRows = useMemo(() => paginatedRows.map((r) => {
    const checked = selectedIds.has(r.id);
    return [
      <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
        <input type="checkbox" checked={checked} onChange={() => toggleRowSelected(r.id)}
          className={listTableCheckboxClass} style={{ accentColor: primary }} aria-label={`Select ${r.techCode}`} />
      </div>,
      r.techCode,
      r.techName,
      r.skillCode,
      r.jobNo,
      r.timeIn,
      <StatusPill key={`st-${r.id}`} status={r.status} />,
    ];
  }), [paginatedRows, selectedIds, toggleRowSelected]);

  const selectedRowIndex = useMemo(() => {
    if (!viewRow) return null;
    const i = paginatedRows.findIndex((r) => r.id === viewRow.id);
    return i >= 0 ? i : null;
  }, [viewRow, paginatedRows]);

  const viewModalFields = useMemo(() => {
    if (!viewRow) return [];
    return [
      { label: 'Technician Code', value: viewRow.techCode },
      { label: 'Technician Name', value: viewRow.techName },
      { label: 'Skill Code',      value: viewRow.skillCode },
      { label: 'Job No',          value: viewRow.jobNo },
      { label: 'Time In',         value: viewRow.timeIn },
      { label: 'Status',          value: viewRow.status },
      { label: 'Bay',             value: viewRow.bay },
      { label: 'Job Type',        value: viewRow.jobType },
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

  const dashStats = useMemo(() => {
    const total = rows.length;
    return [
      {
        label: 'Total Technicians', value: total, total, subtitle: 'All technicians', color: primary,
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      },
      {
        label: 'Active', value: rows.filter((r) => r.status === 'Active').length, total, subtitle: 'On job', color: '#1a7f37',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#1a7f37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      },
      {
        label: 'On Break', value: rows.filter((r) => r.status === 'On Break').length, total, subtitle: 'Resting', color: '#a06000',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#a06000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
      },
      {
        label: 'Idle', value: rows.filter((r) => r.status === 'Idle').length, total, subtitle: 'Waiting', color: '#6b7280',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
      },
      {
        label: 'Completed', value: rows.filter((r) => r.status === 'Completed').length, total, subtitle: 'Finished today', color: '#1a56db',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>,
      },
    ];
  }, [rows]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          TECHNICIAN MONITOR
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

      {/* Dashboard KPI Cards */}
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dashStats.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} total={s.total} subtitle={s.subtitle} color={s.color} icon={s.icon} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by TechCode, TechnicianName, JobNo…"
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400 placeholder:font-semibold" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:h-7 sm:shrink-0 sm:flex-nowrap">
          {selectedRowCount >= 1 && (
            <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleDeleteSelected}>
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 shrink-0 brightness-0 invert" />
              Delete
            </button>
          )}
          {/* Search col */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={searchCol} onChange={(e) => setSearchCol(e.target.value)}
              className="h-7 min-w-[7rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none" aria-label="Search column">
              {SEARCH_COLUMN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          {/* Status filter */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 min-w-[6.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none" aria-label="Status filter">
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          {/* Sort */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none" aria-label="Sort">
              <option value="default">Sort: Default</option>
              <option value="techName">Sort: Technician Name</option>
              <option value="skillCode">Sort: Skill Code</option>
              <option value="timeIn">Sort: Time In</option>
              <option value="status">Sort: Status</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
        </div>
      </div>

      <TableRowViewModal open={Boolean(viewRow)} title="View Technician" fields={viewModalFields} onClose={() => setViewRow(null)} />

      {/* Table */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="technician-monitor-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth allowHorizontalScroll truncateHeader truncateBody
          onBodyRowClick={(rowIdx) => setViewRow(paginatedRows[rowIdx] ?? null)}
          selectedBodyRowIndex={selectedRowIndex}
          columnWidthPercents={COL_PCT}
          tableClassName="min-w-[560px] w-full"
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35} maxVisibleRows={Math.min(pageSize, 24)}
          headers={['', 'Technician Code', 'Technician Name', 'Skill Code', 'Job No', 'Time In', 'Status']}
          rows={tableRows}
        />

        {/* Pagination */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300" aria-label="Rows per page">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          {selectedRowCount >= 1 ? (
            <p className="justify-self-center text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold sm:text-[11px]" style={{ color: primary }} role="status" aria-live="polite">
              {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
            </p>
          ) : <span className="hidden sm:block" aria-hidden />}
          <div className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation" aria-label="Pagination">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button key={n} type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
                    onClick={() => setPage(n)} aria-label={`Page ${n}`} aria-current={active ? 'page' : undefined}>
                    {n}
                  </button>
                );
              })}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
