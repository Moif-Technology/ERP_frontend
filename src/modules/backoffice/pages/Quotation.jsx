/**
 * Quotation screen – Modern, readable layout. Effective space use.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { AppActionButton, InputField, SubInputField, CommonTable, Switch, ConfirmDialog, DropdownInput, TableTotalsBar, TabsBar, DatePickerInput } from '../../../shared/components/ui';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as customerEntryApi from '../../../services/customerEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as quotationEntryApi from '../../../services/quotationEntry.api.js';
import ProformaIcon from '../../../shared/assets/icons/proforma.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DuplicateIcon from '../../../shared/assets/icons/list2.svg';

const primary = colors.primary?.main || colors.primary?.DEFAULT || '#790728';
const primaryHover = colors.primary?.[50] || '#F2E6EA';

/** Tint monochrome SVG `<img>` icons to primary maroon (#790728). */
const iconFilterPrimary =
  'invert(13%) sepia(88%) saturate(3223%) hue-rotate(350deg) brightness(92%) contrast(105%)';

function PlusIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SaveIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden>
      <path d="M5 21h14" strokeLinecap="round" />
      <path
        d="M19 21V7.8a1 1 0 0 0-.3-.7l-2.8-2.8a1 1 0 0 0-.7-.3H7a2 2 0 0 0-2 2V21"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4v5h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function mapApiProductToPicker(p) {
  const inv = p.inventory || {};
  return {
    productId: p.productId,
    shortDescription: (p.shortName || p.productName || '').trim() || '—',
    unitPrice: inv.unitPrice != null ? Number(inv.unitPrice) : 0,
    barCode: p.barcode || p.productCode || '',
    unit: p.unitName || '',
    locationCode: inv.locationCode || '',
    qtyOnHand: inv.qtyOnHand,
  };
}

function toDateInputValue(value, fallback = '') {
  if (!value) return fallback;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return fallback;
  return dt.toISOString().slice(0, 10);
}

function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapQuotationLineToItem(line, index) {
  const qty = toNum(line.qty, 0);
  const unitPrice = toNum(line.unitPrice, 0);
  const discAmt = toNum(line.itemDiscount, 0);
  const subTotal = toNum(line.subtotalAmount, Math.round((qty * unitPrice - discAmt) * 100) / 100);
  const taxAmount = toNum(line.tax1Amount, 0);
  return {
    slNo: index + 1,
    productId: line.productId,
    ownRefNo: line.barcode || '',
    productCode: line.barcode || '',
    shortDescription: line.productDescription || '',
    location: line.locationCode || '',
    unit: line.unitName || '',
    qty,
    unitPrice,
    discPct: 0,
    discAmt,
    subTotal,
    taxPct: toNum(line.tax1Rate, 0),
    taxAmount,
    lineTotal: toNum(line.lineTotal, subTotal + taxAmount),
    origin: line.originName || '',
    stockStatus: line.stockStatus || '',
  };
}

