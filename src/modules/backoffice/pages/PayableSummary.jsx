import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, SubInputField, DateInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [5, 16, 8, 8, 9, 8, 8, 8, 8, 8, 8, 8];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

function fmt(n) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-GB'); } catch { return d; } }

export default function PayableSummary() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [postStatus, setPostStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadData = useCallback(() => {
    setLoading(true);
    setStatusMsg('');
    const params = { summaryType: 'payable' };
    if (postStatus && postStatus !== 'All') params.postStatus = postStatus.toUpperCase();
    accountsApi.getAgingSummary(params)
      .then((r) => { setRows(r.data?.rows || []); setPage(1); })
      .catch((e) => setStatusMsg(e.response?.data?.message || 'Failed to load payable summary'))
      .finally(() => setLoading(false));
  }, [postStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);
  const paginatedRows = useMemo(() => { const s = (page - 1) * pageSize; return rows.slice(s, s + pageSize); }, [rows, page, pageSize]);
  const rangeStart = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, rows.length);
  const pageNumbers = useMemo(() => { if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1); let s = Math.max(1, page - 1); let e = Math.min(totalPages, s + 2); s = Math.max(1, e - 2); return Array.from({ length: e - s + 1 }, (_, i) => s + i); }, [page, totalPages]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    outstanding: acc.outstanding + r.outstanding,
    age0_30: acc.age0_30 + r.age0_30,
    age30_60: acc.age30_60 + r.age30_60,
    age60_120: acc.age60_120 + r.age60_120,
    age120Plus: acc.age120Plus + r.age120Plus,
  }), { outstanding: 0, age0_30: 0, age30_60: 0, age60_120: 0, age120Plus: 0 }), [rows]);

  const tableBodyRows = useMemo(() => paginatedRows.map((r, idx) => [
    (page - 1) * pageSize + idx + 1,
    <span key={`ah-${r.accountId}`} className="block w-full text-left">{r.accountHead}</span>,
    r.accountNo || '—',
    r.billCount,
    fmt(r.totalDebit),
    fmt(r.outstanding),
    fmtDate(r.lastBillDate),
    fmt(r.age0_30),
    fmt(r.age30_60),
    fmt(r.age60_120),
    fmt(r.age120Plus),
    r.accountType || '—',
  ]), [paginatedRows, page, pageSize]);

  const tableFooterRow = useMemo(() => [
    { content: <div key="tot" className="text-left font-bold">Total</div>, colSpan: 5, className: 'align-middle font-bold' },
    <span key="os" className="font-bold">{fmt(totals.outstanding)}</span>,
    '',
    <span key="a1" className="font-bold">{fmt(totals.age0_30)}</span>,
    <span key="a2" className="font-bold">{fmt(totals.age30_60)}</span>,
    <span key="a3" className="font-bold">{fmt(totals.age60_120)}</span>,
    <span key="a4" className="font-bold">{fmt(totals.age120Plus)}</span>,
    '',
  ], [totals]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>PAYABLE SUMMARY</h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`}><img src={PrinterIcon} alt="" className="h-3.5 w-3.5" /></button>
          <button type="button" className={figmaToolbarBtn} onClick={loadData} disabled={loading}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {statusMsg && <div className="rounded px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700">{statusMsg}</div>}

      <div className="flex min-w-0 flex-nowrap items-end gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-3 sm:p-3">
        <div className="shrink-0">
          <DropdownInput label="Post Status" value={postStatus} onChange={setPostStatus} options={['All', 'POSTED', 'PENDING']} placeholder="All" />
        </div>
        <div className="shrink-0"><DateInputField label="Date From" value={dateFrom} onChange={setDateFrom} /></div>
        <div className="shrink-0"><DateInputField label="Date To" value={dateTo} onChange={setDateTo} /></div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={loadData} className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary }}>Search</button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-gray-500">Loading payable summary…</p>
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CommonTable fitParentWidth allowHorizontalScroll columnWidthPercents={LINE_COL_PCT} hideVerticalCellBorders cellAlign="center"
            headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280" bodyFontSize="clamp(8px,1vw,10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5" bodyRowHeightRem={2.2} maxVisibleRows={pageSize}
            headers={['Sl', 'Account Name', 'Acc No', 'Bills', 'Bill Total', 'O/S Amount', 'Last Bill Date', '0-30', '30-60', '60-120', '120+', 'Type']}
            rows={tableBodyRows} footerRow={tableFooterRow} />

          <div className="mt-2 grid w-full shrink-0 grid-cols-1 items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
              <p className="text-[10px] font-semibold text-gray-700">Showing <span className="text-black">{rangeStart}–{rangeEnd}</span> of <span className="text-black">{rows.length}</span></p>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-700">Rows
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-6 w-10 rounded border border-gray-200 bg-white text-center text-[10px] font-semibold outline-none">
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
            <span className="hidden sm:block" aria-hidden />
            <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
              <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="flex items-stretch border-l border-gray-200">
                {pageNumbers.map((n) => <button key={n} type="button" onClick={() => setPage(n)} className={`min-w-[1.75rem] px-2 text-[10px] font-semibold leading-7 ${n === page ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`} style={n === page ? { backgroundColor: primary } : undefined}>{n}</button>)}
              </div>
              <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
