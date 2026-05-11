import React, { useEffect, useState } from 'react';
import { listCatalogLimits, upsertCatalogLimit } from '../api/admin.api';

const EMPTY = { limit_code: '', limit_name: '', description: '', unit: '', is_active: true };

export default function LimitCatalogPage() {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [selected, setSelected] = useState(null);
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

  function select(r) {
    setSelected(r.limit_code);
    setDraft({ ...EMPTY, ...r, description: r.description || '', unit: r.unit || '' });
    setError(null);
  }

  function reset() {
    setSelected(null);
    setDraft(EMPTY);
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await upsertCatalogLimit(draft);
      reset();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  const isEditing = selected !== null;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={H1}>Limit catalog</h1>
          <p style={SUBTITLE}>Define usage caps available to plans. Click a row to edit.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isEditing && (
            <button onClick={reset} className="sa-btn-ghost" style={BTN_GHOST}>
              New limit
            </button>
          )}
          <button onClick={load} className="sa-btn-ghost" style={BTN_GHOST}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div style={ERROR_BOX}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left: limit list */}
        <div style={PANEL}>
          <h3 style={PANEL_TITLE}>
            {rows.length} limit{rows.length === 1 ? '' : 's'}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Code', 'Name', 'Unit', 'Active'].map((h) => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.limit_code}
                  className="sa-tr"
                  onClick={() => select(r)}
                  style={{ cursor: 'pointer', background: selected === r.limit_code ? '#eef2ff' : undefined }}
                >
                  <td style={TD}><code style={CODE}>{r.limit_code}</code></td>
                  <td style={{ ...TD, fontWeight: 500, color: '#0f172a' }}>{r.limit_name}</td>
                  <td style={{ ...TD, color: '#64748b' }}>{r.unit || '—'}</td>
                  <td style={TD}>
                    <span style={{ color: r.is_active ? '#15803d' : '#dc2626', fontWeight: 600, fontSize: 12 }}>
                      {r.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...TD, textAlign: 'center', color: '#94a3b8', padding: 28 }}>
                    No limits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right: form */}
        <div style={PANEL}>
          <h3 style={PANEL_TITLE}>{isEditing ? 'Edit limit' : 'New limit'}</h3>
          {isEditing && (
            <div style={{ marginBottom: 14, padding: '8px 10px', background: '#eef2ff', borderRadius: 7, fontSize: 12, color: '#4338ca', border: '1px solid #c7d2fe' }}>
              Editing <strong>{selected}</strong>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Field label="Limit code">
              <input
                style={INPUT}
                value={draft.limit_code}
                disabled={isEditing}
                placeholder="e.g. max_users"
                onChange={(e) => setDraft({ ...draft, limit_code: e.target.value })}
              />
            </Field>
            <Field label="Limit name">
              <input
                style={INPUT}
                value={draft.limit_name}
                placeholder="Display name"
                onChange={(e) => setDraft({ ...draft, limit_name: e.target.value })}
              />
            </Field>
            <Field label="Unit">
              <input
                style={INPUT}
                value={draft.unit}
                placeholder="e.g. users, GB, records"
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <input
                style={INPUT}
                value={draft.description}
                placeholder="Optional"
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              style={{ width: 15, height: 15, accentColor: '#4f46e5' }}
            />
            Limit is active
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="sa-btn-primary" style={BTN_PRIMARY} disabled={busy || !draft.limit_code} onClick={save}>
              {busy ? 'Saving…' : isEditing ? 'Save changes' : 'Create limit'}
            </button>
            {isEditing && (
              <button className="sa-btn-ghost" style={BTN_GHOST} onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
      {children}
    </label>
  );
}

const H1 = { margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' };
const SUBTITLE = { margin: '3px 0 0', fontSize: 13, color: '#64748b' };
const PANEL = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, overflow: 'hidden' };
const PANEL_TITLE = { margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' };
const TH = {
  textAlign: 'left', padding: '8px 12px',
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  borderBottom: '1px solid #f1f5f9',
};
const TD = { padding: '9px 12px', borderBottom: '1px solid #f8fafc', fontSize: 13 };
const INPUT = {
  width: '100%', height: 36, border: '1px solid #e2e8f0',
  borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#374151',
  background: '#fff', boxSizing: 'border-box',
};
const CODE = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
  background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: 4, padding: '1px 5px', color: '#475569',
};
const BTN_PRIMARY = {
  padding: '0 16px', height: 36, borderRadius: 8,
  background: '#4f46e5', color: '#fff', border: 'none',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const BTN_GHOST = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const ERROR_BOX = {
  padding: '9px 12px', borderRadius: 8,
  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
};
