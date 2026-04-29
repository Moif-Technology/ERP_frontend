import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';

const primary = colors.primary?.main || '#790728';

/* ─── shared style tokens ─────────────────────────────────────── */
const figmaOutline    = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox  = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[220px] sm:max-w-[420px]`;

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

function ToolbarChevron() {
  return (
    <svg className="h-2 w-2 shrink-0 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── helpers ─────────────────────────────────────────────────── */
function fmtMoney(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function pad(n) { return String(n).padStart(2, '0'); }
function fmtDate(i, off = 0) {
  const d = new Date(2025, (i + off) % 12, 1 + (i * 3) % 28);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const WORKSHOPS    = ['WS-MAIN', 'WS-NORTH', 'WS-SOUTH', 'WS-EAST'];
const JOB_STATUSES = ['Completed', 'In Progress', 'Pending', 'Cancelled'];
const CUSTOMERS    = ['Al-Farsi', 'S. Johnson', 'R. Nair', 'L. Müller', 'O. Shaikh'];
const SUPPLIERS    = ['Al-Futtaim Auto', 'Gulf Parts Co.', 'Metro Auto Supply', 'National Spares'];
const LPO_TYPES    = ['Standard', 'Emergency', 'Scheduled', 'Warranty'];
const EST_STATUSES = ['Approved', 'Pending', 'Rejected', 'Draft'];
const PART_NAMES   = ['Oil Filter', 'Brake Pad Set', 'Air Filter', 'Timing Belt', 'Spark Plug', 'Wheel Bearing'];

/* ─── dummy data ──────────────────────────────────────────────── */
function buildJobHistory(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    jobNo:        `JOB-${String(10000 + i * 7).slice(-5)}`,
    jobDate:      fmtDate(i),
    jobStatus:    JOB_STATUSES[i % JOB_STATUSES.length],
    kmIn:         String(10000 + (i * 1237) % 90000),
    kmOut:        String(10000 + (i * 1237) % 90000 + 50 + (i % 10) * 10),
    shortDescr:   ['Full Service', 'Oil Change', 'Brake Repair', 'AC Service', 'Diagnostics'][i % 5],
    workShop:     WORKSHOPS[i % WORKSHOPS.length],
    customerCode: `CUST-${String(200 + i * 3).slice(-4)}`,
  }));
}
function buildPartsHistory(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    jobNo:        `JOB-${String(10000 + i * 7).slice(-5)}`,
    partsNo:      `PRT-${String(10000 + i * 9).slice(-5)}`,
    description:  PART_NAMES[i % PART_NAMES.length],
    quantity:     String(1 + (i % 8)),
    deliveryDate: fmtDate(i, 1),
    workshop:     WORKSHOPS[i % WORKSHOPS.length],
  }));
}
function buildEstimationHistory(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    estimationNo:     `EST-${String(10000 + i * 11).slice(-5)}`,
    estimationDate:   fmtDate(i),
    customer:         CUSTOMERS[i % CUSTOMERS.length],
    estimationAmount: fmtMoney(200 + (i * 137) % 4800),
    jobNo:            `JOB-${String(10000 + i * 7).slice(-5)}`,
    jobDate:          fmtDate(i, 1),
    estimationStatus: EST_STATUSES[i % EST_STATUSES.length],
    workshop:         WORKSHOPS[i % WORKSHOPS.length],
  }));
}
function buildSubletHistory(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    subletNo: `SBL-${String(10000 + i * 13).slice(-5)}`,
    jobNo:    `JOB-${String(10000 + i * 7).slice(-5)}`,
    lpoNo:    `LPO-${String(10000 + i * 5).slice(-5)}`,
    date:     fmtDate(i),
    amount:   fmtMoney(100 + (i * 89) % 3900),
    workshop: WORKSHOPS[i % WORKSHOPS.length],
  }));
}
function buildLpoHistory(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    lpoNo:    `LPO-${String(10000 + i * 5).slice(-5)}`,
    jobNo:    `JOB-${String(10000 + i * 7).slice(-5)}`,
    lpoDate:  fmtDate(i),
    supplier: SUPPLIERS[i % SUPPLIERS.length],
    amount:   fmtMoney(150 + (i * 113) % 4850),
    lpoType:  LPO_TYPES[i % LPO_TYPES.length],
    workshop: WORKSHOPS[i % WORKSHOPS.length],
  }));
}

/* ─── tab definitions ─────────────────────────────────────────── */
const TABS = [
  {
    key: 'job', label: 'Job History',
    headers: ['Job No', 'Job Date', 'Job Status', 'KM In', 'KM Out', 'Shor Descr.', 'WorkShop', 'Customer Code'],
    colPct:  [12, 11, 12, 8, 8, 18, 14, 17], minW: '560px',
    data: buildJobHistory(48),
    rowFn: (r) => [r.jobNo, r.jobDate, r.jobStatus, r.kmIn, r.kmOut, r.shortDescr, r.workShop, r.customerCode],
    searchFields: ['jobNo', 'jobStatus', 'shortDescr', 'customerCode'],
    sortOptions: [
      { value: 'default',   label: 'Sort: Default' },
      { value: 'jobDate',   label: 'Sort: Job Date' },
      { value: 'jobStatus', label: 'Sort: Status' },
      { value: 'workShop',  label: 'Sort: Workshop' },
    ],
    sortFn: (list, s) => {
      if (s === 'jobDate')   list.sort((a, b) => a.jobDate.localeCompare(b.jobDate));
      if (s === 'jobStatus') list.sort((a, b) => a.jobStatus.localeCompare(b.jobStatus));
      if (s === 'workShop')  list.sort((a, b) => a.workShop.localeCompare(b.workShop));
      return list;
    },
  },
  {
    key: 'parts', label: 'Parts History',
    headers: ['Job No', 'Parts No', 'Description', 'Quantity', 'Delivery Date', 'Workshop'],
    colPct:  [15, 15, 25, 10, 18, 17], minW: '480px',
    data: buildPartsHistory(42),
    rowFn: (r) => [r.jobNo, r.partsNo, r.description, r.quantity, r.deliveryDate, r.workshop],
    searchFields: ['jobNo', 'partsNo', 'description'],
    sortOptions: [
      { value: 'default',      label: 'Sort: Default' },
      { value: 'description',  label: 'Sort: Description' },
      { value: 'deliveryDate', label: 'Sort: Delivery Date' },
      { value: 'quantity',     label: 'Sort: Quantity' },
    ],
    sortFn: (list, s) => {
      if (s === 'description')  list.sort((a, b) => a.description.localeCompare(b.description));
      if (s === 'deliveryDate') list.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
      if (s === 'quantity')     list.sort((a, b) => Number(b.quantity) - Number(a.quantity));
      return list;
    },
  },
  {
    key: 'estimation', label: 'Estimation History',
    headers: ['Estimation No', 'Estimation Date', 'Customer', 'Estimation Amount', 'JobNo', 'Job Date', 'Estimation Status', 'Workshop'],
    colPct:  [13, 13, 12, 14, 10, 10, 14, 14], minW: '760px',
    data: buildEstimationHistory(38),
    rowFn: (r) => [r.estimationNo, r.estimationDate, r.customer, r.estimationAmount, r.jobNo, r.jobDate, r.estimationStatus, r.workshop],
    searchFields: ['estimationNo', 'customer', 'jobNo', 'estimationStatus'],
    sortOptions: [
      { value: 'default',          label: 'Sort: Default' },
      { value: 'estimationDate',   label: 'Sort: Est. Date' },
      { value: 'customer',         label: 'Sort: Customer' },
      { value: 'estimationStatus', label: 'Sort: Status' },
    ],
    sortFn: (list, s) => {
      if (s === 'estimationDate')   list.sort((a, b) => a.estimationDate.localeCompare(b.estimationDate));
      if (s === 'customer')         list.sort((a, b) => a.customer.localeCompare(b.customer));
      if (s === 'estimationStatus') list.sort((a, b) => a.estimationStatus.localeCompare(b.estimationStatus));
      return list;
    },
  },
  {
    key: 'sublet', label: 'Sublet History',
    headers: ['SubletNo', 'JobNo', 'LPONo', 'Date', 'Amount', 'Workshop'],
    colPct:  [16, 16, 16, 14, 16, 22], minW: '480px',
    data: buildSubletHistory(30),
    rowFn: (r) => [r.subletNo, r.jobNo, r.lpoNo, r.date, r.amount, r.workshop],
    searchFields: ['subletNo', 'jobNo', 'lpoNo'],
    sortOptions: [
      { value: 'default',  label: 'Sort: Default' },
      { value: 'date',     label: 'Sort: Date' },
      { value: 'amount',   label: 'Sort: Amount' },
      { value: 'workshop', label: 'Sort: Workshop' },
    ],
    sortFn: (list, s) => {
      if (s === 'date')     list.sort((a, b) => a.date.localeCompare(b.date));
      if (s === 'workshop') list.sort((a, b) => a.workshop.localeCompare(b.workshop));
      return list;
    },
  },
  {
    key: 'lpo', label: 'LPO History',
    headers: ['LPONo', 'JobNo', 'LPODate', 'Supplier', 'Amount', 'LPOType', 'Workshop'],
    colPct:  [13, 13, 12, 20, 13, 13, 16], minW: '580px',
    data: buildLpoHistory(36),
    rowFn: (r) => [r.lpoNo, r.jobNo, r.lpoDate, r.supplier, r.amount, r.lpoType, r.workshop],
    searchFields: ['lpoNo', 'jobNo', 'supplier', 'lpoType'],
    sortOptions: [
      { value: 'default',  label: 'Sort: Default' },
      { value: 'lpoDate',  label: 'Sort: LPO Date' },
      { value: 'supplier', label: 'Sort: Supplier' },
      { value: 'lpoType',  label: 'Sort: LPO Type' },
    ],
    sortFn: (list, s) => {
      if (s === 'lpoDate')  list.sort((a, b) => a.lpoDate.localeCompare(b.lpoDate));
      if (s === 'supplier') list.sort((a, b) => a.supplier.localeCompare(b.supplier));
      if (s === 'lpoType')  list.sort((a, b) => a.lpoType.localeCompare(b.lpoType));
      return list;
    },
  },
];

/* ─── tab panel ───────────────────────────────────────────────── */
function TabPanel({ tab }) {
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('default');
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewRow, setViewRow]   = useState(null);

  useEffect(() => { setPage(1); }, [search, sortBy]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? tab.data.filter((r) => tab.searchFields.some((f) => String(r[f] ?? '').toLowerCase().includes(q)))
      : [...tab.data];
    return tab.sortFn(list, sortBy);
  }, [search, sortBy, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, filtered.length);

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const tableRows = useMemo(() => paginated.map((r) => tab.rowFn(r)), [paginated, tab]);

  const viewModalFields = useMemo(() => {
    if (!viewRow) return [];
    return tab.headers.map((label, i) => ({
      label,
      value: String(tab.rowFn(viewRow)[i] ?? ''),
    }));
  }, [viewRow, tab]);

  const pageNumbers = useMemo(() => {
    const max = 3;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end   = Math.min(totalPages, start + max - 1);
    start     = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <>
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Search + Sort row — inside the panel */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab.label}…`}
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400 placeholder:font-semibold"
          />
        </div>
        <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-7 min-w-[7.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
            aria-label="Sort"
          >
            {tab.sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
        </div>
      </div>

      {/* Table */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          fitParentWidth allowHorizontalScroll truncateHeader truncateBody
          columnWidthPercents={tab.colPct}
          tableClassName={`min-w-[${tab.minW}] w-full`}
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize, 24)}
          headers={tab.headers}
          rows={tableRows}
          onBodyRowClick={(rowIdx) => setViewRow(paginated[rowIdx] ?? null)}
        />

        {/* Pagination */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{filtered.length}</span>
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
            role="navigation" aria-label="Pagination"
          >
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" aria-label="Previous page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button key={n} type="button" onClick={() => setPage(n)}
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
                    aria-label={`Page ${n}`} aria-current={active ? 'page' : undefined}>
                    {n}
                  </button>
                );
              })}
            </div>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" aria-label="Next page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <TableRowViewModal
      open={Boolean(viewRow)}
      title={`View – ${tab.label}`}
      fields={viewModalFields}
      onClose={() => setViewRow(null)}
    />
    </>
  );
}

/* ─── main page ───────────────────────────────────────────────── */
export default function VehicleHistory() {
  const [activeTab, setActiveTab] = useState('job');
  const tab = TABS.find((t) => t.key === activeTab);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">

      {/* Page header */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          VEHICLE HISTORY
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

      {/* Segmented tab bar — Product Entry style */}
      <div className="shrink-0 overflow-x-auto no-scrollbar">
        <div
          className="inline-flex max-w-full shrink-0 items-stretch gap-px self-start rounded-md px-0.5 py-0.5"
          style={{ backgroundColor: '#EDEDED' }}
          role="tablist"
          aria-label="Vehicle history sections"
        >
          {TABS.map((t) => {
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.key)}
                className="min-h-[22px] whitespace-nowrap rounded px-2.5 py-0.5 text-center text-[8px] font-medium leading-tight transition-colors sm:min-h-[24px] sm:px-3 sm:text-[9px]"
                style={
                  active
                    ? { backgroundColor: primary, color: '#fff' }
                    : { backgroundColor: 'transparent', color: '#111827' }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — remounts per tab to reset search/sort/page */}
      <TabPanel key={activeTab} tab={tab} />
    </div>
  );
}
