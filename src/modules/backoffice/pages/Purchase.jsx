import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';
import * as purchaseEntryApi from '../../../services/purchaseEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import NewPurchaseIcon from '../../../shared/assets/icons/purchase.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  DateInputField,
  DatePickerInput,
  Switch,
  CommonTable,
  ConfirmDialog,
  TableTotalsBar,
  TabsBar,
} from '../../../shared/components/ui';

const DOC_INITIAL = {
  purchaseNo: '',
  supplierInvNo: '',
  purchaseDate: '',
  enteredBy: 'Admin',
  paymentMode: 'Cash',
  accountHead: 'General',
  enteredDate: '',
  invoiceAmount: '',
  bySupplier: false,
};

const PAYMENT_INITIAL = {
  remark: '',
  paymentNo: '',
  paymentNow: false,
};

const LINE_INITIAL = {
  productId: '',
  ownRef: '',
  supRef: '',
  productCode: '',
  shortDescription: '',
  packetDetails: 'Pcs',
  lastPurchCost: '',
  lpoQty: '',
  qty: '',
  focQty: '',
  actualCost: '',
  sellingPrice: '',
  discPct: '',
  discAmt: '',
  subTotal: '',
  vatPct: '0',
  vatAmt: '',
  total: '',
};

const PURCHASE_LINE_QTY_ID = 'purchase-line-qty';
const PURCHASE_LINE_TOTAL_ID = 'purchase-line-total';
/** Purchase compact row: Branch/LPO/GRN + line entry — shared control height + label style */
const PURCHASE_LINE_ENTRY_H = 26;
const PURCHASE_LINE_ENTRY_LBL = 'text-[9px] font-semibold text-gray-500 sm:text-[10px]';
const PURCHASE_LINE_ENTRY_INP = 'text-[10px] tabular-nums';

function focusPurchaseLineQty() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(PURCHASE_LINE_QTY_ID);
      if (el && typeof el.focus === 'function') {
        el.focus();
        if (typeof el.select === 'function') el.select();
      }
    });
  });
}

function focusPurchaseLineTotal() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(PURCHASE_LINE_TOTAL_ID);
      if (el && typeof el.focus === 'function') {
        el.focus();
        if (typeof el.select === 'function') el.select();
      }
    });
  });
}

function num(value) {
  const parsed = parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value) {
  return num(value).toFixed(2);
}

function computeLine(line) {
  const qty = num(line.qty);
  const actualCost = num(line.actualCost);
  const sellingPrice = num(line.sellingPrice);
  /** Purchase line: prefer actual (unit) cost; fall back to sell column if cost empty (same as API unit cost). */
  const unitRate = actualCost > 0 ? actualCost : sellingPrice;
  const discPct = num(line.discPct);
  const discAmt = num(line.discAmt);
  const vatPct = num(line.vatPct);

  const gross = qty * unitRate;
  const pctDiscount = gross * (discPct / 100);
  const subtotal = Math.max(0, gross - pctDiscount - discAmt);
  const vatAmt = subtotal * (vatPct / 100);
  const total = subtotal + vatAmt;

  return {
    subTotal: money(subtotal),
    vatAmt: money(vatAmt),
    total: money(total),
  };
}

function normalizeLine(line) {
  const computed = computeLine(line);
  return {
    ...line,
    subTotal: computed.subTotal,
    vatAmt: computed.vatAmt,
    total: computed.total,
    packetDetails: line.packetDetails || 'Pcs',
    vatPct: line.vatPct || '0',
  };
}

/** API LPO line → purchase grid row */
function mapLpoLineToPurchaseLine(line) {
  const qty = Number(line.qty) || 0;
  const unitPrice = Number(line.unitPrice) || 0;
  const discAmt = Number(line.itemDiscount) || 0;
  const subTotal = Number(line.subtotalAmount) || 0;
  const lineTotal = Number(line.lineTotal) || 0;
  const taxAmtFromApi =
    line.vatAmount != null && String(line.vatAmount).trim() !== ''
      ? Number(line.vatAmount)
      : Math.max(0, Math.round((lineTotal - subTotal) * 100) / 100);
  const taxAmt = Number.isFinite(taxAmtFromApi) ? taxAmtFromApi : Math.max(0, Math.round((lineTotal - subTotal) * 100) / 100);
  const taxRateFromApi =
    line.vatPercent != null && String(line.vatPercent).trim() !== ''
      ? Number(line.vatPercent)
      : subTotal > 0.0001
        ? (taxAmt / subTotal) * 100
        : 0;
  const taxRate = Number.isFinite(taxRateFromApi) ? taxRateFromApi : 0;
  const productId =
    line.productId != null && Number(line.productId) >= 1 ? Number(line.productId) : null;
  const gross = qty * unitPrice;
  const discPct = gross > 0 && discAmt > 0 ? String(Math.round((discAmt / gross) * 10000) / 100) : '0';
  const packet = line.uom != null && String(line.uom).trim() !== '' ? String(line.uom) : 'Pcs';
  return normalizeLine({
    ...LINE_INITIAL,
    productId: productId != null ? String(productId) : '',
    ownRef: '',
    supRef: '',
    productCode: line.barcode != null ? String(line.barcode) : '',
    shortDescription: line.description != null ? String(line.description) : '',
    packetDetails: packet,
    qty: qty > 0 ? String(qty) : '',
    focQty: line.focQty != null ? String(line.focQty) : '0',
    actualCost: unitPrice > 0 ? String(unitPrice) : '',
    sellingPrice: unitPrice > 0 ? String(unitPrice) : '',
    discPct,
    discAmt: String(discAmt),
    vatPct: String(Math.round(taxRate * 100) / 100),
  });
}

/** API GRN line → purchase grid row */
function mapGrnLineToPurchaseLine(line) {
  const qty = Number(line.qty) || 0;
  const unitCost = Number(line.unitCost) || 0;
  const discAmt = Number(line.discountAmount) || 0;
  const subTotal = Number(line.subtotalAmount) || 0;
  const lineTotal = Number(line.lineTotal) || 0;
  const taxAmt = Math.max(0, Math.round((lineTotal - subTotal) * 100) / 100);
  const taxRate = subTotal > 0.0001 ? (taxAmt / subTotal) * 100 : 0;
  const productId =
    line.productId != null && Number(line.productId) >= 1 ? Number(line.productId) : null;
  const gross = qty * unitCost;
  const discPct = gross > 0 && discAmt > 0 ? String(Math.round((discAmt / gross) * 10000) / 100) : '0';
  const packet =
    line.unitName != null && String(line.unitName).trim() !== '' ? String(line.unitName) : 'Pcs';
  const lastPc = Number(line.lastPurchaseCost);
  return normalizeLine({
    ...LINE_INITIAL,
    productId: productId != null ? String(productId) : '',
    ownRef: '',
    supRef: '',
    productCode: line.barcode != null ? String(line.barcode) : '',
    shortDescription: line.shortDescription != null ? String(line.shortDescription) : '',
    packetDetails: packet,
    qty: qty > 0 ? String(qty) : '',
    focQty: line.focQty != null ? String(line.focQty) : '0',
    lastPurchCost: Number.isFinite(lastPc) && lastPc > 0 ? String(lastPc) : '',
    actualCost: unitCost > 0 ? String(unitCost) : '',
    sellingPrice: unitCost > 0 ? String(unitCost) : '',
    discPct,
    discAmt: String(discAmt),
    vatPct: String(Math.round(taxRate * 100) / 100),
  });
}

