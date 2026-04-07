import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  CommonTable,
  Switch,
  ConfirmDialog,
} from '../../../shared/components/ui';

const mainInitial = {
  barcode: '',
  description: '',
  shortDescription: '',
  descriptionArabic: '',
  productOwnRefNo: '',
  makeType: 'Standard',
  lastSupplier: '',
  specification: '',
  productBrand: '',
  group: '',
  newBarcode: false,
  subgroup: '',
  subSubGroup: '',
  averageCost: '',
  lastPurchCost: '',
  marginPct: '',
  minUnitPrice: '',
  unitPrice: '',
  baseCost: '',
  discountPct: '',
  unitCost: '',
  vatIn: '',
  vatInPct: '',
  vatOut: '',
  vatOutPct: '',
  costWithVat: '',
  priceWithVat: '',
  priceLevel1: '',
};

const supplierInitial = {
  supplier: '',
  supplierRefNo: '',
  unit: '',
  productType: 'Stock',
  packQty: '',
  stockType: 'Normal',
  packetDetails: '',
  location: 'Main',
  origin: '',
  reorderLevel: '',
  reorderQty: '',
  remark: '',
  qtyOnHand: '',
  productIdentity: '',
};

const lineFormInitial = {
  barcode: '',
  shortDescription: '',
  unit: '',
  packQty: '',
  packetDetails: '',
  discPct: '',
  unitCost: '',
  avgCost: '',
  lastCost: '',
  marginPct: '',
  unitPrice: '',
};

/** Row: shortDesc, hsCode, qty, sellPrice, discPct, discAmt, subTot, taxPct, taxAmt, lineTot */
const sampleRows = [
  ['gfghvghvghg', 'HS-001', 1, 120.0, 5, 6.0, 114.0, 18, 20.52, 134.52],
  ['Alternate A', 'HS-882', 2, 55.0, 0, 0.0, 110.0, 5, 5.5, 115.5],
  ['Spare part B', 'HS-200', 4, 12.5, 10, 5.0, 45.0, 18, 8.1, 53.1],
];

const substituteDummyRows = [
  { productCode: 'PRD-1001', productName: 'Widget bolt M8', unitPrice: '-' },
  { productCode: 'PRD-2044', productName: 'Rubber gasket set', unitPrice: '-' },
  { productCode: 'PRD-3300', productName: 'Steel bracket 120mm', unitPrice: '-' },
];

const ENTRY_TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'trading', label: 'Trading product' },
  { id: 'supplier', label: 'Supplier details' },
];

/** Fixed-width inputs in a wrapping row (Basic + Supplier details viewports) */
const compactFieldsWrap = 'flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1.5';

/** Line entry fields + Add/Update pinned bottom-right on the same row band */
const lineEntryAddRow = 'flex min-w-0 items-end gap-2';

/** Basic tab: column count follows viewport (fluid min track width) */
const basicViewportGrid =
  'grid w-full min-w-0 items-end gap-x-2 gap-y-2 [grid-template-columns:repeat(auto-fill,minmax(min(100%,10.5rem),1fr))]';

