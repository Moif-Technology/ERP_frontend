import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, CommonTable, ConfirmDialog } from '../../../shared/components/ui';

export default function DeliveryOrder() {
  const [doDate, setDoDate] = useState('');
  const [enteredDate, setEnteredDate] = useState('');
  const [tableRows, setTableRows] = useState([
    ['1', 'OR-001', 'Product A', 'Main Store', 'SR-1001', 'Box Pack', 'PCS', '1', '250.00', '5', '12.50', '237.50', '5', '11.88', '249.38'],
  ]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState([]);
  const [itemForm, setItemForm] = useState({
    ownRefNo: '',
    productCode: '',
    shortDescription: '',
    serialNo: '',
    packetDetails: '',
    unit: '',
    qty: '',
    unitPrice: '',
    discPercent: '',
    disc: '',
    subTotal: '',
    taxPercent: '',
    taxAmt: '',
    lineTotal: '',
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
      itemForm.shortDescription || '-',
      itemForm.productCode || '-',
      itemForm.serialNo || '-',
      itemForm.packetDetails || '-',
      itemForm.unit || '-',
      itemForm.qty || '0',
      itemForm.unitPrice || '0.00',
      itemForm.discPercent || '0',
      itemForm.disc || '0.00',
      itemForm.subTotal || '0.00',
      itemForm.taxPercent || '0',
      itemForm.taxAmt || '0.00',
      itemForm.lineTotal || '0.00',
    ];
    setTableRows((prev) => [newRow, ...prev]);
    setItemForm({
      ownRefNo: '',
      productCode: '',
      shortDescription: '',
      serialNo: '',
      packetDetails: '',
      unit: '',
      qty: '',
      unitPrice: '',
      discPercent: '',
      disc: '',
      subTotal: '',
      taxPercent: '',
      taxAmt: '',
      lineTotal: '',
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
        totalDisc: 0,
        totalSub: 0,
        avgTaxPct: 0,
        totalTaxAmt: 0,
        totalLine: 0,
      };
    }
    let totalDisc = 0;
    let totalSub = 0;
    let sumTaxPct = 0;
    let totalTaxAmt = 0;
    let totalLine = 0;
    tableRows.forEach((row) => {
      totalDisc += parseCellNum(row[10]);
      totalSub += parseCellNum(row[11]);
      sumTaxPct += parseCellNum(row[12]);
      totalTaxAmt += parseCellNum(row[13]);
      totalLine += parseCellNum(row[14]);
    });
    return {
      totalDisc,
      totalSub,
      avgTaxPct: sumTaxPct / n,
      totalTaxAmt,
      totalLine,
    };
  }, [tableRows]);

  return (
    <div className="mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .delivery-btn-outline:hover {
          border-color: ${primary} !important;
          background: #F2E6EA !important;
          color: ${primary} !important;
        }
        .delivery-order-table table {
          table-layout: fixed;
        }
        .delivery-order-table th,
        .delivery-order-table td {
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .delivery-order-table th:first-child,
        .delivery-order-table td:first-child {
          width: 34px !important;
          min-width: 34px !important;
          max-width: 34px !important;
          text-align: center;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        .delivery-order-table th:nth-child(8),
        .delivery-order-table td:nth-child(8),
        .delivery-order-table th:nth-child(9),
        .delivery-order-table td:nth-child(9),
        .delivery-order-table th:nth-child(10),
        .delivery-order-table td:nth-child(10),
        .delivery-order-table th:nth-child(11),
        .delivery-order-table td:nth-child(11),
        .delivery-order-table th:nth-child(12),
        .delivery-order-table td:nth-child(12),
        .delivery-order-table th:nth-child(13),
        .delivery-order-table td:nth-child(13),
        .delivery-order-table th:nth-child(14),
        .delivery-order-table td:nth-child(14),
        .delivery-order-table th:nth-child(15),
        .delivery-order-table td:nth-child(15) {
          text-align: center;
        }
        .delivery-order-table th:last-child,
        .delivery-order-table td:last-child {
          width: 90px !important;
          min-width: 90px !important;
          text-align: center;
        }
        .delivery-order-table tbody tr:last-child td {
          font-weight: 700;
          background-color: #faf5f6;
        }
        .delivery-order-table tbody tr:last-child td:first-child {
          text-align: left !important;
          padding-left: 8px !important;
        }
      `}</style>

      <div className="flex h-[100%] w-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            DELIVERY ORDER
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {[{ icon: PrinterIcon }, { icon: CancelIcon, label: 'Cancel' }, { icon: EditIcon, label: 'Edit' }].map((btn) => (
              <button
                key={btn.label || 'print'}
                type="button"
                className="delivery-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                {btn.label}
              </button>
            ))}
            <button
              type="button"
              className="delivery-btn-outline rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
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
              DELIVERY ORDER
            </button>
          </div>
        </div>

        <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[1.72fr_1.28fr]">
        <div className="flex min-h-0 flex-col gap-3">
          <div
            className="w-full rounded bg-white xl:w-[860px]"
            style={{
              borderRadius: '9.9px',
              border: '0.49px solid #e5e7eb',
              padding: '3.99px 5px',
              minHeight: '117.95px',
            }}
          >
            <div className="flex flex-col gap-[5.94px]">
              <div className="flex flex-wrap items-end gap-[5.94px] xl:flex-nowrap">
                <SubInputField label="DO No" widthPx={82} />
                <DateInputField label="DO date" value={doDate} onChange={setDoDate} widthPx={108} />
                <DateInputField label="Entered Date" value={enteredDate} onChange={setEnteredDate} widthPx={108} />
                <InputField label="Customer name" widthPx={152} />
                <InputField label="Customer LPO No" widthPx={152} />
                <SubInputField label="Delivery By" widthPx={90} />
                <SubInputField label="Bill #" widthPx={82} />
              </div>
              <div className="flex flex-wrap items-end gap-[5.94px] xl:flex-nowrap">
                <DropdownInput
                  label="Sales Man"
                  options={['000001', '000002']}
                  value="000001"
                  onChange={() => {}}
                  widthPx={108}
                />
                <SubInputField label="Counter" widthPx={82} />
              </div>
            </div>
          </div>



          <div className="w-full rounded border border-gray-200 bg-white p-2 sm:p-3 xl:w-[860px]">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                <SubInputField label="Own Ref No" widthPx={80} value={itemForm.ownRefNo} onChange={(e) => updateItemForm('ownRefNo', e.target.value)} />
                <SubInputField label="Product Code" widthPx={80} value={itemForm.productCode} onChange={(e) => updateItemForm('productCode', e.target.value)} />
                <InputField label="Short Description" widthPx={145} value={itemForm.shortDescription} onChange={(e) => updateItemForm('shortDescription', e.target.value)} />
                <SubInputField label="Serial #" widthPx={80} value={itemForm.serialNo} onChange={(e) => updateItemForm('serialNo', e.target.value)} />
                <InputField label="Packet details" widthPx={145} value={itemForm.packetDetails} onChange={(e) => updateItemForm('packetDetails', e.target.value)} />
                <SubInputField label="Qty" widthPx={64} value={itemForm.qty} onChange={(e) => updateItemForm('qty', e.target.value)} />
                <SubInputField label="Unit Price" widthPx={80} value={itemForm.unitPrice} onChange={(e) => updateItemForm('unitPrice', e.target.value)} />
                <SubInputField label="Disc %" widthPx={80} value={itemForm.discPercent} onChange={(e) => updateItemForm('discPercent', e.target.value)} />
              </div>
              <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                <SubInputField label="Disc." widthPx={80} value={itemForm.disc} onChange={(e) => updateItemForm('disc', e.target.value)} />
                <SubInputField label="Sub total" widthPx={80} value={itemForm.subTotal} onChange={(e) => updateItemForm('subTotal', e.target.value)} />
                <SubInputField label="Tax%" widthPx={80} value={itemForm.taxPercent} onChange={(e) => updateItemForm('taxPercent', e.target.value)} />
                <SubInputField label="T.Amt" widthPx={80} value={itemForm.taxAmt} onChange={(e) => updateItemForm('taxAmt', e.target.value)} />
                <SubInputField label="Total" widthPx={80} value={itemForm.lineTotal} onChange={(e) => updateItemForm('lineTotal', e.target.value)} />
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
            <div className="min-h-0 overflow-y-auto max-h-[185px]">
              <CommonTable
                className="delivery-order-table"
                headers={['Sl no', 'Own Ref No', 'Short Description', 'Location', 'Serial #', 'Packet details', 'Unit', 'Qty', 'Unit Price', 'Disc%', 'Disc.', 'Sub total', 'Tax%', 'T.Amt', 'Line Total', 'Action']}
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
                          <button type="button" className="rounded p-0.5" aria-label="Delete row" onClick={() => setPendingDeleteIndex(idx)}>
                            <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                        </>
                      )}
                    </div>,
                  ]),
                  [
                    { content: 'Total', colSpan: 10, className: 'text-left font-bold' },
                    tableTotals.totalDisc.toFixed(2),
                    tableTotals.totalSub.toFixed(2),
                    tableTotals.avgTaxPct.toFixed(2),
                    tableTotals.totalTaxAmt.toFixed(2),
                    tableTotals.totalLine.toFixed(2),
                    '',
                  ],
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="w-full rounded border border-gray-200 bg-white p-3 sm:p-3.5">
            <div className="flex flex-col gap-2.5">
              {['Qtn no', 'Job no', 'Product code', 'Stock', 'Min Price'].map((label) => (
                <div key={label} className="flex items-center gap-2.5">
                  <label className="w-[92px] shrink-0 text-[10px] font-semibold text-gray-700 sm:w-[100px]">{label}</label>
                  <SubInputField label="" fullWidth />
                </div>
              ))}
            </div>
          </div>
          <div
            className="w-full rounded bg-white xl:h-[165px]"
            style={{
              borderRadius: '9.9px',
              border: '0.49px solid #e5e7eb',
              padding: '3.99px 5px',
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
            <div className="flex flex-col gap-2.5">
              {['Attention', 'Remark'].map((label) => (
                <div key={label} className="flex items-center gap-2.5">
                  <label className="w-[92px] shrink-0 text-[10px] font-semibold text-gray-700 sm:w-[100px]">{label}</label>
                  <InputField label="" fullWidth />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteIndex !== null}
        title="Delete line item?"
        message="This will remove the row from the delivery order. This action cannot be undone."
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
                ['Sl no', selectedRow[0]],
                ['Own Ref No', selectedRow[1]],
                ['Short Description', selectedRow[2]],
                ['Location', selectedRow[3]],
                ['Serial #', selectedRow[4]],
                ['Packet details', selectedRow[5]],
                ['Unit', selectedRow[6]],
                ['Qty', selectedRow[7]],
                ['Unit Price', selectedRow[8]],
                ['Disc%', selectedRow[9]],
                ['Disc.', selectedRow[10]],
                ['Sub total', selectedRow[11]],
                ['Tax%', selectedRow[12]],
                ['T.Amt', selectedRow[13]],
                ['Line Total', selectedRow[14]],
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
