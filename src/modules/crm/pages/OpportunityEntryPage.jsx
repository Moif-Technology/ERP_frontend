import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DropdownInput, InputField } from '../../../shared/components/ui';

const primary = '#790728';

const CUSTOMERS = [
  { id: 1, name: 'Al Noor Trading LLC',  mobile: '971500000001', email: 'info@alnoor.com',      address: 'Dubai, UAE' },
  { id: 2, name: 'Gulf Star Automotive', mobile: '971500000002', email: 'info@gulfstar.ae',      address: 'Sharjah, UAE' },
  { id: 3, name: 'Masdar Trading Co.',   mobile: '971500000003', email: 'contact@masdar.ae',     address: 'Abu Dhabi, UAE' },
  { id: 4, name: 'Al Baraka Retail',     mobile: '971500000004', email: 'info@albaraka.ae',      address: 'Ajman, UAE' },
  { id: 5, name: 'Emirates Gate Group',  mobile: '971500000005', email: 'info@emiratesgate.ae',  address: 'Dubai, UAE' },
];

const CONTACTS_BY_CUSTOMER = {
  1: ['Fahad Al Mansouri', 'Reem Hassan'],
  2: ['Khalid Al Rashidi', 'Noura Faisal'],
  3: ['Ahmed Al Zaabi',    'Sara Khalil'],
  4: ['Omar Al Baraka',    'Mariam Yousuf'],
  5: ['Zayed Al Ameri',    'Hessa Saif'],
};

