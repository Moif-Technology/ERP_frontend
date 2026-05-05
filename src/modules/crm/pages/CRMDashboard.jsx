import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonTable, SelectDateButton } from '../../../shared/components/ui';
import { getCrmDashboard } from '../api/crmDashboard.api';

const primary = '#790728';

function formatMoney(amount) {
  return `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;
}

function Badge({ label, className }) {
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${className}`}>{label}</span>;
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [dashboard, setDashboard] = useState({
    kpis: { totalLeads: 0, openLeads: 0, convertedLeads: 0, totalOpportunities: 0, opportunitiesWon: 0, revenuePipeline: 0 },
    recentLeads: [],
    recentOpportunities: [],
    todayFollowups: [],
    pipelineByStage: [],
    leadSourceBreakdown: [],
    upcomingFollowups: [],
  });

  useEffect(() => {
    getCrmDashboard()
      .then(setDashboard)
      .catch((err) => alert(err?.response?.data?.message || err.message));
  }, []);

  const { kpis, recentLeads, recentOpportunities, todayFollowups, pipelineByStage, leadSourceBreakdown, upcomingFollowups } = dashboard;

  const leadTableRows = recentLeads.map((item) => [
    <span className="font-mono text-[11px] text-gray-700">{item.leadCode}</span>,
    <span className="text-[11px] text-gray-800">{item.leadName}</span>,
    <Badge label={item.status || '—'} className="bg-yellow-100 text-yellow-700" />,
    <span className="text-[11px] text-gray-700">{item.assignedTo || '—'}</span>,
    <span className="text-[11px] text-gray-500">{String(item.leadDate || '').slice(0, 10)}</span>,
  ]);

  const oppTableRows = recentOpportunities.map((item) => [
    <span className="font-mono text-[11px] text-gray-700">{item.opportunityCode}</span>,
    <span className="text-[11px] text-gray-800">{item.customerName || '—'}</span>,
    <Badge label={item.stageName || '—'} className="bg-blue-100 text-blue-700" />,
    <span className="text-[11px] text-gray-700">{formatMoney(item.estimatedValue)}</span>,
    <span className="text-[11px] text-gray-500">{String(item.expectedCloseDate || '').slice(0, 10)}</span>,
  ]);

  const upcomingRows = upcomingFollowups.map((item) => [
    <span className="text-[11px] text-gray-700">{String(item.dueDate || '').slice(0, 10)}</span>,
    <span className="text-[11px] text-gray-800">{item.subject}</span>,
    <span className="text-[11px] text-gray-700">{item.linkedTo || '—'}</span>,
    <span className="text-[11px] text-gray-500">{item.type}</span>,
    <Badge label={item.priority} className="bg-red-100 text-red-700" />,
    <span className="text-[11px] text-gray-700">{item.assignedTo || '—'}</span>,
    <Badge label={item.status} className="bg-orange-100 text-orange-700" />,
  ]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 -mx-[13px] w-[calc(100%+26px)]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>CRM Overview</h1>
        <SelectDateButton value={appliedDateRange} title="CRM Date Range" onApply={(range) => setAppliedDateRange(range)} />
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total Leads" value={kpis.totalLeads} />
        <KpiCard label="Open Leads" value={kpis.openLeads} />
        <KpiCard label="Converted Leads" value={kpis.convertedLeads} />
        <KpiCard label="Total Opportunities" value={kpis.totalOpportunities} />
        <KpiCard label="Opportunities Won" value={kpis.opportunitiesWon} />
        <KpiCard label="Revenue Pipeline" value={formatMoney(kpis.revenuePipeline)} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="flex min-h-0 flex-col gap-3 lg:w-[60%]">
          <SectionCard title="Recent Leads" action={<button onClick={() => navigate('/crm/leads')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>} className="flex-1 overflow-hidden">
            <CommonTable headers={['Lead No', 'Lead Name', 'Status', 'Assigned To', 'Date']} rows={leadTableRows} fitParentWidth equalColumnWidth hideVerticalCellBorders cellPaddingClass="px-2 py-1.5" headerFontSize="11px" bodyFontSize="11px" />
          </SectionCard>
          <SectionCard title="Recent Opportunities" action={<button onClick={() => navigate('/crm/opportunities')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>} className="flex-1 overflow-hidden">
            <CommonTable headers={['Opp No', 'Customer', 'Stage', 'Value', 'Close Date']} rows={oppTableRows} fitParentWidth equalColumnWidth hideVerticalCellBorders cellPaddingClass="px-2 py-1.5" headerFontSize="11px" bodyFontSize="11px" />
          </SectionCard>
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto lg:w-[40%]">
          <SectionCard title="Today's Follow-ups" action={<button onClick={() => navigate('/crm/followups')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>}>
            <ul className="flex flex-col divide-y divide-gray-100">
              {todayFollowups.map((item) => (
                <li key={item.id} className="py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-800">{item.subject}</span>
                    <Badge label={item.priority} className="bg-red-100 text-red-700" />
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-500">{item.linkedTo || '—'} · {item.type} · {String(item.followupDate || '').slice(11, 16) || String(item.followupDate || '').slice(0, 10)}</div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Pipeline by Stage">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">Stage</th>
                  <th className="py-1 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">Count</th>
                  <th className="py-1 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pipelineByStage.map((row) => (
                  <tr key={row.stage}>
                    <td className="py-1.5 text-gray-700">{row.stage}</td>
                    <td className="py-1.5 text-right text-gray-600">{row.count}</td>
                    <td className="py-1.5 text-right text-gray-600">{formatMoney(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Lead Source Breakdown">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">Source</th>
                  <th className="py-1 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">Count</th>
                  <th className="py-1 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">Conversion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leadSourceBreakdown.map((row) => (
                  <tr key={row.source}>
                    <td className="py-1.5 text-gray-700">{row.source}</td>
                    <td className="py-1.5 text-right text-gray-600">{row.count}</td>
                    <td className="py-1.5 text-right text-gray-600">{row.conversionPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Upcoming Follow-ups" action={<button onClick={() => navigate('/crm/followups')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>} className="shrink-0">
        <CommonTable headers={['Due Date', 'Subject', 'Linked To', 'Type', 'Priority', 'Assigned To', 'Status']} rows={upcomingRows} fitParentWidth equalColumnWidth hideVerticalCellBorders cellPaddingClass="px-2 py-1.5" headerFontSize="11px" bodyFontSize="11px" />
      </SectionCard>
    </div>
  );
}
