import React, { useCallback, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, SubInputField, DateInputField, Switch, CommonTable, TabsBar } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import { createJobCard, updateJobCard, postJobCard, unpostJobCard } from '../api/jobCard.api';

const primary = colors.primary?.main || '#790728';
const primaryTint = colors.primary?.[50] || '#F2E6EA';

const JOB_TABLE_COLS = [5, 14, 28, 13, 13, 13, 14];

const CUSTOMER_TYPES = ['CASH', 'CREDIT', 'INSURANCE', 'CORPORATE', 'WARRANTY'];
const JOB_TYPES = ['BODYSHOP', 'MECHANICAL', 'ELECTRICAL', 'GENERAL SERVICE', 'AC SERVICE', 'TYRES', 'OTHER'];
const JOB_BROUGHT_BY_OPTS = ['Owner', 'Driver', 'Agent', 'Walk-in', 'Other'];
const DRIVER_OPTS = ['Driver 1', 'Driver 2', 'Driver 3', 'Driver 4'];
const ADVISOR_OPTS = ['Ahmed Al-Rashidi', 'Fatima Hassan', 'Omar Khalid', 'Sara Al-Mutairi'];
const STATION_OPTS = ['Main Workshop', 'Branch A', 'Branch B', 'Branch C'];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const toolbarBtn =
  'inline-flex h-8 min-h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50';
const primaryBtn =
  'inline-flex h-8 min-h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[10px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50';

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

