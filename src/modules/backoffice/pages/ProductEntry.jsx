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
  ConfirmDialog
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
    { label: "Barcode",     key: "barcode",          span: 3 },
    { label: "Description", key: "shortDescription", span: 5 },
    { label: "Unit",        key: "unit",             span: 2 },
    { label: "Pack Qty",    key: "packQty",          span: 2 },
    { label: "Pkt Details", key: "packetDetails",    span: 4 },
    { label: "Disc %",      key: "discPct",          span: 2 },
    { label: "Unit Cost",   key: "unitCost",         span: 2 },
    { label: "Avg Cost",    key: "avgCost",          span: 2 },
    { label: "Last Cost",   key: "lastCost",         span: 2 },
    { label: "Margin %",    key: "marginPct",        span: 3 },
    { label: "Unit Price",  key: "unitPrice",        span: 3 },
  ];

  return (
    <div className="pe2-line-shell">
      <div className="pe2-line-groups">
        <div className="pe2-line-group">
          <div className="pe2-line-group-title">Item Details</div>
          <div className="pe2-line-grid">
            {FIELDS.slice(0, 5).map((f) => (
              <div key={f.key} className="pe2-line-field" style={{ gridColumn: `span ${f.span}` }}>
                <span className="pe2-line-label">{f.label}</span>
                <input
                  type="text"
                  value={lineForm[f.key]}
                  onChange={(e) => setLineForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && onAdd()}
                  className="pe2-line-input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pe2-line-group">
          <div className="pe2-line-group-title">Pricing Details</div>
          <div className="pe2-line-grid pe2-line-grid--pricing">
            {FIELDS.slice(5).map((f) => (
              <div key={f.key} className="pe2-line-field" style={{ gridColumn: `span ${f.span}` }}>
                <span className="pe2-line-label">{f.label}</span>
                <input
                  type="text"
                  value={lineForm[f.key]}
                  onChange={(e) => setLineForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && onAdd()}
                  className="pe2-line-input"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pe2-line-actions">
        <button type="button" onClick={onAdd} className="pe2-line-add-btn">
          {isEditing ? "Update Line" : "Add Line"}
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

  const totDisc = lineRows.reduce((s, r) => s + Number(r[5] ?? 0), 0);
  const totSub = lineRows.reduce((s, r) => s + Number(r[6] ?? 0), 0);
  const totTaxP = lineRows.reduce((s, r) => s + Number(r[7] ?? 0), 0);
  const totTaxA = lineRows.reduce((s, r) => s + Number(r[8] ?? 0), 0);
  const totLine = lineRows.reduce((s, r) => s + Number(r[9] ?? 0), 0);
  const saveLabel = saving ? (isEditMode ? "Updating…" : "Saving…") : (isEditMode ? "Update Product" : "Save Product");

  return (
    <div className="pe2" style={{ margin: "-24px -28px -32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

        .pe2 {
          --red: ${primary};
          --red-l: #941236;
          --red-bg: rgba(121, 7, 40, 0.08);
          --red-brd: rgba(121, 7, 40, 0.18);
          --green: #0f6b3c;
          --amber: #9a6700;

          --bg: #f7f4f1;
          --surface: #ffffff;
          --surface-2: #fcf9f7;
          --surface-3: #f3ece7;

          --border: #e6ddd6;
          --border2: #f1e8e1;

          --ink: #2f2926;
          --muted: #766963;
          --faint: #a5958d;
          --panel-shadow: 0 6px 18px rgba(33, 26, 23, 0.04);

          --radius: 12px;
          --radius-lg: 20px;

          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
          overflow: hidden;
          color: var(--ink);
        }

        .pe2-header {
          position: relative;
          flex-shrink: 0;
          padding: 12px 16px 10px;
          border-bottom: 1px solid var(--border2);
          background: #fbf8f5;
        }

        .pe2-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pe2-breadcrumb,
        .pe2-edit-badge,
        .pe2-card-title,
        .pe2-label,
        .pe2-img-sub,
        .pe2-line-label,
        .pe2-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        .pe2-breadcrumb {
          font-size: 9px;
          color: var(--faint);
          letter-spacing: .14em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .pe2-breadcrumb span {
          color: #c694aa;
        }

        .pe2-title {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -.02em;
          line-height: 1.05;
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
          font-size: 9px;
          font-weight: 500;
          color: var(--amber);
          background: #fff8e7;
          border: 1px solid #f6d98b;
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
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s;
          border: 1px solid transparent;
          padding: 0 14px;
          height: 36px;
          letter-spacing: .01em;
          white-space: nowrap;
        }

        .pe2-btn--sm {
          height: 34px;
          font-size: 11px;
          padding: 0 12px;
        }

        .pe2-btn--ghost {
          background: #ffffff;
          border-color: var(--border);
          color: var(--ink);
          box-shadow: 0 1px 2px rgba(121, 7, 40, 0.04);
        }

        .pe2-btn--ghost:hover {
          background: var(--surface-3);
          border-color: #dcb4c4;
        }

        .pe2-btn--primary {
          background: var(--red);
          border-color: var(--red);
          color: #fff;
          box-shadow: 0 10px 22px rgba(121, 7, 40, .20);
        }

        .pe2-btn--primary:hover {
          background: var(--red-l);
          box-shadow: 0 12px 24px rgba(121, 7, 40, .24);
        }

        .pe2-btn--danger {
          background: #fff1f3;
          border-color: #f3c6cf;
          color: #b4233c;
        }

        .pe2-btn--danger:hover {
          background: #ffe7eb;
        }

        .pe2-btn--surface {
          background: var(--surface);
          border-color: var(--border);
          color: var(--ink);
        }

        .pe2-btn--surface:hover {
          border-color: #dcb4c4;
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
          height: 36px;
          min-width: 220px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #ffffff;
          color: var(--ink);
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 0 34px 0 12px;
          cursor: pointer;
          outline: none;
          box-shadow: 0 1px 2px rgba(121, 7, 40, 0.04);
        }

        .pe2-branch-select:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 3px var(--red-bg);
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
          border-radius: 14px;
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
          background: #fff8eb;
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
          padding: 14px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
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
          padding: 9px 14px;
          border-radius: 12px;
          border: 1px solid #e8e0da;
          background: #fff;
          cursor: pointer;
          transition: all .12s ease;
          text-align: center;
        }

        .pe2-tab-btn:hover {
          border-color: rgba(121, 7, 40, 0.18);
        }

        .pe2-tab-btn[data-active="true"] {
          border-color: rgba(121, 7, 40, 0.22);
          background: #fff7fa;
          box-shadow: none;
        }

        .pe2-tab-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
        }

        .pe2-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 16px;
          align-items: start;
        }

        .pe2-layout--general {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.05fr) 300px;
          gap: 16px;
          align-items: start;
        }

        .pe2-layout--split {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          align-items: start;
        }

        .pe2-layout--single {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pe2-inventory-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: 16px;
          align-items: start;
        }

        .pe2-trading-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.82fr);
          gap: 16px;
          align-items: start;
        }

        .pe2-main-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }

        .pe2-side-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
          position: sticky;
          top: 0;
        }

        .pe2-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }

        .pe2-panel-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
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
          font-size: 10px;
          font-weight: 700;
          color: var(--ink);
          text-transform: uppercase;
          letter-spacing: .12em;
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
          border-radius: 14px;
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
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px 10px;
          border-bottom: 1px solid var(--border2);
          background: #fcfaf8;
        }

        .pe2-card-headline {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pe2-card-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--red);
          flex-shrink: 0;
        }

        .pe2-card-title {
          font-size: 8px;
          font-weight: 500;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .pe2-card-sub {
          font-size: 11px;
          color: var(--muted);
        }

        .pe2-card-body {
          padding: 14px;
        }

        .pe2-card-body--compact {
          padding: 12px;
        }

        .pe2-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(12, minmax(0, 1fr));
        }

        .pe2-grid--tight {
          gap: 10px;
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
          gap: 6px;
          min-width: 0;
        }

        .pe2-label {
          font-size: 9px;
          font-weight: 500;
          color: var(--faint);
          text-transform: uppercase;
          letter-spacing: .14em;
        }

        .pe2-input,
        .pe2-select,
        .pe2-textarea {
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .pe2-input {
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          font-weight: 500;
          padding: 0 12px;
          transition: border-color .15s, box-shadow .15s, background .15s;
          width: 100%;
          outline: none;
        }

        .pe2-input:focus,
        .pe2-select:focus,
        .pe2-textarea:focus,
        .pe2-line-input:focus,
        .pe2-branch-select:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 3px var(--red-bg);
          background: #fff;
        }

        .pe2-input--disabled {
          background: #faf5f7;
          color: var(--faint);
          cursor: not-allowed;
        }

        .pe2-mono {
          font-size: 11.5px;
        }

        .pe2-select-wrap {
          position: relative;
        }

        .pe2-select {
          appearance: none;
          width: 100%;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          font-weight: 500;
          padding: 0 30px 0 12px;
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
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          font-size: 13px;
          padding: 11px 12px;
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
          font-size: 8.5px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 999px;
          cursor: pointer;
          border: 1px solid;
          transition: all .15s;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .pe2-barcode-toggle--off {
          border-color: var(--border);
          background: #faf5f7;
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
          min-height: 320px;
        }

        .pe2-img-drop {
          flex: 1;
          border: 1px dashed #e1d4db;
          border-radius: var(--radius-lg);
          background: #fcfaf8;
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
          background: #fff8fb;
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
          border: 1.5px solid var(--border2);
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
          border: 1.5px dashed #e7ccd6;
          background: #fffafb;
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
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
        }

        .pe2-table-wrap--sub {
          border-radius: 14px;
          border-color: #eadfe6;
          background: linear-gradient(180deg, #fff 0%, #fdfafb 100%);
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

        .pe2-line-shell {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pe2-line-groups {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .pe2-line-group {
          border: 1px solid var(--border2);
          border-radius: 18px;
          background: linear-gradient(180deg, #fff 0%, #fcfaf8 100%);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pe2-line-group-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--faint);
          text-transform: uppercase;
          letter-spacing: .16em;
        }

        .pe2-line-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 10px;
        }

        .pe2-line-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .pe2-line-field--action {
          justify-content: flex-end;
        }

        .pe2-line-label {
          font-size: 8.5px;
          color: var(--faint);
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .pe2-line-input {
          height: 38px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: #fff;
          color: var(--ink);
          font-size: 12px;
          padding: 0 10px;
          outline: none;
          width: 100%;
          transition: border-color .15s, box-shadow .15s;
        }

        .pe2-line-add-btn {
          height: 38px;
          min-width: 156px;
          border: none;
          border-radius: 10px;
          background: var(--red);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0 14px;
          transition: background .15s, box-shadow .15s;
          box-shadow: 0 6px 14px rgba(121, 7, 40, 0.16);
        }

        .pe2-line-add-btn:hover {
          background: var(--red-l);
        }

        .pe2-line-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 1100px) {
          .pe2-line-groups {
            grid-template-columns: 1fr;
          }

          .pe2-line-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }

          .pe2-line-field {
            grid-column: span 3 !important;
          }

          .pe2-line-field--action {
            grid-column: span 6 !important;
          }
        }

        @media (max-width: 680px) {
          .pe2-line-grid {
            grid-template-columns: 1fr;
          }

          .pe2-substitute-form {
            grid-template-columns: 1fr;
          }

          .pe2-line-field,
          .pe2-line-field--action {
            grid-column: span 1 !important;
          }

          .pe2-substitute-form > .pe2-field,
          .pe2-substitute-action {
            grid-column: span 1 !important;
          }
        }

        .pe2-side-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
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
          background: #d8c6ce;
          border-radius: 10px;
        }
      `}</style>

      <header className="pe2-header">
        <div className="pe2-header-top">
          <div className="pe2-title-copy">
            <p className="pe2-breadcrumb">Data Entry <span>/</span> Products <span>/</span> {isEditMode ? "Edit" : "New"}</p>
            <h1 className="pe2-title">{isEditMode ? <><em>Edit</em> Product</> : <>Product <em>Entry</em></>}</h1>
          </div>
          <div className="pe2-header-right">
            <div className="pe2-branch-wrap">
              <select className="pe2-branch-select" value={branchId} onChange={(e)=>{setBranchId(e.target.value);setSaveError("");setSuccessMsg("");}} disabled={loadingBranches||isEditMode}>
                {branchOptions.length===0&&<option value="">Loading…</option>}
                {branchOptions.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="pe2-branch-arrow"><ChevronIcon size={10}/></span>
            </div>
            <ActionBtn icon={<img src={PrinterIcon} alt="" width={12}/>} variant="ghost">Print</ActionBtn>
            <ActionBtn icon={<img src={CancelIcon} alt="" width={12}/>} variant="danger">Cancel</ActionBtn>
            <ActionBtn icon={<img src={PostIcon} alt="" width={12}/>} variant="ghost">Post</ActionBtn>
            <ActionBtn icon={<img src={UnpostIcon} alt="" width={12}/>} variant="ghost">Unpost</ActionBtn>
            <ActionBtn icon={<SaveIcon size={13}/>} variant="primary" onClick={handleSave} disabled={saving||loadingEdit}>{saveLabel}</ActionBtn>
          </div>
        </div>

        {isEditMode && (
          <div style={{marginTop:8}}>
            <div className="pe2-edit-badge">
              <EditPenIcon size={10}/>
              Editing · ID {editProductId}{loadingEdit&&" · Loading…"}
            </div>
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
            <div className="pe2-tabbar">
              <div className="pe2-tab-panel">
                <div className="pe2-tab-list">
                  {ENTRY_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className="pe2-tab-btn"
                      data-active={entryTab === tab.id ? "true" : "false"}
                      onClick={() => setEntryTab(tab.id)}
                    >
                      <span className="pe2-tab-title">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {entryTab === "general" && (
              <div className="pe2-layout--single">
                <div className="pe2-layout--general">
                  <div className="pe2-col">
                    <SectionCard title="Product Identity">
                      <div className="pe2-grid">
                        <div className="pe2-field" style={{ gridColumn: "span 6" }}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                            <span className="pe2-label">Barcode</span>
                            <button type="button" className={`pe2-barcode-toggle pe2-barcode-toggle--${main.newBarcode?"on":"off"}`} onClick={()=>setMain(m=>({...m,newBarcode:!m.newBarcode}))}>
                              {main.newBarcode ? "Auto" : "Manual"}
                            </button>
                          </div>
                          <TextInput mono value={main.barcode} onChange={(e)=>setMain(m=>({...m,barcode:e.target.value}))} placeholder={main.newBarcode ? "Auto-generated on save" : ""} disabled={main.newBarcode}/>
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
                    <SectionCard title="Add or Edit Line">
                      <LineEntryBar lineForm={lineForm} setLineForm={setLineForm} onAdd={handleLineAdd} isEditing={editingIdx!==null}/>
                    </SectionCard>

                    <SectionCard title={`Trading Lines${lineRows.length>0 ? ` · ${lineRows.length} rows` : ""}`}>
                      <div className="pe2-table-wrap" style={{overflowX:"auto"}}>
                        <CommonTable
                          fitParentWidth
                          maxVisibleRows={12}
                          headers={["","Description","Barcode","Qty","Price","Disc%","Disc Amt","Sub Total","Tax%","Tax Amt","Total","·"]}
                          rows={[
                            ...lineRows.map((r,idx)=>[
                              <input key={`c${idx}`} type="checkbox" checked={selectedRows.has(idx)} onChange={()=>toggleRowSel(idx)} style={{accentColor:"var(--red)",width:12,height:12}}/>,
                              r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],
                              <div key={`a${idx}`} style={{display:"flex",gap:3,justifyContent:"center"}}>
                                <button type="button" style={{border:"none",background:"none",cursor:"pointer",padding:2}} onClick={()=>handleLineEdit(r,idx)}><img src={EditActionIcon} width={12} alt=""/></button>
                                <button type="button" style={{border:"none",background:"none",cursor:"pointer",padding:2}} onClick={()=>setPendingDelete({type:"line",idx})}><img src={DeleteActionIcon} width={12} alt=""/></button>
                              </div>,
                            ]),
                            [{content:<b>Total</b>,colSpan:6,className:"font-bold"},totDisc.toFixed(2),totSub.toFixed(2),lineRows.length?(totTaxP/lineRows.length).toFixed(2):"0.00",totTaxA.toFixed(2),totLine.toFixed(2),""],
                          ]}
                        />
                      </div>
                    </SectionCard>
                  </div>

                  <div className="pe2-side-stack">
                    <SectionCard title="Substitutes">
                      <div className="pe2-subsection">
                        <div className="pe2-subtitle">Add Substitute</div>
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
                        <div className="pe2-subtitle">Current List</div>
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
                    </SectionCard>
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
