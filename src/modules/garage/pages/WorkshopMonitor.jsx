import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import WorkshopMonitorFilterDrawer from '../../../shared/components/ui/WorkshopMonitorFilterDrawer';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const STATUS_COLORS = {
  'In Progress':   { bg: '#e6f4ea', text: '#1a7f37' },
  'Waiting Parts': { bg: '#fff8e1', text: '#a06000' },
  'On Hold':       { bg: '#fce8e8', text: '#c0392b' },
  'Complete':      { bg: '#e8f0fe', text: '#1a56db' },
};

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const CUSTOMERS        = ['Mohammed Al-Farsi', 'Sarah Johnson', 'Ramesh Nair', 'Lena Müller', 'Omar Shaikh'];
const GROUPS           = ['Sedan', 'SUV', 'Truck', 'Van', 'Hatchback'];
const SUB_GROUPS       = ['Toyota', 'Nissan', 'Honda', 'Hyundai', 'Ford'];
const STATUSES         = ['In Progress', 'Waiting Parts', 'On Hold', 'Complete'];
const SHORT_DESCS      = ['Full Service', 'Oil Change', 'Brake Repair', 'AC Service', 'Tyre Rotation', 'Diagnostics'];
const SERVICE_ADVISORS = ['Ali Hassan', 'John Carter', 'Priya Menon', 'Fatima Al-Sayed', 'Tom Richards'];
const CUSTOMER_TYPES   = ['Retail', 'Corporate', 'Insurance', 'Fleet', 'Warranty'];

const SEARCH_COLUMN_OPTIONS = [
  { value: 'all',          label: 'All columns' },
  { value: 'jobNo',        label: 'JobNo' },
  { value: 'regNo',        label: 'RegNo' },
  { value: 'customerName', label: 'CustomerName' },
];

/** Checkbox + 9 data columns — pct sum = 100 */
const COL_PCT = [2, 9, 10, 12, 14, 13, 10, 10, 10, 10];

function pad(n) { return String(n).padStart(2, '0'); }
function fmtDate(base, offset) {
  const d = new Date(2026, 3, 1 + ((base + offset) % 28));
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function buildRows(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    rows.push({
      id:                 String(i + 1),
      jobNo:              `JOB-${String(10000 + i * 7).slice(-5)}`,
      regNo:              `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 3) % 26))}-${1000 + (i * 37) % 9000}`,
      groupDescription:   GROUPS[i % GROUPS.length],
      subGroupDescription: SUB_GROUPS[i % SUB_GROUPS.length],
      customerName:       CUSTOMERS[i % CUSTOMERS.length],
      bookingDate:        fmtDate(i, 0),
      promiseDate:        fmtDate(i, 2 + (i % 4)),
      jobStatus:          STATUSES[i % STATUSES.length],
      serviceAdvisor:     SERVICE_ADVISORS[i % SERVICE_ADVISORS.length],
      customerType:       CUSTOMER_TYPES[i % CUSTOMER_TYPES.length],
      shortDescription:   SHORT_DESCS[i % SHORT_DESCS.length],
    });
  }
  return rows;
}

const DUMMY_ROWS = buildRows(52);

const figmaOutline    = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox  = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;
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
    <span
      className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold leading-none sm:text-[9px]"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
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

