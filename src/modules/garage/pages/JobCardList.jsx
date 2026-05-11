import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { listJobCards } from '../api/jobCard.api';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const COL_PCT = [4, 8, 9, 13, 8, 10, 9, 10, 8, 8, 5, 8];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const figmaSearchBox = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[380px]`;

function ChevronIcon() {
  return (
    <svg className="h-2 w-2 shrink-0 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(iso) {
  if (!iso) return '-';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '-';
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

function StatusBadge({ status }) {
  const map = {
    OPEN: 'bg-green-100 text-green-700',
    POSTED: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-600',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${cls}`}>
      {status || '-'}
    </span>
  );
}

export default function JobCardList() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await listJobCards();
        if (!cancelled) setCards(data);
      } catch (err) {
        if (!cancelled) {
          setCards([]);
          setLoadError(err?.response?.data?.message || 'Could not load job cards.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const statusOptions = useMemo(
    () => Array.from(new Set(cards.map((c) => c.status).filter(Boolean))).sort(),
    [cards],
  );

  const jobTypeOptions = useMemo(
    () => Array.from(new Set(cards.map((c) => c.jobType).filter(Boolean))).sort(),
    [cards],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? cards.filter(
          (c) =>
            (c.jcNo || '').toLowerCase().includes(q) ||
            (c.regNo || '').toLowerCase().includes(q) ||
            (c.customerName || '').toLowerCase().includes(q) ||
            (c.vehOwnerName || '').toLowerCase().includes(q) ||
            (c.serviceAdvisor || '').toLowerCase().includes(q),
        )
      : [...cards];

    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    if (jobTypeFilter) list = list.filter((c) => c.jobType === jobTypeFilter);

    if (sortBy === 'dateDesc') {
      list.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    } else if (sortBy === 'dateAsc') {
      list.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
    } else if (sortBy === 'jcDesc') {
      list.sort((a, b) => (b.jcNo || '').localeCompare(a.jcNo || ''));
    }

    return list;
  }, [cards, search, statusFilter, jobTypeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => { setPage(1); }, [search, statusFilter, jobTypeFilter, sortBy]);
  useEffect(() => { setPage((p) => Math.min(p, totalPages)); }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filtered.length);

  const tableRows = useMemo(
    () =>
      paginated.map((c, idx) => {
        const slNo = (page - 1) * pageSize + idx + 1;
        return [
          slNo,
          c.jcNo || '-',
          c.regNo || '-',
          c.customerName || c.vehOwnerName || '-',
          c.customerType || '-',
          c.jobType || '-',
          c.stationCode || '-',
          c.serviceAdvisor || '-',
          formatDate(c.bookingDate),
          formatDate(c.promiseDate),
          c.kmReadingIn != null ? c.kmReadingIn : '-',
          <StatusBadge key={`st-${c.id}`} status={c.status} />,
          <button
            key={`ed-${c.id}`}
            type="button"
            title="Open job card"
            onClick={(e) => { e.stopPropagation(); navigate(`/garage/job-card-entry?id=${c.id}`); }}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <img src={EditIcon} alt="Open" className="h-3 w-3" />
          </button>,
        ];
      }),
    [paginated, page, pageSize, navigate],
  );

  const handleRowClick = useCallback(
    (rowIdx) => navigate(`/garage/job-card-entry?id=${paginated[rowIdx]?.id}`),
    [navigate, paginated],
  );

  const pageNumbers = useMemo(() => {
    const max = 3;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">

      {/* Header */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          JOB CARD LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={figmaToolbarBtn}
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95"
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={() => navigate('/garage/job-card-entry')}
          >
            + New Job Card
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search JC No, Reg No, Customer…"
            className="min-w-0 flex-1 border-0 bg-transparent text-[10px] font-semibold leading-5 text-black outline-none placeholder:font-semibold placeholder:text-neutral-400"
          />
        </div>

        <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 min-w-[7rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none"
            aria-label="Status filter"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ChevronIcon /></span>
        </div>

        <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="h-7 min-w-[8rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none"
            aria-label="Job type filter"
          >
            <option value="">All Job Types</option>
            {jobTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ChevronIcon /></span>
        </div>

        <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-7 min-w-[8.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-[10px] font-semibold leading-5 text-black outline-none"
            aria-label="Sort"
          >
            <option value="default">Sort: Default</option>
            <option value="dateDesc">Sort: Date (newest)</option>
            <option value="dateAsc">Sort: Date (oldest)</option>
            <option value="jcDesc">Sort: JC No (desc)</option>
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><ChevronIcon /></span>
        </div>
      </div>

      {/* Loading / error banner */}
      {(loading || loadError) && (
        <div
          className={`shrink-0 rounded border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] ${
            loadError ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
          role="status"
          aria-live="polite"
        >
          {loading ? 'Loading job cards…' : loadError}
        </div>
      )}

      {/* Table */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          onBodyRowClick={handleRowClick}
          columnWidthPercents={COL_PCT}
          tableClassName="min-w-[56rem] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize + 1, 24)}
          headers={['Sl No', 'JC No', 'Reg No', 'Customer', 'Cust Type', 'Job Type', 'Station', 'Advisor', 'Booking', 'Promise', 'KM In', 'Status', '']}
          rows={tableRows}
        />

        {/* Pagination */}
        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of{' '}
              <span className="text-black">{filtered.length}</span>
            </p>
            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-700">
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

          <span className="hidden sm:block" aria-hidden />

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
