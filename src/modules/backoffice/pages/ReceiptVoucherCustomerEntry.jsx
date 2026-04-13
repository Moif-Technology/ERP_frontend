import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, InputField, SubInputField, DateInputField, Switch } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';

const primary = colors.primary?.main || '#790728';

const STATIONS = ['Head office', 'Warehouse', 'Branch – North', 'Branch – South', 'PCS'];

const ACC_BALANCE_OPTIONS = ['0.00', '2,450.00', '5,120.50', '8,200.00', '12,450.00', '18,900.00'];

const INVOICE_TYPES = ['Tax invoice', 'Proforma', 'Credit note', 'Debit note', 'Other'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

function normalizePayType(value) {
  const x = String(value ?? '').toLowerCase();
  return x === 'cheque' ? 'cheque' : 'cash';
}

function formatPayTypeLabel(value) {
  return normalizePayType(value) === 'cheque' ? 'Cheque' : 'Cash';
}

/** Invoice grid: Sl · Voucher no · Invoice date · Invoice type · Ref no · Invoice amount · O/s amount · Paid amount · Action */
const INVOICE_COL_PCT = [5, 9, 9, 11, 8, 11, 11, 11, 25];

/** Header “Add” lines: Sl · Voucher no · Paid date · Customer · Station · Paid amt · Acc Bal · Pay type · Balance · From A/C · Action */
const HEADER_LINE_COL_PCT = [5, 8, 8, 14, 9, 9, 9, 8, 9, 7, 14];

function formatDateDisplay(dateValue) {
  if (!dateValue) return '—';
  const [year, month, day] = String(dateValue).split('-');
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}/${year}`;
}

function buildDummyInvoices(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const d = 1 + (i % 28);
    const m = 1 + (i % 12);
    const y = 2026;
    const invoiceDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const inv = 2000 + (i * 419) % 25000;
    const os = Math.max(0, inv - (i * 200) % (inv + 1));
    const paid = Math.min(os, 500 + (i * 137) % 8000);
    const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    rows.push({
      id: `rvc-inv-${i + 1}`,
      voucherNo: `RV-${String(i + 1).padStart(4, '0')}`,
      invoiceDate,
      invoiceType: INVOICE_TYPES[i % INVOICE_TYPES.length],
      refNo: `REF-${String(1000 + i)}`,
      invoiceAmount: fmt(inv),
      osAmount: fmt(os),
      paidAmount: fmt(paid),
    });
  }
  return rows;
}

function buildDummyLedger() {
  return [
    { id: 'led-1', accountName: 'Accounts Receivable – Trade', debit: '0.00', credit: '12,450.00' },
    { id: 'led-2', accountName: 'Cash in hand', debit: '8,200.00', credit: '0.00' },
    { id: 'led-3', accountName: 'Bank – Operating', debit: '4,250.00', credit: '0.00' },
  ];
}

const DUMMY_INVOICES = buildDummyInvoices(16);
const DUMMY_LEDGER = buildDummyLedger();

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
            name="rvc-pay-type-form"
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
            name="rvc-pay-type-form"
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

export default function ReceiptVoucherCustomerEntry() {
  const [invoiceRows, setInvoiceRows] = useState(() => DUMMY_INVOICES.map((r) => ({ ...r })));
  const [ledgerRows, setLedgerRows] = useState(() => DUMMY_LEDGER.map((r) => ({ ...r })));

  const [documentVoucherNo, setDocumentVoucherNo] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [station, setStation] = useState('');
  const [headerPaidAmount, setHeaderPaidAmount] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [payType, setPayType] = useState('cash');
  const [headerBalance, setHeaderBalance] = useState('');
  const [paidFromAccBalance, setPaidFromAccBalance] = useState(false);
  const [remark, setRemark] = useState('');
  const [receiptLines, setReceiptLines] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactInvoice = useViewportMaxWidth(1200);
  const isCompactHeaderLines = useViewportMaxWidth(1300);

  const filteredRows = invoiceRows;

  const updateInvoiceLine = useCallback((id, patch) => {
    setInvoiceRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleAddReceiptLine = useCallback(() => {
    const z = (s) => (s && String(s).trim() !== '' ? s : '0.00');
    const id = `rvc-hdr-${Date.now()}`;
    setReceiptLines((prev) => [
      ...prev,
      {
        id,
        voucherNo: documentVoucherNo.trim() || '—',
        paidDate,
        customerName: customerName || '—',
        station: station || '—',
        paidAmount: z(headerPaidAmount),
        accBalance: accBalance || '—',
        payType: normalizePayType(payType),
        balance: z(headerBalance),
        paidFromAcc: paidFromAccBalance,
      },
    ]);
    setDocumentVoucherNo('');
    setPaidDate('');
    setCustomerName('');
    setStation('');
    setHeaderPaidAmount('');
    setAccBalance('');
    setPayType('cash');
    setHeaderBalance('');
    setPaidFromAccBalance(false);
  }, [
    documentVoucherNo,
    paidDate,
    customerName,
    station,
    headerPaidAmount,
    accBalance,
    payType,
    headerBalance,
    paidFromAccBalance,
  ]);

  const handleDeleteReceiptLine = useCallback((id) => {
    setReceiptLines((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleViewLine = useCallback((id) => {
    setEditingRowId(null);
    setDetailRowId(id);
  }, []);

  const handleEditLine = useCallback((id) => {
    setDetailRowId(null);
    setEditingRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteInvoiceLine = useCallback((id) => {
    setInvoiceRows((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
  }, []);

  const handleDeleteLedgerLine = useCallback((id) => {
    setLedgerRows((prev) => prev.filter((r) => r.id !== id));
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
    console.log('Post receipt voucher customer', {
      header: {
        documentVoucherNo,
        paidDate,
        customerName,
        station,
        headerPaidAmount,
        accBalance,
        payType,
        headerBalance,
        paidFromAccBalance,
      },
      receiptLines,
      invoiceRows,
      ledgerRows,
    });
  }, [
    documentVoucherNo,
    paidDate,
    customerName,
    station,
    headerPaidAmount,
    accBalance,
    payType,
    headerBalance,
    paidFromAccBalance,
    receiptLines,
    invoiceRows,
    ledgerRows,
  ]);

  const handleUnpost = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Unpost receipt voucher customer');
  }, []);

  const handleDeleteDocument = useCallback(() => {
    setInvoiceRows([]);
    setLedgerRows([]);
    setReceiptLines([]);
    setDocumentVoucherNo('');
    setPaidDate('');
    setCustomerName('');
    setStation('');
    setHeaderPaidAmount('');
    setAccBalance('');
    setPayType('cash');
    setHeaderBalance('');
    setPaidFromAccBalance(false);
    setRemark('');
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, []);

  const handleSave = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Save receipt voucher customer', {
      remark,
      documentVoucherNo,
      paidDate,
      customerName,
      station,
      headerPaidAmount,
      accBalance,
      payType,
      headerBalance,
      paidFromAccBalance,
      receiptLines,
      invoices: invoiceRows,
      ledger: ledgerRows,
    });
  }, [
    remark,
    documentVoucherNo,
    paidDate,
    customerName,
    station,
    headerPaidAmount,
    accBalance,
    payType,
    headerBalance,
    paidFromAccBalance,
    receiptLines,
    invoiceRows,
    ledgerRows,
  ]);

  const handleNewDocument = useCallback(() => {
    handleDeleteDocument();
  }, [handleDeleteDocument]);

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

  const totalOs = useMemo(() => {
    let sum = 0;
    for (const r of filteredRows) {
      sum += parseMoneyValue(r.osAmount);
    }
    return sum;
  }, [filteredRows]);

  const totalDebit = useMemo(() => {
    let sum = 0;
    for (const r of ledgerRows) {
      sum += parseMoneyValue(r.debit);
    }
    return sum;
  }, [ledgerRows]);

  const totalCredit = useMemo(() => {
    let sum = 0;
    for (const r of ledgerRows) {
      sum += parseMoneyValue(r.credit);
    }
    return sum;
  }, [ledgerRows]);

  const invoiceTableBodyRows = useMemo(() => {
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
            onChange={(e) => updateInvoiceLine(r.id, { [field]: e.target.value })}
            aria-label={aria}
          />
        ) : (
          r[field]
        );

      const invDateCell = rowIsEditing ? (
        <input
          key={`id-${r.id}`}
          type="date"
          className={tableCellInputClass}
          value={r.invoiceDate || ''}
          onChange={(e) => updateInvoiceLine(r.id, { invoiceDate: e.target.value })}
          aria-label="Invoice date"
        />
      ) : (
        formatDateDisplay(r.invoiceDate)
      );

      const typeOptions = INVOICE_TYPES.includes(r.invoiceType) ? INVOICE_TYPES : [r.invoiceType, ...INVOICE_TYPES];
      const typeCell = rowIsEditing ? (
        <select
          key={`it-${r.id}`}
          className={`${tableCellInputClass} text-left`}
          value={r.invoiceType}
          onChange={(e) => updateInvoiceLine(r.id, { invoiceType: e.target.value })}
          aria-label="Invoice type"
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ) : (
        r.invoiceType
      );

      return [
        displaySl,
        textInput(`vn-${r.id}`, 'voucherNo', 'Voucher no'),
        invDateCell,
        typeCell,
        textInput(`rf-${r.id}`, 'refNo', 'Ref no'),
        textInput(`ia-${r.id}`, 'invoiceAmount', 'Invoice amount'),
        textInput(`os-${r.id}`, 'osAmount', 'O/s amount'),
        textInput(`pa-${r.id}`, 'paidAmount', 'Paid amount'),
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className={actionIconBtn} aria-label="View line" onClick={() => handleViewLine(r.id)}>
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} aria-label="Edit line" onClick={() => handleEditLine(r.id)}>
            <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className={actionIconBtn} aria-label="Delete line" onClick={() => handleDeleteInvoiceLine(r.id)}>
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
    updateInvoiceLine,
    handleViewLine,
    handleEditLine,
    handleDeleteInvoiceLine,
  ]);

  const invoiceFooterRow = useMemo(
    () => [
      {
        content: (
          <div key="rvc-total-os" className="text-right font-bold sm:text-left">
            Total O/S
          </div>
        ),
        colSpan: 6,
        className: 'align-middle font-bold',
      },
      totalOs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '',
      '',
    ],
    [totalOs],
  );

  const receiptLinesTableBodyRows = useMemo(() => {
    return receiptLines.map((r, idx) => [
      idx + 1,
      r.voucherNo,
      formatDateDisplay(r.paidDate),
      r.customerName,
      r.station,
      r.paidAmount,
      r.accBalance,
      formatPayTypeLabel(r.payType),
      r.balance,
      r.paidFromAcc ? 'Yes' : 'No',
      <div key={`rhl-${r.id}`} className="flex items-center justify-center">
        <button
          type="button"
          className={actionIconBtn}
          aria-label="Delete receipt line"
          onClick={() => handleDeleteReceiptLine(r.id)}
        >
          <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]);
  }, [receiptLines, handleDeleteReceiptLine]);

  const ledgerTableBodyRows = useMemo(() => {
    return ledgerRows.map((r, idx) => (
      [
        idx + 1,
        r.accountName,
        r.debit,
        r.credit,
        <div key={`led-act-${r.id}`} className="flex items-center justify-center">
          <button type="button" className={actionIconBtn} aria-label="Remove ledger line" onClick={() => handleDeleteLedgerLine(r.id)}>
            <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ]
    ));
  }, [ledgerRows, handleDeleteLedgerLine]);

  const ledgerFooterRow = useMemo(
    () => [
      {
        content: <span className="font-bold">Total</span>,
        colSpan: 2,
        className: 'align-middle font-bold text-left',
      },
      totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '',
    ],
    [totalDebit, totalCredit],
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

  const LEDGER_HEADERS = ['Sl no', 'Account name', 'Debit', 'Credit', 'Action'];
  const LEDGER_COL_PCT_WITH_ACTION = [7, 45, 16, 16, 16];

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          RECEIPT VOUCHER (CUSTOMER)
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
            aria-label="New receipt voucher customer"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Receipt (Customer)</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="shrink-0">
          <SubInputField
            label="Voucher no"
            value={documentVoucherNo}
            onChange={(e) => setDocumentVoucherNo(e.target.value)}
            placeholder="No."
          />
        </div>
        <div className="shrink-0">
          <DateInputField label="Paid date" value={paidDate} onChange={setPaidDate} />
        </div>
        <div className="shrink-0">
          <InputField
            label="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name"
            widthPx={160}
          />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Station" value={station} onChange={setStation} options={STATIONS} placeholder="Select" />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="Paid amount"
            value={headerPaidAmount}
            onChange={(e) => setHeaderPaidAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
        <div className="shrink-0">
          <DropdownInput
            label="Acc Balance"
            value={accBalance}
            onChange={setAccBalance}
            options={ACC_BALANCE_OPTIONS}
            placeholder="Select"
          />
        </div>
        <div className="shrink-0">
          <PayTypeRadios value={payType} onChange={setPayType} />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="Balance"
            value={headerBalance}
            onChange={(e) => setHeaderBalance(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
        <div className="flex shrink-0 items-center self-end pb-0.5">
          <Switch
            checked={paidFromAccBalance}
            onChange={setPaidFromAccBalance}
            size="xs"
            id="rvc-paid-from-acc"
            description="Paid From ACC Balance"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button
            type="button"
            onClick={handleAddReceiptLine}
            className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            Add
          </button>
        </div>
        
      </div>

      {receiptLines.length > 0 ? (
        <div className="min-w-0 shrink-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
          <p className="mb-2 text-[10px] font-bold text-gray-700 sm:text-[11px]">Receipt lines</p>
          <CommonTable
            className="receipt-voucher-header-lines-table flex min-w-0 flex-col"
            fitParentWidth
            allowHorizontalScroll={isCompactHeaderLines}
            truncateHeader
            truncateBody
            columnWidthPercents={HEADER_LINE_COL_PCT}
            tableClassName={isCompactHeaderLines ? 'min-w-[56rem] w-full' : 'min-w-0 w-full'}
            hideVerticalCellBorders
            cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)"
            headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
            bodyRowHeightRem={2.1}
            maxVisibleRows={8}
            headers={[
              'Sl no',
              'Voucher no',
              'Paid date',
              'Customer name',
              'Station',
              'Paid amount',
              'Acc Balance',
              'Pay Type',
              'Balance',
              'From A/C',
              'Action',
            ]}
            rows={receiptLinesTableBodyRows}
          />
        </div>
      ) : null}

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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="min-h-0 min-w-0 flex flex-1 flex-col">
          <CommonTable
            className="receipt-voucher-invoice-table flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth
            allowHorizontalScroll={isCompactInvoice}
            truncateHeader
            truncateBody={editingRowId == null}
            columnWidthPercents={INVOICE_COL_PCT}
            tableClassName={isCompactInvoice ? 'min-w-[64rem] w-full' : 'min-w-0 w-full'}
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
              'Invoice date',
              'Invoice type',
              'Ref no',
              'Invoice amount',
              'O/s amount',
              'Paid amount',
              'Action',
            ]}
            rows={invoiceTableBodyRows}
            footerRow={invoiceFooterRow}
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

        <div className="min-w-0 shrink-0 rounded-lg border border-gray-200 bg-slate-50/40 p-2 sm:p-3">
          <CommonTable
            className="receipt-voucher-ledger-table flex min-w-0 flex-col"
            fitParentWidth
            truncateHeader
            truncateBody
            columnWidthPercents={LEDGER_COL_PCT_WITH_ACTION}
            tableClassName="min-w-0 w-full"
            hideVerticalCellBorders
            cellAlign="center"
            headerFontSize="clamp(8px, 0.9vw, 10px)"
            headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-1 py-1 sm:py-1.5"
            bodyRowHeightRem={2.1}
            maxVisibleRows={8}
            headers={LEDGER_HEADERS}
            rows={ledgerTableBodyRows}
            footerRow={ledgerFooterRow}
          />
        </div>
      </div>

      {detailRowId && detailRow ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
          onClick={closeDetailModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rvc-line-detail-title"
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
              id="rvc-line-detail-title"
              className="pr-10 text-sm font-bold sm:text-base"
              style={{ color: primary }}
            >
              Invoice line detail
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Voucher no" fullWidth readOnly value={detailRow.voucherNo} />
              <InputField label="Invoice date" fullWidth readOnly value={formatDateDisplay(detailRow.invoiceDate)} />
              <InputField label="Invoice type" fullWidth readOnly value={detailRow.invoiceType} />
              <InputField label="Ref no" fullWidth readOnly value={detailRow.refNo} />
              <InputField label="Invoice amount" fullWidth readOnly value={detailRow.invoiceAmount} />
              <InputField label="O/s amount" fullWidth readOnly value={detailRow.osAmount} />
              <InputField label="Paid amount" fullWidth readOnly value={detailRow.paidAmount} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
