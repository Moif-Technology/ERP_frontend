import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';

const primary = '#790728';

const STAGE_BADGE = {
  Prospect:    { bg: '#F3F4F6', color: '#374151' },
  Qualified:   { bg: '#DBEAFE', color: '#1D4ED8' },
  Proposal:    { bg: '#FEF3C7', color: '#92400E' },
  Negotiation: { bg: '#FED7AA', color: '#9A3412' },
  Won:         { bg: '#DCFCE7', color: '#166534' },
  Lost:        { bg: '#FEE2E2', color: '#991B1B' },
};

const PRIORITY_BADGE = {
  High:   { bg: '#FEE2E2', color: '#991B1B' },
  Medium: { bg: '#FEF3C7', color: '#92400E' },
  Low:    { bg: '#E5E7EB', color: '#374151' },
};

// Sample data keyed by id (all ids fall back to id=1 for demo)
const SAMPLE_OPP = {
  oppNo: 'OPP-0003',
  title: 'Inventory & Accounting Suite',
  customer: 'Masdar Trading Co.',
  stage: 'Negotiation',
  priority: 'High',
  probability: 75,
  source: 'Referral',
  value: 320000,
  closeDate: '2026-05-10',
  assignedTo: 'Ravi',
  createdDate: '2026-03-15',
  leadRef: 'LD-0003',
  products: 'Inventory + Accounting + HR',
  description: 'Full ERP implementation covering inventory management, accounting, and HR modules for a mid-sized trading company in Abu Dhabi.',
  contactPerson: 'Ahmed Al Zaabi',
  mobile: '971500000003',
  email: 'ahmed@masdar.ae',
  address: 'Abu Dhabi, UAE',
};

const SAMPLE_INTERACTIONS = [
  { id: 1, date: '2026-04-15', type: 'Meeting', mode: 'In-Person', subject: 'Product demo walkthrough', outcome: 'Client impressed, requested pricing', by: 'Ravi' },
  { id: 2, date: '2026-04-10', type: 'Call', mode: 'Phone', subject: 'Follow-up on proposal', outcome: 'Awaiting internal approval', by: 'Priya' },
  { id: 3, date: '2026-04-05', type: 'Email', mode: 'Email', subject: 'Sent detailed proposal doc', outcome: 'Delivered', by: 'Ravi' },
  { id: 4, date: '2026-03-28', type: 'Call', mode: 'Video', subject: 'Initial requirements gathering', outcome: 'Noted all requirements', by: 'Ahmed' },
  { id: 5, date: '2026-03-20', type: 'Meeting', mode: 'In-Person', subject: 'First meeting', outcome: 'Interest confirmed', by: 'Ravi' },
];

const SAMPLE_FOLLOWUPS = [
  { id: 1, dueDate: '2026-04-25', subject: 'Submit revised commercial offer', assignedTo: 'Ravi', priority: 'High', status: 'Pending' },
  { id: 2, dueDate: '2026-04-28', subject: 'Legal contract review call', assignedTo: 'Priya', priority: 'High', status: 'Pending' },
  { id: 3, dueDate: '2026-05-02', subject: 'Site visit for implementation planning', assignedTo: 'Ahmed', priority: 'Medium', status: 'Scheduled' },
  { id: 4, dueDate: '2026-05-05', subject: 'Confirm go-live date', assignedTo: 'Ravi', priority: 'Medium', status: 'Pending' },
  { id: 5, dueDate: '2026-04-20', subject: 'Send module feature comparison', assignedTo: 'Priya', priority: 'Low', status: 'Completed' },
];

const SAMPLE_NOTES = [
  { id: 1, title: 'Key Decision Maker', body: 'Ahmed Al Zaabi is the main decision maker. Finance director Khalid must also sign off.', createdBy: 'Ravi', createdDate: '2026-04-12' },
  { id: 2, title: 'Budget Constraint', body: 'Client has budget ceiling of ₹3.5L. May need to phase the rollout across two financial years.', createdBy: 'Priya', createdDate: '2026-04-08' },
  { id: 3, title: 'Competitor Info', body: 'Competing against SAP B1 quote. Ours is 40% lower. Highlight localisation and support.', createdBy: 'Ahmed', createdDate: '2026-04-02' },
  { id: 4, title: 'Implementation Timeline', body: 'Requested go-live by 1st August 2026. Feasible if PO signed by May end.', createdBy: 'Ravi', createdDate: '2026-03-25' },
];

const SAMPLE_STAGE_HISTORY = [
  { id: 1, stage: 'Prospect',    changedBy: 'Ahmed', date: '2026-03-15', remarks: 'Initial opportunity created from lead LD-0003' },
  { id: 2, stage: 'Qualified',   changedBy: 'Ahmed', date: '2026-03-20', remarks: 'Budget and authority confirmed' },
  { id: 3, stage: 'Proposal',    changedBy: 'Ravi',   date: '2026-04-05', remarks: 'Detailed proposal submitted via email' },
  { id: 4, stage: 'Negotiation', changedBy: 'Ravi',   date: '2026-04-15', remarks: 'Commercial discussions underway' },
];

