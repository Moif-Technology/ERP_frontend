import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { CommonTable, SelectDateButton, formatDDMMYYYY } from '../../../shared/components/ui';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';
const primaryPalette = {
  50: colors.primary?.[50] || '#F2E6EA',
  100: colors.primary?.[100] || '#E4CDD3',
  200: colors.primary?.[200] || '#D5B4BF',
  700: colors.primary?.[700] || '#85203E',
  800: colors.primary?.[800] || '#85203E',
  900: colors.primary?.[900] || '#790728',
};
const CHART_THEME = {
  primary,
  orange: '#CE6D2D',
  deepMaroon: '#480A09',
  clay: '#9C7156',
  sand: '#E8E2CA',
  taupe: '#6D6558',
};
const COLORS = [CHART_THEME.primary, CHART_THEME.orange, CHART_THEME.clay, CHART_THEME.sand, CHART_THEME.taupe, CHART_THEME.deepMaroon];

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const recentJobCards = [
  { jobNo: 'JC-2026-001', customer: 'Al Rashid Trading',    vehicle: 'Toyota Hiace',       regNo: 'KWI-4521', status: 'Open',        technician: 'Ravi',  date: '02 May 2026' },
  { jobNo: 'JC-2026-002', customer: 'Gulf Tech Solutions',   vehicle: 'Nissan Patrol',      regNo: 'KWI-7803', status: 'In Progress',  technician: 'Ahmed', date: '01 May 2026' },
  { jobNo: 'JC-2026-003', customer: 'Noor Interiors LLC',    vehicle: 'Honda Accord',       regNo: 'KWI-1102', status: 'Completed',    technician: 'Priya', date: '30 Apr 2026' },
  { jobNo: 'JC-2026-004', customer: 'Horizon Builders',      vehicle: 'Ford F-150',         regNo: 'KWI-3390', status: 'Pending',      technician: 'Ravi',  date: '29 Apr 2026' },
  { jobNo: 'JC-2026-005', customer: 'Delta Freight Co',      vehicle: 'Mitsubishi Canter',  regNo: 'KWI-5514', status: 'Completed',    technician: 'Ahmed', date: '28 Apr 2026' },
  { jobNo: 'JC-2026-006', customer: 'Pinnacle Retail',       vehicle: 'Hyundai Tucson',     regNo: 'KWI-9901', status: 'Open',        technician: 'Priya', date: '27 Apr 2026' },
  { jobNo: 'JC-2026-007', customer: 'Crescent Logistics',    vehicle: 'Toyota Land Cruiser',regNo: 'KWI-2278', status: 'In Progress',  technician: 'Ravi',  date: '26 Apr 2026' },
];

const recentSubletOrders = [
  { subletNo: 'SL-2026-001', lpoNo: 'LPO-0041', supplier: 'Gulf Auto Parts',       amount: 4500, status: 'Approved', date: '02 May 2026' },
  { subletNo: 'SL-2026-002', lpoNo: 'LPO-0042', supplier: 'Al Noor Auto Supplies', amount: 8200, status: 'Pending',  date: '01 May 2026' },
  { subletNo: 'SL-2026-003', lpoNo: 'LPO-0043', supplier: 'Premier Spare Parts',   amount: 1750, status: 'Issued',   date: '30 Apr 2026' },
  { subletNo: 'SL-2026-004', lpoNo: 'LPO-0044', supplier: 'Gulf Auto Parts',       amount: 3300, status: 'Approved', date: '29 Apr 2026' },
  { subletNo: 'SL-2026-005', lpoNo: 'LPO-0045', supplier: 'Sunrise Automotive',    amount: 6100, status: 'Rejected', date: '28 Apr 2026' },
  { subletNo: 'SL-2026-006', lpoNo: 'LPO-0046', supplier: 'Al Noor Auto Supplies', amount: 2950, status: 'Pending',  date: '27 Apr 2026' },
  { subletNo: 'SL-2026-007', lpoNo: 'LPO-0047', supplier: 'Premier Spare Parts',   amount: 5400, status: 'Issued',   date: '26 Apr 2026' },
];

