import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { InputField, SelectDateButton, SubInputField } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Date, Trans type, Doc no, Opening stock, Quantity, Balance, Actions */
const MOVEMENT_COL_PCT = [14, 14, 16, 15, 14, 15, 12];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-2 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function buildDummyMovementRows(count) {
  const types = ['IN', 'OUT', 'ADJ', 'TRF'];
  const rows = [];
  const base = new Date(2026, 3, 1);
  for (let i = 0; i < count; i += 1) {
    const dt = new Date(base);
    dt.setDate(base.getDate() + (i % 12));
    const y = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    const opening = 100 + (i * 37) % 800;
    const qty = 5 + (i * 11) % 120;
    const balance = opening + (types[i % types.length] === 'OUT' ? -qty : qty);
    rows.push({
      id: `pm-${i + 1}`,
      date: `${da}/${mo}/${y}`,
      transType: types[i % types.length],
      docNo: `PM-${String(2400 + i).padStart(5, '0')}`,
      openingStock: String(opening),
      quantity: String(qty),
      balance: String(balance),
    });
  }
  return rows;
}

const DUMMY_MOVEMENT_ROWS = buildDummyMovementRows(22);

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
  const [appliedMovementDateRange, setAppliedMovementDateRange] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [group, setGroup] = useState('');
  const [subGroup, setSubGroup] = useState('');
  const [subSubGroup, setSubSubGroup] = useState('');
  const [unit, setUnit] = useState('');
  const [location, setLocation] = useState('');
  const [packetDescription, setPacketDescription] = useState('');

  const [tableData, setTableData] = useState(() => DUMMY_MOVEMENT_ROWS.map((r) => ({ ...r })));

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1023);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  const handleViewLine = useCallback((id) => {
    setEditingRowId(null);
    setDetailRowId(id);
  }, []);

  const handleEditLine = useCallback((id) => {
    setDetailRowId(null);
    setEditingRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((row) => row.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
  }, []);

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const detailRow = useMemo(
    () => (detailRowId ? tableData.find((r) => r.id === detailRowId) : null),
    [detailRowId, tableData],
  );

  const detailSlNo = useMemo(() => {
    if (!detailRowId) return 0;
    const i = tableData.findIndex((r) => r.id === detailRowId);
    return i >= 0 ? i + 1 : 0;
  }, [detailRowId, tableData]);

  useEffect(() => {
    if (detailRowId && !tableData.some((r) => r.id === detailRowId)) {
      setDetailRowId(null);
    }
  }, [detailRowId, tableData]);

  useEffect(() => {
    if (!detailRowId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailRowId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailRowId]);

  const handleSave = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Save product movement', {
      movementDateRange: appliedMovementDateRange,
      barcode,
      group,
      subGroup,
      subSubGroup,
      unit,
      location,
      packetDescription,
    });
  }, [appliedMovementDateRange, barcode, group, subGroup, subSubGroup, unit, location, packetDescription]);

  const totalFiltered = tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const tableBodyRows = useMemo(
    () =>
      paginatedRows.map((r) => {
        const rowEdit = editingRowId === r.id;
        const dateCell = rowEdit ? (
          <input
            key={`d-${r.id}`}
            type="text"
            className={tableCellInputClass}
            value={r.date}
            onChange={(e) => updateLine(r.id, { date: e.target.value })}
            aria-label="Date"
          />
        ) : (
          r.date
        );
        const typeCell = rowEdit ? (
          <input
            key={`t-${r.id}`}
            type="text"
            className={tableCellInputClass}
            value={r.transType}
            onChange={(e) => updateLine(r.id, { transType: e.target.value })}
            aria-label="Trans type"
          />
        ) : (
          r.transType
        );
        const docCell = rowEdit ? (
          <input
            key={`n-${r.id}`}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={r.docNo}
            onChange={(e) => updateLine(r.id, { docNo: e.target.value })}
            aria-label="Doc no"
          />
        ) : (
          r.docNo
        );
        const openingCell = rowEdit ? (
          <input
            key={`o-${r.id}`}
            type="text"
            inputMode="decimal"
            className={tableCellInputClass}
            value={r.openingStock}
            onChange={(e) => updateLine(r.id, { openingStock: e.target.value })}
            aria-label="Opening stock"
          />
        ) : (
          r.openingStock
        );
        const qtyCell = rowEdit ? (
          <input
            key={`q-${r.id}`}
            type="text"
            inputMode="decimal"
            className={tableCellInputClass}
            value={r.quantity}
            onChange={(e) => updateLine(r.id, { quantity: e.target.value })}
            aria-label="Quantity"
          />
        ) : (
          r.quantity
        );
        const balCell = rowEdit ? (
          <input
            key={`b-${r.id}`}
            type="text"
            inputMode="decimal"
            className={tableCellInputClass}
            value={r.balance}
            onChange={(e) => updateLine(r.id, { balance: e.target.value })}
            aria-label="Balance"
          />
        ) : (
          r.balance
        );
        return [
          dateCell,
          typeCell,
          docCell,
          openingCell,
          qtyCell,
          balCell,
          <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
            <button type="button" className={actionIconBtn} aria-label="View line" onClick={() => handleViewLine(r.id)}>
              <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            <button type="button" className={actionIconBtn} aria-label="Edit line" onClick={() => handleEditLine(r.id)}>
              <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            <button type="button" className={actionIconBtn} aria-label="Delete line" onClick={() => handleDeleteLine(r.id)}>
              <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>,
        ];
      }),
    [paginatedRows, editingRowId, updateLine, handleViewLine, handleEditLine, handleDeleteLine],
  );

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
          PRODUCT MOVEMENT
        </h1>
      </div>

      <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div
          className="grid w-full min-w-0 gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr))',
          }}
        >
          <SelectDateButton
            label="Select date"
            title="Movement date"
            value={appliedMovementDateRange}
            onApply={setAppliedMovementDateRange}
            separator=" – "
            buttonClassName={figmaToolbarBtn}
          />

          <div className="min-w-0 w-full max-w-full">
            <SubInputField
              label="Barcode"
              fullWidth
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan / enter"
            />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Group" fullWidth value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Group" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField
              label="Sub group"
              fullWidth
              value={subGroup}
              onChange={(e) => setSubGroup(e.target.value)}
              placeholder="Sub group"
            />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField
              label="Sub sub group"
              fullWidth
              value={subSubGroup}
              onChange={(e) => setSubSubGroup(e.target.value)}
              placeholder="Sub sub group"
            />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField label="Unit" fullWidth value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField
              label="Location"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
          </div>
          <div className="min-w-0 w-full max-w-full">
            <InputField
              label="Packet description"
              fullWidth
              value={packetDescription}
              onChange={(e) => setPacketDescription(e.target.value)}
              placeholder="Description"
            />
          </div>

          <div className="flex min-h-[26px] min-w-0 w-full max-w-full items-end justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={handleSave}
              className={`${primaryToolbarBtn} box-border h-[26px] min-h-[26px] w-full sm:w-auto sm:min-w-[5.5rem]`}
              style={{ backgroundColor: primary, borderColor: primary }}
              aria-label="Save product movement"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="product-movement-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={isCompactTable}
          truncateHeader
          truncateBody={editingRowId == null}
          columnWidthPercents={MOVEMENT_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[48rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={['Date', 'Trans type', 'Doc no', 'Opening stock', 'Quantity', 'Balance', '']}
          rows={tableBodyRows}
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

      {detailRowId && detailRow ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
          onClick={closeDetailModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-line-detail-title"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              onClick={closeDetailModal}
              aria-label="Close line detail"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <h2
              id="pm-line-detail-title"
              className="pr-10 text-sm font-bold sm:text-base"
              style={{ color: primary }}
            >
              Movement line
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no" fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Date" fullWidth readOnly value={detailRow.date || '—'} />
              <InputField label="Trans type" fullWidth readOnly value={detailRow.transType || '—'} />
              <InputField label="Doc no" fullWidth readOnly value={detailRow.docNo || '—'} />
              <InputField label="Opening stock" fullWidth readOnly value={detailRow.openingStock || '—'} />
              <InputField label="Quantity" fullWidth readOnly value={detailRow.quantity || '—'} />
              <InputField label="Balance" fullWidth readOnly value={detailRow.balance || '—'} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
