import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { InputField, SubInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Sl. no · Barcode · Short description · Unit · Unit cost · Unit price · Qty · Packet qty · Total cost · Toatal price · Action */
const LINE_COL_PCT = [5, 10, 15, 8, 8, 8, 7, 8, 10, 10, 11];

const offerPacketCreationTableHeaders = [
  'Sl. no',
  'Barcode',
  'Short description',
  'Unit',
  'Unit cost',
  'Unit price',
  'Qty',
  'Packet qty',
  'Total cost',
  'Toatal price',
  'Action',
];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

function addDaysIsoDate(ymd, days) {
  if (!ymd || String(ymd).split('-').length !== 3) return '';
  const [y, m, d] = String(ymd).split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function buildDummyOfferPacketLines(count) {
  const items = [
    ['8901234500012', 'Mango juice 1L'],
    ['8901234500023', 'Mineral water 500ml'],
    ['8901234500034', 'Snack mix 200g'],
    ['8901234500045', 'Cooking oil 2L'],
    ['8901234500056', 'Rice 5kg'],
  ];
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const [bc, desc] = items[i % items.length];
    const d = 1 + (i % 22);
    const m = 1 + (i % 12);
    const y = 2026;
    const discFrom = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const discTo = addDaysIsoDate(discFrom, 14);
    const pkt = 6 + (i % 8);
    const sell = (45 + (i * 13) % 120).toFixed(2);
    const disP = (2.5 + ((i * 3) % 15)).toFixed(2);
    const disSell = (Number(sell) - Number(disP)).toFixed(2);
    const pct = 5 + (i * 7) % 25;
    const qty = String(12 + (i * 11) % 180);
    const unit = i % 2 === 0 ? 'Carton' : 'Each';
    const uc = (2.5 + (i % 5)).toFixed(2);
    const up = (Number(sell) / (Number(qty) || 1)).toFixed(2);
    rows.push({
      id: `opc-${i + 1}`,
      barcode: bc,
      description: `${desc} — full line text`,
      shortDescription: desc,
      supplierName: 'Gulf Supplies LLC',
      productBrand: 'Nova',
      group: 'Grocery',
      unit,
      unitCost: uc,
      unitPrice: up,
      qty,
      packetQty: String(pkt),
      totalCost: (Number(uc) * Number(qty)).toFixed(2),
      totalPrice: sell,
      packetDescription: `${unit} / pkt ${pkt}`,
      presentQty: qty,
      sellPrice: sell,
      disPrice: disP,
      disSellPrice: disSell,
      discPct: String(pct),
      profitPct: String(pct),
      remark: i % 3 === 0 ? 'Promo bundle' : '',
      discFrom,
      discTo,
    });
  }
  return rows;
}

const DUMMY_LINES = buildDummyOfferPacketLines(20);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

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

export default function OfferPacketCreation() {
  const [tableData, setTableData] = useState(() => DUMMY_LINES.map((r) => ({ ...r })));

  /** First strip — copy into Offer packet details on APPLY */
  const [headerBarcode, setHeaderBarcode] = useState('');
  const [headerDescription, setHeaderDescription] = useState('');
  const [headerShortDescription, setHeaderShortDescription] = useState('');
  const [headerSupplierName, setHeaderSupplierName] = useState('');
  const [headerProductBrand, setHeaderProductBrand] = useState('');

  /** Offer packet details strip + table APPLY */
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [group, setGroup] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [profitPct, setProfitPct] = useState('');
  const [remark, setRemark] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1280);

  const filteredRows = tableData;

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const clearOfferPacketDetailsForm = useCallback(() => {
    setBarcode('');
    setDescription('');
    setShortDescription('');
    setSupplierName('');
    setProductBrand('');
    setGroup('');
    setUnitCost('');
    setUnitPrice('');
    setProfitPct('');
    setRemark('');
  }, []);

  const clearHeaderStripForm = useCallback(() => {
    setHeaderBarcode('');
    setHeaderDescription('');
    setHeaderShortDescription('');
    setHeaderSupplierName('');
    setHeaderProductBrand('');
  }, []);

  /** Prefill Offer packet details from the first strip */
  const handleHeaderApply = useCallback(() => {
    setBarcode(headerBarcode.trim());
    setDescription(headerDescription.trim());
    setShortDescription(headerShortDescription.trim());
    setSupplierName(headerSupplierName.trim());
    setProductBrand(headerProductBrand.trim());
    clearHeaderStripForm();
  }, [
    headerBarcode,
    headerDescription,
    headerShortDescription,
    headerSupplierName,
    headerProductBrand,
    clearHeaderStripForm,
  ]);

  const handleApplyLine = useCallback(() => {
    const qtyVal = '1';
    const pq = '0';
    const ucNum = parseAmount(unitCost);
    const upNum = parseAmount(unitPrice);
    const q = Number.parseInt(qtyVal, 10) || 1;
    const totalCostVal = (ucNum * q).toFixed(2);
    const totalPriceVal = (upNum * q).toFixed(2);
    const packetDescription = '—';
    const id = `opc-${Date.now()}`;
    setTableData((prev) => [
      {
        id,
        barcode: barcode.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        supplierName: supplierName.trim(),
        productBrand: productBrand.trim(),
        group: group.trim(),
        unit: '',
        unitCost: unitCost.trim(),
        unitPrice: unitPrice.trim(),
        profitPct: profitPct.trim(),
        remark: remark.trim(),
        qty: qtyVal,
        packetQty: pq,
        totalCost: totalCostVal,
        totalPrice: totalPriceVal,
        packetDescription,
        presentQty: qtyVal,
        sellPrice: totalPriceVal,
        disPrice: '0.00',
        disSellPrice: totalPriceVal,
        discPct: profitPct.trim() !== '' ? profitPct.trim() : '0',
        discFrom: '',
        discTo: '',
      },
      ...prev,
    ]);
    setPage(1);
    clearOfferPacketDetailsForm();
  }, [
    barcode,
    description,
    shortDescription,
    supplierName,
    productBrand,
    group,
    unitCost,
    unitPrice,
    profitPct,
    remark,
    clearOfferPacketDetailsForm,
  ]);

  const handleDeleteDocument = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Delete offer packet creation');
    setTableData([]);
    clearHeaderStripForm();
    clearOfferPacketDetailsForm();
    setPage(1);
  }, [clearHeaderStripForm, clearOfferPacketDetailsForm]);

  const handleNewDocument = useCallback(() => {
    setTableData([]);
    clearHeaderStripForm();
    clearOfferPacketDetailsForm();
    setPage(1);
  }, [clearHeaderStripForm, clearOfferPacketDetailsForm]);

  const handleViewLine = useCallback((id) => {
    setEditingRowId(null);
    setDetailRowId(id);
  }, []);

  const handleEditLine = useCallback((id) => {
    setDetailRowId(null);
    setEditingRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
  }, []);

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
    if (detailRowId && !filteredRows.some((r) => r.id === detailRowId)) {
      setDetailRowId(null);
    }
  }, [detailRowId, filteredRows]);

  useEffect(() => {
    if (!detailRowId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailRowId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailRowId]);

  const tableTotals = useMemo(() => {
    let qtySum = 0;
    let packetQtySum = 0;
    let totalCostSum = 0;
    let totalPriceSum = 0;
    for (const r of filteredRows) {
      qtySum += parseAmount(r.qty ?? r.presentQty);
      packetQtySum += parseAmount(r.packetQty);
      totalCostSum += parseAmount(r.totalCost);
      totalPriceSum += parseAmount(r.totalPrice ?? r.sellPrice);
    }
    return { qtySum, packetQtySum, totalCostSum, totalPriceSum };
  }, [filteredRows]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const displaySl = (page - 1) * pageSize + idx + 1;
      const rowIsEditing = editingRowId === r.id;

      const cellInput = (key, field, aria) =>
        rowIsEditing ? (
          <input
            key={key}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={r[field] ?? ''}
            onChange={(e) => updateLine(r.id, { [field]: e.target.value })}
            aria-label={aria}
          />
        ) : (
          r[field] ?? ''
        );

      const qtyVal = String(r.qty ?? r.presentQty ?? '');
      const totalPriceVal = String(r.totalPrice ?? r.sellPrice ?? '');

      return [
        displaySl,
        cellInput(`bc-${r.id}`, 'barcode', 'Barcode'),
        cellInput(`sd-${r.id}`, 'shortDescription', 'Short description'),
        cellInput(`un-${r.id}`, 'unit', 'Unit'),
        cellInput(`uc-${r.id}`, 'unitCost', 'Unit cost'),
        cellInput(`up-${r.id}`, 'unitPrice', 'Unit price'),
        rowIsEditing ? (
          <input
            key={`qy-${r.id}`}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={qtyVal}
            onChange={(e) => updateLine(r.id, { qty: e.target.value, presentQty: e.target.value })}
            aria-label="Qty"
          />
        ) : (
          qtyVal
        ),
        cellInput(`pkq-${r.id}`, 'packetQty', 'Packet qty'),
        cellInput(`tc-${r.id}`, 'totalCost', 'Total cost'),
        rowIsEditing ? (
          <input
            key={`tp-${r.id}`}
            type="text"
            className={`${tableCellInputClass} text-left`}
            value={totalPriceVal}
            onChange={(e) => updateLine(r.id, { totalPrice: e.target.value, sellPrice: e.target.value })}
            aria-label="Total price"
          />
        ) : (
          totalPriceVal
        ),
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className={actionIconBtn}
            aria-label="View line"
            onClick={() => handleViewLine(r.id)}
          >
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button
            type="button"
            className={actionIconBtn}
            aria-label="Edit line"
            onClick={() => handleEditLine(r.id)}
          >
            <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button
            type="button"
            className={actionIconBtn}
            aria-label="Delete line"
            onClick={() => handleDeleteLine(r.id)}
          >
            <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ];
    });
  }, [paginatedRows, page, pageSize, editingRowId, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const tableFooterRow = useMemo(
    () => [
      {
        content: (
          <div key="opc-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 3,
        className: 'align-middle font-bold',
      },
      '',
      '',
      '',
      tableTotals.qtySum.toLocaleString('en-US'),
      tableTotals.packetQtySum.toLocaleString('en-US'),
      tableTotals.totalCostSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      tableTotals.totalPriceSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '',
    ],
    [tableTotals],
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
          className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          OFFER PACKET CREATION
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${figmaToolbarBtn} font-semibold text-black`}
            onClick={handleDeleteDocument}
            aria-label="Delete offer packet creation document"
          >
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button
            type="button"
            className={primaryToolbarBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={handleNewDocument}
            aria-label="New offer packet creation"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Offer Packet Creation</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="shrink-0">
          <SubInputField label="barcode" value={headerBarcode} onChange={(e) => setHeaderBarcode(e.target.value)} placeholder="" />
        </div>
        <div className="shrink-0 min-w-0 sm:min-w-[8rem] sm:max-w-[14rem]">
          <InputField
            label="description"
            value={headerDescription}
            onChange={(e) => setHeaderDescription(e.target.value)}
            placeholder=""
            fullWidth
          />
        </div>
        <div className="shrink-0">
          <InputField
            label="short description"
            value={headerShortDescription}
            onChange={(e) => setHeaderShortDescription(e.target.value)}
            placeholder=""
            widthPx={120}
          />
        </div>
        <div className="shrink-0 min-w-0 sm:min-w-[7rem] sm:max-w-[11rem]">
          <InputField
            label="supplier name"
            value={headerSupplierName}
            onChange={(e) => setHeaderSupplierName(e.target.value)}
            placeholder=""
            fullWidth
          />
        </div>
        <div className="shrink-0 min-w-0 sm:min-w-[6rem] sm:max-w-[10rem]">
          <InputField
            label="product brand"
            value={headerProductBrand}
            onChange={(e) => setHeaderProductBrand(e.target.value)}
            placeholder=""
            fullWidth
          />
        </div>
        <button
          type="button"
          onClick={handleHeaderApply}
          className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white"
          style={{ backgroundColor: primary, borderColor: primary }}
          aria-label="Apply header fields to offer packet details"
        >
          APPLY
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-3 sm:p-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wide text-gray-700 sm:text-[11px]">Offer packet details</h3>
        <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3">
          <div className="shrink-0">
            <SubInputField label="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="" />
          </div>
          <div className="shrink-0 min-w-0 sm:min-w-[8rem] sm:max-w-[14rem]">
            <InputField label="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="" fullWidth />
          </div>
          <div className="shrink-0">
            <InputField
              label="short description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder=""
              widthPx={120}
            />
          </div>
          <div className="shrink-0 min-w-0 sm:min-w-[7rem] sm:max-w-[11rem]">
            <InputField
              label="supplier name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder=""
              fullWidth
            />
          </div>
          <div className="shrink-0 min-w-0 sm:min-w-[6rem] sm:max-w-[10rem]">
            <InputField
              label="product brand"
              value={productBrand}
              onChange={(e) => setProductBrand(e.target.value)}
              placeholder=""
              fullWidth
            />
          </div>
          <div className="shrink-0 min-w-0 sm:min-w-[6rem] sm:max-w-[9rem]">
            <InputField label="group" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="" fullWidth />
          </div>
          <div className="shrink-0">
            <SubInputField
              label="unit cost"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder=""
              inputMode="decimal"
            />
          </div>
          <div className="shrink-0">
            <SubInputField
              label="unit price"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder=""
              inputMode="decimal"
            />
          </div>
          <div className="shrink-0">
            <SubInputField
              label="profit %"
              value={profitPct}
              onChange={(e) => setProfitPct(e.target.value)}
              placeholder=""
              inputMode="decimal"
            />
          </div>
        </div>
        <div className="flex min-w-0 w-full max-w-full flex-col gap-0.5 sm:w-[20rem] sm:max-w-[20rem]">
          <label className="text-[9px] font-semibold leading-tight text-black sm:text-[11px]" style={{ color: '#374151' }}>
            remark
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            className="box-border min-h-[4.5rem] w-full max-w-full resize-y rounded border border-gray-200 bg-white px-2 py-1.5 text-[9px] outline-none focus:border-gray-400 sm:text-[10px]"
            style={{ borderColor: '#e2e8f0' }}
            placeholder=""
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleApplyLine}
            className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary }}
            aria-label="Apply offer packet line to table"
          >
            APPLY
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="offer-packet-creation-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={isCompactTable}
          truncateHeader
          truncateBody={false}
          columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[58rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={offerPacketCreationTableHeaders}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
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
          onClick={() => setDetailRowId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="opc-line-detail-title"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              onClick={() => setDetailRowId(null)}
              aria-label="Close line detail"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 id="opc-line-detail-title" className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>
              Line detail
            </h2>

            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Barcode" fullWidth readOnly value={detailRow.barcode ?? ''} />
              <InputField label="Description" fullWidth readOnly value={detailRow.description ?? ''} />
              <InputField label="Short description" fullWidth readOnly value={detailRow.shortDescription ?? ''} />
              <InputField label="Supplier name" fullWidth readOnly value={detailRow.supplierName ?? ''} />
              <InputField label="Product brand" fullWidth readOnly value={detailRow.productBrand ?? ''} />
              <InputField label="Group" fullWidth readOnly value={detailRow.group ?? ''} />
              <InputField label="Unit" fullWidth readOnly value={detailRow.unit ?? ''} />
              <InputField label="Unit cost" fullWidth readOnly value={detailRow.unitCost ?? ''} />
              <InputField label="Unit price" fullWidth readOnly value={detailRow.unitPrice ?? ''} />
              <InputField label="Qty" fullWidth readOnly value={detailRow.qty ?? detailRow.presentQty ?? ''} />
              <InputField label="Packet qty" fullWidth readOnly value={detailRow.packetQty ?? ''} />
              <InputField label="Total cost" fullWidth readOnly value={detailRow.totalCost ?? ''} />
              <InputField label="Total price" fullWidth readOnly value={detailRow.totalPrice ?? detailRow.sellPrice ?? ''} />
              <InputField label="Remark" fullWidth readOnly value={detailRow.remark ?? ''} />
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
