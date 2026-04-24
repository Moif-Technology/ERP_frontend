import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, DropdownInput, CommonTable } from '../../../shared/components/ui';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';

const primary = '#790728';

// ─── Sample data ─────────────────────────────────────────────────────────────
const SAMPLE_INTERACTIONS = [
  { id: 1,  date: '2026-04-22', time: '09:15', type: 'Call',     mode: 'Outbound',  subject: 'Initial qualification call',        linkedType: 'Lead',        linkedName: 'Blue Star Garage',    summary: 'Discussed product requirements and pricing expectations. Customer showed interest in annual contract.', outcome: 'Positive',     nextAction: 'Send proposal by 25 Apr', by: 'Ahmed' },
  { id: 2,  date: '2026-04-22', time: '10:45', type: 'Email',    mode: 'Outbound',  subject: 'Product catalogue shared',          linkedType: 'Lead',        linkedName: 'TechWave Solutions',  summary: 'Sent full product catalogue and pricing sheet. Requested confirmation of receipt.', outcome: 'Neutral',      nextAction: 'Follow up if no reply by 24 Apr', by: 'Priya' },
  { id: 3,  date: '2026-04-22', time: '14:00', type: 'Meeting',  mode: 'Inbound',   subject: 'Quarterly review meeting',          linkedType: 'Customer',    linkedName: 'Al Noor Trading',     summary: 'Reviewed Q1 order volumes and discussed expansion into new product lines. Decision deferred.', outcome: 'Neutral',      nextAction: 'Prepare Q2 projection report', by: 'Ahmed' },
  { id: 4,  date: '2026-04-23', time: '09:00', type: 'Call',     mode: 'Inbound',   subject: 'Support enquiry on order #5021',    linkedType: 'Customer',    linkedName: 'Prime Logistics',     summary: 'Customer called regarding delay in delivery. Escalated to operations team for resolution.', outcome: 'Negative',     nextAction: 'Confirm delivery date by EOD', by: 'Ravi' },
  { id: 5,  date: '2026-04-23', time: '11:30', type: 'Demo',     mode: 'Outbound',  subject: 'ERP demo – Finance module',         linkedType: 'Opportunity', linkedName: 'Gulf Auto Parts',     summary: 'Conducted live demo of finance and procurement modules. Positive reception from CFO.', outcome: 'Positive',     nextAction: 'Share ROI document', by: 'Priya' },
  { id: 6,  date: '2026-04-23', time: '13:00', type: 'Visit',    mode: 'Outbound',  subject: 'On-site needs assessment',          linkedType: 'Lead',        linkedName: 'Falcon Industries',   summary: 'Visited warehouse and assessed current manual processes. Identified 3 automation opportunities.', outcome: 'Positive',     nextAction: 'Draft solution proposal', by: 'Ahmed' },
  { id: 7,  date: '2026-04-21', time: '15:00', type: 'Proposal', mode: 'Outbound',  subject: 'Commercial proposal submitted',     linkedType: 'Opportunity', linkedName: 'Skyline Contracting', summary: 'Submitted detailed commercial proposal for 3-year contract. Awaiting management approval.', outcome: 'Neutral',      nextAction: 'Schedule decision call', by: 'Priya' },
  { id: 8,  date: '2026-04-21', time: '16:30', type: 'WhatsApp', mode: 'Outbound',  subject: 'Quick update on contract status',   linkedType: 'Opportunity', linkedName: 'Horizon Real Estate', summary: 'Sent WhatsApp message to procurement head with contract summary PDF.', outcome: 'No Response',  nextAction: 'Call if no reply by 24 Apr', by: 'Ravi' },
  { id: 9,  date: '2026-04-20', time: '10:00', type: 'Email',    mode: 'Inbound',   subject: 'Customer complaint – billing error', linkedType: 'Customer',   linkedName: 'Nova Electronics',    summary: 'Received email regarding a billing discrepancy of AED 1,200. Referred to accounts team.', outcome: 'Negative',     nextAction: 'Issue credit note', by: 'Priya' },
  { id: 10, date: '2026-04-20', time: '11:15', type: 'Meeting',  mode: 'Outbound',  subject: 'Partnership discussion',            linkedType: 'Customer',    linkedName: 'Al Rawabi Group',     summary: 'Met with GM to discuss potential distribution partnership for new product line in the Northern region.', outcome: 'Positive', nextAction: 'Draft MOU for review', by: 'Ahmed' },
];

