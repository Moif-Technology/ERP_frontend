import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonTable } from '../../../shared/components/ui';

const primary = '#790728';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

// TODO: Replace with API call — GET /api/crm/dashboard/kpi?from=&to=
const kpiData = {
  totalLeads: 148,
  openLeads: 63,
  convertedLeads: 31,
  totalOpportunities: 74,
  opportunitiesWon: 18,
  revenuePipeline: 12450000,
};

// TODO: Replace with API call — GET /api/crm/leads?limit=7&sort=createdAt:desc
const recentLeads = [
  { leadNo: 'LD-2025-001', leadName: 'Al Rashid Trading', status: 'New',       assignedTo: 'Sabeeh',  date: '22 Apr 2025' },
  { leadNo: 'LD-2025-002', leadName: 'Gulf Tech Solutions', status: 'Qualified', assignedTo: 'Swetha',  date: '21 Apr 2025' },
  { leadNo: 'LD-2025-003', leadName: 'Noor Interiors LLC',  status: 'Contacted', assignedTo: 'Sonu',    date: '21 Apr 2025' },
  { leadNo: 'LD-2025-004', leadName: 'Horizon Builders',    status: 'New',       assignedTo: 'Sabeeh',  date: '20 Apr 2025' },
  { leadNo: 'LD-2025-005', leadName: 'Delta Freight Co',    status: 'Lost',      assignedTo: 'Swetha',  date: '19 Apr 2025' },
  { leadNo: 'LD-2025-006', leadName: 'Pinnacle Retail',     status: 'Qualified', assignedTo: 'Sonu',    date: '18 Apr 2025' },
  { leadNo: 'LD-2025-007', leadName: 'Crescent Logistics',  status: 'Converted', assignedTo: 'Sabeeh',  date: '17 Apr 2025' },
];

// TODO: Replace with API call — GET /api/crm/opportunities?limit=7&sort=createdAt:desc
const recentOpportunities = [
  { oppNo: 'OP-2025-001', customer: 'Al Rashid Trading',   stage: 'Proposal',     value: 320000,  closeDate: '30 Apr 2025' },
  { oppNo: 'OP-2025-002', customer: 'Gulf Tech Solutions',  stage: 'Negotiation',  value: 875000,  closeDate: '05 May 2025' },
  { oppNo: 'OP-2025-003', customer: 'Noor Interiors LLC',   stage: 'Qualified',    value: 150000,  closeDate: '12 May 2025' },
  { oppNo: 'OP-2025-004', customer: 'Horizon Builders',     stage: 'Prospect',     value: 540000,  closeDate: '20 May 2025' },
  { oppNo: 'OP-2025-005', customer: 'Delta Freight Co',     stage: 'Won',          value: 210000,  closeDate: '15 Apr 2025' },
  { oppNo: 'OP-2025-006', customer: 'Pinnacle Retail',      stage: 'Lost',         value: 98000,   closeDate: '10 Apr 2025' },
  { oppNo: 'OP-2025-007', customer: 'Crescent Logistics',   stage: 'Proposal',     value: 430000,  closeDate: '28 Apr 2025' },
];

// TODO: Replace with API call — GET /api/crm/followups?dueDate=today&sort=dueTime:asc
const todayFollowups = [
  { id: 1, subject: 'Demo call scheduled',    linkedTo: 'Al Rashid Trading',   type: 'Call',    dueTime: '09:30 AM', priority: 'High'   },
  { id: 2, subject: 'Send revised quotation',  linkedTo: 'Gulf Tech Solutions',  type: 'Task',    dueTime: '11:00 AM', priority: 'High'   },
  { id: 3, subject: 'Follow-up on proposal',   linkedTo: 'Noor Interiors LLC',   type: 'Email',   dueTime: '12:30 PM', priority: 'Medium' },
  { id: 4, subject: 'Site visit confirmation', linkedTo: 'Horizon Builders',     type: 'Meeting', dueTime: '02:00 PM', priority: 'Medium' },
  { id: 5, subject: 'Contract discussion',     linkedTo: 'Crescent Logistics',   type: 'Call',    dueTime: '04:00 PM', priority: 'Low'    },
];

