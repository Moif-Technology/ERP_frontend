import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTenants } from '../api/admin.api';

const STATUSES = ['', 'trial', 'active', 'grace', 'expired', 'suspended', 'cancelled'];

export default function TenantsListPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTenants({ status: status || undefined, search: search || undefined });
      setRows(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  const total = rows.length;
  const active = rows.filter((r) => r.status === 'active').length;
  const trial = rows.filter((r) => r.status === 'trial').length;
  const suspended = rows.filter((r) => r.status === 'suspended').length;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={H1}>Tenants</h1>
          <p style={SUBTITLE}>All companies on the platform.</p>
        </div>
        <button onClick={load} className="sa-btn-ghost" style={BTN_GHOST}>
          <RefreshIcon />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total', value: total, color: '#0f172a' },
          { label: 'Active', value: active, color: '#15803d' },
          { label: 'Trial', value: trial, color: '#4338ca' },
          { label: 'Suspended', value: suspended, color: '#7c3aed' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table panel */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ ...CONTROL, minWidth: 160 }}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search by company name or ID…"
            style={{ ...CONTROL, flex: 1 }}
          />
          <button onClick={load} className="sa-btn-primary" style={BTN_PRIMARY}>
            Search
          </button>
        </div>

        {error && (
          <div style={ERROR_BOX}>{error}</div>
        )}

        {loading ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Loading tenants…
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Company', 'Plan', 'Status', 'Trial ends', 'Period ends', ''].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.company_id} className="sa-tr">
                  <td style={TD}>
                    <span style={MONO}>{r.company_id}</span>
                  </td>
                  <td style={{ ...TD, fontWeight: 500, color: '#0f172a' }}>{r.company_name}</td>
                  <td style={TD}>
                    {r.plan_code ? <span style={CODE}>{r.plan_code}</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={TD}><StatusPill status={r.status} /></td>
                  <td style={{ ...TD, color: '#64748b', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(r.trial_ends_at)}</td>
                  <td style={{ ...TD, color: '#64748b', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(r.current_period_ends_at)}</td>
                  <td style={TD}>
                    <Link
                      to={`/super-admin/tenants/${r.company_id}`}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#4f46e5',
                        textDecoration: 'none',
                        padding: '4px 10px',
                        border: '1px solid #c7d2fe',
                        borderRadius: 6,
                        background: '#eef2ff',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = status || 'unset';
  const C = {
    active:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    trial:     { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
    grace:     { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    expired:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    suspended: { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
    cancelled: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
    unset:     { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
  };
  const c = C[s] || C.unset;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'capitalize',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.02em',
    }}>
      {s}
    </span>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function fmt(v) { return v ? new Date(v).toISOString().slice(0, 10) : '—'; }

const H1 = { margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' };
const SUBTITLE = { margin: '3px 0 0', fontSize: 13, color: '#64748b' };
const CONTROL = { height: 36, border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#374151', background: '#fff' };
const BTN_GHOST = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
};
const BTN_PRIMARY = {
  padding: '0 16px', height: 36, borderRadius: 8,
  background: '#4f46e5', color: '#fff', border: 'none',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const ERROR_BOX = {
  margin: '12px 16px', padding: '9px 12px', borderRadius: 8,
  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
};
const TH = {
  textAlign: 'left', padding: '9px 14px',
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  borderBottom: '1px solid #f1f5f9',
};
const TD = { padding: '11px 14px', borderBottom: '1px solid #f8fafc', fontSize: 13 };
const MONO = { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#94a3b8' };
const CODE = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
  background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: 4, padding: '1px 6px', color: '#475569',
};
