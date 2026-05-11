import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputField } from '../../../shared/components/ui';
import { createOpportunity, getOpportunity, updateOpportunity } from '../api/crmOpportunities.api';
import { listOpportunityStages } from '../api/crmOpportunityStages.api';
import { listCustomers } from '../../../services/customerEntry.api';
import { listStaffMembers } from '../../../services/staffEntry.api';
import { listLeads } from '../api/crmLeads.api';

const primary = '#790728';
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const EMPTY_FORM = {
  customerId: '',
  leadId: '',
  stageId: '',
  opportunityName: '',
  probabilityPercent: '',
  estimatedValue: '',
  expectedCloseDate: '',
  assignedToStaffId: '',
  priority: 'MEDIUM',
  sourceReference: '',
  productsText: '',
  description: '',
  contactPerson: '',
  contactMobile: '',
  contactEmail: '',
  remarks: '',
};

export default function OpportunityEntryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [oppCode, setOppCode] = useState('AUTO');
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stages, setStages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const customer = useMemo(
    () => customers.find((x) => String(x.customerId) === String(form.customerId)) || null,
    [customers, form.customerId]
  );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [stageItems, customerRes, staffRes, leadItems] = await Promise.all([
          listOpportunityStages(),
          listCustomers({ limit: 500 }),
          listStaffMembers({ limit: 500 }),
          listLeads(),
        ]);
        setStages(stageItems);
        setCustomers(customerRes.data?.customers || []);
        setStaff(staffRes.data?.staff || []);
        setLeads(leadItems);

        if (isEdit) {
          const row = await getOpportunity(id);
          setOppCode(row.opportunityCode || 'AUTO');
          setForm({
            customerId: row.customerId || '',
            leadId: row.leadId || '',
            stageId: row.opportunityStageId || '',
            opportunityName: row.opportunityName || '',
            probabilityPercent: row.probabilityPercent != null ? String(row.probabilityPercent) : '',
            estimatedValue: row.estimatedValue != null ? String(row.estimatedValue) : '',
            expectedCloseDate: row.expectedCloseDate ? String(row.expectedCloseDate).slice(0, 10) : '',
            assignedToStaffId: row.assignedToStaffId || '',
            priority: row.priority || 'MEDIUM',
            sourceReference: row.sourceReference || '',
            productsText: row.productsText || '',
            description: row.description || '',
            contactPerson: row.contactPerson || '',
            contactMobile: row.contactMobile || '',
            contactEmail: row.contactEmail || '',
            remarks: row.remarks || '',
          });
        }
      } catch (err) {
        alert(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  useEffect(() => {
    if (!customer) return;
    setForm((prev) => ({
      ...prev,
      contactPerson: prev.contactPerson || customer.contactPerson || '',
      contactMobile: prev.contactMobile || customer.mobileNo || '',
      contactEmail: prev.contactEmail || customer.email || '',
    }));
  }, [customer]);

  const save = async (andNew = false) => {
    if (!form.opportunityName || !form.stageId) {
      alert('Opportunity title and stage are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerId: form.customerId ? Number(form.customerId) : null,
        leadId: form.leadId ? Number(form.leadId) : null,
        opportunityStageId: form.stageId ? Number(form.stageId) : null,
        opportunityName: form.opportunityName,
        probabilityPercent: form.probabilityPercent ? Number(form.probabilityPercent) : null,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        expectedCloseDate: form.expectedCloseDate || null,
        assignedToStaffId: form.assignedToStaffId ? Number(form.assignedToStaffId) : null,
        priority: form.priority,
        sourceReference: form.sourceReference || null,
        productsText: form.productsText || null,
        description: form.description || null,
        contactPerson: form.contactPerson || null,
        contactMobile: form.contactMobile || null,
        contactEmail: form.contactEmail || null,
        remarks: form.remarks || null,
      };
      if (isEdit) await updateOpportunity(id, payload);
      else await createOpportunity(payload);

      if (andNew && !isEdit) {
        setForm(EMPTY_FORM);
        setOppCode('AUTO');
      } else {
        navigate('/crm/opportunities');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>{isEdit ? 'EDIT OPPORTUNITY' : 'OPPORTUNITY ENTRY'}</h1>
          <p className="text-[10px] text-gray-500">{loading ? 'Loading...' : 'Create or update an opportunity record'}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => save(false)} disabled={saving} className="rounded px-4 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: primary }}>{saving ? 'Saving...' : 'Save'}</button>
          {!isEdit && (
            <button type="button" onClick={() => save(true)} disabled={saving} className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Save & New</button>
          )}
          <button type="button" onClick={() => navigate('/crm/opportunities')} className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-3">
          <section className="rounded-lg border border-gray-200 p-3">
            <h2 className="mb-3 text-xs font-bold" style={{ color: primary }}>Opportunity Information</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="Opp No" readOnly value={oppCode} />
              <InputField label="Opportunity Title" value={form.opportunityName} onChange={(e) => update('opportunityName', e.target.value)} />
              <SelectField label="Customer" value={form.customerId} onChange={(e) => update('customerId', e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((item) => <option key={item.customerId} value={item.customerId}>{item.customerName}</option>)}
              </SelectField>
              <SelectField label="Linked Lead" value={form.leadId} onChange={(e) => update('leadId', e.target.value)}>
                <option value="">None</option>
                {leads.map((item) => <option key={item.id} value={item.leadId || item.id}>{item.leadCode} - {item.companyName || item.leadName}</option>)}
              </SelectField>
              <SelectField label="Stage" value={form.stageId} onChange={(e) => update('stageId', e.target.value)}>
                <option value="">Select stage</option>
                {stages.map((item) => <option key={item.id} value={item.id}>{item.stageName || item.stage_name}</option>)}
              </SelectField>
              <InputField label="Probability %" type="number" value={form.probabilityPercent} onChange={(e) => update('probabilityPercent', e.target.value)} />
              <InputField label="Estimated Value" type="number" value={form.estimatedValue} onChange={(e) => update('estimatedValue', e.target.value)} />
              <InputField label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={(e) => update('expectedCloseDate', e.target.value)} />
              <SelectField label="Assigned To" value={form.assignedToStaffId} onChange={(e) => update('assignedToStaffId', e.target.value)}>
                <option value="">Select user</option>
                {staff.map((item) => <option key={item.staffId} value={item.staffId}>{item.staffName} ({item.staffId})</option>)}
              </SelectField>
              <SelectField label="Priority" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                {PRIORITY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </SelectField>
              <InputField label="Source Reference" value={form.sourceReference} onChange={(e) => update('sourceReference', e.target.value)} />
              <InputField label="Products / Services" value={form.productsText} onChange={(e) => update('productsText', e.target.value)} />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-3">
            <h2 className="mb-2 text-xs font-bold" style={{ color: primary }}>Description</h2>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400" />
          </section>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 p-3">
            <h2 className="mb-3 text-xs font-bold" style={{ color: primary }}>Customer & Contact</h2>
            <div className="space-y-3">
              <ReadonlyField label="Customer Name" value={customer?.customerName || 'Auto-filled from selected customer'} muted={!customer} />
              <InputField label="Contact Person" fullWidth value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
              <InputField label="Mobile" fullWidth value={form.contactMobile} onChange={(e) => update('contactMobile', e.target.value)} />
              <InputField label="Email" fullWidth value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
              <ReadonlyField label="Address" value={customer?.address || 'Auto-filled from selected customer'} muted={!customer} />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 p-3">
            <h2 className="mb-2 text-xs font-bold" style={{ color: primary }}>Remarks</h2>
            <textarea value={form.remarks} onChange={(e) => update('remarks', e.target.value)} rows={6} className="w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400" />
          </section>
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-600">{label}</label>
      <select {...props} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-[11px] text-gray-800 outline-none focus:border-gray-400">
        {children}
      </select>
    </div>
  );
}

function ReadonlyField({ label, value, muted = false }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-gray-600">{label}</label>
      <div className={`min-h-[30px] rounded border border-gray-200 px-3 py-1.5 text-xs ${muted ? 'bg-gray-50 text-gray-400' : 'bg-gray-50 text-gray-700'}`}>
        {value}
      </div>
    </div>
  );
}
