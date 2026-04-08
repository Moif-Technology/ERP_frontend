import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, SubInputField, DateInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';

const primary = colors.primary?.main || '#790728';

const STATIONS = ['Head office', 'Warehouse', 'Branch – North', 'Branch – South'];

const VOUCHER_TYPES = ['Journal', 'Payment', 'Receipt', 'Contra', 'Sales', 'Purchase'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Sl no · Voucher no · Voucher date · Particular · Voucher type · Debit · Credit · Station */
const LINE_COL_PCT = [6, 11, 10, 22, 12, 13, 13, 13];

const OPEN_BALANCE_DEBIT = 5000;
const OPEN_BALANCE_CREDIT = 2000;

const SAMPLE_PARTICULARS = [
  'Cash receipt – customer INV-1042',
  'Bank transfer – operating',
  'Vendor payment – utilities',
  'Sales invoice – retail',
  'Journal adjustment – rounding',
  'Petty cash reimbursement',
];

function buildDummyLedgerLines(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const base = 150 + (i * 173) % 9500 + (i % 5) * 41.2;
    const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const debit = i % 3 !== 1 ? fmt(base) : '0.00';
    const credit = i % 3 === 1 ? fmt(base) : i % 5 === 0 ? fmt(base * 0.15) : '0.00';
    const d = 1 + (i % 28);
    const m = 1 + (i % 12);
    rows.push({
      id: `ald-${i + 1}`,
      voucherNo: `${['JV', 'PV', 'RV', 'CN'][i % 4]}-2026-${String(1000 + i).slice(-4)}`,
      voucherDate: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/2026`,
      particular: SAMPLE_PARTICULARS[i % SAMPLE_PARTICULARS.length],
      voucherType: VOUCHER_TYPES[i % VOUCHER_TYPES.length],
      debit,
      credit,
      station: STATIONS[i % STATIONS.length],
    });
  }
  return rows;
}

const DUMMY_LEDGER_LINES = buildDummyLedgerLines(32);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatMoneyDisplay(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useViewportMaxWidth(maxPx) {
  const query = `(max-width: ${maxPx}px)`;
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function AccountLedgerDetails() {
  const [tableData, setTableData] = useState(() => DUMMY_LEDGER_LINES.map((r) => ({ ...r })));

  const [ledger, setLedger] = useState('');
  const [station, setStation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isCompactTable = useViewportMaxWidth(1200);

  const filteredRows = tableData;

  const handleDisplay = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Display ledger details', { ledger, station, dateFrom, dateTo });
    setTableData(buildDummyLedgerLines(32).map((r) => ({ ...r })));
    setPage(1);
  }, [ledger, station, dateFrom, dateTo]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const totalDebit = useMemo(() => {
    let sum = 0;
    for (const r of filteredRows) {
      sum += parseMoneyValue(r.debit);
    }
    return sum;
  }, [filteredRows]);

  const totalCredit = useMemo(() => {
    let sum = 0;
    for (const r of filteredRows) {
      sum += parseMoneyValue(r.credit);
    }
    return sum;
  }, [filteredRows]);

  const { closeDebit, closeCredit } = useMemo(() => {
    const net = OPEN_BALANCE_DEBIT - OPEN_BALANCE_CREDIT + totalDebit - totalCredit;
    if (net >= 0) {
      return { closeDebit: net, closeCredit: 0 };
    }
    return { closeDebit: 0, closeCredit: -net };
  }, [totalDebit, totalCredit]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      return [
        slNo,
        r.voucherNo,
        r.voucherDate,
        <span key={`p-${r.id}`} className="block w-full text-left">
          {r.particular}
        </span>,
        r.voucherType,
        r.debit,
        r.credit,
        r.station,
      ];
    });
  }, [paginatedRows, page, pageSize]);

  const tableFooterRows = useMemo(() => {
    if (totalFiltered === 0) return [];
    const labelCell = (text) => ({
      content: <span className="font-bold">{text}</span>,
      colSpan: 5,
      className: 'text-left align-middle',
    });
    return [
      [
        labelCell('Open balance'),
        formatMoneyDisplay(OPEN_BALANCE_DEBIT),
        formatMoneyDisplay(OPEN_BALANCE_CREDIT),
        '',
      ],
      [
        labelCell('Current total'),
        formatMoneyDisplay(totalDebit),
        formatMoneyDisplay(totalCredit),
        '',
      ],
      [
        labelCell('Close balance'),
        formatMoneyDisplay(closeDebit),
        formatMoneyDisplay(closeCredit),
        '',
      ],
    ];
  }, [totalFiltered, totalDebit, totalCredit, closeDebit, closeCredit]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1
          className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          LEDGER DETAILS
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="min-w-[16rem] w-full max-w-full shrink-0 sm:min-w-[22rem] sm:w-[22rem]">
          <SubInputField
            label="Ledger"
            fullWidth
            value={ledger}
            onChange={(e) => setLedger(e.target.value)}
            placeholder="Ledger name or code"
          />
        </div>
        <div className="shrink-0">
          <DropdownInput
            label="Station"
            value={station}
            onChange={setStation}
            options={STATIONS}
            placeholder="Select"
          />
        </div>
        <div className="shrink-0">
          <DateInputField label="Date From" value={dateFrom} onChange={setDateFrom} />
        </div>
        <div className="shrink-0">
          <DateInputField label="Date To" value={dateTo} onChange={setDateTo} />
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button
            type="button"
            onClick={handleDisplay}
            className={`${primaryToolbarBtn} h-[26px] min-h-[26px]`}
            style={{ backgroundColor: primary, borderColor: primary }}
            aria-label="Display"
          >
            Display
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="account-ledger-details-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={isCompactTable}
          truncateHeader
          truncateBody
          columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[56rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={[
            'Sl no',
            'Voucher no',
            'Voucher date',
            'Particular',
            'Voucher type',
            'Debit',
            'Credit',
            'Station',
          ]}
          rows={tableBodyRows}
          footerRows={tableFooterRows}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing{' '}
              <span className="text-black">{rangeStart}</span>
              {'–'}
              <span className="text-black">{rangeEnd}</span> of{' '}
              <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300"
                aria-label="Rows per page"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <span className="hidden sm:block" aria-hidden />

          <div
            className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end"
            role="navigation"
            aria-label="Pagination"
          >
            <button
              type="button"
              className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${
                      active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                    } ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
