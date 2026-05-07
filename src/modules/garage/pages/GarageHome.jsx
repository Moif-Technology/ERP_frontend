import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';

const primary  = colors.primary?.main || '#790728';
const gradient = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';

const STATUS_COLORS = {
  Open:       { bg: '#e6f4ea', text: '#1a7f37', dot: '#1a7f37' },
  Closed:     { bg: '#fde8e8', text: '#c0392b', dot: '#c0392b' },
  'In Progress': { bg: '#e8f0fe', text: '#1a56db', dot: '#1a56db' },
  Pending:    { bg: '#fff8e1', text: '#a06000', dot: '#a06000' },
};

const ACTION_TABS = [
  { key: 'refresh',      label: 'Refresh',       icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
  { key: 'editJobcard',  label: 'Edit Jobcard',  icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { key: 'estimation',   label: 'Estimation',    icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { key: 'spareParts',   label: 'Spare Parts',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
  { key: 'lubricants',   label: 'Lubricants',    icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 5-5 13-5 13S7 12 7 7a5 5 0 0 1 5-5z"/></svg> },
  { key: 'consumables',  label: 'Consumables',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
  { key: 'sublet',       label: 'Sublet',        icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
  { key: 'timeRegister', label: 'Time Register', icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: 'lpoDetails',   label: 'LPO Details',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { key: 'discount',     label: 'Discount',      icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><line x1="5" y1="19" x2="19" y2="5"/></svg> },
  { key: 'printBarcode', label: 'Print Barcode', icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="4" height="14"/><rect x="8" y="5" width="2" height="14"/><rect x="12" y="5" width="4" height="14"/><rect x="18" y="5" width="4" height="14"/></svg> },
  { key: 'invoice',      label: 'Invoice',       icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2H5a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2h-4"/><polyline points="9 2 9 8 15 8 15 2"/></svg> },
  { key: 'vehDelivery',  label: 'Veh. Delivery', icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { key: 'jobHistory',   label: 'Job History',   icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 0 .5-4"/><polyline points="3 3 3 7 7 7"/></svg> },
  { key: 'picture',      label: 'Picture',       icon: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
];

function LabelInput({ label, value, onChange, placeholder, type = 'text', readOnly = false, wide = false }) {
  return (
    <div className={`flex flex-col gap-0.5 ${wide ? 'col-span-2' : ''}`}>
      <label className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        readOnly={readOnly}
        className="h-[26px] rounded-md border border-gray-200 bg-[#F8F8F8] px-2 text-[10px] font-semibold text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
      />
    </div>
  );
}

function SectionCard({ title, icon, children, accent }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2" style={{ background: `${accent}0d` }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: `${accent}20`, color: accent }}>{icon}</span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: accent }}>{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export default function GarageHome() {
  const [activeTab, setActiveTab]       = useState('refresh');
  const [sectionTab, setSectionTab]     = useState('customer');

  const [jobNo,          setJobNo]          = useState('12');
  const [barCode,        setBarCode]        = useState('3010000164845');
  const [regNo,          setRegNo]          = useState('45026');
  const [jobStatus]                         = useState('Open');

  const [custCode,       setCustCode]       = useState('CUST5');
  const [custName,       setCustName]       = useState('MBK SECURITIES');
  const [phoneNo,        setPhoneNo]        = useState('+971-554339130');
  const [contactPerson,  setContactPerson]  = useState('MBK SECURITIES');

  const [stationCode,    setStationCode]    = useState('');
  const [engineNo,       setEngineNo]       = useState('');
  const [chassisNo,      setChassissNo]     = useState('');
  const [plateColour,    setPlateColour]    = useState('RED');

  const [estimationNo,   setEstimationNo]   = useState('');
  const [lpoNo,          setLpoNo]          = useState('');
  const [lpoDate,        setLpoDate]        = useState('06/07/2025');
  const [claimNo,        setClaimNo]        = useState('');
  const [excessAmt,      setExcessAmt]      = useState('0');

  const [bookingDate,    setBookingDate]    = useState('06/07/2025 15:26');
  const [promiseDate,    setPromiseDate]    = useState('06/07/2025 15:26');
  const [kitReading,     setKitReading]     = useState('42440');
  const [kitOut,         setKitOut]         = useState('0');
  const [deliveryDriver, setDeliveryDriver] = useState('');
  const [deliveryDate,   setDeliveryDate]   = useState('01/01/1900 00:00');

  const [followUps,      setFollowUps]      = useState('');
  const [custConcerns,   setCustConcerns]   = useState('GG');

  const [jobDesc] = useState([
    { code: '01', description: 'ENGINE OIL AND FILTER (10000 KM) CHANGING . AIR FILTER CLEANING WITH PARTS AND LABOUR CHARGES' },
  ]);

  const st = STATUS_COLORS[jobStatus] || STATUS_COLORS.Open;

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-0 rounded-lg border-2 border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* ── action toolbar ── */}
      <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 flex-wrap border-b border-gray-200 bg-white px-3 py-2">
        {ACTION_TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-semibold transition-all sm:text-[10px]"
              style={active
                ? { background: gradient, borderColor: primary, color: '#fff' }
                : { background: '#fff', borderColor: '#d1d5db', color: '#374151' }}
            >
              <span style={active ? { filter: 'brightness(0) invert(1)' } : { color: primary }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3 sm:p-4">

        {/* ── vehicle identity banner ── */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Brand/Model */}
          <div className="flex flex-1 items-center gap-3 border-r border-gray-100 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${primary}15` }}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: primary }}>
                <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-extrabold uppercase tracking-widest text-gray-800">TOYOTA — HIACE</p>
              <p className="text-[10px] font-semibold text-gray-400">WHITE &nbsp;·&nbsp; Plate Colour: RED</p>
            </div>
          </div>

          {/* Job No / BarCode / Reg No / Status */}
          <div className="flex flex-wrap items-center gap-5 px-4 py-3">
            {[
              { label: 'JOB NO', value: jobNo },
              { label: 'BARCODE', value: barCode },
              { label: 'REG. NO.', value: regNo },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
                <span className="text-[12px] font-extrabold text-gray-800">{value}</span>
              </div>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: st.bg, color: st.text }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
              {jobStatus}
            </span>
          </div>
        </div>

        {/* ── section tabs ── */}
        <div className="shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Tab bar */}
          <div className="flex min-w-0 flex-wrap border-b border-gray-200 bg-gray-50">
            {[
              { key: 'customer',   label: 'Customer Details',   color: '#1a56db' },
              { key: 'vehicle',    label: 'Vehicle Details',    color: '#1a7f37' },
              { key: 'estimation', label: 'Estimation Details', color: '#a06000' },
              { key: 'job',        label: 'Job Details',        color: primary   },
            ].map((t) => {
              const active = sectionTab === t.key;
              return (
                <button key={t.key} type="button" onClick={() => setSectionTab(t.key)}
                  className="relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-semibold transition-colors sm:text-[11px]"
                  style={{ color: active ? t.color : '#6b7280', borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent', background: active ? '#fff' : 'transparent', marginBottom: '-1px' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? t.color : '#d1d5db' }} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab panels */}
          <div className="p-4">
            {sectionTab === 'customer' && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <LabelInput label="Customer Code"  value={custCode}      onChange={(e) => setCustCode(e.target.value)}      placeholder="CUST5" />
                <LabelInput label="Customer Name"  value={custName}      onChange={(e) => setCustName(e.target.value)}      placeholder="Customer name" />
                <LabelInput label="Phone No."      value={phoneNo}       onChange={(e) => setPhoneNo(e.target.value)}       placeholder="+971-..." />
                <LabelInput label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Contact person" />
              </div>
            )}
            {sectionTab === 'vehicle' && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <LabelInput label="Station Code" value={stationCode} onChange={(e) => setStationCode(e.target.value)} placeholder="Station" />
                <LabelInput label="Engine No."   value={engineNo}    onChange={(e) => setEngineNo(e.target.value)}    placeholder="Engine number" />
                <LabelInput label="Chassis No."  value={chassisNo}   onChange={(e) => setChassissNo(e.target.value)}  placeholder="Chassis number" />
                <LabelInput label="Plate Colour" value={plateColour} onChange={(e) => setPlateColour(e.target.value)} placeholder="Colour" />
              </div>
            )}
            {sectionTab === 'estimation' && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <LabelInput label="Estimation No." value={estimationNo} onChange={(e) => setEstimationNo(e.target.value)} placeholder="Est. no." />
                <LabelInput label="LPO No."        value={lpoNo}        onChange={(e) => setLpoNo(e.target.value)}        placeholder="LPO no." />
                <LabelInput label="LPO Date"       value={lpoDate}      onChange={(e) => setLpoDate(e.target.value)}      placeholder="DD/MM/YYYY" />
                <LabelInput label="Claim No."      value={claimNo}      onChange={(e) => setClaimNo(e.target.value)}      placeholder="Claim no." />
                <LabelInput label="Excess Amt."    value={excessAmt}    onChange={(e) => setExcessAmt(e.target.value)}    placeholder="0" />
              </div>
            )}
            {sectionTab === 'job' && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <LabelInput label="Booking Date"     value={bookingDate}    onChange={(e) => setBookingDate(e.target.value)}    placeholder="DD/MM/YYYY HH:MM" />
                <LabelInput label="Promise Date"     value={promiseDate}    onChange={(e) => setPromiseDate(e.target.value)}    placeholder="DD/MM/YYYY HH:MM" />
                <LabelInput label="Kit Reading (Kl)" value={kitReading}     onChange={(e) => setKitReading(e.target.value)}    placeholder="0" />
                <LabelInput label="Kit Out"          value={kitOut}         onChange={(e) => setKitOut(e.target.value)}         placeholder="0" />
                <LabelInput label="Delivery Driver"  value={deliveryDriver} onChange={(e) => setDeliveryDriver(e.target.value)} placeholder="Driver name" />
                <LabelInput label="Delivery Date"    value={deliveryDate}   onChange={(e) => setDeliveryDate(e.target.value)}   placeholder="DD/MM/YYYY HH:MM" />
              </div>
            )}
          </div>
        </div>

        {/* ── follow ups + customer concerns ── */}
        <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-2">
          <SectionCard title="Follow Ups" accent="#6b7280"
            icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}>
            <textarea value={followUps} onChange={(e) => setFollowUps(e.target.value)}
              placeholder="Add follow-up notes…" rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 bg-[#F8F8F8] p-2 text-[10px] font-medium text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white" />
          </SectionCard>
          <SectionCard title="Customer Concerns" accent="#c0392b"
            icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}>
            <textarea value={custConcerns} onChange={(e) => setCustConcerns(e.target.value)}
              placeholder="Describe customer concerns…" rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 bg-[#F8F8F8] p-2 text-[10px] font-medium text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white" />
          </SectionCard>
        </div>

        {/* ── job description table ── */}
        <div className="shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2" style={{ background: `${primary}0d` }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: `${primary}20`, color: primary }}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primary }}>Job Description</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-gray-500" style={{ width: '12%' }}>Job Code</th>
                  <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-gray-500">Description</th>
                </tr>
              </thead>
              <tbody>
                {jobDesc.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: gradient }}>
                        {row.code}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[10px] font-medium text-gray-700">{row.description}</td>
                  </tr>
                ))}
                {jobDesc.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-[10px] text-gray-400">No job descriptions added</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
