/**
 * PurchaseOrder (Local Purchase Order) – API-backed.
 * Routes: GET /api/lpo/entry/init · /get · /list
 *         POST /api/lpo/entry/save · /post · /cancel
 *         GET /api/products/lookup (shared)
 */
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import EditIcon from '../assets/icons/edit.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  DateInputField,
  Switch,
  CommonTable,
  ConfirmDialog,
} from '../components/ui';
import { alertSuccess, alertWarning } from '../components/ui/sweetAlertTheme.jsx';
import {
  fetchLpoEntryInit,
  fetchLpoEntryGet,
  fetchLpoEntryList,
  saveLpoEntry,
  postLpoEntry,
  cancelLpoEntry,
} from '../api/lpo/lpoEntry.service.js';
import { fetchProductsLookupForPurchase } from '../api/purchase/purchaseEntry.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const primary = colors.primary?.main || '#790728';

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

/**
 * Recalculate LPO line:
 *   if useDiscPct → subTotal = qty×unitCost - (qty×unitCost × disc%) / 100
 *   else          → subTotal = qty×unitCost  (disc recorded but not deducted)
 *   vatAmount = unitCost × (vatPct/100) × qty
 *   total (lineTotal) = subTotal + vatAmount
 */
function recalcLpoLine(line, useDiscPct = false, defaultTaxPct = 0) {
  const qty = n(line.qty);
  const unitCost = n(line.unitCost);
  const discPct = n(line.discPercent);
  const vatPct =
    line.vatPercent !== '' && line.vatPercent != null
      ? n(line.vatPercent)
      : defaultTaxPct;

  const gross = round2(qty * unitCost);
  const discAmt = useDiscPct ? round2(gross * (discPct / 100)) : 0;
  const subTotal = round2(gross - discAmt);
  const vatAmount = round2(unitCost * (vatPct / 100) * qty);
  const lineTotal = round2(subTotal + vatAmount);

  return {
    ...line,
    subTotal: fmt(subTotal),
    vatAmount: fmt(vatAmount),
    total: fmt(lineTotal),
    vatPercent: String(vatPct),
  };
}

function emptyLine() {
  return {
    key: lineKey(),
    lpoChildId: 0,
    productId: 0,
    ownRefNo: '',
    barCode: '',
    shortDescription: '',
    qty: '',
    uom: 'PCS',
    packQty: '',
    foc: '',
    baseCost: '',
    discPercent: '',
    unitCost: '',
    subTotal: '',
    vatPercent: '',
    vatAmount: '',
    total: '',
    uniqueId: 0,
  };
}

