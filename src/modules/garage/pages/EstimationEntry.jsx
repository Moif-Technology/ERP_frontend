import React, { useCallback, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, SubInputField, DateInputField, Switch, CommonTable, TabsBar } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';

const primary = colors.primary?.main || '#790728';

const CLAIM_TYPES = ['OWN CLAIM', 'THIRD PARTY', 'COMPREHENSIVE', 'TPL', 'CASH'];
const ESTIMATOR_OPTS = ['INVENT', 'Ahmed', 'Fatima', 'Omar'];
const SPARE_TYPES = ['OEM', 'AFTERMARKET', 'USED', 'RECON'];
const ESTIMATION_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'REVISED'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const INP = 'box-border w-full border border-gray-200 bg-white px-1.5 py-0 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]';
const INP_S = { height: inputField.box.height, minHeight: inputField.box.height, borderRadius: inputField.box.borderRadius, background: colors.input?.background ?? '#fff', borderColor: '#e2e8f0' };

/* ── icons ── */
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
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}


/* ── simple text input ── */
function TInp({ value, onChange, placeholder, inputMode, readOnly, className }) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${INP} ${className ?? ''}`}
      style={INP_S}
    />
  );
}

/* ── editable table cell input ── */

function parseNum(v) { const n = Number(String(v ?? '').replace(/,/g, '')); return Number.isFinite(n) ? n : 0; }
function fmt2(n) { return parseNum(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function EstimationEntry() {
  const today = new Date().toISOString().slice(0, 10);
  const [activeInfoTab, setActiveInfoTab] = useState('basic');
  const [activeTableTab, setActiveTableTab] = useState('repairs');

  /* header */
  const [quotationNo, setQuotationNo] = useState('');
  const [quotationDate, setQuotationDate] = useState(today);
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerRefNo, setCustomerRefNo] = useState('');
  const [claimType, setClaimType] = useState('OWN CLAIM');
  const [estimator, setEstimator] = useState('INVENT');

  /* vehicle */
  const [regNo, setRegNo] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [model, setModel] = useState('');
  const [bodyColour, setBodyColour] = useState('');
  const [kmReading, setKmReading] = useState('');

  /* repairs table */
  const [repairLines, setRepairLines] = useState([
    { id: 'r-1', repairs: 'Front bumper dent repair & repaint', amount: '350.00' },
    { id: 'r-2', repairs: 'Right door panel straightening', amount: '220.00' },
    { id: 'r-3', repairs: 'Windshield replacement', amount: '480.00' },
    { id: 'r-4', repairs: 'Engine oil leak fix', amount: '150.00' },
  ]);
  const [repairDesc, setRepairDesc] = useState('');
  const [repairAmt, setRepairAmt] = useState('');

  /* spare parts table */
  const [spareLines, setSpareLines] = useState([
    { id: 's-1', sparePart: 'Front Bumper Assembly', qty: '1', amount: '620.00', total: '620.00', type: 'OEM' },
    { id: 's-2', sparePart: 'Door Hinge Set', qty: '2', amount: '85.00', total: '170.00', type: 'AFTERMARKET' },
    { id: 's-3', sparePart: 'Windshield Glass', qty: '1', amount: '310.00', total: '310.00', type: 'OEM' },
    { id: 's-4', sparePart: 'Oil Seal Kit', qty: '1', amount: '45.00', total: '45.00', type: 'RECON' },
    { id: 's-5', sparePart: 'Headlamp Assembly (LH)', qty: '1', amount: '275.00', total: '275.00', type: 'OEM' },
  ]);
  const [sparePart, setSparePart] = useState('');
  const [spareQty, setSpareQty] = useState('');
  const [spareAmt, setSpareAmt] = useState('');
  const [spareType, setSpareType] = useState('');

  /* totals */
  const [discount, setDiscount] = useState('');
  const [vat, setVat] = useState('');

  /* footer */
  const [remark, setRemark] = useState('');
  const [additionalEstimation, setAdditionalEstimation] = useState(false);
  const [totalLoss, setTotalLoss] = useState(false);
  const [lpoClaimNo, setLpoClaimNo] = useState('');
  const [estimationStatus, setEstimationStatus] = useState('');
  const [approvalAmount, setApprovalAmount] = useState('');

  /* repair line ops */
  const handleAddRepair = useCallback(() => {
    if (!repairDesc.trim()) return;
    setRepairLines((prev) => [...prev, { id: `r-${Date.now()}`, repairs: repairDesc.trim(), amount: repairAmt.trim() || '0.00' }]);
    setRepairDesc(''); setRepairAmt('');
  }, [repairDesc, repairAmt]);
  const deleteRepairRow = useCallback((id) => setRepairLines((prev) => prev.filter((r) => r.id !== id)), []);

  /* spare line ops */
  const handleAddSpare = useCallback(() => {
    if (!sparePart.trim()) return;
    const qty = spareQty.trim() || '0';
    const amt = spareAmt.trim() || '0.00';
    const total = fmt2(parseNum(qty) * parseNum(amt));
    setSpareLines((prev) => [...prev, { id: `s-${Date.now()}`, sparePart: sparePart.trim(), qty, amount: amt, total, type: spareType }]);
    setSparePart(''); setSpareQty(''); setSpareAmt(''); setSpareType('');
  }, [sparePart, spareQty, spareAmt, spareType]);
  const deleteSpareRow = useCallback((id) => setSpareLines((prev) => prev.filter((r) => r.id !== id)), []);

  /* computed totals */
  const totalRepairs = useMemo(() => repairLines.reduce((s, r) => s + parseNum(r.amount), 0), [repairLines]);
  const totalSpares = useMemo(() => spareLines.reduce((s, r) => s + parseNum(r.total), 0), [spareLines]);
  const grandTotal = useMemo(() => totalRepairs + totalSpares - parseNum(discount) + parseNum(vat), [totalRepairs, totalSpares, discount, vat]);

  /* repair table rows */
  const repairTableRows = useMemo(() => repairLines.map((r, idx) => [
    idx + 1,
    r.repairs,
    r.amount,
    <button key={r.id} type="button" onClick={() => deleteRepairRow(r.id)}
      className="inline-flex h-5 w-5 items-center justify-center rounded text-red-400 hover:text-red-600" aria-label="Delete">
      <TrashIcon className="h-3 w-3" />
    </button>,
  ]), [repairLines, deleteRepairRow]);

  /* spare table rows */
  const spareTableRows = useMemo(() => spareLines.map((r, idx) => [
    idx + 1,
    r.sparePart,
    r.qty,
    r.amount,
    r.total,
    r.type || '—',
    <button key={r.id} type="button" onClick={() => deleteSpareRow(r.id)}
      className="inline-flex h-5 w-5 items-center justify-center rounded text-red-400 hover:text-red-600" aria-label="Delete">
      <TrashIcon className="h-3 w-3" />
    </button>,
  ]), [spareLines, deleteSpareRow]);

  const reset = useCallback(() => {
    setQuotationNo(''); setQuotationDate(today); setCustomerName(''); setContactPerson('');
    setCustomerRefNo(''); setClaimType('OWN CLAIM'); setEstimator('INVENT');
    setRegNo(''); setVehicleBrand(''); setVehicleType(''); setChassisNo('');
    setModel(''); setBodyColour(''); setKmReading('');
    setRepairLines([]); setRepairDesc(''); setRepairAmt('');
    setSpareLines([]); setSparePart(''); setSpareQty(''); setSpareAmt(''); setSpareType('');
    setDiscount(''); setVat('');
    setRemark(''); setAdditionalEstimation(false); setTotalLoss(false);
    setLpoClaimNo(''); setEstimationStatus(''); setApprovalAmount('');
  }, [today]);

  const handleSave = useCallback(() => console.log('Save estimation entry'), []);
  const handlePost = useCallback(() => console.log('Post estimation entry'), []);
  const handleUnpost = useCallback(() => console.log('Unpost estimation entry'), []);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          ESTIMATION ENTRY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} onClick={handlePost} aria-label="Post">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" /> Post
          </button>
          <button type="button" className={figmaBtn} onClick={handleUnpost} aria-label="Unpost">
            <img src={UnpostIcon} alt="" className="h-3.5 w-3.5" /> Unpost
          </button>
          <button type="button" className={`${figmaBtn} font-semibold text-black`} onClick={reset} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" /> Delete
          </button>
          <button type="button" className={figmaBtn} onClick={handleSave} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" /> Save
          </button>
          <button type="button" className={primaryBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={reset}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Estimation</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── scrollable body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-w-0 flex-col gap-3">

          {/* ── Top: Info tabs (left) + Summary/Notes (right) ── */}
          <div className="flex min-w-0 gap-3">
            {/* LEFT: Tabbed Info Section */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <TabsBar
                activeTab={activeInfoTab}
                onChange={setActiveInfoTab}
                tabs={[
                  { id: 'basic', label: 'Basic Details' },
                  { id: 'vehicle', label: 'Vehicle Information' },
                ]}
              />

              {activeInfoTab === 'basic' ? (
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">Quotation &amp; Customer Details</p>
                  <div className="flex min-w-0 flex-wrap items-end gap-2 sm:gap-3">
                    <div className="shrink-0">
                      <SubInputField label="Quotation No" value={quotationNo} onChange={(e) => setQuotationNo(e.target.value)} placeholder="Auto" />
                    </div>
                    <div className="shrink-0">
                      <DateInputField label="Quotation Date" value={quotationDate} onChange={setQuotationDate} />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" widthPx={140} />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Contact person" widthPx={130} />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Customer Ref No." value={customerRefNo} onChange={(e) => setCustomerRefNo(e.target.value)} placeholder="Ref no." />
                    </div>
                    <div className="shrink-0">
                      <DropdownInput label="Claim Type" value={claimType} onChange={setClaimType} options={CLAIM_TYPES} placeholder="Select" />
                    </div>
                    <div className="shrink-0">
                      <DropdownInput label="Estimator" value={estimator} onChange={setEstimator} options={ESTIMATOR_OPTS} placeholder="Select" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">Vehicle Information</p>
                  <div className="flex min-w-0 flex-wrap items-end gap-2 sm:gap-3">
                    {/* Reg No — search style */}
                    <div className="flex shrink-0 flex-col gap-0.5" style={{ width: inputField.box.width }}>
                      <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
                        Reg No.
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={regNo}
                          onChange={(e) => setRegNo(e.target.value)}
                          placeholder="Registration no."
                          className="box-border min-w-0 flex-1 border border-gray-200 bg-white px-1.5 py-0 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
                          style={{ height: inputField.box.height, minHeight: inputField.box.height, borderRadius: inputField.box.borderRadius, background: colors.input?.background ?? '#fff', borderColor: '#e2e8f0' }}
                        />
                        <button type="button" className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50" style={{ borderRadius: inputField.box.borderRadius }} aria-label="Search reg no">
                          <SearchIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <SubInputField label="Vehicle Brand" value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} placeholder="Brand" widthPx={120} />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="Type" widthPx={110} />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Chassis No" value={chassisNo} onChange={(e) => setChassisNo(e.target.value)} placeholder="Chassis no." />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Body Colour" value={bodyColour} onChange={(e) => setBodyColour(e.target.value)} placeholder="Colour" />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="KM Reading" value={kmReading} onChange={(e) => setKmReading(e.target.value)} placeholder="KM" inputMode="numeric" />
                    </div>
                  </div>
                </div>
              )}
              {/* ── Tables section ── */}
              <TabsBar
                activeTab={activeTableTab}
                onChange={setActiveTableTab}
                tabs={[
                  { id: 'repairs', label: 'Repairs' },
                  { id: 'spares', label: 'Spare Parts' },
                ]}
              />

              {activeTableTab === 'repairs' ? (
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
                  {/* card header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-2 py-1.5 sm:px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold sm:text-[10px]" style={{ color: primary }}>REPAIRS</span>
                      <span className="rounded-full px-1.5 py-px text-[8px] font-semibold text-white sm:text-[9px]" style={{ backgroundColor: primary }}>
                        {repairLines.length}
                      </span>
                    </div>
                  </div>
                  {/* input panel */}
                  <div className="bg-slate-50/70 px-2 py-2 sm:px-3">
                    <div className="flex min-w-0 flex-wrap items-end gap-2">
                      <div className="min-w-0 flex-1 flex-col gap-0.5" style={{ minWidth: '120px' }}>
                        <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: inputField.label.color }}>Description</label>
                        <input type="text" value={repairDesc} onChange={(e) => setRepairDesc(e.target.value)} placeholder="Enter repair description" className={INP} style={INP_S} />
                      </div>
                      <div className="shrink-0 flex-col gap-0.5" style={{ width: '80px' }}>
                        <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: inputField.label.color }}>Amount</label>
                        <input type="text" inputMode="decimal" value={repairAmt} onChange={(e) => setRepairAmt(e.target.value)} placeholder="0.00" className={`${INP} text-right`} style={INP_S} />
                      </div>
                      <button type="button" onClick={handleAddRepair} className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded border px-2.5 text-[10px] font-semibold text-white" style={{ backgroundColor: primary, borderColor: primary }}>
                        + Add
                      </button>
                    </div>
                  </div>
                  {/* table */}
                  <div className="px-2 pb-2 sm:px-3 sm:pb-3">
                    {repairLines.length === 0 ? (
                      <div className="flex h-12 items-center justify-center rounded border border-dashed border-gray-200">
                        <span className="text-[9px] text-gray-400">No repairs added yet</span>
                      </div>
                    ) : (
                      <CommonTable fitParentWidth hideVerticalCellBorders headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280" bodyFontSize="clamp(8px,1vw,10px)" cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5" bodyRowHeightRem={2} columnWidthPercents={[8, 67, 18, 7]} headers={['#', 'Repairs', 'Amount', '']} rows={repairTableRows} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
                  {/* card header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-2 py-1.5 sm:px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold sm:text-[10px]" style={{ color: primary }}>SPARE PARTS</span>
                      <span className="rounded-full px-1.5 py-px text-[8px] font-semibold text-white sm:text-[9px]" style={{ backgroundColor: primary }}>
                        {spareLines.length}
                      </span>
                    </div>
                  </div>
                  {/* input panel */}
                  <div className="bg-slate-50/70 px-2 py-2 sm:px-3">
                    <div className="flex min-w-0 flex-wrap items-end gap-2">
                      <div className="min-w-0 flex-1 flex-col gap-0.5" style={{ minWidth: '110px' }}>
                        <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: inputField.label.color }}>Spare Part</label>
                        <input type="text" value={sparePart} onChange={(e) => setSparePart(e.target.value)} placeholder="Enter part name" className={INP} style={INP_S} />
                      </div>
                      <div className="shrink-0 flex-col gap-0.5" style={{ width: '52px' }}>
                        <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: inputField.label.color }}>Qty</label>
                        <input type="text" inputMode="decimal" value={spareQty} onChange={(e) => setSpareQty(e.target.value)} placeholder="0" className={`${INP} text-right`} style={INP_S} />
                      </div>
                      <div className="shrink-0 flex-col gap-0.5" style={{ width: '70px' }}>
                        <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: inputField.label.color }}>Amount</label>
                        <input type="text" inputMode="decimal" value={spareAmt} onChange={(e) => setSpareAmt(e.target.value)} placeholder="0.00" className={`${INP} text-right`} style={INP_S} />
                      </div>
                      <div className="shrink-0 flex-col gap-0.5" style={{ width: '90px' }}>
                        <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: inputField.label.color }}>Type</label>
                        <div className="relative">
                          <select value={spareType} onChange={(e) => setSpareType(e.target.value)} className={`${INP} w-full cursor-pointer appearance-none pr-4`} style={INP_S}>
                            <option value="">Select</option>
                            {SPARE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-gray-400">▾</span>
                        </div>
                      </div>
                      <button type="button" onClick={handleAddSpare} className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded border px-2.5 text-[10px] font-semibold text-white" style={{ backgroundColor: primary, borderColor: primary }}>
                        + Add
                      </button>
                    </div>
                  </div>
                  {/* table */}
                  <div className="px-2 pb-2 sm:px-3 sm:pb-3">
                    {spareLines.length === 0 ? (
                      <div className="flex h-12 items-center justify-center rounded border border-dashed border-gray-200">
                        <span className="text-[9px] text-gray-400">No spare parts added yet</span>
                      </div>
                    ) : (
                      <CommonTable fitParentWidth hideVerticalCellBorders headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280" bodyFontSize="clamp(8px,1vw,10px)" cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5" bodyRowHeightRem={2} columnWidthPercents={[6, 30, 10, 14, 14, 16, 10]} headers={['#', 'Spare Parts', 'Qty', 'Amount', 'Total', 'Type', '']} rows={spareTableRows} />
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT: Summary + Notes */}
            <div className="flex w-[240px] shrink-0 flex-col gap-2">
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-2.5 py-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">Summary</span>
                </div>
                <div className="flex flex-col gap-2 p-2.5">
                  {[
                    { label: 'Total (Repairs)', value: fmt2(totalRepairs) },
                    { label: 'Total (Spares)', value: fmt2(totalSpares) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-1.5">
                      <span className="shrink-0 text-[9px] font-semibold text-gray-600 sm:text-[10px]">{label}</span>
                      <input type="text" readOnly value={value} className={`${INP} w-[80px] text-right font-semibold`} style={INP_S} />
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-1.5">
                    <span className="shrink-0 text-[9px] font-semibold text-gray-600 sm:text-[10px]">Discount</span>
                    <input type="text" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0.00" className={`${INP} w-[80px] text-right`} style={INP_S} />
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <span className="shrink-0 text-[9px] font-semibold text-gray-600 sm:text-[10px]">VAT</span>
                    <input type="text" inputMode="decimal" value={vat} onChange={(e) => setVat(e.target.value)} placeholder="0.00" className={`${INP} w-[80px] text-right`} style={INP_S} />
                  </div>

                  <div className="my-0.5 border-t border-gray-200" />

                  <div className="flex items-center justify-between gap-1.5">
                    <span className="shrink-0 text-[9px] font-bold sm:text-[10px]" style={{ color: primary }}>Grand Total</span>
                    <input type="text" readOnly value={fmt2(grandTotal)} className={`${INP} w-[80px] text-right font-bold`} style={{ ...INP_S, color: primary }} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-2.5 py-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">Notes &amp; Status</span>
                </div>
                <div className="flex flex-col gap-2 p-2.5">
                  {[
                    { label: 'Remark', value: remark, set: setRemark },
                    { label: 'LPO / Claim No.', value: lpoClaimNo, set: setLpoClaimNo },
                    { label: 'Approval Amt.', value: approvalAmount, set: setApprovalAmount, inputMode: 'decimal', className: 'text-right' },
                  ].map(({ label, value, set, inputMode, className }) => (
                    <div key={label} className="flex items-center justify-between gap-1.5">
                      <span className="shrink-0 text-[9px] font-semibold text-gray-600 sm:text-[10px]">{label}</span>
                      <input type="text" inputMode={inputMode} value={value} onChange={(e) => set(e.target.value)} className={`${INP} w-[80px] ${className ?? ''}`} style={INP_S} />
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-1.5">
                    <span className="shrink-0 text-[9px] font-semibold text-gray-600 sm:text-[10px]">Est. Status</span>
                    <div style={{ width: '80px' }}>
                      <DropdownInput value={estimationStatus} onChange={setEstimationStatus} options={ESTIMATION_STATUS} placeholder="Select" fullWidth />
                    </div>
                  </div>
                  <div className="my-0.5 border-t border-gray-200" />
                  <Switch checked={additionalEstimation} onChange={setAdditionalEstimation} description="Additional Estimation" size="sm" />
                  <Switch checked={totalLoss} onChange={setTotalLoss} description="Total Loss" size="sm" />
                </div>
              </div>
            </div>


          </div>

        </div>
      </div>
    </div>
  );
}
