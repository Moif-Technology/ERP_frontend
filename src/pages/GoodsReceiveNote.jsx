import React, { useMemo, useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import EditIcon from '../assets/icons/edit.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  DateInputField,
  Switch,
  CommonTable,
  ConfirmDialog,
} from '../components/ui';

export default function GoodsReceiveNote() {
  const [tableRows, setTableRows] = useState(
    Array.from({ length: 10 }, (_, idx) => [
      String(idx + 1),
      `OR-${String(idx + 1).padStart(3, '0')}`,
      `P-${101 + idx}`,
      `Product ${String.fromCharCode(65 + idx)}`,
      String(10 + idx),
      'PCS',
      String(5 + (idx % 3)),
      String(idx % 2),
      (120 + idx).toFixed(2),
      '5',
      (118 + idx).toFixed(2),
      (1235 + idx * 10).toFixed(2),
      '5',
      (61.75 + idx).toFixed(2),
      (1296.75 + idx * 11).toFixed(2),
    ])
  );
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState([]);
  const [itemForm, setItemForm] = useState({
    ownRefNo: '',
    barCode: '',
    shortDescription: '',
    uom: 'PCS',
    packQty: '',
    foc: '',
    qty: '',
    baseCost: '',
    unitCost: '',
    discPercent: '',
    subTotal: '',
    vatPercent: '',
    vatAmount: '',
    total: '',
  });
  const [summaryInfo, setSummaryInfo] = useState({
    total: '',
    discountAmount: '',
    netAmount: '',
    grnTerms: '',
  });
  const [grnInfo, setGrnInfo] = useState({
    grnNo: '',
    orderFormNo: '',
    supplierName: '',
    supplierDocNo: '',
    grnDate: '',
    discount: 'None',
    purchaseNo: '',
    bySupplier: false,
    listItem: false,
    useDiscPct: false,
  });
  /** Row index pending delete confirmation; null when dialog closed */
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const primary = colors.primary?.main || '#790728';

  const handleDeleteRow = (idx) => {
    setTableRows((prev) => prev.filter((_, i) => i !== idx));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
      setEditingRowData([]);
    } else if (editingRowIndex !== null && idx < editingRowIndex) {
      setEditingRowIndex((prev) => prev - 1);
    }
  };

  const updateItemForm = (key, value) => {
    setItemForm((prev) => ({ ...prev, [key]: value }));
  };
  const handleAddRow = () => {
    const newRow = [
      String(tableRows.length + 1),
      itemForm.ownRefNo || '-',
      itemForm.barCode || '-',
      itemForm.shortDescription || '-',
      itemForm.qty || '0',
      itemForm.uom || '-',
      itemForm.packQty || '0',
      itemForm.foc || '0',
      itemForm.baseCost || '0.00',
      itemForm.discPercent || '0',
      itemForm.unitCost || '0.00',
      itemForm.subTotal || '0.00',
      itemForm.vatPercent || '0',
      itemForm.vatAmount || '0.00',
      itemForm.total || '0.00',
    ];
    setTableRows((prev) => [newRow, ...prev]);
    setItemForm({
      ownRefNo: '',
      barCode: '',
      shortDescription: '',
      uom: 'PCS',
      packQty: '',
      foc: '',
      qty: '',
      baseCost: '',
      unitCost: '',
      discPercent: '',
      subTotal: '',
      vatPercent: '',
      vatAmount: '',
      total: '',
    });
  };

  const handleEditRow = (idx) => {
    setEditingRowIndex(idx);
    setEditingRowData([...tableRows[idx]]);
  };

  const handleEditCellChange = (cellIdx, value) => {
    setEditingRowData((prev) => {
      const next = [...prev];
      next[cellIdx] = value;
      return next;
    });
  };

  const handleSaveEdit = () => {
    if (editingRowIndex === null) return;
    setTableRows((prev) => prev.map((row, idx) => (idx === editingRowIndex ? editingRowData : row)));
    setEditingRowIndex(null);
    setEditingRowData([]);
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRowData([]);
  };

  const parseCellNum = (v) => {
    const n = parseFloat(String(v ?? '').replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const tableTotals = useMemo(() => {
    const n = tableRows.length;
    if (n === 0) {
      return {
        avgDiscPct: 0,
        totalUnitCost: 0,
        totalMid: 0,
        avgVatPct: 0,
        totalVatAmt: 0,
        totalLine: 0,
      };
    }
    let sumDiscPct = 0;
    let totalUnitCost = 0;
    let totalMid = 0;
    let sumVatPct = 0;
    let totalVatAmt = 0;
    let totalLine = 0;
    tableRows.forEach((row) => {
      sumDiscPct += parseCellNum(row[9]);
      totalUnitCost += parseCellNum(row[10]);
      totalMid += parseCellNum(row[11]);
      sumVatPct += parseCellNum(row[12]);
      totalVatAmt += parseCellNum(row[13]);
      totalLine += parseCellNum(row[14]);
    });
    return {
      avgDiscPct: sumDiscPct / n,
      totalUnitCost,
      totalMid,
      avgVatPct: sumVatPct / n,
      totalVatAmt,
      totalLine,
    };
  }, [tableRows]);

  return (
    <div className="mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .grn-btn-outline:hover {
          border-color: ${primary} !important;
          background: #F2E6EA !important;
          color: ${primary} !important;
        }
        .grn-table table {
          table-layout: fixed;
        }
        .grn-table th,
        .grn-table td {
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .grn-table th:first-child,
        .grn-table td:first-child {
          width: 34px !important;
          min-width: 34px !important;
          max-width: 34px !important;
          text-align: center;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        .grn-table th:nth-child(5),
        .grn-table td:nth-child(5),
        .grn-table th:nth-child(6),
        .grn-table td:nth-child(6),
        .grn-table th:nth-child(7),
        .grn-table td:nth-child(7),
        .grn-table th:nth-child(8),
        .grn-table td:nth-child(8),
        .grn-table th:nth-child(9),
        .grn-table td:nth-child(9),
        .grn-table th:nth-child(10),
        .grn-table td:nth-child(10),
        .grn-table th:nth-child(11),
        .grn-table td:nth-child(11),
        .grn-table th:nth-child(12),
        .grn-table td:nth-child(12),
        .grn-table th:nth-child(13),
        .grn-table td:nth-child(13),
        .grn-table th:nth-child(14),
        .grn-table td:nth-child(14),
        .grn-table th:nth-child(15),
        .grn-table td:nth-child(15) {
          text-align: center;
        }
        .grn-table th:last-child,
        .grn-table td:last-child {
          width: 90px !important;
          min-width: 90px !important;
          text-align: center;
        }
        .grn-table tbody tr:last-child td {
          font-weight: 700;
          background-color: #faf5f6;
        }
        .grn-table tbody tr:last-child td:first-child {
          text-align: left !important;
          padding-left: 8px !important;
        }
      `}</style>

      <div className="flex h-[100%] w-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            GOODS RECEIVE NOTE
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {[{ icon: PrinterIcon }, { icon: CancelIcon, label: 'Cancel' }, { icon: EditIcon, label: 'Edit' }].map((btn) => (
              <button
                key={btn.label || 'print'}
                type="button"
                className="grn-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                {btn.label}
              </button>
            ))}
            <button
              type="button"
              className="grn-btn-outline rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
            >
              Add
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium text-white sm:px-2 sm:py-1 sm:text-[11px]"
              style={{ backgroundColor: primary, borderColor: primary }}
            >
              <svg
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Goods Receive Note
            </button>
          </div>
        </div>

        <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[1.72fr_1.28fr]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="w-full rounded border border-gray-200 bg-white p-2 sm:p-3 xl:w-[860px]">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                <SubInputField label="Own Ref No" widthPx={80} value={itemForm.ownRefNo} onChange={(e) => updateItemForm('ownRefNo', e.target.value)} />
                <SubInputField label="Bar code" widthPx={80} value={itemForm.barCode} onChange={(e) => updateItemForm('barCode', e.target.value)} />
                <InputField label="Short Description" widthPx={145} value={itemForm.shortDescription} onChange={(e) => updateItemForm('shortDescription', e.target.value)} />
                <SubInputField label="Qty" widthPx={64} value={itemForm.qty} onChange={(e) => updateItemForm('qty', e.target.value)} />
                <DropdownInput
                  label="UOM"
                  options={['PCS', 'BOX', 'CTN', 'KG', 'LTR']}
                  value={itemForm.uom}
                  onChange={(val) => updateItemForm('uom', val)}
                  widthPx={80}
                />
                <SubInputField label="Pack Qty" widthPx={80} value={itemForm.packQty} onChange={(e) => updateItemForm('packQty', e.target.value)} />
                <SubInputField label="FOC" widthPx={64} value={itemForm.foc} onChange={(e) => updateItemForm('foc', e.target.value)} />
                <SubInputField label="Base cost" widthPx={80} value={itemForm.baseCost} onChange={(e) => updateItemForm('baseCost', e.target.value)} />
                <SubInputField label="Disc %" widthPx={80} value={itemForm.discPercent} onChange={(e) => updateItemForm('discPercent', e.target.value)} />
              </div>
              <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                <SubInputField label="Unit cost" widthPx={80} value={itemForm.unitCost} onChange={(e) => updateItemForm('unitCost', e.target.value)} />
                <SubInputField label="Sub. total" widthPx={80} value={itemForm.subTotal} onChange={(e) => updateItemForm('subTotal', e.target.value)} />
                <DropdownInput
                  label="Vat %"
                  options={['0', '5', '10', '15']}
                  value={itemForm.vatPercent}
                  onChange={(val) => updateItemForm('vatPercent', val)}
                  widthPx={80}
                />
                <SubInputField label="Vat amount" widthPx={80} value={itemForm.vatAmount} onChange={(e) => updateItemForm('vatAmount', e.target.value)} />
                <SubInputField label="Total" widthPx={80} value={itemForm.total} onChange={(e) => updateItemForm('total', e.target.value)} />
                <div className="ml-auto flex items-end">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="h-[20.08px] rounded border px-3 text-[11px] font-medium text-white"
                    style={{ backgroundColor: primary, borderColor: primary }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          

          <div className="hidden min-h-0 flex-1 flex-col rounded bg-white xl:flex xl:w-[860px]">
            <div className="min-h-0 min-w-0 w-full">
              <CommonTable
                className="grn-table"
                headers={['SL No', 'Own REF No', 'Barcode', 'shortDescription', 'Qty', 'UOM', 'pack qty', 'FOC', 'base cost', 'disc%', 'unit cost', 'total', 'vat%', 'Vat Amt', 'line total', 'Action']}
                fitParentWidth
                maxVisibleRows={20}
                rows={[
                  ...tableRows.map((row, idx) => [
                    ...row.map((cell, cellIdx) =>
                      editingRowIndex === idx ? (
                        <input
                          key={`edit-${idx}-${cellIdx}`}
                          value={editingRowData[cellIdx] ?? ''}
                          onChange={(e) => handleEditCellChange(cellIdx, e.target.value)}
                          className="h-5 w-full rounded border border-gray-300 bg-white px-1 text-[8px] outline-none"
                        />
                      ) : (
                        cell
                      )
                    ),
                    {
                      content: (
                        <div className="flex min-w-0 flex-wrap items-center justify-center gap-px text-center leading-none">
                          {editingRowIndex === idx ? (
                            <>
                              <button
                                type="button"
                                className="rounded border border-gray-300 px-0.5 py-px text-[6px] leading-tight"
                                onClick={handleSaveEdit}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="rounded border border-gray-300 px-0.5 py-px text-[6px] leading-tight"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="rounded border border-red-200 bg-red-50 px-0.5 py-px text-[6px] leading-tight text-red-700 hover:bg-red-100"
                                aria-label="Delete row"
                                onClick={() => setPendingDeleteIndex(idx)}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="rounded p-px" aria-label="View row details" onClick={() => setSelectedRow(row)}>
                                <img src={ViewActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                              </button>
                              <button type="button" className="rounded p-px" aria-label="Edit row" onClick={() => handleEditRow(idx)}>
                                <img src={EditActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                              </button>
                              <button type="button" className="rounded p-px" aria-label="Delete row" onClick={() => setPendingDeleteIndex(idx)}>
                                <img src={DeleteActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                              </button>
                            </>
                          )}
                        </div>
                      ),
                      className: '!px-0.5 !py-0 sm:!px-0.5 sm:!py-0',
                    },
                  ]),
                  [
                    { content: 'Total', colSpan: 9, className: 'text-left font-bold' },
                    tableTotals.avgDiscPct.toFixed(2),
                    tableTotals.totalUnitCost.toFixed(2),
                    tableTotals.totalMid.toFixed(2),
                    tableTotals.avgVatPct.toFixed(2),
                    tableTotals.totalVatAmt.toFixed(2),
                    tableTotals.totalLine.toFixed(2),
                    '',
                  ],
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">


          <div
            className="w-full rounded bg-white p-3 sm:p-3.5"
            style={{
              borderRadius: '9.9px',
              border: '0.49px solid #e5e7eb',
            }}
          >
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <SubInputField label="GRN no" fullWidth value={grnInfo.grnNo} onChange={(e) => setGrnInfo((prev) => ({ ...prev, grnNo: e.target.value }))} />
                <SubInputField label="Order Form No" fullWidth value={grnInfo.orderFormNo} onChange={(e) => setGrnInfo((prev) => ({ ...prev, orderFormNo: e.target.value }))} />
                <InputField label="Supplier name" fullWidth value={grnInfo.supplierName} onChange={(e) => setGrnInfo((prev) => ({ ...prev, supplierName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <DateInputField label="GRN date" fullWidth value={grnInfo.grnDate} onChange={(val) => setGrnInfo((prev) => ({ ...prev, grnDate: val }))} />
                <InputField
                  label="Supplier Quot./Invoice No"
                  fullWidth
                  value={grnInfo.supplierDocNo}
                  onChange={(e) => setGrnInfo((prev) => ({ ...prev, supplierDocNo: e.target.value }))}
                />
                <DropdownInput
                  label="Discount"
                  fullWidth
                  value={grnInfo.discount}
                  onChange={(val) => setGrnInfo((prev) => ({ ...prev, discount: val }))}
                  options={['None', 'Flat', 'Percentage']}
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <SubInputField
                  label="Purchase No"
                  fullWidth
                  value={grnInfo.purchaseNo}
                  onChange={(e) => setGrnInfo((prev) => ({ ...prev, purchaseNo: e.target.value }))}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Switch checked={grnInfo.bySupplier} onChange={(v) => setGrnInfo((prev) => ({ ...prev, bySupplier: v }))} description="with supplier" size="xs" />
                  <Switch checked={grnInfo.listItem} onChange={(v) => setGrnInfo((prev) => ({ ...prev, listItem: v }))} description="list items" size="xs" />
                  <Switch checked={grnInfo.useDiscPct} onChange={(v) => setGrnInfo((prev) => ({ ...prev, useDiscPct: v }))} description="use Disc %" size="xs" />
                </div>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-[10px] font-semibold text-white hover:opacity-95 sm:text-[11px]"
                  style={{ backgroundColor: primary, borderColor: primary }}
                >
                  View
                </button>
              </div>
            </div>
          </div>

          <div className="w-full rounded border border-gray-200 bg-white p-3 sm:p-3.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <label className="w-[120px] shrink-0 text-[10px] font-semibold text-gray-700 sm:w-[130px]">Total</label>
                <input
                  type="text"
                  value={summaryInfo.total}
                  onChange={(e) => setSummaryInfo((prev) => ({ ...prev, total: e.target.value }))}
                  className="h-6 w-full rounded border border-gray-200 bg-white px-2 text-[10px] outline-none sm:text-[11px]"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <label className="w-[120px] shrink-0 text-[10px] font-semibold text-gray-700 sm:w-[130px]">Discount amount</label>
                <input
                  type="text"
                  value={summaryInfo.discountAmount}
                  onChange={(e) => setSummaryInfo((prev) => ({ ...prev, discountAmount: e.target.value }))}
                  className="h-6 w-full rounded border border-gray-200 bg-white px-2 text-[10px] outline-none sm:text-[11px]"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <label className="w-[120px] shrink-0 text-[10px] font-semibold text-gray-700 sm:w-[130px]">NetAmount</label>
                <input
                  type="text"
                  value={summaryInfo.netAmount}
                  onChange={(e) => setSummaryInfo((prev) => ({ ...prev, netAmount: e.target.value }))}
                  className="h-6 w-full rounded border border-gray-200 bg-white px-2 text-[10px] outline-none sm:text-[11px]"
                />
              </div>
              <div className="flex items-start gap-2.5">
                <label className="w-[120px] shrink-0 pt-1 text-[10px] font-semibold text-gray-700 sm:w-[130px]">GRN Terms</label>
                <textarea
                  value={summaryInfo.grnTerms}
                  onChange={(e) => setSummaryInfo((prev) => ({ ...prev, grnTerms: e.target.value }))}
                  className="min-h-[56px] w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none sm:text-[11px]"
                />
              </div>
            </div>
          </div>
        
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteIndex !== null}
        title="Delete line item?"
        message="This will remove the row from the goods receive note. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDeleteIndex(null)}
        onConfirm={() => {
          if (pendingDeleteIndex !== null) handleDeleteRow(pendingDeleteIndex);
        }}
      />

      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedRow(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Row details"
        >
          <div className="mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>Item details</h2>
              <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedRow(null)} aria-label="Close details">x</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['SL No', selectedRow[0]],
                ['Own REF No', selectedRow[1]],
                ['Barcode', selectedRow[2]],
                ['shortDescription', selectedRow[3]],
                ['Qty', selectedRow[4]],
                ['UOM', selectedRow[5]],
                ['pack qty', selectedRow[6]],
                ['FOC', selectedRow[7]],
                ['base cost', selectedRow[8]],
                ['disc%', selectedRow[9]],
                ['unit cost', selectedRow[10]],
                ['total', selectedRow[11]],
                ['vat%', selectedRow[12]],
                ['Vat Amt', selectedRow[13]],
                ['line total', selectedRow[14]],
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
    </div>
  );
}
