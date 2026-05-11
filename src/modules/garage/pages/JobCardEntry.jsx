import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, SubInputField, DateInputField, Switch, CommonTable } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import { createJobCard, updateJobCard, postJobCard, unpostJobCard, getJobCard } from '../api/jobCard.api';
import { getSessionCompany } from '../../../core/auth/auth.service.js';
import CustomerPicker from '../../../shared/components/ui/CustomerPicker';
import VehiclePicker from '../../../shared/components/ui/VehiclePicker';

const primary = colors.primary?.main || '#790728';
const primaryTint = colors.primary?.[50] || '#F2E6EA';

const JOB_TABLE_COLS = [5, 14, 28, 13, 13, 13, 14];
const JOB_CARD_FIELD_HEIGHT = 32;
const JOB_CARD_RADIUS = 6;
const jobCardLabelClass =
  'flex h-4 items-center truncate text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-500';
const jobCardInputClass =
  'rounded-md px-2.5 text-[11px] font-semibold text-slate-800 placeholder:text-slate-400';
const jobCardControlStyle = {
  borderRadius: JOB_CARD_RADIUS,
  background: '#fff',
  borderColor: '#dbe3ee',
};

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
      className="rounded-lg border bg-white px-4 py-3 shadow-sm"
      style={{
        borderColor: accent ? `${primary}33` : '#e5e7eb',
        boxShadow: accent ? `0 10px 24px -24px ${primary}80` : '0 10px 22px -24px rgba(15,23,42,0.35)',
      }}
    >
      <div className="mb-2.5">
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
  return <div className={`grid items-start gap-2.5 ${columns}`}>{children}</div>;
}

function TextBlock({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="flex min-h-0 w-full flex-col gap-1">
      <label className={jobCardLabelClass}>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="min-h-[78px] w-full resize-y rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold leading-5 text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
        style={{ borderRadius: JOB_CARD_RADIUS }}
      />
    </div>
  );
}

function JobCardInput({ fullWidth = true, heightPx = JOB_CARD_FIELD_HEIGHT, className = '', ...props }) {
  return (
    <SubInputField
      fullWidth={fullWidth}
      heightPx={heightPx}
      labelClassName={jobCardLabelClass}
      className={`${jobCardInputClass} ${className}`.trim()}
      inputStyle={jobCardControlStyle}
      {...props}
    />
  );
}

function JobCardDropdown({ fullWidth = true, heightPx = JOB_CARD_FIELD_HEIGHT, className = '', ...props }) {
  return (
    <DropdownInput
      fullWidth={fullWidth}
      heightPx={heightPx}
      labelClassName={jobCardLabelClass}
      className={`${jobCardInputClass} ${className}`.trim()}
      boxStyle={jobCardControlStyle}
      {...props}
    />
  );
}

function JobCardDate({ fullWidth = true, heightPx = JOB_CARD_FIELD_HEIGHT, className = '', ...props }) {
  return (
    <DateInputField
      fullWidth={fullWidth}
      heightPx={heightPx}
      labelClassName={jobCardLabelClass}
      className={`${jobCardInputClass} ${className}`.trim()}
      inputStyle={jobCardControlStyle}
      {...props}
    />
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="flex min-h-[50px] flex-col justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
      <div className="truncate text-[8px] font-bold uppercase leading-3 tracking-[0.15em] text-slate-400">{label}</div>
      <div className="mt-1 truncate text-[11px] font-semibold leading-4 text-slate-700">{value || '-'}</div>
    </div>
  );
}

