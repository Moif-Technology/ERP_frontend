import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import { InputField, SubInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as api from '../../../services/dealsOffers.api.js';
import * as stockApi from '../../../services/stock.api.js';
import StockProductPicker from '../components/StockProductPicker.jsx';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [5, 11, 16, 12, 8, 8, 8, 8, 10, 14];

const headers = [
  <span key="de-h-sl" className="inline-block w-full leading-[1.15]"><span className="block">Sl</span><span className="block">No</span></span>,
  'Barcode',
  'Short Description',
  'Sell Price',
  'Disc.%',
  'Disc Amt',
  'Net Price',
  'Qty',
  'Date',
  'Action',
];

function formatDateDisplay(dateValue) {
  if (!dateValue) return '-';
  const [year, month, day] = String(dateValue).split('-');
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}/${year}`;
}

function dateToIsoYMD(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function parseAmount(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function round2(value) {
  return Math.round(parseAmount(value) * 100) / 100;
}

function computeDiscountFields({ sellPrice, discPct, disAmt, disSellPrice }) {
  const sp = Math.max(0, round2(sellPrice));
  let pct = Math.max(0, round2(discPct));
  let amt = Math.max(0, round2(disAmt));
  let net = Math.max(0, round2(disSellPrice));

  if (pct > 0) {
    amt = round2((sp * pct) / 100);
    net = Math.max(0, round2(sp - amt));
  } else if (amt > 0 && sp > 0) {
    net = Math.max(0, round2(sp - amt));
    pct = round2((amt / sp) * 100);
  } else if (net > 0 && sp > 0 && net <= sp) {
    amt = round2(sp - net);
    pct = round2((amt / sp) * 100);
  } else {
    amt = 0;
    pct = 0;
    net = sp;
  }

  return {
    sellPrice: sp.toFixed(2),
    discPct: pct.toFixed(2),
    disAmt: amt.toFixed(2),
    disSellPrice: net.toFixed(2),
  };
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

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn = 'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const tableCellInputClass = 'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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

export default function DiscountEntry() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDiscountDateRange, setAppliedDiscountDateRange] = useState(null);

  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [pktQty, setPktQty] = useState('');
  const [pktDetails, setPktDetails] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [discPct, setDiscPct] = useState('');
  const [disAmt, setDisAmt] = useState('');
  const [disSellPrice, setDisSellPrice] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1280);
  const barcodeInputRef = useRef(null);
  const tableDataRef = useRef([]);
  const prevEditRef = useRef(null);

  useEffect(() => { tableDataRef.current = tableData; }, [tableData]);

  useEffect(() => {
    const prev = prevEditRef.current;
    prevEditRef.current = editingRowId;
    if (prev !== null && editingRowId !== prev) {
      const row = tableDataRef.current.find((r) => r.id === prev);
      if (row) {
        const computed = computeDiscountFields(row);
        api.updateDiscountEntry(row.id, {
          barcode: row.barcode,
          shortDescription: row.shortDescription,
          packetDescription: row.packetDescription,
          presentQty: row.presentQty,
          sellPrice: computed.sellPrice,
          disPrice: computed.disAmt,
          disSellPrice: computed.disSellPrice,
          discPct: computed.discPct,
          disAmount: computed.disAmt,
          discFrom: row.discFrom,
          discTo: row.discTo,
        }).catch(console.error);
      }
    }
  }, [editingRowId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.listDiscountEntries()
      .then(({ data }) => {
        if (!cancelled) setTableData(data.items ?? []);
      })
      .catch((e) => {
        if (!cancelled) setSaveError(e?.response?.data?.message || 'Failed to load discount entries');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const clearProductLineForm = useCallback(() => {
    setSelectedProductId(null);
    setBarcode('');
    setShortDescription('');
    setPktQty('');
    setPktDetails('');
    setSellingPrice('');
    setDiscPct('');
    setDisAmt('');
    setDisSellPrice('');
  }, []);

  const applyPickedProduct = useCallback((product) => {
    setSelectedProductId(product.productId ?? null);
    setBarcode(product.barcode ?? product.barCode ?? '');
    setShortDescription(product.shortDescription ?? product.productName ?? '');
    setPktQty(product.qtyOnHand != null ? String(product.qtyOnHand) : '');
    setPktDetails(product.packDescription ?? product.packetDescription ?? '');
    const sp = product.unitPrice != null ? Number(product.unitPrice).toFixed(2) : '0.00';
    setSellingPrice(sp);
    setDisSellPrice(sp);
    setDiscPct('');
    setDisAmt('');
  }, []);

  const handleBarcodeKeyDown = useCallback(async (e) => {
    if (e.key !== 'Enter' || !barcode.trim()) return;
    try {
      const product = await stockApi.lookupProductByBarcode(barcode.trim());
      if (!product) {
        setSaveError(`No product found for barcode ${barcode.trim()}.`);
        return;
      }
      applyPickedProduct(product);
      setSaveError('');
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to lookup barcode');
    }
  }, [applyPickedProduct, barcode]);

  const applyDiscountByPercent = useCallback((value) => {
    setDiscPct(value);
    const computed = computeDiscountFields({
      sellPrice: sellingPrice,
      discPct: value,
      disAmt: 0,
      disSellPrice: 0,
    });
    setDisAmt(computed.disAmt);
    setDisSellPrice(computed.disSellPrice);
  }, [sellingPrice]);

  const applyDiscountByAmount = useCallback((value) => {
    setDisAmt(value);
    const computed = computeDiscountFields({
      sellPrice: sellingPrice,
      discPct: 0,
      disAmt: value,
      disSellPrice: 0,
    });
    setDiscPct(computed.discPct);
    setDisSellPrice(computed.disSellPrice);
  }, [sellingPrice]);

  const applyNetPrice = useCallback((value) => {
    setDisSellPrice(value);
    const computed = computeDiscountFields({
      sellPrice: sellingPrice,
      discPct: 0,
      disAmt: 0,
      disSellPrice: value,
    });
    setDiscPct(computed.discPct);
    setDisAmt(computed.disAmt);
  }, [sellingPrice]);

  const handleApplyLine = useCallback(async () => {
    if (!barcode.trim() && !shortDescription.trim()) {
      setSaveError('Pick a product or scan a barcode before adding the discount line.');
      barcodeInputRef.current?.focus();
      return;
    }

    const packetDescription = pktDetails.trim() || '-';
    const computed = computeDiscountFields({
      sellPrice: sellingPrice,
      discPct,
      disAmt,
      disSellPrice,
    });

    try {
      const { data } = await api.createDiscountEntry({
        productId: selectedProductId,
        barcode: barcode.trim(),
        shortDescription: shortDescription.trim(),
        packetDescription,
        presentQty: pktQty.trim() || '0',
        sellPrice: computed.sellPrice,
        disPrice: computed.disAmt,
        disSellPrice: computed.disSellPrice,
        discPct: computed.discPct,
        disAmount: computed.disAmt,
        discFrom: appliedDiscountDateRange ? dateToIsoYMD(appliedDiscountDateRange.from) : '',
        discTo: appliedDiscountDateRange ? dateToIsoYMD(appliedDiscountDateRange.to) : '',
      });
      setTableData((prev) => [data, ...prev]);
      setPage(1);
      setSaveError('');
      clearProductLineForm();
      setAppliedDiscountDateRange(null);
      barcodeInputRef.current?.focus();
    } catch (e) {
      setSaveError(e?.response?.data?.message || 'Failed to save discount entry');
    }
  }, [selectedProductId, barcode, shortDescription, pktDetails, pktQty, sellingPrice, discPct, disAmt, disSellPrice, appliedDiscountDateRange, clearProductLineForm]);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const next = { ...r, ...patch };
      if ('sellPrice' in patch || 'discPct' in patch || 'disAmt' in patch || 'disSellPrice' in patch) {
        const computed = computeDiscountFields(next);
        next.sellPrice = computed.sellPrice;
        next.discPct = computed.discPct;
        next.disAmt = computed.disAmt;
        next.disSellPrice = computed.disSellPrice;
      }
      return next;
    }));
  }, []);

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
      await api.deleteDiscountEntry(id);
    } catch (e) {
      console.error('Delete failed:', e);
    }
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

  const handleDeleteDocument = useCallback(async () => {
    const { hasPermission } = await import('../../../core/access/access.service.js');
    if (!hasPermission('backoffice.deals_offers.delete_bulk')) {
      console.warn('Bulk delete blocked: missing permission backoffice.deals_offers.delete_bulk');
      return;
    }
    try {
      await api.deleteAllDiscountEntries();
    } catch (e) {
      console.error('Delete all failed:', e);
    }
    setTableData([]);
    setAppliedDiscountDateRange(null);
    setDateModalOpen(false);
    clearProductLineForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [clearProductLineForm]);

  const handleNewDocument = useCallback(() => {
    setAppliedDiscountDateRange(null);
    setDateModalOpen(false);
    clearProductLineForm();
    setEditingRowId(null);
    setDetailRowId(null);
    barcodeInputRef.current?.focus();
  }, [clearProductLineForm]);

  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize) || 1);
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  }, [tableData, page, pageSize]);

  const tableTotals = useMemo(() => {
    let qty = 0;
    let discAmountTotal = 0;
    let netAmountTotal = 0;
    for (const r of tableData) {
      qty += Number.parseInt(String(r.presentQty ?? '0'), 10) || 0;
      discAmountTotal += parseAmount(r.disAmt ?? r.disPrice);
      netAmountTotal += parseAmount(r.disSellPrice);
    }
    return { qty, discAmountTotal, netAmountTotal };
  }, [tableData]);

  const tableRows = useMemo(() => paginatedRows.map((r, idx) => {
    const displaySl = (page - 1) * pageSize + idx + 1;
    const rowIsEditing = editingRowId === r.id;

    const inputCell = (key, field, aria, type = 'text') => rowIsEditing ? (
      <input
        key={key}
        type={type}
        className={`${tableCellInputClass} ${type === 'text' ? 'text-left' : ''}`}
        value={r[field] ?? ''}
        onChange={(e) => updateLine(r.id, { [field]: e.target.value })}
        aria-label={aria}
      />
    ) : (r[field] ?? '');

    const dateCell = rowIsEditing ? (
      <button key={`date-${r.id}`} type="button" className={`${figmaToolbarBtn} mx-auto h-6 min-h-6`} onClick={() => setDetailRowId(r.id)}>
        {r.discFrom && r.discTo ? `${formatDateDisplay(r.discFrom)} - ${formatDateDisplay(r.discTo)}` : 'Set date'}
      </button>
    ) : `${formatDateDisplay(r.discFrom)} - ${formatDateDisplay(r.discTo)}`;

    return [
      displaySl,
      inputCell(`bc-${r.id}`, 'barcode', 'Barcode'),
      inputCell(`sd-${r.id}`, 'shortDescription', 'Short description'),
      inputCell(`sp-${r.id}`, 'sellPrice', 'Sell price'),
      inputCell(`dp-${r.id}`, 'discPct', 'Discount percent'),
      inputCell(`da-${r.id}`, 'disAmt', 'Discount amount'),
      inputCell(`ns-${r.id}`, 'disSellPrice', 'Net price'),
      inputCell(`pq-${r.id}`, 'presentQty', 'Quantity'),
      dateCell,
      <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
        <button type="button" className={actionIconBtn} onClick={() => handleViewLine(r.id)} aria-label="View line"><img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
        <button type="button" className={actionIconBtn} onClick={() => handleEditLine(r.id)} aria-label="Edit line"><img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
        <button type="button" className={actionIconBtn} onClick={() => handleDeleteLine(r.id)} aria-label="Delete line"><img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
      </div>,
    ];
  }), [paginatedRows, page, pageSize, editingRowId, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const footerRow = useMemo(() => [
    { content: <div key="de-total" className="text-left font-bold">Total</div>, colSpan: 7, className: 'align-middle font-bold' },
    tableTotals.qty.toLocaleString('en-US'),
    '-',
    '',
  ], [tableTotals]);

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
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
            DISCOUNT ENTRY
          </h1>
          <p className="text-[10px] font-semibold text-gray-500">Use this screen for real item discounts. Set sell price, discount %, discount amount, and net price.</p>
          {saveError && <p className="text-[10px] font-semibold text-red-600">{saveError}</p>}
          {loading && <p className="text-[10px] font-semibold text-gray-500">Loading...</p>}
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDeleteDocument} aria-label="Delete discount document">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNewDocument}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Discount Entry</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <SubInputField
            label="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleBarcodeKeyDown}
            onDoubleClick={() => setProductPickerOpen(true)}
            placeholder="Scan / Enter"
            ref={barcodeInputRef}
          />
        </div>
        <div className="shrink-0">
          <InputField
            label="short description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            onDoubleClick={() => setProductPickerOpen(true)}
            placeholder="Double-click to pick"
            widthPx={170}
          />
        </div>
        <div className="shrink-0">
          <SubInputField label="qty" value={pktQty} onChange={(e) => setPktQty(e.target.value)} inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="packet details" value={pktDetails} onChange={(e) => setPktDetails(e.target.value)} />
        </div>
        <div className="shrink-0">
          <SubInputField label="sell price" value={sellingPrice} onChange={(e) => {
            setSellingPrice(e.target.value);
            const computed = computeDiscountFields({ sellPrice: e.target.value, discPct, disAmt, disSellPrice });
            setDiscPct(computed.discPct);
            setDisAmt(computed.disAmt);
            setDisSellPrice(computed.disSellPrice);
          }} inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="discount %" value={discPct} onChange={(e) => applyDiscountByPercent(e.target.value)} inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="discount amt" value={disAmt} onChange={(e) => applyDiscountByAmount(e.target.value)} inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="net price" value={disSellPrice} onChange={(e) => applyNetPrice(e.target.value)} inputMode="decimal" />
        </div>
        <div className="shrink-0 min-w-[10.5rem] max-w-[15rem] sm:min-w-[11.5rem] sm:max-w-[16rem]">
          <div className="relative flex min-w-0 w-full max-w-full flex-col gap-0.5">
            <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>Discount validity</span>
            <button type="button" className={`${figmaToolbarBtn} box-border h-[26px] min-h-[26px] w-full`} onClick={() => setDateModalOpen(true)}>
              <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">
                {appliedDiscountDateRange ? `${formatDDMMYYYY(appliedDiscountDateRange.from)} - ${formatDDMMYYYY(appliedDiscountDateRange.to)}` : 'Select Date'}
              </span>
              <ToolbarChevron />
            </button>
            <QuotationDateRangeModal open={dateModalOpen} title="Discount validity" initialRange={appliedDiscountDateRange} onClose={() => setDateModalOpen(false)} onApply={(range) => setAppliedDiscountDateRange(range)} />
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={handleApplyLine} className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary }}>
            APPLY DISCOUNT
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="discount-entry-table flex min-h-0 min-w-0 flex-1 flex-col"
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
          headers={headers}
          rows={tableRows}
          footerRow={footerRow}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{tableData.length === 0 ? 0 : (page - 1) * pageSize + 1}</span>-<span className="text-black">{Math.min(page * pageSize, tableData.length)}</span> of <span className="text-black">{tableData.length}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <span className="hidden sm:block" aria-hidden />
          <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button key={n} type="button" className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`} style={active ? { backgroundColor: primary } : undefined} onClick={() => setPage(n)}>
                    {n}
                  </button>
                );
              })}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800" onClick={closeDetailModal}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Discount detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Barcode" fullWidth readOnly value={detailRow.barcode ?? ''} />
              <InputField label="Short description" fullWidth readOnly value={detailRow.shortDescription ?? ''} />
              <InputField label="Packet description" fullWidth readOnly value={detailRow.packetDescription ?? ''} />
              <InputField label="Present qty" fullWidth readOnly value={detailRow.presentQty ?? ''} />
              <InputField label="Sell price" fullWidth readOnly value={detailRow.sellPrice ?? ''} />
              <InputField label="Discount %" fullWidth readOnly value={detailRow.discPct ?? ''} />
              <InputField label="Discount amount" fullWidth readOnly value={detailRow.disAmt ?? detailRow.disPrice ?? ''} />
              <InputField label="Net price" fullWidth readOnly value={detailRow.disSellPrice ?? ''} />
              <InputField label="Date From" fullWidth readOnly value={formatDateDisplay(detailRow.discFrom)} />
              <InputField label="Date To" fullWidth readOnly value={formatDateDisplay(detailRow.discTo)} />
            </div>
          </div>
        </div>
      ) : null}

      <StockProductPicker
        open={productPickerOpen}
        initialSearch={shortDescription || barcode}
        onClose={() => setProductPickerOpen(false)}
        onPick={(product) => {
          applyPickedProduct(product);
          setProductPickerOpen(false);
        }}
      />
    </div>
  );
}
