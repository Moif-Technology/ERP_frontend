import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
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

const BRANDS = ['Nova', 'Vertex', 'Apex', 'Pulse', 'Zenith'];
const PRODUCT_GROUPS = ['Grocery', 'Beverages', 'Household', 'Electronics', 'Personal care'];
const ADJ_SUPPLIERS = ['Fresh Foods', 'Metro Supply', 'Global Trade', 'Walk-in vendor', 'Alpha Dist.'];
const STORES = ['Main store', 'Branch', 'DC — East', 'Outlet Mall', 'Express hub'];

const REORDER_STATUS = ['Suggested', 'Approved', 'Ordered', 'Hold'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[280px] sm:max-w-[640px] sm:pr-3 md:min-w-[360px] md:max-w-[320px]`;
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

/** Checkbox + Stock adj no, Post status, Remarks */
const ADJUSTMENT_COL_PCT = [3, 22, 18, 57];
/** Checkbox + Bar code … Reorder qty (reorder list) */
const REORDER_COL_PCT = [2, 12, 18, 13, 12, 11, 12, 20];

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

function parseQty(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const ADJ_POST_STATUS = ['Posted', 'Draft', 'Pending'];

function buildDummyAdjustments(count) {
  const remarkLines = [
    'Cycle count variance — DC East',
    'Damaged stock write-off (leakage)',
    'Supplier return credited',
    'Opening balance correction',
    'Promo sample allocation',
    'Expiry pull — beverages aisle',
  ];
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    rows.push({
      id: String(i + 1),
      stockAdjNo: `SA-2026-${String(i + 1).padStart(5, '0')}`,
      postStatus: ADJ_POST_STATUS[i % ADJ_POST_STATUS.length],
      remarks: remarkLines[i % remarkLines.length],
      brand: BRANDS[i % BRANDS.length],
      group: PRODUCT_GROUPS[i % PRODUCT_GROUPS.length],
      supplier: ADJ_SUPPLIERS[i % ADJ_SUPPLIERS.length],
    });
  }
  return rows;
}

function buildDummyReorders(count) {
  const products = [
    ['10000000004902', 'Mango juice 1L'],
    ['10000000004903', 'Mineral water 500ml'],
    ['10000000004904', 'Snack mix 200g'],
    ['10000000004905', 'Cooking oil 2L'],
    ['10000000004906', 'Rice 5kg'],
  ];
  const suppliers = ['Fresh Foods', 'Metro Supply', 'Global Trade', 'Walk-in vendor', 'Alpha Dist.'];
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const [code, desc] = products[i % products.length];
    const d = 3 + (i % 24);
    const m = 1 + (i % 4);
    const y = 2026;
    const reviewDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    const rol = 20 + (i % 15);
    const qoh = (i * 13) % rol;
    const reorderQty = Math.max(0, rol - qoh + (i % 5) * 4);
    const uc = (2.8 + (i * 0.37) % 42).toFixed(2);
    rows.push({
      id: String(i + 1),
      store: STORES[i % STORES.length],
      barcode: code,
      shortDescription: desc,
      pktDetails: `${5 + (i % 9)} / ${i % 2 === 0 ? 'Carton' : 'Pack'}`,
      qtyOnHand: String(qoh),
      unitCost: uc,
      reorderLevel: String(rol),
      reorderQty: String(reorderQty),
      lastSupplier: suppliers[i % suppliers.length],
      reviewDate,
      status: REORDER_STATUS[i % REORDER_STATUS.length],
    });
  }
  return rows;
}

/**
 * QuotationList-style listing for Stock Hub: stock adjustment list or reorder list.
 * @param {{ variant: 'adjustment' | 'reorder' }} props
 */
export default function StockHubListPage({ variant }) {
  const isAdjustment = variant === 'adjustment';
  const title = isAdjustment ? 'STOCK ADJUSTMENT LIST' : 'REORDER LIST';
  const headers = isAdjustment
    ? ['', 'Stock adj no', 'Post status', 'Remarks']
    : ['', 'Bar code', 'Short description', 'Pkt. details', 'Qty on hand', 'Unit cost', 'Reorder level', 'Reorder qty'];
  const colPct = isAdjustment ? ADJUSTMENT_COL_PCT : REORDER_COL_PCT;

  const [rows, setRows] = useState(() =>
    (isAdjustment ? buildDummyAdjustments(48) : buildDummyReorders(48)).map((r) => ({ ...r }))
  );
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const filterWrapRef = useRef(null);

  const locationOptions = isAdjustment ? BRANDS : STORES;
  const filterLabel = isAdjustment ? 'Brand' : 'Store';

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
    setRows((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, locationFilter]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(rows.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [rows]);

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
    let list = [...rows];

    if (q) {
      list = list.filter((r) => {
        if (isAdjustment) {
          return (
            r.stockAdjNo.toLowerCase().includes(q) ||
            r.postStatus.toLowerCase().includes(q) ||
            r.remarks.toLowerCase().includes(q) ||
            r.brand.toLowerCase().includes(q) ||
            r.group.toLowerCase().includes(q) ||
            r.supplier.toLowerCase().includes(q)
          );
        }
        return (
          r.barcode.toLowerCase().includes(q) ||
          r.shortDescription.toLowerCase().includes(q) ||
          r.lastSupplier.toLowerCase().includes(q) ||
          r.store.toLowerCase().includes(q)
        );
      });
    }

    if (locationFilter) {
      list = list.filter((r) => (isAdjustment ? r.brand : r.store) === locationFilter);
    }

    const sorted = [...list];
    if (sortBy === 'dateDesc' && !isAdjustment) {
      sorted.sort((a, b) => {
        const da = parseListDate(a.reviewDate);
        const db = parseListDate(b.reviewDate);
        if (!da || !db) return 0;
        return db.getTime() - da.getTime();
      });
    } else if (sortBy === 'qtyDesc' && !isAdjustment) {
      sorted.sort((a, b) => parseQty(b.reorderQty) - parseQty(a.reorderQty));
    } else if (isAdjustment) {
      if (sortBy === 'adjNoDesc') {
        sorted.sort((a, b) => b.stockAdjNo.localeCompare(a.stockAdjNo, undefined, { numeric: true }));
      } else if (sortBy === 'postStatusAsc') {
        sorted.sort((a, b) => a.postStatus.localeCompare(b.postStatus));
      }
    }
    return sorted;
  }, [search, sortBy, locationFilter, rows, isAdjustment]);

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

  const reorderColumnTotals = useMemo(() => {
    if (isAdjustment) return null;
    let qoh = 0;
    let rq = 0;
    let ucSum = 0;
    const n = filteredRows.length;
    for (const r of filteredRows) {
      qoh += parseQty(r.qtyOnHand);
      rq += parseQty(r.reorderQty);
      ucSum += parseQty(r.unitCost);
    }
    return { qoh, rq, avgUnitCost: n ? ucSum / n : 0 };
  }, [filteredRows, isAdjustment]);

  const tableRows = useMemo(() => {
    if (isAdjustment) {
      return paginatedRows.map((r) => {
        const checked = selectedIds.has(r.id);
        const chk = (
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
              aria-label={`Select ${r.stockAdjNo}`}
            />
          </div>
        );
        return [chk, r.stockAdjNo, r.postStatus, r.remarks];
      });
    }

    const dataRows = paginatedRows.map((r) => {
      const checked = selectedIds.has(r.id);
      const chk = (
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
            aria-label={`Select ${r.barcode}`}
          />
        </div>
      );
      return [chk, r.barcode, r.shortDescription, r.pktDetails, r.qtyOnHand, r.unitCost, r.reorderLevel, r.reorderQty];
    });

    const t = reorderColumnTotals;
    if (!t) return dataRows;
    const totalRow = [
      { content: '', colSpan: 1 },
      {
        content: (
          <div key="stock-hub-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 3,
        className: 'align-middle font-bold',
      },
      t.qoh.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      t.avgUnitCost.toFixed(2),
      '—',
      t.rq.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    ];
    return [...dataRows, totalRow];
  }, [paginatedRows, selectedIds, toggleRowSelected, reorderColumnTotals, isAdjustment]);

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
          {title}
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
            placeholder={
              isAdjustment ? 'Search by adj. no, status, remarks, brand, group, supplier' : 'Search'
            }
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
              aria-label={`Delete ${selectedRowCount} selected row${selectedRowCount === 1 ? '' : 's'}`}
            >
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 shrink-0 brightness-0 invert" />
              Delete
            </button>
          ) : null}

          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[11rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none sm:min-w-[7.5rem]"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              {isAdjustment ? (
                <>
                  <option value="adjNoDesc">Sort: Stock adj no (high)</option>
                  <option value="postStatusAsc">Sort: Post status (A–Z)</option>
                </>
              ) : (
                <>
                  <option value="dateDesc">Sort: Date (newest)</option>
                  <option value="qtyDesc">Sort: Reorder qty (high)</option>
                </>
              )}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>

          <div className="relative shrink-0" ref={filterWrapRef}>
            <button
              type="button"
              className={figmaToolbarBtn}
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
              onClick={() => setFilterOpen((o) => !o)}
            >
              <img src={FilterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[5rem] truncate sm:max-w-[6rem]">
                {locationFilter ? `${filterLabel}: ${locationFilter}` : 'Filters'}
              </span>
              <ToolbarChevron />
            </button>
            {filterOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-0.5 min-w-[9.5rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
                role="listbox"
                aria-label={filterLabel}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={locationFilter === null}
                  className="w-full px-2.5 py-1.5 text-left text-[10px] font-semibold text-gray-700 hover:bg-rose-50 sm:px-3 sm:text-[11px]"
                  onClick={() => {
                    setLocationFilter(null);
                    setFilterOpen(false);
                  }}
                >
                  All {isAdjustment ? 'brands' : 'stores'}
                </button>
                <div className="my-0.5 border-t border-gray-100" />
                {locationOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={locationFilter === s}
                    className={`w-full px-2.5 py-1.5 text-left text-[10px] font-semibold hover:bg-rose-50 sm:px-3 sm:text-[11px] ${
                      locationFilter === s ? 'text-[#790728] bg-rose-50/80' : 'text-gray-800'
                    }`}
                    onClick={() => {
                      setLocationFilter(s);
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="stock-hub-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          columnWidthPercents={colPct}
          tableClassName={
            isAdjustment
              ? 'min-w-[min(100%,480px)] sm:min-w-[560px] lg:min-w-0'
              : 'min-w-[min(100%,640px)] sm:min-w-[760px] lg:min-w-0'
          }
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.9vw, 9px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(9px, 1.25vw, 12px)"
          cellPaddingClass="px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize + 1, 24)}
          headers={headers}
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
