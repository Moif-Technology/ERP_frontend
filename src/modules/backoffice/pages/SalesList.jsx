import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import SalesFilterDrawer from '../../../shared/components/ui/SalesFilterDrawer';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STATIONS = ['Main', 'North', 'South', 'Warehouse A', 'Express'];

const DUMMY_CUSTOMER_NAMES = [
  'Al Noor Trading LLC',
  'Gulf Fresh Markets',
  'City Hyper Stores',
  'Prime Wholesale Co.',
  'Emirates Retail Group',
  'Desert Bloom Supplies',
  'Harbor View Trading',
  'Oasis Foods LLC',
  'Metro Cash & Carry',
  'Sunrise General Trading',
  'Pearl Coast Distributors',
  'Falcon Electronics',
  'Royal Star Hypermarket',
  'Blue Wave Imports',
  'Golden Sands Wholesale',
];

const PAYMENT_MODES = ['Cash', 'Card', 'Credit', 'Cheque', 'Split'];
const SALESMEN = ['Ahmed K.', 'Sara M.', 'James R.', 'Priya N.', 'Omar H.'];
const POST_STATUS_OPTIONS = ['Draft', 'Posted'];
const TRANSACTION_TYPES = ['Cash sale', 'Credit sale', 'Wholesale', 'Retail', 'Export'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Checkbox + Sl no, Bill no, Counter, Bill date, Time, Payment mode, Local bill no, Customer LP, Customer, TRN, Salesman, Subtotal, Disc, Tax, Round off, Amount, Post status, Counter close, Remarks, STN */
const SALES_LIST_COL_PCT = [
  2, 2.5, 5, 3, 5, 4, 5, 5, 4, 12.5, 5, 5, 5, 4, 4, 3, 5, 4, 4, 9, 4,
];

function buildDummySales(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const seq = 1200 - i;
    const d = 1 + (i % 28);
    const m = 1 + (i % 4);
    const y = 2026;
    const billDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    const h = 9 + (i % 12);
    const min = (i * 11) % 60;
    const billTime = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    const sub = 1800 + (i * 211) % 48000 + (i % 5) * 77.25;
    const disc = (i % 5 === 0 ? 0 : ((i * 37) % 800) + (i % 9) * 15.5).toFixed(2);
    const tax = (sub * 0.05 + (i % 3) * 12).toFixed(2);
    const roundOff = (i % 7 === 0 ? -0.15 : i % 7 === 1 ? 0.2 : 0).toFixed(2);
    const amountNum = sub - Number(disc) + Number(tax) + Number(roundOff);
    const amount = amountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const subStr = sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    rows.push({
      id: String(i + 1),
      station: STATIONS[i % STATIONS.length],
      billNo: `BILL-2026-${String(seq).padStart(5, '0')}`,
      counter: String(1 + (i % 4)),
      billDate,
      billTime,
      paymentMode: PAYMENT_MODES[i % PAYMENT_MODES.length],
      localBillNo: `LB-${(10000 + i * 17) % 90000}`,
      customerLpNo: `LP-${7000 + (i * 19) % 4000}`,
      customerName: DUMMY_CUSTOMER_NAMES[i % DUMMY_CUSTOMER_NAMES.length],
      trnNo: `100-${(200000000 + i * 100001) % 900000000}`,
      salesMan: SALESMEN[i % SALESMEN.length],
      subTotal: subStr,
      discount: disc,
      taxAmount: tax,
      roundOffAdj: roundOff,
      amount,
      postStatus: i % 8 === 0 ? 'Draft' : 'Posted',
      transactionType: TRANSACTION_TYPES[i % TRANSACTION_TYPES.length],
      counterClose: i % 6 === 0 ? 'Open' : 'Closed',
      remarks: i % 4 === 0 ? 'Walk-in' : i % 4 === 1 ? 'Urgent delivery' : '—',
    });
  }
  return rows;
}

