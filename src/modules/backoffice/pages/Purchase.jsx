/**
 * Purchase Entry screen – fully API-backed.
 * Routes: GET /api/purchase/entry/init · /get · /list
 *         POST /api/purchase/entry/save · /post · /cancel
 *         GET /api/products/lookup (shared)
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import SaleIcon from '../../../shared/assets/icons/invoice.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, Switch, CommonTable } from '../../../shared/components/ui';
import { alertSuccess, alertWarning } from '../../../shared/components/ui/sweetAlertTheme.jsx';
import {
  fetchPurchaseEntryInit,
  fetchPurchaseEntryGet,
  fetchPurchaseEntryList,
  savePurchaseEntry,
  postPurchaseEntry,
  cancelPurchaseEntry,
  fetchProductsLookupForPurchase,
  fetchLPOListForPurchase,
  fetchGRNListForPurchase,
  fetchGRNItemsForPurchase,
} from '../api/purchase/purchaseEntry.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const primary = colors.primary?.main || '#790728';
const primaryHover = colors.primary?.[50] || '#F2E6EA';

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

function fmt(v, digits = 2) {
  return n(v).toFixed(digits);
}

function lineKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Recalculate a purchase line: baseCost → discountPct → unitCost → subTotal → tax → lineTotal */
function recalcLine(line, defaultTaxPct = 0) {
  const qty = n(line.qty);
  const baseCost = n(line.baseCost);
  const discPct = n(line.discPct);
  const taxPct = line.taxPct !== '' && line.taxPct != null ? n(line.taxPct) : defaultTaxPct;

  const gross = round2(qty * baseCost);
  const discAmt = round2(gross * (discPct / 100));
  const unitCost = discPct > 0 && qty > 0 ? round2((gross - discAmt) / qty) : baseCost;
  const subTotal = round2(Math.max(0, gross - discAmt));
  const taxAmt = round2(subTotal * (taxPct / 100));
  const lineTotal = round2(subTotal + taxAmt);

  return {
    ...line,
    unitCost: fmt(unitCost),
    subTotalC: fmt(subTotal),
    taxAmt: fmt(taxAmt),
    taxPct: String(taxPct),
    lineTotal: fmt(lineTotal),
  };
}

function emptyLine() {
  return {
    key: lineKey(),
    purchaseChildId: 0,
    productId: 0,
    ownRefNo: '',
    barCode: '',
    shortDescription: '',
    unit: 'PCS',
    packQty: '',
    qty: '',
    focQty: '',
    focAmount: '',
    baseCost: '',
    discPct: '',
    unitCost: '',
    subTotalC: '',
    taxPct: '',
    taxAmt: '',
    lineTotal: '',
    grnId: 0,
    lpoChildId: 0,
  };
}

function mapSavedLineToRow(it) {
  const qty = n(it.qty);
  const baseCost = n(it.unitCost);
  const subTotal = n(it.subTotalC);
  const taxAmt = n(it.inputTax1AmountC);
  const taxPct = n(it.inputTax1RateC);
  const discAmt = n(it.discountAmountC);
  const gross = round2(qty * baseCost);
  const discPct = gross > 0 ? round2((discAmt / gross) * 100) : 0;
  return {
    key: `pc-${it.purchaseChildId}-${lineKey()}`,
    purchaseChildId: n(it.purchaseChildId),
    productId: n(it.productId),
    ownRefNo: String(it.productOwnRefNo ?? ''),
    barCode: String(it.barCode ?? ''),
    shortDescription: String(it.productName ?? it.shortDescription ?? ''),
    unit: String(it.unit ?? 'PCS'),
    packQty: String(it.packQty ?? ''),
    qty: String(qty),
    focQty: String(n(it.focQty)),
    focAmount: String(n(it.focAmount)),
    baseCost: fmt(baseCost),
    discPct: fmt(discPct),
    unitCost: fmt(baseCost - discAmt / (qty || 1)),
    subTotalC: fmt(subTotal),
    taxPct: String(taxPct),
    taxAmt: fmt(taxAmt),
    lineTotal: fmt(n(it.lineTotal)),
    grnId: n(it.grnId),
    lpoChildId: n(it.lpoChildId),
  };
}

function mapLookupToLine(it, defaultTaxPct) {
  const baseCost = n(it.averageCost ?? it.unitCost ?? it.unitPrice ?? 0);
  return recalcLine({
    ...emptyLine(),
    productId: n(it.productId),
    ownRefNo: String(it.productOwnRefNo ?? ''),
    barCode: String(it.barCode ?? ''),
    shortDescription: String(it.shortDescription ?? it.description ?? ''),
    unit: String(it.unit ?? 'PCS'),
    qty: '1',
    baseCost: fmt(baseCost),
    discPct: '0',
    taxPct: '',
  }, defaultTaxPct);
}

