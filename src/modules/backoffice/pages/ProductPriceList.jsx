import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import ProductListFilterDrawer from '../../../shared/components/ui/ProductListFilterDrawer';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
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

const SUPPLIERS = [
  'Alpha Distributors LLC',
  'Blue Ocean Trading',
  'City Wholesale Co.',
  'Metro Supplies Inc.',
  'Global Import Partners',
];

const BRANDS = ['Nova', 'Vertex', 'Summit', 'Apex', 'Pulse', 'Zenith'];

const PRODUCT_GROUPS = ['Grocery', 'Beverages', 'Household', 'Electronics', 'Personal care'];

const SUB_GROUPS = ['Dry goods', 'Chilled', 'Ambient', 'Disposables', 'Accessories', 'Core range'];

const RACK_LOCATIONS = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01', 'C-02', 'D-01', 'STAGING-1'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const SEARCH_COLUMN_OPTIONS = [
  { value: 'all', label: 'All (supplier, brand, group, sub group)' },
  { value: 'supplier', label: 'Supplier name' },
  { value: 'brand', label: 'Product brand' },
  { value: 'group', label: 'Group' },
  { value: 'subgroup', label: 'Sub group' },
];

/** Checkbox + 7 columns — widths sum to 100 */
const PPL_COL_PCT = [2, 14, 22, 22, 10, 12, 8, 10];

function fmtMoney(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Line total incl. VAT: qty × unit × (1 + VAT/100) */
function lineTotalInclVat(qty, unitPrice, vatPct) {
  const q = Number(qty);
  const u = Number(unitPrice);
  const v = Number(vatPct);
  if (!Number.isFinite(q) || !Number.isFinite(u)) return 0;
  const net = q * u;
  const vat = Number.isFinite(v) ? net * (v / 100) : 0;
  return net + vat;
}

function buildDummyRows(count) {
  const vatRates = [0, 5, 15, 15, 5];
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const unit = 2.5 + (i * 31) % 95 + (i % 4) * 1.25;
    const qty = 5 + (i * 7) % 240;
    const vatPct = vatRates[i % vatRates.length];
    const total = lineTotalInclVat(qty, unit, vatPct);
    rows.push({
      id: String(i + 1),
      barcode: `628${String(1000000 + i * 173).slice(-10)}`,
      shortDescription: `SKU item ${i + 1} – ${['pack', 'carton', 'unit', 'bulk'][i % 4]} ${['500g', '1L', '12pc', '24pk'][i % 4]}`,
      packetDescription: `${1 + (i % 6)} × ${['500ml', '1kg', '12s', '6s', '24s', '4L'][i % 6]} ${['outer', 'inner', 'retail'][i % 3]}`,
      qtyOnHand: qty,
      unitPrice: unit,
      vatPct,
      lineTotal: total,
      supplierName: SUPPLIERS[i % SUPPLIERS.length],
      brand: BRANDS[i % BRANDS.length],
      productGroup: PRODUCT_GROUPS[i % PRODUCT_GROUPS.length],
      subGroup: SUB_GROUPS[i % SUB_GROUPS.length],
      rackLocation: RACK_LOCATIONS[i % RACK_LOCATIONS.length],
    });
  }
  return rows;
}

const DUMMY_ROWS = buildDummyRows(48);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

const primaryLinkBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const SEARCH_PLACEHOLDER = 'Search by supplier name, product brand, group, sub group…';

