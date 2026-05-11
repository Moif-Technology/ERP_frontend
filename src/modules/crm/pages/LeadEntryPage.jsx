import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import { createLead, updateLead, getLead } from '../api/crmLeads.api';
import { listLeadSources } from '../api/crmLeadSources.api';
import { listLeadStatuses } from '../api/crmLeadStatuses.api';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const EMPTY_FORM = {
  leadName: '',
  contactPerson: '',
  source: '',
  status: '',
  priority: 'MEDIUM',
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
};

export default function LeadEntryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const primary = colors.primary?.main || '#790728';

  const [form, setForm] = useState(EMPTY_FORM);
  const [leadCode, setLeadCode] = useState('AUTO');
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const sourceOptions = useMemo(() => sources.map((s) => s.sourceName || s.source_name).filter(Boolean), [sources]);
  const statusOptions = useMemo(() => statuses.map((s) => s.statusName || s.status_name).filter(Boolean), [statuses]);

  const customerTypeOptions = ['Retail', 'Wholesale', 'Corporate', 'Garage'];
  const industryOptions = ['Retail', 'Automotive', 'Trading', 'Manufacturing', 'Services'];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [src, st] = await Promise.all([listLeadSources(), listLeadStatuses()]);
        setSources(src);
        setStatuses(st);
        if (isEdit) {
          const r = await getLead(id);
          setLeadCode(r.leadCode || 'AUTO');
          const sourceName = r.leadSourceId ? src.find((x) => x.id === r.leadSourceId) : null;
          const statusName = r.leadStatusId ? st.find((x) => x.id === r.leadStatusId) : null;
          setForm({
            ...EMPTY_FORM,
            leadName: r.companyName || '',
            contactPerson: r.leadName || '',
            source: sourceName ? (sourceName.sourceName || sourceName.source_name) : '',
            status: statusName ? (statusName.statusName || statusName.status_name) : '',
            priority: r.priority || 'MEDIUM',
            assignedTo: r.assignedToStaffId ? String(r.assignedToStaffId) : '',
            mobile: r.mobileNo || '',
            email: r.email || '',
            address1: r.address || '',
            city: r.city || '',
            country: r.country || '',
            estimatedValue: r.expectedValue != null ? String(r.expectedValue) : '',
            expectedCloseDate: r.nextFollowupAt ? String(r.nextFollowupAt).slice(0, 10) : '',
            remarks: r.remarks || '',
          });
        }
      } catch (err) {
        alert(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = () => {
    const sourceObj = sources.find((s) => (s.sourceName || s.source_name) === form.source);
    const statusObj = statuses.find((s) => (s.statusName || s.status_name) === form.status);
    const addr = [form.address1, form.address2].filter(Boolean).join(', ') || null;
    return {
      leadName: form.contactPerson || form.leadName,
      companyName: form.leadName || null,
      mobileNo: form.mobile || null,
      whatsappNo: form.altMobile || null,
      email: form.email || null,
      leadSourceId: sourceObj ? sourceObj.id : null,
      leadStatusId: statusObj ? statusObj.id : null,
      assignedToStaffId: form.assignedTo && /^\d+$/.test(form.assignedTo) ? Number(form.assignedTo) : null,
      expectedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
      priority: form.priority || 'MEDIUM',
      nextFollowupAt: form.expectedCloseDate || null,
      address: addr,
      city: form.city || null,
      country: form.country || null,
      remarks: form.remarks || null,
    };
  };

  const handleSave = async (andNew = false) => {
    if (!form.contactPerson && !form.leadName) {
      alert('Lead name or contact person is required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateLead(id, payload);
      } else {
        await createLead(payload);
      }
      if (andNew) {
        setForm(EMPTY_FORM);
        setLeadCode('AUTO');
        if (isEdit) navigate('/crm/lead-entry');
      } else {
        navigate('/crm/leads');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            {isEdit ? 'EDIT LEAD' : 'LEAD ENTRY'}
          </h1>
          <p className="mt-1 text-xs text-gray-500">{loading ? 'Loading...' : 'Create or update CRM lead details'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleSave(false)} disabled={saving} className="rounded px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: primary }}>
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
          <button type="button" onClick={() => navigate('/crm/leads')} className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700">Cancel</button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-bold" style={{ color: primary }}>Basic Information</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Lead no" fullWidth readOnly value={leadCode} />
            <InputField label="Lead name / Company name" fullWidth value={form.leadName} onChange={(e) => update('leadName', e.target.value)} />
            <InputField label="Contact person" fullWidth value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
            <DropdownInput label="Lead source" fullWidth value={form.source} onChange={(v) => update('source', v)} options={sourceOptions} placeholder="Select source" />
            <DropdownInput label="Lead status" fullWidth value={form.status} onChange={(v) => update('status', v)} options={statusOptions} placeholder="Select status" />
            <DropdownInput label="Priority" fullWidth value={form.priority} onChange={(v) => update('priority', v)} options={PRIORITY_OPTIONS} placeholder="Select priority" />
            <InputField label="Assigned to (staff id)" fullWidth value={form.assignedTo} onChange={(e) => update('assignedTo', e.target.value)} />
            <InputField label="Estimated value" type="number" fullWidth value={form.estimatedValue} onChange={(e) => update('estimatedValue', e.target.value)} />
            <InputField label="Next follow-up date" type="date" fullWidth value={form.expectedCloseDate} onChange={(e) => update('expectedCloseDate', e.target.value)} />
            <DropdownInput label="Customer type" fullWidth value={form.customerType} onChange={(v) => update('customerType', v)} options={customerTypeOptions} placeholder="Select type" />
            <DropdownInput label="Industry" fullWidth value={form.industry} onChange={(v) => update('industry', v)} options={industryOptions} placeholder="Select industry" />
            <InputField label="Interested product/service" fullWidth value={form.interestedProduct} onChange={(e) => update('interestedProduct', e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-bold" style={{ color: primary }}>Contact Information</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Mobile" fullWidth value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
            <InputField label="WhatsApp / Alt mobile" fullWidth value={form.altMobile} onChange={(e) => update('altMobile', e.target.value)} />
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
        <button type="button" onClick={() => handleSave(false)} disabled={saving} className="rounded px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: primary }}>
          {saving ? 'Saving...' : 'Save Lead'}
        </button>
        {!isEdit && (
          <button type="button" onClick={() => handleSave(true)} disabled={saving} className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700 disabled:opacity-50">
            Save & New
          </button>
        )}
      </div>
    </div>
  );
}
