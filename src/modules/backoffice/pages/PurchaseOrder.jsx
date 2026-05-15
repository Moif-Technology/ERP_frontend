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
import PostIcon from '../../../shared/assets/icons/post.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import {
  SubInputField,
  DropdownInput,
  DatePickerInput,
  Switch,
  CommonTable,
  ConfirmDialog,
  TableTotalsBar,
  TabsBar,
} from '../../../shared/components/ui';

const UOM_OPTIONS = ['PCS', 'BOX', 'CTN', 'KG', 'LTR'];
const VAT_OPTIONS = ['0', '5', '10', '15'];
const DISCOUNT_HEADER_OPTIONS = ['None', 'ITEM', 'Flat', 'Percentage'];
const LPO_LINE_ENTRY_H = 26;
const LPO_LINE_ENTRY_LBL = 'text-[9px] font-semibold text-gray-500 sm:text-[10px]';
const LPO_LINE_ENTRY_INP = 'text-[10px] tabular-nums';

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
  <span key="hdr-line-total" className="tabular-nums" title="Line total">
    Lin.
  </span>,
  'Action',
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
  const text = String(content ?? '');
  return (
    <span className={`block min-w-0 truncate ${dim ? 'opacity-45' : ''}`} title={text}>
      {text}
    </span>
  );
}