const SAMPLE_LINKED = {
  Lead:        ['Blue Star Garage', 'TechWave Solutions', 'Falcon Industries'],
  Opportunity: ['Gulf Auto Parts', 'Skyline Contracting', 'Horizon Real Estate'],
  Customer:    ['Al Noor Trading', 'Prime Logistics', 'Al Rawabi Group', 'Nova Electronics'],
};

const INTERACTION_TYPES = ['Call', 'Email', 'Meeting', 'Visit', 'Demo', 'Proposal', 'WhatsApp'];
const MODE_OPTIONS      = ['Inbound', 'Outbound'];
const OUTCOME_OPTIONS   = ['Positive', 'Neutral', 'Negative', 'No Response'];
const ASSIGNED_OPTIONS  = ['Ahmed', 'Priya', 'Ravi'];
const LINKED_TYPE_OPT   = ['Lead', 'Opportunity', 'Customer'];

const ALL_INTERACTION_TYPES_FILTER = ['All', ...INTERACTION_TYPES];

// ─── Color helpers ────────────────────────────────────────────────────────────
function typeColor(type) {
  const MAP = {
    Call:     { dot: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
    Email:    { dot: '#22C55E', bg: '#DCFCE7', text: '#166534' },
    Meeting:  { dot: '#F97316', bg: '#FED7AA', text: '#9A3412' },
    Visit:    { dot: '#A855F7', bg: '#EDE9FE', text: '#5B21B6' },
    Demo:     { dot: '#06B6D4', bg: '#CFFAFE', text: '#155E75' },
    Proposal: { dot: '#EAB308', bg: '#FEF9C3', text: '#713F12' },
    WhatsApp: { dot: '#16A34A', bg: '#DCFCE7', text: '#14532D' },
  };
  return MAP[type] ?? { dot: '#9CA3AF', bg: '#F3F4F6', text: '#374151' };
}

function outcomeBadgeStyle(val) {
  if (val === 'Positive')    return { background: '#DCFCE7', color: '#166534' };
  if (val === 'Negative')    return { background: '#FEE2E2', color: '#991B1B' };
  if (val === 'No Response') return { background: '#F3F4F6', color: '#6B7280' };
  return                            { background: '#FEF3C7', color: '#92400E' };
}

function Badge({ label, bgColor, textColor }) {
  return (
    <span
      className="inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold"
      style={{ background: bgColor, color: textColor }}
    >
      {label}
    </span>
  );
}

// ─── Add Interaction Dialog ───────────────────────────────────────────────────
const EMPTY_FORM = {
  linkedType: 'Lead', linkedTo: '', type: 'Call', mode: 'Outbound',
  date: '2026-04-23', time: '', subject: '', summary: '',
  outcome: 'Positive', nextAction: '', assignedTo: '',
};

function InteractionDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  React.useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const linkedOptions = SAMPLE_LINKED[form.linkedType] ?? [];

  const handleSave = () => {
    console.log('[InteractionLogPage] Save interaction:', form);
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-bold" style={{ color: primary }}>Add Interaction</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DropdownInput label="Linked To Type" fullWidth value={form.linkedType} onChange={(v) => set('linkedType', v)} options={LINKED_TYPE_OPT} />
            <DropdownInput label="Linked To"      fullWidth value={form.linkedTo}   onChange={(v) => set('linkedTo', v)}   options={linkedOptions} placeholder="Select…" />
            <DropdownInput label="Interaction Type" fullWidth value={form.type} onChange={(v) => set('type', v)} options={INTERACTION_TYPES} />
            <DropdownInput label="Mode"           fullWidth value={form.mode}       onChange={(v) => set('mode', v)}       options={MODE_OPTIONS} />
            <InputField    label="Date"  type="date" fullWidth value={form.date}    onChange={(e) => set('date',  e.target.value)} />
            <InputField    label="Time"  type="time" fullWidth value={form.time}    onChange={(e) => set('time',  e.target.value)} />

            {/* Subject – full width */}
            <div className="sm:col-span-2">
              <InputField label="Subject" fullWidth value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Interaction subject" />
            </div>

            {/* Summary – full width */}
            <div className="sm:col-span-2">
              <label className="mb-0.5 block text-[9px] leading-tight text-gray-600 sm:text-[11px]">Summary</label>
              <textarea
                rows={3}
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-[9px] outline-none sm:text-[10px]"
                placeholder="Brief summary of the interaction…"
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
              />
            </div>

            <DropdownInput label="Outcome" fullWidth value={form.outcome} onChange={(v) => set('outcome', v)} options={OUTCOME_OPTIONS} />
            <InputField    label="Next Action" fullWidth value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)} placeholder="e.g. Send proposal" />
            <DropdownInput label="Assigned To" fullWidth value={form.assignedTo} onChange={(v) => set('assignedTo', v)} options={ASSIGNED_OPTIONS} placeholder="Select user" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded px-4 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Entry Card ──────────────────────────────────────────────────────
