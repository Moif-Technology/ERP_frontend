import React, { useMemo, useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import EditIcon from '../assets/icons/edit.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import SaleIcon from '../assets/icons/sales.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, Switch, CommonTable } from '../components/ui';

export default function Purchase() {
  const [tableRows, setTableRows] = useState([
    ['1', 'OR-001', 'P-101', 'Product A', '10', 'PCS', '5', '120.00', '5', '118.00', '1235.00', '5', '61.75', '1296.75'],
  ]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState([]);
  const [itemForm, setItemForm] = useState({
    ownRefNo: '',
    barCode: '',
    shortDescription: '',
    uom: 'PCS',
    packQty: '',
    qty: '',
    baseCost: '',
    unitCost: '',
    discPercent: '',
    subTotal: '',
    vatPercent: '',
    vatAmount: '',
    total: '',
  });
  const [purchaseMeta, setPurchaseMeta] = useState({
    purchaseNo: '',
    supplierInvNo: '',
    supplier: '',
    bySupplier: false,
    enteredBy: 'Admin',
    purchaseDate: '',
    paymentMode: 'Cash',
    accountHead: 'General',
    enteredDate: '',
    station: 'Main',
    invoiceAmount: '',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    remark: '',
    paymentNo: '',
    paymentNow: false,
  });

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
  const updatePurchaseMeta = (key, value) => {
    setPurchaseMeta((prev) => ({ ...prev, [key]: value }));
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
      sumDiscPct += parseCellNum(row[8]);
      totalUnitCost += parseCellNum(row[9]);
      totalMid += parseCellNum(row[10]);
      sumVatPct += parseCellNum(row[11]);
      totalVatAmt += parseCellNum(row[12]);
      totalLine += parseCellNum(row[13]);
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
        .purchase-btn-outline:hover {
          border-color: ${primary} !important;
          background: #F2E6EA !important;
          color: ${primary} !important;
        }
        .purchase-table table {
          table-layout: fixed;
        }
        .purchase-table th,
        .purchase-table td {
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .purchase-table th:first-child,
        .purchase-table td:first-child {
          width: 34px !important;
          min-width: 34px !important;
          max-width: 34px !important;
          text-align: center;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        .purchase-table th:nth-child(5),
        .purchase-table td:nth-child(5),
        .purchase-table th:nth-child(6),
        .purchase-table td:nth-child(6),
        .purchase-table th:nth-child(7),
        .purchase-table td:nth-child(7),
        .purchase-table th:nth-child(8),
        .purchase-table td:nth-child(8),
        .purchase-table th:nth-child(9),
        .purchase-table td:nth-child(9),
        .purchase-table th:nth-child(10),
        .purchase-table td:nth-child(10),
        .purchase-table th:nth-child(11),
        .purchase-table td:nth-child(11),
        .purchase-table th:nth-child(12),
        .purchase-table td:nth-child(12),
        .purchase-table th:nth-child(13),
        .purchase-table td:nth-child(13),
        .purchase-table th:nth-child(14),
        .purchase-table td:nth-child(14) {
          text-align: center;
        }
        .purchase-table th:last-child,
        .purchase-table td:last-child {
          width: 90px !important;
          min-width: 90px !important;
          text-align: center;
        }
        .purchase-table tbody tr:last-child td {
          font-weight: 700;
          background-color: #faf5f6;
        }
        .purchase-table tbody tr:last-child td:first-child {
          text-align: left !important;
          padding-left: 8px !important;
        }
      `}</style>

      <div className="flex h-[100%] w-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            PURCHASE ENTRY
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {[{ icon: PrinterIcon }, { icon: CancelIcon, label: 'Cancel' }, { icon: EditIcon, label: 'Edit' }].map((btn) => (
              <button
                key={btn.label || 'print'}
                type="button"
                className="purchase-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                {btn.label}
              </button>
            ))}
            <button
              type="button"
              className="purchase-btn-outline rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
            >
              Save
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
              PURCHASE ENTRY
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
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          

          <div className="hidden min-h-0 flex-1 flex-col rounded bg-white p-2 sm:p-3 xl:flex xl:w-[860px]">
            <div className="min-h-0 overflow-y-auto max-h-[500px]">
              <CommonTable
                className="purchase-table"
                headers={['SL No', 'Own REF No', 'Barcode', 'shortDescription', 'Qty', 'UOM', 'pack qty', 'base cost', 'disc%', 'unit cost', 'total', 'vat%', 'Vat Amt', 'line total', 'Action']}
                fitParentWidth
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
                    <div key={`action-${idx}`} className="flex min-w-[90px] items-center justify-center gap-0.5 text-center">
                      {editingRowIndex === idx ? (
                        <>
                          <button
                            type="button"
                            className="rounded border border-gray-300 px-1 py-0 text-[7px]"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="rounded border border-gray-300 px-1 py-0 text-[7px]"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="rounded p-0.5" aria-label="View row details" onClick={() => setSelectedRow(row)}>
                            <img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                          <button type="button" className="rounded p-0.5" aria-label="Edit row" onClick={() => handleEditRow(idx)}>
                            <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                          <button type="button" className="rounded p-0.5" aria-label="Delete row" onClick={() => handleDeleteRow(idx)}>
                            <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                        </>
                      )}
                    </div>,
                  ]),
                  [
                    { content: 'Total', colSpan: 8, className: 'text-left font-bold' },
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
            className="w-full rounded bg-white p-3 sm:p-3.5 xl:h-[165px]"
            style={{
              borderRadius: '9.9px',
              border: '0.49px solid #e5e7eb',
            }}
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-end gap-2.5 lg:flex-nowrap">
                <InputField label="Sub Total" defaultValue="00000.00" fullWidth />
                <SubInputField label="Discount Amount" defaultValue="1" widthPx={92} />
                <SubInputField label="" defaultValue="11" suffix="%" widthPx={72} />
              </div>
              <div className="flex flex-wrap items-end gap-2.5 lg:flex-nowrap">
                <InputField label="Total Amount" defaultValue="00000.00" fullWidth />
                <SubInputField label="Tax" defaultValue="1" widthPx={92} />
                <SubInputField label="" defaultValue="67" suffix="%" widthPx={72} />
              </div>
              <div className="flex flex-wrap items-end gap-2.5 lg:flex-nowrap">
                <InputField label="Round Off" defaultValue="00000.00" fullWidth />
                <InputField label="Net Amount" defaultValue="00000.00" fullWidth />
              </div>
            </div>
          </div>

          <div className="w-full rounded border border-gray-200 bg-white p-3 sm:p-3.5">
            <div className="flex flex-col gap-3 sm:gap-3.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                <SubInputField label="Purchase #" fullWidth value={purchaseMeta.purchaseNo} onChange={(e) => updatePurchaseMeta('purchaseNo', e.target.value)} />
                <SubInputField label="Sup Inv#" fullWidth value={purchaseMeta.supplierInvNo} onChange={(e) => updatePurchaseMeta('supplierInvNo', e.target.value)} />
                <SubInputField label="Supplier" fullWidth value={purchaseMeta.supplier} onChange={(e) => updatePurchaseMeta('supplier', e.target.value)} />
                <div className="flex min-w-0 items-end">
                  <Switch
                    checked={purchaseMeta.bySupplier}
                    onChange={(v) => updatePurchaseMeta('bySupplier', v)}
                    description="By supplier"
                    size="xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <DropdownInput
                  label="Entered by"
                  fullWidth
                  value={purchaseMeta.enteredBy}
                  onChange={(val) => updatePurchaseMeta('enteredBy', val)}
                  options={['Admin', 'User 1', 'User 2']}
                />
                <DateInputField label="Purchase date" fullWidth value={purchaseMeta.purchaseDate} onChange={(val) => updatePurchaseMeta('purchaseDate', val)} />
                <DropdownInput
                  label="Payment mode"
                  fullWidth
                  value={purchaseMeta.paymentMode}
                  onChange={(val) => updatePurchaseMeta('paymentMode', val)}
                  options={['Cash', 'Card', 'Bank Transfer', 'Credit']}
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <DropdownInput
                  label="Account head"
                  fullWidth
                  value={purchaseMeta.accountHead}
                  onChange={(val) => updatePurchaseMeta('accountHead', val)}
                  options={['General', 'Purchase A/C', 'Expenses A/C']}
                />
                <DateInputField label="Entered date" fullWidth value={purchaseMeta.enteredDate} onChange={(val) => updatePurchaseMeta('enteredDate', val)} />
                <DropdownInput
                  label="Station"
                  fullWidth
                  value={purchaseMeta.station}
                  onChange={(val) => updatePurchaseMeta('station', val)}
                  options={['Main', 'Branch 1', 'Branch 2']}
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <SubInputField label="Invoice amt" fullWidth value={purchaseMeta.invoiceAmount} onChange={(e) => updatePurchaseMeta('invoiceAmount', e.target.value)} />
              </div>
            </div>
            <div className="mt-1 flex gap-1 sm:mt-[8px] sm:gap-[6px]">
              <button
                type="button"
                className="sale-btn-red-outline flex h-7 flex-1 items-center justify-center gap-1 rounded border px-1 py-1 text-[8px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:h-8 sm:px-1.5 sm:py-1.5 sm:text-[10px]"
                style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
              >
                <img src={EditIcon} alt="" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Edit
              </button>
              <button
                type="button"
                className="sale-btn-red-outline flex h-7 flex-1 items-center justify-center gap-1 rounded border px-1 py-1 text-[8px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:h-8 sm:px-1.5 sm:py-1.5 sm:text-[10px]"
                style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
              >
                <img src={SaleIcon} alt="" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                New purchase
              </button>
            </div>
          </div>
        
          <div className="w-full rounded border border-gray-200 bg-white p-3 sm:p-3.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-700">Remark</label>
                <textarea
                  value={paymentInfo.remark}
                  onChange={(e) => setPaymentInfo((prev) => ({ ...prev, remark: e.target.value }))}
                  className="min-h-[56px] w-full resize-y rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none sm:text-[11px]"
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <SubInputField
                  label="Payment no"
                  fullWidth
                  value={paymentInfo.paymentNo}
                  onChange={(e) => setPaymentInfo((prev) => ({ ...prev, paymentNo: e.target.value }))}
                />
                <div className="flex min-w-0 items-end">
                  <Switch
                    checked={paymentInfo.paymentNow}
                    onChange={(v) => setPaymentInfo((prev) => ({ ...prev, paymentNow: v }))}
                    description="Payment now"
                    size="xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                ['base cost', selectedRow[7]],
                ['disc%', selectedRow[8]],
                ['unit cost', selectedRow[9]],
                ['total', selectedRow[10]],
                ['vat%', selectedRow[11]],
                ['Vat Amt', selectedRow[12]],
                ['line total', selectedRow[13]],
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
