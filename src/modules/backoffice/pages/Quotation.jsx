/**
 * Quotation screen – Modern, readable layout. Effective space use.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { AppActionButton, InputField, SubInputField, CommonTable, Switch, ConfirmDialog, DropdownInput } from '../../../shared/components/ui';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as customerEntryApi from '../../../services/customerEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as quotationEntryApi from '../../../services/quotationEntry.api.js';
import ProformaIcon from '../../../shared/assets/icons/proforma.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
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
  const rightTabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'quote', label: 'Quote' },
    { key: 'terms', label: 'Terms' },
  ];

  const inputBase = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#790728] focus:outline-none focus:ring-2 focus:ring-[#790728]/20 transition-colors';

  /** Customer block — label + gray field */
  const quoteDetailRowLabel =
    'min-w-0 shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-[10px]';
  const detailRowInput =
    'min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]';

  return (
    <div className="qtn-page flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .qtn-page {
          --pr: ${primary}; --pr50: ${primaryHover}; --bd: #e2dfd9; --txt: #1c1917; --muted: #78716c;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .qtn-hr { height:1px; background:var(--bd); border:none; margin:0; flex-shrink:0; }
        .qtn-lbl { font-size:9px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:var(--pr); }
        .qtn-fl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.7px; color:var(--muted); }
        @media(min-width:640px){.qtn-fl{font-size:10px}}
        .qtn-fi { height:26px; width:100%; border-radius:5px; border:1px solid var(--bd); background:#f5f5f5; padding:0 8px; font-size:9px; outline:none; transition:border-color .15s; }
        @media(min-width:640px){.qtn-fi{font-size:10px}}
        .qtn-fi:focus { border-color:var(--pr); }
        .qtn-ta { min-height:38px; width:100%; resize:vertical; border-radius:5px; border:1px solid var(--bd); background:#f5f5f5; padding:5px 8px; font-size:9px; outline:none; transition:border-color .15s; }
        @media(min-width:640px){.qtn-ta{font-size:10px}}
        .qtn-ta:focus { border-color:var(--pr); }
        .qtn-tab { padding:6px 12px; font-size:10px; font-weight:600; cursor:pointer; border:none; background:transparent; color:var(--muted); border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; white-space:nowrap; }
        .qtn-tab:hover { color:var(--txt); }
        .qtn-tab-on { color:var(--pr); border-bottom-color:var(--pr); font-weight:800; }
        .qtn-act { padding:3px; border-radius:4px; border:none; background:transparent; cursor:pointer; transition:all .15s; opacity:.58; display:inline-flex; align-items:center; justify-content:center; }
        .qtn-act:hover { background:var(--pr50); opacity:1; }
        .qtn-field-lbl { padding:0; margin:0; border:none; background:transparent; cursor:pointer; font-size:9px; font-weight:700; letter-spacing:.3px; color:var(--muted); line-height:1.2; display:inline-flex; align-items:center; gap:3px; }
        @media(min-width:640px){.qtn-field-lbl{font-size:10px}}
        .qtn-field-lbl:hover { color:var(--pr); }
        .qtn-total-bar { padding:6px 8px; background:linear-gradient(180deg,#fafaf9 0%,#f5f5f4 100%); }
        .qtn-total-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; }
        @media(min-width:768px){.qtn-total-grid{grid-template-columns:repeat(8,minmax(0,1fr));}}
        .qtn-total-chip { min-width:0; border:1px solid #e7e5e4; border-radius:6px; background:#fff; padding:4px 6px; box-shadow:0 1px 2px rgba(28,25,23,.04); }
        .qtn-total-name { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:7.5px; line-height:1.15; font-weight:800; letter-spacing:.4px; text-transform:uppercase; color:var(--muted); }
        .qtn-total-value { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px; text-align:right; font-size:10px; line-height:1.1; font-weight:800; font-variant-numeric:tabular-nums; color:var(--txt); }
        .qtn-total-strong { border-color:rgba(121,7,40,.25); background:linear-gradient(135deg,rgba(121,7,40,.06) 0%,#fff 72%); }
        .qtn-total-strong .qtn-total-name, .qtn-total-strong .qtn-total-value { color:var(--pr); }
        .qtn-net { background:linear-gradient(135deg,rgba(121,7,40,.07) 0%,rgba(121,7,40,.03) 100%); border-radius:6px; padding:3px; }
        .qtn-rp::-webkit-scrollbar { width:3px; }
        .qtn-rp::-webkit-scrollbar-track { background:transparent; }
        .qtn-rp::-webkit-scrollbar-thumb { background:#d6d3d1; border-radius:3px; }
        .qtn-tbl, .qtn-tbl > div { overflow:visible !important; }
        .qtn-tbl thead th { position:sticky; top:0; z-index:2; }
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white sm:mx-[-10px]" style={{ border: '1px solid #e2dfd9' }}>
        <div className="shrink-0" style={{ height: 3, background: 'linear-gradient(90deg,#790728 0%,#85203E 35%,#923A53 65%,#C44972 100%)', borderRadius: '8px 8px 0 0' }} />

        <div className="flex shrink-0 flex-col gap-1 px-3 py-1.5 sm:px-4 sm:py-2">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <div className="flex shrink-0 items-start gap-2 pt-0.5">
              <div className="mt-0.5 shrink-0" style={{ width: 3, height: 18, borderRadius: 2, background: `linear-gradient(180deg,${primary} 0%,#C44972 100%)` }} />
              <h1 className="text-[13px] font-bold leading-tight tracking-tight sm:text-sm" style={{ color: primary }}>QUOTATION ENTRY</h1>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-start justify-end gap-x-2 gap-y-1.5">
              <DropdownInput label="Branch" placeholder={loadingRefs || loadingEdit ? 'Loading...' : 'Select branch'} options={branchOptions} value={branchId} onChange={(v) => setBranchId(v)} widthPx={170} disabled={loadingRefs || loadingEdit || !branchOptions.length} />
              <select
                value={customerId === '' ? '' : String(customerId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomerId(v);
                  const row = customersRows.find((c) => String(c.customerId) === v);
                  setCustomerAddress(row?.address || '');
                  setContactPerson(row?.contactPerson || '');
                }}
                className="qtn-fi max-w-[220px] shrink-0 bg-white"
                disabled={loadingRefs || loadingEdit}
                aria-label="Customer"
              >
                <option value="">Select Customer</option>
                {customersRows.map((c) => (
                  <option key={c.customerId} value={String(c.customerId)}>{c.customerName}</option>
                ))}
              </select>
              <div className="flex shrink-0 items-end gap-1.5">
                <AppActionButton title="Print" ariaLabel="Print" icon={<img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />} className="h-7 px-2 text-[10px]">
                  <span className="hidden sm:inline">Print</span>
                </AppActionButton>
                <AppActionButton title="New Quotation" ariaLabel="New Quotation" icon={<PlusIcon />} onClick={handleAddQuotation} className="h-7 px-2 text-[10px]">
                  <span className="hidden sm:inline">New</span>
                </AppActionButton>
                <AppActionButton onClick={handleSaveQuotation} disabled={saving || loadingRefs || loadingEdit} title={saving ? 'Saving...' : 'Save Quotation'} ariaLabel={saving ? 'Saving...' : 'Save Quotation'} icon={<SaveIcon />} variant="primary" className="h-7 px-2 text-[10px]">
                  {saving ? 'Saving...' : 'Save'}
                </AppActionButton>
              </div>
            </div>
          </div>
          {(loadingEdit || saveError || successMsg) && (
            <div className="flex flex-wrap gap-2 text-[10px]">
              {loadingEdit ? <span className="text-amber-700">Loading quotation details...</span> : null}
              {saveError ? <span className="text-red-700">{saveError}</span> : null}
              {successMsg ? <span className="text-emerald-700">{successMsg}</span> : null}
            </div>
          )}
        </div>

        <hr className="qtn-hr" />

        <div className="flex shrink-0 items-end gap-x-1.5 gap-y-1 overflow-x-auto px-3 py-1.5 sm:px-4 sm:py-2 xl:flex-nowrap">
          <div className="relative shrink-0" style={{ width: 145 }}>
            <button type="button" className="qtn-field-lbl mb-0.5" title="Search products" onClick={handleProductSearch}>
              Product Search <img src={SearchIcon} alt="" className="h-2.5 w-2.5 opacity-60" />
            </button>
            <input
              type="text"
              placeholder={branchId ? 'Search product' : 'Select branch first'}
              disabled={!branchId}
              value={productSearch}
              onChange={(e) => {
                const val = e.target.value;
                setProductSearch(val);
                setProductResults(getFilteredProducts(val));
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                setProductResults(getFilteredProducts(productSearch));
                setShowSearchDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleProductSearch();
                }
              }}
              className="qtn-fi bg-white"
            />
            {showSearchDropdown && productResults.length > 0 ? (
              <div className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[190px] w-[300px] overflow-auto rounded-md border border-stone-200 bg-white shadow-lg">
                <div className="border-b border-stone-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-stone-500">Products</div>
                {productResults.map((p) => (
                  <button key={p.productId} type="button" onClick={() => selectProduct(p)} className="block w-full px-2 py-1.5 text-left text-[9px] font-semibold text-stone-700 hover:bg-rose-50">
                    {p.shortDescription} - {money2(p.unitPrice)} / {p.unit || '-'}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <SubInputField label="Own Ref" widthPx={74} value={ownRefNo} onChange={(e) => setOwnRefNo(e.target.value)} />
          <InputField label="Product Code" widthPx={96} value={productCode} onChange={(e) => setProductCode(e.target.value)} />
          <InputField label="Short Desc" widthPx={150} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          <InputField label="Location" widthPx={78} value={location} onChange={(e) => setLocation(e.target.value)} />
          <SubInputField label="Unit" widthPx={58} value={unit} onChange={(e) => setUnit(e.target.value)} />
          <SubInputField label="Qty" type="number" widthPx={52} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          <SubInputField label="Price" type="number" widthPx={72} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
          <SubInputField
            label="Disc %"
            type="number"
            widthPx={56}
            value={discPct}
            onChange={(e) => {
              const v = Number(e.target.value);
              setDiscPct(v);
              setDiscAmt(qty * unitPrice * (v / 100));
            }}
          />
          <SubInputField label="Disc" type="number" widthPx={68} value={discAmt} onChange={(e) => setDiscAmt(Number(e.target.value))} />
          <SubInputField label="Tax %" type="number" widthPx={54} value={0} readOnly title="Tax not configured" />
          <div className="flex shrink-0 items-end">
            <AppActionButton onClick={addItem} title="Add" ariaLabel="Add" icon={<PlusIcon className="h-3 w-3" />} variant="primary" className="h-7 px-3 text-[9px]">
              Add
            </AppActionButton>
          </div>
        </div>

        <hr className="qtn-hr" />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-x-2 inset-y-1 flex flex-col overflow-hidden rounded-md sm:inset-x-3 sm:inset-y-1.5" style={{ border: '1px solid #e2dfd9' }}>
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
                      <button type="button" className="qtn-act" onClick={() => setLineItemDetail(r)} aria-label="View line">
                        <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <button type="button" className="qtn-act" onClick={() => setPendingRemoveIndex(i)} aria-label="Delete line">
                        <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>,
                  ])}
                />
              </div>
              <div className="qtn-total-bar shrink-0 border-t" style={{ borderColor: '#e2dfd9' }}>
                <div className="qtn-total-grid">
                  {[
                    ['Items', String(items.length)],
                    ['Qty Total', money2(totalQty)],
                    ['Unit Price Sum', money2(totalPrice)],
                    ['Line Discount', money2(tableDiscountTotal)],
                    ['Sub Total', money2(subTotal)],
                    ['Tax Total', money2(tableTaxTotal)],
                    ['Header Disc', money2(discountAmount)],
                    ['Net Amount', money2(netAmount), true],
                  ].map(([label, value, strong]) => (
                    <div key={label} className={`qtn-total-chip ${strong ? 'qtn-total-strong' : ''}`}>
                      <span className="qtn-total-name">{label}</span>
                      <span className="qtn-total-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="qtn-rp flex min-h-0 flex-col overflow-y-auto border-t bg-white xl:min-h-0 xl:w-80 xl:border-t-0 xl:border-l" style={{ borderColor: '#e2dfd9' }}>
            <div className="flex shrink-0 border-b px-3 py-1" style={{ borderColor: '#e2dfd9' }}>
              {rightTabs.map((tab) => (
                <button key={tab.key} type="button" className={`qtn-tab ${rightTab === tab.key ? 'qtn-tab-on' : ''}`} onClick={() => setRightTab(tab.key)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'summary' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Summary</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-28 shrink-0">Sub Total</label>
                        <input type="text" readOnly tabIndex={-1} value={money2(subTotal)} className="qtn-fi flex-1 tabular-nums" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-28 shrink-0">Discount</label>
                        <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} className="qtn-fi flex-1 tabular-nums" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-28 shrink-0">Tax</label>
                        <input type="text" readOnly tabIndex={-1} value={money2(taxAmount)} className="qtn-fi flex-1 tabular-nums" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-28 shrink-0">Round Off</label>
                        <input type="number" value={roundOff} onChange={(e) => setRoundOff(e.target.value)} className="qtn-fi flex-1 tabular-nums" />
                      </div>
                      <div className="qtn-net flex items-center gap-2">
                        <label className="qtn-fl w-28 shrink-0" style={{ color: primary }}>Net Amount</label>
                        <input type="text" readOnly tabIndex={-1} value={money2(netAmount)} className="qtn-fi flex-1 tabular-nums" style={{ fontWeight: 800, background: '#fff' }} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Product Info</span>
                    <div className="space-y-1.5 text-[10px] leading-tight text-stone-700">
                      {[
                        ['Last Purchase Cost', productInfo.lastCost || '-'],
                        ['Origin', productInfo.origin || '-'],
                        ['Product Code', productCode || '-'],
                        ['Min. Unit Price', productInfo.minPrice || '-'],
                        ['Stock On Hand', productInfo.stock || '-'],
                        ['Location', productInfo.loc || '-'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                          <span className="text-stone-500">{label}</span>
                          <span className="min-w-0 shrink text-right font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'quote' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Quote Information</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-24 shrink-0">Quotation No</label>
                        <input type="text" value={quotationNo} onChange={() => {}} className="qtn-fi flex-1" placeholder="Auto on save" readOnly />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-24 shrink-0">Quote Date</label>
                        <input type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} className="qtn-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-24 shrink-0">Cust Ref No</label>
                        <input type="text" value={custRefNo} onChange={(e) => setCustRefNo(e.target.value)} className="qtn-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-24 shrink-0">Cust Ref Date</label>
                        <input type="date" value={custRefDate} onChange={(e) => setCustRefDate(e.target.value)} className="qtn-fi flex-1" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Customer</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-24 shrink-0">Customer</label>
                        <select value={customerId === '' ? '' : String(customerId)} onChange={(e) => {
                          const v = e.target.value;
                          setCustomerId(v);
                          const row = customersRows.find((c) => String(c.customerId) === v);
                          setCustomerAddress(row?.address || '');
                          setContactPerson(row?.contactPerson || '');
                        }} className="qtn-fi flex-1">
                          <option value="">Select Customer</option>
                          {customersRows.map((c) => <option key={c.customerId} value={String(c.customerId)}>{c.customerName}</option>)}
                        </select>
                      </div>
                      <div className="flex items-start gap-2">
                        <label className="qtn-fl mt-1.5 w-24 shrink-0">Address</label>
                        <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={3} className="qtn-ta flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="qtn-fl w-24 shrink-0">Contact</label>
                        <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="qtn-fi flex-1" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Options</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Switch id="quotation-attachments" size="xs" checked={attachments} onChange={setAttachments} description="Attachments" />
                      <Switch id="qtn-print-locn" size="xs" checked={printLocn} onChange={setPrintLocn} description="Print Location" />
                      <Switch id="qtn-print-own-ref" size="xs" checked={printOwnRefNo} onChange={setPrintOwnRefNo} description="Print Own Ref" />
                      <Switch id="qtn-print-other-format" size="xs" checked={printOtherFormat} onChange={setPrintOtherFormat} description="Other Format" />
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'terms' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Terms & Conditions</span>
                    <textarea value={quotationTerms} onChange={(e) => setQuotationTerms(e.target.value)} className="qtn-ta w-full" rows={8} placeholder="Validity, delivery, payment terms..." />
                  </div>
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="qtn-lbl mb-2 block">Document Actions</span>
                    <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5">
                      <AppActionButton title="Edit" ariaLabel="Edit" icon={<img src={EditIcon} alt="" className="h-3 w-3" />} className="h-7 px-2 text-[9px]">Edit</AppActionButton>
                      <AppActionButton title="Duplicate" ariaLabel="Duplicate" icon={<img src={DuplicateIcon} alt="" className="h-3 w-3" style={{ filter: iconFilterPrimary }} />} className="h-7 px-2 text-[9px]">Duplicate</AppActionButton>
                      <AppActionButton title="Proforma" ariaLabel="Proforma" icon={<img src={ProformaIcon} alt="" className="h-3 w-3" style={{ filter: iconFilterPrimary }} />} className="h-7 px-2 text-[9px]">Proforma</AppActionButton>
                      <AppActionButton onClick={() => setSaveTerms(true)} title="Save Terms" ariaLabel="Save Terms" variant="primary" className="h-7 px-2 text-[9px]">Save Terms</AppActionButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3 py-1.5 sm:px-4" style={{ borderColor: '#e2dfd9', background: 'linear-gradient(180deg,#f8f7f6 0%,#f0efed 100%)' }}>
          <span className="text-[10px] font-semibold text-stone-500 sm:text-[11px]">
            {items.length} item{items.length !== 1 ? 's' : ''} | Net: {money2(netAmount)}
          </span>
          <div className="flex items-center gap-2">
            <AppActionButton title="New" ariaLabel="New" icon={<PlusIcon />} onClick={handleAddQuotation} className="h-7 px-2 text-[10px]">New</AppActionButton>
            <AppActionButton title="Print" ariaLabel="Print" icon={<img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />} className="h-7 px-2 text-[10px]">Print</AppActionButton>
            <AppActionButton title="Cancel" ariaLabel="Cancel" icon={<img src={CancelIcon} alt="" className="h-3.5 w-3.5" />} className="h-7 px-2 text-[10px]">Cancel</AppActionButton>
            <AppActionButton onClick={handleSaveQuotation} disabled={saving || loadingRefs || loadingEdit || items.length === 0} title={saving ? 'Saving...' : 'Save Quotation'} ariaLabel={saving ? 'Saving...' : 'Save Quotation'} icon={<SaveIcon />} variant="primary" className="h-7 px-3 text-[10px]">
              {saving ? 'Saving...' : 'Save Quotation'}
            </AppActionButton>
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
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-stone-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLineItemDetail(null)}
              className="absolute right-2 top-2 rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 id="qtn-line-detail-title" className="mb-4 text-center text-base font-bold" style={{ color: primary }}>
              Line item details
            </h2>
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2">
              {[
                ['Sl', lineItemDetail.slNo],
                ['Own ref', lineItemDetail.ownRefNo],
                ['Product code', lineItemDetail.productCode],
                ['Description', lineItemDetail.shortDescription],
                ['Location', lineItemDetail.location],
                ['Unit', lineItemDetail.unit],
                ['Qty', lineItemDetail.qty],
                ['Unit price', lineItemDetail.unitPrice != null ? Number(lineItemDetail.unitPrice).toFixed(2) : ''],
                ['Disc %', lineItemDetail.discPct],
                ['Disc amt', lineItemDetail.discAmt != null ? Number(lineItemDetail.discAmt).toFixed(2) : ''],
                ['Tax %', lineItemDetail.taxPct],
                ['Tax amt', lineItemDetail.taxAmount != null ? Number(lineItemDetail.taxAmount).toFixed(2) : ''],
                ['Line total', lineItemDetail.lineTotal != null ? Number(lineItemDetail.lineTotal).toFixed(2) : ''],
                ['Origin', lineItemDetail.origin],
                ['Stock', lineItemDetail.stockStatus],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center gap-2">
                  <label className="w-[130px] shrink-0 text-left text-[10px] font-semibold text-stone-700">{label}</label>
                  <span className="min-h-[28px] flex-1 rounded border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] text-stone-800">
                    {orDash(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .qtn-outline:hover { border-color: ${primary} !important; background: ${primaryHover} !important; color: ${primary} !important; }
        .qtn-primary:hover { filter: brightness(1.05); }
        .qtn-scroll-table td:has(button) { white-space: nowrap; }
      `}</style>

      <div className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2.5 pb-2.5 pt-1.5 shadow-sm sm:gap-3 sm:px-3 sm:pb-3 sm:pt-2">
        {/* Header — same outer rhythm as Sale / ModuleTabs content */}
        <header className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            Quotation
          </h1>
          <div className="flex items-center gap-2">
            <AppActionButton
              title="Print"
              ariaLabel="Print"
              icon={<img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />}
              className="h-7 px-2 text-[10px]"
            >
              Print
            </AppActionButton>
            <AppActionButton
              onClick={handleSaveQuotation}
              disabled={saving || loadingRefs}
              title={saving ? 'Saving...' : 'Save'}
              ariaLabel={saving ? 'Saving...' : 'Save'}
              icon={<SaveIcon />}
              className="h-7 px-2 text-[10px]"
            >
              {saving ? 'Saving…' : 'Save'}
            </AppActionButton>
            <AppActionButton
              onClick={handleAddQuotation}
              title="Add Quotation"
              ariaLabel="Add Quotation"
              icon={<PlusIcon />}
              variant="primary"
              className="h-7 px-2 text-[10px]"
            >
              Add Quotation
            </AppActionButton>
            {/* <button type="button" onClick={() => navigate(-1)} className="qtn-outline flex h-9 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors">Close</button> */}
          </div>
        </header>
        {(saveError || successMsg) && (
          <div className="px-0.5 text-[10px] sm:text-[11px]">
            {saveError && <p className="text-red-600">{saveError}</p>}
            {successMsg && <p className="text-green-700">{successMsg}</p>}
          </div>
        )}

        {/* Main */}
        <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-3">
          {/* Left */}
          <div className="flex min-w-0 w-full flex-1 flex-col gap-3">
            {/* Quote & Customer */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>
                  Quote Details
                </h2>
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <DropdownInput
                    label="Branch"
                    placeholder={loadingRefs ? 'Loading…' : 'Select branch'}
                    options={branchOptions}
                    value={branchId}
                    onChange={(v) => setBranchId(v)}
                    fullWidth
                    heightPx={28}
                    disabled={loadingRefs || !branchOptions.length}
                  />
                  <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField
                      fullWidth
                      label="Quotation No"
                      heightPx={28}
                      value={quotationNo}
                      onChange={() => {}}
                      placeholder="Auto on save"
                      readOnly
                    />
                    <InputField
                      fullWidth
                      label="Quotation Date"
                      type="date"
                      heightPx={28}
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                    />
                  </div>
                  <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField
                      fullWidth
                      label="Cust. Ref No"
                      heightPx={28}
                      value={custRefNo}
                      onChange={(e) => setCustRefNo(e.target.value)}
                    />
                    <InputField
                      fullWidth
                      label="Cust. Ref Date"
                      type="date"
                      heightPx={28}
                      value={custRefDate}
                      onChange={(e) => setCustRefDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>
                  Customer
                </h2>
                <div className="flex flex-col gap-1 sm:gap-[8px]">
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Customer Name</label>
                    <select
                      value={customerId === '' ? '' : String(customerId)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomerId(v);
                        const row = customersRows.find((c) => String(c.customerId) === v);
                        if (row) {
                          setCustomerAddress(row.address || '');
                          setContactPerson(row.contactPerson || '');
                        } else {
                          setCustomerAddress('');
                          setContactPerson('');
                        }
                      }}
                      className={`${detailRowInput} cursor-pointer`}
                      style={{ accentColor: primary }}
                    >
                      <option value="">— Select Customer —</option>
                      {customersRows.map((c) => (
                        <option key={c.customerId} value={String(c.customerId)}>
                          {c.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex w-full items-start justify-start gap-2 sm:gap-[10px]">
                    <label className={`${quoteDetailRowLabel} pt-1`}>Address</label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows={2}
                      className={`${detailRowInput} min-h-[48px] resize-y`}
                    />
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={detailRowInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Add Item — heading row with search on right */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold" style={{ color: primary }}>
                  Add Item
                </h2>
                <div className="relative w-full max-w-[300px] min-w-[220px]">
                  <input
                    type="text"
                    placeholder={branchId ? 'Search product…' : 'Select branch first'}
                    disabled={!branchId}
                    value={productSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductSearch(val);
                      setProductResults(getFilteredProducts(val));
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => {
                      setProductResults(getFilteredProducts(productSearch));
                      setShowSearchDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleProductSearch();
                      }
                    }}
                    className="h-[24px] w-full rounded border border-gray-300 bg-white pl-2 pr-[60px] text-[9px] outline-none focus:border-[#790728] sm:h-[28px] sm:text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={handleProductSearch}
                    className="absolute right-1 top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded bg-transparent sm:h-[20px] sm:w-[20px]"
                    aria-label="Search"
                  >
                    <img src={SearchIcon} alt="" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>

                  {showSearchDropdown && productResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-[180px] overflow-auto rounded border border-gray-200 bg-white shadow-md">
                      {productResults.length > 0 && (
                        <div className="border-b border-gray-100 px-2 py-1 text-[8px] font-semibold text-gray-500 sm:text-[9px]">
                          Products
                        </div>
                      )}
                      {productResults.map((p) => (
                        <button
                          key={p.productId}
                          type="button"
                          onClick={() => selectProduct(p)}
                          className="block w-full px-2 py-1 text-left text-[8px] text-gray-700 hover:bg-gray-100 sm:text-[9px]"
                        >
                          {p.shortDescription} - {p.unitPrice} / {p.unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <SubInputField label="Own Ref" value={ownRefNo} onChange={(e) => setOwnRefNo(e.target.value)} />
                <InputField label="Product Code" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
                <InputField
                  label="Short Desc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
                <InputField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                <SubInputField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
                <SubInputField
                  label="Qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
                <SubInputField
                  label="Unit Price"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                />
                <SubInputField
                  label="Disc.%"
                  type="number"
                  value={discPct}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDiscPct(v);
                    setDiscAmt(qty * unitPrice * (v / 100));
                  }}
                />
                <SubInputField label="Disc" type="number" value={discAmt} onChange={(e) => setDiscAmt(Number(e.target.value))} />
                <SubInputField label="Tax%" type="number" value={0} readOnly title="Tax not configured" />
                <div className="ml-auto flex shrink-0 items-end">
                  <AppActionButton
                    onClick={addItem}
                    title="Add"
                    ariaLabel="Add"
                    icon={<PlusIcon className="h-3 w-3" />}
                    variant="primary"
                    className="h-7 px-3 text-[9px]"
                  >
                    Add
                  </AppActionButton>
                </div>
              </div>
            </div>

            {/* Table — vertical scroll after 7 item rows; width fits container (no horizontal scroll) */}
            <div
              className={`qtn-scroll-table w-full overflow-x-hidden ${
                items.length > 5? 'max-h-[min(15rem,48vh)] overflow-y-auto sm:max-h-[min(17rem,52vh)]' : ''
              }`}
            >
              <CommonTable
                fitParentWidth
                stickyHeader={items.length > 7}
                headers={[
                  'Sl',
                  'Own Ref',
                  'Product Code',
                  'Description',
                  'Loc',
                  'Unit',
                  'Qty',
                  'Price',
                  'Disc%',
                  'Disc',
                  'Tax%',
                  'Tax',
                  'Total',
                  'Origin',
                  'Stock',
                  'Action',
                ]}
                rows={[
                  ...items.map((r, i) => [
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
                      <button type="button" className="p-0.5" onClick={() => setLineItemDetail(r)} aria-label="View line">
                        <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <button type="button" className="p-0.5" onClick={() => setPendingRemoveIndex(i)} aria-label="Delete line">
                        <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>,
                  ]),
                  [
                    { content: 'Total', colSpan: 7, className: 'text-left font-bold' },
                    totalPrice.toFixed(2),
                    '',
                    '',
                    '',
                    tableTaxTotal.toFixed(2),
                    tableLineTotal.toFixed(2),
                    '',
                    '',
                    '',
                  ],
                ]}
              />
            </div>

          </div>

          {/* Right: Product Info + Totals */}
          <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-[250px]">
            <div className="rounded-lg border border-gray-200 bg-[#F2E6EA]/30 p-2.5 shadow-sm sm:p-3">
              <h2 className="mb-2 text-[10px] font-semibold sm:text-[11px]" style={{ color: primary }}>
                Product Info
              </h2>
              <div className="space-y-1.5 text-[9px] leading-tight text-gray-800 sm:text-[10px]">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Last Purchase Cost</span>
                  <span className="min-w-0 shrink text-right font-medium">{productInfo.lastCost || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Origin</span>
                  <span className="min-w-0 shrink text-right">{productInfo.origin || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Product Code</span>
                  <span className="min-w-0 shrink text-right">{productCode || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Min. Unit Price</span>
                  <span className="min-w-0 shrink text-right">{productInfo.minPrice || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Stock On Hand</span>
                  <span className="min-w-0 shrink text-right">{productInfo.stock || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Location</span>
                  <span className="min-w-0 shrink text-right">{productInfo.loc || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <Switch
                    id="quotation-attachments"
                    size="sm"
                    checked={attachments}
                    onChange={setAttachments}
                  />
                  <span className="text-[8px] leading-tight text-gray-600 sm:text-[9px]">
                    Attachments
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border-2 border-[#790728]/50 bg-[#F2E6EA]/40 p-2.5 shadow-md sm:p-3">
              <h2 className="mb-2 text-[10px] font-bold sm:text-[11px]" style={{ color: primary }}>
                Totals
              </h2>
              <div className="space-y-1.5 text-[9px] leading-tight text-gray-800 sm:text-[10px]">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="shrink-0 font-semibold tabular-nums">{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">Discount Amount</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="h-[22px] w-[4.5rem] shrink-0 rounded border border-gray-300 bg-white px-1.5 py-0 text-right text-[9px] tabular-nums outline-none sm:h-[24px] sm:text-[10px]"
                  />
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="shrink-0 font-semibold tabular-nums">{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="shrink-0 tabular-nums">{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">Round Off</span>
                  <input
                    type="number"
                    value={roundOff}
                    onChange={(e) => setRoundOff(e.target.value)}
                    className="h-[22px] w-[4.5rem] shrink-0 rounded border border-gray-300 bg-white px-1.5 py-0 text-right text-[9px] tabular-nums outline-none sm:h-[24px] sm:text-[10px]"
                  />
                </div>
                <div className="flex justify-between gap-2 border-t border-gray-300 pt-2">
                  <span className="text-[10px] font-bold text-gray-800 sm:text-[11px]">Net Amount</span>
                  <span className="text-[11px] font-bold tabular-nums sm:text-[12px]" style={{ color: primary }}>
                    {netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms (right sidebar - below Totals) */}
            <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-right text-[10px] font-semibold text-gray-700 sm:text-[11px]">Quotation Terms</h2>
              </div>

              <textarea
                value={quotationTerms}
                onChange={(e) => setQuotationTerms(e.target.value)}
                rows={3}
                placeholder="Enter terms..."
                className="mb-2 w-full resize-none rounded border border-gray-300 bg-white px-2 py-1 text-[9px] outline-none sm:text-[10px]"
              />

              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[7px] text-gray-600 sm:text-[8px]">
                <div className="flex items-center gap-1">
                  <Switch id="qtn-print-locn" size="xs" checked={printLocn} onChange={setPrintLocn} />
                  <span className="leading-tight">Print Loctn.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch id="qtn-print-own-ref" size="xs" checked={printOwnRefNo} onChange={setPrintOwnRefNo} />
                  <span className="leading-tight">Print Own Ref No.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch id="qtn-print-other-format" size="xs" checked={printOtherFormat} onChange={setPrintOtherFormat} />
                  <span className="leading-tight">Other Format</span>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-0.5 overflow-hidden">
                <AppActionButton
                  title="Edit"
                  ariaLabel="Edit"
                  icon={<img src={EditIcon} alt="" className="h-3 w-3" />}
                  className="h-6 w-6 px-0"
                >
                </AppActionButton>
                <AppActionButton
                  title="Duplicate"
                  ariaLabel="Duplicate"
                  icon={<img src={DuplicateIcon} alt="" className="h-3 w-3" style={{ filter: iconFilterPrimary }} />}
                  className="h-6 min-w-0 flex-1 px-1 text-[8px]"
                >
                  <span className="min-w-0 truncate">Duplicate</span>
                </AppActionButton>
                <AppActionButton
                  title="Proforma"
                  ariaLabel="Proforma"
                  icon={<img src={ProformaIcon} alt="" className="h-3 w-3" style={{ filter: iconFilterPrimary }} />}
                  className="h-6 min-w-0 flex-1 px-1 text-[8px]"
                >
                  <span className="min-w-0 truncate">Proforma</span>
                </AppActionButton>
                <AppActionButton
                  onClick={() => setSaveTerms(true)}
                  title="Save Terms"
                  ariaLabel="Save Terms"
                  variant="primary"
                  className="h-6 px-2 text-[8px]"
                >
                  Save
                </AppActionButton>
              </div>
            </div>
          </aside>
        </div>

      </div>

      {/* Line item detail (view) */}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setLineItemDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qtn-line-detail-title"
        >
          <div
            className="relative mx-4 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLineItemDetail(null)}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2
              id="qtn-line-detail-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              Line item details
            </h2>
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              {[
                ['Sl', lineItemDetail.slNo],
                ['Own ref', lineItemDetail.ownRefNo],
                ['Product code', lineItemDetail.productCode],
                ['Description', lineItemDetail.shortDescription],
                ['Location', lineItemDetail.location],
                ['Unit', lineItemDetail.unit],
                ['Qty', lineItemDetail.qty],
                ['Unit price', lineItemDetail.unitPrice != null ? Number(lineItemDetail.unitPrice).toFixed(2) : ''],
                ['Disc %', lineItemDetail.discPct],
                ['Disc amt', lineItemDetail.discAmt != null ? Number(lineItemDetail.discAmt).toFixed(2) : ''],
                ['Tax %', lineItemDetail.taxPct],
                ['Tax amt', lineItemDetail.taxAmount != null ? Number(lineItemDetail.taxAmount).toFixed(2) : ''],
                ['Line total', lineItemDetail.lineTotal != null ? Number(lineItemDetail.lineTotal).toFixed(2) : ''],
                ['Origin', lineItemDetail.origin],
                ['Stock', lineItemDetail.stockStatus],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center gap-2 sm:gap-[10px]">
                  <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                    {label}
                  </label>
                  <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                    {orDash(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
