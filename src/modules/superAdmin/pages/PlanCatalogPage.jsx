import React, { useEffect, useState } from 'react';
import {
  listCatalogPlans,
  upsertCatalogPlan,
  listPlanFeatures,
  setPlanFeature,
  listPlanLimits,
  setPlanLimit,
} from '../api/admin.api';

const EMPTY_DRAFT = {
  plan_code: '',
  display_name: '',
  audience_label: '',
  description: '',
  price_monthly_display: '',
  price_yearly_display: '',
  period_label: 'month',
  card_note: '',
  cta_label: '',
  is_popular: false,
  sort_order: 0,
  trial_days: 14,
  is_active: true,
};

export default function PlanCatalogPage() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [features, setFeatures] = useState([]);
  const [limits, setLimits] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  async function reloadPlans(selectCode) {
    const list = await listCatalogPlans();
    setPlans(list);
    if (selectCode) {
      const found = list.find((p) => p.plan_code === selectCode);
      if (found) setActivePlan(found);
    }
    return list;
  }

  useEffect(() => {
    reloadPlans().catch((e) => setError(e.message));
  }, []);

  async function openPlan(plan) {
    setBusy(true);
    setActivePlan(plan);
    setCreating(false);
    setError(null);
    try {
      const [f, l] = await Promise.all([
        listPlanFeatures(plan.plan_code),
        listPlanLimits(plan.plan_code),
      ]);
      setFeatures(f);
      setLimits(l);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function savePlan(draft) {
    setBusy(true);
    setError(null);
    try {
      const saved = await upsertCatalogPlan(draft);
      await reloadPlans(saved.plan_code);
      setActivePlan(saved);
      setCreating(false);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleFeature(featureCode, isEnabled) {
    setBusy(true);
    setError(null);
    try {
      await setPlanFeature(activePlan.plan_code, featureCode, isEnabled);
      setFeatures(await listPlanFeatures(activePlan.plan_code));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeLimit(limitCode, value) {
    setBusy(true);
    setError(null);
    try {
      await setPlanLimit(activePlan.plan_code, limitCode, value);
      setLimits(await listPlanLimits(activePlan.plan_code));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={layout}>
      <div style={leftPanel}>
        <div style={leftHead}>
          <h3 style={sectionTitle}>Plans</h3>
          <button
            style={primaryBtnSmall}
            onClick={() => { setActivePlan(null); setCreating(true); setError(null); }}
          >
            + New
          </button>
        </div>
        <div style={hint}>Click a plan to edit name, price, features, limits.</div>
        {error && <div style={errorBox}>{error}</div>}
        {plans.map((p) => (
          <div
            key={p.plan_code}
            onClick={() => openPlan(p)}
            style={{
              ...planItem,
              ...(activePlan?.plan_code === p.plan_code ? planItemActive : null),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontWeight: 700 }}>{p.plan_name || p.display_name}</div>
              {!p.is_active && <span style={inactivePill}>inactive</span>}
              {p.is_popular && <span style={popularPill}>popular</span>}
            </div>
            <div style={codeLine}>{p.plan_code}</div>
            <div style={priceLine}>
              {formatPrice(p.price_monthly_display)} / {p.period_label || 'month'}
              {p.price_yearly_display ? (
                <span style={yearlyHint}> · yearly {formatPrice(p.price_yearly_display)}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div style={rightPanel}>
        {creating ? (
          <PlanEditor
            initial={EMPTY_DRAFT}
            isNew
            busy={busy}
            onSave={savePlan}
            onCancel={() => setCreating(false)}
          />
        ) : activePlan ? (
          <>
            <PlanEditor
              key={activePlan.plan_code}
              initial={activePlan}
              busy={busy}
              onSave={savePlan}
            />
            <div style={card}>
              <h4 style={subTitle}>Feature Matrix</h4>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Feature</th>
                    <th style={th}>Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.feature_code}>
                      <td style={td}>{f.feature_code}</td>
                      <td style={td}>
                        <label style={toggleRow}>
                          <input
                            type="checkbox"
                            checked={Boolean(f.is_enabled)}
                            onChange={(e) => toggleFeature(f.feature_code, e.target.checked)}
                          />
                          <span>{f.is_enabled ? 'Enabled' : 'Disabled'}</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                  {features.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ ...td, textAlign: 'center' }}>No feature rows available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={card}>
              <h4 style={subTitle}>Limit Matrix</h4>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Limit</th>
                    <th style={th}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {limits.map((l) => (
                    <tr key={l.limit_code}>
                      <td style={td}>{l.limit_code}</td>
                      <td style={td}>
                        <input
                          style={input}
                          type="number"
                          defaultValue={l.limit_value}
                          onBlur={(e) => changeLimit(l.limit_code, Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                  {limits.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ ...td, textAlign: 'center' }}>No limit rows available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : <div style={empty}>Select a plan from the left, or click + New to create one.</div>}
      </div>
    </div>
  );
}

function PlanEditor({ initial, isNew, busy, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => ({ ...EMPTY_DRAFT, ...initial }));

  useEffect(() => {
    setDraft({ ...EMPTY_DRAFT, ...initial });
  }, [initial]);

  function set(k, v) { setDraft((d) => ({ ...d, [k]: v })); }

  const codeLocked = !isNew;

  return (
    <div style={card}>
      <div style={headRow}>
        <h4 style={subTitle}>{isNew ? 'New Plan' : 'Edit Plan'}</h4>
        {busy && <span style={savingPill}>Saving...</span>}
      </div>

      <div style={grid2}>
        <Field label="Plan code (immutable)">
          <input
            style={input}
            value={draft.plan_code || ''}
            disabled={codeLocked}
            placeholder="e.g. starter, pro, enterprise"
            onChange={(e) => set('plan_code', e.target.value.trim().toLowerCase())}
          />
        </Field>
        <Field label="Display name">
          <input
            style={input}
            value={draft.display_name || draft.plan_name || ''}
            onChange={(e) => set('display_name', e.target.value)}
          />
        </Field>
        <Field label="Audience label">
          <input
            style={input}
            placeholder="e.g. Best for small teams"
            value={draft.audience_label || ''}
            onChange={(e) => set('audience_label', e.target.value)}
          />
        </Field>
        <Field label="Description">
          <input
            style={input}
            value={draft.description || ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        <Field label="Monthly price (display)">
          <input
            style={input}
            placeholder="e.g. ₹999 or $29"
            value={draft.price_monthly_display ?? ''}
            onChange={(e) => set('price_monthly_display', e.target.value)}
          />
        </Field>
        <Field label="Yearly price (display)">
          <input
            style={input}
            placeholder="optional"
            value={draft.price_yearly_display ?? ''}
            onChange={(e) => set('price_yearly_display', e.target.value)}
          />
        </Field>
        <Field label="Period label">
          <select
            style={input}
            value={draft.period_label || 'month'}
            onChange={(e) => set('period_label', e.target.value)}
          >
            <option value="month">month</option>
            <option value="year">year</option>
            <option value="quarter">quarter</option>
            <option value="one-time">one-time</option>
          </select>
        </Field>
        <Field label="Trial days">
          <input
            style={input}
            type="number"
            value={draft.trial_days ?? 0}
            onChange={(e) => set('trial_days', Number(e.target.value) || 0)}
          />
        </Field>

        <Field label="Card note">
          <input
            style={input}
            value={draft.card_note || ''}
            onChange={(e) => set('card_note', e.target.value)}
          />
        </Field>
        <Field label="CTA label">
          <input
            style={input}
            placeholder="e.g. Start free trial"
            value={draft.cta_label || ''}
            onChange={(e) => set('cta_label', e.target.value)}
          />
        </Field>
        <Field label="Sort order">
          <input
            style={input}
            type="number"
            value={draft.sort_order ?? 0}
            onChange={(e) => set('sort_order', Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Flags">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', height: 34 }}>
            <label style={toggleRow}>
              <input
                type="checkbox"
                checked={!!draft.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
              />
              <span>Active</span>
            </label>
            <label style={toggleRow}>
              <input
                type="checkbox"
                checked={!!draft.is_popular}
                onChange={(e) => set('is_popular', e.target.checked)}
              />
              <span>Popular</span>
            </label>
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          style={primaryBtn}
          disabled={busy || !draft.plan_code || !(draft.display_name || draft.plan_name)}
          onClick={() => onSave(draft)}
        >
          {isNew ? 'Create plan' : 'Save changes'}
        </button>
        {isNew && (
          <button style={ghostBtn} disabled={busy} onClick={onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function formatPrice(v) {
  if (v == null || v === '') return '—';
  const s = String(v).trim();
  if (!s) return '—';
  if (/^[\d.]+$/.test(s)) return s;
  return s;
}

const layout = { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 };
const leftPanel = { border: '1px solid #d8e2f4', borderRadius: 12, background: '#fff', padding: 14 };
const leftHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const rightPanel = { display: 'grid', gap: 12 };
const sectionTitle = { margin: 0, color: '#112a4e' };
const subTitle = { margin: '0 0 10px', color: '#1b355d' };
const hint = { fontSize: 13, color: '#65799f', margin: '6px 0 10px' };
const errorBox = { color: '#b42318', background: '#fee4e2', border: '1px solid #fecdca', borderRadius: 8, padding: '8px 10px', marginBottom: 8 };
const planItem = { border: '1px solid #d9e3f4', borderRadius: 10, padding: 10, cursor: 'pointer', marginBottom: 8, background: '#fdfefe' };
const planItemActive = { background: '#e8f1ff', borderColor: '#1f5bb8' };
const codeLine = { fontSize: 12, color: '#61759c', marginTop: 2 };
const priceLine = { fontSize: 12, color: '#1f3d71', marginTop: 4, fontWeight: 600 };
const yearlyHint = { color: '#65799f', fontWeight: 400 };
const headRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 };
const savingPill = { fontSize: 12, color: '#1d4ed8', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: 999, padding: '3px 9px' };
const inactivePill = { fontSize: 10, color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 999, padding: '1px 7px', marginLeft: 6 };
const popularPill = { fontSize: 10, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 999, padding: '1px 7px', marginLeft: 6 };
const card = { border: '1px solid #d8e2f4', borderRadius: 12, background: '#fff', padding: 12 };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: 8, borderBottom: '1px solid #cbd5e1' };
const td = { padding: 8, borderBottom: '1px solid #e2e8f0' };
const toggleRow = { display: 'inline-flex', gap: 8, alignItems: 'center' };
const input = { width: '100%', height: 34, border: '1px solid #c8d5eb', borderRadius: 8, padding: '0 10px', boxSizing: 'border-box' };
const empty = { border: '1px dashed #c8d5eb', borderRadius: 12, background: '#fff', padding: 18, color: '#556b94' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))', gap: 10 };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 4 };
const fieldLabel = { fontSize: 12, fontWeight: 600, color: '#4b5f85' };
const primaryBtn = { border: '1px solid #174393', background: '#174393', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' };
const primaryBtnSmall = { border: '1px solid #174393', background: '#174393', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
const ghostBtn = { border: '1px solid #c8d5eb', background: '#fff', color: '#173f8f', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' };
