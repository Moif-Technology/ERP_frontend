/**
 * Goods Receive Note (GRN) — API-backed.
 * Routes: GET /api/grn/entry/init · /get · /list
 *         POST /api/grn/entry/save · /cancel
 *         GET /api/products/lookup (shared)
 *
 * Tables: GRNMaster, GRNChild (see GRN_ENTRY_BACKEND_PLAN.md)
 */
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  DateInputField,
  Switch,
  CommonTable,
  ConfirmDialog,
} from '../../../shared/components/ui';
import { alertSuccess, alertWarning } from '../../../shared/components/ui/sweetAlertTheme.jsx';
import {
  fetchGrnEntryInit,
  fetchGrnEntryGet,
  fetchGrnEntryList,
  saveGrnEntry,
  cancelGrnEntry,
} from '../api/grn/grnEntry.service.js';
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

function recalcGrnLine(line, useDiscPct = false, defaultTaxPct = 0) {
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
    grnChildId: 0,
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

  return recalcGrnLine(
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
// Main
// ---------------------------------------------------------------------------

export default function GoodsReceiveNote() {
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [stationId, setStationId] = useState(0);
  const [defaultTaxPct, setDefaultTaxPct] = useState(5);
  const [suppliers, setSuppliers] = useState([]);

  const [grnMasterId, setGrnMasterId] = useState(0);
  const [supplierId, setSupplierId] = useState('');
  const [docStatus, setDocStatus] = useState('');

  const [lines, setLines] = useState([]);
  const [itemForm, setItemForm] = useState(emptyLine());
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState([]);

  const [grnInfo, setGrnInfo] = useState({
    grnNo: '',
    orderFormNo: '',
    supplierName: '',
    supplierDocNo: '',
    grnDate: '',
    discount: 'None',
    purchaseNo: '',
    bySupplier: false,
    listItem: false,
    useDiscPct: false,
  });

  const [grnTerms, setGrnTerms] = useState('');
  const [manualDiscountAmount, setManualDiscountAmount] = useState('');

  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchMode, setProductSearchMode] = useState('description');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productSearchInputRef = useRef(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const [grnListOpen, setGrnListOpen] = useState(false);
  const [grnListData, setGrnListData] = useState([]);
  const [grnListLoading, setGrnListLoading] = useState(false);
  const [grnListSearch, setGrnListSearch] = useState('');
  const [grnLoading, setGrnLoading] = useState(false);

  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isInvoiced = String(docStatus).toUpperCase() === 'INVOICED';
  const isReadOnly = isInvoiced;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setInitError('');
      try {
        const data = await fetchGrnEntryInit();
        if (cancelled) return;
        setStationId(Number(data.stationId ?? 0));
        setDefaultTaxPct(Number(data.tax1Percentage ?? 5));
        setSuppliers(data.suppliers ?? []);
        setGrnInfo((prev) => ({
          ...prev,
          grnNo: '',
          grnDate: data.serverDate ?? new Date().toISOString().slice(0, 10),
        }));
      } catch (e) {
        if (!cancelled) setInitError(e.message || 'Failed to load GRN form');
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  const openProductSearch = useCallback((mode = 'description') => {
    setProductSearchMode(mode);
    setProductSearchQuery('');
    setProductSearchResults([]);
    setProductSearchOpen(true);
  }, []);

  const applyProductToForm = useCallback(
    (it) => {
      const line = mapLookupToLine(it, grnInfo.useDiscPct, defaultTaxPct);
      setItemForm({ ...emptyLine(), ...line });
      setProductSearchOpen(false);
      setProductSearchQuery('');
      setProductSearchResults([]);
    },
    [grnInfo.useDiscPct, defaultTaxPct]
  );

  const patchItemForm = useCallback(
    (key, value) => {
      setItemForm((prev) => {
        const next = { ...prev, [key]: value };
        if (['qty', 'unitCost', 'discPercent', 'vatPercent'].includes(key)) {
          return recalcGrnLine(next, grnInfo.useDiscPct, defaultTaxPct);
        }
        return next;
      });
    },
    [grnInfo.useDiscPct, defaultTaxPct]
  );

  const totals = useMemo(() => {
    const subTotal = round2(lines.reduce((s, l) => s + n(l.subTotal), 0));
    const vatTotal = round2(lines.reduce((s, l) => s + n(l.vatAmount), 0));
    const lineTotal = round2(lines.reduce((s, l) => s + n(l.total), 0));
    const discAmt = n(manualDiscountAmount);
    const netAmount = round2(lineTotal - discAmt);
    return { subTotal, vatTotal, lineTotal, discAmt, netAmount };
  }, [lines, manualDiscountAmount]);

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

  const handleAddRow = useCallback(() => {
    if (!n(itemForm.qty) && !n(itemForm.foc)) {
      setApiError('Enter quantity or FOC before adding the line.');
      return;
    }
    if (!itemForm.shortDescription.trim() && !itemForm.barCode.trim()) {
      setApiError('Select a product or enter a description.');
      return;
    }
    setApiError('');
    const finalLine = recalcGrnLine(itemForm, grnInfo.useDiscPct, defaultTaxPct);
    setLines((prev) => [finalLine, ...prev]);
    setItemForm(emptyLine());
  }, [itemForm, grnInfo.useDiscPct, defaultTaxPct]);

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
    const row = editingRowData;
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== editingRowIndex) return l;
        return recalcGrnLine(
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
          grnInfo.useDiscPct,
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
    setLines((prev) => prev.filter((_, i) => i !== idx));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
      setEditingRowData([]);
    } else if (editingRowIndex !== null && idx < editingRowIndex) {
      setEditingRowIndex((prev) => prev - 1);
    }
    setPendingDeleteIndex(null);
  };

  const handleNew = useCallback(async () => {
    try {
      const data = await fetchGrnEntryInit();
      setGrnMasterId(0);
      setSupplierId('');
      setDocStatus('');
      setLines([]);
      setItemForm(emptyLine());
      setGrnTerms('');
      setManualDiscountAmount('');
      setGrnInfo({
        grnNo: '',
        orderFormNo: '',
        supplierName: '',
        supplierDocNo: '',
        grnDate: data.serverDate ?? new Date().toISOString().slice(0, 10),
        discount: 'None',
        purchaseNo: '',
        bySupplier: false,
        listItem: false,
        useDiscPct: false,
      });
    } catch (e) {
      setApiError(e.message || 'Failed to reset form');
    }
  }, []);

  const handleOpenGrnList = useCallback(async () => {
    setGrnListOpen(true);
    setGrnListSearch('');
    setGrnListLoading(true);
    try {
      const rows = await fetchGrnEntryList({});
      setGrnListData(rows);
    } catch (e) {
      setApiError(e.message || 'Failed to load GRN list');
    } finally {
      setGrnListLoading(false);
    }
  }, []);

  const loadGrnDocument = useCallback(
    async (params) => {
      setGrnListOpen(false);
      setGrnLoading(true);
      setApiError('');
      try {
        const data = await fetchGrnEntryGet(params);
        setGrnMasterId(data.grnMasterId ?? 0);
        setSupplierId(data.supplierId ? String(data.supplierId) : '');
        setDocStatus(data.status || '');
        setGrnTerms(data.grnTerms || '');
        setManualDiscountAmount(data.discountAmount > 0 ? String(data.discountAmount) : '');
        setItemForm(emptyLine());
        setGrnInfo({
          grnNo: String(data.grnNo ?? ''),
          orderFormNo: String(data.orderNo || ''),
          supplierName: data.supplierName || '',
          supplierDocNo: data.supplierQuoteNo || '',
          grnDate: data.grnDate || new Date().toISOString().slice(0, 10),
          discount: data.discountType || 'None',
          purchaseNo: String(data.purchaseNo ?? ''),
          bySupplier: false,
          listItem: false,
          useDiscPct: false,
        });
        setLines(
          (data.lines ?? []).map((child) =>
            recalcGrnLine(
              {
                key: lineKey(),
                grnChildId: child.grnChildId,
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
                total: String(
                  round2(n(child.subTotalC) + n(child.inputTax1AmountC))
                ),
                uniqueId: child.uniqueId || 0,
              },
              false,
              defaultTaxPct
            )
          )
        );
      } catch (e) {
        setApiError(e.message || 'Failed to load GRN');
      } finally {
        setGrnLoading(false);
      }
    },
    [defaultTaxPct]
  );

  const handleLoadGrnById = useCallback(
    (id) => loadGrnDocument({ grnMasterId: id }),
    [loadGrnDocument]
  );

  const handleViewByGrnNo = useCallback(() => {
    const no = n(grnInfo.grnNo);
    if (!no) {
      setApiError('Enter a GRN number to load.');
      return;
    }
    setApiError('');
    loadGrnDocument({ grnNo: no });
  }, [grnInfo.grnNo, loadGrnDocument]);

  const handleSave = useCallback(async () => {
    if (!supplierId || n(supplierId) <= 0) {
      setApiError('Please select a supplier.');
      return;
    }
    if (!grnInfo.supplierDocNo?.trim()) {
      setApiError('Please enter supplier quotation / invoice number.');
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
        grnMasterId,
        grnDate: grnInfo.grnDate,
        supplierId: n(supplierId),
        orderNo: n(grnInfo.orderFormNo),
        lpoMasterId: 0,
        lpoNo: 0,
        discountType: grnInfo.discount || 'None',
        grnTerms,
        supplierQuoteNo: grnInfo.supplierDocNo.trim(),
        subTotalM: totals.subTotal,
        discountAmount: n(manualDiscountAmount),
        inputTax1AmountM: totals.vatTotal,
        inputTax1RateM: defaultTaxPct,
        grnAmount: totals.lineTotal,
        lines: lines.map((l) => ({
          productId: n(l.productId),
          uniqueId: n(l.uniqueId),
          ownRefNo: n(l.ownRefNo),
          barCode: l.barCode || '',
          description: l.shortDescription || '',
          qty: n(l.qty),
          focQty: n(l.foc),
          packQty: n(l.packQty),
          baseCost: n(l.baseCost),
          unitPrice: n(l.unitCost),
          discount: n(l.discPercent),
          subTotalC: n(l.subTotal),
          inputTax1RateC: n(l.vatPercent),
          inputTax1AmountC: n(l.vatAmount),
          inputTax2AmountC: 0,
          inputTax3AmountC: 0,
          inputTax2RateC: 0,
          inputTax3RateC: 0,
          uom: l.uom || 'PCS',
        })),
      };
      const res = await saveGrnEntry(payload);
      setGrnMasterId(res.grnMasterId ?? grnMasterId);
      if (res.grnNo != null) {
        setGrnInfo((prev) => ({ ...prev, grnNo: String(res.grnNo) }));
      }
      setDocStatus('PENDING');
      await alertSuccess(res.message || 'GRN saved successfully!');
    } catch (e) {
      setApiError(e.message || 'Failed to save GRN');
    } finally {
      setSaving(false);
    }
  }, [
    grnMasterId,
    supplierId,
    grnInfo,
    grnTerms,
    manualDiscountAmount,
    totals,
    lines,
    defaultTaxPct,
  ]);

  const handleCancelDoc = useCallback(async () => {
    if (!grnMasterId) {
      handleNew();
      return;
    }
    setApiError('');
    setCancelling(true);
    try {
      await cancelGrnEntry({ grnMasterId });
      setDocStatus('CANCELLED');
      await alertWarning('GRN cancelled.');
      await handleNew();
    } catch (e) {
      setApiError(e.message || 'Failed to cancel GRN');
    } finally {
      setCancelling(false);
    }
  }, [grnMasterId, handleNew]);

  if (initLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        Loading GRN form…
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
      {grnLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded bg-white/70 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-500">Loading GRN…</span>
        </div>
      )}
      <style>{`
        .grn-btn-outline:hover {
          border-color: ${primary} !important;
          background: #F2E6EA !important;
          color: ${primary} !important;
        }
        .grn-table table { table-layout: fixed; }
        .grn-table th, .grn-table td {
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .grn-table th:first-child, .grn-table td:first-child {
          width: 34px !important; min-width: 34px !important; max-width: 34px !important;
          text-align: center;
          padding-left: 4px !important; padding-right: 4px !important;
        }
        .grn-table th:nth-child(5), .grn-table td:nth-child(5),
        .grn-table th:nth-child(6), .grn-table td:nth-child(6),
        .grn-table th:nth-child(7), .grn-table td:nth-child(7),
        .grn-table th:nth-child(8), .grn-table td:nth-child(8),
        .grn-table th:nth-child(9), .grn-table td:nth-child(9),
        .grn-table th:nth-child(10), .grn-table td:nth-child(10),
        .grn-table th:nth-child(11), .grn-table td:nth-child(11),
        .grn-table th:nth-child(12), .grn-table td:nth-child(12),
        .grn-table th:nth-child(13), .grn-table td:nth-child(13),
        .grn-table th:nth-child(14), .grn-table td:nth-child(14),
        .grn-table th:nth-child(15), .grn-table td:nth-child(15) {
          text-align: center;
        }
        .grn-table th:last-child, .grn-table td:last-child {
          width: 90px !important; min-width: 90px !important; text-align: center;
        }
        .grn-table tbody tr:last-child td {
          font-weight: 700;
          background-color: #faf5f6;
        }
        .grn-table tbody tr:last-child td:first-child {
          text-align: left !important;
          padding-left: 8px !important;
        }
      `}</style>

      <div className="flex h-[100%] w-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            GOODS RECEIVE NOTE
            {docStatus && (
              <span
                className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                  isInvoiced ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {docStatus}
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="grn-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <img src={PrinterIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              disabled={cancelling || isReadOnly}
              onClick={handleCancelDoc}
              className="grn-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-50"
            >
              <img src={CancelIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleOpenGrnList}
              className="grn-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <img src={EditIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              Browse
            </button>
            <button
              type="button"
              disabled={saving || isReadOnly}
              onClick={handleSave}
              className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium text-white sm:px-2 sm:py-1 sm:text-[11px] disabled:opacity-60"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              <svg className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
              <svg className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              New GRN
            </button>
          </div>
        </div>

        {apiError && (
          <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            <span>{apiError}</span>
            <button type="button" onClick={() => setApiError('')} className="ml-2 font-bold">✕</button>
          </div>
        )}

        <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[2.5fr_1fr]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="w-full rounded border border-gray-200 bg-white p-2 sm:p-3">
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                  <SubInputField label="Own Ref No" widthPx={80} value={itemForm.ownRefNo} onChange={(e) => patchItemForm('ownRefNo', e.target.value)} disabled={isReadOnly} />
                  <SubInputField label="Bar code" widthPx={80} value={itemForm.barCode} readOnly onClick={() => !isReadOnly && openProductSearch('barcode')} className={isReadOnly ? 'cursor-default' : 'cursor-pointer'} disabled={isReadOnly} />
                  <InputField label="Short Description" widthPx={145} value={itemForm.shortDescription} readOnly onClick={() => !isReadOnly && openProductSearch('description')} className={isReadOnly ? 'cursor-default' : 'cursor-pointer'} disabled={isReadOnly} />
                  <SubInputField label="Qty" widthPx={64} type="number" value={itemForm.qty} onChange={(e) => patchItemForm('qty', e.target.value)} disabled={isReadOnly} />
                  <DropdownInput label="UOM" options={['PCS', 'BOX', 'CTN', 'KG', 'LTR']} value={itemForm.uom} onChange={(val) => patchItemForm('uom', val)} widthPx={80} disabled={isReadOnly} />
                  <SubInputField label="Pack Qty" widthPx={80} type="number" value={itemForm.packQty} onChange={(e) => patchItemForm('packQty', e.target.value)} disabled={isReadOnly} />
                  <SubInputField label="FOC" widthPx={64} type="number" value={itemForm.foc} onChange={(e) => patchItemForm('foc', e.target.value)} disabled={isReadOnly} />
                  <SubInputField label="Base cost" widthPx={80} type="number" value={itemForm.baseCost} onChange={(e) => patchItemForm('baseCost', e.target.value)} disabled={isReadOnly} />
                  <SubInputField label="Disc %" widthPx={80} type="number" value={itemForm.discPercent} onChange={(e) => patchItemForm('discPercent', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="flex flex-wrap items-end gap-2.5 xl:flex-nowrap">
                  <SubInputField label="Unit cost" widthPx={80} type="number" value={itemForm.unitCost} onChange={(e) => patchItemForm('unitCost', e.target.value)} disabled={isReadOnly} />
                  <SubInputField label="Sub. total" widthPx={80} value={itemForm.subTotal} readOnly style={{ background: '#f9fafb' }} />
                  <DropdownInput label="Vat %" options={['0', '5', '10', '15']} value={itemForm.vatPercent} onChange={(val) => patchItemForm('vatPercent', val)} widthPx={80} disabled={isReadOnly} />
                  <SubInputField label="Vat amount" widthPx={80} value={itemForm.vatAmount} readOnly style={{ background: '#f9fafb' }} />
                  <SubInputField label="Total" widthPx={80} value={itemForm.total} readOnly style={{ background: '#f9fafb' }} />
                  <div className="ml-auto flex items-end">
                    <button type="button" onClick={handleAddRow} disabled={isReadOnly} className="h-[20.08px] rounded border px-3 text-[11px] font-medium text-white disabled:opacity-50" style={{ backgroundColor: primary, borderColor: primary }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden min-h-0 flex-1 flex-col rounded bg-white xl:flex w-full">
              <div className="min-h-0 min-w-0 w-full">
                <CommonTable
                  className="grn-table"
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
                                <button type="button" className="rounded border border-gray-300 px-0.5 py-px text-[6px] leading-tight" onClick={handleSaveEdit}>Save</button>
                                <button type="button" className="rounded border border-gray-300 px-0.5 py-px text-[6px] leading-tight" onClick={handleCancelEdit}>Cancel</button>
                                <button type="button" className="rounded border border-red-200 bg-red-50 px-0.5 py-px text-[6px] leading-tight text-red-700 hover:bg-red-100" aria-label="Delete row" onClick={() => setPendingDeleteIndex(idx)}>Delete</button>
                              </>
                            ) : (
                              <>
                                <button type="button" className="rounded p-px" aria-label="View row details" onClick={() => setSelectedRow(lines[idx])}>
                                  <img src={ViewActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                                </button>
                                <button type="button" className="rounded p-px" aria-label="Edit row" onClick={() => handleEditRow(idx)} disabled={isReadOnly}>
                                  <img src={EditActionIcon} alt="" className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" />
                                </button>
                                <button type="button" className="rounded p-px" aria-label="Delete row" onClick={() => setPendingDeleteIndex(idx)} disabled={isReadOnly}>
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

          <div className="flex min-h-0 flex-col gap-3">
            <div className="w-full rounded bg-white p-3 sm:p-3.5" style={{ borderRadius: '9.9px', border: '0.49px solid #e5e7eb' }}>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-gray-400">GRN Details</p>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <SubInputField label="GRN No" fullWidth value={grnInfo.grnNo} onChange={(e) => setGrnInfo((prev) => ({ ...prev, grnNo: e.target.value }))} readOnly={isReadOnly} />
                  <SubInputField label="Order Form No" fullWidth value={grnInfo.orderFormNo} onChange={(e) => setGrnInfo((prev) => ({ ...prev, orderFormNo: e.target.value }))} disabled={isReadOnly} />
                </div>
                <InputField label="Supplier Name" fullWidth value={grnInfo.supplierName} readOnly onClick={() => !isReadOnly && setSupplierPickerOpen(true)} disabled={isReadOnly} className={isReadOnly ? 'cursor-default' : 'cursor-pointer'} />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Supplier Quot./Invoice No" fullWidth value={grnInfo.supplierDocNo} onChange={(e) => setGrnInfo((prev) => ({ ...prev, supplierDocNo: e.target.value }))} disabled={isReadOnly} />
                  <DateInputField label="GRN Date" fullWidth value={grnInfo.grnDate} onChange={(val) => setGrnInfo((prev) => ({ ...prev, grnDate: val }))} disabled={isReadOnly} />
                </div>
                <DropdownInput label="Discount Type" fullWidth value={grnInfo.discount} onChange={(val) => setGrnInfo((prev) => ({ ...prev, discount: val }))} options={['None', 'Flat', 'Percentage']} disabled={isReadOnly} />
                <SubInputField label="Purchase No" fullWidth value={grnInfo.purchaseNo} readOnly className="bg-gray-50" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                    <Switch checked={grnInfo.bySupplier} onChange={(v) => setGrnInfo((prev) => ({ ...prev, bySupplier: v }))} description="With supplier" size="xs" disabled={isReadOnly} />
                    <Switch checked={grnInfo.listItem} onChange={(v) => setGrnInfo((prev) => ({ ...prev, listItem: v }))} description="List items" size="xs" disabled={isReadOnly} />
                    <Switch checked={grnInfo.useDiscPct} onChange={(v) => setGrnInfo((prev) => ({ ...prev, useDiscPct: v }))} description="Use Disc %" size="xs" disabled={isReadOnly} />
                  </div>
                  <button type="button" onClick={handleViewByGrnNo} disabled={isReadOnly} className="rounded border px-2 py-1 text-[10px] font-semibold text-white hover:opacity-95 sm:text-[11px] disabled:opacity-50" style={{ backgroundColor: primary, borderColor: primary }}>
                    View
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full rounded border border-gray-200 bg-white p-3 sm:p-3.5">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-gray-400">Summary</p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Total</label>
                  <input type="text" readOnly value={fmt(totals.lineTotal)} className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-2 text-[10px] font-semibold outline-none sm:text-[11px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Discount amount</label>
                  <input type="number" value={manualDiscountAmount} onChange={(e) => setManualDiscountAmount(e.target.value)} disabled={isReadOnly} className="h-6 w-full rounded border border-gray-200 bg-white px-2 text-[10px] outline-none sm:text-[11px] disabled:bg-gray-50" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Net amount</label>
                  <input type="text" readOnly value={fmt(totals.netAmount)} className="h-7 w-full rounded border border-gray-300 bg-gray-50 px-2 text-[11px] font-bold outline-none sm:text-[12px]" style={{ color: primary }} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">GRN Terms</label>
                  <textarea value={grnTerms} onChange={(e) => setGrnTerms(e.target.value)} disabled={isReadOnly} rows={3} className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none sm:text-[11px] disabled:bg-gray-50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={pendingDeleteIndex !== null}
          title="Delete line item?"
          message="This will remove the row from the goods receive note."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onClose={() => setPendingDeleteIndex(null)}
          onConfirm={() => { if (pendingDeleteIndex !== null) handleDeleteRow(pendingDeleteIndex); }}
        />

        {selectedRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedRow(null)} role="dialog" aria-modal="true" aria-label="Row details">
            <div className="mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>Item details</h2>
                <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedRow(null)} aria-label="Close">✕</button>
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

        {grnListOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3" onClick={() => setGrnListOpen(false)} role="dialog" aria-modal="true" aria-label="Browse GRNs">
            <div className="relative flex w-full max-w-3xl max-h-[85vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold" style={{ color: primary }}>Browse Goods Receive Notes</h2>
                <button type="button" onClick={() => setGrnListOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="border-b border-gray-100 px-4 py-2">
                <input type="text" autoFocus placeholder="Search by GRN No or Supplier…" value={grnListSearch} onChange={(e) => setGrnListSearch(e.target.value)} className="w-full rounded border border-gray-200 px-3 py-1.5 text-[12px] outline-none focus:border-gray-400" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {grnListLoading ? (
                  <p className="px-4 py-6 text-center text-[12px] text-gray-400">Loading…</p>
                ) : (
                  <table className="w-full border-collapse text-[11px]">
                    <thead className="sticky top-0" style={{ backgroundColor: '#F2E6EA' }}>
                      <tr>
                        {['GRN No', 'Supplier', 'Date', 'Amount', 'Status'].map((h) => (
                          <th key={h} className="border-b border-gray-200 px-3 py-2 text-left text-[10px] font-bold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grnListData
                        .filter((r) => {
                          const q = grnListSearch.toLowerCase();
                          return !q || String(r.grnNo ?? '').includes(q) || (r.supplierName ?? '').toLowerCase().includes(q);
                        })
                        .map((r) => (
                          <tr key={r.grnMasterId} className="cursor-pointer border-b border-gray-100 hover:bg-rose-50/60" onClick={() => handleLoadGrnById(r.grnMasterId)}>
                            <td className="px-3 py-2 font-medium text-gray-900">{r.grnNo}</td>
                            <td className="px-3 py-2 text-gray-700">{r.supplierName || '—'}</td>
                            <td className="px-3 py-2 text-gray-500">{r.grnDate ? String(r.grnDate).slice(0, 10) : '—'}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{Number(r.grnAmount ?? 0).toFixed(2)}</td>
                            <td className="px-3 py-2">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                String(r.status).toUpperCase() === 'INVOICED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {!grnListLoading && grnListData.filter((r) => {
                        const q = grnListSearch.toLowerCase();
                        return !q || String(r.grnNo ?? '').includes(q) || (r.supplierName ?? '').toLowerCase().includes(q);
                      }).length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-[12px] text-gray-400">No GRNs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {supplierPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3" onClick={() => setSupplierPickerOpen(false)} role="dialog" aria-modal="true" aria-label="Pick Supplier">
            <div className="relative flex w-full max-w-sm max-h-[70vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold" style={{ color: primary }}>Select Supplier</h2>
                <button type="button" onClick={() => setSupplierPickerOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="border-b border-gray-100 px-4 py-2">
                <input type="text" autoFocus placeholder="Search supplier…" value={supplierSearch} onChange={(e) => setSupplierSearch(e.target.value)} className="w-full rounded border border-gray-200 px-3 py-1.5 text-[12px] outline-none focus:border-gray-400" />
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
                          setGrnInfo((prev) => ({ ...prev, supplierName: s.SupplierName }));
                          setSupplierPickerOpen(false);
                          setSupplierSearch('');
                        }}
                      >
                        <span className="font-medium text-gray-900">{s.SupplierName}</span>
                        <span className="ml-2 text-[10px] text-gray-400">#{s.SupplierID}</span>
                      </button>
                    </li>
                  ))}
                {suppliers.filter((s) => !supplierSearch || (s.SupplierName ?? '').toLowerCase().includes(supplierSearch.toLowerCase())).length === 0 && (
                  <li className="px-4 py-6 text-center text-[12px] text-gray-400">No suppliers found.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {productSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2" onClick={() => setProductSearchOpen(false)} role="dialog" aria-modal="true" aria-labelledby="grn-product-search-title">
            <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setProductSearchOpen(false)} className="absolute right-2 top-2 z-10 rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 id="grn-product-search-title" className="border-b border-gray-100 px-4 py-3 pr-10 text-sm font-bold" style={{ color: primary }}>Find Product</h2>
              <div className="border-b border-gray-100 px-4 py-2">
                <div className="mb-2 flex gap-1">
                  {(['description', 'barcode']).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setProductSearchMode(mode); setProductSearchQuery(''); setProductSearchResults([]); }}
                      className={`rounded border px-2 py-1 text-[10px] font-medium sm:text-[11px] ${
                        productSearchMode === mode ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                      style={productSearchMode === mode ? { backgroundColor: primary, borderColor: primary } : undefined}
                    >
                      {mode === 'description' ? 'By description' : 'By barcode'}
                    </button>
                  ))}
                </div>
                <input ref={productSearchInputRef} type="text" value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} placeholder={productSearchMode === 'barcode' ? 'Scan or type barcode…' : 'Type product name…'} className="w-full rounded border border-gray-200 px-3 py-2 text-[12px] outline-none focus:border-gray-400" autoComplete="off" />
                <p className="mt-1 text-[10px] text-gray-500">
                  {productSearchLoading ? 'Searching…' : productSearchQuery.trim() ? `${productSearchResults.length} match(es)` : 'Type to search'}
                </p>
              </div>
              <ul className="min-h-0 flex-1 overflow-y-auto text-left text-[11px]">
                {!productSearchLoading && productSearchQuery.trim() && productSearchResults.length === 0 && (
                  <li className="px-4 py-6 text-center text-[11px] text-gray-500">No products found.</li>
                )}
                {productSearchResults.map((it, idx) => (
                  <li key={`${it.productId}-${idx}`} className="border-b border-gray-100">
                    <button type="button" className="w-full px-4 py-2.5 text-left hover:bg-rose-50/60" onClick={() => applyProductToForm(it)}>
                      <span className="font-medium text-gray-900">{it.shortDescription || it.description || '—'}</span>
                      <span className="mt-0.5 block text-[10px] text-gray-500">#{it.productId} · {it.barCode || '—'} · Cost {it.averageCost ?? it.unitPrice ?? '—'}</span>
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
