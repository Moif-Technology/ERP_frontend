import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';
import * as purchaseEntryApi from '../../../services/purchaseEntry.api.js';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import { AppActionButton } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';

const primary = colors.primary?.main || '#790728';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[280px] sm:max-w-[640px] sm:pr-3 md:min-w-[360px] md:max-w-[320px]`;

const GRN_LIST_COL_PCT = [12, 12, 28, 12, 10, 10, 16];

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

function displayOrDash(value) {
  const s = String(value ?? '').trim();
  return s || '-';
}

function branchLabel(branch) {
  return [branch.branchCode, branch.branchName].filter(Boolean).join(' - ') || `Branch ${branch.branchId}`;
}

function mapApiGrn(row, supplierMap) {
  const supplierId = row.supplierId != null ? String(row.supplierId) : '';
  return {
    id: String(row.grnId ?? row.grnNo ?? `${supplierId}-${row.grnDate}`),
    grnNo: displayOrDash(row.grnNo || row.grnId),
    grnDate: formatApiDate(row.grnDate),
    supplierName: supplierMap.get(supplierId) || (supplierId ? `Supplier ${supplierId}` : '-'),
    invoiceAmount: formatMoney(row.invoiceAmount),
    postStatus: displayOrDash(row.postStatus),
    transactionType: displayOrDash(row.transactionType),
    remarks: displayOrDash(row.remarks),
  };
}

export default function GoodsReceiveNoteList() {
  const user = getSessionUser();
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [{ data: branchData }, { data: supplierData }] = await Promise.all([
          staffEntryApi.fetchStaffBranches(),
          supplierEntryApi.listSuppliers({ limit: 2000 }),
        ]);
        if (cancelled) return;
        const list = branchData.branches || [];
        setBranches(list);
        setSuppliers(supplierData.suppliers || []);

        const station = user?.stationId != null ? String(user.stationId) : '';
        const stationInList = list.some((b) => String(b.branchId) === station);
        if (list.length === 1) setBranchId(String(list[0].branchId));
        else if (stationInList) setBranchId(station);
        else if (list[0]) setBranchId(String(list[0].branchId));
        else setBranchId('');
      } catch {
        if (!cancelled) {
          setBranches([]);
          setSuppliers([]);
          setBranchId('');
          setLoadError('Could not load branches / suppliers.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.stationId]);

  const supplierMap = useMemo(
    () => new Map((suppliers || []).map((s) => [String(s.supplierId), s.supplierName])),
    [suppliers],
  );

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: String(b.branchId), label: branchLabel(b) })),
    [branches],
  );

  useEffect(() => {
    if (!branchId) {
      setGrns([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data } = await purchaseEntryApi.listGrnsForPurchase({ branchId: Number(branchId), limit: 200 });
        if (cancelled) return;
        setGrns((data.grns || []).map((row) => mapApiGrn(row, supplierMap)));
      } catch (err) {
        if (!cancelled) {
          setGrns([]);
          setLoadError(err.response?.data?.message || 'Could not load GRN list.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId, refreshKey, supplierMap]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, appliedDateRange]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? grns.filter(
          (r) =>
            r.grnNo.toLowerCase().includes(q) ||
            r.supplierName.toLowerCase().includes(q) ||
            r.postStatus.toLowerCase().includes(q) ||
            r.transactionType.toLowerCase().includes(q) ||
            r.remarks.toLowerCase().includes(q)
        )
      : [...grns];

    if (appliedDateRange?.from && appliedDateRange?.to) {
      const rf = appliedDateRange.from.getTime();
      const rt = appliedDateRange.to.getTime();
      list = list.filter((r) => {
        const rd = parseListDate(r.grnDate);
        if (!rd) return false;
        const t = rd.getTime();
        return t >= rf && t <= rt;
      });
    }

    const sorted = [...list];
    if (sortBy === 'dateDesc') sorted.sort((a, b) => String(b.grnDate).localeCompare(String(a.grnDate)));
    return sorted;
  }, [search, grns, appliedDateRange, sortBy]);

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

  const tableRows = useMemo(
    () =>
      paginatedRows.map((r) => [r.grnNo, r.grnDate, r.supplierName, r.invoiceAmount, r.postStatus, r.transactionType, r.remarks]),
    [paginatedRows],
  );

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const emptyMessage = loading ? 'Loading GRN list...' : loadError || 'No GRNs match the current view.';

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          GRN LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <AppActionButton
            title="Print"
            ariaLabel="Print"
            icon={<img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />}
            className="h-7 px-2 text-[10px]"
          />
          <AppActionButton
            title="Cancel"
            ariaLabel="Cancel"
            icon={<img src={CancelIcon} alt="" className="h-3.5 w-3.5" />}
            className="h-7 px-2 text-[10px]"
          >
            Cancel
          </AppActionButton>
          <AppActionButton
            title="Refresh"
            ariaLabel="Refresh GRN list"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="h-7 px-2 text-[10px]"
          >
            Refresh
          </AppActionButton>
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
            <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="h-7 min-w-[8.5rem] max-w-[13rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
                aria-label="Branch"
                disabled={loading}
              >
                {branchOptions.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                <ToolbarChevron />
              </span>
            </div>
          ) : null}

          <AppActionButton
            onClick={() => setDateModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={dateModalOpen}
            title="Select Date"
            ariaLabel="Select Date"
            icon={<img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />}
            className="h-7 px-2 text-[10px]"
          >
            <span className="max-w-[min(100%,9rem)] truncate sm:max-w-[10.5rem]">
              {appliedDateRange
                ? `${formatDDMMYYYY(appliedDateRange.from)} – ${formatDDMMYYYY(appliedDateRange.to)}`
                : 'Select Date'}
            </span>
            <ToolbarChevron />
          </AppActionButton>

          <QuotationDateRangeModal
            open={dateModalOpen}
            title="GRN Date"
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
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
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
          className="grn-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          columnWidthPercents={GRN_LIST_COL_PCT}
          tableClassName="min-w-[min(100%,720px)] sm:min-w-[940px] lg:min-w-0"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.9vw, 9px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(9px, 1.25vw, 12px)"
          cellPaddingClass="px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize + 1, 24)}
          headers={['GRN no', 'Date', 'Supplier', 'Invoice amt', 'Post', 'Type', 'Remarks']}
          rows={tableRows}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_1fr] sm:gap-x-2 sm:gap-y-0">
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

