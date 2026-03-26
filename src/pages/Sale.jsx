import React, { useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import PostIcon from '../assets/icons/post.svg';
import UnpostIcon from '../assets/icons/unpost.svg';
import EditIcon from '../assets/icons/edit3.svg';
import SaleIcon from '../assets/icons/invoice.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import PayIcon from '../assets/icons/pay.svg';
import RemoveIcon from '../assets/icons/remove.svg';
import { InputField, SubInputField, DropdownInput, Switch, CommonTable } from '../components/ui';

// Helper: get product details from table row, use "-" for empty values
function getProductDetails(row, idx) {
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
    productName: orDash(row[0]),
  };
}

const initialFormState = {
  shortDescription: '',
  hsCode: '',
  qty: '',
  unitPrice: '',
  discPercent: '',
  discPrice: '',
  discAmt: '',
  subTotal: '',
  taxPercent: '',
  taxAmt: '',
  total: '',
  qutnNo: 'QTN-001',
  doNo: 'DO-001',
};

export default function Sale({ pageTitle = 'Sales', termsTitle = 'Sales terms' }) {
  const [salesTermsOpen, setSalesTermsOpen] = useState(false);
  const [saveTerms, setSaveTerms] = useState(false);
  const [printTerms, setPrintTerms] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleRows, setSaleRows] = useState([
    ['Product A', 'HS-1001', 2, 120.0, 5, 12.0, 228.0, 18, 41.04, 269.04],
    ['Product B', 'HS-2034', 1, 450.0, 10, 45.0, 405.0, 18, 72.9, 477.9],
    ['Service C', 'HS-9090', 3, 80.0, 0, 0.0, 240.0, 5, 12.0, 252.0],
  ]);
  const [form, setForm] = useState(initialFormState);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const fillFormFromRow = (row) => {
    setForm({
      shortDescription: String(row[0] ?? ''),
      hsCode: String(row[1] ?? ''),
      qty: String(row[2] ?? ''),
      unitPrice: String(row[3] ?? ''),
      discPercent: String(row[4] ?? ''),
      discPrice: String(row[5] ?? ''),
      discAmt: String(row[5] ?? ''),
      subTotal: String(row[6] ?? ''),
      taxPercent: String(row[7] ?? ''),
      taxAmt: String(row[8] ?? ''),
      total: String(row[9] ?? ''),
      qutnNo: 'QTN-001',
      doNo: 'DO-001',
    });
  };

  const handleEdit = (row, idx) => {
    fillFormFromRow(row);
    setEditingRowIndex(idx);
  };

  const handleDelete = (idx) => {
    setSaleRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
      setForm(initialFormState);
    } else if (editingRowIndex !== null && editingRowIndex > idx) {
      setEditingRowIndex((i) => i - 1);
    }
  };

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedRows);
    setSaleRows((prev) => prev.filter((_, i) => !toDelete.has(i)));
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) {
      setEditingRowIndex(null);
      setForm(initialFormState);
    } else if (editingRowIndex !== null) {
      const deletedBefore = [...toDelete].filter((i) => i < editingRowIndex).length;
      setEditingRowIndex(editingRowIndex - deletedBefore);
    }
  };

  const handleSaveOrUpdate = () => {
    const newRow = [
      form.shortDescription,
      form.hsCode,
      form.qty ? Number(form.qty) : 0,
      form.unitPrice ? Number(form.unitPrice) : 0,
      form.discPercent ? Number(form.discPercent) : 0,
      form.discPrice ? Number(form.discPrice) : 0,
      form.subTotal ? Number(form.subTotal) : 0,
      form.taxPercent ? Number(form.taxPercent) : 0,
      form.taxAmt ? Number(form.taxAmt) : 0,
      form.total ? Number(form.total) : 0,
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
    setForm(initialFormState);
  };

  // Calculate totals
  const totalDiscAmt = saleRows.reduce((sum, r) => sum + r[5], 0);
  const totalSubTotal = saleRows.reduce((sum, r) => sum + r[6], 0);
  const totalTaxPercent = saleRows.reduce((sum, r) => sum + r[7], 0); // Sum of tax %
  const totalTaxAmt = saleRows.reduce((sum, r) => sum + r[8], 0);
  const totalLineTotal = saleRows.reduce((sum, r) => sum + r[9], 0);

  // Build rows with action buttons
// Build rows with action buttons and totals without labels
const rowsWithTotal = [
  ...saleRows.map((r, idx) => [
    <div key={`chk-${idx}`} className="flex justify-center">
      <input
        type="checkbox"
        checked={selectedRows.has(idx)}
        onChange={() => toggleRowSelection(idx)}
        className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
        style={{ accentColor: primary }}
      />
    </div>,
    r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], 

    <div key={`action-${idx}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
      <button type="button" className="p-0.5" onClick={() => setSelectedProduct(getProductDetails(r, idx))}>
        <img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <button type="button" className="p-0.5" onClick={() => handleEdit(r, idx)}>
        <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <button type="button" className="p-0.5" onClick={() => handleDelete(idx)}>
        <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
    </div>
  ]),
 

[
  <div key="total" className="text-right font-bold">Total</div>,
  '', '', '', '', '',
  totalDiscAmt.toFixed(2),   // Disc Amt
  totalSubTotal.toFixed(2),  // Sub total
  (totalTaxPercent / saleRows.length).toFixed(2), // Tax %
  totalTaxAmt.toFixed(2),    // Tax amt
  totalLineTotal.toFixed(2), // Line total
  '' // No action buttons for totals row
]



];

  return (
    <div className="sale-page">
      <style>{`
        .sale-btn-outline:hover {
          border-color: ${primary} !important;
          background: ${primaryHover} !important;
          color: ${primary} !important;
        }
        .sale-btn-outline:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-primary:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-primary:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-red-outline:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-red-outline:active {
          background: ${primaryActive} !important;
        }
      `}</style>

      <div className="my-2 flex flex-1 min-h-0 flex-col overflow-hidden px-1 sm:my-[15px] sm:mx-[-10px] sm:px-0">
        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

          {/* Header */}
          <div className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              {pageTitle}
            </h1>

            <div className="flex gap-2 flex-wrap items-center">
              {selectedRows.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="sale-btn-outline flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                  style={{ borderColor: primary, color: primary }}
                >
                  <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  Delete
                </button>
              )}
              {/* <button className="sale-btn-outline flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white sm:h-8 sm:w-8">
                <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button> */}

              {[{ icon: PrinterIcon, },
                { icon: CancelIcon, label: 'Cancel' },
                { icon: PostIcon, label: 'Post' },
                { icon: UnpostIcon, label: 'Unpost' }
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                >
                  <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content: fills viewport; xl = side-by-side with internal scroll; stacked = scroll inside main */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">

            {/* LEFT — ~70% on xl so form + table share space with wider right rail */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-[70%] xl:max-w-[70%] xl:shrink-0">
              {/* Form section - bordered */}
              <div className="shrink-0 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex flex-col gap-2">
                  {/* Row 1: Short Description + numeric fields */}
                  <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                    <InputField
                      label="Short Description"
                      widthPx={128}
                      value={form.shortDescription}
                      onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                    />
                    <SubInputField
                      label="Hs Code/Wt"
                      type="number"
                      widthPx={72}
                      value={form.hsCode}
                      onChange={(e) => setForm((f) => ({ ...f, hsCode: e.target.value }))}
                    />
                    <SubInputField
                      label="Qty"
                      type="number"
                      value={form.qty}
                      onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                    />
                    <SubInputField
                      label="Unit Price"
                      type="number"
                      value={form.unitPrice}
                      onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                    />
                    <SubInputField
                      label="Disc.%"
                      type="number"
                      value={form.discPercent}
                      onChange={(e) => setForm((f) => ({ ...f, discPercent: e.target.value }))}
                    />
                    <SubInputField
                      label="Disc Price"
                      type="number"
                      value={form.discPrice}
                      onChange={(e) => setForm((f) => ({ ...f, discPrice: e.target.value }))}
                    />
                    <SubInputField
                      label="Disc.Amt"
                      type="number"
                      value={form.discAmt}
                      onChange={(e) => setForm((f) => ({ ...f, discAmt: e.target.value }))}
                    />
                  </div>

                  {/* Row 2: Sub total, tax, totals, Qutn/DO dropdowns, Add — same flex + gap as row 1 */}
                  <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                    <SubInputField
                      label="Sub total"
                      value={form.subTotal}
                      onChange={(e) => setForm((f) => ({ ...f, subTotal: e.target.value }))}
                    />
                    <SubInputField
                      label="Tax%"
                      type="number"
                      value={form.taxPercent}
                      onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))}
                    />
                    <SubInputField
                      label="T.Amt"
                      type="number"
                      value={form.taxAmt}
                      onChange={(e) => setForm((f) => ({ ...f, taxAmt: e.target.value }))}
                    />
                    <SubInputField
                      label="Total"
                      type="number"
                      value={form.total}
                      onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
                    />
                    <DropdownInput
                      label="Qutn. no"
                      options={['QTN-001']}
                      value={form.qutnNo}
                      onChange={(v) => setForm((f) => ({ ...f, qutnNo: v }))}
                    />
                    <DropdownInput
                      label="DO. no"
                      options={['DO-001']}
                      value={form.doNo}
                      onChange={(v) => setForm((f) => ({ ...f, doNo: v }))}
                    />
                    <div className="flex shrink-0 items-end">
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                        style={{ backgroundColor: primary }}
                        onClick={handleSaveOrUpdate}
                      >
                        {editingRowIndex !== null ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table section - bordered container; scroll inside when content overflows */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                  <CommonTable
                    headers={[
        '',
        'Short Description',
        'HS Code/Wt',
        ' Qty',
        'Selling price',
        'Disc %',
        'Disc Amt',
        'Sub total',
        'Tax %',
        'Tax amt',
        'Line total',
        'Action',
      ]}
                    rows={rowsWithTotal}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — ~30% on xl (was 25%) for bill / summary */}
            <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-[30%] xl:min-h-0 xl:min-w-[260px] xl:shrink-0">
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden sm:gap-3">
               
                

                {/* Bill / Customer section */}
                <div className="overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                  <div className="flex flex-col gap-1 sm:gap-[8px]">
                    {/* Row 1: Bill no + 2 sub fields */}
                    <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
                      <div className="flex flex-col gap-[6px]">
                        <InputField label="Bill no" />
                      </div>
                      <SubInputField label="Cust.Lpo 3" />
                      <SubInputField label="Local bill no" />
                    </div>

                    {/* Row 2: Customer name + Payment mode */}
                    <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
                      <InputField label="Customer name" />
                      <DropdownInput
                        label=""
                        options={['000001']}
                        placeholder="000001"
                        className="min-w-[80px] sm:min-w-[100px]"
                      />
                    </div>

                    {/* Row 4: Account head + creditcard no + credit card type */}
                    <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
                      <InputField label="Account head" />
                      <SubInputField label="Creditcard no" />
                      <SubInputField label="Credit card type" />
                    </div>

                    {/* Row 5: Cashier name (dropdown) + Invoice amt */}
                    <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
                      <DropdownInput
                        label="Cashier name"
                        options={['Cashier 1', 'Cashier 2']}
                        placeholder="Select"
                      />
                      <InputField label="Invoice amt" type="number" />
                    </div>

                    {/* Row 7: Station + Counter */}
                    <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
                      <InputField label="Station" />
                      <InputField label="Counter" />
                    </div>

                    {/* Row 8: Edit + New invoice buttons */}
                    <div className="mt-1 flex gap-1 sm:mt-[8px] sm:gap-[6px]">
                      <button
                        type="button"
                        className="sale-btn-red-outline flex flex-1 items-center justify-center gap-1 rounded border px-1.5 py-1.5 text-[9px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:px-2 sm:py-2 sm:text-[11px]"
                        style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
                      >
                        <img src={EditIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="sale-btn-red-outline flex flex-1 items-center justify-center gap-1 rounded border px-1.5 py-1.5 text-[9px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:px-2 sm:py-2 sm:text-[11px]"
                        style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
                      >
                        <img src={SaleIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                        New invoice
                      </button>
                    </div>
                  </div>
                </div>





<button
                  type="button"
                  onClick={() => setSalesTermsOpen(true)}
                  className="sale-btn-primary mt-1 w-full rounded border px-2 py-1.5 text-[9px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:mt-[6px] sm:px-3 sm:py-2 sm:text-[11px]"
                  style={{ backgroundColor: primary, color: '#fff', borderColor: primary }}
                >
                  {termsTitle}
                </button>






                {/* Paid Amount section */}
                <div className="mt-1 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:mt-[8px] sm:p-3">
                  <div className="flex flex-col gap-1 sm:gap-[8px]">
                    {/* Paid Amount */}
                    <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
                      <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
                        Paid Amount
                      </label>
                      <input
                        type="number"
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>

                    {/* Balance Amount */}
                    <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
                      <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
                        Balance Amount
                      </label>
                      <input
                        type="number"
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>

                    {/* Paid by card */}
                    <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
                      <label className="min-w-0 shrink-0 text-[9px] text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
                        Paid by card
                      </label>
                      <input
                        type="number"
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>

                    {/* Paid by cash */}
                    <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
                      <label className="min-w-0 shrink-0 text-[9px] text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
                        Paid by cash
                      </label>
                      <input
                        type="number"
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Terms Modal */}
      {salesTermsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSalesTermsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sales-terms-title"
        >
          <div
            className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSalesTermsOpen(false)}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Heading centered */}
            <h2
              id="sales-terms-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              {termsTitle}
            </h2>

            {/* Form fields - labels left-aligned in one column */}
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Sales
                </label>
                <input
                  type="text"
                  placeholder="Sales"
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Agent name
                </label>
                <input
                  type="text"
                  placeholder="Agent name"
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Commission %
                </label>
                <input
                  type="number"
                  placeholder="%"
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Commission amount
                </label>
                <input
                  type="number"
                  placeholder="Amount"
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
            </div>

            {/* Two switches centered */}
            <div className="my-4 flex justify-center gap-6">
              <Switch
                checked={saveTerms}
                onChange={setSaveTerms}
                description="Save terms"
              />
              <Switch
                checked={printTerms}
                onChange={setPrintTerms}
                description="Print terms"
              />
            </div>

            {/* Two buttons with icons */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                className="sale-btn-red-outline flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition-colors"
                style={{ borderColor: primary, color: primary }}
              >
                <img src={RemoveIcon} alt="" className="h-4 w-4" />
                Remove commission
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded border bg-white px-4 py-2 text-sm font-medium transition-colors"
                style={{ borderColor: primary, color: primary }}
              >
                <img src={PayIcon} alt="" className="h-4 w-4" />
                Pay now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-title"
        >
          <div
            className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2
              id="product-details-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              Product details
            </h2>

            {/* Product details - labels left, values right, "-" when empty */}
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Product code
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.productCode}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Stock on hand
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.stockOnHand}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Last customer
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.lastCustomer}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Unit cost
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.unitCost}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Min unit price
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.minUnitPrice}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Profit
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.profit}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Credit limit
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.creditLimit}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Current OS bal
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.currentOsBal}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  OS balance
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.osBalance}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Receipt no
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.receiptNo}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Location
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}