const TABS = ['Summary', 'Interactions', 'Follow-ups', 'Notes', 'Linked Customer/Lead', 'Stage History'];

function SectionTable({ headers, rows, title, columnWidths, maxHeightClass = 'max-h-[calc(100vh-380px)]' }) {
  return (
    <div className={`min-w-0 overflow-auto rounded-lg border border-gray-200 ${maxHeightClass}`}>
      {title ? (
        <div className="border-b border-gray-200 bg-white px-3 py-2">
          <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: primary }}>{title}</h2>
        </div>
      ) : null}
      <table className="w-full table-fixed border-collapse text-left">
        {columnWidths?.length === headers.length ? (
          <colgroup>
            {columnWidths.map((width, idx) => (
              <col key={`${headers[idx]}-${width}`} style={{ width }} />
            ))}
          </colgroup>
        ) : null}
        <thead style={{ backgroundColor: '#F9FAFB' }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="sticky top-0 z-[1] border-b border-gray-200 px-3 py-2.5 text-[11px] font-semibold text-gray-600">
                <span className="block min-w-0 break-words">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="border-b border-gray-100 px-3 py-2.5 align-top text-xs leading-relaxed text-gray-700">
                  <span className="block min-w-0 break-words">{cell}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ label, style }) {
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold"
      style={style}
    >
      {label}
    </span>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 flex items-center gap-1 rounded px-3 py-1.5 text-[11px] font-semibold text-white"
      style={{ backgroundColor: primary }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      {label}
    </button>
  );
}

