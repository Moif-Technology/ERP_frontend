import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, DateInputField, InputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30, 50];
const LINE_COL_PCT = [5, 12, 9, 10, 22, 12, 12, 18];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

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

export default function VoucherListPage({ title = 'VOUCHER LIST', filterVoucherTypeId, filterPostStatus }) {
  const [vouchers, setVouchers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [voucherTypes, setVoucherTypes] = useState([]);

  const [filterType, setFilterType] = useState('');
  const [filterTypeId, setFilterTypeId] = useState(filterVoucherTypeId || '');
  const [filterStatus, setFilterStatus] = useState(filterPostStatus || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailVoucher, setDetailVoucher] = useState(null);
  const isCompactTable = useViewportMaxWidth(1200);

  useEffect(() => {
    accountsApi.listVoucherTypes().then((res) => {
      setVoucherTypes(res.data?.voucherTypes || []);
    }).catch(() => {});
  }, []);

  const loadVouchers = useCallback(async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, pageSize };
      if (filterTypeId) params.voucherTypeId = filterTypeId;
      if (filterStatus) params.postStatus = filterStatus;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await accountsApi.listVouchers(params);
      const d = res.data;
      setVouchers(d.rows || []);
      setTotal(d.total || 0);
    } catch (e) {
      console.error('Failed to load vouchers', e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterTypeId, filterStatus, dateFrom, dateTo]);

  useEffect(() => { loadVouchers(); }, [page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = useCallback(() => { setPage(1); loadVouchers(1); }, [loadVouchers]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this voucher?')) return;
    try {
      await accountsApi.deleteVoucher(id);
      loadVouchers();
    } catch (e) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  }, [loadVouchers]);

  const handleViewDetail = useCallback(async (id) => {
    try {
      const res = await accountsApi.getVoucher(id);
      setDetailVoucher(res.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Cannot load voucher');
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tableBodyRows = useMemo(() => {
    return vouchers.map((v, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      return [
        slNo,
        `${v.voucher_prefix || ''}${v.auto_voucher_no || ''}`,
        formatDate(v.voucher_date),
        v.voucher_name || v.voucher_type_code || '',
        <span key={`r-${v.voucher_master_id}`} className="block w-full text-left">{v.remarks || v.reference_no || '—'}</span>,
        formatMoney(v.voucher_amount),
        <span key={`s-${v.voucher_master_id}`}
          className={`inline-block rounded px-1.5 py-0.5 text-[8px] font-bold ${v.post_status === 'POSTED' ? 'bg-green-100 text-green-700' : v.post_status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
          {v.post_status}
        </span>,
        <div key={`act-${v.voucher_master_id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className={actionIconBtn} onClick={() => handleViewDetail(v.voucher_master_id)}>
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} onClick={() => handleDelete(v.voucher_master_id)}>
            <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ];
    });
  }, [vouchers, page, pageSize, handleViewDetail, handleDelete]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 5;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          {title}
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`}><img src={PrinterIcon} alt="" className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        {!filterVoucherTypeId && (
          <div className="shrink-0">
            <DropdownInput label="Voucher Type" value={filterType}
              onChange={(val) => {
                setFilterType(val);
                const match = voucherTypes.find((t) => t.voucherName === val);
                setFilterTypeId(match ? match.voucherTypeId : '');
              }}
              options={['All', ...voucherTypes.map((t) => t.voucherName)]} placeholder="All" />
          </div>
        )}
        <div className="shrink-0">
          <DropdownInput label="Status" value={filterStatus}
            onChange={(val) => setFilterStatus(val === 'All' ? '' : val)}
            options={['All', 'PENDING', 'POSTED', 'CANCELLED']} placeholder="All" />
        </div>
        <div className="shrink-0"><DateInputField label="From" value={dateFrom} onChange={setDateFrom} /></div>
        <div className="shrink-0"><DateInputField label="To" value={dateTo} onChange={setDateTo} /></div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={handleFilter}
            className={`${primaryToolbarBtn} h-[26px] min-h-[26px]`} style={{ backgroundColor: primary, borderColor: primary }}
            disabled={loading}>
            {loading ? 'Loading…' : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {vouchers.length === 0 && !loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">No vouchers found</div>
        ) : (
          <CommonTable
            className="voucher-list-table flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth allowHorizontalScroll={isCompactTable} truncateHeader truncateBody
            columnWidthPercents={LINE_COL_PCT}
            tableClassName={isCompactTable ? 'min-w-[56rem] w-full' : 'min-w-0 w-full'}
            hideVerticalCellBorders cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
            bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
            headers={['#', 'Voucher No', 'Date', 'Type', 'Remarks / Ref', 'Amount', 'Status', 'Action']}
            rows={tableBodyRows}
          />
        )}

        {total > 0 && (
          <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Page <span className="text-black">{page}</span> of <span className="text-black">{totalPages}</span> ({total} total)
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
        )}
      </div>

      {detailVoucher ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={() => setDetailVoucher(null)} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-xl sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={() => setDetailVoucher(null)}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>
              Voucher #{detailVoucher.master.voucher_prefix}{detailVoucher.master.auto_voucher_no}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
              <div><span className="font-semibold text-gray-500">Date:</span> {formatDate(detailVoucher.master.voucher_date)}</div>
              <div><span className="font-semibold text-gray-500">Type:</span> {detailVoucher.master.voucher_name || ''}</div>
              <div><span className="font-semibold text-gray-500">Amount:</span> {formatMoney(detailVoucher.master.voucher_amount)}</div>
              <div><span className="font-semibold text-gray-500">Status:</span> {detailVoucher.master.post_status}</div>
              <div className="col-span-2"><span className="font-semibold text-gray-500">Ref:</span> {detailVoucher.master.reference_no || '—'}</div>
              <div className="col-span-2"><span className="font-semibold text-gray-500">Remarks:</span> {detailVoucher.master.remarks || '—'}</div>
            </div>
            <h3 className="mt-4 text-[10px] font-bold text-gray-700 sm:text-xs">Lines</h3>
            <table className="mt-1 w-full text-[9px] sm:text-[10px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-1 text-left font-semibold">Account</th>
                  <th className="py-1 text-right font-semibold">Debit</th>
                  <th className="py-1 text-right font-semibold">Credit</th>
                </tr>
              </thead>
              <tbody>
                {(detailVoucher.details || []).map((d) => (
                  <tr key={d.voucher_detail_id} className="border-b border-gray-100">
                    <td className="py-1">{d.account_no ? `${d.account_no} – ${d.account_head}` : `Account #${d.account_id}`}</td>
                    <td className="py-1 text-right">{formatMoney(d.debit_amount)}</td>
                    <td className="py-1 text-right">{formatMoney(d.credit_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