function TimelineCard({ entry }) {
  const tc = typeColor(entry.type);
  return (
    <div className="flex gap-3">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 rounded-full border-2 border-white ring-2 flex-shrink-0" style={{ backgroundColor: tc.dot, ringColor: tc.dot }} />
        <div className="flex-1 w-0.5 mt-1" style={{ backgroundColor: tc.dot + '40', minHeight: '2rem' }} />
      </div>

      {/* Card */}
      <div className="mb-4 flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        {/* Top row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge label={entry.type} bgColor={tc.bg} textColor={tc.text} />
            <Badge
              label={entry.mode}
              bgColor={entry.mode === 'Inbound' ? '#DBEAFE' : '#F3F4F6'}
              textColor={entry.mode === 'Inbound' ? '#1D4ED8' : '#374151'}
            />
          </div>
          <span className="text-[10px] text-gray-400">{entry.date} &nbsp;{entry.time}</span>
        </div>

        {/* Subject */}
        <p className="mt-1.5 text-[11px] font-semibold text-gray-800">{entry.subject}</p>

        {/* Linked to */}
        <p className="mt-0.5 text-[10px] text-gray-400">
          <span className="font-medium" style={{ color: primary }}>{entry.linkedName}</span>
          &nbsp;&middot;&nbsp;{entry.linkedType}
        </p>

        {/* Summary */}
        <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-gray-600">{entry.summary}</p>

        {/* Outcome + Next action */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[9px] text-gray-500">
            Outcome:&nbsp;
            <span className="inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold" style={outcomeBadgeStyle(entry.outcome)}>
              {entry.outcome}
            </span>
          </span>
          {entry.nextAction && (
            <span className="text-[9px] text-gray-400">Next: <span className="text-gray-600">{entry.nextAction}</span></span>
          )}
        </div>

        {/* By */}
        <p className="mt-1.5 text-[9px] text-gray-400">By <span className="font-medium text-gray-600">{entry.by}</span></p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const INT_COL_PCT = [9, 8, 8, 18, 14, 18, 10, 8, 7];

export default function InteractionLogPage() {
  const navigate = useNavigate();

  const [rows, setRows]           = useState(SAMPLE_INTERACTIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode]   = useState('timeline'); // 'timeline' | 'table'
  const [successMsg, setSuccessMsg] = useState('');

  const [filters, setFilters] = useState({
    linkedType: '',
    linkedSearch: '',
    interactionType: '',
    dateFrom: '',
    dateTo: '',
    assignedTo: '',
  });

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  // ── Filtered ──
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.linkedType      && r.linkedType !== filters.linkedType) return false;
      if (filters.interactionType && filters.interactionType !== 'All' && r.type !== filters.interactionType) return false;
      if (filters.assignedTo      && r.by !== filters.assignedTo)         return false;
      if (filters.linkedSearch) {
        const s = filters.linkedSearch.toLowerCase();
        if (!r.linkedName.toLowerCase().includes(s)) return false;
      }
      if (filters.dateFrom && r.date < filters.dateFrom) return false;
      if (filters.dateTo   && r.date > filters.dateTo)   return false;
      return true;
    });
  }, [rows, filters]);

  // ── Dialog ──
  const openDialog  = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const handleSave = (form) => {
    const newEntry = {
      ...form,
      id: Date.now(),
      linkedName: form.linkedTo,
    };
    setRows((prev) => [newEntry, ...prev]);
    closeDialog();
    setSuccessMsg('Interaction logged.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id) => {
    console.log('[InteractionLogPage] Delete interaction id:', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Table rows ──
  const tableBodyRows = filteredRows.map((row) => {
    const tc = typeColor(row.type);
    return [
      <span key={`d-${row.id}`}  style={{ fontSize: 'clamp(8px,1vw,10px)' }}>{row.date}</span>,
      <Badge key={`t-${row.id}`}  label={row.type} bgColor={tc.bg} textColor={tc.text} />,
      <Badge key={`m-${row.id}`}  label={row.mode}
        bgColor={row.mode === 'Inbound' ? '#DBEAFE' : '#F3F4F6'}
        textColor={row.mode === 'Inbound' ? '#1D4ED8' : '#374151'} />,
      <span key={`s-${row.id}`}  className="font-medium" style={{ fontSize: 'clamp(8px,1vw,10px)' }}>{row.subject}</span>,
      <div key={`l-${row.id}`}  className="flex flex-col gap-0.5">
        <span style={{ fontSize: 'clamp(8px,1vw,10px)', fontWeight: 500 }}>{row.linkedName}</span>
        <span style={{ fontSize: '8px', color: '#6B7280' }}>{row.linkedType}</span>
      </div>,
      <span key={`su-${row.id}`} className="line-clamp-2" style={{ fontSize: 'clamp(8px,1vw,10px)', color: '#4B5563' }}>{row.summary}</span>,
      <span key={`o-${row.id}`}  className="inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold" style={outcomeBadgeStyle(row.outcome)}>{row.outcome}</span>,
      <span key={`b-${row.id}`}  style={{ fontSize: 'clamp(8px,1vw,10px)' }}>{row.by}</span>,
      <div key={`ac-${row.id}`} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
        <button type="button" title="Edit"   className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50">
          <img src={EditActionIcon}   alt="Edit"   className="h-3 w-3" />
        </button>
        <button type="button" title="Delete" onClick={() => handleDelete(row.id)} className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50">
          <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3" />
        </button>
      </div>,
    ];
  });

  return (
    <>
      <InteractionDialog open={dialogOpen} onClose={closeDialog} onSave={handleSave} />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>INTERACTION LOG</h1>
            <p className="mt-1 text-xs text-gray-500">Full interaction timeline for leads and customers</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {successMsg && (
              <span className="rounded bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">{successMsg}</span>
            )}

            {/* View toggle */}
            <div className="flex overflow-hidden rounded border border-gray-300">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${viewMode === 'timeline' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                style={viewMode === 'timeline' ? { backgroundColor: primary } : {}}
              >
                Timeline
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${viewMode === 'table' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                style={viewMode === 'table' ? { backgroundColor: primary } : {}}
              >
                Table
              </button>
            </div>

            <button
              type="button"
              onClick={openDialog}
              className="flex items-center gap-1 rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Interaction
            </button>
          </div>
        </div>

        {/* ── Filter panel ── */}
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <DropdownInput
              label="Linked To Type"
              fullWidth
              value={filters.linkedType}
              onChange={(v) => setF('linkedType', v)}
              options={LINKED_TYPE_OPT}
              placeholder="All"
            />
            <InputField
              label="Linked To (search)"
              fullWidth
              value={filters.linkedSearch}
              onChange={(e) => setF('linkedSearch', e.target.value)}
              placeholder="Type name…"
            />
            <DropdownInput
              label="Interaction Type"
              fullWidth
              value={filters.interactionType}
              onChange={(v) => setF('interactionType', v)}
              options={ALL_INTERACTION_TYPES_FILTER}
              placeholder="All"
            />
            <InputField label="Date From" type="date" fullWidth value={filters.dateFrom} onChange={(e) => setF('dateFrom', e.target.value)} />
            <InputField label="Date To"   type="date" fullWidth value={filters.dateTo}   onChange={(e) => setF('dateTo',   e.target.value)} />
            <DropdownInput
              label="Assigned To"
              fullWidth
              value={filters.assignedTo}
              onChange={(v) => setF('assignedTo', v)}
              options={ASSIGNED_OPTIONS}
              placeholder="All users"
            />
          </div>
        </div>

        {/* ── Content: Timeline or Table ── */}
        <div className="mt-5">
          {viewMode === 'timeline' ? (
            <div className="pl-1">
              {filteredRows.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-gray-400">No interactions match the selected filters.</div>
              ) : (
                filteredRows.map((entry) => <TimelineCard key={entry.id} entry={entry} />)
              )}
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
              {filteredRows.length === 0 && (
                <div className="mt-4 text-center text-[12px] text-gray-400">No interactions match the selected filters.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
