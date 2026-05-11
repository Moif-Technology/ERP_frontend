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
  ' ',
];

function dimCell(content, dim) {
  if (!dim) return content;
  return <span className="opacity-45">{content}</span>;
}

/** One table cell wrapper so inputs respect column width in fixed layout */
function entryCell(node) {
  return <div className="pur-entry-cell min-w-0 max-w-full">{node}</div>;
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
      subSum: lineRows.reduce((s, r) => s + num(r.subTotal), 0),
      taxSum: lineRows.reduce((s, r) => s + num(r.vatAmt), 0),
      lineTotalSum: lineRows.reduce((s, r) => s + num(r.total), 0),
      vatPctSum: lineRows.reduce((s, r) => s + num(r.vatPct), 0),
    }),
    [lineRows],
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
      <div key={`act-${index}`} className={`flex items-center justify-center gap-0.5 sm:gap-1 ${dim ? 'pointer-events-none opacity-45' : ''}`}>
        <button type="button" className="pur-act" onClick={() => setSelectedLine(line)} aria-label="View line">
          <img src={ViewActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className="pur-act" onClick={() => startEditingRow(index)} aria-label="Edit line">
          <img src={EditActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className="pur-act" onClick={() => setPendingDelete({ mode: 'single', idx: index })} aria-label="Delete line">
          <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ];
  });

  const entryRow = useMemo(
    () => [
      entryCell(<span className="block text-center text-[10px] text-neutral-400" title="Select saved rows below"> </span>),
      entryCell(
        <span
          className="inline-flex h-[26px] w-full min-w-[1.25rem] items-center justify-center rounded border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-600"
          title={editingRowIndex !== null ? 'Editing this line' : 'New line'}
        >
          {editingRowIndex !== null ? `#${editingRowIndex + 1}` : '+'}
        </span>,
      ),
      entryCell(<SubInputField widthPx={40} value={liveEntry.ownRef} onChange={(e) => mergeEntryLineAndCalc({ ownRef: e.target.value })} />),
      entryCell(<SubInputField widthPx={40} value={liveEntry.supRef} onChange={(e) => mergeEntryLineAndCalc({ supRef: e.target.value })} />),
      entryCell(
        <div className="flex min-w-0 items-center gap-0.5">
          <button
            type="button"
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            title="Search products"
            onClick={openProductPicker}
          >
            <img src={SearchIcon} alt="" className="h-3 w-3 opacity-70" />
          </button>
          <div className="min-w-0 flex-1">
            <DropdownInput
              label=""
              widthPx={52}
              placeholder="—"
              value={liveEntry.productId}
              options={productSelectOptionsWithLine}
              onChange={(v) => applyProductSelection(v)}
            />
          </div>
        </div>,
      ),
      entryCell(
        <InputField widthPx={100} value={liveEntry.shortDescription} onChange={(e) => mergeEntryLineAndCalc({ shortDescription: e.target.value })} />,
      ),
      entryCell(
        <DropdownInput
          widthPx={52}
          value={liveEntry.packetDetails}
          onChange={(value) => mergeEntryLineAndCalc({ packetDetails: value })}
          options={['Pcs', 'Box', 'Tray']}
        />,
      ),
      entryCell(
        <SubInputField widthPx={48} type="number" value={liveEntry.lastPurchCost} onChange={(e) => mergeEntryLineAndCalc({ lastPurchCost: e.target.value })} />,
      ),
      entryCell(<SubInputField widthPx={40} type="number" value={liveEntry.lpoQty} onChange={(e) => mergeEntryLineAndCalc({ lpoQty: e.target.value })} />),
      entryCell(
        <SubInputField
          id={PURCHASE_LINE_QTY_ID}
          widthPx={36}
          type="number"
          value={liveEntry.qty}
          onChange={(e) => mergeEntryLineAndCalc({ qty: e.target.value })}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            focusPurchaseLineTotal();
          }}
        />,
      ),
      entryCell(<SubInputField widthPx={36} type="number" value={liveEntry.focQty} onChange={(e) => mergeEntryLineAndCalc({ focQty: e.target.value })} />),
      entryCell(
        <SubInputField widthPx={48} type="number" value={liveEntry.actualCost} onChange={(e) => mergeEntryLineAndCalc({ actualCost: e.target.value })} />,
      ),
      entryCell(
        <SubInputField widthPx={48} type="number" value={liveEntry.sellingPrice} onChange={(e) => mergeEntryLineAndCalc({ sellingPrice: e.target.value })} />,
      ),
      entryCell(<SubInputField widthPx={34} type="number" value={liveEntry.discPct} onChange={(e) => mergeEntryLineAndCalc({ discPct: e.target.value })} />),
      entryCell(<SubInputField widthPx={42} type="number" value={liveEntry.discAmt} onChange={(e) => mergeEntryLineAndCalc({ discAmt: e.target.value })} />),
      entryCell(<SubInputField widthPx={48} value={liveEntry.subTotal} readOnly tabIndex={-1} />),
      entryCell(
        <DropdownInput widthPx={44} value={liveEntry.vatPct} onChange={(value) => mergeEntryLineAndCalc({ vatPct: value })} options={['0', '5', '10', '15']} />,
      ),
      entryCell(<SubInputField widthPx={44} value={liveEntry.vatAmt} readOnly tabIndex={-1} />),
      entryCell(
        <SubInputField
          id={PURCHASE_LINE_TOTAL_ID}
          widthPx={48}
          value={liveEntry.total}
          readOnly
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            handleSaveOrUpdate();
          }}
        />,
      ),
      entryCell(
        <div className="flex flex-col items-stretch justify-center gap-0.5">
          <button type="button" className="pur-entry-add" onClick={handleSaveOrUpdate}>
            {editingRowIndex !== null ? 'Save' : 'Add'}
          </button>
          {editingRowIndex !== null && (
            <button type="button" className="pur-entry-cancel" onClick={cancelLineForm}>
              Cancel
            </button>
          )}
        </div>,
      ),
    ],
    [
      liveEntry,
      editingRowIndex,
      mergeEntryLineAndCalc,
      applyProductSelection,
      openProductPicker,
      handleSaveOrUpdate,
      cancelLineForm,
      productSelectOptionsWithLine,
    ],
  );

  const allTableRows = [entryRow, ...tableBodyRows];

  return (
    <div className="mb-2 mt-0 flex w-full min-w-0 flex-col px-1 sm:-mt-[14px] sm:mb-[8px] sm:-mx-[13px] sm:w-[calc(100%+26px)] sm:max-w-none sm:px-0">
      <style>{`
        .pur-page {
          --pr: ${primary};
          --bd: #e5e5e5;
          --txt: #171717;
          --muted: #737373;
          --soft: #fafafa;
          min-height: calc(100vh - 156px);
          min-height: calc(100dvh - 156px);
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .pur-card {
          background: #fff;
          border: 1px solid var(--bd);
          border-radius: 12px;
          min-height: 100%;
        }
        .pur-btn:hover { border-color: #d4d4d4; background: var(--soft); color: var(--txt); }
        .pur-tab {
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--muted);
        }
        .pur-tab:hover { color: var(--txt); }
        .pur-tab-on { color: var(--pr); border-bottom-color: var(--pr); font-weight: 600; }
        .pur-lbl {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .pur-summary-block {
          border: 1px solid var(--bd);
          border-radius: 8px;
          background: var(--soft);
          padding: 10px;
        }
        .pur-compact-card {
          border: 1px solid var(--bd);
          border-radius: 8px;
          background: #fff;
          padding: 10px;
        }
        .pur-act {
          padding: 4px;
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
        .pur-tbl tbody tr:first-child td {
          background: #f5f5f5 !important;
          border-bottom: 1px solid var(--bd) !important;
          vertical-align: middle;
        }
        .pur-entry-cell .flex.flex-col {
          width: 100%;
        }
        .pur-entry-cell .relative input,
        .pur-entry-cell input,
        .pur-entry-cell select {
          height: 26px !important;
          min-height: 26px !important;
          font-size: 10px !important;
        }
        .pur-entry-add {
          width: 100%;
          border: none;
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 10px;
          font-weight: 600;
          background: var(--pr);
          color: #fff;
          cursor: pointer;
          white-space: nowrap;
        }
        .pur-entry-add:hover {
          opacity: 0.92;
        }
        .pur-entry-cancel {
          width: 100%;
          border: 1px solid var(--bd);
          border-radius: 6px;
          padding: 3px 4px;
          font-size: 9px;
          font-weight: 500;
          background: #fff;
          color: var(--muted);
          cursor: pointer;
        }
        .pur-entry-cancel:hover {
          background: var(--soft);
          color: var(--txt);
        }
        .pur-tbl tbody tr:not(:first-of-type):hover td {
          background-color: var(--soft) !important;
        }
        .pur-total-bar {
          min-height: 36px;
          padding: 8px 10px;
          border-top: 1px solid var(--bd);
          background: #fafafa;
        }
        .pur-total-cell {
          min-width: 56px;
          text-align: right;
          padding: 0 4px;
          font-weight: 600;
          font-size: clamp(9px, 1.05vw, 11px);
          color: var(--txt);
          font-variant-numeric: tabular-nums;
        }
        .pur-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 12px;
          border-top: 1px solid var(--bd);
          background: #fff;
          margin-top: auto;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .pur-bb {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--bd);
          background: #fff;
          color: var(--txt);
          font-size: 11px;
          font-weight: 500;
        }
        .pur-bb:hover { border-color: #d4d4d4; background: var(--soft); }
        .pur-bb-primary { background: var(--pr); color: #fff; border-color: var(--pr); }
        .pur-bb-primary:hover { opacity: 0.92; color: #fff; }
        @media (max-width: 1024px) {
          .pur-page { min-height: auto; }
        }
      `}</style>

      <div className="pur-page flex min-h-0 flex-col">
        <div className="pur-card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 flex-col gap-2 border-b border-neutral-200 px-3 py-3 sm:px-4 sm:py-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Purchase</h1>
                <p className="mt-0.5 text-xs text-neutral-500">Invoice amount above the tabs; Summary and Payment below.</p>
                <div className="mt-2 flex flex-wrap items-end gap-2">
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
                    disabled={refsLoading}
                  />
                  <DropdownInput
                    label="LPO"
                    options={lpoDropdownOptions}
                    value={selectedLpoMasterId}
                    onChange={handleLpoChange}
                    widthPx={200}
                    disabled={!branchId || lposLoading || documentLoading}
                  />
                  <DropdownInput
                    label="GRN"
                    options={grnDropdownOptions}
                    value={selectedGrnId}
                    onChange={handleGrnChange}
                    widthPx={220}
                    disabled={!branchId || grnsLoading || documentLoading}
                  />
                </div>
                {(refsError || documentError || saveError) ? (
                  <p className="mt-1 text-[11px] text-red-600">{saveError || documentError || refsError}</p>
                ) : null}
                {saveOk ? <p className="mt-1 text-[11px] text-emerald-700">{saveOk}</p> : null}
                {lineEntryError ? <p className="mt-1 text-[11px] text-red-600">{lineEntryError}</p> : null}
                {branchId && !documentLoading ? (
                  <p className="mt-1 max-w-xl text-[11px] text-neutral-500">
                    Manual lines: pick a product (search icon or dropdown), qty defaults to 1, cost from last purchase when
                    available — subtotal, VAT, and total update as you type. Leave LPO and GRN blank to save without them.
                  </p>
                ) : null}
                {documentLoading ? <p className="mt-1 text-[11px] text-neutral-500">Loading document…</p> : null}
                {productsLoadError && branchId ? (
                  <p className="mt-1 text-[11px] text-amber-800">{productsLoadError}</p>
                ) : null}
                {!suppliersLoading && suppliers.length === 0 ? (
                  <p className="mt-1 text-[11px] text-amber-800">
                    No suppliers yet —{' '}
                    <Link to="/data-entry/supplier-entry" className="font-semibold text-amber-900 underline underline-offset-2">
                      add a supplier
                    </Link>{' '}
                    before saving purchases.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[{ icon: PrinterIcon, label: 'Print' }, { icon: CancelIcon, label: 'Cancel' }, { icon: EditIcon, label: 'Edit' }].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    className="pur-btn inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition"
                  >
                    <img src={btn.icon} alt="" className="h-3 w-3" />
                    {btn.label}
                  </button>
                ))}
                {selectedRows.size > 0 && (
                  <button type="button" className="pur-del" onClick={() => setPendingDelete({ mode: 'bulk' })}>
                    <img src={DeleteActionIcon} alt="" className="h-3 w-3" /> Delete ({selectedRows.size})
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex min-h-0 flex-col border-b border-neutral-200 xl:border-b-0 xl:border-r">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2 sm:px-4 sm:py-3">
                <div className="relative min-h-0 flex-1">
                  <div className="absolute inset-0 flex min-h-[180px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                      <CommonTable
                        className="pur-tbl"
                        fitParentWidth
                        stickyHeader
                        hideOuterBorder
                        headers={PURCHASE_LINE_HEADERS}
                        rows={allTableRows}
                      />
                    </div>
                    <div className="pur-total-bar flex shrink-0 flex-wrap items-center justify-end gap-0 sm:gap-1">
                      <span className="mr-auto pl-1 text-[10px] font-medium uppercase tracking-wide text-neutral-500">Totals</span>
                      <span className="pur-total-cell">{gridTotals.subSum.toFixed(2)}</span>
                      <span className="pur-total-cell text-neutral-500" title="Average VAT % across lines">
                        {lineRows.length ? (gridTotals.vatPctSum / lineRows.length).toFixed(2) : '0.00'}%
                      </span>
                      <span className="pur-total-cell">{gridTotals.taxSum.toFixed(2)}</span>
                      <span className="pur-total-cell font-semibold text-neutral-900">{gridTotals.lineTotalSum.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col xl:min-w-0">
              <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <SubInputField
                  label="Invoice amount"
                  fullWidth
                  type="number"
                  value={doc.invoiceAmount}
                  onChange={(e) => updateDoc('invoiceAmount', e.target.value)}
                  title="Supplier invoice total for this purchase"
                />
              </div>
              <div className="flex shrink-0 flex-wrap gap-x-0.5 border-b border-neutral-200 px-2 sm:px-3">
                {[
                  { key: 'summary', label: 'Summary' },
                  { key: 'payment', label: 'Payment' },
                ].map((tab) => (
                  <button key={tab.key} type="button" className={`pur-tab ${rightTab === tab.key ? 'pur-tab-on' : ''}`} onClick={() => setRightTab(tab.key)}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3">
                {rightTab === 'summary' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="pur-lbl">Summary</span>
                    <div className="pur-summary-block flex flex-col gap-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_80px_60px] sm:items-end">
                        <div className="min-w-0">
                          <InputField label="Sub Total" fullWidth readOnly value={totals.subTotal} className="bg-stone-50" />
                        </div>
                        <div className="min-w-0">
                          <SubInputField label="Disc Amt" widthPx={80} value={totals.discAmt} readOnly />
                        </div>
                        <div className="min-w-0">
                          <SubInputField label="" suffix="%" widthPx={60} value={totals.discPct} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_80px_60px] sm:items-end">
                        <div className="min-w-0">
                          <InputField label="Total Amount" fullWidth readOnly value={totals.totalAmount} className="bg-stone-50" />
                        </div>
                        <div className="min-w-0">
                          <SubInputField label="Tax" widthPx={80} value={totals.tax} readOnly />
                        </div>
                        <div className="min-w-0">
                          <SubInputField label="" suffix="%" widthPx={60} value={totals.vatPct} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <InputField label="Round Off" fullWidth value={totals.roundOff} readOnly />
                        <InputField label="Net Amount" fullWidth readOnly value={totals.netAmount} className="bg-stone-50" />
                      </div>
                    </div>

                    <hr className="my-0.5 border-neutral-200" />

                    <span className="pur-lbl">Document</span>
                    <div className="pur-compact-card flex flex-col gap-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <SubInputField label="Purchase #" fullWidth value={doc.purchaseNo} onChange={(e) => updateDoc('purchaseNo', e.target.value)} />
                        <SubInputField label="Sup Inv#" fullWidth value={doc.supplierInvNo} onChange={(e) => updateDoc('supplierInvNo', e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <DropdownInput
                          label="Supplier"
                          fullWidth
                          value={supplierId}
                          onChange={setSupplierId}
                          options={supplierDropdownOptions}
                          disabled={suppliersLoading}
                        />
                        <Link
                          to="/data-entry/supplier-entry"
                          className="text-[11px] font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                        >
                          + New supplier
                        </Link>
                      </div>
                      <DateInputField label="Purchase date" fullWidth value={doc.purchaseDate} onChange={(value) => updateDoc('purchaseDate', value)} />
                    </div>
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                      <Switch checked={doc.bySupplier} onChange={(value) => updateDoc('bySupplier', value)} description="Group by supplier account" size="xs" />
                    </div>
                  </div>
                )}

                {rightTab === 'payment' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="pur-lbl">Posting</span>
                    <div className="pur-compact-card grid grid-cols-1 gap-2">
                      <DropdownInput label="Entered by" fullWidth value={doc.enteredBy} onChange={(value) => updateDoc('enteredBy', value)} options={['Admin', 'User 1', 'User 2']} />
                      <DropdownInput label="Payment mode" fullWidth value={doc.paymentMode} onChange={(value) => updateDoc('paymentMode', value)} options={['Cash', 'Card', 'Bank Transfer', 'Credit']} />
                      <DropdownInput label="Account head" fullWidth value={doc.accountHead} onChange={(value) => updateDoc('accountHead', value)} options={['General', 'Purchase A/C', 'Expenses A/C']} />
                      <DateInputField label="Entered date" fullWidth value={doc.enteredDate} onChange={(value) => updateDoc('enteredDate', value)} />
                    </div>

                    <span className="pur-lbl">Payment</span>
                    <div className="flex flex-col gap-1">
                      <label className="pur-lbl normal-case tracking-normal">Remark</label>
                      <textarea
                        value={paymentInfo.remark}
                        onChange={(e) => setPaymentInfo((prev) => ({ ...prev, remark: e.target.value }))}
                        rows={3}
                        className="box-border w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-[11px] outline-none focus:border-neutral-400"
                      />
                    </div>
                    <SubInputField label="Payment no" fullWidth value={paymentInfo.paymentNo} onChange={(e) => setPaymentInfo((prev) => ({ ...prev, paymentNo: e.target.value }))} />
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                      <Switch checked={paymentInfo.paymentNow} onChange={(value) => setPaymentInfo((prev) => ({ ...prev, paymentNow: value }))} description="Payment now" size="xs" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pur-bar">
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" className="pur-bb">
                <img src={EditIcon} alt="" className="h-3 w-3" /> Edit
              </button>
              <button type="button" className="pur-bb" onClick={resetPurchase}>
                <img src={EditIcon} alt="" className="h-3 w-3" /> New
              </button>
              <button type="button" className="pur-bb">
                <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" className="pur-bb">
                <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
              </button>
              <button
                type="button"
                className="pur-bb cursor-not-allowed opacity-50"
                disabled
                title="Posting is disabled — save only for now."
              >
                <img src={PostIcon} alt="" className="h-3 w-3" /> Post
              </button>
              <button
                type="button"
                className="pur-bb pur-bb-primary"
                disabled={saveLoading || documentLoading || !branchId}
                onClick={handleSavePurchase}
              >
                {saveLoading ? 'Saving…' : 'Save'}
              </button>
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
    </div>
  );
}
