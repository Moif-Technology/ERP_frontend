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
  const summary = summarize(rows);

  return (
    <div style={wrap}>
      <section style={statsRow}>
        <StatCard label="Total" value={summary.total} />
        <StatCard label="Active" value={summary.active} />
        <StatCard label="Trial" value={summary.trial} />
        <StatCard label="Suspended" value={summary.suspended} />
      </section>

      <section style={panel}>
        <div style={panelHeader}>
          <h2 style={h2}>Tenants</h2>
          <button onClick={load} style={refreshBtn}>Refresh</button>
        </div>

        <div style={filters}>
          <select style={select} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
          <input
            style={input}
            placeholder="Search by company name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {loading ? <div style={{ padding: 16 }}>Loading tenants...</div> : (
          <table style={table}>
            <thead>
              <tr style={{ background: '#eef2fb' }}>
                <th style={th}>ID</th>
                <th style={th}>Company</th>
                <th style={th}>Plan</th>
                <th style={th}>Status</th>
                <th style={th}>Trial Ends</th>
                <th style={th}>Period Ends</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.company_id}>
                  <td style={td}>{r.company_id}</td>
                  <td style={td}>{r.company_name}</td>
                  <td style={td}>{r.plan_code || '—'}</td>
                  <td style={td}><StatusPill status={r.status} /></td>
                  <td style={td}>{fmt(r.trial_ends_at)}</td>
                  <td style={td}>{fmt(r.current_period_ends_at)}</td>
                  <td style={td}>
                    <Link to={`/super-admin/tenants/${r.company_id}`} style={openLink}>Open</Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: 24 }}>No tenants found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = status || 'unset';
  return <span style={{ ...pill, ...statusColor[normalized] }}>{normalized}</span>;
}

function summarize(rows) {
  const data = { total: rows.length, active: 0, trial: 0, suspended: 0 };
  rows.forEach((r) => {
    if (r.status === 'active') data.active += 1;
    if (r.status === 'trial') data.trial += 1;
    if (r.status === 'suspended') data.suspended += 1;
  });
  return data;
}

function fmt(v) { return v ? new Date(v).toISOString().slice(0, 10) : '—'; }

const wrap = { display: 'grid', gap: 16 };
const statsRow = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 10 };
const statCard = { background: '#fff', border: '1px solid #d9e3f4', borderRadius: 10, padding: 12 };
const statLabel = { color: '#5f7199', fontSize: 12 };
const statValue = { color: '#11213f', fontWeight: 700, fontSize: 22, marginTop: 2 };
const panel = { background: '#fff', border: '1px solid #d9e3f4', borderRadius: 12, overflow: 'hidden' };
const panelHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderBottom: '1px solid #e2e8f0',
};
const h2 = { margin: 0, fontSize: 20, color: '#132749' };
const refreshBtn = {
  border: '1px solid #c7d4ec',
  background: '#f8fbff',
  color: '#17386f',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
};
const filters = {
  display: 'grid',
  gridTemplateColumns: '220px 1fr',
  gap: 10,
  padding: '12px 16px',
  borderBottom: '1px solid #e2e8f0',
};
const select = { height: 38, border: '1px solid #c7d4ec', borderRadius: 8, padding: '0 10px' };
const input = { height: 38, border: '1px solid #c7d4ec', borderRadius: 8, padding: '0 10px' };
const errorStyle = {
  color: '#b42318',
  background: '#fee4e2',
  border: '1px solid #fecdca',
  borderRadius: 8,
  margin: '0 16px 12px',
  padding: '8px 10px',
  fontSize: 13,
};
const table = { width: '100%', borderCollapse: 'collapse', background: '#fff' };
const th = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #cbd5e1' };
const td = { padding: '10px 12px', borderBottom: '1px solid #e2e8f0' };
const openLink = {
  border: '1px solid #b7c7e8',
  borderRadius: 7,
  padding: '4px 8px',
  textDecoration: 'none',
  color: '#123a78',
  fontSize: 13,
};
const pill = {
  display: 'inline-block',
  borderRadius: 999,
  padding: '3px 8px',
  fontSize: 12,
  border: '1px solid transparent',
  textTransform: 'capitalize',
};
const statusColor = {
  active: { background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' },
  trial: { background: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' },
  grace: { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' },
  expired: { background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' },
  suspended: { background: '#f3e8ff', color: '#6b21a8', borderColor: '#e9d5ff' },
  cancelled: { background: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' },
  unset: { background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' },
};
