import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { colors } from '../../../shared/constants/theme';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as customerEntryApi from '../../../services/customerEntry.api.js';
import * as saleEntryApi from '../../../services/saleEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as accountsApi from '../../../services/accounts.api.js';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import LedgerIcon from '../../../shared/assets/icons/ledger.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, DatePickerInput, CommonTable, ConfirmDialog, TableTotalsBar, TabsBar } from '../../../shared/components/ui';

function getProductDetails(row) {
  const orDash = (v) => (v != null && v !== '' ? String(v) : '-');
  return {
    productCode: orDash(row[1]), stockOnHand: orDash(null), lastCustomer: orDash(null),
    unitCost: orDash(null), minUnitPrice: orDash(null), profit: orDash(null),
    creditLimit: orDash(null), currentOsBal: orDash(null), osBalance: orDash(null),
    receiptNo: orDash(null), location: orDash(null), productName: orDash(row[2]),
  };
}

function fmtMoney2(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : '';
}

function parseLineNum(v) {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function roundMoney2(n) {
  return Math.round(n * 100) / 100;
}

/** Gross − % discount − fixed disc → sub; tax on sub → line total */
function computeLineMoneyStrings(partial) {
  const q = parseLineNum(partial.qty);
  const up = parseLineNum(partial.unitPrice);
  const dpct = parseLineNum(partial.discPercent);
  const damt = parseLineNum(partial.discAmt);
  const tpct = parseLineNum(partial.taxPercent);
  const gross = q * up;
  const afterPct = gross - gross * (dpct / 100);
  const sub = Math.max(0, roundMoney2(afterPct - damt));
  const tax = roundMoney2(sub * (tpct / 100));
  const tot = roundMoney2(sub + tax);
  return { subTotal: fmtMoney2(sub), taxAmt: fmtMoney2(tax), total: fmtMoney2(tot) };
}

function lineFormToNumericRow(form) {
  const q = parseLineNum(form.qty);
  const gross = q * parseLineNum(form.unitPrice);
  const dpct = parseLineNum(form.discPercent);
  const damt = parseLineNum(form.discAmt);
  const tpct = parseLineNum(form.taxPercent);
  const afterPct = gross - gross * (dpct / 100);
  const sub = Math.max(0, roundMoney2(afterPct - damt));
  const tax = roundMoney2(sub * (tpct / 100));
  const tot = roundMoney2(sub + tax);
  const pidRaw =
    form.productId != null && String(form.productId).trim() !== '' ? Number(form.productId) : NaN;
  const productId = Number.isFinite(pidRaw) && pidRaw >= 1 ? pidRaw : null;
  return [
    form.ownRef, form.productCode, form.shortDescription, form.hsCode,
    q, parseLineNum(form.focQty), parseLineNum(form.unitCost), parseLineNum(form.unitPrice),
    dpct, damt, sub, tpct, tax, tot,
    productId,
    null,
    null,
  ];
}

const SALE_FIELD_IDS = {
  qty: 'sale-line-qty',
  unitPrice: 'sale-line-unit-price',
  discAmt: 'sale-line-disc-amt',
  total: 'sale-line-total',
};

function focusSaleLineField(id) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el && typeof el.focus === 'function') {
        el.focus();
        if (typeof el.select === 'function') el.select();
      }
    });
  });
}

/** API quotation line → sale table row (14 numeric/text cells) */
function mapQuotationLineToSaleRow(line, quotationId) {
  const qty = Number(line.qty) || 0;
  const unitPrice = Number(line.unitPrice) || 0;
  const discAmt = Number(line.itemDiscount) || 0;
  const subTotal = Number(line.subtotalAmount) || 0;
  const lineTotal = Number(line.lineTotal) || 0;
  const taxAmt = Math.max(0, Math.round((lineTotal - subTotal) * 100) / 100);
  const productId =
    line.productId != null && Number(line.productId) >= 1 ? Number(line.productId) : null;
  return [
    line.locationCode != null ? String(line.locationCode) : '',
    line.barcode != null ? String(line.barcode) : '',
    line.productDescription != null ? String(line.productDescription) : '',
    '',
    qty,
    0,
    unitPrice,
    unitPrice,
    0,
    discAmt,
    subTotal,
    0,
    taxAmt,
    lineTotal,
    productId,
    quotationId || null,
    null,
  ];
}

/** API delivery order line → sale table row */
function mapDeliveryOrderLineToSaleRow(line, deliveryOrderId) {
  const qty = Number(line.qty) || 0;
  const unitPrice = Number(line.unitPrice) || 0;
  const discAmt = Number(line.itemDiscount) || 0;
  const subTotal = Number(line.subtotalAmount) || 0;
  const lineTotal = Number(line.lineTotal) || 0;
  const taxAmt = Math.max(0, Math.round((lineTotal - subTotal) * 100) / 100);
  const productId =
    line.productId != null && Number(line.productId) >= 1 ? Number(line.productId) : null;
  return [
    line.serialNo != null ? String(line.serialNo) : '',
    line.barcode != null ? String(line.barcode) : '',
    line.shortDescription != null ? String(line.shortDescription) : '',
    line.packetDetails != null ? String(line.packetDetails) : '',
    qty,
    0,
    0,
    unitPrice,
    0,
    discAmt,
    subTotal,
    0,
    taxAmt,
    lineTotal,
    productId,
    null,
    deliveryOrderId || null,
  ];
}

const summaryPanelInitial = {
  subTotal: '',
  discAmt: '',
  discPct: '',
  totalAmount: '',
  taxAmt: '',
  taxPct: '',
  roundOff: '',
  netAmount: '',
};

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

const initialFormState = {
  ownRef: '', productCode: '', shortDescription: '', hsCode: '',
  productId: '',
  qty: '', focQty: '', unitCost: '', unitPrice: '',
  discPercent: '', discAmt: '', subTotal: '', taxPercent: '', taxAmt: '', total: '',
};

const returnFormInitial = {
  returnType: 'Full', billNo: '', counterNo: '', billDate: '', paymentMode: 'Cash', station: 'Main',
};

const billPanelInitial = {
  returnBillNo: '', custLpo: '', localBillNo: '',
  returnBillDate: '', paymentDate: '', creditCardNo: '', creditCard: '',
  cashierName: '', invoiceAmt: '', station: 'Main', salesTerms: '',
  counterNo: '', paidAmount: '', balanceAmount: '',
};

