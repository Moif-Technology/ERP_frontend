import React, { useState } from 'react';
import { colors, inputField, uiFontSizes } from '../../../shared/constants/theme';
import { InputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';

const primary  = colors.primary?.main     || '#790728';
const gradient = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';

const SERVICE_ADVISORS = ['Ahmed Al-Rashidi', 'Fatima Al-Zahra', 'Mohammed Al-Khalidi', 'Sara Al-Mansouri'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaBtn     = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryBtn   = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 17H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  );
}

const now = () => {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
};

const MOCK_VEHICLES = {
  'KWI-1234': { brand: 'TOYOTA', colour: 'Silver', model: 'Land Cruiser 200' },
  'KWI-5678': { brand: 'NISSAN', colour: 'White',  model: 'Patrol Y62' },
  'KWI-9012': { brand: 'HONDA',  colour: 'Black',  model: 'Pilot 2022' },
};

const emptyForm = () => {
  const { date, time } = now();
  return {
    regNo: '', chassisNo: '', customerName: '', serviceAdvisor: '',
    bookingDate: date, bookingTime: time, kmReading: '', remarks: '',
    policeReport: false, warrantyRepair: false, totalLoss: false,
    vehicleInfo: null,
  };
};

export default function PreJobCardEntry() {
  const [form, setForm] = useState(emptyForm());

  const set     = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));
  const toggle  = (key) => () => setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const reset = () => setForm(emptyForm());

  const handleSearch = () => {
    const info = MOCK_VEHICLES[form.regNo.toUpperCase().trim()] || null;
    setForm((prev) => ({ ...prev, vehicleInfo: info }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSave = () => console.log('Save pre job card', form);

  const CHECKBOXES = [
    { key: 'policeReport',   label: 'Police Report' },
    { key: 'warrantyRepair', label: 'Warranty Repair' },
    { key: 'totalLoss',      label: 'Total Loss' },
  ];

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          PRE JOB CARD ENTRY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>

          {/* Veh. Delivery */}
          <button type="button" className={figmaBtn}>
            <CarIcon className="h-3.5 w-3.5 shrink-0" />
            Veh. Delivery
          </button>

          {/* Make Job Card */}
          <button
            type="button"
            className={primaryBtn}
            style={{ backgroundColor: '#1a6e3c', borderColor: '#1a6e3c' }}
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M3 9h6M3 15h6M15 7h3M15 11h3M15 15h3" />
            </svg>
            Make Job Card
          </button>

          {/* Save */}
          <button type="button" className={figmaBtn} onClick={handleSave}>
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />
            Save
          </button>

          {/* New Entry */}
          <button
            type="button"
            className={primaryBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={reset}
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body ── */}
      <div className="mt-1 flex justify-center overflow-y-auto">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* Reg. No. — full width with inline search */}
            <div className="sm:col-span-2">
              <label
                className="mb-0.5 block"
                style={{ fontSize: uiFontSizes.label, lineHeight: '18px', color: inputField.label.color }}
              >
                Reg. No.
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    fullWidth
                    value={form.regNo}
                    onChange={set('regNo')}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter registration number (e.g. KWI-1234)"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-[26px] shrink-0 items-center gap-1.5 rounded-[3px] px-3 text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: gradient }}
                >
                  <SearchIcon className="h-3.5 w-3.5" />
                  Search
                </button>
              </div>
            </div>

            {/* Vehicle info card — full width */}
            <div className="sm:col-span-2">
              <div
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white p-3"
                style={{ minHeight: 72 }}
              >
                {form.vehicleInfo ? (
                  <div className="flex flex-wrap items-center gap-6">
                    {/* Brand */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className="text-base font-extrabold tracking-widest uppercase"
                        style={{ color: primary }}
                      >
                        {form.vehicleInfo.brand}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Brand Type</span>
                    </div>

                    <div className="h-10 w-px bg-gray-200" />

                    {/* Colour */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Colour</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: form.vehicleInfo.colour.toLowerCase() === 'silver' ? '#c0c0c0' : form.vehicleInfo.colour.toLowerCase() }}
                        />
                        <span className="text-[12px] font-semibold text-gray-700">{form.vehicleInfo.colour}</span>
                      </div>
                    </div>

                    <div className="h-10 w-px bg-gray-200" />

                    {/* Model */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Model</span>
                      <span className="text-[12px] font-semibold text-gray-700">{form.vehicleInfo.model}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center gap-2 py-2">
                    <CarIcon className="h-6 w-6 text-gray-300" />
                    <span className="text-[11px] text-gray-400">Vehicle info will appear after searching Reg. No.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chassis No */}
            <InputField
              label="Chassis No"
              fullWidth
              value={form.chassisNo}
              onChange={set('chassisNo')}
              placeholder="Chassis number"
            />

            {/* Customer Name */}
            <InputField
              label="Customer Name"
              fullWidth
              value={form.customerName}
              onChange={set('customerName')}
              placeholder="Customer full name"
            />

            {/* Service Advisor */}
            <DropdownInput
              label="Service Advisor"
              fullWidth
              value={form.serviceAdvisor}
              onChange={setDrop('serviceAdvisor')}
              options={SERVICE_ADVISORS}
              placeholder="Select service advisor"
            />

            {/* KM Reading (IN) */}
            <InputField
              label="KM Reading (IN)"
              fullWidth
              value={form.kmReading}
              onChange={set('kmReading')}
              placeholder="0"
              type="number"
            />

            {/* Booking Date + Time combined card */}
            <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-white p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[140px]">
                  <InputField label="Booking Date" fullWidth type="date" value={form.bookingDate} onChange={set('bookingDate')} />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <InputField label="Booking Time" fullWidth type="time" value={form.bookingTime} onChange={set('bookingTime')} />
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label
                className="mb-0.5 block"
                style={{ fontSize: uiFontSizes.label, lineHeight: '18px', color: inputField.label.color }}
              >
                Remarks
              </label>
              <textarea
                rows={3}
                value={form.remarks}
                onChange={set('remarks')}
                placeholder="Any additional remarks..."
                className="w-full resize-none rounded-[3px] border border-gray-200 bg-[#F5F5F5] px-2 py-1 text-[12px] text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
                style={{ minHeight: 60 }}
              />
            </div>

            {/* Switches */}
            <div className="sm:col-span-2">
              <span
                className="mb-2 block"
                style={{ fontSize: uiFontSizes.label, lineHeight: '18px', color: inputField.label.color }}
              >
                Additional Flags
              </span>
              <div className="flex flex-wrap gap-4">
                {CHECKBOXES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={toggle(key)}
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                  >
                    {/* track */}
                    <span
                      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200"
                      style={{
                        background: form[key] ? gradient : '#e5e7eb',
                        boxShadow: form[key] ? `0 0 0 2px ${primary}33` : 'none',
                      }}
                    >
                      {/* thumb */}
                      <span
                        className="absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-all duration-200"
                        style={{ left: form[key] ? 'calc(100% - 18px)' : '3px' }}
                      />
                    </span>
                    <span
                      className="text-[11px] font-semibold transition-colors duration-150"
                      style={{ color: form[key] ? primary : '#6b7280' }}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Save button */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-5 py-2 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: gradient }}
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
