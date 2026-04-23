import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';

const primary = '#790728';

const STAGE_STEPS = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won / Lost'];

const CUSTOMERS = [
  { id: 1, name: 'Al Noor Trading LLC', mobile: '971500000001', email: 'info@alnoor.com', address: 'Dubai, UAE' },
  { id: 2, name: 'Gulf Star Automotive', mobile: '971500000002', email: 'info@gulfstar.ae', address: 'Sharjah, UAE' },
  { id: 3, name: 'Masdar Trading Co.', mobile: '971500000003', email: 'contact@masdar.ae', address: 'Abu Dhabi, UAE' },
  { id: 4, name: 'Al Baraka Retail', mobile: '971500000004', email: 'info@albaraka.ae', address: 'Ajman, UAE' },
  { id: 5, name: 'Emirates Gate Group', mobile: '971500000005', email: 'info@emiratesgate.ae', address: 'Dubai, UAE' },
];

const CONTACTS_BY_CUSTOMER = {
  1: ['Fahad Al Mansouri', 'Reem Hassan'],
  2: ['Khalid Al Rashidi', 'Noura Faisal'],
  3: ['Ahmed Al Zaabi', 'Sara Khalil'],
  4: ['Omar Al Baraka', 'Mariam Yousuf'],
  5: ['Zayed Al Ameri', 'Hessa Saif'],
};

