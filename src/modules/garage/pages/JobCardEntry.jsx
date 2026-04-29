import React, { useCallback, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, SubInputField, DateInputField, Switch, CommonTable, TabsBar } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';

const primary = colors.primary?.main || '#790728';

const DUMMY_JOBS = [
  { id: '1', jobCode: 'BS-001', description: 'Full body respray', stdTime: '8.00', cost: '250.00', price: '350.00' },
  { id: '2', jobCode: 'BS-002', description: 'Dent removal – door panel', stdTime: '3.00', cost: '80.00', price: '120.00' },
  { id: '3', jobCode: 'ME-010', description: 'Engine oil change', stdTime: '0.50', cost: '30.00', price: '50.00' },
  { id: '4', jobCode: 'EL-005', description: 'AC regas & check', stdTime: '1.00', cost: '60.00', price: '95.00' },
];

const JOB_TABLE_COLS = [5, 14, 28, 13, 13, 13, 14];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const CUSTOMER_TYPES = ['CASH', 'CREDIT', 'INSURANCE', 'CORPORATE', 'WARRANTY'];
const JOB_TYPES = ['BODYSHOP', 'MECHANICAL', 'ELECTRICAL', 'GENERAL SERVICE', 'AC SERVICE', 'TYRES', 'OTHER'];
const JOB_BROUGHT_BY_OPTS = ['Owner', 'Driver', 'Agent', 'Walk-in', 'Other'];
const DRIVER_OPTS = ['Driver 1', 'Driver 2', 'Driver 3', 'Driver 4'];
const ADVISOR_OPTS = ['Ahmed Al-Rashidi', 'Fatima Hassan', 'Omar Khalid', 'Sara Al-Mutairi'];
const STATION_OPTS = ['Main Workshop', 'Branch A', 'Branch B', 'Branch C'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn =
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



export default function JobCardEntry() {
  const today = new Date().toISOString().slice(0, 10);
  const [activeFormTab, setActiveFormTab] = useState('basic');

  const [jobCardNo, setJobCardNo] = useState('');
  const [regNo, setRegNo] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [customerType, setCustomerType] = useState('CASH');
  const [vehOwnerName, setVehOwnerName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [jobBroughtBy, setJobBroughtBy] = useState('');
  const [driver, setDriver] = useState('');
  const [serviceAdvisor, setServiceAdvisor] = useState('');
  const [bookingDate, setBookingDate] = useState(today);
  const [promiseDate, setPromiseDate] = useState(today);
  const [advanceReceived, setAdvanceReceived] = useState('');
  const [invoiceParty, setInvoiceParty] = useState('');
  const [estimationNo, setEstimationNo] = useState('');
  const [estimationAmount, setEstimationAmount] = useState('');
  const [lpoNo, setLpoNo] = useState('');
  const [claimNo, setClaimNo] = useState('');
  const [kmReading, setKmReading] = useState('');
  const [lpoDate, setLpoDate] = useState(today);
  const [excessAmt, setExcessAmt] = useState('');
  const [jobType, setJobType] = useState('BODYSHOP');
  const [customerConcern, setCustomerConcern] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [repeatJob, setRepeatJob] = useState(false);
  const [jobRefNo, setJobRefNo] = useState('');
  const [policeRefNo, setPoliceRefNo] = useState('');

  /* qc / warranty */
  const [qcPass, setQcPass] = useState(false);
  const [qcDetails, setQcDetails] = useState('');
  const [warrantyDetails, setWarrantyDetails] = useState('');
  const [policeReport, setPoliceReport] = useState(false);
  const [warrantyRepair, setWarrantyRepair] = useState(false);
  const [totalLoss, setTotalLoss] = useState(false);

  /* job description entry */
  const [jobLines, setJobLines] = useState(DUMMY_JOBS.map((r) => ({ ...r })));
  const [lineJobCode, setLineJobCode] = useState('');
  const [lineDescription, setLineDescription] = useState('');
  const [lineUnitCost, setLineUnitCost] = useState('');
  const [lineSellingPrice, setLineSellingPrice] = useState('');

  const handleAddLine = useCallback(() => {
    if (!lineJobCode.trim()) return;
    setJobLines((prev) => [
      {
        id: `jl-${Date.now()}`,
        jobCode: lineJobCode.trim(),
        description: lineDescription.trim() || '—',
        stdTime: '—',
        cost: lineUnitCost.trim() || '0.00',
        price: lineSellingPrice.trim() || '0.00',
      },
      ...prev,
    ]);
    setLineJobCode(''); setLineDescription(''); setLineUnitCost(''); setLineSellingPrice('');
  }, [lineJobCode, lineDescription, lineUnitCost, lineSellingPrice]);

  const handleDeleteLine = useCallback((id) => {
    setJobLines((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const reset = useCallback(() => {
    setJobCardNo(''); setRegNo(''); setStationCode(''); setChassisNo('');
    setCustomerType('CASH'); setVehOwnerName(''); setCustomerName('');
    setJobBroughtBy(''); setDriver(''); setServiceAdvisor('');
    setBookingDate(today); setPromiseDate(today);
    setAdvanceReceived(''); setInvoiceParty(''); setEstimationNo(''); setEstimationAmount('');
    setLpoNo(''); setClaimNo(''); setKmReading(''); setLpoDate(today);
    setExcessAmt(''); setJobType('BODYSHOP');
    setCustomerConcern(''); setShortDesc(''); setRepeatJob(false); setJobRefNo(''); setPoliceRefNo('');
    setJobLines(DUMMY_JOBS.map((r) => ({ ...r })));
    setLineJobCode(''); setLineDescription(''); setLineUnitCost(''); setLineSellingPrice('');
    setQcPass(false); setQcDetails(''); setWarrantyDetails('');
    setPoliceReport(false); setWarrantyRepair(false); setTotalLoss(false);
  }, [today]);

  const jobTableRows = useMemo(() =>
    jobLines.map((r, idx) => [
      idx + 1,
      r.jobCode,
      r.description,
      r.stdTime,
      r.cost,
      r.price,
      <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
        <button type="button" className={actionIconBtn} aria-label="View">
          <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className={actionIconBtn} aria-label="Edit">
          <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className={actionIconBtn} aria-label="Delete" onClick={() => handleDeleteLine(r.id)}>
          <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]),
  [jobLines, handleDeleteLine]);

  const handleSave = useCallback(() => console.log('Save job card'), []);
  const handlePost = useCallback(() => console.log('Post job card'), []);
  const handleUnpost = useCallback(() => console.log('Unpost job card'), []);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          JOB CARD
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} onClick={handlePost} aria-label="Post">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" />
            Post
          </button>
          <button type="button" className={figmaBtn} onClick={handleUnpost} aria-label="Unpost">
            <img src={UnpostIcon} alt="" className="h-3.5 w-3.5" />
            Unpost
          </button>
          <button type="button" className={`${figmaBtn} font-semibold text-black`} onClick={reset} aria-label="Delete">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button type="button" className={figmaBtn} onClick={handleSave} aria-label="Save">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
            Save
          </button>
          <button
            type="button"
            className={primaryBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={reset}
            aria-label="New job card"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Job Card</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-w-0 flex-col gap-3">

          {/* ── Tabbed Header Form ── */}
          <div className="min-w-0">
            <TabsBar
              activeTab={activeFormTab}
              onChange={setActiveFormTab}
              tabs={[
                { id: 'basic', label: 'Basic' },
                { id: 'trading', label: 'Trading Product' },
                { id: 'supplier', label: 'Supplier Details' },
              ]}
            />

            {activeFormTab === 'basic' ? (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex min-w-0 flex-wrap items-end gap-2 sm:gap-3">
                  <div className="shrink-0">
                    <SubInputField label="Job Card No" value={jobCardNo} onChange={(e) => setJobCardNo(e.target.value)} placeholder="Auto" />
                  </div>
                  <SubInputField label="Reg. No." value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="Reg. no." />
                  <div className="shrink-0">
                    <DropdownInput label="Station Code" value={stationCode} onChange={setStationCode} options={STATION_OPTS} placeholder="Select station" />
                  </div>
                  <div className="shrink-0">
                    <SubInputField label="Chassis No" value={chassisNo} onChange={(e) => setChassisNo(e.target.value)} placeholder="Chassis no." />
                  </div>
                  <div className="shrink-0">
                    <DropdownInput label="Customer Type" value={customerType} onChange={setCustomerType} options={CUSTOMER_TYPES} placeholder="Select type" />
                  </div>
                  <div className="shrink-0">
                    <SubInputField label="Veh. Owner Name" value={vehOwnerName} onChange={(e) => setVehOwnerName(e.target.value)} placeholder="Owner name" widthPx={140} />
                  </div>
                  <div className="shrink-0">
                    <SubInputField label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" widthPx={140} />
                  </div>
                  <div className="shrink-0">
                    <DropdownInput label="Job Brought By" value={jobBroughtBy} onChange={setJobBroughtBy} options={JOB_BROUGHT_BY_OPTS} placeholder="Select" />
                  </div>
                  <div className="shrink-0">
                    <DropdownInput label="Driver" value={driver} onChange={setDriver} options={DRIVER_OPTS} placeholder="Select driver" />
                  </div>
                  <div className="shrink-0">
                    <DropdownInput label="Service Advisor" value={serviceAdvisor} onChange={setServiceAdvisor} options={ADVISOR_OPTS} placeholder="Select advisor" />
                  </div>
                  <div className="shrink-0">
                    <DateInputField label="Booking Date" value={bookingDate} onChange={setBookingDate} />
                  </div>
                  <div className="shrink-0">
                    <DateInputField label="Promise Date" value={promiseDate} onChange={setPromiseDate} />
                  </div>
                  <div className="shrink-0">
                    <SubInputField label="Advance Received" value={advanceReceived} onChange={(e) => setAdvanceReceived(e.target.value)} placeholder="0.00" inputMode="decimal" />
                  </div>
                  <div className="shrink-0">
                    <SubInputField label="Invoice Party" value={invoiceParty} onChange={(e) => setInvoiceParty(e.target.value)} placeholder="Invoice party" widthPx={120} />
                  </div>
                </div>
              </div>
            ) : activeFormTab === 'trading' ? (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
                <div className="flex min-w-0 flex-wrap items-start gap-2 sm:gap-3">
                  <div className="shrink-0 self-end">
                    <SubInputField label="Estimation No" value={estimationNo} onChange={(e) => setEstimationNo(e.target.value)} placeholder="Est. no." />
                  </div>
                  <div className="shrink-0 self-end">
                    <SubInputField label="Estimation Amount" value={estimationAmount} onChange={(e) => setEstimationAmount(e.target.value)} placeholder="0.00" inputMode="decimal" widthPx={110} />
                  </div>
                  <div className="shrink-0 self-end">
                    <SubInputField label="LPO No." value={lpoNo} onChange={(e) => setLpoNo(e.target.value)} placeholder="LPO no." />
                  </div>
                  <div className="shrink-0 self-end">
                    <SubInputField label="Claim No." value={claimNo} onChange={(e) => setClaimNo(e.target.value)} placeholder="Claim no." />
                  </div>
                  <div className="shrink-0 self-end">
                    <SubInputField label="KM Reading (IN)" value={kmReading} onChange={(e) => setKmReading(e.target.value)} placeholder="KM" inputMode="numeric" />
                  </div>
                  <div className="shrink-0 self-end">
                    <DateInputField label="LPO Date" value={lpoDate} onChange={setLpoDate} />
                  </div>
                  <div className="shrink-0 self-end">
                    <SubInputField label="Excess Amt." value={excessAmt} onChange={(e) => setExcessAmt(e.target.value)} placeholder="0.00" inputMode="decimal" />
                  </div>
                  <div className="shrink-0 self-end">
                    <DropdownInput label="Job Type" value={jobType} onChange={setJobType} options={JOB_TYPES} placeholder="Select type" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
                <div className="flex min-w-0 flex-wrap items-start gap-2 sm:gap-3">

                  <div className="flex min-h-0 w-full max-w-[20rem] flex-col gap-0.5">
                    <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
                      Customer Concern
                    </label>
                    <textarea
                      value={customerConcern}
                      onChange={(e) => setCustomerConcern(e.target.value)}
                      rows={3}
                      placeholder="Describe customer concern…"
                      className="box-border min-h-[3.5rem] w-full max-w-full resize-y rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
                      style={{ background: colors.input?.background ?? '#fff', borderRadius: inputField.box.borderRadius, borderColor: '#e2e8f0' }}
                    />
                  </div>

                  <div className="flex min-h-0 w-full max-w-[16rem] flex-col gap-0.5">
                    <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
                      Short Desc.
                    </label>
                    <textarea
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      rows={3}
                      placeholder="Short description…"
                      className="box-border min-h-[3.5rem] w-full max-w-full resize-y rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
                      style={{ background: colors.input?.background ?? '#fff', borderRadius: inputField.box.borderRadius, borderColor: '#e2e8f0' }}
                    />
                  </div>

                  <div className="flex shrink-0 flex-wrap items-end gap-2 self-end sm:gap-3">
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <span className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
                        Repeat Job
                      </span>
                      <div className="flex h-[26px] items-center">
                        <Switch checked={repeatJob} onChange={setRepeatJob} size="sm" />
                      </div>
                    </div>
                    <div className="shrink-0">
                      <SubInputField
                        label="Job Ref. No."
                        value={jobRefNo}
                        onChange={(e) => setJobRefNo(e.target.value)}
                        placeholder="Ref. no."
                        disabled={!repeatJob}
                        className={!repeatJob ? 'cursor-not-allowed opacity-40' : ''}
                      />
                    </div>
                    <div className="shrink-0">
                      <SubInputField label="Police Reff. No" value={policeRefNo} onChange={(e) => setPoliceRefNo(e.target.value)} placeholder="Police ref." />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 3: Job Description Entry ── */}
          <div className="flex min-h-0 min-w-0 flex-col gap-2">

            {/* sub-heading */}
            <div className="border-b border-gray-200 pb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest sm:text-[10px]" style={{ color: primary }}>
                Job Description Entry
              </span>
            </div>

            {/* input panel */}
            <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
              <div className="flex min-w-0 flex-wrap items-end gap-2 sm:gap-3">

                <div className="shrink-0">
                  <SubInputField label="Job Code" value={lineJobCode} onChange={(e) => setLineJobCode(e.target.value)} placeholder="Code" />
                </div>

                <div className="shrink-0">
                  <SubInputField
                    label="Job Description"
                    value={lineDescription}
                    onChange={(e) => setLineDescription(e.target.value)}
                    placeholder="Description"
                    widthPx={160}
                  />
                </div>
                <div className="shrink-0">
                  <SubInputField
                    label="Unit Cost"
                    value={lineUnitCost}
                    onChange={(e) => setLineUnitCost(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                <div className="shrink-0">
                  <SubInputField
                    label="Selling Price"
                    value={lineSellingPrice}
                    onChange={(e) => setLineSellingPrice(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>

                <div className="ml-auto flex shrink-0 items-end pb-px">
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white"
                    style={{ backgroundColor: primary, borderColor: primary }}
                  >
                    Apply
                  </button>
                </div>

              </div>
            </div>

            {/* table */}
            <CommonTable
              fitParentWidth
              allowHorizontalScroll
              truncateHeader
              truncateBody
              columnWidthPercents={JOB_TABLE_COLS}
              tableClassName="min-w-[36rem] w-full"
              hideVerticalCellBorders
              cellAlign="center"
              headerFontSize="clamp(7px, 0.85vw, 10px)"
              headerTextColor="#6b7280"
              bodyFontSize="clamp(8px, 1vw, 10px)"
              cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
              bodyRowHeightRem={2.2}
              headers={['Sl No', 'Job Code', 'Description', 'Std Time', 'Cost', 'Price', '']}
              rows={jobTableRows}
            />

          </div>

          {/* ── QC / Warranty Section ── */}
          <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
            <div className="flex min-w-0 flex-col gap-2">

              {/* QC Pass switch */}
              <Switch checked={qcPass} onChange={setQcPass} description="QC Pass" size="sm" />

              {/* QC Details + Warranty Details + Switches — parallel */}
              <div className="flex min-w-0 flex-wrap items-start gap-2 sm:gap-3">
                <div className="flex min-h-0 min-w-0 flex-col gap-0.5" style={{ width: '12rem', maxWidth: '100%' }}>
                  <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
                    QC Details
                  </label>
                  <textarea
                    value={qcDetails}
                    onChange={(e) => setQcDetails(e.target.value)}
                    rows={2}
                    className="box-border min-h-[2.25rem] w-full resize-y rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
                    style={{ background: colors.input?.background ?? '#fff', borderRadius: inputField.box.borderRadius, borderColor: '#e2e8f0' }}
                  />
                </div>
                <div className="flex min-h-0 min-w-0 flex-col gap-0.5" style={{ width: '12rem', maxWidth: '100%' }}>
                  <label className="text-[9px] leading-tight sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>
                    Warranty Details
                  </label>
                  <textarea
                    value={warrantyDetails}
                    onChange={(e) => setWarrantyDetails(e.target.value)}
                    rows={2}
                    className="box-border min-h-[2.25rem] w-full resize-y rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
                    style={{ background: colors.input?.background ?? '#fff', borderRadius: inputField.box.borderRadius, borderColor: '#e2e8f0' }}
                  />
                </div>

                <div className="flex min-h-0 min-w-0 flex-col gap-2 px-1 py-1" style={{ width: '18rem', maxWidth: '100%' }}>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Switch checked={policeReport} onChange={setPoliceReport} description="Police Report" size="sm" />
                    <Switch checked={warrantyRepair} onChange={setWarrantyRepair} description="Warranty Repair" size="sm" />
                    <Switch checked={totalLoss} onChange={setTotalLoss} description="Total Loss" size="sm" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
