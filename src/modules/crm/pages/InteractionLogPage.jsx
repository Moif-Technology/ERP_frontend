import React, { useEffect, useMemo, useState } from 'react';
import { InputField, DropdownInput, CommonTable } from '../../../shared/components/ui';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { listInteractions, createInteraction, deleteInteraction } from '../api/crmInteractions.api';
import { listCustomers } from '../../../services/customerEntry.api';
import { listLeads } from '../api/crmLeads.api';
import { listOpportunities } from '../api/crmOpportunities.api';
import { listStaffMembers } from '../../../services/staffEntry.api';

const primary = '#790728';
const LINKED_TYPE_OPT = ['Lead', 'Opportunity', 'Customer'];
const INTERACTION_TYPES = ['Call', 'Email', 'Meeting', 'Visit', 'Demo', 'Proposal', 'WhatsApp'];
const OUTCOME_OPTIONS = ['Positive', 'Neutral', 'Negative', 'No Response'];
const VIEW_OPTIONS = ['timeline', 'table'];
const INT_COL_PCT = [9, 8, 8, 18, 14, 18, 10, 8, 7];

function parseSelectedId(value) {
  const [raw] = String(value || '').split('|');
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function Badge({ label, bgColor, textColor }) {
  return <span className="inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: bgColor, color: textColor }}>{label}</span>;
}

function typeColor(type) {
  const map = {
    Call: { bg: '#DBEAFE', text: '#1D4ED8' },
    Email: { bg: '#DCFCE7', text: '#166534' },
    Meeting: { bg: '#FED7AA', text: '#9A3412' },
    Visit: { bg: '#EDE9FE', text: '#5B21B6' },
    Demo: { bg: '#CFFAFE', text: '#155E75' },
    Proposal: { bg: '#FEF9C3', text: '#713F12' },
    WhatsApp: { bg: '#DCFCE7', text: '#14532D' },
  };
  return map[type] || { bg: '#F3F4F6', text: '#374151' };
}

function InteractionDialog({ open, onClose, onSave, linkedOptionsByType, staffOptions }) {
  const [form, setForm] = useState({
    linkedType: 'Lead',
    linkedTo: '',
    type: 'Call',
    mode: 'Outbound',
    date: new Date().toISOString().slice(0, 10),
    time: '',
    subject: '',
    summary: '',
    outcome: 'Positive',
    nextAction: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        linkedType: 'Lead',
        linkedTo: '',
        type: 'Call',
        mode: 'Outbound',
        date: new Date().toISOString().slice(0, 10),
        time: '',
        subject: '',
        summary: '',
        outcome: 'Positive',
        nextAction: '',
        assignedTo: '',
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-bold" style={{ color: primary }}>Add Interaction</h2>
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
          <DropdownInput label="Linked Type" fullWidth value={form.linkedType} onChange={(v) => setForm((p) => ({ ...p, linkedType: v, linkedTo: '' }))} options={LINKED_TYPE_OPT} />
          <DropdownInput label="Linked To" fullWidth value={form.linkedTo} onChange={(v) => setForm((p) => ({ ...p, linkedTo: v }))} options={linkedOptionsByType[form.linkedType] || []} placeholder="Select..." />
          <DropdownInput label="Interaction Type" fullWidth value={form.type} onChange={(v) => setForm((p) => ({ ...p, type: v }))} options={INTERACTION_TYPES} />
          <InputField label="Mode" fullWidth value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))} />
          <InputField label="Date" type="date" fullWidth value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <InputField label="Time" type="time" fullWidth value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
          <div className="sm:col-span-2">
            <InputField label="Subject" fullWidth value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-gray-600">Summary</label>
            <textarea rows={3} value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-800" />
          </div>
          <DropdownInput label="Outcome" fullWidth value={form.outcome} onChange={(v) => setForm((p) => ({ ...p, outcome: v }))} options={OUTCOME_OPTIONS} />
          <InputField label="Next Action" fullWidth value={form.nextAction} onChange={(e) => setForm((p) => ({ ...p, nextAction: e.target.value }))} />
          <DropdownInput label="Assigned To" fullWidth value={form.assignedTo} onChange={(v) => setForm((p) => ({ ...p, assignedTo: v }))} options={staffOptions} placeholder="Select user" />
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-600">Cancel</button>
          <button type="button" onClick={() => onSave(form)} className="rounded px-4 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function InteractionLogPage() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');
  const [filters, setFilters] = useState({ linkedType: '', linkedSearch: '', interactionType: '', dateFrom: '', dateTo: '', assignedTo: '' });

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const linkedOptionsByType = useMemo(() => ({
    Lead: leads.map((x) => `${x.leadId || x.id}|${x.leadCode} - ${x.companyName || x.leadName}`),
    Opportunity: opportunities.map((x) => `${x.opportunityId || x.id}|${x.opportunityCode} - ${x.opportunityName}`),
    Customer: customers.map((x) => `${x.customerId}|${x.customerName}`),
  }), [customers, leads, opportunities]);
  const staffOptions = useMemo(() => staff.map((x) => `${x.staffId}|${x.staffName}`), [staff]);

  async function loadAll() {
    try {
      const [items, customerRes, leadItems, opportunityItems, staffRes] = await Promise.all([
        listInteractions({
          interactionType: filters.interactionType ? filters.interactionType.toUpperCase() : undefined,
          from: filters.dateFrom || undefined,
          to: filters.dateTo || undefined,
        }),
        listCustomers({ limit: 500 }),
        listLeads(),
        listOpportunities(),
        listStaffMembers({ limit: 500 }),
      ]);
      setRows(items);
      setCustomers(customerRes.data?.customers || []);
      setLeads(leadItems);
      setOpportunities(opportunityItems);
      setStaff(staffRes.data?.staff || []);
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const displayRows = useMemo(() => rows.map((row) => {
    let linkedType = '—';
    let linkedName = '—';
    if (row.customerId) {
      linkedType = 'Customer';
      linkedName = customers.find((x) => x.customerId === row.customerId)?.customerName || `Customer #${row.customerId}`;
    } else if (row.leadId) {
      linkedType = 'Lead';
      const item = leads.find((x) => (x.leadId || x.id) === row.leadId);
      linkedName = item ? `${item.leadCode} - ${item.companyName || item.leadName}` : `Lead #${row.leadId}`;
    } else if (row.opportunityId) {
      linkedType = 'Opportunity';
      const item = opportunities.find((x) => (x.opportunityId || x.id) === row.opportunityId);
      linkedName = item ? `${item.opportunityCode} - ${item.opportunityName}` : `Opportunity #${row.opportunityId}`;
    }
    return {
      id: row.id,
      date: String(row.interactionDate || '').slice(0, 10),
      time: String(row.interactionDate || '').slice(11, 16),
      type: row.interactionType ? `${row.interactionType[0]}${row.interactionType.slice(1).toLowerCase()}` : 'Call',
      mode: row.interactionMode ? `${row.interactionMode[0]}${row.interactionMode.slice(1).toLowerCase()}` : 'Phone',
      subject: row.subject,
      linkedType,
      linkedName,
      summary: row.interactionSummary || '',
      outcome: row.outcome || 'Neutral',
      nextAction: row.nextActionAt ? String(row.nextActionAt).slice(0, 10) : '',
      by: row.staffId ? (staff.find((x) => x.staffId === row.staffId)?.staffName || String(row.staffId)) : '—',
    };
  }).filter((row) => {
    if (filters.linkedType && row.linkedType !== filters.linkedType) return false;
    if (filters.assignedTo && row.by !== String(filters.assignedTo).split('|')[1]) return false;
    if (filters.linkedSearch && !row.linkedName.toLowerCase().includes(filters.linkedSearch.toLowerCase())) return false;
    return true;
  }), [rows, customers, leads, opportunities, staff, filters]);

  const saveDialog = async (form) => {
    try {
      const linkedId = parseSelectedId(form.linkedTo);
      await createInteraction({
        subject: form.subject,
        interactionType: form.type.toUpperCase(),
        interactionMode: form.mode.toUpperCase(),
        interactionDate: form.time ? `${form.date}T${form.time}:00` : form.date,
        interactionSummary: form.summary,
        outcome: form.outcome,
        nextActionAt: form.nextAction || null,
        staffId: parseSelectedId(form.assignedTo),
        customerId: form.linkedType === 'Customer' ? linkedId : null,
        leadId: form.linkedType === 'Lead' ? linkedId : null,
        opportunityId: form.linkedType === 'Opportunity' ? linkedId : null,
      });
      setDialogOpen(false);
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const tableBodyRows = displayRows.map((row) => {
    const color = typeColor(row.type);
    return [
      row.date,
      <Badge key={`type-${row.id}`} label={row.type} bgColor={color.bg} textColor={color.text} />,
      row.mode,
      row.subject,
      <div key={`linked-${row.id}`} className="flex flex-col gap-0.5"><span>{row.linkedName}</span><span className="text-[8px] text-gray-500">{row.linkedType}</span></div>,
      row.summary,
      row.outcome,
      row.by,
      <div key={`act-${row.id}`} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
        <button type="button" className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50"><img src={EditActionIcon} alt="Edit" className="h-3 w-3" /></button>
        <button type="button" onClick={() => deleteInteraction(row.id).then(loadAll).catch((err) => alert(err?.response?.data?.message || err.message))} className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50"><img src={DeleteActionIcon} alt="Delete" className="h-3 w-3" /></button>
      </div>,
    ];
  });

  return (
    <>
      <InteractionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={saveDialog} linkedOptionsByType={linkedOptionsByType} staffOptions={staffOptions} />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>INTERACTION LOG</h1>
            <p className="mt-1 text-xs text-gray-500">Full interaction timeline for leads and customers</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded border border-gray-300">
              {VIEW_OPTIONS.map((mode) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`px-3 py-1.5 text-[11px] font-semibold ${viewMode === mode ? 'text-white' : 'bg-white text-gray-600'}`} style={viewMode === mode ? { backgroundColor: primary } : undefined}>
                  {mode === 'timeline' ? 'Timeline' : 'Table'}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setDialogOpen(true)} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Add Interaction</button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <DropdownInput label="Linked Type" fullWidth value={filters.linkedType} onChange={(v) => setF('linkedType', v)} options={LINKED_TYPE_OPT} placeholder="All" />
            <InputField label="Linked Search" fullWidth value={filters.linkedSearch} onChange={(e) => setF('linkedSearch', e.target.value)} />
            <DropdownInput label="Interaction Type" fullWidth value={filters.interactionType} onChange={(v) => setF('interactionType', v)} options={INTERACTION_TYPES} placeholder="All" />
            <InputField label="Date From" type="date" fullWidth value={filters.dateFrom} onChange={(e) => setF('dateFrom', e.target.value)} />
            <InputField label="Date To" type="date" fullWidth value={filters.dateTo} onChange={(e) => setF('dateTo', e.target.value)} />
            <DropdownInput label="Assigned To" fullWidth value={filters.assignedTo} onChange={(v) => setF('assignedTo', v)} options={staffOptions} placeholder="All users" />
            <div className="flex items-end">
              <button type="button" onClick={loadAll} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Apply Filters</button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {viewMode === 'timeline' ? (
            <div className="space-y-3">
              {displayRows.length === 0 ? <div className="py-8 text-center text-sm text-gray-400">No interactions match the selected filters.</div> : displayRows.map((row) => {
                const color = typeColor(row.type);
                return (
                  <div key={row.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge label={row.type} bgColor={color.bg} textColor={color.text} />
                        <span className="text-[10px] text-gray-400">{row.mode}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{row.date} {row.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-gray-800">{row.subject}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{row.linkedName} · {row.linkedType}</p>
                    <p className="mt-1.5 text-[10px] text-gray-600">{row.summary}</p>
                    <p className="mt-1.5 text-[9px] text-gray-400">Outcome: {row.outcome} · By {row.by}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <CommonTable
                fitParentWidth
                allowHorizontalScroll={false}
                truncateHeader
                truncateBody
                columnWidthPercents={INT_COL_PCT}
                tableClassName="min-w-0 w-full"
                hideVerticalCellBorders
                cellAlign="center"
                headerFontSize="clamp(7px, 0.85vw, 10px)"
                headerTextColor="#6b7280"
                bodyFontSize="clamp(8px, 1vw, 10px)"
                cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
                bodyRowHeightRem={2.6}
                maxVisibleRows={10}
                headers={['Date', 'Type', 'Mode', 'Subject', 'Linked To', 'Summary', 'Outcome', 'By', 'Action']}
                rows={tableBodyRows}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