export default function PurchaseOrder() {
  const primary = colors.primary?.main || '#790728';

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
  const [productComboOpen, setProductComboOpen] = useState(false);
  const [productComboQuery, setProductComboQuery] = useState('');
  const [barcodeComboOpen, setBarcodeComboOpen] = useState(false);
  const [barcodeComboQuery, setBarcodeComboQuery] = useState('');
  const [descComboOpen, setDescComboOpen] = useState(false);
  const [descComboQuery, setDescComboQuery] = useState('');
  const productPickerSearchRef = useRef(null);
  const productComboRef = useRef(null);
  const barcodeComboRef = useRef(null);
  const descComboRef = useRef(null);
  const productDropdownRef = useRef(null);
  const qtyInputRef = useRef(null);
  const unitCostInputRef = useRef(null);
  const lineTotalInputRef = useRef(null);

  const focusProductDropdown = useCallback(() => {
    window.setTimeout(() => productComboRef.current?.querySelector('input')?.focus(), 0);
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

  const filterProductsByQuery = useCallback((list, qRaw) => {
    const q = String(qRaw ?? '').trim().toLowerCase();
    if (!q) return list.slice(0, 25);
    return list
      .filter(
        (p) =>
          String(p.barCode || '').toLowerCase().includes(q) ||
          String(p.shortDescription || '').toLowerCase().includes(q),
      )
      .slice(0, 25);
  }, []);

  const barcodeComboFiltered = useMemo(
    () => filterProductsByQuery(pickerProducts, barcodeComboQuery),
    [pickerProducts, barcodeComboQuery, filterProductsByQuery],
  );

  const descComboFiltered = useMemo(
    () => filterProductsByQuery(pickerProducts, descComboQuery),
    [pickerProducts, descComboQuery, filterProductsByQuery],
  );

  const productComboFiltered = useMemo(
    () => filterProductsByQuery(pickerProducts, productComboQuery).slice(0, 15),
    [pickerProducts, productComboQuery, filterProductsByQuery],
  );

  const selectedProductDisplay = useMemo(() => {
    if (!liveItem.productId) return '';
    const p = productById.get(Number(liveItem.productId));
    if (p) return `${p.productCode || ''} — ${(p.shortName || p.productName || '').trim()}`.replace(/^ — /, '');
    return liveItem.barCode || String(liveItem.productId);
  }, [liveItem.productId, liveItem.barCode, productById]);

  useEffect(() => {
    const onMouseDown = (e) => {
      const t = e.target;
      if (productComboRef.current?.contains(t)) return;
      if (barcodeComboRef.current?.contains(t)) return;
      if (descComboRef.current?.contains(t)) return;
      setProductComboOpen(false);
      setBarcodeComboOpen(false);
      setDescComboOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

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

  const closeLineEntryCombos = useCallback(() => {
    setProductComboOpen(false);
    setBarcodeComboOpen(false);
    setDescComboOpen(false);
    setProductComboQuery('');
    setBarcodeComboQuery('');
    setDescComboQuery('');
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
        closeLineEntryCombos();
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
      closeLineEntryCombos();
      focusQtyField();
    },
    [productById, focusQtyField, closeLineEntryCombos],
  );

  const openProductPicker = useCallback(
    (prefill) => {
      closeLineEntryCombos();
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
    [branchId, closeLineEntryCombos],
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
    closeLineEntryCombos();
    setSelectedRows(new Set());
    focusProductDropdown();
  }, [itemForm, editingRowIndex, focusProductDropdown, closeLineEntryCombos]);

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
      closeLineEntryCombos();
      focusQtyField();
    },
    [lineRows, focusQtyField, closeLineEntryCombos],
  );

  const cancelLineForm = useCallback(() => {
    setEditingRowIndex(null);
    setItemForm(ITEM_INITIAL);
    setLineEntryError('');
    closeLineEntryCombos();
    focusProductDropdown();
  }, [focusProductDropdown, closeLineEntryCombos]);

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
        closeLineEntryCombos();
      } else if (editingRowIndex !== null && editingRowIndex > index) {
        setEditingRowIndex((i) => i - 1);
      }
    },
    [editingRowIndex, closeLineEntryCombos],
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
      closeLineEntryCombos();
    }
  }, [selectedRows, editingRowIndex, closeLineEntryCombos]);

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
    closeLineEntryCombos();
    setSavedLpoMasterId('');
    setSaveError('');
    setSaveSuccess('');
    focusProductDropdown();
  }, [focusProductDropdown, closeLineEntryCombos]);

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
          <img src={ViewActionIcon} alt="" className="h-7 w-7" />
        </button>
        <button type="button" className="lpo-act" onClick={() => startEditRow(index)} aria-label="Edit line">
          <img src={EditActionIcon} alt="" className="h-7 w-7" />
        </button>
        <button type="button" className="lpo-act" onClick={() => setPendingDelete({ mode: 'single', idx: index })} aria-label="Delete line">
          <img src={DeleteActionIcon} alt="" className="h-7 w-7" />
        </button>
      </div>,
    ];
  });

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        .lpo-root {
          --pr: ${primary};
          --bd: #e5e5e5;
          --txt: #171717;
          --muted: #737373;
          --soft: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .lpo-btn:hover { border-color: #d4d4d4; background: var(--soft); color: var(--txt); }
        .lpo-lbl {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .lpo-summary-card {
          border-radius: 10px;
          border: 1px solid #e7e5e4;
          background: linear-gradient(165deg, #fafaf9 0%, #ffffff 48%, #fafaf9 100%);
          box-shadow: 0 1px 2px rgba(28, 25, 23, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          overflow: hidden;
        }
        .lpo-summary-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          padding: 7px 12px;
          min-width: 0;
        }
        .lpo-summary-row + .lpo-summary-row { border-top: 1px solid #f5f5f4; }
        .lpo-summary-label {
          font-size: 11px;
          font-weight: 600;
          color: #57534e;
          letter-spacing: 0.01em;
          line-height: 1.25;
        }
        .lpo-summary-value {
          font-size: 13px;
          font-weight: 700;
          color: #1c1917;
          font-variant-numeric: tabular-nums;
          text-align: right;
          letter-spacing: -0.02em;
        }
        .lpo-summary-net {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
          padding: 11px 12px 12px;
          border-top: 1px solid rgba(121, 7, 40, 0.18);
          background: linear-gradient(180deg, rgba(121, 7, 40, 0.07) 0%, rgba(121, 7, 40, 0.025) 100%);
        }
        .lpo-summary-net .lpo-summary-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--pr);
        }
        .lpo-summary-net .lpo-summary-value {
          font-size: 15px;
          font-weight: 800;
          color: var(--pr);
        }
        .lpo-compact-card {
          border: 1px solid var(--bd);
          border-radius: 8px;
          background: #fff;
          padding: 8px;
        }
        .lpo-act {
          width: 30px;
          height: 30px;
          padding: 6px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          opacity: 0.5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.15s ease, background 0.15s ease;
        }
        .lpo-act:hover { background: var(--soft); opacity: 1; }
        .lpo-del {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--bd);
          background: #fff;
          color: var(--txt);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
        }
        .lpo-del:hover { border-color: #fca5a5; color: #b91c1c; background: #fef2f2; }
        .lpo-grid-input {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          height: 26px;
          border-radius: 3px;
          border: 1px solid #d4d4d4;
          background: #fff;
          padding: 0 6px;
          font-size: 10px;
          line-height: 26px;
          outline: none;
          color: var(--txt);
        }
        .lpo-grid-input:focus { border-color: #a3a3a3; }
        .lpo-grid-select { padding-right: 2px; }
        .lpo-grid-value {
          display: block;
          width: 100%;
          min-width: 0;
          text-align: right;
          font-size: 10px;
          line-height: 26px;
          font-variant-numeric: tabular-nums;
          color: var(--txt);
        }
        .lpo-grid-btn {
          height: 26px;
          border-radius: 6px;
          border: 1px solid var(--bd);
          padding: 0 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .lpo-grid-btn-save { border-color: transparent; background: var(--pr); color: #fff; }
        .lpo-grid-btn-save:hover { filter: brightness(0.95); }
        .lpo-grid-btn-cancel { border-color: #fca5a5; background: #fff; color: #b91c1c; }
        .lpo-grid-btn-cancel:hover { background: #fef2f2; }
        .lpo-tbl, .lpo-tbl > div { overflow: visible !important; }
        .lpo-tbl thead th { position: sticky; top: 0; z-index: 2; }
        .lpo-tbl tbody tr:hover td { background-color: var(--soft) !important; }
        @keyframes lpo-modal-in { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .lpo-modal { animation: lpo-modal-in 0.2s ease-out; }
      `}</style>

      <div className="lpo-root flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>LOCAL PURCHASE ORDER</h1>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button type="button" className="lpo-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
              <img src={EditIcon} alt="" className="h-3 w-3" /> Edit
            </button>
            <button type="button" className="lpo-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition" onClick={resetLpo}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg> New
            </button>
            <button type="button" className="lpo-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
              <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
            </button>
            <button type="button" className="lpo-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
              <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
            </button>
            <button
              type="button"
              className="lpo-btn inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 opacity-50 transition"
              disabled
              title="Posting is disabled — save only for now."
            >
              <img src={PostIcon} alt="" className="h-3 w-3" /> Post
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: primary, borderColor: primary }}
              disabled={saveLoading || !branchId || !supplierId || lineRows.length === 0}
              onClick={() => {
                void handleSaveLpo();
              }}
            >
              {saveLoading ? 'Saving…' : savedLpoMasterId ? 'Update LPO' : 'Save LPO'}
            </button>
            {selectedRows.size > 0 && (
              <button type="button" className="lpo-del" onClick={() => setPendingDelete({ mode: 'bulk' })}>
                <img src={DeleteActionIcon} alt="" className="h-3 w-3" /> Delete ({selectedRows.size})
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-end gap-2">
          <DropdownInput
            label="Branch"
            options={branchDropdownOptions}
            value={branchId}
            onChange={(v) => setBranchId(v)}
            widthPx={150}
            heightPx={LPO_LINE_ENTRY_H}
            labelClassName={LPO_LINE_ENTRY_LBL}
            className={LPO_LINE_ENTRY_INP}
            disabled={refsLoading}
          />
          <DropdownInput
            label="Supplier"
            options={supplierDropdownOptions}
            value={supplierId}
            onChange={setSupplierId}
            widthPx={200}
            heightPx={LPO_LINE_ENTRY_H}
            labelClassName={LPO_LINE_ENTRY_LBL}
            className={LPO_LINE_ENTRY_INP}
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
            heightPx={LPO_LINE_ENTRY_H}
            labelClassName={LPO_LINE_ENTRY_LBL}
            className={LPO_LINE_ENTRY_INP}
            disabled={!branchId || lposListLoading}
          />
        </div>

        {refsError ? <p className="shrink-0 text-[11px] text-red-600">{refsError}</p> : null}
        {saveError ? <p className="shrink-0 text-[11px] text-red-600">{saveError}</p> : null}
        {saveSuccess ? <p className="shrink-0 text-[11px] text-emerald-700">{saveSuccess}</p> : null}
        {lineEntryError ? <p className="shrink-0 text-[11px] text-red-600">{lineEntryError}</p> : null}
        {productsLoadError && branchId ? <p className="shrink-0 text-[11px] text-amber-800">{productsLoadError}</p> : null}
        {!suppliersLoading && suppliers.length === 0 ? (
          <p className="shrink-0 text-[11px] text-amber-800">
            No suppliers —{' '}
            <Link to="/data-entry/supplier-entry" className="font-semibold underline underline-offset-2">
              add supplier
            </Link>
          </p>
        ) : null}

        <div className="flex min-w-0 shrink-0 flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
          <div className="shrink-0" ref={productComboRef}>
            <label className={`mb-0.5 block ${LPO_LINE_ENTRY_LBL}`}>Product</label>
            <div className="relative">
              <img
                src={SearchIcon}
                alt=""
                className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
              />
              <input
                type="text"
                className="w-[190px] rounded border border-gray-200 bg-white pl-6 pr-2 text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                style={{ height: LPO_LINE_ENTRY_H, minHeight: LPO_LINE_ENTRY_H, boxSizing: 'border-box' }}
                placeholder="Search product…"
                value={productComboOpen ? productComboQuery : selectedProductDisplay}
                onFocus={() => {
                  setProductComboOpen(true);
                  setBarcodeComboOpen(false);
                  setDescComboOpen(false);
                  setProductComboQuery('');
                }}
                onChange={(e) => setProductComboQuery(e.target.value)}
              />
              {productComboOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {!branchId ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                  ) : productComboFiltered.length === 0 ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                  ) : (
                    productComboFiltered.map((p) => (
                      <button
                        key={p.productId}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyProductSelection(String(p.productId));
                        }}
                      >
                        <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{p.barCode || '—'}</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{p.shortDescription}</span>
                        <span className="shrink-0 tabular-nums text-[10px] text-gray-400">{Number(p.lastPurchaseCost || 0).toFixed(2)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0" ref={barcodeComboRef}>
            <label className={`mb-0.5 block ${LPO_LINE_ENTRY_LBL}`}>Product code</label>
            <div className="relative">
              <img
                src={SearchIcon}
                alt=""
                className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
              />
              <input
                type="text"
                className="w-[112px] rounded border border-gray-200 bg-white pl-6 pr-2 font-mono text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                style={{ height: LPO_LINE_ENTRY_H, minHeight: LPO_LINE_ENTRY_H, boxSizing: 'border-box' }}
                placeholder="Code…"
                value={barcodeComboOpen ? barcodeComboQuery : liveItem.barCode}
                onFocus={() => {
                  setBarcodeComboOpen(true);
                  setDescComboOpen(false);
                  setBarcodeComboQuery('');
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  setBarcodeComboQuery(v);
                  mergeItemForm({ barCode: v, productId: '' });
                }}
              />
              {barcodeComboOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {!branchId ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                  ) : barcodeComboFiltered.length === 0 ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                  ) : (
                    barcodeComboFiltered.map((p) => (
                      <button
                        key={p.productId}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyProductSelection(String(p.productId));
                        }}
                      >
                        <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{p.barCode || '—'}</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{p.shortDescription}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0" ref={descComboRef}>
            <label className={`mb-0.5 block ${LPO_LINE_ENTRY_LBL}`}>Description</label>
            <div className="relative">
              <img
                src={SearchIcon}
                alt=""
                className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
              />
              <input
                type="text"
                className="w-[150px] rounded border border-gray-200 bg-white pl-6 pr-2 text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                style={{ height: LPO_LINE_ENTRY_H, minHeight: LPO_LINE_ENTRY_H, boxSizing: 'border-box' }}
                placeholder="Search description…"
                value={descComboOpen ? descComboQuery : liveItem.shortDescription}
                onFocus={() => {
                  setDescComboOpen(true);
                  setBarcodeComboOpen(false);
                  setDescComboQuery('');
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  setDescComboQuery(v);
                  mergeItemForm({ shortDescription: v, productId: '' });
                }}
              />
              {descComboOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {!branchId ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                  ) : descComboFiltered.length === 0 ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                  ) : (
                    descComboFiltered.map((p) => (
                      <button
                        key={p.productId}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyProductSelection(String(p.productId));
                        }}
                      >
                        <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{p.barCode || '—'}</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{p.shortDescription}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <SubInputField label="Own Ref.#" widthPx={86} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.ownRefNo} onChange={(e) => mergeItemForm({ ownRefNo: e.target.value })} />
          <SubInputField
            ref={qtyInputRef}
            label="Qty"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            widthPx={50}
            heightPx={LPO_LINE_ENTRY_H}
            labelClassName={LPO_LINE_ENTRY_LBL}
            className={LPO_LINE_ENTRY_INP}
            value={liveItem.qty}
            onChange={handleQtyChange}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              unitCostInputRef.current?.focus();
            }}
          />
          <DropdownInput label="UOM" widthPx={60} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.uom} onChange={(v) => mergeItemForm({ uom: v })} options={UOM_OPTIONS} />
          <SubInputField label="Pack Qty" type="number" widthPx={68} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.packQty} onChange={(e) => mergeItemForm({ packQty: e.target.value })} />
          <SubInputField label="FOC" type="number" widthPx={58} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.foc} onChange={(e) => mergeItemForm({ foc: e.target.value })} />
          <SubInputField label="Base Cost" type="number" widthPx={76} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.baseCost} onChange={(e) => mergeItemForm({ baseCost: e.target.value })} />
          <SubInputField label="Disc %" type="number" widthPx={66} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.discPercent} onChange={(e) => mergeItemForm({ discPercent: e.target.value })} />
          <SubInputField
            ref={unitCostInputRef}
            label="Unit Cost"
            type="number"
            widthPx={76}
            heightPx={LPO_LINE_ENTRY_H}
            labelClassName={LPO_LINE_ENTRY_LBL}
            className={LPO_LINE_ENTRY_INP}
            value={liveItem.unitCost}
            onChange={(e) => mergeItemForm({ unitCost: e.target.value })}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              lineTotalInputRef.current?.focus();
            }}
          />
          <SubInputField label="Sub.Total" type="number" widthPx={86} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.subTotal} readOnly tabIndex={-1} />
          <DropdownInput label="VAT %" widthPx={68} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.vatPercent} onChange={(v) => mergeItemForm({ vatPercent: v })} options={VAT_OPTIONS} />
          <SubInputField label="VAT Amt" type="number" widthPx={82} heightPx={LPO_LINE_ENTRY_H} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={liveItem.vatAmount} readOnly tabIndex={-1} />
          <SubInputField
            ref={lineTotalInputRef}
            label="Line Total"
            type="text"
            inputMode="decimal"
            widthPx={90}
            heightPx={LPO_LINE_ENTRY_H}
            value={liveItem.lineTotal}
            readOnly
            tabIndex={0}
            labelClassName={LPO_LINE_ENTRY_LBL}
            className={LPO_LINE_ENTRY_INP}
            title="Press Enter to add line to the table"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              handleAddOrUpdateLine();
            }}
          />
          <div className="flex items-end gap-1">
            <button
              type="button"
              onClick={handleAddOrUpdateLine}
              className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-3 text-[10px] font-semibold leading-none text-white"
              style={{ backgroundColor: primary, borderColor: primary }}
            >
              {editingRowIndex !== null ? 'Save' : 'Add Line'}
            </button>
            {editingRowIndex !== null && (
              <button
                type="button"
                onClick={cancelLineForm}
                className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border border-gray-200 bg-white px-2.5 text-[10px] font-semibold leading-none text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200">
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <CommonTable
                className="lpo-tbl"
                fitParentWidth
                stickyHeader
                hideOuterBorder
                truncateHeader
                headerOverflowAbbrevChars={3}
                truncateBody
                columnWidthPercents={LPO_COLUMN_WIDTH_PERCENTS}
                headerFontSize="11px"
                bodyFontSize="13px"
                cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
                headers={LPO_LINE_HEADERS}
                rows={tableBodyRows}
              />
            </div>
            <TableTotalsBar
              borderColor="#e5e5e5"
              items={[
                ['Qty Total', money2(gridTotals.qtySum)],
                ['FOC Total', money2(gridTotals.focSum)],
                ['Gross Total', money2(gridTotals.grossSum)],
                ['Discount Total', money2(gridTotals.discountSum)],
                ['Sub Total', money2(gridTotals.subSum)],
                ['VAT Total', money2(gridTotals.taxSum)],
                ['Header Disc', money2(footerTotals.headerDiscount)],
                ['Net Total', money2(footerTotals.netAfterHeader), true],
              ]}
            />
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200 xl:min-w-0">
            <div className="flex shrink-0 flex-col gap-2.5 border-b border-neutral-200 bg-neutral-50 px-3 py-3">
              <span className="lpo-lbl">LPO reference</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <SubInputField label="LPO No" fullWidth heightPx={34} labelClassName={LPO_LINE_ENTRY_LBL} className={LPO_LINE_ENTRY_INP} value={lpoInfo.lpoNo} onChange={(e) => setLpoInfo((p) => ({ ...p, lpoNo: e.target.value }))} />
                <DatePickerInput
                  fullWidth
                  heightPx={34}
                  borderRadius={4}
                  placeholder="DD/MM/YYYY"
                  displayFontSize={10}
                  background="#fff"
                  dropdownInViewport
                  value={lpoInfo.lpoDate}
                  onChange={(e) => setLpoInfo((p) => ({ ...p, lpoDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
              <TabsBar
                fullWidth
                tabs={[
                  { id: 'summary', label: 'Summary' },
                  { id: 'order', label: 'Order' },
                  { id: 'terms', label: 'Terms' },
                ]}
                activeTab={rightTab}
                onChange={setRightTab}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {rightTab === 'summary' && (
                <div className="flex flex-col gap-2">
                  <span className="lpo-lbl">Summary</span>
                  <div className="lpo-summary-card" role="region" aria-label="LPO amount summary">
                    <div className="lpo-summary-row">
                      <span className="lpo-summary-label">Total</span>
                      <span className="lpo-summary-value tabular-nums">{summaryInfo.total}</span>
                    </div>
                    <div className="lpo-summary-row">
                      <span className="lpo-summary-label">Discount</span>
                      <input
                        type="text"
                        value={summaryInfo.discountAmount}
                        onChange={(e) => setSummaryInfo((p) => ({ ...p, discountAmount: e.target.value }))}
                        className="lpo-summary-value min-w-0 max-w-[55%] border-0 bg-transparent p-0 text-right outline-none focus:ring-0 tabular-nums"
                        title="Header discount"
                      />
                    </div>
                    <div className="lpo-summary-net">
                      <span className="lpo-summary-label">Net amount</span>
                      <span className="lpo-summary-value tabular-nums">{summaryInfo.netAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'order' && (
                <div className="flex flex-col gap-3">
                  <span className="lpo-lbl">Order information</span>
                  <div className="lpo-compact-card grid grid-cols-1 gap-y-2.5 sm:grid-cols-[minmax(0,1fr)_112px] sm:gap-x-2 sm:gap-y-2.5">
                    <div className="min-w-0 sm:col-start-1 sm:row-start-1">
                      <SubInputField
                        label="Order from"
                        fullWidth
                        heightPx={LPO_LINE_ENTRY_H}
                        labelClassName={LPO_LINE_ENTRY_LBL}
                        className={LPO_LINE_ENTRY_INP}
                        value={lpoInfo.orderFrom}
                        onChange={(e) => setLpoInfo((p) => ({ ...p, orderFrom: e.target.value }))}
                      />
                    </div>
                    <div className="shrink-0 sm:col-start-2 sm:row-start-1">
                      <DropdownInput
                        label="Discount"
                        widthPx={112}
                        heightPx={LPO_LINE_ENTRY_H}
                        value={lpoInfo.discount}
                        onChange={(v) => setLpoInfo((p) => ({ ...p, discount: v }))}
                        options={DISCOUNT_HEADER_OPTIONS}
                        labelClassName={LPO_LINE_ENTRY_LBL}
                        className={LPO_LINE_ENTRY_INP}
                      />
                    </div>
                    <div className="min-w-0 sm:col-span-2">
                      <SubInputField
                        label="Supplier name"
                        fullWidth
                        heightPx={LPO_LINE_ENTRY_H}
                        labelClassName={LPO_LINE_ENTRY_LBL}
                        className={LPO_LINE_ENTRY_INP}
                        value={lpoInfo.lpoSupplierName}
                        onChange={(e) => setLpoInfo((p) => ({ ...p, lpoSupplierName: e.target.value }))}
                      />
                    </div>
                    <div className="min-w-0 sm:col-span-2">
                      <SubInputField
                        label="Supplier quotation no."
                        fullWidth
                        heightPx={LPO_LINE_ENTRY_H}
                        labelClassName={LPO_LINE_ENTRY_LBL}
                        className={LPO_LINE_ENTRY_INP}
                        value={lpoInfo.supplierQuotationNo}
                        onChange={(e) => setLpoInfo((p) => ({ ...p, supplierQuotationNo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <span className="lpo-lbl">Options</span>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Switch checked={lpoInfo.bySupplier} onChange={(v) => setLpoInfo((p) => ({ ...p, bySupplier: v }))} description="By supplier" size="xs" />
                      <Switch checked={lpoInfo.listItem} onChange={(v) => setLpoInfo((p) => ({ ...p, listItem: v }))} description="List items" size="xs" />
                      <Switch checked={lpoInfo.useDiscPct} onChange={(v) => setLpoInfo((p) => ({ ...p, useDiscPct: v }))} description="Use disc %" size="xs" />
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'terms' && (
                <div className="flex flex-col gap-2">
                  <span className="lpo-lbl">Terms & conditions</span>
                  <textarea
                    value={summaryInfo.lpoTerms}
                    onChange={(e) => setSummaryInfo((p) => ({ ...p, lpoTerms: e.target.value }))}
                    className="box-border min-h-[10rem] w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-neutral-400"
                    rows={8}
                    placeholder="Payment terms, delivery, validity…"
                  />
                </div>
              )}
            </div>
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
