import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { InputField, SubInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as api from '../../../services/dealsOffers.api.js';

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const LINE_COL_PCT = [8, 12, 18, 14, 9, 10, 10, 8, 11];

const figmaOutline =
  'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function parseAmount(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
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

export default function OfferUnpackingEntry() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const tableDataRef = useRef([]);
  const prevEditRef = useRef(null);

  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [packingDetails, setPackingDetails] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [qtyOnHand, setQtyOnHand] = useState('');
  const [newQty, setNewQty] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1180);

  const filteredRows = tableData;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSaveError('');
    api.listUnpackingEntries()
      .then(({ data }) => { if (!cancelled) setTableData(data.items ?? []); })
      .catch((err) => { if (!cancelled) setSaveError(err?.response?.data?.message || 'Failed to load unpacking entries'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { tableDataRef.current = tableData; }, [tableData]);

  useEffect(() => {
    const prev = prevEditRef.current;
    prevEditRef.current = editingRowId;
    if (prev !== null && editingRowId !== prev) {
      const row = tableDataRef.current.find((r) => r.id === prev);
      if (row) {
        api.updateUnpackingEntry(row.id, {
          barcode: row.barcode,
          shortDescription: row.shortDescription,
          packingDetails: row.pktDetails,
          rate: row.rate,
          looseQty: row.looseQty,
          qtyOnHand: row.pktQty,
          amount: row.amount,
        }).catch(console.error);
      }
    }
  }, [editingRowId]);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        const nextLooseQty = parseAmount(next.looseQty);
        const nextRate = parseAmount(next.rate);
        next.amount = (nextLooseQty * nextRate).toFixed(2);
        return next;
      }),
    );
  }, []);

  const clearForm = useCallback(() => {
    setBarcode('');
    setShortDescription('');
    setPackingDetails('');
    setUnitPrice('');
    setQtyOnHand('');
    setNewQty('');
  }, []);

  const handleAddLine = useCallback(async () => {
    const safeQtyOnHand = qtyOnHand.trim() || '0';
    const safeNewQty = newQty.trim() || '0';
    const safeUnitPrice = unitPrice.trim() || '0.00';
    const amount = (parseAmount(safeNewQty) * parseAmount(safeUnitPrice)).toFixed(2);
    try {
      const { data } = await api.createUnpackingEntry({
        barcode: barcode.trim(),
        shortDescription: shortDescription.trim(),
        packingDetails: packingDetails.trim(),
        unitPrice: safeUnitPrice,
        qtyOnHand: safeQtyOnHand,
        looseQty: safeNewQty,
        amount,
      });
      setTableData((prev) => [data, ...prev]);
      setPage(1);
      clearForm();
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to add unpacking entry');
    }
  }, [barcode, shortDescription, packingDetails, unitPrice, qtyOnHand, newQty, clearForm]);

  const handleViewLine = useCallback((id) => {
    setEditingRowId(null);
    setDetailRowId(id);
  }, []);

  const handleEditLine = useCallback((id) => {
    setDetailRowId(null);
    setEditingRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteLine = useCallback(async (id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
    try {
      await api.deleteUnpackingEntry(id);
    } catch (err) {
      console.error('Delete failed', err);
    }
  }, []);

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const detailRow = useMemo(
    () => (detailRowId ? filteredRows.find((r) => r.id === detailRowId) : null),
    [detailRowId, filteredRows],
  );

  const detailSlNo = useMemo(() => {
    if (!detailRowId) return 0;
    const i = filteredRows.findIndex((r) => r.id === detailRowId);
    return i >= 0 ? i + 1 : 0;
  }, [detailRowId, filteredRows]);

  useEffect(() => {
    if (detailRowId && !filteredRows.some((r) => r.id === detailRowId)) setDetailRowId(null);
  }, [detailRowId, filteredRows]);

  useEffect(() => {
    if (!detailRowId) return;
    const onKey = (e) => { if (e.key === 'Escape') setDetailRowId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailRowId]);

  const handleDeleteDocument = useCallback(async () => {
    try {
      await api.deleteAllUnpackingEntries();
    } catch (err) {
      console.error('Delete all failed', err);
    }
    setTableData([]);
    clearForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [clearForm]);

  const handleNewDocument = useCallback(() => {
    clearForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [clearForm]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const tableTotals = useMemo(() => {
    let totalQtyPrice = 0, totalQtyOnHand = 0, totalAddQty = 0;
    for (const r of filteredRows) {
      totalQtyPrice += parseAmount(r.amount);
      totalQtyOnHand += parseAmount(r.pktQty);
      totalAddQty += parseAmount(r.looseQty);
    }
    return { totalQtyPrice, totalQtyOnHand, totalAddQty };
  }, [filteredRows]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const displaySl = (page - 1) * pageSize + idx + 1;
      const rowIsEditing = editingRowId === r.id;

      const textInput = (key, field, aria, align = 'text-left') =>
        rowIsEditing ? (
          <input key={key} type="text" className={`${tableCellInputClass} ${align}`} value={r[field] ?? ''} onChange={(e) => updateLine(r.id, { [field]: e.target.value })} aria-label={aria} />
        ) : (r[field] ?? '');

      return [
        displaySl,
        textInput(`bc-${r.id}`, 'barcode', 'Barcode'),
        textInput(`sd-${r.id}`, 'shortDescription', 'Short description'),
        textInput(`pd-${r.id}`, 'pktDetails', 'Packet details'),
        textInput(`rt-${r.id}`, 'rate', 'Unit price', 'text-center'),
        rowIsEditing ? (
          <input key={`qp-${r.id}`} type="text" className={`${tableCellInputClass} text-center bg-gray-50`} value={r.amount ?? ''} readOnly aria-label="Qty price" />
        ) : (r.amount ?? ''),
        textInput(`qoh-${r.id}`, 'pktQty', 'Qty on hand', 'text-center'),
        textInput(`aq-${r.id}`, 'looseQty', 'Add quantity', 'text-center'),
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
    });
  }, [paginatedRows, page, pageSize, editingRowId, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const tableFooterRow = useMemo(
    () => [
      { content: (<div key="oue-total" className="text-left font-bold">Total</div>), colSpan: 5, className: 'align-middle font-bold' },
      tableTotals.totalQtyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      tableTotals.totalQtyOnHand.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      tableTotals.totalAddQty.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      '',
    ],
    [tableTotals],
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
      <div className="flex min-w-0 shrink-0 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 shrink-0 flex-col gap-1">
            <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
              OFFER UNPACKING ENTRY
            </h1>
            {saveError && <p className="text-[10px] font-semibold text-red-600">{saveError}</p>}
            {loading && <p className="text-[10px] font-semibold text-gray-500">Loading…</p>}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:h-7 sm:flex-nowrap sm:gap-2">
            <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
              <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDeleteDocument} aria-label="Delete offer unpacking entry document">
              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
              Delete
            </button>
            <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNewDocument} aria-label="New offer unpacking entry">
              <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
              <span className="hidden min-[420px]:inline">New Offer Unpacking</span>
              <span className="min-[420px]:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <SubInputField label="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="" />
        </div>
        <div className="shrink-0">
          <InputField label="short description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="" widthPx={150} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Pcking details" value={packingDetails} onChange={(e) => setPackingDetails(e.target.value)} placeholder="" />
        </div>
        <div className="shrink-0">
          <SubInputField label="unit price" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="" inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="qty on hand" value={qtyOnHand} onChange={(e) => setQtyOnHand(e.target.value)} placeholder="" inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="new qty" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="" inputMode="decimal" />
        </div>
        <button type="button" onClick={handleAddLine} className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary }}>
          Add
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="offer-unpacking-entry-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={isCompactTable}
          truncateHeader
          truncateBody={editingRowId == null}
          columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[64rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={['Trans no', 'Barcode', 'Short descriotion', 'Pkd .details', 'Unit price', 'Qty price', 'Qty on hand', 'AddQty', 'Actions']}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300" aria-label="Rows per page">
                {PAGE_SIZE_OPTIONS.map((n) => (<option key={n} value={n}>{n}</option>))}
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
                  <button key={n} type="button" className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`} style={active ? { backgroundColor: primary } : undefined} onClick={() => setPage(n)} aria-label={`Page ${n}`} aria-current={active ? 'page' : undefined}>{n}</button>
                );
              })}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true" aria-labelledby="oue-line-detail-title">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={closeDetailModal} aria-label="Close line detail">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 id="oue-line-detail-title" className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Line detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Barcode" fullWidth readOnly value={detailRow.barcode ?? ''} />
              <InputField label="Short description" fullWidth readOnly value={detailRow.shortDescription ?? ''} />
              <InputField label="Pkt qty" fullWidth readOnly value={detailRow.pktQty ?? ''} />
              <InputField label="Pkt. details" fullWidth readOnly value={detailRow.pktDetails ?? ''} />
              <InputField label="Unpack qty" fullWidth readOnly value={detailRow.unpackQty ?? ''} />
              <InputField label="Loose qty" fullWidth readOnly value={detailRow.looseQty ?? ''} />
              <InputField label="Rate" fullWidth readOnly value={detailRow.rate ?? ''} />
              <InputField label="Amount" fullWidth readOnly value={detailRow.amount ?? ''} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