const LEADS            = ['LD-0001 – Al Noor Trading', 'LD-0002 – Gulf Star', 'LD-0003 – Masdar', '(None)'];
const STAGE_OPTIONS    = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const ASSIGNED_OPTIONS = ['Ahmed', 'Priya', 'Ravi'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
const SOURCE_OPTIONS   = ['Direct', 'Referral', 'Website', 'Cold Call', 'Exhibition'];

export default function OpportunityEntryPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [form, setForm] = useState({
    oppNo: 'AUTO', oppTitle: '', customer: '', leadRef: '', stage: 'Prospect',
    probability: '', estimatedValue: '', expectedCloseDate: '', assignedTo: '',
    priority: '', source: '', products: '', description: '',
    contactPerson: '', mobile: '', email: '', remarks: '',
  });

  const [customerInfo,   setCustomerInfo]   = useState({ name: '', address: '' });
  const [contactOptions, setContactOptions] = useState([]);

  useEffect(() => {
    const opp = location.state?.opp;
    if (!opp) return;
    const found = CUSTOMERS.find((c) => c.name === opp.customer);
    setForm((prev) => ({
      ...prev,
      oppNo:             opp.oppNo        ?? 'AUTO',
      oppTitle:          opp.title        ?? '',
      customer:          opp.customer     ?? '',
      stage:             opp.stage        ?? 'Prospect',
      probability:       opp.probability != null ? String(opp.probability) : '',
      estimatedValue:    opp.value        != null ? String(opp.value)       : '',
      expectedCloseDate: opp.closeDate    ?? '',
      assignedTo:        opp.assignedTo   ?? '',
    }));
    if (found) {
      setCustomerInfo({ name: found.name, address: found.address });
      setContactOptions(CONTACTS_BY_CUSTOMER[found.id] || []);
    }
  }, [location.state]);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

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
    if (found) { update('mobile', found.mobile); update('email', found.email); }
  };

  const handleSave    = () => console.log('Save', form);
  const handleSaveNew = () => {
    setForm({
      oppNo: 'AUTO', oppTitle: '', customer: '', leadRef: '', stage: 'Prospect',
      probability: '', estimatedValue: '', expectedCloseDate: '', assignedTo: '',
      priority: '', source: '', products: '', description: '',
      contactPerson: '', mobile: '', email: '', remarks: '',
    });
    setCustomerInfo({ name: '', address: '' });
    setContactOptions([]);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>OPPORTUNITY ENTRY</h1>
          <p className="text-[10px] text-gray-500">Create or update an opportunity record</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave}
            className="rounded px-4 py-1.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: primary }}>
            Save
          </button>
          <button onClick={handleSaveNew}
            className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">
            Save &amp; New
          </button>
          <button onClick={() => navigate('/crm/opportunities')}
            className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-3">

        {/* ── Two-column: Opp Info + Customer & Contact ── */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">

          {/* LEFT 3/5 — Opportunity fields */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <h2 className="mb-2.5 text-xs font-bold" style={{ color: primary }}>Opportunity Information</h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <InputField label="Opp No" readOnly value={form.oppNo} />
                <InputField
                  label="Opp Title"
                  value={form.oppTitle}
                  onChange={(e) => update('oppTitle', e.target.value)}
                  placeholder="Enter title" />
                <DropdownInput
                  label="Customer"
                  value={form.customer}
                  onChange={handleCustomerChange}
                  options={CUSTOMERS.map((c) => c.name)}
                  placeholder="Select customer" />
                <DropdownInput
                  label="Lead Ref No"
                  value={form.leadRef}
                  onChange={(v) => update('leadRef', v)}
                  options={LEADS}
                  placeholder="Linked lead" />
                <DropdownInput
                  label="Stage"
                  value={form.stage}
                  onChange={(v) => update('stage', v)}
                  options={STAGE_OPTIONS}
                  placeholder="Select stage" />
                <InputField
                  label="Probability %"
                  type="number"
                  value={form.probability}
                  onChange={(e) => update('probability', e.target.value)}
                  placeholder="0 – 100" />
                <InputField
                  label="Estimated Value (₹)"
                  type="number"
                  value={form.estimatedValue}
                  onChange={(e) => update('estimatedValue', e.target.value)} />
                <InputField
                  label="Expected Close Date"
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) => update('expectedCloseDate', e.target.value)} />
                <DropdownInput
                  label="Assigned To"
                  value={form.assignedTo}
                  onChange={(v) => update('assignedTo', v)}
                  options={ASSIGNED_OPTIONS}
                  placeholder="Select user" />
                <DropdownInput
                  label="Priority"
                  value={form.priority}
                  onChange={(v) => update('priority', v)}
                  options={PRIORITY_OPTIONS}
                  placeholder="Select priority" />
                <DropdownInput
                  label="Source"
                  value={form.source}
                  onChange={(v) => update('source', v)}
                  options={SOURCE_OPTIONS}
                  placeholder="Select source" />
                <InputField
                  label="Products / Services"
                  value={form.products}
                  onChange={(e) => update('products', e.target.value)}
                  placeholder="e.g. ERP + POS" />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg border border-gray-200 p-3">
              <h2 className="mb-2 text-xs font-bold" style={{ color: primary }}>Description</h2>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-gray-400"
                placeholder="Opportunity description"
              />
            </div>
          </div>

          {/* RIGHT 2/5 — Customer & Contact + Remarks */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="rounded-lg border border-gray-200 p-3">
              <h2 className="mb-2.5 text-xs font-bold" style={{ color: primary }}>Customer &amp; Contact</h2>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">Customer Name</label>
                  <div className="min-h-[30px] rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
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
                  onChange={(e) => update('mobile', e.target.value)} />
                <InputField
                  label="Email"
                  fullWidth
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)} />
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-gray-600">Address</label>
                  <div className="min-h-[30px] rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                    {customerInfo.address || <span className="text-gray-400">Auto-filled from customer</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="flex flex-1 flex-col rounded-lg border border-gray-200 p-3">
              <h2 className="mb-2 text-xs font-bold" style={{ color: primary }}>Remarks</h2>
              <textarea
                value={form.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                rows={5}
                className="w-full rounded border border-gray-300 px-3 py-2 text-xs outline-none focus:border-gray-400"
                placeholder="Internal remarks or notes"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
