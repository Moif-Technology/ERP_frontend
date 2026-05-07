import React, { useCallback, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { CommonTable, TabsBar } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const VEHICLE_BRANDS = ['CONSUMABLE', 'TOYOTA', 'NISSAN', 'HONDA', 'FORD'];
const VEHICLE_TYPES  = ['CONSUMABLE', 'SEDAN', 'SUV', 'TRUCK'];
const PARTS_FAMILIES = ['GENERAL', 'ELECTRICAL', 'MECHANICAL', 'BODY'];
const ITEM_TYPES     = ['CONSUMABLE', 'SPARE PART', 'ACCESSORY', 'LUBRICANT'];
const PARTS_TYPES    = ['Genuine', 'Aftermarket', 'Reconditioned', 'Used'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn     = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn   = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const INP   = 'box-border w-full border border-gray-200 bg-white px-1.5 py-0 text-[10px] outline-none focus:border-gray-400 sm:px-2';
const INP_S = { height: inputField.box.height, minHeight: inputField.box.height, borderRadius: inputField.box.borderRadius, background: colors.input?.background ?? '#F5F5F5', borderColor: '#e2e8f0' };

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
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
function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function LabelInput({ label, value, onChange, placeholder, inputMode, readOnly }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] leading-tight sm:text-[10px] sm:leading-[15px]" style={{ color: inputField.label.color }}>{label}</label>
      <input type="text" inputMode={inputMode} readOnly={readOnly} value={value} onChange={onChange} placeholder={placeholder}
        className={INP} style={{ ...INP_S, background: readOnly ? '#f3f4f6' : (colors.input?.background ?? '#F5F5F5') }} />
    </div>
  );
}

function LabelSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] leading-tight sm:text-[10px] sm:leading-[15px]" style={{ color: inputField.label.color }}>{label}</label>
      <div className="relative">
        <select value={value} onChange={onChange} className={`${INP} cursor-pointer appearance-none pr-4`} style={INP_S}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-gray-400">▾</span>
      </div>
    </div>
  );
}

