import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIconImg from '../../../shared/assets/icons/search2.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';

const primary = colors.primary?.main || '#790728';

const STATUSES       = ['Pending', 'Approved', 'Issued', 'Rejected'];
const POST_STATUSES  = ['Posted', 'Unposted'];
const TAX_TYPES      = ['VAT 5%', 'VAT 15%', 'Exempt', 'Zero Rated'];
const SUPPLIERS      = ['Al-Futtaim Auto', 'Gulf Motors Co.', 'Desert Parts LLC', 'Arabian Garage', 'Prime Auto Supply'];
const REQUESTERS     = ['Ahmed Al-Rashid', 'Carlos Mendes', 'Faisal Khan', 'Ivan Petrov', 'Rajan Pillai'];
const REG_NOS        = ['KWI-1234', 'KWI-5678', 'KWI-9012', 'KWI-3456', 'KWI-7890'];
const CHASSIS_NOS    = ['JTEBU5JR1K5', 'JN8AZ2NC5L9', '5FNYF6H59MB', 'WBA3A5G5XFN', '1G1BE5SM2H7'];
const ENGINE_NOS     = ['1GR-FE-00123', '3.8-VQ38-456', 'K24W-00789', 'B48B20A-012', 'LTG-00345'];
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const STATUS_COLORS = {
  'Pending':  { bg: '#fff8e1', text: '#a06000' },
  'Approved': { bg: '#e6f4ea', text: '#1a7f37' },
  'Issued':   { bg: '#e8f0fe', text: '#1a56db' },
  'Rejected': { bg: '#fde8e8', text: '#c0392b' },
};

const POST_COLORS = {
  'Posted':   { bg: '#e6f4ea', text: '#1a7f37' },
  'Unposted': { bg: '#f3f4f6', text: '#374151' },
};

const SEARCH_COLUMN_OPTIONS = [
  { value: 'all',          label: 'All columns'  },
  { value: 'jobNo',        label: 'Job No'        },
  { value: 'subletNo',     label: 'Sublet No'     },
  { value: 'chassisNo',    label: 'Chassis No'    },
  { value: 'regNo',        label: 'Reg No'        },
  { value: 'engineNo',     label: 'Engine No'     },
  { value: 'lpoNo',        label: 'LPO No'        },
  { value: 'supplierName', label: 'Supplier Name' },
  { value: 'invoiceNo',    label: 'Invoice No'    },
];

const COL_PCT = [2, 8, 8, 8, 16, 8, 8, 10, 8, 11, 7, 6];

function buildRows(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const lpoDate     = new Date(2026, 2, 1 + (i % 28));
    const invoiceDate = new Date(2026, 3, 1 + (i % 28));
    const amount      = (500 + i * 37.5).toFixed(3);
    rows.push({
      id:           String(i + 1),
      jobNo:        `JOB-${String(10000 + i * 7).slice(-5)}`,
      subletNo:     `SBL-${String(100 + i).padStart(4, '0')}`,
      regNo:        REG_NOS[i % REG_NOS.length],
      chassisNo:    CHASSIS_NOS[i % CHASSIS_NOS.length],
      engineNo:     ENGINE_NOS[i % ENGINE_NOS.length],
      lpoNo:        `LPO-${String(200 + i).padStart(4, '0')}`,
      lpoDate:      lpoDate.toISOString().slice(0, 10),
      supplierName: SUPPLIERS[i % SUPPLIERS.length],
      invoiceNo:    `INV-${String(3000 + i).padStart(5, '0')}`,
      invoiceDate:  invoiceDate.toISOString().slice(0, 10),
      invoiceAmount: amount,
      status:       STATUSES[i % STATUSES.length],
      requestedBy:  REQUESTERS[i % REQUESTERS.length],
      taxType:      TAX_TYPES[i % TAX_TYPES.length],
      postStatus:   POST_STATUSES[i % POST_STATUSES.length],
    });
  }
  return rows;
}
const DUMMY_ROWS = buildRows(42);

const figmaOutline    = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox  = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[200px] sm:max-w-[400px]`;
const primaryBtn      = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function KpiCard({ label, value, total, subtitle, color, icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${color}0d 0%, #ffffff 55%)` }}>
      <div className="flex items-center justify-between px-2 pt-2 sm:px-2.5 sm:pt-2.5">
        <span className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-gray-500">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1a` }}>
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

