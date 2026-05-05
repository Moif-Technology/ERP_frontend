import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  clearFeatureOverride,
  clearLimitOverride,
  extendTrial,
  fetchAuditLog,
  getTenant,
  listCatalogFeatures,
  listCatalogLimits,
  listCatalogPlans,
  listPlanFeatures,
  listPlanLimits,
  patchSubscription,
  reactivateTenant,
  setFeatureOverride,
  setLimitOverride,
  suspendTenant,
} from '../api/admin.api';

const tabs = ['overview', 'subscription', 'features', 'limits', 'audit'];

export default function TenantDetailPage() {
  const { companyId } = useParams();
  const [data, setData] = useState(null);
  const [audit, setAudit] = useState([]);
  const [plans, setPlans] = useState([]);
  const [allFeatures, setAllFeatures] = useState([]);
  const [allLimits, setAllLimits] = useState([]);
  const [planFeatures, setPlanFeatures] = useState([]);
  const [planLimitsList, setPlanLimitsList] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('overview');

  async function load() {
    setError(null);
    try {
      const [tenantData, auditRows, plansRows, featuresRows, limitsRows] = await Promise.all([
        getTenant(companyId),
        fetchAuditLog(companyId, { limit: 80 }),
        listCatalogPlans(),
        listCatalogFeatures(),
        listCatalogLimits(),
      ]);
      setData(tenantData);
      setAudit(auditRows);
      setPlans(plansRows);
      setAllFeatures(featuresRows);
      setAllLimits(limitsRows);

      const planCode = tenantData?.tenant?.plan_code;
      if (planCode) {
        try {
          const [pf, pl] = await Promise.all([
            listPlanFeatures(planCode),
            listPlanLimits(planCode),
          ]);
          setPlanFeatures(pf || []);
          setPlanLimitsList(pl || []);
        } catch {
          setPlanFeatures([]);
          setPlanLimitsList([]);
        }
      } else {
        setPlanFeatures([]);
        setPlanLimitsList([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  useEffect(() => { load(); }, [companyId]);

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <div style={loadingStyle}>{error || 'Loading tenant...'}</div>;
  const tenant = data.tenant;

  return (
    <div style={wrap}>
      <div style={head}>
        <div>
          <h2 style={title}>{tenant.company_name}</h2>
          <div style={sub}>Tenant #{tenant.company_id} · Plan {tenant.plan_code || '—'}</div>
        </div>
        <StatusPill status={tenant.status} />
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={tabRow}>
        {tabs.map((key) => (
          <button
            key={key}
            style={{ ...tabBtn, ...(tab === key ? tabBtnActive : null) }}
            onClick={() => setTab(key)}
          >
            {capitalize(key)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <section style={panel}>
          <h3 style={panelTitle}>Overview</h3>
          <div style={grid2}>
            <Info label="Company" value={tenant.company_name} />
            <Info label="Plan" value={tenant.plan_code || '—'} />
            <Info label="Status" value={tenant.status || '—'} />
            <Info label="Trial ends" value={fmtDate(tenant.trial_ends_at)} />
            <Info label="Period ends" value={fmtDate(tenant.current_period_ends_at)} />
            <Info label="Suspended at" value={fmtDate(tenant.suspended_at)} />
          </div>
          <div style={actions}>
            <button style={primaryBtn} disabled={busy} onClick={() => setTab('subscription')}>Edit Subscription</button>
            <button style={ghostBtn} disabled={busy} onClick={() => setTab('features')}>Manage Features</button>
            <button style={ghostBtn} disabled={busy} onClick={() => setTab('limits')}>Manage Limits</button>
          </div>
        </section>
      )}

      {tab === 'subscription' && (
        <SubscriptionPanel
          tenant={tenant}
          plans={plans}
          busy={busy}
          onSave={(patch) => run(() => patchSubscription(companyId, patch))}
          onSuspend={() => {
            const reason = window.prompt('Suspension reason?') || '';
            return run(() => suspendTenant(companyId, reason));
          }}
          onReactivate={() => run(() => reactivateTenant(companyId))}
          onExtend={() => {
            const days = Number(window.prompt('Extend trial by days', '14'));
            if (!days || days < 1) return Promise.resolve();
            return run(() => extendTrial(companyId, days));
          }}
        />
      )}

      {tab === 'features' && (
        <FeaturePanel
          allFeatures={allFeatures}
          planFeatures={planFeatures}
          overrides={data.featureOverrides}
          busy={busy}
          planCode={tenant.plan_code}
          onToggle={(featureCode, isEnabled) =>
            run(() => setFeatureOverride(companyId, { featureCode, isEnabled }))
          }
          onClear={(featureCode) =>
            run(() => clearFeatureOverride(companyId, featureCode))
          }
          onBulk={async (codes, isEnabled) => {
            setBusy(true); setError(null);
            try {
              for (const code of codes) {
                await setFeatureOverride(companyId, { featureCode: code, isEnabled });
              }
              await load();
            } catch (err) {
              setError(err.response?.data?.message || err.message);
            } finally { setBusy(false); }
          }}
        />
      )}

      {tab === 'limits' && (
        <LimitPanel
          allLimits={allLimits}
          planLimits={planLimitsList}
          overrides={data.limitOverrides}
          busy={busy}
          planCode={tenant.plan_code}
          onSave={(limitCode, limitValue, reason) =>
            run(() => setLimitOverride(companyId, { limitCode, limitValue, reason }))
          }
          onClear={(limitCode) =>
            run(() => clearLimitOverride(companyId, limitCode))
          }
        />
      )}

      {tab === 'audit' && <AuditPanel rows={audit} />}
    </div>
  );
}

function SubscriptionPanel({ tenant, plans, busy, onSave, onSuspend, onReactivate, onExtend }) {
  const [planCode, setPlanCode] = useState(tenant.plan_code || '');
  const [status, setStatus] = useState(tenant.status || 'trial');
  const [periodEnd, setPeriodEnd] = useState(toInputDate(tenant.current_period_ends_at));
  const [trialEnd, setTrialEnd] = useState(toInputDate(tenant.trial_ends_at));

  return (
    <section style={panel}>
      <h3 style={panelTitle}>Subscription Settings</h3>
      <div style={grid2}>
        <div>
          <label style={label}>Plan</label>
          <select style={control} value={planCode} onChange={(e) => setPlanCode(e.target.value)}>
            <option value="">Select plan</option>
            {plans.map((p) => <option key={p.plan_code} value={p.plan_code}>{p.plan_name} ({p.plan_code})</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Status</label>
          <select style={control} value={status} onChange={(e) => setStatus(e.target.value)}>
            {['trial', 'active', 'grace', 'expired', 'suspended', 'cancelled'].map((s) =>
              <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Trial end date</label>
          <input style={control} type="date" value={trialEnd} onChange={(e) => setTrialEnd(e.target.value)} />
        </div>
        <div>
          <label style={label}>Period end date</label>
          <input style={control} type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>
      </div>
      <div style={actions}>
        <button
          style={primaryBtn}
          disabled={busy}
          onClick={() => onSave({
            plan_code: planCode || null,
            status,
            trial_ends_at: trialEnd ? new Date(trialEnd).toISOString() : null,
            current_period_ends_at: periodEnd ? new Date(periodEnd).toISOString() : null,
          })}
        >
          Save subscription
        </button>
        <button style={warnBtn} disabled={busy} onClick={onSuspend}>Suspend</button>
        <button style={ghostBtn} disabled={busy} onClick={onReactivate}>Reactivate</button>
        <button style={ghostBtn} disabled={busy} onClick={onExtend}>Extend trial</button>
      </div>
    </section>
  );
}

function FeaturePanel({ allFeatures, planFeatures, overrides, busy, planCode, onToggle, onClear, onBulk }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | overridden | enabled | disabled

  const planMap = useMemo(
    () => Object.fromEntries((planFeatures || []).map((p) => [p.feature_code, p.is_enabled === true])),
    [planFeatures]
  );
  const overrideMap = useMemo(
    () => Object.fromEntries((overrides || []).map((o) => [o.feature_code, o])),
    [overrides]
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (allFeatures || [])
      .map((f) => {
        const code = f.feature_code;
        const planEnabled = planMap[code] === true;
        const ov = overrideMap[code];
        const hasOverride = !!ov;
        const effective = hasOverride ? ov.is_enabled === true : planEnabled;
        return { ...f, code, planEnabled, hasOverride, effective, override: ov };
      })
      .filter((r) => {
        if (term && !r.code.toLowerCase().includes(term) && !(r.feature_name || '').toLowerCase().includes(term)) return false;
        if (filter === 'overridden' && !r.hasOverride) return false;
        if (filter === 'enabled' && !r.effective) return false;
        if (filter === 'disabled' && r.effective) return false;
        return true;
      });
  }, [allFeatures, planMap, overrideMap, search, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const r of rows) {
      const cat = (r.code.split('.')[0] || 'other').toLowerCase();
      (groups[cat] = groups[cat] || []).push(r);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const totalOverrides = (overrides || []).length;

  return (
    <section style={panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h3 style={panelTitle}>Features</h3>
        <span style={hint}>
          Plan: <strong>{planCode || '—'}</strong> · {totalOverrides} override{totalOverrides === 1 ? '' : 's'}
        </span>
      </div>
      <div style={hint}>
        Toggle a row to enable or disable for this tenant only. Toggling back to the plan default automatically removes the override.
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input
          style={{ ...control, flex: 1, minWidth: 200 }}
          placeholder="Search features..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={{ ...controlSmall, width: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All ({allFeatures.length})</option>
          <option value="overridden">Overridden ({totalOverrides})</option>
          <option value="enabled">Currently enabled</option>
          <option value="disabled">Currently disabled</option>
        </select>
      </div>

      {grouped.length === 0 && (
        <div style={{ ...hint, textAlign: 'center', padding: 20 }}>No features match.</div>
      )}

      {grouped.map(([cat, items]) => {
        const codes = items.map((i) => i.code);
        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={catHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={catTitle}>{cat.toUpperCase()}</span>
                <span style={hint}>{items.length} feature{items.length === 1 ? '' : 's'}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={miniBtn} disabled={busy} onClick={() => onBulk(codes, true)}>Enable all</button>
                <button style={miniBtn} disabled={busy} onClick={() => onBulk(codes, false)}>Disable all</button>
              </div>
            </div>
            <div style={featureGrid}>
              {items.map((r) => (
                <FeatureRow
                  key={r.code}
                  row={r}
                  busy={busy}
                  onToggle={() => {
                    const next = !r.effective;
                    if (r.hasOverride && next === r.planEnabled) onClear(r.code);
                    else onToggle(r.code, next);
                  }}
                  onClear={() => onClear(r.code)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function FeatureRow({ row, busy, onToggle, onClear }) {
  return (
    <div style={featureRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: '#12284f' }}>{row.feature_name || row.code}</div>
        <div style={hint}>
          <code style={codePill}>{row.code}</code>
          {' · plan default: '}
          <strong style={{ color: row.planEnabled ? '#166534' : '#991b1b' }}>
            {row.planEnabled ? 'on' : 'off'}
          </strong>
          {row.hasOverride && (
            <>
              {' · '}
              <span style={overridePill}>override</span>
              {row.override?.reason ? <span> · {row.override.reason}</span> : null}
              {' '}
              <button style={linkBtn} disabled={busy} onClick={onClear}>reset</button>
            </>
          )}
        </div>
      </div>
      <ToggleSwitch enabled={row.effective} disabled={busy} onChange={onToggle} />
    </div>
  );
}

function ToggleSwitch({ enabled, disabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={enabled}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        border: '1px solid ' + (enabled ? '#16a34a' : '#cbd5e1'),
        background: enabled ? '#16a34a' : '#e2e8f0',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 120ms',
        flex: '0 0 auto',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: enabled ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 120ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );
}

function LimitPanel({ allLimits, planLimits, overrides, busy, planCode, onSave, onClear }) {
  const [search, setSearch] = useState('');

  const planMap = useMemo(
    () => Object.fromEntries((planLimits || []).map((p) => [p.limit_code, Number(p.limit_value)])),
    [planLimits]
  );
  const overrideMap = useMemo(
    () => Object.fromEntries((overrides || []).map((o) => [o.limit_code, o])),
    [overrides]
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (allLimits || [])
      .filter((l) => !term || l.limit_code.toLowerCase().includes(term) || (l.limit_name || '').toLowerCase().includes(term))
      .map((l) => {
        const planValue = planMap[l.limit_code] ?? null;
        const ov = overrideMap[l.limit_code];
        const effective = ov ? Number(ov.limit_value) : planValue;
        return { ...l, planValue, override: ov, effective };
      });
  }, [allLimits, planMap, overrideMap, search]);

  return (
    <section style={panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h3 style={panelTitle}>Limits</h3>
        <span style={hint}>
          Plan: <strong>{planCode || '—'}</strong> · {(overrides || []).length} override{(overrides || []).length === 1 ? '' : 's'}
        </span>
      </div>
      <div style={hint}>
        Edit a row to set a tenant-specific cap. Click reset to drop back to the plan default.
      </div>

      <input
        style={{ ...control, margin: '12px 0', width: '100%' }}
        placeholder="Search limits..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={featureGrid}>
        {rows.map((r) => (
          <LimitRow key={r.limit_code} row={r} busy={busy} onSave={onSave} onClear={onClear} />
        ))}
        {rows.length === 0 && <div style={{ ...hint, textAlign: 'center', padding: 20 }}>No limits match.</div>}
      </div>
    </section>
  );
}

function LimitRow({ row, busy, onSave, onClear }) {
  const [draft, setDraft] = useState(
    row.override ? String(row.override.limit_value) : row.planValue != null ? String(row.planValue) : ''
  );
  const [reason, setReason] = useState(row.override?.reason || '');

  useEffect(() => {
    setDraft(row.override ? String(row.override.limit_value) : row.planValue != null ? String(row.planValue) : '');
    setReason(row.override?.reason || '');
  }, [row.override, row.planValue]);

  const dirty =
    draft !== '' &&
    Number(draft) !== Number(row.override ? row.override.limit_value : row.planValue);

  return (
    <div style={featureRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: '#12284f' }}>{row.limit_name || row.limit_code}</div>
        <div style={hint}>
          <code style={codePill}>{row.limit_code}</code>
          {' · plan default: '}
          <strong>{row.planValue == null ? 'unlimited' : row.planValue}</strong>
          {row.override && (
            <>
              {' · '}
              <span style={overridePill}>override {row.override.limit_value}</span>
            </>
          )}
        </div>
      </div>
      <input
        style={{ ...controlSmall, width: 100 }}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="value"
      />
      <input
        style={{ ...controlSmall, width: 160 }}
        placeholder="reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        style={primaryBtn}
        disabled={busy || !dirty || draft === ''}
        onClick={() => onSave(row.limit_code, Number(draft), reason)}
      >
        Save
      </button>
      {row.override && (
        <button style={ghostBtn} disabled={busy} onClick={() => onClear(row.limit_code)}>
          Reset
        </button>
      )}
    </div>
  );
}

function AuditPanel({ rows }) {
  return (
    <section style={panel}>
      <h3 style={panelTitle}>Audit Timeline</h3>
      <div style={auditList}>
        {rows.map((row) => (
          <div key={row.audit_id} style={auditItem}>
            <div style={auditHeader}>
              <strong>{row.action}</strong>
              <span>{fmtDateTime(row.created_at)}</span>
            </div>
            <div style={hint}>Entity: {row.entity_type} · {row.entity_id || '—'} · Actor #{row.actor_user_id || '—'}</div>
          </div>
        ))}
        {rows.length === 0 && <div>No audit entries.</div>}
      </div>
    </section>
  );
}

function StatusPill({ status }) {
  const normalized = status || 'unset';
  return <span style={{ ...pill, ...statusColor[normalized] }}>{normalized}</span>;
}

function Info({ label, value }) {
  return (
    <div style={infoCard}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value || '—'}</div>
    </div>
  );
}

function toInputDate(v) {
  return v ? new Date(v).toISOString().slice(0, 10) : '';
}
function fmtDate(v) {
  return v ? new Date(v).toISOString().slice(0, 10) : '—';
}
function fmtDateTime(v) {
  return v ? new Date(v).toISOString().replace('T', ' ').slice(0, 19) : '—';
}
function capitalize(v) {
  return String(v).charAt(0).toUpperCase() + String(v).slice(1);
}

const wrap = { display: 'grid', gap: 14 };
const loadingStyle = { padding: 20 };
const head = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const title = { margin: 0, color: '#132749' };
const sub = { color: '#64748b', marginTop: 4 };
const tabRow = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const tabBtn = {
  border: '1px solid #c8d5eb',
  background: '#fff',
  color: '#2f4672',
  borderRadius: 8,
  padding: '7px 12px',
  cursor: 'pointer',
};
const tabBtnActive = {
  background: '#173f8f',
  borderColor: '#173f8f',
  color: '#fff',
};
const panel = { background: '#fff', border: '1px solid #d9e3f4', borderRadius: 12, padding: 16 };
const panelTitle = { marginTop: 0, marginBottom: 12, color: '#162848' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))', gap: 10 };
const actions = { marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' };
const formInline = { display: 'grid', gridTemplateColumns: '2fr 140px 2fr auto', gap: 8, marginBottom: 12 };
const label = { fontSize: 13, fontWeight: 600, color: '#4b5f85', marginBottom: 6, display: 'block' };
const control = { width: '100%', height: 38, border: '1px solid #c8d5eb', borderRadius: 8, padding: '0 10px' };
const controlSmall = { width: '100%', height: 38, border: '1px solid #c8d5eb', borderRadius: 8, padding: '0 10px' };
const primaryBtn = {
  border: '1px solid #174393',
  background: '#174393',
  color: '#fff',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
};
const ghostBtn = {
  border: '1px solid #c8d5eb',
  background: '#fff',
  color: '#173f8f',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
};
const warnBtn = {
  border: '1px solid #fca5a5',
  background: '#fee2e2',
  color: '#991b1b',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
};
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: '9px 10px', borderBottom: '1px solid #d4dfee' };
const td = { padding: '9px 10px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' };
const hint = { color: '#64748b', fontSize: 12, marginTop: 2 };
const auditList = { display: 'grid', gap: 8 };
const auditItem = { border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, background: '#f8fbff' };
const auditHeader = { display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 4 };
const infoCard = { border: '1px solid #d9e3f4', borderRadius: 10, padding: 10, background: '#fbfdff' };
const infoLabel = { fontSize: 12, color: '#65799f' };
const infoValue = { marginTop: 4, fontWeight: 600, color: '#12284f' };
const errorStyle = {
  color: '#b42318',
  background: '#fee4e2',
  border: '1px solid #fecdca',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 13,
};
const pill = {
  display: 'inline-block',
  borderRadius: 999,
  padding: '4px 10px',
  fontSize: 12,
  border: '1px solid transparent',
  textTransform: 'capitalize',
};
const catHead = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  background: '#eef2fb',
  borderRadius: 8,
  marginBottom: 6,
};
const catTitle = { fontWeight: 700, color: '#173f8f', letterSpacing: 0.5, fontSize: 12 };
const featureGrid = { display: 'grid', gap: 6 };
const featureRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  background: '#fff',
};
const codePill = {
  background: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: 4,
  padding: '1px 6px',
  fontSize: 11,
  color: '#334155',
};
const overridePill = {
  background: '#fef3c7',
  color: '#92400e',
  border: '1px solid #fde68a',
  borderRadius: 4,
  padding: '1px 6px',
  fontSize: 11,
  fontWeight: 600,
};
const linkBtn = {
  background: 'none',
  border: 'none',
  color: '#173f8f',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
  fontSize: 12,
};
const miniBtn = {
  border: '1px solid #c8d5eb',
  background: '#fff',
  color: '#173f8f',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 12,
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
