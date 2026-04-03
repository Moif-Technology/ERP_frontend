import React, { useId, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || colors.primary?.DEFAULT || colors.primary?.[900] || '#790728';
/** Maroon vertical gradient from theme (sidebar / brand) */
const primaryGradient =
  colors.primary?.gradient ||
  'linear-gradient(180deg, #C44972 0%, #923A53 23%, #85203E 52%, #790728 95%)';

const shellClass =
  'box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-4 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-5 sm:p-4';

function InfoIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

function MiniSparkline({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 16" fill="none" aria-hidden>
      <path
        d="M2 12 L10 8 L18 11 L26 4 L34 7 L42 3 L46 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const kpiCardTransition =
  'group relative overflow-hidden rounded-xl p-3 transition-all duration-300 ease-out sm:p-4 ' +
  'hover:-translate-y-0.5 hover:shadow-xl focus-within:-translate-y-0.5 focus-within:shadow-xl ' +
  'motion-reduce:transform-none motion-reduce:transition-none';

function KpiCard({ title, value, delta, deltaPositive, featured, isGradientActive }) {
  const hoverGradientFill =
    'pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100';
  const hoverGradientShine =
    'pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/35 via-white/10 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100';

  if (isGradientActive) {
    const badge = (
      <span className="relative z-[1] inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold text-white sm:text-[10px]">
        {featured ? <MiniSparkline className="h-2.5 w-6 text-white/90" /> : null}
        {delta}
      </span>
    );
    return (
      <div
        className={`${kpiCardTransition} flex h-full min-h-[100px] flex-col gap-1 border border-white/25 shadow-md hover:shadow-2xl hover:shadow-[#790728]/40 focus-within:shadow-2xl focus-within:shadow-[#790728]/40`}
        style={{ background: primaryGradient, color: '#fff' }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-white/5 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
          aria-hidden
        />
        <button
          type="button"
          className="absolute right-2 top-2 z-[1] rounded p-0.5 text-white/80 transition-colors hover:text-white"
          aria-label="Info"
        >
          <InfoIcon />
        </button>
        <p className="relative z-[1] pr-6 text-[10px] font-medium text-white/90 sm:text-[11px]">{title}</p>
        <div className="relative z-[1] flex min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
          {badge}
        </div>
      </div>
    );
  }

  const badgeBase =
    'relative z-[1] inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold transition-colors duration-300 sm:text-[10px] ' +
    'group-hover:bg-white/20 group-hover:text-white group-focus-within:bg-white/20 group-focus-within:text-white';
  const badgeDefault = featured
    ? 'bg-rose-50 text-rose-800'
    : deltaPositive
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-rose-50 text-rose-700';
  const sparklineClass = featured
    ? 'h-2.5 w-6 text-rose-600 transition-colors group-hover:text-white/90 group-focus-within:text-white/90'
    : '';

  const badge = (
    <span className={`${badgeBase} ${badgeDefault}`}>
      {featured ? <MiniSparkline className={sparklineClass} /> : null}
      {delta}
    </span>
  );

  return (
    <div
      className={`${kpiCardTransition} flex h-full min-h-[100px] flex-col gap-1 border border-gray-200 bg-white shadow-sm hover:border-rose-200/90 hover:shadow-2xl hover:shadow-[#790728]/35 focus-within:border-rose-200/90 focus-within:shadow-2xl focus-within:shadow-[#790728]/35`}
    >
      <div className={hoverGradientFill} style={{ background: primaryGradient }} aria-hidden />
      <div className={hoverGradientShine} aria-hidden />
      <button
        type="button"
        className="absolute right-2 top-2 z-[1] rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 group-hover:text-white/90 group-hover:hover:text-white group-focus-within:text-white/90"
        aria-label="Info"
      >
        <InfoIcon />
      </button>
      <p className="relative z-[1] pr-6 text-[10px] font-medium text-gray-600 transition-colors duration-300 group-hover:text-white/85 group-focus-within:text-white/85 sm:text-[11px]">
        {title}
      </p>
      <div className="relative z-[1] flex min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-xl font-bold tabular-nums text-gray-900 transition-colors duration-300 group-hover:text-white group-focus-within:text-white sm:text-2xl">
          {value}
        </p>
        {badge}
      </div>
    </div>
  );
}

function MiniStatCard({ label, value, hint, hintTone = 'neutral' }) {
  const hintClass =
    hintTone === 'positive'
      ? 'text-emerald-600'
      : hintTone === 'muted'
        ? 'text-gray-400'
        : 'text-gray-500';
  return (
    <div className="flex min-h-[88px] min-w-0 flex-col justify-center rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50/90 to-white p-2.5 sm:p-3">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500 sm:text-[10px]">{label}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-gray-900 sm:text-lg">{value}</p>
      {hint ? <p className={`mt-0.5 text-[9px] sm:text-[10px] ${hintClass}`}>{hint}</p> : null}
    </div>
  );
}

const KPI_ITEMS = [
  { title: 'Total amount', value: '12345', delta: '+2.5%', deltaPositive: true, featured: true },
  { title: 'Total amount', value: '56784', delta: '+1.5%', deltaPositive: true, featured: false },
  { title: 'Total amount', value: '7542', delta: '+1.5%', deltaPositive: true, featured: false },
  { title: 'Total amount', value: '9637', delta: '-1.5%', deltaPositive: false, featured: false },
  { title: 'Total amount', value: '84578', delta: '-1.5%', deltaPositive: false, featured: false },
];

/** Mon–Sun sample sales curve, max 400 scale */
const SALES_POINTS = [
  { day: 'Mon', v: 120 },
  { day: 'Tue', v: 185 },
  { day: 'Wed', v: 95 },
  { day: 'Thu', v: 240 },
  { day: 'Fri', v: 310 },
  { day: 'Sat', v: 275 },
  { day: 'Sun', v: 355 },
];

/** Cubic smooth curve through points (Cardinal / Catmull-Rom style control points) */
function smoothLinePath(points) {
  if (points.length < 2) return '';
  const p = points;
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Snap mouse x to nearest data point index */
function nearestPointIndex(pts, svgX) {
  let best = 0;
  let bestD = Infinity;
  pts.forEach((p, i) => {
    const d = Math.abs(svgX - p.x);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/** Compact sales chart: zinc grid, rose fill + rose-900 stroke; hover shows marker + tooltip */
function SalesAreaChart() {
  const gradId = useId().replace(/:/g, '');
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const w = 640;
  const h = 214;
  const padL = 44;
  const padR = 16;
  const padT = 24;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const maxY = 400;
  const n = SALES_POINTS.length;

  const pts = SALES_POINTS.map((row, i) => {
    const x = padL + (innerW * i) / (n - 1);
    const y = padT + innerH * (1 - row.v / maxY);
    return { x, y, ...row };
  });

  const linePath = smoothLinePath(pts);
  const yBase = padT + innerH;
  const areaPath = `${linePath} L ${pts[n - 1].x} ${yBase} L ${pts[0].x} ${yBase} Z`;

  const yTicks = [0, 100, 200, 300, 400];
  const gridStroke = '#e4e4e7';
  const axisStroke = '#52525b';
  const roseStroke = '#881337';
  const labelClass = { fill: '#52525b', fontSize: 8.75, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' };

  const clientToSvg = (clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return null;
    const p = el.createSVGPoint();
    p.x = clientX;
    p.y = clientY;
    const ctm = el.getScreenCTM();
    if (!ctm) return null;
    return p.matrixTransform(ctm.inverse());
  };

  const handlePointer = (e) => {
    const loc = clientToSvg(e.clientX, e.clientY);
    if (!loc) return;
    if (loc.x < padL || loc.x > w - padR || loc.y < padT || loc.y > yBase) {
      setHoverIdx(null);
      return;
    }
    setHoverIdx(nearestPointIndex(pts, loc.x));
  };

  const hp = hoverIdx !== null ? pts[hoverIdx] : null;
  const tooltipAbove = hp && hp.y >= 52;

  return (
    <div className="relative w-full min-w-0 max-w-[640px] overflow-visible bg-white">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="h-36 w-full touch-none sm:h-40"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Sales by day"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#881337" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#db2777" stopOpacity="0.05" />
          </linearGradient>
          <filter id={`${gradId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.12" />
          </filter>
        </defs>

        {yTicks.map((tick) => {
          const y = padT + innerH * (1 - tick / maxY);
          return <line key={tick} x1={padL} y1={y} x2={w - padR} y2={y} stroke={gridStroke} strokeWidth={0.84} />;
        })}

        <line x1={padL} y1={yBase} x2={w - padR} y2={yBase} stroke={axisStroke} strokeWidth={0.84} />

        {pts.map((p) => (
          <line key={`tx-${p.day}`} x1={p.x} y1={yBase} x2={p.x} y2={yBase + 4} stroke={axisStroke} strokeWidth={0.84} />
        ))}

        {yTicks.map((tick) => {
          const y = padT + innerH * (1 - tick / maxY) + 2.5;
          const x = padL - 6;
          return (
            <text key={`yl-${tick}`} x={x} y={y} textAnchor="end" style={labelClass}>
              {tick}
            </text>
          );
        })}

        {pts.map((p) => (
          <text key={`xl-${p.day}`} x={p.x} y={h - 8} textAnchor="middle" style={labelClass}>
            {p.day}
          </text>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={roseStroke}
          strokeWidth={1.35}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <rect
          x={padL}
          y={padT}
          width={innerW}
          height={innerH}
          fill="transparent"
          className="cursor-crosshair"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setHoverIdx(null)}
        />

        {hp ? (
          <g pointerEvents="none">
            <circle cx={hp.x} cy={hp.y} r={4} fill={primary} stroke="#fff" strokeWidth={1.25} />
            <g transform={`translate(${hp.x}, ${hp.y})`} filter={`url(#${gradId}-shadow)`}>
              {tooltipAbove ? (
                <>
                  <rect x={-40} y={-46} width={80} height={36} rx={5} fill="#fff" stroke="#e4e4e7" strokeWidth={0.85} />
                  <text x={0} y={-32} textAnchor="middle" style={{ ...labelClass, fontSize: 8.25, fontWeight: 600 }}>
                    {hp.day}
                  </text>
                  <text x={0} y={-18} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#18181b', fontFamily: labelClass.fontFamily }}>
                    {hp.v} units
                  </text>
                </>
              ) : (
                <>
                  <rect x={-40} y={10} width={80} height={36} rx={5} fill="#fff" stroke="#e4e4e7" strokeWidth={0.85} />
                  <text x={0} y={24} textAnchor="middle" style={{ ...labelClass, fontSize: 8.25, fontWeight: 600 }}>
                    {hp.day}
                  </text>
                  <text x={0} y={38} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#18181b', fontFamily: labelClass.fontFamily }}>
                    {hp.v} units
                  </text>
                </>
              )}
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

const GAUGE_SEGMENTS = [
  { color: '#f8e8ec' },
  { color: '#e8c4cf' },
  { color: '#d5a0b0' },
  { color: '#b85d78' },
  { color: primary },
];

function CustomerGrowthGauge() {
  const cx = 100;
  const cy = 92;
  const r = 68;
  const stroke = 12;
  const n = GAUGE_SEGMENTS.length;
  const arcs = [];
  for (let i = 0; i < n; i += 1) {
    const t0 = Math.PI - (i * Math.PI) / n;
    const t1 = Math.PI - ((i + 1) * Math.PI) / n;
    const x1 = cx + r * Math.cos(t0);
    const y1 = cy - r * Math.sin(t0);
    const x2 = cx + r * Math.cos(t1);
    const y2 = cy - r * Math.sin(t1);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
    arcs.push(
      <path
        key={i}
        d={d}
        fill="none"
        stroke={GAUGE_SEGMENTS[i].color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 118" className="w-full max-w-[220px]">
        {arcs}
        <text x="100" y="88" textAnchor="middle" className="fill-gray-500 text-[9px]">
          Total customers
        </text>
        <text x="100" y="104" textAnchor="middle" className="fill-gray-900 text-lg font-bold">
          20,000
        </text>
      </svg>
      <ul className="mt-1 w-full space-y-1.5 px-1">
        {GAUGE_SEGMENTS.map((seg, i) => (
          <li key={i} className="flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: seg.color }} />
              Text value
            </span>
            <span className="font-semibold tabular-nums text-gray-800">20%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [kpiHoverIndex, setKpiHoverIndex] = useState(null);

  const kpiGradientActive = (i) => (kpiHoverIndex === null ? i === 0 : kpiHoverIndex === i);

  return (
    <div className={shellClass}>
      <h1 className="text-base font-bold uppercase tracking-wide sm:text-lg xl:text-xl" style={{ color: primary }}>
        Dashboard
      </h1>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4"
        onMouseLeave={() => setKpiHoverIndex(null)}
      >
        {KPI_ITEMS.map((k, i) => (
          <div key={`kpi-${i}`} className="min-h-0" onMouseEnter={() => setKpiHoverIndex(i)}>
            <KpiCard {...k} isGradientActive={kpiGradientActive(i)} />
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-4 lg:items-stretch">
        <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3 lg:col-span-8">
          <h2 className="mb-1.5 text-xs font-bold text-gray-900 sm:text-sm">Sales</h2>
          <div className="w-full shrink-0">
            <SalesAreaChart />
          </div>
        </section>

        <div className="grid min-h-0 min-w-0 grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1 lg:grid-rows-[minmax(88px,1fr)_minmax(88px,1fr)]">
          <MiniStatCard label="Open quotations" value="48" hint="+6 vs last week" hintTone="positive" />
          <MiniStatCard label="On-time delivery" value="96.4%" hint="SLA 95% · MTD" hintTone="positive" />
        </div>

        <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 lg:col-span-2">
          <h2 className="mb-2 text-center text-xs font-bold text-gray-900 sm:text-sm">Customer growth</h2>
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <CustomerGrowthGauge />
          </div>
        </section>
      </div>
    </div>
  );
}
