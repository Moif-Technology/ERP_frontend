import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppActionButton, DateInputField, DropdownInput, InputField } from '../../../shared/components/ui';
import { colors } from '../../../shared/constants/theme';
import * as exchangeApi from '../../../services/api/exchangeApi.js';

const PRIMARY = colors.primary?.main || '#790728';
const HEADER_BG = colors.primary?.gradient || PRIMARY;
const HEADER_TINT = colors.primary?.[50] || '#F2E6EA';
const FORM_LABEL_CLASS = '!text-[11px] !font-semibold !text-slate-700';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getApiMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function requiredLabel(text) {
  return (
    <span className="inline-flex items-center gap-1">
      {text}
      <span className="text-red-600" aria-hidden>
        *
      </span>
    </span>
  );
}

export default function ExchangeRateEntry() {
  const navigate = useNavigate();
  const { rateId } = useParams();
  const isEdit = Boolean(rateId);

  const [form, setForm] = useState({
    fromCurrency: '',
    toCurrency: '',
    rate: '',
    effectiveDate: todayIso(),
  });
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setMessage({ type: '', text: '' });
      try {
        const [{ data: currencyData }, rateResponse] = await Promise.all([
          exchangeApi.listCurrencies(),
          isEdit ? exchangeApi.listRates({ rateId }) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const activeCurrencies = (currencyData?.currencies || []).filter((currency) => currency.isActive || currency.isBase);
        setCurrencies(activeCurrencies);

        if (isEdit) {
          const rates = rateResponse?.data?.rates || [];
          const rate = rates.find((item) => String(item.rateId) === String(rateId)) || rates[0];
          if (rate) {
            setForm({
              fromCurrency: rate.fromCurrency || '',
              toCurrency: rate.toCurrency || '',
              rate: rate.rate != null ? String(rate.rate) : '',
              effectiveDate: rate.effectiveDate ? String(rate.effectiveDate).slice(0, 10) : todayIso(),
            });
          } else {
            setMessage({ type: 'error', text: 'Exchange rate entry was not found.' });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({ type: 'error', text: getApiMessage(err, 'Could not load exchange rate data. The API may be offline.') });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isEdit, rateId]);

  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => ({
        value: currency.currencyCode,
        label: `${currency.currencyCode} - ${currency.currencyName || currency.currencyCode}`,
      })),
    [currencies],
  );

  const toCurrencyOptions = useMemo(
    () => currencyOptions.filter((option) => option.value !== form.fromCurrency),
    [currencyOptions, form.fromCurrency],
  );

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'fromCurrency' && value === prev.toCurrency) next.toCurrency = '';
      return next;
    });
    setMessage({ type: '', text: '' });
  };

  const validate = () => {
    if (!form.fromCurrency) return 'Select the from currency.';
    if (!form.toCurrency) return 'Select the to currency.';
    if (form.fromCurrency === form.toCurrency) return 'From and to currencies must be different.';
    if (!Number.isFinite(Number(form.rate)) || Number(form.rate) <= 0) return 'Enter an exchange rate greater than zero.';
    if (!form.effectiveDate) return 'Select an effective date.';
    return '';
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    const body = {
      fromCurrency: form.fromCurrency,
      toCurrency: form.toCurrency,
      rate: Number(form.rate),
      effectiveDate: form.effectiveDate,
    };

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      if (isEdit) await exchangeApi.updateRate(rateId, body);
      else await exchangeApi.createRate(body);
      setMessage({ type: 'success', text: isEdit ? 'Exchange rate updated.' : 'Exchange rate saved.' });
      window.setTimeout(() => navigate('/exchange-hub/rate-list'), 450);
    } catch (err) {
      setMessage({ type: 'error', text: getApiMessage(err, 'Could not save exchange rate.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="box-border flex w-full flex-col gap-3">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ background: HEADER_BG }}>
          <div>
            <h1 className="text-lg font-bold tracking-wide sm:text-xl">{isEdit ? 'EDIT EXCHANGE RATE' : 'EXCHANGE RATE ENTRY'}</h1>
            <p className="mt-1 text-xs font-semibold text-white sm:text-sm">Create or edit a single exchange rate entry</p>
          </div>
          <span className="w-fit rounded border border-white/20 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: PRIMARY }}>
            {isEdit ? `Rate ID ${rateId}` : 'New Rate'}
          </span>
        </div>

        <div className="bg-slate-50/60 p-4 sm:p-5">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3" style={{ backgroundColor: HEADER_TINT }}>
              <div>
                <h2 className="text-sm font-bold" style={{ color: PRIMARY }}>Rate details</h2>
                <p className="mt-0.5 text-[11px] font-semibold text-black">All marked fields are required.</p>
              </div>
              <span className="rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: PRIMARY }}>
                Single-column form
              </span>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {message.text ? (
                <p
                  className={`rounded border px-3 py-2 text-xs font-semibold ${
                    message.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </p>
              ) : null}

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-10 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              ) : (
                <>
                  <DropdownInput
                    label={requiredLabel('From Currency')}
                    fullWidth
                    heightPx={36}
                    labelClassName={FORM_LABEL_CLASS}
                    value={form.fromCurrency}
                    onChange={(value) => update('fromCurrency', value)}
                    options={currencyOptions}
                    placeholder={currencyOptions.length ? 'Select from currency' : 'No active currencies'}
                  />
                  <DropdownInput
                    label={requiredLabel('To Currency')}
                    fullWidth
                    heightPx={36}
                    labelClassName={FORM_LABEL_CLASS}
                    value={form.toCurrency}
                    onChange={(value) => update('toCurrency', value)}
                    options={toCurrencyOptions}
                    placeholder={toCurrencyOptions.length ? 'Select to currency' : 'No other active currency'}
                  />
                  <InputField
                    label={requiredLabel('Exchange Rate')}
                    fullWidth
                    heightPx={36}
                    type="number"
                    labelClassName={FORM_LABEL_CLASS}
                    step="0.000001"
                    min="0"
                    value={form.rate}
                    onChange={(e) => update('rate', e.target.value)}
                    placeholder="e.g. 0.272294"
                  />
                  <DateInputField
                    label={requiredLabel('Effective Date')}
                    fullWidth
                    heightPx={36}
                    value={form.effectiveDate}
                    onChange={(value) => update('effectiveDate', value)}
                  />

                  <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900">
                    <span className="text-blue-700">Rate meaning:</span> 1 {form.fromCurrency || '[From]'} = {form.rate || '[rate]'}{' '}
                    {form.toCurrency || '[To]'}
                  </div>
                </>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <AppActionButton onClick={() => navigate('/exchange-hub/rate-list')} disabled={saving}>
                  Cancel
                </AppActionButton>
                <AppActionButton variant="primary" onClick={handleSave} disabled={loading || saving}>
                  {saving ? 'Saving...' : 'Save'}
                </AppActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
