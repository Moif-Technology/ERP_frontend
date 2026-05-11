import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import { InputField, SubInputField } from '../../../shared/components/ui';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import * as stockApi from '../../../services/stock.api.js';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const MOVEMENT_COL_PCT = [14, 14, 16, 15, 14, 15, 12];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-2 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center justify-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

export default function ProductMovement() {
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedMovementDateRange, setAppliedMovementDateRange] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [group, setGroup] = useState('');
  const [subGroup, setSubGroup] = useState('');
  const [subSubGroup, setSubSubGroup] = useState('');
  const [unit, setUnit] = useState('');
  const [location, setLocation] = useState('');
  const [packetDescription, setPacketDescription] = useState('');

  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isCompactTable = useViewportMaxWidth(1023);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = {
        barcode: barcode.trim() || undefined,
        group: group.trim() || undefined,
        subGroup: subGroup.trim() || undefined,
        subSubGroup: subSubGroup.trim() || undefined,
        unit: unit.trim() || undefined,
        location: location.trim() || undefined,
        packetDescription: packetDescription.trim() || undefined,
        fromDate: appliedMovementDateRange?.from
          ? appliedMovementDateRange.from.toISOString().slice(0, 10)
          : undefined,
        toDate: appliedMovementDateRange?.to
          ? appliedMovementDateRange.to.toISOString().slice(0, 10)
          : undefined,
      };
      const rows = await stockApi.getProductMovement(params);
      setTableData(rows.map((r, i) => ({
        id: `pm-${r.product_log_id ?? i}`,
        date: r.date ?? '—',
        transType: r.trans_type ?? '—',
        docNo: r.doc_no ?? String(r.doc_id ?? '—'),
        openingStock: String(r.opening_stock ?? 0),
        quantity: String(r.quantity ?? 0),
        balance: String(r.balance ?? 0),
        productName: r.product_name ?? '',
      })));
      setPage(1);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message ?? 'Failed to load movement data');
    } finally {
      setIsLoading(false);
    }
  }, [barcode, appliedMovementDateRange]);

  const totalFiltered = tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const tableBodyRows = useMemo(
    () => paginatedRows.map((r) => [
      r.date,
      <span key={`tt-${r.id}`} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold
        ${r.transType === 'IN' || r.transType === 'ASE' ? 'bg-green-100 text-green-700'
          : r.transType === 'OUT' ? 'bg-red-100 text-red-700'
          : r.transType === 'ADJ' ? 'bg-amber-100 text-amber-700'
          : r.transType === 'DMG' ? 'bg-orange-100 text-orange-700'
          : 'bg-gray-100 text-gray-700'}`}>
        {r.transType}
      </span>,
      r.docNo,
      r.openingStock,
      r.quantity,
      r.balance,
      r.productName || '—',
    ]),
    [paginatedRows],
  );

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          PRODUCT MOVEMENT
        </h1>
      </div>

      <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="grid w-full min-w-0 gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr))' }}>
          <div className="relative flex min-w-0 w-full max-w-full flex-col gap-0.5">
            <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>Select date</span>
            <button type="button" className={`${figmaToolbarBtn} box-border h-[26px] min-h-[26px] w-full`}
              onClick={() => setDateModalOpen(true)} aria-haspopup="dialog" aria-expanded={dateModalOpen} aria-label="Select date">
              <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">
                {appliedMovementDateRange
                  ? `${formatDDMMYYYY(appliedMovementDateRange.from)} – ${formatDDMMYYYY(appliedMovementDateRange.to)}`
                  : 'Select Date'}
              </span>
              <ToolbarChevron />
            </button>
            <QuotationDateRangeModal
              open={dateModalOpen} title="Movement date"
              initialRange={appliedMovementDateRange}
              onClose={() => setDateModalOpen(false)}
              onApply={(range) => setAppliedMovementDateRange(range)}
            />
          </div>

          <div className="min-w-0 w-full max-w-full">
            <SubInputField label="Barcode" fullWidth value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan / enter" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Group" fullWidth value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Group" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Sub group" fullWidth value={subGroup} onChange={(e) => setSubGroup(e.target.value)} placeholder="Sub group" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Sub sub group" fullWidth value={subSubGroup} onChange={(e) => setSubSubGroup(e.target.value)} placeholder="Sub sub group" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Unit" fullWidth value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Packet description" fullWidth value={packetDescription} onChange={(e) => setPacketDescription(e.target.value)} placeholder="Description" />
          </div>

          <div className="flex min-h-[26px] min-w-0 w-full max-w-full items-end justify-stretch sm:justify-end">
            <button type="button" onClick={handleSearch} disabled={isLoading}
              className={`${primaryToolbarBtn} box-border h-[26px] min-h-[26px] w-full sm:w-auto sm:min-w-[5.5rem]`}
              style={{ backgroundColor: primary, borderColor: primary }} aria-label="Search product movement">
              {isLoading ? 'Loading…' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{errorMsg}</p>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="product-movement-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth allowHorizontalScroll={isCompactTable}
          truncateHeader truncateBody
          columnWidthPercents={MOVEMENT_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[48rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)" cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
          headers={['Date', 'Trans type', 'Doc no', 'Opening stock', 'Quantity', 'Balance', 'Product']}
          rows={tableBodyRows}
        />

        {tableData.length === 0 && !isLoading && (
          <p className="mt-6 text-center text-[11px] text-gray-400">Enter a barcode or date range and click Search.</p>
        )}

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{rangeStart}</span>{'–'}<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300" aria-label="Rows per page">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <span className="hidden sm:block" aria-hidden />
          <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation" aria-label="Pagination">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button key={n} type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
                    onClick={() => setPage(n)} aria-label={`Page ${n}`} aria-current={active ? 'page' : undefined}>
                    {n}
                  </button>
                );
              })}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
