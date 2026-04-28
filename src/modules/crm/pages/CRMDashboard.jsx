import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonTable, SelectDateButton, formatDDMMYYYY } from '../../../shared/components/ui';

const primary = '#790728';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

// TODO: Replace with API call — GET /api/crm/leads?limit=7&sort=createdAt:desc
const recentLeads = [
  { leadNo: 'LD-2026-001', leadName: 'Al Rashid Trading', status: 'New',       assignedTo: 'Ahmed',  source: 'Direct',     estimatedValue: 320000,  date: '22 Apr 2026' },
  { leadNo: 'LD-2026-002', leadName: 'Gulf Tech Solutions', status: 'Qualified', assignedTo: 'Priya',  source: 'Referral',   estimatedValue: 875000,  date: '21 Apr 2026' },
  { leadNo: 'LD-2026-003', leadName: 'Noor Interiors LLC',  status: 'Contacted', assignedTo: 'Ravi',    source: 'Website',    estimatedValue: 150000,  date: '21 Apr 2026' },
  { leadNo: 'LD-2026-004', leadName: 'Horizon Builders',    status: 'New',       assignedTo: 'Ahmed',  source: 'Cold Call',  estimatedValue: 540000,  date: '20 Apr 2026' },
  { leadNo: 'LD-2026-005', leadName: 'Delta Freight Co',    status: 'Lost',      assignedTo: 'Priya',  source: 'Exhibition', estimatedValue: 210000,  date: '19 Apr 2026' },
  { leadNo: 'LD-2026-006', leadName: 'Pinnacle Retail',     status: 'Qualified', assignedTo: 'Ravi',    source: 'Referral',   estimatedValue: 98000,   date: '18 Apr 2026' },
  { leadNo: 'LD-2026-007', leadName: 'Crescent Logistics',  status: 'Converted', assignedTo: 'Ahmed',  source: 'Direct',     estimatedValue: 430000,  date: '17 Apr 2026' },
];

// TODO: Replace with API call — GET /api/crm/opportunities?limit=7&sort=createdAt:desc
const recentOpportunities = [
  { oppNo: 'OP-2026-001', customer: 'Al Rashid Trading',   stage: 'Proposal',     value: 320000,  closeDate: '30 Apr 2026' },
  { oppNo: 'OP-2026-002', customer: 'Gulf Tech Solutions',  stage: 'Negotiation',  value: 875000,  closeDate: '05 May 2026' },
  { oppNo: 'OP-2026-003', customer: 'Noor Interiors LLC',   stage: 'Qualified',    value: 150000,  closeDate: '12 May 2026' },
  { oppNo: 'OP-2026-004', customer: 'Horizon Builders',     stage: 'Prospect',     value: 540000,  closeDate: '20 May 2026' },
  { oppNo: 'OP-2026-005', customer: 'Delta Freight Co',     stage: 'Won',          value: 210000,  closeDate: '15 Apr 2026' },
  { oppNo: 'OP-2026-006', customer: 'Pinnacle Retail',      stage: 'Lost',         value: 98000,   closeDate: '10 Apr 2026' },
  { oppNo: 'OP-2026-007', customer: 'Crescent Logistics',   stage: 'Proposal',     value: 430000,  closeDate: '28 Apr 2026' },
];

// TODO: Replace with API call — GET /api/crm/followups?dueDate=today&sort=dueTime:asc
const todayFollowups = [
  { id: 1, dueDate: '22 Apr 2026', subject: 'Demo call scheduled',    linkedTo: 'Al Rashid Trading',   type: 'Call',    dueTime: '09:30 AM', priority: 'High'   },
  { id: 2, dueDate: '22 Apr 2026', subject: 'Send revised quotation',  linkedTo: 'Gulf Tech Solutions',  type: 'Task',    dueTime: '11:00 AM', priority: 'High'   },
  { id: 3, dueDate: '21 Apr 2026', subject: 'Follow-up on proposal',   linkedTo: 'Noor Interiors LLC',   type: 'Email',   dueTime: '12:30 PM', priority: 'Medium' },
  { id: 4, dueDate: '20 Apr 2026', subject: 'Site visit confirmation', linkedTo: 'Horizon Builders',     type: 'Meeting', dueTime: '02:00 PM', priority: 'Medium' },
  { id: 5, dueDate: '17 Apr 2026', subject: 'Contract discussion',     linkedTo: 'Crescent Logistics',   type: 'Call',    dueTime: '04:00 PM', priority: 'Low'    },
];

