import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as deliveryOrderEntryApi from '../../../services/deliveryOrderEntry.api.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import { getSessionUser } from '../../../core/auth/auth.service.js';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[280px] sm:max-w-[640px] sm:pr-3 md:min-w-[360px] md:max-w-[320px]`;
const purchaseToolbarBtn =
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50';
const purchaseToolbarSelect =
  'relative inline-flex h-7 min-h-7 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50';

/** Checkbox, DO no, DO date, Time, Quotation, Customer, Invoice, Post, Disc, Amount */
const DELIVERY_ORDER_LIST_COL_PCT = [2, 12, 10, 6, 12, 24, 10, 8, 7, 9];

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function parseListDate(ddmmyyyy) {
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

function parseMoneyValue(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatApiDate(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  const d = String(dt.getDate()).padStart(2, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const y = dt.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatApiTime(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

function displayOrDash(value) {
  const s = String(value ?? '').trim();
  return s || '-';
}

function branchLabel(branch) {
  return [branch.branchCode, branch.branchName].filter(Boolean).join(' - ') || `Branch ${branch.branchId}`;
}

function mapApiDeliveryOrder(row, branchMap) {
  const branchId = row.branchId != null ? String(row.branchId) : '';
  return {
    id: String(row.deliveryOrderId ?? row.deliveryOrderNo ?? branchId),
    branchId,
    station: branchMap.get(branchId) || (branchId ? `Branch ${branchId}` : '-'),
    deliveryOrderNo: displayOrDash(row.deliveryOrderNo),
    deliveryOrderDate: formatApiDate(row.deliveryOrderDate),
    time: formatApiTime(row.deliveryOrderDate),
    quotationNo: displayOrDash(row.quotationNo),
    customerName: displayOrDash(row.customerName),
    invoiceStatus: displayOrDash(row.invoiceStatus || 'PENDING'),
    postStatus: displayOrDash(row.postStatus),
    discount: formatMoney(row.discount),
    totalAmount: formatMoney(row.totalAmount),
  };
}

export default function DeliveryOrderList() {
  const user = getSessionUser();
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingDeliveryOrders, setLoadingDeliveryOrders] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [stationFilter, setStationFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  const filterWrapRef = useRef(null);
  selectedIdsRef.current = selectedIds;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      setLoadError('');
      try {
        const { data } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        const list = data.branches || [];
        setBranches(list);
        const station = user?.stationId != null ? String(user.stationId) : '';
        const stationInList = list.some((branch) => String(branch.branchId) === station);
        if (list.length === 1) setBranchId(String(list[0].branchId));
        else if (stationInList) setBranchId(station);
        else if (list[0]) setBranchId(String(list[0].branchId));
        else setBranchId('');
      } catch {
        if (!cancelled) {
          setBranches([]);
          setLoadError('Could not load branches.');
        }
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.stationId]);

  const branchMap = useMemo(
    () => new Map(branches.map((branch) => [String(branch.branchId), branchLabel(branch)])),
    [branches],
  );

  useEffect(() => {
    if (loadingBranches) return undefined;
    if (!branchId) {
      setDeliveryOrders([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingDeliveryOrders(true);
      setLoadError('');
      try {
        const { data } = await deliveryOrderEntryApi.listDeliveryOrders({
          branchId: Number(branchId),
          limit: 200,
          offset: 0,
        });
        if (cancelled) return;
        setDeliveryOrders((data.deliveryOrders || []).map((row) => mapApiDeliveryOrder(row, branchMap)));
      } catch (err) {
        if (!cancelled) {
          setDeliveryOrders([]);
          setLoadError(err.response?.data?.message || 'Could not load delivery orders.');
        }
      } finally {
        if (!cancelled) setLoadingDeliveryOrders(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId, branchMap, loadingBranches, refreshKey]);

  const branchOptions = useMemo(
    () => branches.map((branch) => ({ value: String(branch.branchId), label: branchLabel(branch) })),
    [branches],
  );

  const stationOptions = useMemo(() => {
    const set = new Set();
    deliveryOrders.forEach((row) => {
      if (row.station && row.station !== '-') set.add(row.station);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [deliveryOrders]);

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
    setDeliveryOrders((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, appliedDateRange, stationFilter]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(deliveryOrders.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [deliveryOrders]);

  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? deliveryOrders.filter(
          (r) =>
            r.deliveryOrderNo.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.quotationNo.toLowerCase().includes(q) ||
            r.invoiceStatus.toLowerCase().includes(q),
        )
      : [...deliveryOrders];

    if (appliedDateRange?.from && appliedDateRange?.to) {
      const rf = appliedDateRange.from.getTime();
      const rt = appliedDateRange.to.getTime();
      list = list.filter((r) => {
        const rd = parseListDate(r.deliveryOrderDate);
        if (!rd) return false;
        const t = rd.getTime();
        return t >= rf && t <= rt;
      });
    }

    if (stationFilter) list = list.filter((r) => r.station === stationFilter);

    const sorted = [...list];
    if (sortBy === 'dateDesc') {
      sorted.sort((a, b) => String(b.deliveryOrderDate).localeCompare(String(a.deliveryOrderDate)));
    } else if (sortBy === 'amountDesc') {
      sorted.sort((a, b) => parseMoneyValue(b.totalAmount) - parseMoneyValue(a.totalAmount));
    }
    return sorted;
  }, [search, sortBy, appliedDateRange, stationFilter, deliveryOrders]);

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
    let disc = 0;
    let amt = 0;
    for (const r of filteredRows) {
      disc += parseMoneyValue(r.discount);
      amt += parseMoneyValue(r.totalAmount);
    }
    return { disc, amt };
  }, [filteredRows]);

  const tableRows = useMemo(() => {
    const dataRows = paginatedRows.map((r) => {
      const checked = selectedIds.has(r.id);
      return [
        <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
            aria-label={`Select ${r.deliveryOrderNo}`}
          />
        </div>,
        r.deliveryOrderNo,
        r.deliveryOrderDate,
        r.time,
        r.quotationNo,
        r.customerName,
        r.invoiceStatus,
        r.postStatus,
        r.discount,
        r.totalAmount,
      ];
    });

    const totalRow = [
      {
        content: <div key="delivery-order-list-total" className="text-left font-bold">Total</div>,
        colSpan: 8,
        className: 'align-middle font-bold',
      },
      columnTotals.disc.toFixed(2),
      columnTotals.amt.toFixed(2),
    ];
    return [...dataRows, totalRow];
  }, [paginatedRows, selectedIds, toggleRowSelected, columnTotals]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const emptyMessage = loadingBranches || loadingDeliveryOrders
    ? 'Loading delivery orders...'
    : loadError || 'No delivery orders match the current view.';

  const loading = loadingBranches || loadingDeliveryOrders;

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          DELIVERY ORDER LIST
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" className={purchaseToolbarBtn} title="Print" aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3 w-3" />
            Print
          </button>
          <button type="button" className={purchaseToolbarBtn} title="Cancel" aria-label="Cancel">
            <img src={CancelIcon} alt="" className="h-3 w-3" />
            Cancel
          </button>
          <button
            type="button"
            className={purchaseToolbarBtn}
            title="Refresh"
            aria-label="Refresh delivery orders"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
          >
            Refresh
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
          {branchOptions.length > 1 ? (
            <div className={purchaseToolbarSelect}>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="h-7 min-w-[8.5rem] max-w-[13rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-xs font-medium text-neutral-700 outline-none"
                aria-label="Branch"
                disabled={loading}
              >
                {branchOptions.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                <ToolbarChevron />
              </span>
            </div>
          ) : null}

          {selectedRowCount >= 1 ? (
            <button
              type="button"
              className={purchaseToolbarBtn}
              onClick={handleDeleteSelected}
              aria-label={`Delete ${selectedRowCount} selected delivery order${selectedRowCount === 1 ? '' : 's'}`}
            >
              <img src={DeleteIcon} alt="" className="h-3 w-3" />
              Delete
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setDateModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={dateModalOpen}
            title="Select Date"
            aria-label="Select Date"
            className={purchaseToolbarBtn}
          >
            <img src={CalendarIcon} alt="" className="h-3 w-3 shrink-0" />
            <span className="max-w-[min(100%,9rem)] truncate sm:max-w-[10.5rem]">
              {appliedDateRange
                ? `${formatDDMMYYYY(appliedDateRange.from)} – ${formatDDMMYYYY(appliedDateRange.to)}`
                : 'Select Date'}
            </span>
            <ToolbarChevron />
          </button>

          <QuotationDateRangeModal
            open={dateModalOpen}
            title="Delivery Order Date"
            initialRange={appliedDateRange}
            onClose={() => setDateModalOpen(false)}
            onApply={(range) => setAppliedDateRange(range)}
          />

          <div className={purchaseToolbarSelect}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[11rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-xs font-medium text-neutral-700 outline-none sm:min-w-[7.5rem]"
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

          <div className="relative shrink-0" ref={filterWrapRef}>
            <button
              type="button"
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
              onClick={() => setFilterOpen((o) => !o)}
              title="Filters"
              aria-label="Filters"
              className={purchaseToolbarBtn}
            >
              <img src={FilterIcon} alt="" className="h-3 w-3 shrink-0" />
              <span className="max-w-[5rem] truncate sm:max-w-[6rem]">
                {stationFilter ? `Station: ${stationFilter}` : 'Filters'}
              </span>
              <ToolbarChevron />
            </button>
            {filterOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-0.5 min-w-[9.5rem] rounded-md border border-neutral-200 bg-white py-1 shadow-md"
                role="listbox"
                aria-label="Stations"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={stationFilter === null}
                  className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 sm:px-3"
                  onClick={() => {
                    setStationFilter(null);
                    setFilterOpen(false);
                  }}
                >
                  All stations
                </button>
                <div className="my-0.5 border-t border-neutral-100" />
                {stationOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={stationFilter === s}
                    className={`w-full px-2.5 py-1.5 text-left text-xs font-medium hover:bg-neutral-50 sm:px-3 ${
                      stationFilter === s ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-700'
                    }`}
                    onClick={() => {
                      setStationFilter(s);
                      setFilterOpen(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {loading || loadError ? (
        <div
          className={`shrink-0 rounded border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] ${
            loadError ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
          role="status"
          aria-live="polite"
        >
          {emptyMessage}
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="delivery-order-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          columnWidthPercents={DELIVERY_ORDER_LIST_COL_PCT}
          tableClassName="min-w-[min(100%,780px)] sm:min-w-[980px] lg:min-w-0"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.9vw, 9px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(9px, 1.25vw, 12px)"
          cellPaddingClass="px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize + 1, 24)}
          headers={[
            '',
            'DO no',
            'DO date',
            'Time',
            'Quotation no',
            'Customer name',
            'Invoice status',
            'Post status',
            'Discount',
            'Amount',
          ]}
          rows={tableRows}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of{' '}
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
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[8px] font-semibold text-black outline-none hover:border-gray-300"
                aria-label="Rows per page"
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          {selectedRowCount >= 1 ? (
            <p className="justify-self-center text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold sm:text-[11px]" style={{ color: primary }} role="status" aria-live="polite">
              {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
            </p>
          ) : (
            <span className="hidden sm:block" aria-hidden />
          )}

          <div className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation" aria-label="Pagination">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
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
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
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