function SectionCard({ title, count, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-2.5 py-1.5">
        <span className="text-[9px] font-bold tracking-wide sm:text-[10px]" style={{ color: primary }}>{title}</span>
        {count != null && (
          <span className="rounded-full px-1.5 py-px text-[8px] font-semibold text-white sm:text-[9px]" style={{ backgroundColor: primary }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

const DUMMY_BRANCH_QTY = [
  { branch: 'Main Branch',  qty: '24' },
  { branch: 'North Branch', qty: '8'  },
  { branch: 'South Branch', qty: '12' },
];
const DUMMY_SUBSTITUTES = [
  { id: 'sub-1', partsNo: 'OIL-001A', partsName: 'Engine Oil 5W-30 Alt',  vehicleBrand: 'CONSUMABLE', vehicleType: 'CONSUMABLE' },
  { id: 'sub-2', partsNo: 'FLT-002B', partsName: 'Oil Filter Alternative', vehicleBrand: 'TOYOTA',    vehicleType: 'SEDAN'      },
];
const DUMMY_PURCHASE = [
  { grnNo: 'GRN-0012', purchDate: '2026-04-10', supplier: 'Gulf Motors Supply',   qty: '50', unitPrice: '4.500' },
  { grnNo: 'GRN-0008', purchDate: '2026-03-22', supplier: 'Al-Rashid Auto Parts', qty: '30', unitPrice: '4.800' },
  { grnNo: 'GRN-0005', purchDate: '2026-02-15', supplier: 'Desert Tech Spares',   qty: '20', unitPrice: '5.000' },
];
const DUMMY_SALES = [
  { jobNo: 'JOB-00042', deliveryDate: '2026-04-28', qty: '5', unitPrice: '8.500' },
  { jobNo: 'JOB-00035', deliveryDate: '2026-04-12', qty: '3', unitPrice: '8.500' },
  { jobNo: 'JOB-00021', deliveryDate: '2026-03-30', qty: '8', unitPrice: '8.000' },
];

export default function ConsumableEntry() {
  const [partsNo,      setPartsNo]      = useState('');
  const [partsName,    setPartsName]    = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('CONSUMABLE');
  const [vehicleType,  setVehicleType]  = useState('CONSUMABLE');
  const [partsFamily,  setPartsFamily]  = useState('GENERAL');
  const [itemType,     setItemType]     = useState('CONSUMABLE');
  const [partsType,    setPartsType]    = useState('Genuine');
  const [quantity,     setQuantity]     = useState('');
  const [actualCost,   setActualCost]   = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [location,     setLocation]     = useState('');
  const [reOrderQty,   setReOrderQty]   = useState('');
  const [reOrderLevel, setReOrderLevel] = useState('');
  const [remark,       setRemark]       = useState('');

  const [activeTab,    setActiveTab]    = useState('substitute');
  const [subLines,     setSubLines]     = useState(DUMMY_SUBSTITUTES);
  const [subPartsNo,   setSubPartsNo]   = useState('');
  const [subPartsName, setSubPartsName] = useState('');

  const handleAddSub = useCallback(() => {
    if (!subPartsNo.trim() && !subPartsName.trim()) return;
    setSubLines((prev) => [...prev, { id: `sub-${Date.now()}`, partsNo: subPartsNo.trim(), partsName: subPartsName.trim(), vehicleBrand, vehicleType }]);
    setSubPartsNo(''); setSubPartsName('');
  }, [subPartsNo, subPartsName, vehicleBrand, vehicleType]);

  const deleteSubRow = useCallback((id) => setSubLines((p) => p.filter((r) => r.id !== id)), []);

  const reset = useCallback(() => {
    setPartsNo(''); setPartsName(''); setVehicleBrand('CONSUMABLE'); setVehicleType('CONSUMABLE');
    setPartsFamily('GENERAL'); setItemType('CONSUMABLE'); setPartsType('Genuine');
    setQuantity(''); setActualCost(''); setSellingPrice(''); setLocation('');
    setReOrderQty(''); setReOrderLevel(''); setRemark('');
    setSubLines([]); setSubPartsNo(''); setSubPartsName('');
  }, []);

  const subTableRows   = useMemo(() => subLines.map((r) => [
    r.partsNo, r.partsName, r.vehicleBrand, r.vehicleType,
    <button key={r.id} type="button" onClick={() => deleteSubRow(r.id)}
      className="inline-flex h-5 w-5 items-center justify-center rounded text-red-400 hover:text-red-600">
      <TrashIcon className="h-3 w-3" />
    </button>,
  ]), [subLines, deleteSubRow]);

  const branchTableRows = useMemo(() => DUMMY_BRANCH_QTY.map((r) => [r.branch, r.qty]), []);
  const purchTableRows  = useMemo(() => DUMMY_PURCHASE.map((r)  => [r.grnNo, r.purchDate, r.supplier, r.qty, r.unitPrice]), []);
  const salesTableRows  = useMemo(() => DUMMY_SALES.map((r)     => [r.jobNo, r.deliveryDate, r.qty, r.unitPrice]), []);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          CONSUMABLE ENTRY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} onClick={reset} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" /> Delete
          </button>
          <button type="button" className={figmaBtn} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" /> Save
          </button>
          <button type="button" className={primaryBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={reset}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── scrollable body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-w-0 flex-col gap-3">

          {/* ── Row 1: Part details + Available Qty ── */}
          <div className="flex min-w-0 gap-3">

            {/* Part details */}
            <div className="flex-1 min-w-0">
              <SectionCard title="PART DETAILS">
                <div className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-2 p-2.5">
                  <div style={{ width: 120 }}><LabelInput label="Parts No"       value={partsNo}      onChange={(e) => setPartsNo(e.target.value)}      placeholder="Parts no."  /></div>
                  <div style={{ width: 200 }}><LabelInput label="Parts Name"     value={partsName}    onChange={(e) => setPartsName(e.target.value)}    placeholder="Part name"  /></div>
                  <div style={{ width: 130 }}><LabelSelect label="Vehicle Brand" value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} options={VEHICLE_BRANDS} /></div>
                  <div style={{ width: 130 }}><LabelSelect label="Vehicle Type"  value={vehicleType}  onChange={(e) => setVehicleType(e.target.value)}  options={VEHICLE_TYPES}  /></div>
                  <div style={{ width: 120 }}><LabelSelect label="Parts Family"  value={partsFamily}  onChange={(e) => setPartsFamily(e.target.value)}  options={PARTS_FAMILIES} /></div>
                  <div style={{ width: 120 }}><LabelSelect label="Item Type"     value={itemType}     onChange={(e) => setItemType(e.target.value)}     options={ITEM_TYPES}     /></div>
                  <div style={{ width: 120 }}><LabelSelect label="Parts Type"    value={partsType}    onChange={(e) => setPartsType(e.target.value)}    options={PARTS_TYPES}    /></div>
                  <div style={{ width: 90 }} ><LabelInput  label="Quantity"      value={quantity}     onChange={(e) => setQuantity(e.target.value)}     placeholder="0"          inputMode="numeric"  /></div>
                  <div style={{ width: 100 }}><LabelInput  label="Actual Cost"   value={actualCost}   onChange={(e) => setActualCost(e.target.value)}   placeholder="0.000"      inputMode="decimal"  /></div>
                  <div style={{ width: 100 }}><LabelInput  label="Selling Price" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.000"      inputMode="decimal"  /></div>
                  <div style={{ width: 120 }}><LabelInput  label="Location"      value={location}     onChange={(e) => setLocation(e.target.value)}     placeholder="Location"               /></div>
                  <div style={{ width: 90 }} ><LabelInput  label="Re Order Qty"  value={reOrderQty}   onChange={(e) => setReOrderQty(e.target.value)}  placeholder="0"          inputMode="numeric"  /></div>
                  <div style={{ width: 90 }} ><LabelInput  label="Re Order Level" value={reOrderLevel} onChange={(e) => setReOrderLevel(e.target.value)} placeholder="0"         inputMode="numeric"  /></div>
                  <div style={{ width: 150 }}><LabelInput  label="Remark"        value={remark}       onChange={(e) => setRemark(e.target.value)}       placeholder="Remark"                 /></div>
                </div>
              </SectionCard>
            </div>

            {/* Available Qty in Branch */}
            <div className="w-[190px] shrink-0">
              <SectionCard title="AVAILABLE QTY IN BRANCH">
                <div className="p-2">
                  <CommonTable
                    fitParentWidth hideVerticalCellBorders
                    headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280"
                    bodyFontSize="clamp(8px,1vw,10px)"
                    cellPaddingClass="px-1 py-1 sm:px-1.5"
                    bodyRowHeightRem={1.8}
                    columnWidthPercents={[68, 32]}
                    headers={['Branch', 'Qty']}
                    rows={branchTableRows}
                  />
                </div>
              </SectionCard>
            </div>
          </div>

          {/* ── Tabbed tables ── */}
          <div className="flex min-w-0 flex-col gap-2">
            <TabsBar
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'substitute',      label: `Substitute Parts (${subLines.length})` },
                { id: 'purchaseHistory', label: 'Purchase History' },
                { id: 'salesHistory',    label: 'Sales History' },
              ]}
            />

            {activeTab === 'substitute' && (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
                {/* entry panel */}
                <div className="bg-slate-50/70 px-2.5 py-2">
                  <div className="flex min-w-0 flex-wrap items-end gap-2">
                    <div style={{ width: 130 }}>
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] leading-tight sm:text-[10px]" style={{ color: inputField.label.color }}>Parts No</label>
                        <div className="flex items-center gap-1">
                          <input type="text" value={subPartsNo} onChange={(e) => setSubPartsNo(e.target.value)} placeholder="Parts no."
                            className="box-border min-w-0 flex-1 border border-gray-200 bg-white px-1.5 py-0 text-[10px] outline-none focus:border-gray-400" style={INP_S} />
                          <button type="button" className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50" style={{ borderRadius: inputField.box.borderRadius }}>
                            <SearchIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <LabelInput label="Parts Name" value={subPartsName} onChange={(e) => setSubPartsName(e.target.value)} placeholder="Part name" />
                    </div>
                    <button type="button" onClick={handleAddSub}
                      className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded border px-3 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: primary, borderColor: primary }}>
                      + Add
                    </button>
                  </div>
                </div>
                <div className="px-2.5 pb-2.5">
                  {subLines.length === 0 ? (
                    <div className="flex h-10 items-center justify-center rounded border border-dashed border-gray-200">
                      <span className="text-[9px] text-gray-400">No substitute parts added</span>
                    </div>
                  ) : (
                    <CommonTable
                      fitParentWidth hideVerticalCellBorders
                      headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280"
                      bodyFontSize="clamp(8px,1vw,10px)"
                      cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
                      bodyRowHeightRem={2}
                      columnWidthPercents={[18, 44, 20, 14, 4]}
                      headers={['Parts No', 'Parts Name', 'Vehicle Brand', 'Vehicle Type', '']}
                      rows={subTableRows}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'purchaseHistory' && (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-white px-2.5 pb-2.5 pt-2">
                <CommonTable
                  fitParentWidth hideVerticalCellBorders
                  headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280"
                  bodyFontSize="clamp(8px,1vw,10px)"
                  cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
                  bodyRowHeightRem={2}
                  columnWidthPercents={[18, 20, 38, 10, 14]}
                  headers={['GRN No', 'Purch. Date', 'Supplier Name', 'Qty', 'Unit Price']}
                  rows={purchTableRows}
                />
              </div>
            )}

            {activeTab === 'salesHistory' && (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-white px-2.5 pb-2.5 pt-2">
                <CommonTable
                  fitParentWidth hideVerticalCellBorders
                  headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280"
                  bodyFontSize="clamp(8px,1vw,10px)"
                  cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
                  bodyRowHeightRem={2}
                  columnWidthPercents={[28, 34, 14, 24]}
                  headers={['Job No', 'Delivery Date', 'Qty', 'Unit Price']}
                  rows={salesTableRows}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
