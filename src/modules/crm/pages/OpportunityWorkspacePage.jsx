import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOpportunity, setOpportunityStatus } from '../api/crmOpportunities.api';
import { listOpportunityStages } from '../api/crmOpportunityStages.api';
import { listCustomers } from '../../../services/customerEntry.api';
import { listStaffMembers } from '../../../services/staffEntry.api';
import { listLeads } from '../api/crmLeads.api';
import { listInteractions, createInteraction } from '../api/crmInteractions.api';
import { listFollowups, createFollowup, completeFollowup } from '../api/crmFollowups.api';
import { listNotes, createNote } from '../api/crmNotes.api';

const primary = '#790728';
const TABS = ['Summary', 'Interactions', 'Follow-ups', 'Notes', 'Linked Customer/Lead', 'Stage History'];

export default function OpportunityWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Summary');
  const [opp, setOpp] = useState(null);
  const [stages, setStages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [leads, setLeads] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interactionForm, setInteractionForm] = useState({ subject: '', interactionType: 'CALL', interactionMode: 'OUTBOUND', interactionSummary: '', outcome: '' });
  const [followupForm, setFollowupForm] = useState({ subject: '', followupDate: '', followupType: 'CALL', priority: 'MEDIUM' });
  const [noteForm, setNoteForm] = useState({ noteTitle: '', noteText: '' });

  const stageById = useMemo(() => new Map(stages.map((x) => [x.id, x.stageName || x.stage_name])), [stages]);
  const customerById = useMemo(() => new Map(customers.map((x) => [x.customerId, x])), [customers]);
  const staffById = useMemo(() => new Map(staff.map((x) => [x.staffId, x.staffName])), [staff]);
  const leadById = useMemo(() => new Map(leads.map((x) => [x.leadId || x.id, x])), [leads]);

  const stageName = opp?.opportunityStageId ? (stageById.get(opp.opportunityStageId) || `Stage #${opp.opportunityStageId}`) : '—';
  const customer = opp?.customerId ? customerById.get(opp.customerId) : null;
  const lead = opp?.leadId ? leadById.get(opp.leadId) : null;
  const assignedTo = opp?.assignedToStaffId ? (staffById.get(opp.assignedToStaffId) || String(opp.assignedToStaffId)) : '—';

  async function loadAll() {
    if (!id) return;
    setLoading(true);
    try {
      const opportunity = await getOpportunity(id);
      const [stageItems, customerRes, staffRes, leadItems, interactionItems, followupItems, noteItems] = await Promise.all([
        listOpportunityStages(),
        listCustomers({ limit: 500 }),
        listStaffMembers({ limit: 500 }),
        listLeads(),
        listInteractions({ opportunityId: opportunity.opportunityId }),
        listFollowups({ opportunityId: opportunity.opportunityId }),
        listNotes({ opportunityId: opportunity.opportunityId }),
      ]);
      setOpp(opportunity);
      setStages(stageItems);
      setCustomers(customerRes.data?.customers || []);
      setStaff(staffRes.data?.staff || []);
      setLeads(leadItems);
      setInteractions(interactionItems);
      setFollowups(followupItems);
      setNotes(noteItems);
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [id]);

  const markStatus = async (status) => {
    try {
      const reason = window.prompt(`Reason for marking ${status.toLowerCase()}?`) || '';
      await setOpportunityStatus(id, { status, reason });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const saveInteraction = async () => {
    try {
      await createInteraction({ ...interactionForm, opportunityId: opp?.opportunityId || null, staffId: opp?.assignedToStaffId || null });
      setInteractionForm({ subject: '', interactionType: 'CALL', interactionMode: 'OUTBOUND', interactionSummary: '', outcome: '' });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const saveFollowup = async () => {
    try {
      await createFollowup({ ...followupForm, opportunityId: opp?.opportunityId || null, assignedToStaffId: opp?.assignedToStaffId || null });
      setFollowupForm({ subject: '', followupDate: '', followupType: 'CALL', priority: 'MEDIUM' });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const saveNote = async () => {
    try {
      await createNote({ ...noteForm, opportunityId: opp?.opportunityId || null, staffId: opp?.assignedToStaffId || null });
      setNoteForm({ noteTitle: '', noteText: '' });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const stageHistory = [
    { label: stageName, date: opp?.createdAt ? String(opp.createdAt).slice(0, 10) : '—', note: 'Opportunity created' },
    ...(opp?.wonAt ? [{ label: 'WON', date: String(opp.wonAt).slice(0, 10), note: opp?.wonLostReason || 'Marked won' }] : []),
    ...(opp?.lostAt ? [{ label: 'LOST', date: String(opp.lostAt).slice(0, 10), note: opp?.wonLostReason || 'Marked lost' }] : []),
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <button type="button" onClick={() => navigate('/crm/opportunities')} className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        Back to Opportunity List
      </button>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>{opp?.opportunityName || 'Opportunity Workspace'}</h1>
              <span className="rounded px-2 py-1 text-[10px] font-semibold text-gray-700 bg-gray-200">{stageName}</span>
              <span className="rounded px-2 py-1 text-[10px] font-semibold text-amber-800 bg-amber-100">{opp?.priority || 'MEDIUM'}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-600">{customer?.customerName || '—'}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{loading ? 'Loading...' : `${opp?.opportunityCode || '—'} | Assigned to: ${assignedTo}`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate(`/crm/opportunity-entry/${id}`)} className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700">Edit Opportunity</button>
            <button type="button" onClick={() => markStatus('WON')} className="rounded border border-green-400 px-3 py-1.5 text-[11px] font-semibold text-green-700">Mark Won</button>
            <button type="button" onClick={() => markStatus('LOST')} className="rounded border border-red-300 px-3 py-1.5 text-[11px] font-semibold text-red-700">Mark Lost</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ['Source', opp?.sourceReference || '—'],
            ['Expected Value', `Rs ${Number(opp?.estimatedValue || 0).toLocaleString('en-IN')}`],
            ['Close Date', opp?.expectedCloseDate ? String(opp.expectedCloseDate).slice(0, 10) : '—'],
            ['Assigned To', assignedTo],
            ['Created Date', opp?.createdAt ? String(opp.createdAt).slice(0, 10) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-[10px] text-gray-500">{label}</div>
              <div className="mt-0.5 text-[13px] font-semibold text-gray-800">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className="rounded-t px-4 py-2 text-[11px] font-semibold" style={{ backgroundColor: active ? primary : '#F3F4F6', color: active ? '#fff' : '#374151' }}>
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'Summary' && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card title="Opportunity Details">
            {[
              ['Opp No', opp?.opportunityCode || '—'],
              ['Customer', customer?.customerName || '—'],
              ['Contact Person', opp?.contactPerson || '—'],
              ['Mobile', opp?.contactMobile || '—'],
              ['Email', opp?.contactEmail || '—'],
              ['Lead Ref', lead ? `${lead.leadCode} - ${lead.companyName || lead.leadName}` : '—'],
              ['Stage', stageName],
              ['Priority', opp?.priority || '—'],
              ['Probability', `${Number(opp?.probabilityPercent || 0)}%`],
              ['Source', opp?.sourceReference || '—'],
              ['Estimated Value', `Rs ${Number(opp?.estimatedValue || 0).toLocaleString('en-IN')}`],
              ['Expected Close', opp?.expectedCloseDate ? String(opp.expectedCloseDate).slice(0, 10) : '—'],
              ['Assigned To', assignedTo],
              ['Products / Services', opp?.productsText || '—'],
              ['Address', customer?.address || '—'],
              ['Description', opp?.description || '—'],
              ['Remarks', opp?.remarks || '—'],
            ].map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </Card>
          <Card title="Stage History">
            {stageHistory.map((item, index) => (
              <div key={`${item.label}-${index}`} className="border-b border-gray-100 py-2 text-xs last:border-b-0">
                <div className="font-semibold text-gray-800">{item.label}</div>
                <div className="text-gray-500">{item.date}</div>
                <div className="text-gray-600">{item.note}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === 'Interactions' && (
        <TabPanel
          title="Add Interaction"
          form={
            <>
              <FormInput label="Subject" value={interactionForm.subject} onChange={(v) => setInteractionForm((p) => ({ ...p, subject: v }))} />
              <FormInput label="Type" value={interactionForm.interactionType} onChange={(v) => setInteractionForm((p) => ({ ...p, interactionType: v.toUpperCase() }))} />
              <FormInput label="Mode" value={interactionForm.interactionMode} onChange={(v) => setInteractionForm((p) => ({ ...p, interactionMode: v.toUpperCase() }))} />
              <FormInput label="Outcome" value={interactionForm.outcome} onChange={(v) => setInteractionForm((p) => ({ ...p, outcome: v }))} />
              <FormText label="Summary" value={interactionForm.interactionSummary} onChange={(v) => setInteractionForm((p) => ({ ...p, interactionSummary: v }))} />
              <button type="button" onClick={saveInteraction} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Save Interaction</button>
            </>
          }
          items={interactions.map((item) => ({
            key: item.id,
            title: item.subject,
            meta: `${String(item.interactionDate || '').slice(0, 10)} · ${item.interactionType} · ${item.outcome || '—'}`,
            body: item.interactionSummary || '—',
          }))}
        />
      )}

      {activeTab === 'Follow-ups' && (
        <TabPanel
          title="Add Follow-up"
          form={
            <>
              <FormInput label="Subject" value={followupForm.subject} onChange={(v) => setFollowupForm((p) => ({ ...p, subject: v }))} />
              <FormInput label="Date" type="date" value={followupForm.followupDate} onChange={(v) => setFollowupForm((p) => ({ ...p, followupDate: v }))} />
              <FormInput label="Type" value={followupForm.followupType} onChange={(v) => setFollowupForm((p) => ({ ...p, followupType: v.toUpperCase() }))} />
              <FormInput label="Priority" value={followupForm.priority} onChange={(v) => setFollowupForm((p) => ({ ...p, priority: v.toUpperCase() }))} />
              <button type="button" onClick={saveFollowup} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Save Follow-up</button>
            </>
          }
          items={followups.map((item) => ({
            key: item.id,
            title: item.subject,
            meta: `${String(item.followupDate || '').slice(0, 10)} · ${item.priority} · ${item.status}`,
            body: (
              <button type="button" onClick={() => completeFollowup(item.id).then(loadAll).catch((err) => alert(err?.response?.data?.message || err.message))} className="rounded border border-gray-300 px-3 py-1 text-[10px] font-semibold text-gray-700">
                Mark Complete
              </button>
            ),
          }))}
        />
      )}

      {activeTab === 'Notes' && (
        <TabPanel
          title="Add Note"
          form={
            <>
              <FormInput label="Title" value={noteForm.noteTitle} onChange={(v) => setNoteForm((p) => ({ ...p, noteTitle: v }))} />
              <FormText label="Note" value={noteForm.noteText} onChange={(v) => setNoteForm((p) => ({ ...p, noteText: v }))} />
              <button type="button" onClick={saveNote} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Save Note</button>
            </>
          }
          items={notes.map((item) => ({
            key: item.id,
            title: item.noteTitle || 'Note',
            meta: String(item.noteDate || '').slice(0, 10),
            body: item.noteText,
          }))}
        />
      )}

      {activeTab === 'Linked Customer/Lead' && (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card title="Customer">
            {[
              ['Name', customer?.customerName || '—'],
              ['Contact', customer?.contactPerson || opp?.contactPerson || '—'],
              ['Mobile', customer?.mobileNo || opp?.contactMobile || '—'],
              ['Email', customer?.email || opp?.contactEmail || '—'],
              ['Address', customer?.address || '—'],
              ['Type', customer?.customerType || '—'],
            ].map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </Card>
          <Card title="Linked Lead">
            {[
              ['Lead No', lead?.leadCode || '—'],
              ['Lead Name', lead?.companyName || lead?.leadName || '—'],
              ['Source', opp?.sourceReference || '—'],
              ['Status', lead?.convertedOpportunityId ? 'Converted' : 'Open'],
              ['Converted On', lead?.convertedAt ? String(lead.convertedAt).slice(0, 10) : '—'],
              ['Converted By', assignedTo],
            ].map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </Card>
        </div>
      )}

      {activeTab === 'Stage History' && (
        <Card title="Stage History" className="mt-5">
          {stageHistory.map((item, index) => (
            <div key={`${item.label}-${index}`} className="border-b border-gray-100 py-2 text-xs last:border-b-0">
              <div className="font-semibold text-gray-800">{item.label}</div>
              <div className="text-gray-500">{item.date}</div>
              <div className="text-gray-600">{item.note}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-gray-200 p-4 ${className}`}>
      <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="text-xs">
      <span className="font-semibold text-gray-500">{label}: </span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text' }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-xs text-gray-800" />
    </label>
  );
}

function FormText({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
      {label}
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-xs text-gray-800" />
    </label>
  );
}

function TabPanel({ title, form, items }) {
  return (
    <div className="mt-5 space-y-4">
      <Card title={title}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{form}</div>
      </Card>
      <Card title="Activity">
        {items.length === 0 ? <div className="text-sm text-gray-500">No records yet.</div> : items.map((item) => (
          <div key={item.key} className="border-b border-gray-100 py-2 text-xs last:border-b-0">
            <div className="font-semibold text-gray-800">{item.title}</div>
            <div className="text-gray-500">{item.meta}</div>
            <div className="text-gray-600">{item.body}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
