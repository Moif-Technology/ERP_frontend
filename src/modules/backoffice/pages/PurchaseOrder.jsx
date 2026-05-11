import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as purchaseEntryApi from '../../../services/purchaseEntry.api.js';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  Switch,
  CommonTable,
  ConfirmDialog,
} from '../../../shared/components/ui';

const UOM_OPTIONS = ['PCS', 'BOX', 'CTN', 'KG', 'LTR'];
const VAT_OPTIONS = ['0', '5', '10', '15'];
const DISCOUNT_HEADER_OPTIONS = ['None', 'ITEM', 'Flat', 'Percentage'];

const ITEM_INITIAL = {
  productId: '',
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
  subTotal: '0.00',
  vatPercent: '0',
  vatAmount: '0.00',
  lineTotal: '0.00',
};

const LPO_INFO_INITIAL = {
  lpoNo: '',
  orderFrom: '',
  lpoSupplierName: '',
  supplierQuotationNo: '',
  lpoDate: '',
  discount: 'None',
  bySupplier: false,
  listItem: false,
  useDiscPct: false,
};

const SUMMARY_INITIAL = {
  total: '',
  discountAmount: '',
  netAmount: '',
  lpoTerms: '',
};

function num(v) {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function money2(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function computeItemLine(partial) {
  const qty = num(partial.qty);
  const unit = num(partial.unitCost) > 0 ? num(partial.unitCost) : num(partial.baseCost);
  const discPct = num(partial.discPercent);
  const gross = qty * unit;
  const sub = Math.max(0, Math.round(gross * (1 - discPct / 100) * 100) / 100);
  const vatPct = num(partial.vatPercent);
  const vatAmt = Math.round(sub * (vatPct / 100) * 100) / 100;
  const total = Math.round((sub + vatAmt) * 100) / 100;
  return {
    subTotal: money2(sub),
    vatAmount: money2(vatAmt),
    lineTotal: money2(total),
  };
}

function normalizeItemForm(f) {
  const c = computeItemLine(f);
  return { ...f, subTotal: c.subTotal, vatAmount: c.vatAmount, lineTotal: c.lineTotal };
}

function lineToRowObject(f) {
  const n = normalizeItemForm(f);
  return {
    productId: n.productId,
    ownRefNo: n.ownRefNo,
    barCode: n.barCode,
    shortDescription: n.shortDescription,
    qty: n.qty,
    uom: n.uom,
    packQty: n.packQty,
    foc: n.foc,
    baseCost: n.baseCost,
    discPercent: n.discPercent,
    unitCost: n.unitCost,
    subTotal: n.subTotal,
    vatPercent: n.vatPercent,
    vatAmount: n.vatAmount,
    lineTotal: n.lineTotal,
  };
}

function sliceIsoDate(d) {
  if (!d) return '';
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/** Local date for `<input type="date">` (YYYY-MM-DD) */
function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Qty as text: digits and at most one decimal separator */
function sanitizeQtyInput(raw) {
  let s = String(raw ?? '').replace(/[^\d.]/g, '');
  const di = s.indexOf('.');
  if (di !== -1) {
    s = `${s.slice(0, di + 1)}${s.slice(di + 1).replace(/\./g, '')}`;
  }
  return s;
}

function freshOrderTabFields() {
  return { ...LPO_INFO_INITIAL, lpoDate: isoToday() };
}

/** API GET /api/lpos/:id line → grid row */
function mapApiLineToRow(line) {
  return {
    productId: line.productId != null ? String(line.productId) : '',
    ownRefNo: line.ownRefNo != null ? String(line.ownRefNo) : '',
    barCode: line.barcode != null ? String(line.barcode) : '',
    shortDescription: line.description != null ? String(line.description) : '',
    qty: line.qty != null ? String(line.qty) : '',
    uom: line.uom || 'PCS',
    packQty: line.packQty != null ? String(line.packQty) : '',
    foc: line.focQty != null ? String(line.focQty) : '',
    baseCost: line.baseCost != null ? String(line.baseCost) : '',
    discPercent: line.discPercent != null ? String(line.discPercent) : '',
    unitCost: line.unitPrice != null ? String(line.unitPrice) : '',
    subTotal: line.subtotalAmount != null ? String(line.subtotalAmount) : '0.00',
    vatPercent: line.vatPercent != null ? String(line.vatPercent) : '0',
    vatAmount: line.vatAmount != null ? String(line.vatAmount) : '0.00',
    lineTotal: line.lineTotal != null ? String(line.lineTotal) : '0.00',
  };
}

const LPO_LINE_HEADERS = [
  '',
  'Sl',
  'Own ref',
  'Barcode',
  'Description',
  'Qty',
  'UOM',
  'Pack',
  'FOC',
  'Base cost',
  'Disc %',
  'Unit cost',
  'Sub total',
  'VAT %',
  'VAT amt',
  'Line total',
  ' ',
];

/** Matches CommonTable `fitParentWidth` default: first col narrow, last col wider, middle shared — keeps footer totals under the amount columns */
const LPO_COLUMN_WIDTH_PERCENTS = (() => {
  const n = LPO_LINE_HEADERS.length;
  const firstPct = 3;
  const lastPct = 8;
  const midPct = (100 - firstPct - lastPct) / (n - 2);
  return Array.from({ length: n }, (_, idx) =>
    idx === 0 ? firstPct : idx === n - 1 ? lastPct : midPct,
  );
})();

function dimCell(content, dim) {
  return <span className={dim ? 'opacity-45' : ''}>{content}</span>;
}

export default function PurchaseOrder() {
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const [rightTab, setRightTab] = useState('summary');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [refsError, setRefsError] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [productsLoadError, setProductsLoadError] = useState('');
  const [itemForm, setItemForm] = useState(ITEM_INITIAL);
  const [lineRows, setLineRows] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [selectedLine, setSelectedLine] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [lineEntryError, setLineEntryError] = useState('');
  const [lpoInfo, setLpoInfo] = useState(() => freshOrderTabFields());
  const [summaryInfo, setSummaryInfo] = useState(SUMMARY_INITIAL);
  const [savedLpoMasterId, setSavedLpoMasterId] = useState('');
  const [lposList, setLposList] = useState([]);
  const [lposListLoading, setLposListLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const productPickerSearchRef = useRef(null);
  const productDropdownRef = useRef(null);
  const qtyInputRef = useRef(null);
  const unitCostInputRef = useRef(null);
  const lineTotalInputRef = useRef(null);

  const focusProductDropdown = useCallback(() => {
    window.setTimeout(() => productDropdownRef.current?.focus(), 0);
  }, []);

  const focusQtyField = useCallback(() => {
    window.setTimeout(() => qtyInputRef.current?.focus(), 0);
  }, []);

  const liveItem = useMemo(() => normalizeItemForm(itemForm), [itemForm]);

  const gridTotals = useMemo(() => {
    const qty = lineRows.reduce((s, r) => s + num(r.qty), 0);
    const foc = lineRows.reduce((s, r) => s + num(r.foc), 0);
    const gross = lineRows.reduce((s, r) => {
      const unit = num(r.unitCost) > 0 ? num(r.unitCost) : num(r.baseCost);
      return s + num(r.qty) * unit;
    }, 0);
    const sub = lineRows.reduce((s, r) => s + num(r.subTotal), 0);
    const tax = lineRows.reduce((s, r) => s + num(r.vatAmount), 0);
    const line = lineRows.reduce((s, r) => s + num(r.lineTotal), 0);
    return {
      qtySum: qty,
      focSum: foc,
      grossSum: gross,
      discountSum: Math.max(0, gross - sub),
      subSum: sub,
      taxSum: tax,
      lineSum: line,
    };
  }, [lineRows]);

  const footerTotals = useMemo(() => {
    const headerDiscount = Math.max(0, num(summaryInfo.discountAmount));
    return {
      headerDiscount,
      netAfterHeader: Math.max(0, gridTotals.lineSum - headerDiscount),
    };
  }, [gridTotals.lineSum, summaryInfo.discountAmount]);

  /** Keep right-hand Summary totals in sync with line grid + header discount */
  useEffect(() => {
    const disc = num(summaryInfo.discountAmount);
    const net = Math.max(0, gridTotals.lineSum - disc);
    setSummaryInfo((prev) => ({
      ...prev,
      total: money2(gridTotals.subSum),
      netAmount: money2(net),
    }));
  }, [gridTotals.subSum, gridTotals.lineSum, summaryInfo.discountAmount]);

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of productsCatalog) {
      m.set(Number(p.productId), p);
    }
    return m;
  }, [productsCatalog]);

  const pickerProducts = useMemo(
    () =>
      productsCatalog.map((p) => ({
        productId: p.productId,
        barCode: p.productCode || '',
        shortDescription: (p.shortName || p.productName || '').trim() || '—',
        unitName: p.unitName || '',
        lastPurchaseCost: p.lastPurchaseCost,
      })),
    [productsCatalog],
  );

  const filteredPickerProducts = useMemo(() => {
    const q = productPickerSearch.trim().toLowerCase();
    if (!q) return pickerProducts;
    return pickerProducts.filter((p) => {
      const bc = String(p.barCode || '').toLowerCase();
      const sd = String(p.shortDescription || '').toLowerCase();
      return bc.includes(q) || sd.includes(q);
    });
  }, [pickerProducts, productPickerSearch]);

  const branchOptions = useMemo(
    () =>
      (branches || []).map((b) => ({
        value: String(b.branchId),
        label:
          `${b.branchCode || ''} — ${b.branchName || ''}`.replace(/^ — |^— /, '').trim() || `Branch ${b.branchId}`,
      })),
    [branches],
  );

  const branchDropdownOptions = useMemo(
    () => [{ value: '', label: refsLoading ? 'Loading branches…' : '— Branch —' }, ...branchOptions],
    [branchOptions, refsLoading],
  );

  const supplierDropdownOptions = useMemo(
    () => [
      { value: '', label: suppliersLoading ? 'Loading suppliers…' : '— Supplier —' },
      ...suppliers.map((s) => ({
        value: String(s.supplierId),
        label: `${s.supplierCode} — ${s.supplierName}`,
      })),
    ],
    [suppliers, suppliersLoading],
  );

  const openLpoDropdownOptions = useMemo(
    () => [
      { value: '', label: lposListLoading ? 'Loading LPOs…' : '— New / none —' },
      ...lposList.map((r) => ({
        value: String(r.lpoMasterId),
        label: `${r.lpoNo || r.lpoMasterId}${r.lpoAmount != null && r.lpoAmount !== '' ? ` · ${r.lpoAmount}` : ''}`,
      })),
    ],
    [lposList, lposListLoading],
  );

  const productSelectOptions = useMemo(() => {
    const base = [{ value: '', label: !branchId ? '— Branch —' : '— Product —' }];
    for (const p of productsCatalog) {
      base.push({
        value: String(p.productId),
        label: `${p.productCode || p.productId} — ${(p.shortName || p.productName || '').slice(0, 28)}`,
      });
    }
    return base;
  }, [productsCatalog, branchId]);

  const productSelectOptionsWithLine = useMemo(() => {
    const pid = liveItem.productId ? String(liveItem.productId) : '';
    if (!pid || productSelectOptions.some((o) => o.value === pid)) return productSelectOptions;
    return [
      ...productSelectOptions,
      {
        value: pid,
        label: `${liveItem.barCode || pid} — ${(liveItem.shortDescription || '').slice(0, 24)}`,
      },
    ];
  }, [productSelectOptions, liveItem.productId, liveItem.barCode, liveItem.shortDescription]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRefsLoading(true);
      setRefsError('');
      try {
        const sess = getSessionUser();
        const defaultBr = sess?.stationId != null ? String(sess.stationId) : '';
        const { data: brData } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        setBranches(brData?.branches || []);
        setBranchId((prev) => prev || defaultBr || (brData?.branches?.[0] ? String(brData.branches[0].branchId) : ''));
      } catch (err) {
        if (!cancelled) {
          setBranches([]);
          setRefsError(err.response?.data?.message || err.message || 'Could not load branches');
        }
      } finally {
        if (!cancelled) setRefsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSuppliersLoading(true);
      try {
        const { data } = await supplierEntryApi.listSuppliers({ limit: 1000 });
        if (cancelled) return;
        setSuppliers(data?.suppliers || []);
      } catch {
        if (!cancelled) setSuppliers([]);
      } finally {
        if (!cancelled) setSuppliersLoading(false);
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
      setProductsLoadError('');
      try {
        const { data } = await productEntryApi.fetchProducts(Number(branchId));
        if (cancelled) return;
        const raw = data?.products || [];
        setProductsCatalog(
          raw.map((p) => {
            const inv = p.inventory || {};
            return {
              productId: p.productId,
              productCode: p.productCode || '',
              shortName: p.shortName || '',
              productName: p.productName || '',
              unitName: p.unitName || '',
              lastPurchaseCost: inv.lastPurchaseCost ?? p.lastPurchaseCost,
            };
          }),
        );
      } catch (err) {
        if (!cancelled) {
          setProductsCatalog([]);
          setProductsLoadError(err.response?.data?.message || err.message || 'Could not load products');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  useEffect(() => {
    if (!productPickerOpen) return;
    const t = window.setTimeout(() => productPickerSearchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [productPickerOpen]);

  useEffect(() => {
    setSavedLpoMasterId('');
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setLposList([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLposListLoading(true);
      try {
        const { data } = await purchaseEntryApi.listLposForPurchase({ branchId: Number(branchId), limit: 200 });
        if (cancelled) return;
        setLposList(data?.lpos || []);
      } catch {
        if (!cancelled) setLposList([]);
      } finally {
        if (!cancelled) setLposListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  useEffect(() => {
    if (!supplierId) return;
    const s = suppliers.find((x) => String(x.supplierId) === String(supplierId));
    if (s?.supplierName) {
      setLpoInfo((p) => ({ ...p, lpoSupplierName: s.supplierName }));
    }
  }, [supplierId, suppliers]);

  const applyLoadedLpo = useCallback((data) => {
    const m = data?.lpo;
    const lines = Array.isArray(data?.lines) ? data.lines : [];
    if (!m) return;
    setSavedLpoMasterId(String(m.lpoMasterId));
    setLpoInfo({
      ...LPO_INFO_INITIAL,
      lpoNo: m.lpoNo || '',
      orderFrom: m.orderFormNo || '',
      lpoSupplierName: m.supplierDisplayName || '',
      supplierQuotationNo: m.supplierQuotationNo || '',
      lpoDate: sliceIsoDate(m.lpoDate),
      discount: m.discountMode || 'None',
      bySupplier: Boolean(m.bySupplier),
      listItem: Boolean(m.listItems),
      useDiscPct: Boolean(m.useDiscPct),
    });
    setSummaryInfo({
      ...SUMMARY_INITIAL,
      total: m.subTotal != null ? String(m.subTotal) : '',
      discountAmount: m.discountAmount != null ? String(m.discountAmount) : '',
      netAmount: m.lpoAmount != null ? String(m.lpoAmount) : '',
      lpoTerms: m.lpoTerms || '',
    });
    if (m.supplierId != null && Number(m.supplierId) >= 1) {
      setSupplierId(String(m.supplierId));
    }
    setLineRows(lines.map(mapApiLineToRow));
    setItemForm({ ...ITEM_INITIAL });
    setEditingRowIndex(null);
    setSelectedRows(new Set());
    setLineEntryError('');
    setSaveError('');
    setSaveSuccess('');
  }, []);

  const handleOpenLpoIdChange = useCallback(
    async (raw) => {
      const id = String(raw || '').trim();
      setSaveError('');
      setSaveSuccess('');
      if (!id) {
        setSavedLpoMasterId('');
        setLineRows([]);
        setLpoInfo(freshOrderTabFields());
        setSummaryInfo(SUMMARY_INITIAL);
        setItemForm(ITEM_INITIAL);
        setEditingRowIndex(null);
        setSelectedRows(new Set());
        return;
      }
      if (!branchId) {
        setSaveError('Select a branch first.');
        return;
      }
      try {
        const { data } = await purchaseEntryApi.getLpoForPurchase(id);
        applyLoadedLpo(data);
      } catch (e) {
        setSaveError(e.response?.data?.message || e.message || 'Could not load LPO');
      }
    },
    [branchId, applyLoadedLpo],
  );

  const handleSaveLpo = useCallback(async () => {
    setSaveError('');
    setSaveSuccess('');
    if (!branchId) {
      setSaveError('Select a branch.');
      return;
    }
    if (!supplierId) {
      setSaveError('Select a supplier.');
      return;
    }
    if (!lineRows.length) {
      setSaveError('Add at least one line.');
      return;
    }
    const bad = lineRows.findIndex((r) => !r.productId || Number(r.productId) < 1);
    if (bad !== -1) {
      setSaveError(`Line ${bad + 1}: choose a product for each line (required to save).`);
      return;
    }
    const headerDisc = num(summaryInfo.discountAmount);
    const netFromField = num(summaryInfo.netAmount);
    const netAmount = netFromField > 0 ? netFromField : gridTotals.lineSum;
    const payload = {
      branchId: Number(branchId),
      supplierId: Number(supplierId),
      lpoNo: lpoInfo.lpoNo || undefined,
      lpoDate: lpoInfo.lpoDate || null,
      orderFormNo: lpoInfo.orderFrom,
      lpoSupplierName: lpoInfo.lpoSupplierName,
      supplierQuotationNo: lpoInfo.supplierQuotationNo,
      discount: lpoInfo.discount,
      bySupplier: lpoInfo.bySupplier,
      listItem: lpoInfo.listItem,
      useDiscPct: lpoInfo.useDiscPct,
      lpoTerms: summaryInfo.lpoTerms,
      discountAmount: headerDisc,
      netAmount,
      lines: lineRows.map((r) => ({
        productId: Number(r.productId),
        ownRefNo: r.ownRefNo,
        barCode: r.barCode,
        shortDescription: r.shortDescription,
        qty: num(r.qty),
        uom: r.uom,
        packQty: r.packQty,
        foc: r.foc,
        baseCost: r.baseCost,
        discPercent: r.discPercent,
        unitCost: r.unitCost,
        subTotal: r.subTotal,
        vatPercent: r.vatPercent,
        vatAmount: r.vatAmount,
        lineTotal: r.lineTotal,
      })),
    };
    setSaveLoading(true);
    try {
      if (savedLpoMasterId) {
        const { data } = await purchaseEntryApi.updateLpo(savedLpoMasterId, payload);
        applyLoadedLpo(data);
        setSaveSuccess('LPO updated.');
      } else {
        const { data } = await purchaseEntryApi.createLpo(payload);
        applyLoadedLpo(data);
        setSaveSuccess('LPO saved.');
      }
    } catch (e) {
      setSaveError(e.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSaveLoading(false);
    }
  }, [branchId, supplierId, lineRows, lpoInfo, summaryInfo, gridTotals.lineSum, savedLpoMasterId, applyLoadedLpo]);

  const mergeItemForm = useCallback((patch) => {
    setItemForm((prev) => normalizeItemForm({ ...prev, ...patch }));
    setLineEntryError('');
  }, []);

  const handleQtyChange = useCallback(
    (e) => {
      mergeItemForm({ qty: sanitizeQtyInput(e.target.value) });
    },
    [mergeItemForm],
  );

  const applyProductSelection = useCallback(
    (rawId) => {
      const id = String(rawId || '').trim();
      if (!id) {
        setItemForm(ITEM_INITIAL);
        setLineEntryError('');
        return;
      }
      const p = productById.get(Number(id));
      setItemForm((prev) => {
        if (!p) {
          return normalizeItemForm({ ...prev, productId: id });
        }
        const last =
          p.lastPurchaseCost != null && Number.isFinite(Number(p.lastPurchaseCost)) && Number(p.lastPurchaseCost) > 0
            ? String(p.lastPurchaseCost)
            : '';
        const next = {
          ...prev,
          productId: id,
          barCode: p.productCode || prev.barCode,
          shortDescription: (p.shortName || p.productName || '').trim(),
          uom: (p.unitName && String(p.unitName).trim()) || prev.uom || 'PCS',
          qty: num(prev.qty) > 0 ? prev.qty : '1',
          baseCost: last || prev.baseCost,
          unitCost: last || prev.unitCost,
        };
        return normalizeItemForm(next);
      });
      setLineEntryError('');
      focusQtyField();
    },
    [productById, focusQtyField],
  );

  const openProductPicker = useCallback(
    (prefill) => {
      if (!branchId) {
        setProductsLoadError('Select a branch first');
        setProductPickerSearch(prefill != null ? String(prefill) : '');
        setProductPickerOpen(true);
        return;
      }
      setProductsLoadError('');
      setProductPickerSearch(prefill != null ? String(prefill) : '');
      setProductPickerOpen(true);
    },
    [branchId],
  );

  const applyPickedProductFromPicker = useCallback(
    (p) => {
      setProductPickerOpen(false);
      setProductPickerSearch('');
      applyProductSelection(String(p.productId));
    },
    [applyProductSelection],
  );

  const handleAddOrUpdateLine = useCallback(() => {
    const row = lineToRowObject(itemForm);
    if (!String(row.shortDescription || '').trim() && !String(row.barCode || '').trim()) {
      setLineEntryError('Enter a barcode or short description.');
      return;
    }
    if (num(row.qty) <= 0) {
      setLineEntryError('Enter quantity greater than 0.');
      return;
    }
    if (num(row.unitCost) <= 0 && num(row.baseCost) <= 0) {
      setLineEntryError('Enter base cost or unit cost for the line.');
      return;
    }
    setLineEntryError('');
    if (editingRowIndex !== null) {
      setLineRows((prev) => prev.map((r, i) => (i === editingRowIndex ? row : r)));
      setEditingRowIndex(null);
    } else {
      setLineRows((prev) => [...prev, row]);
    }
    setItemForm(ITEM_INITIAL);
    setSelectedRows(new Set());
    focusProductDropdown();
  }, [itemForm, editingRowIndex, focusProductDropdown]);

  const startEditRow = useCallback(
    (idx) => {
      const r = lineRows[idx];
      setEditingRowIndex(idx);
      setSelectedRows(new Set());
      setItemForm({
        productId: r.productId != null ? String(r.productId) : '',
        ownRefNo: r.ownRefNo ?? '',
        barCode: r.barCode ?? '',
        shortDescription: r.shortDescription ?? '',
        qty: r.qty ?? '',
        uom: r.uom || 'PCS',
        packQty: r.packQty ?? '',
        foc: r.foc ?? '',
        baseCost: r.baseCost ?? '',
        discPercent: r.discPercent ?? '',
        unitCost: r.unitCost ?? '',
        subTotal: r.subTotal ?? '0.00',
        vatPercent: r.vatPercent ?? '0',
        vatAmount: r.vatAmount ?? '0.00',
        lineTotal: r.lineTotal ?? '0.00',
      });
      setLineEntryError('');
      focusQtyField();
    },
    [lineRows, focusQtyField],
  );

  const cancelLineForm = useCallback(() => {
    setEditingRowIndex(null);
    setItemForm(ITEM_INITIAL);
    setLineEntryError('');
    focusProductDropdown();
  }, [focusProductDropdown]);

  const deleteRow = useCallback(
    (index) => {
      setLineRows((prev) => prev.filter((_, i) => i !== index));
      setSelectedRows((prev) => {
        const next = new Set();
        for (const i of prev) {
          if (i === index) continue;
          next.add(i > index ? i - 1 : i);
        }
        return next;
      });
      if (editingRowIndex === index) {
        setEditingRowIndex(null);
        setItemForm(ITEM_INITIAL);
      } else if (editingRowIndex !== null && editingRowIndex > index) {
        setEditingRowIndex((i) => i - 1);
      }
    },
    [editingRowIndex],
  );

  const toggleRowSelection = useCallback((idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const toDelete = new Set(selectedRows);
    setLineRows((prev) => prev.filter((_, i) => !toDelete.has(i)));
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) {
      setEditingRowIndex(null);
      setItemForm(ITEM_INITIAL);
    }
  }, [selectedRows, editingRowIndex]);

  const resetLpo = useCallback(() => {
    setItemForm({ ...ITEM_INITIAL });
    setLineRows([]);
    setEditingRowIndex(null);
    setSelectedRows(new Set());
    setLpoInfo(freshOrderTabFields());
    setSummaryInfo(SUMMARY_INITIAL);
    setLineEntryError('');
    setSelectedLine(null);
    setProductPickerOpen(false);
    setProductPickerSearch('');
    setSavedLpoMasterId('');
    setSaveError('');
    setSaveSuccess('');
    focusProductDropdown();
  }, [focusProductDropdown]);

  const tableBodyRows = lineRows.map((line, index) => {
    const dim = editingRowIndex === index;
    const inputClass = 'lpo-grid-input';
    const selectClass = 'lpo-grid-input lpo-grid-select';
    if (dim) {
      return [
        <div key={`chk-${index}`} className="flex justify-center">
          <input
            type="checkbox"
            checked={false}
            disabled
            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
            style={{ accentColor: primary }}
          />
        </div>,
        String(index + 1),
        <input key={`own-${index}`} className={inputClass} value={liveItem.ownRefNo} onChange={(e) => mergeItemForm({ ownRefNo: e.target.value })} />,
        <input key={`bar-${index}`} className={inputClass} value={liveItem.barCode} onChange={(e) => mergeItemForm({ barCode: e.target.value })} />,
        <input key={`desc-${index}`} className={inputClass} value={liveItem.shortDescription} onChange={(e) => mergeItemForm({ shortDescription: e.target.value })} />,
        <input key={`qty-${index}`} className={inputClass} inputMode="decimal" value={liveItem.qty} onChange={handleQtyChange} />,
        <select key={`uom-${index}`} className={selectClass} value={liveItem.uom} onChange={(e) => mergeItemForm({ uom: e.target.value })}>
          {UOM_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>,
        <input key={`pack-${index}`} className={inputClass} type="number" value={liveItem.packQty} onChange={(e) => mergeItemForm({ packQty: e.target.value })} />,
        <input key={`foc-${index}`} className={inputClass} type="number" value={liveItem.foc} onChange={(e) => mergeItemForm({ foc: e.target.value })} />,
        <input key={`base-${index}`} className={inputClass} type="number" value={liveItem.baseCost} onChange={(e) => mergeItemForm({ baseCost: e.target.value })} />,
        <input key={`disc-${index}`} className={inputClass} type="number" value={liveItem.discPercent} onChange={(e) => mergeItemForm({ discPercent: e.target.value })} />,
        <input key={`unit-${index}`} className={inputClass} type="number" value={liveItem.unitCost} onChange={(e) => mergeItemForm({ unitCost: e.target.value })} />,
        <span key={`sub-${index}`} className="lpo-grid-value">{money2(num(liveItem.subTotal))}</span>,
        <select key={`vatpct-${index}`} className={selectClass} value={liveItem.vatPercent} onChange={(e) => mergeItemForm({ vatPercent: e.target.value })}>
          {VAT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>,
        <span key={`vatamt-${index}`} className="lpo-grid-value">{money2(num(liveItem.vatAmount))}</span>,
        <span key={`total-${index}`} className="lpo-grid-value font-bold">{money2(num(liveItem.lineTotal))}</span>,
        <div key={`act-${index}`} className="flex items-center justify-center gap-0.5">
          <button type="button" className="lpo-grid-btn lpo-grid-btn-save" onClick={handleAddOrUpdateLine}>Save</button>
          <button type="button" className="lpo-grid-btn lpo-grid-btn-cancel" onClick={cancelLineForm}>Cancel</button>
        </div>,
      ];
    }
    return [
      <div key={`chk-${index}`} className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedRows.has(index)}
          onChange={() => toggleRowSelection(index)}
          disabled={dim}
          className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
          style={{ accentColor: primary }}
        />
      </div>,
      dimCell(String(index + 1), dim),
      dimCell(line.ownRefNo || '—', dim),
      dimCell(line.barCode || '—', dim),
      dimCell(line.shortDescription || '—', dim),
      dimCell(String(line.qty || '0'), dim),
      dimCell(line.uom || '—', dim),
      dimCell(String(line.packQty || '0'), dim),
      dimCell(String(line.foc || '0'), dim),
      dimCell(money2(num(line.baseCost)), dim),
      dimCell(String(line.discPercent || '0'), dim),
      dimCell(money2(num(line.unitCost)), dim),
      dimCell(money2(num(line.subTotal)), dim),
      dimCell(String(line.vatPercent || '0'), dim),
      dimCell(money2(num(line.vatAmount)), dim),
      dimCell(money2(num(line.lineTotal)), dim),
      <div key={`act-${index}`} className={`flex items-center justify-center gap-0.5 ${dim ? 'pointer-events-none opacity-45' : ''}`}>
        <button type="button" className="lpo-act" onClick={() => setSelectedLine(line)} aria-label="View line">
          <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className="lpo-act" onClick={() => startEditRow(index)} aria-label="Edit line">
          <img src={EditActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className="lpo-act" onClick={() => setPendingDelete({ mode: 'single', idx: index })} aria-label="Delete line">
          <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ];
  });

  return (
    <div className="lpo-page flex h-full flex-1 min-h-0 flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .lpo-page {
          --pr: ${primary}; --pr50: ${primaryHover}; --pr100: ${primaryActive};
          --bd: #e2dfd9; --txt: #1c1917; --muted: #78716c;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .lpo-lbl { font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--pr); font-family:'Outfit',sans-serif; }
        .lpo-act { padding:3px; border-radius:4px; border:none; background:transparent; cursor:pointer; transition:all .15s; opacity:.55; display:inline-flex; align-items:center; justify-content:center; }
        .lpo-act:hover { background:var(--pr50); opacity:1; }
        .lpo-grid-input { box-sizing:border-box; width:100%; min-width:0; height:20px; border-radius:4px; border:1px solid #d6d3d1; background:#fff;
          padding:0 4px; font-size:8.5px; line-height:20px; outline:none; font-family:'Outfit',sans-serif; color:var(--txt); }
        .lpo-grid-input:focus { border-color:var(--pr); box-shadow:0 0 0 1px rgba(121,7,40,.08); }
        .lpo-grid-select { padding-right:1px; }
        .lpo-grid-value { display:block; width:100%; min-width:0; text-align:right; font-size:8.5px; line-height:20px; font-variant-numeric:tabular-nums; color:var(--txt); }
        .lpo-grid-btn { height:20px; border-radius:4px; border:1px solid var(--bd); padding:0 4px; font-size:8px; font-weight:700; cursor:pointer;
          font-family:'Outfit',sans-serif; white-space:nowrap; transition:all .15s; }
        .lpo-grid-btn-save { border-color:transparent; background:var(--pr); color:#fff; }
        .lpo-grid-btn-save:hover { background:#85203E; }
        .lpo-grid-btn-cancel { border-color:#fca5a5; background:#fff; color:#b91c1c; }
        .lpo-grid-btn-cancel:hover { background:#fef2f2; border-color:#b91c1c; }
        .lpo-add { display:inline-flex; align-items:center; justify-content:center; height:26px; padding:0 14px; border-radius:5px; border:none;
          background:linear-gradient(135deg,${primary} 0%,#85203E 100%); color:#fff; font-size:10px; font-weight:600; cursor:pointer;
          transition:all .2s; box-shadow:0 1px 3px rgba(121,7,40,.25); font-family:'Outfit',sans-serif; letter-spacing:.3px; }
        .lpo-add:hover { background:linear-gradient(135deg,#85203E 0%,#923A53 100%); box-shadow:0 2px 6px rgba(121,7,40,.3); }
        .lpo-del { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:5px; border:1.5px solid var(--pr);
          background:transparent; color:var(--pr); font-size:10px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif; }
        .lpo-del:hover { background:var(--pr50); }
        .lpo-hr { height:1px; background:var(--bd); border:none; margin:0; flex-shrink:0; }
        .lpo-tab { padding:6px 12px; font-size:10px; font-weight:500; cursor:pointer; border:none; background:transparent;
          color:var(--muted); border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; font-family:'Outfit',sans-serif; white-space:nowrap; }
        .lpo-tab:hover { color:var(--txt); }
        .lpo-tab-on { color:var(--pr); border-bottom-color:var(--pr); font-weight:700; }
        .lpo-bar { display:flex; align-items:center; justify-content:space-between; gap:6px; padding:6px 14px; border-top:2px solid var(--bd);
          background:linear-gradient(180deg,#f8f7f6 0%,#f0efed 100%); flex-shrink:0; flex-wrap:wrap; min-height:38px; }
        .lpo-bb { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:5px; border:1px solid var(--bd); background:#fff;
          font-size:10.5px; font-weight:500; color:var(--txt); cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif; white-space:nowrap; }
        .lpo-bb:hover { border-color:var(--pr); background:var(--pr50); color:var(--pr); }
        .lpo-bb:active { background:var(--pr100); }
        .lpo-bb-save { border:none; background:linear-gradient(135deg,${primary} 0%,#85203E 100%); color:#fff; font-weight:600;
          box-shadow:0 1px 3px rgba(121,7,40,.25); padding:5px 14px; }
        .lpo-bb-save:hover { background:linear-gradient(135deg,#85203E 0%,#923A53 100%); color:#fff; border-color:transparent; }
        .lpo-bb-cancel { color:#b91c1c; border-color:#fca5a5; }
        .lpo-bb-cancel:hover { background:#fef2f2; border-color:#b91c1c; color:#b91c1c; }
        .lpo-fl { font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.7px; color:var(--muted); }
        @media(min-width:640px){.lpo-fl{font-size:10px}}
        .lpo-fi { height:26px; width:100%; border-radius:5px; border:1px solid var(--bd); background:#f5f5f5; padding:0 8px;
          font-size:9px; outline:none; transition:border-color .15s; font-family:'Outfit',sans-serif; }
        @media(min-width:640px){.lpo-fi{font-size:10px}}
        .lpo-fi:focus { border-color:var(--pr); }
        .lpo-ta { min-height:38px; width:100%; resize:vertical; border-radius:5px; border:1px solid var(--bd); background:#f5f5f5;
          padding:5px 8px; font-size:9px; outline:none; transition:border-color .15s; font-family:'Outfit',sans-serif; }
        @media(min-width:640px){.lpo-ta{font-size:10px}}
        .lpo-ta:focus { border-color:var(--pr); }
        .lpo-net { background:linear-gradient(135deg,rgba(121,7,40,.07) 0%,rgba(121,7,40,.03) 100%); border-radius:6px; padding:3px; }
        .lpo-rp::-webkit-scrollbar { width:3px; }
        .lpo-rp::-webkit-scrollbar-track { background:transparent; }
        .lpo-rp::-webkit-scrollbar-thumb { background:#d6d3d1; border-radius:3px; }
        .lpo-tbl, .lpo-tbl > div { overflow:visible !important; }
        .lpo-tbl thead th { position:sticky; top:0; z-index:2; }
        .lpo-total-bar { padding:6px 8px; background:linear-gradient(180deg,#fafaf9 0%,#f5f5f4 100%); }
        .lpo-total-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; }
        @media(min-width:768px){.lpo-total-grid{grid-template-columns:repeat(8,minmax(0,1fr));}}
        .lpo-total-chip { min-width:0; border:1px solid #e7e5e4; border-radius:6px; background:#fff; padding:4px 6px; box-shadow:0 1px 2px rgba(28,25,23,.04); }
        .lpo-total-name { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:7.5px; line-height:1.15; font-weight:800;
          letter-spacing:.4px; text-transform:uppercase; color:var(--muted); }
        .lpo-total-value { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px; text-align:right; font-size:10px;
          line-height:1.1; font-weight:800; font-variant-numeric:tabular-nums; color:var(--txt); }
        .lpo-total-chip-strong { border-color:rgba(121,7,40,.25); background:linear-gradient(135deg,rgba(121,7,40,.06) 0%,#fff 72%); }
        .lpo-total-chip-strong .lpo-total-name, .lpo-total-chip-strong .lpo-total-value { color:var(--pr); }
        @keyframes lpo-modal-in { from{opacity:0;transform:scale(.96) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .lpo-modal { animation:lpo-modal-in .2s ease-out; }
        .lpo-field-lbl { padding:0; margin:0; border:none; background:transparent; cursor:pointer; font-family:'Outfit',sans-serif;
          font-size:9px; font-weight:600; letter-spacing:.3px; color:var(--muted); line-height:1.2; display:inline-flex; align-items:center; gap:3px; }
        @media(min-width:640px){.lpo-field-lbl{font-size:10px}}
        .lpo-field-lbl:hover { color:var(--pr); }
      `}</style>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-white sm:mx-[-10px]"
        style={{ border: '1px solid #e2dfd9' }}>

        <div className="shrink-0" style={{ height: 3, background: 'linear-gradient(90deg,#790728 0%,#85203E 35%,#923A53 65%,#C44972 100%)', borderRadius: '8px 8px 0 0' }} />

        <div className="flex shrink-0 flex-col gap-1 px-3 py-1.5 sm:px-4 sm:py-2">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <div className="flex shrink-0 items-start gap-2 pt-0.5">
              <div className="mt-0.5 shrink-0" style={{ width: 3, height: 18, borderRadius: 2, background: `linear-gradient(180deg,${primary} 0%,#C44972 100%)` }} />
              <h1 className="text-[13px] font-bold leading-tight tracking-tight sm:text-sm" style={{ color: primary }}>LOCAL PURCHASE ORDER</h1>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-start justify-end gap-x-2 gap-y-1.5">
              <DropdownInput
                label="Branch"
                options={branchDropdownOptions}
                value={branchId}
                onChange={(v) => setBranchId(v)}
                widthPx={150}
                disabled={refsLoading}
              />
              <DropdownInput
                label="Supplier"
                options={supplierDropdownOptions}
                value={supplierId}
                onChange={setSupplierId}
                widthPx={200}
                disabled={suppliersLoading}
              />
              <DropdownInput
                label="Open LPO"
                options={openLpoDropdownOptions}
                value={savedLpoMasterId}
                onChange={(v) => {
                  void handleOpenLpoIdChange(v);
                }}
                widthPx={190}
                disabled={!branchId || lposListLoading}
              />
              <div className="flex shrink-0 items-end gap-1.5">
                <button type="button" className="lpo-bb">
                  <img src={PrinterIcon} alt="" className="h-3 w-3" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button type="button" className="lpo-bb lpo-bb-cancel">
                  <img src={CancelIcon} alt="" className="h-3 w-3" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button type="button" className="lpo-bb">
                  <img src={EditIcon} alt="" className="h-3 w-3" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                {selectedRows.size > 0 && (
                  <button type="button" className="lpo-del" onClick={() => setPendingDelete({ mode: 'bulk' })}>
                    <img src={DeleteActionIcon} alt="" className="h-3 w-3" /> Delete ({selectedRows.size})
                  </button>
                )}
              </div>
            </div>
          </div>
          {refsError ? <p className="text-[10px] text-red-600 sm:text-[11px]">{refsError}</p> : null}
          {saveError ? <p className="text-[10px] text-red-600 sm:text-[11px]">{saveError}</p> : null}
          {saveSuccess ? <p className="text-[10px] text-emerald-800 sm:text-[11px]">{saveSuccess}</p> : null}
          {lineEntryError ? <p className="text-[10px] text-red-600 sm:text-[11px]">{lineEntryError}</p> : null}
          {productsLoadError && branchId ? <p className="text-[10px] text-amber-800 sm:text-[11px]">{productsLoadError}</p> : null}
          {!suppliersLoading && suppliers.length === 0 ? (
            <p className="text-[10px] text-amber-800 sm:text-[11px]">
              No suppliers — <Link to="/data-entry/supplier-entry" className="font-semibold underline underline-offset-2">add supplier</Link>
            </p>
          ) : null}
        </div>

        <hr className="lpo-hr" />

        <div className="flex shrink-0 items-end gap-x-1.5 gap-y-1 px-3 py-1.5 sm:px-4 sm:py-2 xl:flex-nowrap">
          <SubInputField label="Own Ref.#" widthPx={66} value={liveItem.ownRefNo} onChange={(e) => mergeItemForm({ ownRefNo: e.target.value })} />
          <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 88 }}>
            <button type="button" className="lpo-field-lbl" title="Search products" onClick={() => openProductPicker(liveItem.barCode || liveItem.shortDescription)}>
              Barcode <img src={SearchIcon} alt="" className="h-2.5 w-2.5 opacity-60" />
            </button>
            <SubInputField label="" widthPx={88} value={liveItem.barCode} onChange={(e) => mergeItemForm({ barCode: e.target.value, productId: '' })} />
          </div>
          <div className="flex shrink-0 flex-col gap-0.5" style={{ width: 130 }}>
            <button type="button" className="lpo-field-lbl" title="Search products" onClick={() => openProductPicker(liveItem.barCode || liveItem.shortDescription)}>
              Short Description <img src={SearchIcon} alt="" className="h-2.5 w-2.5 opacity-60" />
            </button>
            <InputField label="" widthPx={130} value={liveItem.shortDescription} onChange={(e) => mergeItemForm({ shortDescription: e.target.value })} />
          </div>
          <DropdownInput
            ref={productDropdownRef}
            label="Product"
            widthPx={140}
            placeholder="—"
            value={liveItem.productId}
            options={productSelectOptionsWithLine}
            onChange={(v) => applyProductSelection(v)}
          />
          <SubInputField
            ref={qtyInputRef}
            label="Qty"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            widthPx={50}
            value={liveItem.qty}
            onChange={handleQtyChange}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              unitCostInputRef.current?.focus();
            }}
          />
          <DropdownInput label="UOM" widthPx={60} value={liveItem.uom} onChange={(v) => mergeItemForm({ uom: v })} options={UOM_OPTIONS} />
          <SubInputField label="Pack Qty" type="number" widthPx={60} value={liveItem.packQty} onChange={(e) => mergeItemForm({ packQty: e.target.value })} />
          <SubInputField label="FOC" type="number" widthPx={50} value={liveItem.foc} onChange={(e) => mergeItemForm({ foc: e.target.value })} />
          <SubInputField label="Base Cost" type="number" widthPx={70} value={liveItem.baseCost} onChange={(e) => mergeItemForm({ baseCost: e.target.value })} />
          <SubInputField label="Disc %" type="number" widthPx={50} value={liveItem.discPercent} onChange={(e) => mergeItemForm({ discPercent: e.target.value })} />
          <SubInputField
            ref={unitCostInputRef}
            label="Unit Cost"
            type="number"
            widthPx={70}
            value={liveItem.unitCost}
            onChange={(e) => mergeItemForm({ unitCost: e.target.value })}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              lineTotalInputRef.current?.focus();
            }}
          />
          <SubInputField label="Sub.Total" type="number" widthPx={70} value={liveItem.subTotal} readOnly tabIndex={-1} />
          <DropdownInput label="VAT %" widthPx={60} value={liveItem.vatPercent} onChange={(v) => mergeItemForm({ vatPercent: v })} options={VAT_OPTIONS} />
          <SubInputField label="VAT Amt" type="number" widthPx={70} value={liveItem.vatAmount} readOnly tabIndex={-1} />
          <SubInputField
            ref={lineTotalInputRef}
            label="Line Total"
            type="text"
            inputMode="decimal"
            widthPx={80}
            value={liveItem.lineTotal}
            readOnly
            tabIndex={0}
            className="tabular-nums"
            title="Press Enter to add line to the table"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              handleAddOrUpdateLine();
            }}
          />
          <div className="flex shrink-0 items-end gap-1.5">
            <button type="button" className="lpo-add" onClick={handleAddOrUpdateLine}>
              {editingRowIndex !== null ? 'Update' : 'Add'}
            </button>
            {editingRowIndex !== null && (
              <button type="button" className="lpo-bb lpo-bb-cancel" onClick={cancelLineForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <hr className="lpo-hr" />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-x-2 inset-y-1 flex flex-col overflow-hidden rounded-md sm:inset-x-3 sm:inset-y-1.5" style={{ border: '1px solid #e2dfd9' }}>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                <CommonTable
                  className="lpo-tbl"
                  fitParentWidth
                  stickyHeader
                  hideOuterBorder
                  columnWidthPercents={LPO_COLUMN_WIDTH_PERCENTS}
                  headers={LPO_LINE_HEADERS}
                  rows={tableBodyRows}
                />
              </div>
              <div className="lpo-total-bar shrink-0 border-t" style={{ borderColor: '#e2dfd9' }}>
                <div className="lpo-total-grid">
                  {[
                    ['Qty Total', money2(gridTotals.qtySum)],
                    ['FOC Total', money2(gridTotals.focSum)],
                    ['Gross Total', money2(gridTotals.grossSum)],
                    ['Discount Total', money2(gridTotals.discountSum)],
                    ['Sub Total', money2(gridTotals.subSum)],
                    ['VAT Total', money2(gridTotals.taxSum)],
                    ['Header Disc', money2(footerTotals.headerDiscount)],
                    ['Net Total', money2(footerTotals.netAfterHeader), true],
                  ].map(([label, value, strong]) => (
                    <div key={label} className={`lpo-total-chip ${strong ? 'lpo-total-chip-strong' : ''}`}>
                      <span className="lpo-total-name">{label}</span>
                      <span className="lpo-total-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lpo-rp flex min-h-0 flex-col overflow-y-auto border-t bg-white xl:min-h-0 xl:w-80 xl:border-t-0 xl:border-l" style={{ borderColor: '#e2dfd9' }}>
            <div className="flex shrink-0 border-b px-3 py-1" style={{ borderColor: '#e2dfd9' }}>
              {[
                { key: 'summary', label: 'Summary' },
                { key: 'order', label: 'Order' },
                { key: 'terms', label: 'Terms' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`lpo-tab ${rightTab === tab.key ? 'lpo-tab-on' : ''}`}
                  onClick={() => setRightTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'summary' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="lpo-lbl block mb-2">Summary</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-24 shrink-0">Total</label>
                        <input type="text" readOnly tabIndex={-1} value={summaryInfo.total} className="lpo-fi flex-1 tabular-nums" title="Sum of line sub totals" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-24 shrink-0">Discount</label>
                        <input type="text" value={summaryInfo.discountAmount} onChange={(e) => setSummaryInfo((p) => ({ ...p, discountAmount: e.target.value }))} className="lpo-fi flex-1 tabular-nums" />
                      </div>
                      <div className="lpo-net flex items-center gap-2">
                        <label className="lpo-fl w-24 shrink-0" style={{ color: primary }}>Net Amount</label>
                        <input type="text" readOnly tabIndex={-1} value={summaryInfo.netAmount} className="lpo-fi flex-1 tabular-nums" style={{ fontWeight: 700, background: '#fff' }} title="Line totals minus discount" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'order' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="lpo-lbl block mb-2">Order Information</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-20 shrink-0">LPO No</label>
                        <input type="text" value={lpoInfo.lpoNo} onChange={(e) => setLpoInfo((p) => ({ ...p, lpoNo: e.target.value }))} className="lpo-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-20 shrink-0">Order Form</label>
                        <input type="text" value={lpoInfo.orderFrom} onChange={(e) => setLpoInfo((p) => ({ ...p, orderFrom: e.target.value }))} className="lpo-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-20 shrink-0">Supplier</label>
                        <input type="text" value={lpoInfo.lpoSupplierName} onChange={(e) => setLpoInfo((p) => ({ ...p, lpoSupplierName: e.target.value }))} className="lpo-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-20 shrink-0">Supplier Quot No</label>
                        <input type="text" value={lpoInfo.supplierQuotationNo} onChange={(e) => setLpoInfo((p) => ({ ...p, supplierQuotationNo: e.target.value }))} className="lpo-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-20 shrink-0">LPO Date</label>
                        <input type="date" value={lpoInfo.lpoDate} onChange={(e) => setLpoInfo((p) => ({ ...p, lpoDate: e.target.value }))} className="lpo-fi flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="lpo-fl w-20 shrink-0">Discount</label>
                        <select value={lpoInfo.discount} onChange={(e) => setLpoInfo((p) => ({ ...p, discount: e.target.value }))} className="lpo-fi flex-1">
                          {DISCOUNT_HEADER_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="lpo-lbl block mb-2">Options</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Switch checked={lpoInfo.bySupplier} onChange={(v) => setLpoInfo((p) => ({ ...p, bySupplier: v }))} description="By Supplier" size="xs" />
                      <Switch checked={lpoInfo.listItem} onChange={(v) => setLpoInfo((p) => ({ ...p, listItem: v }))} description="List Items" size="xs" />
                      <Switch checked={lpoInfo.useDiscPct} onChange={(v) => setLpoInfo((p) => ({ ...p, useDiscPct: v }))} description="Use Disc%" size="xs" />
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'terms' && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="lpo-lbl block mb-2">Terms & Conditions</span>
                    <textarea
                      value={summaryInfo.lpoTerms}
                      onChange={(e) => setSummaryInfo((p) => ({ ...p, lpoTerms: e.target.value }))}
                      className="lpo-ta w-full"
                      rows={8}
                      placeholder="Payment terms, delivery, validity..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lpo-bar shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" className="lpo-bb" onClick={resetLpo}>
              <img src={EditIcon} alt="" className="h-3 w-3" />
              <span className="hidden sm:inline">New</span>
            </button>
            <button type="button" className="lpo-bb">
              <img src={PrinterIcon} alt="" className="h-3 w-3" />
              Print
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="lpo-bb lpo-bb-cancel">
              <img src={CancelIcon} alt="" className="h-3 w-3" />
              Close
            </button>
            <button
              type="button"
              className="lpo-bb lpo-bb-save"
              disabled={saveLoading || !branchId || !supplierId || lineRows.length === 0}
              onClick={() => {
                void handleSaveLpo();
              }}
            >
              {saveLoading ? 'Saving…' : savedLpoMasterId ? 'Update LPO' : 'Save LPO'}
            </button>
          </div>
        </div>
      </div>

      {productPickerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm"
          onClick={() => { setProductPickerOpen(false); setProductPickerSearch(''); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lpo-pp-title"
        >
          <div className="lpo-modal flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg,${primary} 0%,#85203E 35%,#923A53 65%,#C44972 100%)` }} />
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 px-4 py-2.5">
              <h2 id="lpo-pp-title" className="text-sm font-bold" style={{ color: primary }}>Pick Product</h2>
              <button type="button" className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close" onClick={() => { setProductPickerOpen(false); setProductPickerSearch(''); }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="shrink-0 border-b border-stone-100 px-4 py-2.5">
              <div className="relative">
                <img src={SearchIcon} alt="" className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
                <input ref={productPickerSearchRef} type="search" value={productPickerSearch} onChange={(e) => setProductPickerSearch(e.target.value)} placeholder="Search code or description…" className="box-border w-full rounded-lg border border-stone-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-rose-900/40 sm:text-sm" />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1 sm:px-2">
              {filteredPickerProducts.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-stone-500">{!branchId ? 'Choose a branch first.' : pickerProducts.length === 0 ? 'No products.' : 'No matches.'}</p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {filteredPickerProducts.map((p) => (
                    <li key={p.productId}>
                      <button type="button" className="flex w-full gap-2 px-2 py-2 text-left text-[11px] hover:bg-rose-50/90 sm:text-xs" onClick={() => applyPickedProductFromPicker(p)}>
                        <span className="min-w-0 flex-1 font-mono text-stone-900">{p.barCode || '—'}</span>
                        <span className="min-w-0 flex-[1.6] text-stone-700">{p.shortDescription}</span>
                        <span className="shrink-0 tabular-nums text-stone-600">{Number(p.lastPurchaseCost || 0).toFixed(2)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.mode === 'bulk' ? 'Delete selected lines?' : 'Delete line item?'}
        message={pendingDelete?.mode === 'bulk' ? `This will remove ${selectedRows.size} selected row(s). This action cannot be undone.` : 'This will remove the row from the LPO. This action cannot be undone.'}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.mode === 'bulk') handleDeleteSelected();
          else deleteRow(pendingDelete.idx);
          setPendingDelete(null);
        }}
      />

      {selectedLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={() => setSelectedLine(null)} role="dialog" aria-modal="true" aria-label="Row details">
          <div className="lpo-modal w-full max-w-md rounded-xl border border-stone-200 bg-white p-4 shadow-2xl sm:max-w-lg sm:p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 h-1 w-full rounded-full" style={{ background: `linear-gradient(90deg,${primary},#c4a4b0)` }} />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>Line Details</h2>
              <button type="button" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedLine(null)} aria-label="Close">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Product ID', selectedLine.productId || '—'],
                ['Own Ref', selectedLine.ownRefNo || '—'],
                ['Barcode', selectedLine.barCode || '—'],
                ['Description', selectedLine.shortDescription || '—'],
                ['Qty', selectedLine.qty || '—'],
                ['UOM', selectedLine.uom || '—'],
                ['Pack Qty', selectedLine.packQty || '—'],
                ['FOC', selectedLine.foc || '—'],
                ['Base Cost', selectedLine.baseCost || '—'],
                ['Disc %', selectedLine.discPercent || '—'],
                ['Unit Cost', selectedLine.unitCost || '—'],
                ['Sub Total', selectedLine.subTotal || '—'],
                ['VAT %', selectedLine.vatPercent || '—'],
                ['VAT Amt', selectedLine.vatAmount || '—'],
                ['Line Total', selectedLine.lineTotal || '—'],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <div className="font-semibold text-stone-700">{label}</div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1">{value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