function QuickSetupPanel({ state, set, setDrop, setDate, setState }) {
  const promiseShortcuts = [
    { label: '+1d', days: 1 },
    { label: '+3d', days: 3 },
    { label: '+1w', days: 7 },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-800">Quick Setup</h2>
            <p className="mt-1 text-[9px] font-medium text-slate-400">Front desk controls</p>
          </div>
          <span
            className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-2 text-[9px] font-bold uppercase"
            style={{ backgroundColor: primaryTint, color: primary }}
          >
            {state.savedStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4">
        <JobTypeGrid value={state.jobType} onChange={setDrop('jobType')} />
        <AdvisorChips value={state.serviceAdvisor} onChange={setDrop('serviceAdvisor')} />

        <div className="grid gap-2.5">
          <FieldGrid columns="grid-cols-2">
            <JobCardDate label="Booking Date" value={state.bookingDate} onChange={setDate('bookingDate')} />
            <JobCardInput label="KM Reading (IN)" value={state.kmReading} onChange={set('kmReading')} placeholder="KM" inputMode="numeric" />
          </FieldGrid>

          <div className="grid gap-1">
            <JobCardDate label="Promise Date" value={state.promiseDate} onChange={setDate('promiseDate')} />
            <div className="grid grid-cols-3 gap-1.5">
              {promiseShortcuts.map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, promiseDate: addDaysIso(prev.bookingDate || prev.promiseDate, days) }))}
                  className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-white text-[9px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <div className="flex min-h-[52px] flex-col justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
            <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Status</div>
            <div className="mt-1 text-[12px] font-bold text-slate-800">{state.savedStatus}</div>
          </div>
          <div className="flex min-h-[52px] flex-col justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
            <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Lines</div>
            <div className="mt-1 text-[12px] font-bold text-slate-800">{state.jobLines.length} items</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChoicePills({ label, options, value, onChange, compact = false }) {
  return (
    <div className="min-w-0">
      <div className={jobCardLabelClass}>{label}</div>
      <div className="mt-1 flex min-h-8 flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`${compact ? 'h-7 px-2 text-[9px]' : 'h-8 px-3 text-[10px]'} inline-flex items-center rounded-md border font-bold transition-colors`}
              style={{
                backgroundColor: active ? primary : '#fff',
                borderColor: active ? primary : '#e2e8f0',
                color: active ? '#fff' : '#475569',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function JobTypeGrid({ value, onChange }) {
  return (
    <div>
      <div className={jobCardLabelClass}>Job Type</div>
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {JOB_TYPES.map((type) => {
          const active = type === value;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className="min-h-[30px] rounded-md border px-2 text-[8px] font-bold transition-colors"
              style={{
                backgroundColor: active ? primary : '#fff',
                borderColor: active ? primary : '#e2e8f0',
                color: active ? '#fff' : '#475569',
              }}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdvisorChips({ value, onChange }) {
  return (
    <div>
      <div className={jobCardLabelClass}>Service Advisor</div>
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {ADVISOR_OPTS.map((advisor) => {
          const active = advisor === value;
          const initials = advisor.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
          return (
            <button
              key={advisor}
              type="button"
              onClick={() => onChange(advisor)}
              className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md border bg-white px-1.5 text-[9px] font-bold transition-colors"
              style={{
                backgroundColor: active ? primaryTint : '#fff',
                borderColor: active ? primary : '#e2e8f0',
                color: active ? primary : '#475569',
              }}
            >
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[7px]"
                style={{ backgroundColor: active ? primary : '#f1f5f9', color: active ? '#fff' : '#64748b' }}
              >
                {initials}
              </span>
              <span className="truncate">{advisor.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompactDetailsAccordion({ title, subtitle, status, open, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold"
            style={{ backgroundColor: open ? primaryTint : '#f8fafc', color: open ? primary : '#64748b' }}
          >
            {open ? '-' : '+'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">{title}</span>
            <span className="mt-0.5 block truncate text-[9px] text-slate-400">{subtitle}</span>
          </span>
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]"
          style={{
            backgroundColor: status === 'Filled' ? '#dcfce7' : '#f1f5f9',
            color: status === 'Filled' ? '#15803d' : '#64748b',
          }}
        >
          {status}
        </span>
      </button>
      {open ? <div className="border-t border-slate-100 px-4 py-4">{children}</div> : null}
    </section>
  );
}

function addDaysIso(dateValue, days) {
  const base = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(base.getTime())) return new Date().toISOString().slice(0, 10);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

const makeEmptyState = () => ({
  today: new Date().toISOString().slice(0, 10),
  savedId: null,
  savedStatus: 'OPEN',
  jobCardNo: '',
  vehicleId: null,
  estimationId: null,
  regNo: '',
  stationCode: '',
  chassisNo: '',
  customerType: 'CASH',
  customerId: null,
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

function isoToDate(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? new Date().toISOString().slice(0, 10) : dt.toISOString().slice(0, 10);
}

function apiToState(data) {
  const card = data.jobCard || data;
  const lines = (data.lines || card.lines || []).map((l) => ({
    id: l.id ? String(l.id) : `jl-${Date.now()}-${Math.random()}`,
    jobCode: l.jobCode || '',
    description: l.description || '-',
    stdTime: l.stdTime != null ? String(l.stdTime) : '-',
    cost: String(l.unitCost ?? l.cost ?? 0),
    price: String(l.sellingPrice ?? l.price ?? 0),
  }));
  return {
    savedId: card.id,
    savedStatus: card.status || 'OPEN',
    jobCardNo: card.jcNo || '',
    vehicleId: card.vehicleId || null,
    estimationId: card.estimationId || null,
    regNo: card.regNo || '',
    stationCode: card.stationCode || '',
    chassisNo: card.chassisNo || '',
    customerType: card.customerType || 'CASH',
    customerId: card.customerId || null,
    vehOwnerName: card.vehOwnerName || '',
    customerName: card.customerName || '',
    jobBroughtBy: card.jobBroughtBy || '',
    driver: card.driver || '',
    serviceAdvisor: card.serviceAdvisor || '',
    bookingDate: isoToDate(card.bookingDate),
    promiseDate: isoToDate(card.promiseDate),
    kmReading: card.kmReadingIn != null ? String(card.kmReadingIn) : '',
    jobType: card.jobType || 'BODYSHOP',
    estimationNo: card.estimationNo || '',
    estimationAmount: card.estimationAmount != null ? String(card.estimationAmount) : '',
    lpoNo: card.lpoNo || '',
    lpoDate: isoToDate(card.lpoDate),
    claimNo: card.claimNo || '',
    excessAmt: card.excessAmt != null ? String(card.excessAmt) : '',
    advanceReceived: card.advanceReceived != null ? String(card.advanceReceived) : '',
    invoiceParty: card.invoiceParty || '',
    customerConcern: card.customerConcern || '',
    shortDesc: card.shortDesc || '',
    repeatJob: !!card.repeatJob,
    jobRefNo: card.jobRefNo || '',
    policeRefNo: card.policeRefNo || '',
    policeReport: !!card.policeReport,
    warrantyRepair: !!card.warrantyRepair,
    totalLoss: !!card.totalLoss,
    qcPass: !!card.qcPass,
    qcDetails: card.qcDetails || '',
    warrantyDetails: card.warrantyDetails || '',
    jobLines: lines,
    today: new Date().toISOString().slice(0, 10),
  };
}

export default function JobCardEntry() {
  const [state, setState] = useState(() => {
    const company = getSessionCompany();
    return { ...makeEmptyState(), stationCode: company?.stationName || '' };
  });
  const [lineJobCode, setLineJobCode] = useState('');
  const [lineDescription, setLineDescription] = useState('');
  const [lineUnitCost, setLineUnitCost] = useState('');
  const [lineSellingPrice, setLineSellingPrice] = useState('');
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [openPanels, setOpenPanels] = useState({
    commercial: false,
    flags: false,
    qc: false,
  });

  const [searchParams] = useSearchParams();
  const urlId = searchParams.get('id');

  useEffect(() => {
    if (!urlId) return;
    let cancelled = false;
    (async () => {
      setLoadingRecord(true);
      setError('');
      setSuccessMsg('');
      try {
        const data = await getJobCard(urlId);
        if (!cancelled) {
          setState(apiToState(data));
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load job card.');
      } finally {
        if (!cancelled) setLoadingRecord(false);
      }
    })();
    return () => { cancelled = true; };
  }, [urlId]);

  const set = (key) => (e) => setState((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setState((prev) => ({ ...prev, [key]: val }));
  const setDate = (key) => (val) => setState((prev) => ({ ...prev, [key]: val }));
  const toggle = (key) => (val) => setState((prev) => ({ ...prev, [key]: typeof val === 'boolean' ? val : !prev[key] }));
  const togglePanel = (key) => () => setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));

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
    const company = getSessionCompany();
    setState({ ...makeEmptyState(), stationCode: company?.stationName || '' });
    setLineJobCode('');
    setLineDescription('');
    setLineUnitCost('');
    setLineSellingPrice('');
    setError('');
    setSuccessMsg('');
  }, []);

  const buildPayload = useCallback(() => ({
    regNo: state.regNo,
    vehicleId: state.vehicleId || null,
    estimationId: state.estimationId || null,
    chassisNo: state.chassisNo,
    stationCode: state.stationCode,
    customerType: state.customerType,
    vehOwnerName: state.vehOwnerName,
    customerId: state.customerId || null,
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
    if (!state.regNo.trim()) { setError('Reg. No. is required.'); return; }
    if (!state.customerName.trim() && !state.customerId) { setError('Customer Name is required.'); return; }
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
  }, [buildPayload, state.savedId, state.regNo, state.customerName, state.customerId]);

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

  const commercialFilled = Boolean(
    state.estimationNo || state.estimationAmount || state.lpoNo || state.claimNo ||
    state.excessAmt || state.advanceReceived || state.invoiceParty
  );
  const flagsFilled = Boolean(
    state.repeatJob || state.jobRefNo || state.policeRefNo ||
    state.policeReport || state.warrantyRepair || state.totalLoss
  );
  const qcFilled = Boolean(state.qcPass || state.qcDetails || state.warrantyDetails);

  const isPosted = state.savedStatus === 'POSTED';

  return (
    <div className="flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 bg-[#faf8f9] px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
      <section
        className="rounded-lg border px-4 py-4 shadow-sm"
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
          {loadingRecord && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-700">Loading job card…</div>
          )}
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
        <div className="grid min-w-0 gap-3 rounded-lg border border-slate-200/80 bg-white/70 p-3 shadow-sm xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-3">
            <SectionCard title="Vehicle and Customer" subtitle="Start with registration, then confirm customer and intake details." accent>
              <div className="grid gap-3">
                <div className="grid gap-3 lg:grid-cols-[1.25fr_1.05fr_0.85fr]">
                  <div className="flex min-w-0 flex-col gap-1">
                    <label className={jobCardLabelClass} style={{ color: primary }}>Reg. No. *</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={state.regNo}
                        onChange={set('regNo')}
                        onKeyDown={(e) => { if (e.key === 'Enter') setVehiclePickerOpen(true); }}
                        placeholder="Reg. no."
                        className="box-border h-8 min-w-0 flex-1 rounded-md border bg-white px-2.5 text-[12px] font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
                        style={{ borderColor: `${primary}66` }}
                      />
                      <button
                        type="button"
                        onClick={() => setVehiclePickerOpen(true)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        title="Search vehicle"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <label className={jobCardLabelClass}>Customer Name *</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={state.customerName}
                        onChange={set('customerName')}
                        placeholder="Customer name"
                        className="box-border h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomerPickerOpen(true)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        title="Search customer"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </button>
                    </div>
                  </div>

                  <JobCardInput label="Job Card No" value={state.jobCardNo} onChange={set('jobCardNo')} placeholder="Auto" />
                </div>

                <ChoicePills label="Customer Type" options={CUSTOMER_TYPES} value={state.customerType} onChange={setDrop('customerType')} compact />

                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="grid items-end gap-2.5 md:grid-cols-2 xl:grid-cols-[1.1fr_0.8fr_1fr_1fr_1fr]">
                    <JobCardDropdown
                      label="Station Code"
                      value={state.stationCode}
                      onChange={setDrop('stationCode')}
                      options={STATION_OPTS}
                      placeholder="Select station"
                    />
                    <JobCardInput
                      label="Chassis No"
                      value={state.chassisNo}
                      onChange={set('chassisNo')}
                      placeholder="Chassis no."
                    />
                    <JobCardInput
                      label="Veh. Owner Name"
                      value={state.vehOwnerName}
                      onChange={set('vehOwnerName')}
                      placeholder="Owner name"
                    />
                    <JobCardDropdown
                      label="Job Brought By"
                      value={state.jobBroughtBy}
                      onChange={setDrop('jobBroughtBy')}
                      options={JOB_BROUGHT_BY_OPTS}
                      placeholder="Select"
                    />
                    <JobCardDropdown
                      label="Driver"
                      value={state.driver}
                      onChange={setDrop('driver')}
                      options={DRIVER_OPTS}
                      placeholder="Select driver"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Customer Concern" subtitle="Capture the customer's words before they are forgotten.">
              <div className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
                <TextBlock
                  label="Customer Concern"
                  value={state.customerConcern}
                  onChange={set('customerConcern')}
                  placeholder="Describe customer concern..."
                  rows={3}
                />
                <TextBlock
                  label="Short Desc."
                  value={state.shortDesc}
                  onChange={set('shortDesc')}
                  placeholder="Short internal summary..."
                  rows={3}
                />
              </div>
            </SectionCard>

            <SectionCard title="Job Description Entry" subtitle="Press Enter in Selling Price to add the line." accent>
              <div className="grid gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[0.8fr_1.4fr_0.8fr_0.8fr_auto]">
                    <JobCardInput label="Job Code" value={lineJobCode} onChange={(e) => setLineJobCode(e.target.value)} placeholder="Code" />
                    <JobCardInput
                      label="Job Description"
                      value={lineDescription}
                      onChange={(e) => setLineDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <JobCardInput
                      label="Unit Cost"
                      value={lineUnitCost}
                      onChange={(e) => setLineUnitCost(e.target.value)}
                      placeholder="0.00"
                      inputMode="decimal"
                    />
                    <JobCardInput
                      label="Selling Price"
                      value={lineSellingPrice}
                      onChange={(e) => setLineSellingPrice(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddLine(); }}
                      placeholder="0.00"
                      inputMode="decimal"
                    />
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddLine}
                        className="inline-flex h-[32px] min-h-[32px] w-full items-center justify-center rounded-md border px-3 text-[10px] font-semibold text-white sm:w-auto"
                        style={{ backgroundColor: primary, borderColor: primary }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[210px] overflow-y-auto rounded-lg border border-slate-100 bg-white">
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
              </div>
            </SectionCard>
          </div>

          <aside className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-0 xl:self-start">
            <QuickSetupPanel state={state} set={set} setDrop={setDrop} setDate={setDate} setState={setState} />
          </aside>

          <div className="grid gap-3 xl:col-span-2">
            <div className="px-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">More Details</div>
              <div className="mt-0.5 text-[9px] text-slate-400">Commercial, claim, flags, QC, and warranty information.</div>
            </div>

            <CompactDetailsAccordion
              title="Commercial and Claim Details"
              subtitle="Estimation, LPO, claim, excess, advance, and invoice party."
              status={commercialFilled ? 'Filled' : 'Empty'}
              open={openPanels.commercial}
              onToggle={togglePanel('commercial')}
            >
              <FieldGrid columns="sm:grid-cols-2 xl:grid-cols-4">
                <JobCardInput label="Estimation No" value={state.estimationNo} onChange={set('estimationNo')} placeholder="Est. no." />
                <JobCardInput label="Estimation Amount" value={state.estimationAmount} onChange={set('estimationAmount')} placeholder="0.00" inputMode="decimal" />
                <JobCardInput label="LPO No." value={state.lpoNo} onChange={set('lpoNo')} placeholder="LPO no." />
                <JobCardDate label="LPO Date" value={state.lpoDate} onChange={setDate('lpoDate')} />
                <JobCardInput label="Claim No." value={state.claimNo} onChange={set('claimNo')} placeholder="Claim no." />
                <JobCardInput label="Excess Amt." value={state.excessAmt} onChange={set('excessAmt')} placeholder="0.00" inputMode="decimal" />
                <JobCardInput label="Advance Received" value={state.advanceReceived} onChange={set('advanceReceived')} placeholder="0.00" inputMode="decimal" />
                <JobCardInput label="Invoice Party" value={state.invoiceParty} onChange={set('invoiceParty')} placeholder="Invoice party" />
              </FieldGrid>
            </CompactDetailsAccordion>

            <CompactDetailsAccordion
              title="Flags and References"
              subtitle="Repeat jobs, police reference, and special repair flags."
              status={flagsFilled ? 'Filled' : 'Empty'}
              open={openPanels.flags}
              onToggle={togglePanel('flags')}
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className={jobCardLabelClass}>Repeat Handling</div>
                  <div className="mt-2 flex flex-col gap-2">
                    <Switch checked={state.repeatJob} onChange={toggle('repeatJob')} description="Repeat Job" size="sm" />
                    <JobCardInput
                      label="Job Ref. No."
                      value={state.jobRefNo}
                      onChange={set('jobRefNo')}
                      placeholder="Ref. no."
                      disabled={!state.repeatJob}
                      className={!state.repeatJob ? 'cursor-not-allowed opacity-40' : ''}
                    />
                  </div>
                </div>
                <JobCardInput label="Police Reff. No" value={state.policeRefNo} onChange={set('policeRefNo')} placeholder="Police ref." />
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className={jobCardLabelClass}>Status Flags</div>
                  <div className="mt-2 flex flex-col gap-2">
                    <Switch checked={state.policeReport} onChange={toggle('policeReport')} description="Police Report" size="sm" />
                    <Switch checked={state.warrantyRepair} onChange={toggle('warrantyRepair')} description="Warranty Repair" size="sm" />
                    <Switch checked={state.totalLoss} onChange={toggle('totalLoss')} description="Total Loss" size="sm" />
                  </div>
                </div>
              </div>
            </CompactDetailsAccordion>

            <CompactDetailsAccordion
              title="QC and Warranty Review"
              subtitle="QC pass, QC notes, and warranty notes."
              status={qcFilled ? 'Filled' : 'Empty'}
              open={openPanels.qc}
              onToggle={togglePanel('qc')}
            >
              <div className="grid gap-4 xl:grid-cols-[0.7fr_1fr_1fr]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <Switch checked={state.qcPass} onChange={toggle('qcPass')} description="QC Pass" size="sm" />
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
            </CompactDetailsAccordion>
          </div>
        </div>
      </div>

      <CustomerPicker
        open={customerPickerOpen}
        onClose={() => setCustomerPickerOpen(false)}
        allowCreate
        onSelect={(c) => {
          setState((prev) => ({
            ...prev,
            customerId: c.customerId,
            customerName: c.customerName,
            vehOwnerName: prev.vehOwnerName || c.customerName,
          }));
        }}
      />

      <VehiclePicker
        open={vehiclePickerOpen}
        onClose={() => setVehiclePickerOpen(false)}
        onSelect={(v) => {
          setState((prev) => ({
            ...prev,
            regNo: v.regNo || prev.regNo,
            vehicleId: v.vehicleId ?? prev.vehicleId,
            chassisNo: v.chassisNo || prev.chassisNo,
            customerId: v.customerId ?? prev.customerId,
            customerName: v.linkedCustomerName || prev.customerName,
            vehOwnerName: prev.vehOwnerName || v.linkedCustomerName || '',
          }));
        }}
      />
    </div>
  );
}