function buildPurchasePayload({
  branchId,
  supplierId,
  grnId,
  lpoMasterId,
  doc,
  paymentInfo,
  totals,
  lineRows,
}) {
  const lines = lineRows.map((row) => ({
    productId: Number(row.productId),
    qty: num(row.qty),
    focQty: num(row.focQty),
    actualCost: num(row.actualCost),
    sellingPrice: num(row.sellingPrice),
    discPct: num(row.discPct),
    discAmt: num(row.discAmt),
    subTotal: num(row.subTotal),
    vatPct: num(row.vatPct),
    vatAmt: num(row.vatAmt),
    total: num(row.total),
    unitName: row.packetDetails,
  }));
  return {
    branchId: Number(branchId),
    supplierId: Number(supplierId),
    grnId: grnId ? Number(grnId) : null,
    lpoMasterId: lpoMasterId ? Number(lpoMasterId) : null,
    supplierInvoiceNo: doc.supplierInvNo || null,
    purchaseDate: doc.purchaseDate || null,
    invoiceAmount: num(doc.invoiceAmount) > 0 ? num(doc.invoiceAmount) : num(totals.netAmount),
    netAmount: num(totals.netAmount),
    paymentMode: doc.paymentMode,
    paymentNow: paymentInfo.paymentNow,
    remark: paymentInfo.remark,
    lines,
  };
}

const PURCHASE_LINE_HEADERS = [
  '',
  'Sl',
  'Own Ref #',
  'Sup Ref',
  'Product',
  'Description',
  'Packet',
  'Last cost',
  'LPO',
  'Qty',
  'FOC',
  'Act. cost',
  'Sell',
  'Disc %',
  'Disc',
  'Sub',
  'VAT %',
  'VAT',
  'Total',
  'Action',
];

const PURCHASE_LINE_COL_PCT = [
  3,
  3,
  5,
  5,
  5,
  14,
  5,
  6,
  4,
  4,
  4,
  6,
  5,
  4,
  5,
  5,
  4,
  5,
  6,
  12,
];

function dimCell(content, dim) {
  const text = String(content ?? '');
  return (
    <span className={`block min-w-0 truncate ${dim ? 'opacity-45' : ''}`} title={text}>
      {text}
    </span>
  );
}


