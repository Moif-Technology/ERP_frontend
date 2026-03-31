/**
 * Quotation screen – API-backed (init, customers, product lookup, get/save).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../constants/theme';
import { InputField, SubInputField, CommonTable, Switch } from '../components/ui';
import ProformaIcon from '../assets/icons/proforma.svg';
import PrinterIcon from '../assets/icons/printer.svg';
import SearchIcon from '../assets/icons/search2.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import EditIcon from '../assets/icons/edit4.svg';
import DuplicateIcon from '../assets/icons/list2.svg';
import {
  fetchQuotationEntryInit,
  fetchQuotationEntryGet,
  saveQuotationEntryRequest,
  fetchCustomersList,
  fetchProductsLookup,
} from '../api/quotation/quotationEntry.service.js';

const primary = colors.primary?.main || colors.primary?.DEFAULT || '#790728';
const primaryHover = colors.primary?.[50] || '#F2E6EA';

const iconFilterPrimary =
  'invert(13%) sepia(88%) saturate(3223%) hue-rotate(350deg) brightness(92%) contrast(105%)';

function mapApiItemToRow(it, i, defaultTax) {
  const desc = it.shortDescription ?? it.description ?? '';
  const bar = it.productCode ?? it.barCode ?? '';
  const own = it.ownRefNo ?? it.productOwnRefNo ?? '';
  const taxPct = Number(it.taxPct ?? it.tax1Rate ?? defaultTax ?? 0);
  const taxAmount = Number(it.taxAmount ?? it.tax1Amount ?? 0);
  const discAmt = Number(it.discAmt ?? it.itemDiscount ?? 0);
  const qty = Number(it.qty ?? 0);
  const unitPrice = Number(it.unitPrice ?? 0);
  const gross = qty * unitPrice;
  const discPct = gross > 0 ? Math.round((discAmt / gross) * 10000) / 100 : Number(it.discPct ?? 0);
  return {
    slNo: i + 1,
    quotationChildId: Number(it.quotationChildId ?? 0),
    productId: Number(it.productId ?? 0),
    ownRefNo: own,
    productCode: bar,
    shortDescription: desc,
    location: it.location ?? '',
    unit: it.unit ?? '',
    qty,
    unitPrice,
    discPct,
    discAmt,
    subTotal: Number(it.subTotal ?? 0),
    taxPct,
    taxAmount,
    lineTotal: Number(it.lineTotal ?? 0),
    origin: it.origin ?? '',
    stockStatus: it.stockStatus != null ? String(it.stockStatus) : '',
    minimumRetailPrice: Number(it.minimumRetailPrice ?? 0),
    averageCost: Number(it.averageCost ?? 0),
  };
}

export default function Quotation() {
  const initDataRef = useRef(null);

  const [stationId, setStationId] = useState(0);
  const [editingQuotationId, setEditingQuotationId] = useState(0);
  const [deletedChildIds, setDeletedChildIds] = useState([]);

  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingQuotation, setLoadingQuotation] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [headerTaxRate, setHeaderTaxRate] = useState(5);

  const [quotationNo, setQuotationNo] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [custRefNo, setCustRefNo] = useState('');
  const [custRefDate, setCustRefDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState(0);
  const [customerAddress, setCustomerAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [ownRefNo, setOwnRefNo] = useState('');
  const [productCode, setProductCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discPct, setDiscPct] = useState(0);
  const [discAmt, setDiscAmt] = useState(0);
  const [taxPct, setTaxPct] = useState(5);

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

  const orDash = (v) => (v != null && v !== '' ? String(v) : '—');

  const applyLoadedQuotation = useCallback(
    (data) => {
      const defTax = Number(initDataRef.current?.tax1Percentage ?? headerTaxRate ?? 5);
      setEditingQuotationId(Number(data.quotationId ?? 0));
      setQuotationNo(String(data.quotationNo ?? ''));
      setQuotationDate(data.quotationDate || new Date().toISOString().slice(0, 10));
      setCustRefNo(String(data.custRefNo ?? ''));
      setCustRefDate(data.custRefDate || data.quotationDate || new Date().toISOString().slice(0, 10));
      setCustomerId(Number(data.customerId ?? 0));
      setCustomerAddress(String(data.customerAddress ?? ''));
      setContactPerson(String(data.contactPerson ?? ''));
      setQuotationTerms(String(data.quotationTerms ?? ''));
      setDiscountAmount(Number(data.discountAmount ?? 0));
      setRoundOff(Number(data.roundOffAdj ?? 0));
      setHeaderTaxRate(Number(data.tax1Rate ?? defTax));
      const list = Array.isArray(data.items) ? data.items : [];
      setItems(list.map((it, i) => mapApiItemToRow(it, i, defTax)));
      setDeletedChildIds([]);
      setSaveError('');
    },
    [headerTaxRate]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setInitError('');
      try {
        const [initData, custRows] = await Promise.all([
          fetchQuotationEntryInit(),
          fetchCustomersList(),
        ]);
        if (cancelled) return;
        initDataRef.current = initData;
        setStationId(Number(initData.stationId ?? 0));
        const tax = Number(initData.tax1Percentage ?? 5);
        setHeaderTaxRate(tax);
        setTaxPct(tax);
        setQuotationTerms(String(initData.quotationTerms ?? ''));
        const serverDate = initData.serverDate
          ? String(initData.serverDate).slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        setQuotationDate(serverDate);
        setCustRefDate(serverDate);
        setCustomers(
          (custRows || []).map((c) => ({
            customerId: Number(c.customerId),
            customerName: String(c.customerName ?? ''),
          }))
        );
      } catch (e) {
        if (!cancelled) setInitError(e.message || 'Failed to load quotation setup.');
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stationId) return undefined;
    const q = productSearch.trim();
    if (q.length < 1) {
      setProductResults([]);
      return undefined;
    }
    const t = setTimeout(async () => {
      try {
        const rows = await fetchProductsLookup({ stationId, shortDescription: q });
        setProductResults(rows);
        setShowSearchDropdown(true);
      } catch {
        setProductResults([]);
      }
    }, 320);
    return () => clearTimeout(t);
  }, [productSearch, stationId]);

  const handleProductSearchClick = async () => {
    const q = productSearch.trim();
    if (!stationId || q.length < 1) return;
    try {
      const rows = await fetchProductsLookup({ stationId, shortDescription: q });
      setProductResults(rows);
      setShowSearchDropdown(true);
    } catch {
      setProductResults([]);
    }
  };

  const selectProduct = (p) => {
    setSelectedProductId(Number(p.productId ?? 0));
    setOwnRefNo(String(p.productOwnRefNo ?? ''));
    setProductCode(String(p.barCode ?? ''));
    setShortDescription(String(p.shortDescription ?? p.description ?? ''));
    setUnit(String(p.unit ?? ''));
    setUnitPrice(Number(p.unitPrice ?? 0));
    const tr = Number(p.tax1Rate ?? initDataRef.current?.tax1Percentage ?? headerTaxRate);
    setTaxPct(Number.isNaN(tr) ? headerTaxRate : tr);
    setLocation(String(p.location ?? ''));
    setProductInfo({
      lastCost: p.averageCost != null ? String(p.averageCost) : '',
      origin: String(p.origin ?? ''),
      minPrice: p.minimumRetailPrice != null ? String(p.minimumRetailPrice) : '',
      stock: p.qtyOnHand != null ? String(p.qtyOnHand) : '',
      loc: String(p.location ?? ''),
    });
    setProductResults([]);
    setShowSearchDropdown(false);
    setProductSearch('');
  };

  const addItem = () => {
    if (!shortDescription || qty <= 0) return;
    const sub = qty * unitPrice - discAmt;
    const tax = Math.round(sub * (taxPct / 100) * 100) / 100;
    const lineTot = sub + tax;
    const minP = selectedProductId ? Number(productInfo.minPrice || 0) : 0;
    const ac = selectedProductId ? Number(productInfo.lastCost || 0) : 0;
    const newItem = {
      quotationChildId: 0,
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
      taxPct,
      taxAmount: tax,
      lineTotal: lineTot,
      origin: productInfo.origin,
      stockStatus: productInfo.stock,
      minimumRetailPrice: minP,
      averageCost: ac,
    };

    setItems((prev) => [
      { ...newItem, slNo: 1 },
      ...prev.map((r, i) => ({ ...r, slNo: i + 2 })),
    ]);
    setSelectedProductId(0);
    setQty(1);
    setUnitPrice(0);
    setDiscPct(0);
    setDiscAmt(0);
    setOwnRefNo('');
    setProductCode('');
    setShortDescription('');
    setLocation('');
    setUnit('');
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
  };

  const removeItem = (idx) => {
    setItems((prev) => {
      const row = prev[idx];
      if (row?.quotationChildId > 0) {
        setDeletedChildIds((d) => [...d, row.quotationChildId]);
      }
      return prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, slNo: i + 1 }));
    });
  };

  const resetFormNew = () => {
    const init = initDataRef.current;
    const serverDate = init?.serverDate
      ? String(init.serverDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const tax = Number(init?.tax1Percentage ?? 5);
    setLineItemDetail(null);
    setEditingQuotationId(0);
    setDeletedChildIds([]);
    setQuotationNo('');
    setQuotationDate(serverDate);
    setCustRefNo('');
    setCustRefDate(serverDate);
    setCustomerId(0);
    setCustomerAddress('');
    setContactPerson('');
    setProductSearch('');
    setProductResults([]);
    setShowSearchDropdown(false);
    setSelectedProductId(0);
    setOwnRefNo('');
    setProductCode('');
    setShortDescription('');
    setLocation('');
    setUnit('');
    setQty(1);
    setUnitPrice(0);
    setDiscPct(0);
    setDiscAmt(0);
    setTaxPct(tax);
    setHeaderTaxRate(tax);
    setItems([]);
    setDiscountAmount(0);
    setRoundOff(0);
    setQuotationTerms(String(init?.quotationTerms ?? ''));
    setSaveTerms(false);
    setPrintLocn(false);
    setPrintOwnRefNo(true);
    setPrintOtherFormat(false);
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
    setAttachments(false);
    setSaveError('');
    setLoadError('');
  };

  const handleAddQuotation = () => {
    resetFormNew();
  };

  const handleLoadQuotation = async () => {
    const q = String(quotationNo).trim();
    if (!q || !stationId) {
      setLoadError(!stationId ? 'Station not ready.' : 'Enter a quotation number.');
      return;
    }
    setLoadingQuotation(true);
    setLoadError('');
    try {
      const data = await fetchQuotationEntryGet({ stationId, quotationNo: q });
      applyLoadedQuotation(data);
    } catch (e) {
      setLoadError(e.message || 'Failed to load quotation.');
    } finally {
      setLoadingQuotation(false);
    }
  };

  const handleSave = async () => {
    setSaveError('');
    if (!stationId) {
      setSaveError('Station not ready.');
      return;
    }
    const customerName =
      customers.find((c) => c.customerId === customerId)?.customerName?.trim() || '';
    if (!customerName) {
      setSaveError('Select a customer.');
      return;
    }
    if (!items.length) {
      setSaveError('Add at least one line item.');
      return;
    }

    const taxable = subTotal - discountAmount;
    const payload = {
      quotationId: editingQuotationId,
      stationId,
      quotationDate,
      custRefNo,
      custRefDate,
      customerId,
      customerName,
      customerAddress,
      contactPerson,
      quotationTerms,
      saveTerms,
      subTotal,
      discountAmount,
      taxableAmount: taxable,
      tax1Amount: taxAmount,
      tax1Rate: headerTaxRate,
      roundOffAdj: Number(roundOff || 0),
      quotationAmount: netAmount,
      deletedChildIds,
      items: items.map((r) => ({
        quotationChildId: r.quotationChildId || 0,
        productId: r.productId ?? 0,
        barCode: r.productCode ?? '',
        description: r.shortDescription ?? '',
        unit: r.unit ?? '',
        qty: r.qty,
        unitPrice: r.unitPrice,
        itemDiscount: r.discAmt ?? 0,
        subTotal: r.subTotal,
        tax1Amount: r.taxAmount ?? 0,
        tax1Rate: r.taxPct ?? 0,
        lineTotal: r.lineTotal,
        location: r.location ?? '',
        origin: r.origin ?? '',
        stockStatus: r.stockStatus ?? '',
        minimumRetailPrice: r.minimumRetailPrice ?? 0,
        averageCost: r.averageCost ?? 0,
      })),
    };

    setSaving(true);
    try {
      const res = await saveQuotationEntryRequest(payload);
      setEditingQuotationId(Number(res.quotationId ?? editingQuotationId));
      if (res.quotationNo != null) setQuotationNo(String(res.quotationNo));
      setDeletedChildIds([]);
      if (saveTerms) setSaveTerms(false);
    } catch (e) {
      setSaveError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = () => {
    setEditingQuotationId(0);
    setQuotationNo('');
    setDeletedChildIds([]);
    setItems((prev) =>
      prev.map((r) => ({
        ...r,
        quotationChildId: 0,
      })).map((r, i) => ({ ...r, slNo: i + 1 }))
    );
    setSaveError('');
    setLoadError('');
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

  const quoteDetailRowLabel =
    'min-w-0 shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-[10px]';
  const detailRowInput =
    'min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]';

  return (
    <div className="mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .qtn-outline:hover { border-color: ${primary} !important; background: ${primaryHover} !important; color: ${primary} !important; }
        .qtn-primary:hover { filter: brightness(1.05); }
        .qtn-scroll-table td:has(button) { white-space: nowrap; }
      `}</style>

      <div className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2.5 pb-2.5 pt-1.5 shadow-sm sm:gap-3 sm:px-3 sm:pb-3 sm:pt-2">
        <header className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div>
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              Quotation
            </h1>
            {initLoading ? (
              <p className="text-[9px] text-gray-500 sm:text-[10px]">Loading setup…</p>
            ) : null}
            {initError ? <p className="text-[9px] text-red-600 sm:text-[10px]">{initError}</p> : null}
            {loadError ? <p className="text-[9px] text-red-600 sm:text-[10px]">{loadError}</p> : null}
            {saveError ? <p className="text-[9px] text-red-600 sm:text-[10px]">{saveError}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="qtn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <img src={PrinterIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || initLoading || !!initError}
              className="qtn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors enabled:hover:border-[#790728] sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleAddQuotation}
              className="qtn-primary flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium text-white transition-colors sm:px-2 sm:py-1 sm:text-[11px]"
              style={{ backgroundColor: primary, borderColor: primary }}
            >
              <svg
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Quotation
            </button>
          </div>
        </header>

        <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-3">
          <div className="flex min-w-0 w-full flex-1 flex-col gap-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>
                  Quote Details
                </h2>
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField
                      fullWidth
                      label="Quotation No"
                      heightPx={28}
                      value={quotationNo}
                      onChange={(e) => setQuotationNo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLoadQuotation();
                        }
                      }}
                      disabled={loadingQuotation}
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
                  <button
                    type="button"
                    onClick={handleLoadQuotation}
                    disabled={loadingQuotation || !stationId}
                    className="w-fit rounded border border-gray-300 bg-white px-2 py-0.5 text-[8px] font-medium text-gray-700 sm:text-[9px] disabled:opacity-50"
                  >
                    {loadingQuotation ? 'Loading…' : 'Load quotation'}
                  </button>
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
                      value={customerId}
                      onChange={(e) => setCustomerId(Number(e.target.value))}
                      className={`${detailRowInput} cursor-pointer`}
                      style={{ accentColor: primary }}
                    >
                      <option value={0}>— Select Customer —</option>
                      {customers.map((c) => (
                        <option key={c.customerId} value={c.customerId}>
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

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold" style={{ color: primary }}>
                  Add Item
                </h2>
                <div className="relative w-full max-w-[300px] min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleProductSearchClick();
                      }
                    }}
                    disabled={!stationId}
                    className="h-[24px] w-full rounded border border-gray-300 bg-white pl-2 pr-[60px] text-[9px] outline-none focus:border-[#790728] sm:h-[28px] sm:text-[10px] disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleProductSearchClick}
                    className="absolute right-1 top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded bg-transparent sm:h-[20px] sm:w-[20px]"
                    aria-label="Search"
                  >
                    <img src={SearchIcon} alt="" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>

                  {showSearchDropdown && productResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-[180px] overflow-auto rounded border border-gray-200 bg-white shadow-md">
                      <div className="border-b border-gray-100 px-2 py-1 text-[8px] font-semibold text-gray-500 sm:text-[9px]">
                        Products
                      </div>
                      {productResults.map((p) => (
                        <button
                          key={`${p.productId}-${p.barCode}-${p.shortDescription}`}
                          type="button"
                          onClick={() => selectProduct(p)}
                          className="block w-full px-2 py-1 text-left text-[8px] text-gray-700 hover:bg-gray-100 sm:text-[9px]"
                        >
                          {p.shortDescription || p.description} — {p.unitPrice} / {p.unit}
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
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    setSelectedProductId(0);
                  }}
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
                <SubInputField label="Tax%" type="number" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} />
                <div className="ml-auto flex shrink-0 items-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                    style={{ backgroundColor: primary }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`qtn-scroll-table w-full overflow-x-hidden ${
                items.length > 5
                  ? 'max-h-[min(15rem,48vh)] overflow-y-auto sm:max-h-[min(17rem,52vh)]'
                  : ''
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
                      <button type="button" className="p-0.5" onClick={() => removeItem(i)} aria-label="Delete line">
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
                  <span className="text-[8px] leading-tight text-gray-600 sm:text-[9px]">Attachments</span>
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
                  <span className="text-gray-600">Tax {Number(headerTaxRate || 0)}%</span>
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
                  <Switch id="qtn-save-terms-param" size="xs" checked={saveTerms} onChange={setSaveTerms} />
                  <span className="leading-tight">Save terms to company defaults</span>
                </div>
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
                <button
                  type="button"
                  className="qtn-outline flex size-5 shrink-0 items-center justify-center rounded border border-gray-300 p-0 sm:size-6"
                  style={{ color: primary }}
                  aria-label="Edit"
                >
                  <img src={EditIcon} alt="" className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                </button>
                <button
                  type="button"
                  title="Duplicate"
                  onClick={handleDuplicate}
                  className="qtn-outline flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded border border-gray-300 px-0.5 py-0.5 text-[7px] font-medium leading-none sm:gap-1 sm:px-1 sm:text-[8px]"
                  style={{ color: primary }}
                >
                  <img src={DuplicateIcon} alt="" className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" style={{ filter: iconFilterPrimary }} />
                  <span className="min-w-0 truncate">Duplicate</span>
                </button>
                <button
                  type="button"
                  title="Proforma"
                  className="qtn-outline flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded border border-gray-300 px-0.5 py-0.5 text-[7px] font-medium leading-none sm:gap-1 sm:px-1 sm:text-[8px]"
                  style={{ color: primary }}
                >
                  <img src={ProformaIcon} alt="" className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" style={{ filter: iconFilterPrimary }} />
                  <span className="min-w-0 truncate">Proforma</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

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
