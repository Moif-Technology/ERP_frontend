import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DateInputField, DropdownInput, InputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30, 50];
const LINE_COL_PCT = [5, 14, 10, 14, 14, 12, 19, 12];
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const primaryLinkBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value) {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-GB');
}

function voucherNo(row) {
  return `${row.voucher_prefix || ''}${row.auto_voucher_no || ''}`;
}

export default function AccountVoucherListPage({
  title,
  voucherTypeName,
  newVoucherPath,
  newVoucherLabel,
}) {
  const [resolvedVoucherTypeId, setResolvedVoucherTypeId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [search, setSearch] = useState('');
  const [postStatus, setPostStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('dateDesc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailVoucher, setDetailVoucher] = useState(null);

  useEffect(() => {
    accountsApi.listVoucherTypes()
      .then((res) => {
        const types = res.data?.voucherTypes || [];
        const match = types.find((item) => item.voucherName === voucherTypeName);
        setResolvedVoucherTypeId(match ? String(match.voucherTypeId) : '');
        if (!match) {
          setStatusMsg(`${voucherTypeName} is not available in voucher type master.`);
        }
      })
      .catch((e) => {
        setStatusMsg(e.response?.data?.message || 'Failed to load voucher types');
      });
  }, [voucherTypeName]);

  const loadRows = useCallback(async () => {
    if (!resolvedVoucherTypeId) return;
    setLoading(true);
    setStatusMsg('');
    try {
      const params = { page: 1, pageSize: 500, voucherTypeId: resolvedVoucherTypeId };
      if (postStatus && postStatus !== 'All') params.postStatus = postStatus;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await accountsApi.listVouchers(params);
      setRows(res.data?.rows || []);
      setPage(1);
    } catch (e) {
      setRows([]);
      setStatusMsg(e.response?.data?.message || `Failed to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [resolvedVoucherTypeId, postStatus, dateFrom, dateTo, title]);

  useEffect(() => {
    if (resolvedVoucherTypeId) {
      loadRows();
    }
  }, [resolvedVoucherTypeId, loadRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? rows.filter((row) =>
          voucherNo(row).toLowerCase().includes(q) ||
          (row.voucher_name || '').toLowerCase().includes(q) ||
          (row.voucher_type_code || '').toLowerCase().includes(q) ||
          (row.reference_no || '').toLowerCase().includes(q) ||
          (row.remarks || '').toLowerCase().includes(q) ||
          (row.post_status || '').toLowerCase().includes(q)
        )
      : [...rows];

    const sorted = [...list];
    if (sortBy === 'amountDesc') {
      sorted.sort((a, b) => Number(b.voucher_amount || 0) - Number(a.voucher_amount || 0));
    } else if (sortBy === 'amountAsc') {
      sorted.sort((a, b) => Number(a.voucher_amount || 0) - Number(b.voucher_amount || 0));
    } else if (sortBy === 'dateAsc') {
      sorted.sort((a, b) => new Date(a.voucher_date).getTime() - new Date(b.voucher_date).getTime());
    } else {
      sorted.sort((a, b) => new Date(b.voucher_date).getTime() - new Date(a.voucher_date).getTime());
    }
    return sorted;
  }, [rows, search, sortBy]);

  const totalAmount = useMemo(
    () => filteredRows.reduce((sum, row) => sum + Number(row.voucher_amount || 0), 0),
    [filteredRows]
  );

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize) || 1);

  useEffect(() => {
    setPage((prev) => Math.min(Math.max(1, prev), totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this voucher?')) return;
    try {
      await accountsApi.deleteVoucher(id);
      loadRows();
    } catch (e) {
      setStatusMsg(e.response?.data?.message || 'Cannot delete voucher');
    }
  }, [loadRows]);

  const handleViewDetail = useCallback(async (id) => {
    try {
      const res = await accountsApi.getVoucher(id);
      setDetailVoucher(res.data);
    } catch (e) {
      setStatusMsg(e.response?.data?.message || 'Cannot load voucher detail');
    }
  }, []);

  const tableRows = useMemo(
    () => paginatedRows.map((row, index) => [
      (page - 1) * pageSize + index + 1,
      voucherNo(row),
      formatDate(row.voucher_date),
      row.reference_no || '—',
      formatMoney(row.voucher_amount),
      <span
        key={`s-${row.voucher_master_id}`}
        className={`inline-block rounded px-1.5 py-0.5 text-[8px] font-bold ${
          row.post_status === 'POSTED'
            ? 'bg-green-100 text-green-700'
            : row.post_status === 'CANCELLED'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {row.post_status}
      </span>,
      <span key={`r-${row.voucher_master_id}`} className="block w-full text-left">{row.remarks || '—'}</span>,
      <div key={`act-${row.voucher_master_id}`} className="flex items-center justify-center gap-1">
        <button type="button" className={actionIconBtn} onClick={() => handleViewDetail(row.voucher_master_id)}>
          <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className={actionIconBtn} onClick={() => handleDelete(row.voucher_master_id)}>
          <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]),
    [paginatedRows, page, pageSize, handleViewDetail, handleDelete]
  );

  const tableFooterRow = useMemo(
    () => [
      { content: <div key="tot" className="text-left font-bold">Total</div>, colSpan: 4, className: 'align-middle font-bold' },
      <span key="amt" className="font-bold">{formatMoney(totalAmount)}</span>,
      '',
      '',
      '',
    ],
    [totalAmount]
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, index) => index + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + 2);
    start = Math.max(1, end - 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={newVoucherPath} className={primaryLinkBtn} style={{ backgroundColor: primary, borderColor: primary }}>
            {newVoucherLabel}
          </Link>
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={loadRows} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {statusMsg ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {statusMsg}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="min-w-[13rem] shrink-0">
          <label className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search voucher no, ref, status, remarks…"
            className="mt-0.5 box-border w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none focus:border-gray-400"
          />
        </div>
        <div className="shrink-0">
          <InputField label="Voucher Type" readOnly value={voucherTypeName} />
        </div>
        <div className="shrink-0">
          <DropdownInput
            label="Post Status"
            value={postStatus}
            onChange={setPostStatus}
            options={['All', 'POSTED', 'PENDING', 'CANCELLED']}
            placeholder="All"
          />
        </div>
        <div className="shrink-0"><DateInputField label="Date From" value={dateFrom} onChange={setDateFrom} /></div>
        <div className="shrink-0"><DateInputField label="Date To" value={dateTo} onChange={setDateTo} /></div>
        <div className="shrink-0">
          <DropdownInput
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'dateDesc', label: 'Date (newest)' },
              { value: 'dateAsc', label: 'Date (oldest)' },
              { value: 'amountDesc', label: 'Amount (high)' },
              { value: 'amountAsc', label: 'Amount (low)' },
            ]}
            placeholder="Sort"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button
            type="button"
            onClick={loadRows}
            className={`${primaryToolbarBtn} h-[26px] min-h-[26px]`}
            style={{ backgroundColor: primary, borderColor: primary }}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Loading vouchers…</div>
        ) : totalRows === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">No vouchers found</div>
        ) : (
          <CommonTable
            className="account-voucher-list-table flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth
            allowHorizontalScroll
            truncateHeader
            truncateBody
            columnWidthPercents={LINE_COL_PCT}
            tableClassName="min-w-[860px] w-full"
            hideVerticalCellBorders
            cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)"
            headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
            bodyRowHeightRem={2.35}
            maxVisibleRows={pageSize}
            headers={['Sl', 'Voucher No', 'Date', 'Ref No', 'Amount', 'Status', 'Remarks', 'Action']}
            rows={tableRows}
            footerRow={tableFooterRow}
          />
        )}

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalRows}</span>
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
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation" aria-label="Pagination">
            <button
              type="button"
              className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next page"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
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
                {(detailVoucher.details || []).map((detail) => (
                  <tr key={detail.voucher_detail_id} className="border-b border-gray-100">
                    <td className="py-1">{detail.account_no ? `${detail.account_no} – ${detail.account_head}` : `Account #${detail.account_id}`}</td>
                    <td className="py-1 text-right">{formatMoney(detail.debit_amount)}</td>
                    <td className="py-1 text-right">{formatMoney(detail.credit_amount)}</td>
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