export default function OpportunityWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Summary');

  const opp = SAMPLE_OPP; // In real app: fetch by id

  const handleMarkWon = () => console.log('Mark Won', id);
  const handleMarkLost = () => console.log('Mark Lost', id);
  const handleAddInteraction = () => console.log('Add Interaction', id);
  const handleAddFollowup = () => console.log('Add Follow-up', id);
  const handleAddNote = () => console.log('Add Note', id);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <button
        type="button"
        onClick={() => navigate('/crm/opportunities')}
        className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Opportunity List
      </button>
      {/* Top header card */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
                {opp.title}
              </h1>
              <Badge label={opp.stage} style={{ background: STAGE_BADGE[opp.stage]?.bg, color: STAGE_BADGE[opp.stage]?.color }} />
              <Badge label={opp.priority} style={{ background: PRIORITY_BADGE[opp.priority]?.bg, color: PRIORITY_BADGE[opp.priority]?.color }} />
              <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{opp.probability}% Probability</span>
            </div>
            <p className="mt-1 text-sm text-gray-600 font-medium">{opp.customer}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{opp.oppNo} | Assigned to: {opp.assignedTo}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <button
              type="button"
              onClick={handleAddInteraction}
              className="rounded px-3 py-1.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Add Interaction
            </button>
            <button type="button" onClick={handleAddFollowup} className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-white">
              Add Follow-up
            </button>
            <button type="button" onClick={() => navigate(`/crm/opportunity-entry?id=${id}`)} className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-white">
              Edit Opportunity
            </button>
            <button type="button" onClick={handleMarkWon} className="rounded border border-green-400 px-3 py-1.5 text-[11px] font-semibold text-green-700 hover:bg-green-50">
              Mark Won
            </button>
            <button type="button" onClick={handleMarkLost} className="rounded border border-red-300 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-50">
              Mark Lost
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Source', value: opp.source },
            { label: 'Expected Value', value: `₹${opp.value.toLocaleString('en-IN')}` },
            { label: 'Close Date', value: opp.closeDate },
            { label: 'Assigned To', value: opp.assignedTo },
            { label: 'Created Date', value: opp.createdDate },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-[10px] text-gray-500">{stat.label}</div>
              <div className="mt-0.5 text-[13px] font-semibold text-gray-800">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-5 border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="rounded-t px-4 py-2 text-[11px] font-semibold transition-colors"
                style={{
                  backgroundColor: active ? primary : '#F3F4F6',
                  color: active ? '#fff' : '#374151',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-5">
        {/* ── 1. Summary ──────────────────────────────── */}
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Left: Details grid */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Opportunity Details</h2>
              <dl className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                {[
                  ['Opp No', opp.oppNo],
                  ['Customer', opp.customer],
                  ['Contact Person', opp.contactPerson],
                  ['Mobile', opp.mobile],
                  ['Email', opp.email],
                  ['Lead Ref', opp.leadRef],
                  ['Stage', opp.stage],
                  ['Priority', opp.priority],
                  ['Probability', `${opp.probability}%`],
                  ['Source', opp.source],
                  ['Estimated Value', `₹${opp.value.toLocaleString('en-IN')}`],
                  ['Expected Close', opp.closeDate],
                  ['Assigned To', opp.assignedTo],
                  ['Products / Services', opp.products],
                  ['Address', opp.address],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="font-semibold text-gray-500">{label}</dt>
                    <dd className="text-gray-800">{value}</dd>
                  </div>
                ))}
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <dt className="font-semibold text-gray-500">Description</dt>
                  <dd className="text-gray-800 leading-relaxed">{opp.description}</dd>
                </div>
              </dl>
            </div>

            {/* Right: Stage history timeline */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Stage History</h2>
              <ol className="relative border-l border-gray-200 pl-4">
                {SAMPLE_STAGE_HISTORY.map((sh, idx) => (
                  <li key={sh.id} className={`mb-4 ${idx === SAMPLE_STAGE_HISTORY.length - 1 ? '' : ''}`}>
                    <span
                      className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      {idx + 1}
                    </span>
                    <div className="ml-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={sh.stage} style={{ background: STAGE_BADGE[sh.stage]?.bg, color: STAGE_BADGE[sh.stage]?.color }} />
                        <span className="text-[10px] text-gray-500">{sh.date}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-600">{sh.remarks}</p>
                      <p className="text-[10px] text-gray-400">Changed by: {sh.changedBy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* ── 2. Interactions ──────────────────────────── */}
        {activeTab === 'Interactions' && (
          <div>
            <AddButton label="Add Interaction" onClick={handleAddInteraction} />
            <SectionTable
              title="Interaction Log"
              headers={['Date', 'Type', 'Mode', 'Subject', 'Outcome', 'By']}
              columnWidths={['13%', '10%', '12%', '27%', '28%', '10%']}
              rows={SAMPLE_INTERACTIONS.map((r) => [r.date, r.type, r.mode, r.subject, r.outcome, r.by])}
            />
          </div>
        )}

        {/* ── 3. Follow-ups ────────────────────────────── */}
        {activeTab === 'Follow-ups' && (
          <div>
            <AddButton label="Add Follow-up" onClick={handleAddFollowup} />
            <SectionTable
              headers={['Due Date', 'Subject', 'Assigned To', 'Priority', 'Status']}
              rows={SAMPLE_FOLLOWUPS.map((r) => [
                r.dueDate,
                r.subject,
                r.assignedTo,
                <Badge
                  key={r.id}
                  label={r.priority}
                  style={{ background: PRIORITY_BADGE[r.priority]?.bg, color: PRIORITY_BADGE[r.priority]?.color }}
                />,
                <span
                  key={r.id}
                  className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold"
                  style={
                    r.status === 'Completed'
                      ? { background: '#DCFCE7', color: '#166534' }
                      : r.status === 'Scheduled'
                      ? { background: '#DBEAFE', color: '#1D4ED8' }
                      : { background: '#FEF3C7', color: '#92400E' }
                  }
                >
                  {r.status}
                </span>,
              ])}
            />
          </div>
        )}

        {/* ── 4. Notes ────────────────────────────────── */}
        {activeTab === 'Notes' && (
          <div>
            <AddButton label="Add Note" onClick={handleAddNote} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SAMPLE_NOTES.map((note) => (
                <div key={note.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-bold" style={{ color: primary }}>{note.title}</h3>
                    <span className="whitespace-nowrap text-[10px] text-gray-400">{note.createdDate}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-700">{note.body}</p>
                  <p className="mt-2 text-[10px] text-gray-400">By: {note.createdBy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Linked Customer/Lead ─────────────────── */}
        {activeTab === 'Linked Customer/Lead' && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Customer summary card */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Customer</h2>
              <dl className="space-y-2 text-xs">
                {[
                  ['Name', opp.customer],
                  ['Contact', opp.contactPerson],
                  ['Mobile', opp.mobile],
                  ['Email', opp.email],
                  ['Address', opp.address],
                  ['Type', 'Corporate'],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="w-20 flex-shrink-0 font-semibold text-gray-500">{label}</dt>
                    <dd className="text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Lead link card */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Linked Lead</h2>
              <dl className="space-y-2 text-xs">
                {[
                  ['Lead No', opp.leadRef],
                  ['Lead Name', opp.customer],
                  ['Source', opp.source],
                  ['Status', 'Converted'],
                  ['Converted On', opp.createdDate],
                  ['Converted By', opp.assignedTo],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="w-24 flex-shrink-0 font-semibold text-gray-500">{label}</dt>
                    <dd className="text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* ── 6. Stage History ────────────────────────── */}
        {activeTab === 'Stage History' && (
          <div>
            <SectionTable
              headers={['Stage', 'Changed By', 'Date', 'Remarks']}
              rows={SAMPLE_STAGE_HISTORY.map((r) => [
                <Badge
                  key={r.id}
                  label={r.stage}
                  style={{ background: STAGE_BADGE[r.stage]?.bg, color: STAGE_BADGE[r.stage]?.color }}
                />,
                r.changedBy,
                r.date,
                r.remarks,
              ])}
            />
          </div>
        )}
      </div>
    </div>
  );
}
