import React, { useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import LedgerIcon from '../../../shared/assets/icons/ledger.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, DatePickerInput, CommonTable, TableTotalsBar, TabsBar, ConfirmDialog } from '../../../shared/components/ui';

// Keep the same table structure as Sale.jsx (Sales return uses the same columns).
function getProductDetails(row) {
  const orDash = (v) => (v != null && v !== '' ? String(v) : '-');
  return {
    productCode: orDash(row[1]),
    stockOnHand: orDash(null),
    lastCustomer: orDash(null),
    unitCost: orDash(null),
    minUnitPrice: orDash(null),
    profit: orDash(null),
    creditLimit: orDash(null),
    currentOsBal: orDash(null),
    osBalance: orDash(null),
    receiptNo: orDash(null),
    location: orDash(null),
    productName: orDash(row[2]),
  };
}

const initialFormState = {
  ownRef: '',
  productCode: '',
  shortDescription: '',
  serialNo: '',
  packetDetails: '',
  unit: '',
  salesQty: '',
  focQty: '',
  returnQty: '',
  unitPrice: '',
  discPercent: '',
  discAmt: '',
  subTotal: '',
  taxPercent: '',
  taxAmt: '',
  total: '',
  qutnNo: 'QTN-001',
  doNo: 'DO-001',
};

const returnFormInitial = {
  returnType: 'Full',
  billNo: '',
  counterNo: '',
  billDate: '',
  paymentMode: 'Cash',
  station: 'Main',
};

const billPanelInitial = {
  returnBillNo: '',
  custLpo: '',
  localBillNo: '',
  customerName: '',
  returnBillDate: '',
  paymentDate: '',
  creditCardNo: '',
  creditCard: '',
  cashierName: '',
  invoiceAmt: '',
  station: 'Main',
  salesTerms: '',
  counterNo: '',
  paidAmount: '',
  balanceAmount: '',
};

export default function SalesReturn() {
  const primary = colors.primary?.main || '#790728';

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [returnForm, setReturnForm] = useState(returnFormInitial);
  const [billPanel, setBillPanel] = useState(billPanelInitial);

  const [saleRows, setSaleRows] = useState([
    ['OR-001', 'PC-1001', 'Product A', 'SN-001', 'pkt 10', 'PCS', 2, 0, 0, 120.0, 5, 12.0, 228.0, 18, 41.04, 269.04],
    ['OR-002', 'PC-2034', 'Product B', 'SN-002', 'ea', 'EA', 1, 0, 0, 450.0, 10, 45.0, 405.0, 18, 72.9, 477.9],
    ['OR-003', 'PC-9090', 'Service C', 'SN-003', '-', 'HR', 3, 0, 0, 80.0, 0, 0.0, 240.0, 5, 12.0, 252.0],
  ]);
  const [form, setForm] = useState(initialFormState);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  /** null | { mode: 'single', idx: number } | { mode: 'bulk' } */
  const [pendingDelete, setPendingDelete] = useState(null);

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDelete = (idx) => {
    setSaleRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
    } else if (editingRowIndex !== null && editingRowIndex > idx) {
      setEditingRowIndex((i) => i - 1);
    }
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedRows);
    setSaleRows((prev) => prev.filter((_, i) => !toDelete.has(i)));
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) {
      setEditingRowIndex(null);
    } else if (editingRowIndex !== null) {
      const deletedBefore = [...toDelete].filter((i) => i < editingRowIndex).length;
      setEditingRowIndex(editingRowIndex - deletedBefore);
    }
  };

  const handleEdit = (_row, idx) => {
    setEditingRowIndex(idx);
    // Keep form update for compatibility (even though return screen doesn't use sales form fields)
    setForm((f) => ({ ...f }));
  };

  const handleReturnAdd = () => {
    const desc = `Return (${returnForm.returnType}) — Bill ${returnForm.billNo || '-'}`;
    const newRow = [
      '',
      returnForm.counterNo || '-',
      desc,
      '',
      '',
      '',
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];
    if (editingRowIndex !== null) {
      setSaleRows((prev) => {
        const next = [...prev];
        next[editingRowIndex] = newRow;
        return next;
      });
      setEditingRowIndex(null);
    } else {
      setSaleRows((prev) => [newRow, ...prev]);
    }
  };

  const RET_ENTRY_H = 26;
  const RET_ENTRY_LBL = 'text-[9px] font-semibold text-gray-500 sm:text-[10px]';
  const RET_ENTRY_INP = 'text-[10px] tabular-nums';

  const [rightTab, setRightTab] = useState('summary');

  const totalSubTotal = useMemo(() => saleRows.reduce((sum, r) => sum + Number(r[12] ?? 0), 0), [saleRows]);
  const totalDiscAmt2 = useMemo(() => saleRows.reduce((sum, r) => sum + Number(r[11] ?? 0), 0), [saleRows]);
  const totalTaxAmt2 = useMemo(() => saleRows.reduce((sum, r) => sum + Number(r[14] ?? 0), 0), [saleRows]);
  const totalLineTotal2 = useMemo(() => saleRows.reduce((sum, r) => sum + Number(r[15] ?? 0), 0), [saleRows]);

  const rowsWithTotal = useMemo(
    () => saleRows.map((r, idx) => [
      <div key={`chk-${idx}`} className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedRows.has(idx)}
          onChange={() => toggleRowSelection(idx)}
          className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
          style={{ accentColor: primary }}
        />
      </div>,
      r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14], r[15],
      <div key={`action-${idx}`} className="pur-act flex items-center justify-center gap-0.5 sm:gap-1">
        <button type="button" onClick={() => setSelectedProduct(getProductDetails(r))}>
          <img src={ViewActionIcon} alt="View" className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => handleEdit(r, idx)}>
          <img src={EditActionIcon} alt="Edit" className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => setPendingDelete({ mode: 'single', idx })}>
          <img src={DeleteActionIcon} alt="Delete" className="h-3.5 w-3.5" />
        </button>
      </div>,
    ]),
    [saleRows, selectedRows, primary]
  );

  return (
    <div className="pur-root box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        .pur-root { --pr: ${primary}; --bd: #e5e7eb; --txt: #111827; --muted: #6b7280; --soft: #f9fafb; }
        .pur-btn { display:inline-flex; align-items:center; gap:4px; border-radius:6px; border:1px solid var(--bd); background:#fff; padding:0 10px; font-size:11px; font-weight:500; color:#374151; height:28px; min-height:28px; white-space:nowrap; transition:background .15s,border-color .15s; cursor:pointer; }
        .pur-btn:hover { background:#f9fafb; border-color:#d1d5db; }
        .pur-btn:disabled { opacity:.5; cursor:not-allowed; }
        .pur-lbl { font-size:9px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; margin-bottom:4px; }
        .pur-summary-card { background:#fff; border-radius:8px; border:1px solid var(--bd); overflow:hidden; }
        .pur-summary-row { display:flex; align-items:center; justify-content:space-between; padding:5px 10px; border-bottom:1px solid #f3f4f6; }
        .pur-summary-row-dense { display:flex; align-items:center; justify-content:space-between; padding:3px 10px; border-bottom:1px solid #f3f4f6; }
        .pur-summary-row:last-child,.pur-summary-row-dense:last-child { border-bottom:none; }
        .pur-summary-label { font-size:10px; color:var(--muted); }
        .pur-summary-value { font-size:10px; font-weight:600; color:var(--txt); font-variant-numeric:tabular-nums; }
        .pur-summary-value-sm { font-size:9px; font-weight:500; color:var(--muted); font-variant-numeric:tabular-nums; }
        .pur-summary-pair-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
        .pur-summary-net { display:flex; align-items:center; justify-content:space-between; padding:7px 10px; background:var(--soft); }
        .pur-act { display:inline-flex; align-items:center; justify-content:center; gap:2px; }
        .pur-act button { padding:2px; border-radius:3px; transition:background .12s; }
        .pur-act button:hover { background:#f3f4f6; }
        .pur-del { display:inline-flex; align-items:center; gap:4px; border-radius:6px; border:1px solid; padding:0 10px; font-size:11px; font-weight:500; height:28px; min-height:28px; color:#fff; transition:opacity .15s; cursor:pointer; }
        .pur-del:hover { opacity:.88; }
        .pur-entry-bar-input input,.pur-entry-bar-input select { background:#fff !important; }
        .pur-fi { display:flex; align-items:center; gap:6px; padding:4px 10px; }
        .pur-fi label { font-size:9px; font-weight:600; color:var(--muted); white-space:nowrap; min-width:80px; }
        .pur-fi input { flex:1; min-width:0; border-radius:4px; border:1px solid var(--bd); background:var(--soft); padding:3px 7px; font-size:10px; outline:none; }
        .pur-fi input:focus { border-color:var(--pr); }
        .pur-ta { width:100%; border-radius:4px; border:1px solid var(--bd); background:var(--soft); padding:5px 8px; font-size:10px; resize:vertical; outline:none; min-height:52px; }
        .pur-ta:focus { border-color:var(--pr); }
        .ret-tbl th,.ret-tbl td { font-size:clamp(7px,0.85vw,9px) !important; }
      `}</style>

      {/* Row 1 — title + actions */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          SALES RETURN
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" className="pur-btn"><img src={PrinterIcon} alt="" className="h-3 w-3" />Print</button>
          <button type="button" className="pur-btn"><img src={CancelIcon} alt="" className="h-3 w-3" />Cancel</button>
          <button type="button" className="pur-btn"><img src={LedgerIcon} alt="" className="h-3 w-3" />Acc Post Temp</button>
          {selectedRows.size > 0 && (
            <button type="button" className="pur-del" style={{ backgroundColor: primary, borderColor: primary }}
              onClick={() => setPendingDelete({ mode: 'bulk' })}>
              <img src={DeleteActionIcon} alt="" className="h-3 w-3 brightness-0 invert" />
              Delete ({selectedRows.size})
            </button>
          )}
          <button type="button" className="inline-flex items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white h-7"
            style={{ backgroundColor: primary, borderColor: primary }}>
            <img src={PostIcon} alt="" className="h-3 w-3 brightness-0 invert" />Post
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white h-7"
            style={{ backgroundColor: primary, borderColor: primary }}>
            Save
          </button>
        </div>
      </div>

      {/* Entry bar — return form */}
      <div className="pur-entry-bar-input flex shrink-0 flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <DropdownInput label="Return type" options={['Full','Partial','Credit note','Exchange']} value={returnForm.returnType}
          onChange={(v) => setReturnForm((f) => ({ ...f, returnType: v }))} widthPx={110} heightPx={RET_ENTRY_H} labelClassName={RET_ENTRY_LBL} className={RET_ENTRY_INP} />
        <SubInputField label="Bill no" widthPx={80} heightPx={RET_ENTRY_H} labelClassName={RET_ENTRY_LBL} className={RET_ENTRY_INP}
          value={returnForm.billNo} onChange={(e) => setReturnForm((f) => ({ ...f, billNo: e.target.value }))} />
        <SubInputField label="Counter no" widthPx={80} heightPx={RET_ENTRY_H} labelClassName={RET_ENTRY_LBL} className={RET_ENTRY_INP}
          value={returnForm.counterNo} onChange={(e) => setReturnForm((f) => ({ ...f, counterNo: e.target.value }))} />
        <DateInputField label="Bill date" widthPx={110} heightPx={RET_ENTRY_H} labelClassName={RET_ENTRY_LBL}
          value={returnForm.billDate} onChange={(v) => setReturnForm((f) => ({ ...f, billDate: v }))} />
        <DropdownInput label="Payment mode" options={['Cash','Card','Bank Transfer','Credit','Cheque']} value={returnForm.paymentMode}
          onChange={(v) => setReturnForm((f) => ({ ...f, paymentMode: v }))} widthPx={120} heightPx={RET_ENTRY_H} labelClassName={RET_ENTRY_LBL} className={RET_ENTRY_INP} />
        <DropdownInput label="Station" options={['Main','Branch 1','Branch 2','Warehouse']} value={returnForm.station}
          onChange={(v) => setReturnForm((f) => ({ ...f, station: v }))} widthPx={110} heightPx={RET_ENTRY_H} labelClassName={RET_ENTRY_LBL} className={RET_ENTRY_INP} />
        <button type="button" onClick={handleReturnAdd}
          className="inline-flex shrink-0 items-center justify-center rounded border px-3 text-[10px] font-semibold leading-none text-white"
          style={{ backgroundColor: primary, borderColor: primary, height: RET_ENTRY_H, minHeight: RET_ENTRY_H }}>
          {editingRowIndex !== null ? 'Update' : 'Add'}
        </button>
      </div>

      {/* Main grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Left — table */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200">
          <CommonTable
            className="ret-tbl flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth
            allowHorizontalScroll
            tableClassName="min-w-[1100px] xl:min-w-0"
            hideVerticalCellBorders
            cellAlign="center"
            headerFontSize="clamp(7px,0.9vw,9px)"
            headerTextColor="#6b7280"
            bodyFontSize="clamp(9px,1.25vw,12px)"
            cellPaddingClass="px-1.5 py-1.5 sm:px-2 sm:py-2"
            bodyRowHeightRem={2.35}
            maxVisibleRows={11}
            headers={['','Own Ref','Product Code','Short Desc','Serial #','Packet','Unit','Sales Qty','FOC Qty','Ret Qty','Sell Price','Disc %','Disc Amt','Sub Total','Tax %','Tax Amt','Line Total','Action']}
            rows={rowsWithTotal}
          />
          <TableTotalsBar
            borderColor="#e5e5e5"
            columns={4}
            items={[
              { label: 'Sub Total', value: totalSubTotal.toFixed(2) },
              { label: 'Disc Amt', value: totalDiscAmt2.toFixed(2) },
              { label: 'Tax Amt', value: totalTaxAmt2.toFixed(2) },
              { label: 'Net Amount', value: totalLineTotal2.toFixed(2), strong: true },
            ]}
          />
        </div>

        {/* Right panel */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200 xl:min-w-0">
          {/* Always-visible: Return Details */}
          <div className="shrink-0 bg-neutral-50 p-3">
            <p className="pur-lbl mb-2">Return Details</p>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="pur-lbl">Return Bill No</p>
                  <InputField fullWidth heightPx={26} className={RET_ENTRY_INP} value={billPanel.returnBillNo} onChange={(e) => setBillPanel((p) => ({ ...p, returnBillNo: e.target.value }))} />
                </div>
                <div>
                  <p className="pur-lbl">Local Bill No</p>
                  <SubInputField fullWidth heightPx={26} className={RET_ENTRY_INP} value={billPanel.localBillNo} onChange={(e) => setBillPanel((p) => ({ ...p, localBillNo: e.target.value }))} />
                </div>
              </div>
              <div>
                <p className="pur-lbl">Cust. LPO #</p>
                <SubInputField fullWidth heightPx={26} className={RET_ENTRY_INP} value={billPanel.custLpo} onChange={(e) => setBillPanel((p) => ({ ...p, custLpo: e.target.value }))} />
              </div>
              <div>
                <p className="pur-lbl">Customer Name</p>
                <InputField fullWidth heightPx={26} className={RET_ENTRY_INP} value={billPanel.customerName} onChange={(e) => setBillPanel((p) => ({ ...p, customerName: e.target.value }))} />
              </div>
              <div>
                <p className="pur-lbl">Return Bill Date</p>
                <DatePickerInput fullWidth heightPx={26} displayFontSize={10} value={billPanel.returnBillDate} onChange={(e) => setBillPanel((p) => ({ ...p, returnBillDate: e?.target?.value ?? '' }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="pur-lbl">Counter No</p>
                  <SubInputField fullWidth heightPx={26} className={RET_ENTRY_INP} value={billPanel.counterNo} onChange={(e) => setBillPanel((p) => ({ ...p, counterNo: e.target.value }))} />
                </div>
                <div>
                  <p className="pur-lbl">Station</p>
                  <DropdownInput fullWidth heightPx={26} className={RET_ENTRY_INP} options={['Main','Branch 1','Branch 2','Warehouse']} value={billPanel.station} onChange={(v) => setBillPanel((p) => ({ ...p, station: v }))} />
                </div>
              </div>
            </div>
          </div>

          <TabsBar tabs={[{ id: 'summary', label: 'Summary' }, { id: 'payment', label: 'Payment' }]} activeTab={rightTab} onChange={setRightTab} />

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
            {rightTab === 'summary' && (
              <div className="flex flex-col gap-3">
                <div className="pur-summary-card">
                  <div className="pur-summary-row">
                    <span className="pur-summary-label">Sub Total</span>
                    <span className="pur-summary-value">{totalSubTotal.toFixed(2)}</span>
                  </div>
                  <div className="pur-summary-row">
                    <span className="pur-summary-label">Disc Amt</span>
                    <span className="pur-summary-value">{totalDiscAmt2.toFixed(2)}</span>
                  </div>
                  <div className="pur-summary-row">
                    <span className="pur-summary-label">Tax Amt</span>
                    <span className="pur-summary-value">{totalTaxAmt2.toFixed(2)}</span>
                  </div>
                  <div className="pur-summary-net">
                    <span className="text-[11px] font-bold" style={{ color: primary }}>Net Amount</span>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: primary }}>{totalLineTotal2.toFixed(2)}</span>
                  </div>
                </div>

                {/* Billing */}
                <p className="pur-lbl">Billing</p>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="pur-lbl">Payment Mode</p>
                    <DropdownInput fullWidth options={['Cash','Card','Bank Transfer','Credit','Cheque']} value={billPanel.paymentDate} onChange={(v) => setBillPanel((p) => ({ ...p, paymentDate: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="pur-lbl">Credit Card No</p>
                      <InputField fullWidth value={billPanel.creditCardNo} onChange={(e) => setBillPanel((p) => ({ ...p, creditCardNo: e.target.value }))} />
                    </div>
                    <div>
                      <p className="pur-lbl">Credit Card</p>
                      <InputField fullWidth value={billPanel.creditCard} onChange={(e) => setBillPanel((p) => ({ ...p, creditCard: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="pur-lbl">Cashier</p>
                      <DropdownInput fullWidth options={['Cashier 1','Cashier 2']} placeholder="Select" value={billPanel.cashierName} onChange={(v) => setBillPanel((p) => ({ ...p, cashierName: v }))} />
                    </div>
                    <div>
                      <p className="pur-lbl">Invoice Amt</p>
                      <InputField fullWidth type="number" value={billPanel.invoiceAmt} onChange={(e) => setBillPanel((p) => ({ ...p, invoiceAmt: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'payment' && (
              <div className="flex flex-col gap-2">
                <p className="pur-lbl">Sales Terms</p>
                <textarea className="pur-ta" rows={3} value={billPanel.salesTerms} onChange={(e) => setBillPanel((p) => ({ ...p, salesTerms: e.target.value }))} placeholder="Sales terms..." />
                <div className="pur-fi">
                  <label>Paid Amount</label>
                  <input type="number" value={billPanel.paidAmount} onChange={(e) => setBillPanel((p) => ({ ...p, paidAmount: e.target.value }))} />
                </div>
                <div className="pur-fi">
                  <label>Balance Amount</label>
                  <input type="number" value={billPanel.balanceAmount} onChange={(e) => setBillPanel((p) => ({ ...p, balanceAmount: e.target.value }))} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.mode === 'bulk' ? 'Delete selected lines?' : 'Delete line item?'}
        message={
          pendingDelete?.mode === 'bulk'
            ? `This will remove ${selectedRows.size} selected row(s). This action cannot be undone.`
            : 'This will remove the row from the sales return. This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.mode === 'bulk') handleDeleteSelected();
          else handleDelete(pendingDelete.idx);
        }}
      />

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-title"
        >
          <div className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 id="product-details-title" className="text-sm font-bold sm:text-base" style={{ color: primary }}>
                Product details
              </h2>
              <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedProduct(null)} aria-label="Close details">
                x
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Product code', selectedProduct.productCode],
                ['Stock on hand', selectedProduct.stockOnHand],
                ['Last customer', selectedProduct.lastCustomer],
                ['Unit cost', selectedProduct.unitCost],
                ['Min unit price', selectedProduct.minUnitPrice],
                ['Profit', selectedProduct.profit],
                ['Credit limit', selectedProduct.creditLimit],
                ['Current OS bal', selectedProduct.currentOsBal],
                ['OS balance', selectedProduct.osBalance],
                ['Receipt no', selectedProduct.receiptNo],
                ['Location', selectedProduct.location],
                ['Product name', selectedProduct.productName],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <div className="font-semibold text-gray-700">{label}</div>
                  <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1">{value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
