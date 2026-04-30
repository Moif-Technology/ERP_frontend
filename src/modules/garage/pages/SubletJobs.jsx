import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField, DropdownInput } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';

const primary = colors.primary?.main || '#790728';

const TECH_NAMES    = ['Ahmed Al-Rashid', 'Carlos Mendes', 'David Osei', 'Faisal Khan', 'Ivan Petrov', 'Rajan Pillai'];
const TYPE_OPTS     = ['Labour', 'Material', 'Both'];
const TAX_CATEGORY  = ['Standard 5%', 'Zero Rated', 'Exempt'];

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

function SectionHeading({ label }) {
  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: primary }}>{label}</span>
    </div>
  );
}

const emptyForm = () => ({
  jobNo: '', regNo: '', chassisNo: '', engineNo: '', subletNo: '',
  lpoNo: '', lpoDate: new Date().toISOString().slice(0, 10), supplierName: '', lpoAmount: '',
  techCode: '', techName: '', jobDescription: '',
  supplierInvoiceNo: '', invoiceDate: new Date().toISOString().slice(0, 10),
  grossAmount: '', type: '', vatAmount: '', taxCategory: '', netInvoiceAmount: '', remarks: '',
});

export default function SubletJobs() {
  const [form, setForm] = useState(emptyForm());

  const set     = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const reset      = () => setForm(emptyForm());
  const handleSave = () => console.log('Save sublet job', form);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

      {/* ── toolbar ── */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          SUBLET JOBS
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaBtn} aria-label="Post">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" />
            Post
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
            aria-label="New sublet job"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Sublet Job</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── form body ── */}
      <div className="mt-1 flex justify-center overflow-y-auto">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* ── Job / Vehicle Info ── */}
            <SectionHeading label="Job / Vehicle Info" />

            <InputField label="Job No"      fullWidth value={form.jobNo}      onChange={set('jobNo')}      placeholder="Job number" />
            <InputField label="Reg. No"     fullWidth value={form.regNo}      onChange={set('regNo')}      placeholder="Registration number" />
            <InputField label="Chassis No"  fullWidth value={form.chassisNo}  onChange={set('chassisNo')}  placeholder="Chassis number" />
            <InputField label="Engine No"   fullWidth value={form.engineNo}   onChange={set('engineNo')}   placeholder="Engine number" />
            <InputField label="Sublet No"   fullWidth value={form.subletNo}   onChange={set('subletNo')}   placeholder="Auto" />

            {/* ── Sublet LPO Details ── */}
            <SectionHeading label="Sublet LPO Details" />

            <InputField label="LPO No"        fullWidth value={form.lpoNo}        onChange={set('lpoNo')}        placeholder="LPO number" />
            <InputField label="LPO / Issue Date" fullWidth type="date" value={form.lpoDate} onChange={set('lpoDate')} />
            <InputField label="Supplier Name" fullWidth value={form.supplierName} onChange={set('supplierName')} placeholder="Supplier name" />
            <InputField label="LPO Amount"    fullWidth type="number" value={form.lpoAmount} onChange={set('lpoAmount')} placeholder="0.00" />

            {/* ── Sublet Request ── */}
            <SectionHeading label="Sublet Request" />

            <InputField label="Requested Tech. Code" fullWidth value={form.techCode} onChange={set('techCode')} placeholder="Tech code" />
            <DropdownInput label="Requested Tech. Name" fullWidth value={form.techName} onChange={setDrop('techName')} options={TECH_NAMES} placeholder="Select technician" />

            <div className="flex flex-col gap-0.5 sm:col-span-2 lg:col-span-3">
              <label className="text-[9px] leading-tight text-gray-500 sm:text-[11px] sm:leading-[15px]">Job Description</label>
              <textarea
                rows={3}
                value={form.jobDescription}
                onChange={set('jobDescription')}
                placeholder="Enter job description…"
                className="box-border w-full resize-none rounded border border-gray-200 bg-white px-2 py-1 text-[10px] leading-relaxed text-gray-800 outline-none focus:border-gray-400"
                style={{ borderRadius: 4 }}
              />
            </div>

            {/* ── Sublet Invoice Details ── */}
            <SectionHeading label="Sublet Invoice Details" />

            <InputField label="Supplier Invoice No" fullWidth value={form.supplierInvoiceNo} onChange={set('supplierInvoiceNo')} placeholder="Invoice number" />
            <InputField label="Invoice Date"        fullWidth type="date" value={form.invoiceDate} onChange={set('invoiceDate')} />
            <InputField label="Gross Amount"        fullWidth type="number" value={form.grossAmount}      onChange={set('grossAmount')}      placeholder="0.00" />
            <DropdownInput label="Type"             fullWidth value={form.type}         onChange={setDrop('type')}         options={TYPE_OPTS}    placeholder="Select type" />
            <InputField label="VAT Amount"          fullWidth type="number" value={form.vatAmount}        onChange={set('vatAmount')}        placeholder="0.00" />
            <DropdownInput label="Tax Category"     fullWidth value={form.taxCategory}  onChange={setDrop('taxCategory')}  options={TAX_CATEGORY} placeholder="Select tax category" />
            <InputField label="Net Invoice Amount"  fullWidth type="number" value={form.netInvoiceAmount} onChange={set('netInvoiceAmount')} placeholder="0.00" />

            <div className="flex flex-col gap-0.5 sm:col-span-2 lg:col-span-3">
              <label className="text-[9px] leading-tight text-gray-500 sm:text-[11px] sm:leading-[15px]">Remarks</label>
              <textarea
                rows={3}
                value={form.remarks}
                onChange={set('remarks')}
                placeholder="Remarks…"
                className="box-border w-full resize-none rounded border border-gray-200 bg-white px-2 py-1 text-[10px] leading-relaxed text-gray-800 outline-none focus:border-gray-400"
                style={{ borderRadius: 4 }}
              />
            </div>

          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save Sublet Job
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
