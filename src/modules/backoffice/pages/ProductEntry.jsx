import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import {
  InputField,
  SubInputField,
  DropdownInput,
  CommonTable,
  Switch,
  ConfirmDialog,
} from '../../../shared/components/ui';
import { getSessionCompany, getSessionUser } from '../../../core/auth/auth.service.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import * as groupEntryApi from '../../../services/groupEntry.api.js';
import * as subGroupEntryApi from '../../../services/subGroupEntry.api.js';
import * as productEntryApi from '../../../services/productEntry.api.js';

const mainInitial = {
  productCode: '',
  barcode: '',
  description: '',
  shortDescription: '',
  descriptionArabic: '',
  productOwnRefNo: '',
  makeType: 'Standard',
  lastSupplier: '',
  specification: '',
  productBrand: '',
  groupId: '',
  newBarcode: false,
  subGroupId: '',
  subSubGroup: '',
  averageCost: '',
  lastPurchCost: '',
  marginPct: '',
  minUnitPrice: '',
  unitPrice: '',
  baseCost: '',
  discountPct: '',
  unitCost: '',
  vatIn: '',
  vatInPct: '',
  vatOut: '',
  vatOutPct: '',
  costWithVat: '',
  priceWithVat: '',
  priceLevel1: '',
};

const supplierInitial = {
  supplier: '',
  supplierRefNo: '',
  unit: '',
  productType: 'Stock',
  packQty: '',
  stockType: 'Normal',
  packetDetails: '',
  location: 'Main',
  origin: '',
  reorderLevel: '',
  reorderQty: '',
  remark: '',
  qtyOnHand: '',
  productIdentity: '',
};

const lineFormInitial = {
  barcode: '',
  shortDescription: '',
  unit: '',
  packQty: '',
  packetDetails: '',
  discPct: '',
  unitCost: '',
  avgCost: '',
  lastCost: '',
  marginPct: '',
  unitPrice: '',
};

/** Row: shortDesc, hsCode, qty, sellPrice, discPct, discAmt, subTot, taxPct, taxAmt, lineTot */
const sampleRows = [];

const substituteDummyRows = [];

const ENTRY_TABS = [
  { id: 'general', label: 'General' },
  { id: 'pricing', label: 'Pricing & VAT' },
  { id: 'inventory', label: 'Stock & supplier' },
  { id: 'trading', label: 'Trading & substitutes' },
];

/** Consistent field grid: 1 col mobile, 2 tablet, 3 desktop */
const TAB_GRID = 'grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3';
const TAB_PANEL = 'mx-auto w-full max-w-6xl space-y-6 px-2 py-4 sm:px-4 sm:py-6';
const SPAN_FULL = 'min-w-0 sm:col-span-2 xl:col-span-3';
const fieldBox =
  'flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white';

