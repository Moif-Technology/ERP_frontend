import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, InputField, SubInputField, DateInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';

const primary = colors.primary?.main || '#790728';

const STATIONS = ['Head office', 'Warehouse', 'Branch – North', 'Branch – South', 'PCS'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

function normalizePayType(value) {
  const x = String(value ?? '').toLowerCase();
  return x === 'cheque' ? 'cheque' : 'cash';
}

function formatPayTypeLabel(value) {
  return normalizePayType(value) === 'cheque' ? 'Cheque' : 'Cash';
}

/** Sl no · Voucher no · Paid date · Station · Supplier name · Paid amount · Acc Balance · Pay Type · Balance · Action */
const LINE_COL_PCT = [5, 7, 8, 8, 12, 9, 9, 8, 9, 25];

function formatDateDisplay(dateValue) {
  if (!dateValue) return '—';
  const [year, month, day] = String(dateValue).split('-');
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}/${year}`;
}

function buildDummyPaymentLines(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const d = 1 + (i % 28);
    const m = 1 + (i % 12);
    const y = 2026;
    const paymentDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const paid = 500 + (i * 317) % 12000;
    const paidStr = paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const accBal = (15000 - paid * 0.3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const bal = (8000 - paid * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    rows.push({
      id: `pvs-${i + 1}`,
      voucherNo: `PV-${String(i + 1).padStart(4, '0')}`,
      paymentDate,
      station: STATIONS[i % STATIONS.length],
      supplierName: i % 3 === 0 ? 'Gulf Supplies LLC' : i % 3 === 1 ? 'Metro Traders' : 'Prime Vendors Co.',
      paidAmount: paidStr,
      accBalance: accBal,
      payType: i % 2 === 0 ? 'cash' : 'cheque',
      balance: bal,
    });
  }
  return rows;
}

const DUMMY_LINES = buildDummyPaymentLines(20);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
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

function PayTypeRadios({ value, onChange }) {
  const v = normalizePayType(value);
  const h = inputField.subBox.height;
  return (
    <div className="flex shrink-0 flex-col gap-0.5">
      <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
        Pay Type
      </label>
      <div
        className="flex h-[26px] w-[132px] min-w-[132px] shrink-0 items-center justify-center gap-3 border border-gray-200 bg-white px-2"
        style={{
          height: h,
          minHeight: h,
          boxSizing: 'border-box',
          borderRadius: inputField.subBox.borderRadius,
          background: colors.input?.background ?? '#fff',
        }}
      >
        <label className="flex cursor-pointer items-center gap-1 text-[8px] font-semibold text-black sm:text-[9px]">
          <input
            type="radio"
            name="pvs-pay-type-form"
            checked={v === 'cash'}
            onChange={() => onChange('cash')}
            className="h-3 w-3 accent-[#790728]"
            style={{ accentColor: primary }}
          />
          Cash
        </label>
        <label className="flex cursor-pointer items-center gap-1 text-[8px] font-semibold text-black sm:text-[9px]">
          <input
            type="radio"
            name="pvs-pay-type-form"
            checked={v === 'cheque'}
            onChange={() => onChange('cheque')}
            className="h-3 w-3"
            style={{ accentColor: primary }}
          />
          Cheque
        </label>
      </div>
    </div>
  );
}

export default function PaymentVoucherSupplierEntry() {
  const [tableData, setTableData] = useState(() => DUMMY_LINES.map((r) => ({ ...r })));

  const [voucherNo, setVoucherNo] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [station, setStation] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [payType, setPayType] = useState('cash');
  const [balance, setBalance] = useState('');
  const [remark, setRemark] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1200);

  const filteredRows = tableData;

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleAddLine = useCallback(() => {
    const id = `pvs-${Date.now()}`;
    setTableData((prev) => [
      {
        id,
        voucherNo,
        paymentDate: paidDate,
        station,
        supplierName,
        paidAmount: paidAmount && paidAmount.trim() !== '' ? paidAmount : '0.00',
        accBalance: accBalance && accBalance.trim() !== '' ? accBalance : '0.00',
        payType: normalizePayType(payType),
        balance: balance && balance.trim() !== '' ? balance : '0.00',
      },
      ...prev,
    ]);
    setPage(1);
    setSupplierName('');
    setPaidAmount('');
    setAccBalance('');
    setBalance('');
    setVoucherNo('');
  }, [voucherNo, paidDate, station, supplierName, paidAmount, accBalance, payType, balance]);

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

  const handlePost = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Post payment voucher supplier', { tableData });
  }, [tableData]);

  const handleUnpost = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Unpost payment voucher supplier');
  }, []);

  const handleDeleteDocument = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Delete payment voucher supplier');
    setTableData([]);
    setVoucherNo('');
    setPaidDate('');
    setStation('');
    setSupplierName('');
    setPaidAmount('');
    setAccBalance('');
    setPayType('cash');
    setBalance('');
    setRemark('');
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, []);

  const handleSave = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Save payment voucher supplier', {
      remark,
      lines: tableData,
    });
  }, [remark, tableData]);

  const handleNewDocument = useCallback(() => {
    setTableData([]);
    setVoucherNo('');
    setPaidDate('');
    setStation('');
    setSupplierName('');
    setPaidAmount('');
    setAccBalance('');
    setPayType('cash');
    setBalance('');
    setRemark('');
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, []);

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

  const paidAmountTotal = useMemo(() => {
    let amt = 0;
    for (const r of filteredRows) {
      amt += parseMoneyValue(r.paidAmount);
    }
    return amt;
  }, [filteredRows]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const displaySl = (page - 1) * pageSize + idx + 1;
      const rowIsEditing = editingRowId === r.id;

      const textInput = (key, field, aria) =>
        rowIsEditing ? (
          <input
            key={key}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={r[field]}
            onChange={(e) => updateLine(r.id, { [field]: e.target.value })}
            aria-label={aria}
          />
        ) : (
          r[field]
        );

      const pt = normalizePayType(r.payType);
      const payTypeCell = rowIsEditing ? (
        <div
          key={`pt-${r.id}`}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 text-left"
          role="group"
          aria-label="Pay Type"
        >
          <label className="flex cursor-pointer items-center gap-1 text-[7px] font-semibold text-black sm:text-[8px]">
            <input
              type="radio"
              name={`pvs-pay-type-${r.id}`}
              checked={pt === 'cash'}
              onChange={() => updateLine(r.id, { payType: 'cash' })}
              className="h-2.5 w-2.5 shrink-0"
              style={{ accentColor: primary }}
            />
            Cash
          </label>
          <label className="flex cursor-pointer items-center gap-1 text-[7px] font-semibold text-black sm:text-[8px]">
            <input
              type="radio"
              name={`pvs-pay-type-${r.id}`}
              checked={pt === 'cheque'}
              onChange={() => updateLine(r.id, { payType: 'cheque' })}
              className="h-2.5 w-2.5 shrink-0"
              style={{ accentColor: primary }}
            />
            Cheque
          </label>
        </div>
      ) : (
        formatPayTypeLabel(r.payType)
      );

      const paidDateCell = rowIsEditing ? (
        <input
          key={`pd-${r.id}`}
          type="date"
          className={tableCellInputClass}
          value={r.paymentDate || ''}
          onChange={(e) => updateLine(r.id, { paymentDate: e.target.value })}
          aria-label="Paid date"
        />
      ) : (
        formatDateDisplay(r.paymentDate)
      );

      return [
        displaySl,
        textInput(`vn-${r.id}`, 'voucherNo', 'Voucher no'),
        paidDateCell,
        textInput(`st-${r.id}`, 'station', 'Station'),
        textInput(`sn-${r.id}`, 'supplierName', 'Supplier name'),
        textInput(`pa-${r.id}`, 'paidAmount', 'Paid amount'),
        textInput(`ab-${r.id}`, 'accBalance', 'Acc Balance'),
        payTypeCell,
        textInput(`bl-${r.id}`, 'balance', 'Balance'),
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
          <div key="pvs-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 5,
        className: 'align-middle font-bold',
      },
      paidAmountTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '',
      '',
      '',
      '',
    ],
    [paidAmountTotal],
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
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          PAYMENT VOUCHER (SUPPLIER)
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handlePost} aria-label="Post">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" />
            Post
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handleUnpost} aria-label="Unpost">
            <img src={UnpostIcon} alt="" className="h-3.5 w-3.5" />
            Unpost
          </button>
          <button
            type="button"
            className={`${figmaToolbarBtn} font-semibold text-black`}
            onClick={handleDeleteDocument}
            aria-label="Delete voucher"
          >
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handleSave} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
            Save
          </button>
          <button
            type="button"
            className={primaryToolbarBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={handleNewDocument}
            aria-label="New payment voucher supplier"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Payment Voucher (Supplier)</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="shrink-0">
          <SubInputField
            label="Voucher no"
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            placeholder="No."
          />
        </div>
        <div className="shrink-0">
          <DateInputField label="Paid date" value={paidDate} onChange={setPaidDate} />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Station" value={station} onChange={setStation} options={STATIONS} placeholder="Select" />
        </div>
        <div className="shrink-0">
          <InputField
            label="Supplier name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Supplier name"
            widthPx={160}
          />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="Paid amount"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="Acc Balance"
            value={accBalance}
            onChange={(e) => setAccBalance(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
        <div className="shrink-0">
          <PayTypeRadios value={payType} onChange={setPayType} />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="Balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
        <div className="flex shrink-0 items-end">
          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
        <div className="w-full max-w-xs sm:max-w-sm">
          <label className="text-[9px] font-semibold text-black sm:text-[11px]" style={{ color: '#374151' }}>
            Remark
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={2}
            placeholder="Remarks…"
            className="mt-1 box-border min-h-[3rem] w-full max-w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[9px] outline-none focus:border-gray-400 sm:text-[10px]"
            style={{ background: colors.input?.background ?? '#fff' }}
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="payment-voucher-supplier-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={isCompactTable}
          truncateHeader
          truncateBody={editingRowId == null}
          columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[64rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={[
            'Sl no',
            'Voucher no',
            'Paid date',
            'Station',
            'Supplier name',
            'Paid amount',
            'Acc Balance',
            'Pay Type',
            'Balance',
            'Action',
          ]}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
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
          aria-labelledby="pvs-line-detail-title"
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
              id="pvs-line-detail-title"
              className="pr-10 text-sm font-bold sm:text-base"
              style={{ color: primary }}
            >
              Line detail
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Voucher no" fullWidth readOnly value={detailRow.voucherNo} />
              <InputField label="Paid date" fullWidth readOnly value={formatDateDisplay(detailRow.paymentDate)} />
              <InputField label="Station" fullWidth readOnly value={detailRow.station} />
              <InputField label="Supplier name" fullWidth readOnly value={detailRow.supplierName} />
              <InputField label="Paid amount" fullWidth readOnly value={detailRow.paidAmount} />
              <InputField label="Acc Balance" fullWidth readOnly value={detailRow.accBalance} />
              <InputField label="Pay Type" fullWidth readOnly value={formatPayTypeLabel(detailRow.payType)} />
              <InputField label="Balance" fullWidth readOnly value={detailRow.balance} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
