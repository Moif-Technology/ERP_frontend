import React, { useEffect, useState } from 'react';
import { listCatalogLimits, upsertCatalogLimit } from '../api/admin.api';

const empty = { limit_code: '', limit_name: '', description: '', unit: '', is_active: true };

export default function LimitCatalogPage() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setRows(await listCatalogLimits());
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await upsertCatalogLimit(draft);
      setDraft(empty);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={header}>
        <h2 style={title}>Limit Catalog</h2>
        <button style={ghostBtn} onClick={load}>Refresh</button>
      </div>
      {error && <div style={errorStyle}>{error}</div>}

      <div style={grid}>
        <section style={card}>
          <h3 style={cardTitle}>Available Limits</h3>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Code</th>
                <th style={th}>Name</th>
                <th style={th}>Unit</th>
                <th style={th}>Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.limit_code}
                  onClick={() => setDraft({ ...r, description: r.description || '', unit: r.unit || '' })}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={td}>{r.limit_code}</td>
                  <td style={td}>{r.limit_name}</td>
                  <td style={td}>{r.unit || '-'}</td>
                  <td style={td}>{r.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...td, textAlign: 'center' }}>No limits found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section style={card}>
          <h3 style={cardTitle}>Create or Update Limit</h3>
          <div style={formGrid}>
            <Field label="Limit code">
              <input style={input} value={draft.limit_code} onChange={(e) => setDraft({ ...draft, limit_code: e.target.value })} />
            </Field>
            <Field label="Limit name">
              <input style={input} value={draft.limit_name} onChange={(e) => setDraft({ ...draft, limit_name: e.target.value })} />
            </Field>
            <Field label="Unit">
              <input style={input} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
            </Field>
            <Field label="Description">
              <input style={input} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
            <label style={checkWrap}>
              <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
              <span>Limit is active</span>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button style={primaryBtn} disabled={busy} onClick={save}>
              {busy ? 'Saving...' : 'Save Limit'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={field}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

const wrap = { display: 'grid', gap: 12 };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 };
const title = { margin: 0, color: '#10284c' };
const grid = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 };
const card = { border: '1px solid #d9e3f4', borderRadius: 12, background: '#fff', padding: 12 };
const cardTitle = { margin: '0 0 10px', color: '#17335f' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: 8, borderBottom: '1px solid #cbd5e1' };
const td = { padding: 8, borderBottom: '1px solid #e2e8f0' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const field = { display: 'grid', gap: 6 };
const fieldLabel = { fontSize: 12, color: '#5f7398', fontWeight: 600 };
const input = { width: '100%', height: 36, border: '1px solid #c8d5eb', borderRadius: 8, padding: '0 10px' };
const checkWrap = { display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 };
const primaryBtn = { border: '1px solid #174393', background: '#174393', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' };
const ghostBtn = { border: '1px solid #c8d5eb', background: '#fff', color: '#173f8f', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' };
const errorStyle = { color: '#b42318', background: '#fee4e2', border: '1px solid #fecdca', borderRadius: 8, padding: '8px 10px', fontSize: 13 };