function FormSection({ title, hint, children, className = '' }) {
  const accent = colors.primary?.main || '#790728';
  return (
    <section
      className={`rounded-xl border border-gray-200/90 bg-gradient-to-br from-white via-white to-[#faf8f9] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:p-5 ${className}`}
    >
      <header className="mb-4 flex flex-col gap-1 border-b border-gray-100/90 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-800 sm:text-xs">{title}</h2>
        </div>
        {hint ? <p className="max-w-md text-[10px] leading-snug text-gray-500 sm:text-[11px]">{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}

function ProductImageUpload({ previews, onPreviewsChange, primary }) {
  const inputRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const acc = primary || '#790728';

  const readFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onPreviewsChange((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAt = (e, idx) => {
    e.stopPropagation();
    onPreviewsChange((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx((prev) => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  const mainImg = previews[activeIdx] || null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px', height:'100%' }}>
      {/* Main large drop area */}
      <div
        style={{
          flex:1, minHeight:'220px',
          border: drag ? `1.5px dashed ${acc}` : '1.5px dashed #CBD5E1',
          borderRadius:'10px',
          background: drag ? 'rgba(121,7,40,.03)' : '#F8FAFC',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          overflow:'hidden', position:'relative', transition:'border-color .18s, background .18s',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); readFiles(e.dataTransfer.files); }}
      >
        {mainImg ? (
          <>
            <img src={mainImg} alt="Product" style={{ width:'100%', height:'100%', objectFit:'contain', padding:'10px' }} />
            <button
              type="button"
              onClick={(e) => removeAt(e, activeIdx)}
              style={{ position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,.5)', border:'none', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              aria-label="Remove image"
            >×</button>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', padding:'20px', textAlign:'center', pointerEvents:'none' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8C4BE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{ fontSize:'13px', fontWeight:600, color:'#94A3B8' }}>Drop images here</span>
            <span style={{ fontSize:'12px', color:'#B8B4AF' }}>or click to browse</span>
            <span style={{ fontSize:'11px', color:'#CBD5E1', marginTop:'2px' }}>PNG &middot; JPG &middot; WEBP &mdash; max 5 MB</span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div style={{ display:'flex', gap:'6px', overflowX:'auto', padding:'2px 0', alignItems:'center', minHeight:'58px' }}>
        {previews.map((p, i) => (
          <div
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              width:'52px', height:'52px', borderRadius:'7px', flexShrink:0,
              cursor:'pointer', overflow:'hidden',
              border: i === activeIdx ? `2px solid ${acc}` : '1.5px solid #E2E8F0',
              position:'relative', transition:'border-color .15s',
            }}
          >
            <img src={p} alt={`img ${i + 1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <button
              type="button"
              onClick={(e) => removeAt(e, i)}
              style={{ position:'absolute', top:1, right:1, width:14, height:14, borderRadius:'50%', background:'rgba(0,0,0,.55)', border:'none', color:'#fff', fontSize:9, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              aria-label="Remove"
            >×</button>
          </div>
        ))}
        <div
          onClick={() => inputRef.current?.click()}
          style={{ width:'52px', height:'52px', borderRadius:'7px', flexShrink:0, cursor:'pointer', border:'1.5px dashed #CBD5E1', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', color:'#94A3B8', fontSize:'22px', fontWeight:300, transition:'border-color .15s, color .15s' }}
          title="Add more images"
        >+</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display:'none' }}
        onChange={(e) => readFiles(e.target.files)}
      />
    </div>
  );
}

function SupplierStockForm({ supplier, setSupplier }) {
  return (
    <div style={{ display:'grid', gap:'12px', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))' }}>
      <SubInputField
        label="Supplier"
        fullWidth
        value={supplier.supplier}
        onChange={(e) => setSupplier((s) => ({ ...s, supplier: e.target.value }))}
      />
      <SubInputField
        label="Supplier ref No"
        fullWidth
        value={supplier.supplierRefNo}
        onChange={(e) => setSupplier((s) => ({ ...s, supplierRefNo: e.target.value }))}
      />
      <SubInputField
        label="Unit"
        placeholder="0"
        fullWidth
        value={supplier.unit}
        onChange={(e) => setSupplier((s) => ({ ...s, unit: e.target.value }))}
      />
      <DropdownInput
        label="Product type"
        options={['Stock', 'Non-stock', 'Service']}
        value={supplier.productType}
        onChange={(v) => setSupplier((s) => ({ ...s, productType: v }))}
        placeholder="Select"
        fullWidth
      />
      <SubInputField
        label="Pack Qty"
        fullWidth
        value={supplier.packQty}
        onChange={(e) => setSupplier((s) => ({ ...s, packQty: e.target.value }))}
      />
      <DropdownInput
        label="Stock type"
        options={['Normal', 'Batch', 'Serial']}
        value={supplier.stockType}
        onChange={(v) => setSupplier((s) => ({ ...s, stockType: v }))}
        placeholder="Select"
        fullWidth
      />
      <SubInputField
        label="Packet details"
        fullWidth
        value={supplier.packetDetails}
        onChange={(e) => setSupplier((s) => ({ ...s, packetDetails: e.target.value }))}
      />
      <DropdownInput
        label="Location"
        options={['Main', 'Warehouse A', 'Warehouse B']}
        value={supplier.location}
        onChange={(v) => setSupplier((s) => ({ ...s, location: v }))}
        placeholder="Select"
        fullWidth
      />
      <SubInputField
        label="Origin"
        fullWidth
        value={supplier.origin}
        onChange={(e) => setSupplier((s) => ({ ...s, origin: e.target.value }))}
      />
      <SubInputField
        label="Reorder level"
        fullWidth
        value={supplier.reorderLevel}
        onChange={(e) => setSupplier((s) => ({ ...s, reorderLevel: e.target.value }))}
      />
      <SubInputField
        label="Reorder qty"
        fullWidth
        value={supplier.reorderQty}
        onChange={(e) => setSupplier((s) => ({ ...s, reorderQty: e.target.value }))}
      />
      <SubInputField
        label="Qty on hand"
        fullWidth
        value={supplier.qtyOnHand}
        onChange={(e) => setSupplier((s) => ({ ...s, qtyOnHand: e.target.value }))}
      />
      <DropdownInput
        label="Product identity"
        options={['Yes', 'No']}
        value={supplier.productIdentity}
        onChange={(v) => setSupplier((s) => ({ ...s, productIdentity: v }))}
        placeholder="Select"
        fullWidth
      />
      <div style={{ gridColumn:'1/-1' }}>
        <label style={{ fontSize:'12px', fontWeight:500, color:'#64748B', display:'block', marginBottom:'5px' }}>Remark</label>
        <textarea
          value={supplier.remark}
          onChange={(e) => setSupplier((s) => ({ ...s, remark: e.target.value }))}
          rows={2}
          style={{ width:'100%', borderRadius:'8px', border:'1px solid #E2E8F0', padding:'7px 10px', fontSize:'13px', color:'#1E293B', resize:'vertical', fontFamily:'inherit', background:'#fff', outline:'none' }}
        />
      </div>
    </div>
  );
}

function ProductLineEntryForm({ lineForm, setLineForm, primary, onAdd, addLabel }) {
  const fields = [
    { label: 'Barcode',       key: 'barcode',           w: '110px' },
    { label: 'Short Desc.',   key: 'shortDescription',  w: '160px' },
    { label: 'Unit',          key: 'unit',              w: '70px'  },
    { label: 'Pack Qty',      key: 'packQty',           w: '72px'  },
    { label: 'Pkt Details',   key: 'packetDetails',     w: '90px'  },
    { label: 'Disc %',        key: 'discPct',           w: '68px'  },
    { label: 'Unit Cost',     key: 'unitCost',          w: '80px'  },
    { label: 'Avg. Cost',     key: 'avgCost',           w: '80px'  },
    { label: 'Last Cost',     key: 'lastCost',          w: '80px'  },
    { label: 'Margin %',      key: 'marginPct',         w: '72px'  },
    { label: 'Unit Price',    key: 'unitPrice',         w: '82px'  },
  ];
  return (
    <div style={{ overflowX:'auto' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', minWidth:'max-content', padding:'2px 0 4px' }}>
        {fields.map((f) => (
          <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:'4px', width:f.w }}>
            <label style={{ fontSize:'11px', fontWeight:500, color:'#64748B', whiteSpace:'nowrap' }}>{f.label}</label>
            <input
              type="text"
              value={lineForm[f.key]}
              onChange={(e) => setLineForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              style={{
                height:'34px', width:'100%', padding:'0 8px', fontSize:'13px',
                border:'1px solid #E2E8F0', borderRadius:'7px', background:'#fff',
                color:'#1E293B', outline:'none', transition:'border-color .15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = primary; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
              onKeyDown={(e) => { if (e.key === 'Enter') onAdd(); }}
            />
          </div>
        ))}
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          <label style={{ fontSize:'11px', color:'transparent', userSelect:'none' }}>x</label>
          <button
            type="button"
            onClick={onAdd}
            title="Add to table (Enter)"
            style={{
              height:'34px', minWidth:'72px', padding:'0 14px',
              background:`linear-gradient(135deg,${primary} 0%,#a01035 100%)`,
              color:'#fff', border:'none', borderRadius:'7px',
              fontSize:'13px', fontWeight:700, cursor:'pointer',
              boxShadow:`0 2px 6px ${primary}45`,
              display:'flex', alignItems:'center', gap:'5px',
              transition:'filter .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {addLabel === 'Add' ? 'Add' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductEntry() {
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';
  const surfaceTint = colors.primary?.[50] || '#F2E6EA';
  const user = getSessionUser();
  const company = getSessionCompany();

  // Derive software type from the company session.
  // company.softwareType comes from core.software_type_master.software_code
  // (populated by the login API after migration 014).
  // Falls back to 'RESTAURANT' if not yet set (all existing companies are Restaurant ERP).
  const softwareType = (company?.softwareType || company?.software_type || 'RESTAURANT').toUpperCase();

  // Product Code is a user-defined part/stock code — critical for Garage (OEM part codes)
  // but unnecessary in Restaurant / POS where it is auto-generated on save.
  const showProductCode = !['RESTAURANT', 'POS'].includes(softwareType);

  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subGroups, setSubGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadBranchesError, setLoadBranchesError] = useState('');
  const [mastersError, setMastersError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [main, setMain] = useState(mainInitial);
  const [supplier, setSupplier] = useState(supplierInitial);
  const [lineForm, setLineForm] = useState(lineFormInitial);
  const [lineRows, setLineRows] = useState(sampleRows);
  const [editingIdx, setEditingIdx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  /** Substitute products: { productCode, productName } */
  const [substituteRows, setSubstituteRows] = useState(substituteDummyRows);
  /** null | { type: 'line', idx } | { type: 'substitute', idx } */
  const [pendingDelete, setPendingDelete] = useState(null);
  const [entryTab, setEntryTab] = useState('general');
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      setLoadBranchesError('');
      try {
        const { data } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        const list = data.branches || [];
        setBranches(list);
        const station = user?.stationId != null ? String(user.stationId) : '';
        const stationInList = list.some((b) => String(b.branchId) === station);
        if (list.length === 1) {
          setBranchId(String(list[0].branchId));
        } else if (stationInList) {
          setBranchId(station);
        }
      } catch {
        if (!cancelled) setLoadBranchesError('Could not load branches.');
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.stationId]);

  useEffect(() => {
    if (!branchId) {
      setGroups([]);
      setMain((m) => ({ ...m, groupId: '', subGroupId: '' }));
      return;
    }
    let cancelled = false;
    (async () => {
      setMastersError('');
      try {
        const { data } = await groupEntryApi.fetchGroups(Number(branchId));
        if (cancelled) return;
        setGroups(data.groups || []);
        setMain((m) => ({ ...m, groupId: '', subGroupId: '' }));
      } catch {
        if (!cancelled) {
          setGroups([]);
          setMastersError('Could not load groups for this branch.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId]);

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
    return () => {
      cancelled = true;
    };
  }, [branchId, main.groupId]);

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
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.branchId),
        label: `${b.branchCode} - ${b.branchName}`,
      })),
    [branches]
  );

  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: String(g.groupId),
        label: `${g.groupCode} - ${g.groupDescription || g.groupCode}`,
      })),
    [groups]
  );

  const subGroupOptions = useMemo(
    () =>
      subGroups.map((s) => ({
        value: String(s.subGroupId),
        label: `${s.subGroupCode} - ${s.subGroupDescription || s.subGroupCode}`,
      })),
    [subGroups]
  );

  const productListRows = useMemo(
    () =>
      products.map((p) => [
        p.productCode,
        p.productName,
        p.shortName || '-',
        p.inventory?.unitPrice != null ? Number(p.inventory.unitPrice).toFixed(2) : '-',
      ]),
    [products]
  );

  const buildProductPayload = () => {
    const gid = main.groupId ? Number(main.groupId) : undefined;
    const sgid = main.subGroupId ? Number(main.subGroupId) : undefined;
    const subSub = main.subSubGroup?.trim();
    // For RESTAURANT / POS, product code is auto-generated from description if not set.
    const autoCode = showProductCode
      ? main.productCode.trim()
      : (main.productCode.trim() || main.description.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 20));
    return {
      branchId: Number(branchId),
      productCode: autoCode,
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
      averageCost: main.averageCost,
      lastPurchCost: main.lastPurchCost,
      marginPct: main.marginPct,
      minUnitPrice: main.minUnitPrice,
      unitPrice: main.unitPrice,
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
      remark: supplier.remark,
    };
  };

  const refreshProducts = async () => {
    if (!branchId) return;
    try {
      const { data } = await productEntryApi.fetchProducts(Number(branchId));
      setProducts(data.products || []);
    } catch {
      /* ignore */
    }
  };

  const handleSaveProduct = async () => {
    setSaveError('');
    setSuccessMsg('');
    if (!branchId) {
      setSaveError('Select a branch.');
      return;
    }
    if (showProductCode && !main.productCode.trim()) {
      setSaveError('Enter a product code.');
      return;
    }
    if (!main.description.trim()) {
      setSaveError('Enter a description (product name).');
      return;
    }
    const subSub = main.subSubGroup?.trim();
    if (subSub && !Number.isFinite(Number(subSub))) {
      setSaveError('Sub-sub group must be a number or left empty.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await productEntryApi.createProduct(buildProductPayload());
      setSuccessMsg(`Saved product ${data.productCode} (id ${data.productId}).`);
      setMain((prev) => ({
        ...mainInitial,
        groupId: prev.groupId,
        subGroupId: prev.subGroupId,
      }));
      await refreshProducts();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const fillLineFromRow = (row) => {
    setLineForm({
      ...lineFormInitial,
      shortDescription: String(row[0] ?? ''),
      unitPrice: String(row[9] ?? ''),
    });
  };

  const handleLineAdd = () => {
    const r = [
      lineForm.shortDescription || '-',
      '000',
      1,
      Number(lineForm.unitPrice) || 0,
      Number(lineForm.discPct) || 0,
      0,
      0,
      0,
      0,
      Number(lineForm.unitPrice) || 0,
    ];
    if (editingIdx !== null) {
      setLineRows((prev) => {
        const next = [...prev];
        next[editingIdx] = r;
        return next;
      });
      setEditingIdx(null);
    } else {
      setLineRows((prev) => [r, ...prev]);
    }
    setLineForm(lineFormInitial);
  };

  const handleEditLine = (row, idx) => {
    fillLineFromRow(row);
    setEditingIdx(idx);
  };

  const handleDeleteLine = (idx) => {
    setLineRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => {
      const next = new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)));
      return next;
    });
    if (editingIdx === idx) {
      setEditingIdx(null);
      setLineForm(lineFormInitial);
    } else if (editingIdx !== null && editingIdx > idx) {
      setEditingIdx((i) => i - 1);
    }
  };

  const handleAddSubstitute = () => {
    const code = String(searchCode ?? '').trim();
    const name = String(searchName ?? '').trim();
    if (!code && !name) return;
    setSubstituteRows((prev) => [
      ...prev,
      {
        productCode: code || '-',
        productName: name || '-',
        unitPrice: '-',
      },
    ]);
    setSearchName('');
    setSearchCode('');
  };

  const removeSubstituteRow = (idx) => {
    setSubstituteRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalDiscAmt = lineRows.reduce((s, r) => s + Number(r[5] ?? 0), 0);
  const totalSub = lineRows.reduce((s, r) => s + Number(r[6] ?? 0), 0);
  const totalTaxPct = lineRows.reduce((s, r) => s + Number(r[7] ?? 0), 0);
  const totalTaxAmt = lineRows.reduce((s, r) => s + Number(r[8] ?? 0), 0);
  const totalLine = lineRows.reduce((s, r) => s + Number(r[9] ?? 0), 0);

  const substituteTableRows = useMemo(
    () =>
      substituteRows.map((row, idx) => [
        row.productName,
        row.productCode,
        row.unitPrice ?? '-',
        <div key={`sub-act-${idx}`} className="flex justify-center">
          <button type="button" className="p-0.5" onClick={() => setPendingDelete({ type: 'substitute', idx })} aria-label="Remove row">
            <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ]),
    [substituteRows]
  );

  const lineItemsTableRows = [
    ...lineRows.map((r, idx) => [
      <div key={`chk-${idx}`} className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedRows.has(idx)}
          onChange={() => toggleSelect(idx)}
          className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
          style={{ accentColor: primary }}
        />
      </div>,
      r[0],
      r[1],
      r[2],
      r[3],
      r[4],
      r[5],
      r[6],
      r[7],
      r[8],
      r[9],
      <div key={`act-${idx}`} className="flex items-center justify-center gap-0.5">
        <button type="button" className="p-0.5" onClick={() => handleEditLine(r, idx)}>
          <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className="p-0.5" onClick={() => setPendingDelete({ type: 'line', idx })}>
          <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]),
    [
      {
        content: <span className="font-bold">Total</span>,
        colSpan: 6,
        className: 'align-middle font-bold',
      },
      totalDiscAmt.toFixed(2),
      totalSub.toFixed(2),
      lineRows.length ? (totalTaxPct / lineRows.length).toFixed(2) : '0.00',
      totalTaxAmt.toFixed(2),
      totalLine.toFixed(2),
      '',
    ],
  ];

  return (
    <div
      className="pe-root flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ margin: '-24px -28px -32px' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .pe-root, .pe-root * { font-family: 'DM Sans', sans-serif !important; }

        .pe-root input:not([type=checkbox]):not([type=radio]):not([type=file]),
        .pe-root select {
          height:36px !important; min-height:36px !important;
          padding:0 10px !important; font-size:13px !important;
          border-radius:8px !important; border:1px solid #E2E8F0 !important;
          background:#fff !important; color:#1E293B !important;
          transition:border-color .15s, box-shadow .15s;
        }
        .pe-root input:focus, .pe-root select:focus {
          outline:none !important; border-color:${primary} !important;
          box-shadow:0 0 0 3px rgba(121,7,40,0.1) !important;
        }
        .pe-root textarea {
          font-size:13px !important; border-radius:8px !important;
          border:1px solid #E2E8F0 !important; padding:8px 10px !important;
          resize:vertical; min-height:72px; color:#1E293B;
        }
        .pe-root textarea:focus {
          outline:none !important; border-color:${primary} !important;
          box-shadow:0 0 0 3px rgba(121,7,40,0.1) !important;
        }
        .pe-root label, .pe-root [class*="label"] {
          font-size:12px !important; font-weight:500 !important;
          color:#64748B !important; margin-bottom:5px !important;
          display:block !important; letter-spacing:0 !important;
          text-transform:none !important;
        }
        .pe-section-title {
          font-size:15px; font-weight:700; color:#111827; margin:0 0 16px 0;
        }
        .pe-tab { position:relative; transition:color .15s; cursor:pointer; }
        .pe-tab::after {
          content:''; position:absolute; bottom:-1px; left:0; right:0;
          height:2px; border-radius:99px; background:${primary};
          transform:scaleX(0); transform-origin:center;
          transition:transform .2s cubic-bezier(.4,0,.2,1);
        }
        .pe-tab[data-active="true"]::after { transform:scaleX(1); }
        .pe-tab[data-active="true"] { color:${primary} !important; font-weight:600 !important; }
        .pe-tab:not([data-active="true"]):hover { color:#374151 !important; background:rgba(0,0,0,.03); }
        .pe-action:hover { border-color:${primary} !important; color:${primary} !important; background:rgba(121,7,40,.04) !important; }
        .pe-action:hover img { opacity:1 !important; }
        .pe-save:hover { filter:brightness(1.1); }
        .pe-save:active { transform:scale(.97); }
        .pe-card {
          background:#fff; border:1px solid #E9EEF3;
          border-radius:12px; overflow:hidden;
          box-shadow:0 1px 3px rgba(0,0,0,.05);
        }
        .pe-card-body { padding:20px; }
        .pe-grid { display:grid; gap:14px; grid-template-columns:1fr; }
        @media(min-width:640px) { .pe-grid { grid-template-columns:repeat(2,1fr); } }
        @media(min-width:1024px) { .pe-grid { grid-template-columns:repeat(3,1fr); } }
        .pe-col-full { grid-column:1/-1; }
        .pe-col2 { grid-column:span 2; }
        .pe-imgdrop {
          border:1.5px dashed #CBD5E1; border-radius:10px;
          background:#F8FAFC; cursor:pointer;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          transition:border-color .18s, background .18s;
          overflow:hidden; position:relative;
          width:100%; min-height:220px;
        }
        .pe-imgdrop:hover, .pe-imgdrop.drag { border-color:${primary}; background:rgba(121,7,40,.03); }
        .pe-imgdrop img { width:100%; height:100%; object-fit:contain; padding:10px; }
        .pe-imgdrop .pe-img-remove {
          position:absolute; top:6px; right:6px; width:22px; height:22px;
          border-radius:50%; background:rgba(0,0,0,.5); border:none; color:#fff;
          font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity .15s;
        }
        .pe-imgdrop:hover .pe-img-remove { opacity:1; }
        .pe-new-barcode-row {
          display:flex; align-items:center; gap:8px; height:36px;
          border:1px solid #E2E8F0; border-radius:8px; background:#F8FAFC;
          padding:0 10px; font-size:13px; font-weight:500; color:#475569;
        }
      `}</style>

      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E9EEF3] bg-white px-5 py-3">
        <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700" aria-label="Back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-400">Data Entry &rsaquo; Products</p>
          <p className="text-[15px] font-bold leading-tight text-gray-900">Add New Product</p>
        </div>
        <div className="mx-2 h-8 w-px bg-gray-100" aria-hidden />
        <div style={{ width:'200px' }}>
          <DropdownInput
            placeholder={loadingBranches ? 'Loading...' : 'Select branch'}
            options={branchOptions}
            value={branchId}
            onChange={(v) => { setBranchId(v); setSaveError(''); setSuccessMsg(''); }}
            fullWidth
            disabled={loadingBranches}
          />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <button type="button" className="pe-action flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition" aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 opacity-40" />
          </button>
          {[{ icon: CancelIcon, label: 'Cancel' }, { icon: PostIcon, label: 'Post' }, { icon: UnpostIcon, label: 'Unpost' }].map((b) => (
            <button key={b.label} type="button" className="pe-action hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition sm:flex">
              <img src={b.icon} alt="" className="h-3.5 w-3.5 opacity-40" />{b.label}
            </button>
          ))}
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            className="pe-save rounded-lg px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            style={{ background: `linear-gradient(135deg,${primary} 0%,#a01035 100%)`, boxShadow: `0 2px 8px ${primary}45` }}
            disabled={saving}
            onClick={handleSaveProduct}
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      {/* Alert strip */}
      {(loadBranchesError || mastersError || saveError || successMsg) && (
        <div className="shrink-0 border-b border-[#E9EEF3] bg-white px-5 py-2 space-y-1">
          {loadBranchesError && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{loadBranchesError}</p>}
          {mastersError && <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">{mastersError}</p>}
          {saveError && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{saveError}</p>}
          {successMsg && <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{successMsg}</p>}
        </div>
      )}

      {/* Tab nav */}
      <div className="shrink-0 border-b border-[#E9EEF3] bg-white px-5" role="tablist" aria-label="Product entry sections">
        <div className="flex">
          {ENTRY_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-active={entryTab === t.id ? 'true' : 'false'}
              aria-selected={entryTab === t.id}
              onClick={() => setEntryTab(t.id)}
              className="pe-tab px-4 py-3 text-[13px] font-medium text-gray-500"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ background:'#F5F7FA' }}>
        <div style={{ padding:'16px 20px' }}>

          {/* GENERAL */}
          {entryTab === 'general' && (
            <div style={{ display:'flex', gap:'20px', alignItems:'flex-start' }}>

              {/* Left column */}
              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'16px' }}>

                <div className="pe-card">
                  <div className="pe-card-body">
                    <h3 className="pe-section-title">General Information</h3>
                    <div className="pe-grid">
                      {/* Product Code: shown only for Garage / modules where stock codes matter */}
                      {showProductCode && (
                        <InputField label="Product Code *" fullWidth value={main.productCode} onChange={(e) => setMain((m) => ({ ...m, productCode: e.target.value }))} />
                      )}

                      {/* Barcode with inline New Barcode toggle */}
                      <div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                          <label style={{ fontSize:'12px', fontWeight:500, color:'#64748B' }}>Barcode</label>
                          <button
                            type="button"
                            title="Toggle auto-generate next barcode from database"
                            onClick={() => setMain((m) => ({ ...m, newBarcode: !m.newBarcode }))}
                            style={{
                              display:'flex', alignItems:'center', gap:'4px', padding:'2px 8px',
                              borderRadius:'5px', border:'1px solid',
                              borderColor: main.newBarcode ? primary : '#E2E8F0',
                              background: main.newBarcode ? primary : '#F8FAFC',
                              color: main.newBarcode ? '#fff' : '#64748B',
                              fontSize:'10px', fontWeight:600, cursor:'pointer',
                              transition:'all .15s', lineHeight:1.4,
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2v18H3zm4 0h1v18H7zm3 0h2v18h-2zm4 0h1v18h-1zm3 0h1v18h-1zm3 0h2v18h-2z"/></svg>
                            {main.newBarcode ? '✓ Auto' : 'New Barcode'}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={main.barcode}
                          onChange={(e) => setMain((m) => ({ ...m, barcode: e.target.value }))}
                          placeholder={main.newBarcode ? 'Will auto-generate on save...' : ''}
                          disabled={main.newBarcode}
                          style={{
                            height:'36px', width:'100%', padding:'0 10px', fontSize:'13px',
                            border:'1px solid #E2E8F0', borderRadius:'8px',
                            background: main.newBarcode ? '#F1F5F9' : '#fff',
                            color: main.newBarcode ? '#94A3B8' : '#1E293B',
                            outline:'none', transition:'background .15s',
                          }}
                        />
                      </div>

                      <SubInputField label="Own Ref No." fullWidth value={main.productOwnRefNo} onChange={(e) => setMain((m) => ({ ...m, productOwnRefNo: e.target.value }))} />
                      <div className="pe-col-full">
                        <InputField label="Product Name *" fullWidth value={main.description} onChange={(e) => setMain((m) => ({ ...m, description: e.target.value }))} />
                      </div>
                      <div className="pe-col-full">
                        <InputField label="Short Description" fullWidth value={main.shortDescription} onChange={(e) => setMain((m) => ({ ...m, shortDescription: e.target.value }))} />
                      </div>
                      <div className="pe-col-full">
                        <InputField label="Description in Arabic" fullWidth value={main.descriptionArabic} onChange={(e) => setMain((m) => ({ ...m, descriptionArabic: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classification moved to left column */}
                <div className="pe-card">
                  <div className="pe-card-body">
                    <h3 className="pe-section-title">Classification</h3>
                    <div className="pe-grid">
                      <DropdownInput label="Make Type" options={['Standard', 'Assembly', 'Service']} value={main.makeType} onChange={(v) => setMain((m) => ({ ...m, makeType: v }))} placeholder="Select" fullWidth />
                      <DropdownInput label="Group" placeholder={!branchId ? 'Select branch first' : 'Optional'} options={groupOptions} value={main.groupId} onChange={(v) => setMain((m) => ({ ...m, groupId: v, subGroupId: '' }))} fullWidth disabled={!branchId || !groupOptions.length} />
                      <DropdownInput label="Subgroup" placeholder={!main.groupId ? 'Select group first' : 'Optional'} options={subGroupOptions} value={main.subGroupId} onChange={(v) => setMain((m) => ({ ...m, subGroupId: v }))} fullWidth disabled={!branchId || !main.groupId} />
                      <SubInputField label="Sub-subgroup ID" fullWidth value={main.subSubGroup} onChange={(e) => setMain((m) => ({ ...m, subSubGroup: e.target.value }))} placeholder="Numeric or empty" />
                      <SubInputField label="Last Supplier" fullWidth value={main.lastSupplier} onChange={(e) => setMain((m) => ({ ...m, lastSupplier: e.target.value }))} />
                      <InputField label="Brand" fullWidth value={main.productBrand} onChange={(e) => setMain((m) => ({ ...m, productBrand: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="pe-card">
                  <div className="pe-card-body">
                    <h3 className="pe-section-title">Specification</h3>
                    <label style={{ fontSize:'12px', fontWeight:500, color:'#64748B', display:'block', marginBottom:'5px' }}>Specification Details</label>
                    <textarea
                      value={main.specification}
                      onChange={(e) => setMain((m) => ({ ...m, specification: e.target.value }))}
                      rows={4}
                      placeholder="Enter product specification..."
                      style={{ width:'100%', borderRadius:'8px', border:'1px solid #E2E8F0', padding:'8px 10px', fontSize:'13px', color:'#1E293B', resize:'vertical', fontFamily:'inherit', background:'#fff', outline:'none' }}
                    />
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button
                    type="button"
                    className="pe-save rounded-xl px-8 py-3 text-sm font-bold text-white transition disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg,${primary} 0%,#a01035 100%)`, boxShadow: `0 3px 12px ${primary}45` }}
                    disabled={saving}
                    onClick={handleSaveProduct}
                  >
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>

              </div>

              {/* Right column — sticky, full viewport height, product images */}
              <div style={{ width:'300px', flexShrink:0, position:'sticky', top:'16px', height:'calc(100vh - 145px)' }}>
                <div className="pe-card" style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                  <div className="pe-card-body" style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
                    <h3 className="pe-section-title">Product Images</h3>
                    <ProductImageUpload
                      previews={imagePreviews}
                      onPreviewsChange={setImagePreviews}
                      primary={primary}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PRICING & VAT */}
          {entryTab === 'pricing' && (
            <div style={{ display:'flex', gap:'20px', alignItems:'flex-start' }}>

              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'16px' }}>
                <div className="pe-card">
                  <div className="pe-card-body">
                    <h3 className="pe-section-title">Cost &amp; Purchase</h3>
                    <div className="pe-grid">
                      <InputField label="Base Cost" fullWidth value={main.baseCost} onChange={(e) => setMain((m) => ({ ...m, baseCost: e.target.value }))} />
                      <InputField label="Discount %" fullWidth value={main.discountPct} onChange={(e) => setMain((m) => ({ ...m, discountPct: e.target.value }))} />
                      <SubInputField label="Unit Cost" fullWidth value={main.unitCost} onChange={(e) => setMain((m) => ({ ...m, unitCost: e.target.value }))} />
                      <SubInputField label="Average Cost" fullWidth value={main.averageCost} onChange={(e) => setMain((m) => ({ ...m, averageCost: e.target.value }))} />
                      <SubInputField label="Last Purchase Cost" fullWidth value={main.lastPurchCost} onChange={(e) => setMain((m) => ({ ...m, lastPurchCost: e.target.value }))} />
                      <SubInputField label="Margin %" fullWidth value={main.marginPct} onChange={(e) => setMain((m) => ({ ...m, marginPct: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="pe-card">
                  <div className="pe-card-body">
                    <h3 className="pe-section-title">VAT</h3>
                    <div className="pe-grid">
                      <SubInputField label="VAT In" fullWidth value={main.vatIn} onChange={(e) => setMain((m) => ({ ...m, vatIn: e.target.value }))} />
                      <SubInputField label="VAT In %" fullWidth value={main.vatInPct} onChange={(e) => setMain((m) => ({ ...m, vatInPct: e.target.value }))} />
                      <InputField label="Cost With VAT" fullWidth value={main.costWithVat} onChange={(e) => setMain((m) => ({ ...m, costWithVat: e.target.value }))} />
                      <SubInputField label="VAT Out" fullWidth value={main.vatOut} onChange={(e) => setMain((m) => ({ ...m, vatOut: e.target.value }))} />
                      <SubInputField label="VAT Out %" fullWidth value={main.vatOutPct} onChange={(e) => setMain((m) => ({ ...m, vatOutPct: e.target.value }))} />
                      <InputField label="Price With VAT" fullWidth value={main.priceWithVat} onChange={(e) => setMain((m) => ({ ...m, priceWithVat: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ width:'300px', flexShrink:0 }}>
                <div className="pe-card">
                  <div className="pe-card-body">
                    <h3 className="pe-section-title">Selling Prices</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                      <SubInputField label="Min Unit Price" fullWidth value={main.minUnitPrice} onChange={(e) => setMain((m) => ({ ...m, minUnitPrice: e.target.value }))} />
                      <SubInputField label="Unit Price" fullWidth value={main.unitPrice} onChange={(e) => setMain((m) => ({ ...m, unitPrice: e.target.value }))} />
                      <SubInputField label="Price Level 1" fullWidth value={main.priceLevel1} onChange={(e) => setMain((m) => ({ ...m, priceLevel1: e.target.value }))} />
                    </div>
                    <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid #E9EEF3' }}>
                      <button
                        type="button"
                        className="pe-save w-full rounded-lg py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg,${primary} 0%,#a01035 100%)`, boxShadow: `0 2px 8px ${primary}45` }}
                        disabled={saving}
                        onClick={handleSaveProduct}
                      >
                        {saving ? 'Saving...' : 'Save Product'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STOCK & SUPPLIER */}
          {entryTab === 'inventory' && (
            <div className="pe-card">
              <div className="pe-card-body">
                <h3 className="pe-section-title">Stock &amp; Supplier</h3>
                <SupplierStockForm supplier={supplier} setSupplier={setSupplier} />
              </div>
            </div>
          )}

          {/* TRADING & SUBSTITUTES */}
          {entryTab === 'trading' && (
            <>
              {/* Product Lines — entry bar + table in one card */}
              <div className="pe-card" style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <h3 className="pe-section-title" style={{ margin:0 }}>Product Lines</h3>
                    {lineRows.length > 0 && (
                      <span style={{ background:primary, color:'#fff', fontSize:'11px', fontWeight:700, padding:'1px 8px', borderRadius:'99px' }}>{lineRows.length} rows</span>
                    )}
                  </div>
                  <span style={{ fontSize:'11px', color:'#94A3B8' }}>Fill fields below &rarr; press Enter or click &#10003; to add to table</span>
                </div>
                {/* Horizontal entry bar */}
                <div style={{ padding:'10px 20px', borderBottom:'1px solid #F1F5F9', background:'#FAFBFC' }}>
                  <ProductLineEntryForm lineForm={lineForm} setLineForm={setLineForm} primary={primary} onAdd={handleLineAdd} addLabel={editingIdx !== null ? 'Update' : 'Add'} />
                </div>
                {/* Table */}
                <div className="overflow-x-auto">
                  <CommonTable
                    fitParentWidth equalColumnWidth maxVisibleRows={10}
                    headers={['', 'Short Desc.', 'HS Code / Wt', 'Qty', 'Sell Price', 'Disc %', 'Disc Amt', 'Sub Total', 'Tax %', 'Tax Amt', 'Line Total', 'Action']}
                    rows={lineItemsTableRows}
                  />
                </div>
              </div>

              {/* Substitute Products */}
              <div className="pe-card">
                <div className="pe-card-body">
                  <h3 className="pe-section-title">Substitute Products</h3>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'10px', marginBottom:'14px', flexWrap:'wrap' }}>
                    <div style={{ flex:'1', minWidth:'140px' }}>
                      <InputField label="Product Name" fullWidth value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                    </div>
                    <div style={{ flex:'1', minWidth:'120px' }}>
                      <SubInputField label="Product Code" fullWidth value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
                    </div>
                    <button
                      type="button"
                      style={{ height:'36px', padding:'0 18px', background:`linear-gradient(135deg,${primary} 0%,#a01035 100%)`, color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', boxShadow:`0 2px 6px ${primary}40`, flexShrink:0 }}
                      onClick={handleAddSubstitute}
                    >
                      + Add Substitute
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-[#E9EEF3]">
                    <CommonTable fitParentWidth equalColumnWidth maxVisibleRows={6} headers={['Product Name', 'Product Code', 'Unit Price', 'Action']} rows={substituteTableRows} />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.type === 'substitute' ? 'Remove substitute product?' : 'Delete line item?'}
        message={pendingDelete?.type === 'substitute' ? 'This will remove the substitute from the list. This action cannot be undone.' : 'This will remove the row from the table. This action cannot be undone.'}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.type === 'line') handleDeleteLine(pendingDelete.idx);
          else removeSubstituteRow(pendingDelete.idx);
        }}
      />
    </div>
  );
}
