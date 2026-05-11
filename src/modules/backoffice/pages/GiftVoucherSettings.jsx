import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import QuotationDateRangeModal, { formatDDMMYYYY } from '../../../shared/components/ui/QuotationDateRangeModal';
import { DropdownInput, InputField, SubInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as api from '../../../services/dealsOffers.api.js';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as stockApi from '../../../services/stock.api.js';
import * as groupApi from '../../../services/group.api.js';
import * as subGroupApi from '../../../services/subGroup.api.js';
import StockProductPicker from '../components/StockProductPicker.jsx';

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [5, 11, 14, 13, 8, 11, 12, 12, 14];

const giftVoucherTableHeaders = [
  <span key="gv-h-sl" className="inline-block w-full leading-[1.15]"><span className="block">Sl</span><span className="block">No</span></span>,
  'Barcode',
  'Short Description',
  <span key="gv-h-pkt" className="inline-block w-full leading-[1.15]"><span className="block">Packet</span><span className="block">Description</span></span>,
  <span key="gv-h-qty" className="inline-block w-full leading-[1.15]"><span className="block">Present</span><span className="block">Qty</span></span>,
  'Sell Price',
  'Date From',
  'Date. To',
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

function mapApiProductToPicker(p) {
  const inv = p.inventory || {};
  return {
    productId: p.productId,
    barcode: p.barcode || p.productCode || '',
    shortDescription: (p.shortName || p.productName || '').trim() || '',
    packetDescription: p.packDescription || p.packetDescription || p.unitName || '',
    qtyOnHand: inv.qtyOnHand != null ? String(inv.qtyOnHand) : '',
    unitPrice: inv.unitPrice != null ? Number(inv.unitPrice) : 0,
    brandName: p.brandName || '',
    groupId: p.groupId != null ? String(p.groupId) : '',
    subgroupId: p.subgroupId != null ? String(p.subgroupId) : '',
    lastSupplierId: p.lastSupplierId != null ? String(p.lastSupplierId) : '',
  };
}

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

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
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const tableDataRef = useRef([]);
  const prevEditRef = useRef(null);
  const barcodeInputRef = useRef(null);

  const [suppliers, setSuppliers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subGroups, setSubGroups] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);

  const [supplierId, setSupplierId] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [groupId, setGroupId] = useState('');
  const [subGroupId, setSubGroupId] = useState('');
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [appliedDiscountDateRange, setAppliedDiscountDateRange] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [pktQty, setPktQty] = useState('');
  const [pktDetails, setPktDetails] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1280);

  const filteredRows = tableData;

  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const groupList = Array.isArray(groups) ? groups : [];
  const subGroupList = Array.isArray(subGroups) ? subGroups : [];

  const selectedSupplier = useMemo(
    () => supplierList.find((item) => String(item.supplierId) === String(supplierId)) || null,
    [supplierId, supplierList],
  );
  const selectedGroup = useMemo(
    () => groupList.find((item) => String(item.groupId) === String(groupId)) || null,
    [groupId, groupList],
  );
  const selectedSubGroup = useMemo(
    () => subGroupList.find((item) => String(item.subGroupId) === String(subGroupId)) || null,
    [subGroupId, subGroupList],
  );

  const supplierOptions = useMemo(
    () => [{ value: '', label: 'Any supplier' }, ...supplierList.map((item) => ({ value: String(item.supplierId), label: item.supplierName }))],
    [supplierList],
  );
  const productBrandOptions = useMemo(() => {
    const seen = new Set();
    const options = [{ value: '', label: 'Auto / Any brand' }];
    for (const item of productsCatalog) {
      const key = String(item.brandName || '').trim();
      if (!key || seen.has(key.toLowerCase())) continue;
      seen.add(key.toLowerCase());
      options.push({ value: key, label: key });
    }
    return options;
  }, [productsCatalog]);
  const groupOptions = useMemo(
    () => [{ value: '', label: 'Any group' }, ...groupList.map((item) => ({ value: String(item.groupId), label: item.groupDescription || item.groupCode || String(item.groupId) }))],
    [groupList],
  );
  const subGroupOptions = useMemo(
    () => [{ value: '', label: 'Any sub group' }, ...subGroupList.map((item) => ({ value: String(item.subGroupId), label: item.subGroupDescription || item.subGroupCode || String(item.subGroupId) }))],
    [subGroupList],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSaveError('');
    Promise.all([
      api.listGiftVouchers(),
      supplierEntryApi.listSuppliers({ limit: 2000 }),
      groupApi.listGroups(),
      productEntryApi.fetchProducts(),
    ])
      .then(([giftRes, supplierRes, groupRes, productRes]) => {
        if (cancelled) return;
        setTableData(giftRes.data.items ?? []);
        setSuppliers(supplierRes.data?.suppliers ?? []);
        setGroups(groupRes.data?.groups ?? []);
        setProductsCatalog((productRes.data?.products || []).map(mapApiProductToPicker));
      })
      .catch((err) => {
        if (cancelled) return;
        setSaveError(err?.response?.data?.message || 'Failed to load gift vouchers');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    subGroupApi.listSubGroups(groupId ? { groupId } : undefined)
      .then(({ data }) => {
        if (cancelled) return;
        const items = data?.subGroups ?? [];
        setSubGroups(items);
        if (subGroupId && !items.some((item) => String(item.subGroupId) === String(subGroupId))) {
          setSubGroupId('');
        }
      })
      .catch(() => {
        if (!cancelled) setSubGroups([]);
      });
    return () => { cancelled = true; };
  }, [groupId, subGroupId]);

  useEffect(() => { tableDataRef.current = tableData; }, [tableData]);

  useEffect(() => {
    const prev = prevEditRef.current;
    prevEditRef.current = editingRowId;
    if (prev !== null && editingRowId !== prev) {
      const row = tableDataRef.current.find((r) => r.id === prev);
      if (row) {
        api.updateGiftVoucher(row.id, {
          barcode: row.barcode,
          shortDescription: row.shortDescription,
          packetDescription: row.packetDescription,
          presentQty: row.presentQty,
          sellPrice: row.sellPrice,
          supplier: row.supplier,
          productBrand: row.productBrand,
          groupName: row.group,
          subGroupName: row.subGroup,
          discFrom: row.discFrom,
          discTo: row.discTo,
        }).catch(console.error);
      }
    }
  }, [editingRowId]);

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const clearProductLineForm = useCallback(() => {
    setSelectedProductId(null);
    setBarcode('');
    setShortDescription('');
    setPktQty('');
    setPktDetails('');
    setSellingPrice('');
  }, []);

  const applyPickedProduct = useCallback((product) => {
    if (!product) return;
    setSelectedProductId(product.productId ?? null);
    setBarcode(product.barcode ?? '');
    setShortDescription(product.shortDescription ?? '');
    setPktQty(product.qtyOnHand ?? '');
    setPktDetails(product.packetDescription ?? '');
    setSellingPrice(product.unitPrice != null ? String(product.unitPrice) : '');
    if (product.brandName) setProductBrand(product.brandName);
    if (product.lastSupplierId) setSupplierId(String(product.lastSupplierId));
    if (product.groupId) setGroupId(String(product.groupId));
    if (product.subgroupId) setSubGroupId(String(product.subgroupId));
    setSaveError('');
  }, []);

  const handleProductPicked = useCallback((picked) => {
    const normalized = {
      productId: picked.productId ?? null,
      barcode: picked.barcode ?? picked.barCode ?? '',
      shortDescription: picked.shortDescription ?? picked.productName ?? '',
      packetDescription: picked.packDescription ?? picked.packetDescription ?? '',
      qtyOnHand: picked.qtyOnHand != null ? String(picked.qtyOnHand) : '',
      unitPrice: picked.unitPrice != null ? Number(picked.unitPrice) : 0,
      brandName: picked.brandName ?? '',
      groupId: picked.groupId != null ? String(picked.groupId) : '',
      subgroupId: picked.subgroupId != null ? String(picked.subgroupId) : '',
      lastSupplierId: picked.lastSupplierId != null ? String(picked.lastSupplierId) : '',
    };
    applyPickedProduct(normalized);
    setProductPickerOpen(false);
  }, [applyPickedProduct]);

  const handleBarcodeKeyDown = useCallback(async (e) => {
    if (e.key !== 'Enter' || !barcode.trim()) return;
    try {
      const product = await stockApi.lookupProductByBarcode(barcode.trim());
      if (!product) {
        setSaveError(`No product found for barcode ${barcode.trim()}.`);
        return;
      }
      applyPickedProduct(mapApiProductToPicker(product));
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to lookup barcode');
    }
  }, [applyPickedProduct, barcode]);

  const handleApplyLine = useCallback(async () => {
    const packetDescription = pktDetails.trim() || '-';
    const sellVal = sellingPrice.trim() !== '' ? sellingPrice.trim() : '0.00';
    const supplierName = selectedSupplier?.supplierName || '';
    const groupName = selectedGroup?.groupDescription || selectedGroup?.groupCode || '';
    const subGroupName = selectedSubGroup?.subGroupDescription || selectedSubGroup?.subGroupCode || '';

    if (!barcode.trim() && !shortDescription.trim()) {
      setSaveError('Pick a product or scan a barcode before adding the gift voucher line.');
      barcodeInputRef.current?.focus();
      return;
    }

    try {
      const { data } = await api.createGiftVoucher({
        productId: selectedProductId,
        barcode: barcode.trim(),
        shortDescription: shortDescription.trim(),
        packetDescription,
        presentQty: pktQty.trim() || '0',
        sellPrice: sellVal,
        supplier: supplierName,
        productBrand: productBrand.trim(),
        groupName,
        subGroupName,
        discFrom: appliedDiscountDateRange ? dateToIsoYMD(appliedDiscountDateRange.from) : '',
        discTo: appliedDiscountDateRange ? dateToIsoYMD(appliedDiscountDateRange.to) : '',
      });
      setTableData((prev) => [data, ...prev]);
      setPage(1);
      setSupplierId('');
      setProductBrand('');
      setGroupId('');
      setSubGroupId('');
      setAppliedDiscountDateRange(null);
      setSaveError('');
      clearProductLineForm();
      barcodeInputRef.current?.focus();
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to create gift voucher');
    }
  }, [
    appliedDiscountDateRange,
    barcode,
    shortDescription,
    pktQty,
    pktDetails,
    sellingPrice,
    selectedProductId,
    selectedSupplier,
    selectedGroup,
    selectedSubGroup,
    productBrand,
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

  const handleDeleteLine = useCallback(async (id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((cur) => (cur === id ? null : cur));
    setEditingRowId((cur) => (cur === id ? null : cur));
    try {
      await api.deleteGiftVoucher(id);
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
      await api.deleteAllGiftVouchers();
    } catch (err) {
      console.error('Delete all failed', err);
    }
    setTableData([]);
    setSupplierId('');
    setProductBrand('');
    setGroupId('');
    setSubGroupId('');
    setAppliedDiscountDateRange(null);
    setDateModalOpen(false);
    setSaveError('');
    clearProductLineForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
  }, [clearProductLineForm]);

  const handleNewDocument = useCallback(() => {
    setSupplierId('');
    setProductBrand('');
    setGroupId('');
    setSubGroupId('');
    setAppliedDiscountDateRange(null);
    setDateModalOpen(false);
    setSaveError('');
    clearProductLineForm();
    setPage(1);
    setEditingRowId(null);
    setDetailRowId(null);
    barcodeInputRef.current?.focus();
  }, [clearProductLineForm]);

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
          <input key={key} type="text" className={`${tableCellInputClass} text-left`} value={r[field] ?? ''} onChange={(e) => updateLine(r.id, { [field]: e.target.value })} aria-label={aria} />
        ) : (r[field] ?? '');

      const dateCellFrom = rowIsEditing ? (
        <input key={`df-${r.id}`} type="date" className={tableCellInputClass} value={r.discFrom || ''} onChange={(e) => updateLine(r.id, { discFrom: e.target.value })} aria-label="Date from" />
      ) : formatDateDisplay(r.discFrom);

      const dateCellTo = rowIsEditing ? (
        <input key={`dt-${r.id}`} type="date" className={tableCellInputClass} value={r.discTo || ''} onChange={(e) => updateLine(r.id, { discTo: e.target.value })} aria-label="Date to" />
      ) : formatDateDisplay(r.discTo);

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
      { content: (<div key="gv-total" className="text-left font-bold">Total</div>), colSpan: 4, className: 'align-middle font-bold' },
      tableTotals.presentQty.toLocaleString('en-US'),
      tableTotals.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      '-',
      '-',
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
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <h1 className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
            GIFT VOUCHER SETTINGS
          </h1>
          {saveError && <p className="text-[10px] font-semibold text-red-600">{saveError}</p>}
          {loading && <p className="text-[10px] font-semibold text-gray-500">Loading...</p>}
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDeleteDocument} aria-label="Delete gift voucher settings document">
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" />
            Delete
          </button>
          <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNewDocument} aria-label="New gift voucher settings">
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="hidden min-[420px]:inline">New Gift Voucher Settings</span>
            <span className="min-[420px]:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="shrink-0">
          <DropdownInput label="Supplier" value={supplierId} onChange={setSupplierId} options={supplierOptions} />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Product Brand" value={productBrand} onChange={setProductBrand} options={productBrandOptions} />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Group" value={groupId} onChange={(value) => { setGroupId(value); setSubGroupId(''); }} options={groupOptions} />
        </div>
        <div className="shrink-0">
          <DropdownInput label="Sub Group" value={subGroupId} onChange={setSubGroupId} options={subGroupOptions} />
        </div>
        <div className="shrink-0 min-w-[10.5rem] max-w-[15rem] sm:min-w-[11.5rem] sm:max-w-[16rem]">
          <div className="relative flex min-w-0 w-full max-w-full flex-col gap-0.5">
            <span className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>Selected date</span>
            <button type="button" className={`${figmaToolbarBtn} box-border h-[26px] min-h-[26px] w-full`} onClick={() => setDateModalOpen(true)} aria-haspopup="dialog" aria-expanded={dateModalOpen} aria-label="Selected date">
              <img src={CalendarIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">
                {appliedDiscountDateRange
                  ? `${formatDDMMYYYY(appliedDiscountDateRange.from)} - ${formatDDMMYYYY(appliedDiscountDateRange.to)}`
                  : 'Select Date'}
              </span>
              <ToolbarChevron />
            </button>
            <QuotationDateRangeModal open={dateModalOpen} title="Gift voucher validity" initialRange={appliedDiscountDateRange} onClose={() => setDateModalOpen(false)} onApply={(range) => setAppliedDiscountDateRange(range)} />
          </div>
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
            title="Press Enter to lookup or double-click to pick product"
          />
        </div>
        <div className="shrink-0">
          <InputField
            label="short description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            onDoubleClick={() => setProductPickerOpen(true)}
            placeholder="Double-click to pick"
            widthPx={160}
            title="Double-click to pick product"
          />
        </div>
        <div className="shrink-0">
          <SubInputField label="pkt qty" value={pktQty} onChange={(e) => setPktQty(e.target.value)} placeholder="" inputMode="decimal" />
        </div>
        <div className="shrink-0">
          <SubInputField label="pkt. details" value={pktDetails} onChange={(e) => setPktDetails(e.target.value)} placeholder="" />
        </div>
        <div className="shrink-0">
          <SubInputField label="Selling price" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="" inputMode="decimal" />
        </div>
        <button type="button" onClick={handleApplyLine} className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 py-0 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary }}>
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
              Showing <span className="text-black">{rangeStart}</span>-<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true" aria-labelledby="gv-line-detail-title">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={closeDetailModal} aria-label="Close line detail">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 id="gv-line-detail-title" className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Gift voucher line</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Sl no." fullWidth readOnly value={String(detailSlNo)} />
              <InputField label="Barcode" fullWidth readOnly value={detailRow.barcode ?? ''} />
              <InputField label="Short description" fullWidth readOnly value={detailRow.shortDescription ?? ''} />
              <InputField label="Packet description" fullWidth readOnly value={detailRow.packetDescription ?? ''} />
              <InputField label="Present qty" fullWidth readOnly value={detailRow.presentQty ?? ''} />
              <InputField label="Sell price" fullWidth readOnly value={detailRow.sellPrice ?? ''} />
              <InputField label="Supplier" fullWidth readOnly value={detailRow.supplier ?? ''} />
              <InputField label="Product Brand" fullWidth readOnly value={detailRow.productBrand ?? ''} />
              <InputField label="Group" fullWidth readOnly value={detailRow.group ?? ''} />
              <InputField label="Sub Group" fullWidth readOnly value={detailRow.subGroup ?? ''} />
              <InputField label="Date From" fullWidth readOnly value={formatDateDisplay(detailRow.discFrom)} />
              <InputField label="Date. To" fullWidth readOnly value={formatDateDisplay(detailRow.discTo)} />
            </div>
          </div>
        </div>
      ) : null}

      <StockProductPicker
        open={productPickerOpen}
        initialSearch={shortDescription || barcode}
        onClose={() => setProductPickerOpen(false)}
        onPick={handleProductPicked}
      />
    </div>
  );
}
