import React, { useMemo, useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import PostIcon from '../assets/icons/post.svg';
import UnpostIcon from '../assets/icons/unpost.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  CommonTable,
  Switch,
  ConfirmDialog,
} from '../components/ui';

const mainInitial = {
  barcode: '',
  description: '',
  shortDescription: '',
  descriptionArabic: '',
  productOwnRefNo: '',
  makeType: '',
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

  const handleEdit = (row, idx) => {
    fillLineFromRow(row);
    setEditingIdx(idx);
  };

  const handleDelete = (idx) => {
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

  const totalDiscAmt = lineRows.reduce((s, r) => s + Number(r[5] ?? 0), 0);
  const totalSub = lineRows.reduce((s, r) => s + Number(r[6] ?? 0), 0);
  const totalTaxPct = lineRows.reduce((s, r) => s + Number(r[7] ?? 0), 0);
  const totalTaxAmt = lineRows.reduce((s, r) => s + Number(r[8] ?? 0), 0);
  const totalLine = lineRows.reduce((s, r) => s + Number(r[9] ?? 0), 0);

  const tableRows = useMemo(
    () => [
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
          <button type="button" className="p-0.5" onClick={() => handleEdit(r, idx)}>
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
    ],
    [lineRows, selectedRows, primary, totalDiscAmt, totalSub, totalTaxPct, totalTaxAmt, totalLine]
  );

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

      <div className="my-2 flex flex-1 min-h-0 flex-col overflow-hidden px-1 sm:my-[15px] sm:mx-[-10px] sm:px-0">
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

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">
            {/* LEFT — main + line form + table */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-[70%] xl:max-w-[70%] xl:shrink-0">
              {/* Top: main product only (supplier block is on the right rail above search) */}
              <div className={`min-w-0 w-full ${fieldBox}`}>
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-end gap-2.5">
                    <SubInputField
                      label="Barcode"
                      widthPx={130}
                      heightPx={18}
                      value={main.barcode}
                      onChange={(e) => setMain((m) => ({ ...m, barcode: e.target.value }))}
                    />
                    <div className="flex min-w-[140px] flex-col justify-end gap-0.5">
                      <span className="text-[9px] leading-tight text-transparent sm:text-[11px]" aria-hidden>
                        —
                      </span>
                      <div className="flex min-h-[20.08px] items-center gap-2">
                        <Switch
                          size="xs"
                          checked={main.newBarcode}
                          onChange={(v) => setMain((m) => ({ ...m, newBarcode: v }))}
                        />
                        <span className="text-[10px] text-gray-700 sm:text-[11px]">New Barcode</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-2.5">
                    <div className="min-w-0 w-full md:flex-1">
                      <InputField
                        label="description"
                        fullWidth
                        heightPx={18}
                        value={main.description}
                        onChange={(e) => setMain((m) => ({ ...m, description: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <InputField
                        label="Short Description"
                        fullWidth
                        heightPx={18}
                        value={main.shortDescription}
                        onChange={(e) => setMain((m) => ({ ...m, shortDescription: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <InputField
                        label="Description Arabic"
                        fullWidth
                        heightPx={18}
                        value={main.descriptionArabic}
                        onChange={(e) => setMain((m) => ({ ...m, descriptionArabic: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-2.5">
                    <SubInputField
                      label="Product Own Ref No."
                      widthPx={160}
                      heightPx={18}
                      value={main.productOwnRefNo}
                      onChange={(e) => setMain((m) => ({ ...m, productOwnRefNo: e.target.value }))}
                    />
                    <DropdownInput
                      label="Product Make type"
                      options={['Standard', 'Assembly', 'Service']}
                      value={main.makeType}
                      onChange={(v) => setMain((m) => ({ ...m, makeType: v }))}
                      widthPx={150}
                    />
                    <SubInputField
                      label="Last Supplier"
                      widthPx={150}
                      heightPx={18}
                      value={main.lastSupplier}
                      onChange={(e) => setMain((m) => ({ ...m, lastSupplier: e.target.value }))}
                    />
                    <div className="flex-1 min-w-[240px]">
                      <SubInputField
                        label="Specification"
                        fullWidth
                        heightPx={18}
                        value={main.specification}
                        onChange={(e) => setMain((m) => ({ ...m, specification: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-2.5">
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="Product Brand"
                        fullWidth
                        heightPx={18}
                        value={main.productBrand}
                        onChange={(e) => setMain((m) => ({ ...m, productBrand: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="Group"
                        fullWidth
                        heightPx={18}
                        value={main.group}
                        onChange={(e) => setMain((m) => ({ ...m, group: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="Subgroup"
                        fullWidth
                        heightPx={18}
                        value={main.subgroup}
                        onChange={(e) => setMain((m) => ({ ...m, subgroup: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="SubSubGroup"
                        fullWidth
                        heightPx={18}
                        value={main.subSubGroup}
                        onChange={(e) => setMain((m) => ({ ...m, subSubGroup: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="Average Cost"
                        fullWidth
                        heightPx={18}
                        value={main.averageCost}
                        onChange={(e) => setMain((m) => ({ ...m, averageCost: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-2.5">
                    <SubInputField
                      label="Last Purch. Cost"
                      widthPx={130}
                      heightPx={18}
                      value={main.lastPurchCost}
                      onChange={(e) => setMain((m) => ({ ...m, lastPurchCost: e.target.value }))}
                    />
                    <SubInputField
                      label="Margin%"
                      widthPx={100}
                      heightPx={18}
                      value={main.marginPct}
                      onChange={(e) => setMain((m) => ({ ...m, marginPct: e.target.value }))}
                    />
                    <SubInputField
                      label="Min UNIT Price"
                      widthPx={120}
                      heightPx={18}
                      value={main.minUnitPrice}
                      onChange={(e) => setMain((m) => ({ ...m, minUnitPrice: e.target.value }))}
                    />
                    <SubInputField
                      label="Unit Price"
                      widthPx={110}
                      heightPx={18}
                      value={main.unitPrice}
                      onChange={(e) => setMain((m) => ({ ...m, unitPrice: e.target.value }))}
                    />
                    <SubInputField
                      label="base cost"
                      widthPx={110}
                      heightPx={18}
                      value={main.baseCost}
                      onChange={(e) => setMain((m) => ({ ...m, baseCost: e.target.value }))}
                    />
                    <SubInputField
                      label="Discount %"
                      widthPx={110}
                      heightPx={18}
                      value={main.discountPct}
                      onChange={(e) => setMain((m) => ({ ...m, discountPct: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-2.5">
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="Unit Cost"
                        fullWidth
                        heightPx={18}
                        value={main.unitCost}
                        onChange={(e) => setMain((m) => ({ ...m, unitCost: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="VAT IN"
                        fullWidth
                        heightPx={18}
                        value={main.vatIn}
                        onChange={(e) => setMain((m) => ({ ...m, vatIn: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="VAT IN %"
                        suffix="%"
                        fullWidth
                        heightPx={18}
                        value={main.vatInPct}
                        onChange={(e) => setMain((m) => ({ ...m, vatInPct: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="VAT OUT"
                        fullWidth
                        heightPx={18}
                        value={main.vatOut}
                        onChange={(e) => setMain((m) => ({ ...m, vatOut: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="VAT OUT %"
                        suffix="%"
                        fullWidth
                        heightPx={18}
                        value={main.vatOutPct}
                        onChange={(e) => setMain((m) => ({ ...m, vatOutPct: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 w-full md:flex-1">
                      <SubInputField
                        label="COST WITH VAT"
                        fullWidth
                        heightPx={18}
                        value={main.costWithVat}
                        onChange={(e) => setMain((m) => ({ ...m, costWithVat: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-2.5">
                    <SubInputField
                      label="PRICE WITH VAT"
                      widthPx={140}
                      heightPx={18}
                      value={main.priceWithVat}
                      onChange={(e) => setMain((m) => ({ ...m, priceWithVat: e.target.value }))}
                    />
                    <SubInputField
                      label="Price level 1"
                      widthPx={140}
                      heightPx={18}
                      value={main.priceLevel1}
                      onChange={(e) => setMain((m) => ({ ...m, priceLevel1: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Line item entry — responsive grid; Add bottom-right */}
              <div className={`shrink-0 ${fieldBox}`}>
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="w-full">
                    <div className="flex flex-wrap items-end gap-2.5">
                      <InputField
                        label="Barcode"
                        widthPx={120}
                        heightPx={18}
                        value={lineForm.barcode}
                        onChange={(e) => setLineForm((f) => ({ ...f, barcode: e.target.value }))}
                      />
                      <div className="flex-1 min-w-[210px]">
                        <InputField
                          label="Short Description"
                          fullWidth
                          heightPx={18}
                          value={lineForm.shortDescription}
                          onChange={(e) => setLineForm((f) => ({ ...f, shortDescription: e.target.value }))}
                        />
                      </div>
                      <SubInputField
                        label="Unit"
                        widthPx={70}
                        heightPx={18}
                        value={lineForm.unit}
                        onChange={(e) => setLineForm((f) => ({ ...f, unit: e.target.value }))}
                      />
                      <SubInputField
                        label="Pack Qty"
                        widthPx={80}
                        heightPx={18}
                        value={lineForm.packQty}
                        onChange={(e) => setLineForm((f) => ({ ...f, packQty: e.target.value }))}
                      />
                      <SubInputField
                        label="Packet Details"
                        widthPx={120}
                        heightPx={18}
                        value={lineForm.packetDetails}
                        onChange={(e) => setLineForm((f) => ({ ...f, packetDetails: e.target.value }))}
                      />
                      <SubInputField
                        label="Disc.%"
                        widthPx={70}
                        heightPx={18}
                        value={lineForm.discPct}
                        onChange={(e) => setLineForm((f) => ({ ...f, discPct: e.target.value }))}
                      />
                    </div>

                    <div className="mt-1 flex flex-wrap items-end gap-2.5">
                      <SubInputField
                        label="Unit Cost"
                        widthPx={85}
                        heightPx={18}
                        value={lineForm.unitCost}
                        onChange={(e) => setLineForm((f) => ({ ...f, unitCost: e.target.value }))}
                      />
                      <SubInputField
                        label="Avg. cost"
                        widthPx={85}
                        heightPx={18}
                        value={lineForm.avgCost}
                        onChange={(e) => setLineForm((f) => ({ ...f, avgCost: e.target.value }))}
                      />
                      <SubInputField
                        label="Last cost"
                        widthPx={85}
                        heightPx={18}
                        value={lineForm.lastCost}
                        onChange={(e) => setLineForm((f) => ({ ...f, lastCost: e.target.value }))}
                      />
                      <SubInputField
                        label="Margin%"
                        widthPx={75}
                        heightPx={18}
                        value={lineForm.marginPct}
                        onChange={(e) => setLineForm((f) => ({ ...f, marginPct: e.target.value }))}
                      />
                      <SubInputField
                        label="Unit Price"
                        widthPx={90}
                        heightPx={18}
                        value={lineForm.unitPrice}
                        onChange={(e) => setLineForm((f) => ({ ...f, unitPrice: e.target.value }))}
                      />
                      <div className="ml-auto flex items-end">
                        <button
                          type="button"
                          className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-3 text-[8px] font-medium text-white sm:text-[9px]"
                          style={{ backgroundColor: primary }}
                          onClick={handleLineAdd}
                        >
                          {editingIdx !== null ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div className="w-full min-w-0 flex-1 min-h-0 rounded border border-gray-200 bg-white p-2 sm:p-3">
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
                  rows={tableRows}
                />
              </div>
            </div>

            {/* RIGHT — supplier card + separate product search card */}
            <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-[30%] xl:min-h-0 xl:min-w-[min(100%,280px)] xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-contain xl:pr-1">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
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

                <div className={`${fieldBox} flex min-h-0 flex-1 flex-col gap-2 sm:gap-3`}>
                  <h2
                    className="text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]"
                    style={{ color: primary }}
                  >
                    Substitute product entry
                  </h2>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-2">
                    <div className="min-w-0 w-full sm:min-w-0 sm:flex-1">
                      <InputField
                        label="Product name"
                        fullWidth
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                      />
                    </div>
                    <div className="min-w-0 w-full sm:w-[8.5rem] sm:flex-none sm:shrink-0">
                      <SubInputField
                        label="Product code"
                        fullWidth
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex shrink-0 justify-end sm:self-end">
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-3 text-[8px] font-medium text-white sm:text-[9px]"
                        style={{ backgroundColor: primary }}
                        onClick={handleAddSubstitute}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="min-h-0 w-full min-w-0 flex-1">
                    <CommonTable
                      fitParentWidth
                      equalColumnWidth
                      maxVisibleRows={8}
                      headers={['Product name', 'Product code','Unit Price', 'Action']}
                      rows={substituteTableRows}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          if (pendingDelete.type === 'line') handleDelete(pendingDelete.idx);
          else removeSubstituteRow(pendingDelete.idx);
        }}
      />
    </div>
  );
}
