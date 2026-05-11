import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { getLead } from '../api/crmLeads.api';
import { listLeadSources } from '../api/crmLeadSources.api';
import { listLeadStatuses } from '../api/crmLeadStatuses.api';
import { listInteractions, createInteraction } from '../api/crmInteractions.api';
import { listFollowups, createFollowup, completeFollowup } from '../api/crmFollowups.api';
import { listNotes, createNote } from '../api/crmNotes.api';
import { listOpportunities } from '../api/crmOpportunities.api';
import { listStaffMembers } from '../../../services/staffEntry.api';

export default function LeadWorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const primary = colors.primary?.main || '#790728';

  const [activeTab, setActiveTab] = useState('Summary');
  const [lead, setLead] = useState(null);
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interactionForm, setInteractionForm] = useState({ subject: '', interactionType: 'CALL', interactionMode: 'OUTBOUND', interactionSummary: '', outcome: '' });
  const [followupForm, setFollowupForm] = useState({ subject: '', followupDate: '', followupType: 'CALL', priority: 'MEDIUM' });
  const [noteForm, setNoteForm] = useState({ noteTitle: '', noteText: '' });

  const tabs = ['Summary', 'Interactions', 'Follow-ups', 'Notes', 'Linked Opportunity', 'Conversion History'];

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const leadRow = await getLead(id);
        const [src, st, opps, staffRes, interactionItems, followupItems, noteItems] = await Promise.all([
          listLeadSources(),
          listLeadStatuses(),
          listOpportunities(),
          listStaffMembers({ limit: 500 }),
          listInteractions({ leadId: leadRow.leadId }),
          listFollowups({ leadId: leadRow.leadId }),
          listNotes({ leadId: leadRow.leadId }),
        ]);
        setLead(leadRow);
        setSources(src);
        setStatuses(st);
        setOpportunities(opps);
        setStaff(staffRes.data?.staff || []);
        setInteractions(interactionItems);
        setFollowups(followupItems);
        setNotes(noteItems);
      } catch (err) {
        alert(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const sourceName = useMemo(() => {
    if (!lead?.leadSourceId) return '—';
    const item = sources.find((x) => x.id === lead.leadSourceId);
    return item ? (item.sourceName || item.source_name) : '—';
  }, [lead, sources]);

  const statusName = useMemo(() => {
    if (!lead?.leadStatusId) return '—';
    const item = statuses.find((x) => x.id === lead.leadStatusId);
    return item ? (item.statusName || item.status_name) : '—';
  }, [lead, statuses]);

  const linkedOpportunity = useMemo(
    () => opportunities.find((x) => (x.opportunityId || x.id) === lead?.convertedOpportunityId) || null,
    [opportunities, lead]
  );
  const assignedTo = lead?.assignedToStaffId ? (staff.find((x) => x.staffId === lead.assignedToStaffId)?.staffName || String(lead.assignedToStaffId)) : '—';

  const saveInteraction = async () => {
    try {
      await createInteraction({ ...interactionForm, leadId: lead?.leadId || null, staffId: lead?.assignedToStaffId || null });
      setInteractionForm({ subject: '', interactionType: 'CALL', interactionMode: 'OUTBOUND', interactionSummary: '', outcome: '' });
      setInteractions(await listInteractions({ leadId: lead?.leadId }));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const saveFollowup = async () => {
    try {
      await createFollowup({ ...followupForm, leadId: lead?.leadId || null, assignedToStaffId: lead?.assignedToStaffId || null });
      setFollowupForm({ subject: '', followupDate: '', followupType: 'CALL', priority: 'MEDIUM' });
      setFollowups(await listFollowups({ leadId: lead?.leadId }));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const saveNote = async () => {
    try {
      await createNote({ ...noteForm, leadId: lead?.leadId || null, staffId: lead?.assignedToStaffId || null });
      setNoteForm({ noteTitle: '', noteText: '' });
      setNotes(await listNotes({ leadId: lead?.leadId }));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const nextFollowup = lead?.nextFollowupAt ? String(lead.nextFollowupAt).slice(0, 10) : '—';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <button type="button" onClick={() => navigate('/crm/leads')} className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        Back to Lead List
      </button>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>LEAD WORKSPACE</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{lead?.companyName || lead?.leadName || '—'}</span>
            {statusName !== '—' && <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">{statusName}</span>}
            {lead?.priority && <span className="rounded bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">{lead.priority}</span>}
          </div>
          <p className="mt-1 text-xs text-gray-500">{loading ? 'Loading...' : `Lead No: ${lead?.leadCode || '—'} | Assigned to: ${assignedTo}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate(`/crm/lead-entry/${id}`)} className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700">Edit Lead</button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Source" value={sourceName} />
        <SummaryCard label="Status" value={statusName} />
        <SummaryCard label="Next Follow-up" value={nextFollowup} />
        <SummaryCard label="Linked Opportunity" value={linkedOpportunity ? linkedOpportunity.opportunityCode : 'Not Linked'} />
      </div>

      <div className="mt-5 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
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
          <Panel title="Lead Summary" primary={primary}>
            {[
              ['Lead Name', lead?.companyName || '—'],
              ['Contact Person', lead?.leadName || '—'],
              ['Mobile', lead?.mobileNo || '—'],
              ['WhatsApp', lead?.whatsappNo || '—'],
              ['Email', lead?.email || '—'],
              ['Status', statusName],
              ['Source', sourceName],
              ['Priority', lead?.priority || '—'],
              ['Expected Value', lead?.expectedValue ?? '—'],
              ['Probability %', lead?.probabilityPercent ?? '—'],
            ].map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </Panel>
          <Panel title="Address & Remarks" primary={primary}>
            {[
              ['Address', lead?.address || '—'],
              ['City', lead?.city || '—'],
              ['Country', lead?.country || '—'],
              ['Remarks', lead?.remarks || '—'],
            ].map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
          </Panel>
        </div>
      )}

      {activeTab === 'Interactions' && (
        <DataTab
          title="Add Interaction"
          primary={primary}
          form={
            <>
              <TabInput label="Subject" value={interactionForm.subject} onChange={(v) => setInteractionForm((p) => ({ ...p, subject: v }))} />
              <TabInput label="Type" value={interactionForm.interactionType} onChange={(v) => setInteractionForm((p) => ({ ...p, interactionType: v.toUpperCase() }))} />
              <TabText label="Summary" value={interactionForm.interactionSummary} onChange={(v) => setInteractionForm((p) => ({ ...p, interactionSummary: v }))} />
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
        <DataTab
          title="Add Follow-up"
          primary={primary}
          form={
            <>
              <TabInput label="Subject" value={followupForm.subject} onChange={(v) => setFollowupForm((p) => ({ ...p, subject: v }))} />
              <TabInput label="Date" type="date" value={followupForm.followupDate} onChange={(v) => setFollowupForm((p) => ({ ...p, followupDate: v }))} />
              <button type="button" onClick={saveFollowup} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Save Follow-up</button>
            </>
          }
          items={followups.map((item) => ({
            key: item.id,
            title: item.subject,
            meta: `${String(item.followupDate || '').slice(0, 10)} · ${item.priority} · ${item.status}`,
            body: <button type="button" onClick={() => completeFollowup(item.id).then(() => listFollowups({ leadId: lead?.leadId }).then(setFollowups)).catch((err) => alert(err?.response?.data?.message || err.message))} className="rounded border border-gray-300 px-3 py-1 text-[10px] font-semibold text-gray-700">Complete</button>,
          }))}
        />
      )}

      {activeTab === 'Notes' && (
        <DataTab
          title="Add Note"
          primary={primary}
          form={
            <>
              <TabInput label="Title" value={noteForm.noteTitle} onChange={(v) => setNoteForm((p) => ({ ...p, noteTitle: v }))} />
              <TabText label="Note" value={noteForm.noteText} onChange={(v) => setNoteForm((p) => ({ ...p, noteText: v }))} />
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

      {activeTab === 'Linked Opportunity' && (
        <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          {linkedOpportunity ? `${linkedOpportunity.opportunityCode} - ${linkedOpportunity.opportunityName}` : 'No linked opportunity found'}
        </div>
      )}

      {activeTab === 'Conversion History' && (
        <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          {lead?.convertedAt ? `Converted at ${String(lead.convertedAt).slice(0, 10)}` : (lead?.lostAt ? `Lost at ${String(lead.lostAt).slice(0, 10)}` : 'No conversion history available')}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function Panel({ title, primary, children }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-bold" style={{ color: primary }}>{title}</h2>
      <div className="mt-3 space-y-2 text-xs">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="font-semibold text-gray-600">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function TabInput({ label, value, onChange, type = 'text' }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-xs text-gray-800" />
    </label>
  );
}

function TabText({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
      {label}
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-xs text-gray-800" />
    </label>
  );
}

function DataTab({ title, primary, form, items }) {
  return (
    <div className="mt-5 space-y-4">
      <Panel title={title} primary={primary}><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{form}</div></Panel>
      <Panel title="Records" primary={primary}>
        {items.length === 0 ? <div className="text-sm text-gray-500">No records yet.</div> : items.map((item) => (
          <div key={item.key} className="border-b border-gray-100 py-2 last:border-b-0">
            <div className="font-semibold text-gray-800">{item.title}</div>
            <div className="text-gray-500">{item.meta}</div>
            <div className="text-gray-600">{item.body}</div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
