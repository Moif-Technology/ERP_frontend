/**
 * Delivery order — same API pattern as Quotation (branch, customer, lines, save).
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField, SubInputField, CommonTable, ConfirmDialog, DropdownInput } from '../../../shared/components/ui';
import DatePickerInput from '../../../shared/components/ui/DatePickerInput';
import TableTotalsBar from '../../../shared/components/ui/TableTotalsBar';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as customerEntryApi from '../../../services/customerEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as quotationEntryApi from '../../../services/quotationEntry.api.js';
import * as deliveryOrderEntryApi from '../../../services/deliveryOrderEntry.api.js';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || colors.primary?.DEFAULT || '#790728';

const purchaseToolbarBtn =
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50';

/** Match Purchase line entry control height */
const DO_LINE_ENTRY_H = 26;

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

export default function DeliveryOrder() {
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [customersRows, setCustomersRows] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [doNo, setDoNo] = useState('');
  const [doDate, setDoDate] = useState(() => new Date().toISOString().slice(0, 10));
  /** '' or business quotationId string from dropdown */
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [quotationsRows, setQuotationsRows] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [staffRows, setStaffRows] = useState([]);
  const [staffLoadError, setStaffLoadError] = useState('');
  /** '' or company staff_id (business id) for ops.delivery_order_master.salesman_id */
  const [selectedSalesmanStaffId, setSelectedSalesmanStaffId] = useState('');
  const [loadingQuotationDetail, setLoadingQuotationDetail] = useState(false);
  const quotationPrefillSeq = useRef(0);
  const [customerLpo, setCustomerLpo] = useState('');
  const [deliveryBy, setDeliveryBy] = useState('');
  /** Optional POS / register counter number */
  const [counterNoStr, setCounterNoStr] = useState('');
  const [remarks, setRemarks] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

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
  const [roundOff, setRoundOff] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const [productInfo, setProductInfo] = useState({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
  const [lineItemDetail, setLineItemDetail] = useState(null);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState(null);

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

        setStaffLoadError('');
        try {
          const { data: staffData } = await staffEntryApi.listStaffMembers({ limit: 400 });
          if (!cancelled) setStaffRows(staffData?.staff || []);
        } catch (err) {
          if (!cancelled) {
            setStaffRows([]);
            setStaffLoadError(err.response?.data?.message || err.message || 'Could not load staff list');
          }
        }
      } catch {
        if (!cancelled) {
          setBranches([]);
          setCustomersRows([]);
          setStaffRows([]);
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
    quotationPrefillSeq.current += 1;
    if (!branchId) {
      setQuotationsRows([]);
      setSelectedQuotationId('');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingQuotations(true);
      try {
        const { data } = await quotationEntryApi.listQuotations({
          branchId: Number(branchId),
          limit: 150,
        });
        if (cancelled) return;
        setQuotationsRows(data?.quotations || []);
      } catch {
        if (!cancelled) setQuotationsRows([]);
      } finally {
        if (!cancelled) setLoadingQuotations(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const quotationOptions = useMemo(
    () =>
      (quotationsRows || []).map((q) => ({
        value: String(q.quotationId),
        label: `${q.quotationNo || 'QTN'} · ${String(q.quotationDate || '').slice(0, 10)}${q.customerName ? ` · ${q.customerName}` : ''}`,
      })),
    [quotationsRows],
  );

  const quotationDropdownOptions = useMemo(
    () => [{ value: '', label: loadingQuotations ? 'Loading quotations…' : '— No quotation —' }, ...quotationOptions],
    [loadingQuotations, quotationOptions],
  );

  const staffDropdownOptions = useMemo(
    () => [
      { value: '', label: '— No salesman —' },
      ...(staffRows || []).map((s) => ({
        value: String(s.staffId),
        label: s.staffCode ? `${s.staffName} (${s.staffCode})` : `${s.staffName} (#${s.staffId})`,
      })),
    ],
    [staffRows],
  );

  /** Load full quotation (header + lines) and fill DO form. */
  const applyQuotationSelection = async (quotationBusinessIdStr) => {
    const v = String(quotationBusinessIdStr || '').trim();
    setSelectedQuotationId(v);
    if (!v) return;
    const seq = ++quotationPrefillSeq.current;
    setSaveError('');
    setLoadingQuotationDetail(true);
    try {
      const qid = Number(v);
      const { data } = await quotationEntryApi.getQuotation(qid);
      if (seq !== quotationPrefillSeq.current) return;
      const q = data?.quotation;
      const lines = Array.isArray(data?.lines) ? data.lines : [];
      if (!q) {
        setSaveError('Quotation response was empty.');
        return;
      }
      if (q.customerId != null) {
        setCustomerId(String(q.customerId));
        const cust = customersRows.find((c) => String(c.customerId) === String(q.customerId));
        setCustomerAddress(q.customerAddress || cust?.address || '');
      }
      if (q.quotationDate) {
        const d = String(q.quotationDate).slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) setDoDate(d);
      }
      setDiscountAmount(Number(q.discountAmount) || 0);
      setRoundOff(Number(q.roundOffAdjustment) || 0);
      setRemarks([q.remarks, q.quotationTerms].filter(Boolean).join('\n\n'));

      const mapped = lines.map((L, idx) => {
        const qty = Number(L.qty) || 0;
        const unitPrice = Number(L.unitPrice) || 0;
        const discAmt = Number(L.itemDiscount) || 0;
        const gross = qty * unitPrice;
        const discPct = gross > 0 ? Math.round((discAmt / gross) * 10000) / 100 : 0;
        const sub = Number(L.subtotalAmount) || Math.round((gross - discAmt) * 100) / 100;
        const lineTotal = Number(L.lineTotal) || sub;
        return {
          slNo: idx + 1,
          productId: L.productId,
          ownRefNo: L.barcode || '',
          productCode: L.barcode || '',
          shortDescription: (L.productDescription || '').trim() || '—',
          location: L.locationCode || '',
          unit: L.unitName || '',
          qty,
          unitPrice,
          discPct,
          discAmt,
          subTotal: sub,
          taxPct: 0,
          taxAmount: 0,
          lineTotal,
          origin: L.originName || '',
          stockStatus: L.stockStatus || '',
          quotationId: qid,
        };
      });
      setItems(mapped);
      setSelectedProductId(null);
    } catch (err) {
      if (seq !== quotationPrefillSeq.current) return;
      setSaveError(err.response?.data?.message || 'Could not load quotation details.');
    } finally {
      if (seq === quotationPrefillSeq.current) setLoadingQuotationDetail(false);
    }
  };

  const getFilteredProducts = (query) => {
    if (!branchId) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return productsCatalog.filter((p) => {
      const shortDesc = String(p.shortDescription ?? '').toLowerCase();
      const code = String(p.barCode ?? '').toLowerCase();
      const u = String(p.unit ?? '').toLowerCase();
      return shortDesc.includes(q) || code.includes(q) || u.includes(q);
    });
  };

  const handleProductSearch = () => {
    const filtered = getFilteredProducts(productSearch.trim());
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
    const lineTotal = sub;
    const headerQid = selectedQuotationId.trim() ? parseInt(selectedQuotationId, 10) : NaN;
    const lineQuotationId = Number.isFinite(headerQid) && headerQid >= 1 ? headerQid : undefined;
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
      taxAmount: 0,
      lineTotal,
      quotationId: lineQuotationId,
    };
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

  const parseHeaderQuotationId = () => {
    const t = selectedQuotationId.trim();
    if (!t) return undefined;
    const n = parseInt(t, 10);
    return Number.isFinite(n) && n >= 1 ? n : undefined;
  };

  const handleSaveDeliveryOrder = async () => {
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
    if (items.some((r) => !r.productId)) {
      setSaveError('Each line must have a product (use search to pick a product).');
      return;
    }
    setSaving(true);
    try {
      const qid = parseHeaderQuotationId();
      const qRow = quotationsRows.find((q) => String(q.quotationId) === selectedQuotationId);
      const qno = qRow?.quotationNo?.trim() || undefined;
      const payload = {
        branchId: Number(branchId),
        deliveryOrderDate: doDate,
        customerId: customerId ? Number(customerId) : undefined,
        customerName: customersRows.find((c) => String(c.customerId) === customerId)?.customerName,
        quotationId: qid,
        quotationNo: qno,
        customerLpoNo: customerLpo.trim() || undefined,
        deliveryBy: deliveryBy.trim() || undefined,
        salesmanId: selectedSalesmanStaffId.trim() ? Number(selectedSalesmanStaffId) : undefined,
        counterNo: counterNoStr.trim() ? Number(counterNoStr) : undefined,
        remarks: remarks.trim() || undefined,
        discountAmount,
        roundOff: Number(roundOff) || 0,
        lines: items.map((r) => ({
          productId: r.productId,
          barcode: r.ownRefNo || r.productCode || undefined,
          shortDescription: r.shortDescription,
          unitName: r.unit || undefined,
          qty: r.qty,
          unitPrice: r.unitPrice,
          itemDiscount: r.discAmt ?? 0,
          quotationId: r.quotationId,
        })),
      };
      const { data } = await deliveryOrderEntryApi.createDeliveryOrder(payload);
      const d = data.deliveryOrder;
      setDoNo(d.deliveryOrderNo || '');
      setSuccessMsg(`Saved delivery order ${d.deliveryOrderNo} (id ${d.deliveryOrderId}).`);
      setLineItemDetail(null);
      setItems([]);
      setDiscountAmount(0);
      setRoundOff(0);
      setSelectedQuotationId('');
      setSelectedSalesmanStaffId('');
      setCustomerLpo('');
      setDeliveryBy('');
      setCounterNoStr('');
      setRemarks('');
      setSelectedProductId(null);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save delivery order.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDeliveryOrder = () => {
    setLineItemDetail(null);
    setDoNo('');
    setDoDate(new Date().toISOString().slice(0, 10));
    setSelectedQuotationId('');
    setSelectedSalesmanStaffId('');
    setCustomerLpo('');
    setDeliveryBy('');
    setCounterNoStr('');
    setRemarks('');
    setCustomerId('');
    setCustomerAddress('');
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
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
    setSelectedProductId(null);
    setSaveError('');
    setSuccessMsg('');
    setStaffLoadError('');
  };

  useEffect(() => {
    let sub = 0;
    items.forEach((r) => {
      sub += r.subTotal;
    });
    const tot = sub - discountAmount;
    setSubTotal(sub);
    setNetAmount(Math.round((tot + Number(roundOff || 0)) * 100) / 100);
  }, [items, discountAmount, roundOff]);

  const totalPrice = items.reduce((sum, r) => sum + Number(r.unitPrice || 0), 0);
  const tableTaxTotal = items.reduce((sum, r) => sum + Number(r.taxAmount || 0), 0);
  const tableLineTotal = items.reduce((sum, r) => sum + Number(r.lineTotal || 0), 0);

  const quoteDetailRowLabel =
    'min-w-0 shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-[10px]';
  const detailRowInput =
    'min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]';

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        .do-scroll-table td:has(button) { white-space: nowrap; }
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            DELIVERY ORDER
          </h1>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button type="button" className={purchaseToolbarBtn} title="Print" aria-label="Print">
              <img src={PrinterIcon} alt="" className="h-3 w-3" />
              Print
            </button>
            <button type="button" className={purchaseToolbarBtn} title="Cancel" aria-label="Cancel">
              <img src={CancelIcon} alt="" className="h-3 w-3" />
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: primary, borderColor: primary }}
              onClick={handleSaveDeliveryOrder}
              disabled={saving || loadingRefs}
            >
              {saving ? (
                'Saving…'
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </>
              )}
            </button>
            <button type="button" onClick={handleAddDeliveryOrder} className={purchaseToolbarBtn} title="New delivery order" aria-label="New delivery order">
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              New DO
            </button>
          </div>
        </header>
        {(saveError || successMsg || staffLoadError) && (
          <div className="shrink-0 px-0.5 text-[10px] sm:text-[11px]">
            {saveError && <p className="text-red-600">{saveError}</p>}
            {staffLoadError && <p className="text-amber-800">{staffLoadError}</p>}
            {successMsg && <p className="text-emerald-700">{successMsg}</p>}
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3">
                <div className="-mx-2.5 -mt-2.5 mb-2.5 border-b border-neutral-200 bg-neutral-50 px-2.5 py-2 sm:-mx-3 sm:-mt-3 sm:px-3"><span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500">DO details</span></div>
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <DropdownInput
                    label="Branch"
                    placeholder={loadingRefs ? 'Loading…' : 'Select branch'}
                    options={branchOptions}
                    value={branchId}
                    onChange={(v) => setBranchId(v)}
                    fullWidth
                    heightPx={DO_LINE_ENTRY_H}
                    disabled={loadingRefs || !branchOptions.length}
                  />
                  <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField fullWidth label="DO No" heightPx={DO_LINE_ENTRY_H} value={doNo} onChange={() => {}} placeholder="Auto on save" readOnly />
                    <div className="flex w-full min-w-0 flex-col gap-[3px]">
                      <span className="text-[9px] font-medium text-neutral-500 sm:text-[10px]">DO date</span>
                      <DatePickerInput
                        value={doDate}
                        onChange={(e) => setDoDate(e.target.value)}
                        heightPx={DO_LINE_ENTRY_H}
                        displayFontSize={10}
                        fullWidth
                        dropdownInViewport
                      />
                    </div>
                  </div>
                  <DropdownInput
                    label="From quotation (optional)"
                    placeholder={
                      !branchId
                        ? 'Select branch first'
                        : loadingQuotations
                          ? 'Loading quotations…'
                          : loadingQuotationDetail
                            ? 'Loading quotation lines…'
                            : 'Pick a saved quotation'
                    }
                    options={quotationDropdownOptions}
                    value={selectedQuotationId}
                    onChange={(v) => {
                      void applyQuotationSelection(v);
                    }}
                    fullWidth
                    heightPx={DO_LINE_ENTRY_H}
                    disabled={!branchId || loadingQuotations || loadingQuotationDetail}
                  />
                  <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <SubInputField fullWidth label="Customer LPO" heightPx={DO_LINE_ENTRY_H} value={customerLpo} onChange={(e) => setCustomerLpo(e.target.value)} />
                    <SubInputField fullWidth label="Delivery by" heightPx={DO_LINE_ENTRY_H} value={deliveryBy} onChange={(e) => setDeliveryBy(e.target.value)} />
                  </div>
                  <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[6px]">
                    <DropdownInput
                      label="Salesman"
                      placeholder="Select salesman"
                      options={staffDropdownOptions}
                      value={selectedSalesmanStaffId}
                      onChange={(v) => setSelectedSalesmanStaffId(v)}
                      fullWidth
                      heightPx={DO_LINE_ENTRY_H}
                    />
                    <SubInputField
                      fullWidth
                      label="Counter no."
                      heightPx={DO_LINE_ENTRY_H}
                      value={counterNoStr}
                      onChange={(e) => setCounterNoStr(e.target.value)}
                      placeholder="POS / counter"
                    />
                  </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3">
              <div className="-mx-2.5 -mt-2.5 mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-2.5 py-2 sm:-mx-3 sm:-mt-3 sm:px-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500">Add line</span>
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
                    className="box-border w-full rounded-md border border-neutral-200 bg-white pl-2 pr-[52px] text-[10px] text-gray-900 outline-none focus:border-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                    style={{ height: DO_LINE_ENTRY_H, minHeight: DO_LINE_ENTRY_H }}
                  />
                  <button
                    type="button"
                    onClick={handleProductSearch}
                    className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100"
                    aria-label="Search"
                  >
                    <img src={SearchIcon} alt="" className="h-3 w-3 opacity-70" />
                  </button>
                  {showSearchDropdown && productResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-52 overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg">
                      {productResults.map((p) => (
                        <button
                          key={p.productId}
                          type="button"
                          onClick={() => selectProduct(p)}
                          className="block w-full px-2.5 py-1.5 text-left text-[10px] text-neutral-800 hover:bg-neutral-50"
                        >
                          {p.shortDescription} — {p.unitPrice} / {p.unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
                  {[
                    { label: 'Own Ref', value: ownRefNo, onChange: (e) => setOwnRefNo(e.target.value) },
                    { label: 'Product Code', value: productCode, onChange: (e) => setProductCode(e.target.value) },
                    { label: 'Short Desc', value: shortDescription, onChange: (e) => setShortDescription(e.target.value) },
                    { label: 'Location', value: location, onChange: (e) => setLocation(e.target.value) },
                  ].map(({ label, value, onChange }) => (
                    <div key={label} className="flex min-w-0 flex-col gap-[3px]">
                      <label className="text-[10px] font-medium text-neutral-500">{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={onChange}
                        className="w-full rounded border border-neutral-200 bg-white px-2 text-[10px] text-gray-900 outline-none focus:border-neutral-400"
                        style={{ height: DO_LINE_ENTRY_H }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-5">
                  {[
                    { label: 'Unit', value: unit, onChange: (e) => setUnit(e.target.value), type: 'text' },
                    { label: 'Qty', value: qty, onChange: (e) => setQty(Number(e.target.value)), type: 'number' },
                    { label: 'Unit Price', value: unitPrice, onChange: (e) => setUnitPrice(Number(e.target.value)), type: 'number' },
                    {
                      label: 'Disc.%', value: discPct, type: 'number',
                      onChange: (e) => { const v = Number(e.target.value); setDiscPct(v); setDiscAmt(qty * unitPrice * (v / 100)); },
                    },
                    { label: 'Disc', value: discAmt, onChange: (e) => setDiscAmt(Number(e.target.value)), type: 'number' },
                  ].map(({ label, value, onChange, type }) => (
                    <div key={label} className="flex min-w-0 flex-col gap-[3px]">
                      <label className="text-[10px] font-medium text-neutral-500">{label}</label>
                      <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        className="w-full rounded border border-neutral-200 bg-white px-2 text-[10px] tabular-nums text-gray-900 outline-none focus:border-neutral-400"
                        style={{ height: DO_LINE_ENTRY_H }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex shrink-0 items-center justify-center rounded-md border px-4 text-[10px] font-semibold leading-none text-white"
                    style={{ backgroundColor: primary, borderColor: primary, height: DO_LINE_ENTRY_H, minHeight: DO_LINE_ENTRY_H }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

          </div>

          <aside className="flex w-full min-w-0 shrink-0 flex-col gap-3 xl:min-w-0">
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3">
              <div className="-mx-2.5 -mt-2.5 mb-2.5 border-b border-neutral-200 bg-neutral-50 px-2.5 py-2 sm:-mx-3 sm:-mt-3 sm:px-3"><span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500">Customer</span></div>
              <div className="flex flex-col gap-1 sm:gap-[8px]">
                <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                  <label className={quoteDetailRowLabel}>Customer</label>
                  <select
                    value={customerId === '' ? '' : String(customerId)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomerId(v);
                      const row = customersRows.find((c) => String(c.customerId) === v);
                      setCustomerAddress(row?.address || '');
                    }}
                    className={`${detailRowInput} cursor-pointer`}
                  >
                    <option value="">— Select —</option>
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
                <div className="flex w-full items-start justify-start gap-2 sm:gap-[10px]">
                  <label className={`${quoteDetailRowLabel} pt-1`}>Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    className={`${detailRowInput} min-h-[48px] resize-y`}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3">
              <div className="-mx-2.5 -mt-2.5 mb-2.5 border-b border-neutral-200 bg-neutral-50 px-2.5 py-2 sm:-mx-3 sm:-mt-3 sm:px-3"><span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500">Product info</span></div>
              <div className="space-y-2 text-[11px] text-gray-800">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Code</span>
                  <span className="text-right font-semibold">{productCode || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Stock</span>
                  <span className="text-right font-semibold">{productInfo.stock || '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Location</span>
                  <span className="text-right font-semibold">{productInfo.loc || '—'}</span>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm sm:p-3">
              <div className="-mx-2.5 -mt-2.5 mb-2.5 border-b border-neutral-200 bg-neutral-50 px-2.5 py-2 sm:-mx-3 sm:-mt-3 sm:px-3"><span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500">Totals</span></div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500">Sub total</span>
                  <span className="font-semibold tabular-nums text-neutral-900">{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-500">Discount</span>
                  <input
                    type="number"
                    className="w-20 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-right text-[11px] text-neutral-900 outline-none focus:border-neutral-400"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-500">Round off</span>
                  <input
                    type="number"
                    className="w-20 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-right text-[11px] text-neutral-900 outline-none focus:border-neutral-400"
                    value={roundOff}
                    onChange={(e) => setRoundOff(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-[12px] font-bold" style={{ color: primary }}>
                  <span>Net</span>
                  <span className="tabular-nums">{netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200">
          <div
            className={`do-scroll-table min-h-0 flex-1 overflow-x-auto ${
              items.length > 5 ? 'max-h-[min(15rem,48vh)] overflow-y-auto sm:max-h-[min(17rem,52vh)]' : ''
            }`}
          >
            <CommonTable
              className="min-h-0 flex-1"
              fitParentWidth
              stickyHeader={items.length > 7}
              headers={['Sl', 'Own Ref', 'Code', 'Description', 'Loc', 'Unit', 'Qty', 'Price', 'Disc%', 'Disc', 'Tax%', 'Tax', 'Total', 'Action']}
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
                <div key={`act-${i}`} className="flex items-center justify-center gap-0.5">
                  <button type="button" className="p-0.5" onClick={() => setLineItemDetail(r)} aria-label="View">
                    <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                  <button type="button" className="p-0.5" onClick={() => setPendingRemoveIndex(i)} aria-label="Delete">
                    <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>,
              ])}
            />
          </div>
          <TableTotalsBar
            borderColor="#e5e5e5"
            columns={6}
            items={[
              ['Qty Total', items.reduce((s, r) => s + Number(r.qty || 0), 0)],
              ['Price Sum', totalPrice.toFixed(2)],
              ['Discount', items.reduce((s, r) => s + Number(r.discAmt || 0), 0).toFixed(2)],
              ['Tax Total', tableTaxTotal.toFixed(2)],
              ['Sub Total', subTotal.toFixed(2), true],
              ['Net Amount', netAmount.toFixed(2), true],
            ]}
          />
        </div>

        <ConfirmDialog
          open={pendingRemoveIndex !== null}
          title="Remove line?"
          message="Remove this line from the delivery order?"
          confirmLabel="Remove"
          cancelLabel="Cancel"
          danger
          onClose={() => setPendingRemoveIndex(null)}
          onConfirm={() => {
            if (pendingRemoveIndex !== null) removeItem(pendingRemoveIndex);
            setPendingRemoveIndex(null);
          }}
        />
      </div>

      {lineItemDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={() => setLineItemDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={ViewActionIcon} alt="" className="h-4 w-4 opacity-60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">Line Detail</span>
              </div>
              <button
                type="button"
                onClick={() => setLineItemDetail(null)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product name banner */}
            <div className="border-b border-neutral-100 px-4 py-3" style={{ background: `linear-gradient(135deg, rgba(121,7,40,0.06) 0%, #fff 60%)` }}>
              <p className="text-[10px] font-medium text-neutral-400">Description</p>
              <p className="mt-0.5 text-[13px] font-bold text-neutral-900">{lineItemDetail.shortDescription || '—'}</p>
              <p className="text-[10px] text-neutral-500">{lineItemDetail.productCode || lineItemDetail.ownRefNo || '—'}</p>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-px bg-neutral-100">
              {[
                { label: 'Sl No', value: lineItemDetail.slNo },
                { label: 'Unit', value: lineItemDetail.unit || '—' },
                { label: 'Location', value: lineItemDetail.location || '—' },
                { label: 'Qty', value: lineItemDetail.qty },
                { label: 'Unit Price', value: Number(lineItemDetail.unitPrice || 0).toFixed(2) },
                { label: 'Disc %', value: Number(lineItemDetail.discPct || 0).toFixed(2) },
                { label: 'Disc Amt', value: Number(lineItemDetail.discAmt || 0).toFixed(2) },
                { label: 'Sub Total', value: Number(lineItemDetail.subTotal || 0).toFixed(2) },
                { label: 'Tax %', value: Number(lineItemDetail.taxPct || 0).toFixed(2) },
                { label: 'Tax Amt', value: Number(lineItemDetail.taxAmount || 0).toFixed(2) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 bg-white px-3 py-2">
                  <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">{label}</span>
                  <span className="text-[11px] font-semibold tabular-nums text-neutral-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Footer — Line Total */}
            <div className="flex items-center justify-between border-t-2 px-4 py-3" style={{ borderColor: primary }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: primary }}>Line Total</span>
              <span className="text-[15px] font-bold tabular-nums" style={{ color: primary }}>
                {Number(lineItemDetail.lineTotal || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