function mapLookupToLine(it, useDiscPct, defaultTaxPct) {
  const baseCost = n(it.baseCost ?? it.averageCost ?? it.unitCost ?? it.unitPrice ?? 0);
  const unitCost = n(it.unitCost ?? it.unitPrice ?? baseCost);
  const vatPct = n(it.tax1Rate ?? it.inputTax1RateC ?? defaultTaxPct);
  const discPct = n(it.discountOnCost ?? 0);

  return recalcLpoLine(
    {
      ...emptyLine(),
      productId: n(it.productId),
      ownRefNo: String(it.productOwnRefNo ?? ''),
      barCode: String(it.barCode ?? ''),
      shortDescription: String(it.shortDescription ?? it.description ?? ''),
      uom: String(it.unit ?? 'PCS'),
      packQty: String(it.packQty ?? ''),
      qty: '1',
      baseCost: fmt(baseCost),
      discPercent: fmt(discPct),
      unitCost: fmt(unitCost),
      vatPercent: String(vatPct),
      uniqueId: n(it.uniqueMultiProductId ?? 0),
    },
    useDiscPct,
    defaultTaxPct
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PurchaseOrder() {
  // ── Init ──────────────────────────────────────────────────────────────────
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [stationId, setStationId] = useState(0);
  const [defaultTaxPct, setDefaultTaxPct] = useState(5);
  const [suppliers, setSuppliers] = useState([]);

  // ── Document header ───────────────────────────────────────────────────────
  const [lpoMasterId, setLpoMasterId] = useState(0);
  const [supplierId, setSupplierId] = useState('');
  const [postStatus, setPostStatus] = useState('');

  // ── Line items ────────────────────────────────────────────────────────────
  const [lines, setLines] = useState([]);
  const [deletedChildIds, setDeletedChildIds] = useState([]);

  // ── Line form (draft entry) ───────────────────────────────────────────────
  const [itemForm, setItemForm] = useState(emptyLine());
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState([]);

  // ── LPO header info ───────────────────────────────────────────────────────
  const [lpoInfo, setLpoInfo] = useState({
    lpoNo: '',
    orderFrom: '',
    lpoSupplierName: '',
    supplierQuotationNo: '',
    lpoDate: '',
    discount: 'None',
    bySupplier: false,
    listItem: false,
    useDiscPct: false,
  });

  // ── Summary (auto-computed, except lpoTerms) ──────────────────────────────
  const [lpoTerms, setLpoTerms] = useState('');
  const [manualDiscountAmount, setManualDiscountAmount] = useState('');

  // ── Product search modal ──────────────────────────────────────────────────
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchMode, setProductSearchMode] = useState('description');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productSearchInputRef = useRef(null);

  // ── View detail modal ─────────────────────────────────────────────────────
  const [selectedRow, setSelectedRow] = useState(null);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  // ── LPO list modal ────────────────────────────────────────────────────────
  const [lpoListOpen, setLpoListOpen] = useState(false);
  const [lpoListData, setLpoListData] = useState([]);
  const [lpoListLoading, setLpoListLoading] = useState(false);
  const [lpoListSearch, setLpoListSearch] = useState('');
  const [lpoLoading, setLpoLoading] = useState(false);

  // ── Supplier picker modal ─────────────────────────────────────────────────
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  // ── API feedback ──────────────────────────────────────────────────────────
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isPosted = postStatus === 'POSTED';
  const isCancelled = postStatus === 'CANCELLED';
  const isReadOnly = isPosted || isCancelled;

  // ── Init API ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setInitError('');
      try {
        const data = await fetchLpoEntryInit();
        if (cancelled) return;
        setStationId(Number(data.stationId ?? 0));
        setDefaultTaxPct(Number(data.tax1Percentage ?? 5));
        setSuppliers(data.suppliers ?? []);
        setLpoInfo((prev) => ({
          ...prev,
          lpoNo: String(data.nextLpoNo ?? ''),
          lpoDate: data.serverDate ?? new Date().toISOString().slice(0, 10),
        }));
      } catch (e) {
        if (!cancelled) setInitError(e.message || 'Failed to load LPO form');
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Product search modal effects ──────────────────────────────────────────
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
    const onKey = (e) => { if (e.key === 'Escape') setProductSearchOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [productSearchOpen]);

  useEffect(() => {
    if (!productSearchOpen) return;
    const q = productSearchQuery.trim();
    if (!q || !stationId) {
      setProductSearchResults([]);
      setProductSearchLoading(false);
      return;
    }
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openProductSearch = useCallback((mode = 'description') => {
    setProductSearchMode(mode);
    setProductSearchQuery('');
    setProductSearchResults([]);
    setProductSearchOpen(true);
  }, []);

  const applyProductToForm = useCallback(
    (it) => {
      const line = mapLookupToLine(it, lpoInfo.useDiscPct, defaultTaxPct);
      setItemForm({ ...emptyLine(), ...line });
      setProductSearchOpen(false);
      setProductSearchQuery('');
      setProductSearchResults([]);
    },
    [lpoInfo.useDiscPct, defaultTaxPct]
  );

  const patchItemForm = useCallback(
    (key, value) => {
      setItemForm((prev) => {
        const next = { ...prev, [key]: value };
        // auto-recalc when numeric inputs change
        if (['qty', 'unitCost', 'discPercent', 'vatPercent'].includes(key)) {
          return recalcLpoLine(next, lpoInfo.useDiscPct, defaultTaxPct);
        }
        return next;
      });
    },
    [lpoInfo.useDiscPct, defaultTaxPct]
  );

  // ── Computed totals ───────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const subTotal = round2(lines.reduce((s, l) => s + n(l.subTotal), 0));
    const vatTotal = round2(lines.reduce((s, l) => s + n(l.vatAmount), 0));
    const lineTotal = round2(lines.reduce((s, l) => s + n(l.total), 0));
    const discAmt = n(manualDiscountAmount);
    const netAmount = round2(lineTotal - discAmt);
    return { subTotal, vatTotal, lineTotal, discAmt, netAmount };
  }, [lines, manualDiscountAmount]);

  // ── Table rows derived from lines ─────────────────────────────────────────
  const tableRows = useMemo(
    () =>
      lines.map((l, idx) => [
        String(idx + 1),
        l.ownRefNo || '-',
        l.barCode || '-',
        l.shortDescription || '-',
        l.qty || '0',
        l.uom || '-',
        l.packQty || '0',
        l.foc || '0',
        l.baseCost || '0.00',
        l.discPercent || '0',
        l.unitCost || '0.00',
        l.subTotal || '0.00',
        l.vatPercent || '0',
        l.vatAmount || '0.00',
        l.total || '0.00',
      ]),
    [lines]
  );

  // ── Table totals ──────────────────────────────────────────────────────────
  const tableTotals = useMemo(() => {
    const count = lines.length;
    if (count === 0) {
      return {
        avgDiscPct: 0,
        totalUnitCost: 0,
        totalMid: 0,
        avgVatPct: 0,
        totalVatAmt: 0,
        totalLine: 0,
      };
    }
    let sumDiscPct = 0;
    let totalUnitCost = 0;
    let totalMid = 0;
    let sumVatPct = 0;
    let totalVatAmt = 0;
    let totalLine = 0;
    lines.forEach((l) => {
      sumDiscPct += n(l.discPercent);
      totalUnitCost += n(l.unitCost);
      totalMid += n(l.subTotal);
      sumVatPct += n(l.vatPercent);
      totalVatAmt += n(l.vatAmount);
      totalLine += n(l.total);
    });
    return {
      avgDiscPct: sumDiscPct / count,
      totalUnitCost,
      totalMid,
      avgVatPct: sumVatPct / count,
      totalVatAmt,
      totalLine,
    };
  }, [lines]);

  // ── Add / update line ─────────────────────────────────────────────────────
  const handleAddRow = useCallback(() => {
    if (!n(itemForm.qty)) {
      setApiError('Enter quantity before adding the line.');
      return;
    }
    if (!itemForm.shortDescription.trim() && !itemForm.barCode.trim()) {
      setApiError('Select a product or enter a description.');
      return;
    }
    setApiError('');
    const finalLine = recalcLpoLine(itemForm, lpoInfo.useDiscPct, defaultTaxPct);
    setLines((prev) => [finalLine, ...prev]);
    setItemForm(emptyLine());
  }, [itemForm, lpoInfo.useDiscPct, defaultTaxPct]);

  // ── Row edit (inline editing kept from original) ──────────────────────────
  const handleEditRow = (idx) => {
    setEditingRowIndex(idx);
    setEditingRowData([...tableRows[idx]]);
  };

  const handleEditCellChange = (cellIdx, value) => {
    setEditingRowData((prev) => {
      const next = [...prev];
      next[cellIdx] = value;
      return next;
    });
  };

  const handleSaveEdit = () => {
    if (editingRowIndex === null) return;
    // Map edited cells back to the lines object
    const row = editingRowData;
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== editingRowIndex) return l;
        return recalcLpoLine(
          {
            ...l,
            ownRefNo: row[1] || '',
            barCode: row[2] || '',
            shortDescription: row[3] || '',
            qty: row[4] || '0',
            uom: row[5] || 'PCS',
            packQty: row[6] || '0',
            foc: row[7] || '0',
            baseCost: row[8] || '0',
            discPercent: row[9] || '0',
            unitCost: row[10] || '0',
            vatPercent: row[12] || '0',
          },
          lpoInfo.useDiscPct,
          defaultTaxPct
        );
      })
    );
    setEditingRowIndex(null);
    setEditingRowData([]);
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRowData([]);
  };

  const handleDeleteRow = (idx) => {
    const line = lines[idx];
    if (line?.lpoChildId > 0) {
      setDeletedChildIds((prev) => [...prev, line.lpoChildId]);
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
      setEditingRowData([]);
    } else if (editingRowIndex !== null && idx < editingRowIndex) {
      setEditingRowIndex((prev) => prev - 1);
    }
    setPendingDeleteIndex(null);
  };

  // ── New LPO ───────────────────────────────────────────────────────────────
  const handleNew = useCallback(async () => {
    try {
      const data = await fetchLpoEntryInit();
      setLpoMasterId(0);
      setSupplierId('');
      setPostStatus('');
      setLines([]);
      setDeletedChildIds([]);
      setItemForm(emptyLine());
      setLpoTerms('');
      setManualDiscountAmount('');
      setLpoInfo({
        lpoNo: String(data.nextLpoNo ?? ''),
        orderFrom: '',
        supplierQuotationNo: '',
        lpoDate: data.serverDate ?? new Date().toISOString().slice(0, 10),
        discount: 'None',
        bySupplier: false,
        listItem: false,
        useDiscPct: false,
      });
    } catch (e) {
      setApiError(e.message || 'Failed to reset form');
    }
  }, []);

  // ── Open LPO list modal ───────────────────────────────────────────────────
  const handleOpenLpoList = useCallback(async () => {
    setLpoListOpen(true);
    setLpoListSearch('');
    setLpoListLoading(true);
    try {
      const rows = await fetchLpoEntryList({});
      setLpoListData(rows);
    } catch (e) {
      setApiError(e.message || 'Failed to load LPO list');
    } finally {
      setLpoListLoading(false);
    }
  }, []);

  // ── Load a selected LPO into the form ─────────────────────────────────────
  const handleLoadLpo = useCallback(async (lpoMasterIdToLoad) => {
    setLpoListOpen(false);
    setLpoLoading(true);
    try {
      const data = await fetchLpoEntryGet({ lpoMasterId: lpoMasterIdToLoad });
      setLpoMasterId(data.lpoMasterId);
      setSupplierId(data.supplierId ? String(data.supplierId) : '');
      setPostStatus(data.postStatus || '');
      setLpoTerms(data.lpoTerms || '');
      setManualDiscountAmount(data.discountAmount > 0 ? String(data.discountAmount) : '');
      setDeletedChildIds([]);
      setItemForm(emptyLine());
      setLpoInfo({
        lpoNo: String(data.lpoNo ?? ''),
        orderFrom: String(data.orderNo || ''),
        lpoSupplierName: data.supplierName || '',
        supplierQuotationNo: data.supplierQuoteNo || '',
        lpoDate: data.lpoDate || new Date().toISOString().slice(0, 10),
        discount: 'None',
        bySupplier: false,
        listItem: false,
        useDiscPct: false,
      });
      setLines(
        (data.lines ?? []).map((child) =>
          recalcLpoLine(
            {
              key: lineKey(),
              lpoChildId: child.lpoChildId,
              productId: child.productId,
              ownRefNo: String(child.ownRefNo || ''),
              barCode: child.barCode || '',
              shortDescription: child.description || '',
              qty: String(child.qty || ''),
              uom: child.uom || 'PCS',
              packQty: String(child.packQty || ''),
              foc: String(child.focQty || ''),
              baseCost: String(child.baseCost || ''),
              discPercent: String(child.discount || ''),
              unitCost: String(child.unitPrice || ''),
              vatPercent: String(child.inputTax1RateC || ''),
              subTotal: String(child.subTotalC || ''),
              vatAmount: String(child.inputTax1AmountC || ''),
              total: String((child.subTotalC || 0) + (child.inputTax1AmountC || 0)),
              uniqueId: child.uniqueId || 0,
            },
            false,
            defaultTaxPct
          )
        )
      );
    } catch (e) {
      setApiError(e.message || 'Failed to load LPO');
    } finally {
      setLpoLoading(false);
    }
  }, [defaultTaxPct]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!supplierId || n(supplierId) <= 0) {
      setApiError('Please select a supplier.');
      return;
    }
    if (lines.length === 0) {
      setApiError('Add at least one line item before saving.');
      return;
    }
    setApiError('');
    setSaving(true);
    try {
      const payload = {
        lpoMasterId,
        stationId,
        lpoNo: lpoInfo.lpoNo,
        lpoDate: lpoInfo.lpoDate,
        orderNo: lpoInfo.orderFrom,
        supplierId: n(supplierId),
        supplierQuoteNo: lpoInfo.supplierQuotationNo,
        remarks: lpoTerms,
        discountAmount: n(manualDiscountAmount),
        discountType: lpoInfo.discount,
        bySupplier: lpoInfo.bySupplier,
        isListed: lpoInfo.listItem,
        useDiscPct: lpoInfo.useDiscPct,
        invoiceAmount: totals.netAmount,
        lines: lines.map((l) => ({
          lpoChildId: l.lpoChildId,
          productId: l.productId,
          ownRefNo: l.ownRefNo,
          barCode: l.barCode,
          shortDescription: l.shortDescription,
          qty: n(l.qty),
          unit: l.uom,
          packQty: n(l.packQty),
          focQty: n(l.foc),
          unitPrice: n(l.unitCost),
          baseCost: n(l.baseCost),
          discPct: n(l.discPercent),
          subTotalC: n(l.subTotal),
          vatRate: n(l.vatPercent),
          vatAmount: n(l.vatAmount),
          lineTotal: n(l.total),
          uniqueId: l.uniqueId,
        })),
        deletedChildIds,
      };
      const res = await saveLpoEntry(payload);
      setLpoMasterId(res.lpoMasterId ?? lpoMasterId);
      setDeletedChildIds([]);
      await alertSuccess('LPO saved successfully!');
    } catch (e) {
      setApiError(e.message || 'Failed to save LPO');
    } finally {
      setSaving(false);
    }
  }, [lpoMasterId, supplierId, stationId, lpoInfo, lpoTerms, manualDiscountAmount, totals, lines, deletedChildIds]);

  // ── Post ──────────────────────────────────────────────────────────────────
  const handlePost = useCallback(async () => {
    if (!lpoMasterId) {
      setApiError('Save the LPO before posting.');
      return;
    }
    setApiError('');
    setPosting(true);
    try {
      await postLpoEntry({ lpoMasterId, stationId });
      setPostStatus('POSTED');
      await alertSuccess('LPO posted successfully!');
    } catch (e) {
      setApiError(e.message || 'Failed to post LPO');
    } finally {
      setPosting(false);
    }
  }, [lpoMasterId, stationId]);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(async () => {
    if (!lpoMasterId) {
      handleNew();
      return;
    }
    setApiError('');
    setCancelling(true);
    try {
      await cancelLpoEntry({ lpoMasterId, stationId });
      setPostStatus('CANCELLED');
      await alertWarning('LPO cancelled.');
    } catch (e) {
      setApiError(e.message || 'Failed to cancel LPO');
    } finally {
      setCancelling(false);
    }
  }, [lpoMasterId, stationId, handleNew]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (initLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        Loading LPO form…
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-red-600">
        <span>{initError}</span>
        <button
          type="button"
          className="rounded border border-red-300 px-3 py-1 text-xs hover:bg-red-50"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:mb-[15px] sm:mt-0 sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      {/* LPO load overlay */}
      {lpoLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded bg-white/70 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-500">Loading LPO…</span>
        </div>
      )}
      <style>{`
        .purchase-order-btn-outline:hover {
          border-color: ${primary} !important;
          background: #F2E6EA !important;
          color: ${primary} !important;
        }
        .purchase-order-table table {
          table-layout: fixed;
        }
        .purchase-order-table th,
        .purchase-order-table td {
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .purchase-order-table th:first-child,
        .purchase-order-table td:first-child {
          width: 34px !important;
          min-width: 34px !important;
          max-width: 34px !important;
          text-align: center;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        .purchase-order-table th:nth-child(5),
        .purchase-order-table td:nth-child(5),
        .purchase-order-table th:nth-child(6),
        .purchase-order-table td:nth-child(6),
        .purchase-order-table th:nth-child(7),
        .purchase-order-table td:nth-child(7),
        .purchase-order-table th:nth-child(8),
        .purchase-order-table td:nth-child(8),
        .purchase-order-table th:nth-child(9),
        .purchase-order-table td:nth-child(9),
        .purchase-order-table th:nth-child(10),
        .purchase-order-table td:nth-child(10),
        .purchase-order-table th:nth-child(11),
        .purchase-order-table td:nth-child(11),
        .purchase-order-table th:nth-child(12),
        .purchase-order-table td:nth-child(12),
        .purchase-order-table th:nth-child(13),
        .purchase-order-table td:nth-child(13),
        .purchase-order-table th:nth-child(14),
        .purchase-order-table td:nth-child(14),
        .purchase-order-table th:nth-child(15),
        .purchase-order-table td:nth-child(15) {
          text-align: center;
        }
        .purchase-order-table th:last-child,
        .purchase-order-table td:last-child {
          width: 90px !important;
          min-width: 90px !important;
          text-align: center;
        }
        .purchase-order-table tbody tr:last-child td {
          font-weight: 700;
          background-color: #faf5f6;
        }
        .purchase-order-table tbody tr:last-child td:first-child {
          text-align: left !important;
          padding-left: 8px !important;
        }
      `}</style>

      <div className="flex h-[100%] w-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
        {/* ── Toolbar ── */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            LOCAL PURCHASE ORDER
            {postStatus && (
              <span
                className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                  isPosted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {postStatus}
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="purchase-order-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <img src={PrinterIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              disabled={cancelling || isReadOnly}
              onClick={handleCancel}
              className="purchase-order-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              <img src={CancelIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={posting || isReadOnly || !lpoMasterId}
              onClick={handlePost}
              className="purchase-order-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              <img src={EditIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              {posting ? 'Posting…' : 'Post'}
            </button>
            <button
              type="button"
              disabled={saving || isReadOnly}
              onClick={handleSave}
              className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium text-white sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-60"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              <svg
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleNew}
              className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium text-white sm:px-2 sm:py-1 sm:text-[11px]"
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
              Local Purchase Order
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {apiError && (
          <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            <span>{apiError}</span>
            <button type="button" onClick={() => setApiError('')} className="ml-2 font-bold">✕</button>
          </div>
        )}

        <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[2.5fr_1fr]">
          <div className="flex min-h-0 flex-col gap-3">

            {/* ── Item entry form ── */}
            <div className="w-full rounded border border-gray-200 bg-white p-2 sm:p-3">
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                  <SubInputField
                    label="Own Ref No"
                    widthPx={80}
                    value={itemForm.ownRefNo}
                    onChange={(e) => patchItemForm('ownRefNo', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Bar code"
                    widthPx={80}
                    value={itemForm.barCode}
                    readOnly
                    onClick={() => !isReadOnly && openProductSearch('barcode')}
                    className={isReadOnly ? 'cursor-default' : 'cursor-pointer'}
                    onChange={(e) => patchItemForm('barCode', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <InputField
                    label="Short Description"
                    widthPx={145}
                    value={itemForm.shortDescription}
                    readOnly
                    onClick={() => !isReadOnly && openProductSearch('description')}
                    className={isReadOnly ? 'cursor-default' : 'cursor-pointer'}
                    onChange={(e) => patchItemForm('shortDescription', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Qty"
                    widthPx={64}
                    type="number"
                    value={itemForm.qty}
                    onChange={(e) => patchItemForm('qty', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <DropdownInput
                    label="UOM"
                    options={['PCS', 'BOX', 'CTN', 'KG', 'LTR']}
                    value={itemForm.uom}
                    onChange={(val) => patchItemForm('uom', val)}
                    widthPx={80}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Pack Qty"
                    widthPx={80}
                    type="number"
                    value={itemForm.packQty}
                    onChange={(e) => patchItemForm('packQty', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="FOC"
                    widthPx={64}
                    type="number"
                    value={itemForm.foc}
                    onChange={(e) => patchItemForm('foc', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Base cost"
                    widthPx={80}
                    type="number"
                    value={itemForm.baseCost}
                    onChange={(e) => patchItemForm('baseCost', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Disc %"
                    widthPx={80}
                    type="number"
                    value={itemForm.discPercent}
                    onChange={(e) => patchItemForm('discPercent', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                  <SubInputField
                    label="Unit cost"
                    widthPx={80}
                    type="number"
                    value={itemForm.unitCost}
                    onChange={(e) => patchItemForm('unitCost', e.target.value)}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Sub. total"
                    widthPx={80}
                    value={itemForm.subTotal}
                    readOnly
                    style={{ background: '#f9fafb' }}
                  />
                  <DropdownInput
                    label="Vat %"
                    options={['0', '5', '10', '15']}
                    value={itemForm.vatPercent}
                    onChange={(val) => patchItemForm('vatPercent', val)}
                    widthPx={80}
                    disabled={isReadOnly}
                  />
                  <SubInputField
                    label="Vat amount"
                    widthPx={80}
                    value={itemForm.vatAmount}
                    readOnly
                    style={{ background: '#f9fafb' }}
                  />
                  <SubInputField
                    label="Total"
                    widthPx={80}
                    value={itemForm.total}
                    readOnly
                    style={{ background: '#f9fafb' }}
                  />
                  <div className="ml-auto flex items-end">
                    <button
                      type="button"
                      onClick={handleAddRow}
                      disabled={isReadOnly}
                      className="h-[20.08px] rounded border px-3 text-[11px] font-medium text-white disabled:opacity-50"
                      style={{ backgroundColor: primary, borderColor: primary }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Items table ── */}
            <div className="hidden min-h-0 flex-1 flex-col rounded bg-white xl:flex w-full">
              <div className="min-h-0 min-w-0 w-full">
                <CommonTable
                  className="purchase-order-table"
                  headers={['SL No', 'Own REF No', 'Barcode', 'shortDescription', 'Qty', 'UOM', 'pack qty', 'FOC', 'base cost', 'disc%', 'unit cost', 'total', 'vat%', 'Vat Amt', 'line total', 'Action']}
                  fitParentWidth
                  maxVisibleRows={20}
                  rows={[
                    ...tableRows.map((row, idx) => [
                      ...row.map((cell, cellIdx) =>
                        editingRowIndex === idx ? (
                          <input
                            key={`edit-${idx}-${cellIdx}`}
                            value={editingRowData[cellIdx] ?? ''}
                            onChange={(e) => handleEditCellChange(cellIdx, e.target.value)}
                            className="h-5 w-full rounded border border-gray-300 bg-white px-1 text-[8px] outline-none"
                          />
                        ) : (
                          cell
                        )
                      ),
                      {
                        content: (
                          <div className="flex min-w-0 flex-wrap items-center justify-center gap-px text-center leading-none">
                            {editingRowIndex === idx ? (
                              <>
                                <button
                                  type="button"
                                  className="rounded border border-gray-300 px-0.5 py-px text-[6px] leading-tight"
                                  onClick={handleSaveEdit}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-gray-300 px-0.5 py-px text-[6px] leading-tight"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-red-200 bg-red-50 px-0.5 py-px text-[6px] leading-tight text-red-700 hover:bg-red-100"
                                  aria-label="Delete row"
                                  onClick={() => setPendingDeleteIndex(idx)}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="rounded p-px"
                                  aria-label="View row details"
                                  onClick={() => setSelectedRow(lines[idx])}
                                >
                                  <img src={ViewActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                                </button>
                                <button
                                  type="button"
                                  className="rounded p-px"
                                  aria-label="Edit row"
                                  onClick={() => handleEditRow(idx)}
                                  disabled={isReadOnly}
                                >
                                  <img src={EditActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                                </button>
                                <button
                                  type="button"
                                  className="rounded p-px"
                                  aria-label="Delete row"
                                  onClick={() => setPendingDeleteIndex(idx)}
                                  disabled={isReadOnly}
                                >
                                  <img src={DeleteActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ),
                        className: '!px-0.5 !py-0 sm:!px-0.5 sm:!py-0',
                      },
                    ]),
                    [
                      { content: 'Total', colSpan: 9, className: 'text-left font-bold' },
                      tableTotals.avgDiscPct.toFixed(2),
                      tableTotals.totalUnitCost.toFixed(2),
                      tableTotals.totalMid.toFixed(2),
                      tableTotals.avgVatPct.toFixed(2),
                      tableTotals.totalVatAmt.toFixed(2),
                      tableTotals.totalLine.toFixed(2),
                      '',
                    ],
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex min-h-0 flex-col gap-3">

            {/* LPO header info */}
            <div
              className="w-full rounded bg-white p-3 sm:p-3.5"
              style={{ borderRadius: '9.9px', border: '0.49px solid #e5e7eb' }}
            >
              {/* Section title */}
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-gray-400">LPO Details</p>
              <div className="flex flex-col gap-2">

                {/* Row 1: LPO No | Order Form */}
                <div className="grid grid-cols-2 gap-2">
                  <SubInputField
                    label="LPO No"
                    fullWidth
                    value={lpoInfo.lpoNo}
                    readOnly
                    onClick={handleOpenLpoList}
                    className="cursor-pointer bg-gray-50"
                  />
                  <SubInputField
                    label="Order Form"
                    fullWidth
                    value={lpoInfo.orderFrom}
                    onChange={(e) => setLpoInfo((prev) => ({ ...prev, orderFrom: e.target.value }))}
                    disabled={isReadOnly}
                  />
                </div>

                {/* Row 2: Supplier Name (full width) */}
                <InputField
                  label="Supplier Name"
                  fullWidth
                  value={lpoInfo.lpoSupplierName}
                  readOnly
                  onChange={(e) => setLpoInfo((prev) => ({ ...prev, lpoSupplierName: e.target.value }))}
                  onClick={() => !isReadOnly && setSupplierPickerOpen(true)}
                  disabled={isReadOnly}
                  className={isReadOnly ? 'cursor-default' : 'cursor-pointer'}
                />

                {/* Row 3: Supplier Quot. No | LPO Date */}
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    label="Supplier Quot. No"
                    fullWidth
                    value={lpoInfo.supplierQuotationNo}
                    onChange={(e) => setLpoInfo((prev) => ({ ...prev, supplierQuotationNo: e.target.value }))}
                    disabled={isReadOnly}
                  />
                  <DateInputField
                    label="LPO Date"
                    fullWidth
                    value={lpoInfo.lpoDate}
                    onChange={(val) => setLpoInfo((prev) => ({ ...prev, lpoDate: val }))}
                    disabled={isReadOnly}
                  />
                </div>

                {/* Row 4: Discount type (full width) */}
                <DropdownInput
                  label="Discount Type"
                  fullWidth
                  value={lpoInfo.discount}
                  onChange={(val) => setLpoInfo((prev) => ({ ...prev, discount: val }))}
                  options={['None', 'Flat', 'Percentage']}
                  disabled={isReadOnly}
                />

                {/* Row 5: Toggles */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                  <Switch
                    checked={lpoInfo.bySupplier}
                    onChange={(v) => setLpoInfo((prev) => ({ ...prev, bySupplier: v }))}
                    description="By Supplier"
                    size="xs"
                    disabled={isReadOnly}
                  />
                  <Switch
                    checked={lpoInfo.listItem}
                    onChange={(v) => setLpoInfo((prev) => ({ ...prev, listItem: v }))}
                    description="List Item"
                    size="xs"
                    disabled={isReadOnly}
                  />
                  <Switch
                    checked={lpoInfo.useDiscPct}
                    onChange={(v) => setLpoInfo((prev) => ({ ...prev, useDiscPct: v }))}
                    description="Use Disc%"
                    size="xs"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="w-full rounded border border-gray-200 bg-white p-3 sm:p-3.5">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-gray-400">Summary</p>
              <div className="flex flex-col gap-2">

                {/* Total */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Total</label>
                  <input
                    type="text"
                    readOnly
                    value={fmt(totals.lineTotal)}
                    className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-2 text-[10px] font-semibold outline-none sm:text-[11px]"
                  />
                </div>

                {/* Discount Amount */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Discount Amount</label>
                  <input
                    type="number"
                    value={manualDiscountAmount}
                    onChange={(e) => setManualDiscountAmount(e.target.value)}
                    disabled={isReadOnly}
                    className="h-6 w-full rounded border border-gray-200 bg-white px-2 text-[10px] outline-none sm:text-[11px] disabled:bg-gray-50"
                  />
                </div>

                {/* Net Amount — highlighted */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Net Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={fmt(totals.netAmount)}
                    className="h-7 w-full rounded border border-gray-300 bg-gray-50 px-2 text-[11px] font-bold outline-none sm:text-[12px]"
                    style={{ color: primary }}
                  />
                </div>

                {/* LPO Terms */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">LPO Terms</label>
                  <textarea
                    value={lpoTerms}
                    onChange={(e) => setLpoTerms(e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none sm:text-[11px] disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Delete confirmation ── */}
        <ConfirmDialog
          open={pendingDeleteIndex !== null}
          title="Delete line item?"
          message="This will remove the row from the purchase order. This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onClose={() => setPendingDeleteIndex(null)}
          onConfirm={() => {
            if (pendingDeleteIndex !== null) handleDeleteRow(pendingDeleteIndex);
          }}
        />

        {/* ── Row detail modal ── */}
        {selectedRow && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedRow(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Row details"
          >
            <div
              className="mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>Item details</h2>
                <button
                  type="button"
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  onClick={() => setSelectedRow(null)}
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ['Own REF No', selectedRow.ownRefNo],
                  ['Barcode', selectedRow.barCode],
                  ['Description', selectedRow.shortDescription],
                  ['Qty', selectedRow.qty],
                  ['UOM', selectedRow.uom],
                  ['Pack Qty', selectedRow.packQty],
                  ['FOC', selectedRow.foc],
                  ['Base Cost', selectedRow.baseCost],
                  ['Disc %', selectedRow.discPercent],
                  ['Unit Cost', selectedRow.unitCost],
                  ['Sub Total', selectedRow.subTotal],
                  ['VAT %', selectedRow.vatPercent],
                  ['VAT Amount', selectedRow.vatAmount],
                  ['Line Total', selectedRow.total],
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

        {/* ── LPO list modal ── */}
        {lpoListOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3"
            onClick={() => setLpoListOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Browse LPOs"
          >
            <div
              className="relative flex w-full max-w-3xl max-h-[85vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold" style={{ color: primary }}>Browse Local Purchase Orders</h2>
                <button type="button" onClick={() => setLpoListOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-gray-100 px-4 py-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by LPO No or Supplier…"
                  value={lpoListSearch}
                  onChange={(e) => setLpoListSearch(e.target.value)}
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-[12px] outline-none focus:border-gray-400"
                />
              </div>

              {/* List */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {lpoListLoading ? (
                  <p className="px-4 py-6 text-center text-[12px] text-gray-400">Loading…</p>
                ) : (
                  <table className="w-full border-collapse text-[11px]">
                    <thead className="sticky top-0" style={{ backgroundColor: '#F2E6EA' }}>
                      <tr>
                        {['LPO No', 'Supplier', 'Date', 'Amount', 'Status'].map((h) => (
                          <th key={h} className="border-b border-gray-200 px-3 py-2 text-left text-[10px] font-bold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lpoListData
                        .filter((r) => {
                          const q = lpoListSearch.toLowerCase();
                          return !q || String(r.lpoNo ?? '').includes(q) || (r.supplierName ?? '').toLowerCase().includes(q);
                        })
                        .map((r) => (
                          <tr
                            key={r.lpoMasterId}
                            className="cursor-pointer border-b border-gray-100 hover:bg-rose-50/60"
                            onClick={() => handleLoadLpo(r.lpoMasterId)}
                          >
                            <td className="px-3 py-2 font-medium text-gray-900">{r.lpoNo}</td>
                            <td className="px-3 py-2 text-gray-700">{r.supplierName || '—'}</td>
                            <td className="px-3 py-2 text-gray-500">{r.lpoDate ? String(r.lpoDate).slice(0, 10) : '—'}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{Number(r.invoiceAmount ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                r.postStatus === 'POSTED' ? 'bg-green-100 text-green-700' :
                                r.postStatus === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {r.postStatus || 'DRAFT'}
                              </span>
                            </td>
                          </tr>
                        ))
                      }
                      {!lpoListLoading && lpoListData.filter((r) => {
                        const q = lpoListSearch.toLowerCase();
                        return !q || String(r.lpoNo ?? '').includes(q) || (r.supplierName ?? '').toLowerCase().includes(q);
                      }).length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-[12px] text-gray-400">No LPOs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Supplier picker modal ── */}
        {supplierPickerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3"
            onClick={() => setSupplierPickerOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Pick Supplier"
          >
            <div
              className="relative flex w-full max-w-sm max-h-[70vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold" style={{ color: primary }}>Select Supplier</h2>
                <button type="button" onClick={() => setSupplierPickerOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="border-b border-gray-100 px-4 py-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search supplier…"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="w-full rounded border border-gray-200 px-3 py-1.5 text-[12px] outline-none focus:border-gray-400"
                />
              </div>
              <ul className="min-h-0 flex-1 overflow-y-auto text-[12px]">
                {suppliers
                  .filter((s) => !supplierSearch || (s.SupplierName ?? '').toLowerCase().includes(supplierSearch.toLowerCase()))
                  .map((s) => (
                    <li key={s.SupplierID} className="border-b border-gray-100">
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60"
                        onClick={() => {
                          setSupplierId(String(s.SupplierID));
                          setLpoInfo((prev) => ({ ...prev, lpoSupplierName: s.SupplierName }));
                          setSupplierPickerOpen(false);
                          setSupplierSearch('');
                        }}
                      >
                        <span className="font-medium text-gray-900">{s.SupplierName}</span>
                        <span className="ml-2 text-[10px] text-gray-400">#{s.SupplierID}</span>
                      </button>
                    </li>
                  ))
                }
                {suppliers.filter((s) => !supplierSearch || (s.SupplierName ?? '').toLowerCase().includes(supplierSearch.toLowerCase())).length === 0 && (
                  <li className="px-4 py-6 text-center text-[12px] text-gray-400">No suppliers found.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* ── Product search modal ── */}
        {productSearchOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2"
            onClick={() => setProductSearchOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lpo-product-search-title"
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
                id="lpo-product-search-title"
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
                      onClick={() => {
                        setProductSearchMode(mode);
                        setProductSearchQuery('');
                        setProductSearchResults([]);
                      }}
                      className={`rounded border px-2 py-1 text-[10px] font-medium sm:text-[11px] ${
                        productSearchMode === mode
                          ? 'border-transparent text-white'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                      style={
                        productSearchMode === mode
                          ? { backgroundColor: primary, borderColor: primary }
                          : undefined
                      }
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
                  placeholder={
                    productSearchMode === 'barcode'
                      ? 'Scan or type barcode…'
                      : 'Type product name…'
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
                  productSearchResults.length === 0 && (
                    <li className="px-4 py-6 text-center text-[11px] text-gray-500">
                      No products found.
                    </li>
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
                        #{it.productId} · {it.barCode || '—'} · Cost{' '}
                        {it.averageCost ?? it.unitCost ?? '—'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