const todayPendingRequests = [
  { id: 1, jobNo: 'JC-2026-002', type: 'Lubricant',  description: 'Engine oil 5W-30 — 4 litre',   requestedBy: 'Ahmed', time: '08:15 AM', priority: 'High'   },
  { id: 2, jobNo: 'JC-2026-004', type: 'Consumable', description: 'Oil filter replacement',         requestedBy: 'Ravi',  time: '09:30 AM', priority: 'Medium' },
  { id: 3, jobNo: 'JC-2026-001', type: 'Sublet',     description: 'AC compressor overhaul',         requestedBy: 'Priya', time: '10:00 AM', priority: 'High'   },
  { id: 4, jobNo: 'JC-2026-006', type: 'Lubricant',  description: 'Gear oil ATF — 2 litre',         requestedBy: 'Priya', time: '11:30 AM', priority: 'Low'    },
  { id: 5, jobNo: 'JC-2026-007', type: 'Consumable', description: 'Air filter & cabin filter kit',  requestedBy: 'Ravi',  time: '01:00 PM', priority: 'Medium' },
];

const upcomingDeliveries = [
  { jobNo: 'JC-2026-003', customer: 'Noor Interiors LLC',  vehicle: 'Honda Accord',       regNo: 'KWI-1102', deliveryDate: '06 May 2026', technician: 'Priya', status: 'Ready'       },
  { jobNo: 'JC-2026-005', customer: 'Delta Freight Co',    vehicle: 'Mitsubishi Canter',  regNo: 'KWI-5514', deliveryDate: '06 May 2026', technician: 'Ahmed', status: 'Ready'       },
  { jobNo: 'JC-2026-001', customer: 'Al Rashid Trading',   vehicle: 'Toyota Hiace',       regNo: 'KWI-4521', deliveryDate: '07 May 2026', technician: 'Ravi',  status: 'Pending'     },
  { jobNo: 'JC-2026-004', customer: 'Horizon Builders',    vehicle: 'Ford F-150',         regNo: 'KWI-3390', deliveryDate: '08 May 2026', technician: 'Ravi',  status: 'In Progress' },
  { jobNo: 'JC-2026-007', customer: 'Crescent Logistics',  vehicle: 'Toyota Land Cruiser',regNo: 'KWI-2278', deliveryDate: '09 May 2026', technician: 'Ravi',  status: 'In Progress' },
];