const LEADS = ['LD-0001 – Al Noor Trading', 'LD-0002 – Gulf Star', 'LD-0003 – Masdar', '(None)'];
const STAGE_OPTIONS = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const ASSIGNED_OPTIONS = ['Sabeeh', 'Swetha', 'Sonu'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
const SOURCE_OPTIONS = ['Direct', 'Referral', 'Website', 'Cold Call', 'Exhibition'];

export default function OpportunityEntryPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oppNo: 'AUTO',
    oppTitle: '',
    customer: '',
    leadRef: '',
    stage: 'Prospect',
    probability: '',
    estimatedValue: '',
    expectedCloseDate: '',
    assignedTo: '',
    priority: '',
    source: '',
    products: '',
    description: '',
    contactPerson: '',
    mobile: '',
    email: '',
    remarks: '',
  });

  // Auto-filled read-only from customer lookup
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '' });
  const [contactOptions, setContactOptions] = useState([]);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleCustomerChange = (val) => {
    update('customer', val);
    update('contactPerson', '');
    update('mobile', '');
    update('email', '');
    const found = CUSTOMERS.find((c) => c.name === val);
    if (found) {
      setCustomerInfo({ name: found.name, address: found.address });
      setContactOptions(CONTACTS_BY_CUSTOMER[found.id] || []);
    } else {
      setCustomerInfo({ name: '', address: '' });
      setContactOptions([]);
    }
  };

  const handleContactChange = (val) => {
    update('contactPerson', val);
    const found = CUSTOMERS.find((c) => c.name === form.customer);
    if (found) {
      update('mobile', found.mobile);
      update('email', found.email);
    }
  };

  const handleSave = () => {
    console.log('Opportunity Save', form);
  };

  const handleSaveNew = () => {
    console.log('Opportunity Save & New', form);
    setForm({
      oppNo: 'AUTO', oppTitle: '', customer: '', leadRef: '', stage: 'Prospect',
      probability: '', estimatedValue: '', expectedCloseDate: '', assignedTo: '',
      priority: '', source: '', products: '', description: '',
      contactPerson: '', mobile: '', email: '', remarks: '',
    });
    setCustomerInfo({ name: '', address: '' });
    setContactOptions([]);
  };

  const currentStageIdx = STAGE_STEPS.findIndex((s) => s.startsWith(form.stage));
  const activeStepIdx = currentStageIdx === -1 ? 0 : currentStageIdx;

  return (
    <div className="mx-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            OPPORTUNITY ENTRY
          </h1>
          <p className="mt-1 text-xs text-gray-500">Create or update an opportunity record</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded px-4 py-2 text-[11px] font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate('/crm/opportunity-list')}
            className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Two-column layout — 60 / 40 */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* LEFT — Opportunity Information (3/5 ≈ 60%) */}
        <div className="xl:col-span-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Opportunity Information</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField label="Opp No" fullWidth readOnly value={form.oppNo} />
              <InputField
                label="Opp Title"
                fullWidth
                value={form.oppTitle}
                onChange={(e) => update('oppTitle', e.target.value)}
                placeholder="Enter opportunity title"
              />
              <DropdownInput
                label="Customer"
                fullWidth
                value={form.customer}
                onChange={handleCustomerChange}
                options={CUSTOMERS.map((c) => c.name)}
                placeholder="Search or select customer…"
              />
              <DropdownInput
                label="Lead Ref No"
                fullWidth
                value={form.leadRef}
                onChange={(v) => update('leadRef', v)}
                options={LEADS}
                placeholder="Linked lead (optional)"
              />
              <DropdownInput
                label="Stage"
                fullWidth
                value={form.stage}
                onChange={(v) => update('stage', v)}
                options={STAGE_OPTIONS}
                placeholder="Select stage"
              />
              <InputField
                label="Probability %"
                type="number"
                fullWidth
                value={form.probability}
                onChange={(e) => update('probability', e.target.value)}
                placeholder="0 – 100"
              />
              <InputField
                label="Estimated Value (₹)"
                type="number"
                fullWidth
                value={form.estimatedValue}
                onChange={(e) => update('estimatedValue', e.target.value)}
              />
              <InputField
                label="Expected Close Date"
                type="date"
                fullWidth
                value={form.expectedCloseDate}
                onChange={(e) => update('expectedCloseDate', e.target.value)}
              />
              <DropdownInput
                label="Assigned To"
                fullWidth
                value={form.assignedTo}
                onChange={(v) => update('assignedTo', v)}
                options={ASSIGNED_OPTIONS}
                placeholder="Select user"
              />
              <DropdownInput
                label="Priority"
                fullWidth
                value={form.priority}
                onChange={(v) => update('priority', v)}
                options={PRIORITY_OPTIONS}
                placeholder="Select priority"
              />
              <DropdownInput
                label="Source"
                fullWidth
                value={form.source}
                onChange={(v) => update('source', v)}
                options={SOURCE_OPTIONS}
                placeholder="Select source"
              />
              <InputField
                label="Products / Services Interested"
                fullWidth
                value={form.products}
                onChange={(e) => update('products', e.target.value)}
                placeholder="e.g. ERP + POS"
              />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-semibold text-gray-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-gray-400"
                  placeholder="Opportunity description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (2/5 ≈ 40%) */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Customer & Contact */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Customer &amp; Contact</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-gray-600">Customer Name</label>
                <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 min-h-[34px]">
                  {customerInfo.name || <span className="text-gray-400">Auto-filled from customer</span>}
                </div>
              </div>
              <DropdownInput
                label="Contact Person"
                fullWidth
                value={form.contactPerson}
                onChange={handleContactChange}
                options={contactOptions}
                placeholder={form.customer ? 'Select contact' : 'Select customer first'}
              />
              <InputField
                label="Mobile"
                fullWidth
                value={form.mobile}
                onChange={(e) => update('mobile', e.target.value)}
              />
              <InputField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-gray-600">Address</label>
                <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 min-h-[34px]">
                  {customerInfo.address || <span className="text-gray-400">Auto-filled from customer</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stage & Probability — visual step indicator */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Stage &amp; Probability</h2>
            <div className="flex items-start">
              {STAGE_STEPS.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                const isDone = idx < activeStepIdx;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: isActive ? primary : isDone ? '#d1fae5' : '#F3F4F6',
                          color: isActive ? '#fff' : isDone ? '#166534' : '#9CA3AF',
                          border: isActive ? `2px solid ${primary}` : isDone ? '2px solid #166534' : '2px solid #E5E7EB',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className="mt-1 text-center text-[9px] font-semibold leading-tight"
                        style={{ color: isActive ? primary : isDone ? '#166534' : '#9CA3AF' }}
                      >
                        {step}
                      </span>
                    </div>
                    {idx < STAGE_STEPS.length - 1 && (
                      <div
                        className="mt-3 h-0.5 flex-1"
                        style={{ backgroundColor: idx < activeStepIdx ? '#166534' : '#E5E7EB' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {form.probability !== '' && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                  <span>Probability</span>
                  <span className="font-semibold" style={{ color: primary }}>{form.probability}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Number(form.probability))}%`, backgroundColor: primary }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Remarks</h2>
            <textarea
              value={form.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-gray-400"
              placeholder="Internal remarks or notes"
            />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded px-5 py-2 text-[11px] font-semibold text-white"
          style={{ backgroundColor: primary }}
        >
          Save Opportunity
        </button>
        <button
          type="button"
          onClick={handleSaveNew}
          className="rounded border border-gray-300 px-5 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
        >
          Save &amp; New
        </button>
        <button
          type="button"
          onClick={() => navigate('/crm/opportunity-list')}
          className="rounded border border-gray-300 px-5 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