function SectionCard({ title, subtitle, children, accent = false }) {
  return (
    <section
      className="rounded-2xl border bg-white px-4 py-4 shadow-sm"
      style={{
        borderColor: accent ? `${primary}33` : '#e5e7eb',
        boxShadow: accent ? `0 10px 26px -22px ${primary}80` : '0 10px 24px -24px rgba(15,23,42,0.35)',
      }}
    >
      <div className="mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: accent ? primary : '#475569' }}>
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FieldGrid({ children, columns = 'sm:grid-cols-2 xl:grid-cols-4' }) {
  return <div className={`grid gap-2.5 ${columns}`}>{children}</div>;
}

function TextBlock({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="flex min-h-0 w-full flex-col gap-1">
      <label className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="min-h-[82px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 outline-none transition-colors focus:border-slate-400"
        style={{ borderRadius: inputField.box.borderRadius }}
      />
    </div>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</div>
      <div className="mt-1 text-[11px] font-semibold text-slate-700">{value || '-'}</div>
    </div>
  );
}

const makeEmptyState = () => ({
  today: new Date().toISOString().slice(0, 10),
  savedId: null,
  savedStatus: 'OPEN',
  jobCardNo: '',
  regNo: '',
  stationCode: '',
  chassisNo: '',
  customerType: 'CASH',
  vehOwnerName: '',
  customerName: '',
  jobBroughtBy: '',
  driver: '',
  serviceAdvisor: '',
  bookingDate: new Date().toISOString().slice(0, 10),
  promiseDate: new Date().toISOString().slice(0, 10),
  advanceReceived: '',
  invoiceParty: '',
  estimationNo: '',
  estimationAmount: '',
  lpoNo: '',
  claimNo: '',
  kmReading: '',
  lpoDate: new Date().toISOString().slice(0, 10),
  excessAmt: '',
  jobType: 'BODYSHOP',
  customerConcern: '',
  shortDesc: '',
  repeatJob: false,
  jobRefNo: '',
  policeRefNo: '',
  qcPass: false,
  qcDetails: '',
  warrantyDetails: '',
  policeReport: false,
  warrantyRepair: false,
  totalLoss: false,
  jobLines: [],
});

export default function JobCardEntry() {
  const [state, setState] = useState(makeEmptyState());
  const [detailTab, setDetailTab] = useState('commercial');
  const [lineJobCode, setLineJobCode] = useState('');
  const [lineDescription, setLineDescription] = useState('');
  const [lineUnitCost, setLineUnitCost] = useState('');
  const [lineSellingPrice, setLineSellingPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const set = (key) => (e) => setState((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setState((prev) => ({ ...prev, [key]: val }));
  const setDate = (key) => (val) => setState((prev) => ({ ...prev, [key]: val }));
  const toggle = (key) => (val) => setState((prev) => ({ ...prev, [key]: typeof val === 'boolean' ? val : !prev[key] }));

  const handleAddLine = useCallback(() => {
    if (!lineJobCode.trim()) return;
    setState((prev) => ({
      ...prev,
      jobLines: [
        {
          id: `jl-${Date.now()}`,
          jobCode: lineJobCode.trim(),
          description: lineDescription.trim() || '-',
          stdTime: '-',
          cost: lineUnitCost.trim() || '0.00',
          price: lineSellingPrice.trim() || '0.00',
        },
        ...prev.jobLines,
      ],
    }));
    setLineJobCode('');
    setLineDescription('');
    setLineUnitCost('');
    setLineSellingPrice('');
  }, [lineJobCode, lineDescription, lineUnitCost, lineSellingPrice]);

  const handleDeleteLine = useCallback((id) => {
    setState((prev) => ({ ...prev, jobLines: prev.jobLines.filter((r) => r.id !== id) }));
  }, []);

  const reset = useCallback(() => {
    setState(makeEmptyState());
    setDetailTab('commercial');
    setLineJobCode('');
    setLineDescription('');
    setLineUnitCost('');
    setLineSellingPrice('');
    setError('');
    setSuccessMsg('');
  }, []);

  const buildPayload = useCallback(() => ({
    regNo: state.regNo,
    chassisNo: state.chassisNo,
    stationCode: state.stationCode,
    customerType: state.customerType,
    vehOwnerName: state.vehOwnerName,
    customerName: state.customerName,
    jobBroughtBy: state.jobBroughtBy,
    driver: state.driver,
    serviceAdvisor: state.serviceAdvisor,
    bookingDate: state.bookingDate,
    promiseDate: state.promiseDate,
    kmReading: state.kmReading || null,
    jobType: state.jobType,
    estimationNo: state.estimationNo,
    estimationAmount: state.estimationAmount || null,
    lpoNo: state.lpoNo,
    lpoDate: state.lpoDate,
    claimNo: state.claimNo,
    excessAmt: state.excessAmt || null,
    advanceReceived: state.advanceReceived || null,
    invoiceParty: state.invoiceParty,
    customerConcern: state.customerConcern,
    shortDesc: state.shortDesc,
    repeatJob: state.repeatJob,
    jobRefNo: state.jobRefNo,
    policeRefNo: state.policeRefNo,
    policeReport: state.policeReport,
    warrantyRepair: state.warrantyRepair,
    totalLoss: state.totalLoss,
    qcPass: state.qcPass,
    qcDetails: state.qcDetails,
    warrantyDetails: state.warrantyDetails,
    lines: state.jobLines.map((l) => ({
      jobCode: l.jobCode,
      description: l.description,
      stdTime: l.stdTime === '-' ? 0 : Number(l.stdTime) || 0,
      unitCost: Number(l.cost) || 0,
      sellingPrice: Number(l.price) || 0,
    })),
  }), [state]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = buildPayload();
      let result;
      if (state.savedId) {
        result = await updateJobCard(state.savedId, payload);
        setSuccessMsg(`Job Card updated (${result.jcNo})`);
      } else {
        result = await createJobCard(payload);
        setState((prev) => ({ ...prev, savedId: result.id, jobCardNo: result.jcNo, savedStatus: result.status }));
        setSuccessMsg(`Job Card saved (${result.jcNo})`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [buildPayload, state.savedId]);

  const handlePost = useCallback(async () => {
    if (!state.savedId) { setError('Save the job card first before posting.'); return; }
    setPosting(true);
    setError('');
    setSuccessMsg('');
    try {
      const result = await postJobCard(state.savedId);
      setState((prev) => ({ ...prev, savedStatus: result.status }));
      setSuccessMsg(`Job Card posted (${state.jobCardNo})`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Post failed.');
    } finally {
      setPosting(false);
    }
  }, [state.savedId, state.jobCardNo]);

  const handleUnpost = useCallback(async () => {
    if (!state.savedId) { setError('No job card selected.'); return; }
    setPosting(true);
    setError('');
    setSuccessMsg('');
    try {
      const result = await unpostJobCard(state.savedId);
      setState((prev) => ({ ...prev, savedStatus: result.status }));
      setSuccessMsg(`Job Card unposted (${state.jobCardNo})`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unpost failed.');
    } finally {
      setPosting(false);
    }
  }, [state.savedId, state.jobCardNo]);

  const jobTableRows = useMemo(
    () =>
      state.jobLines.map((r, idx) => [
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
    [state.jobLines, handleDeleteLine]
  );

  const isPosted = state.savedStatus === 'POSTED';

  return (
    <div className="flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-4 bg-[#faf8f9] px-3 py-3 sm:px-4 sm:py-4">
      <section
        className="rounded-[26px] border px-4 py-4 shadow-sm"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,246,247,0.98) 100%)',
          borderColor: `${primary}22`,
          boxShadow: `0 18px 50px -34px ${primary}55`,
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold tracking-tight sm:text-[22px]" style={{ color: primary }}>
                Job Card Entry
              </h1>
              {isPosted && (
                <span className="mt-0.5 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-700">
                  Posted
                </span>
              )}
            </div>

            <div className="flex w-full flex-wrap items-center justify-start gap-2 xl:w-auto xl:justify-end">
              <button type="button" className={toolbarBtn} aria-label="Print">
                <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
              </button>
              <button type="button" className={toolbarBtn} onClick={handlePost} disabled={posting || isPosted} aria-label="Post">
                <img src={PostIcon} alt="" className="h-3.5 w-3.5" />
                {posting ? '…' : 'Post'}
              </button>
              <button type="button" className={toolbarBtn} onClick={handleUnpost} disabled={posting || !isPosted} aria-label="Unpost">
                <img src={UnpostIcon} alt="" className="h-3.5 w-3.5" />
                Unpost
              </button>
              <button type="button" className={toolbarBtn} onClick={reset} aria-label="Delete">
                <img src={DeleteIcon} alt="" className="h-3.5 w-3.5" />
                Delete
              </button>
              <button type="button" className={toolbarBtn} onClick={handleSave} disabled={saving} aria-label="Save">
                <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className={primaryBtn}
                style={{ backgroundColor: primary, borderColor: primary }}
                onClick={reset}
                aria-label="New job card"
              >
                <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
                New Job Card
              </button>
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">{error}</div>
          )}
          {successMsg && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[10px] text-green-700">{successMsg}</div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryPill label="Job Card No" value={state.jobCardNo || 'Auto'} />
            <SummaryPill label="Reg No" value={state.regNo || 'Pending'} />
            <SummaryPill label="Customer" value={state.customerName || state.vehOwnerName || 'Not selected'} />
            <SummaryPill label="Advisor" value={state.serviceAdvisor || 'Unassigned'} />
            <SummaryPill label="Booking" value={state.bookingDate} />
            <SummaryPill label="Job Lines" value={`${state.jobLines.length} items`} />
          </div>
        </div>
      </section>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <SectionCard title="Core Intake" subtitle="Keep the high-frequency intake fields always visible for fast job creation." accent>
              <FieldGrid columns="sm:grid-cols-2 xl:grid-cols-5">
                <SubInputField label="Job Card No" value={state.jobCardNo} onChange={set('jobCardNo')} placeholder="Auto" />
                <SubInputField label="Reg. No." value={state.regNo} onChange={set('regNo')} placeholder="Reg. no." />
                <DropdownInput label="Station Code" value={state.stationCode} onChange={setDrop('stationCode')} options={STATION_OPTS} placeholder="Select station" />
                <SubInputField label="Chassis No" value={state.chassisNo} onChange={set('chassisNo')} placeholder="Chassis no." />
                <DropdownInput label="Customer Type" value={state.customerType} onChange={setDrop('customerType')} options={CUSTOMER_TYPES} placeholder="Select type" />
                <SubInputField label="Veh. Owner Name" value={state.vehOwnerName} onChange={set('vehOwnerName')} placeholder="Owner name" widthPx={140} />
                <SubInputField label="Customer Name" value={state.customerName} onChange={set('customerName')} placeholder="Customer name" widthPx={140} />
                <DropdownInput label="Job Brought By" value={state.jobBroughtBy} onChange={setDrop('jobBroughtBy')} options={JOB_BROUGHT_BY_OPTS} placeholder="Select" />
                <DropdownInput label="Driver" value={state.driver} onChange={setDrop('driver')} options={DRIVER_OPTS} placeholder="Select driver" />
                <DropdownInput label="Service Advisor" value={state.serviceAdvisor} onChange={setDrop('serviceAdvisor')} options={ADVISOR_OPTS} placeholder="Select advisor" />
              </FieldGrid>
            </SectionCard>

            <SectionCard title="Quick Timing" subtitle="Dates and immediate workshop readiness details that matter during intake.">
              <FieldGrid columns="sm:grid-cols-2 xl:grid-cols-2">
                <DateInputField label="Booking Date" value={state.bookingDate} onChange={setDate('bookingDate')} />
                <DateInputField label="Promise Date" value={state.promiseDate} onChange={setDate('promiseDate')} />
                <SubInputField label="KM Reading (IN)" value={state.kmReading} onChange={set('kmReading')} placeholder="KM" inputMode="numeric" />
                <DropdownInput label="Job Type" value={state.jobType} onChange={setDrop('jobType')} options={JOB_TYPES} placeholder="Select type" />
              </FieldGrid>
            </SectionCard>
          </div>

          <div className="min-w-0">
            <TabsBar
              activeTab={detailTab}
              onChange={setDetailTab}
              tabs={[
                { id: 'commercial', label: 'Commercial' },
                { id: 'concern', label: 'Concern & Flags' },
                { id: 'jobs', label: 'Job Lines' },
                { id: 'qc', label: 'QC / Warranty' },
              ]}
            />

            <div className="mt-3">
              {detailTab === 'commercial' && (
                <SectionCard title="Commercial and Claim Details" subtitle="Insurance, claim, LPO, and commercial values grouped together.">
                  <FieldGrid columns="sm:grid-cols-2 xl:grid-cols-4">
                    <SubInputField label="Estimation No" value={state.estimationNo} onChange={set('estimationNo')} placeholder="Est. no." />
                    <SubInputField label="Estimation Amount" value={state.estimationAmount} onChange={set('estimationAmount')} placeholder="0.00" inputMode="decimal" widthPx={110} />
                    <SubInputField label="LPO No." value={state.lpoNo} onChange={set('lpoNo')} placeholder="LPO no." />
                    <SubInputField label="Claim No." value={state.claimNo} onChange={set('claimNo')} placeholder="Claim no." />
                    <DateInputField label="LPO Date" value={state.lpoDate} onChange={setDate('lpoDate')} />
                    <SubInputField label="Excess Amt." value={state.excessAmt} onChange={set('excessAmt')} placeholder="0.00" inputMode="decimal" />
                    <SubInputField label="Advance Received" value={state.advanceReceived} onChange={set('advanceReceived')} placeholder="0.00" inputMode="decimal" />
                    <SubInputField label="Invoice Party" value={state.invoiceParty} onChange={set('invoiceParty')} placeholder="Invoice party" widthPx={120} />
                  </FieldGrid>
                </SectionCard>
              )}

              {detailTab === 'concern' && (
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
                  <SectionCard title="Complaint and Internal Notes" subtitle="Customer language first, internal summary second.">
                    <div className="grid gap-3 lg:grid-cols-2">
                      <TextBlock
                        label="Customer Concern"
                        value={state.customerConcern}
                        onChange={set('customerConcern')}
                        placeholder="Describe customer concern..."
                      />
                      <TextBlock
                        label="Short Desc."
                        value={state.shortDesc}
                        onChange={set('shortDesc')}
                        placeholder="Short internal summary..."
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Flags and References" subtitle="Repeat-job handling and special status indicators.">
                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Repeat Handling</div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Switch checked={state.repeatJob} onChange={toggle('repeatJob')} description="Repeat Job" size="sm" />
                          <div className="min-w-[150px] flex-1">
                            <SubInputField
                              label="Job Ref. No."
                              value={state.jobRefNo}
                              onChange={set('jobRefNo')}
                              placeholder="Ref. no."
                              disabled={!state.repeatJob}
                              className={!state.repeatJob ? 'cursor-not-allowed opacity-40' : ''}
                            />
                          </div>
                        </div>
                      </div>

                      <SubInputField label="Police Reff. No" value={state.policeRefNo} onChange={set('policeRefNo')} placeholder="Police ref." />

                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Status Flags</div>
                        <div className="flex flex-col gap-2">
                          <Switch checked={state.policeReport} onChange={toggle('policeReport')} description="Police Report" size="sm" />
                          <Switch checked={state.warrantyRepair} onChange={toggle('warrantyRepair')} description="Warranty Repair" size="sm" />
                          <Switch checked={state.totalLoss} onChange={toggle('totalLoss')} description="Total Loss" size="sm" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {detailTab === 'jobs' && (
                <SectionCard title="Job Description Entry" subtitle="Keep labor and pricing entry close to the table for faster additions." accent>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[0.85fr_1.3fr_0.9fr_0.9fr_auto]">
                        <SubInputField label="Job Code" value={lineJobCode} onChange={(e) => setLineJobCode(e.target.value)} placeholder="Code" />
                        <SubInputField
                          label="Job Description"
                          value={lineDescription}
                          onChange={(e) => setLineDescription(e.target.value)}
                          placeholder="Description"
                          widthPx={160}
                        />
                        <SubInputField
                          label="Unit Cost"
                          value={lineUnitCost}
                          onChange={(e) => setLineUnitCost(e.target.value)}
                          placeholder="0.00"
                          inputMode="decimal"
                        />
                        <SubInputField
                          label="Selling Price"
                          value={lineSellingPrice}
                          onChange={(e) => setLineSellingPrice(e.target.value)}
                          placeholder="0.00"
                          inputMode="decimal"
                        />
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleAddLine}
                            className="inline-flex h-[32px] min-h-[32px] w-full items-center justify-center rounded-xl border px-3 text-[10px] font-semibold text-white sm:w-auto"
                            style={{ backgroundColor: primary, borderColor: primary }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>

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
                </SectionCard>
              )}

              {detailTab === 'qc' && (
                <SectionCard title="QC and Warranty Review" subtitle="Validation, repair flags, and service review notes.">
                  <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr_1fr]">
                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <Switch checked={state.qcPass} onChange={toggle('qcPass')} description="QC Pass" size="sm" />
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Repair Flags</div>
                        <div className="flex flex-col gap-2">
                          <Switch checked={state.policeReport} onChange={toggle('policeReport')} description="Police Report" size="sm" />
                          <Switch checked={state.warrantyRepair} onChange={toggle('warrantyRepair')} description="Warranty Repair" size="sm" />
                          <Switch checked={state.totalLoss} onChange={toggle('totalLoss')} description="Total Loss" size="sm" />
                        </div>
                      </div>
                    </div>
                    <TextBlock
                      label="QC Details"
                      value={state.qcDetails}
                      onChange={set('qcDetails')}
                      placeholder="QC observations..."
                      rows={5}
                    />
                    <TextBlock
                      label="Warranty Details"
                      value={state.warrantyDetails}
                      onChange={set('warrantyDetails')}
                      placeholder="Warranty notes..."
                      rows={5}
                    />
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
