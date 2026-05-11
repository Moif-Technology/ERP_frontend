import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const TABS = [
  { key: 'overview',      label: 'Overview',      icon: '⊞' },
  { key: 'subscription',  label: 'Subscription',  icon: '◈' },
  { key: 'features',      label: 'Features',       icon: '◉' },
  { key: 'limits',        label: 'Limits',         icon: '◈' },
  { key: 'audit',         label: 'Audit log',      icon: '◷' },
];

export default function TenantDetailPage() {
  const { companyId } = useParams();
  const [data, setData]               = useState(null);
  const [audit, setAudit]             = useState([]);
  const [plans, setPlans]             = useState([]);
  const [allFeatures, setAllFeatures] = useState([]);
  const [allLimits, setAllLimits]     = useState([]);
  const [planFeatures, setPlanFeatures]       = useState([]);
  const [planLimitsList, setPlanLimitsList]   = useState([]);
  const [error, setError]   = useState(null);
  const [busy, setBusy]     = useState(false);
  const [tab, setTab]       = useState('overview');

  const [activeDialog, setActiveDialog] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [extendDays, setExtendDays]       = useState('14');

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
          const [pf, pl] = await Promise.all([listPlanFeatures(planCode), listPlanLimits(planCode)]);
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

  async function confirmSuspend() {
    setActiveDialog(null);
    await run(() => suspendTenant(companyId, suspendReason));
    setSuspendReason('');
  }

  async function confirmExtend() {
    const days = Number(extendDays);
    if (!days || days < 1) return;
    setActiveDialog(null);
    await run(() => extendTrial(companyId, days));
    setExtendDays('14');
  }

  if (!data) return (
    <div style={{ padding: 32, textAlign: 'center', color: error ? '#dc2626' : '#94a3b8', fontSize: 14 }}>
      {error || 'Loading…'}
    </div>
  );

  const tenant = data.tenant;
  const initials = (tenant.company_name || '?').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Dialog overlays */}
      {activeDialog === 'suspend' && (
        <Dialog title="Suspend tenant" onClose={() => setActiveDialog(null)}>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
            <strong style={{ color: '#0f172a' }}>{tenant.company_name}</strong> will lose access immediately until reactivated.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={DLG_LABEL}>Reason (optional)</label>
            <input
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. non-payment, policy violation"
              autoFocus
              style={DLG_INPUT}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setActiveDialog(null)} style={DLG_BTN_GHOST}>Cancel</button>
            <button onClick={confirmSuspend} style={DLG_BTN_DANGER}>Suspend tenant</button>
          </div>
        </Dialog>
      )}

      {activeDialog === 'extend' && (
        <Dialog title="Extend trial" onClose={() => setActiveDialog(null)}>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
            Add days to the trial for <strong style={{ color: '#0f172a' }}>{tenant.company_name}</strong>.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={DLG_LABEL}>Days to add</label>
            <input
              type="number" min="1"
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              autoFocus
              style={{ ...DLG_INPUT, width: 120 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setActiveDialog(null)} style={DLG_BTN_GHOST}>Cancel</button>
            <button onClick={confirmExtend} style={DLG_BTN_PRIMARY}>Extend trial</button>
          </div>
        </Dialog>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {/* ── Back link ── */}
        <Link to="/super-admin/tenants" style={BACK_LINK}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All tenants
        </Link>

        {/* ── Hero header card ── */}
        <div style={HERO_CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={AVATAR}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={HERO_NAME}>{tenant.company_name}</h1>
                <StatusPill status={tenant.status} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <StatChip label="ID" value={`#${tenant.company_id}`} mono />
                {tenant.plan_code && <StatChip label="Plan" value={tenant.plan_code} mono accent />}
                {tenant.trial_ends_at && <StatChip label="Trial ends" value={fmtDate(tenant.trial_ends_at)} />}
                {tenant.current_period_ends_at && <StatChip label="Period ends" value={fmtDate(tenant.current_period_ends_at)} />}
              </div>
            </div>
            <button onClick={load} style={REFRESH_BTN} title="Refresh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </div>

        {error && <div style={ERROR_BOX}>{error}</div>}

        {/* ── Tab navigation ── */}
        <div style={TAB_BAR}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                ...TAB_BTN,
                background: tab === key ? '#fff' : 'transparent',
                color: tab === key ? '#4f46e5' : '#64748b',
                fontWeight: tab === key ? 600 : 500,
                boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab panels ── */}
        {tab === 'overview' && (
          <OverviewPanel
            tenant={tenant}
            overrides={data.featureOverrides}
            limitOverrides={data.limitOverrides}
            audit={audit}
            onEditSub={() => setTab('subscription')}
            onEditFeatures={() => setTab('features')}
            onEditLimits={() => setTab('limits')}
            onSuspend={() => setActiveDialog('suspend')}
            onReactivate={() => run(() => reactivateTenant(companyId))}
            onExtend={() => setActiveDialog('extend')}
            busy={busy}
          />
        )}

        {tab === 'subscription' && (
          <SubscriptionPanel
            tenant={tenant}
            plans={plans}
            busy={busy}
            onSave={(patch) => run(() => patchSubscription(companyId, patch))}
            onSuspendClick={() => setActiveDialog('suspend')}
            onReactivate={() => run(() => reactivateTenant(companyId))}
            onExtendClick={() => setActiveDialog('extend')}
          />
        )}

        {tab === 'features' && (
          <FeaturePanel
            allFeatures={allFeatures}
            planFeatures={planFeatures}
            overrides={data.featureOverrides}
            busy={busy}
            planCode={tenant.plan_code}
            onToggle={(featureCode, isEnabled) => run(() => setFeatureOverride(companyId, { featureCode, isEnabled }))}
            onClear={(featureCode) => run(() => clearFeatureOverride(companyId, featureCode))}
            onBulk={async (codes, isEnabled) => {
              setBusy(true); setError(null);
              try {
                for (const code of codes) await setFeatureOverride(companyId, { featureCode: code, isEnabled });
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
            onSave={(limitCode, limitValue, reason) => run(() => setLimitOverride(companyId, { limitCode, limitValue, reason }))}
            onClear={(limitCode) => run(() => clearLimitOverride(companyId, limitCode))}
          />
        )}

        {tab === 'audit' && <AuditPanel rows={audit} />}
      </div>
    </>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewPanel({ tenant, overrides, limitOverrides, audit, onEditSub, onEditFeatures, onEditLimits, onSuspend, onReactivate, onExtend, busy }) {
  const recentAudit = (audit || []).slice(0, 5);
  const overrideCount = (overrides || []).length + (limitOverrides || []).length;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Status',      value: tenant.status || '—',                      color: statusColor(tenant.status) },
          { label: 'Plan',        value: tenant.plan_code || 'None',                mono: true },
          { label: 'Overrides',   value: String(overrideCount),                    dim: overrideCount === 0 },
          { label: 'Trial ends',  value: fmtDate(tenant.trial_ends_at),            date: true },
          { label: 'Period ends', value: fmtDate(tenant.current_period_ends_at),   date: true },
          { label: 'Suspended',   value: fmtDate(tenant.suspended_at),             date: true },
        ].map(({ label, value, color, mono, date, dim }) => (
          <div key={label} style={OVERVIEW_TILE}>
            <div style={TILE_LABEL}>{label}</div>
            <div style={{
              fontSize: 14, fontWeight: 600,
              color: color || (dim ? '#cbd5e1' : date ? '#475569' : '#0f172a'),
              fontFamily: (mono || date) ? "'JetBrains Mono', monospace" : undefined,
              letterSpacing: mono ? '-0.02em' : undefined,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={SECTION_CARD}>
        <div style={SECTION_LABEL}>Quick actions</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={BTN_PRIMARY} onClick={onEditSub}>Edit subscription</button>
          <button style={BTN_GHOST}   onClick={onEditFeatures}>Features</button>
          <button style={BTN_GHOST}   onClick={onEditLimits}>Limits</button>
          <button style={BTN_GHOST}   disabled={busy} onClick={onExtend}>Extend trial</button>
          <button style={BTN_GHOST}   disabled={busy} onClick={onReactivate}>Reactivate</button>
          <button style={BTN_DANGER}  disabled={busy} onClick={onSuspend}>Suspend</button>
        </div>
      </div>

      {/* Recent audit */}
      {recentAudit.length > 0 && (
        <div style={SECTION_CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={SECTION_LABEL}>Recent activity</div>
            <button style={VIEW_ALL_BTN} onClick={() => {}}>View all →</button>
          </div>
          <div style={{ display: 'grid', gap: 0 }}>
            {recentAudit.map((row, i) => (
              <div key={row.audit_id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 0',
                borderBottom: i < recentAudit.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={AUDIT_DOT(row.action)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{row.action}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {row.entity_type}{row.entity_id ? ` · ${row.entity_id}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                  {fmtDate(row.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subscription ─────────────────────────────────────────────────────────────

function SubscriptionPanel({ tenant, plans, busy, onSave, onSuspendClick, onReactivate, onExtendClick }) {
  const [planCode,   setPlanCode]   = useState(tenant.plan_code || '');
  const [status,     setStatus]     = useState(tenant.status || 'trial');
  const [periodEnd,  setPeriodEnd]  = useState(toInputDate(tenant.current_period_ends_at));
  const [trialEnd,   setTrialEnd]   = useState(toInputDate(tenant.trial_ends_at));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={SECTION_CARD}>
        <div style={SECTION_LABEL}>Subscription details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <FormField label="Plan">
            <select style={CONTROL} value={planCode} onChange={(e) => setPlanCode(e.target.value)}>
              <option value="">No plan selected</option>
              {plans.map((p) => (
                <option key={p.plan_code} value={p.plan_code}>
                  {p.plan_name || p.display_name} ({p.plan_code})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Billing status">
            <select style={CONTROL} value={status} onChange={(e) => setStatus(e.target.value)}>
              {['trial', 'active', 'grace', 'expired', 'suspended', 'cancelled'].map((s) => (
                <option key={s} value={s}>{cap(s)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Trial end date">
            <input type="date" style={CONTROL} value={trialEnd} onChange={(e) => setTrialEnd(e.target.value)} />
          </FormField>
          <FormField label="Period end date">
            <input type="date" style={CONTROL} value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </FormField>
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            style={BTN_PRIMARY}
            disabled={busy}
            onClick={() => onSave({
              plan_code: planCode || null,
              status,
              trial_ends_at: trialEnd ? new Date(trialEnd).toISOString() : null,
              current_period_ends_at: periodEnd ? new Date(periodEnd).toISOString() : null,
            })}
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
          <button style={BTN_GHOST} disabled={busy} onClick={onExtendClick}>Extend trial</button>
          <button style={BTN_GHOST} disabled={busy} onClick={onReactivate}>Reactivate</button>
        </div>
      </div>

      <div style={{ ...SECTION_CARD, border: '1px solid #fecaca', background: '#fef2f2' }}>
        <div style={{ ...SECTION_LABEL, color: '#dc2626' }}>Danger zone</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Suspend this tenant</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Immediately revokes access. Reversible via reactivate.</div>
          </div>
          <button style={BTN_DANGER} disabled={busy} onClick={onSuspendClick}>Suspend</button>
        </div>
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturePanel({ allFeatures, planFeatures, overrides, busy, planCode, onToggle, onClear, onBulk }) {
  const [search, setSearch]     = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [stateFilter, setStateFilter] = useState('all'); // 'all' | 'enabled' | 'disabled' | 'overridden'

  const planMap = useMemo(
    () => Object.fromEntries((planFeatures || []).map((p) => [p.feature_code, p.is_enabled === true])),
    [planFeatures],
  );
  const overrideMap = useMemo(
    () => Object.fromEntries((overrides || []).map((o) => [o.feature_code, o])),
    [overrides],
  );
  const totalOverrides = (overrides || []).length;

  const allRows = useMemo(() =>
    (allFeatures || []).map((f) => {
      const code = f.feature_code;
      const planEnabled = planMap[code] === true;
      const ov = overrideMap[code];
      const hasOverride = !!ov;
      const effective = hasOverride ? ov.is_enabled === true : planEnabled;
      const cat = (code.split('.')[0] || 'other').toLowerCase();
      return { ...f, code, planEnabled, hasOverride, effective, override: ov, cat };
    }),
    [allFeatures, planMap, overrideMap],
  );

  const categories = useMemo(() => {
    const map = {};
    for (const r of allRows) {
      if (!map[r.cat]) map[r.cat] = { count: 0, overrideCount: 0 };
      map[r.cat].count++;
      if (r.hasOverride) map[r.cat].overrideCount++;
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (activeCat !== 'all' && r.cat !== activeCat) return false;
      if (term && !r.code.toLowerCase().includes(term) && !(r.feature_name || '').toLowerCase().includes(term)) return false;
      if (stateFilter === 'overridden' && !r.hasOverride) return false;
      if (stateFilter === 'enabled' && !r.effective) return false;
      if (stateFilter === 'disabled' && r.effective) return false;
      return true;
    });
  }, [allRows, activeCat, search, stateFilter]);

  const visibleCodes = filteredRows.map((r) => r.code);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            Feature overrides
          </span>
          <code style={CODE}>{planCode || '—'}</code>
          {totalOverrides > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 4,
              background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a',
            }}>
              {totalOverrides} override{totalOverrides !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <select
          style={{ ...CONTROL, width: 140, fontSize: 12 }}
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="all">All states</option>
          <option value="overridden">Overridden</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
        <input
          style={{ ...CONTROL, width: 190 }}
          placeholder="Search features…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Body: category sidebar + feature list */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', minHeight: 160 }}>

        {/* ── Category sidebar ── */}
        <div style={{ borderRight: '1px solid #f1f5f9', padding: '8px 0', background: '#fcfcfd' }}>
          <CatBtn
            label="All features"
            count={allRows.length}
            overrideCount={totalOverrides}
            active={activeCat === 'all'}
            onClick={() => setActiveCat('all')}
          />
          <div style={{ height: 1, background: '#f1f5f9', margin: '6px 10px' }} />
          {categories.map(([cat, info]) => (
            <CatBtn
              key={cat}
              label={cat}
              count={info.count}
              overrideCount={info.overrideCount}
              active={activeCat === cat}
              onClick={() => setActiveCat(cat)}
            />
          ))}
        </div>

        {/* ── Feature list ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Bulk action bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderBottom: '1px solid #f8fafc',
            background: '#fafbfc', flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>
              {filteredRows.length} feature{filteredRows.length !== 1 ? 's' : ''}
              {activeCat !== 'all' && <span style={{ color: '#4f46e5', fontWeight: 600 }}> · {activeCat}</span>}
            </span>
            <button style={MINI_BTN} disabled={busy || visibleCodes.length === 0} onClick={() => onBulk(visibleCodes, true)}>
              Enable all
            </button>
            <button style={MINI_BTN} disabled={busy || visibleCodes.length === 0} onClick={() => onBulk(visibleCodes, false)}>
              Disable all
            </button>
          </div>

          {/* Rows */}
          {filteredRows.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13 }}>
              No features match.
            </div>
          ) : (
            filteredRows.map((r) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CatBtn({ label, count, overrideCount, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        width: '100%', padding: '6px 12px', border: 'none', textAlign: 'left',
        background: active ? '#eef2ff' : 'transparent', cursor: 'pointer',
      }}
    >
      <span style={{
        flex: 1, fontSize: 12, fontWeight: active ? 600 : 400,
        color: active ? '#4338ca' : '#475569',
        textTransform: 'capitalize',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      {overrideCount > 0 && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#6366f1' : '#cbd5e1', flexShrink: 0 }}>
        {count}
      </span>
    </button>
  );
}

function FeatureRow({ row, busy, onToggle, onClear }) {
  const bg = row.hasOverride
    ? 'rgba(245,158,11,0.05)'
    : row.effective
      ? 'rgba(22,163,74,0.03)'
      : '#fff';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 14px', background: bg,
      borderBottom: '1px solid #f8fafc',
    }}>
      <Toggle enabled={row.effective} disabled={busy} onChange={onToggle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: row.effective ? '#0f172a' : '#94a3b8' }}>
            {row.feature_name || row.code}
          </span>
          {row.hasOverride && <span style={OVERRIDE_BADGE}>override</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <code style={CODE}>{row.code}</code>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            plan:
            <strong style={{ color: row.planEnabled ? '#15803d' : '#94a3b8', marginLeft: 3 }}>
              {row.planEnabled ? 'on' : 'off'}
            </strong>
          </span>
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
        letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0,
        background: row.effective ? '#dcfce7' : '#f1f5f9',
        color: row.effective ? '#15803d' : '#94a3b8',
        border: `1px solid ${row.effective ? '#bbf7d0' : '#e2e8f0'}`,
      }}>
        {row.effective ? 'on' : 'off'}
      </span>
      {row.hasOverride && (
        <button style={{ ...LINK_BTN, fontSize: 11, color: '#94a3b8' }} disabled={busy} onClick={onClear}>
          reset
        </button>
      )}
    </div>
  );
}

function Toggle({ enabled, disabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={enabled}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none',
        background: enabled ? '#4f46e5' : '#e2e8f0',
        position: 'relative', flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.18s ease, box-shadow 0.18s ease',
        opacity: disabled ? 0.45 : 1,
        boxShadow: enabled ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 4,
        left: enabled ? 22 : 4,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.18s ease',
        display: 'block',
      }} />
    </button>
  );
}

// ─── Limits ───────────────────────────────────────────────────────────────────

function LimitPanel({ allLimits, planLimits, overrides, busy, planCode, onSave, onClear }) {
  const [search, setSearch] = useState('');

  const planMap = useMemo(
    () => Object.fromEntries((planLimits || []).map((p) => [p.limit_code, Number(p.limit_value)])),
    [planLimits],
  );
  const overrideMap = useMemo(
    () => Object.fromEntries((overrides || []).map((o) => [o.limit_code, o])),
    [overrides],
  );
  const totalOverrides = (overrides || []).length;

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
    <div style={SECTION_CARD}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={SECTION_LABEL}>Limit overrides</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Plan <span style={MONO_CHIP}>{planCode || '—'}</span> · {totalOverrides} override{totalOverrides !== 1 ? 's' : ''}
          </div>
        </div>
        <input
          style={{ ...CONTROL, width: 220 }}
          placeholder="Search limits…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table header */}
      <div style={LIMIT_HEADER_ROW}>
        {['Limit', 'Plan default', 'Override value', 'Reason', ''].map((h) => (
          <div key={h} style={LIMIT_TH}>{h}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 1 }}>
        {rows.map((r) => (
          <LimitRow key={r.limit_code} row={r} busy={busy} onSave={onSave} onClear={onClear} />
        ))}
        {rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: 13 }}>
            No limits match.
          </div>
        )}
      </div>
    </div>
  );
}

function LimitRow({ row, busy, onSave, onClear }) {
  const initial = row.override ? String(row.override.limit_value) : row.planValue != null ? String(row.planValue) : '';
  const [draft,  setDraft]  = useState(initial);
  const [reason, setReason] = useState(row.override?.reason || '');

  useEffect(() => {
    setDraft(row.override ? String(row.override.limit_value) : row.planValue != null ? String(row.planValue) : '');
    setReason(row.override?.reason || '');
  }, [row.override, row.planValue]);

  const dirty = draft !== '' && Number(draft) !== Number(row.override ? row.override.limit_value : row.planValue);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.8fr 110px 110px 1fr auto',
      alignItems: 'center', gap: 8,
      padding: '9px 10px',
      background: row.override ? '#fffbeb' : '#fff',
      border: `1px solid ${row.override ? '#fde68a' : '#f1f5f9'}`,
      borderRadius: 6,
    }}>
      {/* Name + code */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
          {row.limit_name || row.limit_code}
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 2, alignItems: 'center' }}>
          <code style={CODE}>{row.limit_code}</code>
          {row.override && <span style={OVERRIDE_BADGE}>override</span>}
        </div>
      </div>
      {/* Plan default */}
      <div style={{ fontSize: 12, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
        {row.planValue == null ? <span style={{ color: '#cbd5e1' }}>unlimited</span> : row.planValue}
        {row.unit && <span style={{ color: '#94a3b8', marginLeft: 3 }}>{row.unit}</span>}
      </div>
      {/* Override value input */}
      <input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="value"
        style={{ ...CONTROL, width: '100%', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}
      />
      {/* Reason */}
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="reason (optional)"
        style={{ ...CONTROL, width: '100%' }}
      />
      {/* Actions */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          style={{ ...BTN_PRIMARY, padding: '0 10px', height: 32, fontSize: 12, opacity: (!dirty || busy) ? 0.4 : 1 }}
          disabled={busy || !dirty || draft === ''}
          onClick={() => onSave(row.limit_code, Number(draft), reason)}
        >
          Save
        </button>
        {row.override && (
          <button
            style={{ ...BTN_GHOST, padding: '0 8px', height: 32, fontSize: 12 }}
            disabled={busy}
            onClick={() => onClear(row.limit_code)}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Audit ────────────────────────────────────────────────────────────────────

const ACTION_COLORS = {
  suspend:    '#faf5ff', // violet tint
  reactivate: '#f0fdf4', // green tint
  extend:     '#eef2ff', // indigo tint
  patch:      '#f8fafc', // slate
  create:     '#f0fdf4',
  update:     '#fffbeb', // amber
  delete:     '#fef2f2', // red
};
const ACTION_DOT_COLORS = {
  suspend:    '#7c3aed',
  reactivate: '#15803d',
  extend:     '#4f46e5',
  patch:      '#64748b',
  create:     '#15803d',
  update:     '#d97706',
  delete:     '#dc2626',
};

function AuditPanel({ rows }) {
  if (rows.length === 0) return (
    <div style={SECTION_CARD}>
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>
        No audit entries yet.
      </div>
    </div>
  );

  return (
    <div style={SECTION_CARD}>
      <div style={SECTION_LABEL}>Audit timeline</div>
      <div style={{ display: 'grid', gap: 1, marginTop: 12 }}>
        {rows.map((row, i) => {
          const actionKey = Object.keys(ACTION_COLORS).find((k) => (row.action || '').toLowerCase().includes(k)) || 'patch';
          const bg  = ACTION_COLORS[actionKey];
          const dot = ACTION_DOT_COLORS[actionKey];
          return (
            <div key={row.audit_id} style={{
              display: 'grid',
              gridTemplateColumns: '8px 1fr auto',
              gap: 12, alignItems: 'start',
              padding: '10px 10px',
              background: bg,
              borderRadius: 6,
              border: '1px solid #f1f5f9',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.action}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {row.entity_type}
                  {row.entity_id ? <> · <code style={CODE}>{row.entity_id}</code></> : ''}
                  {row.actor_user_id ? <> · Actor #{row.actor_user_id}</> : ''}
                </div>
                {row.changes && (
                  <div style={{ marginTop: 6, padding: '4px 8px', background: 'rgba(255,255,255,0.6)', borderRadius: 4, fontSize: 11, color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
                    {typeof row.changes === 'object' ? JSON.stringify(row.changes) : String(row.changes)}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                {fmtDateTime(row.created_at)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatChip({ label, value, mono, accent }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px',
      background: accent ? '#eef2ff' : 'rgba(255,255,255,0.12)',
      border: `1px solid ${accent ? '#c7d2fe' : 'rgba(255,255,255,0.2)'}`,
      borderRadius: 999,
    }}>
      <span style={{ fontSize: 10, color: accent ? '#6366f1' : '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: accent ? '#4f46e5' : '#e2e8f0',
        fontFamily: mono ? "'JetBrains Mono', monospace" : undefined,
      }}>{value}</span>
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
      display: 'inline-block', padding: '3px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {s}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={FIELD_LABEL}>{label}</label>
      {children}
    </div>
  );
}

function Dialog({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, background: '#fff', borderRadius: 14,
        padding: 24, boxShadow: '0 32px 80px rgba(15,23,42,0.3)',
        zIndex: 201,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22, lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        {children}
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(v) { return String(v).charAt(0).toUpperCase() + String(v).slice(1); }
function toInputDate(v) { return v ? new Date(v).toISOString().slice(0, 10) : ''; }
function fmtDate(v) { return v ? new Date(v).toISOString().slice(0, 10) : '—'; }
function fmtDateTime(v) { return v ? new Date(v).toISOString().replace('T', ' ').slice(0, 19) : '—'; }
function statusColor(s) {
  return { active: '#15803d', trial: '#4338ca', grace: '#b45309', expired: '#dc2626', suspended: '#7c3aed', cancelled: '#475569' }[s] || '#94a3b8';
}
function AUDIT_DOT(action) {
  const key = Object.keys(ACTION_DOT_COLORS).find((k) => (action || '').toLowerCase().includes(k)) || 'patch';
  return { width: 8, height: 8, borderRadius: '50%', background: ACTION_DOT_COLORS[key], flexShrink: 0 };
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const BACK_LINK = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 12, color: '#94a3b8', textDecoration: 'none',
  fontWeight: 500,
};
const HERO_CARD = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 14,
  padding: '18px 20px',
};
const AVATAR = {
  width: 48, height: 48, borderRadius: 12,
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};
const HERO_NAME = {
  margin: 0, fontSize: 18, fontWeight: 700,
  color: '#f8fafc', letterSpacing: '-0.3px',
};
const REFRESH_BTN = {
  padding: 8, borderRadius: 8, border: '1px solid #334155',
  background: 'transparent', color: '#64748b',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
};
const TAB_BAR = {
  display: 'flex', gap: 2, padding: 4,
  background: '#f1f5f9', borderRadius: 10,
  border: '1px solid #e2e8f0',
};
const TAB_BTN = {
  padding: '6px 14px', borderRadius: 8, border: 'none',
  fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
  whiteSpace: 'nowrap',
};
const SECTION_CARD = {
  background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: 12, padding: '16px 16px',
};
const SECTION_LABEL = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  marginBottom: 10,
};
const OVERVIEW_TILE = {
  border: '1px solid #f1f5f9', borderRadius: 10,
  padding: '12px 14px', background: '#f8fafc',
};
const TILE_LABEL = {
  fontSize: 10, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
};
const LIMIT_HEADER_ROW = {
  display: 'grid',
  gridTemplateColumns: '1.8fr 110px 110px 1fr auto',
  gap: 8, padding: '0 10px 6px',
  marginBottom: 2,
};
const LIMIT_TH = {
  fontSize: 10, fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const CONTROL = {
  height: 34, border: '1px solid #e2e8f0', borderRadius: 7,
  padding: '0 10px', fontSize: 13, color: '#374151', background: '#fff',
  boxSizing: 'border-box',
};
const FIELD_LABEL = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };
const BTN_PRIMARY = {
  padding: '0 14px', height: 34, borderRadius: 8,
  background: '#4f46e5', color: '#fff', border: 'none',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const BTN_GHOST = {
  padding: '0 14px', height: 34, borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#fff',
  color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const BTN_DANGER = {
  padding: '0 14px', height: 34, borderRadius: 8,
  border: '1px solid #fca5a5', background: '#fef2f2',
  color: '#dc2626', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const MINI_BTN = {
  padding: '2px 7px', borderRadius: 5, border: '1px solid #e2e8f0',
  background: '#fff', color: '#475569', fontSize: 11, fontWeight: 500, cursor: 'pointer',
};
const CODE = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
  background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: 3, padding: '0 4px', color: '#475569',
};
const MONO_CHIP = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
  background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: 4, padding: '0 6px', color: '#475569',
};
const OVERRIDE_BADGE = {
  fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
  background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const LINK_BTN = {
  background: 'none', border: 'none', padding: 0,
  color: '#4f46e5', fontSize: 11, fontWeight: 500, cursor: 'pointer',
};
const VIEW_ALL_BTN = {
  background: 'none', border: 'none', color: '#4f46e5',
  fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0,
};
const ERROR_BOX = {
  padding: '9px 12px', borderRadius: 8,
  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13,
};
const DLG_LABEL = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 };
const DLG_INPUT = {
  width: '100%', height: 38, border: '1.5px solid #e2e8f0',
  borderRadius: 8, padding: '0 12px', fontSize: 14, color: '#0f172a',
  background: '#fff', boxSizing: 'border-box',
};
const DLG_BTN_GHOST = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const DLG_BTN_PRIMARY = {
  padding: '8px 14px', borderRadius: 8, border: 'none',
  background: '#4f46e5', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
const DLG_BTN_DANGER = {
  padding: '8px 14px', borderRadius: 8,
  border: '1px solid #fca5a5', background: '#fef2f2',
  color: '#dc2626', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
