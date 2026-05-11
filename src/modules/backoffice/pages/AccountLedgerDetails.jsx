import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, SubInputField, DateInputField, InputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [5, 10, 8, 22, 10, 12, 12, 21];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

function useViewportMaxWidth(maxPx) {
  const query = `(max-width: ${maxPx}px)`;
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function AccountLedgerDetails() {
  const [accountOptions, setAccountOptions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [openDebit, setOpenDebit] = useState(0);
  const [openCredit, setOpenCredit] = useState(0);
  const [accountInfo, setAccountInfo] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1200);

  useEffect(() => {
    accountsApi.listAccountHeads({ postingOnly: true }).then((res) => {
      const heads = res.data?.accountHeads || [];
      setAccountOptions(heads);
    }).catch(() => {});
  }, []);

  const handleDisplay = useCallback(async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await accountsApi.getLedgerTransactions(selectedAccountId, params);
      const d = res.data;
      setRows(d.rows || []);
      setTotal(d.total || 0);
      setOpenDebit(d.openDebit || 0);
      setOpenCredit(d.openCredit || 0);
      setAccountInfo(d.account || null);
    } catch (e) {
      console.error('Failed to load ledger', e);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, dateFrom, dateTo, page, pageSize]);

  useEffect(() => {
    if (selectedAccountId) handleDisplay();
  }, [page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDebit = useMemo(() => rows.reduce((s, r) => s + Number(r.debit_amount || 0), 0), [rows]);
  const totalCredit = useMemo(() => rows.reduce((s, r) => s + Number(r.credit_amount || 0), 0), [rows]);

  const closeDebit = useMemo(() => {
    const net = openDebit - openCredit + totalDebit - totalCredit;
    return net >= 0 ? net : 0;
  }, [openDebit, openCredit, totalDebit, totalCredit]);

  const closeCredit = useMemo(() => {
    const net = openDebit - openCredit + totalDebit - totalCredit;
    return net < 0 ? -net : 0;
  }, [openDebit, openCredit, totalDebit, totalCredit]);

  const tableBodyRows = useMemo(() => {
    return rows.map((r, idx) => {
      const slNo = idx + 1;
      return [
        slNo,
        `${r.voucher_prefix || ''}${r.auto_voucher_no || ''}`,
        formatDate(r.voucher_date),
        <span key={`p-${r.voucher_detail_id}`} className="block w-full text-left">{r.narration || r.voucher_type_code || '—'}</span>,
        r.voucher_type_code || '',
        formatMoney(r.debit_amount),
        formatMoney(r.credit_amount),
        <div key={`act-${r.voucher_detail_id}`} className="flex items-center justify-center">
          <button type="button" className={actionIconBtn} onClick={() => setDetailRowId(r.voucher_detail_id)}>
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ];
    });
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tableFooterRows = useMemo(() => {
    if (rows.length === 0) return [];
    const labelCell = (text) => ({ content: <span className="font-bold">{text}</span>, colSpan: 5, className: 'text-left align-middle' });
    return [
      [labelCell('Open balance'), formatMoney(openDebit), formatMoney(openCredit), ''],
      [labelCell('Current total'), formatMoney(totalDebit), formatMoney(totalCredit), ''],
      [labelCell('Close balance'), formatMoney(closeDebit), formatMoney(closeCredit), ''],
    ];
  }, [rows, openDebit, openCredit, totalDebit, totalCredit, closeDebit, closeCredit]);

  const detailRow = useMemo(() => rows.find((r) => r.voucher_detail_id === detailRowId) || null, [detailRowId, rows]);

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
          LEDGER DETAILS {accountInfo ? `— ${accountInfo.accountHead}` : ''}
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="min-w-[16rem] w-full max-w-full shrink-0 sm:min-w-[22rem] sm:w-[22rem]">
          <DropdownInput
            label="Ledger"
            value={selectedAccount}
            onChange={(val) => {
              setSelectedAccount(val);
              const match = accountOptions.find(a => `${a.accountNo} – ${a.accountHead}` === val);
              setSelectedAccountId(match ? match.accountId : null);
            }}
            options={accountOptions.map(a => `${a.accountNo} – ${a.accountHead}`)}
            placeholder="Select account"
          />
        </div>
        <div className="shrink-0">
          <DateInputField label="Date From" value={dateFrom} onChange={setDateFrom} />
        </div>
        <div className="shrink-0">
          <DateInputField label="Date To" value={dateTo} onChange={setDateTo} />
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={() => { setPage(1); handleDisplay(); }}
            className={`${primaryToolbarBtn} h-[26px] min-h-[26px]`} style={{ backgroundColor: primary, borderColor: primary }}
            disabled={!selectedAccountId || loading}>
            {loading ? 'Loading…' : 'Display'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {rows.length === 0 && !loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            {selectedAccountId ? 'No transactions found' : 'Select an account and click Display'}
          </div>
        ) : (
          <CommonTable
            className="account-ledger-details-table flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth allowHorizontalScroll={isCompactTable} truncateHeader truncateBody
            columnWidthPercents={LINE_COL_PCT}
            tableClassName={isCompactTable ? 'min-w-[56rem] w-full' : 'min-w-0 w-full'}
            hideVerticalCellBorders cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
            bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
            headers={['Sl', 'Voucher No', 'Date', 'Particular', 'Type', 'Debit', 'Credit', 'Action']}
            rows={tableBodyRows}
            footerRows={tableFooterRows}
          />
        )}

        {total > 0 && (
          <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
              <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
                Page <span className="text-black">{page}</span> of <span className="text-black">{totalPages}</span> ({total} entries)
              </p>
              <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
                Rows
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300">
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
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
        )}
      </div>

      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={() => setDetailRowId(null)} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={() => setDetailRowId(null)}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Voucher Detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Voucher No" fullWidth readOnly value={`${detailRow.voucher_prefix || ''}${detailRow.auto_voucher_no || ''}`} />
              <InputField label="Date" fullWidth readOnly value={formatDate(detailRow.voucher_date)} />
              <InputField label="Type" fullWidth readOnly value={detailRow.voucher_name || detailRow.voucher_type_code || ''} />
              <InputField label="Narration" fullWidth readOnly value={detailRow.narration || '—'} />
              <InputField label="Debit" fullWidth readOnly value={formatMoney(detailRow.debit_amount)} />
              <InputField label="Credit" fullWidth readOnly value={formatMoney(detailRow.credit_amount)} />
              <InputField label="Status" fullWidth readOnly value={detailRow.post_status || ''} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
