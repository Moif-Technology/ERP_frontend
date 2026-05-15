import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getSessionCompany,
  getSessionUser,
} from "../../../core/auth/auth.service.js";
import * as groupEntryApi from "../../../services/groupEntry.api.js";
import * as productEntryApi from "../../../services/productEntry.api.js";
import * as staffEntryApi from "../../../services/staffEntry.api.js";
import * as subGroupEntryApi from "../../../services/subGroupEntry.api.js";
import CancelIcon from "../../../shared/assets/icons/cancel.svg";
import DeleteActionIcon from "../../../shared/assets/icons/delete2.svg";
import EditActionIcon from "../../../shared/assets/icons/edit4.svg";
import PostIcon from "../../../shared/assets/icons/post.svg";
import PrinterIcon from "../../../shared/assets/icons/printer.svg";
import UnpostIcon from "../../../shared/assets/icons/unpost.svg";
import {
  CommonTable,
  ConfirmDialog,
  TabsBar,
  TableTotalsBar,
} from "../../../shared/components/ui";
import { colors } from "../../../shared/constants/theme";

// ─── Icons ────────────────────────────────────────────────────────────────────
function SaveIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function PlusIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function EditPenIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function ChevronIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function numStr(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? String(n) : "";
}

function normalizeText(v) {
  return String(v ?? "").trim();
}

function normalizeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10000) / 10000 : 0;
}

function firstFilled(...values) {
  return values.find((v) => String(v ?? "").trim() !== "") ?? "";
}

function moneyFromVatInclusive(gross, ratePct) {
  const grossNum = Number(gross);
  if (!Number.isFinite(grossNum) || gross === "") return "";
  const rateNum = Number(ratePct);
  if (!Number.isFinite(rateNum) || rateNum <= 0) return String(grossNum);
  return String(Math.round((grossNum / (1 + rateNum / 100)) * 100) / 100);
}

function moneyWithVat(net, ratePct) {
  const netNum = Number(net);
  if (!Number.isFinite(netNum) || net === "") return "";
  const rateNum = Number(ratePct);
  if (!Number.isFinite(rateNum) || rateNum <= 0) return String(netNum);
  return String(Math.round((netNum * (1 + rateNum / 100)) * 100) / 100);
}

function authSaveMessage(err) {
  if (err.response?.status === 401) {
    return "Session expired or unauthorized. Please login again, then update the product.";
  }
  return err.response?.data?.message || "Save failed.";
}

// ─── Initial state ────────────────────────────────────────────────────────────
const mainInitial = {
  productCode: "", barcode: "", description: "", shortDescription: "",
  descriptionArabic: "", productOwnRefNo: "", makeType: "Standard",
  lastSupplier: "", specification: "", productBrand: "", groupId: "",
  newBarcode: false, subGroupId: "", subSubGroup: "", averageCost: "",
  lastPurchCost: "", marginPct: "", minUnitPrice: "", unitPrice: "",
  baseCost: "", discountPct: "", unitCost: "", vatIn: "", vatInPct: "",
  vatOut: "", vatOutPct: "", costWithVat: "", priceWithVat: "", priceLevel1: "",
};
const supplierInitial = {
  supplier: "", supplierRefNo: "", unit: "", productType: "Stock",
  packQty: "", stockType: "Normal", packetDetails: "", location: "Main",
  origin: "", reorderLevel: "", reorderQty: "", remark: "", qtyOnHand: "",
  productIdentity: "",
};
const lineFormInitial = {
  barcode: "", shortDescription: "", unit: "", packQty: "", packetDetails: "",
  discPct: "", unitCost: "", avgCost: "", lastCost: "", marginPct: "", unitPrice: "",
};

const ENTRY_TABS = [
  { id: "general",   label: "General",         icon: "⬡" },
  { id: "inventory", label: "Stock & Supplier", icon: "◉" },
  { id: "trading",   label: "Trading",         icon: "◎" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({ label, children, span = 4 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }} className="pe2-field">
      <label className="pe2-label">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder = "", disabled = false, mono = false }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`pe2-input${mono ? " pe2-mono" : ""}${disabled ? " pe2-input--disabled" : ""}`}
    />
  );
}

