import React, { useState } from 'react';
import CommonTable from '../../../shared/components/ui/CommonTable';
import TabsBar from '../../../shared/components/ui/TabsBar';
import DatePickerInput from '../../../shared/components/ui/DatePickerInput';
import { colors } from '../../../shared/constants/theme';

const primary  = colors.primary?.main  || '#790728';
const gradient = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';

const softBtn    = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-[3px] text-[10px] font-semibold leading-5 text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50';
const primaryBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-md border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const STATUS_COLORS = {
  Open:          { bg: '#dcfce7', text: '#15803d', dot: '#16a34a', border: '#86efac' },
  Closed:        { bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626', border: '#fca5a5' },
  'In Progress': { bg: '#dbeafe', text: '#1d4ed8', dot: '#2563eb', border: '#93c5fd' },
  Pending:       { bg: '#fef9c3', text: '#a16207', dot: '#ca8a04', border: '#fde047' },
};

const ACTION_TABS = [
  { key: 'refresh',      label: 'Refresh',       iconOnly: true, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
  { key: 'editJobcard',  label: 'Edit Jobcard',  iconOnly: true, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { key: 'estimation',   label: 'Estimation',    icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { key: 'spareParts',   label: 'Spare Parts',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
  { key: 'lubricants',   label: 'Lubricants',    icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 5-5 13-5 13S7 12 7 7a5 5 0 0 1 5-5z"/></svg> },
  { key: 'consumables',  label: 'Consumables',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
  { key: 'sublet',       label: 'Sublet',        icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
  { key: 'timeRegister', label: 'Time Register', icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: 'lpoDetails',   label: 'LPO Details',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { key: 'discount',     label: 'Discount',      icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><line x1="5" y1="19" x2="19" y2="5"/></svg> },
  { key: 'printBarcode', label: 'Print Barcode', icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="4" height="14"/><rect x="8" y="5" width="2" height="14"/><rect x="12" y="5" width="4" height="14"/><rect x="18" y="5" width="4" height="14"/></svg> },
  { key: 'invoice',      label: 'Invoice',       iconOnly: true, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H5a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2h-4"/><polyline points="9 2 9 8 15 8 15 2"/></svg> },
  { key: 'vehDelivery',  label: 'Veh. Delivery', iconOnly: true, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { key: 'jobHistory',   label: 'Job History',   iconOnly: true, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 0 .5-4"/><polyline points="3 3 3 7 7 7"/></svg> },
  { key: 'picture',      label: 'Picture',       iconOnly: true, icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
];

function Field({ label, value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <div className="flex flex-col gap-0.5" style={{ minWidth: 150, maxWidth: 200, flex: '1 1 160px' }}>
      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        readOnly={readOnly}
        className="h-7 w-full rounded border border-gray-200 bg-gray-50 px-2 text-[10px] font-medium text-gray-800 outline-none transition focus:border-gray-300 focus:bg-white focus:shadow-sm"
      />
    </div>
  );
}

function NoteArea({ label, icon, value, onChange, placeholder, accentColor }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2" style={{ background: `${accentColor}0a` }}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ background: `${accentColor}18`, color: accentColor }}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>{label}</span>
      </div>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4}
        className="w-full resize-none bg-transparent p-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-300" />
    </div>
  );
}

function QuickStat({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: `${primary}14`, color: primary }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="truncate text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function GarageHome() {
  const [activeTab,  setActiveTab]  = useState('refresh');
  const [sectionTab, setSectionTab] = useState('customer');

  const [jobNo,         setJobNo]         = useState('12');
  const [barCode,       setBarCode]       = useState('3010000164845');
  const [regNo,         setRegNo]         = useState('45026');
  const [jobStatus]                       = useState('Open');

  const [custCode,      setCustCode]      = useState('CUST5');
  const [custName,      setCustName]      = useState('MBK SECURITIES');
  const [phoneNo,       setPhoneNo]       = useState('+971-554339130');
  const [contactPerson, setContactPerson] = useState('MBK SECURITIES');

  const [stationCode,   setStationCode]   = useState('');
  const [engineNo,      setEngineNo]      = useState('');
  const [chassisNo,     setChassissNo]    = useState('');
  const [plateColour,   setPlateColour]   = useState('RED');

  const [estimationNo,  setEstimationNo]  = useState('');
  const [lpoNo,         setLpoNo]         = useState('');
  const [lpoDate,       setLpoDate]       = useState('2025-07-06');
  const [claimNo,       setClaimNo]       = useState('');
  const [excessAmt,     setExcessAmt]     = useState('0');

  const [bookingDate,   setBookingDate]   = useState('06/07/2025 15:26');
  const [promiseDate,   setPromiseDate]   = useState('06/07/2025 15:26');
  const [kitReading,    setKitReading]    = useState('42440');
  const [kitOut,        setKitOut]        = useState('0');
  const [deliveryDriver,setDeliveryDriver]= useState('');
  const [deliveryDate,  setDeliveryDate]  = useState('01/01/1900 00:00');

  const [followUps,     setFollowUps]     = useState('');
  const [custConcerns,  setCustConcerns]  = useState('GG');

  const [jobDesc] = useState([
    { code: '01', description: 'ENGINE OIL AND FILTER (10000 KM) CHANGING . AIR FILTER CLEANING WITH PARTS AND LABOUR CHARGES' },
    { code: '02', description: 'BRAKE PAD REPLACEMENT (FRONT & REAR) WITH INSPECTION AND LABOUR CHARGES' },
    { code: '03', description: 'TRANSMISSION FLUID FLUSH AND REFILL WITH OEM SPECIFICATION FLUID' },
    { code: '04', description: 'COOLANT FLUSH AND RADIATOR CLEANING WITH PRESSURE TEST' },
    { code: '05', description: 'SPARK PLUG REPLACEMENT (ALL CYLINDERS) WITH IGNITION SYSTEM CHECK' },
    { code: '06', description: 'BATTERY TERMINALS CLEANING AND BATTERY HEALTH DIAGNOSTIC TEST' },
    { code: '07', description: 'WHEEL ALIGNMENT AND BALANCING WITH TYRE ROTATION SERVICE' },
    { code: '08', description: 'AC FILTER REPLACEMENT AND REFRIGERANT TOP-UP WITH PERFORMANCE CHECK' },
  ]);

  const st = STATUS_COLORS[jobStatus] || STATUS_COLORS.Open;

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-0 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">

      {/* ── Toolbar ── */}
      <div className="flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2">
        {/* Icon-only group */}
        <div className="flex items-center gap-1 shrink-0">
          {ACTION_TABS.filter((t) => t.iconOnly).map((t) => {
            const active = activeTab === t.key;
            return (
              <button key={t.key} type="button" title={t.label} onClick={() => setActiveTab(t.key)}
                className={`${active ? primaryBtn : softBtn} w-7 justify-center px-0`}
                style={active ? { backgroundColor: primary, borderColor: primary } : {}}>
                <span style={active ? { filter: 'brightness(0) invert(1)' } : { color: primary }}>{t.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-gray-200" />

        {/* Text buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {ACTION_TABS.filter((t) => !t.iconOnly).map((t) => {
            const active = activeTab === t.key;
            return (
              <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                className={active ? primaryBtn : softBtn}
                style={active ? { backgroundColor: primary, borderColor: primary } : {}}>
                <span style={active ? { filter: 'brightness(0) invert(1)' } : { color: primary }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3">

        {/* ── Header Summary ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>Garage Home</h1>
              <p className="text-[10px] text-gray-400">Manage job card, customer details, and workshop updates</p>
            </div>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
              Active Job: {jobNo}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <QuickStat
              label="Customer"
              value={custName}
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            />
            <QuickStat
              label="Registration"
              value={regNo}
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/></svg>}
            />
            <QuickStat
              label="Promise Date"
              value={promiseDate}
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>}
            />
            <QuickStat
              label="Current Status"
              value={jobStatus}
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
          </div>
        </div>

        {/* ── Vehicle Banner ── */}
        <div className="flex shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Left accent strip */}
          <div className="w-1 shrink-0 rounded-l-xl" style={{ background: gradient }} />

          <div className="flex flex-1 flex-wrap items-center gap-0 divide-x divide-gray-100">
            {/* Brand + model */}
            <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-[200px]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: primary }}>
                  <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wider text-gray-800">TOYOTA — HIACE</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  <span className="font-semibold text-gray-500">WHITE</span>
                  <span className="mx-1 text-gray-300">·</span>
                  Plate Colour: <span className="font-semibold text-gray-500">RED</span>
                </p>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-4 px-4 py-3">
              {[
                { label: 'Job No',  value: jobNo   },
                { label: 'Barcode', value: barCode },
                { label: 'Reg. No', value: regNo   },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
                  <span className="text-[11px] font-bold text-gray-800 tabular-nums">{value}</span>
                </div>
              ))}

              {/* Status badge */}
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold"
                style={{ backgroundColor: st.bg, color: st.text, borderColor: st.border }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: st.dot }} />
                {jobStatus}
              </span>
            </div>
          </div>
        </div>

        {/* ── Details Tabs ── */}
        <div className="shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-3 pt-2">
            <TabsBar
              activeTab={sectionTab}
              onChange={setSectionTab}
              tabs={[
                { id: 'customer',   label: 'Customer Details'   },
                { id: 'vehicle',    label: 'Vehicle Details'    },
                { id: 'estimation', label: 'Estimation Details' },
                { id: 'job',        label: 'Job Details'        },
              ]}
            />
          </div>
          <div className="p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Form Details</p>
            {sectionTab === 'customer' && (
              <div className="flex flex-wrap gap-3">
                <Field label="Customer Code"  value={custCode}      onChange={(e) => setCustCode(e.target.value)}      placeholder="CUST5" />
                <Field label="Customer Name"  value={custName}      onChange={(e) => setCustName(e.target.value)}      placeholder="Customer name" />
                <Field label="Phone No."      value={phoneNo}       onChange={(e) => setPhoneNo(e.target.value)}       placeholder="+971-..." />
                <Field label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Contact person" />
              </div>
            )}
            {sectionTab === 'vehicle' && (
              <div className="flex flex-wrap gap-3">
                <Field label="Station Code" value={stationCode} onChange={(e) => setStationCode(e.target.value)} placeholder="Station" />
                <Field label="Engine No."   value={engineNo}    onChange={(e) => setEngineNo(e.target.value)}    placeholder="Engine number" />
                <Field label="Chassis No."  value={chassisNo}   onChange={(e) => setChassissNo(e.target.value)}  placeholder="Chassis number" />
                <Field label="Plate Colour" value={plateColour} onChange={(e) => setPlateColour(e.target.value)} placeholder="Colour" />
              </div>
            )}
            {sectionTab === 'estimation' && (
              <div className="flex flex-wrap gap-3">
                <Field label="Estimation No." value={estimationNo} onChange={(e) => setEstimationNo(e.target.value)} placeholder="Est. no." />
                <Field label="LPO No."        value={lpoNo}        onChange={(e) => setLpoNo(e.target.value)}        placeholder="LPO no." />
                <div className="flex flex-col gap-0.5" style={{ minWidth: 150, maxWidth: 200, flex: '1 1 160px' }}>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">LPO Date</label>
                  <DatePickerInput value={lpoDate} onChange={(e) => setLpoDate(e.target.value)} heightPx={28} />
                </div>
                <Field label="Claim No."   value={claimNo}   onChange={(e) => setClaimNo(e.target.value)}   placeholder="Claim no." />
                <Field label="Excess Amt." value={excessAmt} onChange={(e) => setExcessAmt(e.target.value)} placeholder="0" />
              </div>
            )}
            {sectionTab === 'job' && (
              <div className="flex flex-wrap gap-3">
                <Field label="Booking Date"     value={bookingDate}    onChange={(e) => setBookingDate(e.target.value)}    placeholder="DD/MM/YYYY HH:MM" />
                <Field label="Promise Date"     value={promiseDate}    onChange={(e) => setPromiseDate(e.target.value)}    placeholder="DD/MM/YYYY HH:MM" />
                <Field label="Kit Reading (Kl)" value={kitReading}     onChange={(e) => setKitReading(e.target.value)}    placeholder="0" />
                <Field label="Kit Out"          value={kitOut}         onChange={(e) => setKitOut(e.target.value)}         placeholder="0" />
                <Field label="Delivery Driver"  value={deliveryDriver} onChange={(e) => setDeliveryDriver(e.target.value)} placeholder="Driver name" />
                <Field label="Delivery Date"    value={deliveryDate}   onChange={(e) => setDeliveryDate(e.target.value)}   placeholder="DD/MM/YYYY HH:MM" />
              </div>
            )}
          </div>
        </div>

        {/* ── Follow Ups + Customer Concerns ── */}
        <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-2">
          <NoteArea
            label="Follow Ups" value={followUps} onChange={(e) => setFollowUps(e.target.value)}
            placeholder="Add follow-up notes…" accentColor="#6b7280"
            icon={<svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          />
          <NoteArea
            label="Customer Concerns" value={custConcerns} onChange={(e) => setCustConcerns(e.target.value)}
            placeholder="Describe customer concerns…" accentColor={primary}
            icon={<svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
        </div>

        {/* ── Job Description ── */}
        <div className="shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2" style={{ background: `${primary}08` }}>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ background: `${primary}15`, color: primary }}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primary }}>Job Description</span>
          </div>
          <CommonTable
            fitParentWidth hideVerticalCellBorders cellAlign="left"
            columnWidthPercents={[12, 88]}
            headerFontSize="10px" headerTextColor="#9ca3af"
            bodyFontSize="11px"
            cellPaddingClass="px-3 py-2"
            headers={['Job Code', 'Description']}
            rows={jobDesc.map((r) => [
              <span className="font-mono font-semibold text-gray-700">{r.code}</span>,
              <span className="text-gray-700">{r.description}</span>,
            ])}
          />
        </div>

      </div>
    </div>
  );
}
