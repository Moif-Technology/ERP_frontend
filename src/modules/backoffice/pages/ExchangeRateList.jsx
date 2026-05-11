import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppActionButton, CommonTable, ConfirmDialog, DateInputField, DropdownInput } from '../../../shared/components/ui';
import { colors, tableUi } from '../../../shared/constants/theme';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import * as exchangeApi from '../../../services/api/exchangeApi.js';

const PRIMARY = colors.primary?.main || '#790728';
const HEADER_BG = colors.primary?.gradient || PRIMARY;
const FILTER_LABEL_CLASS = '!text-[11px] !font-semibold !text-slate-700';

function getApiMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('en-GB');
}

function formatRate(rate) {
  const value = Number(rate);
  return Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '-';
}

export default function ExchangeRateList() {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', date_from: '', date_to: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;

    const loadCurrencies = async () => {
      try {
        const { data } = await exchangeApi.listCurrencies();
        if (!cancelled) setCurrencies((data?.currencies || []).filter((currency) => currency.isActive || currency.isBase));
      } catch {
        if (!cancelled) setCurrencies([]);
      }
    };

    loadCurrencies();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadRates = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const params = Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => value));
      const { data } = await exchangeApi.listRates(params);
      setRates(Array.isArray(data?.rates) ? data.rates : []);
    } catch (err) {
      setMessage({ type: 'error', text: getApiMessage(err, 'Could not load exchange rates. The API may be offline.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, [appliedFilters]);

  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => ({
        value: currency.currencyCode,
        label: `${currency.currencyCode} - ${currency.currencyName || currency.currencyCode}`,
      })),
    [currencies],
  );

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const empty = { from: '', to: '', date_from: '', date_to: '' };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setMessage({ type: '', text: '' });
    try {
      await exchangeApi.deleteRate(deleteTarget.rateId);
      setRates((prev) => prev.filter((rate) => rate.rateId !== deleteTarget.rateId));
      setMessage({ type: 'success', text: 'Exchange rate deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: getApiMessage(err, 'Could not delete exchange rate.') });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const rows = rates.map((rate, idx) => [
    idx + 1,
    rate.fromCurrency || '-',
    rate.toCurrency || '-',
    formatRate(rate.rate),
    formatDate(rate.effectiveDate),
    rate.createdBy || '-',
    formatDate(rate.createdAt),
    <div key={`actions-${rate.rateId}`} className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        title="Edit exchange rate"
        onClick={() => navigate(`/exchange-hub/rate-entry/${rate.rateId}`)}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50"
      >
        <img src={EditIcon} alt="Edit" className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Delete exchange rate"
        onClick={() => setDeleteTarget(rate)}
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white hover:border-red-200 hover:bg-red-50"
      >
        <img src={DeleteIcon} alt="Delete" className="h-3.5 w-3.5" />
      </button>
    </div>,
  ]);

  return (
    <div className="box-border flex w-full flex-col gap-3">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ background: HEADER_BG }}>
          <div>
            <h1 className="text-lg font-bold tracking-wide sm:text-xl">EXCHANGE RATE LIST</h1>
            <p className="mt-1 text-xs font-semibold text-white sm:text-sm">Show all exchange rate entries with filter, edit, delete</p>
          </div>
          <AppActionButton variant="primary" onClick={() => navigate('/exchange-hub/rate-entry')} className="border-white/20 bg-white hover:bg-rose-50" style={{ color: PRIMARY }}>
            New Entry
          </AppActionButton>
        </div>

        <div className="space-y-3 bg-slate-50/60 p-4 sm:p-5">
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

          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex flex-col gap-1 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold" style={{ color: PRIMARY }}>Filters</h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-black">
                From Currency | To Currency | Date From | Date To
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
              <DropdownInput label="From Currency" labelClassName={FILTER_LABEL_CLASS} fullWidth heightPx={34} value={filters.from} onChange={(value) => updateFilter('from', value)} options={currencyOptions} placeholder="All from" />
              <DropdownInput label="To Currency" labelClassName={FILTER_LABEL_CLASS} fullWidth heightPx={34} value={filters.to} onChange={(value) => updateFilter('to', value)} options={currencyOptions} placeholder="All to" />
              <DateInputField label="Date From" fullWidth heightPx={34} value={filters.date_from} onChange={(value) => updateFilter('date_from', value)} />
              <DateInputField label="Date To" fullWidth heightPx={34} value={filters.date_to} onChange={(value) => updateFilter('date_to', value)} />
              <AppActionButton variant="primary" onClick={applyFilters} disabled={loading} fullWidth>
                Apply
              </AppActionButton>
              <AppActionButton onClick={clearFilters} disabled={loading} fullWidth>
                Clear
              </AppActionButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-9 animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            ) : rows.length ? (
              <CommonTable
                fitParentWidth
                allowHorizontalScroll
                hideVerticalCellBorders
                cellAlign="center"
                headerBackgroundColor={tableUi.header.backgroundColor}
                headerTextColor={tableUi.header.color}
                headerFontSize="11px"
                bodyFontSize="11px"
                cellPaddingClass="px-2 py-2"
                columnWidthPercents={[5, 10, 10, 14, 14, 17, 17, 13]}
                headers={['#', 'From', 'To', 'Rate', 'Effective Date', 'Created By', 'Date Added', 'Actions']}
                rows={rows}
              />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No exchange rates found.</p>
            )}
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete exchange rate?"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.fromCurrency} to ${deleteTarget.toCurrency} effective ${formatDate(deleteTarget.effectiveDate)}?`
            : ''
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