function SupplierDetailFields({ fieldBox, supplier, setSupplier, layout = 'stack' }) {
  if (layout === 'viewportGrid') {
    return (
      <div className={`${fieldBox} min-w-0`}>
        <div className={compactFieldsWrap}>
          <SubInputField
            label="Supplier"
            widthPx={130}
            heightPx={18}
            value={supplier.supplier}
            onChange={(e) => setSupplier((s) => ({ ...s, supplier: e.target.value }))}
          />
          <SubInputField
            label="Supplier ref No"
            widthPx={118}
            heightPx={18}
            value={supplier.supplierRefNo}
            onChange={(e) => setSupplier((s) => ({ ...s, supplierRefNo: e.target.value }))}
          />
          <SubInputField
            label="Unit"
            placeholder="0"
            widthPx={64}
            heightPx={18}
            value={supplier.unit}
            onChange={(e) => setSupplier((s) => ({ ...s, unit: e.target.value }))}
          />
          <DropdownInput
            label="Product type"
            options={['Stock', 'Non-stock', 'Service']}
            value={supplier.productType}
            onChange={(v) => setSupplier((s) => ({ ...s, productType: v }))}
            widthPx={118}
            heightPx={18}
          />
          <SubInputField
            label="Pack Qty"
            widthPx={76}
            heightPx={18}
            value={supplier.packQty}
            onChange={(e) => setSupplier((s) => ({ ...s, packQty: e.target.value }))}
          />
          <DropdownInput
            label="Stock Type"
            options={['Normal', 'Batch', 'Serial']}
            value={supplier.stockType}
            onChange={(v) => setSupplier((s) => ({ ...s, stockType: v }))}
            widthPx={108}
            heightPx={18}
          />
          <SubInputField
            label="packet Details"
            widthPx={128}
            heightPx={18}
            value={supplier.packetDetails}
            onChange={(e) => setSupplier((s) => ({ ...s, packetDetails: e.target.value }))}
          />
          <DropdownInput
            label="Location"
            options={['Main', 'Warehouse A', 'Warehouse B']}
            value={supplier.location}
            onChange={(v) => setSupplier((s) => ({ ...s, location: v }))}
            widthPx={128}
            heightPx={18}
          />
          <SubInputField
            label="Origin"
            widthPx={110}
            heightPx={18}
            value={supplier.origin}
            onChange={(e) => setSupplier((s) => ({ ...s, origin: e.target.value }))}
          />
          <SubInputField
            label="ReOrder Level"
            widthPx={96}
            heightPx={18}
            value={supplier.reorderLevel}
            onChange={(e) => setSupplier((s) => ({ ...s, reorderLevel: e.target.value }))}
          />
          <SubInputField
            label="Reorder Qty"
            widthPx={96}
            heightPx={18}
            value={supplier.reorderQty}
            onChange={(e) => setSupplier((s) => ({ ...s, reorderQty: e.target.value }))}
          />
          <InputField
            label="Remark"
            widthPx={200}
            heightPx={18}
            value={supplier.remark}
            onChange={(e) => setSupplier((s) => ({ ...s, remark: e.target.value }))}
          />
          <SubInputField
            label="Qty on hand"
            widthPx={88}
            heightPx={18}
            value={supplier.qtyOnHand}
            onChange={(e) => setSupplier((s) => ({ ...s, qtyOnHand: e.target.value }))}
          />
          <DropdownInput
            label="Productidentity"
            options={['Yes', 'No']}
            value={supplier.productIdentity}
            onChange={(v) => setSupplier((s) => ({ ...s, productIdentity: v }))}
            widthPx={96}
            heightPx={18}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${fieldBox} flex flex-col gap-2`}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
        <div className="min-w-0 w-full sm:flex-1 sm:min-w-0">
          <SubInputField
            label="Supplier"
            fullWidth
            value={supplier.supplier}
            onChange={(e) => setSupplier((s) => ({ ...s, supplier: e.target.value }))}
          />
        </div>
        <div className="min-w-0 w-full sm:w-[34%] sm:min-w-[5.5rem] sm:max-w-[10rem] sm:flex-none">
          <SubInputField
            label="Supplier ref No"
            fullWidth
            value={supplier.supplierRefNo}
            onChange={(e) => setSupplier((s) => ({ ...s, supplierRefNo: e.target.value }))}
          />
        </div>
        <div className="min-w-0 w-full sm:w-[3.75rem] sm:flex-none sm:shrink-0">
          <SubInputField
            label="Unit"
            placeholder="0"
            fullWidth
            value={supplier.unit}
            onChange={(e) => setSupplier((s) => ({ ...s, unit: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
        <div className="min-w-0 w-full sm:flex-1 sm:min-w-0">
          <DropdownInput
            label="Product type"
            options={['Stock', 'Non-stock', 'Service']}
            value={supplier.productType}
            onChange={(v) => setSupplier((s) => ({ ...s, productType: v }))}
            fullWidth
          />
        </div>
        <div className="min-w-0 w-full sm:w-[4.25rem] sm:flex-none sm:shrink-0">
          <SubInputField
            label="Pack Qty"
            fullWidth
            value={supplier.packQty}
            onChange={(e) => setSupplier((s) => ({ ...s, packQty: e.target.value }))}
          />
        </div>
        <div className="min-w-0 w-full sm:w-[6.75rem] sm:flex-none sm:shrink-0">
          <DropdownInput
            label="Stock Type"
            options={['Normal', 'Batch', 'Serial']}
            value={supplier.stockType}
            onChange={(v) => setSupplier((s) => ({ ...s, stockType: v }))}
            fullWidth
          />
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        <SubInputField
          label="packet Details"
          fullWidth
          value={supplier.packetDetails}
          onChange={(e) => setSupplier((s) => ({ ...s, packetDetails: e.target.value }))}
        />
        <DropdownInput
          label="Location"
          options={['Main', 'Warehouse A', 'Warehouse B']}
          value={supplier.location}
          onChange={(v) => setSupplier((s) => ({ ...s, location: v }))}
          fullWidth
        />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
        <SubInputField
          label="Origin"
          fullWidth
          value={supplier.origin}
          onChange={(e) => setSupplier((s) => ({ ...s, origin: e.target.value }))}
        />
        <SubInputField
          label="ReOrder Level"
          fullWidth
          value={supplier.reorderLevel}
          onChange={(e) => setSupplier((s) => ({ ...s, reorderLevel: e.target.value }))}
        />
        <SubInputField
          label="Reorder Qty"
          fullWidth
          value={supplier.reorderQty}
          onChange={(e) => setSupplier((s) => ({ ...s, reorderQty: e.target.value }))}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
        <div className="min-w-0 w-full sm:min-w-0 sm:flex-1">
          <InputField
            label="Remark"
            fullWidth
            value={supplier.remark}
            onChange={(e) => setSupplier((s) => ({ ...s, remark: e.target.value }))}
          />
        </div>
        <div className="min-w-0 w-full sm:w-[5.5rem] sm:flex-none sm:shrink-0">
          <SubInputField
            label="Qty on hand"
            fullWidth
            value={supplier.qtyOnHand}
            onChange={(e) => setSupplier((s) => ({ ...s, qtyOnHand: e.target.value }))}
          />
        </div>
        <div className="min-w-0 w-full sm:w-[7.5rem] sm:flex-none sm:shrink-0">
          <DropdownInput
            label="Productidentity"
            options={['Yes', 'No']}
            value={supplier.productIdentity}
            onChange={(v) => setSupplier((s) => ({ ...s, productIdentity: v }))}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductEntry() {
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const [main, setMain] = useState(mainInitial);
  const [supplier, setSupplier] = useState(supplierInitial);
  const [lineForm, setLineForm] = useState(lineFormInitial);
  const [lineRows, setLineRows] = useState(sampleRows);
  const [editingIdx, setEditingIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  /** Substitute products: { productCode, productName } */
  const [substituteRows, setSubstituteRows] = useState(substituteDummyRows);
  /** null | { type: 'line', idx } | { type: 'substitute', idx } */
  const [pendingDelete, setPendingDelete] = useState(null);
  /** basic | trading | supplier — switches main left panel under PRODUCT ENTRY */
  const [entryTab, setEntryTab] = useState('basic');
  const [additionalInfoOpen, setAdditionalInfoOpen] = useState(false);

  useEffect(() => {
    if (!additionalInfoOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setAdditionalInfoOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [additionalInfoOpen]);

  const toggleSelect = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const fillLineFromRow = (row) => {
    setLineForm({
      ...lineFormInitial,
      shortDescription: String(row[0] ?? ''),
      unitPrice: String(row[9] ?? ''),
    });
  };

  const handleLineAdd = () => {
    const r = [
      lineForm.shortDescription || '-',
      '000',
      1,
      Number(lineForm.unitPrice) || 0,
      Number(lineForm.discPct) || 0,
      0,
      0,
      0,
      0,
      Number(lineForm.unitPrice) || 0,
    ];
    if (editingIdx !== null) {
      setLineRows((prev) => {
        const next = [...prev];
        next[editingIdx] = r;
        return next;
      });
      setEditingIdx(null);
    } else {
      setLineRows((prev) => [r, ...prev]);
    }
    setLineForm(lineFormInitial);
  };

  const handleEditLine = (row, idx) => {
    fillLineFromRow(row);
    setEditingIdx(idx);
  };

  const handleDeleteLine = (idx) => {
    setLineRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => {
      const next = new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)));
      return next;
    });
    if (editingIdx === idx) {
      setEditingIdx(null);
      setLineForm(lineFormInitial);
    } else if (editingIdx !== null && editingIdx > idx) {
      setEditingIdx((i) => i - 1);
    }
  };

  const handleAddSubstitute = () => {
    const code = String(searchCode ?? '').trim();
    const name = String(searchName ?? '').trim();
    if (!code && !name) return;
    setSubstituteRows((prev) => [
      ...prev,
      {
        productCode: code || '-',
        productName: name || '-',
        unitPrice: '-',
      },
    ]);
    setSearchName('');
    setSearchCode('');
  };

  const removeSubstituteRow = (idx) => {
    setSubstituteRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveBasic = () => {
    // Wire to API when available; payload: main (basic fields)
  };

  const handleSaveAdditionalInfo = () => {
    // Wire to API when available; additional main fields already in state
    setAdditionalInfoOpen(false);
  };

  const totalDiscAmt = lineRows.reduce((s, r) => s + Number(r[5] ?? 0), 0);
  const totalSub = lineRows.reduce((s, r) => s + Number(r[6] ?? 0), 0);
  const totalTaxPct = lineRows.reduce((s, r) => s + Number(r[7] ?? 0), 0);
  const totalTaxAmt = lineRows.reduce((s, r) => s + Number(r[8] ?? 0), 0);
  const totalLine = lineRows.reduce((s, r) => s + Number(r[9] ?? 0), 0);

  const substituteTableRows = useMemo(
    () =>
      substituteRows.map((row, idx) => [
        row.productName,
        row.productCode,
        row.unitPrice ?? '-',
        <div key={`sub-act-${idx}`} className="flex justify-center">
          <button type="button" className="p-0.5" onClick={() => setPendingDelete({ type: 'substitute', idx })} aria-label="Remove row">
            <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ]),
    [substituteRows]
  );

  const lineItemsTableRows = [
    ...lineRows.map((r, idx) => [
      <div key={`chk-${idx}`} className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedRows.has(idx)}
          onChange={() => toggleSelect(idx)}
          className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
          style={{ accentColor: primary }}
        />
      </div>,
      r[0],
      r[1],
      r[2],
      r[3],
      r[4],
      r[5],
      r[6],
      r[7],
      r[8],
      r[9],
      <div key={`act-${idx}`} className="flex items-center justify-center gap-0.5">
        <button type="button" className="p-0.5" onClick={() => handleEditLine(r, idx)}>
          <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className="p-0.5" onClick={() => setPendingDelete({ type: 'line', idx })}>
          <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]),
    [
      {
        content: <span className="font-bold">Total</span>,
        colSpan: 6,
        className: 'align-middle font-bold',
      },
      totalDiscAmt.toFixed(2),
      totalSub.toFixed(2),
      lineRows.length ? (totalTaxPct / lineRows.length).toFixed(2) : '0.00',
      totalTaxAmt.toFixed(2),
      totalLine.toFixed(2),
      '',
    ],
  ];

  const fieldBox = 'rounded border border-gray-200 bg-white p-2 sm:p-3';

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
      `}</style>

      <div className="my-2 flex flex-1 min-h-0 flex-col overflow-hidden sm:my-[15px]">
        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
          {/* Header + toolbar */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              PRODUCT ENTRY 
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="sale-btn-outline flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white sm:h-8 sm:w-8"
              >
                <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              {[
                { icon: CancelIcon, label: 'Cancel' },
                { icon: PostIcon, label: 'Post' },
                { icon: UnpostIcon, label: 'UnPost' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                >
                  <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  {btn.label}
                </button>
              ))}
              <button
                type="button"
                className="sale-btn-primary rounded border px-2 py-0.5 text-[9px] font-medium text-white sm:px-3 sm:py-1 sm:text-[11px]"
                style={{ backgroundColor: primary, borderColor: primary }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Segmented tabs: Basic | Trading product | Supplier details (compact) */}
          <div
            className="inline-flex max-w-full shrink-0 items-stretch gap-px self-start rounded-md px-0.5 py-0.5"
            style={{ backgroundColor: '#EDEDED' }}
            role="tablist"
            aria-label="Product entry sections"
          >
            {ENTRY_TABS.map((t) => {
              const active = entryTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setEntryTab(t.id)}
                  className="min-h-[22px] whitespace-nowrap rounded px-2 py-0.5 text-center text-[8px] font-medium leading-tight transition-colors sm:min-h-[24px] sm:px-2.5 sm:text-[9px]"
                  style={
                    active
                      ? { backgroundColor: primary, color: '#fff' }
                      : { backgroundColor: 'transparent', color: '#111827' }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">
            {/* Main column: Basic | Supplier details | Trading product (full width) */}
            <div
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-full xl:max-w-full xl:shrink-0"
            >
              {/* Basic: compact grid to fit viewport; subset of main fields + Save */}
              {entryTab === 'basic' && (
              <div className={`flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden ${fieldBox}`}>
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-0.5">
                  <div className={basicViewportGrid}>
                    <div className="min-w-0">
                      <InputField
                        label="Barcode"
                        fullWidth
                        heightPx={18}
                        value={main.barcode}
                        onChange={(e) => setMain((m) => ({ ...m, barcode: e.target.value }))}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col justify-end gap-0.5">
                      <span className="text-[9px] leading-tight text-gray-500 sm:text-[10px]">—</span>
                      <div className="flex min-h-[20.08px] items-center gap-2">
                        <Switch
                          size="xs"
                          checked={main.newBarcode}
                          onChange={(v) => setMain((m) => ({ ...m, newBarcode: v }))}
                        />
                        <span className="text-[10px] text-gray-700 sm:text-[11px]">New Barcode</span>
                      </div>
                    </div>
                    <div className="min-w-0 col-span-full sm:col-span-2">
                      <InputField
                        label="description"
                        fullWidth
                        heightPx={18}
                        value={main.description}
                        onChange={(e) => setMain((m) => ({ ...m, description: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 col-span-full sm:col-span-2">
                      <InputField
                        label="Short Description"
                        fullWidth
                        heightPx={18}
                        value={main.shortDescription}
                        onChange={(e) => setMain((m) => ({ ...m, shortDescription: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 col-span-full sm:col-span-2">
                      <InputField
                        label="Description Arabic"
                        fullWidth
                        heightPx={18}
                        value={main.descriptionArabic}
                        onChange={(e) => setMain((m) => ({ ...m, descriptionArabic: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <SubInputField
                        label="Product Own Ref No."
                        fullWidth
                        heightPx={18}
                        value={main.productOwnRefNo}
                        onChange={(e) => setMain((m) => ({ ...m, productOwnRefNo: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <DropdownInput
                        label="Product Make type"
                        options={['Standard', 'Assembly', 'Service']}
                        value={main.makeType}
                        onChange={(v) => setMain((m) => ({ ...m, makeType: v }))}
                        fullWidth
                        heightPx={18}
                      />
                    </div>
                    <div className="min-w-0">
                      <SubInputField
                        label="Last Supplier"
                        fullWidth
                        heightPx={18}
                        value={main.lastSupplier}
                        onChange={(e) => setMain((m) => ({ ...m, lastSupplier: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 col-span-full sm:col-span-2 lg:col-span-3">
                      <SubInputField
                        label="Specification"
                        fullWidth
                        heightPx={18}
                        value={main.specification}
                        onChange={(e) => setMain((m) => ({ ...m, specification: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <InputField
                        label="Product Brand"
                        fullWidth
                        heightPx={18}
                        value={main.productBrand}
                        onChange={(e) => setMain((m) => ({ ...m, productBrand: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <InputField
                        label="Group"
                        fullWidth
                        heightPx={18}
                        value={main.group}
                        onChange={(e) => setMain((m) => ({ ...m, group: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <InputField
                        label="Subgroup"
                        fullWidth
                        heightPx={18}
                        value={main.subgroup}
                        onChange={(e) => setMain((m) => ({ ...m, subgroup: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <InputField
                        label="SubSubGroup"
                        fullWidth
                        heightPx={18}
                        value={main.subSubGroup}
                        onChange={(e) => setMain((m) => ({ ...m, subSubGroup: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <InputField
                        label="base cost"
                        fullWidth
                        heightPx={18}
                        value={main.baseCost}
                        onChange={(e) => setMain((m) => ({ ...m, baseCost: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <InputField
                        label="Discount %"
                        fullWidth
                        heightPx={18}
                        value={main.discountPct}
                        onChange={(e) => setMain((m) => ({ ...m, discountPct: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <SubInputField
                        label="Unit Cost"
                        fullWidth
                        heightPx={18}
                        value={main.unitCost}
                        onChange={(e) => setMain((m) => ({ ...m, unitCost: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <SubInputField
                        label="VAT IN"
                        fullWidth
                        heightPx={18}
                        value={main.vatIn}
                        onChange={(e) => setMain((m) => ({ ...m, vatIn: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <SubInputField
                        label="VAT IN %"
                        suffix="%"
                        fullWidth
                        heightPx={18}
                        value={main.vatInPct}
                        onChange={(e) => setMain((m) => ({ ...m, vatInPct: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 col-span-full sm:col-span-2">
                      <InputField
                        label="COST WITH VAT"
                        fullWidth
                        heightPx={18}
                        value={main.costWithVat}
                        onChange={(e) => setMain((m) => ({ ...m, costWithVat: e.target.value }))}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col justify-end gap-0.5">
                      <span className="text-[9px] leading-tight text-transparent sm:text-[10px]" aria-hidden>
                        .
                      </span>
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] w-full min-w-0 max-w-full items-center justify-center rounded border bg-white px-2 text-[10px] font-medium leading-none sm:text-[11px]"
                        style={{ borderColor: primary, color: primary }}
                        onClick={() => setAdditionalInfoOpen(true)}
                      >
                        Additional info
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex shrink-0 justify-end border-t border-gray-100 pt-2">
                  <button
                    type="button"
                    className="sale-btn-primary rounded border px-4 py-1 text-[10px] font-medium text-white sm:py-1.5 sm:text-[11px]"
                    style={{ backgroundColor: primary, borderColor: primary }}
                    onClick={handleSaveBasic}
                  >
                    Save
                  </button>
                </div>
              </div>
              )}

              {/* Supplier details: full-width viewport — supplier grid, line entry grid, substitute (no side rail) */}
              {entryTab === 'supplier' && (
              <div
                className={`flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden ${fieldBox}`}
                style={{ maxHeight: 'min(100%, calc(100dvh - 11rem))' }}
              >
                <div className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto pr-0.5">
                  <SupplierDetailFields
                    fieldBox="rounded border border-gray-200 bg-white p-2 sm:p-3"
                    supplier={supplier}
                    setSupplier={setSupplier}
                    layout="viewportGrid"
                  />

                  <div className="rounded border border-gray-200 bg-white p-2 sm:p-3">
                    <div className={lineEntryAddRow}>
                      <div className={`min-w-0 flex-1 ${compactFieldsWrap}`}>
                        <InputField
                          label="Barcode"
                          widthPx={108}
                          heightPx={18}
                          value={lineForm.barcode}
                          onChange={(e) => setLineForm((f) => ({ ...f, barcode: e.target.value }))}
                        />
                        <InputField
                          label="Short Description"
                          widthPx={168}
                          heightPx={18}
                          value={lineForm.shortDescription}
                          onChange={(e) => setLineForm((f) => ({ ...f, shortDescription: e.target.value }))}
                        />
                        <SubInputField
                          label="Unit"
                          widthPx={64}
                          heightPx={18}
                          value={lineForm.unit}
                          onChange={(e) => setLineForm((f) => ({ ...f, unit: e.target.value }))}
                        />
                        <SubInputField
                          label="Pack Qty"
                          widthPx={76}
                          heightPx={18}
                          value={lineForm.packQty}
                          onChange={(e) => setLineForm((f) => ({ ...f, packQty: e.target.value }))}
                        />
                        <SubInputField
                          label="Packet Details"
                          widthPx={118}
                          heightPx={18}
                          value={lineForm.packetDetails}
                          onChange={(e) => setLineForm((f) => ({ ...f, packetDetails: e.target.value }))}
                        />
                        <SubInputField
                          label="Disc.%"
                          widthPx={64}
                          heightPx={18}
                          value={lineForm.discPct}
                          onChange={(e) => setLineForm((f) => ({ ...f, discPct: e.target.value }))}
                        />
                        <SubInputField
                          label="Unit Cost"
                          widthPx={82}
                          heightPx={18}
                          value={lineForm.unitCost}
                          onChange={(e) => setLineForm((f) => ({ ...f, unitCost: e.target.value }))}
                        />
                        <SubInputField
                          label="Avg. cost"
                          widthPx={82}
                          heightPx={18}
                          value={lineForm.avgCost}
                          onChange={(e) => setLineForm((f) => ({ ...f, avgCost: e.target.value }))}
                        />
                        <SubInputField
                          label="Last cost"
                          widthPx={82}
                          heightPx={18}
                          value={lineForm.lastCost}
                          onChange={(e) => setLineForm((f) => ({ ...f, lastCost: e.target.value }))}
                        />
                        <SubInputField
                          label="Margin%"
                          widthPx={72}
                          heightPx={18}
                          value={lineForm.marginPct}
                          onChange={(e) => setLineForm((f) => ({ ...f, marginPct: e.target.value }))}
                        />
                        <SubInputField
                          label="Unit Price"
                          widthPx={86}
                          heightPx={18}
                          value={lineForm.unitPrice}
                          onChange={(e) => setLineForm((f) => ({ ...f, unitPrice: e.target.value }))}
                        />
                      </div>
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] shrink-0 items-center justify-center rounded px-3 text-[8px] font-medium text-white sm:text-[9px]"
                        style={{ backgroundColor: primary }}
                        onClick={handleLineAdd}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className={`flex min-h-0 min-w-0 flex-col gap-2 rounded border border-gray-200 bg-white p-2 sm:gap-3 sm:p-3`}>
                    <h2
                      className="text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]"
                      style={{ color: primary }}
                    >
                      Substitute product entry
                    </h2>
                    <div className={compactFieldsWrap}>
                      <InputField
                        label="Product name"
                        widthPx={168}
                        heightPx={18}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                      />
                      <SubInputField
                        label="Product code"
                        widthPx={118}
                        heightPx={18}
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                      />
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] shrink-0 items-center justify-center rounded px-3 text-[8px] font-medium text-white sm:text-[9px]"
                        style={{ backgroundColor: primary }}
                        onClick={handleAddSubstitute}
                      >
                        Add
                      </button>
                    </div>
                    <div className="min-h-0 w-full min-w-0 max-h-[14rem] sm:max-h-[16rem]">
                      <CommonTable
                        fitParentWidth
                        equalColumnWidth
                        maxVisibleRows={6}
                        headers={['Product name', 'Product code', 'Unit Price', 'Action']}
                        rows={substituteTableRows}
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Trading product: line entry (wraps, no horizontal scroll) + line items table */}
              {entryTab === 'trading' && (
              <div
                className={`flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden ${fieldBox}`}
                style={{ maxHeight: 'min(100%, calc(100dvh - 11rem))' }}
              >
                <div className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto pr-0.5">
                  <div className="rounded border border-gray-200 bg-white p-2 sm:p-3">
                    <div className={lineEntryAddRow}>
                      <div className={`min-w-0 flex-1 ${compactFieldsWrap}`}>
                        <InputField
                          label="Barcode"
                          widthPx={108}
                          heightPx={18}
                          value={lineForm.barcode}
                          onChange={(e) => setLineForm((f) => ({ ...f, barcode: e.target.value }))}
                        />
                        <InputField
                          label="Short Description"
                          widthPx={168}
                          heightPx={18}
                          value={lineForm.shortDescription}
                          onChange={(e) => setLineForm((f) => ({ ...f, shortDescription: e.target.value }))}
                        />
                        <SubInputField
                          label="Unit"
                          widthPx={64}
                          heightPx={18}
                          value={lineForm.unit}
                          onChange={(e) => setLineForm((f) => ({ ...f, unit: e.target.value }))}
                        />
                        <SubInputField
                          label="Pack Qty"
                          widthPx={76}
                          heightPx={18}
                          value={lineForm.packQty}
                          onChange={(e) => setLineForm((f) => ({ ...f, packQty: e.target.value }))}
                        />
                        <SubInputField
                          label="Packet Details"
                          widthPx={118}
                          heightPx={18}
                          value={lineForm.packetDetails}
                          onChange={(e) => setLineForm((f) => ({ ...f, packetDetails: e.target.value }))}
                        />
                        <SubInputField
                          label="Disc.%"
                          widthPx={64}
                          heightPx={18}
                          value={lineForm.discPct}
                          onChange={(e) => setLineForm((f) => ({ ...f, discPct: e.target.value }))}
                        />
                        <SubInputField
                          label="Unit Cost"
                          widthPx={82}
                          heightPx={18}
                          value={lineForm.unitCost}
                          onChange={(e) => setLineForm((f) => ({ ...f, unitCost: e.target.value }))}
                        />
                        <SubInputField
                          label="Avg. cost"
                          widthPx={82}
                          heightPx={18}
                          value={lineForm.avgCost}
                          onChange={(e) => setLineForm((f) => ({ ...f, avgCost: e.target.value }))}
                        />
                        <SubInputField
                          label="Last cost"
                          widthPx={82}
                          heightPx={18}
                          value={lineForm.lastCost}
                          onChange={(e) => setLineForm((f) => ({ ...f, lastCost: e.target.value }))}
                        />
                        <SubInputField
                          label="Margin%"
                          widthPx={72}
                          heightPx={18}
                          value={lineForm.marginPct}
                          onChange={(e) => setLineForm((f) => ({ ...f, marginPct: e.target.value }))}
                        />
                        <SubInputField
                          label="Unit Price"
                          widthPx={86}
                          heightPx={18}
                          value={lineForm.unitPrice}
                          onChange={(e) => setLineForm((f) => ({ ...f, unitPrice: e.target.value }))}
                        />
                      </div>
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] shrink-0 items-center justify-center rounded px-3 text-[8px] font-medium text-white sm:text-[9px]"
                        style={{ backgroundColor: primary }}
                        onClick={handleLineAdd}
                      >
                        {editingIdx !== null ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>

                  <div className="w-full min-w-0 min-h-0 flex-1 rounded border border-gray-200 bg-white p-2 sm:p-3">
                    <CommonTable
                      fitParentWidth
                      equalColumnWidth
                      maxVisibleRows={11}
                      headers={[
                        '',
                        'Short Description',
                        'HS Code/Wt',
                        'Qty',
                        'Selling Price',
                        'Disc%',
                        'Disc Amt',
                        'Sub Total',
                        'Tax%',
                        'Tax.Amt',
                        'Line Total',
                        'Action',
                      ]}
                      rows={lineItemsTableRows}
                    />
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {additionalInfoOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm"
          onClick={() => setAdditionalInfoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="additional-info-title"
        >
          <div
            className="flex max-h-[min(90dvh,32rem)] w-full max-w-lg flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-2 border-b border-gray-100 pb-2">
              <h2
                id="additional-info-title"
                className="min-w-0 flex-1 pr-1 text-sm font-bold sm:text-base"
                style={{ color: primary }}
              >
                Additional info
              </h2>
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xl leading-none text-gray-600 hover:bg-gray-100"
                aria-label="Close"
                onClick={() => setAdditionalInfoOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto py-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <SubInputField
                label="Average Cost"
                fullWidth
                heightPx={18}
                value={main.averageCost}
                onChange={(e) => setMain((m) => ({ ...m, averageCost: e.target.value }))}
              />
              <SubInputField
                label="Last Purch. Cost"
                fullWidth
                heightPx={18}
                value={main.lastPurchCost}
                onChange={(e) => setMain((m) => ({ ...m, lastPurchCost: e.target.value }))}
              />
              <InputField
                label="Margin%"
                fullWidth
                heightPx={18}
                value={main.marginPct}
                onChange={(e) => setMain((m) => ({ ...m, marginPct: e.target.value }))}
              />
              <InputField
                label="Min UNIT Price"
                fullWidth
                heightPx={18}
                value={main.minUnitPrice}
                onChange={(e) => setMain((m) => ({ ...m, minUnitPrice: e.target.value }))}
              />
              <InputField
                label="Unit Price"
                fullWidth
                heightPx={18}
                value={main.unitPrice}
                onChange={(e) => setMain((m) => ({ ...m, unitPrice: e.target.value }))}
              />
              <SubInputField
                label="VAT OUT"
                fullWidth
                heightPx={18}
                value={main.vatOut}
                onChange={(e) => setMain((m) => ({ ...m, vatOut: e.target.value }))}
              />
              <SubInputField
                label="VAT OUT %"
                suffix="%"
                fullWidth
                heightPx={18}
                value={main.vatOutPct}
                onChange={(e) => setMain((m) => ({ ...m, vatOutPct: e.target.value }))}
              />
              <InputField
                label="PRICE WITH VAT"
                fullWidth
                heightPx={18}
                value={main.priceWithVat}
                onChange={(e) => setMain((m) => ({ ...m, priceWithVat: e.target.value }))}
              />
              <SubInputField
                label="Price level 1"
                fullWidth
                heightPx={18}
                value={main.priceLevel1}
                onChange={(e) => setMain((m) => ({ ...m, priceLevel1: e.target.value }))}
              />
            </div>
            </div>
            <div className="flex shrink-0 justify-end border-t border-gray-100 pt-3">
              <button
                type="button"
                className="sale-btn-primary rounded border px-4 py-1.5 text-[11px] font-medium text-white sm:text-xs"
                style={{ backgroundColor: primary, borderColor: primary }}
                onClick={handleSaveAdditionalInfo}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.type === 'substitute' ? 'Remove substitute product?' : 'Delete line item?'}
        message={
          pendingDelete?.type === 'substitute'
            ? 'This will remove the substitute from the list. This action cannot be undone.'
            : 'This will remove the row from the table. This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.type === 'line') handleDeleteLine(pendingDelete.idx);
          else removeSubstituteRow(pendingDelete.idx);
        }}
      />
    </div>
  );
}
