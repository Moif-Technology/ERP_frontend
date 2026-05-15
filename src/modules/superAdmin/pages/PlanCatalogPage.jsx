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
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={H1}>Plan catalog</h1>
          <p style={SUBTITLE}>Pricing tiers, features, and limits. Select a plan to manage.</p>
        </div>
      </div>

      {error && <div style={ERROR_BOX}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left: plan list */}
        <div style={PANEL}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Plans</h3>
            <button
              className="sa-btn-primary"
              style={{ ...BTN_PRIMARY, fontSize: 12, padding: '4px 10px', height: 'auto' }}
              onClick={() => { setActivePlan(null); setCreating(true); setError(null); }}
            >
              + New
            </button>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            {plans.map((p) => (
              <div
                key={p.plan_code}
                className={`sa-plan-item${activePlan?.plan_code === p.plan_code ? ' sa-plan-item-active' : ''}`}
                onClick={() => openPlan(p)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 9,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: activePlan?.plan_code === p.plan_code ? '#eef2ff' : '#fafafa',
                  borderColor: activePlan?.plan_code === p.plan_code ? '#4f46e5' : '#e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{p.plan_name || p.display_name}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {!p.is_active && <span style={BADGE_INACTIVE}>off</span>}
                    {p.is_popular && <span style={BADGE_POPULAR}>popular</span>}
                  </div>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{p.plan_code}</div>
                <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600 }}>
                  {fmtPrice(p.price_monthly_display)}
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}>/{p.period_label || 'month'}</span>
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>No plans yet.</div>
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div style={{ display: 'grid', gap: 14 }}>
          {creating && (
            <PlanEditor
              initial={EMPTY_DRAFT}
              isNew
              busy={busy}
              onSave={savePlan}
              onCancel={() => setCreating(false)}
            />
          )}

          {!creating && activePlan && (
            <>
              <PlanEditor
                key={activePlan.plan_code}
                initial={activePlan}
                busy={busy}
                onSave={savePlan}
              />

              {/* Feature matrix */}
              <div style={PANEL}>
                <h4 style={PANEL_TITLE}>Feature matrix</h4>
                {features.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>No feature rows available.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 4 }}>
                    {features.map((f) => (
                      <label
                        key={f.feature_code}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', border: '1px solid #f1f5f9', borderRadius: 8,
                          cursor: 'pointer', background: f.is_enabled ? '#f0fdf4' : '#fff',
                        }}
                      >
                        <span style={{ color: '#0f172a', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{f.feature_code}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: f.is_enabled ? '#15803d' : '#94a3b8', fontWeight: 600 }}>
                            {f.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <input
                            type="checkbox"
                            checked={Boolean(f.is_enabled)}
                            onChange={(e) => toggleFeature(f.feature_code, e.target.checked)}
                            style={{ width: 14, height: 14, accentColor: '#4f46e5' }}
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Limit matrix */}
              <div style={PANEL}>
                <h4 style={PANEL_TITLE}>Limit matrix</h4>
                {limits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>No limit rows available.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 4 }}>
                    {limits.map((l) => (
                      <div key={l.limit_code} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        padding: '8px 12px', border: '1px solid #f1f5f9', borderRadius: 8, background: '#fff',
                      }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#475569' }}>{l.limit_code}</span>
                        <input
                          style={{ ...INPUT, width: 120, textAlign: 'right' }}
                          type="number"
                          defaultValue={l.limit_value}
                          onBlur={(e) => changeLimit(l.limit_code, Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!creating && !activePlan && (
            <div style={{
              border: '1px dashed #e2e8f0', borderRadius: 12,
              padding: 32, textAlign: 'center',
              color: '#94a3b8', fontSize: 13, lineHeight: 1.6,
            }}>
              Select a plan from the left, or click <strong>+ New</strong> to create one.
            </div>
          )}
        </div>
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
  const canSave = draft.plan_code && (draft.display_name || draft.plan_name);

  return (
    <div style={PANEL}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>
          {isNew ? 'New plan' : `Edit · ${initial.plan_code}`}
        </h4>
        {busy && <span style={SAVING_PILL}>Saving…</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
        <Field label="Plan code (immutable)">
          <input
            style={{ ...INPUT, ...(codeLocked ? { background: '#f8fafc', color: '#94a3b8' } : {}) }}
            value={draft.plan_code || ''}
            disabled={codeLocked}
            placeholder="e.g. starter, pro"
            onChange={(e) => set('plan_code', e.target.value.trim().toLowerCase())}
          />
        </Field>
        <Field label="Display name">
          <input
            style={INPUT}
            value={draft.display_name || draft.plan_name || ''}
            onChange={(e) => set('display_name', e.target.value)}
          />
        </Field>
        <Field label="Audience label">
          <input
            style={INPUT}
            placeholder="e.g. Best for small teams"
            value={draft.audience_label || ''}
            onChange={(e) => set('audience_label', e.target.value)}
          />
        </Field>
        <Field label="Description">
          <input
            style={INPUT}
            value={draft.description || ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        <Field label="Monthly price">
          <input
            style={INPUT}
            placeholder="e.g. ₹999 or $29"
            value={draft.price_monthly_display ?? ''}
            onChange={(e) => set('price_monthly_display', e.target.value)}
          />
        </Field>
        <Field label="Yearly price">
          <input
            style={INPUT}
            placeholder="optional"
            value={draft.price_yearly_display ?? ''}
            onChange={(e) => set('price_yearly_display', e.target.value)}
          />
        </Field>
        <Field label="Period label">
          <select
            style={INPUT}
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
            style={INPUT}
            type="number"
            value={draft.trial_days ?? 0}
            onChange={(e) => set('trial_days', Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Card note">
          <input
            style={INPUT}
            value={draft.card_note || ''}
            onChange={(e) => set('card_note', e.target.value)}
          />
        </Field>
        <Field label="CTA label">
          <input
            style={INPUT}
            placeholder="e.g. Start free trial"
            value={draft.cta_label || ''}
            onChange={(e) => set('cta_label', e.target.value)}
          />
        </Field>
        <Field label="Sort order">
          <input
            style={INPUT}
            type="number"
            value={draft.sort_order ?? 0}
            onChange={(e) => set('sort_order', Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Flags">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: 36 }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontSize: 13, color: '#374151' }}>
              <input
                type="checkbox"
                checked={!!draft.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
                style={{ width: 14, height: 14, accentColor: '#4f46e5' }}
              />
              Active
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontSize: 13, color: '#374151' }}>
              <input
                type="checkbox"
                checked={!!draft.is_popular}
                onChange={(e) => set('is_popular', e.target.checked)}
                style={{ width: 14, height: 14, accentColor: '#4f46e5' }}
              />
              Popular
            </label>
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
        <button
          className="sa-btn-primary"
          style={BTN_PRIMARY}
          disabled={busy || !canSave}
          onClick={() => onSave(draft)}
        >
          {isNew ? 'Create plan' : 'Save changes'}
        </button>
        {isNew && (
          <button className="sa-btn-ghost" style={BTN_GHOST} disabled={busy} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
      {children}
    </label>
  );
}

function fmtPrice(v) {
  if (v == null || v === '') return '—';
  return String(v).trim() || '—';
}

const H1 = { margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' };
const SUBTITLE = { margin: '3px 0 0', fontSize: 13, color: '#64748b' };
const PANEL = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 };
const PANEL_TITLE = { margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' };
const INPUT = {
  width: '100%', height: 36, border: '1px solid #e2e8f0',
  borderRadius: 8, padding: '0 10px', fontSize: 13, color: '#374151',
  background: '#fff', boxSizing: 'border-box',
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
const SAVING_PILL = {
  fontSize: 11, color: '#4338ca', background: '#eef2ff',
  border: '1px solid #c7d2fe', borderRadius: 999, padding: '2px 9px',
};
const BADGE_INACTIVE = {
  fontSize: 10, color: '#dc2626', background: '#fef2f2',
  border: '1px solid #fecaca', borderRadius: 999, padding: '1px 5px',
};
const BADGE_POPULAR = {
  fontSize: 10, color: '#b45309', background: '#fffbeb',
  border: '1px solid #fde68a', borderRadius: 999, padding: '1px 5px',
};
