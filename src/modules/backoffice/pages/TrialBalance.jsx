import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DateInputField, InputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30, 50];
const LINE_COL_PCT = [40, 20, 20, 20];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useViewportMaxWidth(maxPx) {
  const query = `(max-width: ${maxPx}px)`;
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function TrialBalance() {
  const [accounts, setAccounts] = useState([]);
  const [grandDebit, setGrandDebit] = useState(0);
  const [grandCredit, setGrandCredit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateTo, setDateTo] = useState('');
  const [filter, setFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailRow, setDetailRow] = useState(null);
  const isCompactTable = useViewportMaxWidth(1023);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateTo) params.dateTo = dateTo;
      const res = await accountsApi.getTrialBalance(params);
      const d = res.data;
      setAccounts(d.accounts || []);
      setGrandDebit(d.grandDebit || 0);
      setGrandCredit(d.grandCredit || 0);
    } catch (e) {
      console.error('Failed to load trial balance', e);
    } finally {
      setLoading(false);
    }
  }, [dateTo]);

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRows = useMemo(() => {
    if (!filter.trim()) return accounts;
    const q = filter.trim().toLowerCase();
    return accounts.filter((a) =>
      (a.accountHead || '').toLowerCase().includes(q) ||
      (a.accountNo || '').toLowerCase().includes(q) ||
      (a.accountType || '').toLowerCase().includes(q)
    );
  }, [accounts, filter]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((a) => [
      <span key={`p-${a.accountId}`} className="block w-full text-left">{a.accountNo} – {a.accountHead}</span>,
      formatMoney(a.totalDebit),
      formatMoney(a.totalCredit),
      <div key={`act-${a.accountId}`} className="flex items-center justify-center">
        <button type="button" className={actionIconBtn} onClick={() => setDetailRow(a)}>
          <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]);
  }, [paginatedRows]);

  const tableFooterRow = useMemo(() => [
    { content: <div key="ft" className="text-left font-bold">Grand Total</div>, colSpan: 1, className: 'align-middle font-bold' },
    <span key="dr" className="font-bold">{formatMoney(grandDebit)}</span>,
    <span key="cr" className="font-bold">{formatMoney(grandCredit)}</span>,
    '',
  ], [grandDebit, grandCredit]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          TRIAL BALANCE
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`}><img src={PrinterIcon} alt="" className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="min-w-[12rem] shrink-0">
          <label className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>Search</label>
          <input type="text" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            placeholder="Filter by name…"
            className="mt-0.5 box-border w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none focus:border-gray-400" />
        </div>
        <div className="shrink-0"><DateInputField label="As of Date" value={dateTo} onChange={setDateTo} /></div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={loadData}
            className={`${primaryToolbarBtn} h-[26px] min-h-[26px]`} style={{ backgroundColor: primary, borderColor: primary }}
            disabled={loading}>
            {loading ? 'Loading…' : 'Display'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CommonTable
            className="trial-balance-table flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth allowHorizontalScroll={isCompactTable} truncateHeader truncateBody
            columnWidthPercents={LINE_COL_PCT}
            tableClassName={isCompactTable ? 'min-w-[40rem] w-full' : 'min-w-0 w-full'}
            hideVerticalCellBorders cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
            bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
            headers={['Account', 'Total Debit', 'Total Credit', 'Action']}
            rows={tableBodyRows}
            footerRow={totalFiltered > 0 ? tableFooterRow : null}
          />

          <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <span className="hidden sm:block" aria-hidden />
            <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
              <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="flex items-stretch border-l border-gray-200">
                {pageNumbers.map((n) => (
                  <button key={n} type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${n === page ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={n === page ? { backgroundColor: primary } : undefined}
                    onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
              <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={() => setDetailRow(null)} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={() => setDetailRow(null)}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Account Detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Account No" fullWidth readOnly value={detailRow.accountNo || ''} />
              <InputField label="Account Head" fullWidth readOnly value={detailRow.accountHead || ''} />
              <InputField label="Type" fullWidth readOnly value={detailRow.accountType || '—'} />
              <InputField label="Total Debit" fullWidth readOnly value={formatMoney(detailRow.totalDebit)} />
              <InputField label="Total Credit" fullWidth readOnly value={formatMoney(detailRow.totalCredit)} />
              <InputField label="Balance" fullWidth readOnly value={formatMoney(detailRow.balance)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
