import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as purchaseEntryApi from '../../../services/purchaseEntry.api.js';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
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
const DISCOUNT_OPTIONS = ['None', 'Flat', 'Percentage'];
const GRN_LINE_ENTRY_H = 26;
const GRN_LINE_ENTRY_LBL = 'text-[9px] font-semibold text-gray-500 sm:text-[10px]';
const GRN_LINE_ENTRY_INP = 'text-[10px] tabular-nums';

const ITEM_INITIAL = {
  productId: '',
  ownRefNo: '',
  barCode: '',
  shortDescription: '',
  uom: 'PCS',
  packQty: '',
  foc: '',
  qty: '',
  baseCost: '',
  discPercent: '',
  unitCost: '',
  subTotal: '0.00',
  vatPercent: '0',
  vatAmount: '0.00',
  total: '0.00',
};

const GRN_INFO_INITIAL = {
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
};

const SUMMARY_INITIAL = {
  total: '',
  discountAmount: '',
  netAmount: '',
  grnTerms: '',
};

function num(v) {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function money2(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function freshGrnInfo() {
  return { ...GRN_INFO_INITIAL, grnDate: isoToday() };
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
    unitCost: partial.unitCost || partial.baseCost || '',
    subTotal: money2(sub),
    vatAmount: money2(vatAmt),
    total: money2(total),
  };
}

function normalizeItemForm(f) {
  const c = computeItemLine(f);
  return { ...f, unitCost: c.unitCost, subTotal: c.subTotal, vatAmount: c.vatAmount, total: c.total };
}

function itemToRow(f) {
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
    total: n.total,
  };
}

