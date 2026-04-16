import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import { DropdownInput, InputField, SubInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const SUPPLIERS = ['Gulf Supplies LLC', 'Metro Traders', 'Prime Vendors Co.', 'Alpha Dist.', 'Walk-in vendor'];
const PRODUCT_BRANDS = ['Nova', 'Vertex', 'Apex', 'Pulse', 'Zenith'];
const GROUPS = ['Grocery', 'Beverages', 'Household', 'Electronics', 'Personal care'];
const SUB_GROUPS = ['Chilled', 'Ambient', 'Frozen', 'Snacks', 'Beverages cold', 'Core range'];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

/** Sl No · Barcode · Short Description · Packet Description · Present Qty · Sell Price · Date From · Date. To · Action */
const LINE_COL_PCT = [5, 11, 14, 13, 8, 11, 12, 12, 14];

const giftVoucherTableHeaders = [
  <span key="gv-h-sl" className="inline-block w-full leading-[1.15]">
    <span className="block">Sl</span>
    <span className="block">No</span>
  </span>,
  'Barcode',
  'Short Description',
  <span key="gv-h-pkt" className="inline-block w-full leading-[1.15]">
    <span className="block">Packet</span>
    <span className="block">Description</span>
  </span>,
  <span key="gv-h-qty" className="inline-block w-full leading-[1.15]">
    <span className="block">Present</span>
    <span className="block">Qty</span>
  </span>,
  'Sell Price',
  'Date From',
  'Date. To',
  'Action',
];

function formatDateDisplay(dateValue) {
  if (!dateValue) return '—';
  const [year, month, day] = String(dateValue).split('-');
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}/${year}`;
}

function addDaysIsoDate(ymd, days) {
  if (!ymd || String(ymd).split('-').length !== 3) return '';
  const [y, m, d] = String(ymd).split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function buildDummyGiftVoucherLines(count) {
  const items = [
    ['GV-2026-001', 'Retail gift card 50'],
    ['GV-2026-002', 'Promo voucher 25'],
    ['GV-2026-003', 'Birthday bundle 100'],
    ['GV-2026-004', 'Corporate pack 500'],
    ['GV-2026-005', 'Loyalty reward 15'],
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
    rows.push({
      id: `gv-${i + 1}`,
      barcode: bc,
      shortDescription: desc,
      packetDescription: `${pkt} / ${i % 2 === 0 ? 'Carton' : 'Pack'}`,
      presentQty: String(12 + (i * 11) % 180),
      sellPrice: sell,
      disPrice: disP,
      disSellPrice: disSell,
      discPct: String(pct),
      discFrom,
      discTo,
    });
  }
  return rows;
}

const DUMMY_LINES = buildDummyGiftVoucherLines(20);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function dateToIsoYMD(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

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

export default function GiftVoucherSettings() {
  const [tableData, setTableData] = useState(() => DUMMY_LINES.map((r) => ({ ...r })));

  const [supplier, setSupplier] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [group, setGroup] = useState('');
  const [subGroup, setSubGroup] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDiscountDateRange, setAppliedDiscountDateRange] = useState(null);

  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [pktQty, setPktQty] = useState('');
  const [pktDetails, setPktDetails] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [productLines, setProductLines] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1280);

  const filteredRows = tableData;

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const clearProductLineForm = useCallback(() => {
    setBarcode('');
    setShortDescription('');
    setPktQty('');
    setPktDetails('');
    setSellingPrice('');
  }, []);

  const handleApplyLine = useCallback(() => {
    const packetDescription =
      [pktQty, pktDetails].filter((x) => String(x ?? '').trim() !== '').join(' / ') || '—';
    const sellVal = sellingPrice.trim() !== '' ? sellingPrice.trim() : '0.00';
    const id = `gv-${Date.now()}`;
    setTableData((prev) => [
      {
        id,
        barcode: barcode.trim(),
        shortDescription: shortDescription.trim(),
        packetDescription,
        presentQty: pktQty.trim() !== '' ? pktQty : '0',
        sellPrice: sellVal,
        disPrice: '0.00',
        disSellPrice: sellVal,
        discPct: '0',
        discFrom: appliedDiscountDateRange ? dateToIsoYMD(appliedDiscountDateRange.from) : '',
        discTo: appliedDiscountDateRange ? dateToIsoYMD(appliedDiscountDateRange.to) : '',
      },
      ...prev,
    ]);
    setPage(1);
    setSupplier('');
    setProductBrand('');
    setGroup('');
    setSubGroup('');
    setAppliedDiscountDateRange(null);
    clearProductLineForm();
  }, [
    appliedDiscountDateRange,
    barcode,
    shortDescription,
    pktQty,
    pktDetails,
    sellingPrice,
    clearProductLineForm,
  ]);

  const handleAddProductLine = useCallback(() => {
    const id = `pl-${Date.now()}`;
    setProductLines((prev) => [
      {
        id,
        barcode,
        shortDescription,
        pktQty: pktQty.trim() !== '' ? pktQty : '0',
        pktDetails,
        sellingPrice: sellingPrice.trim() !== '' ? sellingPrice : '0.00',
      },
      ...prev,
    ]);
    clearProductLineForm();
  }, [
    barcode,
    shortDescription,
    pktQty,
    pktDetails,
    sellingPrice,
    clearProductLineForm,
  ]);

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

  const handleDeleteDocument = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Delete gift voucher settings');
    setTableData([]);
    setSupplier('');
    setProductBrand('');
    setGroup('');
    setSubGroup('');
    setAppliedDiscountDateRange(null);
    setDateModalOpen(false);
    setProductLines([]);
    clearProductLineForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [clearProductLineForm]);

  const handleNewDocument = useCallback(() => {
    setTableData([]);
    setSupplier('');
    setProductBrand('');
    setGroup('');
    setSubGroup('');
    setAppliedDiscountDateRange(null);
    setDateModalOpen(false);
    setProductLines([]);
    clearProductLineForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [clearProductLineForm]);

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

  const tableTotals = useMemo(() => {
    let presentQty = 0;
    let sellPrice = 0;
    for (const r of filteredRows) {
      presentQty += Number.parseInt(String(r.presentQty ?? '0'), 10) || 0;
      sellPrice += parseAmount(r.sellPrice);
    }
    return { presentQty, sellPrice };
  }, [filteredRows]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const displaySl = (page - 1) * pageSize + idx + 1;
      const rowIsEditing = editingRowId === r.id;

      const textInput = (key, field, aria) =>
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

      const dateCellFrom = rowIsEditing ? (
        <input
          key={`df-${r.id}`}
          type="date"
          className={tableCellInputClass}
          value={r.discFrom || ''}
          onChange={(e) => updateLine(r.id, { discFrom: e.target.value })}
          aria-label="Date from"
        />
      ) : (
        formatDateDisplay(r.discFrom)
      );

      const dateCellTo = rowIsEditing ? (
        <input
          key={`dt-${r.id}`}
          type="date"
          className={tableCellInputClass}
          value={r.discTo || ''}
          onChange={(e) => updateLine(r.id, { discTo: e.target.value })}
          aria-label="Date to"
        />
      ) : (
        formatDateDisplay(r.discTo)
      );

      return [
        displaySl,
        textInput(`bc-${r.id}`, 'barcode', 'Barcode'),
        textInput(`sd-${r.id}`, 'shortDescription', 'Short description'),
        textInput(`pd-${r.id}`, 'packetDescription', 'Packet description'),
        textInput(`pq-${r.id}`, 'presentQty', 'Present quantity'),
        textInput(`sp-${r.id}`, 'sellPrice', 'Sell price'),
        dateCellFrom,
        dateCellTo,
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
      {
        content: (
          <div key="gv-total" className="text-left font-bold">
            Total
          </div>
        ),
        colSpan: 4,
        className: 'align-middle font-bold',
      },
      tableTotals.presentQty.toLocaleString('en-US'),
      tableTotals.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '—',
      '—',
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
          GIFT VOUCHER SETTINGS
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${figmaToolbarBtn} font-semibold text-black`}
            onClick={handleDeleteDocument}
            aria-label="Delete gift voucher settings document"
          >
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button
            type="button"
            className={primaryToolbarBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={handleNewDocument}
            aria-label="New gift voucher settings"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Gift Voucher Settings</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="shrink-0">
          <DropdownInput label="Supplier" value={supplier} onChange={setSupplier} options={SUPPLIERS} placeholder=" " />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Product Brand" value={productBrand} onChange={setProductBrand} options={PRODUCT_BRANDS} placeholder=" " />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Group" value={group} onChange={setGroup} options={GROUPS} placeholder=" " />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Sub Group" value={subGroup} onChange={setSubGroup} options={SUB_GROUPS} placeholder=" " />
        </div>
        <div className="shrink-0 min-w-[10.5rem] max-w-[15rem] sm:min-w-[11.5rem] sm:max-w-[16rem]">
          <div className="relative flex min-w-0 w-full max-w-full flex-col gap-0.5">
            <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>
              Selected date
            </span>
            <button
              type="button"
              className={`${figmaToolbarBtn} box-border h-[26px] min-h-[26px] w-full`}
              onClick={() => setDateModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={dateModalOpen}
              aria-label="Selected date"
            >
              <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">
                {appliedDiscountDateRange
                  ? `${formatDDMMYYYY(appliedDiscountDateRange.from)} – ${formatDDMMYYYY(appliedDiscountDateRange.to)}`
                  : 'Select Date'}
              </span>
              <ToolbarChevron />
            </button>
            <QuotationDateRangeModal
              open={dateModalOpen}
              title="Gift voucher validity"
              initialRange={appliedDiscountDateRange}
              onClose={() => setDateModalOpen(false)}
              onApply={(range) => setAppliedDiscountDateRange(range)}
            />
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button
            type="button"
            onClick={handleApplyLine}
            className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            APPLY
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <SubInputField label="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="" />
        </div>
        <div className="shrink-0">
          <InputField
            label="short description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder=""
            widthPx={140}
          />
        </div>
        <div className="shrink-0">
          <SubInputField label="pkt qty" value={pktQty} onChange={(e) => setPktQty(e.target.value)} placeholder="" inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="pkt. details"
            value={pktDetails}
            onChange={(e) => setPktDetails(e.target.value)}
            placeholder=""
          />
        </div>
        <div className="shrink-0">
          <SubInputField
            label="Selling price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder=""
            inputMode="decimal"
          />
        </div>
        <button
          type="button"
          onClick={handleAddProductLine}
          className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white"
          style={{ backgroundColor: primary, borderColor: primary }}
        >
          Add
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="gift-voucher-settings-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={isCompactTable}
          truncateHeader
          truncateBody={editingRowId == null}
          columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[52rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={pageSize}
          headers={giftVoucherTableHeaders}
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
          onClick={closeDetailModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gv-line-detail-title"
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
            <h2 id="gv-line-detail-title" className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>
              Gift voucher line
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Barcode" fullWidth readOnly value={detailRow.barcode ?? ''} />
              <InputField label="Short description" fullWidth readOnly value={detailRow.shortDescription ?? ''} />
              <InputField label="Packet description" fullWidth readOnly value={detailRow.packetDescription ?? ''} />
              <InputField label="Present qty" fullWidth readOnly value={detailRow.presentQty ?? ''} />
              <InputField label="Sell price" fullWidth readOnly value={detailRow.sellPrice ?? ''} />
              <InputField label="Date From" fullWidth readOnly value={formatDateDisplay(detailRow.discFrom)} />
              <InputField label="Date. To" fullWidth readOnly value={formatDateDisplay(detailRow.discTo)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