export default function Purchase() {
  const location = useLocation();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(DOC_INITIAL);
  const [paymentInfo, setPaymentInfo] = useState(PAYMENT_INITIAL);
  const [entryLine, setEntryLine] = useState(LINE_INITIAL);
  const [lineRows, setLineRows] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [selectedLine, setSelectedLine] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [rightTab, setRightTab] = useState('summary');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [refsError, setRefsError] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [lposRows, setLposRows] = useState([]);
  const [lposLoading, setLposLoading] = useState(false);
  const [selectedLpoMasterId, setSelectedLpoMasterId] = useState('');
  const [grnsRows, setGrnsRows] = useState([]);
  const [grnsLoading, setGrnsLoading] = useState(false);
  const [selectedGrnId, setSelectedGrnId] = useState('');
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const docLoadSeq = useRef(0);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [productsLoadError, setProductsLoadError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState('');
  const [lineEntryError, setLineEntryError] = useState('');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const productPickerSearchRef = useRef(null);
  const [productComboQuery, setProductComboQuery] = useState('');
  const [productComboOpen, setProductComboOpen] = useState(false);
  const productComboRef = useRef(null);
  const [productCodeComboQuery, setProductCodeComboQuery] = useState('');
  const [productCodeComboOpen, setProductCodeComboOpen] = useState(false);
  const productCodeComboRef = useRef(null);
  const [productDescComboQuery, setProductDescComboQuery] = useState('');
  const [productDescComboOpen, setProductDescComboOpen] = useState(false);
  const productDescComboRef = useRef(null);
  const [supplierComboQuery, setSupplierComboQuery] = useState('');
  const [supplierComboOpen, setSupplierComboOpen] = useState(false);
  const supplierComboRef = useRef(null);

  const primary = colors.primary?.main || '#790728';

  const liveEntry = useMemo(() => normalizeLine(entryLine), [entryLine]);

  const totals = useMemo(() => {
    const summary = lineRows.reduce(
      (acc, row) => {
        acc.subTotal += num(row.subTotal);
        acc.totalAmount += num(row.total);
        acc.tax += num(row.vatAmt);
        acc.discAmt += num(row.discAmt);
        acc.discPct += num(row.discPct);
        acc.vatPct += num(row.vatPct);
        return acc;
      },
      {
        subTotal: 0,
        totalAmount: 0,
        tax: 0,
        discAmt: 0,
        discPct: 0,
        vatPct: 0,
      },
    );

    const count = Math.max(lineRows.length, 1);
    return {
      subTotal: money(summary.subTotal),
      totalAmount: money(summary.totalAmount),
      tax: money(summary.tax),
      discAmt: money(summary.discAmt),
      discPct: (summary.discPct / count).toFixed(2),
      vatPct: (summary.vatPct / count).toFixed(2),
      roundOff: '0.00',
      netAmount: money(summary.totalAmount),
    };
  }, [lineRows]);

  const gridTotals = useMemo(
    () => ({
      qtySum: lineRows.reduce((s, r) => s + num(r.qty), 0),
      unitPriceSum: lineRows.reduce((s, r) => s + (num(r.actualCost) > 0 ? num(r.actualCost) : num(r.sellingPrice)), 0),
      discountSum: lineRows.reduce((s, r) => s + num(r.discAmt), 0),
      subSum: lineRows.reduce((s, r) => s + num(r.subTotal), 0),
      taxSum: lineRows.reduce((s, r) => s + num(r.vatAmt), 0),
      lineTotalSum: lineRows.reduce((s, r) => s + num(r.total), 0),
    }),
    [lineRows],
  );

  const purchaseTableTotals = useMemo(
    () => [
      ['Items', String(lineRows.length)],
      ['Qty Total', money(gridTotals.qtySum)],
      ['Unit Price Sum', money(gridTotals.unitPriceSum)],
      ['Line Discount', money(gridTotals.discountSum)],
      ['Sub Total', money(gridTotals.subSum)],
      ['Tax Total', money(gridTotals.taxSum)],
      ['Header Disc', '0.00'],
      ['Net Amount', money(gridTotals.lineTotalSum), true],
    ],
    [lineRows.length, gridTotals],
  );

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of productsCatalog) {
      m.set(Number(p.productId), p);
    }
    return m;
  }, [productsCatalog]);

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

  const lpoDropdownOptions = useMemo(
    () => [
      {
        value: '',
        label: !branchId ? '— Branch —' : lposLoading ? 'Loading LPO…' : '— Local purchase order —',
      },
      ...lposRows.map((r) => ({
        value: String(r.lpoMasterId),
        label: `${r.lpoNo || r.lpoMasterId} · ${r.lpoAmount ?? ''}`,
      })),
    ],
    [branchId, lposLoading, lposRows],
  );

  const grnDropdownOptions = useMemo(
    () => [
      {
        value: '',
        label: !branchId ? '— Branch —' : grnsLoading ? 'Loading GRN…' : '— Goods receipt (GRN) —',
      },
      ...grnsRows.map((r) => ({
        value: String(r.grnId),
        label: `${r.grnNo || r.grnId} · ${r.invoiceAmount ?? ''}`,
      })),
    ],
    [branchId, grnsLoading, grnsRows],
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

  const selectedSupplierDisplay = useMemo(() => {
    if (!supplierId) return '';
    const supplier = suppliers.find((s) => String(s.supplierId) === String(supplierId));
    if (!supplier) return String(supplierId);
    return `${supplier.supplierCode || supplier.supplierId} — ${supplier.supplierName || ''}`.replace(/ — $/, '');
  }, [supplierId, suppliers]);

  const filteredSuppliers = useMemo(() => {
    const q = supplierComboQuery.trim().toLowerCase();
    const rows = q
      ? suppliers.filter((s) =>
          String(s.supplierCode || '').toLowerCase().includes(q) ||
          String(s.supplierName || '').toLowerCase().includes(q) ||
          String(s.supplierId || '').toLowerCase().includes(q)
        )
      : suppliers;
    return rows.slice(0, 20);
  }, [suppliers, supplierComboQuery]);

  const productSelectOptions = useMemo(() => {
    const base = [{ value: '', label: !branchId ? '— Branch —' : '— Product —' }];
    for (const p of productsCatalog) {
      base.push({
        value: String(p.productId),
        label: `${p.productCode || p.productId} — ${(p.shortName || p.productName || '').slice(0, 34)}`,
      });
    }
    return base;
  }, [productsCatalog, branchId]);

  const productSelectOptionsWithLine = useMemo(() => {
    const pid = liveEntry.productId ? String(liveEntry.productId) : '';
    if (!pid || productSelectOptions.some((o) => o.value === pid)) return productSelectOptions;
    return [
      ...productSelectOptions,
      {
        value: pid,
        label: `${liveEntry.productCode || pid} — ${(liveEntry.shortDescription || '').slice(0, 28)}`,
      },
    ];
  }, [productSelectOptions, liveEntry.productId, liveEntry.productCode, liveEntry.shortDescription]);

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

  const selectedProductDisplay = useMemo(() => {
    if (!liveEntry.productId) return '';
    const p = productById.get(Number(liveEntry.productId));
    if (p) return `${p.productCode || ''} — ${(p.shortName || p.productName || '').trim()}`.replace(/^ — /, '');
    return liveEntry.productCode || String(liveEntry.productId);
  }, [liveEntry.productId, liveEntry.productCode, productById]);

  const comboFilteredProducts = useMemo(() => {
    const q = productComboQuery.trim().toLowerCase();
    if (!q) return pickerProducts.slice(0, 15);
    return pickerProducts.filter((p) =>
      String(p.barCode || '').toLowerCase().includes(q) ||
      String(p.shortDescription || '').toLowerCase().includes(q)
    ).slice(0, 15);
  }, [pickerProducts, productComboQuery]);

  const selectedProductCodeDisplay = useMemo(() => {
    if (!liveEntry.productId) return '';
    const p = productById.get(Number(liveEntry.productId));
    return p?.productCode || liveEntry.productCode || String(liveEntry.productId);
  }, [liveEntry.productId, liveEntry.productCode, productById]);

  const comboFilteredProductCodes = useMemo(() => {
    const q = productCodeComboQuery.trim().toLowerCase();
    if (!q) return pickerProducts.slice(0, 15);
    return pickerProducts.filter((p) =>
      String(p.barCode || '').toLowerCase().includes(q) ||
      String(p.shortDescription || '').toLowerCase().includes(q)
    ).slice(0, 15);
  }, [pickerProducts, productCodeComboQuery]);

  const comboFilteredProductDescriptions = useMemo(() => {
    const q = productDescComboQuery.trim().toLowerCase();
    if (!q) return pickerProducts.slice(0, 15);
    return pickerProducts.filter((p) =>
      String(p.shortDescription || '').toLowerCase().includes(q) ||
      String(p.barCode || '').toLowerCase().includes(q)
    ).slice(0, 15);
  }, [pickerProducts, productDescComboQuery]);

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
  }, [location.key]);

  useEffect(() => {
    const sid = location.state?.selectSupplierId;
    if (sid == null || sid === '') return;
    setSupplierId(String(sid));
    navigate('.', { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    if (!branchId) {
      setLposRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLposLoading(true);
      try {
        const { data } = await purchaseEntryApi.listLposForPurchase({
          branchId: Number(branchId),
          limit: 200,
        });
        if (cancelled) return;
        setLposRows(data?.lpos || []);
      } catch {
        if (!cancelled) setLposRows([]);
      } finally {
        if (!cancelled) setLposLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setGrnsRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setGrnsLoading(true);
      try {
        const { data } = await purchaseEntryApi.listGrnsForPurchase({
          branchId: Number(branchId),
          limit: 200,
        });
        if (cancelled) return;
        setGrnsRows(data?.grns || []);
      } catch {
        if (!cancelled) setGrnsRows([]);
      } finally {
        if (!cancelled) setGrnsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

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

  const handleLpoChange = useCallback(
    async (v) => {
      const id = String(v || '').trim();
      setSelectedLpoMasterId(id);
      setDocumentError('');
      if (!id) {
        if (!selectedGrnId) {
          setLineRows([]);
        }
        return;
      }
      setSelectedGrnId('');
      const seq = ++docLoadSeq.current;
      setDocumentLoading(true);
      try {
        const { data } = await purchaseEntryApi.getLpoForPurchase(id);
        if (seq !== docLoadSeq.current) return;
        const m = data?.lpo;
        const lines = data?.lines || [];
        if (!m) throw new Error('Invalid LPO response');
        setLineRows(lines.map((l) => mapLpoLineToPurchaseLine(l)));
        const d = m.lpoDate != null ? String(m.lpoDate).slice(0, 10) : '';
        setDoc((prev) => ({
          ...prev,
          purchaseNo: prev.purchaseNo || m.lpoNo || '',
          purchaseDate: d || prev.purchaseDate,
        }));
        setSelectedRows(new Set());
        setEditingRowIndex(null);
        setEntryLine(LINE_INITIAL);
      } catch (e) {
        if (seq !== docLoadSeq.current) return;
        setDocumentError(e.response?.data?.message || e.message || 'Could not load LPO');
      } finally {
        if (seq === docLoadSeq.current) setDocumentLoading(false);
      }
    },
    [selectedGrnId],
  );

  const handleGrnChange = useCallback(
    async (v) => {
      const id = String(v || '').trim();
      setSelectedGrnId(id);
      setDocumentError('');
      if (!id) {
        if (!selectedLpoMasterId) {
          setLineRows([]);
        }
        return;
      }
      setSelectedLpoMasterId('');
      const seq = ++docLoadSeq.current;
      setDocumentLoading(true);
      try {
        const { data } = await purchaseEntryApi.getGrnForPurchase(id);
        if (seq !== docLoadSeq.current) return;
        const g = data?.grn;
        const lines = data?.lines || [];
        if (!g) throw new Error('Invalid GRN response');
        setLineRows(lines.map((l) => mapGrnLineToPurchaseLine(l)));
        const d = g.grnDate != null ? String(g.grnDate).slice(0, 10) : '';
        setDoc((prev) => ({
          ...prev,
          purchaseNo: prev.purchaseNo || g.grnNo || '',
          purchaseDate: d || prev.purchaseDate,
        }));
        setSelectedRows(new Set());
        setEditingRowIndex(null);
        setEntryLine(LINE_INITIAL);
      } catch (e) {
        if (seq !== docLoadSeq.current) return;
        setDocumentError(e.response?.data?.message || e.message || 'Could not load GRN');
      } finally {
        if (seq === docLoadSeq.current) setDocumentLoading(false);
      }
    },
    [selectedLpoMasterId],
  );

  const handleSavePurchase = useCallback(async () => {
    setSaveError('');
    setSaveOk('');
    if (!branchId) {
      setSaveError('Select a branch before saving.');
      return;
    }
    if (!supplierId) {
      setSaveError('Select a supplier before saving.');
      return;
    }
    if (!lineRows.length) {
      setSaveError('Add at least one line.');
      return;
    }
    const missingPid = lineRows.some((r) => !r.productId || Number(r.productId) < 1);
    if (missingPid) {
      setSaveError('Each line needs a product (pick from the Product dropdown or load an LPO / GRN).');
      return;
    }
    const payload = buildPurchasePayload({
      branchId,
      supplierId,
      grnId: selectedGrnId,
      lpoMasterId: selectedLpoMasterId,
      doc,
      paymentInfo,
      totals,
      lineRows,
    });
    setSaveLoading(true);
    try {
      const { data } = await purchaseEntryApi.createPurchase(payload);
      setSaveOk(`Saved purchase #${data.purchaseNo} (id ${data.purchaseId}).`);
      setDoc((prev) => ({
        ...prev,
        purchaseNo: data.purchaseNo != null ? String(data.purchaseNo) : prev.purchaseNo,
        invoiceAmount: data.invoiceAmount != null ? String(data.invoiceAmount) : prev.invoiceAmount,
      }));
    } catch (e) {
      setSaveError(e.response?.data?.message || e.message || 'Save failed');
    } finally {
      setSaveLoading(false);
    }
  }, [branchId, supplierId, lineRows, doc, paymentInfo, totals, selectedGrnId, selectedLpoMasterId]);

  useEffect(() => {
    if (!productPickerOpen) return;
    const t = window.setTimeout(() => productPickerSearchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [productPickerOpen]);

  useEffect(() => {
    if (!productComboOpen && !productCodeComboOpen && !productDescComboOpen && !supplierComboOpen) return;
    const handleClick = (e) => {
      if (productComboRef.current && !productComboRef.current.contains(e.target)) {
        setProductComboOpen(false);
      }
      if (productCodeComboRef.current && !productCodeComboRef.current.contains(e.target)) {
        setProductCodeComboOpen(false);
      }
      if (productDescComboRef.current && !productDescComboRef.current.contains(e.target)) {
        setProductDescComboOpen(false);
      }
      if (supplierComboRef.current && !supplierComboRef.current.contains(e.target)) {
        setSupplierComboOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [productComboOpen, productCodeComboOpen, productDescComboOpen, supplierComboOpen]);

  const updateDoc = (key, value) => setDoc((prev) => ({ ...prev, [key]: value }));

  const mergeEntryLineAndCalc = useCallback((patch) => {
    setEntryLine((prev) => {
      const next = { ...prev, ...patch };
      const computed = computeLine(next);
      return { ...next, subTotal: computed.subTotal, vatAmt: computed.vatAmt, total: computed.total };
    });
    setLineEntryError('');
  }, []);

  const applyProductSelection = useCallback(
    (rawId) => {
      const id = String(rawId || '').trim();
      if (!id) {
        setEntryLine(LINE_INITIAL);
        setLineEntryError('');
        return;
      }
      const p = productById.get(Number(id));
      setEntryLine((prev) => {
        if (!p) {
          const next = { ...prev, productId: id };
          const computed = computeLine(next);
          return { ...next, ...computed };
        }
        const last =
          p.lastPurchaseCost != null && Number.isFinite(Number(p.lastPurchaseCost)) && Number(p.lastPurchaseCost) > 0
            ? String(p.lastPurchaseCost)
            : '';
        const qtyNext = num(prev.qty) > 0 ? prev.qty : '1';
        const next = {
          ...prev,
          productId: id,
          productCode: p.productCode || '',
          shortDescription: (p.shortName || p.productName || '').trim(),
          packetDetails: (p.unitName && String(p.unitName).trim()) || 'Pcs',
          lastPurchCost: last || prev.lastPurchCost,
          qty: qtyNext,
          focQty: prev.focQty === '' ? '0' : prev.focQty,
          actualCost: last || prev.actualCost,
          sellingPrice: last || prev.sellingPrice,
        };
        const computed = computeLine(next);
        return { ...next, ...computed };
      });
      setLineEntryError('');
      focusPurchaseLineQty();
    },
    [productById],
  );

  const openProductPicker = useCallback(() => {
    if (!branchId) {
      setProductsLoadError('Select a branch first');
      setProductPickerSearch('');
      setProductPickerOpen(true);
      return;
    }
    setProductsLoadError('');
    setProductPickerSearch('');
    setProductPickerOpen(true);
  }, [branchId]);

  const applyPickedProductFromPicker = useCallback(
    (p) => {
      setProductPickerOpen(false);
      setProductPickerSearch('');
      applyProductSelection(String(p.productId));
    },
    [applyProductSelection],
  );

  const handleSaveOrUpdate = useCallback(() => {
    const normalized = normalizeLine(entryLine);
    if (!normalized.productId || Number(normalized.productId) < 1) {
      setLineEntryError('Choose a product for this line.');
      return;
    }
    if (num(normalized.qty) <= 0) {
      setLineEntryError('Enter a quantity greater than 0.');
      return;
    }
    if (num(normalized.actualCost) <= 0 && num(normalized.sellingPrice) <= 0) {
      setLineEntryError('Enter unit cost (or selling column) so the line amount can be calculated.');
      return;
    }
    setLineEntryError('');
    if (editingRowIndex !== null) {
      setLineRows((prev) => prev.map((row, i) => (i === editingRowIndex ? normalized : row)));
      setEditingRowIndex(null);
    } else {
      setLineRows((prev) => [...prev, normalized]);
    }
    setEntryLine(LINE_INITIAL);
  }, [entryLine, editingRowIndex]);

  const startEditingRow = useCallback((index) => {
    setEditingRowIndex(index);
    setEntryLine({ ...lineRows[index] });
    setLineEntryError('');
  }, [lineRows]);

  const cancelLineForm = useCallback(() => {
    setEditingRowIndex(null);
    setEntryLine(LINE_INITIAL);
    setLineEntryError('');
  }, []);

  const deleteRow = useCallback((index) => {
    setLineRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
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
      setEntryLine(LINE_INITIAL);
    } else if (editingRowIndex !== null && editingRowIndex > index) {
      setEditingRowIndex((i) => i - 1);
    }
  }, [editingRowIndex]);

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
      setEntryLine(LINE_INITIAL);
    } else if (editingRowIndex !== null) {
      setEditingRowIndex(editingRowIndex - [...toDelete].filter((i) => i < editingRowIndex).length);
    }
  }, [selectedRows, editingRowIndex]);

  const resetPurchase = () => {
    setDoc(DOC_INITIAL);
    setPaymentInfo(PAYMENT_INITIAL);
    setEntryLine(LINE_INITIAL);
    setLineRows([]);
    setEditingRowIndex(null);
    setSelectedRows(new Set());
    setSelectedLine(null);
    setSelectedLpoMasterId('');
    setSelectedGrnId('');
    setSaveError('');
    setSaveOk('');
    setDocumentError('');
    setLineEntryError('');
    setProductPickerOpen(false);
    setProductPickerSearch('');
  };

  const tableBodyRows = lineRows.map((line, index) => {
    const dim = editingRowIndex === index;
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
      dimCell(line.ownRef || '—', dim),
      dimCell(line.supRef || '—', dim),
      dimCell(line.productCode || '—', dim),
      dimCell(line.shortDescription || '—', dim),
      dimCell(line.packetDetails || '—', dim),
      dimCell(money(line.lastPurchCost), dim),
      dimCell(String(line.lpoQty || '0'), dim),
      dimCell(String(line.qty || '0'), dim),
      dimCell(String(line.focQty || '0'), dim),
      dimCell(money(line.actualCost), dim),
      dimCell(money(line.sellingPrice), dim),
      dimCell(String(line.discPct || '0'), dim),
      dimCell(money(line.discAmt), dim),
      dimCell(money(line.subTotal), dim),
      dimCell(String(line.vatPct || '0'), dim),
      dimCell(money(line.vatAmt), dim),
      dimCell(money(line.total), dim),
      <div key={`act-${index}`} className={`flex items-center justify-center gap-1.5 ${dim ? 'pointer-events-none opacity-45' : ''}`}>
        <button type="button" className="pur-act" onClick={() => setSelectedLine(line)} aria-label="View line">
          <img src={ViewActionIcon} alt="" className="h-7 w-7" />
        </button>
        <button type="button" className="pur-act" onClick={() => startEditingRow(index)} aria-label="Edit line">
          <img src={EditActionIcon} alt="" className="h-7 w-7" />
        </button>
        <button type="button" className="pur-act" onClick={() => setPendingDelete({ mode: 'single', idx: index })} aria-label="Delete line">
          <img src={DeleteActionIcon} alt="" className="h-7 w-7" />
        </button>
      </div>,
    ];
  });


  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        .pur-root {
          --pr: ${primary};
          --bd: #e5e5e5;
          --txt: #171717;
          --muted: #737373;
          --soft: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .pur-btn:hover { border-color: #d4d4d4; background: var(--soft); color: var(--txt); }
        .pur-lbl {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .pur-summary-card {
          border-radius: 10px;
          border: 1px solid #e7e5e4;
          background: linear-gradient(165deg, #fafaf9 0%, #ffffff 48%, #fafaf9 100%);
          box-shadow: 0 1px 2px rgba(28, 25, 23, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          overflow: hidden;
        }
        .pur-summary-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          padding: 7px 12px;
          min-width: 0;
        }
        .pur-summary-row + .pur-summary-row {
          border-top: 1px solid #f5f5f4;
        }
        .pur-summary-row-dense {
          padding-top: 5px;
          padding-bottom: 5px;
        }
        .pur-summary-label {
          font-size: 11px;
          font-weight: 600;
          color: #57534e;
          letter-spacing: 0.01em;
          line-height: 1.25;
        }
        .pur-summary-value {
          font-size: 13px;
          font-weight: 700;
          color: #1c1917;
          font-variant-numeric: tabular-nums;
          text-align: right;
          letter-spacing: -0.02em;
        }
        .pur-summary-value-sm {
          font-size: 12px;
          font-weight: 600;
        }
        .pur-summary-pair-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border-top: 1px solid #f5f5f4;
        }
        .pur-summary-pair-grid .pur-summary-row {
          border-top: none;
        }
        .pur-summary-pair-grid .pur-summary-row:first-child {
          border-right: 1px solid #f5f5f4;
        }
        .pur-summary-net {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
          padding: 11px 12px 12px;
          border-top: 1px solid rgba(121, 7, 40, 0.18);
          background: linear-gradient(180deg, rgba(121, 7, 40, 0.07) 0%, rgba(121, 7, 40, 0.025) 100%);
        }
        .pur-summary-net .pur-summary-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--pr);
        }
        .pur-summary-net .pur-summary-value {
          font-size: 15px;
          font-weight: 800;
          color: var(--pr);
        }
        .pur-compact-card {
          border: 1px solid var(--bd);
          border-radius: 8px;
          background: #fff;
          padding: 10px;
        }
        .pur-posting-card {
          padding: 8px;
        }
        .pur-payment-toggle {
          min-height: 32px;
          display: flex;
          align-items: center;
          border: 1px solid var(--bd);
          border-radius: 6px;
          background: var(--soft);
          padding: 4px 8px;
        }
        .pur-act {
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
        .pur-act:hover { background: var(--soft); opacity: 1; }
        .pur-entry-bar-input {
          box-sizing: border-box;
          height: 26px;
          min-height: 26px;
          border-radius: 3px;
          border: 1px solid #d4d4d4;
          background: #fff;
          padding: 0 6px;
          font-size: 10px;
          outline: none;
          width: 100%;
        }
        .pur-entry-bar-input:focus { border-color: #a3a3a3; }
        .pur-entry-bar-input[readonly] { background: #f5f5f5; color: #737373; }
        .pur-del {
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
        .pur-del:hover { border-color: #fca5a5; color: #b91c1c; background: #fef2f2; }
        .pur-tbl, .pur-tbl > div { overflow: visible !important; }
        .pur-tbl thead th { position: sticky; top: 0; z-index: 2; }
        .pur-tbl tbody tr:hover td { background-color: var(--soft) !important; }
      `}</style>

      <div className="pur-root flex min-h-0 flex-1 flex-col gap-3">

        {/* Row 1: Heading + action buttons */}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>PURCHASE</h1>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
              <img src={EditIcon} alt="" className="h-3 w-3" /> Edit
            </button>
            <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition" onClick={resetPurchase}>
              <img src={NewPurchaseIcon} alt="" className="h-3 w-3" /> New
            </button>
            <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
              <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
            </button>
            <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
              <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
            </button>
            <button
              type="button"
              className="pur-btn inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 opacity-50 transition"
              disabled
              title="Posting is disabled — save only for now."
            >
              <img src={PostIcon} alt="" className="h-3 w-3" /> Post
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: primary, borderColor: primary }}
              disabled={saveLoading || documentLoading || !branchId}
              onClick={handleSavePurchase}
            >
              {saveLoading ? (
                'Saving...'
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </>
              )}
            </button>
            {selectedRows.size > 0 && (
              <button type="button" className="pur-del" onClick={() => setPendingDelete({ mode: 'bulk' })}>
                <img src={DeleteActionIcon} alt="" className="h-3 w-3" /> Delete ({selectedRows.size})
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Branch / LPO / GRN — same control height as line entry */}
        <div className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-2">
          <DropdownInput
            label="Branch"
            options={branchDropdownOptions}
            value={branchId}
            onChange={(v) => {
              setBranchId(v);
              setSelectedLpoMasterId('');
              setSelectedGrnId('');
            }}
            widthPx={150}
            heightPx={PURCHASE_LINE_ENTRY_H}
            labelClassName={PURCHASE_LINE_ENTRY_LBL}
            className={PURCHASE_LINE_ENTRY_INP}
            disabled={refsLoading}
          />
          <DropdownInput
            label="LPO"
            options={lpoDropdownOptions}
            value={selectedLpoMasterId}
            onChange={handleLpoChange}
            widthPx={200}
            heightPx={PURCHASE_LINE_ENTRY_H}
            labelClassName={PURCHASE_LINE_ENTRY_LBL}
            className={PURCHASE_LINE_ENTRY_INP}
            disabled={!branchId || lposLoading || documentLoading}
          />
          <DropdownInput
            label="GRN"
            options={grnDropdownOptions}
            value={selectedGrnId}
            onChange={handleGrnChange}
            widthPx={220}
            heightPx={PURCHASE_LINE_ENTRY_H}
            labelClassName={PURCHASE_LINE_ENTRY_LBL}
            className={PURCHASE_LINE_ENTRY_INP}
            disabled={!branchId || grnsLoading || documentLoading}
          />
        </div>

        {/* Status messages */}
        {(refsError || documentError || saveError) ? (
          <p className="shrink-0 text-[11px] text-red-600">{saveError || documentError || refsError}</p>
        ) : null}
        {saveOk ? <p className="shrink-0 text-[11px] text-emerald-700">{saveOk}</p> : null}
        {lineEntryError ? <p className="shrink-0 text-[11px] text-red-600">{lineEntryError}</p> : null}
        {documentLoading ? <p className="shrink-0 text-[11px] text-neutral-500">Loading document…</p> : null}
        {productsLoadError && branchId ? (
          <p className="shrink-0 text-[11px] text-amber-800">{productsLoadError}</p>
        ) : null}
        {!suppliersLoading && suppliers.length === 0 ? (
          <p className="shrink-0 text-[11px] text-amber-800">
            No suppliers yet —{' '}
            <Link to="/data-entry/supplier-entry" className="font-semibold text-amber-900 underline underline-offset-2">
              add a supplier
            </Link>{' '}
            before saving purchases.
          </p>
        ) : null}

        {/* Entry form bar — full width, wraps to viewport; all controls use height 26px */}
        <div className="flex min-w-0 shrink-0 flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
              {/* Product — inline combobox with search icon inside */}
              <div className="shrink-0" ref={productComboRef}>
                <label className={`mb-0.5 block ${PURCHASE_LINE_ENTRY_LBL}`}>Product</label>
                <div className="relative">
                  <img
                    src={SearchIcon}
                    alt=""
                    className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
                  />
                  <input
                    type="text"
                    className="w-[190px] rounded border border-gray-200 bg-white pl-6 pr-2 text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                    style={{ height: PURCHASE_LINE_ENTRY_H, minHeight: PURCHASE_LINE_ENTRY_H, boxSizing: 'border-box' }}
                    placeholder="Search product…"
                    value={productComboOpen ? productComboQuery : selectedProductDisplay}
                    onFocus={() => { setProductComboOpen(true); setProductComboQuery(''); }}
                    onChange={(e) => setProductComboQuery(e.target.value)}
                  />
                  {productComboOpen && (
                    <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {!branchId ? (
                        <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                      ) : comboFilteredProducts.length === 0 ? (
                        <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                      ) : (
                        comboFilteredProducts.map((p) => (
                          <button
                            key={p.productId}
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyProductSelection(String(p.productId));
                              setProductComboOpen(false);
                              setProductComboQuery('');
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
              {/* Product code — searchable picker synced with Product */}
              <div className="shrink-0" ref={productCodeComboRef}>
                <label className={`mb-0.5 block ${PURCHASE_LINE_ENTRY_LBL}`}>Product code</label>
                <div className="relative">
                  <img
                    src={SearchIcon}
                    alt=""
                    className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
                  />
                  <input
                    type="text"
                    className="w-[112px] rounded border border-gray-200 bg-white pl-6 pr-2 font-mono text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                    style={{ height: PURCHASE_LINE_ENTRY_H, minHeight: PURCHASE_LINE_ENTRY_H, boxSizing: 'border-box' }}
                    placeholder="Code…"
                    value={productCodeComboOpen ? productCodeComboQuery : selectedProductCodeDisplay}
                    onFocus={() => { setProductCodeComboOpen(true); setProductCodeComboQuery(''); }}
                    onChange={(e) => setProductCodeComboQuery(e.target.value)}
                  />
                  {productCodeComboOpen && (
                    <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {!branchId ? (
                        <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                      ) : comboFilteredProductCodes.length === 0 ? (
                        <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                      ) : (
                        comboFilteredProductCodes.map((p) => (
                          <button
                            key={p.productId}
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyProductSelection(String(p.productId));
                              setProductCodeComboOpen(false);
                              setProductCodeComboQuery('');
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
              {/* Description — searchable picker synced with Product */}
              <div className="shrink-0" ref={productDescComboRef}>
                <label className={`mb-0.5 block ${PURCHASE_LINE_ENTRY_LBL}`}>Description</label>
                <div className="relative">
                  <img
                    src={SearchIcon}
                    alt=""
                    className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
                  />
                  <input
                    type="text"
                    className="w-[150px] rounded border border-gray-200 bg-white pl-6 pr-2 text-[8px] outline-none placeholder:text-[11px] focus:border-gray-400"
                    style={{ height: PURCHASE_LINE_ENTRY_H, minHeight: PURCHASE_LINE_ENTRY_H, boxSizing: 'border-box' }}
                    placeholder="Search description…"
                    value={productDescComboOpen ? productDescComboQuery : liveEntry.shortDescription}
                    onFocus={() => { setProductDescComboOpen(true); setProductDescComboQuery(''); }}
                    onChange={(e) => setProductDescComboQuery(e.target.value)}
                  />
                  {productDescComboOpen && (
                    <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {!branchId ? (
                        <p className="px-3 py-2 text-[10px] text-gray-400">Select a branch first</p>
                      ) : comboFilteredProductDescriptions.length === 0 ? (
                        <p className="px-3 py-2 text-[10px] text-gray-400">No products found</p>
                      ) : (
                        comboFilteredProductDescriptions.map((p) => (
                          <button
                            key={p.productId}
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyProductSelection(String(p.productId));
                              setProductDescComboOpen(false);
                              setProductDescComboQuery('');
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
              {/* Own Ref */}
              <div className="shrink-0">
                <SubInputField
                  label="Own Ref #"
                  widthPx={86}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.ownRef}
                  onChange={(e) => mergeEntryLineAndCalc({ ownRef: e.target.value })}
                />
              </div>
              {/* Sup Ref */}
              <div className="shrink-0">
                <SubInputField
                  label="Sup Ref"
                  widthPx={86}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.supRef}
                  onChange={(e) => mergeEntryLineAndCalc({ supRef: e.target.value })}
                />
              </div>
              {/* Packet */}
              <div className="shrink-0">
                <DropdownInput
                  label="Packet"
                  widthPx={82}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.packetDetails}
                  onChange={(value) => mergeEntryLineAndCalc({ packetDetails: value })}
                  options={['Pcs', 'Box', 'Tray']}
                />
              </div>
              {/* Last cost */}
              <div className="shrink-0">
                <SubInputField
                  label="Last cost"
                  widthPx={82}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.lastPurchCost}
                  onChange={(e) => mergeEntryLineAndCalc({ lastPurchCost: e.target.value })}
                />
              </div>
              {/* LPO Qty */}
              <div className="shrink-0">
                <SubInputField
                  label="LPO"
                  widthPx={70}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.lpoQty}
                  onChange={(e) => mergeEntryLineAndCalc({ lpoQty: e.target.value })}
                />
              </div>
              {/* Qty */}
              <div className="shrink-0">
                <SubInputField
                  id={PURCHASE_LINE_QTY_ID}
                  label="Qty"
                  widthPx={70}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.qty}
                  onChange={(e) => mergeEntryLineAndCalc({ qty: e.target.value })}
                  onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); focusPurchaseLineTotal(); }}
                />
              </div>
              {/* FOC */}
              <div className="shrink-0">
                <SubInputField
                  label="FOC"
                  widthPx={70}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.focQty}
                  onChange={(e) => mergeEntryLineAndCalc({ focQty: e.target.value })}
                />
              </div>
              {/* Act. cost */}
              <div className="shrink-0">
                <SubInputField
                  label="Act. cost"
                  widthPx={86}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.actualCost}
                  onChange={(e) => mergeEntryLineAndCalc({ actualCost: e.target.value })}
                />
              </div>
              {/* Sell */}
              <div className="shrink-0">
                <SubInputField
                  label="Sell"
                  widthPx={82}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.sellingPrice}
                  onChange={(e) => mergeEntryLineAndCalc({ sellingPrice: e.target.value })}
                />
              </div>
              <div className="flex shrink-0 flex-wrap items-end gap-2 px-0 py-0">
                {/* Disc % */}
                <SubInputField
                  label="Disc %"
                  widthPx={66}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.discPct}
                  onChange={(e) => mergeEntryLineAndCalc({ discPct: e.target.value })}
                />
                {/* Disc */}
                <SubInputField
                  label="Disc"
                  widthPx={78}
                  type="number"
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.discAmt}
                  onChange={(e) => mergeEntryLineAndCalc({ discAmt: e.target.value })}
                />
                {/* Sub (readonly) */}
                <SubInputField
                  label="Sub"
                  widthPx={86}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.subTotal}
                  readOnly
                  tabIndex={-1}
                />
                {/* VAT % */}
                <DropdownInput
                  label="VAT %"
                  widthPx={68}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.vatPct}
                  onChange={(value) => mergeEntryLineAndCalc({ vatPct: value })}
                  options={['0', '5', '10', '15']}
                />
                {/* VAT (readonly) */}
                <SubInputField
                  label="VAT"
                  widthPx={82}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.vatAmt}
                  readOnly
                  tabIndex={-1}
                />
                {/* Total (readonly) */}
                <SubInputField
                  id={PURCHASE_LINE_TOTAL_ID}
                  label="Total"
                  widthPx={90}
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={liveEntry.total}
                  readOnly
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); handleSaveOrUpdate(); }}
                />
              </div>
              {/* Add / Save + Cancel */}
              <div className="flex items-end gap-1">
                <button
                  type="button"
                  onClick={handleSaveOrUpdate}
                  className="inline-flex shrink-0 items-center justify-center rounded border px-3 text-[10px] font-semibold leading-none text-white"
                  style={{ backgroundColor: primary, borderColor: primary, height: PURCHASE_LINE_ENTRY_H, minHeight: PURCHASE_LINE_ENTRY_H }}
                >
                  {editingRowIndex !== null ? 'Save' : 'Add Line'}
                </button>
                {editingRowIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelLineForm}
                    className="inline-flex shrink-0 items-center justify-center rounded border border-gray-200 bg-white px-2.5 text-[10px] font-semibold leading-none text-gray-600 hover:bg-gray-50"
                    style={{ height: PURCHASE_LINE_ENTRY_H, minHeight: PURCHASE_LINE_ENTRY_H }}
                  >
                    Cancel
                  </button>
                )}
              </div>
        </div>

        {/* Row 3: Main content grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">

          {/* Left: line-item table */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200">
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <CommonTable
                className="pur-tbl"
                fitParentWidth
                stickyHeader
                hideOuterBorder
                truncateHeader
                headerOverflowAbbrevChars={3}
                truncateBody
                columnWidthPercents={PURCHASE_LINE_COL_PCT}
                headerFontSize="11px"
                bodyFontSize="13px"
                cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
                headers={PURCHASE_LINE_HEADERS}
                rows={tableBodyRows}
              />
            </div>
            <TableTotalsBar borderColor="#e5e5e5" items={purchaseTableTotals} />
          </div>

          {/* Right: invoice + summary/payment panel */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200 xl:min-w-0">
            {/* Document section — always visible at top */}
            <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-3 flex flex-col gap-2.5">
              <span className="pur-lbl">Purchase Details</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <SubInputField
                  label="Purchase #"
                  fullWidth
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={doc.purchaseNo}
                  onChange={(e) => updateDoc('purchaseNo', e.target.value)}
                />
                <SubInputField
                  label="Sup Inv#"
                  fullWidth
                  heightPx={PURCHASE_LINE_ENTRY_H}
                  labelClassName={PURCHASE_LINE_ENTRY_LBL}
                  className={PURCHASE_LINE_ENTRY_INP}
                  value={doc.supplierInvNo}
                  onChange={(e) => updateDoc('supplierInvNo', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="min-w-0 w-full max-w-full" ref={supplierComboRef}>
                  <label className={`mb-0.5 block ${PURCHASE_LINE_ENTRY_LBL}`}>Supplier</label>
                  <div className="relative">
                    <img
                      src={SearchIcon}
                      alt=""
                      className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-45"
                    />
                    <input
                      type="text"
                      className="box-border h-[26px] w-full rounded-md border border-slate-200 bg-white pl-7 pr-2 text-[10px] leading-normal text-gray-900 outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder={suppliersLoading ? 'Loading suppliers…' : 'Search supplier…'}
                      value={supplierComboOpen ? supplierComboQuery : selectedSupplierDisplay}
                      onFocus={() => {
                        if (suppliersLoading) return;
                        setSupplierComboOpen(true);
                        setSupplierComboQuery('');
                      }}
                      onChange={(e) => {
                        setSupplierComboQuery(e.target.value);
                        setSupplierComboOpen(true);
                      }}
                      disabled={suppliersLoading}
                    />
                    {supplierComboOpen && !suppliersLoading && (
                      <div className="absolute left-0 top-full z-50 mt-0.5 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {filteredSuppliers.length === 0 ? (
                          <p className="px-3 py-2 text-[11px] text-gray-400">No suppliers found</p>
                        ) : (
                          filteredSuppliers.map((s) => (
                            <button
                              key={s.supplierId}
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSupplierId(String(s.supplierId));
                                setSupplierComboOpen(false);
                                setSupplierComboQuery('');
                              }}
                            >
                              <span className="w-20 shrink-0 font-mono text-[10px] text-gray-900">{s.supplierCode || s.supplierId}</span>
                              <span className="min-w-0 flex-1 truncate text-[11px] text-gray-600">{s.supplierName || '—'}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  to="/data-entry/supplier-entry"
                  className="mt-0.5 self-start text-[11px] font-medium leading-tight text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                >
                  + New supplier
                </Link>
              </div>
              <div className="min-w-0 w-full max-w-full">
                <DatePickerInput
                  fullWidth
                  heightPx={34}
                  borderRadius={4}
                  placeholder="DD/MM/YYYY"
                  displayFontSize={10}
                  background="#fff"
                  dropdownInViewport
                  value={doc.purchaseDate}
                  onChange={(e) => updateDoc('purchaseDate', e.target.value)}
                />
              </div>
            </div>
            {/* Invoice amount */}
            <div className="shrink-0 border-b border-neutral-200 px-3 py-3 flex flex-col gap-2">
              <span className="pur-lbl">Invoice Summary</span>
              <SubInputField
                label="Invoice amount"
                fullWidth
                type="number"
                heightPx={PURCHASE_LINE_ENTRY_H}
                labelClassName={PURCHASE_LINE_ENTRY_LBL}
                className={PURCHASE_LINE_ENTRY_INP}
                value={doc.invoiceAmount}
                onChange={(e) => updateDoc('invoiceAmount', e.target.value)}
                title="Supplier invoice total for this purchase"
              />
            </div>
            <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
              <TabsBar
                fullWidth
                tabs={[
                  { id: 'summary', label: 'Summary' },
                  { id: 'payment', label: 'Payment' },
                ]}
                activeTab={rightTab}
                onChange={setRightTab}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {rightTab === 'summary' && (
                <div className="flex flex-col gap-2">
                  <span className="pur-lbl">Summary</span>
                  <div className="pur-summary-card" role="region" aria-label="Amount summary">
                    <div className="pur-summary-row">
                      <span className="pur-summary-label">Sub Total</span>
                      <span className="pur-summary-value">{totals.subTotal}</span>
                    </div>
                    <div className="pur-summary-pair-grid">
                      <div className="pur-summary-row pur-summary-row-dense">
                        <span className="pur-summary-label">Disc</span>
                        <span className="pur-summary-value pur-summary-value-sm">{totals.discAmt}</span>
                      </div>
                      <div className="pur-summary-row pur-summary-row-dense">
                        <span className="pur-summary-label">Disc %</span>
                        <span className="pur-summary-value pur-summary-value-sm">{totals.discPct}%</span>
                      </div>
                    </div>
                    <div className="pur-summary-row">
                      <span className="pur-summary-label">Total Amount</span>
                      <span className="pur-summary-value">{totals.totalAmount}</span>
                    </div>
                    <div className="pur-summary-pair-grid">
                      <div className="pur-summary-row pur-summary-row-dense">
                        <span className="pur-summary-label">Tax</span>
                        <span className="pur-summary-value pur-summary-value-sm">{totals.tax}</span>
                      </div>
                      <div className="pur-summary-row pur-summary-row-dense">
                        <span className="pur-summary-label">VAT %</span>
                        <span className="pur-summary-value pur-summary-value-sm">{totals.vatPct}%</span>
                      </div>
                    </div>
                    <div className="pur-summary-row pur-summary-row-dense">
                      <span className="pur-summary-label">Round Off</span>
                      <span className="pur-summary-value pur-summary-value-sm">{totals.roundOff}</span>
                    </div>
                    <div className="pur-summary-net">
                      <span className="pur-summary-label">Net Amount</span>
                      <span className="pur-summary-value">{totals.netAmount}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2">
                    <Switch checked={doc.bySupplier} onChange={(value) => updateDoc('bySupplier', value)} description="Group by supplier account" size="xs" />
                  </div>
                </div>
              )}

              {rightTab === 'payment' && (
                <div className="flex flex-col gap-3">
                  <span className="pur-lbl">Posting</span>
                  <div className="pur-compact-card pur-posting-card grid grid-cols-2 gap-x-2 gap-y-2.5">
                    <DropdownInput label="Entered by" fullWidth heightPx={PURCHASE_LINE_ENTRY_H} labelClassName={PURCHASE_LINE_ENTRY_LBL} className={PURCHASE_LINE_ENTRY_INP} value={doc.enteredBy} onChange={(value) => updateDoc('enteredBy', value)} options={['Admin', 'User 1', 'User 2']} />
                    <DropdownInput label="Payment mode" fullWidth heightPx={PURCHASE_LINE_ENTRY_H} labelClassName={PURCHASE_LINE_ENTRY_LBL} className={PURCHASE_LINE_ENTRY_INP} value={doc.paymentMode} onChange={(value) => updateDoc('paymentMode', value)} options={['Cash', 'Card', 'Bank Transfer', 'Credit']} />
                    <DropdownInput label="Account head" fullWidth heightPx={PURCHASE_LINE_ENTRY_H} labelClassName={PURCHASE_LINE_ENTRY_LBL} className={PURCHASE_LINE_ENTRY_INP} value={doc.accountHead} onChange={(value) => updateDoc('accountHead', value)} options={['General', 'Purchase A/C', 'Expenses A/C']} />
                    <div className="min-w-0 w-full max-w-full">
                      <label className={`mb-0.5 block ${PURCHASE_LINE_ENTRY_LBL}`}>Entered date</label>
                      <DatePickerInput
                        fullWidth
                        heightPx={PURCHASE_LINE_ENTRY_H}
                        borderRadius={4}
                        placeholder="DD/MM/YYYY"
                        displayFontSize={10}
                        background="#fff"
                        dropdownInViewport
                        value={doc.enteredDate}
                        onChange={(e) => updateDoc('enteredDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <span className="pur-lbl">Payment</span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
                    <SubInputField label="Payment no" fullWidth heightPx={PURCHASE_LINE_ENTRY_H} labelClassName={PURCHASE_LINE_ENTRY_LBL} className={PURCHASE_LINE_ENTRY_INP} value={paymentInfo.paymentNo} onChange={(e) => setPaymentInfo((prev) => ({ ...prev, paymentNo: e.target.value }))} />
                    <div className="pur-payment-toggle">
                      <Switch checked={paymentInfo.paymentNow} onChange={(value) => setPaymentInfo((prev) => ({ ...prev, paymentNow: value }))} description="Payment now" size="xs" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={PURCHASE_LINE_ENTRY_LBL}>Remark</label>
                    <textarea
                      value={paymentInfo.remark}
                      onChange={(e) => setPaymentInfo((prev) => ({ ...prev, remark: e.target.value }))}
                      rows={2}
                      className="box-border w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

        {productPickerOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm"
            onClick={() => {
              setProductPickerOpen(false);
              setProductPickerSearch('');
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pur-pp-title"
          >
            <div
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="h-1 w-full shrink-0"
                style={{
                  background: `linear-gradient(90deg,${primary} 0%,#85203E 35%,#923A53 65%,#C44972 100%)`,
                }}
              />
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 px-4 py-2.5">
                <h2 id="pur-pp-title" className="text-sm font-bold" style={{ color: primary }}>
                  Pick product
                </h2>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close"
                  onClick={() => {
                    setProductPickerOpen(false);
                    setProductPickerSearch('');
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="shrink-0 border-b border-stone-100 px-4 py-2.5">
                <div className="relative">
                  <img
                    src={SearchIcon}
                    alt=""
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50"
                  />
                  <input
                    ref={productPickerSearchRef}
                    type="search"
                    value={productPickerSearch}
                    onChange={(e) => setProductPickerSearch(e.target.value)}
                    placeholder="Search code or description…"
                    className="box-border w-full rounded-lg border border-stone-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-rose-900/40 sm:text-sm"
                  />
                </div>
                {(productsLoadError || !branchId) ? (
                  <p className="mt-2 text-[11px] text-amber-800">{!branchId ? 'Select a branch to load products.' : productsLoadError}</p>
                ) : null}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1 sm:px-2">
                {filteredPickerProducts.length === 0 ? (
                  <p className="px-2 py-8 text-center text-xs text-stone-500">
                    {!branchId
                      ? 'Choose a branch first.'
                      : pickerProducts.length === 0
                        ? 'No products for this branch.'
                        : 'No matches — try another search.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-stone-100">
                    {filteredPickerProducts.map((p) => (
                      <li key={p.productId}>
                        <button
                          type="button"
                          className="flex w-full gap-2 px-2 py-2 text-left text-[11px] hover:bg-rose-50/90 sm:gap-3 sm:text-xs"
                          onClick={() => applyPickedProductFromPicker(p)}
                        >
                          <span className="min-w-0 flex-1 font-mono text-stone-900">{p.barCode || '—'}</span>
                          <span className="min-w-0 flex-[1.6] text-stone-700">{p.shortDescription}</span>
                          <span className="shrink-0 tabular-nums text-stone-600" title="Last purchase cost">
                            {Number(p.lastPurchaseCost || 0).toFixed(2)}
                          </span>
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
          message={
            pendingDelete?.mode === 'bulk'
              ? `This will remove ${selectedRows.size} selected row(s). This action cannot be undone.`
              : 'This will remove the row from the purchase. This action cannot be undone.'
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            if (!pendingDelete) return;
            if (pendingDelete.mode === 'bulk') handleDeleteSelected();
            else deleteRow(pendingDelete.idx);
          }}
        />

        {selectedLine && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={() => setSelectedLine(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Row details"
          >
            <div
              className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-4 shadow-2xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold sm:text-base" style={{ color: primary }}>
                  Item details
                </h2>
                <button type="button" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedLine(null)} aria-label="Close details">
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ['Product id', selectedLine.productId || '—'],
                  ['Own Ref #', selectedLine.ownRef || '—'],
                  ['Sup Ref', selectedLine.supRef || '—'],
                  ['Product code', selectedLine.productCode || '—'],
                  ['Description', selectedLine.shortDescription || '—'],
                  ['Packet', selectedLine.packetDetails || '—'],
                  ['Last purch cost', money(selectedLine.lastPurchCost)],
                  ['LPO Qty', String(selectedLine.lpoQty || '0')],
                  ['Qty', String(selectedLine.qty || '0')],
                  ['FOC Qty', String(selectedLine.focQty || '0')],
                  ['Actual cost', money(selectedLine.actualCost)],
                  ['Selling price', money(selectedLine.sellingPrice)],
                  ['Disc %', String(selectedLine.discPct || '0')],
                  ['Disc amt', money(selectedLine.discAmt)],
                  ['Sub total', money(selectedLine.subTotal)],
                  ['VAT %', String(selectedLine.vatPct || '0')],
                  ['VAT amt', money(selectedLine.vatAmt)],
                  ['Total', money(selectedLine.total)],
                ].map(([label, value]) => (
                  <React.Fragment key={label}>
                    <div className="font-semibold text-gray-700">{label}</div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">{value}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
