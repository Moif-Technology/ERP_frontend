import React, { useId, useRef, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { colors } from '../../../shared/constants/theme';

const primary         = colors.primary?.main || '#790728';
const primaryGradient = colors.primary?.gradient || 'linear-gradient(180deg,#C44972 0%,#790728 100%)';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const KPI_ICONS = {
  revenue: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  customers: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  pending: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  stock: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
};

const KPI_ITEMS = [
  { title: 'Total Revenue',   value: 'KWD 84,578', delta: '+12.5%', positive: true,  icon: KPI_ICONS.revenue   },
  { title: 'Total Orders',    value: '1,245',       delta: '+8.3%',  positive: true,  icon: KPI_ICONS.orders    },
  { title: 'Total Customers', value: '392',         delta: '+5.1%',  positive: true,  icon: KPI_ICONS.customers },
  { title: 'Pending Orders',  value: '48',          delta: '-2.4%',  positive: false, icon: KPI_ICONS.pending   },
  { title: 'Low Stock Items', value: '17',          delta: '+3',     positive: false, icon: KPI_ICONS.stock     },
];

const monthlySales = [
  { month: 'Jan', revenue: 42000, orders: 310 },
  { month: 'Feb', revenue: 38500, orders: 275 },
  { month: 'Mar', revenue: 51000, orders: 380 },
  { month: 'Apr', revenue: 47200, orders: 340 },
  { month: 'May', revenue: 63000, orders: 460 },
  { month: 'Jun', revenue: 58400, orders: 420 },
  { month: 'Jul', revenue: 71000, orders: 510 },
  { month: 'Aug', revenue: 66500, orders: 480 },
  { month: 'Sep', revenue: 75200, orders: 540 },
  { month: 'Oct', revenue: 69800, orders: 500 },
  { month: 'Nov', revenue: 84000, orders: 610 },
  { month: 'Dec', revenue: 91500, orders: 660 },
];

const weeklyTrend = [
  { day: 'Mon', sales: 120, returns: 8 },
  { day: 'Tue', sales: 185, returns: 12 },
  { day: 'Wed', sales: 95,  returns: 5  },
  { day: 'Thu', sales: 240, returns: 18 },
  { day: 'Fri', sales: 310, returns: 22 },
  { day: 'Sat', sales: 275, returns: 15 },
  { day: 'Sun', sales: 355, returns: 20 },
];

const categoryData = [
  { name: 'Electronics',  value: 32, color: '#790728' },
  { name: 'Auto Parts',   value: 24, color: '#C44972' },
  { name: 'Lubricants',   value: 18, color: '#9C3355' },
  { name: 'Consumables',  value: 14, color: '#E8809A' },
  { name: 'Accessories',  value: 12, color: '#F5B8C8' },
];

const crmLeads = [
  { id: 'LD-0041', customer: 'Al Noor Trading',    status: 'Qualified',   value: 'KWD 12,500', assigned: 'Ahmed K.' },
  { id: 'LD-0042', customer: 'Gulf Star Motors',   status: 'Contacted',   value: 'KWD 8,200',  assigned: 'Sara M.'  },
  { id: 'LD-0043', customer: 'Crescent Builders',  status: 'New',         value: 'KWD 5,750',  assigned: 'Omar F.'  },
  { id: 'LD-0044', customer: 'Horizon Logistics',  status: 'Negotiation', value: 'KWD 21,000', assigned: 'Layla A.' },
  { id: 'LD-0045', customer: 'Delta Retail Co',    status: 'Closed Won',  value: 'KWD 9,400',  assigned: 'Yusuf B.' },
];

const garageJobs = [
  { jobNo: 'JC-0318', vehicle: 'Toyota Camry • 4521 K', tech: 'Rajan P.',  status: 'In Progress', date: 'Today'  },
  { jobNo: 'JC-0317', vehicle: 'Nissan Patrol • 8843 K', tech: 'Ali H.',   status: 'Pending',     date: 'Today'  },
  { jobNo: 'JC-0316', vehicle: 'Honda Accord • 2210 K',  tech: 'Samer T.', status: 'Completed',   date: '04 May' },
  { jobNo: 'JC-0315', vehicle: 'BMW X5 • 9967 K',        tech: 'Rajan P.', status: 'Waiting',     date: '04 May' },
  { jobNo: 'JC-0314', vehicle: 'Kia Sportage • 7731 K',  tech: 'Ali H.',   status: 'Completed',   date: '03 May' },
];

const hrEvents = [
  { name: 'Ahmad Malik',  action: 'Leave Approved',  dept: 'Finance', time: '09:00 AM', type: 'leave'   },
  { name: 'Sara Johnson', action: 'Checked In',      dept: 'CRM',     time: '08:45 AM', type: 'checkin' },
  { name: 'Omar Farouq',  action: 'Late Arrival',    dept: 'Garage',  time: '09:32 AM', type: 'late'    },
  { name: 'Layla Al-Ali', action: 'Leave Request',   dept: 'Admin',   time: '10:15 AM', type: 'request' },
  { name: 'Rajan Patel',  action: 'Overtime Logged', dept: 'Garage',  time: '06:00 PM', type: 'ot'      },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CRM_STATUS = {
  'New':         'bg-[#79072814] text-[#790728]',
  'Contacted':   'bg-[#7907281F] text-[#790728]',
  'Qualified':   'bg-[#79072829] text-[#790728]',
  'Negotiation': 'bg-[#79072814] text-[#790728]',
  'Closed Won':  'bg-[#79072829] text-[#790728]',
  'Closed Lost': 'bg-[#7907280F] text-[#790728]',
};

const GARAGE_STATUS = {
  'In Progress': 'bg-[#7907281F] text-[#790728]',
  'Pending':     'bg-[#79072814] text-[#790728]',
  'Waiting':     'bg-[#7907280F] text-[#790728]',
  'Completed':   'bg-[#79072829] text-[#790728]',
  'Cancelled':   'bg-[#7907280F] text-[#790728]',
};

const HR_TYPE = {
  checkin: { bg: '#7907281F', color: '#790728' },
  leave:   { bg: '#79072814', color: '#790728' },
  request: { bg: '#7907280F', color: '#790728' },
  late:    { bg: '#79072814', color: '#790728' },
  ot:      { bg: '#79072829', color: '#790728' },
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg text-[11px]">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="leading-snug" style={{ color: p.color }}>
          {p.name}: <span className="font-bold text-gray-800">{typeof p.value === 'number' && p.value > 999 ? `KWD ${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({ title, value, delta, positive, icon, active, onEnter, onLeave }) {
  return (
    <div
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      className="group relative overflow-hidden rounded-xl border p-3 transition-all duration-300 cursor-default hover:-translate-y-0.5 sm:p-4"
      style={active
        ? { background: primaryGradient, borderColor: 'transparent', boxShadow: `0 8px 24px -4px ${primary}55` }
        : { background: '#fff', borderColor: '#e5e7eb' }}
    >
      {/* hover shimmer */}
      {!active && <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: primaryGradient }} />}

      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${active ? 'text-white/80' : 'text-gray-500 group-hover:text-white/80'}`}>{title}</span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white/20 group-hover:text-white'}`}>{icon}</span>
        </div>
        <p className={`text-xl font-bold tabular-nums transition-colors sm:text-2xl ${active ? 'text-white' : 'text-gray-900 group-hover:text-white'}`}>{value}</p>
        <span className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px] ${
          active ? 'bg-white/20 text-white' : positive ? 'bg-emerald-50 text-emerald-700 group-hover:bg-white/20 group-hover:text-white' : 'bg-rose-50 text-rose-700 group-hover:bg-white/20 group-hover:text-white'
        }`}>
          {positive ? '▲' : '▼'} {delta}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

function Card({ title, action, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</span>
          {action}
        </div>
      )}
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------

const GAUGE_SEGS = [
  { color: '#f5b8c8', label: 'New',       pct: '18%' },
  { color: '#e8809a', label: 'Regular',   pct: '25%' },
  { color: '#9C3355', label: 'Premium',   pct: '22%' },
  { color: '#C44972', label: 'Corporate', pct: '20%' },
  { color: primary,   label: 'VIP',       pct: '15%' },
];

function CustomerGauge() {
  const cx = 100, cy = 88, r = 64, stroke = 14;
  const n = GAUGE_SEGS.length;
  const arcs = Array.from({ length: n }, (_, i) => {
    const t0 = Math.PI - (i * Math.PI) / n;
    const t1 = Math.PI - ((i + 1) * Math.PI) / n;
    return (
      <path key={i} fill="none" stroke={GAUGE_SEGS[i].color} strokeWidth={stroke} strokeLinecap="round"
        d={`M ${cx + r * Math.cos(t0)} ${cy - r * Math.sin(t0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(t1)} ${cy - r * Math.sin(t1)}`} />
    );
  });
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
        {arcs}
        <text x="100" y="82" textAnchor="middle" style={{ fontSize: 8, fill: '#6b7280' }}>Total Customers</text>
        <text x="100" y="98" textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: '#111827' }}>20,000</text>
      </svg>
      <ul className="w-full space-y-1">
        {GAUGE_SEGS.map((s, i) => (
          <li key={i} className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className="font-semibold text-gray-800">{s.pct}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [activeKpi, setActiveKpi] = useState(0);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none -mx-[13px] flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm sm:p-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wide sm:text-lg" style={{ color: primary }}>Dashboard</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">Business performance overview — May 2026</p>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold text-gray-500 shadow-sm">
          Last updated: 05 May 2026, 02:00 PM
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        onMouseLeave={() => setActiveKpi(0)}>
        {KPI_ITEMS.map((k, i) => (
          <KpiCard key={i} {...k} active={activeKpi === i}
            onEnter={() => setActiveKpi(i)} onLeave={() => {}} />
        ))}
      </div>

      {/* Row 1 — Monthly Revenue + Category Donut + Customer Gauge */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* Monthly Revenue Bar */}
        <Card title="Monthly Revenue" className="lg:col-span-7">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlySales} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                {monthlySales.map((_, i) => (
                  <Cell key={i} fill={i === monthlySales.length - 1 ? primary : `${primary}55`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Category */}
        <Card title="Revenue by Category" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={3} dataKey="value" nameKey="name"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false} style={{ fontSize: 9, fontWeight: 600 }}>
                {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v}%`, 'Share']} />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Customer Gauge */}
        <Card title="Customer Segments" className="lg:col-span-2">
          <CustomerGauge />
        </Card>
      </div>

      {/* Row 2 — Weekly Sales Trend + Quick Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* Weekly Trend */}
        <Card title="Weekly Sales Trend" className="lg:col-span-8">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={weeklyTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primary} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              <Area type="monotone" dataKey="sales"   name="Sales"   stroke={primary}    fill="url(#gradSales)"   strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="returns" name="Returns" stroke="#f59e0b"   fill="url(#gradReturns)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1 content-start">
          {[
            { label: 'Open Quotations',   value: '48',    hint: '+6 vs last week',   color: '#6366f1' },
            { label: 'On-Time Delivery',  value: '96.4%', hint: 'SLA 95% · MTD',     color: '#22c55e' },
            { label: 'Avg Order Value',   value: 'KWD 67',hint: '+KWD 4 vs last mo', color: '#f59e0b' },
            { label: 'Returns Rate',      value: '2.1%',  hint: '-0.3% vs last mo',  color: primary   },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{s.label}</p>
                <p className="text-sm font-bold tabular-nums text-gray-900">{s.value}</p>
                <p className="text-[9px] text-gray-400">{s.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3 — Module Summaries: CRM · Garage · HR */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* ── CRM Summary ── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* CRM header */}
          <div className="border-b border-gray-100 bg-white px-4 py-3" style={{ borderTop: `2px solid ${primary}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${primary}1A`, color: primary }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>CRM</span>
              </div>
              <button className="text-[10px] font-semibold transition-colors hover:opacity-80" style={{ color: primary }}>View All →</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Active Leads', value: '84' },
                { label: 'Open Deals',   value: '23' },
                { label: "Today's F/U",  value: '12' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center">
                  <p className="text-lg font-bold tabular-nums" style={{ color: primary }}>{s.value}</p>
                  <p className="text-[9px] leading-tight text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* CRM leads list */}
          <div className="divide-y divide-gray-50">
            {crmLeads.map((l) => (
              <div key={l.id} className="flex items-center gap-2 px-4 py-2 transition-colors">
                <span className="w-14 shrink-0 font-mono text-[9px] text-gray-400">{l.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-gray-800">{l.customer}</p>
                  <p className="text-[9px] text-gray-400">{l.assigned} · {l.value}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${CRM_STATUS[l.status]}`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Garage Summary ── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Garage header */}
          <div className="border-b border-gray-100 bg-white px-4 py-3" style={{ borderTop: `2px solid ${primary}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${primary}1A`, color: primary }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
                    <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
                    <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
                    <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
                    <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                    <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/>
                    <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/>
                  </svg>
                </span>
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>Garage</span>
              </div>
              <button className="text-[10px] font-semibold transition-colors hover:opacity-80" style={{ color: primary }}>View All →</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Active Jobs',   value: '32' },
                { label: 'Pending Parts', value: '9'  },
                { label: 'Deliveries',    value: '7'  },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center">
                  <p className="text-lg font-bold tabular-nums" style={{ color: primary }}>{s.value}</p>
                  <p className="text-[9px] leading-tight text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Garage jobs list */}
          <div className="divide-y divide-gray-50">
            {garageJobs.map((j) => (
              <div key={j.jobNo} className="flex items-center gap-2 px-4 py-2 transition-colors">
                <span className="w-16 shrink-0 font-mono text-[9px] text-gray-400">{j.jobNo}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-gray-800">{j.vehicle}</p>
                  <p className="text-[9px] text-gray-400">{j.tech} · {j.date}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${GARAGE_STATUS[j.status]}`}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HR Summary ── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* HR header */}
          <div className="border-b border-gray-100 bg-white px-4 py-3" style={{ borderTop: `2px solid ${primary}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${primary}1A`, color: primary }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                  </svg>
                </span>
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: primary }}>HR</span>
              </div>
              <button className="text-[10px] font-semibold transition-colors hover:opacity-80" style={{ color: primary }}>View All →</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Employees',     value: '128' },
                { label: 'On Leave',      value: '7'   },
                { label: 'Present Today', value: '112' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center">
                  <p className="text-lg font-bold tabular-nums" style={{ color: primary }}>{s.value}</p>
                  <p className="text-[9px] leading-tight text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* HR events list */}
          <div className="divide-y divide-gray-50">
            {hrEvents.map((ev, i) => {
              const t = HR_TYPE[ev.type];
              return (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50/40 transition-colors">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: t.bg, color: t.color }}>
                    {ev.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-800">{ev.name}</p>
                    <p className="text-[9px] text-gray-400">{ev.dept} · {ev.time}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                    style={{ background: t.bg, color: t.color }}>
                    {ev.action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
