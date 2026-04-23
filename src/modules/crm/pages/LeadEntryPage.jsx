import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';

export default function LeadEntryPage() {
  const primary = colors.primary?.main || '#790728';

  const [form, setForm] = useState({
    leadNo: 'AUTO',
    leadName: '',
    contactPerson: '',
    source: '',
    status: '',
    priority: '',
    assignedTo: '',
    mobile: '',
    altMobile: '',
    phone: '',
    email: '',
    website: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    customerType: '',
    industry: '',
    interestedProduct: '',
    estimatedValue: '',
    expectedCloseDate: '',
    remarks: '',
  });

  const sourceOptions = ['Website', 'Reference', 'Walk-in', 'Campaign', 'Sales Call'];
  const statusOptions = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const assignedOptions = ['Sabeeh', 'Swetha', 'Sonu'];
  const customerTypeOptions = ['Retail', 'Wholesale', 'Corporate', 'Garage'];
  const industryOptions = ['Retail', 'Automotive', 'Trading', 'Manufacturing', 'Services'];

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Lead Save', form);
  };

  return (
    <div className="mx-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            LEAD ENTRY
          </h1>
          <p className="mt-1 text-xs text-gray-500">Create or update CRM lead details</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded px-4 py-2 text-[11px] font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            Save Lead
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-bold" style={{ color: primary }}>Basic Information</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Lead no" fullWidth readOnly value={form.leadNo} />
            <InputField label="Lead name / Company name" fullWidth value={form.leadName} onChange={(e) => update('leadName', e.target.value)} />
            <InputField label="Contact person" fullWidth value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
            <DropdownInput label="Lead source" fullWidth value={form.source} onChange={(v) => update('source', v)} options={sourceOptions} placeholder="Select source" />
            <DropdownInput label="Lead status" fullWidth value={form.status} onChange={(v) => update('status', v)} options={statusOptions} placeholder="Select status" />
            <DropdownInput label="Priority" fullWidth value={form.priority} onChange={(v) => update('priority', v)} options={priorityOptions} placeholder="Select priority" />
            <DropdownInput label="Assigned to" fullWidth value={form.assignedTo} onChange={(v) => update('assignedTo', v)} options={assignedOptions} placeholder="Select user" />
            <InputField label="Estimated value" type="number" fullWidth value={form.estimatedValue} onChange={(e) => update('estimatedValue', e.target.value)} />
            <InputField label="Expected close date" type="date" fullWidth value={form.expectedCloseDate} onChange={(e) => update('expectedCloseDate', e.target.value)} />
            <DropdownInput label="Customer type" fullWidth value={form.customerType} onChange={(v) => update('customerType', v)} options={customerTypeOptions} placeholder="Select type" />
            <DropdownInput label="Industry" fullWidth value={form.industry} onChange={(v) => update('industry', v)} options={industryOptions} placeholder="Select industry" />
            <InputField label="Interested product/service" fullWidth value={form.interestedProduct} onChange={(e) => update('interestedProduct', e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-bold" style={{ color: primary }}>Contact Information</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Mobile" fullWidth value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
            <InputField label="Alternate mobile" fullWidth value={form.altMobile} onChange={(e) => update('altMobile', e.target.value)} />
            <InputField label="Phone" fullWidth value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            <InputField label="Email" fullWidth value={form.email} onChange={(e) => update('email', e.target.value)} />
            <InputField label="Website" fullWidth value={form.website} onChange={(e) => update('website', e.target.value)} />
          </div>

          <h2 className="mt-5 text-sm font-bold" style={{ color: primary }}>Address Information</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Address line 1" fullWidth value={form.address1} onChange={(e) => update('address1', e.target.value)} />
            <InputField label="Address line 2" fullWidth value={form.address2} onChange={(e) => update('address2', e.target.value)} />
            <InputField label="City" fullWidth value={form.city} onChange={(e) => update('city', e.target.value)} />
            <InputField label="State / Region" fullWidth value={form.state} onChange={(e) => update('state', e.target.value)} />
            <InputField label="Country" fullWidth value={form.country} onChange={(e) => update('country', e.target.value)} />
            <InputField label="Postal code" fullWidth value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-bold" style={{ color: primary }}>Remarks</h2>
        <div className="mt-3">
          <textarea
            value={form.remarks}
            onChange={(e) => update('remarks', e.target.value)}
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
            placeholder="Enter remarks"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded px-4 py-2 text-[11px] font-semibold text-white"
          style={{ backgroundColor: primary }}
        >
          Save Lead
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700"
        >
          Save & New
        </button>
      </div>
    </div>
  );
}