function ToolbarChevron() {
  return (
    <svg className="h-2 w-2 shrink-0 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusPill({ status, colorMap }) {
  const s = colorMap[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold leading-none sm:text-[9px]"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

export default function SubletMonitor() {
  const [rows, setRows]                 = useState(() => DUMMY_ROWS.map((r) => ({ ...r })));
  const [search, setSearch]             = useState('');
  const [searchCol, setSearchCol]       = useState('all');
  const [statusFilter, setStatusFilter]         = useState('all');
  const [postStatusFilter, setPostStatusFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('default');
  const [page, setPage]                 = useState(1);
  const [dateModalOpen, setDateModalOpen]       = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [pageSize, setPageSize]         = useState(10);
  const [viewRow, setViewRow]           = useState(null);
  const [selectedIds, setSelectedIds]   = useState(() => new Set());
  const selectedIdsRef                  = useRef(selectedIds);
  selectedIdsRef.current                = selectedIds;

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (!ids.size) return;
    setRows((prev) => prev.filter((r) => !ids.has(r.id)));
    setSelectedIds(new Set());
    setViewRow((v) => (v && ids.has(v.id) ? null : v));
  }, []);

  useEffect(() => { setPage(1); }, [search, searchCol, statusFilter, postStatusFilter, sortBy, appliedDateRange]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (q) {
        const col = searchCol;
        const match = (val) => String(val).toLowerCase().includes(q);
        if      (col === 'jobNo')        { if (!match(r.jobNo))        return false; }
        else if (col === 'subletNo')     { if (!match(r.subletNo))     return false; }
        else if (col === 'chassisNo')    { if (!match(r.chassisNo))    return false; }
        else if (col === 'regNo')        { if (!match(r.regNo))        return false; }
        else if (col === 'engineNo')     { if (!match(r.engineNo))     return false; }
        else if (col === 'lpoNo')        { if (!match(r.lpoNo))        return false; }
        else if (col === 'supplierName') { if (!match(r.supplierName)) return false; }
        else if (col === 'invoiceNo')    { if (!match(r.invoiceNo))    return false; }
        else if (!Object.values(r).some((v) => String(v).toLowerCase().includes(q))) return false;
      }
      if (statusFilter !== 'all'     && r.status     !== statusFilter)     return false;
      if (postStatusFilter !== 'all' && r.postStatus !== postStatusFilter) return false;
      if (appliedDateRange?.from && appliedDateRange?.to) {
        const d = new Date(r.lpoDate);
        d.setHours(0, 0, 0, 0);
        if (d < appliedDateRange.from || d > appliedDateRange.to) return false;
      }
      return true;
    });
    const sorted = [...list];
    if (sortBy === 'jobNo')       sorted.sort((a, b) => a.jobNo.localeCompare(b.jobNo));
    if (sortBy === 'lpoDate')     sorted.sort((a, b) => a.lpoDate.localeCompare(b.lpoDate));
    if (sortBy === 'status')      sorted.sort((a, b) => a.status.localeCompare(b.status));
    if (sortBy === 'invoiceAmt')  sorted.sort((a, b) => parseFloat(a.invoiceAmount) - parseFloat(b.invoiceAmount));
    return sorted;
  }, [search, searchCol, statusFilter, postStatusFilter, sortBy, appliedDateRange, rows]);

  const totalFiltered = filteredRows.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => filteredRows.slice((page - 1) * pageSize, page * pageSize), [filteredRows, page, pageSize]);
  const rangeStart    = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd      = Math.min(page * pageSize, totalFiltered);

  const filteredIdSet    = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);
  const selectedRowCount = useMemo(() => { let n = 0; selectedIds.forEach((id) => { if (filteredIdSet.has(id)) n++; }); return n; }, [filteredIdSet, selectedIds]);

  const tableRows = useMemo(() => paginatedRows.map((r) => {
    const checked = selectedIds.has(r.id);
    return [
      <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
        <input type="checkbox" checked={checked} onChange={() => toggleRowSelected(r.id)}
          className={listTableCheckboxClass} style={{ accentColor: primary }} />
      </div>,
      r.jobNo, r.lpoNo, r.lpoDate, r.supplierName, r.invoiceNo, r.invoiceDate, r.invoiceAmount,
      <StatusPill key={`st-${r.id}`} status={r.status} colorMap={STATUS_COLORS} />,
      r.requestedBy, r.taxType,
      <StatusPill key={`ps-${r.id}`} status={r.postStatus} colorMap={POST_COLORS} />,
    ];
  }), [paginatedRows, selectedIds, toggleRowSelected]);

  const selectedRowIndex = useMemo(() => {
    if (!viewRow) return null;
    const i = paginatedRows.findIndex((r) => r.id === viewRow.id);
    return i >= 0 ? i : null;
  }, [viewRow, paginatedRows]);

  const viewModalFields = useMemo(() => !viewRow ? [] : [
    { label: 'Job No',          value: viewRow.jobNo },
    { label: 'LPO No',          value: viewRow.lpoNo },
    { label: 'LPO Date',        value: viewRow.lpoDate },
    { label: 'Supplier Name',   value: viewRow.supplierName },
    { label: 'Invoice No',      value: viewRow.invoiceNo },
    { label: 'Invoice Date',    value: viewRow.invoiceDate },
    { label: 'Invoice Amount',  value: viewRow.invoiceAmount },
    { label: 'Status',          value: viewRow.status },
    { label: 'Requested By',    value: viewRow.requestedBy },
    { label: 'Tax Type',        value: viewRow.taxType },
    { label: 'Post Status',     value: viewRow.postStatus },
  ], [viewRow]);

  const pageNumbers = useMemo(() => {
    const max = 3;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let s = Math.max(1, page - 1), e = Math.min(totalPages, s + max - 1);
    s = Math.max(1, e - max + 1);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [page, totalPages]);

  const dashStats = useMemo(() => {
    const total = rows.length;
    const totalAmt = rows.reduce((sum, r) => sum + parseFloat(r.invoiceAmount), 0).toFixed(3);
    return [
      {
        label: 'Total Sublets', value: total, total, subtitle: 'All records', color: primary,
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
      },
      {
        label: 'Pending', value: rows.filter((r) => r.status === 'Pending').length, total, subtitle: 'Awaiting approval', color: '#a06000',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#a06000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      },
      {
        label: 'Approved', value: rows.filter((r) => r.status === 'Approved').length, total, subtitle: 'Ready to process', color: '#1a7f37',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#1a7f37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>,
      },
      {
        label: 'Posted', value: rows.filter((r) => r.postStatus === 'Posted').length, total, subtitle: 'Fully posted', color: '#1a56db',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      },
      {
        label: 'Rejected', value: rows.filter((r) => r.status === 'Rejected').length, total, subtitle: 'Not approved', color: '#c0392b',
        icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
      },
    ];
  }, [rows]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          SUBLET MONITOR
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dashStats.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} total={s.total} subtitle={s.subtitle} color={s.color} icon={s.icon} />
        ))}
      </div>

      {/* ── vehicle subheading ── */}
      <div className="flex shrink-0 items-center gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white px-5 py-3">
        <span className="text-[14px] font-extrabold uppercase tracking-widest" style={{ color: primary }}>BRAND TYPE</span>
        <span className="text-[11px] font-semibold text-orange-500">Colour</span>
        <span className="text-[11px] font-bold text-gray-700">Model</span>
      </div>

      {/* ── search / filter toolbar ── */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIconImg} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Job No, LPO No, Supplier…"
            className="min-w-0 flex-1 border-0 bg-transparent text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0 sm:flex-nowrap">
          {selectedRowCount >= 1 && (
            <button type="button" className={primaryBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleDeleteSelected}>
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 shrink-0 brightness-0 invert" /> Delete
            </button>
          )}
          <button type="button" className={figmaToolbarBtn} onClick={() => setDateModalOpen(true)}
            aria-haspopup="dialog" aria-expanded={dateModalOpen}>
            <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[min(100%,9rem)] truncate sm:max-w-[10.5rem]">
              {appliedDateRange
                ? `${formatDDMMYYYY(appliedDateRange.from)} – ${formatDDMMYYYY(appliedDateRange.to)}`
                : 'Select Date'}
            </span>
            <ToolbarChevron />
          </button>
          <QuotationDateRangeModal
            open={dateModalOpen}
            title="LPO Date"
            initialRange={appliedDateRange}
            onClose={() => setDateModalOpen(false)}
            onApply={(range) => setAppliedDateRange(range)}
          />
          {/* Search column */}
          <div className={`relative inline-flex h-7 min-h-7 items-center px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={searchCol} onChange={(e) => setSearchCol(e.target.value)}
              className="h-7 min-w-[7rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none">
              {SEARCH_COLUMN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          {/* Sublet Status */}
          <div className={`relative inline-flex h-7 min-h-7 items-center px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 min-w-[7.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none">
              <option value="all">Sublet Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          {/* Post Status */}
          <div className={`relative inline-flex h-7 min-h-7 items-center px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={postStatusFilter} onChange={(e) => setPostStatusFilter(e.target.value)}
              className="h-7 min-w-[7.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none">
              <option value="all">Post Status</option>
              {POST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
          {/* Sort */}
          <div className={`relative inline-flex h-7 min-h-7 items-center px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[7rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none">
              <option value="default">Sort: Default</option>
              <option value="jobNo">Sort: Job No</option>
              <option value="lpoDate">Sort: LPO Date</option>
              <option value="status">Sort: Status</option>
              <option value="invoiceAmt">Sort: Invoice Amt</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>
        </div>
      </div>

      <TableRowViewModal open={Boolean(viewRow)} title="Sublet Detail" fields={viewModalFields} onClose={() => setViewRow(null)} />

      {/* ── table ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth allowHorizontalScroll truncateHeader truncateBody
          onBodyRowClick={(rowIdx) => setViewRow(paginatedRows[rowIdx] ?? null)}
          selectedBodyRowIndex={selectedRowIndex}
          columnWidthPercents={COL_PCT}
          tableClassName="min-w-[900px] w-full"
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35} maxVisibleRows={Math.min(pageSize, 24)}
          headers={['', 'Job No', 'LPO No', 'LPO Date', 'Supplier Name', 'Invoice No', 'Invoice Date', 'Invoice Amount', 'Status', 'Requested By', 'Tax Type', 'Post Status']}
          rows={tableRows}
        />

        {/* ── pagination ── */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="text-[10px] font-semibold text-gray-700">
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
          {selectedRowCount >= 1 ? (
            <p className="justify-self-center text-center text-[10px] font-semibold sm:text-[11px]" style={{ color: primary }}>
              {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
            </p>
          ) : <span className="hidden sm:block" aria-hidden />}
          <div className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
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
    </div>
  );
}
