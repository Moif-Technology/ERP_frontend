import { useEffect, useMemo, useState } from 'react';
import { AppActionButton, CommonTable, InputField, StatusBadge, Switch } from '../../../shared/components/ui';
import { colors, tableUi } from '../../../shared/constants/theme';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import * as exchangeApi from '../../../services/api/exchangeApi.js';

const PRIMARY = colors.primary?.main || '#790728';
const HEADER_BG = colors.primary?.gradient || PRIMARY;
const FILTERS = ['All', 'Active', 'Inactive'];
const PANEL = 'rounded-lg border border-slate-200 bg-white shadow-sm';

function getApiMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function SkeletonRows() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="h-9 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}

export default function CurrencyMaster() {
  const [currencies, setCurrencies] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadCurrencies = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await exchangeApi.listCurrencies();
      setCurrencies(Array.isArray(data?.currencies) ? data.currencies : []);
    } catch (err) {
      setMessage({ type: 'error', text: getApiMessage(err, 'Could not load currencies. The API may be offline.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const filteredCurrencies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return currencies.filter((currency) => {
      const matchesSearch =
        !q ||
        String(currency.currencyCode || '').toLowerCase().includes(q) ||
        String(currency.currencyName || '').toLowerCase().includes(q);
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Active' && currency.isActive) ||
        (filter === 'Inactive' && !currency.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [currencies, filter, search]);

  const summary = useMemo(() => {
    const active = currencies.filter((currency) => currency.isActive || currency.isBase).length;
    const inactive = Math.max(0, currencies.length - active);
    const base = currencies.find((currency) => currency.isBase)?.currencyCode || '-';
    return { total: currencies.length, active, inactive, base };
  }, [currencies]);

  const updateCurrencyState = (code, patch) => {
    setCurrencies((prev) =>
      prev.map((currency) => (currency.currencyCode === code ? { ...currency, ...patch } : currency)),
    );
  };

  const handleToggle = async (currency, checked) => {
    if (currency.isBase) return;
    const code = currency.currencyCode;
    setBusyCode(code);
    setMessage({ type: '', text: '' });
    try {
      if (checked) {
        await exchangeApi.activateCurrency(code);
        updateCurrencyState(code, { isActive: true });
        setMessage({ type: 'success', text: `${code} activated.` });
      } else {
        await exchangeApi.deactivateCurrency(code);
        updateCurrencyState(code, { isActive: false });
        setMessage({ type: 'success', text: `${code} deactivated.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: getApiMessage(err, `Could not update ${code}.`) });
    } finally {
      setBusyCode('');
    }
  };

  const handleSetBase = async (currency) => {
    const code = currency.currencyCode;
    setBusyCode(code);
    setMessage({ type: '', text: '' });
    try {
      await exchangeApi.setBaseCurrency(code);
      setCurrencies((prev) =>
        prev.map((item) => ({
          ...item,
          isBase: item.currencyCode === code,
          isActive: item.currencyCode === code ? true : item.isActive,
        })),
      );
      setMessage({ type: 'success', text: `${code} set as base currency.` });
    } catch (err) {
      setMessage({ type: 'error', text: getApiMessage(err, `Could not set ${code} as base currency.`) });
    } finally {
      setBusyCode('');
    }
  };

  const rows = filteredCurrencies.map((currency) => {
    const code = currency.currencyCode;
    return [
      <span key={`${code}-code`} className="font-bold text-slate-900">
        {code}
      </span>,
      currency.currencyName || '-',
      currency.symbol || '-',
      currency.decimalPlaces ?? '-',
      currency.isBase ? (
        <span
          key={`${code}-base`}
          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700"
        >
          <span aria-hidden>★</span> Base
        </span>
      ) : (
        <span key={`${code}-not-base`} className="text-slate-400">
          -
        </span>
      ),
      <div key={`${code}-status`} className="flex items-center justify-center gap-2">
        <Switch
          size="sm"
          checked={Boolean(currency.isActive || currency.isBase)}
          disabled={currency.isBase || busyCode === code}
          onChange={(checked) => handleToggle(currency, checked)}
        />
        <StatusBadge status={currency.isActive || currency.isBase ? 'Active' : 'Inactive'} />
      </div>,
      currency.isActive && !currency.isBase ? (
        <AppActionButton
          key={`${code}-action`}
          onClick={() => handleSetBase(currency)}
          disabled={busyCode === code}
          title={`Set ${code} as base currency`}
        >
          Set as Base
        </AppActionButton>
      ) : (
        <span key={`${code}-no-action`} className="text-[10px] text-slate-400">
          {currency.isBase ? 'Locked' : '-'}
        </span>
      ),
    ];
  });

  return (
    <div className="box-border flex w-full flex-col gap-3">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6" style={{ background: HEADER_BG }}>
          <div>
            <h1 className="text-lg font-bold tracking-wide sm:text-xl">CURRENCY MASTER</h1>
            <p className="mt-1 text-xs font-semibold text-white sm:text-sm">Manage active currencies for your company</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
            {[
              ['Total', summary.total],
              ['Active', summary.active],
              ['Inactive', summary.inactive],
              ['Base', summary.base],
            ].map(([label, value]) => (
              <div key={label} className="min-w-20 rounded border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="font-semibold uppercase tracking-[0.12em] text-white">{label}</p>
                <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
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

          <div className={`${PANEL} flex flex-col gap-3 p-3 sm:flex-row sm:items-end sm:justify-between`}>
            <div className="relative min-w-0 flex-1">
              <InputField
                label="Search by code or name"
                fullWidth
                heightPx={34}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code or name"
                className="pl-8 text-xs"
              />
              <img src={SearchIcon} alt="" className="pointer-events-none absolute bottom-[9px] left-2.5 h-3.5 w-3.5 opacity-60" />
            </div>
            <div className="min-w-fit">
              <p className="mb-1 text-[11px] font-medium text-slate-700">Filter toggle</p>
              <div className="flex h-8 overflow-hidden rounded border border-slate-200 bg-slate-100 p-0.5">
                {FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`min-w-16 px-3 text-[10px] font-bold uppercase tracking-[0.08em] transition ${
                      filter === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <SkeletonRows />
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
                columnWidthPercents={[10, 25, 9, 9, 15, 17, 15]}
                headers={['Code', 'Currency Name', 'Symbol', 'Decimals', 'Base Currency', 'Status', 'Actions']}
                rows={rows}
              />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No currencies found.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