// TODO: Replace with API call — GET /api/crm/pipeline/by-stage
const pipelineByStage = [
  { stage: 'Prospect',    count: 18, value: 2850000 },
  { stage: 'Qualified',   count: 14, value: 3120000 },
  { stage: 'Proposal',    count: 11, value: 2640000 },
  { stage: 'Negotiation', count:  8, value: 1980000 },
  { stage: 'Won',         count: 18, value: 3100000 },
  { stage: 'Lost',        count:  5, value:  760000 },
];

// TODO: Replace with API call — GET /api/crm/leads/by-source
const leadSourceBreakdown = [
  { source: 'Direct',     count: 32, conversionPct: 28 },
  { source: 'Referral',   count: 41, conversionPct: 37 },
  { source: 'Website',    count: 29, conversionPct: 17 },
  { source: 'Cold Call',  count: 25, conversionPct: 12 },
  { source: 'Exhibition', count: 21, conversionPct: 22 },
];

// TODO: Replace with API call — GET /api/crm/followups?upcoming=true&limit=5
const upcomingFollowups = [
  { dueDate: '24 Apr 2025', subject: 'Renewal discussion',      linkedTo: 'Gulf Tech Solutions',  type: 'Call',    priority: 'High',   assignedTo: 'Sabeeh', status: 'Pending'     },
  { dueDate: '25 Apr 2025', subject: 'Technical demo',          linkedTo: 'Noor Interiors LLC',   type: 'Meeting', priority: 'High',   assignedTo: 'Swetha', status: 'Pending'     },
  { dueDate: '26 Apr 2025', subject: 'Price negotiation',       linkedTo: 'Pinnacle Retail',      type: 'Call',    priority: 'Medium', assignedTo: 'Sonu',   status: 'Scheduled'   },
  { dueDate: '28 Apr 2025', subject: 'Agreement signing',       linkedTo: 'Crescent Logistics',   type: 'Meeting', priority: 'High',   assignedTo: 'Sabeeh', status: 'Scheduled'   },
  { dueDate: '30 Apr 2025', subject: 'Post-install check-in',   linkedTo: 'Horizon Builders',     type: 'Email',   priority: 'Low',    assignedTo: 'Swetha', status: 'Pending'     },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Badge helpers — small inline spans, not the full StatusBadge component
// ---------------------------------------------------------------------------

const LEAD_STATUS_STYLES = {
  New:       'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-indigo-100 text-indigo-700',
  Lost:      'bg-red-100 text-red-600',
  Converted: 'bg-green-100 text-green-700',
};

const STAGE_STYLES = {
  Prospect:    'bg-slate-100 text-slate-600',
  Qualified:   'bg-indigo-100 text-indigo-700',
  Proposal:    'bg-yellow-100 text-yellow-700',
  Negotiation: 'bg-orange-100 text-orange-700',
  Won:         'bg-green-100 text-green-700',
  Lost:        'bg-red-100 text-red-600',
};

const PRIORITY_STYLES = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low:    'bg-gray-100 text-gray-600',
};

const FOLLOWUP_STATUS_STYLES = {
  Pending:   'bg-orange-100 text-orange-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  Done:      'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
};

