import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { colors, inputField } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, InputField, SubInputField, DateInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import * as stockApi from '../../../services/stock.api.js';
import StockProductPicker from '../components/StockProductPicker.jsx';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [5, 8, 12, 11, 8, 8, 8, 8, 9, 11, 12];

const ADJUSTMENT_REASONS = [
  'Damaged', 'Expired', 'Theft / loss', 'Count variance', 'System correction', 'Other',
];

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function formatDecimal2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '0.00';
  return x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function computeLineTotalValue(adjQty, pktQty) {
  const adj = parseMoneyValue(adjQty);
  const pkt = parseMoneyValue(pktQty);
  return pkt > 0 ? adj * pkt : adj;
}
function formatQtyValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return parseFloat(n.toFixed(3)).toString();
}

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn = 'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const tableCellInputClass = 'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`fixed bottom-4 right-4 z-[999] rounded px-4 py-2 text-[11px] font-semibold text-white shadow-lg ${bg}`}>
      {msg}
    </div>
  );
}

export default function StockAdjustment() {
  const { id: urlId } = useParams();
  const [tableData, setTableData] = useState([]);
  const [entryId, setEntryId] = useState(null);
  const [isPosted, setIsPosted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [pktQty, setPktQty] = useState('');
  const [pktDetails, setPktDetails] = useState('');
  const [systemQty, setSystemQty] = useState('');
  const [adjQty, setAdjQty] = useState('');
  const [enteredQty, setEnteredQty] = useState('');
  const [physicalQty, setPhysicalQty] = useState('');
  const [reason, setReason] = useState('');
  const [stockAdjNo, setStockAdjNo] = useState('');
  const [stockAdjDate, setStockAdjDate] = useState(todayISO());
  const [remark, setRemark] = useState('');
  const [productIdForBarcode, setProductIdForBarcode] = useState(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerInitialSearch, setProductPickerInitialSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1023);
  const barcodeInputRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  }, []);

  const resetForm = useCallback(() => {
    setTableData([]);
    setEntryId(null);
    setIsPosted(false);
    setBarcode(''); setShortDescription(''); setPktQty(''); setPktDetails('');
    setSystemQty(''); setAdjQty(''); setEnteredQty(''); setPhysicalQty('');
    setReason(''); setStockAdjNo(''); setStockAdjDate(todayISO()); setRemark('');
    setProductIdForBarcode(null);
    setPage(1);
  }, []);

  useEffect(() => {
    if (!urlId) { resetForm(); return; }
    stockApi.getEntry(Number(urlId)).then((data) => {
      const m = data.entry ?? data;
      setEntryId(m.entry_id ?? m.entryId);
      setIsPosted((m.post_status ?? m.postStatus) === 'posted');
      setStockAdjNo(m.entry_no ?? m.entryNo ?? '');
      setStockAdjDate(m.entry_date ? String(m.entry_date).slice(0, 10) : todayISO());
      setRemark(m.remark ?? '');
      const lines = m.lines ?? [];
      setTableData(lines.map((l, i) => ({
        id: `line-${i}`,
        barcode: l.barcode ?? '',
        shortDescription: l.short_description ?? l.shortDescription ?? '',
        pktQty: String(l.pkt_qty ?? l.pktQty ?? ''),
        packetDetails: l.pkt_details ?? l.pktDetails ?? '',
        presentQty: String(l.system_qty ?? l.systemQty ?? ''),
        adjustQty: String(l.adj_qty ?? l.adjQty ?? ''),
        enteredQty: String(l.entered_qty ?? l.enteredQty ?? ''),
        physicalQty: String(l.physical_qty ?? l.physicalQty ?? ''),
        reason: l.reason ?? '',
        productId: l.product_id ?? l.productId ?? null,
        lineTotal: String(l.line_total ?? l.lineTotal ?? ''),
      })));
    }).catch(() => {});
  }, [urlId]);

  const loadDraftEnteredQty = useCallback(async (productId) => {
    if (!productId) {
      setEnteredQty('');
      return;
    }
    try {
      const row = await stockApi.getDraftEnteredQty(productId);
      setEnteredQty(row?.physical_qty != null ? formatQtyValue(row.physical_qty) : '');
    } catch {
      setEnteredQty('');
    }
  }, []);

  const applyPickedProduct = useCallback((product) => {
    const inv = product.inventory || {};
    const nextProductId = product.productId ?? product.product_id ?? null;
    setBarcode(product.barcode ?? product.barCode ?? product.productCode ?? '');
    setShortDescription(product.shortDescription ?? product.short_name ?? product.shortName ?? product.product_name ?? product.productName ?? '');
    setPktQty(product.packQty != null ? String(product.packQty) : '');
    setPktDetails(product.packDescription ?? product.pack_description ?? product.unitName ?? '');
    setSystemQty(String(product.qtyOnHand ?? product.qty_on_hand ?? inv.qtyOnHand ?? ''));
    setProductIdForBarcode(nextProductId);
    setProductPickerOpen(false);
    void loadDraftEnteredQty(nextProductId);
  }, [loadDraftEnteredQty]);

  const openProductPicker = useCallback((prefill) => {
    setProductPickerInitialSearch(prefill != null ? String(prefill) : '');
    setProductPickerOpen(true);
  }, []);

  const closeProductPicker = useCallback(() => setProductPickerOpen(false), []);

  const handleBarcodeKeyDown = useCallback(async (e) => {
    if (e.key !== 'Enter' || !barcode.trim()) return;
    try {
      const product = await stockApi.lookupProductByBarcode(barcode.trim());
      if (product) {
        applyPickedProduct(product);
      }
    } catch {
      // silent – user can type description manually
    }
  }, [applyPickedProduct, barcode]);

  const filteredRows = tableData;

  useEffect(() => {
    if (!physicalQty.trim()) {
      setAdjQty((prev) => (prev === '' ? prev : ''));
      return;
    }
    const computedAdjQty =
      (parseMoneyValue(physicalQty) * parseMoneyValue(pktQty))
      + parseMoneyValue(enteredQty)
      - parseMoneyValue(systemQty);
    const nextAdjQty = formatQtyValue(computedAdjQty);
    setAdjQty((prev) => (prev === nextAdjQty ? prev : nextAdjQty));
  }, [enteredQty, physicalQty, pktQty, systemQty]);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleAdd = useCallback(() => {
    const id = `saj-${Date.now()}`;
    const packetDetailsStr = [pktQty, pktDetails].filter(Boolean).join(' / ') || '—';
    const physicalQtyUnits = parseMoneyValue(physicalQty) * parseMoneyValue(pktQty);
    const ltVal = computeLineTotalValue(adjQty, pktQty);
    setTableData((prev) => [
      {
        id,
        productId: productIdForBarcode,
        barcode: barcode.trim(),
        shortDescription: shortDescription.trim() || '—',
        pktQty: pktQty.trim() || '0',
        packetDetails: packetDetailsStr,
        presentQty: systemQty.trim() || '—',
        adjustQty: adjQty.trim() || '—',
        enteredQty: enteredQty.trim() || '—',
        physicalQty: formatQtyValue(physicalQtyUnits) || '—',
        reason: reason || '—',
        lineTotal: formatDecimal2(ltVal),
      },
      ...prev,
    ]);
    setPage(1);
    setBarcode(''); setShortDescription(''); setPktQty(''); setPktDetails('');
    setSystemQty(''); setAdjQty(''); setEnteredQty(''); setPhysicalQty('');
    setReason(''); setProductIdForBarcode(null);
    barcodeInputRef.current?.focus();
  }, [barcode, shortDescription, pktQty, pktDetails, systemQty, adjQty, enteredQty, physicalQty, reason, productIdForBarcode]);

  const handleViewLine = useCallback((id) => { setEditingRowId(null); setDetailRowId(id); }, []);
  const handleEditLine = useCallback((id) => { setDetailRowId(null); setEditingRowId((p) => (p === id ? null : id)); }, []);
  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((c) => (c === id ? null : c));
    setEditingRowId((c) => (c === id ? null : c));
  }, []);
  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const detailRow = useMemo(() => (detailRowId ? filteredRows.find((r) => r.id === detailRowId) : null), [detailRowId, filteredRows]);
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

  const buildPayload = useCallback(() => ({
    entryId,
    entryNo: stockAdjNo.trim() || undefined,
    docType: 'ADJ',
    entryDate: stockAdjDate || todayISO(),
    remark,
    lines: tableData.map((r) => ({
      productId: r.productId ?? null,
      barcode: r.barcode,
      shortDescription: r.shortDescription,
      pktQty: r.pktQty,
      pktDetails: r.packetDetails,
      systemQty: r.presentQty,
      adjustQty: r.adjustQty,
      enteredQty: r.enteredQty,
      physicalQty: r.physicalQty,
      reason: r.reason,
      lineTotal: r.lineTotal,
    })),
  }), [entryId, stockAdjNo, stockAdjDate, remark, tableData]);

  const handleSave = useCallback(async () => {
    if (isPosted) { showToast('Unpost before editing', 'error'); return; }
    setIsSaving(true);
    try {
      const result = await stockApi.saveEntry(buildPayload());
      setEntryId(result.entryId);
      if (!stockAdjNo) setStockAdjNo(result.entryNo ?? '');
      showToast('Saved successfully');
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, isPosted, stockAdjNo, showToast]);

  const handlePost = useCallback(async () => {
    if (!entryId) { showToast('Save the document first', 'error'); return; }
    setIsSaving(true);
    try {
      await stockApi.postEntry(entryId);
      setIsPosted(true);
      showToast('Posted — inventory updated');
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'Post failed', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [entryId, showToast]);

  const handleUnpost = useCallback(async () => {
    if (!entryId) return;
    setIsSaving(true);
    try {
      await stockApi.unpostEntry(entryId);
      setIsPosted(false);
      showToast('Unposted — inventory reversed');
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'Unpost failed', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [entryId, showToast]);

  const handleDeleteDocument = useCallback(async () => {
    if (entryId) {
      setIsSaving(true);
      try {
        await stockApi.deleteEntry(entryId);
        showToast('Deleted');
      } catch (err) {
        showToast(err?.response?.data?.message ?? 'Delete failed', 'error');
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }
    resetForm();
  }, [entryId, resetForm, showToast]);

  const handleNew = useCallback(() => resetForm(), [resetForm]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const lineTotalSum = useMemo(() => filteredRows.reduce((t, r) => t + parseMoneyValue(r.lineTotal), 0), [filteredRows]);

  const textInputCell = (r, field, aria) =>
    editingRowId === r.id ? (
      <input key={`${field}-${r.id}`} type="text" className={`${tableCellInputClass} text-left`}
        value={r[field] ?? ''} onChange={(e) => updateLine(r.id, { [field]: e.target.value })} aria-label={aria} />
    ) : (r[field] || '—');

  const qtyInputCell = (r, field, aria) =>
    editingRowId === r.id ? (
      <input key={`${field}-${r.id}`} type="text" inputMode="decimal" className={tableCellInputClass}
        value={r[field] ?? ''} onChange={(e) => updateLine(r.id, { [field]: e.target.value })} aria-label={aria} />
    ) : (r[field] || '—');

  const tableBodyRows = useMemo(() => paginatedRows.map((r, idx) => {
    const slNo = (page - 1) * pageSize + idx + 1;
    const rowIsEditing = editingRowId === r.id;
    const reasonCell = rowIsEditing ? (
      <select key={`reason-${r.id}`} className={`${tableCellInputClass} max-w-full text-left`}
        value={ADJUSTMENT_REASONS.includes(r.reason) ? r.reason : ''}
        onChange={(e) => updateLine(r.id, { reason: e.target.value })} aria-label="Reason">
        <option value="">—</option>
        {ADJUSTMENT_REASONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (r.reason || '—');
    const lineTotalCell = rowIsEditing ? (
      <input key={`lt-${r.id}`} type="text" inputMode="decimal" className={tableCellInputClass}
        value={r.lineTotal ?? ''} onChange={(e) => updateLine(r.id, { lineTotal: e.target.value })} aria-label="Line total" />
    ) : (r.lineTotal || '—');
    return [
      slNo,
      textInputCell(r, 'barcode', 'Barcode'),
      textInputCell(r, 'shortDescription', 'Short description'),
      textInputCell(r, 'packetDetails', 'Packet details'),
      qtyInputCell(r, 'presentQty', 'Present qty'),
      qtyInputCell(r, 'adjustQty', 'Adjust qty'),
      qtyInputCell(r, 'enteredQty', 'Entered Qty'),
      qtyInputCell(r, 'physicalQty', 'Physical Qty'),
      reasonCell,
      lineTotalCell,
      <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
        <button type="button" className={actionIconBtn} aria-label="View line" onClick={() => handleViewLine(r.id)}>
          <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className={actionIconBtn} aria-label="Edit line" onClick={() => handleEditLine(r.id)} disabled={isPosted}>
          <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className={actionIconBtn} aria-label="Delete line" onClick={() => handleDeleteLine(r.id)} disabled={isPosted}>
          <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ];
  }), [paginatedRows, page, pageSize, editingRowId, isPosted, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const tableFooterRow = useMemo(() => [
    { content: <div key="saj-line-total" className="text-left font-bold">Total</div>, colSpan: 9, className: 'align-middle font-bold' },
    lineTotalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    '',
  ], [lineTotalSum]);

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
          STOCK ADJUSTMENT
          {isPosted && <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">POSTED</span>}
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handlePost} disabled={isSaving || isPosted} aria-label="Post stock adjustment">
            <img src={PostIcon} alt="" className="h-3.5 w-3.5" />Post
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handleUnpost} disabled={isSaving || !isPosted} aria-label="Unpost stock adjustment">
            <img src={UnpostIcon} alt="" className="h-3.5 w-3.5" />Unpost
          </button>
          <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDeleteDocument} disabled={isSaving} aria-label="Delete stock adjustment">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />Delete
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handleSave} disabled={isSaving || isPosted} aria-label="Save stock adjustment">
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" />{isSaving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNew} aria-label="New stock adjustment">
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden sm:inline">New Stock Adjustment</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
        <div className="flex min-w-0 flex-wrap items-start gap-2 sm:gap-3">
          <div className="shrink-0">
            <SubInputField label="Stock adj. no" value={stockAdjNo} onChange={(e) => setStockAdjNo(e.target.value)} placeholder="Auto if empty" />
          </div>
          <div className="shrink-0">
            <DateInputField label="Date" value={stockAdjDate} onChange={setStockAdjDate} />
          </div>
          <div className="flex min-h-0 w-full max-w-[13rem] flex-col gap-0.5 sm:max-w-[16rem]">
            <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]" style={{ color: inputField.label.color }}>Remark</label>
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} placeholder="Remarks…"
              className="box-border min-h-[2.625rem] w-full max-w-full resize-y rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] outline-none focus:border-gray-400 sm:px-2 sm:text-[9px]"
              style={{ background: colors.input?.background ?? '#fff', borderRadius: inputField.box.borderRadius }} />
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="flex min-w-0 flex-wrap items-end gap-2 overflow-x-auto sm:gap-3">
          <div className="shrink-0">
            <SubInputField label="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleBarcodeKeyDown} onDoubleClick={() => openProductPicker(barcode || shortDescription)}
              placeholder="Scan / Enter" inputRef={barcodeInputRef} title="Double-click to pick product" />
          </div>
          <div className="shrink-0">
            <InputField label="Short description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)}
              onDoubleClick={() => openProductPicker(shortDescription || barcode)} placeholder="Double-click to pick" title="Double-click to pick product" />
          </div>
          <div className="shrink-0">
            <SubInputField label="Pkt qty" value={pktQty} onChange={(e) => setPktQty(e.target.value)} placeholder="0" type="text" inputMode="decimal" />
          </div>
          <div className="shrink-0">
            <SubInputField label="Pkt. details" value={pktDetails} onChange={(e) => setPktDetails(e.target.value)} placeholder="Details" />
          </div>
          <div className="shrink-0">
            <InputField label="System qty" value={systemQty} onChange={(e) => setSystemQty(e.target.value)} placeholder="0" type="text" inputMode="decimal" />
          </div>
          <div className="shrink-0">
            <SubInputField label="Adj. qty" value={adjQty} placeholder="Auto" type="text" inputMode="decimal" readOnly />
          </div>
          <div className="shrink-0">
            <SubInputField label="Entered qty" value={enteredQty} placeholder="Auto" type="text" inputMode="decimal" readOnly />
          </div>
          <div className="shrink-0">
            <SubInputField label="Physical qty" value={physicalQty} onChange={(e) => setPhysicalQty(e.target.value)} placeholder="0" type="text" inputMode="decimal" />
          </div>
          <div className="shrink-0">
            <DropdownInput label="Reason" value={reason} onChange={setReason} options={ADJUSTMENT_REASONS} placeholder="Select" />
          </div>
          <div className="ml-auto flex shrink-0 items-end pb-px">
            <button type="button" onClick={handleAdd} disabled={isPosted}
              className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white disabled:opacity-50"
              style={{ backgroundColor: primary, borderColor: primary }}>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="stock-adjustment-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth allowHorizontalScroll={isCompactTable} truncateHeader
          truncateBody={editingRowId == null} columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[58rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)" cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
          headers={['Sl no','Barcode','Short description','Packet details','Present qty','Adjust qty','Entered Qty','Physical Qty','Reason','Line Total','']}
          rows={tableBodyRows} footerRow={tableFooterRow}
        />

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

      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true" aria-labelledby="saj-line-detail-title">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={closeDetailModal} aria-label="Close line detail">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 id="saj-line-detail-title" className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Line detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no" fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Barcode" fullWidth readOnly value={detailRow.barcode || '—'} />
              <InputField label="Short description" fullWidth readOnly value={detailRow.shortDescription || '—'} />
              <InputField label="Packet details" fullWidth readOnly value={detailRow.packetDetails || '—'} />
              <InputField label="Present qty" fullWidth readOnly value={detailRow.presentQty || '—'} />
              <InputField label="Adjust qty" fullWidth readOnly value={detailRow.adjustQty || '—'} />
              <InputField label="Entered Qty" fullWidth readOnly value={detailRow.enteredQty || '—'} />
              <InputField label="Physical Qty" fullWidth readOnly value={detailRow.physicalQty || '—'} />
              <InputField label="Reason" fullWidth readOnly value={detailRow.reason || '—'} />
              <InputField label="Line Total" fullWidth readOnly value={detailRow.lineTotal || '—'} />
            </div>
          </div>
        </div>
      ) : null}

      <StockProductPicker
        open={productPickerOpen}
        initialSearch={productPickerInitialSearch}
        onClose={closeProductPicker}
        onPick={applyPickedProduct}
      />
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
