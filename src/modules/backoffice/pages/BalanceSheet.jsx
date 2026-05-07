import React, { useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import SelectDateButton from '../../../shared/components/ui/SelectDateButton';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';

const primary = colors.primary?.main || '#790728';

const STATIONS = ['Head office', 'Warehouse', 'Branch North', 'Branch South'];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-2 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center gap-1 rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const tableSectionBox = 'bg-white';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

export default function BalanceSheet() {
  const [station, setStation] = useState('');
  const [stationQuery, setStationQuery] = useState('');
  const [stationOpen, setStationOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState(null);

  const liabilitiesRows = useMemo(
    () => [
      [{ content: 'CAPITAL ACCOUNT', className: 'font-bold' }, { content: formatMoney(500), className: 'text-right font-bold tabular-nums' }],
      [{ content: 'Profit And Loss A/C', className: 'font-bold' }, { content: formatMoney(753655.52), className: 'text-right font-bold tabular-nums' }],
      ['Opening Balance', { content: formatMoney(753655.52), className: 'text-right tabular-nums' }],
      ['Current Period', { content: formatMoney(0), className: 'text-right tabular-nums' }],
    ],
    [],
  );

  const assetsRows = useMemo(
    () => [
      [{ content: 'CURRENT LIABILITIES', className: 'font-bold' }, { content: formatMoney(636865.96), className: 'text-right font-bold tabular-nums' }],
      [{ content: 'CURRENT ASSETS', className: 'font-bold' }, { content: formatMoney(128527.1), className: 'text-right font-bold tabular-nums' }],
    ],
    [],
  );

  const handleApply = () => {
    // eslint-disable-next-line no-console
    console.log('Display balance sheet', { station, appliedDateRange });
  };

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <header className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          BALANCE SHEET
        </h1>
        <button type="button" className={`${figmaToolbarBtn} w-full sm:w-auto`}>
          <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
          Print
        </button>
      </header>

      <section className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 w-full sm:p-3">
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
          <SelectDateButton
            label="Select date"
            title="Balance sheet date"
            value={appliedDateRange}
            onApply={setAppliedDateRange}
            buttonClassName={figmaToolbarBtn}
          />
          <div className="flex min-h-[26px] min-w-0 w-full max-w-full items-end justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={handleApply}
              className={`${primaryToolbarBtn} box-border h-[26px] min-h-[26px] w-full sm:w-auto sm:min-w-[6rem]`}
              style={{ backgroundColor: primary, borderColor: primary }}
              aria-label="Apply balance sheet filters"
            >
              Apply
            </button>
          </div>
        </div>
      </section>

      <div className="grid min-h-0 min-w-0 flex-1 gap-3 lg:grid-cols-2">
        <section className={`${tableSectionBox} flex min-h-0 min-w-0 flex-col`}>
          <CommonTable
            fitParentWidth
            headers={['Liabilities', 'Amount']}
            rows={liabilitiesRows}
            footerRow={[
              { content: 'Total', className: 'font-bold' },
              { content: formatMoney(765393.06), className: 'text-right font-bold tabular-nums' },
            ]}
            columnWidthPercents={[74, 26]}
            bodyFontSize="clamp(9px, 1vw, 12px)"
            headerFontSize="clamp(8px, 0.95vw, 11px)"
            cellPaddingClass="px-2 py-2 sm:px-2.5 sm:py-2.5"
          />
        </section>

        <section className={`${tableSectionBox} flex min-h-0 min-w-0 flex-col`}>
          <CommonTable
            fitParentWidth
            headers={['Assets', 'Amount']}
            rows={assetsRows}
            footerRow={[
              { content: 'Total', className: 'font-bold' },
              { content: formatMoney(765393.06), className: 'text-right font-bold tabular-nums' },
            ]}
            columnWidthPercents={[74, 26]}
            bodyFontSize="clamp(9px, 1vw, 12px)"
            headerFontSize="clamp(8px, 0.95vw, 11px)"
            cellPaddingClass="px-2 py-2 sm:px-2.5 sm:py-2.5"
          />
        </section>
      </div>
    </div>
  );
}