function mapGRNChildToLine(it, defaultTaxPct) {
  return recalcLine({
    ...emptyLine(),
    productId: n(it.productId),
    ownRefNo: String(it.ownRefNo ?? ''),
    barCode: String(it.barCode ?? ''),
    shortDescription: String(it.shortDescription ?? ''),
    unit: String(it.unit ?? 'PCS'),
    packQty: String(it.packQty || ''),
    qty: String(it.qty || '1'),
    focQty: String(it.focQty || ''),
    baseCost: fmt(n(it.baseCost ?? it.unitCost)),
    discPct: fmt(n(it.discPct)),
    taxPct: it.taxPct != null && it.taxPct !== '' ? String(it.taxPct) : '',
    grnId: n(it.grnMasterId),
  }, n(it.taxPct) || defaultTaxPct);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Purchase() {
  // ── Init state ─────────────────────────────────────────────────────────
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [stationId, setStationId] = useState(0);
  const [defaultTaxPct, setDefaultTaxPct] = useState(5);
  const [suppliers, setSuppliers] = useState([]);
  const initRef = useRef(null);

  // ── Document header state ───────────────────────────────────────────────
  const [purchaseId, setPurchaseId] = useState(0);
  const [purchaseNo, setPurchaseNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('CREDIT');
  const [remarks, setRemarks] = useState('');
  const [postStatus, setPostStatus] = useState('');
  // extended header fields
  const [lpoMasterId, setLpoMasterId] = useState(0);
  const [lpoNo, setLpoNo] = useState('');
  const [fromLpo, setFromLpo] = useState(false);
  const [enteredBy, setEnteredBy] = useState('');
  const [accountHead, setAccountHead] = useState('');
  const [enteredDate] = useState(new Date().toISOString().slice(0, 10));
  const [bySupplier, setBySupplier] = useState(false);
  const [paymentNo, setPaymentNo] = useState('');
  const [paymentNow, setPaymentNow] = useState(false);
  const [staff, setStaff] = useState([]);
  // LPO modal
  const [lpoModalOpen, setLpoModalOpen] = useState(false);
  const [lpoSearch, setLpoSearch] = useState('');
  const [lpoResults, setLpoResults] = useState([]);
  const [lpoLoading, setLpoLoading] = useState(false);
  const lpoSearchInputRef = useRef(null);

  // ── Summary / totals ────────────────────────────────────────────────────
  const [discountPct, setDiscountPct] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [taxPctHeader, setTaxPctHeader] = useState('');
  const [roundOffAdj, setRoundOffAdj] = useState('');
  const [invoiceAmountManual, setInvoiceAmountManual] = useState('');

  // ── Line item form (draft entry row) ────────────────────────────────────
  const [lineForm, setLineForm] = useState(emptyLine());
  const [editingLineIndex, setEditingLineIndex] = useState(null);

  // ── Lines table ─────────────────────────────────────────────────────────
  const [lines, setLines] = useState([]);
  const [deletedChildIds, setDeletedChildIds] = useState([]);
  const [lineDetail, setLineDetail] = useState(null);

  // ── Product search modal ─────────────────────────────────────────────────
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchMode, setProductSearchMode] = useState('description');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productSearchInputRef = useRef(null);

  // ── Purchase list modal ──────────────────────────────────────────────────
  const [purListOpen, setPurListOpen] = useState(false);
  const [purListSearch, setPurListSearch] = useState('');
  const [purListResults, setPurListResults] = useState([]);
  const [purListLoading, setPurListLoading] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [loadError, setLoadError] = useState('');
  const purListInputRef = useRef(null);

  // ── GRN modal ────────────────────────────────────────────────────────────
  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [grnSearch, setGrnSearch] = useState('');
  const [grnResults, setGrnResults] = useState([]);
  const [grnLoading, setGrnLoading] = useState(false);
  const [grnItemsLoading, setGrnItemsLoading] = useState(false);
  const grnSearchInputRef = useRef(null);

  // ── API feedback ─────────────────────────────────────────────────────────
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── Computed totals ──────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const subTotal = round2(lines.reduce((s, l) => s + n(l.subTotalC), 0));
    const taxTotal = round2(lines.reduce((s, l) => s + n(l.taxAmt), 0));
    // discountPct drives the amount; if pct is blank fall back to raw discountAmount
    const discAmt = discountPct !== ''
      ? round2(subTotal * (n(discountPct) / 100))
      : n(discountAmount);
    const ro = n(roundOffAdj);
    const invoiceAmount = round2(subTotal - discAmt + taxTotal + ro);
    return { subTotal, taxTotal, discAmt, invoiceAmount };
  }, [lines, discountPct, discountAmount, roundOffAdj]);

  const isPosted = postStatus === 'POSTED';
  const isCancelled = postStatus === 'CANCELLED';
  const isReadOnly = isPosted || isCancelled;

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setInitError('');
      try {
        const data = await fetchPurchaseEntryInit();
        if (cancelled) return;
        initRef.current = data;
        setStationId(Number(data.stationId ?? 0));
        setDefaultTaxPct(Number(data.tax1Percentage ?? 5));
        setTaxPctHeader(String(data.tax1Percentage ?? '5'));
        setSuppliers(data.suppliers ?? []);
        setStaff(data.staff ?? []);
        setPurchaseNo(String(data.nextPurchaseNo ?? ''));
        setPurchaseDate(data.serverDate ?? new Date().toISOString().slice(0, 10));
        if (data.paymentModes?.[0]) setPaymentMode(data.paymentModes[0]);
      } catch (e) {
        if (!cancelled) setInitError(e.message || 'Failed to load purchase form');
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Line form helpers ────────────────────────────────────────────────────
  const patchLineForm = useCallback((patch) => {
    setLineForm((f) => {
      const next = { ...f, ...patch };
      return recalcLine(next, defaultTaxPct);
    });
  }, [defaultTaxPct]);

  const openProductSearch = useCallback(() => {
    setProductSearchMode('description');
    setProductSearchQuery('');
    setProductSearchResults([]);
    setProductSearchOpen(true);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (!productSearchOpen) return;
    const id = requestAnimationFrame(() => {
      productSearchInputRef.current?.focus();
      productSearchInputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [productSearchOpen]);

  // Escape closes modal
  useEffect(() => {
    if (!productSearchOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setProductSearchOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [productSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!productSearchOpen) return;
    const q = productSearchQuery.trim();
    if (!q || !stationId) { setProductSearchResults([]); setProductSearchLoading(false); return; }
    let cancelled = false;
    setProductSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const params = { stationId };
        if (productSearchMode === 'barcode') params.barCode = q;
        else params.shortDescription = q;
        const items = await fetchProductsLookupForPurchase(params);
        if (!cancelled) setProductSearchResults(items ?? []);
      } catch {
        if (!cancelled) setProductSearchResults([]);
      } finally {
        if (!cancelled) setProductSearchLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [productSearchOpen, productSearchQuery, productSearchMode, stationId]);

  const applyProductToForm = useCallback((it) => {
    const line = mapLookupToLine(it, defaultTaxPct);
    setLineForm({ ...emptyLine(), ...line });
    setProductSearchOpen(false);
    setProductSearchQuery('');
    setProductSearchResults([]);
  }, [defaultTaxPct]);

  // ── LPO modal ────────────────────────────────────────────────────────────
  const openLpoModal = useCallback(() => {
    setLpoSearch('');
    setLpoResults([]);
    setLpoModalOpen(true);
  }, []);

  useEffect(() => {
    if (!lpoModalOpen) return;
    const id = requestAnimationFrame(() => { lpoSearchInputRef.current?.focus(); });
    return () => cancelAnimationFrame(id);
  }, [lpoModalOpen]);

  useEffect(() => {
    if (!lpoModalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setLpoModalOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lpoModalOpen]);

  useEffect(() => {
    if (!lpoModalOpen) return;
    let cancelled = false;
    setLpoLoading(true);
    const t = setTimeout(async () => {
      try {
        const items = await fetchLPOListForPurchase({
          stationId,
          supplierId: supplierId || 0,
          search: lpoSearch.trim(),
        });
        if (!cancelled) setLpoResults(items);
      } catch {
        if (!cancelled) setLpoResults([]);
      } finally {
        if (!cancelled) setLpoLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [lpoModalOpen, lpoSearch, stationId, supplierId]);

  const applyLpo = useCallback((lpo) => {
    setLpoMasterId(lpo.lpoMasterId);
    setLpoNo(String(lpo.lpoNo));
    if (lpo.supplierId) setSupplierId(String(lpo.supplierId));
    setLpoModalOpen(false);
    setLpoSearch('');
    setLpoResults([]);
  }, []);

  // ── GRN modal ────────────────────────────────────────────────────────────
  const openGrnModal = useCallback(() => {
    setGrnSearch('');
    setGrnResults([]);
    setGrnModalOpen(true);
  }, []);

  useEffect(() => {
    if (!grnModalOpen) return;
    const id = requestAnimationFrame(() => { grnSearchInputRef.current?.focus(); });
    return () => cancelAnimationFrame(id);
  }, [grnModalOpen]);

  useEffect(() => {
    if (!grnModalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setGrnModalOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [grnModalOpen]);

  useEffect(() => {
    if (!grnModalOpen) return;
    let cancelled = false;
    setGrnLoading(true);
    const t = setTimeout(async () => {
      try {
        const items = await fetchGRNListForPurchase({
          stationId,
          supplierId: supplierId || 0,
          search: grnSearch.trim(),
        });
        if (!cancelled) setGrnResults(items);
      } catch {
        if (!cancelled) setGrnResults([]);
      } finally {
        if (!cancelled) setGrnLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [grnModalOpen, grnSearch, stationId, supplierId]);

  const applyGRN = useCallback(async (grn) => {
    setGrnModalOpen(false);
    setGrnSearch('');
    setGrnResults([]);
    setGrnItemsLoading(true);
    setApiError('');
    try {
      const children = await fetchGRNItemsForPurchase(grn.grnMasterId);
      const newLines = children.map((c) => mapGRNChildToLine(c, defaultTaxPct));
      setLines((prev) => [...newLines, ...prev]);
      // auto-fill supplier from GRN if not already set
      if (grn.supplierId && !supplierId) setSupplierId(String(grn.supplierId));
      // store GRN link info
      setLpoMasterId(grn.lpoMasterId || 0);
      setLpoNo(grn.lpoNo ? String(grn.lpoNo) : lpoNo);
    } catch (e) {
      setApiError(e.message || 'Failed to load GRN items.');
    } finally {
      setGrnItemsLoading(false);
    }
  }, [defaultTaxPct, supplierId, lpoNo]);

  // ── Purchase list modal ──────────────────────────────────────────────────
  const openPurList = useCallback(() => {
    setPurListSearch('');
    setPurListResults([]);
    setPurListOpen(true);
  }, []);

  useEffect(() => {
    if (!purListOpen) return;
    const id = requestAnimationFrame(() => purListInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [purListOpen]);

  useEffect(() => {
    if (!purListOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setPurListOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [purListOpen]);

  useEffect(() => {
    if (!purListOpen) return;
    let cancelled = false;
    setPurListLoading(true);
    const t = setTimeout(async () => {
      try {
        const items = await fetchPurchaseEntryList({ stationId, search: purListSearch.trim() || undefined });
        if (!cancelled) setPurListResults(items);
      } catch {
        if (!cancelled) setPurListResults([]);
      } finally {
        if (!cancelled) setPurListLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [purListOpen, purListSearch, stationId]);

  const resetLineForm = () => {
    setLineForm(emptyLine());
    setEditingLineIndex(null);
  };

  // ── Add / update line ────────────────────────────────────────────────────
  const handleAddLine = () => {
    if (!n(lineForm.qty) && !n(lineForm.focQty)) {
      setApiError('Enter qty before adding the line.');
      return;
    }
    if (!lineForm.productId && !lineForm.shortDescription.trim()) {
      setApiError('Select a product or enter a description.');
      return;
    }
    setApiError('');
    const finalLine = recalcLine(lineForm, defaultTaxPct);
    if (editingLineIndex !== null) {
      setLines((prev) => prev.map((l, i) => (i === editingLineIndex ? finalLine : l)));
      setEditingLineIndex(null);
    } else {
      setLines((prev) => [finalLine, ...prev]);
    }
    setLineForm(emptyLine());
  };

  const handleEditLine = (idx) => {
    setLineForm({ ...lines[idx] });
    setEditingLineIndex(idx);
  };

  const handleDeleteLine = (idx) => {
    const line = lines[idx];
    if (line?.purchaseChildId > 0) {
      setDeletedChildIds((prev) => [...prev, line.purchaseChildId]);
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
    if (editingLineIndex === idx) resetLineForm();
    else if (editingLineIndex !== null && editingLineIndex > idx) {
      setEditingLineIndex((i) => i - 1);
    }
  };

  // ── Reset entire form (New purchase) ────────────────────────────────────
  const handleNewPurchase = () => {
    setPurchaseId(0);
    setPurchaseNo(String(initRef.current?.nextPurchaseNo ?? ''));
    setPurchaseDate(initRef.current?.serverDate ?? new Date().toISOString().slice(0, 10));
    setSupplierId('');
    setSupplierInvoiceNo('');
    setPaymentMode(initRef.current?.paymentModes?.[0] ?? 'CREDIT');
    setRemarks('');
    setDiscountPct('');
    setDiscountAmount('');
    setRoundOffAdj('');
    setInvoiceAmountManual('');
    setPostStatus('');
    setLpoMasterId(0);
    setLpoNo('');
    setFromLpo(false);
    setEnteredBy('');
    setAccountHead('');
    setBySupplier(false);
    setPaymentNo('');
    setPaymentNow(false);
    setLines([]);
    setDeletedChildIds([]);
    resetLineForm();
    setApiError('');
    setLoadError('');
  };

  // ── Load existing purchase ───────────────────────────────────────────────
  const handleLoadPurchase = async (purchaseIdToLoad) => {
    if (!purchaseIdToLoad) return;
    setLoadingPurchase(true);
    setLoadError('');
    setApiError('');
    setPurListOpen(false);
    try {
      const data = await fetchPurchaseEntryGet({ stationId, purchaseId: purchaseIdToLoad });
      setPurchaseId(n(data.purchaseId));
      setPurchaseNo(String(data.purchaseNo ?? ''));
      setPurchaseDate(data.purchaseDate ?? '');
      setSupplierId(String(data.supplierId ?? ''));
      setSupplierInvoiceNo(String(data.supplierInvoiceNo ?? ''));
      setPaymentMode(String(data.paymentMode ?? 'CREDIT'));
      setRemarks(String(data.remarks ?? ''));
      setPostStatus(String(data.postStatus ?? ''));
      setDiscountPct('');
      setDiscountAmount(String(data.discountAmount ?? ''));
      setRoundOffAdj(String(data.roundOffAdjustment ?? ''));
      setInvoiceAmountManual(data.invoiceAmount != null ? fmt(n(data.invoiceAmount)) : '');
      setTaxPctHeader(String(data.inputTax1Rate ?? defaultTaxPct));
      setLines((data.items ?? []).map(mapSavedLineToRow));
      setDeletedChildIds([]);
      resetLineForm();
    } catch (e) {
      setLoadError(e.message || 'Purchase not found.');
    } finally {
      setLoadingPurchase(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setApiError('');
    if (!supplierId) { setApiError('Please select a supplier.'); return; }
    if (!supplierInvoiceNo.trim()) { setApiError('Supplier Invoice No is required — enter the number printed on the supplier\'s invoice.'); return; }
    if (!invoiceAmountManual || !n(invoiceAmountManual)) { setApiError('Invoice Amount is required — enter the total amount from the supplier\'s invoice.'); return; }
    if (lines.length === 0) { setApiError('Add at least one item before saving.'); return; }

    const finalInvoiceAmt = n(invoiceAmountManual);

    setSaving(true);
    try {
      const payload = {
        stationId,
        purchaseId: purchaseId > 0 ? purchaseId : undefined,
        supplierId: n(supplierId),
        supplierInvoiceNo: supplierInvoiceNo.trim(),
        purchaseDate,
        paymentMode,
        remarks,
        lpoMasterId: lpoMasterId || 0,
        lpoNo: lpoNo || '',
        salesManId: enteredBy ? n(enteredBy) : 0,
        subTotal: totals.subTotal,
        discountAmount: totals.discAmt,
        discountType: 'AMOUNT',
        inputTax1Amount: totals.taxTotal,
        inputTax1Rate: n(taxPctHeader),
        invoiceAmount: finalInvoiceAmt,
        roundOffAdjustment: n(roundOffAdj),
        deletedChildIds,
        items: lines.map((l) => ({
          purchaseChildId: l.purchaseChildId > 0 ? l.purchaseChildId : undefined,
          productId: n(l.productId),
          unit: l.unit,
          packQty: n(l.packQty),
          qty: n(l.qty),
          focQty: n(l.focQty),
          focAmount: n(l.focAmount),
          unitCost: n(l.unitCost),
          discountPct: n(l.discPct),
          discountAmountC: round2(n(l.qty) * n(l.baseCost) * (n(l.discPct) / 100)),
          subTotalC: n(l.subTotalC),
          inputTax1AmountC: n(l.taxAmt),
          inputTax1RateC: n(l.taxPct),
          lineTotal: n(l.lineTotal),
          grnId: l.grnId || 0,
          lpoChildId: l.lpoChildId || 0,
        })),
      };

      const result = await savePurchaseEntry(payload);
      setPurchaseId(result.purchaseId);
      setPurchaseNo(String(result.purchaseNo ?? ''));
      setDeletedChildIds([]);
      alertSuccess(`Purchase Entry saved — PU-${result.purchaseNo}`);
    } catch (e) {
      setApiError(e.message || 'Failed to save purchase.');
    } finally {
      setSaving(false);
    }
  };

  // ── Post ──────────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!purchaseId) { setApiError('Save the purchase first before posting.'); return; }
    setApiError('');
    setPosting(true);
    try {
      await postPurchaseEntry({ purchaseId, stationId });
      setPostStatus('POSTED');
      alertSuccess('Purchase Entry posted successfully.');
    } catch (e) {
      setApiError(e.message || 'Failed to post purchase.');
    } finally {
      setPosting(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!purchaseId) { handleNewPurchase(); return; }
    if (!window.confirm('Cancel this purchase entry? This cannot be undone.')) return;
    setApiError('');
    setCancelling(true);
    try {
      await cancelPurchaseEntry({ purchaseId, stationId });
      setPostStatus('CANCELLED');
      alertSuccess('Purchase Entry cancelled.');
    } catch (e) {
      setApiError(e.message || 'Failed to cancel purchase.');
    } finally {
      setCancelling(false);
    }
  };

  // ── Table rows ────────────────────────────────────────────────────────────
  const tableTotals = useMemo(() => ({
    unitCostTotal: round2(lines.reduce((s, l) => s + n(l.unitCost), 0)),
    subTotal: round2(lines.reduce((s, l) => s + n(l.subTotalC), 0)),
    taxTotal: round2(lines.reduce((s, l) => s + n(l.taxAmt), 0)),
    lineTotal: round2(lines.reduce((s, l) => s + n(l.lineTotal), 0)),
  }), [lines]);

  const resolvedSupplierName = useMemo(() =>
    suppliers.find((s) => String(s.SupplierID) === String(supplierId))?.SupplierName || '',
    [suppliers, supplierId]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (initLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Loading purchase form…
      </div>
    );
  }
  if (initError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm">
        <p className="text-red-600">{initError}</p>
        <button
          type="button"
          className="rounded border px-3 py-1 text-xs"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mb-2 mt-0 flex flex-1 w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .pur-btn:hover { border-color:${primary}!important; background:${primaryHover}!important; color:${primary}!important; }
        .pur-table table { table-layout:fixed; }
        .pur-table th, .pur-table td { vertical-align:middle; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pur-table th:first-child, .pur-table td:first-child { width:32px!important; min-width:32px!important; text-align:center; }
        .pur-table th:last-child, .pur-table td:last-child { width:84px!important; min-width:84px!important; text-align:center; }
        .pur-table tbody tr:last-child td { font-weight:700; background:#faf5f6; }
      `}</style>

      <div className="flex flex-1 w-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
              PURCHASE ENTRY
              {purchaseNo && (
                <span className="ml-2 text-sm font-normal text-gray-500">PU-{purchaseNo}</span>
              )}
            </h1>
            {postStatus && (
              <span
                className={`w-fit rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  isPosted
                    ? 'bg-green-100 text-green-700'
                    : isCancelled
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {postStatus}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Print */}
            <button
              type="button"
              title="Print"
              className="pur-btn flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white sm:h-8 sm:w-8"
            >
              <img src={PrinterIcon} alt="Print" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Open from GRN */}
            <button
              type="button"
              title="Load items from a GRN (Good Receive Note)"
              onClick={openGrnModal}
              disabled={grnItemsLoading || isReadOnly}
              className="pur-btn flex h-7 items-center gap-1 rounded border border-gray-300 bg-white px-2.5 text-[10px] font-medium sm:h-8 sm:px-3 sm:text-[11px]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {grnItemsLoading ? 'Loading…' : 'From GRN'}
            </button>

         

            {/* Cancel */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling || isPosted}
              className="pur-btn flex h-7 items-center gap-1 rounded border border-gray-300 bg-white px-2.5 text-[10px] font-medium sm:h-8 sm:px-3 sm:text-[11px]"
            >
              <img src={CancelIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>

            {/* Edit / Post */}
            <button
              type="button"
              onClick={handlePost}
              disabled={posting || isPosted || isCancelled || !purchaseId}
              className="pur-btn flex h-7 items-center gap-1 rounded border border-gray-300 bg-white px-2.5 text-[10px] font-medium sm:h-8 sm:px-3 sm:text-[11px]"
            >
              <img src={EditActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {posting ? 'Posting…' : 'Post'}
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isReadOnly}
              className="pur-btn flex h-7 items-center gap-1 rounded border border-gray-300 bg-white px-2.5 text-[10px] font-medium sm:h-8 sm:px-3 sm:text-[11px]"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>

            {/* + PURCHASE ENTRY (New) */}
            <button
              type="button"
              onClick={handleNewPurchase}
              className="flex h-7 items-center gap-1 rounded border px-2.5 text-[10px] font-semibold text-white sm:h-8 sm:px-3 sm:text-[11px]"
              style={{ backgroundColor: primary, borderColor: primary }}
            >
              <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              PURCHASE ENTRY
            </button>
          </div>
        </div>

        {/* Error / success banners */}
        {apiError && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            {apiError}
          </div>
        )}
        {loadError && (
          <div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-[11px] text-yellow-700">
            {loadError}
          </div>
        )}

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[1.72fr_1.28fr]">

          {/* ── LEFT: item entry + table ─────────────────────────────── */}
          <div className="flex min-h-0 flex-col gap-3">

            {/* Line entry form */}
            <div className="rounded border border-gray-200 bg-white p-2 sm:p-3">
              <div className="flex flex-wrap items-end gap-2 xl:flex-nowrap">
                <SubInputField label="Own Ref" widthPx={72} value={lineForm.ownRefNo}
                  onChange={(e) => patchLineForm({ ownRefNo: e.target.value })} />
                <SubInputField label="Barcode" widthPx={80} value={lineForm.barCode}
                  onChange={(e) => patchLineForm({ barCode: e.target.value })} />
                <InputField label="Description" widthPx={140} value={lineForm.shortDescription}
                  onChange={(e) => patchLineForm({ shortDescription: e.target.value })}
                  onClick={!isReadOnly ? openProductSearch : undefined}
                  title="Click to search products"
                  className="cursor-pointer" />
                <SubInputField label="Qty" widthPx={60} value={lineForm.qty}
                  onChange={(e) => patchLineForm({ qty: e.target.value })} />
                <SubInputField label="FOC Qty" widthPx={64} value={lineForm.focQty}
                  onChange={(e) => patchLineForm({ focQty: e.target.value })} />
                <DropdownInput label="UOM" widthPx={72}
                  options={['PCS', 'BOX', 'CTN', 'KG', 'LTR']}
                  value={lineForm.unit}
                  onChange={(val) => patchLineForm({ unit: val })} />
                <SubInputField label="Pack Qty" widthPx={72} value={lineForm.packQty}
                  onChange={(e) => patchLineForm({ packQty: e.target.value })} />
                <SubInputField label="Base Cost" widthPx={80} value={lineForm.baseCost}
                  onChange={(e) => patchLineForm({ baseCost: e.target.value })} />
                <SubInputField label="Disc %" widthPx={64} value={lineForm.discPct}
                  onChange={(e) => patchLineForm({ discPct: e.target.value })} />
                <SubInputField label="Unit Cost" widthPx={80} value={lineForm.unitCost} readOnly />
                <SubInputField label="Sub Total" widthPx={80} value={lineForm.subTotalC} readOnly />
                <SubInputField label="VAT %" widthPx={60} value={lineForm.taxPct}
                  onChange={(e) => patchLineForm({ taxPct: e.target.value })} />
                <SubInputField label="VAT Amt" widthPx={76} value={lineForm.taxAmt} readOnly />
                <SubInputField label="Line Total" widthPx={84} value={lineForm.lineTotal} readOnly />
                <div className="flex items-end gap-1">
                  <button
                    type="button"
                    onClick={handleAddLine}
                    disabled={isReadOnly}
                    className="h-[20px] rounded border px-3 text-[10px] font-medium text-white"
                    style={{ backgroundColor: primary, borderColor: primary }}
                  >
                    {editingLineIndex !== null ? 'Update' : 'Add'}
                  </button>
                  {editingLineIndex !== null && (
                    <button type="button" onClick={resetLineForm}
                      className="h-[20px] rounded border border-gray-300 px-2 text-[10px]">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lines table */}
            <div className="min-h-0 flex-1 overflow-auto rounded bg-white">
              <CommonTable
                className="pur-table"
                headers={['#', 'Ref', 'Barcode', 'Description', 'Qty', 'FOC', 'UOM', 'Base Cost', 'Disc%', 'Unit Cost', 'Sub Total', 'VAT%', 'VAT Amt', 'Line Total', 'Action']}
                fitParentWidth
                rows={[
                  ...lines.map((row, idx) => [
                    idx + 1,
                    row.ownRefNo || '—',
                    row.barCode || '—',
                    row.shortDescription || '—',
                    row.qty,
                    row.focQty || '0',
                    row.unit,
                    fmt(row.baseCost),
                    fmt(row.discPct),
                    fmt(row.unitCost),
                    fmt(row.subTotalC),
                    row.taxPct,
                    fmt(row.taxAmt),
                    fmt(row.lineTotal),
                    <div key={`act-${idx}`} className="flex min-w-[84px] items-center justify-center gap-0.5">
                      <button type="button" className="rounded p-0.5" onClick={() => setLineDetail(row)} aria-label="View">
                        <img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      {!isReadOnly && (
                        <>
                          <button type="button" className="rounded p-0.5" onClick={() => handleEditLine(idx)} aria-label="Edit">
                            <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                          <button type="button" className="rounded p-0.5" onClick={() => handleDeleteLine(idx)} aria-label="Delete">
                            <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                        </>
                      )}
                    </div>,
                  ]),
                  lines.length > 0 && [
                    { content: 'Total', colSpan: 7, style: { textAlign: 'left' } }, // #, Ref, Barcode, Desc, Qty, FOC, UOM
                    '',                                    // Base Cost
                    '',                                    // Disc%
                    fmt(tableTotals.unitCostTotal),        // Unit Cost
                    fmt(tableTotals.subTotal),             // Sub Total
                    '',                                    // VAT%
                    fmt(tableTotals.taxTotal),             // VAT Amt
                    fmt(tableTotals.lineTotal),            // Line Total
                    '',                                    // Action
                  ],
                ].filter(Boolean)}
              />
              {lines.length === 0 && (
                <p className="py-6 text-center text-[11px] text-gray-400">
                  No items added yet. Search a product above and click Add.
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT: header info + remarks + totals ─────────────────── */}
          <div className="flex min-h-0 flex-col gap-3">

            {/* ── Purchase header info ─────────────────────────────────── */}
            <div className="rounded border border-gray-200 bg-white p-3 sm:p-3.5">
              <div className="flex flex-col gap-2">

                {/* Row 1 — Purchase # / Sup Inv # */}
                <div className="grid grid-cols-2 gap-2">
                  <SubInputField label="Purchase #" fullWidth value={purchaseNo}
                    readOnly onClick={openPurList}
                    title="Click to open existing purchase"
                    className="cursor-pointer" />
                  <SubInputField label="Sup Inv #" fullWidth
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    disabled={isReadOnly} />
                </div>

                {/* Row 2 — LPO No (click → modal) + From LPO checkbox */}
                <div className="flex items-end gap-2">
                  <InputField
                    label="LPO No"
                    fullWidth
                    value={lpoNo}
                    onClick={!isReadOnly ? openLpoModal : undefined}
                    onChange={(e) => setLpoNo(e.target.value)}
                    placeholder="Click to select LPO…"
                    title="Click to search LPOs"
                    className={!isReadOnly ? 'cursor-pointer' : ''}
                    disabled={isReadOnly}
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 pb-0.5 text-[9px] sm:text-[10px]">
                    <input
                      type="checkbox"
                      checked={fromLpo}
                      onChange={(e) => setFromLpo(e.target.checked)}
                      disabled={isReadOnly}
                      className="h-3 w-3 accent-[var(--primary)]"
                    />
                    From LPO
                  </label>
                </div>

                {/* Row 3 — Supplier + By Supplier checkbox */}
                <div className="flex items-end gap-2">
                  <DropdownInput
                    label="Supplier"
                    fullWidth
                    value={supplierId}
                    onChange={(val) => setSupplierId(val)}
                    placeholder="— Select Supplier —"
                    options={suppliers.map((s) => ({
                      value: String(s.SupplierID),
                      label: s.SupplierName,
                    }))}
                    disabled={isReadOnly}
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 pb-0.5 text-[9px] sm:text-[10px]">
                    <input
                      type="checkbox"
                      checked={bySupplier}
                      onChange={(e) => setBySupplier(e.target.checked)}
                      disabled={isReadOnly}
                      className="h-3 w-3 accent-[var(--primary)]"
                    />
                    By Supplier
                  </label>
                </div>

                {/* Row 4 — Entered By / Purchase Date */}
                <div className="grid grid-cols-2 gap-2">
                  <DropdownInput
                    label="Entered By"
                    fullWidth
                    value={enteredBy}
                    onChange={(val) => setEnteredBy(val)}
                    placeholder="— Select —"
                    options={staff.map((s) => ({
                      value: String(s.StaffID),
                      label: s.StaffName,
                    }))}
                    disabled={isReadOnly}
                  />
                  <DateInputField label="Purchase Date" fullWidth
                    value={purchaseDate}
                    onChange={(val) => setPurchaseDate(val)}
                    disabled={isReadOnly} />
                </div>

                {/* Row 5 — Payment Mode / Account Head */}
                <div className="grid grid-cols-2 gap-2">
                  <DropdownInput
                    label="Payment Mode"
                    fullWidth
                    value={paymentMode}
                    onChange={(val) => setPaymentMode(val)}
                    options={['CASH', 'CREDIT']}
                    disabled={isReadOnly}
                  />
                  <SubInputField label="Account Head" fullWidth
                    value={accountHead}
                    onChange={(e) => setAccountHead(e.target.value)}
                    disabled={isReadOnly} />
                </div>

                {/* Row 6 — Entered Date / Station */}
                <div className="grid grid-cols-2 gap-2">
                  <SubInputField label="Entered Date" fullWidth value={enteredDate} readOnly />
                  <SubInputField label="Station" fullWidth
                    value={initRef.current?.stationName ?? stationId}
                    readOnly />
                </div>

                {/* Row 7 — Invoice Amount (manually entered, must match supplier invoice) */}
                <InputField
                  label="Invoice Amount *"
                  fullWidth
                  type="number"
                  value={invoiceAmountManual}
                  onChange={(e) => setInvoiceAmountManual(e.target.value)}
                  placeholder={`Calc: ${fmt(totals.invoiceAmount)}`}
                  disabled={isReadOnly}
                />

                {/* Row 8 — Remarks */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] leading-tight sm:text-[11px]" style={{ color: '#374151' }}>Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={isReadOnly}
                    rows={2}
                    className="w-full resize-y rounded border border-gray-200 bg-white px-2 py-1 text-[9px] outline-none sm:text-[10px]"
                  />
                </div>

                {/* Row 9 — Payment No + Payment Now toggle */}
                <div className="flex items-end gap-2">
                  <InputField
                    label="Payment No"
                    fullWidth
                    value={paymentNo}
                    onChange={(e) => setPaymentNo(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Cheque / ref no…"
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 pb-0.5 text-[9px] sm:text-[10px]">
                    <Switch
                      checked={paymentNow}
                      onChange={(val) => setPaymentNow(val)}
                      disabled={isReadOnly}
                    />
                    Payment now
                  </label>
                </div>
              </div>

            </div>

            {/* ── Summary totals ───────────────────────────────────────── */}
            <div className="rounded border border-gray-200 bg-white p-3 sm:p-3.5">
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2">
                  <InputField label="Sub Total" fullWidth value={fmt(totals.subTotal)} readOnly />
                </div>
                <div className="flex items-end gap-2">
                  <SubInputField label="Disc %" widthPx={72} value={discountPct}
                    onChange={(e) => { setDiscountPct(e.target.value); setDiscountAmount(''); }}
                    disabled={isReadOnly} />
                  <InputField label="Disc Amount" fullWidth
                    value={discountPct !== '' ? fmt(totals.discAmt) : fmt(n(discountAmount))}
                    onChange={(e) => { setDiscountAmount(e.target.value); setDiscountPct(''); }}
                    disabled={isReadOnly} />
                </div>
                <div className="flex items-end gap-2">
                  <SubInputField label="Tax %" widthPx={72} value={taxPctHeader}
                    onChange={(e) => setTaxPctHeader(e.target.value)}
                    disabled={isReadOnly} />
                  <InputField label="Tax Amount" fullWidth value={fmt(totals.taxTotal)} readOnly />
                </div>
                <div className="flex items-end gap-2">
                  <SubInputField label="Round Off" widthPx={72} value={roundOffAdj}
                    onChange={(e) => setRoundOffAdj(e.target.value)}
                    disabled={isReadOnly} />
                  <InputField
                    label="Invoice Amount *"
                    fullWidth
                    type="number"
                    value={invoiceAmountManual}
                    onChange={(e) => setInvoiceAmountManual(e.target.value)}
                    placeholder={`Calc: ${fmt(totals.invoiceAmount)}`}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Purchase list modal ──────────────────────────────────────────── */}
      {purListOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setPurListOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPurListOpen(false)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold" style={{ color: primary }}>
              Open Purchase Entry
            </h2>

            <div className="border-b border-gray-100 px-4 py-2">
              <input
                ref={purListInputRef}
                type="text"
                value={purListSearch}
                onChange={(e) => setPurListSearch(e.target.value)}
                placeholder="Search by purchase no or supplier name…"
                className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400"
                autoComplete="off"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                {purListLoading ? 'Searching…' : `${purListResults.length} record(s) found`}
              </p>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto text-[11px]">
              {!purListLoading && purListResults.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-500">No purchase entries found.</li>
              )}
              {purListResults.map((pur) => (
                <li key={pur.purchaseId} className="border-b border-gray-100">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60"
                    onClick={() => handleLoadPurchase(pur.purchaseId)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900">PU-{pur.purchaseNo}</span>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        pur.postStatus === 'POSTED'
                          ? 'bg-green-100 text-green-700'
                          : pur.postStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>{pur.postStatus || 'DRAFT'}</span>
                    </div>
                    <span className="mt-0.5 block text-[10px] text-gray-500">
                      {pur.supplierName || '—'} · {pur.purchaseDate ? String(pur.purchaseDate).slice(0,10) : '—'} · {fmt(pur.invoiceAmount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── GRN picker modal ─────────────────────────────────────────────── */}
      {grnModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setGrnModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setGrnModalOpen(false)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold" style={{ color: primary }}>
              Open from GRN — Good Receive Note
            </h2>

            <div className="border-b border-gray-100 px-4 py-2">
              <input
                ref={grnSearchInputRef}
                type="text"
                value={grnSearch}
                onChange={(e) => setGrnSearch(e.target.value)}
                placeholder="Search by GRN no or supplier name…"
                className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400"
                autoComplete="off"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                {grnLoading
                  ? 'Searching…'
                  : grnResults.length === 0
                    ? 'No GRNs found — only posted, non-invoiced GRNs are shown'
                    : `${grnResults.length} GRN(s) found — click to import items`}
              </p>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto text-[11px]">
              {!grnLoading && grnResults.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  <svg className="mx-auto mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  No GRNs available to import
                </li>
              )}
              {grnResults.map((grn) => (
                <li key={grn.grnMasterId} className="border-b border-gray-100">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60"
                    onClick={() => applyGRN(grn)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900">GRN-{grn.grnNo}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {grn.lpoNo ? (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600">
                            LPO-{grn.lpoNo}
                          </span>
                        ) : null}
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          grn.status === 'INVOICED'
                            ? 'bg-green-100 text-green-700'
                            : grn.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>{grn.status || 'POSTED'}</span>
                      </div>
                    </div>
                    <span className="mt-0.5 block text-[10px] text-gray-500">
                      {grn.supplierName || '—'} · {grn.grnDate ? String(grn.grnDate).slice(0, 10) : '—'} · Amount: {fmt(grn.grnAmount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── LPO picker modal ─────────────────────────────────────────────── */}
      {lpoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setLpoModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLpoModalOpen(false)}
              className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold" style={{ color: primary }}>
              Select LPO
            </h2>

            <div className="border-b border-gray-100 px-4 py-2">
              <input
                ref={lpoSearchInputRef}
                type="text"
                value={lpoSearch}
                onChange={(e) => setLpoSearch(e.target.value)}
                placeholder="Search by LPO No or supplier name…"
                className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400"
                autoComplete="off"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                {lpoLoading ? 'Loading…' : `${lpoResults.length} LPO(s) found`}
              </p>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto text-left text-[11px]">
              {!lpoLoading && lpoResults.length === 0 && (
                <li className="px-4 py-6 text-center text-[11px] text-gray-500">No posted LPOs found.</li>
              )}
              {lpoResults.map((lpo) => (
                <li key={lpo.lpoMasterId} className="border-b border-gray-100">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60"
                    onClick={() => applyLpo(lpo)}
                  >
                    <span className="font-medium text-gray-900">LPO-{lpo.lpoNo}</span>
                    <span className="mt-0.5 block text-[10px] text-gray-500">
                      {lpo.supplierName} · {lpo.lpoDate} · {fmt(lpo.invoiceAmount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Product search modal ─────────────────────────────────────────── */}
      {productSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
          onClick={() => setProductSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pur-product-search-title"
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
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
              id="pur-product-search-title"
              className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold"
              style={{ color: primary }}
            >
              Find Product
            </h2>

            <div className="border-b border-gray-100 px-4 py-2">
              {/* Mode toggle */}
              <div className="mb-2 flex gap-1">
                {(['description', 'barcode']).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setProductSearchMode(mode); setProductSearchQuery(''); setProductSearchResults([]); }}
                    className={`rounded border px-2 py-1 text-[10px] font-medium sm:text-[11px] ${
                      productSearchMode === mode
                        ? 'border-transparent text-white'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                    style={productSearchMode === mode ? { backgroundColor: primary, borderColor: primary } : undefined}
                  >
                    {mode === 'description' ? 'By description' : 'By barcode'}
                  </button>
                ))}
              </div>

              <input
                ref={productSearchInputRef}
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder={productSearchMode === 'barcode' ? 'Scan or type barcode…' : 'Type product name…'}
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
              {!productSearchLoading && productSearchQuery.trim() && productSearchResults.length === 0 && (
                <li className="px-4 py-6 text-center text-[11px] text-gray-500">No products found.</li>
              )}
              {productSearchResults.map((it, idx) => (
                <li key={`${it.productId}-${idx}`} className="border-b border-gray-100">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60"
                    onClick={() => applyProductToForm(it)}
                  >
                    <span className="font-medium text-gray-900">
                      {it.shortDescription || it.description || '—'}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-gray-500">
                      #{it.productId} · {it.barCode || '—'} · Cost {it.averageCost ?? it.unitCost ?? '—'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Line detail modal ────────────────────────────────────────────── */}
      {lineDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setLineDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>Line Details</h2>
              <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100"
                onClick={() => setLineDetail(null)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Product', lineDetail.shortDescription],
                ['Barcode', lineDetail.barCode],
                ['Own Ref', lineDetail.ownRefNo],
                ['Unit', lineDetail.unit],
                ['Qty', lineDetail.qty],
                ['FOC Qty', lineDetail.focQty],
                ['Base Cost', fmt(lineDetail.baseCost)],
                ['Disc %', fmt(lineDetail.discPct)],
                ['Unit Cost', fmt(lineDetail.unitCost)],
                ['Sub Total', fmt(lineDetail.subTotalC)],
                ['VAT %', lineDetail.taxPct],
                ['VAT Amount', fmt(lineDetail.taxAmt)],
                ['Line Total', fmt(lineDetail.lineTotal)],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <div className="font-semibold text-gray-700">{label}</div>
                  <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1">{value || '—'}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
