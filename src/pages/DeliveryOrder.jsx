/**
 * Delivery Order screen – API-backed (init, customers, product lookup, load QU items, get/save/post/cancel).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../constants/theme';
import { InputField, SubInputField, CommonTable } from '../components/ui';
import PrinterIcon from '../assets/icons/printer.svg';
import SearchIcon from '../assets/icons/search2.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import {
  fetchDOEntryInit,
  fetchDOEntryGet,
  loadDOQuotationItems,
  saveDOEntryRequest,
  postDOEntryRequest,
  cancelDOEntryRequest,
  fetchCustomersList,
  fetchProductsLookup,
} from '../api/deliveryOrder/deliveryOrderEntry.service.js';

const primary = colors.primary?.main || colors.primary?.DEFAULT || '#790728';
const primaryHover = colors.primary?.[50] || '#F2E6EA';

function mapApiItemToRow(it, i, defaultTax) {
  const taxPct = Number(it.taxPct ?? it.tax1Rate ?? it.tax1RateC ?? defaultTax ?? 0);
  const taxAmount = Number(it.taxAmount ?? it.tax1Amount ?? it.tax1AmountC ?? 0);
  const discAmt = Number(it.discAmt ?? it.itemDiscount ?? 0);
  const qty = Number(it.qty ?? 0);
  const unitPrice = Number(it.unitPrice ?? 0);
  const gross = qty * unitPrice;
  const discPct = gross > 0 ? Math.round((discAmt / gross) * 10000) / 100 : Number(it.discPct ?? 0);
  const subFromApi = Number(it.subTotal ?? it.subTotalC ?? NaN);
  const subTotal = Number.isFinite(subFromApi) && subFromApi !== 0
    ? subFromApi
    : Math.round((gross - discAmt) * 100) / 100;
  return {
    slNo: i + 1,
    doChildId: Number(it.doChildId ?? 0),
    productId: Number(it.productId ?? 0),
    ownRefNo: String(it.ownRefNo ?? it.productOwnRefNo ?? ''),
    productCode: String(it.productCode ?? it.barCode ?? ''),
    shortDescription: String(it.shortDescription ?? it.description ?? ''),
    serialNo: String(it.serialNo ?? ''),
    packetDetails: String(it.packetDetails ?? ''),
    location: String(it.location ?? ''),
    unit: String(it.unit ?? ''),
    qty,
    unitPrice,
    discPct,
    discAmt,
    subTotal,
    taxPct,
    taxAmount,
    lineTotal: Number(it.lineTotal ?? 0),
    stockStatus: it.stockStatus != null ? String(it.stockStatus) : '',
    minimumRetailPrice: Number(it.minimumRetailPrice ?? 0),
    averageCost: Number(it.averageCost ?? 0),
    origin: String(it.origin ?? ''),
  };
}

export default function DeliveryOrder() {
  const initDataRef = useRef(null);

  const [stationId, setStationId] = useState(0);
  const [editingDOId, setEditingDOId] = useState(0);
  const [deletedChildIds, setDeletedChildIds] = useState([]);
  const [postStatus, setPostStatus] = useState('N');

  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loadingDO, setLoadingDO] = useState(false);
  const [loadingQUItems, setLoadingQUItems] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [salesmenList, setSalesmenList] = useState([]);
  const [headerTaxRate, setHeaderTaxRate] = useState(5);

  // Header fields
  const [doNo, setDoNo] = useState('');
  const [doDate, setDoDate] = useState(new Date().toISOString().slice(0, 10));
  const [enteredDate, setEnteredDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState(0);
  const [customerLPONo, setCustomerLPONo] = useState('');
  const [deliveryBy, setDeliveryBy] = useState('');
  const [billNo, setBillNo] = useState('');
  const [salesManId, setSalesManId] = useState(0);
  const [counterNo, setCounterNo] = useState('');
  const [attention, setAttention] = useState('');
  const [remarks, setRemarks] = useState('');

  // Quotation link
  const [quotationNoInput, setQuotationNoInput] = useState('');
  const [linkedQuotationId, setLinkedQuotationId] = useState(0);

  // Product search / item entry
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [ownRefNo, setOwnRefNo] = useState('');
  const [productCode, setProductCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [packetDetails, setPacketDetails] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discPct, setDiscPct] = useState(0);
  const [discAmt, setDiscAmt] = useState(0);
  const [taxPct, setTaxPct] = useState(5);
  const [productInfo, setProductInfo] = useState({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });

  // Items list
  const [items, setItems] = useState([]);
  const [lineItemDetail, setLineItemDetail] = useState(null);

  // Totals
  const [subTotal, setSubTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const orDash = (v) => (v != null && v !== '' ? String(v) : '—');

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setInitError('');
      try {
        const [initData, custRows] = await Promise.all([
          fetchDOEntryInit(),
          fetchCustomersList(),
        ]);
        if (cancelled) return;
        initDataRef.current = initData;
        setStationId(Number(initData.stationId ?? 0));
        const tax = Number(initData.tax1Percentage ?? 5);
        setHeaderTaxRate(tax);
        setTaxPct(tax);
        const serverDate = initData.serverDate
          ? String(initData.serverDate).slice(0, 10)
          : new Date().toISOString().slice(0, 10);
        setDoDate(serverDate);
        setEnteredDate(serverDate);
        if (Array.isArray(initData.salesmen)) {
          setSalesmenList(initData.salesmen);
        }
        setCustomers(
          (custRows || []).map((c) => ({
            customerId: Number(c.customerId),
            customerName: String(c.customerName ?? ''),
          }))
        );
      } catch (e) {
        if (!cancelled) setInitError(e.message || 'Failed to load delivery order setup.');
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Product search debounce ──────────────────────────────────────────────
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

  // ── Totals ───────────────────────────────────────────────────────────────
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

  // ── Apply loaded DO ──────────────────────────────────────────────────────
  const applyLoadedDO = useCallback((data) => {
    const defTax = Number(initDataRef.current?.tax1Percentage ?? headerTaxRate ?? 5);
    setEditingDOId(Number(data.doId ?? 0));
    setDoNo(String(data.doNo ?? ''));
    setDoDate(data.doDate ? String(data.doDate).slice(0, 10) : new Date().toISOString().slice(0, 10));
    setEnteredDate(data.enteredDate ? String(data.enteredDate).slice(0, 10) : new Date().toISOString().slice(0, 10));
    setCustomerId(Number(data.customerId ?? 0));
    setCustomerLPONo(String(data.customerLPONo ?? ''));
    setDeliveryBy(String(data.deliveryBy ?? ''));
    setBillNo(String(data.billNo ?? ''));
    setSalesManId(Number(data.salesManId ?? 0));
    setCounterNo(String(data.counterNo ?? ''));
    setAttention(String(data.attention ?? ''));
    setRemarks(String(data.remarks ?? ''));
    setDiscountAmount(Number(data.discountAmount ?? data.discount ?? 0));
    setRoundOff(Number(data.roundOffAdj ?? 0));
    setHeaderTaxRate(Number(data.tax1Rate ?? defTax));
    setPostStatus(String(data.postStatus ?? 'N'));
    setLinkedQuotationId(Number(data.linkedQuotationId ?? 0));
    const list = Array.isArray(data.items) ? data.items : [];
    setItems(list.map((it, i) => mapApiItemToRow(it, i, defTax)));
    setDeletedChildIds([]);
    setSaveError('');
    setLoadError('');
  }, [headerTaxRate]);

  // ── Load DO by number ───────────────────────────────────────────────────
  const handleLoadDO = async () => {
    const q = String(doNo).trim();
    if (!q || !stationId) {
      setLoadError(!stationId ? 'Station not ready.' : 'Enter a DO number.');
      return;
    }
    setLoadingDO(true);
    setLoadError('');
    try {
      const data = await fetchDOEntryGet({ stationId, doNo: q });
      applyLoadedDO(data);
    } catch (e) {
      setLoadError(e.message || 'Failed to load delivery order.');
    } finally {
      setLoadingDO(false);
    }
  };

  // ── Load items from quotation ───────────────────────────────────────────
  const handleLoadQuotationItems = async () => {
    const q = quotationNoInput.trim();
    if (!q || !stationId) {
      setLoadError(!stationId ? 'Station not ready.' : 'Enter a quotation number.');
      return;
    }
    setLoadingQUItems(true);
    setLoadError('');
    try {
      const rows = await loadDOQuotationItems({ quotationNo: q, stationId });
      const defTax = Number(initDataRef.current?.tax1Percentage ?? headerTaxRate ?? 5);
      const mapped = rows.map((it, i) => mapApiItemToRow(it, i, defTax));
      if (mapped.length > 0) {
        setLinkedQuotationId(Number(mapped[0]?.quotationId ?? 0));
      }
      setItems(mapped);
      setDeletedChildIds([]);
    } catch (e) {
      setLoadError(e.message || 'Failed to load quotation items.');
    } finally {
      setLoadingQUItems(false);
    }
  };

  // ── Add item ─────────────────────────────────────────────────────────────
  const addItem = () => {
    if (!shortDescription || qty <= 0) return;
    const sub = qty * unitPrice - discAmt;
    const tax = Math.round(sub * (taxPct / 100) * 100) / 100;
    const lineTot = sub + tax;
    const newItem = {
      doChildId: 0,
      productId: selectedProductId,
      ownRefNo,
      productCode,
      shortDescription,
      serialNo,
      packetDetails,
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
      stockStatus: productInfo.stock,
      minimumRetailPrice: Number(productInfo.minPrice || 0),
      averageCost: Number(productInfo.lastCost || 0),
      origin: productInfo.origin,
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
    setTaxPct(headerTaxRate);
    setOwnRefNo('');
    setProductCode('');
    setShortDescription('');
    setSerialNo('');
    setPacketDetails('');
    setLocation('');
    setUnit('');
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
  };

  const removeItem = (idx) => {
    setItems((prev) => {
      const row = prev[idx];
      if (row?.doChildId > 0) {
        setDeletedChildIds((d) => [...d, row.doChildId]);
      }
      return prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, slNo: i + 1 }));
    });
  };

  // ── New DO ────────────────────────────────────────────────────────────────
  const resetFormNew = () => {
    const init = initDataRef.current;
    const serverDate = init?.serverDate
      ? String(init.serverDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const tax = Number(init?.tax1Percentage ?? 5);
    setLineItemDetail(null);
    setEditingDOId(0);
    setDeletedChildIds([]);
    setPostStatus('N');
    setDoNo('');
    setDoDate(serverDate);
    setEnteredDate(serverDate);
    setCustomerId(0);
    setCustomerLPONo('');
    setDeliveryBy('');
    setBillNo('');
    setSalesManId(0);
    setCounterNo('');
    setAttention('');
    setRemarks('');
    setQuotationNoInput('');
    setLinkedQuotationId(0);
    setProductSearch('');
    setProductResults([]);
    setShowSearchDropdown(false);
    setSelectedProductId(0);
    setOwnRefNo('');
    setProductCode('');
    setShortDescription('');
    setSerialNo('');
    setPacketDetails('');
    setLocation('');
    setUnit('');
    setQty(1);
    setUnitPrice(0);
    setDiscPct(0);
    setDiscAmt(0);
    setTaxPct(tax);
    setHeaderTaxRate(tax);
    setDiscountAmount(0);
    setRoundOff(0);
    setItems([]);
    setSaveError('');
    setLoadError('');
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError('');
    if (!stationId) { setSaveError('Station not ready.'); return; }
    const customerName = customers.find((c) => c.customerId === customerId)?.customerName?.trim() || '';
    if (!customerName) { setSaveError('Select a customer.'); return; }
    if (!items.length) { setSaveError('Add at least one line item.'); return; }

    const payload = {
      doId: editingDOId,
      stationId,
      doDate,
      enteredDate,
      customerId,
      customerName,
      customerLPONo,
      deliveryBy,
      billNo,
      salesManId,
      counterNo,
      attention,
      remarks,
      subTotal,
      discountAmount,
      totalAmount,
      tax1Amount: taxAmount,
      tax1Rate: headerTaxRate,
      roundOffAdj: Number(roundOff || 0),
      doAmount: netAmount,
      linkedQuotationId,
      deletedChildIds,
      items: items.map((r) => ({
        doChildId: r.doChildId || 0,
        productId: r.productId ?? 0,
        barCode: r.productCode ?? '',
        shortDescription: r.shortDescription ?? '',
        serialNo: r.serialNo ?? '',
        packetDetails: r.packetDetails ?? '',
        unit: r.unit ?? '',
        qty: r.qty,
        unitPrice: r.unitPrice,
        discAmt: r.discAmt ?? 0,
        subTotal: r.subTotal,
        tax1Amount: r.taxAmount ?? 0,
        tax1Rate: r.taxPct ?? 0,
        lineTotal: r.lineTotal,
        location: r.location ?? '',
        ownRefNo: r.ownRefNo ?? '',
        minimumRetailPrice: r.minimumRetailPrice ?? 0,
        averageCost: r.averageCost ?? 0,
      })),
    };
    setSaving(true);
    try {
      const res = await saveDOEntryRequest(payload);
      setEditingDOId(Number(res.doId ?? editingDOId));
      if (res.doNo != null) setDoNo(String(res.doNo));
      setDeletedChildIds([]);
    } catch (e) {
      setSaveError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Post ──────────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!editingDOId) { setSaveError('Save the DO before posting.'); return; }
    if (postStatus === 'Y') { setSaveError('Delivery order is already posted.'); return; }
    setSaveError('');
    setPosting(true);
    try {
      await postDOEntryRequest({ doId: editingDOId, stationId });
      setPostStatus('Y');
    } catch (e) {
      setSaveError(e.message || 'Post failed.');
    } finally {
      setPosting(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!editingDOId) { setSaveError('No delivery order to cancel.'); return; }
    if (postStatus === 'C') { setSaveError('Delivery order is already cancelled.'); return; }
    setSaveError('');
    setCancelling(true);
    try {
      await cancelDOEntryRequest({ doId: editingDOId, stationId });
      setPostStatus('C');
    } catch (e) {
      setSaveError(e.message || 'Cancel failed.');
    } finally {
      setCancelling(false);
    }
  };

  const isPosted = postStatus === 'Y';
  const isCancelled = postStatus === 'C';
  const isReadOnly = isPosted || isCancelled;

  const tableLineTotal = items.reduce((s, r) => s + Number(r.lineTotal || 0), 0);

  const labelCls =
    'min-w-0 shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:w-[110px] sm:text-[10px]';
  const inputCls =
    'min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px] disabled:opacity-60';

  return (
    <div className="mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .do-outline:hover { border-color: ${primary} !important; background: ${primaryHover} !important; color: ${primary} !important; }
        .do-primary:hover { filter: brightness(1.05); }
        .do-scroll-table td:has(button) { white-space: nowrap; }
      `}</style>

      <div className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white px-2.5 pb-2.5 pt-1.5 shadow-sm sm:gap-3 sm:px-3 sm:pb-3 sm:pt-2">

        {/* ── Header bar ─────────────────────────────────────────────────── */}
        <header className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
                DELIVERY ORDER
              </h1>
              {isPosted && (
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[8px] font-bold text-green-700 sm:text-[9px]">
                  POSTED
                </span>
              )}
              {isCancelled && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[8px] font-bold text-red-700 sm:text-[9px]">
                  CANCELLED
                </span>
              )}
            </div>
            {initLoading ? <p className="text-[9px] text-gray-500 sm:text-[10px]">Loading setup…</p> : null}
            {initError ? <p className="text-[9px] text-red-600 sm:text-[10px]">{initError}</p> : null}
            {loadError ? <p className="text-[9px] text-red-600 sm:text-[10px]">{loadError}</p> : null}
            {saveError ? <p className="text-[9px] text-red-600 sm:text-[10px]">{saveError}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="do-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <img src={PrinterIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling || isReadOnly || !editingDOId}
              className="do-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Cancel DO'}
            </button>
            <button
              type="button"
              onClick={handlePost}
              disabled={posting || isReadOnly || !editingDOId}
              className="do-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isReadOnly || initLoading || !!initError}
              className="do-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={resetFormNew}
              className="do-primary flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium text-white transition-colors sm:px-2 sm:py-1 sm:text-[11px]"
              style={{ backgroundColor: primary, borderColor: primary }}
            >
              <svg className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              New DO
            </button>
          </div>
        </header>

        <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-3">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="flex min-w-0 w-full flex-1 flex-col gap-3">

            {/* DO header fields */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">

              {/* DO Details */}
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>DO Details</h2>
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField
                      fullWidth
                      label="DO No"
                      heightPx={28}
                      value={doNo}
                      onChange={(e) => setDoNo(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLoadDO(); } }}
                      disabled={loadingDO}
                    />
                    <InputField
                      fullWidth
                      label="DO Date"
                      type="date"
                      heightPx={28}
                      value={doDate}
                      onChange={(e) => setDoDate(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDO}
                    disabled={loadingDO || !stationId}
                    className="w-fit rounded border border-gray-300 bg-white px-2 py-0.5 text-[8px] font-medium text-gray-700 sm:text-[9px] disabled:opacity-50"
                  >
                    {loadingDO ? 'Loading…' : 'Load DO'}
                  </button>
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <InputField
                      fullWidth
                      label="Entered Date"
                      type="date"
                      heightPx={28}
                      value={enteredDate}
                      onChange={(e) => setEnteredDate(e.target.value)}
                      disabled={isReadOnly}
                    />
                    <SubInputField
                      fullWidth
                      label="Bill #"
                      heightPx={28}
                      value={billNo}
                      onChange={(e) => setBillNo(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField
                      fullWidth
                      label="Delivery By"
                      heightPx={28}
                      value={deliveryBy}
                      onChange={(e) => setDeliveryBy(e.target.value)}
                      disabled={isReadOnly}
                    />
                    <SubInputField
                      fullWidth
                      label="Counter"
                      heightPx={28}
                      value={counterNo}
                      onChange={(e) => setCounterNo(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>Customer</h2>
                <div className="flex flex-col gap-1 sm:gap-[8px]">
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={labelCls}>Customer Name</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(Number(e.target.value))}
                      disabled={isReadOnly}
                      className={`${inputCls} cursor-pointer`}
                      style={{ accentColor: primary }}
                    >
                      <option value={0}>— Select Customer —</option>
                      {customers.map((c) => (
                        <option key={c.customerId} value={c.customerId}>{c.customerName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={labelCls}>Customer LPO No</label>
                    <input
                      type="text"
                      value={customerLPONo}
                      onChange={(e) => setCustomerLPONo(e.target.value)}
                      disabled={isReadOnly}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={labelCls}>Sales Man</label>
                    <select
                      value={salesManId}
                      onChange={(e) => setSalesManId(Number(e.target.value))}
                      disabled={isReadOnly}
                      className={`${inputCls} cursor-pointer`}
                      style={{ accentColor: primary }}
                    >
                      <option value={0}>— Select —</option>
                      {salesmenList.map((s) => (
                        <option key={s.salesManId ?? s.staffId} value={s.salesManId ?? s.staffId}>
                          {s.salesManName ?? s.staffName ?? s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotation link */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex items-end gap-1">
                  <SubInputField
                    label="Load from Quotation No"
                    heightPx={28}
                    widthPx={180}
                    value={quotationNoInput}
                    onChange={(e) => setQuotationNoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLoadQuotationItems(); } }}
                    disabled={loadingQUItems || isReadOnly}
                  />
                  <button
                    type="button"
                    onClick={handleLoadQuotationItems}
                    disabled={loadingQUItems || !stationId || isReadOnly}
                    className="mb-0 h-[28px] rounded border border-gray-300 bg-white px-2 text-[8px] font-medium text-gray-700 sm:text-[9px] disabled:opacity-50"
                  >
                    {loadingQUItems ? 'Loading…' : 'Load Items'}
                  </button>
                </div>
                {linkedQuotationId > 0 && (
                  <span className="text-[8px] text-gray-500 sm:text-[9px]">Linked Quotation ID: {linkedQuotationId}</span>
                )}
              </div>
            </div>

            {/* Add Item */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold" style={{ color: primary }}>Add Item</h2>
                <div className="relative w-full max-w-[300px] min-w-[180px]">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowSearchDropdown(true); }}
                    onFocus={() => setShowSearchDropdown(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleProductSearchClick(); } }}
                    disabled={!stationId || isReadOnly}
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
                <SubInputField label="Own Ref" value={ownRefNo} onChange={(e) => setOwnRefNo(e.target.value)} disabled={isReadOnly} />
                <InputField label="Product Code" value={productCode} onChange={(e) => setProductCode(e.target.value)} disabled={isReadOnly} />
                <InputField
                  label="Short Desc"
                  value={shortDescription}
                  onChange={(e) => { setShortDescription(e.target.value); setSelectedProductId(0); }}
                  disabled={isReadOnly}
                />
                <SubInputField label="Serial #" value={serialNo} onChange={(e) => setSerialNo(e.target.value)} disabled={isReadOnly} />
                <InputField label="Packet Details" value={packetDetails} onChange={(e) => setPacketDetails(e.target.value)} disabled={isReadOnly} />
                <InputField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={isReadOnly} />
                <SubInputField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={isReadOnly} />
                <SubInputField
                  label="Qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  disabled={isReadOnly}
                />
                <SubInputField
                  label="Unit Price"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                />
                <SubInputField label="Disc" type="number" value={discAmt} onChange={(e) => setDiscAmt(Number(e.target.value))} disabled={isReadOnly} />
                <SubInputField label="Tax%" type="number" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} disabled={isReadOnly} />
                {!isReadOnly && (
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
                )}
              </div>
            </div>

            {/* Items table */}
            <div
              className={`do-scroll-table w-full overflow-x-hidden ${
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
                  'Serial #',
                  'Packet Details',
                  'Loc',
                  'Unit',
                  'Qty',
                  'Price',
                  'Disc%',
                  'Disc',
                  'Sub Total',
                  'Tax%',
                  'Tax',
                  'Total',
                  'Action',
                ]}
                rows={[
                  ...items.map((r, i) => [
                    r.slNo,
                    r.ownRefNo,
                    r.productCode,
                    r.shortDescription,
                    r.serialNo,
                    r.packetDetails,
                    r.location,
                    r.unit,
                    r.qty,
                    r.unitPrice?.toFixed(2),
                    r.discPct,
                    r.discAmt?.toFixed(2),
                    r.subTotal?.toFixed(2),
                    r.taxPct,
                    r.taxAmount?.toFixed(2),
                    r.lineTotal?.toFixed(2),
                    <div key={`act-${i}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
                      <button type="button" className="p-0.5" onClick={() => setLineItemDetail(r)} aria-label="View line">
                        <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      {!isReadOnly && (
                        <button type="button" className="p-0.5" onClick={() => removeItem(i)} aria-label="Delete line">
                          <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      )}
                    </div>,
                  ]),
                  [
                    { content: 'Total', colSpan: 9, className: 'text-left font-bold' },
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    tableLineTotal.toFixed(2),
                    '',
                  ],
                ]}
              />
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────────────── */}
          <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-[250px]">

            {/* Product Info */}
            <div className="rounded-lg border border-gray-200 bg-[#F2E6EA]/30 p-2.5 shadow-sm sm:p-3">
              <h2 className="mb-2 text-[10px] font-semibold sm:text-[11px]" style={{ color: primary }}>
                Product Info
              </h2>
              <div className="space-y-1.5 text-[9px] leading-tight text-gray-800 sm:text-[10px]">
                {[
                  ['Last Purchase Cost', productInfo.lastCost],
                  ['Origin', productInfo.origin],
                  ['Product Code', productCode],
                  ['Min. Unit Price', productInfo.minPrice],
                  ['Stock On Hand', productInfo.stock],
                  ['Location', productInfo.loc],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-gray-600">{label}</span>
                    <span className="min-w-0 shrink text-right font-medium">{val || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-lg border-2 border-[#790728]/50 bg-[#F2E6EA]/40 p-2.5 shadow-md sm:p-3">
              <h2 className="mb-2 text-[10px] font-bold sm:text-[11px]" style={{ color: primary }}>Totals</h2>
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
                    disabled={isReadOnly}
                    className="h-[22px] w-[4.5rem] shrink-0 rounded border border-gray-300 bg-white px-1.5 py-0 text-right text-[9px] tabular-nums outline-none sm:h-[24px] sm:text-[10px] disabled:opacity-60"
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
                    disabled={isReadOnly}
                    className="h-[22px] w-[4.5rem] shrink-0 rounded border border-gray-300 bg-white px-1.5 py-0 text-right text-[9px] tabular-nums outline-none sm:h-[24px] sm:text-[10px] disabled:opacity-60"
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

            {/* Remarks */}
            <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
              <h2 className="mb-2 text-[10px] font-semibold text-gray-700 sm:text-[11px]">Remarks</h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="w-[72px] shrink-0 text-[9px] font-semibold text-gray-600 sm:text-[10px]">Attention</label>
                  <input
                    type="text"
                    value={attention}
                    onChange={(e) => setAttention(e.target.value)}
                    disabled={isReadOnly}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <label className="w-[72px] shrink-0 pt-1 text-[9px] font-semibold text-gray-600 sm:text-[10px]">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    placeholder="Enter remarks..."
                    className={`${inputCls} min-h-[56px] resize-y`}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Line item detail modal ─────────────────────────────────────── */}
      {lineItemDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setLineItemDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="do-line-detail-title"
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
              id="do-line-detail-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              Line item details
            </h2>
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              {[
                ['Sl', lineItemDetail.slNo],
                ['Own Ref', lineItemDetail.ownRefNo],
                ['Product Code', lineItemDetail.productCode],
                ['Description', lineItemDetail.shortDescription],
                ['Serial #', lineItemDetail.serialNo],
                ['Packet Details', lineItemDetail.packetDetails],
                ['Location', lineItemDetail.location],
                ['Unit', lineItemDetail.unit],
                ['Qty', lineItemDetail.qty],
                ['Unit Price', lineItemDetail.unitPrice != null ? Number(lineItemDetail.unitPrice).toFixed(2) : ''],
                ['Disc %', lineItemDetail.discPct],
                ['Disc Amt', lineItemDetail.discAmt != null ? Number(lineItemDetail.discAmt).toFixed(2) : ''],
                ['Sub Total', lineItemDetail.subTotal != null ? Number(lineItemDetail.subTotal).toFixed(2) : ''],
                ['Tax %', lineItemDetail.taxPct],
                ['Tax Amt', lineItemDetail.taxAmount != null ? Number(lineItemDetail.taxAmount).toFixed(2) : ''],
                ['Line Total', lineItemDetail.lineTotal != null ? Number(lineItemDetail.lineTotal).toFixed(2) : ''],
                ['Stock', lineItemDetail.stockStatus],
                ['Min Price', lineItemDetail.minimumRetailPrice != null ? Number(lineItemDetail.minimumRetailPrice).toFixed(2) : ''],
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