function Badge({ label, styleMap, fallback = 'bg-gray-100 text-gray-600' }) {
  const cls = styleMap[label] || fallback;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight ${cls}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({ label, value, subtitle, indicatorColor }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">
        {label}
      </span>
      <span className="text-2xl font-bold text-gray-800 leading-tight truncate">
        {value}
      </span>
      {subtitle && (
        <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
          {indicatorColor && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: indicatorColor }}
            />
          )}
          {subtitle}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CRMDashboard() {
  const navigate = useNavigate();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  // TODO: on Refresh click, refetch all dashboard data using dateFrom / dateTo
  function handleRefresh() {
    // Trigger API calls with the selected date range
    console.log('Refreshing dashboard data…', { dateFrom, dateTo });
  }

  // ------------------------------------------------------------------
  // Recent Leads table rows
  // ------------------------------------------------------------------
  const leadTableHeaders = ['Lead No', 'Lead Name', 'Status', 'Assigned To', 'Date'];
  const leadTableRows = recentLeads.map((l) => [
    <span className="font-mono text-[11px] text-gray-700">{l.leadNo}</span>,
    <span className="text-[11px] text-gray-800">{l.leadName}</span>,
    <Badge label={l.status} styleMap={LEAD_STATUS_STYLES} />,
    <span className="text-[11px] text-gray-700">{l.assignedTo}</span>,
    <span className="text-[11px] text-gray-500">{l.date}</span>,
  ]);

  // ------------------------------------------------------------------
  // Recent Opportunities table rows
  // ------------------------------------------------------------------
  const oppTableHeaders = ['Opp No', 'Customer', 'Stage', 'Value', 'Close Date'];
  const oppTableRows = recentOpportunities.map((o) => [
    <span className="font-mono text-[11px] text-gray-700">{o.oppNo}</span>,
    <span className="text-[11px] text-gray-800">{o.customer}</span>,
    <Badge label={o.stage} styleMap={STAGE_STYLES} />,
    <span className="text-[11px] text-gray-700 tabular-nums">{formatINR(o.value)}</span>,
    <span className="text-[11px] text-gray-500">{o.closeDate}</span>,
  ]);

  // ------------------------------------------------------------------
  // Upcoming Follow-ups table rows
  // ------------------------------------------------------------------
  const upcomingHeaders = ['Due Date', 'Subject', 'Linked To', 'Type', 'Priority', 'Assigned To', 'Status'];
  const upcomingRows = upcomingFollowups.map((f) => [
    <span className="text-[11px] text-gray-700">{f.dueDate}</span>,
    <span className="text-[11px] text-gray-800">{f.subject}</span>,
    <span className="text-[11px] text-gray-700">{f.linkedTo}</span>,
    <span className="text-[11px] text-gray-500">{f.type}</span>,
    <Badge label={f.priority} styleMap={PRIORITY_STYLES} />,
    <span className="text-[11px] text-gray-700">{f.assignedTo}</span>,
    <Badge label={f.status} styleMap={FOLLOWUP_STATUS_STYLES} />,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col gap-4">

      {/* ------------------------------------------------------------------ */}
      {/* Header bar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-base font-bold text-gray-800 tracking-wide uppercase">
          CRM Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] text-gray-500 font-medium">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-[11px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#790728]"
          />
          <label className="text-[11px] text-gray-500 font-medium">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-[11px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#790728]"
          />
          <button
            onClick={handleRefresh}
            className="text-xs font-semibold px-3 py-1 rounded border border-[#790728] text-[#790728] hover:bg-[#790728] hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Summary Row                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Total Leads"
          value={kpiData.totalLeads}
          subtitle="This period"
          indicatorColor="#6366f1"
        />
        <KpiCard
          label="Open Leads"
          value={kpiData.openLeads}
          subtitle="This period"
          indicatorColor="#f59e0b"
        />
        <KpiCard
          label="Converted Leads"
          value={kpiData.convertedLeads}
          subtitle="This period"
          indicatorColor="#22c55e"
        />
        <KpiCard
          label="Total Opportunities"
          value={kpiData.totalOpportunities}
          subtitle="This period"
          indicatorColor="#3b82f6"
        />
        <KpiCard
          label="Opportunities Won"
          value={kpiData.opportunitiesWon}
          subtitle="This period"
          indicatorColor="#16a34a"
        />
        <KpiCard
          label="Revenue Pipeline"
          value={formatINR(kpiData.revenuePipeline)}
          subtitle="This period"
          indicatorColor={primary}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Two-column middle section                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ---- LEFT 60% ---- */}
        <div className="flex flex-col gap-4 lg:w-[60%]">

          {/* Recent Leads */}
          <SectionCard
            title="Recent Leads"
            action={
              <button
                onClick={() => navigate('/crm/leads')}
                className="text-xs text-[#790728] hover:underline"
              >
                View All
              </button>
            }
          >
            <CommonTable
              headers={leadTableHeaders}
              rows={leadTableRows}
              fitParentWidth
              equalColumnWidth
              hideVerticalCellBorders
              cellPaddingClass="px-2 py-1.5"
              headerFontSize="11px"
              bodyFontSize="11px"
            />
          </SectionCard>

          {/* Recent Opportunities */}
          <SectionCard
            title="Recent Opportunities"
            action={
              <button
                onClick={() => navigate('/crm/opportunities')}
                className="text-xs text-[#790728] hover:underline"
              >
                View All
              </button>
            }
          >
            <CommonTable
              headers={oppTableHeaders}
              rows={oppTableRows}
              fitParentWidth
              equalColumnWidth
              hideVerticalCellBorders
              cellPaddingClass="px-2 py-1.5"
              headerFontSize="11px"
              bodyFontSize="11px"
            />
          </SectionCard>
        </div>

        {/* ---- RIGHT 40% ---- */}
        <div className="flex flex-col gap-4 lg:w-[40%]">

          {/* Today's Follow-ups */}
          <SectionCard
            title="Today's Follow-ups"
            action={
              <button
                onClick={() => navigate('/crm/followups')}
                className="text-xs text-[#790728] hover:underline"
              >
                View All Follow-ups
              </button>
            }
          >
            <ul className="flex flex-col divide-y divide-gray-100">
              {todayFollowups.map((f) => (
                <li key={f.id} className="py-2 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-800 leading-tight truncate">
                      {f.subject}
                    </span>
                    <Badge label={f.priority} styleMap={PRIORITY_STYLES} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 truncate">{f.linkedTo}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{f.type}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] font-medium text-gray-600 tabular-nums">{f.dueTime}</span>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Pipeline by Stage */}
          <SectionCard title="Pipeline by Stage">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                  <th className="text-right py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Count</th>
                  <th className="text-right py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pipelineByStage.map((row) => (
                  <tr key={row.stage} className="hover:bg-gray-50">
                    <td className="py-1.5 text-gray-700 font-medium">{row.stage}</td>
                    <td className="py-1.5 text-right text-gray-600 tabular-nums">{row.count}</td>
                    <td className="py-1.5 text-right text-gray-600 tabular-nums">{formatINR(row.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="py-1.5 text-[10px] font-bold text-gray-600 uppercase">Total</td>
                  <td className="py-1.5 text-right text-[10px] font-bold text-gray-700 tabular-nums">
                    {pipelineByStage.reduce((s, r) => s + r.count, 0)}
                  </td>
                  <td className="py-1.5 text-right text-[10px] font-bold text-gray-700 tabular-nums">
                    {formatINR(pipelineByStage.reduce((s, r) => s + r.value, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </SectionCard>

          {/* Lead Source Breakdown */}
          <SectionCard title="Lead Source Breakdown">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                  <th className="text-right py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Count</th>
                  <th className="text-right py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Conversion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leadSourceBreakdown.map((row) => (
                  <tr key={row.source} className="hover:bg-gray-50">
                    <td className="py-1.5 text-gray-700 font-medium">{row.source}</td>
                    <td className="py-1.5 text-right text-gray-600 tabular-nums">{row.count}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      <span
                        className={`font-semibold ${
                          row.conversionPct >= 30
                            ? 'text-green-600'
                            : row.conversionPct >= 20
                            ? 'text-yellow-600'
                            : 'text-red-500'
                        }`}
                      >
                        {row.conversionPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom: Upcoming Follow-ups full-width table                        */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard
        title="Upcoming Follow-ups"
        action={
          <button
            onClick={() => navigate('/crm/followups')}
            className="text-xs text-[#790728] hover:underline"
          >
            View All
          </button>
        }
      >
        <CommonTable
          headers={upcomingHeaders}
          rows={upcomingRows}
          fitParentWidth
          equalColumnWidth
          hideVerticalCellBorders
          cellPaddingClass="px-2 py-1.5"
          headerFontSize="11px"
          bodyFontSize="11px"
        />
      </SectionCard>

    </div>
  );
}