export default function Quotation() {
  const [searchParams] = useSearchParams();
  const editQuotationId = searchParams.get('quotationId');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [customersRows, setCustomersRows] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [quotationNo, setQuotationNo] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [custRefNo, setCustRefNo] = useState('');
  const [custRefDate, setCustRefDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [ownRefNo, setOwnRefNo] = useState('');
  const [productCode, setProductCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discPct, setDiscPct] = useState(0);
  const [discAmt, setDiscAmt] = useState(0);
  const [items, setItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const [quotationTerms, setQuotationTerms] = useState('');
  const [saveTerms, setSaveTerms] = useState(false);
  const [printLocn, setPrintLocn] = useState(false);
  const [printOwnRefNo, setPrintOwnRefNo] = useState(true);
  const [printOtherFormat, setPrintOtherFormat] = useState(false);

  const [productInfo, setProductInfo] = useState({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
  const [attachments, setAttachments] = useState(false);
  const [lineItemDetail, setLineItemDetail] = useState(null);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState(null);
  const [rightTab, setRightTab] = useState('summary');

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.branchId),
        label: `${b.branchCode} - ${b.branchName}`,
      })),
    [branches],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRefs(true);
      try {
        const sess = getSessionUser();
        const defaultBr = sess?.stationId != null ? String(sess.stationId) : '';
        const [{ data: brData }, { data: custData }] = await Promise.all([
          staffEntryApi.fetchStaffBranches(),
          customerEntryApi.listCustomers({ limit: 1000 }),
        ]);
        if (cancelled) return;
        setBranches(brData?.branches || []);
        setCustomersRows(custData?.customers || []);
        setBranchId((prev) => prev || defaultBr || (brData?.branches?.[0] ? String(brData.branches[0].branchId) : ''));
      } catch {
        if (!cancelled) {
          setBranches([]);
          setCustomersRows([]);
        }
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!branchId) {
      setProductsCatalog([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await productEntryApi.fetchProducts(Number(branchId));
        if (cancelled) return;
        const list = (data?.products || []).map(mapApiProductToPicker);
        setProductsCatalog(list);
      } catch {
        if (!cancelled) setProductsCatalog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  useEffect(() => {
    if (!editQuotationId || loadingRefs) return undefined;
    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      setSaveError('');
      setSuccessMsg('');
      try {
        const { data } = await quotationEntryApi.getQuotation(editQuotationId);
        if (cancelled) return;
        const q = data?.quotation;
        if (!q) {
          setSaveError('Quotation response was empty.');
          return;
        }
        setLineItemDetail(null);
        setQuotationNo(q.quotationNo || '');
        setQuotationDate(toDateInputValue(q.quotationDate, new Date().toISOString().slice(0, 10)));
        setCustRefNo(q.customerRefNo || '');
        setCustRefDate(toDateInputValue(q.customerRefDate, ''));
        setBranchId(q.branchId != null ? String(q.branchId) : '');
        setCustomerId(q.customerId != null ? String(q.customerId) : '');
        setCustomerAddress(q.customerAddress || '');
        setContactPerson(q.contactPerson || '');
        setDiscountAmount(toNum(q.discountAmount, 0));
        setRoundOff(toNum(q.roundOffAdjustment, 0));
        setQuotationTerms(q.quotationTerms || q.remarks || '');
        setItems((data?.lines || []).map(mapQuotationLineToItem));
        setSelectedProductId(null);
        setProductSearch('');
        setProductResults([]);
        setShowSearchDropdown(false);
        setSuccessMsg(`Loaded quotation ${q.quotationNo || editQuotationId} for editing.`);
      } catch (err) {
        if (!cancelled) setSaveError(err.response?.data?.message || 'Could not load quotation for editing.');
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editQuotationId, loadingRefs]);

  const orDash = (v) => (v != null && v !== '' ? String(v) : '—');

  const getFilteredProducts = (query) => {
    if (!branchId) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return productsCatalog.filter((p) => {
      const shortDesc = String(p.shortDescription ?? '').toLowerCase();
      const code = String(p.barCode ?? '').toLowerCase();
      const unit = String(p.unit ?? '').toLowerCase();
      return shortDesc.includes(q) || code.includes(q) || unit.includes(q);
    });
  };

  const handleProductSearch = () => {
    const term = productSearch.trim();
    const filtered = getFilteredProducts(term);
    setProductResults(filtered);
    setShowSearchDropdown(true);
  };

  const selectProduct = (p) => {
    setSelectedProductId(p.productId);
    setOwnRefNo(p.barCode ?? '');
    setProductCode(p.barCode ?? '');
    setShortDescription(p.shortDescription ?? '');
    setUnit(p.unit ?? '');
    setUnitPrice(Number(p.unitPrice ?? 0));
    setLocation(p.locationCode || '');
    const stock = p.qtyOnHand != null ? String(p.qtyOnHand) : '';
    setProductInfo({
      lastCost: '',
      origin: '',
      minPrice: '',
      stock,
      loc: p.locationCode || '',
    });
    setProductResults([]);
    setShowSearchDropdown(false);
    setProductSearch('');
  };

  const addItem = () => {
    if (!selectedProductId || !shortDescription || qty <= 0) return;
    const sub = Math.round((qty * unitPrice - discAmt) * 100) / 100;
    const tax = 0;
    const lineTotal = sub;
    const newItem = {
      productId: selectedProductId,
      ownRefNo,
      productCode,
      shortDescription,
      location: location || productInfo.loc,
      unit,
      qty,
      unitPrice,
      discPct,
      discAmt,
      subTotal: sub,
      taxPct: 0,
      taxAmount: tax,
      lineTotal,
      origin: productInfo.origin,
      stockStatus: productInfo.stock,
    };

    // Add to the TOP and re-number the table rows.
    setItems((prev) => [
      { ...newItem, slNo: 1 },
      ...prev.map((r, i) => ({ ...r, slNo: i + 2 })),
    ]);
    setQty(1);
    setUnitPrice(0);
    setDiscPct(0);
    setDiscAmt(0);
    setSelectedProductId(null);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, slNo: i + 1 })));
  };

  const handleSaveQuotation = async () => {
    setSaveError('');
    setSuccessMsg('');
    if (!branchId) {
      setSaveError('Select a branch.');
      return;
    }
    if (items.length === 0) {
      setSaveError('Add at least one line item.');
      return;
    }
    const missingPid = items.some((r) => !r.productId);
    if (missingPid) {
      setSaveError('Each line must have a product (use search to pick a product).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        branchId: Number(branchId),
        quotationDate,
        customerRefNo: custRefNo.trim() || undefined,
        customerRefDate: custRefDate || undefined,
        customerId: customerId ? Number(customerId) : undefined,
        customerAddress: customerAddress.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        discountAmount,
        roundOff: Number(roundOff) || 0,
        quotationTerms: quotationTerms.trim() || undefined,
        lines: items.map((r) => ({
          productId: r.productId,
          barcode: r.ownRefNo || r.productCode || undefined,
          description: r.shortDescription,
          unitName: r.unit || undefined,
          qty: r.qty,
          unitPrice: r.unitPrice,
          itemDiscount: r.discAmt ?? 0,
          locationCode: r.location || undefined,
          originName: r.origin || undefined,
          stockStatus: r.stockStatus || undefined,
        })),
      };
      const { data } = await quotationEntryApi.createQuotation(payload);
      const q = data.quotation;
      setQuotationNo(q.quotationNo || '');
      setSuccessMsg(`Saved quotation ${q.quotationNo} (id ${q.quotationId}).`);
      setLineItemDetail(null);
      setItems([]);
      setDiscountAmount(0);
      setRoundOff(0);
      setCustRefNo('');
      setCustRefDate(new Date().toISOString().slice(0, 10));
      setSelectedProductId(null);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save quotation.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuotation = () => {
    setLineItemDetail(null);
    setQuotationNo('');
    setQuotationDate(new Date().toISOString().slice(0, 10));
    setCustRefNo('');
    setCustRefDate(new Date().toISOString().slice(0, 10));
    setCustomerId('');
    setCustomerAddress('');
    setContactPerson('');
    setProductSearch('');
    setProductResults([]);
    setShowSearchDropdown(false);
    setOwnRefNo('');
    setProductCode('');
    setShortDescription('');
    setLocation('');
    setUnit('');
    setQty(1);
    setUnitPrice(0);
    setDiscPct(0);
    setDiscAmt(0);
    setItems([]);
    setDiscountAmount(0);
    setRoundOff(0);
    setQuotationTerms('');
    setSaveTerms(false);
    setPrintLocn(false);
    setPrintOwnRefNo(true);
    setPrintOtherFormat(false);
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
    setAttachments(false);
    setSelectedProductId(null);
    setSaveError('');
    setSuccessMsg('');
  };

  useEffect(() => {
    let sub = 0;
    let tax = 0;
    items.forEach((r) => {
      sub += r.subTotal;
      tax += r.taxAmount ?? 0;
    });
    const tot = sub - discountAmount + tax;
    setSubTotal(sub);
    setTaxAmount(tax);
    setTotalAmount(tot);
    setNetAmount(Math.round((tot + Number(roundOff || 0)) * 100) / 100);
  }, [items, discountAmount, roundOff]);

  const totalPrice = items.reduce((sum, r) => sum + Number(r.unitPrice || 0), 0);
  const tableTaxTotal = items.reduce((sum, r) => sum + Number(r.taxAmount || 0), 0);
  const tableLineTotal = items.reduce((sum, r) => sum + Number(r.lineTotal || 0), 0);
  const totalQty = items.reduce((sum, r) => sum + Number(r.qty || 0), 0);
  const tableDiscountTotal = items.reduce((sum, r) => sum + Number(r.discAmt || 0), 0);
  const money2 = (value) => Number(value || 0).toFixed(2);

  const QTN_ENTRY_H = 26;
  const QTN_ENTRY_LBL = 'text-[9px] font-semibold text-gray-500 sm:text-[10px]';
  const QTN_ENTRY_INP = 'text-[10px] tabular-nums';

  return (
    <div className="pur-root box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        .pur-root {
          --pr: ${primary}; --bd: #e5e5e5; --txt: #171717; --muted: #737373; --soft: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .pur-btn:hover { border-color: #d4d4d4; background: var(--soft); color: var(--txt); }
        .pur-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
        .pur-summary-card { border-radius: 10px; border: 1px solid #e7e5e4; background: linear-gradient(165deg,#fafaf9 0%,#fff 48%,#fafaf9 100%); box-shadow: 0 1px 2px rgba(28,25,23,.05),0 0 0 1px rgba(255,255,255,.8) inset; overflow: hidden; }
        .pur-summary-row { display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:7px 12px; min-width:0; }
        .pur-summary-row + .pur-summary-row { border-top:1px solid #f5f5f4; }
        .pur-summary-row-dense { padding-top:5px; padding-bottom:5px; }
        .pur-summary-label { font-size:11px; font-weight:600; color:#57534e; letter-spacing:.01em; line-height:1.25; }
        .pur-summary-value { font-size:13px; font-weight:700; color:#1c1917; font-variant-numeric:tabular-nums; text-align:right; letter-spacing:-0.02em; }
        .pur-summary-value-sm { font-size:12px; font-weight:600; }
        .pur-summary-net { display:flex; align-items:baseline; justify-content:space-between; gap:12px; min-width:0; padding:11px 12px 12px; border-top:1px solid rgba(121,7,40,.18); background:linear-gradient(180deg,rgba(121,7,40,.07) 0%,rgba(121,7,40,.025) 100%); }
        .pur-summary-net .pur-summary-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--pr); }
        .pur-summary-net .pur-summary-value { font-size:15px; font-weight:800; color:var(--pr); }
        .pur-act { width:30px; height:30px; padding:6px; border-radius:6px; border:none; background:transparent; cursor:pointer; opacity:.5; display:inline-flex; align-items:center; justify-content:center; transition:opacity .15s,background .15s; }
        .pur-act:hover { background:var(--soft); opacity:1; }
        .pur-entry-bar-input { box-sizing:border-box; height:26px; min-height:26px; border-radius:3px; border:1px solid #d4d4d4; background:#fff; padding:0 6px; font-size:10px; outline:none; width:100%; }
        .pur-entry-bar-input:focus { border-color:#a3a3a3; }
        .pur-entry-bar-input[readonly] { background:#f5f5f5; color:#737373; }
        .qtn-tbl, .qtn-tbl > div { overflow:visible !important; }
        .qtn-tbl thead th { position:sticky; top:0; z-index:2; }
      `}</style>

      {/* Row 1: Title + action buttons */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>QUOTATION ENTRY</h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <img src={EditIcon} alt="" className="h-3 w-3" /> Edit
          </button>
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition" onClick={handleAddQuotation}>
            <PlusIcon className="h-3 w-3" /> New
          </button>
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
          </button>
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
          </button>
          <button type="button" className="pur-btn inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 opacity-50 transition" disabled>
            <img src={PostIcon} alt="" className="h-3 w-3" /> Post
          </button>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary, borderColor: primary }}
            disabled={saving || loadingRefs || loadingEdit}
            onClick={handleSaveQuotation}
          >
            {saving ? 'Saving...' : <><SaveIcon className="h-3 w-3" /> Save</>}
          </button>
        </div>
      </div>

      {/* Row 2: Branch */}
      <div className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-2">
        <DropdownInput
          label="Branch"
          placeholder={loadingRefs || loadingEdit ? 'Loading...' : 'Select branch'}
          options={branchOptions}
          value={branchId}
          onChange={(v) => setBranchId(v)}
          widthPx={170}
          heightPx={QTN_ENTRY_H}
          labelClassName={QTN_ENTRY_LBL}
          className={QTN_ENTRY_INP}
          disabled={loadingRefs || loadingEdit || !branchOptions.length}
        />
        {(loadingEdit || saveError || successMsg) && (
          <div className="flex flex-wrap gap-2 text-[10px]">
            {loadingEdit ? <span className="text-amber-700">Loading quotation details...</span> : null}
            {saveError ? <span className="text-red-700">{saveError}</span> : null}
            {successMsg ? <span className="text-emerald-700">{successMsg}</span> : null}
          </div>
        )}
      </div>

      {/* Line entry bar */}
      <div className="flex min-w-0 shrink-0 flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        <div className="shrink-0">
          <label className={`mb-0.5 block ${QTN_ENTRY_LBL}`}>Product Search</label>
          <div className="relative" style={{ width: 160 }}>
            <img src={SearchIcon} alt="" className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45" />
            <input
              type="text"
              placeholder={branchId ? 'Search product…' : 'Select branch first'}
              disabled={!branchId}
              value={productSearch}
              onChange={(e) => { const val = e.target.value; setProductSearch(val); setProductResults(getFilteredProducts(val)); setShowSearchDropdown(true); }}
              onFocus={() => { setProductResults(getFilteredProducts(productSearch)); setShowSearchDropdown(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleProductSearch(); } }}
              className="pur-entry-bar-input pl-6"
              style={{ width: 160 }}
            />
            {showSearchDropdown && productResults.length > 0 && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[190px] w-[300px] overflow-auto rounded-md border border-stone-200 bg-white shadow-lg">
                <div className="border-b border-stone-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-stone-500">Products</div>
                {productResults.map((p) => (
                  <button key={p.productId} type="button" onClick={() => selectProduct(p)} className="block w-full px-2 py-1.5 text-left text-[9px] font-semibold text-stone-700 hover:bg-rose-50">
                    {p.shortDescription} - {money2(p.unitPrice)} / {p.unit || '-'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <SubInputField label="Own Ref" widthPx={74} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={ownRefNo} onChange={(e) => setOwnRefNo(e.target.value)} />
        </div>
        <div className="shrink-0">
          <InputField label="Product Code" widthPx={96} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={productCode} onChange={(e) => setProductCode(e.target.value)} />
        </div>
        <div className="shrink-0">
          <InputField label="Short Desc" widthPx={150} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </div>
        <div className="shrink-0">
          <InputField label="Location" widthPx={78} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Unit" widthPx={58} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Qty" type="number" widthPx={56} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Price" type="number" widthPx={72} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Disc %" type="number" widthPx={56} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={discPct} onChange={(e) => { const v = Number(e.target.value); setDiscPct(v); setDiscAmt(qty * unitPrice * (v / 100)); }} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Disc" type="number" widthPx={68} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={discAmt} onChange={(e) => setDiscAmt(Number(e.target.value))} />
        </div>
        <div className="shrink-0">
          <SubInputField label="Tax %" type="number" widthPx={54} heightPx={QTN_ENTRY_H} labelClassName={QTN_ENTRY_LBL} className={QTN_ENTRY_INP} value={0} readOnly title="Tax not configured" />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded border px-3 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary, height: QTN_ENTRY_H, minHeight: QTN_ENTRY_H }}
          >
            <PlusIcon className="h-3 w-3" /> Add Line
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* Left: line-item table */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <CommonTable
              className="qtn-tbl"
              fitParentWidth
              stickyHeader
              hideOuterBorder
              maxVisibleRows={20}
              headers={['Sl', 'Own Ref', 'Product Code', 'Description', 'Loc', 'Unit', 'Qty', 'Price', 'Disc%', 'Disc', 'Tax%', 'Tax', 'Total', 'Origin', 'Stock', 'Action']}
              rows={items.map((r, i) => [
                r.slNo,
                r.ownRefNo,
                r.productCode,
                r.shortDescription,
                r.location,
                r.unit,
                r.qty,
                r.unitPrice?.toFixed(2),
                r.discPct,
                r.discAmt?.toFixed(2),
                r.taxPct,
                r.taxAmount?.toFixed(2),
                r.lineTotal?.toFixed(2),
                r.origin,
                r.stockStatus,
                <div key={`act-${i}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
                  <button type="button" className="pur-act" onClick={() => setLineItemDetail(r)} aria-label="View line">
                    <img src={ViewActionIcon} alt="" className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="pur-act" onClick={() => setPendingRemoveIndex(i)} aria-label="Delete line">
                    <img src={DeleteActionIcon} alt="" className="h-3.5 w-3.5" />
                  </button>
                </div>,
              ])}
            />
          </div>
          <TableTotalsBar
            borderColor="#e5e5e5"
            items={[
              ['Items', String(items.length)],
              ['Qty Total', money2(totalQty)],
              ['Price Sum', money2(totalPrice)],
              ['Discount', money2(tableDiscountTotal)],
              ['Sub Total', money2(subTotal)],
              ['Tax Total', money2(tableTaxTotal)],
              ['Net Amount', money2(netAmount), true],
            ]}
          />
        </div>

        {/* Right: Quotation Details + tabs */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200 xl:min-w-0">
          {/* Always-visible: Quotation Details */}
          <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-3 flex flex-col gap-2.5">
            <span className="pur-lbl">Quotation Details</span>
            <div className="grid grid-cols-2 gap-2">
              <SubInputField
                label="Quotation No"
                fullWidth
                heightPx={QTN_ENTRY_H}
                labelClassName={QTN_ENTRY_LBL}
                className={QTN_ENTRY_INP}
                value={quotationNo}
                onChange={() => {}}
                placeholder="Auto on save"
                readOnly
              />
              <SubInputField
                label="Cust Ref No"
                fullWidth
                heightPx={QTN_ENTRY_H}
                labelClassName={QTN_ENTRY_LBL}
                className={QTN_ENTRY_INP}
                value={custRefNo}
                onChange={(e) => setCustRefNo(e.target.value)}
              />
            </div>
            <div>
              <label className={`mb-0.5 block ${QTN_ENTRY_LBL}`}>Quotation Date</label>
              <DatePickerInput
                fullWidth
                heightPx={34}
                borderRadius={4}
                placeholder="DD/MM/YYYY"
                displayFontSize={10}
                background="#fff"
                dropdownInViewport
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={QTN_ENTRY_LBL}>Customer</label>
              <select
                value={customerId === '' ? '' : String(customerId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomerId(v);
                  const row = customersRows.find((c) => String(c.customerId) === v);
                  setCustomerAddress(row?.address || '');
                  setContactPerson(row?.contactPerson || '');
                }}
                className="pur-entry-bar-input"
                disabled={loadingRefs || loadingEdit}
                style={{ height: QTN_ENTRY_H }}
              >
                <option value="">Select Customer</option>
                {customersRows.map((c) => (
                  <option key={c.customerId} value={String(c.customerId)}>{c.customerName}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={QTN_ENTRY_LBL}>Address</label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                rows={2}
                className="w-full resize-y rounded border border-neutral-200 bg-white px-2 py-1 text-[10px] outline-none focus:border-gray-400"
              />
            </div>
            <SubInputField
              label="Contact Person"
              fullWidth
              heightPx={QTN_ENTRY_H}
              labelClassName={QTN_ENTRY_LBL}
              className={QTN_ENTRY_INP}
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          {/* TabsBar */}
          <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
            <TabsBar
              fullWidth
              tabs={[{ id: 'summary', label: 'Summary' }, { id: 'terms', label: 'Terms' }]}
              activeTab={rightTab}
              onChange={setRightTab}
            />
          </div>

          {/* Tab content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
            {rightTab === 'summary' && (
              <div className="flex flex-col gap-3">
                <span className="pur-lbl">Product Info</span>
                <div className="pur-summary-card">
                  {[
                    ['Last Purchase Cost', productInfo.lastCost || '—'],
                    ['Origin', productInfo.origin || '—'],
                    ['Product Code', productCode || '—'],
                    ['Min. Unit Price', productInfo.minPrice || '—'],
                    ['Stock On Hand', productInfo.stock || '—'],
                    ['Location', productInfo.loc || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="pur-summary-row pur-summary-row-dense">
                      <span className="pur-summary-label" style={{ fontSize: 10 }}>{label}</span>
                      <span className="pur-summary-value pur-summary-value-sm" style={{ fontSize: 10 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {rightTab === 'terms' && (
              <div className="flex flex-col gap-3">
                <span className="pur-lbl">Terms & Conditions</span>
                <textarea
                  value={quotationTerms}
                  onChange={(e) => setQuotationTerms(e.target.value)}
                  rows={8}
                  placeholder="Validity, delivery, payment terms..."
                  className="w-full resize-y rounded border border-neutral-200 bg-white px-2 py-2 text-[10px] outline-none focus:border-gray-400"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Switch id="quotation-attachments" size="xs" checked={attachments} onChange={setAttachments} description="Attachments" />
                  <Switch id="qtn-print-locn" size="xs" checked={printLocn} onChange={setPrintLocn} description="Print Location" />
                  <Switch id="qtn-print-own-ref" size="xs" checked={printOwnRefNo} onChange={setPrintOwnRefNo} description="Print Own Ref" />
                  <Switch id="qtn-print-other-format" size="xs" checked={printOtherFormat} onChange={setPrintOtherFormat} description="Other Format" />
                </div>
                <span className="pur-lbl">Document Actions</span>
                <div className="flex flex-wrap gap-1.5">
                  <AppActionButton title="Edit" ariaLabel="Edit" icon={<img src={EditIcon} alt="" className="h-3 w-3" />} className="h-7 px-2 text-[9px]">Edit</AppActionButton>
                  <AppActionButton title="Duplicate" ariaLabel="Duplicate" icon={<img src={DuplicateIcon} alt="" className="h-3 w-3" style={{ filter: iconFilterPrimary }} />} className="h-7 px-2 text-[9px]">Duplicate</AppActionButton>
                  <AppActionButton title="Proforma" ariaLabel="Proforma" icon={<img src={ProformaIcon} alt="" className="h-3 w-3" style={{ filter: iconFilterPrimary }} />} className="h-7 px-2 text-[9px]">Proforma</AppActionButton>
                  <AppActionButton onClick={() => setSaveTerms(true)} title="Save Terms" ariaLabel="Save Terms" variant="primary" className="h-7 px-2 text-[9px]">Save Terms</AppActionButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingRemoveIndex !== null}
        title="Delete line item?"
        message="This will remove the line from the quotation. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingRemoveIndex(null)}
        onConfirm={() => {
          if (pendingRemoveIndex !== null) removeItem(pendingRemoveIndex);
        }}
      />

      {lineItemDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm"
          onClick={() => setLineItemDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qtn-line-detail-title"
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
              <img src={ViewActionIcon} alt="" className="h-4 w-4 opacity-60" />
              <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: primary }}>Line Detail</span>
              <button
                type="button"
                onClick={() => setLineItemDetail(null)}
                className="ml-auto rounded p-1 text-stone-500 hover:bg-stone-100"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {lineItemDetail.shortDescription && (
              <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2.5">
                <p className="text-[11px] font-semibold text-neutral-800">{lineItemDetail.shortDescription}</p>
                {lineItemDetail.productCode && <p className="text-[10px] text-neutral-500">{lineItemDetail.productCode}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-0 p-3">
              {[
                ['Sl', lineItemDetail.slNo],
                ['Own ref', lineItemDetail.ownRefNo],
                ['Product code', lineItemDetail.productCode],
                ['Location', lineItemDetail.location],
                ['Unit', lineItemDetail.unit],
                ['Qty', lineItemDetail.qty],
                ['Unit price', lineItemDetail.unitPrice != null ? Number(lineItemDetail.unitPrice).toFixed(2) : ''],
                ['Disc %', lineItemDetail.discPct],
                ['Disc amt', lineItemDetail.discAmt != null ? Number(lineItemDetail.discAmt).toFixed(2) : ''],
                ['Tax %', lineItemDetail.taxPct],
                ['Tax amt', lineItemDetail.taxAmount != null ? Number(lineItemDetail.taxAmount).toFixed(2) : ''],
                ['Origin', lineItemDetail.origin],
                ['Stock', lineItemDetail.stockStatus],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col gap-0.5 rounded p-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-neutral-400">{label}</span>
                  <span className="text-[11px] font-semibold text-neutral-800">{orDash(val)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Line Total</span>
              <span className="text-[14px] font-bold tabular-nums" style={{ color: primary }}>
                {lineItemDetail.lineTotal != null ? Number(lineItemDetail.lineTotal).toFixed(2) : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