const weeklyJobTrend = [
  { day: 'Mon', open: 4, completed: 2, pending: 1 },
  { day: 'Tue', open: 3, completed: 5, pending: 2 },
  { day: 'Wed', open: 6, completed: 3, pending: 1 },
  { day: 'Thu', open: 2, completed: 7, pending: 3 },
  { day: 'Fri', open: 5, completed: 4, pending: 2 },
  { day: 'Sat', open: 3, completed: 6, pending: 1 },
  { day: 'Sun', open: 1, completed: 2, pending: 0 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatKWD(amount) {
  return 'KWD ' + Number(amount).toLocaleString('en-KW', { minimumFractionDigits: 3 });
}

function startOfDay(d) {
  if (!d) return null;
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}

function parseDashboardDate(value) {
  if (!value) return null;
  const monthIndex = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const m = String(value).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  const parsed = m ? new Date(Number(m[3]), monthIndex[m[2]], Number(m[1])) : new Date(value);
  return isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function isDateInRange(value, range) {
  if (!range?.from || !range?.to) return true;
  const date = parseDashboardDate(value);
  if (!date) return false;
  return date >= startOfDay(range.from) && date <= startOfDay(range.to);
}

function emptyRow(colSpan) {
  return [[{ content: <span className="block py-3 text-center text-[11px] text-gray-400">No records for selected date range</span>, colSpan, className: 'text-center' }]];
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

const BADGE_TONES = {
  primary: { bg: '#79072822', text: '#790728', border: '#79072833' },
  orange: { bg: '#CE6D2D22', text: '#A4541E', border: '#CE6D2D33' },
  deepMaroon: { bg: '#480A0922', text: '#480A09', border: '#480A0933' },
  clay: { bg: '#9C715622', text: '#7F5A43', border: '#9C715633' },
  taupe: { bg: '#6D655822', text: '#5A544A', border: '#6D655833' },
  sand: { bg: '#E8E2CA', text: '#6D6558', border: '#D8D0B4' },
};
const JOB_STATUS_STYLES = {
  Open: BADGE_TONES.primary,
  'In Progress': BADGE_TONES.orange,
  Pending: BADGE_TONES.clay,
  Completed: BADGE_TONES.taupe,
  Cancelled: BADGE_TONES.deepMaroon,
};
const SUBLET_STATUS_STYLES = {
  Pending: BADGE_TONES.clay,
  Approved: BADGE_TONES.primary,
  Issued: BADGE_TONES.orange,
  Rejected: BADGE_TONES.deepMaroon,
};
const DELIVERY_STATUS_STYLES = {
  Ready: BADGE_TONES.primary,
  Pending: BADGE_TONES.clay,
  'In Progress': BADGE_TONES.orange,
};
const PRIORITY_STYLES = {
  High: BADGE_TONES.deepMaroon,
  Medium: BADGE_TONES.orange,
  Low: BADGE_TONES.sand,
};
const REQUEST_TYPE_STYLES = {
  Lubricant: BADGE_TONES.primary,
  Consumable: BADGE_TONES.clay,
  Sublet: BADGE_TONES.taupe,
};

function Badge({ label, styleMap, fallback = { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' } }) {
  const tone = styleMap[label] || fallback;
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight border"
      style={{ backgroundColor: tone.bg, color: tone.text, borderColor: tone.border }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({ label, value, subtitle, indicatorColor, trend }) {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm p-3 flex flex-col gap-1 min-w-0 bg-white">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</span>
      <span className="text-xl font-bold text-gray-800 leading-tight truncate">{value}</span>
      <div className="flex items-center gap-1 mt-0.5">
        {indicatorColor && <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: indicatorColor }} />}
        <span className="text-[10px] text-gray-400">{subtitle}</span>
        {trend != null && (
          <span className={`ml-auto text-[10px] font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip for charts
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-[11px]">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="leading-snug">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GarageDashboard() {
  const navigate = useNavigate();
  const [appliedDateRange, setAppliedDateRange] = useState(null);

  const filteredJobCards     = useMemo(() => recentJobCards.filter((j)     => isDateInRange(j.date, appliedDateRange)), [appliedDateRange]);
  const filteredSubletOrders = useMemo(() => recentSubletOrders.filter((s) => isDateInRange(s.date, appliedDateRange)), [appliedDateRange]);
  const filteredDeliveries   = useMemo(() => upcomingDeliveries.filter((d) => isDateInRange(d.deliveryDate, appliedDateRange)), [appliedDateRange]);

  const kpis = useMemo(() => {
    const openStatuses = new Set(['Open', 'In Progress', 'Pending']);
    return {
      totalJobCards: filteredJobCards.length,
      openJobs:      filteredJobCards.filter((j) => openStatuses.has(j.status)).length,
      completedJobs: filteredJobCards.filter((j) => j.status === 'Completed').length,
      lubricantReqs: todayPendingRequests.filter((r) => r.type === 'Lubricant').length,
      subletOrders:  filteredSubletOrders.length,
      totalRevenue:  filteredSubletOrders.filter((s) => s.status === 'Issued').reduce((sum, s) => sum + s.amount, 0),
    };
  }, [filteredJobCards, filteredSubletOrders]);

  const dateRangeLabel = appliedDateRange?.from && appliedDateRange?.to
    ? `${formatDDMMYYYY(appliedDateRange.from)} – ${formatDDMMYYYY(appliedDateRange.to)}`
    : 'All dates';

  // ── chart data ─────────────────────────────────────────────────────────────

  const jobStatusPieData = useMemo(() => {
    const statuses = ['Open', 'In Progress', 'Pending', 'Completed', 'Cancelled'];
    return statuses
      .map((s) => ({ name: s, value: filteredJobCards.filter((j) => j.status === s).length }))
      .filter((d) => d.value > 0);
  }, [filteredJobCards]);

  const requestTypePieData = useMemo(() => {
    const types = ['Lubricant', 'Consumable', 'Sublet'];
    const typeColors = { Lubricant: CHART_THEME.primary, Consumable: CHART_THEME.clay, Sublet: CHART_THEME.taupe };
    return types.map((t) => ({ name: t, value: todayPendingRequests.filter((r) => r.type === t).length, color: typeColors[t] }));
  }, []);

  const technicianBarData = useMemo(() => {
    return ['Ahmed', 'Priya', 'Ravi'].map((name) => {
      const jobs = filteredJobCards.filter((j) => j.technician === name);
      return {
        name,
        Assigned:  jobs.length,
        Completed: jobs.filter((j) => j.status === 'Completed').length,
        Open:      jobs.filter((j) => j.status === 'Open' || j.status === 'In Progress').length,
      };
    });
  }, [filteredJobCards]);

  const subletSupplierData = useMemo(() => {
    const map = {};
    filteredSubletOrders.forEach((s) => { map[s.supplier] = (map[s.supplier] || 0) + s.amount; });
    return Object.entries(map).map(([name, amount]) => ({ name: name.replace('Auto Supplies', 'Auto'), amount }));
  }, [filteredSubletOrders]);

  // ── table rows ──────────────────────────────────────────────────────────────

  const jobCardHeaders = ['Job No', 'Customer', 'Vehicle', 'Status', 'Date'];
  const jobCardRows = filteredJobCards.length
    ? filteredJobCards.map((j) => [
        <span className="font-mono text-[11px] text-gray-700">{j.jobNo}</span>,
        <span className="text-[11px] text-gray-800">{j.customer}</span>,
        <span className="text-[11px] text-gray-600">{j.vehicle}</span>,
        <Badge label={j.status} styleMap={JOB_STATUS_STYLES} />,
        <span className="text-[11px] text-gray-500">{j.date}</span>,
      ])
    : emptyRow(jobCardHeaders.length);

  const subletHeaders = ['Sublet No', 'Supplier', 'Amount', 'Status', 'Date'];
  const subletRows = filteredSubletOrders.length
    ? filteredSubletOrders.map((s) => [
        <span className="font-mono text-[11px] text-gray-700">{s.subletNo}</span>,
        <span className="text-[11px] text-gray-800">{s.supplier}</span>,
        <span className="text-[11px] text-gray-700 tabular-nums">{formatKWD(s.amount)}</span>,
        <Badge label={s.status} styleMap={SUBLET_STATUS_STYLES} />,
        <span className="text-[11px] text-gray-500">{s.date}</span>,
      ])
    : emptyRow(subletHeaders.length);

  const deliveryHeaders = ['Job No', 'Customer', 'Vehicle', 'Delivery Date', 'Technician', 'Status'];
  const deliveryRows = filteredDeliveries.length
    ? filteredDeliveries.map((d) => [
        <span className="font-mono text-[11px] text-gray-700">{d.jobNo}</span>,
        <span className="text-[11px] text-gray-800">{d.customer}</span>,
        <span className="text-[11px] text-gray-600">{d.vehicle}</span>,
        <span className="text-[11px] text-gray-700">{d.deliveryDate}</span>,
        <span className="text-[11px] text-gray-700">{d.technician}</span>,
        <Badge label={d.status} styleMap={DELIVERY_STATUS_STYLES} />,
      ])
    : emptyRow(deliveryHeaders.length);

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3 overflow-y-auto border border-gray-200 bg-gray-50 p-3 rounded-lg -mx-[13px] w-[calc(100%+26px)]">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>Garage Overview</h1>
          <p className="text-[10px] mt-0.5" style={{ color: primaryPalette[700] }}>Live workshop performance at a glance</p>
        </div>
        <div className="shrink-0">
          <SelectDateButton value={appliedDateRange} title="Garage Date Range" onApply={setAppliedDateRange} />
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 px-3 py-2">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Showing data for</span>
          <div className="truncate text-xs font-bold text-gray-800">{dateRangeLabel}</div>
        </div>
        <span className="text-[10px] font-medium text-gray-500">
          {kpis.totalJobCards} job cards · {kpis.subletOrders} sublet orders · {todayPendingRequests.length} requests today
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Job Cards" value={kpis.totalJobCards} subtitle="This period" indicatorColor={primaryPalette[900]} trend={12} />
        <KpiCard label="Open Jobs"       value={kpis.openJobs}      subtitle="Active"      indicatorColor={primaryPalette[800]} trend={-5} />
        <KpiCard label="Completed"        value={kpis.completedJobs} subtitle="This period" indicatorColor={primaryPalette[700]} trend={18} />
        <KpiCard label="Lubricant Req."   value={kpis.lubricantReqs} subtitle="Today"       indicatorColor="#AD6A7C" />
        <KpiCard label="Sublet Orders"    value={kpis.subletOrders}  subtitle="This period" indicatorColor="#C89DA7" trend={7} />
        <KpiCard label="Sublet Revenue"   value={formatKWD(kpis.totalRevenue)} subtitle="Issued" indicatorColor={primary} />
      </div>

      {/* Charts Row 1 — Weekly Trend + Job Status Pie + Request Type Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Weekly Job Trend — area chart */}
        <SectionCard title="Weekly Job Trend" className="lg:col-span-6">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyJobTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_THEME.primary} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={CHART_THEME.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_THEME.orange} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={CHART_THEME.orange} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_THEME.clay} stopOpacity={0.24} />
                  <stop offset="95%" stopColor={CHART_THEME.clay} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              <Area type="monotone" dataKey="open"      name="Open"      stroke={CHART_THEME.primary} fill="url(#gradOpen)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke={CHART_THEME.orange} fill="url(#gradDone)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="pending"   name="Pending"   stroke={CHART_THEME.clay} fill="url(#gradPend)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Job Status Pie */}
        <SectionCard title="Job Status" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={jobStatusPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                paddingAngle={3} dataKey="value" nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 9, fontWeight: 600 }}
              >
                {jobStatusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Request Type Pie */}
        <SectionCard title="Request Types" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={requestTypePieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                paddingAngle={3} dataKey="value" nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 9, fontWeight: 600 }}
              >
                {requestTypePieData.map((d, i) => <Cell key={i} fill={d.color || COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Charts Row 2 — Technician Bar + Sublet Supplier Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Technician Activity */}
        <SectionCard title="Technician Activity">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={technicianBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              <Bar dataKey="Assigned"  fill={CHART_THEME.primary} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Completed" fill={CHART_THEME.orange} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Open"      fill={CHART_THEME.clay} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Sublet by Supplier */}
        <SectionCard title="Sublet Amount by Supplier">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={subletSupplierData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barSize={22} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<ChartTooltip />} formatter={(v) => [`KWD ${v.toLocaleString()}`, 'Amount']} />
              <Bar dataKey="amount" radius={[0, 3, 3, 0]}>
                {subletSupplierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Tables Row — Recent Job Cards + Recent Sublet Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard
          title="Recent Job Cards"
          action={<button onClick={() => navigate('/garage/home')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>}
        >
          <CommonTable headers={jobCardHeaders} rows={jobCardRows} fitParentWidth equalColumnWidth hideVerticalCellBorders
            cellPaddingClass="px-2 py-1.5" headerFontSize="11px" bodyFontSize="11px" />
        </SectionCard>

        <SectionCard
          title="Recent Sublet Orders"
          action={<button onClick={() => navigate('/garage/sublet-monitor')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>}
        >
          <CommonTable headers={subletHeaders} rows={subletRows} fitParentWidth equalColumnWidth hideVerticalCellBorders
            cellPaddingClass="px-2 py-1.5" headerFontSize="11px" bodyFontSize="11px" />
        </SectionCard>
      </div>

      {/* Today's Pending Requests */}
      <SectionCard
        title="Today's Pending Requests"
        action={<button onClick={() => navigate('/garage/consumable-monitor')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {todayPendingRequests.map((r) => (
            <div key={r.id} className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-semibold text-gray-800 leading-tight">{r.description}</span>
                <Badge label={r.priority} styleMap={PRIORITY_STYLES} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="font-mono text-[10px] text-gray-500">{r.jobNo}</span>
                <Badge label={r.type} styleMap={REQUEST_TYPE_STYLES} />
                <span className="ml-auto text-[10px] text-gray-400 tabular-nums">{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Upcoming Deliveries */}
      <SectionCard
        title="Upcoming Deliveries"
        action={<button onClick={() => navigate('/garage/home')} className="text-xs hover:underline" style={{ color: primary }}>View All</button>}
      >
        <CommonTable headers={deliveryHeaders} rows={deliveryRows} fitParentWidth equalColumnWidth hideVerticalCellBorders
          cellPaddingClass="px-2 py-1.5" headerFontSize="11px" bodyFontSize="11px" />
      </SectionCard>

    </div>
  );
}
