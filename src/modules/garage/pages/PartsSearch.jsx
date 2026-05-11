import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PartsSearchFilterDrawer from '../../../shared/components/ui/PartsSearchFilterDrawer';

const primary = colors.primary?.main || '#790728';

const STOCK_STATUS_COLORS = {
  'In Stock':    { bg: '#e6f4ea', text: '#1a7f37' },
  'Low Stock':   { bg: '#fff8e1', text: '#a06000' },
  'Out of Stock':{ bg: '#fce8e8', text: '#c0392b' },
  'On Order':    { bg: '#e8f0fe', text: '#1a56db' },
};

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const SUPPLIERS      = ['Al-Futtaim Auto', 'Gulf Parts Co.', 'Metro Auto Supply', 'National Spares', 'Prime Motors'];
const GROUPS         = ['Engine', 'Brakes', 'Suspension', 'Electrical', 'Body & Trim'];
const SUB_GROUPS     = ['Filters', 'Pads & Discs', 'Belts & Hoses', 'Sensors', 'Seals & Gaskets', 'Bearings'];
const STOCK_STATUSES = ['In Stock', 'Low Stock', 'Out of Stock', 'On Order'];
const LOCATIONS      = ['Bin A1', 'Bin A2', 'Bin B1', 'Bin B2', 'Bin C1', 'Shelf D3'];
const MAKE_TYPES     = ['BMW', 'NISSAN', 'MERCEDES', 'AUDI', 'TOYOTA', 'CHRYSLER', 'HYUNDAI'];
const PARTS_FAMILIES = ['Filters', 'Brake Parts', 'Engine Parts', 'Suspension', 'Electrical', 'Body Parts', 'Transmission', 'Cooling System'];
const PRODUCT_NAMES  = [
  'Oil Filter', 'Air Filter', 'Brake Pad Set', 'Brake Disc', 'Timing Belt',
  'Spark Plug', 'Wheel Bearing', 'Alternator Belt', 'Lambda Sensor', 'CV Joint Boot',
];
const SHORT_DESCS    = [
  'Genuine OEM filter', 'High-flow air filter', 'Front axle pads', 'Vented disc rotor',
  'Cambelt kit', 'Iridium tip plug', 'Hub bearing unit', 'Poly-V belt', 'O2 sensor front', 'Boot & clip kit',
];
const OEM_CODES      = ['04152-YZZA6', '17801-0C010', '04465-42160', '43512-06090', '13568-09050',
                        '90919-01253', '90369-40065', '90916-02679', '89465-0C040', '43460-09041'];

const SEARCH_COLUMN_OPTIONS = [
  { value: 'all',         label: 'All columns' },
  { value: 'prodNo',      label: 'Prod No' },
  { value: 'productName', label: 'Product Name' },
  { value: 'oemCode',     label: 'OEM Code' },
];

/** Checkbox + 12 data columns — pct sum = 100 */
const COL_PCT = [2, 7, 12, 13, 7, 7, 7, 7, 6, 7, 9, 8, 8];

function fmtMoney(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildRows(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const unitPrice   = 5 + (i * 13) % 490 + (i % 5) * 2.5;
    const lastPuCost  = unitPrice * (0.7 + (i % 4) * 0.08);
    const qty         = (i * 11) % 200;
    rows.push({
      id:           String(i + 1),
      prodNo:       `PRT-${String(10000 + i * 9).slice(-5)}`,
      productName:  PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      shortDesc:    SHORT_DESCS[i % SHORT_DESCS.length],
      makeType:     MAKE_TYPES[i % MAKE_TYPES.length],
      group:        GROUPS[i % GROUPS.length],
      subGroup:     SUB_GROUPS[i % SUB_GROUPS.length],
      location:     LOCATIONS[i % LOCATIONS.length],
      lastPuCost,
      unitPrice,
      oemCode:      OEM_CODES[i % OEM_CODES.length],
      qtyOnHand:    qty,
      supplier:     SUPPLIERS[i % SUPPLIERS.length],
      stockStatus:  qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : STOCK_STATUSES[i % 2 === 0 ? 0 : 3],
    });
  }
  return rows;
}

const DUMMY_ROWS = buildRows(56);

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

