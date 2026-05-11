import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import {
  getSessionCompany,
  getWelcomeState,
  completeWelcomeOnServer,
  dismissWelcomeLocally,
} from '../../../core/auth/auth.service.js';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

const PLACEHOLDER_CHOICES = [
  {
    label: 'Align modules to your workflow',
    hint: 'We will unlock plan-based menus and shortcuts here soon.',
  },
  {
    label: 'Invite your team',
    hint: 'Role invites and seat limits will connect to your plan.',
  },
  {
    label: 'Connect accounting defaults',
    hint: 'Tax, fiscal year, and opening balances — coming next.',
  },
];

export default function WelcomeSetup() {
  const navigate = useNavigate();
  const [welcome, setWelcome] = useState(() => getWelcomeState());
  const company = getSessionCompany();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWelcome(getWelcomeState());
  }, []);

  if (!welcome.show) {
    return <Navigate to="/dashboard" replace />;
  }

  const finish = async () => {
    setLoading(true);
    try {
      try {
        await completeWelcomeOnServer();
      } catch {
        dismissWelcomeLocally();
      }
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const primary = colors.primary?.main || '#800000';

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div
        className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm"
        style={{ borderTopWidth: 3, borderTopColor: primary }}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Welcome</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
          {company?.companyName ? `${company.companyName}` : 'Your company'} is on Moifone ERP
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Here is your current plan. You can explore more setup options later — skip anytime and go straight to
          the dashboard.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div
            className="border-b border-gray-100 px-5 py-4 sm:px-6"
            style={{ background: `linear-gradient(135deg, ${primary}08, transparent)` }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your plan</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg font-bold text-gray-900">{welcome.planName || 'Plan'}</h2>
              {welcome.planCode ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {welcome.planCode}
                </span>
              ) : null}
            </div>
            {welcome.audienceLabel ? (
              <p className="mt-1 text-sm text-gray-600">{welcome.audienceLabel}</p>
            ) : null}
            {welcome.description ? <p className="mt-3 text-sm leading-relaxed text-gray-700">{welcome.description}</p> : null}

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-gray-500">Subscription status</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{welcome.status || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Trial ends</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{formatDate(welcome.trialEndsAt)}</dd>
              </div>
              {(welcome.priceMonthly || welcome.priceYearly) && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500">Pricing (catalog)</dt>
                  <dd className="mt-0.5 text-gray-900">
                    {welcome.priceMonthly ? <span className="font-semibold">{welcome.priceMonthly}</span> : null}
                    {welcome.periodLabel ? (
                      <span className="text-gray-600"> / {welcome.periodLabel}</span>
                    ) : null}
                    {welcome.priceYearly ? (
                      <span className="ml-2 text-gray-600">
                        · yearly <span className="font-medium text-gray-800">{welcome.priceYearly}</span>
                      </span>
                    ) : null}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {Array.isArray(welcome.featurePreview) && welcome.featurePreview.length > 0 ? (
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Included highlights</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {welcome.featurePreview.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: primary }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Next setup (optional)</p>
            <p className="mt-1 text-sm text-gray-600">
              These will become interactive as we ship plan-based features. For now they are a preview only.
            </p>
            <ul className="mt-4 space-y-3">
              {PLACEHOLDER_CHOICES.map((o) => (
                <li
                  key={o.label}
                  className="flex gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3"
                >
                  <input type="checkbox" disabled className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{o.label}</p>
                    <p className="text-xs text-gray-500">{o.hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={finish}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={finish}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 hover:opacity-95"
                style={{ background: primary }}
              >
                {loading ? 'Saving…' : 'Continue to dashboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
