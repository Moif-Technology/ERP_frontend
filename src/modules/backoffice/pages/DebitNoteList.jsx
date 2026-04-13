import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
const STN_CODES = ['STN-M01', 'STN-N02', 'STN-S03', 'STN-W04', 'STN-EX05'];

const ACCOUNT_HEADS = [
  '2100 – Supplier control',
  '2200 – GRNI / Accrued purchases',
  '5100 – Purchase expense',
  '4100 – VAT input',
  '5200 – Import charges',
  '2001 – Trade payables',
  '5300 – Asset capitalization',
];

const PARTICULARS = [
  'Debit note – supplier rate revision',
  'Additional freight – GRN shortfall',
  'Price difference – invoice vs PO',
  'Quality claim – rejected lot',
  'Service charge – customs handling',
  'Interest on overdue – supplier terms',
];

const VOUCHER_TYPES = ['Goods', 'Services', 'Asset', 'Import', 'Local'];
const VOUCHER_GROUPS = ['Supplier debit', 'Purchase return', 'Expense', 'Journal', 'Adjustment'];
const POST_STATUS_OPTIONS = ['Draft', 'Posted'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Checkbox + Sl., Vch no, Date, Part., Type, Ref., amounts, Sts., Rmk., STN, TRN */
const DN_LIST_COL_PCT = [2, 2, 5, 6, 26, 6, 6, 6, 6, 6, 5, 5, 6, 13];

function buildDummyDebitNoteVouchers(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const seq = 1800 - i;
    const d = 1 + (i % 28);
    const m = 1 + (i % 4);
    const y = 2026;
    const voucherDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    const subNum = 680 + (i * 179) % 36000 + (i % 5) * 61.5;
    const taxNum = subNum * 0.05 + (i % 3) * 11;
    const voucherNum = subNum + taxNum;
    const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    rows.push({
      id: String(i + 1),
      accHead: ACCOUNT_HEADS[i % ACCOUNT_HEADS.length],
      station: STATIONS[i % STATIONS.length],
      stnCode: STN_CODES[i % STN_CODES.length],
      voucherGroup: VOUCHER_GROUPS[i % VOUCHER_GROUPS.length],
      voucherNo: `DN-2026-${String(seq).padStart(5, '0')}`,
      voucherDate,
      particular: PARTICULARS[i % PARTICULARS.length],
      voucherType: VOUCHER_TYPES[i % VOUCHER_TYPES.length],
      refNo: `DNREF-${(66000 + i * 27) % 99000}`,
      subTotal: fmt(subNum),
      taxAmount: fmt(taxNum),
      voucherAmount: fmt(voucherNum),
      status: i % 7 === 0 ? 'Draft' : 'Posted',
      remark: i % 5 === 0 ? 'Approved by AP' : i % 5 === 1 ? 'Pending supplier ack' : '—',
      trnNo: `150-${(250000000 + i * 100007) % 900000000}`,
    });
  }
  return rows;
}