// TODO: Replace with API call — GET /api/crm/followups?upcoming=true&limit=5
const upcomingFollowups = [
  { dueDate: '24 Apr 2026', subject: 'Renewal discussion',      linkedTo: 'Gulf Tech Solutions',  type: 'Call',    priority: 'High',   assignedTo: 'Ahmed', status: 'Pending'     },
  { dueDate: '25 Apr 2026', subject: 'Technical demo',          linkedTo: 'Noor Interiors LLC',   type: 'Meeting', priority: 'High',   assignedTo: 'Priya', status: 'Pending'     },
  { dueDate: '26 Apr 2026', subject: 'Price negotiation',       linkedTo: 'Pinnacle Retail',      type: 'Call',    priority: 'Medium', assignedTo: 'Ravi',   status: 'Scheduled'   },
  { dueDate: '28 Apr 2026', subject: 'Agreement signing',       linkedTo: 'Crescent Logistics',   type: 'Meeting', priority: 'High',   assignedTo: 'Ahmed', status: 'Scheduled'   },
  { dueDate: '30 Apr 2026', subject: 'Post-install check-in',   linkedTo: 'Horizon Builders',     type: 'Email',   priority: 'Low',    assignedTo: 'Priya', status: 'Pending'     },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function startOfDay(d) {
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDashboardDate(value) {
  if (!value) return null;
  const monthIndex = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const displayMatch = String(value).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  const displayMonth = displayMatch ? monthIndex[displayMatch[2]] : undefined;
  const parsed = displayMatch
    ? new Date(Number(displayMatch[3]), displayMonth, Number(displayMatch[1]))
    : new Date(value);
  return isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function isDateInRange(value, range) {
  if (!range?.from || !range?.to) return true;
  const date = parseDashboardDate(value);
  if (!date) return false;
  return date >= startOfDay(range.from) && date <= startOfDay(range.to);
}

function emptyRow(colSpan, message = 'No records for selected date range') {
  return [
    [
      {
        content: <span className="block py-3 text-center text-[11px] text-gray-400">{message}</span>,
        colSpan,
        className: 'text-center',
      },
    ],
  ];
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
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-col ${className}`}>
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

  const [appliedDateRange, setAppliedDateRange] = useState(null);

  const filteredLeads = useMemo(
    () => recentLeads.filter((lead) => isDateInRange(lead.date, appliedDateRange)),
    [appliedDateRange]
  );

  const filteredOpportunities = useMemo(
    () => recentOpportunities.filter((opp) => isDateInRange(opp.closeDate, appliedDateRange)),
    [appliedDateRange]
  );

  const filteredTodayFollowups = useMemo(
    () => todayFollowups.filter((followup) => isDateInRange(followup.dueDate, appliedDateRange)),
    [appliedDateRange]
  );

  const filteredUpcomingFollowups = useMemo(
    () => upcomingFollowups.filter((followup) => isDateInRange(followup.dueDate, appliedDateRange)),
    [appliedDateRange]
  );

  const dashboardKpis = useMemo(() => {
    const openLeadStatuses = new Set(['New', 'Contacted', 'Qualified']);
    return {
      totalLeads: filteredLeads.length,
      openLeads: filteredLeads.filter((lead) => openLeadStatuses.has(lead.status)).length,
      convertedLeads: filteredLeads.filter((lead) => lead.status === 'Converted').length,
      totalOpportunities: filteredOpportunities.length,
      opportunitiesWon: filteredOpportunities.filter((opp) => opp.stage === 'Won').length,
      revenuePipeline: filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0),
    };
  }, [filteredLeads, filteredOpportunities]);

  const dateRangeLabel = appliedDateRange?.from && appliedDateRange?.to
    ? `${formatDDMMYYYY(appliedDateRange.from)} - ${formatDDMMYYYY(appliedDateRange.to)}`
    : 'All dates';

  const filteredPipelineByStage = useMemo(() => {
    const order = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    return order.map((stage) => {
      const stageRows = filteredOpportunities.filter((opp) => opp.stage === stage);
      return {
        stage,
        count: stageRows.length,
        value: stageRows.reduce((sum, opp) => sum + opp.value, 0),
      };
    });
  }, [filteredOpportunities]);

  const filteredLeadSourceBreakdown = useMemo(() => {
    const sources = ['Direct', 'Referral', 'Website', 'Cold Call', 'Exhibition'];
    return sources.map((source) => {
      const sourceLeads = filteredLeads.filter((lead) => lead.source === source);
      const converted = sourceLeads.filter((lead) => lead.status === 'Converted').length;
      return {
        source,
        count: sourceLeads.length,
        conversionPct: sourceLeads.length ? Math.round((converted / sourceLeads.length) * 100) : 0,
      };
    });
  }, [filteredLeads]);

  // ------------------------------------------------------------------
  // Recent Leads table rows
  // ------------------------------------------------------------------
  const leadTableHeaders = ['Lead No', 'Lead Name', 'Status', 'Assigned To', 'Date'];
  const leadTableRows = filteredLeads.length ? filteredLeads.map((l) => [
    <span className="font-mono text-[11px] text-gray-700">{l.leadNo}</span>,
    <span className="text-[11px] text-gray-800">{l.leadName}</span>,
    <Badge label={l.status} styleMap={LEAD_STATUS_STYLES} />,
    <span className="text-[11px] text-gray-700">{l.assignedTo}</span>,
    <span className="text-[11px] text-gray-500">{l.date}</span>,
  ]) : emptyRow(leadTableHeaders.length);

  // ------------------------------------------------------------------
  // Recent Opportunities table rows
  // ------------------------------------------------------------------
  const oppTableHeaders = ['Opp No', 'Customer', 'Stage', 'Value', 'Close Date'];
  const oppTableRows = filteredOpportunities.length ? filteredOpportunities.map((o) => [
    <span className="font-mono text-[11px] text-gray-700">{o.oppNo}</span>,
    <span className="text-[11px] text-gray-800">{o.customer}</span>,
    <Badge label={o.stage} styleMap={STAGE_STYLES} />,
    <span className="text-[11px] text-gray-700 tabular-nums">{formatINR(o.value)}</span>,
    <span className="text-[11px] text-gray-500">{o.closeDate}</span>,
  ]) : emptyRow(oppTableHeaders.length);

  // ------------------------------------------------------------------
  // Upcoming Follow-ups table rows
  // ------------------------------------------------------------------
  const upcomingHeaders = ['Due Date', 'Subject', 'Linked To', 'Type', 'Priority', 'Assigned To', 'Status'];
  const upcomingRows = filteredUpcomingFollowups.length ? filteredUpcomingFollowups.map((f) => [
    <span className="text-[11px] text-gray-700">{f.dueDate}</span>,
    <span className="text-[11px] text-gray-800">{f.subject}</span>,
    <span className="text-[11px] text-gray-700">{f.linkedTo}</span>,
    <span className="text-[11px] text-gray-500">{f.type}</span>,
    <Badge label={f.priority} styleMap={PRIORITY_STYLES} />,
    <span className="text-[11px] text-gray-700">{f.assignedTo}</span>,
    <Badge label={f.status} styleMap={FOLLOWUP_STATUS_STYLES} />,
  ]) : emptyRow(upcomingHeaders.length);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden border border-gray-200 bg-white p-3 rounded-lg -mx-[13px] w-[calc(100%+26px)]">

      {/* ------------------------------------------------------------------ */}
      {/* Header bar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>CRM Overview</h1>

        <div className="flex flex-wrap items-center gap-2">
          <SelectDateButton
            value={appliedDateRange}
            title="CRM Date Range"
            onApply={(range) => setAppliedDateRange(range)}
          />
        </div>
      </div>

      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded border border-rose-100 bg-rose-50/60 px-3 py-2">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Showing CRM content for</span>
          <div className="truncate text-xs font-bold text-gray-800">{dateRangeLabel}</div>
        </div>
        <span className="text-[10px] font-medium text-gray-500">
          {dashboardKpis.totalLeads} leads · {dashboardKpis.totalOpportunities} opportunities · {filteredUpcomingFollowups.length + filteredTodayFollowups.length} follow-ups
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Summary Row                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Total Leads"
          value={dashboardKpis.totalLeads}
          subtitle="This period"
          indicatorColor="#6366f1"
        />
        <KpiCard
          label="Open Leads"
          value={dashboardKpis.openLeads}
          subtitle="This period"
          indicatorColor="#f59e0b"
        />
        <KpiCard
          label="Converted Leads"
          value={dashboardKpis.convertedLeads}
          subtitle="This period"
          indicatorColor="#22c55e"
        />
        <KpiCard
          label="Total Opportunities"
          value={dashboardKpis.totalOpportunities}
          subtitle="This period"
          indicatorColor="#3b82f6"
        />
        <KpiCard
          label="Opportunities Won"
          value={dashboardKpis.opportunitiesWon}
          subtitle="This period"
          indicatorColor="#16a34a"
        />
        <KpiCard
          label="Revenue Pipeline"
          value={formatINR(dashboardKpis.revenuePipeline)}
          subtitle="This period"
          indicatorColor={primary}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Two-column middle section                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">

        {/* ---- LEFT 60% ---- */}
        <div className="flex flex-col gap-3 lg:w-[60%] min-h-0">

          {/* Recent Leads */}
          <SectionCard
            className="flex-1 min-h-0 overflow-hidden"
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
            className="flex-1 min-h-0 overflow-hidden"
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
        <div className="flex flex-col gap-3 lg:w-[40%] min-h-0 overflow-y-auto">

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
              {filteredTodayFollowups.length ? filteredTodayFollowups.map((f) => (
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
              )) : (
                <li className="py-5 text-center text-[11px] text-gray-400">
                  No follow-ups for selected date range
                </li>
              )}
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
                {filteredPipelineByStage.map((row) => (
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
                    {filteredPipelineByStage.reduce((s, r) => s + r.count, 0)}
                  </td>
                  <td className="py-1.5 text-right text-[10px] font-bold text-gray-700 tabular-nums">
                    {formatINR(filteredPipelineByStage.reduce((s, r) => s + r.value, 0))}
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
                {filteredLeadSourceBreakdown.map((row) => (
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

      <SectionCard
        className="shrink-0"
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
