import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import SaleIcon from '../../../shared/assets/icons/invoice.svg';
import QuotationIcon from '../../../shared/assets/icons/QuotationIcon.svg';
import DeliveryIcon from '../../../shared/assets/icons/DeliveryIcon.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import PayIcon from '../../../shared/assets/icons/pay.svg';
import RemoveIcon from '../../../shared/assets/icons/remove.svg';
import { InputField, SubInputField, DropdownInput, Switch, CommonTable } from '../../../shared/components/ui';
import { alertSuccess, alertWarning } from '../../../shared/components/ui/sweetAlertTheme.jsx';
import {
  fetchSalesEntryInit,
  fetchSalesEntryCustomers,
  fetchSalesCustomerSummary,
  fetchSalesProductLookup,
  fetchSalesQuotationList,
  fetchSalesDOList,
  loadSalesQuotationItems,
  loadSalesDOItems,
  fetchSalesEntryById,
  saveSalesEntry,
  postSalesEntry,
  unpostSalesEntry,
  cancelSalesEntry,
} from '../api/sales/salesEntry.service.js';

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function roundMoney(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/** Line math: gross = qty × price; discount from % (if > 0) else disc amt; tax on discounted subtotal; total = sub + tax. */
function recalcLineFormFields(base, defaultTaxPercent) {
  const qty = n(base.qty);
  const unitPrice = n(base.unitPrice);
  const gross = roundMoney(qty * unitPrice);
  const discPct = n(base.discPercent);
  let discount = 0;
  if (discPct > 0 && gross > 0) {
    discount = roundMoney(gross * (discPct / 100));
  } else {
    discount = roundMoney(n(base.discAmt) || n(base.discPrice));
    if (discount > gross) discount = gross;
  }
  const subTotal = roundMoney(Math.max(0, gross - discount));
  const taxRaw = base.taxPercent;
  const taxEmpty =
    taxRaw === '' || taxRaw == null || (typeof taxRaw === 'string' && taxRaw.trim() === '');
  const taxPct = taxEmpty ? n(defaultTaxPercent, 0) : n(taxRaw);
  const taxAmt = roundMoney(subTotal * (taxPct / 100));
  const total = roundMoney(subTotal + taxAmt);
  const next = {
    ...base,
    subTotal: subTotal.toFixed(2),
    taxAmt: taxAmt.toFixed(2),
    total: total.toFixed(2),
    taxPercent: String(taxPct),
  };
  if (discPct > 0) {
    next.discAmt = discount.toFixed(2);
    next.discPrice = discount.toFixed(2);
  }
  return next;
}

function lineKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyLine() {
  return {
    key: lineKey(),
    shortDescription: '',
    barCode: '',
    qty: 0,
    unitPrice: 0,
    discPercent: 0,
    discAmt: 0,
    subTotal: 0,
    taxPercent: 0,
    taxAmt: 0,
    lineTotal: 0,
    productId: null,
    uniqueMultiProductId: null,
    salesChildId: null,
    productType: '',
    qtyOnHand: null,
    unitCost: null,
    minUnitPrice: null,
  };
}

function lineToCells(line) {
  return [
    line.shortDescription,
    line.barCode,
    line.qty,
    line.unitPrice,
    line.discPercent,
    line.discAmt,
    line.subTotal,
    line.taxPercent,
    line.taxAmt,
    line.lineTotal,
  ];
}

function mapQuotationLine(it) {
  const qty = n(it.qty);
  const unitPrice = n(it.unitPrice);
  const disc = n(it.itemDiscount);
  const subTotal = qty * unitPrice - disc;
  const taxAmt = n(it.tax1AmountC);
  const taxPct = n(it.tax1RateC);
  const lineTotal = subTotal + taxAmt;
  return {
    key: lineKey(),
    shortDescription: it.description || it.shortDescription || '',
    barCode: it.barCode || '',
    qty,
    unitPrice,
    discPercent: unitPrice * qty ? (disc / (unitPrice * qty)) * 100 : 0,
    discAmt: disc,
    subTotal,
    taxPercent: taxPct,
    taxAmt,
    lineTotal,
    productId: it.productId,
    uniqueMultiProductId: it.uniqueMultiProductId ?? null,
    salesChildId: null,
    productType: '',
    qtyOnHand: n(it.qtyOnHand),
    unitCost: n(it.avgCost),
    minUnitPrice: n(it.minUnitPrice),
  };
}

function mapDOLine(it) {
  const qty = n(it.qty);
  const unitPrice = n(it.unitPrice);
  const disc = n(it.itemDiscount);
  const subTotal = qty * unitPrice - disc;
  const taxAmt = n(it.tax1AmountC);
  const taxPct = n(it.tax1RateC);
  const lineTotal = subTotal + taxAmt;
  return {
    key: lineKey(),
    shortDescription: it.shortDescription || it.description || '',
    barCode: it.barCode || '',
    qty,
    unitPrice,
    discPercent: unitPrice * qty ? (disc / (unitPrice * qty)) * 100 : 0,
    discAmt: disc,
    subTotal,
    taxPercent: taxPct,
    taxAmt,
    lineTotal,
    productId: it.productId,
    uniqueMultiProductId: it.uniqueMultiProductId ?? null,
    salesChildId: null,
    productType: '',
    qtyOnHand: n(it.qtyOnHand),
    unitCost: n(it.averageCost),
    minUnitPrice: n(it.minUnitPrice),
  };
}

function mapSavedLine(it) {
  const disc = n(it.discount);
  const qty = n(it.qty);
  const unitPrice = n(it.unitPrice);
  const subTotal = n(it.subTotalC, qty * unitPrice - disc);
  return {
    key: `sc-${it.salesChildId}-${lineKey()}`,
    shortDescription: it.shortDescription || '',
    barCode: it.barCode || '',
    qty,
    unitPrice,
    discPercent: unitPrice * qty ? (disc / (unitPrice * qty)) * 100 : 0,
    discAmt: disc,
    subTotal,
    taxPercent: n(it.tax1RateC),
    taxAmt: n(it.tax1AmountC),
    lineTotal: n(it.lineTotal),
    productId: it.productId,
    uniqueMultiProductId: it.uniqueMultiProductId ?? null,
    salesChildId: it.salesChildId,
    productType: it.productType || '',
    qtyOnHand: n(it.qtyOnHand),
    unitCost: n(it.unitCost),
    minUnitPrice: null,
  };
}

function getProductDetails(line) {
  const orDash = (v) => (v != null && v !== '' ? String(v) : '-');
  return {
    productCode: orDash(line.barCode),
    stockOnHand: orDash(line.qtyOnHand),
    lastCustomer: '-',
    unitCost: orDash(line.unitCost),
    minUnitPrice: orDash(line.minUnitPrice),
    profit: '-',
    creditLimit: '-',
    currentOsBal: '-',
    osBalance: '-',
    receiptNo: '-',
    location: '-',
    productName: orDash(line.shortDescription),
  };
}

const initialFormState = {
  ownRef: '',
  productCode: '',
  shortDescription: '',
  serialNo: '',
  packetDetails: '',
  unit: '',
  salesQty: '',
  focQty: '',
  returnQty: '',
  unitPrice: '',
  discPercent: '',
  discAmt: '',
  subTotal: '',
  taxPercent: '',
  taxAmt: '',
  total: '',
};

export default function Sale() {
  const pageTitle = 'Sales Entry';
  const termsTitle = 'Sales Terms';
  const [init, setInit] = useState(null);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [stationId, setStationId] = useState('');
  const [salesManId, setSalesManId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [accountHeadId, setAccountHeadId] = useState('');
  const [billNo, setBillNo] = useState('');
  const [salesId, setSalesId] = useState(null);
  const [postStatus, setPostStatus] = useState('');
  const [loadSalesIdInput, setLoadSalesIdInput] = useState('');
  const [counterNo, setCounterNo] = useState('99');
  const [customerLpo, setCustomerLpo] = useState('');
  const [localBillNo, setLocalBillNo] = useState('');
  const [billDate, setBillDate] = useState('');
  const [billTime, setBillTime] = useState('');
  const [customerSummary, setCustomerSummary] = useState(null);
  const [quotationList, setQuotationList] = useState([]);
  const [doList, setDoList] = useState([]);
  const [quotationRefs, setQuotationRefs] = useState([]);
  const [doRefs, setDoRefs] = useState([]);
  const [deletedChildIds, setDeletedChildIds] = useState([]);
  const [draftLineMeta, setDraftLineMeta] = useState(null);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchMode, setProductSearchMode] = useState('description');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productSearchInputRef = useRef(null);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [doModalOpen, setDoModalOpen] = useState(false);
  const [quotationModalFilter, setQuotationModalFilter] = useState('');
  const [doModalFilter, setDoModalFilter] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [salesTermsOpen, setSalesTermsOpen] = useState(false);
  const [saveTerms, setSaveTerms] = useState(false);
  const [printTerms, setPrintTerms] = useState(false);
  const [salesTermsText, setSalesTermsText] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agentCommissionPct, setAgentCommissionPct] = useState('');
  const [agentCommissionAmt, setAgentCommissionAmt] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleLines, setSaleLines] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const [summaryTab, setSummaryTab] = useState('payment');
  const [docDiscPct, setDocDiscPct] = useState('');
  const [docDiscAmt, setDocDiscAmt] = useState('');
  const [summaryTaxPct, setSummaryTaxPct] = useState('');
  const [roundOffAdjInput, setRoundOffAdjInput] = useState('');
  const [paidAmountEntry, setPaidAmountEntry] = useState('');
  const [paidByCashEntry, setPaidByCashEntry] = useState('');
  const [paidByCardEntry, setPaidByCardEntry] = useState('');

  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const clearApiMessages = useCallback(() => {
    setApiError('');
    setApiSuccess('');
  }, []);

  const resolvedCustomerName = useMemo(
    () => customers.find((c) => String(c.customerId) === String(customerId))?.customerName || '',
    [customers, customerId]
  );

  const applyLineRecalc = useCallback(
    (base) => recalcLineFormFields(base, n(init?.taxDefaults?.tax1Percentage, 0)),
    [init]
  );

  const patchLineForm = useCallback(
    (patch) => {
      setForm((f) => applyLineRecalc({ ...f, ...patch }));
    },
    [applyLineRecalc]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setInitError('');
      try {
        const data = await fetchSalesEntryInit();
        if (cancelled) return;
        setInit(data);
        setStationId(String(data.stationId ?? ''));
        const sm = data.salesMen?.[0];
        if (sm) setSalesManId(String(sm.staffId));
        setPaymentMode(data.paymentModes?.[0] || 'CASH');
        const defAcc = data.defaults?.defaultCashInHandAccID;
        if (defAcc) setAccountHeadId(String(defAcc));
        const bd = data.billDefaults?.billDateTime;
        if (bd) {
          const d = new Date(bd);
          setBillDate(d.toISOString().slice(0, 10));
          setBillTime(d.toISOString());
        }
        if (data.flags?.salesTerms != null) setSalesTermsText(String(data.flags.salesTerms));
        const dc = data.defaults?.defaultCashCustomer;
        if (dc) setCustomerId(String(dc));
      } catch (e) {
        if (!cancelled) setInitError(e.message || 'Failed to load sales entry');
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchSalesEntryCustomers();
        if (!cancelled) setCustomers(list);
      } catch {
        if (!cancelled) setCustomers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cid = n(customerId);
    if (!cid) {
      setCustomerSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSalesCustomerSummary(cid);
        if (cancelled) return;
        setCustomerSummary(data.customer);
        const pm = data.customer?.paymentMode;
        if (pm) setPaymentMode(String(pm).toUpperCase());
      } catch {
        if (!cancelled) setCustomerSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  // Picker lists: when customer selected, show only that customer's refs; otherwise show all station refs.
  useEffect(() => {
    const sid = n(stationId);
    if (!sid) return;
    let cancelled = false;
    (async () => {
      const cid = n(customerId) || undefined;
      const [quRes, doRes] = await Promise.allSettled([
        fetchSalesQuotationList({ stationId: sid, customerId: cid }),
        fetchSalesDOList({ stationId: sid, customerId: cid, pendingOnly: false }),
      ]);
      if (cancelled) return;
      setQuotationList(quRes.status === 'fulfilled' ? quRes.value : []);
      setDoList(doRes.status === 'fulfilled' ? doRes.value : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [stationId, customerId]);

  useEffect(() => {
    if (!quotationModalOpen && !doModalOpen) return;
    const sid = n(stationId);
    if (!sid) return;
    let cancelled = false;
    (async () => {
      try {
        const cid = n(customerId) || undefined;
        if (quotationModalOpen) {
          const qu = await fetchSalesQuotationList({ stationId: sid, customerId: cid });
          if (!cancelled) setQuotationList(qu);
        }
        if (doModalOpen) {
          const dos = await fetchSalesDOList({ stationId: sid, customerId: cid, pendingOnly: false });
          if (!cancelled) setDoList(dos);
        }
      } catch {
        /* keep existing list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quotationModalOpen, doModalOpen, stationId, customerId]);

  const openProductSearch = useCallback((mode) => {
    setProductSearchMode(mode);
    setProductSearchQuery(mode === 'barcode' ? (form.hsCode || '') : (form.shortDescription || ''));
    setProductSearchResults([]);
    setProductSearchOpen(true);
  }, [form.hsCode, form.shortDescription]);

  useEffect(() => {
    if (!productSearchOpen) return;
    const id = requestAnimationFrame(() => {
      productSearchInputRef.current?.focus();
      productSearchInputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [productSearchOpen]);

  useEffect(() => {
    if (!productSearchOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setProductSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [productSearchOpen]);

  useEffect(() => {
    if (!productSearchOpen) return;
    const sid = n(stationId);
    if (!sid) return;
    const q = productSearchQuery.trim();
    if (!q) {
      setProductSearchResults([]);
      setProductSearchLoading(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setProductSearchLoading(true);
      try {
        const params = { stationId: sid };
        if (productSearchMode === 'barcode') params.barCode = q;
        else params.shortDescription = q;
        const res = await fetchSalesProductLookup(params);
        if (!cancelled) setProductSearchResults(res.items || []);
      } catch {
        if (!cancelled) setProductSearchResults([]);
      } finally {
        if (!cancelled) setProductSearchLoading(false);
      }
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [productSearchOpen, productSearchQuery, productSearchMode, stationId]);

  const applyLookupItem = useCallback(
    (it) => {
      const qty = n(form.qty, 1) || 1;
      const unitPrice = n(it.unitPrice);
      setDraftLineMeta({
        productId: it.productId,
        uniqueMultiProductId: it.uniqueMultiProductId ?? null,
        productType: it.productType || '',
        barCode: it.barCode || '',
        qtyOnHand: n(it.qtyOnHand),
        unitCost: n(it.averageCost),
        minUnitPrice: n(it.minimumRetailPrice),
      });
      setForm((f) =>
        applyLineRecalc({
          ...f,
          shortDescription: it.shortDescription || it.description || '',
          hsCode: it.barCode || '',
          qty: String(qty),
          unitPrice: String(unitPrice),
          discPercent: '0',
          discPrice: '0',
          discAmt: '0',
          taxPercent: '',
        })
      );
      setProductSearchOpen(false);
      clearApiMessages();
    },
    [form.qty, applyLineRecalc, clearApiMessages]
  );

  const fillFormFromLine = (line) => {
    setForm(
      applyLineRecalc({
        ...initialFormState,
        shortDescription: String(line.shortDescription ?? ''),
        hsCode: String(line.barCode ?? ''),
        qty: String(line.qty ?? ''),
        unitPrice: String(line.unitPrice ?? ''),
        discPercent: String(line.discPercent ?? ''),
        discPrice: String(line.discAmt ?? ''),
        discAmt: String(line.discAmt ?? ''),
        taxPercent:
          line.taxPercent !== undefined && line.taxPercent !== null && line.taxPercent !== ''
            ? String(line.taxPercent)
            : '',
      })
    );
    setDraftLineMeta({
      productId: line.productId,
      uniqueMultiProductId: line.uniqueMultiProductId,
      productType: line.productType,
      barCode: line.barCode,
      qtyOnHand: line.qtyOnHand,
      unitCost: line.unitCost,
      minUnitPrice: line.minUnitPrice,
    });
  };

  const handleEdit = (line, idx) => {
    fillFormFromLine(line);
    setEditingRowIndex(idx);
  };

  const handleDelete = (idx) => {
    const line = saleLines[idx];
    if (line?.salesChildId) {
      setDeletedChildIds((prev) => [...prev, line.salesChildId]);
    }
    setSaleLines((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
      setForm(initialFormState);
      setDraftLineMeta(null);
    } else if (editingRowIndex !== null && editingRowIndex > idx) {
      setEditingRowIndex((i) => i - 1);
    }
  };

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedRows);
    setSaleLines((prev) => {
      const removed = prev.filter((_, i) => toDelete.has(i));
      const ids = removed.map((l) => l.salesChildId).filter(Boolean);
      if (ids.length) setDeletedChildIds((d) => [...d, ...ids]);
      return prev.filter((_, i) => !toDelete.has(i));
    });
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) {
      setEditingRowIndex(null);
      setForm(initialFormState);
      setDraftLineMeta(null);
    } else if (editingRowIndex !== null) {
      const deletedBefore = [...toDelete].filter((i) => i < editingRowIndex).length;
      setEditingRowIndex(editingRowIndex - deletedBefore);
    }
  };

  const buildLineFromForm = (existingLine, formSnapshot) => {
    const fd = formSnapshot || form;
    const discAmt = n(fd.discAmt || fd.discPrice);
    const base = existingLine || {};
    const meta = {
      productId: draftLineMeta?.productId ?? base.productId,
      uniqueMultiProductId: draftLineMeta?.uniqueMultiProductId ?? base.uniqueMultiProductId,
      productType: draftLineMeta?.productType ?? base.productType,
      barCode: draftLineMeta?.barCode ?? base.barCode,
      qtyOnHand: draftLineMeta?.qtyOnHand ?? base.qtyOnHand,
      unitCost: draftLineMeta?.unitCost ?? base.unitCost,
      minUnitPrice: draftLineMeta?.minUnitPrice ?? base.minUnitPrice,
    };
    return {
      key: existingLine?.key || lineKey(),
      shortDescription: fd.shortDescription,
      barCode: fd.hsCode || meta.barCode || '',
      qty: n(fd.qty),
      unitPrice: n(fd.unitPrice),
      discPercent: n(fd.discPercent),
      discAmt,
      subTotal: n(fd.subTotal),
      taxPercent: n(fd.taxPercent),
      taxAmt: n(fd.taxAmt),
      lineTotal: n(fd.total),
      productId: meta.productId ?? null,
      uniqueMultiProductId: meta.uniqueMultiProductId ?? null,
      salesChildId: existingLine?.salesChildId ?? null,
      productType: meta.productType || '',
      qtyOnHand: meta.qtyOnHand ?? null,
      unitCost: meta.unitCost ?? null,
      minUnitPrice: meta.minUnitPrice ?? null,
    };
  };

  const handleSaveOrUpdate = () => {
    const existing = editingRowIndex !== null ? saleLines[editingRowIndex] : null;
    const resolvedProductId = draftLineMeta?.productId ?? existing?.productId;
    if (!resolvedProductId) {
      setApiError('Use Lookup to resolve a product before adding a line');
      return;
    }
    const snapshot = applyLineRecalc(form);
    const line = buildLineFromForm(existing, snapshot);
    if (editingRowIndex !== null) {
      setSaleLines((prev) => {
        const next = [...prev];
        next[editingRowIndex] = line;
        return next;
      });
      setEditingRowIndex(null);
    } else {
      setSaleLines((prev) => [line, ...prev]);
    }
    setForm(initialFormState);
    setDraftLineMeta(null);
    clearApiMessages();
  };

  const totalDiscAmt = saleLines.reduce((sum, r) => sum + n(r.discAmt), 0);
  const totalSubTotal = saleLines.reduce((sum, r) => sum + n(r.subTotal), 0);
  const totalTaxPercent = saleLines.length
    ? saleLines.reduce((sum, r) => sum + n(r.taxPercent), 0) / saleLines.length
    : 0;
  const totalTaxAmt = saleLines.reduce((sum, r) => sum + n(r.taxAmt), 0);
  const totalLineTotal = saleLines.reduce((sum, r) => sum + n(r.lineTotal), 0);

  const taxRateOptions = useMemo(() => {
    const t1 = n(init?.taxDefaults?.tax1Percentage, 0);
    const t2 = n(init?.taxDefaults?.tax2Percentage, 0);
    const t3 = n(init?.taxDefaults?.tax3Percentage, 0);
    const uniq = [...new Set([t1, t2, t3].filter((x) => x >= 0))];
    if (!uniq.length) uniq.push(0);
    return uniq.map((x) => ({ value: String(x), label: String(x) }));
  }, [init]);

  const documentSummary = useMemo(() => {
    const sub = totalSubTotal;
    let extraDisc = 0;
    if (n(docDiscPct) > 0 && sub > 0) {
      extraDisc = roundMoney(sub * (n(docDiscPct) / 100));
    } else {
      extraDisc = roundMoney(n(docDiscAmt));
      if (extraDisc > sub) extraDisc = sub;
    }
    const totalAmt = roundMoney(Math.max(0, sub - extraDisc));
    const defaultRate = n(init?.taxDefaults?.tax1Percentage, 0);
    const rate =
      summaryTaxPct === '' || summaryTaxPct == null ? defaultRate : n(summaryTaxPct, defaultRate);
    const tax = roundMoney(totalAmt * (rate / 100));
    const ro = roundMoney(n(roundOffAdjInput));
    const net = roundMoney(totalAmt + tax + ro);
    return {
      subTotal: sub,
      extraDisc,
      lineDiscSum: totalDiscAmt,
      totalDiscountForSave: roundMoney(totalDiscAmt + extraDisc),
      totalAmount: totalAmt,
      taxRate: rate,
      taxAmt: tax,
      roundOff: ro,
      net,
    };
  }, [
    totalSubTotal,
    totalDiscAmt,
    docDiscPct,
    docDiscAmt,
    summaryTaxPct,
    roundOffAdjInput,
    init,
  ]);

  const stationOptions = useMemo(
    () =>
      (init?.stations || []).map((s) => ({
        value: String(s.stationId),
        label: `${s.stationName} (${s.stationId})`,
      })),
    [init]
  );
  const salesManOptions = useMemo(
    () =>
      (init?.salesMen || []).map((s) => ({
        value: String(s.staffId),
        label: s.staffName,
      })),
    [init]
  );
  const paymentOptions = useMemo(
    () =>
      (init?.paymentModes || ['CASH', 'CREDIT', 'CREDITCARD']).map((p) => ({
        value: p,
        label: p,
      })),
    [init]
  );
  const accountHeadOptions = useMemo(
    () =>
      (init?.accountHeads || []).map((a) => ({
        value: String(a.accountId),
        label: `${a.accountNo ?? ''} ${a.accountHead ?? ''}`.trim(),
      })),
    [init]
  );
  const customerOptions = useMemo(
    () => [
      { value: '', label: 'Walk-in / cash' },
      ...customers.map((c) => ({
        value: String(c.customerId),
        label: c.customerName || `Customer ${c.customerId}`,
      })),
    ],
    [customers]
  );
  const filteredQuotationList = useMemo(() => {
    const t = quotationModalFilter.trim().toLowerCase();
    if (!t) return quotationList;
    return quotationList.filter((q) => String(q.quotationNo).toLowerCase().includes(t));
  }, [quotationList, quotationModalFilter]);

  const filteredDoList = useMemo(() => {
    const t = doModalFilter.trim().toLowerCase();
    if (!t) return doList;
    return doList.filter((d) => String(d.doNo).toLowerCase().includes(t));
  }, [doList, doModalFilter]);

  const quotationRefSummary = useMemo(() => {
    if (!quotationRefs.length) return 'None';
    const nums = quotationRefs
      .map((r) => n(r.quotationNo))
      .filter((v) => v > 0)
      .slice(0, 3)
      .join(', ');
    if (!nums) return `${quotationRefs.length} selected`;
    return quotationRefs.length > 3 ? `${nums}, +${quotationRefs.length - 3}` : nums;
  }, [quotationRefs]);

  const doRefSummary = useMemo(() => {
    if (!doRefs.length) return 'None';
    const nums = doRefs
      .map((r) => n(r.doNo))
      .filter((v) => v > 0)
      .slice(0, 3)
      .join(', ');
    if (!nums) return `${doRefs.length} selected`;
    return doRefs.length > 3 ? `${nums}, +${doRefs.length - 3}` : nums;
  }, [doRefs]);

  const lineItemsPayload = useCallback(() => {
    return saleLines
      .filter((l) => n(l.qty) > 0)
      .map((l) => ({
        productId: n(l.productId),
        uniqueMultiProductId: n(l.uniqueMultiProductId),
        salesChildId: l.salesChildId || undefined,
        qty: n(l.qty),
        unitPrice: n(l.unitPrice),
        discount: n(l.discAmt),
        subTotalC: n(l.subTotal),
        tax1AmountC: n(l.taxAmt),
        lineTotal: n(l.lineTotal),
        shortDescription: l.shortDescription,
        barCode: l.barCode,
        productType: l.productType || undefined,
      }));
  }, [saleLines]);

  const handleSaveBill = async () => {
    clearApiMessages();
    const sid = n(stationId);
    if (!sid) {
      const message = 'Select a station';
      setApiError(message);
      await alertWarning(message, { title: 'Save failed' });
      return;
    }
    const needsAccount = paymentMode === 'CASH' || paymentMode === 'CREDITCARD';
    if (needsAccount && !n(accountHeadId)) {
      const message = 'Select account head for CASH / CREDITCARD';
      setApiError(message);
      await alertWarning(message, { title: 'Save failed' });
      return;
    }
    const items = lineItemsPayload();
    if (!items.length) {
      const message = 'Add at least one line with quantity';
      setApiError(message);
      await alertWarning(message, { title: 'Save failed' });
      return;
    }
    if (items.some((it) => !it.productId)) {
      const message = 'Each line must have a product — use Lookup or load from QTN/DO';
      setApiError(message);
      await alertWarning(message, { title: 'Save failed' });
      return;
    }
    const payload = {
      stationId: sid,
      salesManId: n(salesManId),
      customerId: n(customerId),
      customerName:
        customers.find((c) => String(c.customerId) === String(customerId))?.customerName || '',
      paymentMode,
      billDate: billDate || new Date().toISOString().slice(0, 10),
      billTime: billTime || new Date().toISOString(),
      counterNo: counterNo || '99',
      customerLpoNo: customerLpo,
      localBillNo: n(localBillNo),
      subTotalM: documentSummary.subTotal,
      discountAmount: documentSummary.totalDiscountForSave,
      taxableAmount: documentSummary.totalAmount,
      tax1AmountM: documentSummary.taxAmt,
      tax1RateM: documentSummary.taxRate,
      roundOffAdj: documentSummary.roundOff,
      amount: documentSummary.net,
      paidAmount: n(paidAmountEntry) || documentSummary.net,
      balancePaid: roundMoney(documentSummary.net - (n(paidAmountEntry) || documentSummary.net)),
      accountHeadId: needsAccount ? n(accountHeadId) : 0,
      items,
      saveTerms,
      salesTerms: salesTermsText,
      agentId: n(agentId),
      agentCommissionPercentage: n(agentCommissionPct),
      agentCommissionAmount: n(agentCommissionAmt),
      quotationRefs: quotationRefs.map((r) => ({
        quotationId: r.quotationId,
        quotationNo: r.quotationNo,
      })),
      doRefs: doRefs.map((r) => ({ doId: r.doId, doNo: r.doNo })),
    };
    if (salesId) {
      payload.salesId = salesId;
      payload.billNo = n(billNo);
      if (deletedChildIds.length) payload.deletedChildIds = deletedChildIds;
    }
    setSaving(true);
    try {
      const res = await saveSalesEntry(payload);
      setSalesId(res.salesId);
      setBillNo(String(res.billNo ?? ''));
      setPostStatus('NOT POSTED');
      setDeletedChildIds([]);
      try {
        const full = await fetchSalesEntryById({ salesId: res.salesId, stationId: sid });
        setSaleLines((full.items || []).map(mapSavedLine));
        setQuotationRefs(full.quotationRefs || []);
        setDoRefs(full.doRefs || []);
      } catch {
        /* lines stay as saved; salesChildId refresh optional */
      }
      setApiSuccess(res.message || 'Saved');
      await alertSuccess(res.message || 'Bill saved successfully');
    } catch (e) {
      const message = e.message || 'Save failed';
      setApiError(message);
      await alertWarning(message, { title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadQuotation = async (row) => {
    clearApiMessages();
    const qid = row?.quotationId != null ? n(row.quotationId) : 0;
    const qno =
      row?.quotationNo !== undefined && row?.quotationNo !== null && row?.quotationNo !== ''
        ? n(row.quotationNo)
        : 0;
    if (!qid && !qno) {
      setApiError('Select a quotation');
      return;
    }
    setQuotationModalOpen(false);
    setQuotationModalFilter('');
    try {
      const data = await loadSalesQuotationItems({
        stationId: n(stationId),
        ...(qid ? { quotationId: qid } : { quotationNo: qno }),
        currentCustomerId: n(customerId) || undefined,
      });
      const loadedCustomerId = n(data.customer?.customerId);
      const currentCustomer = n(customerId);
      if (currentCustomer && loadedCustomerId && currentCustomer !== loadedCustomerId) {
        setApiError('Selected quotation belongs to a different customer.');
        return;
      }
      const incomingLines = (data.items || []).map(mapQuotationLine);
      setSaleLines((prev) => [...prev, ...incomingLines]);
      setQuotationRefs((prev) => {
        const nextId = n(data.quotationId);
        const nextNo = n(data.quotationNo);
        if (prev.some((r) => n(r.quotationId) === nextId || n(r.quotationNo) === nextNo)) return prev;
        return [...prev, { quotationId: data.quotationId, quotationNo: data.quotationNo }];
      });
      if (!n(customerId) && loadedCustomerId) setCustomerId(String(loadedCustomerId));
      setApiSuccess(`Added ${data.count ?? data.items?.length ?? 0} quotation line(s)`);
    } catch (e) {
      setApiError(e.message || 'Load quotation failed');
    }
  };

  const handleLoadDO = async (row) => {
    clearApiMessages();
    const did = row?.doId != null ? n(row.doId) : 0;
    const dno =
      row?.doNo !== undefined && row?.doNo !== null && row?.doNo !== '' ? n(row.doNo) : 0;
    if (!did && !dno) {
      setApiError('Select a delivery order');
      return;
    }
    setDoModalOpen(false);
    setDoModalFilter('');
    try {
      const data = await loadSalesDOItems({
        stationId: n(stationId),
        ...(did ? { doId: did } : { doNo: dno }),
        currentCustomerId: n(customerId) || undefined,
        pendingOnly: true,
      });
      const loadedCustomerId = n(data.customer?.customerId);
      const currentCustomer = n(customerId);
      if (currentCustomer && loadedCustomerId && currentCustomer !== loadedCustomerId) {
        setApiError('Selected DO belongs to a different customer.');
        return;
      }
      const incomingLines = (data.items || []).map(mapDOLine);
      setSaleLines((prev) => [...prev, ...incomingLines]);
      setDoRefs((prev) => {
        const nextId = n(data.doId);
        const nextNo = n(data.doNo);
        if (prev.some((r) => n(r.doId) === nextId || n(r.doNo) === nextNo)) return prev;
        return [...prev, { doId: data.doId, doNo: data.doNo }];
      });
      if (!n(customerId) && loadedCustomerId) setCustomerId(String(loadedCustomerId));
      setApiSuccess(`Added ${data.count ?? data.items?.length ?? 0} DO line(s)`);
    } catch (e) {
      setApiError(e.message || 'Load DO failed');
    }
  };

  const handleLoadBill = async () => {
    clearApiMessages();
    const sidSale = n(loadSalesIdInput);
    if (!sidSale) {
      setApiError('Enter sales ID to load');
      return;
    }
    try {
      const data = await fetchSalesEntryById({
        salesId: sidSale,
        stationId: n(stationId),
      });
      setSalesId(data.salesId);
      setBillNo(String(data.billNo ?? ''));
      setPostStatus(data.postStatus || '');
      setStationId(String(data.stationId ?? stationId));
      setSalesManId(String(data.salesManId ?? ''));
      setCustomerId(String(data.customerId ?? ''));
      setPaymentMode(data.paymentMode || 'CASH');
      setCounterNo(String(data.counterNo || '99'));
      setCustomerLpo(data.customerLpoNo || '');
      setLocalBillNo(String(data.localBillNo ?? ''));
      setSaleLines((data.items || []).map(mapSavedLine));
      setQuotationRefs(data.quotationRefs || []);
      setDoRefs(data.doRefs || []);
      setDeletedChildIds([]);
      if (data.billDate) {
        const d = new Date(data.billDate);
        setBillDate(d.toISOString().slice(0, 10));
      }
      if (data.billTime) setBillTime(new Date(data.billTime).toISOString());
      setSalesTermsText(data.remarks || salesTermsText);
      setApiSuccess('Bill loaded for edit');
    } catch (e) {
      setApiError(e.message || 'Load bill failed');
    }
  };

  const handleNewInvoice = () => {
    clearApiMessages();
    setSalesId(null);
    setBillNo('');
    setPostStatus('');
    setLoadSalesIdInput('');
    setSaleLines([]);
    setDeletedChildIds([]);
    setQuotationRefs([]);
    setDoRefs([]);
    setForm(initialFormState);
    setEditingRowIndex(null);
    setDraftLineMeta(null);
    setSelectedRows(new Set());
    setAgentId('');
    setAgentCommissionPct('');
    setAgentCommissionAmt('');
    if (init?.billDefaults?.billDateTime) {
      const d = new Date(init.billDefaults.billDateTime);
      setBillDate(d.toISOString().slice(0, 10));
      setBillTime(d.toISOString());
    }
    const dc = init?.defaults?.defaultCashCustomer;
    setCustomerId(dc != null ? String(dc) : '');
    setSummaryTab('payment');
    setDocDiscPct('');
    setDocDiscAmt('');
    setSummaryTaxPct(
      init?.taxDefaults?.tax1Percentage != null
        ? String(n(init.taxDefaults.tax1Percentage, 0))
        : ''
    );
    setRoundOffAdjInput('');
    setPaidAmountEntry('');
    setPaidByCashEntry('');
    setPaidByCardEntry('');
  };

  const runPosting = async (fn, label) => {
    clearApiMessages();
    if (!salesId) {
      setApiError('Save the bill first');
      return;
    }
    if (!window.confirm(`${label} this bill?`)) return;
    try {
      const res = await fn({ salesId, stationId: n(stationId) });
      setPostStatus(res.postStatus || postStatus);
      setApiSuccess(res.message || 'OK');
    } catch (e) {
      setApiError(e.message || `${label} failed`);
    }
  };

  const rowsWithTotal = useMemo(
    () => [
      ...saleLines.map((line, idx) => {
        const r = lineToCells(line);
        return [
    <div key={`chk-${line.key}`} className="flex justify-center">
      <input
        type="checkbox"
        checked={selectedRows.has(idx)}
        onChange={() => toggleRowSelection(idx)}
        className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
        style={{ accentColor: primary }}
      />
    </div>,
    ...r,
    <div key={`action-${line.key}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
      <button type="button" className="p-0.5" onClick={() => setSelectedProduct(getProductDetails(line))}>
        <img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <button type="button" className="p-0.5" onClick={() => handleEdit(line, idx)}>
        <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <button type="button" className="p-0.5" onClick={() => setPendingDelete({ mode: 'single', idx })}>
        <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
    </div>,
  ];
      }),
 

[
  <div key="total-chk" />,
  <div key="total-label" className="text-right font-bold">Total</div>,
  '',
  '',
  '',
  '',
  '',
  totalDiscAmt.toFixed(2),
  totalSubTotal.toFixed(2),
  totalTaxPercent.toFixed(2),
  totalTaxAmt.toFixed(2),
  totalLineTotal.toFixed(2),
  '',
]



],
    [
      saleLines,
      selectedRows,
      primary,
      totalDiscAmt,
      totalSubTotal,
      totalTaxPercent,
      totalTaxAmt,
      totalLineTotal,
    ]
  );

  if (initLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-600" style={{ color: primary }}>
        Loading sales entry…
      </div>
    );
  }

  if (initError) {
    return (
      <div className="p-4 text-center text-sm text-red-600">
        {initError}
        <p className="mt-2 text-gray-600">Ensure you are logged in and VITE_API_BASE_URL points at the ERP API.</p>
      </div>
    );
  }

  return (
    <div className="sale-page -mt-2 sm:-mt-3">
      <style>{`
        .sale-btn-outline:hover {
          border-color: ${primary} !important;
          background: ${primaryHover} !important;
          color: ${primary} !important;
        }
        .sale-btn-outline:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-primary:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-primary:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-red-outline:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-red-outline:active {
          background: ${primaryActive} !important;
        }
      `}</style>

      <div className="mt-0 mb-0 flex flex-1 min-h-0 flex-col overflow-y-auto px-0 pb-2 sm:mt-0 sm:mb-0 sm:mx-[-6px] sm:px-0">
        <div className="flex flex-1 min-h-0 flex-col gap-1 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm sm:gap-1.5 sm:p-1.5">

          {/* Header */}
          <div className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              {pageTitle}
            </h1>

            <div className="flex w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
              {postStatus && (
                <span className="rounded border border-gray-200 px-2 py-0.5 text-[9px] text-gray-600 sm:text-[10px]">
                  {postStatus}
                </span>
              )}
              {selectedRows.size > 0 && (
                <button
                  type="button"
                  onClick={() => setPendingDelete({ mode: 'bulk' })}
                  className="sale-btn-outline flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                  style={{ borderColor: primary, color: primary }}
                >
                  <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  Delete
                </button>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveBill}
                className="sale-btn-primary rounded border px-1.5 py-0.5 text-[9px] font-medium sm:px-2 sm:py-1 sm:text-[11px]"
                style={{ backgroundColor: primary, color: '#fff', borderColor: primary, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleLoadBill}
                className="sale-btn-outline rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                Load
              </button>
              <button className="sale-btn-outline flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white sm:h-8 sm:w-8">
                <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  clearApiMessages();
                  if (!salesId) {
                    setApiError('Save the bill first');
                    return;
                  }
                  if (!window.confirm('Cancel this bill?')) return;
                  try {
                    const res = await cancelSalesEntry({ salesId, stationId: n(stationId) });
                    setApiSuccess(res.message || 'Cancelled');
                  } catch (e) {
                    setApiError(e.message || 'Cancel failed');
                  }
                }}
                className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                <img src={CancelIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => runPosting(postSalesEntry, 'Post')}
                className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                <img src={PostIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                Post
              </button>
              <button
                type="button"
                onClick={() => runPosting(unpostSalesEntry, 'Unpost')}
                className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
              >
                <img src={UnpostIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                Unpost
              </button>
            </div>
          </div>

          {(apiError || apiSuccess) && (
            <div
              className={`rounded border px-2 py-1.5 text-[10px] sm:text-[11px] ${
                apiError ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
              }`}
            >
              {apiError || apiSuccess}
            </div>
          )}

          {/* Content: fills viewport; xl = side-by-side with internal scroll; stacked = scroll inside main */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden xl:flex-row">

            {/* LEFT */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2 xl:w-[72%] xl:max-w-[72%] xl:shrink-0">
              {/* Form section - bordered */}
              <div className="shrink-0 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex flex-col gap-2">
                  {/* Row 1: Short Description + numeric fields */}
                  <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                    <InputField
                      label="Short Description"
                      widthPx={128}
                      value={form.shortDescription}
                      onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                      onClick={() => openProductSearch('description')}
                      title="Click to search products"
                      className="cursor-pointer"
                    />
                    <SubInputField
                      label="Hs Code/Wt"
                      type="number"
                      value={form.hsCode}
                      onChange={(e) => setForm((f) => ({ ...f, hsCode: e.target.value }))}
                      onClick={() => openProductSearch('barcode')}
                      title="Click to search by barcode"
                      className="cursor-pointer"
                    />
                    <SubInputField
                      label="Qty"
                      type="number"
                      value={form.qty}
                      onChange={(e) => patchLineForm({ qty: e.target.value })}
                    />
                    <SubInputField
                      label="Unit Price"
                      type="number"
                      value={form.unitPrice}
                      onChange={(e) => patchLineForm({ unitPrice: e.target.value })}
                    />
                    <SubInputField
                      label="Disc.%"
                      type="number"
                      value={form.discPercent}
                      onChange={(e) => patchLineForm({ discPercent: e.target.value })}
                    />
                    <SubInputField
                      label="Disc Price"
                      type="number"
                      value={form.discPrice}
                      onChange={(e) => patchLineForm({ discPrice: e.target.value, discPercent: '' })}
                    />
                    <SubInputField
                      label="Disc.Amt"
                      type="number"
                      value={form.discAmt}
                      onChange={(e) => patchLineForm({ discAmt: e.target.value, discPercent: '' })}
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                    <SubInputField
                      label="Sub total"
                      value={form.subTotal}
                      readOnly
                      className="bg-gray-50"
                    />
                    <SubInputField
                      label="Tax%"
                      type="number"
                      value={form.taxPercent}
                      onChange={(e) => patchLineForm({ taxPercent: e.target.value })}
                      title={`Default ${n(init?.taxDefaults?.tax1Percentage, 0)}% from parameters (clear field to reset)`}
                    />
                    <SubInputField
                      label="T.Amt"
                      value={form.taxAmt}
                      readOnly
                      className="bg-gray-50"
                    />
                    <SubInputField
                      label="Total"
                      value={form.total}
                      onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
                    />

                    <button
                      type="button"
                      onClick={() => setQuotationModalOpen(true)}
                      className="sale-btn-outline h-[20.08px] min-h-[20.08px] rounded border px-2 text-[8px] font-medium sm:px-3 sm:text-[9px]"
                      style={{ borderColor: primary, color: primary }}
                      title={quotationRefSummary}
                    >
                      QTN ({quotationRefs.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDoModalOpen(true)}
                      className="sale-btn-outline h-[20.08px] min-h-[20.08px] rounded border px-2 text-[8px] font-medium sm:px-3 sm:text-[9px]"
                      style={{ borderColor: primary, color: primary }}
                      title={doRefSummary}
                    >
                      DO ({doRefs.length || 0})
                    </button>

                    <div className="flex items-end">
                      <button
                        type="button"
                        className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                        style={{ backgroundColor: primary }}
                        onClick={handleSaveOrUpdate}
                      >
                        {editingRowIndex !== null ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table — fits column width (table-fixed); no nested vertical scroll */}
              <div className="w-full min-w-0 rounded border border-gray-200 bg-white p-2 sm:p-3">
                <CommonTable
                  fitParentWidth
                  maxVisibleRows={11}
                  headers={[
                    '',
                    'Short description',
                    'Product Code',
                    'Qty',
                    'Unit price',
                    'Disc %',
                    'Disc Amt',
                    'Sub total',
                    'Tax %',
                    'Tax amt',
                    'Line Total',
                    'Action',
                  ]}
                  rows={rowsWithTotal}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-[28%] xl:min-h-0 xl:overflow-hidden">
              <div className="flex h-full min-h-0 flex-1 flex-col gap-2">

                {/* Bill / Customer section */}
                <div className="shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
                  {/* Section header */}
                  <div
                    className="flex items-center justify-between border-b border-gray-200 px-2.5 py-1.5"
                    style={{ background: 'linear-gradient(90deg, #fdf2f5 0%, #fff 100%)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <img src={SaleIcon} alt="" className="h-3 w-3 opacity-70" style={{ filter: 'sepia(1) saturate(3) hue-rotate(300deg)' }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primary }}>
                        Invoice Details
                      </span>
                    </div>
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: `${primary}15`, color: primary }}>
                      {billNo || 'NEW'}
                    </span>
                  </div>

                  {/* Compact field rows */}
                  <div className="divide-y divide-gray-100">

                    {/* Bill no / LPO / Local */}
                    <div className="grid grid-cols-3 gap-1.5 px-2.5 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Bill no</span>
                        <input readOnly value={billNo || ''} className="h-[22px] w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] font-medium text-gray-700 outline-none" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Cust. LPO</span>
                        <input value={customerLpo} onChange={(e) => setCustomerLpo(e.target.value)} className="h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Local Bill</span>
                        <input value={localBillNo} onChange={(e) => setLocalBillNo(e.target.value)} className="h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                    </div>

                    {/* Customer name / dropdown */}
                    <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Cust. Name</span>
                        <input readOnly value={resolvedCustomerName} className="h-[22px] w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-700 outline-none" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Customer</span>
                        <div className="relative h-[22px]">
                          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                            className="h-full w-full appearance-none rounded border border-gray-200 bg-[#f5f5f5] pl-1.5 pr-5 text-[10px] outline-none focus:border-gray-400 focus:bg-white">
                            {customerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <svg className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Payment / Account head */}
                    <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Payment</span>
                        <div className="relative h-[22px]">
                          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                            className="h-full w-full appearance-none rounded border border-gray-200 bg-[#f5f5f5] pl-1.5 pr-5 text-[10px] outline-none focus:border-gray-400 focus:bg-white">
                            {paymentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <svg className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Account head</span>
                        <div className="relative h-[22px]">
                          <select value={accountHeadId} onChange={(e) => setAccountHeadId(e.target.value)}
                            className="h-full w-full appearance-none rounded border border-gray-200 bg-[#f5f5f5] pl-1.5 pr-5 text-[10px] outline-none focus:border-gray-400 focus:bg-white">
                            {accountHeadOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <svg className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Credit card / Card type */}
                    <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Card no</span>
                        <input className="h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Card type</span>
                        <input className="h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                    </div>

                    {/* Cashier full width */}
                    <div className="px-2.5 py-1.5">
                      <span className="text-[9px] font-medium text-gray-500">Cashier (salesman)</span>
                      <div className="relative mt-0.5 h-[22px]">
                        <select value={salesManId} onChange={(e) => setSalesManId(e.target.value)}
                          className="h-full w-full appearance-none rounded border border-gray-200 bg-[#f5f5f5] pl-1.5 pr-5 text-[10px] outline-none focus:border-gray-400 focus:bg-white">
                          {salesManOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <svg className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    {/* Invoice amt / Bill date */}
                    <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Inv. Amount</span>
                        <input readOnly value={documentSummary.net ? documentSummary.net.toFixed(2) : ''} className="h-[22px] w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-right text-[10px] font-semibold outline-none" style={{ color: '#c00000' }} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Bill date</span>
                        <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                    </div>

                    {/* Station / Counter */}
                    <div className="grid grid-cols-2 gap-1.5 px-2.5 py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Station</span>
                        <div className="relative h-[22px]">
                          <select value={stationId} onChange={(e) => setStationId(e.target.value)}
                            className="h-full w-full appearance-none rounded border border-gray-200 bg-[#f5f5f5] pl-1.5 pr-5 text-[10px] outline-none focus:border-gray-400 focus:bg-white">
                            {stationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <svg className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-medium text-gray-500">Counter</span>
                        <input value={counterNo} onChange={(e) => setCounterNo(e.target.value)} className="h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                    </div>

                    {/* Load by sales ID */}
                    <div className="px-2.5 py-1.5">
                      <span className="text-[9px] font-medium text-gray-500">Load by Sales ID</span>
                      <input type="number" value={loadSalesIdInput} onChange={(e) => setLoadSalesIdInput(e.target.value)} className="mt-0.5 h-[22px] w-full rounded border border-gray-200 bg-[#f5f5f5] px-1.5 text-[10px] outline-none focus:border-gray-400 focus:bg-white" />
                    </div>

                  </div>

                  {/* New Invoice button */}
                  <div className="border-t border-gray-200 px-2.5 py-1.5">
                    <button
                      type="button"
                      onClick={handleNewInvoice}
                      className="flex w-full items-center justify-center gap-1.5 rounded border py-1 text-[10px] font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
                    >
                      <img src={SaleIcon} alt="" className="h-3 w-3" />
                      New Invoice
                    </button>
                  </div>
                </div>

                {/* Sales Terms + Summary Panel */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">

                  {/* Tab bar */}
                  <div className="flex shrink-0 border-b border-gray-200" style={{ background: '#fafafa' }}>
                    <button
                      type="button"
                      onClick={() => setSummaryTab('totals')}
                      className={`flex min-h-[32px] flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold transition-colors ${
                        summaryTab === 'totals' ? 'bg-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      style={{
                        color: summaryTab === 'totals' ? primary : undefined,
                        boxShadow: summaryTab === 'totals' ? `inset 0 -2px 0 0 ${primary}` : undefined,
                      }}
                    >
                      <svg className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Totals
                    </button>
                    <button
                      type="button"
                      onClick={() => setSummaryTab('payment')}
                      className={`flex min-h-[32px] flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold transition-colors ${
                        summaryTab === 'payment' ? 'bg-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      style={{
                        color: summaryTab === 'payment' ? primary : undefined,
                        boxShadow: summaryTab === 'payment' ? `inset 0 -2px 0 0 ${primary}` : undefined,
                      }}
                    >
                      <svg className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                      Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalesTermsOpen(true)}
                      className="flex min-h-[32px] flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold text-gray-500 transition-colors hover:text-gray-700"
                    >
                      <svg className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Terms
                    </button>
                  </div>

                  {/* ── TOTALS TAB ── */}
                  {summaryTab === 'totals' && (
                    <div className="flex min-h-0 flex-1 flex-col">
                      {/* Summary rows */}
                      <div className="flex-1 divide-y divide-gray-50 overflow-y-auto">
                        {/* Sub Total */}
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                          <span className="shrink-0 text-[10px] text-gray-500 sm:text-[11px]">Sub Total</span>
                          <input
                            type="text"
                            readOnly
                            value={documentSummary.subTotal ? documentSummary.subTotal.toFixed(2) : '0.00'}
                            className="w-[90px] shrink-0 rounded border border-gray-100 bg-gray-50 px-2 py-1 text-right text-[10px] font-semibold tabular-nums text-gray-800 outline-none sm:w-[100px] sm:text-[11px]"
                          />
                        </div>

                        {/* Discount */}
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                          <span className="shrink-0 text-[10px] text-gray-500 sm:text-[11px]">Discount</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={docDiscPct}
                              onChange={(e) => { setDocDiscPct(e.target.value); if (e.target.value) setDocDiscAmt(''); }}
                              placeholder="%"
                              className="w-[36px] rounded border border-gray-200 bg-white px-1 py-1 text-center text-[9px] tabular-nums outline-none focus:border-gray-400 sm:text-[10px]"
                            />
                            <span className="text-[9px] text-gray-400">%</span>
                            <input
                              type="number"
                              value={n(docDiscPct) > 0 ? documentSummary.extraDisc.toFixed(2) : docDiscAmt}
                              onChange={(e) => { setDocDiscAmt(e.target.value); setDocDiscPct(''); }}
                              readOnly={n(docDiscPct) > 0}
                              className={`w-[68px] rounded border border-gray-200 px-2 py-1 text-right text-[10px] tabular-nums outline-none sm:text-[11px] ${n(docDiscPct) > 0 ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
                            />
                          </div>
                        </div>

                        {/* Total after discount */}
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                          <span className="shrink-0 text-[10px] text-gray-500 sm:text-[11px]">Total Amount</span>
                          <input
                            type="text"
                            readOnly
                            value={documentSummary.totalAmount ? documentSummary.totalAmount.toFixed(2) : '0.00'}
                            className="w-[90px] shrink-0 rounded border border-gray-100 bg-gray-50 px-2 py-1 text-right text-[10px] font-semibold tabular-nums text-gray-800 outline-none sm:w-[100px] sm:text-[11px]"
                          />
                        </div>

                        {/* Tax */}
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                          <span className="shrink-0 text-[10px] text-gray-500 sm:text-[11px]">Tax</span>
                          <div className="flex items-center gap-1">
                            <DropdownInput
                              label=""
                              options={taxRateOptions}
                              value={summaryTaxPct !== '' && summaryTaxPct != null ? summaryTaxPct : String(n(init?.taxDefaults?.tax1Percentage, 0))}
                              onChange={(v) => setSummaryTaxPct(v)}
                              widthPx={52}
                            />
                            <span className="text-[9px] text-gray-400">%</span>
                            <input
                              type="text"
                              readOnly
                              value={documentSummary.taxAmt ? documentSummary.taxAmt.toFixed(2) : '0.00'}
                              className="w-[68px] shrink-0 rounded border border-gray-100 bg-gray-50 px-2 py-1 text-right text-[10px] tabular-nums text-gray-800 outline-none sm:text-[11px]"
                            />
                          </div>
                        </div>

                        {/* Round Off */}
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                          <span className="shrink-0 text-[10px] text-gray-500 sm:text-[11px]">Round Off</span>
                          <input
                            type="number"
                            value={roundOffAdjInput}
                            onChange={(e) => setRoundOffAdjInput(e.target.value)}
                            className="w-[90px] shrink-0 rounded border border-gray-200 bg-white px-2 py-1 text-right text-[10px] tabular-nums outline-none focus:border-gray-400 sm:w-[100px] sm:text-[11px]"
                          />
                        </div>
                      </div>

                      {/* NET AMOUNT — prominent footer */}
                      <div
                        className="flex items-center justify-between px-3 py-2.5"
                        style={{ background: `linear-gradient(90deg, #fdf2f5 0%, #fff5f7 100%)`, borderTop: `2px solid ${primary}20` }}
                      >
                        <span className="text-[11px] font-bold sm:text-[12px]" style={{ color: primary }}>
                          NET AMOUNT
                        </span>
                        <div
                          className="rounded px-3 py-1 text-right text-sm font-bold tabular-nums sm:text-base"
                          style={{ color: primary, background: `${primary}10`, border: `1px solid ${primary}30` }}
                        >
                          {documentSummary.net ? documentSummary.net.toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── PAYMENT TAB ── */}
                  {summaryTab === 'payment' && (
                    <div className="flex min-h-0 flex-1 flex-col">
                      {/* Invoice total reference */}
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                        <span className="text-[10px] font-medium text-gray-500">Invoice Total</span>
                        <span className="text-[11px] font-bold tabular-nums" style={{ color: primary }}>
                          {documentSummary.net ? documentSummary.net.toFixed(2) : '0.00'}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col gap-0 divide-y divide-gray-50 overflow-y-auto px-3 pb-0">
                        {/* Paid Amount */}
                        <div className="py-2">
                          <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">
                            Paid Amount
                          </label>
                          <input
                            type="number"
                            value={paidAmountEntry}
                            onChange={(e) => setPaidAmountEntry(e.target.value)}
                            placeholder={documentSummary.net ? documentSummary.net.toFixed(2) : '0.00'}
                            className="box-border w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-right text-sm font-bold tabular-nums outline-none focus:border-gray-400 sm:text-base"
                            style={{ color: primary }}
                          />
                        </div>

                        {/* Balance Amount */}
                        <div className="py-2">
                          <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">
                            Balance Amount
                          </label>
                          {(() => {
                            const bal = documentSummary.net
                              ? roundMoney(documentSummary.net - (n(paidAmountEntry) || documentSummary.net))
                              : 0;
                            const isNeg = bal < 0;
                            return (
                              <>
                                <input
                                  type="text"
                                  readOnly
                                  value={documentSummary.net ? bal.toFixed(2) : ''}
                                  className="box-border w-full rounded border px-2.5 py-2 text-right text-sm font-bold tabular-nums outline-none sm:text-base"
                                  style={{
                                    background: bal === 0 ? '#f0fdf4' : isNeg ? '#fff7ed' : '#fef2f2',
                                    borderColor: bal === 0 ? '#86efac' : isNeg ? '#fed7aa' : '#fca5a5',
                                    color: bal === 0 ? '#16a34a' : isNeg ? '#ea580c' : '#dc2626',
                                  }}
                                />
                                {customerSummary?.currentOsBalance != null && (
                                  <p className="mt-1 flex items-center gap-1 text-[9px] text-gray-500">
                                    <svg className="h-2.5 w-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Customer O/S: {String(customerSummary.currentOsBalance)}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Cash / Card split — pinned to bottom */}
                      <div
                        className="mt-auto shrink-0 px-3 py-2.5"
                        style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9' }}
                      >
                        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400 sm:text-[10px]">
                          Payment Split
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <SubInputField
                            label="Paid by cash"
                            type="number"
                            value={paidByCashEntry}
                            onChange={(e) => setPaidByCashEntry(e.target.value)}
                            fullWidth
                          />
                          <SubInputField
                            label="Paid by card"
                            type="number"
                            value={paidByCardEntry}
                            onChange={(e) => setPaidByCardEntry(e.target.value)}
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Terms Modal */}
      {salesTermsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSalesTermsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sales-terms-title"
        >
          <div
            className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSalesTermsOpen(false)}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Heading centered */}
            <h2
              id="sales-terms-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              {termsTitle}
            </h2>

            {/* Form fields - labels left-aligned in one column */}
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Terms text
                </label>
                <input
                  type="text"
                  placeholder="Printed / saved terms"
                  value={salesTermsText}
                  onChange={(e) => setSalesTermsText(e.target.value)}
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Agent ID
                </label>
                <input
                  type="number"
                  placeholder="Agent master ID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Commission %
                </label>
                <input
                  type="number"
                  placeholder="%"
                  value={agentCommissionPct}
                  onChange={(e) => setAgentCommissionPct(e.target.value)}
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Commission amount
                </label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={agentCommissionAmt}
                  onChange={(e) => setAgentCommissionAmt(e.target.value)}
                  className="min-h-[24px] min-w-0 flex-1 rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                />
              </div>
            </div>

            {/* Two switches centered */}
            <div className="my-4 flex justify-center gap-6">
              <Switch
                checked={saveTerms}
                onChange={setSaveTerms}
                description="Save terms"
              />
              <Switch
                checked={printTerms}
                onChange={setPrintTerms}
                description="Print terms"
              />
            </div>

            {/* Two buttons with icons */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAgentId('');
                  setAgentCommissionPct('');
                  setAgentCommissionAmt('');
                }}
                className="sale-btn-red-outline flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition-colors"
                style={{ borderColor: primary, color: primary }}
              >
                <img src={RemoveIcon} alt="" className="h-4 w-4" />
                Remove commission
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded border bg-white px-4 py-2 text-sm font-medium transition-colors"
                style={{ borderColor: primary, color: primary }}
              >
                <img src={PayIcon} alt="" className="h-4 w-4" />
                Pay now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation picker — list + search */}
      {quotationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setQuotationModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quotation-modal-title"
        >
          <div
            className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuotationModalOpen(false)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2
              id="quotation-modal-title"
              className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold"
              style={{ color: primary }}
            >
              Load quotation
            </h2>
            <div className="border-b border-gray-100 px-4 py-2">
              <input
                type="search"
                value={quotationModalFilter}
                onChange={(e) => setQuotationModalFilter(e.target.value)}
                placeholder="Filter by quotation no…"
                className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none"
                autoComplete="off"
              />
              {!n(stationId) ? (
                <p className="mt-2 text-[10px] text-amber-800">Select a station first.</p>
              ) : (
                <p className="mt-1 text-[10px] text-gray-500">
                  {quotationList.length} quotation(s) {n(customerId) ? 'for selected customer' : 'for this station'}
                </p>
              )}
            </div>
            <ul className="min-h-0 max-h-[50vh] flex-1 overflow-y-auto text-left text-[11px]">
              {filteredQuotationList.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-500">No quotations match.</li>
              ) : (
                filteredQuotationList.map((q) => (
                  <li
                    key={q.quotationId != null ? `qid-${q.quotationId}` : `qno-${q.quotationNo}`}
                    className="border-b border-gray-100"
                  >
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-rose-50/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        void handleLoadQuotation(q);
                      }}
                    >
                      <span className="font-semibold text-gray-900">QTN {q.quotationNo}</span>
                      {q.customerId ? (
                        <span className="mt-0.5 block text-[10px] text-gray-500">Customer #{q.customerId}</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* DO picker — list + search */}
      {doModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setDoModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="do-modal-title"
        >
          <div
            className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDoModalOpen(false)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2
              id="do-modal-title"
              className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold"
              style={{ color: primary }}
            >
              Load delivery order
            </h2>
            <div className="border-b border-gray-100 px-4 py-2">
              <input
                type="search"
                value={doModalFilter}
                onChange={(e) => setDoModalFilter(e.target.value)}
                placeholder="Filter by DO no…"
                className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none"
                autoComplete="off"
              />
              {!n(stationId) ? (
                <p className="mt-2 text-[10px] text-amber-800">Select a station first.</p>
              ) : (
                <p className="mt-1 text-[10px] text-gray-500">
                  {doList.length} delivery order(s) {n(customerId) ? 'for selected customer' : 'for this station'}
                </p>
              )}
            </div>
            <ul className="min-h-0 max-h-[50vh] flex-1 overflow-y-auto text-left text-[11px]">
              {filteredDoList.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-500">No delivery orders match.</li>
              ) : (
                filteredDoList.map((d) => (
                  <li
                    key={d.doId != null ? `did-${d.doId}` : `dno-${d.doNo}`}
                    className="border-b border-gray-100"
                  >
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-rose-50/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        void handleLoadDO(d);
                      }}
                    >
                      <span className="font-semibold text-gray-900">DO {d.doNo}</span>
                      {d.customerId ? (
                        <span className="mt-0.5 block text-[10px] text-gray-500">Customer #{d.customerId}</span>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Product search — opened from Short description / Barcode fields */}
      {productSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setProductSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-search-title"
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setProductSearchOpen(false)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2
              id="product-search-title"
              className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold"
              style={{ color: primary }}
            >
              Find product
            </h2>
            <div className="border-b border-gray-100 px-4 py-2">
              {!n(stationId) ? (
                <p className="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-900">
                  Select a station on the right before searching products.
                </p>
              ) : null}
              <div className="mb-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setProductSearchMode('description')}
                  className={`rounded border px-2 py-1 text-[10px] font-medium sm:text-[11px] ${
                    productSearchMode === 'description'
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                  style={
                    productSearchMode === 'description'
                      ? { backgroundColor: primary, borderColor: primary }
                      : undefined
                  }
                >
                  By description
                </button>
                <button
                  type="button"
                  onClick={() => setProductSearchMode('barcode')}
                  className={`rounded border px-2 py-1 text-[10px] font-medium sm:text-[11px] ${
                    productSearchMode === 'barcode'
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                  style={
                    productSearchMode === 'barcode'
                      ? { backgroundColor: primary, borderColor: primary }
                      : undefined
                  }
                >
                  By barcode
                </button>
              </div>
              <label className="sr-only" htmlFor="product-search-input">
                Search products
              </label>
              <input
                id="product-search-input"
                ref={productSearchInputRef}
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder={
                  productSearchMode === 'barcode'
                    ? 'Scan or type barcode…'
                    : 'Type name or description…'
                }
                className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400"
                autoComplete="off"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                {productSearchLoading
                  ? 'Searching…'
                  : productSearchQuery.trim()
                    ? `${productSearchResults.length} match(es)`
                    : 'Type to search — results appear as you type'}
              </p>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto text-left text-[11px]">
              {!productSearchLoading &&
                productSearchQuery.trim() &&
                productSearchResults.length === 0 &&
                n(stationId) > 0 && (
                  <li className="px-4 py-6 text-center text-[11px] text-gray-500">No products found.</li>
                )}
              {productSearchResults.map((it) => (
                <li key={`${it.productId}-${it.uniqueMultiProductId}`} className="border-b border-gray-100">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60"
                    onClick={() => applyLookupItem(it)}
                  >
                    <span className="font-medium text-gray-900">
                      {it.shortDescription || it.description || '—'}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-gray-500">
                      #{it.productId} · {it.barCode || '—'} · Stock {it.qtyOnHand ?? '—'} · {it.unitPrice != null ? `${it.unitPrice}` : '—'}{' '}
                      / unit
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-title"
        >
          <div
            className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2
              id="product-details-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              Product details
            </h2>

            {/* Product details - labels left, values right, "-" when empty */}
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Product code
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.productCode}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Stock on hand
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.stockOnHand}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Last customer
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.lastCustomer}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Unit cost
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.unitCost}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Min unit price
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.minUnitPrice}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Profit
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.profit}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Credit limit
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.creditLimit}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Current OS bal
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.currentOsBal}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  OS balance
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.osBalance}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Receipt no
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.receiptNo}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Location
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}