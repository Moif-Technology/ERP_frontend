import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, SubInputField, DateInputField, InputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const STATIONS = ['Head office', 'Warehouse', 'Branch – North', 'Branch – South'];

const POST_STATUS_OPTIONS = ['All', 'Posted', 'Unposted', 'Draft'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** 14 columns incl. Action — widths sum to 100 */
const LINE_COL_PCT = [5, 8, 8, 5, 6, 6, 6, 5, 5, 5, 8, 9, 12, 12];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-0.5 py-0.5 text-center text-[clamp(7px,0.9vw,9px)] outline-none focus:border-gray-400 sm:px-1';

const CUSTOMERS = [
  'Northwind Retailers',
  'Sunrise Department Store',
  'Metro Wholesale Hub',
  'Pacific Distributors',
  'Golden Gate Trading',
  'Riverfront Mart',
  'Summit Consumer Co.',
  'Coastal Foods Ltd',
];

const COMPANIES = [
  'Northwind Retailers Pvt Ltd',
  'Sunrise Holdings',
  'Metro Group',
  'Pacific Trade International',
  'Golden Gate Inc.',
  'Riverfront Enterprises',
  'Summit Brands Ltd',
  'Coastal Foods LLC',
];

const STAFF = ['R. Kumar', 'S. Menon', 'A. Patel', 'J. Thomas', 'M. Singh', 'K. Nair'];

function fmtMoney(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function buildDummyReceivableRows(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const base = 750 + (i * 419) % 17500 + (i % 5) * 118.25;
    const bills = 1 + (i % 11);
    const billTotal = base * 1.12 + i * 18;
    const os = base * 0.38 + (i % 6) * 95;
    const d = 1 + (i % 25);
    const m = 1 + (i % 12);
    const slice = os / 4;
    rows.push({
      id: `ars-${i + 1}`,
      customerName: CUSTOMERS[i % CUSTOMERS.length],
      companyName: COMPANIES[i % COMPANIES.length],
      billCount: bills,
      billTotal: fmtMoney(billTotal),
      osAmount: fmtMoney(os),
      lastBillDate: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/2026`,
      b030: fmtMoney(slice * (0.38 + (i % 3) * 0.09)),
      b3060: fmtMoney(slice * (0.27 + (i % 2) * 0.06)),
      b60120: fmtMoney(slice * 0.19),
      b120plus: fmtMoney(slice * (0.16 + (i % 2) * 0.08)),
      managedBy: STAFF[i % STAFF.length],
      createdBy: STAFF[(i + 3) % STAFF.length],
    });
  }
  return rows;
}

const DUMMY_RECEIVABLE_ROWS = buildDummyReceivableRows(36);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const radioLabelClass =
  'flex cursor-pointer items-center gap-1.5 text-[8px] font-semibold text-gray-900 sm:text-[9px]';

export default function ReceivableSummary() {
  const [tableData, setTableData] = useState(() => DUMMY_RECEIVABLE_ROWS.map((r) => ({ ...r })));

  const [scope, setScope] = useState('all');
  const [account, setAccount] = useState('');
  const [station, setStation] = useState('');
  const [postStatus, setPostStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);

  const filteredRows = tableData;

  const handleSelect = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Receivable summary select', { scope, account, station, postStatus, dateFrom, dateTo });
    setTableData(buildDummyReceivableRows(36).map((r) => ({ ...r })));
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [scope, account, station, postStatus, dateFrom, dateTo]);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleViewLine = useCallback((id) => {
    setEditingRowId(null);
    setDetailRowId(id);
  }, []);

  const handleEditLine = useCallback((id) => {
    setDetailRowId(null);
    setEditingRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
  }, []);

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const detailRow = useMemo(
    () => (detailRowId ? filteredRows.find((r) => r.id === detailRowId) : null),
    [detailRowId, filteredRows],
  );

  const detailSlNo = useMemo(() => {
    if (!detailRowId) return 0;
    const i = filteredRows.findIndex((r) => r.id === detailRowId);
    return i >= 0 ? i + 1 : 0;
  }, [detailRowId, filteredRows]);

  useEffect(() => {
    if (detailRowId && !filteredRows.some((r) => r.id === detailRowId)) {
      setDetailRowId(null);
    }
  }, [detailRowId, filteredRows]);

  useEffect(() => {
    if (!detailRowId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailRowId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailRowId]);

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

  const totals = useMemo(() => {
    let billCount = 0;
    let billTotal = 0;
    let os = 0;
    let t030 = 0;
    let t3060 = 0;
    let t60120 = 0;
    let t120 = 0;
    for (const r of filteredRows) {
      billCount += Number(r.billCount) || 0;
      billTotal += parseMoneyValue(r.billTotal);
      os += parseMoneyValue(r.osAmount);
      t030 += parseMoneyValue(r.b030);
      t3060 += parseMoneyValue(r.b3060);
      t60120 += parseMoneyValue(r.b60120);
      t120 += parseMoneyValue(r.b120plus);
    }
    return { billCount, billTotal, os, t030, t3060, t60120, t120 };
  }, [filteredRows]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      const rowIsEditing = editingRowId === r.id;
      const cell = (key, val, left, inputMode) =>
        rowIsEditing ? (
          <input
            key={key}
            type="text"
            inputMode={inputMode}
            className={`${tableCellInputClass} ${left ? 'text-left' : ''}`}
            value={val}
            onChange={(e) => updateLine(r.id, { [key]: e.target.value })}
            aria-label={key}
          />
        ) : (
          val
        );
      const countCell = rowIsEditing ? (
        <input
          key={`bc-${r.id}`}
          type="text"
          inputMode="numeric"
          className={tableCellInputClass}
          value={String(r.billCount)}
          onChange={(e) =>
            updateLine(r.id, { billCount: Math.max(0, parseInt(e.target.value, 10) || 0) })
          }
          aria-label="Bill count"
        />
      ) : (
        r.billCount
      );
      return [
        slNo,
        rowIsEditing ? (
          <input
            key={`cn-${r.id}`}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={r.customerName}
            onChange={(e) => updateLine(r.id, { customerName: e.target.value })}
            aria-label="Customer name"
          />
        ) : (
          <span key={`cn-${r.id}`} className="block w-full text-left">
            {r.customerName}
          </span>
        ),
        rowIsEditing ? (
          <input
            key={`co-${r.id}`}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={r.companyName}
            onChange={(e) => updateLine(r.id, { companyName: e.target.value })}
            aria-label="Company name"
          />
        ) : (
          <span key={`co-${r.id}`} className="block w-full text-left">
            {r.companyName}
          </span>
        ),
        countCell,
        cell('billTotal', r.billTotal, false, 'decimal'),
        cell('osAmount', r.osAmount, false, 'decimal'),
        cell('lastBillDate', r.lastBillDate, false, undefined),
        cell('b030', r.b030, false, 'decimal'),
        cell('b3060', r.b3060, false, 'decimal'),
        cell('b60120', r.b60120, false, 'decimal'),
        cell('b120plus', r.b120plus, false, 'decimal'),
        cell('managedBy', r.managedBy, true, undefined),
        cell('createdBy', r.createdBy, true, undefined),
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className={actionIconBtn} aria-label="View line" onClick={() => handleViewLine(r.id)}>
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} aria-label="Edit line" onClick={() => handleEditLine(r.id)}>
            <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} aria-label="Delete line" onClick={() => handleDeleteLine(r.id)}>
            <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ];
    });
  }, [
    paginatedRows,
    page,
    pageSize,
    editingRowId,
    updateLine,
    handleViewLine,
    handleEditLine,
    handleDeleteLine,
  ]);

  const tableFooterRow = useMemo(
    () => [
      {
        content: (
          <div key="ars-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 3,
        className: 'align-middle font-bold',
      },
      <span key="ars-bc" className="font-bold">
        {totals.billCount}
      </span>,
      <span key="ars-bt" className="font-bold">
        {fmtMoney(totals.billTotal)}
      </span>,
      <span key="ars-os" className="font-bold">
        {fmtMoney(totals.os)}
      </span>,
      '',
      <span key="ars-30" className="font-bold">
        {fmtMoney(totals.t030)}
      </span>,
      <span key="ars-60" className="font-bold">
        {fmtMoney(totals.t3060)}
      </span>,
      <span key="ars-120" className="font-bold">
        {fmtMoney(totals.t60120)}
      </span>,
      <span key="ars-120p" className="font-bold">
        {fmtMoney(totals.t120)}
      </span>,
      '',
      '',
      '',
    ],
    [totals],
  );

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
    <div className="box-border flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col gap-3 overflow-x-hidden rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          ACCOUNTS RECEIVABLE SUMMARY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-w-0 max-w-full overflow-x-hidden rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-2.5">
        <div className="flex min-w-0 max-w-full flex-nowrap items-end gap-2">
          <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-end gap-1.5 overflow-hidden sm:gap-2">
            <div className="flex shrink-0 flex-col gap-0.5">
              <span
                className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]"
                style={{ color: inputField.label.color }}
              >
                View
              </span>
              <fieldset
                className="m-0 flex h-[26px] min-h-[26px] shrink-0 items-center gap-3 rounded border border-gray-200 bg-white px-2 py-0 sm:gap-4 sm:px-2.5"
                style={{
                  borderRadius: inputField.dropdown.borderRadius,
                  background: colors.input?.background ?? '#fff',
                  borderColor: '#e2e8f0',
                  boxSizing: 'border-box',
                }}
              >
                <legend className="sr-only">Report scope</legend>
                <label className={radioLabelClass}>
                  <input
                    type="radio"
                    name="receivable-scope"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                    style={{ accentColor: primary }}
                  />
                  All
                </label>
                <label className={radioLabelClass}>
                  <input
                    type="radio"
                    name="receivable-scope"
                    value="filter"
                    checked={scope === 'filter'}
                    onChange={() => setScope('filter')}
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                    style={{ accentColor: primary }}
                  />
                  Filter
                </label>
              </fieldset>
            </div>
            <div className="min-w-0 max-w-[5.5rem] shrink sm:max-w-[7rem]">
              <SubInputField
                label="Account"
                fullWidth
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Account"
              />
            </div>
            <div className="shrink-0">
              <DropdownInput
                label="Station"
                value={station}
                onChange={setStation}
                options={STATIONS}
                placeholder="Select"
                widthPx={92}
              />
            </div>
            <div className="shrink-0">
              <DropdownInput
                label="Post status"
                value={postStatus}
                onChange={setPostStatus}
                options={POST_STATUS_OPTIONS}
                placeholder="Select"
                widthPx={96}
              />
            </div>
            <div className="shrink-0">
              <DateInputField label="From" value={dateFrom} onChange={setDateFrom} widthPx={100} />
            </div>
            <div className="shrink-0">
              <DateInputField label="To" value={dateTo} onChange={setDateTo} widthPx={100} />
            </div>
          </div>
          <div className="flex shrink-0 items-end">
            <button
              type="button"
              onClick={handleSelect}
              className={`${primaryToolbarBtn} h-[26px] min-h-[26px] whitespace-nowrap px-2 sm:px-2.5`}
              style={{ backgroundColor: primary, borderColor: primary }}
              aria-label="Select"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        <CommonTable
          className="receivable-summary-table flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden"
          fitParentWidth
          allowHorizontalScroll={false}
          truncateHeader
          truncateBody={editingRowId == null}
          columnWidthPercents={LINE_COL_PCT}
          tableClassName="min-w-0 w-full max-w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(6px, 0.75vw, 9px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(7px, 0.9vw, 9px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={[
            'Sl no',
            'Customer name',
            'Company name',
            'Bill count',
            'Bill total',
            'O/S amount',
            'Last bill date',
            '0-30',
            '30-60',
            '60-120',
            '120 and above',
            'Managed by',
            'Created by',
            'Action',
          ]}
          rows={tableBodyRows}
          footerRow={totalFiltered > 0 ? tableFooterRow : null}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
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

          <span className="hidden sm:block" aria-hidden />

          <div
            className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end"
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

      {detailRowId && detailRow ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
          onClick={closeDetailModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ars-line-detail-title"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              onClick={closeDetailModal}
              aria-label="Close line detail"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <h2
              id="ars-line-detail-title"
              className="pr-10 text-sm font-bold sm:text-base"
              style={{ color: primary }}
            >
              Line detail
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Customer name" fullWidth readOnly value={detailRow.customerName} />
              <InputField label="Company name" fullWidth readOnly value={detailRow.companyName} />
              <InputField label="Bill count" fullWidth readOnly value={String(detailRow.billCount)} />
              <InputField label="Bill total" fullWidth readOnly value={detailRow.billTotal} />
              <InputField label="O/S amount" fullWidth readOnly value={detailRow.osAmount} />
              <InputField label="Last bill date" fullWidth readOnly value={detailRow.lastBillDate} />
              <InputField label="0-30" fullWidth readOnly value={detailRow.b030} />
              <InputField label="30-60" fullWidth readOnly value={detailRow.b3060} />
              <InputField label="60-120" fullWidth readOnly value={detailRow.b60120} />
              <InputField label="120 and above" fullWidth readOnly value={detailRow.b120plus} />
              <InputField label="Managed by" fullWidth readOnly value={detailRow.managedBy} />
              <InputField label="Created by" fullWidth readOnly value={detailRow.createdBy} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
