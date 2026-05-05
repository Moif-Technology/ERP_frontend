import { getSessionSubscription } from './access.service.js';

export default function LockedAccessPage() {
  const subscription = getSessionSubscription();
  const status = subscription?.status || 'not included';
  const reason =
    status === 'expired'
      ? 'This subscription has expired.'
      : status === 'suspended'
        ? 'This subscription is suspended.'
        : status === 'cancelled'
          ? 'This subscription is cancelled.'
          : 'This feature is not included in the current plan.';

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-12 text-slate-800">
      <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
          Access unavailable
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Module locked</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{reason}</p>
        {subscription?.trialEndsAt || subscription?.currentPeriodEndsAt ? (
          <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {subscription?.trialEndsAt ? `Trial ended: ${subscription.trialEndsAt}` : null}
            {subscription?.currentPeriodEndsAt
              ? `Current period ended: ${subscription.currentPeriodEndsAt}`
              : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