function StockPill({ status }) {
  const s = STOCK_STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span
      className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold leading-none sm:text-[9px]"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

export default function PartsSearch() {
  const [rows, setRows]                         = useState(() => DUMMY_ROWS.map((r) => ({ ...r })));
  const [search, setSearch]                     = useState('');
  const [searchCol, setSearchCol]               = useState('all');
  const [sortBy, setSortBy]                     = useState('default');
  const [page, setPage]                         = useState(1);
  const [pageSize, setPageSize]                 = useState(10);
  const [viewRow, setViewRow]                   = useState(null);
  const [selectedIds, setSelectedIds]           = useState(() => new Set());
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [drawerFilters, setDrawerFilters]       = useState({ makeType: '', makeModel: '', partsFamily: '', qtyMin: '', qtyMax: '' });
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

  useEffect(() => { setPage(1); }, [search, searchCol, drawerFilters, sortBy]);

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
      if (searchCol === 'prodNo')      return r.prodNo.toLowerCase().includes(q);
      if (searchCol === 'productName') return r.productName.toLowerCase().includes(q);
      if (searchCol === 'oemCode')     return r.oemCode.toLowerCase().includes(q);
      return (
        r.prodNo.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.oemCode.toLowerCase().includes(q)
      );
    });
    if (drawerFilters.makeType)    list = list.filter((r) => r.makeType.toUpperCase() === drawerFilters.makeType.toUpperCase());
    if (drawerFilters.partsFamily) list = list.filter((r) => r.subGroup === drawerFilters.partsFamily);
    if (drawerFilters.qtyMin !== '') list = list.filter((r) => r.qtyOnHand >= Number(drawerFilters.qtyMin));
    if (drawerFilters.qtyMax !== '') list = list.filter((r) => r.qtyOnHand <= Number(drawerFilters.qtyMax));
    const sorted = [...list];
    if (sortBy === 'partName')    sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    if (sortBy === 'supplier')    sorted.sort((a, b) => a.supplier.localeCompare(b.supplier));
    if (sortBy === 'qtyHigh')     sorted.sort((a, b) => b.qtyOnHand - a.qtyOnHand);
    if (sortBy === 'priceHigh')   sorted.sort((a, b) => b.unitPrice - a.unitPrice);
    if (sortBy === 'stockStatus') sorted.sort((a, b) => a.stockStatus.localeCompare(b.stockStatus));
    return sorted;
  }, [search, searchCol, drawerFilters, sortBy, rows]);

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
          aria-label={`Select ${r.prodNo}`}
        />
      </div>,
      r.prodNo,
      r.productName,
      r.shortDesc,
      r.makeType,
      r.group,
      r.subGroup,
      r.location,
      fmtMoney(r.lastPuCost),
      fmtMoney(r.unitPrice),
      r.oemCode,
      String(r.qtyOnHand),
      <span key={`img-${r.id}`} className="text-[9px] text-neutral-400">—</span>,
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
      { label: 'Prod No',         value: viewRow.prodNo },
      { label: 'Product Name',    value: viewRow.productName },
      { label: 'ShortDescription',value: viewRow.shortDesc },
      { label: 'Make Type',       value: viewRow.makeType },
      { label: 'Group',           value: viewRow.group },
      { label: 'Sub Group',       value: viewRow.subGroup },
      { label: 'Location',        value: viewRow.location },
      { label: 'LastPu Cost',     value: fmtMoney(viewRow.lastPuCost) },
      { label: 'Unit Price',      value: fmtMoney(viewRow.unitPrice) },
      { label: 'OEM Code',        value: viewRow.oemCode },
      { label: 'QtyOnHand',       value: String(viewRow.qtyOnHand) },
      { label: 'Supplier',        value: viewRow.supplier },
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
    (drawerFilters.makeType    ? 1 : 0) +
    (drawerFilters.partsFamily ? 1 : 0) +
    (drawerFilters.qtyMin !== '' || drawerFilters.qtyMax !== '' ? 1 : 0);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          PARTS SEARCH
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

      {/* Toolbar */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Prod No, Product Name, OEM Code…"
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

          {/* Search column */}
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

          {/* Sort */}
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="partName">Sort: PartName</option>
              <option value="supplier">Sort: Supplier</option>
              <option value="qtyHigh">Sort: Qty (High)</option>
              <option value="priceHigh">Sort: Price (High)</option>
              <option value="stockStatus">Sort: StockStatus</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>

          {/* Filters button */}
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

      <PartsSearchFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        partsFamilies={PARTS_FAMILIES}
        applied={drawerFilters}
        onApply={setDrawerFilters}
      />

      <TableRowViewModal
        open={Boolean(viewRow)}
        title="View Part"
        fields={viewModalFields}
        onClose={() => setViewRow(null)}
      />

      {/* Table */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="parts-search-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          onBodyRowClick={(rowIdx) => setViewRow(paginatedRows[rowIdx] ?? null)}
          selectedBodyRowIndex={selectedRowIndex}
          columnWidthPercents={COL_PCT}
          tableClassName="min-w-[1100px] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize, 24)}
          headers={['', 'Prod No', 'Product Name', 'ShortDescription', 'Make Type', 'Group', 'Sub Group', 'Location', 'LastPu Cost', 'Unit Price', 'OEM Code', 'QtyOnHand', 'Images']}
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
