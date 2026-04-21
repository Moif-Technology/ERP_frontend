import React, { useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';

const primary = colors.primary?.main || '#790728';

const STATIONS = ['Head office', 'Warehouse', 'Branch North', 'Branch South'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-2 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center gap-1 rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const sectionBox = 'rounded border border-gray-200 bg-white p-2 shadow-sm sm:p-3';

const ACCOUNT_TABS = [
  { id: 'trading', label: 'Trading Account' },
  { id: 'profitLoss', label: 'Profit and Loss Account' },
];

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatMoney(value) {
  const n = Number(value || 0);
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `(${abs})` : abs;
}

function SearchableDropdown({ label, value, query, open, onQueryChange, onOpenChange, onChange, options }) {
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="relative flex min-w-0 w-full max-w-full flex-col gap-0.5">
      <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>
        {label}
      </span>
      <div className={`${figmaOutline} relative flex h-[26px] min-h-[26px] w-full items-center bg-white`}>
        <input
          type="text"
          value={open ? query : value}
          onFocus={() => {
            onQueryChange(value);
            onOpenChange(true);
          }}
          onChange={(e) => {
            onQueryChange(e.target.value);
            onOpenChange(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onOpenChange(false);
          }}
          className="h-full w-full bg-transparent pl-2 pr-7 text-[9px] font-semibold text-black outline-none placeholder:text-gray-400 sm:text-[10px]"
          placeholder={`Search ${label.toLowerCase()}`}
          role="combobox"
          aria-expanded={open}
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => {
            onQueryChange(value);
            onOpenChange(!open);
          }}
          className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center"
          aria-label={`Toggle ${label}`}
        >
          <ToolbarChevron className={`h-2 w-2 text-black transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-40 overflow-auto rounded border border-gray-200 bg-white py-1 shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option);
                  onQueryChange(option);
                  onOpenChange(false);
                }}
                className={`block w-full px-2 py-1.5 text-left text-[9px] hover:bg-gray-50 sm:text-[10px] ${
                  option === value ? 'font-semibold' : 'font-normal'
                }`}
                style={option === value ? { color: primary } : undefined}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-2 py-1.5 text-[9px] text-gray-500 sm:text-[10px]">No stations found</div>
          )}
        </div>
      )}
    </div>
  );
}

function AmountCard({ label, amount, percentage, percentageTone = 'green' }) {
  const percentageClass =
    percentageTone === 'red'
      ? 'bg-red-50 text-red-700'
      : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="relative min-h-[112px] min-w-0 rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-[0_3px_14px_rgba(15,23,42,0.14)] sm:px-4">
      <p className="text-[10px] font-semibold tracking-[0.03em] text-gray-600 sm:text-[11px]">
        {label}
      </p>
      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
        <span className="min-w-0 text-[22px] font-semibold leading-none tracking-[0.03em] text-gray-950 tabular-nums sm:text-[24px]">
          {amount}
        </span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold ${percentageClass}`}>
          {percentage}
        </span>
      </div>
    </div>
  );
}

export default function ProfitAndLossAccount() {
  const [station, setStation] = useState('');
  const [stationQuery, setStationQuery] = useState('');
  const [stationOpen, setStationOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('trading');

  const tradingRows = useMemo(
    () => [
      [
        'Closing Balance',
        { content: formatMoney(26188.8), className: 'text-right tabular-nums' },
      ],
      ['Gross Profit c/o', { content: formatMoney(26188.8), className: 'text-right tabular-nums' }],
      ['Nett Profit', ''],
      [
        { content: 'Total Amount', className: 'font-bold' },
        { content: formatMoney(26188.8), className: 'text-right font-bold tabular-nums' },
      ],
    ],
    [],
  );

  const profitLossRows = useMemo(
    () => [
      ['Opening Balance', formatMoney(26188.8)],
      [
        { content: 'Total Amount', className: 'font-bold' },
        { content: formatMoney(26188.8), className: 'text-right font-bold tabular-nums' },
      ],
    ],
    [],
  );

  const detailRows = useMemo(
    () => [
      ['Closing Balance', formatMoney(26188.8), ''],
      ['Gross Profit c/o', '', formatMoney(26188.8)],
      ['Nett Profit', formatMoney(2345), formatMoney(2345)],
    ],
    [],
  );

  const handleApply = () => {
    // eslint-disable-next-line no-console
    console.log('Display profit and loss account', { station, appliedDateRange });
  };

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          PROFIT AND LOSS ACCOUNT
        </h1>
        <button type="button" className={`${figmaToolbarBtn} w-full sm:w-auto`}>
          <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
          Print
        </button>
      </header>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[3fr_1fr] lg:items-start">
        <main className="flex min-h-0 min-w-0 flex-col gap-3">
          <section className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
            <div
              className="grid w-full min-w-0 items-end gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr))',
              }}
            >
              <SearchableDropdown
                label="Station"
                value={station}
                query={stationQuery}
                open={stationOpen}
                onQueryChange={setStationQuery}
                onOpenChange={setStationOpen}
                onChange={setStation}
                options={STATIONS}
              />
              <div className="relative flex min-w-0 w-full max-w-full flex-col gap-0.5">
                <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>
                  Select date
                </span>
                <button
                  type="button"
                  className={`${figmaToolbarBtn} box-border h-[26px] min-h-[26px] w-full`}
                  onClick={() => setDateModalOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={dateModalOpen}
                  aria-label="Select date"
                >
                  <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {appliedDateRange
                      ? `${formatDDMMYYYY(appliedDateRange.from)} - ${formatDDMMYYYY(appliedDateRange.to)}`
                      : 'Select Date'}
                  </span>
                  <ToolbarChevron />
                </button>
                <QuotationDateRangeModal
                  open={dateModalOpen}
                  title="Profit and loss date"
                  initialRange={appliedDateRange}
                  onClose={() => setDateModalOpen(false)}
                  onApply={(range) => setAppliedDateRange(range)}
                />
              </div>
              <div className="flex min-h-[26px] min-w-0 w-full max-w-full items-end justify-stretch sm:justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  className={`${primaryToolbarBtn} box-border h-[26px] min-h-[26px] w-full sm:w-auto sm:min-w-[6rem]`}
                  style={{ backgroundColor: primary, borderColor: primary }}
                  aria-label="Apply profit and loss account filters"
                >
                  Apply
                </button>
              </div>
            </div>
          </section>

          <div
            className="inline-flex max-w-full shrink-0 items-stretch gap-px self-start rounded-md px-0.5 py-0.5"
            style={{ backgroundColor: '#EDEDED' }}
            role="tablist"
            aria-label="Profit and loss account sections"
          >
            {ACCOUNT_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className="min-h-[22px] whitespace-nowrap rounded px-2 py-0.5 text-center text-[8px] font-medium leading-tight transition-colors sm:min-h-[24px] sm:px-2.5 sm:text-[9px]"
                  style={
                    active
                      ? { backgroundColor: primary, color: '#fff' }
                      : { backgroundColor: 'transparent', color: '#111827' }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <section className={sectionBox}>
            <CommonTable
              fitParentWidth
              headers={['Particulars', 'Amount']}
              rows={activeTab === 'trading' ? tradingRows : profitLossRows}
              columnWidthPercents={[74, 26]}
              bodyFontSize="clamp(10px, 1.2vw, 14px)"
              headerFontSize="clamp(9px, 1vw, 12px)"
              cellPaddingClass="px-2 py-2 sm:px-2.5 sm:py-3"
            />
          </section>
        </main>

        <aside className="flex min-w-0 flex-col gap-3">
          <section className={sectionBox}>
            <div className="mb-2 flex items-center">
              <h2 className="text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]" style={{ color: primary }}>
                Detailed View
              </h2>
            </div>
            <div className="mb-3 flex items-center gap-2 rounded bg-gray-50 px-2.5 py-1.5 border border-gray-100">
              <span className="text-[9px] font-semibold text-gray-500 sm:text-[10px]">Group Name :</span>
              <span className="text-[9px] font-medium text-gray-800 sm:text-[10px]">Group Name</span>
            </div>
            <CommonTable
              fitParentWidth
              headers={['Particular', 'Debit', 'Credit']}
              rows={detailRows}
              columnWidthPercents={[48, 26, 26]}
              bodyFontSize="clamp(8px, 0.9vw, 10px)"
              headerFontSize="clamp(8px, 0.9vw, 10px)"
              cellPaddingClass="px-1.5 py-1 sm:px-2 sm:py-1.5"
              truncateBody
            />
          </section>

          <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <AmountCard label="Debit" amount="2345.00" percentage="+1.5%" percentageTone="red" />
            <AmountCard label="Credit" amount="2345.00" percentage="+1.5%" />
          </section>
        </aside>
      </div>
    </div>
  );
}