const DUMMY_DN = buildDummyDebitNoteVouchers(42);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const primaryLinkBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseVoucherDate(ddmmyyyy) {
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

const SEARCH_PLACEHOLDER = 'Search by voucher no, acc head, ref no, post status…';

export default function DebitNoteList() {
  const [vouchers, setVouchers] = useState(() => DUMMY_DN.map((r) => ({ ...r })));
  const [search, setSearch] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dnFilters, setDnFilters] = useState({
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
    setVouchers((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, appliedDateRange, dnFilters]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(vouchers.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [vouchers]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (dnFilters.station) n += 1;
    if (dnFilters.transactionType) n += 1;
    return n;
  }, [dnFilters.station, dnFilters.transactionType]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? vouchers.filter(
          (r) =>
            r.voucherNo.toLowerCase().includes(q) ||
            r.accHead.toLowerCase().includes(q) ||
            r.refNo.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q) ||
            r.particular.toLowerCase().includes(q) ||
            r.remark.toLowerCase().includes(q) ||
            r.stnCode.toLowerCase().includes(q) ||
            r.station.toLowerCase().includes(q) ||
            r.trnNo.toLowerCase().includes(q)
        )
      : [...vouchers];

    if (appliedDateRange?.from && appliedDateRange?.to) {
      const rf = appliedDateRange.from.getTime();
      const rt = appliedDateRange.to.getTime();
      list = list.filter((r) => {
        const rd = parseVoucherDate(r.voucherDate);
        if (!rd) return false;
        const t = rd.getTime();
        return t >= rf && t <= rt;
      });
    }

    if (dnFilters.station) {
      list = list.filter((r) => r.station === dnFilters.station);
    }
    if (dnFilters.transactionType) {
      list = list.filter((r) => r.voucherGroup === dnFilters.transactionType);
    }

    const sorted = [...list];
    if (sortBy === 'dateDesc') {
      sorted.sort((a, b) => String(b.voucherDate).localeCompare(String(a.voucherDate)));
    } else if (sortBy === 'amountDesc') {
      sorted.sort(
        (a, b) =>
          parseMoneyValue(b.voucherAmount) - parseMoneyValue(a.voucherAmount)
      );
    }
    return sorted;
  }, [search, sortBy, appliedDateRange, dnFilters, vouchers]);

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

  const columnTotals = useMemo(() => {
    let sub = 0;
    let tax = 0;
    let voucher = 0;
    for (const r of filteredRows) {
      sub += parseMoneyValue(r.subTotal);
      tax += parseMoneyValue(r.taxAmount);
      voucher += parseMoneyValue(r.voucherAmount);
    }
    return { sub, tax, voucher };
  }, [filteredRows]);

  const tableRows = useMemo(() => {
    const dataRows = paginatedRows.map((r, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      const checked = selectedIds.has(r.id);
      return [
        <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
            aria-label={`Select ${r.voucherNo}`}
          />
        </div>,
        slNo,
        r.voucherNo,
        r.voucherDate,
        <span key={`p-${r.id}`} className="block w-full text-left">
          {r.particular}
        </span>,
        r.voucherType,
        r.refNo,
        r.subTotal,
        r.taxAmount,
        r.voucherAmount,
        r.status,
        r.remark,
        r.stnCode,
        r.trnNo,
      ];
    });

    const fmtTot = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalRow = [
      {
        content: (
          <div key="dn-list-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 7,
        className: 'align-middle font-bold',
      },
      fmtTot(columnTotals.sub),
      fmtTot(columnTotals.tax),
      fmtTot(columnTotals.voucher),
      '',
      '',
      '',
      '',
    ];

    return [...dataRows, totalRow];
  }, [paginatedRows, page, pageSize, selectedIds, toggleRowSelected, columnTotals]);

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
        <h1
          className="shrink-0 text-base font-bold sm:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          DEBIT NOTE LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/debit-note-entry"
            className={primaryLinkBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            New debit note
          </Link>
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
            placeholder={SEARCH_PLACEHOLDER}
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
              aria-label={`Delete ${selectedRowCount} selected ${selectedRowCount === 1 ? 'note' : 'notes'}`}
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
            title="Voucher date"
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
        fieldOrder={['station', 'transactionType']}
        filterLabels={{
          station: 'Station',
          transactionType: 'Voucher group',
        }}
        stations={STATIONS}
        postStatusOptions={POST_STATUS_OPTIONS}
        transactionTypeOptions={VOUCHER_GROUPS}
        applied={dnFilters}
        onApply={setDnFilters}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="debit-note-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          columnWidthPercents={DN_LIST_COL_PCT}
          tableClassName="min-w-[1020px] w-full"
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
            'Sl.',
            'Vch no',
            'Date',
            'Part.',
            'Type',
            'Ref.',
            'Sub tot.',
            'Tax amt.',
            'Vch amt.',
            'Sts.',
            'Rmk.',
            'STN',
            'TRN',
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