export default function WorkshopMonitor() {
  const [rows, setRows]                 = useState(() => DUMMY_ROWS.map((r) => ({ ...r })));
  const [search, setSearch]             = useState('');
  const [searchCol, setSearchCol]       = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [drawerFilters, setDrawerFilters] = useState({ jobStatus: '', serviceAdvisor: '', customerType: '' });
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [viewRow, setViewRow]           = useState(null);
  const [selectedIds, setSelectedIds]   = useState(() => new Set());
  const selectedIdsRef                  = useRef(selectedIds);
  selectedIdsRef.current                = selectedIds;

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

  useEffect(() => { setPage(1); }, [search, searchCol, statusFilter, sortBy, drawerFilters]);

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
      if (searchCol === 'jobNo')        return r.jobNo.toLowerCase().includes(q);
      if (searchCol === 'regNo')        return r.regNo.toLowerCase().includes(q);
      if (searchCol === 'customerName') return r.customerName.toLowerCase().includes(q);
      return (
        r.jobNo.toLowerCase().includes(q) ||
        r.regNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
      );
    });
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.jobStatus === statusFilter);
    }
    if (drawerFilters.jobStatus)      list = list.filter((r) => r.jobStatus === drawerFilters.jobStatus);
    if (drawerFilters.serviceAdvisor) list = list.filter((r) => r.serviceAdvisor === drawerFilters.serviceAdvisor);
    if (drawerFilters.customerType)   list = list.filter((r) => r.customerType === drawerFilters.customerType);
    const sorted = [...list];
    if (sortBy === 'customerName')  sorted.sort((a, b) => a.customerName.localeCompare(b.customerName));
    if (sortBy === 'bookingDate')   sorted.sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));
    if (sortBy === 'promiseDate')   sorted.sort((a, b) => a.promiseDate.localeCompare(b.promiseDate));
    if (sortBy === 'jobStatus')     sorted.sort((a, b) => a.jobStatus.localeCompare(b.jobStatus));
    return sorted;
  }, [search, searchCol, statusFilter, drawerFilters, sortBy, rows]);

  const totalFiltered = filteredRows.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalFiltered);

  const filteredIdSet = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);
  const selectedRowCount = useMemo(() => {
    let n = 0;
    selectedIds.forEach((id) => { if (filteredIdSet.has(id)) n += 1; });
    return n;
  }, [filteredIdSet, selectedIds]);

  const tableRows = useMemo(() => paginatedRows.map((r) => {
    const checked = selectedIds.has(r.id);
    return [
      <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleRowSelected(r.id)}
          className={listTableCheckboxClass}
          style={{ accentColor: primary }}
          aria-label={`Select ${r.jobNo}`}
        />
      </div>,
      r.jobNo,
      r.regNo,
      r.groupDescription,
      r.subGroupDescription,
      r.customerName,
      r.bookingDate,
      r.promiseDate,
      <StatusPill key={`st-${r.id}`} status={r.jobStatus} />,
      r.shortDescription,
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
      { label: 'JobNo',               value: viewRow.jobNo },
      { label: 'RegNo',               value: viewRow.regNo },
      { label: 'GroupDescription',    value: viewRow.groupDescription },
      { label: 'SubGroupDescription', value: viewRow.subGroupDescription },
      { label: 'CustomerName',        value: viewRow.customerName },
      { label: 'BookingDate',         value: viewRow.bookingDate },
      { label: 'PromiseDate',         value: viewRow.promiseDate },
      { label: 'JobStatus',           value: viewRow.jobStatus },
      { label: 'ShortDescription',    value: viewRow.shortDescription },
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

  const drawerFilterCount =
    (drawerFilters.jobStatus ? 1 : 0) +
    (drawerFilters.serviceAdvisor ? 1 : 0) +
    (drawerFilters.customerType ? 1 : 0);
  const activeFilterCount = (searchCol !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + drawerFilterCount;

  const dashStats = useMemo(() => {
    const total = rows.length;
    return [
      {
        label: 'Total Jobs', value: total, total, subtitle: 'All jobs', color: primary,
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
      },
      {
        label: 'In Progress', value: rows.filter((r) => r.jobStatus === 'In Progress').length, total, subtitle: 'Active work', color: '#1a7f37',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#1a7f37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="10 8 16 12 10 16"/></svg>,
      },
      {
        label: 'Waiting Parts', value: rows.filter((r) => r.jobStatus === 'Waiting Parts').length, total, subtitle: 'Parts pending', color: '#a06000',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#a06000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      },
      {
        label: 'On Hold', value: rows.filter((r) => r.jobStatus === 'On Hold').length, total, subtitle: 'Paused', color: '#c0392b',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>,
      },
      {
        label: 'Complete', value: rows.filter((r) => r.jobStatus === 'Complete').length, total, subtitle: 'Finished', color: '#1a56db',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>,
      },
    ];
  }, [rows]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          WORKSHOP MONITOR
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
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by JobNo, RegNo, CustomerName…"
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400 placeholder:font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:h-7 sm:shrink-0 sm:flex-nowrap">
          {selectedRowCount >= 1 && (
            <button
              type="button"
              className={primaryToolbarBtn}
              style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleDeleteSelected}
              aria-label={`Delete ${selectedRowCount} selected row${selectedRowCount === 1 ? '' : 's'}`}
            >
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 shrink-0 brightness-0 invert" />
              Delete
            </button>
          )}

          {/* Search column filter */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={searchCol}
              onChange={(e) => setSearchCol(e.target.value)}
              className="h-7 min-w-[7rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
              aria-label="Search column"
            >
              {SEARCH_COLUMN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>

          {/* Status filter */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 min-w-[6.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
              aria-label="Status filter"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
              <option value="customerName">Sort: CustomerName</option>
              <option value="bookingDate">Sort: BookingDate</option>
              <option value="promiseDate">Sort: PromiseDate</option>
              <option value="jobStatus">Sort: JobStatus</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>

          <button
            type="button"
            className={figmaToolbarBtn}
            aria-expanded={filterDrawerOpen}
            aria-haspopup="dialog"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <img src={FilterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
            <span>{drawerFilterCount > 0 ? `Filters (${drawerFilterCount})` : 'Filters'}</span>
            <ToolbarChevron />
          </button>
        </div>
      </div>

      <WorkshopMonitorFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        statuses={STATUSES}
        serviceAdvisors={SERVICE_ADVISORS}
        customerTypes={CUSTOMER_TYPES}
        applied={drawerFilters}
        onApply={setDrawerFilters}
      />

      <TableRowViewModal
        open={Boolean(viewRow)}
        title="View Job"
        fields={viewModalFields}
        onClose={() => setViewRow(null)}
      />

      {/* Table */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="workshop-monitor-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          onBodyRowClick={(rowIdx) => setViewRow(paginatedRows[rowIdx] ?? null)}
          selectedBodyRowIndex={selectedRowIndex}
          columnWidthPercents={COL_PCT}
          tableClassName="min-w-[680px] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize, 24)}
          headers={['', 'JobNo', 'RegNo', 'GroupDescription', 'SubGroupDescription', 'CustomerName', 'BookingDate', 'PromiseDate', 'JobStatus', 'ShortDescription']}
          rows={tableRows}
        />

        {/* Pagination */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>{'–'}<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
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

          {selectedRowCount >= 1 ? (
            <p
              className="justify-self-center text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold sm:text-[11px]"
              style={{ color: primary }}
              role="status"
              aria-live="polite"
            >
              {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
            </p>
          ) : (
            <span className="hidden sm:block" aria-hidden />
          )}

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