function SelectInput({ value, onChange, options, disabled = false }) {
  return (
    <div className="pe2-select-wrap">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="pe2-select">
        <option value="">— select —</option>
        {options.map((o) =>
          typeof o === "string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      <span className="pe2-select-arrow"><ChevronIcon size={10} /></span>
    </div>
  );
}

function SectionCard({ title, accent = false, bodyClassName = "", children }) {
  return (
    <div className={`pe2-card${accent ? " pe2-card--accent" : ""}`}>
      <div className="pe2-card-header">
        <span className="pe2-card-dot" />
        <span className="pe2-card-title">{title}</span>
      </div>
      <div className={`pe2-card-body ${bodyClassName}`.trim()}>{children}</div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  variant = "ghost",
  disabled = false,
  icon,
  small = false,
  style,
  className = "",
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`pe2-btn pe2-btn--${variant}${small ? " pe2-btn--sm" : ""}${disabled ? " pe2-btn--disabled" : ""} ${className}`.trim()}
      {...rest}
    >
      {icon && <span className="pe2-btn-icon">{icon}</span>}
      {children}
    </button>
  );
}

function ImageUpload({ previews, onPreviewsChange }) {
  const inputRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);

  const readFiles = (files) => {
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = (e) => onPreviewsChange((p) => [...p, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const removeAt = (e, idx) => {
    e.stopPropagation();
    onPreviewsChange((p) => p.filter((_, i) => i !== idx));
    setActiveIdx((p) => Math.max(0, p >= idx ? p - 1 : p));
  };

  const mainImg = previews[activeIdx] || null;

  return (
    <div className="pe2-img-wrap">
      <div
        className={`pe2-img-drop${drag ? " drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); readFiles(e.dataTransfer.files); }}
      >
        {mainImg ? (
          <>
            <img src={mainImg} alt="Product" className="pe2-img-preview" />
            <button type="button" className="pe2-img-remove" onClick={(e) => removeAt(e, activeIdx)}>×</button>
          </>
        ) : (
          <div className="pe2-img-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="pe2-img-hint">Drop images here</p>
            <p className="pe2-img-sub">or click to browse · PNG JPG WEBP</p>
          </div>
        )}
      </div>

      <div className="pe2-thumb-strip">
        {previews.map((p, i) => (
          <div key={i} className={`pe2-thumb${i === activeIdx ? " active" : ""}`} onClick={() => setActiveIdx(i)}>
            <img src={p} alt="" />
            <button type="button" className="pe2-thumb-del" onClick={(e) => removeAt(e, i)}>×</button>
          </div>
        ))}
        <div className="pe2-thumb-add" onClick={() => inputRef.current?.click()}>+</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => readFiles(e.target.files)}
      />
    </div>
  );
}

function LineEntryBar({ lineForm, setLineForm, onAdd, isEditing }) {
  const FIELDS = [
    { label: "Barcode",     key: "barcode",          w: 90 },
    { label: "Description", key: "shortDescription", w: 140 },
    { label: "Unit",        key: "unit",             w: 58 },
    { label: "Pack Qty",    key: "packQty",          w: 64 },
    { label: "Pkt Details", key: "packetDetails",    w: 100 },
    { label: "Disc %",      key: "discPct",          w: 54 },
    { label: "Unit Cost",   key: "unitCost",         w: 70 },
    { label: "Avg Cost",    key: "avgCost",          w: 70 },
    { label: "Last Cost",   key: "lastCost",         w: 70 },
    { label: "Margin %",    key: "marginPct",        w: 68 },
    { label: "Unit Price",  key: "unitPrice",        w: 72 },
  ];

  return (
    <div className="flex min-w-0 flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-slate-50/70 p-2">
      {FIELDS.map((f) => (
        <div key={f.key} className="flex shrink-0 flex-col gap-0.5" style={{ width: f.w }}>
          <span className="pe2-label">{f.label}</span>
          <input
            type="text"
            value={lineForm[f.key]}
            onChange={(e) => setLineForm((p) => ({ ...p, [f.key]: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            className="pe2-entry-input"
          />
        </div>
      ))}
      <div className="flex shrink-0 items-end">
        <button type="button" onClick={onAdd} className="pe2-entry-add-btn">
          {isEditing ? "Update" : "Add Line"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductEntry() {
  const primary = colors.primary?.main || "#790728";
  const user = getSessionUser();
  const company = getSessionCompany();

  const [searchParams] = useSearchParams();
  const editProductId = searchParams.get("productId");
  const editBranchId = searchParams.get("branchId");
  const isEditMode = Boolean(editProductId);

  const softwareType = (company?.softwareType || company?.software_type || "RESTAURANT").toUpperCase();
  const showProductCode = !["RESTAURANT", "POS"].includes(softwareType);

  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subGroups, setSubGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadBranchesError, setLoadBranchesError] = useState("");
  const [mastersError, setMastersError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [main, setMain] = useState(mainInitial);
  const [supplier, setSupplier] = useState(supplierInitial);
  const [lineForm, setLineForm] = useState(lineFormInitial);
  const [lineRows, setLineRows] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [substituteRows, setSubstituteRows] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [entryTab, setEntryTab] = useState("general");
  const [imagePreviews, setImagePreviews] = useState([]);

  // 1. Load branches
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      try {
        const { data } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        const list = data.branches || [];
        setBranches(list);
        if (isEditMode && editBranchId) {
          setBranchId(editBranchId);
        } else {
          const station = user?.stationId != null ? String(user.stationId) : "";
          const inList = list.some((b) => String(b.branchId) === station);
          if (list.length === 1) setBranchId(String(list[0].branchId));
          else if (inList) setBranchId(station);
        }
      } catch {
        if (!cancelled) setLoadBranchesError("Could not load branches.");
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.stationId]); // eslint-disable-line

  // 2. Load groups
  useEffect(() => {
    if (!branchId) {
      setGroups([]);
      if (!isEditMode) setMain((m) => ({ ...m, groupId: "", subGroupId: "" }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await groupEntryApi.fetchGroups(Number(branchId));
        if (cancelled) return;
        setGroups(data.groups || []);
        if (!isEditMode) setMain((m) => ({ ...m, groupId: "", subGroupId: "" }));
      } catch {
        if (!cancelled) {
          setGroups([]);
          setMastersError("Could not load groups.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [branchId]); // eslint-disable-line

  // 3. Load subgroups
  useEffect(() => {
    if (!branchId || !main.groupId) {
      setSubGroups([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await subGroupEntryApi.fetchSubGroups(Number(branchId), Number(main.groupId));
        if (cancelled) return;
        setSubGroups(data.subGroups || []);
      } catch {
        if (!cancelled) setSubGroups([]);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId, main.groupId]);

  // 4. Load products
  useEffect(() => {
    if (!branchId) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const { data } = await productEntryApi.fetchProducts(Number(branchId));
        if (cancelled) return;
        setProducts(data.products || []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId]);

  // 5. Edit prefill
  useEffect(() => {
    if (!isEditMode || !editProductId || !branchId || loadingBranches) return;
    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      setEditError("");
      try {
        const { data } = await productEntryApi.fetchProductById(editProductId, branchId);
        if (cancelled) return;
        const p = data.product ?? data;
        const inv = p.inventory || {};
        setMain({
          productCode: p.productCode || "",
          barcode: p.barcode || "",
          description: p.productName || "",
          shortDescription: p.shortName || "",
          descriptionArabic: p.descriptionArabic || "",
          productOwnRefNo: p.ownRefNo != null ? String(p.ownRefNo) : "",
          makeType: p.makeType || "Standard",
          lastSupplier: p.lastSupplierId ? String(p.lastSupplierId) : "",
          specification: p.specification || "",
          productBrand: p.brandName || (p.brandId ? String(p.brandId) : ""),
          groupId: p.groupId ? String(p.groupId) : "",
          newBarcode: false,
          subGroupId: p.subgroupId ? String(p.subgroupId) : "",
          subSubGroup: p.subsubgroupId ? String(p.subsubgroupId) : "",
          averageCost: numStr(inv.averageCost),
          lastPurchCost: numStr(inv.lastPurchaseCost),
          marginPct: numStr(inv.minimumMarginPercentage),
          minUnitPrice: numStr(inv.minimumRetailPrice),
          unitPrice: numStr(inv.unitPrice),
          baseCost: numStr(inv.lastPurchaseCost),
          discountPct: numStr(inv.discountPercentage),
          unitCost: numStr(inv.averageCost),
          vatIn: numStr(inv.inputTax1Amount),
          vatInPct: numStr(inv.inputTax1Rate),
          vatOut: numStr(inv.outputTax1Amount),
          vatOutPct: numStr(inv.outputTax1Rate),
          costWithVat: moneyWithVat(inv.averageCost, inv.inputTax1Rate),
          priceWithVat: moneyWithVat(inv.unitPrice, inv.outputTax1Rate),
          priceLevel1: numStr(inv.priceLevel1),
        });
        setSupplier({
          supplier: p.lastSupplierId ? String(p.lastSupplierId) : "",
          supplierRefNo: p.supplierRefNo || "",
          unit: p.unitName || "",
          productType: p.productType || "Stock",
          packQty: numStr(inv.packQty || p.packQty),
          stockType: p.stockType || "Normal",
          packetDetails: p.packDescription || "",
          location: inv.locationCode || "Main",
          origin: p.countryOfOrigin || "",
          reorderLevel: numStr(inv.reorderLevel),
          reorderQty: numStr(inv.reorderQty),
          remark: p.remarks || "",
          qtyOnHand: numStr(inv.qtyOnHand),
          productIdentity: p.productIdentity != null ? (Number(p.productIdentity) === 1 ? "Yes" : "No") : "",
        });
      } catch (err) {
        if (!cancelled) setEditError(err.response?.data?.message || "Could not load product.");
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEditMode, editProductId, branchId, loadingBranches]);

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: String(b.branchId), label: `${b.branchCode} — ${b.branchName}` })),
    [branches]
  );
  const groupOptions = useMemo(
    () => groups.map((g) => ({ value: String(g.groupId), label: `${g.groupCode} — ${g.groupDescription || g.groupCode}` })),
    [groups]
  );
  const subGroupOptions = useMemo(
    () => subGroups.map((s) => ({ value: String(s.subGroupId), label: `${s.subGroupCode} — ${s.subGroupDescription || s.subGroupCode}` })),
    [subGroups]
  );

  const buildPayload = () => {
    const gid = main.groupId ? Number(main.groupId) : undefined;
    const sgid = main.subGroupId ? Number(main.subGroupId) : undefined;
    const subSub = main.subSubGroup?.trim();
    const code = showProductCode
      ? main.productCode.trim()
      : main.productCode.trim() || main.description.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 20);
    const averageCost = firstFilled(
      moneyFromVatInclusive(main.costWithVat, main.vatInPct),
      main.unitCost,
      main.averageCost,
      main.baseCost
    );
    const unitPrice = firstFilled(
      moneyFromVatInclusive(main.priceWithVat, main.vatOutPct),
      main.unitPrice
    );

    return {
      branchId: Number(branchId),
      productCode: code,
      barcode: main.barcode.trim() || undefined,
      description: main.description.trim(),
      shortDescription: main.shortDescription.trim() || undefined,
      descriptionArabic: main.descriptionArabic.trim() || undefined,
      productOwnRefNo: main.productOwnRefNo.trim() || undefined,
      makeType: main.makeType,
      lastSupplier: main.lastSupplier.trim() || undefined,
      productBrand: main.productBrand.trim() || undefined,
      specification: main.specification.trim() || undefined,
      groupId: gid,
      subGroupId: sgid,
      subSubGroupId: subSub ? Number(subSub) : undefined,
      newBarcode: main.newBarcode,
      baseCost: main.baseCost,
      discountPct: main.discountPct,
      unitCost: main.unitCost,
      vatIn: main.vatIn,
      vatInPct: main.vatInPct,
      costWithVat: main.costWithVat,
      averageCost,
      lastPurchCost: firstFilled(main.lastPurchCost, averageCost, main.unitCost, main.baseCost),
      marginPct: main.marginPct,
      minUnitPrice: main.minUnitPrice,
      unitPrice,
      vatOut: main.vatOut,
      vatOutPct: main.vatOutPct,
      priceWithVat: main.priceWithVat,
      priceLevel1: main.priceLevel1,
      productType: supplier.productType,
      stockType: supplier.stockType,
      unit: supplier.unit.trim() || undefined,
      packQty: supplier.packQty,
      packetDetails: supplier.packetDetails,
      location: supplier.location,
      reorderLevel: supplier.reorderLevel,
      reorderQty: supplier.reorderQty,
      qtyOnHand: supplier.qtyOnHand,
      productIdentity: supplier.productIdentity,
      remark: supplier.remark,
      supplierRefNo: supplier.supplierRefNo.trim() || undefined,
      origin: supplier.origin.trim() || undefined,
    };
  };

  const refreshProducts = async () => {
    if (!branchId) return;
    try {
      const { data } = await productEntryApi.fetchProducts(Number(branchId));
      setProducts(data.products || []);
    } catch {}
  };

  const verifyUpdatedProduct = async (payload) => {
    const { data } = await productEntryApi.fetchProductById(editProductId, payload.branchId);
    const saved = data.product ?? data;
    const inv = saved.inventory || {};
    const mismatches = [];

    if (normalizeText(saved.productCode) !== normalizeText(payload.productCode)) mismatches.push("product code");
    if (normalizeText(saved.productName) !== normalizeText(payload.description)) mismatches.push("product name");
    if (normalizeText(saved.shortName) !== normalizeText(payload.shortDescription)) mismatches.push("short description");
    if (normalizeNumber(inv.unitPrice) !== normalizeNumber(payload.unitPrice)) mismatches.push("unit price");
    if (normalizeNumber(inv.averageCost) !== normalizeNumber(payload.averageCost)) mismatches.push("unit cost");
    if (normalizeNumber(inv.lastPurchaseCost) !== normalizeNumber(payload.lastPurchCost)) mismatches.push("last purchase cost");
    if (normalizeNumber(inv.qtyOnHand) !== normalizeNumber(payload.qtyOnHand)) mismatches.push("quantity on hand");
    if (normalizeText(payload.productIdentity)) {
      const savedIdentity = saved.productIdentity != null ? (Number(saved.productIdentity) === 1 ? "Yes" : "No") : "";
      if (normalizeText(savedIdentity) !== normalizeText(payload.productIdentity)) mismatches.push("product identity");
    }

    return mismatches;
  };

  const handleSave = async () => {
    setSaveError("");
    setSuccessMsg("");

    if (!branchId) {
      setSaveError("Select a branch.");
      return;
    }
    if (showProductCode && !main.productCode.trim()) {
      setSaveError("Product code is required.");
      return;
    }
    if (!main.description.trim()) {
      setSaveError("Product name is required.");
      return;
    }

    const subSub = main.subSubGroup?.trim();
    if (subSub && !Number.isFinite(Number(subSub))) {
      setSaveError("Sub-subgroup must be numeric.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEditMode) {
        const { data } = await productEntryApi.updateProduct(editProductId, payload);
        const mismatches = await verifyUpdatedProduct(payload);
        if (mismatches.length) {
          setSaveError(`Update request finished, but server read-back did not match: ${mismatches.join(", ")}. Restart the API server and try again.`);
          return;
        }
        setSuccessMsg(`✓ Updated — ${data.productCode}`);
      } else {
        const { data } = await productEntryApi.createProduct(payload);
        setSuccessMsg(`✓ Created — ${data.productCode} (id ${data.productId})`);
        setMain((prev) => ({ ...mainInitial, groupId: prev.groupId, subGroupId: prev.subGroupId }));
      }
      await refreshProducts();
    } catch (err) {
      setSaveError(authSaveMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleRowSel = (idx) => setSelectedRows((p) => {
    const n = new Set(p);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });

  const handleLineAdd = () => {
    const qty = Number(lineForm.packQty) || 1;
    const price = Number(lineForm.unitPrice) || 0;
    const discPct = Number(lineForm.discPct) || 0;
    const discAmt = (qty * price * discPct) / 100;
    const subTot = (qty * price) - discAmt;
    const taxPct = Number(main.vatOutPct) || 0;
    const taxAmt = (subTot * taxPct) / 100;
    const total = subTot + taxAmt;
    const r = [
      lineForm.shortDescription || "-",
      lineForm.barcode || "-",
      qty,
      price,
      discPct,
      discAmt,
      subTot,
      taxPct,
      taxAmt,
      total,
    ];

    if (editingIdx !== null) {
      setLineRows((p) => {
        const n = [...p];
        n[editingIdx] = r;
        return n;
      });
      setEditingIdx(null);
    } else {
      setLineRows((p) => [r, ...p]);
    }
    setLineForm(lineFormInitial);
  };

  const handleLineEdit = (r, idx) => {
    setLineForm({
      ...lineFormInitial,
      barcode: String(r[1] ?? ""),
      shortDescription: String(r[0] ?? ""),
      packQty: String(r[2] ?? ""),
      discPct: String(r[4] ?? ""),
      unitPrice: String(r[3] ?? ""),
    });
    setEditingIdx(idx);
  };

  const handleLineDel = (idx) => {
    setLineRows((p) => p.filter((_, i) => i !== idx));
    setSelectedRows((p) => new Set([...p].filter((i) => i !== idx).map((i) => i > idx ? i - 1 : i)));
    if (editingIdx === idx) {
      setEditingIdx(null);
      setLineForm(lineFormInitial);
    } else if (editingIdx !== null && editingIdx > idx) {
      setEditingIdx((i) => i - 1);
    }
  };

  const handleSubAdd = () => {
    const code = String(searchCode ?? "").trim();
    const name = String(searchName ?? "").trim();
    if (!code && !name) return;
    setSubstituteRows((p) => [...p, { productCode: code || "-", productName: name || "-", unitPrice: "-" }]);
    setSearchName("");
    setSearchCode("");
  };

  const handleSubDel = (idx) => setSubstituteRows((p) => p.filter((_, i) => i !== idx));

  const totQty   = lineRows.reduce((s, r) => s + Number(r[2] ?? 0), 0);
  const totPrice = lineRows.reduce((s, r) => s + Number(r[3] ?? 0), 0);
  const totDisc  = lineRows.reduce((s, r) => s + Number(r[5] ?? 0), 0);
  const totSub   = lineRows.reduce((s, r) => s + Number(r[6] ?? 0), 0);
  const totTaxP  = lineRows.reduce((s, r) => s + Number(r[7] ?? 0), 0);
  const totTaxA  = lineRows.reduce((s, r) => s + Number(r[8] ?? 0), 0);
  const totLine  = lineRows.reduce((s, r) => s + Number(r[9] ?? 0), 0);
  const saveLabel = saving ? (isEditMode ? "Updating…" : "Saving…") : (isEditMode ? "Update Product" : "Save Product");

  return (
    <div className="pe2 box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col rounded-lg border-2 border-gray-200 bg-white shadow-sm">
      <style>{`
        .pe2 {
          --red: ${primary};
          --red-l: #8f0a31;
          --red-bg: rgba(121, 7, 40, 0.08);
          --red-brd: rgba(121, 7, 40, 0.18);
          --green: #047857;
          --amber: #b45309;

          --bg: #faf8f9;
          --surface: #ffffff;
          --surface-2: #f8fafc;
          --surface-3: #f1f5f9;

          --border: #d1d5db;
          --border2: #e5e7eb;

          --ink: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --panel-shadow: 0 1px 2px 0 rgba(15,23,42,0.06);

          --radius: 6px;
          --radius-lg: 8px;

          font-family: "Open Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
          overflow: hidden;
          color: var(--ink);
        }

        .pe2-header {
          flex-shrink: 0;
          padding: 8px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .pe2-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pe2-breadcrumb {
          font-size: 9px;
          color: #94a3b8;
          letter-spacing: .2em;
          text-transform: uppercase;
          margin-bottom: 2px;
          font-weight: 600;
        }

        .pe2-breadcrumb span {
          color: #cbd5e1;
        }

        .pe2-title {
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: 0;
          line-height: 1.2;
        }

        .pe2-title em {
          font-style: normal;
          color: var(--red);
        }

        .pe2-title-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .pe2-header-caption {
          font-size: 11px;
          line-height: 1.35;
          color: var(--muted);
        }

        .pe2-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .pe2-edit-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: var(--amber);
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 999px;
          padding: 4px 9px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .pe2-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: var(--radius);
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .15s ease, border-color .15s ease, background .15s ease, box-shadow .15s ease;
          border: 1px solid transparent;
          padding: 0 14px;
          height: 32px;
          min-height: 32px;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .pe2-btn--sm {
          height: 32px;
          font-size: 11px;
          padding: 0 12px;
        }

        .pe2-btn--ghost {
          background: #ffffff;
          border-color: #e5e7eb;
          color: var(--ink);
          box-shadow: 0 1px 2px rgba(15,23,42,0.06);
        }

        .pe2-btn--ghost:hover {
          opacity: .9;
          border-color: #d1d5db;
        }

        .pe2-btn--primary {
          background: var(--red);
          border-color: rgba(121, 7, 40, .6);
          color: #fff;
          box-shadow: 0 1px 2px rgba(15,23,42,0.06);
        }

        .pe2-btn--primary:hover {
          opacity: .9;
          box-shadow: 0 1px 2px rgba(15,23,42,0.06);
        }

        .pe2-btn--danger {
          background: #fff;
          border-color: #fecdd3;
          color: #dc2626;
        }

        .pe2-btn--danger:hover {
          opacity: .9;
        }

        .pe2-btn--surface {
          background: var(--surface);
          border-color: #e5e7eb;
          color: var(--ink);
        }

        .pe2-btn--surface:hover {
          border-color: #d1d5db;
        }

        .pe2-btn--disabled {
          opacity: .42;
          cursor: not-allowed;
          pointer-events: none;
        }

        .pe2-btn-icon {
          display: flex;
          align-items: center;
          opacity: .9;
        }

        .pe2-branch-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .pe2-branch-select {
          appearance: none;
          height: 34px;
          min-width: 220px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: #ffffff;
          color: var(--ink);
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          padding: 0 34px 0 12px;
          cursor: pointer;
          outline: none;
          box-shadow: 0 1px 2px rgba(15,23,42,0.06);
        }

        .pe2-branch-select:focus {
          border-color: #d1d5db;
          box-shadow: 0 0 0 2px rgba(121, 7, 40, 0.13);
        }

        .pe2-branch-select:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .pe2-branch-arrow {
          position: absolute;
          right: 8px;
          color: var(--muted);
          pointer-events: none;
          display: flex;
        }

        .pe2-alerts {
          flex-shrink: 0;
          padding: 8px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pe2-alert {
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .pe2-alert--error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #9f1239;
        }

        .pe2-alert--warn {
          background: #fffbeb;
          border: 1px solid #fde3a7;
          color: #9a6700;
        }

        .pe2-alert--success {
          background: #edfdf3;
          border: 1px solid #b7ebc6;
          color: #0f6b3c;
        }

        .pe2-body {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          background: var(--bg);
        }

        .pe2-canvas {
          height: 100%;
          overflow-y: auto;
        }

        .pe2-workspace {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 100%;
        }

        .pe2-tabbar {
          display: block;
        }

        .pe2-tab-panel {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
        }

        .pe2-tab-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pe2-tab-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 110px;
          padding: 8px 14px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: opacity .15s ease, border-color .15s ease, background .15s ease;
          text-align: center;
        }

        .pe2-tab-btn:hover {
          border-color: #d1d5db;
        }

        .pe2-tab-btn[data-active="true"] {
          border-color: rgba(121, 7, 40, 0.22);
          background: rgba(121, 7, 40, 0.06);
          box-shadow: none;
        }

        .pe2-tab-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--ink);
        }

        .pe2-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 12px;
          align-items: start;
        }

        .pe2-layout--general {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.05fr) 300px;
          gap: 12px;
          align-items: start;
        }

        .pe2-layout--split {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }

        .pe2-layout--single {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pe2-inventory-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: 12px;
          align-items: start;
        }

        .pe2-trading-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.82fr);
          gap: 12px;
          align-items: start;
        }

        .pe2-main-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .pe2-side-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          position: sticky;
          top: 0;
        }

        .pe2-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .pe2-panel-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .pe2-subsection {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pe2-subsection + .pe2-subsection {
          padding-top: 12px;
          border-top: 1px solid var(--border2);
        }

        .pe2-subtitle {
          font-size: 13px;
          font-weight: 600;
          color: #000000;
          text-transform: none;
          letter-spacing: 0;
        }

        .pe2-section-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .pe2-section-grid--three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        @media (max-width: 1180px) {
          .pe2-layout {
            grid-template-columns: 1fr;
          }

          .pe2-layout--general {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .pe2-layout,
          .pe2-layout--split,
          .pe2-section-grid,
          .pe2-inventory-layout,
          .pe2-trading-layout {
            grid-template-columns: 1fr;
          }

          .pe2-side-col {
            position: static;
          }

        }

        @media (max-width: 640px) {
          .pe2-workspace,
          .pe2-header,
          .pe2-alerts {
            padding-left: 10px;
            padding-right: 10px;
          }

          .pe2-title {
            font-size: 24px;
          }
        }

        .pe2-card {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--panel-shadow);
        }

        .pe2-card--accent {
          border-color: var(--red-brd);
          box-shadow: var(--panel-shadow);
          background: #fff;
        }

        .pe2-card-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          padding: 10px 16px 8px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
        }

        .pe2-card-headline {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pe2-card-dot {
          width: 0;
          height: 0;
          border-radius: 50%;
          background: var(--red);
          flex-shrink: 0;
        }

        .pe2-card-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--red);
          text-transform: none;
          letter-spacing: 0;
        }

        .pe2-card-sub {
          font-size: 11px;
          color: var(--muted);
        }

        .pe2-card-body {
          padding: 12px 16px 14px;
        }

        .pe2-card-body--compact {
          padding: 12px 16px 14px;
        }

        .pe2-grid {
          display: grid;
          gap: 12px 16px;
          grid-template-columns: repeat(12, minmax(0, 1fr));
        }

        .pe2-grid--tight {
          gap: 12px;
        }

        .pe2-grid-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .pe2-grid > .pe2-field {
          grid-column: span 4;
        }

        @media (max-width: 920px) {
          .pe2-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }

          .pe2-grid > .pe2-field {
            grid-column: span 3;
          }
        }

        @media (max-width: 640px) {
          .pe2-grid {
            grid-template-columns: 1fr;
          }

          .pe2-grid > .pe2-field {
            grid-column: span 1 !important;
          }
        }

        .pe2-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .pe2-label {
          min-height: 16px;
          font-size: 13px;
          line-height: 16px;
          font-weight: 500;
          color: #000000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pe2-input,
        .pe2-select,
        .pe2-textarea {
          font-family: inherit;
        }

        .pe2-input {
          height: 34px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          font-weight: 400;
          padding: 0 10px;
          transition: border-color .15s, box-shadow .15s, background .15s;
          width: 100%;
          outline: none;
        }

        .pe2-input:focus,
        .pe2-select:focus,
        .pe2-textarea:focus,
        .pe2-line-input:focus,
        .pe2-branch-select:focus {
          border-color: #d1d5db;
          box-shadow: 0 0 0 2px rgba(121, 7, 40, 0.13);
          background: #fff;
        }

        .pe2-input--disabled {
          background: #f1f5f9;
          color: var(--faint);
          cursor: not-allowed;
        }

        .pe2-mono {
          font-size: 14px;
          font-family: inherit;
        }

        .pe2-select-wrap {
          position: relative;
        }

        .pe2-select {
          appearance: none;
          width: 100%;
          height: 34px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          font-weight: 400;
          padding: 0 30px 0 10px;
          cursor: pointer;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }

        .pe2-select-arrow {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--faint);
          display: flex;
          align-items: center;
        }

        .pe2-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          font-weight: 400;
          padding: 8px 10px;
          resize: vertical;
          min-height: 96px;
          outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }

        .pe2-textarea--compact {
          min-height: 84px;
        }

        .pe2-barcode-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 999px;
          cursor: pointer;
          border: 1px solid;
          transition: all .15s;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .pe2-barcode-toggle--off {
          border-color: var(--border);
          background: #f8fafc;
          color: var(--muted);
        }

        .pe2-barcode-toggle--on {
          border-color: var(--red-brd);
          background: var(--red-bg);
          color: var(--red);
        }

        .pe2-supplier-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media (max-width: 740px) {
          .pe2-supplier-grid {
            grid-template-columns: 1fr;
          }
        }

        .pe2-img-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          min-height: 280px;
        }

        .pe2-img-drop {
          flex: 1;
          border: 1px dashed #cbd5e1;
          border-radius: var(--radius-lg);
          background: #f8fafc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          transition: border-color .18s, background .18s;
          min-height: 240px;
        }

        .pe2-img-drop:hover,
        .pe2-img-drop.drag {
          border-color: var(--red);
          background: #fff;
        }

        .pe2-img-preview {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .pe2-img-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(121, 7, 40, .76);
          border: none;
          color: #fff;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pe2-img-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 24px;
          text-align: center;
          pointer-events: none;
          color: var(--faint);
        }

        .pe2-img-hint {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin: 0;
        }

        .pe2-img-sub {
          font-size: 9.5px;
          margin: 0;
          letter-spacing: .04em;
        }

        .pe2-thumb-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 0;
          align-items: center;
          min-height: 50px;
        }

        .pe2-thumb {
          width: 54px;
          height: 54px;
          border-radius: 10px;
          flex-shrink: 0;
          cursor: pointer;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border2);
          transition: border-color .15s, box-shadow .15s;
          background: #fff;
        }

        .pe2-thumb.active {
          border-color: var(--red);
          box-shadow: 0 0 0 2px var(--red-bg);
        }

        .pe2-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pe2-thumb-del {
          position: absolute;
          top: 1px;
          right: 1px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: rgba(121, 7, 40, .80);
          border: none;
          color: #fff;
          font-size: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pe2-thumb-add {
          width: 54px;
          height: 54px;
          border-radius: 10px;
          flex-shrink: 0;
          cursor: pointer;
          border: 1px dashed #cbd5e1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--faint);
          font-size: 20px;
          font-weight: 300;
          transition: border-color .15s, color .15s, background .15s;
        }

        .pe2-thumb-add:hover {
          border-color: var(--red);
          color: var(--red);
          background: var(--red-bg);
        }

        .pe2-table-wrap {
          border: 1px solid var(--border2);
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .pe2-table-wrap--sub {
          border-radius: 8px;
          border-color: var(--border2);
          background: #fff;
          box-shadow: inset 0 1px 0 #fff;
        }

        .pe2-substitute-form {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 10px;
          align-items: end;
        }

        .pe2-substitute-action {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .pe2-entry-input {
          box-sizing: border-box;
          height: 34px;
          min-height: 34px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          font-weight: 400;
          font-family: inherit;
          padding: 0 10px;
          outline: none;
          width: 100%;
          transition: border-color .15s, box-shadow .15s;
        }

        .pe2-entry-input:focus {
          border-color: #d1d5db;
          box-shadow: 0 0 0 2px rgba(121, 7, 40, 0.13);
        }

        .pe2-entry-add-btn {
          height: 34px;
          border: none;
          border-radius: var(--radius);
          background: var(--red);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          padding: 0 16px;
          white-space: nowrap;
          transition: opacity .15s;
        }

        .pe2-entry-add-btn:hover { opacity: .88; }

        @media (max-width: 680px) {
          .pe2-substitute-form {
            grid-template-columns: 1fr;
          }

          .pe2-substitute-form > .pe2-field,
          .pe2-substitute-action {
            grid-column: span 1 !important;
          }
        }

        .pe2-side-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Scrollbar */
        .pe2-canvas::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .pe2-canvas::-webkit-scrollbar-track {
          background: transparent;
        }

        .pe2-canvas::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>

      <header className="pe2-header">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            {isEditMode ? 'EDIT PRODUCT' : 'PRODUCT ENTRY'}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative inline-flex items-center">
              <select
                value={branchId}
                onChange={(e) => { setBranchId(e.target.value); setSaveError(""); setSuccessMsg(""); }}
                disabled={loadingBranches || isEditMode}
                className="h-7 appearance-none rounded-md border border-neutral-200 bg-white pl-2.5 pr-7 text-xs font-medium text-neutral-700 outline-none transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ minWidth: '11rem' }}
              >
                {branchOptions.length === 0 && <option value="">Loading…</option>}
                {branchOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400">
                <ChevronIcon size={10} />
              </span>
            </div>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-gray-300 hover:bg-gray-50">
              <img src={PrinterIcon} alt="" className="h-3 w-3" /> Print
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-gray-300 hover:bg-gray-50">
              <img src={CancelIcon} alt="" className="h-3 w-3" /> Cancel
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-gray-300 hover:bg-gray-50">
              <img src={PostIcon} alt="" className="h-3 w-3" /> Post
            </button>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-gray-300 hover:bg-gray-50">
              <img src={UnpostIcon} alt="" className="h-3 w-3" /> Unpost
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingEdit}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: primary, borderColor: primary }}
            >
              <SaveIcon size={12} /> {saveLabel}
            </button>
          </div>
        </div>
        {isEditMode && (
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
              <EditPenIcon size={10} /> Editing · ID {editProductId}{loadingEdit && ' · Loading…'}
            </span>
          </div>
        )}
      </header>

      {(loadBranchesError||mastersError||saveError||successMsg||editError||(loadingEdit&&!editError))&&(
        <div className="pe2-alerts">
          {loadingEdit&&!editError && <div className="pe2-alert pe2-alert--warn">Loading product data…</div>}
          {editError         && <div className="pe2-alert pe2-alert--error">{editError}</div>}
          {loadBranchesError && <div className="pe2-alert pe2-alert--error">{loadBranchesError}</div>}
          {mastersError      && <div className="pe2-alert pe2-alert--warn">{mastersError}</div>}
          {saveError         && <div className="pe2-alert pe2-alert--error">{saveError}</div>}
          {successMsg        && <div className="pe2-alert pe2-alert--success">{successMsg}</div>}
        </div>
      )}

      <div className="pe2-body">
        <div className="pe2-canvas">
          <div className="pe2-workspace">
            <TabsBar
              tabs={ENTRY_TABS.map((t) => ({ id: t.id, label: t.label }))}
              activeTab={entryTab}
              onChange={setEntryTab}
            />

            {entryTab === "general" && (
              <div className="pe2-layout--single">
                <div className="pe2-layout--general">
                  <div className="pe2-col">
                    <SectionCard title="Product Identity">
                      <div className="pe2-grid">
                        <div className="pe2-field" style={{ gridColumn: "span 6" }}>
                          <span className="pe2-label">Barcode</span>
                          <div style={{ display: "flex", alignItems: "stretch" }}>
                            <input
                              type="text"
                              value={main.barcode}
                              onChange={(e) => setMain(m => ({ ...m, barcode: e.target.value }))}
                              placeholder={main.newBarcode ? "Auto-generated on save" : ""}
                              disabled={main.newBarcode}
                              className="pe2-mono"
                              style={{
                                flex: 1,
                                minWidth: 0,
                                height: 34,
                                border: "1px solid var(--border)",
                                borderRight: "none",
                                borderRadius: "var(--radius) 0 0 var(--radius)",
                                background: main.newBarcode ? "#f1f5f9" : "#fff",
                                color: main.newBarcode ? "var(--faint)" : "var(--ink)",
                                fontSize: 13,
                                padding: "0 10px",
                                outline: "none",
                                cursor: main.newBarcode ? "not-allowed" : "text",
                                fontFamily: "inherit",
                                transition: "border-color .15s, box-shadow .15s, background .15s",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setMain(m => ({ ...m, newBarcode: !m.newBarcode }))}
                              title={main.newBarcode ? "Switch to manual barcode entry" : "Switch to auto-generated barcode"}
                              style={{
                                flexShrink: 0,
                                height: 34,
                                padding: "0 10px",
                                border: "1px solid",
                                borderRadius: "0 var(--radius) var(--radius) 0",
                                fontSize: 10,
                                fontWeight: 700,
                                fontFamily: "inherit",
                                letterSpacing: ".07em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                transition: "all .15s",
                                ...(main.newBarcode
                                  ? {
                                      borderColor: "var(--red-brd)",
                                      background: "var(--red-bg)",
                                      color: "var(--red)",
                                    }
                                  : {
                                      borderColor: "var(--border)",
                                      background: "#f8fafc",
                                      color: "var(--muted)",
                                    }),
                              }}
                            >
                              <span style={{
                                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                                background: main.newBarcode ? "var(--red)" : "var(--faint)",
                                transition: "background .15s",
                              }} />
                              {main.newBarcode ? "Auto" : "Manual"}
                            </button>
                          </div>
                        </div>
                        <Field label="Own Ref No." span={6}>
                          <TextInput mono value={main.productOwnRefNo} onChange={(e)=>setMain(m=>({...m,productOwnRefNo:e.target.value}))}/>
                        </Field>
                        {showProductCode && (
                          <Field label="Product Code *" span={6}>
                            <TextInput mono value={main.productCode} onChange={(e)=>setMain(m=>({...m,productCode:e.target.value}))}/>
                          </Field>
                        )}
                        <Field label="Product Name *" span={showProductCode ? 6 : 12}>
                          <TextInput value={main.description} onChange={(e)=>setMain(m=>({...m,description:e.target.value}))}/>
                        </Field>
                        <Field label="Short Description" span={6}>
                          <TextInput value={main.shortDescription} onChange={(e)=>setMain(m=>({...m,shortDescription:e.target.value}))}/>
                        </Field>
                        <Field label="Arabic Description" span={6}>
                          <TextInput value={main.descriptionArabic} onChange={(e)=>setMain(m=>({...m,descriptionArabic:e.target.value}))}/>
                        </Field>
                      </div>
                    </SectionCard>

                    <SectionCard title="Grouping">
                      <div className="pe2-grid">
                        <Field label="Group" span={6}>
                          <SelectInput value={main.groupId} onChange={(v)=>setMain(m=>({...m,groupId:v,subGroupId:""}))} options={groupOptions} disabled={!branchId||!groupOptions.length}/>
                        </Field>
                        <Field label="Subgroup" span={6}>
                          <SelectInput value={main.subGroupId} onChange={(v)=>setMain(m=>({...m,subGroupId:v}))} options={subGroupOptions} disabled={!branchId||!main.groupId}/>
                        </Field>
                      </div>
                    </SectionCard>

                    <SectionCard title="Classification">
                      <div className="pe2-grid">
                        <Field label="Make Type" span={6}>
                          <SelectInput value={main.makeType} onChange={(v)=>setMain(m=>({...m,makeType:v}))} options={["Standard","Assembly","Service"]}/>
                        </Field>
                        <Field label="Brand" span={6}>
                          <TextInput value={main.productBrand} onChange={(e)=>setMain(m=>({...m,productBrand:e.target.value}))}/>
                        </Field>
                        <Field label="Sub-subgroup ID" span={6}>
                          <TextInput mono value={main.subSubGroup} onChange={(e)=>setMain(m=>({...m,subSubGroup:e.target.value}))} placeholder="Numeric"/>
                        </Field>
                        <Field label="Last Supplier" span={6}>
                          <TextInput value={main.lastSupplier} onChange={(e)=>setMain(m=>({...m,lastSupplier:e.target.value}))}/>
                        </Field>
                      </div>
                    </SectionCard>
                  </div>

                  <div className="pe2-col">
                    <SectionCard title="Pricing & VAT">
                      <div className="pe2-subsection">
                        <div className="pe2-subtitle">Cost Structure</div>
                        <div className="pe2-grid pe2-grid--tight">
                          <Field label="Base Cost" span={6}><TextInput mono value={main.baseCost} onChange={(e)=>setMain(m=>({...m,baseCost:e.target.value}))}/></Field>
                          <Field label="Discount %" span={6}><TextInput mono value={main.discountPct} onChange={(e)=>setMain(m=>({...m,discountPct:e.target.value}))}/></Field>
                          <Field label="Unit Cost" span={6}><TextInput mono value={main.unitCost} onChange={(e)=>setMain(m=>({...m,unitCost:e.target.value}))}/></Field>
                          <Field label="Margin %" span={6}><TextInput mono value={main.marginPct} onChange={(e)=>setMain(m=>({...m,marginPct:e.target.value}))}/></Field>
                          <Field label="Average Cost" span={6}><TextInput mono value={main.averageCost} onChange={(e)=>setMain(m=>({...m,averageCost:e.target.value}))}/></Field>
                          <Field label="Last Purchase Cost" span={6}><TextInput mono value={main.lastPurchCost} onChange={(e)=>setMain(m=>({...m,lastPurchCost:e.target.value}))}/></Field>
                        </div>
                      </div>

                      <div className="pe2-subsection">
                        <div className="pe2-subtitle">Output Pricing</div>
                        <div className="pe2-grid pe2-grid--tight">
                          <Field label="Min Unit Price" span={6}><TextInput mono value={main.minUnitPrice} onChange={(e)=>setMain(m=>({...m,minUnitPrice:e.target.value}))}/></Field>
                          <Field label="Unit Price" span={6}><TextInput mono value={main.unitPrice} onChange={(e)=>setMain(m=>({...m,unitPrice:e.target.value}))}/></Field>
                          <Field label="Price Level 1" span={6}><TextInput mono value={main.priceLevel1} onChange={(e)=>setMain(m=>({...m,priceLevel1:e.target.value}))}/></Field>
                          <Field label="Price With VAT" span={6}><TextInput mono value={main.priceWithVat} onChange={(e)=>setMain(m=>({...m,priceWithVat:e.target.value}))}/></Field>
                        </div>
                      </div>

                      <div className="pe2-subsection">
                        <div className="pe2-subtitle">VAT</div>
                        <div className="pe2-grid pe2-grid--tight">
                          <Field label="VAT In Amt" span={4}><TextInput mono value={main.vatIn} onChange={(e)=>setMain(m=>({...m,vatIn:e.target.value}))}/></Field>
                          <Field label="VAT In %" span={4}><TextInput mono value={main.vatInPct} onChange={(e)=>setMain(m=>({...m,vatInPct:e.target.value}))}/></Field>
                          <Field label="Cost With VAT" span={4}><TextInput mono value={main.costWithVat} onChange={(e)=>setMain(m=>({...m,costWithVat:e.target.value}))}/></Field>
                          <Field label="VAT Out Amt" span={4}><TextInput mono value={main.vatOut} onChange={(e)=>setMain(m=>({...m,vatOut:e.target.value}))}/></Field>
                          <Field label="VAT Out %" span={4}><TextInput mono value={main.vatOutPct} onChange={(e)=>setMain(m=>({...m,vatOutPct:e.target.value}))}/></Field>
                          <Field label="Price With VAT" span={4}><TextInput mono value={main.priceWithVat} onChange={(e)=>setMain(m=>({...m,priceWithVat:e.target.value}))}/></Field>
                        </div>
                      </div>
                    </SectionCard>
                  </div>

                <div className="pe2-side-col">
                  <SectionCard title="Product Images" accent>
                    <ImageUpload previews={imagePreviews} onPreviewsChange={setImagePreviews}/>
                  </SectionCard>
                  <SectionCard title="Specification">
                    <textarea className="pe2-textarea pe2-textarea--compact" value={main.specification} onChange={(e)=>setMain(m=>({...m,specification:e.target.value}))} rows={5} placeholder="Technical specification, notes, internal remark..."/>
                  </SectionCard>
                </div>
              </div>
              </div>
            )}

            {entryTab === "inventory" && (
              <div className="pe2-layout--single">
                <SectionCard title="Stock & Supplier" bodyClassName="pe2-card-body--compact">
                  <div className="pe2-subsection">
                    <div className="pe2-subtitle">Supplier Details</div>
                    <div className="pe2-grid pe2-grid--tight">
                      <Field label="Supplier" span={3}><TextInput value={supplier.supplier} onChange={(e)=>setSupplier(s=>({...s,supplier:e.target.value}))}/></Field>
                      <Field label="Supplier Ref No" span={3}><TextInput mono value={supplier.supplierRefNo} onChange={(e)=>setSupplier(s=>({...s,supplierRefNo:e.target.value}))}/></Field>
                      <Field label="Unit" span={3}><TextInput value={supplier.unit} onChange={(e)=>setSupplier(s=>({...s,unit:e.target.value}))}/></Field>
                      <Field label="Product Type" span={3}><SelectInput value={supplier.productType} onChange={(v)=>setSupplier(s=>({...s,productType:v}))} options={["Stock","Non-stock","Service"]}/></Field>
                      <Field label="Pack Qty" span={3}><TextInput mono value={supplier.packQty} onChange={(e)=>setSupplier(s=>({...s,packQty:e.target.value}))}/></Field>
                      <Field label="Stock Type" span={3}><SelectInput value={supplier.stockType} onChange={(v)=>setSupplier(s=>({...s,stockType:v}))} options={["Normal","Batch","Serial"]}/></Field>
                      <Field label="Packet Details" span={3}><TextInput value={supplier.packetDetails} onChange={(e)=>setSupplier(s=>({...s,packetDetails:e.target.value}))}/></Field>
                      <Field label="Location" span={3}><SelectInput value={supplier.location} onChange={(v)=>setSupplier(s=>({...s,location:v}))} options={["Main","Warehouse A","Warehouse B"]}/></Field>
                      <Field label="Origin" span={8}><TextInput value={supplier.origin} onChange={(e)=>setSupplier(s=>({...s,origin:e.target.value}))}/></Field>
                      <Field label="Product Identity" span={4}><SelectInput value={supplier.productIdentity} onChange={(v)=>setSupplier(s=>({...s,productIdentity:v}))} options={["Yes","No"]}/></Field>
                    </div>
                  </div>

                  <div className="pe2-subsection">
                    <div className="pe2-subtitle">Stock Controls</div>
                    <div className="pe2-grid pe2-grid--tight">
                      <Field label="Reorder Level" span={4}><TextInput mono value={supplier.reorderLevel} onChange={(e)=>setSupplier(s=>({...s,reorderLevel:e.target.value}))}/></Field>
                      <Field label="Reorder Qty" span={4}><TextInput mono value={supplier.reorderQty} onChange={(e)=>setSupplier(s=>({...s,reorderQty:e.target.value}))}/></Field>
                      <Field label="Qty On Hand" span={4}><TextInput mono value={supplier.qtyOnHand} onChange={(e)=>setSupplier(s=>({...s,qtyOnHand:e.target.value}))}/></Field>
                      <Field label="Remark" span={12}>
                        <textarea className="pe2-textarea pe2-textarea--compact" value={supplier.remark} onChange={(e)=>setSupplier(s=>({...s,remark:e.target.value}))} rows={5}/>
                      </Field>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {entryTab === "trading" && (
              <div className="pe2-layout--single">
                <div className="pe2-trading-layout">
                  <div className="pe2-main-col">
                    <LineEntryBar lineForm={lineForm} setLineForm={setLineForm} onAdd={handleLineAdd} isEditing={editingIdx!==null}/>

                    <SectionCard title={`Trading Lines${lineRows.length>0 ? ` · ${lineRows.length} rows` : ""}`}>
                      <div className="pe2-table-wrap" style={{overflowX:"auto"}}>
                        <CommonTable
                          fitParentWidth
                          maxVisibleRows={12}
                          headers={["","Description","Barcode","Qty","Price","Disc%","Disc Amt","Sub Total","Tax%","Tax Amt","Total","·"]}
                          rows={lineRows.map((r,idx)=>[
                            <input key={`c${idx}`} type="checkbox" checked={selectedRows.has(idx)} onChange={()=>toggleRowSel(idx)} style={{accentColor:"var(--red)",width:12,height:12}}/>,
                            r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],
                            <div key={`a${idx}`} style={{display:"flex",gap:3,justifyContent:"center"}}>
                              <button type="button" style={{border:"none",background:"none",cursor:"pointer",padding:2}} onClick={()=>handleLineEdit(r,idx)}><img src={EditActionIcon} width={12} alt=""/></button>
                              <button type="button" style={{border:"none",background:"none",cursor:"pointer",padding:2}} onClick={()=>setPendingDelete({type:"line",idx})}><img src={DeleteActionIcon} width={12} alt=""/></button>
                            </div>,
                          ])}
                        />
                      </div>
                      <TableTotalsBar
                        columns={8}
                        className="!py-1 !px-1.5 sm:!py-1 sm:!px-1.5 [&_.table-total-grid>div]:py-0.5 [&_.table-total-grid>div]:px-1.5 [&_[data-total-label]]:text-[7px] [&_[data-total-value]]:text-[8px]"
                        items={[
                          { label: 'Items',          value: lineRows.length },
                          { label: 'Qty Total',      value: totQty.toFixed(2) },
                          { label: 'Unit Price Sum',  value: totPrice.toFixed(2) },
                          { label: 'Line Discount',  value: totDisc.toFixed(2) },
                          { label: 'Sub Total',      value: totSub.toFixed(2) },
                          { label: 'Tax Total',      value: totTaxA.toFixed(2) },
                          { label: 'Header Disc',    value: '0.00' },
                          { label: 'Net Amount',     value: totLine.toFixed(2), strong: true },
                        ]}
                      />
                    </SectionCard>
                  </div>

                  <div className="pe2-side-stack">
                    <div className="pe2-card">
                      <div className="pe2-card-body">
                      <div className="pe2-subsection">
                        <div className="pe2-substitute-form">
                          <Field label="Product Name" span={6}><TextInput value={searchName} onChange={(e)=>setSearchName(e.target.value)}/></Field>
                          <Field label="Product Code" span={4}><TextInput mono value={searchCode} onChange={(e)=>setSearchCode(e.target.value)}/></Field>
                          <div className="pe2-substitute-action" style={{gridColumn:"span 2"}}>
                            <span className="pe2-label" style={{color:"transparent"}}>Action</span>
                            <ActionBtn icon={<PlusIcon size={12}/>} variant="primary" onClick={handleSubAdd}>Add</ActionBtn>
                          </div>
                        </div>
                      </div>

                      <div className="pe2-subsection">
                        <div className="pe2-table-wrap pe2-table-wrap--sub">
                          <CommonTable
                            fitParentWidth
                            maxVisibleRows={9}
                            columnWidthPercents={[45, 30, 15, 10]}
                            headers={["Product Name","Product Code","Unit Price","·"]}
                            rows={substituteRows.map((row,idx)=>[
                              row.productName,row.productCode,row.unitPrice??"-",
                              <div key={`sa${idx}`} style={{display:"flex",justifyContent:"center"}}>
                                <button type="button" style={{border:"none",background:"none",cursor:"pointer",padding:2}} onClick={()=>setPendingDelete({type:"substitute",idx})}>
                                  <img src={DeleteActionIcon} width={12} alt=""/>
                                </button>
                              </div>,
                            ])}
                          />
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete!==null}
        title={pendingDelete?.type==="substitute"?"Remove substitute?":"Delete line item?"}
        message={pendingDelete?.type==="substitute"?"This will remove the substitute from the list.":"This will remove the line row. This action cannot be undone."}
        confirmLabel="Delete" cancelLabel="Cancel" danger
        onClose={()=>setPendingDelete(null)}
        onConfirm={()=>{
          if(!pendingDelete) return;
          if(pendingDelete.type==="line") handleLineDel(pendingDelete.idx);
          else handleSubDel(pendingDelete.idx);
        }}
      />
    </div>
  );
}
