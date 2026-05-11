import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as stockApi from '../../../services/stock.api.js';

const EDIT_ROUTE = {
  adjustment: '/stock-hub/stock-adjustment',
  damage: '/stock-hub/damage-entry',
  'additional-stock': '/stock-hub/additional-stock-entry',
};

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[280px] sm:max-w-[640px] sm:pr-3 md:min-w-[360px] md:max-w-[320px]`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const ADJUSTMENT_COL_PCT = [3, 22, 15, 45, 15];
const REORDER_COL_PCT = [2, 12, 18, 13, 12, 11, 12, 20];

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function parseQty(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {{ variant: 'adjustment' | 'damage' | 'additional-stock' | 'reorder' }} props
 */
export default function StockHubListPage({ variant }) {
  const isEntryList = variant === 'adjustment' || variant === 'damage' || variant === 'additional-stock';

  const DOC_TYPE_MAP = { adjustment: 'ADJ', damage: 'DMG', 'additional-stock': 'ASE' };
  const docType = DOC_TYPE_MAP[variant] ?? null;

  const TITLE_MAP = { adjustment: 'STOCK ADJUSTMENT LIST', damage: 'DAMAGE ENTRY LIST', 'additional-stock': 'ADDITIONAL STOCK LIST', reorder: 'REORDER LIST' };
  const title = TITLE_MAP[variant] ?? 'LIST';

  const headers = isEntryList
    ? ['', 'Entry no', 'Post status', 'Remarks', 'Actions']
    : ['', 'Bar code', 'Short description', 'Pkt. details', 'Qty on hand', 'Unit cost', 'Reorder level', 'Reorder qty'];
  const colPct = isEntryList ? ADJUSTMENT_COL_PCT : REORDER_COL_PCT;

  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const filterWrapRef = useRef(null);

  const STATUS_OPTIONS = isEntryList ? ['draft', 'posted'] : [];

  useEffect(() => {
    setIsLoading(true);
    setErrorMsg('');
    const fetchData = async () => {
      try {
        if (isEntryList) {
          const entries = await stockApi.listEntries(docType);
          setRows(entries.map((e) => ({
            id: String(e.entry_id),
            stockAdjNo: e.entry_no ?? `#${e.entry_id}`,
            postStatus: e.post_status ?? 'draft',
            remarks: e.remark ?? '',
            entryDate: e.entry_date ?? '',
          })));
        } else {
          const items = await stockApi.getReorderList();
          setRows(items.map((item, i) => ({
            id: String(item.product_inventory_id ?? item.product_id ?? i),
            barcode: item.barcode ?? '',
            shortDescription: item.short_description ?? item.product_name ?? '',
            pktDetails: '',
            qtyOnHand: String(item.qty_on_hand ?? 0),
            unitCost: Number(item.unit_cost ?? 0).toFixed(2),
            reorderLevel: String(item.reorder_level ?? 0),
            reorderQty: String(item.reorder_qty ?? 0),
          })));
        }
      } catch (err) {
        setErrorMsg(err?.response?.data?.message ?? 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isEntryList, docType]);

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    const ids = [...selectedIdsRef.current];
    if (ids.length === 0) return;
    if (!isEntryList) { setRows((prev) => prev.filter((r) => !selectedIdsRef.current.has(String(r.id)))); setSelectedIds(new Set()); return; }
    for (const id of ids) {
      try { await stockApi.deleteEntry(Number(id)); } catch { /* skip posted ones */ }
    }
    setRows((prev) => prev.filter((r) => !selectedIdsRef.current.has(String(r.id))));
    setSelectedIds(new Set());
  }, [isEntryList]);

  useEffect(() => { setPage(1); }, [search, sortBy, statusFilter]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(rows.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => { if (ids.has(id)) next.add(id); else changed = true; });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [rows]);

  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e) => { if (filterWrapRef.current && !filterWrapRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...rows];

    if (q) {
      list = list.filter((r) => {
        if (isEntryList) {
          return (
            (r.stockAdjNo ?? '').toLowerCase().includes(q) ||
            (r.postStatus ?? '').toLowerCase().includes(q) ||
            (r.remarks ?? '').toLowerCase().includes(q)
          );
        }
        return (
          (r.barcode ?? '').toLowerCase().includes(q) ||
          (r.shortDescription ?? '').toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter && isEntryList) {
      list = list.filter((r) => r.postStatus === statusFilter);
    }

    const sorted = [...list];
    if (isEntryList) {
      if (sortBy === 'adjNoDesc') {
        sorted.sort((a, b) => b.stockAdjNo.localeCompare(a.stockAdjNo, undefined, { numeric: true }));
      } else if (sortBy === 'postStatusAsc') {
        sorted.sort((a, b) => (a.postStatus ?? '').localeCompare(b.postStatus ?? ''));
      }
    } else {
      if (sortBy === 'qtyDesc') {
        sorted.sort((a, b) => parseQty(b.reorderQty) - parseQty(a.reorderQty));
      } else if (sortBy === 'qtyOnHandAsc') {
        sorted.sort((a, b) => parseQty(a.qtyOnHand) - parseQty(b.qtyOnHand));
      }
    }
    return sorted;
  }, [search, sortBy, statusFilter, rows, isEntryList]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const filteredIdSet = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);
  const selectedRowCount = useMemo(() => {
    let n = 0;
    selectedIds.forEach((id) => { if (filteredIdSet.has(id)) n += 1; });
    return n;
  }, [filteredIdSet, selectedIds]);

  const reorderColumnTotals = useMemo(() => {
    if (isEntryList) return null;
    let qoh = 0, rq = 0, ucSum = 0;
    const n = filteredRows.length;
    for (const r of filteredRows) { qoh += parseQty(r.qtyOnHand); rq += parseQty(r.reorderQty); ucSum += parseQty(r.unitCost); }
    return { qoh, rq, avgUnitCost: n ? ucSum / n : 0 };
  }, [filteredRows, isEntryList]);

  const tableRows = useMemo(() => {
    if (isEntryList) {
      return paginatedRows.map((r) => {
        const checked = selectedIds.has(r.id);
        const chk = (
          <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
            <input type="checkbox" checked={checked} onChange={() => toggleRowSelected(r.id)}
              className={listTableCheckboxClass} style={{ accentColor: primary }} aria-label={`Select ${r.stockAdjNo}`} />
          </div>
        );
        const statusBadge = (
          <span key={`st-${r.id}`} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold
            ${r.postStatus === 'posted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {r.postStatus}
          </span>
        );
        const editBtn = r.postStatus !== 'posted' ? (
          <button
            key={`edit-${r.id}`}
            type="button"
            title="Edit entry"
            onClick={() => navigate(`${EDIT_ROUTE[variant]}/${r.id}`)}
            className="inline-flex h-6 w-6 items-center justify-center rounded bg-transparent p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <img src={EditIcon} alt="Edit" className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span key={`edit-${r.id}`} className="inline-flex h-6 w-6 items-center justify-center text-gray-300" title="Posted — cannot edit">
            <img src={EditIcon} alt="" className="h-3.5 w-3.5 opacity-30" />
          </span>
        );
        return [chk, r.stockAdjNo, statusBadge, r.remarks, editBtn];
      });
    }

    const dataRows = paginatedRows.map((r) => {
      const checked = selectedIds.has(r.id);
      const chk = (
        <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
          <input type="checkbox" checked={checked} onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass} style={{ accentColor: primary }} aria-label={`Select ${r.barcode}`} />
        </div>
      );
      return [chk, r.barcode, r.shortDescription, r.pktDetails, r.qtyOnHand, r.unitCost, r.reorderLevel, r.reorderQty];
    });

    const t = reorderColumnTotals;
    if (!t) return dataRows;
    const totalRow = [
      { content: '', colSpan: 1 },
      { content: <div key="stock-hub-total" className="text-left font-bold">Total</div>, colSpan: 3, className: 'align-middle font-bold' },
      t.qoh.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      t.avgUnitCost.toFixed(2),
      '—',
      t.rq.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    ];
    return [...dataRows, totalRow];
  }, [paginatedRows, selectedIds, toggleRowSelected, reorderColumnTotals, isEntryList]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
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
          {isLoading && <span className="ml-2 text-[10px] font-normal text-gray-400">Loading…</span>}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={CancelIcon} alt="" className="h-3.5 w-3.5" />Cancel
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={EditIcon} alt="" className="h-3.5 w-3.5" />Edit
          </button>
        </div>
      </div>

      {errorMsg && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{errorMsg}</p>
      )}

      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={isEntryList ? 'Search by entry no, status, remarks' : 'Search by barcode or product'}
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400 placeholder:font-semibold" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:h-7 sm:shrink-0 sm:flex-nowrap">
          {selectedRowCount >= 1 ? (
            <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleDeleteSelected} aria-label={`Delete ${selectedRowCount} selected`}>
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 shrink-0 brightness-0 invert" />Delete
            </button>
          ) : null}

          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[11rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none sm:min-w-[7.5rem]"
              aria-label="Sort">
              <option value="default">Sort: Default</option>
              {isEntryList ? (
                <>
                  <option value="adjNoDesc">Sort: Entry no (high)</option>
                  <option value="postStatusAsc">Sort: Status (A–Z)</option>
                </>
              ) : (
                <>
                  <option value="qtyDesc">Sort: Reorder qty (high)</option>
                  <option value="qtyOnHandAsc">Sort: On-hand (low)</option>
                </>
              )}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ToolbarChevron /></span>
          </div>

          {isEntryList ? (
            <div className="relative shrink-0" ref={filterWrapRef}>
              <button type="button" className={figmaToolbarBtn} aria-expanded={filterOpen} aria-haspopup="listbox" onClick={() => setFilterOpen((o) => !o)}>
                <img src={FilterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-[5rem] truncate sm:max-w-[6rem]">
                  {statusFilter ? `Status: ${statusFilter}` : 'Filters'}
                </span>
                <ToolbarChevron />
              </button>
              {filterOpen ? (
                <div className="absolute right-0 top-full z-50 mt-0.5 min-w-[9.5rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5" role="listbox" aria-label="Status filter">
                  <button type="button" role="option" aria-selected={statusFilter === null}
                    className="w-full px-2.5 py-1.5 text-left text-[10px] font-semibold text-gray-700 hover:bg-rose-50 sm:px-3 sm:text-[11px]"
                    onClick={() => { setStatusFilter(null); setFilterOpen(false); }}>
                    All
                  </button>
                  <div className="my-0.5 border-t border-gray-100" />
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} type="button" role="option" aria-selected={statusFilter === s}
                      className={`w-full px-2.5 py-1.5 text-left text-[10px] font-semibold hover:bg-rose-50 sm:px-3 sm:text-[11px] ${statusFilter === s ? 'text-[#790728] bg-rose-50/80' : 'text-gray-800'}`}
                      onClick={() => { setStatusFilter(s); setFilterOpen(false); }}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="stock-hub-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth allowHorizontalScroll
          columnWidthPercents={colPct}
          tableClassName={isEntryList ? 'min-w-[min(100%,480px)] sm:min-w-[560px] lg:min-w-0' : 'min-w-[min(100%,640px)] sm:min-w-[760px] lg:min-w-0'}
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.9vw, 9px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(9px, 1.25vw, 12px)" cellPaddingClass="px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5"
          bodyRowHeightRem={2.35} maxVisibleRows={Math.min(pageSize + 1, 24)}
          headers={headers} rows={tableRows}
        />

        {rows.length === 0 && !isLoading && !errorMsg && (
          <p className="mt-6 text-center text-[11px] text-gray-400">
            {isEntryList
              ? { adjustment: 'No stock adjustment entries yet.', damage: 'No damage entries yet.', 'additional-stock': 'No additional stock entries yet.' }[variant] ?? 'No entries yet.'
              : 'All products are above reorder level.'}
          </p>
        )}

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>{'–'}<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300" aria-label="Rows per page">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          {selectedRowCount >= 1 ? (
            <p className="justify-self-center text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold sm:text-[11px]" style={{ color: primary }} role="status" aria-live="polite">
              {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
            </p>
          ) : <span className="hidden sm:block" aria-hidden />}

          <div className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation" aria-label="Pagination">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button key={n} type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
                    onClick={() => setPage(n)} aria-label={`Page ${n}`} aria-current={active ? 'page' : undefined}>
                    {n}
                  </button>
                );
              })}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
