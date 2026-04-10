import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Checkbox + 8 columns — widths sum to 100 */
const SL_COL_PCT = [2, 10, 18, 14, 14, 7, 10, 9, 16];

const COMPANY_PARTS = ['Global', 'Metro', 'Gulf', 'United', 'Prime', 'Atlas', 'Vertex', 'Summit'];
const COMPANY_SUFFIX = ['Trading LLC', 'Supplies FZE', 'Imports Co.', 'Distribution', 'Wholesale Est.', 'Holdings Ltd'];

const COUNTRIES = ['UAE', 'UAE', 'KSA', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'India'];

function buildDummySuppliers(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const a = COMPANY_PARTS[i % COMPANY_PARTS.length];
    const b = COMPANY_PARTS[(i + 3) % COMPANY_PARTS.length];
    const suf = COMPANY_SUFFIX[i % COMPANY_SUFFIX.length];
    rows.push({
      id: String(i + 1),
      supplierCode: `SUP-${String(900 + i * 19).padStart(5, '0')}`,
      supplierName: `${a} ${b} ${suf}`,
      taxRegNo: i % 7 === 0 ? '—' : `100${(310000000 + i * 100019) % 900000000}`,
      contactPerson: `${['Ravi', 'Hassan', 'Priya', 'Omar', 'Li Wei'][i % 5]} (${['Purchasing', 'Accounts', 'GM'][i % 3]})`,
      qty: 1 + (i * 11) % 48,
      country: COUNTRIES[i % COUNTRIES.length],
      telephone: `04-${2200000 + (i * 817) % 6800000}`,
      mobile: `+971 55 ${1000000 + (i * 191) % 8999999}`,
    });
  }
  return rows;
}

const DUMMY_SUPPLIERS = buildDummySuppliers(40);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const primaryLinkBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';

const SEARCH_PLACEHOLDER = 'Search…';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState(() => DUMMY_SUPPLIERS.map((r) => ({ ...r })));
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
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
    setSuppliers((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
  }, []);

  const handlePost = useCallback(() => {
    // TODO: connect posting API
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(suppliers.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [suppliers]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = suppliers;
    if (q) {
      list = suppliers.filter((r) => {
        const blob = [
          r.supplierCode,
          r.supplierName,
          r.taxRegNo,
          r.contactPerson,
          String(r.qty),
          r.country,
          r.telephone,
          r.mobile,
        ]
          .map((x) => String(x ?? '').toLowerCase())
          .join(' ');
        return blob.includes(q);
      });
    }
    const sorted = [...list];
    if (sortBy === 'code') {
      sorted.sort((a, b) => String(a.supplierCode).localeCompare(String(b.supplierCode)));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => String(a.supplierName).localeCompare(String(b.supplierName)));
    } else if (sortBy === 'qtyHigh') {
      sorted.sort((a, b) => b.qty - a.qty);
    } else if (sortBy === 'country') {
      sorted.sort((a, b) => String(a.country).localeCompare(String(b.country)));
    }
    return sorted;
  }, [search, sortBy, suppliers]);

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
        <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()} role="presentation">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
            aria-label={`Select ${r.supplierCode}`}
          />
        </div>,
        r.supplierCode,
      <span key={`nm-${r.id}`} className="block w-full text-left">
        {r.supplierName}
      </span>,
      r.taxRegNo,
      <span key={`cp-${r.id}`} className="block w-full text-left">
        {r.contactPerson}
      </span>,
      String(r.qty),
      r.country,
      r.telephone,
        r.mobile,
      ];
    });
  }, [paginatedRows, selectedIds, toggleRowSelected]);

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
          SUPPLIER LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/data-entry/supplier-entry"
            className={primaryLinkBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            New supplier
          </Link>
          <button
            type="button"
            className={primaryToolbarBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={handlePost}
            aria-label="Post"
          >
            Post
          </button>
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
              aria-label={`Delete ${selectedRowCount} selected supplier${selectedRowCount === 1 ? '' : 's'}`}
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
              <option value="code">Sort: Supplier code</option>
              <option value="name">Sort: Supplier name</option>
              <option value="qtyHigh">Sort: Qty (high)</option>
              <option value="country">Sort: Country</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="supplier-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          columnWidthPercents={SL_COL_PCT}
          tableClassName="min-w-[900px] w-full"
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
            'Supplier code',
            'Supplier name',
            'Supp. tax reg. no',
            'Contact person',
            'Qty',
            'Country',
            'Telephone',
            'Mobile no',
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
