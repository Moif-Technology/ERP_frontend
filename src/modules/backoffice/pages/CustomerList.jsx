import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import CustomerListFilterDrawer from '../../../shared/components/ui/CustomerListFilterDrawer';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as customerEntryApi from '../../../services/customerEntry.api';

const primary = colors.primary?.main || '#790728';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LOYALTY_STATUSES = ['Standard', 'Silver', 'Gold', 'Platinum', 'Inactive'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Checkbox + 11 columns — widths sum to 100 */
const CL_COL_PCT = [2, 3, 6, 10, 10, 7, 7, 10, 7, 7, 8, 13];

function mapApiCustomer(c) {
  return {
    id: String(c.customerId),
    customerCode: c.customerCode ?? '—',
    customerName: c.customerName ?? '—',
    customerNameAlt: c.companyName ?? '—',
    telephone: c.telephone ?? '—',
    mobile: c.mobileNo ?? '—',
    contactPerson: c.contactPerson ?? '—',
    country: c.countryName ?? '—',
    city: c.cityName ?? '—',
    customerTx: c.customerType ?? '—',
    loyaltyStatus: c.loyaltyStatus ?? '—',
  };
}

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const primaryLinkBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';

/** Generic search — matches common fields; placeholder does not list them */
const SEARCH_PLACEHOLDER = 'Search…';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [listFilters, setListFilters] = useState({ loyaltyStatus: null });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    customerEntryApi.listCustomers()
      .then(({ data }) => {
        if (!cancelled) {
          setCustomers((data.customers || []).map(mapApiCustomer));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err?.response?.data?.message || 'Failed to load customers');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

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
    setCustomers((prev) => prev.filter((row) => !ids.has(String(row.id))));
    setSelectedIds(new Set());
  }, []);

  const handlePost = useCallback(() => {
    // TODO: connect posting API (e.g. post selected or batch)
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, listFilters]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(customers.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [customers]);

  const activeFilterCount = useMemo(() => (listFilters.loyaltyStatus ? 1 : 0), [listFilters.loyaltyStatus]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = customers;
    if (q) {
      list = customers.filter((r) => {
        const blob = [
          r.customerCode,
          r.customerName,
          r.customerNameAlt,
          r.telephone,
          r.mobile,
          r.contactPerson,
          r.country,
          r.city,
          r.customerTx,
          r.loyaltyStatus,
        ]
          .map((x) => String(x ?? '').toLowerCase())
          .join(' ');
        return blob.includes(q);
      });
    }
    if (listFilters.loyaltyStatus) {
      list = list.filter((r) => r.loyaltyStatus === listFilters.loyaltyStatus);
    }
    const sorted = [...list];
    if (sortBy === 'code') {
      sorted.sort((a, b) => String(a.customerCode).localeCompare(String(b.customerCode)));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => String(a.customerName).localeCompare(String(b.customerName)));
    } else if (sortBy === 'city') {
      sorted.sort((a, b) => String(a.city).localeCompare(String(b.city)));
    }
    return sorted;
  }, [search, sortBy, listFilters, customers]);

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
    return paginatedRows.map((r, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      const checked = selectedIds.has(r.id);
      return [
        <div
          key={`chk-${r.id}`}
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
            aria-label={`Select ${r.customerCode}`}
          />
        </div>,
        slNo,
        r.customerCode,
        <span key={`n1-${r.id}`} className="block w-full text-left">
          {r.customerName}
        </span>,
        <span key={`n2-${r.id}`} className="block w-full text-left">
          {r.customerNameAlt}
        </span>,
        r.telephone,
        r.mobile,
        <span key={`cp-${r.id}`} className="block w-full text-left">
          {r.contactPerson}
        </span>,
        r.country,
        r.city,
        r.customerTx,
        r.loyaltyStatus,
      ];
    });
  }, [paginatedRows, page, pageSize, selectedIds, toggleRowSelected]);

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
          CUSTOMER LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/data-entry/customer-entry"
            className={primaryLinkBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            New customer
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
          <button
            type="button"
            className={figmaToolbarBtn}
            disabled={selectedRowCount !== 1}
            style={selectedRowCount !== 1 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            onClick={() => {
              const selectedId = [...selectedIds].find((id) => filteredIdSet.has(id));
              const row = filteredRows.find((r) => r.id === selectedId);
              if (row) navigate(`/data-entry/customer-entry?customerId=${row.id}`, { state: { customer: row } });
            }}
          >
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
              aria-label={`Delete ${selectedRowCount} selected customer${selectedRowCount === 1 ? '' : 's'}`}
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
              <option value="code">Sort: Customer code</option>
              <option value="name">Sort: Customer name</option>
              <option value="city">Sort: City</option>
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

      <CustomerListFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        loyaltyOptions={LOYALTY_STATUSES}
        applied={listFilters}
        onApply={setListFilters}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {loadError && (
          <p className="mb-2 rounded bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600">{loadError}</p>
        )}
        {loading && (
          <p className="mb-2 text-[10px] font-semibold text-gray-500">Loading customers…</p>
        )}
        <CommonTable
          className="customer-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          columnWidthPercents={CL_COL_PCT}
          tableClassName="min-w-[1100px] w-full"
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
            'Sl. no',
            'Cust. code',
            'Customer name',
            'Cust. nam…',
            'Telephone',
            'Mobile no',
            'Contact person',
            'Country',
            'City',
            'Customer tx',
            'Loyalty status',
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