export default function GoodsReceiveNote() {
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [refsError, setRefsError] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [productsLoadError, setProductsLoadError] = useState('');
  const [lineRows, setLineRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [itemForm, setItemForm] = useState(ITEM_INITIAL);
  const [summaryInfo, setSummaryInfo] = useState(SUMMARY_INITIAL);
  const [grnInfo, setGrnInfo] = useState(() => freshGrnInfo());
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);
  const [rightTab, setRightTab] = useState('details');
  const [lineEntryError, setLineEntryError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [productComboOpen, setProductComboOpen] = useState(false);
  const [productComboQuery, setProductComboQuery] = useState('');
  const [productCodeComboOpen, setProductCodeComboOpen] = useState(false);
  const [productCodeComboQuery, setProductCodeComboQuery] = useState('');
  const [productDescComboOpen, setProductDescComboOpen] = useState(false);
  const [productDescComboQuery, setProductDescComboQuery] = useState('');

  const productComboRef = useRef(null);
  const productCodeComboRef = useRef(null);
  const productDescComboRef = useRef(null);

  const focusProductDropdown = useCallback(() => {
    window.setTimeout(() => productComboRef.current?.querySelector('input')?.focus(), 0);
  }, []);

  const liveItem = useMemo(() => normalizeItemForm(itemForm), [itemForm]);

  const branchOptions = useMemo(
    () =>
      (branches || []).map((b) => ({
        value: String(b.branchId),
        label:
          `${b.branchCode || ''} - ${b.branchName || ''}`.replace(/^- |^ - /, '').trim() ||
          `Branch ${b.branchId}`,
      })),
    [branches],
  );

  const branchDropdownOptions = useMemo(
    () => [{ value: '', label: refsLoading ? 'Loading branches...' : '- Branch -' }, ...branchOptions],
    [branchOptions, refsLoading],
  );

  const supplierDropdownOptions = useMemo(
    () => [
      { value: '', label: suppliersLoading ? 'Loading suppliers...' : '- Supplier -' },
      ...suppliers.map((s) => ({
        value: String(s.supplierId),
        label: `${s.supplierCode} - ${s.supplierName}`,
      })),
    ],
    [suppliers, suppliersLoading],
  );

  const productSelectOptions = useMemo(() => {
    const base = [{ value: '', label: !branchId ? '- Branch -' : '- Product -' }];
    for (const p of productsCatalog) {
      base.push({
        value: String(p.productId),
        label: `${p.productCode || p.productId} - ${(p.shortName || p.productName || '').slice(0, 28)}`,
      });
    }
    return base;
  }, [productsCatalog, branchId]);

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of productsCatalog) m.set(Number(p.productId), p);
    return m;
  }, [productsCatalog]);

  const pickerProducts = useMemo(
    () =>
      productsCatalog.map((p) => ({
        productId: p.productId,
        barCode: p.productCode || '',
        shortDescription: (p.shortName || p.productName || '').trim() || '-',
        lastPurchaseCost: p.lastPurchaseCost,
      })),
    [productsCatalog],
  );

  const filterProductsByQuery = useCallback((qRaw) => {
    const q = String(qRaw ?? '').trim().toLowerCase();
    const rows = q
      ? pickerProducts.filter((p) =>
          String(p.barCode || '').toLowerCase().includes(q) ||
          String(p.shortDescription || '').toLowerCase().includes(q)
        )
      : pickerProducts;
    return rows.slice(0, 15);
  }, [pickerProducts]);

  const productComboFiltered = useMemo(() => filterProductsByQuery(productComboQuery), [filterProductsByQuery, productComboQuery]);
  const productCodeComboFiltered = useMemo(() => filterProductsByQuery(productCodeComboQuery), [filterProductsByQuery, productCodeComboQuery]);
  const productDescComboFiltered = useMemo(() => filterProductsByQuery(productDescComboQuery), [filterProductsByQuery, productDescComboQuery]);

  const selectedProductDisplay = useMemo(() => {
    if (!liveItem.productId) return '';
    const p = productById.get(Number(liveItem.productId));
    if (p) return `${p.productCode || ''} - ${(p.shortName || p.productName || '').trim()}`.replace(/^- /, '');
    return liveItem.barCode || String(liveItem.productId);
  }, [liveItem.productId, liveItem.barCode, productById]);

  const closeLineEntryCombos = useCallback(() => {
    setProductComboOpen(false);
    setProductCodeComboOpen(false);
    setProductDescComboOpen(false);
    setProductComboQuery('');
    setProductCodeComboQuery('');
    setProductDescComboQuery('');
  }, []);

  const tableTotals = useMemo(() => {
    const qty = lineRows.reduce((s, r) => s + num(r.qty), 0);
    const foc = lineRows.reduce((s, r) => s + num(r.foc), 0);
    const gross = lineRows.reduce((s, r) => {
      const unit = num(r.unitCost) > 0 ? num(r.unitCost) : num(r.baseCost);
      return s + num(r.qty) * unit;
    }, 0);
    const sub = lineRows.reduce((s, r) => s + num(r.subTotal), 0);
    const tax = lineRows.reduce((s, r) => s + num(r.vatAmount), 0);
    const line = lineRows.reduce((s, r) => s + num(r.total), 0);
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

  useEffect(() => {
    const headerDiscount = num(summaryInfo.discountAmount);
    const net = Math.max(0, tableTotals.lineSum - headerDiscount);
    setSummaryInfo((prev) => ({
      ...prev,
      total: money2(tableTotals.subSum),
      netAmount: money2(net),
    }));
  }, [tableTotals.subSum, tableTotals.lineSum, summaryInfo.discountAmount]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRefsLoading(true);
      setRefsError('');
      try {
        const sess = getSessionUser();
        const defaultBr = sess?.stationId != null ? String(sess.stationId) : '';
        const { data } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        const rows = data?.branches || [];
        setBranches(rows);
        setBranchId((prev) => prev || defaultBr || (rows[0] ? String(rows[0].branchId) : ''));
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
    if (!supplierId) return;
    const s = suppliers.find((x) => String(x.supplierId) === String(supplierId));
    if (s?.supplierName) setGrnInfo((p) => ({ ...p, supplierName: s.supplierName }));
  }, [supplierId, suppliers]);

  useEffect(() => {
    const onMouseDown = (e) => {
      const t = e.target;
      if (productComboRef.current?.contains(t)) return;
      if (productCodeComboRef.current?.contains(t)) return;
      if (productDescComboRef.current?.contains(t)) return;
      closeLineEntryCombos();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [closeLineEntryCombos]);

  const mergeItemForm = useCallback((patch) => {
    setItemForm((prev) => normalizeItemForm({ ...prev, ...patch }));
    setLineEntryError('');
  }, []);

  const applyProductSelection = useCallback(
    (raw) => {
      const id = String(raw || '').trim();
      if (!id) {
        mergeItemForm({ ...ITEM_INITIAL });
        return;
      }
      const p = productById.get(Number(id));
      if (!p) {
        mergeItemForm({ productId: id });
        return;
      }
      const cost = p.lastPurchaseCost != null && p.lastPurchaseCost !== '' ? String(p.lastPurchaseCost) : '';
      mergeItemForm({
        productId: id,
        barCode: p.productCode || '',
        shortDescription: (p.shortName || p.productName || '').trim(),
        uom: p.unitName || 'PCS',
        baseCost: cost,
        unitCost: cost,
      });
      closeLineEntryCombos();
    },
    [mergeItemForm, productById, closeLineEntryCombos],
  );

  const handleAddOrUpdateLine = useCallback(() => {
    const row = itemToRow(itemForm);
    if (!row.productId || Number(row.productId) < 1) {
      setLineEntryError('Choose a product for the line.');
      return;
    }
    if (num(row.qty) <= 0) {
      setLineEntryError('Enter received quantity.');
      return;
    }
    if (num(row.unitCost) <= 0 && num(row.baseCost) <= 0) {
      setLineEntryError('Enter base cost or unit cost.');
      return;
    }
    if (editingRowIndex !== null) {
      setLineRows((prev) => prev.map((r, i) => (i === editingRowIndex ? row : r)));
      setEditingRowIndex(null);
    } else {
      setLineRows((prev) => [...prev, row]);
    }
    setItemForm(ITEM_INITIAL);
    closeLineEntryCombos();
    setLineEntryError('');
    setSaveError('');
    focusProductDropdown();
  }, [itemForm, editingRowIndex, closeLineEntryCombos, focusProductDropdown]);

  const startEditRow = useCallback(
    (idx) => {
      const r = lineRows[idx];
      setEditingRowIndex(idx);
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
        total: r.total ?? '0.00',
      });
      setLineEntryError('');
      focusProductDropdown();
    },
    [lineRows, focusProductDropdown],
  );

  const cancelLineEdit = useCallback(() => {
    setEditingRowIndex(null);
    setItemForm(ITEM_INITIAL);
    closeLineEntryCombos();
    setLineEntryError('');
    focusProductDropdown();
  }, [closeLineEntryCombos, focusProductDropdown]);

  const handleDeleteRow = useCallback(
    (idx) => {
      setLineRows((prev) => prev.filter((_, i) => i !== idx));
      if (editingRowIndex === idx) {
        setEditingRowIndex(null);
        setItemForm(ITEM_INITIAL);
      } else if (editingRowIndex !== null && idx < editingRowIndex) {
        setEditingRowIndex((prev) => prev - 1);
      }
    },
    [editingRowIndex],
  );

  const resetGrn = useCallback(() => {
    setLineRows([]);
    setSelectedRow(null);
    setEditingRowIndex(null);
    setItemForm(ITEM_INITIAL);
    setSummaryInfo(SUMMARY_INITIAL);
    setGrnInfo(freshGrnInfo());
    closeLineEntryCombos();
    setLineEntryError('');
    setSaveError('');
    setSaveSuccess('');
    focusProductDropdown();
  }, [closeLineEntryCombos, focusProductDropdown]);

  const handleSaveGrn = useCallback(async () => {
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
      setSaveError(`Line ${bad + 1}: choose a product.`);
      return;
    }

    const payload = {
      branchId: Number(branchId),
      supplierId: Number(supplierId),
      grnNo: grnInfo.grnNo || undefined,
      grnDate: grnInfo.grnDate || null,
      supplierDocNo: grnInfo.supplierDocNo,
      purchaseNo: grnInfo.purchaseNo,
      discount: grnInfo.discount,
      discountAmount: num(summaryInfo.discountAmount),
      netAmount: num(summaryInfo.netAmount) || tableTotals.lineSum,
      grnTerms: summaryInfo.grnTerms,
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
        lineTotal: r.total,
      })),
    };

    setSaveLoading(true);
    try {
      const { data } = await purchaseEntryApi.createGrn(payload);
      const saved = data?.grn;
      if (saved?.grnId) {
        setGrnInfo((p) => ({
          ...p,
          grnNo: saved.grnNo || p.grnNo,
          grnDate: saved.grnDate ? String(saved.grnDate).slice(0, 10) : p.grnDate,
        }));
      }
      setSaveSuccess(`GRN saved${saved?.grnNo ? ` (${saved.grnNo})` : ''}.`);
    } catch (e) {
      setSaveError(e.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSaveLoading(false);
    }
  }, [branchId, supplierId, lineRows, grnInfo, summaryInfo, tableTotals.lineSum]);

  const tableBodyRows = lineRows.map((row, idx) => {
    const editing = editingRowIndex === idx;
    if (editing) {
      return [
        String(idx + 1),
        <DropdownInput
          key={`prod-${idx}`}
          ref={productDropdownRef}
          label=""
          value={liveItem.productId}
          options={productSelectOptions}
          onChange={(v) => applyProductSelection(v)}
          widthPx={130}
        />,
        <input key={`own-${idx}`} value={liveItem.ownRefNo} onChange={(e) => mergeItemForm({ ownRefNo: e.target.value })} className="grn-grid-input" />,
        <input key={`bar-${idx}`} value={liveItem.barCode} onChange={(e) => mergeItemForm({ barCode: e.target.value, productId: '' })} className="grn-grid-input" />,
        <input key={`desc-${idx}`} value={liveItem.shortDescription} onChange={(e) => mergeItemForm({ shortDescription: e.target.value })} className="grn-grid-input" />,
        <input key={`qty-${idx}`} value={liveItem.qty} onChange={(e) => mergeItemForm({ qty: e.target.value })} className="grn-grid-input" inputMode="decimal" />,
        <select key={`uom-${idx}`} value={liveItem.uom} onChange={(e) => mergeItemForm({ uom: e.target.value })} className="grn-grid-input">
          {UOM_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>,
        <input key={`pack-${idx}`} value={liveItem.packQty} onChange={(e) => mergeItemForm({ packQty: e.target.value })} className="grn-grid-input" type="number" />,
        <input key={`foc-${idx}`} value={liveItem.foc} onChange={(e) => mergeItemForm({ foc: e.target.value })} className="grn-grid-input" type="number" />,
        <input key={`base-${idx}`} value={liveItem.baseCost} onChange={(e) => mergeItemForm({ baseCost: e.target.value, unitCost: e.target.value })} className="grn-grid-input" type="number" />,
        <input key={`disc-${idx}`} value={liveItem.discPercent} onChange={(e) => mergeItemForm({ discPercent: e.target.value })} className="grn-grid-input" type="number" />,
        <span key={`unit-${idx}`} className="grn-grid-value">{money2(num(liveItem.unitCost))}</span>,
        <span key={`sub-${idx}`} className="grn-grid-value">{money2(num(liveItem.subTotal))}</span>,
        <select key={`vatpct-${idx}`} value={liveItem.vatPercent} onChange={(e) => mergeItemForm({ vatPercent: e.target.value })} className="grn-grid-input">
          {VAT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>,
        <span key={`vatamt-${idx}`} className="grn-grid-value">{money2(num(liveItem.vatAmount))}</span>,
        <span key={`total-${idx}`} className="grn-grid-value font-bold">{money2(num(liveItem.total))}</span>,
        <div key={`act-${idx}`} className="flex items-center justify-center gap-0.5">
          <button type="button" className="grn-grid-btn grn-grid-btn-save" onClick={handleAddOrUpdateLine}>Save</button>
          <button type="button" className="grn-grid-btn grn-grid-btn-cancel" onClick={cancelLineEdit}>Cancel</button>
        </div>,
      ];
    }

    return [
      String(idx + 1),
      row.shortDescription || row.productId || '-',
      row.ownRefNo || '-',
      row.barCode || '-',
      row.shortDescription || '-',
      String(row.qty || '0'),
      row.uom || '-',
      String(row.packQty || '0'),
      String(row.foc || '0'),
      money2(num(row.baseCost)),
      String(row.discPercent || '0'),
      money2(num(row.unitCost)),
      money2(num(row.subTotal)),
      String(row.vatPercent || '0'),
      money2(num(row.vatAmount)),
      money2(num(row.total)),
      {
        content: (
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            <button type="button" className="grn-act" onClick={() => setSelectedRow(row)} aria-label="View line">
              <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            <button type="button" className="grn-act" onClick={() => startEditRow(idx)} aria-label="Edit line">
              <img src={EditActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            <button type="button" className="grn-act" onClick={() => setPendingDeleteIndex(idx)} aria-label="Delete line">
              <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        ),
        className: '!px-0.5 !py-0 sm:!px-0.5 sm:!py-0',
      },
    ];
  });

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'summary', label: 'Summary' },
  ];

  return (
    <div className="grn-page box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .grn-page {
          --pr: ${primary}; --pr50: ${primaryHover}; --pr100: ${primaryActive};
          --bd: #e2dfd9; --txt: #1c1917; --muted: #78716c;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .grn-lbl { font-size:9px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--pr); font-family:'Outfit',sans-serif; }
        .grn-act { padding:3px; border-radius:4px; border:none; background:transparent; cursor:pointer; transition:all .15s; opacity:.55; display:inline-flex; align-items:center; justify-content:center; }
        .grn-act:hover { background:var(--pr50); opacity:1; }
        .grn-grid-input { box-sizing:border-box; width:100%; min-width:0; height:20px; border-radius:4px; border:1px solid #d6d3d1; background:#fff;
          padding:0 4px; font-size:8.5px; line-height:20px; outline:none; font-family:'Outfit',sans-serif; color:var(--txt); }
        .grn-grid-input:focus { border-color:var(--pr); box-shadow:0 0 0 1px rgba(121,7,40,.08); }
        .grn-grid-value { display:block; width:100%; min-width:0; text-align:right; font-size:8.5px; line-height:20px; font-variant-numeric:tabular-nums; color:var(--txt); }
        .grn-grid-btn { height:20px; border-radius:4px; border:1px solid var(--bd); padding:0 4px; font-size:8px; font-weight:700; cursor:pointer;
          font-family:'Outfit',sans-serif; white-space:nowrap; transition:all .15s; }
        .grn-grid-btn-save { border-color:transparent; background:var(--pr); color:#fff; }
        .grn-grid-btn-cancel { border-color:#fca5a5; background:#fff; color:#b91c1c; }
        .grn-add { display:inline-flex; align-items:center; justify-content:center; height:24px; padding:0 14px; border-radius:5px; border:none;
          background:linear-gradient(135deg,${primary} 0%,#85203E 100%); color:#fff; font-size:10px; font-weight:600; cursor:pointer;
          transition:all .2s; box-shadow:0 1px 3px rgba(121,7,40,.25); font-family:'Outfit',sans-serif; letter-spacing:.3px; }
        .grn-add:hover { background:linear-gradient(135deg,#85203E 0%,#923A53 100%); box-shadow:0 2px 6px rgba(121,7,40,.3); }
        .grn-hr { height:1px; background:var(--bd); border:none; margin:0; flex-shrink:0; }
        .grn-tab { padding:6px 12px; font-size:10px; font-weight:500; cursor:pointer; border:none; background:transparent;
          color:var(--muted); border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .15s; font-family:'Outfit',sans-serif; white-space:nowrap; }
        .grn-tab:hover { color:var(--txt); }
        .grn-tab-on { color:var(--pr); border-bottom-color:var(--pr); font-weight:700; }
        .grn-bar { display:flex; align-items:center; justify-content:space-between; gap:6px; padding:6px 14px; border-top:2px solid var(--bd);
          background:linear-gradient(180deg,#f8f7f6 0%,#f0efed 100%); flex-shrink:0; flex-wrap:wrap; min-height:38px; }
        .grn-bb { display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 10px; border-radius:6px;
          border:1px solid #e5e5e5; background:#fff; color:#171717; font-size:11px; font-weight:500; cursor:pointer;
          white-space:nowrap; transition:border-color .15s,background .15s; }
        .grn-bb:hover { border-color:#d4d4d4; background:#fafafa; }
        .grn-bb-save { background:var(--pr); color:#fff; border-color:var(--pr); font-weight:600; }
        .grn-bb-save:hover { opacity:0.92; color:#fff; border-color:var(--pr); background:var(--pr); }
        .grn-bb-save:disabled { opacity:.5; cursor:not-allowed; }
        .grn-bb-cancel { color:#171717; border-color:#e5e5e5; }
        .grn-bb-cancel:hover { border-color:#d4d4d4; background:#fafafa; }
        .grn-fl { font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:.7px; color:var(--muted); }
        @media(min-width:640px){.grn-fl{font-size:10px}}
        .grn-fi { height:26px; width:100%; border-radius:5px; border:1px solid var(--bd); background:#f5f5f5; padding:0 8px;
          font-size:9px; outline:none; transition:border-color .15s; font-family:'Outfit',sans-serif; }
        @media(min-width:640px){.grn-fi{font-size:10px}}
        .grn-fi:focus { border-color:var(--pr); }
        .grn-ta { min-height:38px; width:100%; resize:vertical; border-radius:5px; border:1px solid var(--bd); background:#f5f5f5;
          padding:5px 8px; font-size:9px; outline:none; transition:border-color .15s; font-family:'Outfit',sans-serif; }
        @media(min-width:640px){.grn-ta{font-size:10px}}
        .grn-ta:focus { border-color:var(--pr); }
        .grn-net { background:linear-gradient(135deg,rgba(121,7,40,.07) 0%,rgba(121,7,40,.03) 100%); border-radius:6px; padding:3px; }
        .grn-rp::-webkit-scrollbar { width:3px; }
        .grn-rp::-webkit-scrollbar-track { background:transparent; }
        .grn-rp::-webkit-scrollbar-thumb { background:#d6d3d1; border-radius:3px; }
        .grn-tbl, .grn-tbl > div { overflow:visible !important; }
        .grn-tbl thead th { position:sticky; top:0; z-index:2; }
        @keyframes grn-modal-in { from{opacity:0;transform:scale(.96) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .grn-modal { animation:grn-modal-in .2s ease-out; }
        .grn-field-lbl { padding:0; margin:0; border:none; background:transparent; cursor:pointer; font-family:'Outfit',sans-serif;
          font-size:9px; font-weight:600; letter-spacing:.3px; color:var(--muted); line-height:1.2; display:inline-flex; align-items:center; gap:3px; }
        @media(min-width:640px){.grn-field-lbl{font-size:10px}}
        .grn-field-lbl:hover { color:var(--pr); }
      `}</style>

        <div className="flex shrink-0 flex-col gap-2">
          {/* Row 1: Heading + action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>GOODS RECEIVE NOTE</h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" className="grn-bb">
                <img src={EditIcon} alt="" className="h-3 w-3" /> Edit
              </button>
              <button type="button" className="grn-bb" onClick={resetGrn}>
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg> New
              </button>
              <button type="button" className="grn-bb">
                <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
              </button>
              <button type="button" className="grn-bb">
                <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
              </button>
              <button type="button" className="grn-bb cursor-not-allowed opacity-50" disabled title="Post is disabled — save first.">
                <img src={PostIcon} alt="" className="h-3 w-3" /> Post
              </button>
              <button type="button" className="grn-bb grn-bb-save" disabled={saveLoading || !branchId || !supplierId || lineRows.length === 0} onClick={() => { void handleSaveGrn(); }}>
                {saveLoading ? 'Saving...' : 'Save GRN'}
              </button>
            </div>
          </div>
          {/* Row 2: Branch + Supplier on the left */}
          <div className="flex flex-wrap items-end gap-2">
            <DropdownInput label="Branch" widthPx={180} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={branchId} onChange={(v) => setBranchId(String(v || ''))} options={branchDropdownOptions} disabled={refsLoading} />
            <DropdownInput label="Supplier" widthPx={230} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={supplierId} onChange={(v) => setSupplierId(String(v || ''))} options={supplierDropdownOptions} disabled={suppliersLoading} />
          </div>
          {(refsError || productsLoadError || lineEntryError || saveError || saveSuccess) && (
            <div className="flex flex-wrap gap-2 text-[10px]">
              {refsError ? <span className="text-red-700">{refsError}</span> : null}
              {productsLoadError ? <span className="text-amber-800">{productsLoadError}</span> : null}
              {lineEntryError ? <span className="text-red-700">{lineEntryError}</span> : null}
              {saveError ? <span className="text-red-700">{saveError}</span> : null}
              {saveSuccess ? <span className="text-emerald-700">{saveSuccess}</span> : null}
            </div>
          )}
        </div>


        <div className="flex min-w-0 shrink-0 flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-slate-50/70 px-3 py-2 sm:px-4">
          <div className="shrink-0" ref={productComboRef}>
            <label className={`mb-0.5 block ${GRN_LINE_ENTRY_LBL}`}>Product</label>
            <div className="relative">
              <img src={SearchIcon} alt="" className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45" />
              <input
                type="text"
                className="w-[190px] rounded border border-gray-200 bg-white pl-6 pr-2 text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                style={{ height: GRN_LINE_ENTRY_H, minHeight: GRN_LINE_ENTRY_H, boxSizing: 'border-box' }}
                placeholder="Search product..."
                value={productComboOpen ? productComboQuery : selectedProductDisplay}
                onFocus={() => { setProductComboOpen(true); setProductCodeComboOpen(false); setProductDescComboOpen(false); setProductComboQuery(''); }}
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
                      <button key={p.productId} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50" onMouseDown={(e) => { e.preventDefault(); applyProductSelection(String(p.productId)); }}>
                        <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{p.barCode || '-'}</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{p.shortDescription}</span>
                        <span className="shrink-0 tabular-nums text-[10px] text-gray-400">{Number(p.lastPurchaseCost || 0).toFixed(2)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0" ref={productCodeComboRef}>
            <label className={`mb-0.5 block ${GRN_LINE_ENTRY_LBL}`}>Product code</label>
            <div className="relative">
              <img src={SearchIcon} alt="" className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45" />
              <input
                type="text"
                className="w-[112px] rounded border border-gray-200 bg-white pl-6 pr-2 font-mono text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                style={{ height: GRN_LINE_ENTRY_H, minHeight: GRN_LINE_ENTRY_H, boxSizing: 'border-box' }}
                placeholder="Code..."
                value={productCodeComboOpen ? productCodeComboQuery : liveItem.barCode}
                onFocus={() => { setProductCodeComboOpen(true); setProductComboOpen(false); setProductDescComboOpen(false); setProductCodeComboQuery(''); }}
                onChange={(e) => { setProductCodeComboQuery(e.target.value); mergeItemForm({ barCode: e.target.value, productId: '' }); }}
              />
              {productCodeComboOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {!branchId ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                  ) : productCodeComboFiltered.length === 0 ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                  ) : (
                    productCodeComboFiltered.map((p) => (
                      <button key={p.productId} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50" onMouseDown={(e) => { e.preventDefault(); applyProductSelection(String(p.productId)); }}>
                        <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{p.barCode || '-'}</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{p.shortDescription}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0" ref={productDescComboRef}>
            <label className={`mb-0.5 block ${GRN_LINE_ENTRY_LBL}`}>Description</label>
            <div className="relative">
              <img src={SearchIcon} alt="" className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45" />
              <input
                type="text"
                className="w-[150px] rounded border border-gray-200 bg-white pl-6 pr-2 text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                style={{ height: GRN_LINE_ENTRY_H, minHeight: GRN_LINE_ENTRY_H, boxSizing: 'border-box' }}
                placeholder="Search description..."
                value={productDescComboOpen ? productDescComboQuery : liveItem.shortDescription}
                onFocus={() => { setProductDescComboOpen(true); setProductComboOpen(false); setProductCodeComboOpen(false); setProductDescComboQuery(''); }}
                onChange={(e) => { setProductDescComboQuery(e.target.value); mergeItemForm({ shortDescription: e.target.value, productId: '' }); }}
              />
              {productDescComboOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {!branchId ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                  ) : productDescComboFiltered.length === 0 ? (
                    <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                  ) : (
                    productDescComboFiltered.map((p) => (
                      <button key={p.productId} type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50" onMouseDown={(e) => { e.preventDefault(); applyProductSelection(String(p.productId)); }}>
                        <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{p.barCode || '-'}</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-gray-600">{p.shortDescription}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <SubInputField label="Own Ref.#" widthPx={86} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.ownRefNo} onChange={(e) => mergeItemForm({ ownRefNo: e.target.value })} />
          <SubInputField label="Qty" type="number" widthPx={58} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.qty} onChange={(e) => mergeItemForm({ qty: e.target.value })} />
          <DropdownInput label="UOM" options={UOM_OPTIONS} value={liveItem.uom} onChange={(val) => mergeItemForm({ uom: val })} widthPx={60} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} />
          <SubInputField label="Pack" type="number" widthPx={58} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.packQty} onChange={(e) => mergeItemForm({ packQty: e.target.value })} />
          <SubInputField label="FOC" type="number" widthPx={58} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.foc} onChange={(e) => mergeItemForm({ foc: e.target.value })} />
          <SubInputField label="Base Cost" type="number" widthPx={76} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.baseCost} onChange={(e) => mergeItemForm({ baseCost: e.target.value, unitCost: e.target.value })} />
          <SubInputField label="Disc %" type="number" widthPx={66} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.discPercent} onChange={(e) => mergeItemForm({ discPercent: e.target.value })} />
          <SubInputField label="Sub.Total" type="number" widthPx={86} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.subTotal} readOnly tabIndex={-1} />
          <DropdownInput label="VAT %" options={VAT_OPTIONS} value={liveItem.vatPercent} onChange={(val) => mergeItemForm({ vatPercent: val })} widthPx={68} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} />
          <SubInputField label="VAT Amt" type="number" widthPx={82} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.vatAmount} readOnly tabIndex={-1} />
          <SubInputField label="Total" type="number" widthPx={90} heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={liveItem.total} readOnly tabIndex={0} />
          <div className="flex shrink-0 items-end gap-1">
            <button type="button" className="grn-add" onClick={handleAddOrUpdateLine}>
              {editingRowIndex !== null ? 'Update' : 'Add'}
            </button>
            {editingRowIndex !== null && (
              <button type="button" className="grn-bb grn-bb-cancel" onClick={cancelLineEdit}>Cancel</button>
            )}
          </div>
        </div>


        <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-x-2 inset-y-1 flex flex-col overflow-hidden rounded-md sm:inset-x-3 sm:inset-y-1.5" style={{ border: '1px solid #e2dfd9' }}>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                <CommonTable
                  className="grn-tbl"
                  headers={['SL', 'Product', 'Own Ref', 'Barcode', 'Description', 'Qty', 'UOM', 'Pack', 'FOC', 'Base Cost', 'Disc%', 'Unit Cost', 'Sub Total', 'VAT%', 'VAT Amt', 'Line Total', 'Action']}
                  fitParentWidth
                  stickyHeader
                  hideOuterBorder
                  maxVisibleRows={20}
                  rows={tableBodyRows}
                />
              </div>
              <TableTotalsBar
                borderColor="#e2dfd9"
                items={[
                  ['Qty Total', money2(tableTotals.qtySum)],
                  ['FOC Total', money2(tableTotals.focSum)],
                  ['Gross Total', money2(tableTotals.grossSum)],
                  ['Discount Total', money2(tableTotals.discountSum)],
                  ['Sub Total', money2(tableTotals.subSum)],
                  ['VAT Total', money2(tableTotals.taxSum)],
                  ['Header Disc', money2(num(summaryInfo.discountAmount))],
                  ['Net Total', money2(num(summaryInfo.netAmount)), true],
                ]}
              />
            </div>
          </div>

          <div className="grn-rp flex min-h-0 flex-col overflow-y-auto border-t bg-white xl:min-h-0 xl:w-80 xl:border-t-0 xl:border-l" style={{ borderColor: '#e2dfd9' }}>
            <div className="shrink-0 border-b px-3 py-2" style={{ borderColor: '#e2dfd9' }}>
              <TabsBar
                fullWidth
                tabs={tabs.map((t) => ({ id: t.key, label: t.label }))}
                activeTab={rightTab}
                onChange={setRightTab}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'details' ? (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-3" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="grn-lbl block mb-2">GRN Information</span>
                    <div className="grid grid-cols-1 gap-2">
                      <DropdownInput label="Branch" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={branchId} onChange={(v) => setBranchId(String(v || ''))} options={branchDropdownOptions} disabled={refsLoading} />
                      <SubInputField label="GRN No" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={grnInfo.grnNo} onChange={(e) => setGrnInfo((p) => ({ ...p, grnNo: e.target.value }))} />
                      <DropdownInput label="Supplier" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={supplierId} onChange={(v) => setSupplierId(String(v || ''))} options={supplierDropdownOptions} disabled={suppliersLoading} />
                      <SubInputField label="Supplier Doc" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={grnInfo.supplierDocNo} onChange={(e) => setGrnInfo((p) => ({ ...p, supplierDocNo: e.target.value }))} />
                      <DatePickerInput
                        fullWidth
                        heightPx={34}
                        borderRadius={4}
                        placeholder="DD/MM/YYYY"
                        displayFontSize={10}
                        background="#fff"
                        dropdownInViewport
                        value={grnInfo.grnDate}
                        onChange={(e) => setGrnInfo((p) => ({ ...p, grnDate: e.target.value }))}
                      />
                      <SubInputField label="Purchase No" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={grnInfo.purchaseNo} onChange={(e) => setGrnInfo((p) => ({ ...p, purchaseNo: e.target.value }))} />
                      <DropdownInput label="Discount" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={grnInfo.discount} onChange={(v) => setGrnInfo((p) => ({ ...p, discount: v }))} options={DISCOUNT_OPTIONS} />
                    </div>
                  </div>

                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="grn-lbl block mb-2">Options</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Switch checked={grnInfo.bySupplier} onChange={(v) => setGrnInfo((p) => ({ ...p, bySupplier: v }))} description="By Supplier" size="xs" />
                      <Switch checked={grnInfo.listItem} onChange={(v) => setGrnInfo((p) => ({ ...p, listItem: v }))} description="List Items" size="xs" />
                      <Switch checked={grnInfo.useDiscPct} onChange={(v) => setGrnInfo((p) => ({ ...p, useDiscPct: v }))} description="Use Disc%" size="xs" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="grn-lbl block mb-2">Summary</span>
                    <div className="flex flex-col gap-2">
                      <SubInputField label="Total" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={summaryInfo.total} readOnly tabIndex={-1} />
                      <SubInputField label="Discount Amount" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={summaryInfo.discountAmount} onChange={(e) => setSummaryInfo((p) => ({ ...p, discountAmount: e.target.value }))} />
                      <div className="grn-net">
                        <SubInputField label="Net Amount" fullWidth heightPx={GRN_LINE_ENTRY_H} labelClassName={GRN_LINE_ENTRY_LBL} className={GRN_LINE_ENTRY_INP} value={summaryInfo.netAmount} readOnly tabIndex={-1} inputStyle={{ fontWeight: 700, background: '#fff' }} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-2.5" style={{ borderColor: '#e2dfd9', background: '#fafaf9' }}>
                    <span className="grn-lbl block mb-2">Terms & Conditions</span>
                    <textarea
                      value={summaryInfo.grnTerms}
                      onChange={(e) => setSummaryInfo((p) => ({ ...p, grnTerms: e.target.value }))}
                      className="grn-ta w-full"
                      rows={4}
                      placeholder="Enter GRN terms and conditions..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grn-bar shrink-0">
          <span className="text-[10px] text-stone-500 sm:text-[11px]">
            {lineRows.length} item{lineRows.length !== 1 ? 's' : ''} | Net: {money2(num(summaryInfo.netAmount))}
          </span>
        </div>

      <ConfirmDialog
        open={pendingDeleteIndex !== null}
        title="Delete line item?"
        message="This will remove the row from the goods receive note. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDeleteIndex(null)}
        onConfirm={() => {
          if (pendingDeleteIndex !== null) handleDeleteRow(pendingDeleteIndex);
          setPendingDeleteIndex(null);
        }}
      />

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={() => setSelectedRow(null)} role="dialog" aria-modal="true" aria-label="Row details">
          <div className="grn-modal w-full max-w-md rounded-xl border border-stone-200 bg-white p-4 shadow-2xl sm:max-w-lg sm:p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>Item Details</h2>
              <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedRow(null)} aria-label="Close details">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Product ID', selectedRow.productId || '-'],
                ['Own Ref No', selectedRow.ownRefNo || '-'],
                ['Barcode', selectedRow.barCode || '-'],
                ['Description', selectedRow.shortDescription || '-'],
                ['Qty', selectedRow.qty || '-'],
                ['UOM', selectedRow.uom || '-'],
                ['Pack Qty', selectedRow.packQty || '-'],
                ['FOC', selectedRow.foc || '-'],
                ['Base Cost', selectedRow.baseCost || '-'],
                ['Disc %', selectedRow.discPercent || '-'],
                ['Unit Cost', selectedRow.unitCost || '-'],
                ['Sub Total', selectedRow.subTotal || '-'],
                ['VAT %', selectedRow.vatPercent || '-'],
                ['VAT Amt', selectedRow.vatAmount || '-'],
                ['Line Total', selectedRow.total || '-'],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <div className="font-semibold text-gray-700">{label}</div>
                  <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1">{value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