export default function ProductPriceList() {
  const [rows, setRows] = useState(() => DUMMY_ROWS.map((r) => ({ ...r })));
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [plFilters, setPlFilters] = useState({
    searchColumn: 'all',
    rackLocation: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewRow, setViewRow] = useState(null);
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
    setRows((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
    setViewRow((v) => (v && ids.has(String(v.id)) ? null : v));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, plFilters]);

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

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (plFilters.searchColumn && plFilters.searchColumn !== 'all') n += 1;
    if (plFilters.rackLocation) n += 1;
    return n;
  }, [plFilters.searchColumn, plFilters.rackLocation]);

  const rowMatchesSearch = useCallback(
    (r, q) => {
      if (!q) return true;
      const col = plFilters.searchColumn || 'all';
      const hay = (v) => String(v ?? '').toLowerCase().includes(q);
      if (col === 'supplier') return hay(r.supplierName);
      if (col === 'brand') return hay(r.brand);
      if (col === 'group') return hay(r.productGroup);
      if (col === 'subgroup') return hay(r.subGroup);
      return (
        hay(r.supplierName) ||
        hay(r.brand) ||
        hay(r.productGroup) ||
        hay(r.subGroup)
      );
    },
    [plFilters.searchColumn],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => rowMatchesSearch(r, q));
    if (plFilters.rackLocation) {
      list = list.filter((r) => r.rackLocation === plFilters.rackLocation);
    }
    const sorted = [...list];
    if (sortBy === 'supplier') {
      sorted.sort((a, b) => String(a.supplierName).localeCompare(String(b.supplierName)));
    } else if (sortBy === 'desc') {
      sorted.sort((a, b) => String(a.shortDescription).localeCompare(String(b.shortDescription)));
    } else if (sortBy === 'qtyHigh') {
      sorted.sort((a, b) => b.qtyOnHand - a.qtyOnHand);
    } else if (sortBy === 'unitHigh') {
      sorted.sort((a, b) => b.unitPrice - a.unitPrice);
    } else if (sortBy === 'totalHigh') {
      sorted.sort((a, b) => b.lineTotal - a.lineTotal);
    }
    return sorted;
  }, [search, plFilters.rackLocation, sortBy, rowMatchesSearch, rows]);

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

  const tableRows = useMemo(() => {
    return paginatedRows.map((r) => {
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
            aria-label={`Select ${r.barcode}`}
          />
        </div>,
        r.barcode,
        <span key={`sd-${r.id}`} className="block w-full text-left">
          {r.shortDescription}
        </span>,
        <span key={`pd-${r.id}`} className="block w-full text-left">
          {r.packetDescription}
        </span>,
        String(r.qtyOnHand),
        fmtMoney(r.unitPrice),
        `${r.vatPct}%`,
        fmtMoney(r.lineTotal),
      ];
    });
  }, [paginatedRows, selectedIds, toggleRowSelected]);

  const selectedRowIndex = useMemo(() => {
    if (!viewRow) return null;
    const i = paginatedRows.findIndex((r) => r.id === viewRow.id);
    return i >= 0 ? i : null;
  }, [viewRow, paginatedRows]);

  const viewModalFields = useMemo(() => {
    if (!viewRow) return [];
    return [
      { label: 'Barcode', value: viewRow.barcode },
      { label: 'Short description', value: viewRow.shortDescription },
      { label: 'Packet description', value: viewRow.packetDescription },
      { label: 'Qty on hand', value: String(viewRow.qtyOnHand) },
      { label: 'Unit price', value: fmtMoney(viewRow.unitPrice) },
      { label: 'VAT %', value: `${viewRow.vatPct}%` },
      { label: 'Total (incl. VAT)', value: fmtMoney(viewRow.lineTotal) },
      { label: 'Supplier', value: viewRow.supplierName },
      { label: 'Brand', value: viewRow.brand },
      { label: 'Group', value: viewRow.productGroup },
      { label: 'Sub group', value: viewRow.subGroup },
      { label: 'Rack location', value: viewRow.rackLocation },
    ];
  }, [viewRow]);

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
          PRODUCT PRICE LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/data-entry/product-entry"
            className={primaryLinkBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            New product
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
              className="h-7 min-w-[6.5rem] max-w-[12rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none sm:min-w-[7.5rem]"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="supplier">Sort: Supplier</option>
              <option value="desc">Sort: Description</option>
              <option value="qtyHigh">Sort: Qty on hand (high)</option>
              <option value="unitHigh">Sort: Unit price (high)</option>
              <option value="totalHigh">Sort: Total (high)</option>
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

      <ProductListFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        searchColumnOptions={SEARCH_COLUMN_OPTIONS}
        rackLocations={RACK_LOCATIONS}
        applied={plFilters}
        onApply={setPlFilters}
      />

      <TableRowViewModal
        open={Boolean(viewRow)}
        title="View price line"
        fields={viewModalFields}
        onClose={() => setViewRow(null)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="product-price-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          onBodyRowClick={(rowIdx) => setViewRow(paginatedRows[rowIdx] ?? null)}
          selectedBodyRowIndex={selectedRowIndex}
          columnWidthPercents={PPL_COL_PCT}
          tableClassName="min-w-[720px] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize, 24)}
          headers={[
            '',
            'Barcode',
            'Short desc.',
            'Packet desc.',
            'Qty on hand',
            'Unit price',
            'VAT %',
            'Total',
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