export default function Sale({ pageTitle = 'Sales Entry', useReturnHeaderForm = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleRows, setSaleRows] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [summaryPanel, setSummaryPanel] = useState(summaryPanelInitial);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const docLoadSeq = useRef(0);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const [productsLoadError, setProductsLoadError] = useState('');
  const productPickerSearchRef = useRef(null);
  const [returnForm, setReturnForm] = useState(returnFormInitial);
  const [billPanel, setBillPanel] = useState(billPanelInitial);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [pendingDelete, setPendingDelete] = useState(null);
  const [rightTab, setRightTab] = useState('summary');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [customersRows, setCustomersRows] = useState([]);
  const [quotationsRows, setQuotationsRows] = useState([]);
  const [deliveryOrdersRows, setDeliveryOrdersRows] = useState([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [deliveryOrdersLoading, setDeliveryOrdersLoading] = useState(false);
  const [refsError, setRefsError] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [selectedDeliveryOrderId, setSelectedDeliveryOrderId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [privilegeWarnings, setPrivilegeWarnings] = useState(null);
  const [pendingSavePayload, setPendingSavePayload] = useState(null);
  const [receiptLedgerId, setReceiptLedgerId] = useState('');
  const [accountHeadOptions, setAccountHeadOptions] = useState([]);
  const [accountDefaults, setAccountDefaults] = useState(null);
  const [accountsLoadError, setAccountsLoadError] = useState('');
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const mergeFormAndCalc = useCallback((patch) => {
    setForm((f) => {
      const next = { ...f, ...patch };
      const { subTotal, taxAmt, total } = computeLineMoneyStrings(next);
      return { ...next, subTotal, taxAmt, total };
    });
  }, []);

  const fillFormFromRow = (row) => {
    setForm({
      ownRef: String(row[0] ?? ''), productCode: String(row[1] ?? ''), shortDescription: String(row[2] ?? ''),
      hsCode: String(row[3] ?? ''),
      productId: row[14] != null && row[14] !== '' ? String(row[14]) : '',
      qty: String(row[4] ?? ''), focQty: String(row[5] ?? ''),
      unitCost: String(row[6] ?? ''), unitPrice: String(row[7] ?? ''),
      discPercent: String(row[8] ?? ''), discAmt: String(row[9] ?? ''), subTotal: String(row[10] ?? ''),
      taxPercent: String(row[11] ?? ''), taxAmt: String(row[12] ?? ''), total: String(row[13] ?? ''),
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRefsLoading(true);
      setRefsError('');
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
      } catch (err) {
        if (!cancelled) {
          setBranches([]);
          setCustomersRows([]);
          setRefsError(err.response?.data?.message || err.message || 'Could not load branches or customers');
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
    setRightTab((t) => (t === 'billing' ? 'summary' : t));
  }, []);

  useEffect(() => {
    if (!branchId) {
      setQuotationsRows([]);
      setDeliveryOrdersRows([]);
      setSelectedQuotationId('');
      setSelectedDeliveryOrderId('');
      return;
    }
    docLoadSeq.current += 1;
    setDocumentLoading(false);
    setDocumentError('');
    setSaleRows([]);
    setSummaryPanel(summaryPanelInitial);
    setSelectedQuotationId('');
    setSelectedDeliveryOrderId('');
    let cancelled = false;
    (async () => {
      setQuotationsLoading(true);
      setDeliveryOrdersLoading(true);
      try {
        const [qRes, doRes] = await Promise.all([
          saleEntryApi.listQuotationsForSale({ branchId: Number(branchId), limit: 200, excludeInvoiced: true }),
          saleEntryApi.listDeliveryOrdersForSale({ branchId: Number(branchId), limit: 200, excludeInvoiced: true }),
        ]);
        if (cancelled) return;
        setQuotationsRows(qRes.data?.quotations || []);
        setDeliveryOrdersRows(doRes.data?.deliveryOrders || []);
      } catch {
        if (!cancelled) {
          setQuotationsRows([]);
          setDeliveryOrdersRows([]);
        }
      } finally {
        if (!cancelled) {
          setQuotationsLoading(false);
          setDeliveryOrdersLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setProductsCatalog([]);
      setProductsLoadError('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await productEntryApi.fetchProducts(Number(branchId));
        if (cancelled) return;
        setProductsCatalog((data?.products || []).map(mapApiProductToPicker));
        setProductsLoadError('');
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
    if (!branchId) {
      setAccountHeadOptions([]);
      setAccountDefaults(null);
      setReceiptLedgerId('');
      setAccountsLoadError('');
      return;
    }
    let cancelled = false;
    setAccountDefaults(null);
    setReceiptLedgerId('');
    setAccountHeadOptions([]);
    (async () => {
      setAccountsLoadError('');
      try {
        const [headsRes, defRes] = await Promise.all([
          accountsApi.listAccountHeads({
            branchId,
            postingOnly: true,
            accountNoPrefix: '03-02',
          }),
          accountsApi.getAccountBranchDefaults({ branchId }),
        ]);
        if (cancelled) return;
        const heads = headsRes.data?.accountHeads || [];
        setAccountHeadOptions(
          heads.map((h) => ({
            value: String(h.accountId),
            label: `${h.accountNo} – ${h.accountHead}`,
          })),
        );
        setAccountDefaults(defRes.data || null);
      } catch (e) {
        if (!cancelled) {
          setAccountHeadOptions([]);
          setAccountDefaults(null);
          setAccountsLoadError(
            e.response?.data?.message || e.message || 'Could not load account heads / defaults',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !accountDefaults) return;
    const isCard = Boolean(billPanel.creditCardNo?.trim());
    const pick =
      isCard && accountDefaults.defaultCardAccountId        ? accountDefaults.defaultCardAccountId
        : accountDefaults.defaultCashAccountId;
    if (pick) setReceiptLedgerId(String(pick));
  }, [branchId, accountDefaults, billPanel.creditCardNo]);

  useEffect(() => {
    if (!productPickerOpen) return;
    const t = window.setTimeout(() => productPickerSearchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [productPickerOpen]);

  const branchOptions = useMemo(
    () =>
      (branches || []).map((b) => ({
        value: String(b.branchId),
        label: `${b.branchCode || ''} — ${b.branchName || ''}`.replace(/^ — |^— /, '').trim() || `Branch ${b.branchId}`,
      })),
    [branches],
  );

  const customerOptions = useMemo(
    () => [
      { value: '', label: refsLoading ? 'Loading…' : '— Customer —' },
      ...(customersRows || []).map((c) => ({
        value: String(c.customerId),
        label: c.customerCode ? `${c.customerName} (${c.customerCode})` : String(c.customerName || c.customerId),
      })),
    ],
    [customersRows, refsLoading],
  );

  /** No customer → all branch QTNs/DOs; with customer → only documents for that customer */
  const filteredQuotationsRows = useMemo(() => {
    const cid = String(selectedCustomerId || '').trim();
    if (!cid) return quotationsRows || [];
    return (quotationsRows || []).filter(
      (q) => q.customerId != null && String(q.customerId) === cid,
    );
  }, [quotationsRows, selectedCustomerId]);

  const filteredDeliveryOrdersRows = useMemo(() => {
    const cid = String(selectedCustomerId || '').trim();
    if (!cid) return deliveryOrdersRows || [];
    return (deliveryOrdersRows || []).filter(
      (d) => d.customerId != null && String(d.customerId) === cid,
    );
  }, [deliveryOrdersRows, selectedCustomerId]);

  const quotationOptions = useMemo(
    () =>
      filteredQuotationsRows.map((q) => ({
        value: String(q.quotationId),
        label: `${q.quotationNo || 'QTN'} · ${String(q.quotationDate || '').slice(0, 10)}${q.customerName ? ` · ${q.customerName}` : ''}`,
      })),
    [filteredQuotationsRows],
  );

  const quotationDropdownOptions = useMemo(
    () => {
      const emptyFiltered =
        Boolean(String(selectedCustomerId || '').trim()) &&
        filteredQuotationsRows.length === 0 &&
        !quotationsLoading;
      return [
        {
          value: '',
          label: !branchId
            ? '— Select branch —'
            : quotationsLoading
              ? 'Loading quotations…'
              : emptyFiltered
                ? '— No quotations for this customer —'
                : '— Quotation —',
        },
        ...quotationOptions,
      ];
    },
    [branchId, quotationsLoading, quotationOptions, selectedCustomerId, filteredQuotationsRows.length],
  );

  const deliveryOrderOptions = useMemo(
    () =>
      filteredDeliveryOrdersRows.map((d) => ({
        value: String(d.deliveryOrderId),
        label: `${d.deliveryOrderNo || 'DO'} · ${String(d.deliveryOrderDate || '').slice(0, 10)}${d.customerName ? ` · ${d.customerName}` : ''}`,
      })),
    [filteredDeliveryOrdersRows],
  );

  const deliveryOrderDropdownOptions = useMemo(
    () => {
      const emptyFiltered =
        Boolean(String(selectedCustomerId || '').trim()) &&
        filteredDeliveryOrdersRows.length === 0 &&
        !deliveryOrdersLoading;
      return [
        {
          value: '',
          label: !branchId
            ? '— Select branch —'
            : deliveryOrdersLoading
              ? 'Loading delivery orders…'
              : emptyFiltered
                ? '— No delivery orders for this customer —'
                : '— Delivery order —',
        },
        ...deliveryOrderOptions,
      ];
    },
    [branchId, deliveryOrdersLoading, deliveryOrderOptions, selectedCustomerId, filteredDeliveryOrdersRows.length],
  );

  const branchDropdownOptions = useMemo(
    () => [
      { value: '', label: refsLoading ? 'Loading branches…' : '— Branch —' },
      ...branchOptions,
    ],
    [branchOptions, refsLoading],
  );

  const filteredPickerProducts = useMemo(() => {
    const q = productPickerSearch.trim().toLowerCase();
    if (!q) return productsCatalog;
    return productsCatalog.filter((p) => {
      const bc = String(p.barCode || '').toLowerCase();
      const sd = String(p.shortDescription || '').toLowerCase();
      return bc.includes(q) || sd.includes(q);
    });
  }, [productsCatalog, productPickerSearch]);

  const openProductPicker = useCallback((prefill) => {
    if (!branchId) {
      setProductsLoadError('Select a branch first');
      setProductPickerSearch(prefill != null ? String(prefill) : '');
      setProductPickerOpen(true);
      return;
    }
    setProductsLoadError('');
    setProductPickerSearch(prefill != null ? String(prefill) : '');
    setProductPickerOpen(true);
  }, [branchId]);

  const applyPickedProduct = useCallback((p) => {
    const up = p.unitPrice != null && Number.isFinite(Number(p.unitPrice)) ? String(p.unitPrice) : '';
    setForm((f) => {
      const next = {
        ...f,
        productCode: p.barCode != null ? String(p.barCode) : '',
        shortDescription: p.shortDescription != null ? String(p.shortDescription) : '',
        productId: p.productId != null ? String(p.productId) : '',
        unitPrice: up || f.unitPrice,
        unitCost: up || f.unitCost,
        ownRef: p.locationCode != null && String(p.locationCode).trim() !== '' ? String(p.locationCode) : f.ownRef,
      };
      const { subTotal, taxAmt, total } = computeLineMoneyStrings(next);
      return { ...next, subTotal, taxAmt, total };
    });
    setProductPickerOpen(false);
    setProductPickerSearch('');
    focusSaleLineField(SALE_FIELD_IDS.qty);
  }, []);

  useEffect(() => {
    if (!selectedQuotationId) return;
    const ok = filteredQuotationsRows.some((q) => String(q.quotationId) === String(selectedQuotationId));
    if (!ok) setSelectedQuotationId('');
  }, [filteredQuotationsRows, selectedQuotationId]);

  useEffect(() => {
    if (!selectedDeliveryOrderId) return;
    const ok = filteredDeliveryOrdersRows.some((d) => String(d.deliveryOrderId) === String(selectedDeliveryOrderId));
    if (!ok) setSelectedDeliveryOrderId('');
  }, [filteredDeliveryOrdersRows, selectedDeliveryOrderId]);

  const handleQuotationChange = useCallback(async (v) => {
    const id = String(v || '').trim();
    setSelectedQuotationId(id);
    setDocumentError('');
    if (!id) {
      if (!selectedDeliveryOrderId) {
        setSaleRows([]);
        setSummaryPanel(summaryPanelInitial);
      }
      return;
    }
    const seq = ++docLoadSeq.current;
    setDocumentLoading(true);
    try {
      const { data } = await saleEntryApi.getQuotationForSale(id);
      if (seq !== docLoadSeq.current) return;
      const q = data?.quotation;
      const lines = data?.lines || [];
      if (!q) throw new Error('Invalid quotation response');
      const newRows = lines.map((l) => mapQuotationLineToSaleRow(l, Number(id)));
      setSaleRows((prev) => {
        const doRows = prev.filter((r) => r[16] != null && r[16] !== 0);
        return [...doRows, ...newRows];
      });
      if (q.customerId != null) setSelectedCustomerId(String(q.customerId));
      const qd = q.quotationDate != null ? String(q.quotationDate).slice(0, 10) : '';
      setBillPanel((p) => ({
        ...p,
        returnBillNo: q.quotationNo || p.returnBillNo || '',
        custLpo: q.customerRefNo || p.custLpo || '',
        returnBillDate: qd || p.returnBillDate,
        salesTerms: q.quotationTerms || q.remarks || p.salesTerms,
      }));
      setSummaryPanel((prev) => ({
        ...prev,
        discAmt: fmtMoney2(parseLineNum(prev.discAmt) + parseLineNum(fmtMoney2(q.discountAmount))),
        roundOff: fmtMoney2(parseLineNum(prev.roundOff) + parseLineNum(fmtMoney2(q.roundOffAdjustment))),
      }));
      setSelectedRows(new Set());
      setEditingRowIndex(null);
      setForm(initialFormState);
    } catch (e) {
      if (seq !== docLoadSeq.current) return;
      setDocumentError(e.response?.data?.message || e.message || 'Could not load quotation');
    } finally {
      if (seq === docLoadSeq.current) setDocumentLoading(false);
    }
  }, [selectedDeliveryOrderId]);

  const handleDeliveryOrderChange = useCallback(async (v) => {
    const id = String(v || '').trim();
    setSelectedDeliveryOrderId(id);
    setDocumentError('');
    if (!id) {
      if (!selectedQuotationId) {
        setSaleRows([]);
        setSummaryPanel(summaryPanelInitial);
      }
      return;
    }
    const seq = ++docLoadSeq.current;
    setDocumentLoading(true);
    try {
      const { data } = await saleEntryApi.getDeliveryOrderForSale(id);
      if (seq !== docLoadSeq.current) return;
      const d = data?.deliveryOrder;
      const lines = data?.lines || [];
      if (!d) throw new Error('Invalid delivery order response');
      const newRows = lines.map((l) => mapDeliveryOrderLineToSaleRow(l, Number(id)));
      setSaleRows((prev) => {
        const qtnRows = prev.filter((r) => r[15] != null && r[15] !== 0);
        return [...qtnRows, ...newRows];
      });
      if (d.customerId != null) setSelectedCustomerId(String(d.customerId));
      const dd = d.deliveryOrderDate != null ? String(d.deliveryOrderDate).slice(0, 10) : '';
      setBillPanel((p) => ({
        ...p,
        returnBillNo: p.returnBillNo || d.deliveryOrderNo || '',
        custLpo: d.customerLpoNo || p.custLpo || '',
        localBillNo: d.deliveryOrderNo || p.localBillNo || '',
        returnBillDate: dd || p.returnBillDate,
        salesTerms: d.remarks || p.salesTerms,
        counterNo: d.counterNo != null ? String(d.counterNo) : p.counterNo,
      }));
      setSummaryPanel((prev) => ({
        ...prev,
        discAmt: fmtMoney2(parseLineNum(prev.discAmt) + parseLineNum(fmtMoney2(d.discount))),
        roundOff: fmtMoney2(parseLineNum(prev.roundOff) + parseLineNum(fmtMoney2(d.roundOffAdjustment))),
      }));
      setSelectedRows(new Set());
      setEditingRowIndex(null);
      setForm(initialFormState);
    } catch (e) {
      if (seq !== docLoadSeq.current) return;
      setDocumentError(e.response?.data?.message || e.message || 'Could not load delivery order');
    } finally {
      if (seq === docLoadSeq.current) setDocumentLoading(false);
    }
  }, [selectedQuotationId]);

  const handleEdit = (row, idx) => { fillFormFromRow(row); setEditingRowIndex(idx); };

  const handleDelete = (idx) => {
    setSaleRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    if (editingRowIndex === idx) { setEditingRowIndex(null); setForm(initialFormState); }
    else if (editingRowIndex !== null && editingRowIndex > idx) { setEditingRowIndex((i) => i - 1); }
  };

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next; });
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedRows);
    setSaleRows((prev) => prev.filter((_, i) => !toDelete.has(i)));
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) { setEditingRowIndex(null); setForm(initialFormState); }
    else if (editingRowIndex !== null) { setEditingRowIndex(editingRowIndex - [...toDelete].filter((i) => i < editingRowIndex).length); }
  };

  const handleSaveOrUpdate = useCallback(() => {
    const newRow = lineFormToNumericRow(form);
    if (editingRowIndex !== null) {
      setSaleRows((prev) => { const next = [...prev]; next[editingRowIndex] = newRow; return next; });
      setEditingRowIndex(null);
    } else { setSaleRows((prev) => [newRow, ...prev]); }
    setForm(initialFormState);
  }, [form, editingRowIndex]);

  const handleReturnAdd = () => {
    const desc = `Return (${returnForm.returnType}) — Bill ${returnForm.billNo || '-'}`;
    const newRow = ['', returnForm.counterNo || '-', desc, '', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, null, null];
    if (editingRowIndex !== null) {
      setSaleRows((prev) => { const next = [...prev]; next[editingRowIndex] = newRow; return next; });
      setEditingRowIndex(null);
    } else { setSaleRows((prev) => [newRow, ...prev]); }
  };

  const gridTotals = useMemo(() => ({
    qtySum: saleRows.reduce((sum, r) => sum + Number(r[5] ?? 0), 0),
    unitPriceSum: saleRows.reduce((sum, r) => sum + Number(r[8] ?? 0), 0),
    lineDiscSum: saleRows.reduce((sum, r) => sum + Number(r[9] ?? 0), 0),
    subSum: saleRows.reduce((sum, r) => sum + Number(r[10] ?? 0), 0),
    taxPctSum: saleRows.reduce((sum, r) => sum + Number(r[11] ?? 0), 0),
    taxSum: saleRows.reduce((sum, r) => sum + Number(r[12] ?? 0), 0),
    lineTotalSum: saleRows.reduce((sum, r) => sum + Number(r[13] ?? 0), 0),
  }), [saleRows]);

  /** Right Summary tab: amounts from grid + header disc %/amt + round off → net */
  const summaryFromGrid = useMemo(() => {
    const base = gridTotals.lineTotalSum;
    const da = parseLineNum(summaryPanel.discAmt);
    const dp = parseLineNum(summaryPanel.discPct);
    const ro = parseLineNum(summaryPanel.roundOff);
    const headerDisc = da + base * (dp / 100);
    const net = roundMoney2(base - headerDisc + ro);
    const effTaxPct = gridTotals.subSum > 0.00001 ? roundMoney2((gridTotals.taxSum / gridTotals.subSum) * 100) : 0;
    return {
      subTotal: fmtMoney2(gridTotals.subSum),
      taxAmt: fmtMoney2(gridTotals.taxSum),
      taxPctDisplay: effTaxPct > 0 ? String(effTaxPct) : '',
      totalAmount: fmtMoney2(base),
      netAmount: fmtMoney2(net),
    };
  }, [gridTotals, summaryPanel.discAmt, summaryPanel.discPct, summaryPanel.roundOff]);

  const saleTableTotals = useMemo(() => [
    ['Items', String(saleRows.length)],
    ['Qty Total', fmtMoney2(gridTotals.qtySum)],
    ['Unit Price Sum', fmtMoney2(gridTotals.unitPriceSum)],
    ['Line Discount', fmtMoney2(gridTotals.lineDiscSum)],
    ['Sub Total', fmtMoney2(gridTotals.subSum)],
    ['Tax Total', fmtMoney2(gridTotals.taxSum)],
    ['Header Disc', fmtMoney2(parseLineNum(summaryPanel.discAmt) + gridTotals.lineTotalSum * (parseLineNum(summaryPanel.discPct) / 100))],
    ['Net Amount', summaryFromGrid.netAmount, true],
  ], [saleRows.length, gridTotals, summaryPanel.discAmt, summaryPanel.discPct, summaryFromGrid.netAmount]);

  const buildSalePayload = useCallback((override = false) => {
    const net = parseLineNum(summaryFromGrid.netAmount);
    const paidRaw = parseLineNum(billPanel.paidAmount);
    const paid = paidRaw > 0 ? paidRaw : net;
    const paymentMode = billPanel.creditCardNo?.trim() ? 'CREDIT' : 'CASH';
    const qid = String(selectedQuotationId || '').trim();
    const did = String(selectedDeliveryOrderId || '').trim();
    const custRaw = String(selectedCustomerId || '').trim();
    return {
      branchId: Number(branchId),
      customerId: custRaw && Number.isFinite(Number(custRaw)) ? Number(custRaw) : null,
      quotationId: qid && Number.isFinite(Number(qid)) ? Number(qid) : null,
      deliveryOrderId: did && Number.isFinite(Number(did)) ? Number(did) : null,
      lines: saleRows.map((r) => ({
        productId: r[14],
        qty: r[4],
        unitPrice: r[7],
        unitCost: r[6],
        discountAmount: r[9],
        subtotalAmount: r[10],
        taxPercent: r[11],
        taxAmt: r[12],
        lineTotal: r[13],
        shortDescription: r[2],
        quotationId: r[15] || null,
        doId: r[16] || null,
      })),
      headerDiscAmt: parseLineNum(summaryPanel.discAmt),
      headerDiscPct: parseLineNum(summaryPanel.discPct),
      roundOffAdjustment: parseLineNum(summaryPanel.roundOff),
      netAmount: net,
      paidAmount: paid,
      paymentMode,
      counterNo: billPanel.counterNo,
      creditCardNo: billPanel.creditCardNo?.trim() || null,
      salesTerms: billPanel.salesTerms,
      receiptLedgerId: Number(receiptLedgerId),
      overridePrivilegeChecks: override,
      billing: {
        returnBillNo: billPanel.returnBillNo,
        custLpo: billPanel.custLpo,
        localBillNo: billPanel.localBillNo,
      },
    };
  }, [
    branchId, saleRows, summaryFromGrid.netAmount,
    summaryPanel.discAmt, summaryPanel.discPct, summaryPanel.roundOff,
    billPanel.paidAmount, billPanel.creditCardNo, billPanel.counterNo,
    billPanel.returnBillNo, billPanel.custLpo, billPanel.localBillNo, billPanel.salesTerms,
    selectedCustomerId, selectedQuotationId, selectedDeliveryOrderId, receiptLedgerId,
  ]);

  const doSaveSale = useCallback(async (payload) => {
    setSaveLoading(true);
    setSaveError('');
    setPrivilegeWarnings(null);
    try {
      await saleEntryApi.createSale(payload);
      setSaleRows([]);
      setSummaryPanel(summaryPanelInitial);
      setSelectedQuotationId('');
      setSelectedDeliveryOrderId('');
      setForm(initialFormState);
      setEditingRowIndex(null);
      setSelectedRows(new Set());
      setBillPanel(billPanelInitial);
      setPendingSavePayload(null);
    } catch (e) {
      const resp = e.response?.data;
      if (resp?.requiresOverride && resp?.warnings) {
        setPrivilegeWarnings(resp.warnings);
        setPendingSavePayload(payload);
      } else {
        setSaveError(resp?.message || e.message || 'Save failed');
      }
    } finally {
      setSaveLoading(false);
    }
  }, []);

  const handleSaveSale = useCallback(async () => {
    setSaveError('');
    setPrivilegeWarnings(null);
    if (!branchId) { setSaveError('Select a branch before saving.'); return; }
    if (!saleRows.length) { setSaveError('Add at least one line item.'); return; }
    const badIdx = saleRows.findIndex(
      (r) => r[14] == null || !Number.isFinite(Number(r[14])) || Number(r[14]) < 1,
    );
    if (badIdx !== -1) {
      setSaveError(`Line ${badIdx + 1} has no product — use the product picker (or load lines from a quotation / delivery order).`);
      return;
    }
    const net = parseLineNum(summaryFromGrid.netAmount);
    if (net <= 0) { setSaveError('Net amount must be greater than zero.'); return; }
    if (!String(receiptLedgerId || '').trim()) {
      setSaveError('Select an account head (receipt ledger) for this sale.');
      return;
    }
    await doSaveSale(buildSalePayload(false));
  }, [branchId, saleRows, summaryFromGrid.netAmount, receiptLedgerId, buildSalePayload, doSaveSale]);

  const handleOverrideSave = useCallback(async () => {
    if (!pendingSavePayload) return;
    await doSaveSale({ ...pendingSavePayload, overridePrivilegeChecks: true });
  }, [pendingSavePayload, doSaveSale]);

  const tableBodyRows = saleRows.map((r, idx) => [
    <div key={`chk-${idx}`} className="flex justify-center">
      <input type="checkbox" checked={selectedRows.has(idx)} onChange={() => toggleRowSelection(idx)}
        className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5" style={{ accentColor: primary }} />
    </div>,
    r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13],
    <div key={`act-${idx}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
      <button type="button" className="s-act" onClick={() => setSelectedProduct(getProductDetails(r))}><img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
      <button type="button" className="s-act" onClick={() => handleEdit(r, idx)}><img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
      <button type="button" className="s-act" onClick={() => setPendingDelete({ mode: 'single', idx })}><img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
    </div>,
  ]);

  const SALE_ENTRY_H = 26;
  const SALE_ENTRY_LBL = 'text-[9px] font-semibold text-gray-500 sm:text-[10px]';
  const SALE_ENTRY_INP = 'text-[10px] tabular-nums';

  return (
    <div className="pur-root box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <style>{`
        .pur-root {
          --pr: ${primary}; --bd: #e5e5e5; --txt: #171717; --muted: #737373; --soft: #fafafa;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
        }
        .pur-btn:hover { border-color: #d4d4d4; background: var(--soft); color: var(--txt); }
        .pur-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
        .pur-summary-card { border-radius: 10px; border: 1px solid #e7e5e4; background: linear-gradient(165deg,#fafaf9 0%,#fff 48%,#fafaf9 100%); box-shadow: 0 1px 2px rgba(28,25,23,.05),0 0 0 1px rgba(255,255,255,.8) inset; overflow: hidden; }
        .pur-summary-row { display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:7px 12px; min-width:0; }
        .pur-summary-row + .pur-summary-row { border-top:1px solid #f5f5f4; }
        .pur-summary-row-dense { padding-top:5px; padding-bottom:5px; }
        .pur-summary-label { font-size:11px; font-weight:600; color:#57534e; letter-spacing:.01em; line-height:1.25; }
        .pur-summary-value { font-size:13px; font-weight:700; color:#1c1917; font-variant-numeric:tabular-nums; text-align:right; letter-spacing:-0.02em; }
        .pur-summary-value-sm { font-size:12px; font-weight:600; }
        .pur-summary-pair-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border-top:1px solid #f5f5f4; }
        .pur-summary-pair-grid .pur-summary-row { border-top:none; }
        .pur-summary-pair-grid .pur-summary-row:first-child { border-right:1px solid #f5f5f4; }
        .pur-summary-net { display:flex; align-items:baseline; justify-content:space-between; gap:12px; min-width:0; padding:11px 12px 12px; border-top:1px solid rgba(121,7,40,.18); background:linear-gradient(180deg,rgba(121,7,40,.07) 0%,rgba(121,7,40,.025) 100%); }
        .pur-summary-net .pur-summary-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--pr); }
        .pur-summary-net .pur-summary-value { font-size:15px; font-weight:800; color:var(--pr); }
        .pur-act { width:30px; height:30px; padding:6px; border-radius:6px; border:none; background:transparent; cursor:pointer; opacity:.5; display:inline-flex; align-items:center; justify-content:center; transition:opacity .15s,background .15s; }
        .pur-act:hover { background:var(--soft); opacity:1; }
        .pur-del { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:6px; border:1px solid var(--bd); background:#fff; color:var(--txt); font-size:11px; font-weight:500; cursor:pointer; }
        .pur-del:hover { border-color:#fca5a5; color:#b91c1c; background:#fef2f2; }
        .pur-entry-bar-input { box-sizing:border-box; height:26px; min-height:26px; border-radius:3px; border:1px solid #d4d4d4; background:#fff; padding:0 6px; font-size:10px; outline:none; width:100%; }
        .pur-entry-bar-input:focus { border-color:#a3a3a3; }
        .pur-entry-bar-input[readonly] { background:#f5f5f5; color:#737373; }
        .pur-fi { height:26px; width:100%; border-radius:3px; border:1px solid #d4d4d4; background:#f5f5f5; padding:0 8px; font-size:10px; outline:none; }
        .pur-fi:focus { border-color:#a3a3a3; }
        .pur-ta { min-height:38px; width:100%; resize:vertical; border-radius:4px; border:1px solid #d4d4d4; background:#f5f5f5; padding:5px 8px; font-size:10px; outline:none; }
        .pur-ta:focus { border-color:#a3a3a3; }
        .sale-tbl, .sale-tbl > div { overflow:visible !important; }
        .sale-tbl thead th { position:sticky; top:0; z-index:2; }
        .sale-field-lbl { padding:0; margin:0; border:none; background:transparent; cursor:pointer; font-size:9px; font-weight:600; letter-spacing:.3px; color:var(--muted); line-height:1.2; display:inline-flex; align-items:center; gap:3px; }
        @media(min-width:640px){.sale-field-lbl{font-size:10px}}
        .sale-field-lbl:hover { color:var(--pr); }
        @keyframes s-modal-in { from{opacity:0;transform:scale(.96) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .s-modal { animation:s-modal-in .2s ease-out; }
        .s-act { padding:3px; border-radius:4px; border:none; background:transparent; cursor:pointer; transition:all .15s; opacity:.55; display:inline-flex; align-items:center; justify-content:center; }
        .s-act:hover { background:var(--soft); opacity:1; }
      `}</style>

      {/* Row 1: Title + action buttons */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>{pageTitle.toUpperCase()}</h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <img src={EditActionIcon} alt="" className="h-3 w-3" /> Edit
          </button>
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> New
          </button>
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
          </button>
          <button type="button" className="pur-btn inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition">
            <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
          </button>
          <button type="button" className="pur-btn inline-flex h-7 cursor-not-allowed items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 opacity-50 transition" disabled>
            <img src={PostIcon} alt="" className="h-3 w-3" /> Post
          </button>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary, borderColor: primary }}
            disabled={saveLoading || documentLoading || !branchId}
            onClick={() => handleSaveSale()}
          >
            {saveLoading ? 'Saving...' : <><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Save</>}
          </button>
          {selectedRows.size > 0 && (
            <button type="button" className="pur-del" onClick={() => setPendingDelete({ mode: 'bulk' })}>
              <img src={DeleteActionIcon} alt="" className="h-3 w-3" /> Delete ({selectedRows.size})
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Branch + Customer + Quotation + DO */}
      <div className="flex shrink-0 flex-wrap items-end gap-x-3 gap-y-2">
        <DropdownInput
          label="Branch"
          options={branchDropdownOptions}
          value={branchId}
          onChange={(v) => { setBranchId(v); setSelectedQuotationId(''); setSelectedDeliveryOrderId(''); }}
          widthPx={150}
          heightPx={SALE_ENTRY_H}
          labelClassName={SALE_ENTRY_LBL}
          className={SALE_ENTRY_INP}
          disabled={refsLoading}
        />
        <DropdownInput
          label="Customer"
          options={customerOptions}
          value={selectedCustomerId}
          onChange={setSelectedCustomerId}
          widthPx={200}
          heightPx={SALE_ENTRY_H}
          labelClassName={SALE_ENTRY_LBL}
          className={SALE_ENTRY_INP}
          disabled={refsLoading}
        />
        <DropdownInput
          label="Quotation"
          options={quotationDropdownOptions}
          value={selectedQuotationId}
          onChange={handleQuotationChange}
          widthPx={200}
          heightPx={SALE_ENTRY_H}
          labelClassName={SALE_ENTRY_LBL}
          className={SALE_ENTRY_INP}
          disabled={!branchId || quotationsLoading || documentLoading}
        />
        <DropdownInput
          label="Delivery Order"
          options={deliveryOrderDropdownOptions}
          value={selectedDeliveryOrderId}
          onChange={handleDeliveryOrderChange}
          widthPx={200}
          heightPx={SALE_ENTRY_H}
          labelClassName={SALE_ENTRY_LBL}
          className={SALE_ENTRY_INP}
          disabled={!branchId || deliveryOrdersLoading || documentLoading}
        />
        {(refsError || documentError || saveError || accountsLoadError) && (
          <p className={`text-[10px] ${accountsLoadError && !saveError && !documentError && !refsError ? 'text-amber-800' : 'text-red-600'}`}>
            {saveError || documentError || refsError || accountsLoadError}
          </p>
        )}
        {documentLoading && <p className="text-[10px] text-neutral-500">Loading document…</p>}
      </div>

      {/* Entry bar */}
      <div className="flex min-w-0 shrink-0 flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:p-3">
        {useReturnHeaderForm ? (
          <>
            <DropdownInput label="Return type" options={['Full','Partial','Credit note','Exchange']} value={returnForm.returnType} onChange={(v) => setReturnForm((f) => ({ ...f, returnType: v }))} widthPx={110} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} />
            <SubInputField label="Bill no" widthPx={80} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={returnForm.billNo} onChange={(e) => setReturnForm((f) => ({ ...f, billNo: e.target.value }))} />
            <SubInputField label="Counter no" widthPx={80} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={returnForm.counterNo} onChange={(e) => setReturnForm((f) => ({ ...f, counterNo: e.target.value }))} />
            <DateInputField label="Bill date" widthPx={110} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} value={returnForm.billDate} onChange={(v) => setReturnForm((f) => ({ ...f, billDate: v }))} />
            <DropdownInput label="Payment mode" options={['Cash','Card','Bank Transfer','Credit','Cheque']} value={returnForm.paymentMode} onChange={(v) => setReturnForm((f) => ({ ...f, paymentMode: v }))} widthPx={120} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} />
            <DropdownInput label="Station" options={['Main','Branch 1','Branch 2','Warehouse']} value={returnForm.station} onChange={(v) => setReturnForm((f) => ({ ...f, station: v }))} widthPx={110} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} />
            <div className="flex items-end">
              <button type="button" onClick={handleReturnAdd} className="inline-flex shrink-0 items-center justify-center rounded border px-3 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary, height: SALE_ENTRY_H, minHeight: SALE_ENTRY_H }}>
                {editingRowIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0">
              <SubInputField label="Own Ref.#" widthPx={66} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.ownRef} onChange={(e) => setForm((f) => ({ ...f, ownRef: e.target.value }))} />
            </div>
            <div className="shrink-0" style={{ width: 82 }}>
              <button type="button" className={`mb-0.5 block ${SALE_ENTRY_LBL} hover:text-[var(--pr)]`} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} onClick={() => openProductPicker(form.productCode || form.shortDescription)}>
                Product Code <img src={SearchIcon} alt="" className="inline h-2.5 w-2.5 opacity-60" />
              </button>
              <SubInputField label="" widthPx={82} heightPx={SALE_ENTRY_H} className={SALE_ENTRY_INP} value={form.productCode} onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))} onDoubleClick={() => openProductPicker(form.productCode || form.shortDescription)} />
            </div>
            <div className="shrink-0" style={{ width: 130 }}>
              <button type="button" className={`mb-0.5 block ${SALE_ENTRY_LBL} hover:text-[var(--pr)]`} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} onClick={() => openProductPicker(form.productCode || form.shortDescription)}>
                Short Desc <img src={SearchIcon} alt="" className="inline h-2.5 w-2.5 opacity-60" />
              </button>
              <InputField label="" widthPx={130} heightPx={SALE_ENTRY_H} className={SALE_ENTRY_INP} value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} onDoubleClick={() => openProductPicker(form.productCode || form.shortDescription)} />
            </div>
            <div className="shrink-0">
              <SubInputField label="HS Code" widthPx={70} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.hsCode} onChange={(e) => setForm((f) => ({ ...f, hsCode: e.target.value }))} />
            </div>
            <div className="shrink-0">
              <SubInputField id={SALE_FIELD_IDS.qty} label="Qty" type="number" widthPx={46} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.qty} onChange={(e) => mergeFormAndCalc({ qty: e.target.value })} onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); focusSaleLineField(SALE_FIELD_IDS.unitPrice); }} />
            </div>
            <div className="shrink-0">
              <SubInputField label="FOC Qty" type="number" widthPx={50} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.focQty} onChange={(e) => setForm((f) => ({ ...f, focQty: e.target.value }))} />
            </div>
            <div className="shrink-0">
              <SubInputField label="Unit Cost" type="number" widthPx={64} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.unitCost} onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))} />
            </div>
            <div className="shrink-0">
              <SubInputField id={SALE_FIELD_IDS.unitPrice} label="Unit Price" type="number" widthPx={64} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.unitPrice} onChange={(e) => mergeFormAndCalc({ unitPrice: e.target.value })} onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); focusSaleLineField(SALE_FIELD_IDS.discAmt); }} />
            </div>
            <div className="shrink-0">
              <SubInputField label="Disc. %" type="number" widthPx={50} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.discPercent} onChange={(e) => mergeFormAndCalc({ discPercent: e.target.value })} />
            </div>
            <div className="shrink-0">
              <SubInputField id={SALE_FIELD_IDS.discAmt} label="Disc. Amt" type="number" widthPx={64} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.discAmt} onChange={(e) => mergeFormAndCalc({ discAmt: e.target.value })} onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); focusSaleLineField(SALE_FIELD_IDS.total); }} />
            </div>
            <div className="shrink-0">
              <SubInputField label="Sub Total" type="number" widthPx={72} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.subTotal} readOnly tabIndex={-1} />
            </div>
            <div className="shrink-0">
              <SubInputField label="Tax %" type="number" widthPx={46} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.taxPercent} onChange={(e) => mergeFormAndCalc({ taxPercent: e.target.value })} />
            </div>
            <div className="shrink-0">
              <SubInputField label="Tax Amt" type="number" widthPx={60} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.taxAmt} readOnly tabIndex={-1} />
            </div>
            <div className="shrink-0">
              <SubInputField id={SALE_FIELD_IDS.total} label="Total" type="number" widthPx={72} heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={form.total} readOnly tabIndex={0} onKeyDown={(e) => { if (e.key !== 'Enter') return; e.preventDefault(); handleSaveOrUpdate(); }} />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={handleSaveOrUpdate} className="inline-flex shrink-0 items-center justify-center rounded border px-3 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary, height: SALE_ENTRY_H, minHeight: SALE_ENTRY_H }}>
                {editingRowIndex !== null ? 'Update' : 'Add Line'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* Left: line-item table */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <CommonTable
              className="sale-tbl"
              fitParentWidth
              stickyHeader
              hideOuterBorder
              headers={['','Own Ref.#','Product Code','Short Description','HS Code','Qty','FOC Qty','Unit Cost','Unit Price','Disc. %','Disc. Amt','Sub. Total','Tax%','T.Amt','Total','Action']}
              rows={tableBodyRows}
            />
          </div>
          <TableTotalsBar borderColor="#e5e5e5" items={saleTableTotals} />
        </div>

        {/* Right panel: Sales Details + TabsBar */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200 xl:min-w-0">

          {/* Always-visible: Sales Details */}
          <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-3 flex flex-col gap-2.5">
            <span className="pur-lbl">Sales Details</span>
            <div className="grid grid-cols-2 gap-2">
              <SubInputField label="Bill No" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.returnBillNo} onChange={(e) => setBillPanel((p) => ({ ...p, returnBillNo: e.target.value }))} />
              <SubInputField label="Local Bill No" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.localBillNo} onChange={(e) => setBillPanel((p) => ({ ...p, localBillNo: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SubInputField label="Cust. LPO #" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.custLpo} onChange={(e) => setBillPanel((p) => ({ ...p, custLpo: e.target.value }))} />
              <SubInputField label="Counter #" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.counterNo} onChange={(e) => setBillPanel((p) => ({ ...p, counterNo: e.target.value }))} />
            </div>
            <div>
              <label className={`mb-0.5 block ${SALE_ENTRY_LBL}`}>Bill Date</label>
              <DatePickerInput fullWidth heightPx={34} borderRadius={4} placeholder="DD/MM/YYYY" displayFontSize={10} background="#fff" dropdownInViewport value={billPanel.returnBillDate} onChange={(e) => setBillPanel((p) => ({ ...p, returnBillDate: e.target.value }))} />
            </div>
          </div>

          {/* TabsBar */}
          <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
            <TabsBar
              fullWidth
              tabs={[{ id: 'summary', label: 'Summary' }, { id: 'payment', label: 'Payment' }]}
              activeTab={rightTab}
              onChange={setRightTab}
            />
          </div>

          {/* Tab content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
            {rightTab === 'summary' && (
              <div className="flex flex-col gap-3">
                <span className="pur-lbl">Summary</span>
                <div className="pur-summary-card" role="region" aria-label="Amount summary">
                  <div className="pur-summary-row">
                    <span className="pur-summary-label">Sub Total</span>
                    <span className="pur-summary-value">{summaryFromGrid.subTotal}</span>
                  </div>
                  <div className="pur-summary-pair-grid">
                    <div className="pur-summary-row pur-summary-row-dense">
                      <span className="pur-summary-label">Disc Amt</span>
                      <input type="number" value={summaryPanel.discAmt} onChange={(e) => setSummaryPanel((s) => ({ ...s, discAmt: e.target.value }))} className="w-16 rounded border border-gray-200 bg-white px-1.5 text-right text-[11px] tabular-nums outline-none" style={{ height: 22 }} />
                    </div>
                    <div className="pur-summary-row pur-summary-row-dense">
                      <span className="pur-summary-label">Disc %</span>
                      <input type="number" value={summaryPanel.discPct} onChange={(e) => setSummaryPanel((s) => ({ ...s, discPct: e.target.value }))} title="Extra invoice discount % on sum of line totals" className="w-14 rounded border border-gray-200 bg-white px-1.5 text-right text-[11px] tabular-nums outline-none" style={{ height: 22 }} />
                    </div>
                  </div>
                  <div className="pur-summary-row">
                    <span className="pur-summary-label">Total Amount</span>
                    <span className="pur-summary-value">{summaryFromGrid.totalAmount}</span>
                  </div>
                  <div className="pur-summary-pair-grid">
                    <div className="pur-summary-row pur-summary-row-dense">
                      <span className="pur-summary-label">Tax</span>
                      <span className="pur-summary-value pur-summary-value-sm">{summaryFromGrid.taxAmt}</span>
                    </div>
                    <div className="pur-summary-row pur-summary-row-dense">
                      <span className="pur-summary-label">Tax %</span>
                      <span className="pur-summary-value pur-summary-value-sm">{summaryFromGrid.taxPctDisplay || '0'}%</span>
                    </div>
                  </div>
                  <div className="pur-summary-row pur-summary-row-dense">
                    <span className="pur-summary-label">Round Off</span>
                    <input type="number" value={summaryPanel.roundOff} onChange={(e) => setSummaryPanel((s) => ({ ...s, roundOff: e.target.value }))} title="Adjustment added to amount after discount" className="w-20 rounded border border-gray-200 bg-white px-2 text-right text-[11px] tabular-nums outline-none" style={{ height: 24 }} />
                  </div>
                  <div className="pur-summary-net">
                    <span className="pur-summary-label">Net Amount</span>
                    <span className="pur-summary-value">{summaryFromGrid.netAmount}</span>
                  </div>
                </div>

                <span className="pur-lbl">Receipt Account</span>
                <div className="flex flex-wrap items-end gap-1.5">
                  <div className="min-w-0 flex-1">
                    <DropdownInput label="Account head" fullWidth placeholder="— Select ledger —" value={receiptLedgerId} onChange={(v) => setReceiptLedgerId(v)} options={accountHeadOptions} disabled={!branchId} title="Cash/card ledger for this sale" heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} />
                  </div>
                  <button type="button" className="pur-btn mb-0.5 shrink-0 inline-flex h-7 items-center rounded-md border border-neutral-200 bg-white px-2 text-[9px] font-medium text-neutral-700" disabled={!branchId} onClick={() => setReceiptLedgerId('')}>Clear</button>
                </div>

                <span className="pur-lbl">Billing</span>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><DateInputField label="Payment Date" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} value={billPanel.paymentDate} onChange={(v) => setBillPanel((p) => ({ ...p, paymentDate: v }))} /></div>
                    <div><InputField label="Invoice Amt" type="number" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.invoiceAmt} onChange={(e) => setBillPanel((p) => ({ ...p, invoiceAmt: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><InputField label="Credit Card No" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.creditCardNo} onChange={(e) => setBillPanel((p) => ({ ...p, creditCardNo: e.target.value }))} /></div>
                    <div><InputField label="Credit Card" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.creditCard} onChange={(e) => setBillPanel((p) => ({ ...p, creditCard: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><DropdownInput label="Cashier" options={['Cashier 1','Cashier 2']} placeholder="Select" fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.cashierName} onChange={(v) => setBillPanel((p) => ({ ...p, cashierName: v }))} /></div>
                    <div><DropdownInput label="Station" options={['Main','Branch 1','Branch 2','Warehouse']} fullWidth heightPx={SALE_ENTRY_H} labelClassName={SALE_ENTRY_LBL} className={SALE_ENTRY_INP} value={billPanel.station} onChange={(v) => setBillPanel((p) => ({ ...p, station: v }))} /></div>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'payment' && (
              <div className="flex flex-col gap-3">
                <span className="pur-lbl">Payment</span>
                <div className="flex flex-col gap-1">
                  <label className={SALE_ENTRY_LBL}>Sales Terms</label>
                  <textarea value={billPanel.salesTerms} onChange={(e) => setBillPanel((p) => ({ ...p, salesTerms: e.target.value }))} rows={3} className="pur-ta" placeholder="Enter sales terms..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className={SALE_ENTRY_LBL}>Paid Amount</label>
                    <input type="number" value={billPanel.paidAmount} onChange={(e) => setBillPanel((p) => ({ ...p, paidAmount: e.target.value }))} className="pur-fi" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={SALE_ENTRY_LBL}>Balance Amount</label>
                    <input type="number" value={billPanel.balanceAmount} onChange={(e) => setBillPanel((p) => ({ ...p, balanceAmount: e.target.value }))} className="pur-fi" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {productPickerOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm"
          onClick={() => { setProductPickerOpen(false); setProductPickerSearch(''); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pp-title"
        >
          <div
            className="s-modal flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            style={{ border: '1px solid #e2dfd9' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: 4, background: `linear-gradient(90deg,${primary} 0%,#85203E 35%,#923A53 65%,#C44972 100%)` }} />
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 px-4 py-2.5">
              <h2 id="pp-title" className="text-sm font-bold" style={{ color: primary }}>Pick product</h2>
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
                onClick={() => { setProductPickerOpen(false); setProductPickerSearch(''); }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="shrink-0 border-b border-stone-100 px-4 py-2.5">
              <div className="relative">
                <img src={SearchIcon} alt="" className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
                <input
                  ref={productPickerSearchRef}
                  type="search"
                  value={productPickerSearch}
                  onChange={(e) => setProductPickerSearch(e.target.value)}
                  placeholder="Search barcode or short description…"
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
                  {!branchId ? 'Choose a branch first.' : productsCatalog.length === 0 ? 'No products for this branch.' : 'No matches — try another search.'}
                </p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {filteredPickerProducts.map((p) => (
                    <li key={p.productId}>
                      <button
                        type="button"
                        className="flex w-full gap-2 px-2 py-2 text-left text-[11px] hover:bg-rose-50/90 sm:gap-3 sm:text-xs"
                        onClick={() => applyPickedProduct(p)}
                      >
                        <span className="min-w-0 flex-1 font-mono text-stone-900">{p.barCode || '—'}</span>
                        <span className="min-w-0 flex-[1.6] text-stone-700">{p.shortDescription}</span>
                        <span className="shrink-0 tabular-nums text-stone-600">{Number(p.unitPrice || 0).toFixed(2)}</span>
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
        message={pendingDelete?.mode === 'bulk' ? `This will remove ${selectedRows.size} selected row(s). This action cannot be undone.` : 'This will remove the row from the sale. This action cannot be undone.'}
        confirmLabel="Delete" cancelLabel="Cancel" danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => { if (!pendingDelete) return; if (pendingDelete.mode === 'bulk') handleDeleteSelected(); else handleDelete(pendingDelete.idx); }}
      />

      {/* Privilege warnings override dialog */}
      {privilegeWarnings && privilegeWarnings.length > 0 && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm"
          onClick={() => { setPrivilegeWarnings(null); setPendingSavePayload(null); }}
          role="dialog" aria-modal="true" aria-labelledby="priv-title"
        >
          <div
            className="s-modal flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            style={{ border: '1px solid #e2dfd9' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: 4, background: `linear-gradient(90deg,#b91c1c 0%,#dc2626 50%,#ef4444 100%)` }} />
            <div className="px-5 pt-4 pb-2">
              <h2 id="priv-title" className="text-sm font-bold text-red-700">Privilege Warnings</h2>
              <p className="mt-1 text-[10px] text-stone-600 sm:text-[11px]">
                The following checks failed. You can override and save anyway, or cancel and fix the issues.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
              <ul className="list-disc pl-4 space-y-1">
                {privilegeWarnings.map((w, i) => (
                  <li key={i} className="text-[10px] text-red-800 sm:text-[11px]">{w}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-5 py-3">
              <button
                type="button"
                className="s-bb s-bb-cancel"
                onClick={() => { setPrivilegeWarnings(null); setPendingSavePayload(null); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="s-bb s-bb-save"
                disabled={saveLoading}
                onClick={handleOverrideSave}
              >
                {saveLoading ? 'Saving...' : 'Override & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} role="dialog" aria-modal="true" aria-labelledby="pd-title">
          <div className="s-modal relative mx-4 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl sm:max-w-lg" style={{ border:'1px solid #e2dfd9' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ height:4, background:`linear-gradient(90deg,${primary} 0%,#85203E 35%,#923A53 65%,#C44972 100%)` }} />
            <button type="button" onClick={() => setSelectedProduct(null)} className="absolute right-3 top-4 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="px-5 pt-4 pb-5 sm:px-6">
              <h2 id="pd-title" className="mb-4 text-center text-sm font-bold tracking-tight" style={{ color:primary }}>Product Details</h2>
              <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 sm:grid-cols-[130px_1fr] sm:gap-y-2">
                {[['Product code',selectedProduct.productCode],['Stock on hand',selectedProduct.stockOnHand],['Last customer',selectedProduct.lastCustomer],
                  ['Unit cost',selectedProduct.unitCost],['Min unit price',selectedProduct.minUnitPrice],['Profit',selectedProduct.profit],
                  ['Credit limit',selectedProduct.creditLimit],['Current OS bal',selectedProduct.currentOsBal],['OS balance',selectedProduct.osBalance],
                  ['Receipt no',selectedProduct.receiptNo],['Location',selectedProduct.location],
                ].map(([label, value]) => (
                  <React.Fragment key={label}>
                    <span className="flex items-center text-[9px] font-semibold text-gray-500 sm:text-[10px]" style={{ minHeight:26 }}>{label}</span>
                    <span className="flex items-center rounded border border-gray-200 bg-gray-50 px-2 text-[9px] text-gray-800 sm:text-[10px]" style={{ minHeight:26 }}>{value}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