const DUMMY_SALES = buildDummySales(48);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseBillDate(ddmmyyyy) {
  const parts = String(ddmmyyyy).split('/');
  if (parts.length !== 3) return null;
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export default function SalesList() {
  const [sales, setSales] = useState(() => DUMMY_SALES.map((r) => ({ ...r })));
  const [search, setSearch] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [salesFilters, setSalesFilters] = useState({
    station: null,
    postStatus: null,
    transactionType: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (ids.size === 0) return;
    setSales((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, appliedDateRange, salesFilters]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(sales.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [sales]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (salesFilters.station) n += 1;
    if (salesFilters.postStatus) n += 1;
    if (salesFilters.transactionType) n += 1;
    return n;
  }, [salesFilters]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? sales.filter(
          (r) =>
            r.billNo.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.localBillNo.toLowerCase().includes(q) ||
            r.trnNo.toLowerCase().includes(q) ||
            r.customerLpNo.toLowerCase().includes(q)
        )
      : [...sales];

    if (appliedDateRange?.from && appliedDateRange?.to) {
      const rf = appliedDateRange.from.getTime();
      const rt = appliedDateRange.to.getTime();
      list = list.filter((r) => {
        const rd = parseBillDate(r.billDate);
        if (!rd) return false;
        const t = rd.getTime();
        return t >= rf && t <= rt;
      });
    }

    if (salesFilters.station) {
      list = list.filter((r) => r.station === salesFilters.station);
    }
    if (salesFilters.postStatus) {
      list = list.filter((r) => r.postStatus === salesFilters.postStatus);
    }
    if (salesFilters.transactionType) {
      list = list.filter((r) => r.transactionType === salesFilters.transactionType);
    }

    const sorted = [...list];
    if (sortBy === 'dateDesc') {
      sorted.sort((a, b) => String(b.billDate).localeCompare(String(a.billDate)));
    } else if (sortBy === 'amountDesc') {
      sorted.sort(
        (a, b) =>
          Number(String(b.amount).replace(/,/g, '')) - Number(String(a.amount).replace(/,/g, ''))
      );
    }
    return sorted;
  }, [search, sortBy, appliedDateRange, salesFilters, sales]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const filteredIdSet = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);

  const selectedRowCount = useMemo(() => {
    let n = 0;
    selectedIds.forEach((id) => {
      if (filteredIdSet.has(id)) n += 1;
    });
    return n;
  }, [filteredIdSet, selectedIds]);

  const salesColumnTotals = useMemo(() => {
    let sub = 0;
    let disc = 0;
    let tax = 0;
    let amt = 0;
    for (const r of filteredRows) {
      sub += parseMoneyValue(r.subTotal);
      disc += parseMoneyValue(r.discount);
      tax += parseMoneyValue(r.taxAmount);
      amt += parseMoneyValue(r.amount);
    }
    return { sub, disc, tax, amt };
  }, [filteredRows]);

  const tableRows = useMemo(() => {
    const dataRows = paginatedRows.map((r, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      const checked = selectedIds.has(r.id);
      return [
        <div
          key={`chk-${r.id}`}
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
            aria-label={`Select ${r.billNo}`}
          />
        </div>,
        slNo,
        r.billNo,
        r.counter,
        r.billDate,
        r.billTime,
        r.paymentMode,
        r.localBillNo,
        r.customerLpNo,
        r.customerName,
        r.trnNo,
        r.salesMan,
        r.subTotal,
        r.discount,
        r.taxAmount,
        r.roundOffAdj,
        r.amount,
        r.postStatus,
        r.counterClose,
        r.remarks,
        r.station,
      ];
    });

    /** Same pattern as Sale.jsx: colSpan through column before Sub total, then amounts in their columns */
    const totalRow = [
      {
        content: (
          <div key="sales-list-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 12,
        className: 'align-middle font-bold',
      },
      salesColumnTotals.sub.toFixed(2),
      salesColumnTotals.disc.toFixed(2),
      salesColumnTotals.tax.toFixed(2),
      '',
      salesColumnTotals.amt.toFixed(2),
      '',
      '',
      '',
      '',
    ];

    return [...dataRows, totalRow];
  }, [paginatedRows, page, pageSize, selectedIds, toggleRowSelected, salesColumnTotals]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          SALES LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={CancelIcon} alt="" className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={EditIcon} alt="" className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400 placeholder:font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:h-7 sm:shrink-0 sm:flex-nowrap">
          {selectedRowCount >= 1 ? (
            <button
              type="button"
              className={primaryToolbarBtn}
              style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleDeleteSelected}
              aria-label={`Delete ${selectedRowCount} selected sale${selectedRowCount === 1 ? '' : 's'}`}
            >
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 shrink-0 brightness-0 invert" />
              Delete
            </button>
          ) : null}

          <button
            type="button"
            className={figmaToolbarBtn}
            onClick={() => setDateModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={dateModalOpen}
          >
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
            title="Bill date"
            initialRange={appliedDateRange}
            onClose={() => setDateModalOpen(false)}
            onApply={(range) => setAppliedDateRange(range)}
          />

          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[11rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none sm:min-w-[7.5rem]"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="dateDesc">Sort: Date (newest)</option>
              <option value="amountDesc">Sort: Amount (high)</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>

          <button
            type="button"
            className={figmaToolbarBtn}
            aria-expanded={filterDrawerOpen}
            aria-haspopup="dialog"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <img src={FilterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[6rem] truncate sm:max-w-[7rem]">
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
            </span>
            <ToolbarChevron />
          </button>
        </div>
      </div>

      <SalesFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        stations={STATIONS}
        postStatusOptions={POST_STATUS_OPTIONS}
        transactionTypeOptions={TRANSACTION_TYPES}
        applied={salesFilters}
        onApply={setSalesFilters}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="sales-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={false}
          truncateHeader
          truncateBody
          columnWidthPercents={SALES_LIST_COL_PCT}
          tableClassName="min-w-0 w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize + 1, 24)}
          headers={[
            '',
            'Sl no',
            'Bill no',
            'Counter',
            'Bill date',
            'Bill time',
            'Payment mode',
            'Local bill no',
            'Customer LP no',
            'Customer name',
            'TRN no',
            'Sales man',
            'Sub total',
            'Discount',
            'Tax amount',
            'Round off adj',
            'Amount',
            'Post status',
            'Counter close',
            'Remarks',
            'STN',
          ]}
          rows={tableRows}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing{' '}
              <span className="text-black">{rangeStart}</span>
              {'–'}
              <span className="text-black">{rangeEnd}</span> of{' '}
              <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300"
                aria-label="Rows per page"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
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
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${
                      active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                    } ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
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
