import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSessionUser } from '../../../core/auth/auth.service.js';
import * as productEntryApi from '../../../services/productEntry.api.js';
import * as staffEntryApi from '../../../services/staffEntry.api.js';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import CommonTable from '../../../shared/components/ui/CommonTable';
import ProductListFilterDrawer from '../../../shared/components/ui/ProductListFilterDrawer';
import TableRowViewModal from '../../../shared/components/ui/TableRowViewModal';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden>
      <path d="M20 6v5h-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18v-5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.7 9A7 7 0 0 0 6.3 6.4L4 8.8" strokeLinecap="round" />
      <path d="M5.3 15A7 7 0 0 0 17.7 17.6L20 15.2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function InventoryMetric({ label, value, accent = 'slate' }) {
  const accentClasses = {
    maroon: 'border-[#790728]/25 bg-[#790728]/[0.04] text-[#790728]',
    blue: 'border-sky-200 bg-sky-50/80 text-sky-800',
    amber: 'border-amber-200 bg-amber-50/80 text-amber-800',
    slate: 'border-slate-200 bg-slate-50/80 text-slate-800',
  };
  return (
    <div className={`min-w-[8rem] border px-3 py-2 ${accentClasses[accent] || accentClasses.slate}`}>
      <p className="text-[8px] font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-1 truncate font-['Bahnschrift','Open_Sans',sans-serif] text-lg font-bold leading-none tracking-normal">
        {value}
      </p>
    </div>
  );
}

function IconToolbarButton({ icon, label, onClick, disabled = false, variant = 'light', children }) {
  const variantClass =
    variant === 'primary'
      ? 'border-[#790728] bg-[#790728] text-white shadow-[0_8px_20px_rgba(121,7,40,0.20)] hover:bg-[#650520]'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

  return (
    <button
      type="button"
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 border px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-55 ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
      {children ?? label}
    </button>
  );
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const SEARCH_COLUMN_OPTIONS = [
  { value: 'all', label: 'All product fields' },
  { value: 'productCode', label: 'Product code / own ref' },
  { value: 'barcode', label: 'Barcode' },
  { value: 'description', label: 'Description' },
  { value: 'supplier', label: 'Supplier name' },
  { value: 'brand', label: 'Product brand' },
  { value: 'group', label: 'Group' },
  { value: 'subgroup', label: 'Sub group' },
];

/** Checkbox + 14 data columns - widths sum to 100 */
const PL_COL_PCT = [2, 6, 6, 7, 15, 10, 7, 4, 6, 6, 6, 6, 6, 6, 7];

function fmtMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseMoneyValue(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseMarginPct(s) {
  const n = Number(String(s ?? '').replace(/%/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function displayOrDash(value) {
  const s = String(value ?? '').trim();
  return s || '-';
}

function labelFromId(prefix, id) {
  return id != null && id !== '' ? `${prefix} #${id}` : '-';
}

function formatMarginPct(value, costValue, sellValue) {
  const direct = Number(value);
  if (Number.isFinite(direct) && direct !== 0) return `${direct.toFixed(1)}%`;
  const cost = Number(costValue);
  const sell = Number(sellValue);
  if (Number.isFinite(cost) && Number.isFinite(sell) && sell > 0) {
    return `${(((sell - cost) / sell) * 100).toFixed(1)}%`;
  }
  return '0.0%';
}

function branchLabel(branch) {
  return [branch.branchCode, branch.branchName].filter(Boolean).join(' - ') || `Branch ${branch.branchId}`;
}

function mapApiProduct(product, index) {
  const inv = product.inventory || {};
  const sellingValue = inv.priceLevel1 || inv.maximumRetailPrice || inv.unitPrice || 0;
  const costValue = inv.averageCost || inv.lastPurchaseCost || 0;

  return {
    id: String(inv.productInventoryId ?? product.productInventoryId ?? product.productId ?? product.productCode ?? index),
    productId: product.productId != null ? String(product.productId) : '',
    ownRefNo: displayOrDash(product.ownRefNo ?? product.productCode),
    suppRefNo: displayOrDash(product.supplierRefNo ?? product.productCode),
    barcode: displayOrDash(product.barcode),
    shortDescription: displayOrDash(product.shortName || product.productName),
    supplierName: displayOrDash(
      product.supplierName ||
        product.lastSupplierName ||
        (product.lastSupplierId ? labelFromId('Supplier', product.lastSupplierId) : ''),
    ),
    brand: displayOrDash(product.brand || product.brandName || (product.brandId ? labelFromId('Brand', product.brandId) : '')),
    productGroup: displayOrDash(
      product.groupName || product.productGroup || (product.groupId ? labelFromId('Group', product.groupId) : ''),
    ),
    subGroup: displayOrDash(
      product.subGroupName ||
        product.subgroupName ||
        product.subGroup ||
        (product.subgroupId ? labelFromId('Sub group', product.subgroupId) : ''),
    ),
    pktQty: displayOrDash(product.packQty ?? inv.packQty),
    qtyOnHand: Number(inv.qtyOnHand) || 0,
    unitCost: fmtMoney(costValue),
    lastPurchCost: fmtMoney(inv.lastPurchaseCost),
    unitPrice: fmtMoney(inv.unitPrice),
    sellingPrice: fmtMoney(sellingValue),
    productType: displayOrDash(product.productType || product.stockType),
    location: displayOrDash(inv.locationCode || product.locationCode),
    rackLocation: displayOrDash(inv.locationCode || product.rackLocation),
    marginPct: formatMarginPct(inv.minimumMarginPercentage, costValue, sellingValue),
  };
}

const SEARCH_PLACEHOLDER = 'Search products...';

export default function ProductList() {
  const user = getSessionUser();
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [plFilters, setPlFilters] = useState({
    searchColumn: 'all',
    rackLocation: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewProduct, setViewProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      setLoadError('');
      try {
        const { data } = await staffEntryApi.fetchStaffBranches();
        if (cancelled) return;
        const list = data.branches || [];
        setBranches(list);
        const station = user?.stationId != null ? String(user.stationId) : '';
        const stationInList = list.some((branch) => String(branch.branchId) === station);
        if (list.length === 1) {
          setBranchId(String(list[0].branchId));
        } else if (stationInList) {
          setBranchId(station);
        } else if (list[0]) {
          setBranchId(String(list[0].branchId));
        } else {
          setBranchId('');
        }
      } catch {
        if (!cancelled) {
          setBranches([]);
          setLoadError('Could not load branches.');
        }
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.stationId]);

  useEffect(() => {
    if (loadingBranches) return undefined;
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      setLoadError('');
      try {
        const params = branchId ? { branchId: Number(branchId) } : undefined;
        const { data } = await productEntryApi.listProducts(params);
        if (cancelled) return;
        setProducts((data.products || []).map(mapApiProduct));
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setLoadError(err.response?.data?.message || 'Could not load products.');
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchId, loadingBranches, refreshKey]);

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, plFilters, branchId]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(products.map((r) => r.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (ids.has(id)) next.add(id);
        else changed = true;
      });
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [products]);

  const branchOptions = useMemo(
    () => branches.map((branch) => ({ value: String(branch.branchId), label: branchLabel(branch) })),
    [branches],
  );

  const rackLocations = useMemo(() => {
    const set = new Set();
    products.forEach((product) => {
      if (product.rackLocation && product.rackLocation !== '-') set.add(product.rackLocation);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [products]);

  useEffect(() => {
    if (plFilters.rackLocation && !rackLocations.includes(plFilters.rackLocation)) {
      setPlFilters((prev) => ({ ...prev, rackLocation: null }));
    }
  }, [plFilters.rackLocation, rackLocations]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (plFilters.searchColumn && plFilters.searchColumn !== 'all') n += 1;
    if (plFilters.rackLocation) n += 1;
    return n;
  }, [plFilters.searchColumn, plFilters.rackLocation]);

  const rowMatchesSearch = useCallback(
    (row, q) => {
      if (!q) return true;
      const col = plFilters.searchColumn || 'all';
      const hay = (value) => String(value ?? '').toLowerCase().includes(q);
      if (col === 'productCode') return hay(row.ownRefNo) || hay(row.suppRefNo);
      if (col === 'barcode') return hay(row.barcode);
      if (col === 'description') return hay(row.shortDescription);
      if (col === 'supplier') return hay(row.supplierName);
      if (col === 'brand') return hay(row.brand);
      if (col === 'group') return hay(row.productGroup);
      if (col === 'subgroup') return hay(row.subGroup);
      return (
        hay(row.ownRefNo) ||
        hay(row.suppRefNo) ||
        hay(row.barcode) ||
        hay(row.shortDescription) ||
        hay(row.supplierName) ||
        hay(row.brand) ||
        hay(row.productGroup) ||
        hay(row.subGroup)
      );
    },
    [plFilters.searchColumn],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((row) => rowMatchesSearch(row, q));
    if (plFilters.rackLocation) {
      list = list.filter((row) => row.rackLocation === plFilters.rackLocation);
    }
    const sorted = [...list];
    if (sortBy === 'supplier') {
      sorted.sort((a, b) => String(a.supplierName).localeCompare(String(b.supplierName)));
    } else if (sortBy === 'desc') {
      sorted.sort((a, b) => String(a.shortDescription).localeCompare(String(b.shortDescription)));
    } else if (sortBy === 'sellHigh') {
      sorted.sort((a, b) => parseMoneyValue(b.sellingPrice) - parseMoneyValue(a.sellingPrice));
    } else if (sortBy === 'marginHigh') {
      sorted.sort((a, b) => parseMarginPct(b.marginPct) - parseMarginPct(a.marginPct));
    }
    return sorted;
  }, [search, plFilters.rackLocation, sortBy, rowMatchesSearch, products]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const filteredIdSet = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);

  const selectedRowCount = useMemo(() => {
    let n = 0;
    selectedIds.forEach((id) => {
      if (filteredIdSet.has(id)) n += 1;
    });
    return n;
  }, [filteredIdSet, selectedIds]);

  const tableRows = useMemo(() => {
    return paginatedRows.map((row) => {
      const checked = selectedIds.has(row.id);
      return [
        <div
          key={`chk-${row.id}`}
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(row.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
            aria-label={`Select ${row.ownRefNo}`}
          />
        </div>,
        row.ownRefNo,
        row.suppRefNo,
        row.barcode,
        <span key={`d-${row.id}`} className="block w-full text-left">
          {row.shortDescription}
        </span>,
        <span key={`s-${row.id}`} className="block w-full text-left">
          {row.supplierName}
        </span>,
        row.brand,
        row.pktQty,
        row.unitCost,
        row.lastPurchCost,
        row.unitPrice,
        row.sellingPrice,
        row.productType,
        row.location,
        row.marginPct,
      ];
    });
  }, [paginatedRows, selectedIds, toggleRowSelected]);

  const selectedRowIndex = useMemo(() => {
    if (!viewProduct) return null;
    const index = paginatedRows.findIndex((row) => row.id === viewProduct.id);
    return index >= 0 ? index : null;
  }, [viewProduct, paginatedRows]);

  const viewModalFields = useMemo(() => {
    if (!viewProduct) return [];
    return [
      { label: 'Own ref no.', value: viewProduct.ownRefNo },
      { label: 'Supp. ref no.', value: viewProduct.suppRefNo },
      { label: 'Barcode', value: viewProduct.barcode },
      { label: 'Short description', value: viewProduct.shortDescription },
      { label: 'Supplier name', value: viewProduct.supplierName },
      { label: 'Brand', value: viewProduct.brand },
      { label: 'Group', value: viewProduct.productGroup },
      { label: 'Sub group', value: viewProduct.subGroup },
      { label: 'Pkt qty', value: viewProduct.pktQty },
      { label: 'Qty on hand', value: viewProduct.qtyOnHand },
      { label: 'Unit cost', value: viewProduct.unitCost },
      { label: 'Last purch. cost', value: viewProduct.lastPurchCost },
      { label: 'Unit price', value: viewProduct.unitPrice },
      { label: 'Selling price', value: viewProduct.sellingPrice },
      { label: 'Product type', value: viewProduct.productType },
      { label: 'Location', value: viewProduct.location },
      { label: 'Rack location', value: viewProduct.rackLocation },
      { label: 'Margin %', value: viewProduct.marginPct },
    ];
  }, [viewProduct]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const activeBranchLabel = useMemo(() => {
    const selectedBranch = branches.find((branch) => String(branch.branchId) === String(branchId));
    return selectedBranch ? branchLabel(selectedBranch) : 'All branches';
  }, [branchId, branches]);

  const inventoryValue = useMemo(
    () =>
      filteredRows.reduce((sum, row) => {
        const cost = parseMoneyValue(row.unitCost);
        const qty = Number(row.qtyOnHand);
        return sum + cost * (Number.isFinite(qty) ? qty : 0);
      }, 0),
    [filteredRows],
  );

  const emptyMessage = loadingBranches || loadingProducts
    ? 'Loading inventory records...'
    : loadError || 'No products match the current view.';

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col overflow-hidden border border-slate-200 bg-[#f5f7f6] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="relative shrink-0 overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#790728]" aria-hidden />
        <div className="flex flex-col gap-3 px-4 py-4 pl-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#790728]/20 bg-[#790728]/5 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#790728]">
                Products
              </span>
              <span className="max-w-[18rem] truncate border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                {activeBranchLabel}
              </span>
              {selectedRowCount >= 1 ? (
                <span className="border border-sky-200 bg-sky-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-sky-800">
                  {selectedRowCount} selected
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 font-['Bahnschrift','Open_Sans',sans-serif] text-2xl font-bold uppercase leading-none tracking-normal text-slate-950 sm:text-3xl">
              Product Listing
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/data-entry/product-entry"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 border border-[#790728] bg-[#790728] px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-white no-underline shadow-[0_8px_20px_rgba(121,7,40,0.20)] transition hover:bg-[#650520]"
              title="New product"
            >
              <PlusIcon />
              New product
            </Link>
            <IconToolbarButton
              label="Refresh"
              icon={<RefreshIcon />}
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loadingBranches || loadingProducts}
            />
            <IconToolbarButton label="Print" icon={<img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />}>
              Print
            </IconToolbarButton>
            <IconToolbarButton label="Cancel" icon={<img src={CancelIcon} alt="" className="h-3.5 w-3.5" />}>
              Cancel
            </IconToolbarButton>
            <IconToolbarButton
  label="Edit"
  icon={<img src={EditIcon} alt="" className="h-3.5 w-3.5" />}
  disabled={selectedRowCount !== 1}
  onClick={() => {
    const selectedId = [...selectedIds].find(id => filteredIdSet.has(id));
    const selectedRow = filteredRows.find((row) => row.id === selectedId);
    if (selectedRow?.productId) {
      navigate(`/data-entry/product-entry?productId=${selectedRow.productId}&branchId=${branchId}`);
    }
  }}
>
  Edit
</IconToolbarButton>
          </div>
        </div>

        <div className="grid gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 pl-6 md:grid-cols-2 xl:grid-cols-4">
          <InventoryMetric label="Catalog" value={products.length.toLocaleString()} accent="maroon" />
          <InventoryMetric label="Visible" value={totalFiltered.toLocaleString()} accent="blue" />
          <InventoryMetric label="Locations" value={rackLocations.length.toLocaleString()} accent="slate" />
          <InventoryMetric label="Stock value" value={fmtMoney(inventoryValue)} accent="amber" />
        </div>
      </div>

      <div className="shrink-0 border-b border-slate-200 bg-[#eef1f0] px-4 py-3">
        <div className="grid min-w-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(280px,1fr)_auto_auto_auto] xl:items-center">
          <div className="flex h-10 min-w-0 items-center border border-slate-300 bg-white px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus-within:border-[#790728]">
            <img src={SearchIcon} alt="" className="h-4 w-4 shrink-0 opacity-70" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={SEARCH_PLACEHOLDER}
              className="min-w-0 flex-1 border-0 bg-transparent px-2 font-['Open_Sans',sans-serif] text-[12px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          {branchOptions.length > 1 ? (
            <div className="relative flex h-10 min-w-0 items-center border border-slate-300 bg-white px-3">
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="h-full w-full min-w-[12rem] cursor-pointer appearance-none border-0 bg-transparent pr-6 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-800 outline-none"
                aria-label="Branch"
                disabled={loadingBranches || loadingProducts}
              >
                {branchOptions.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ToolbarChevron />
              </span>
            </div>
          ) : null}

          <div className="relative flex h-10 min-w-0 items-center border border-slate-300 bg-white px-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-full w-full min-w-[11rem] cursor-pointer appearance-none border-0 bg-transparent pr-6 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-800 outline-none"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="supplier">Sort: Supplier</option>
              <option value="desc">Sort: Description</option>
              <option value="sellHigh">Sort: Sell price high</option>
              <option value="marginHigh">Sort: Margin high</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 border border-slate-300 bg-white px-3 text-[11px] font-black uppercase tracking-[0.08em] text-slate-800 transition hover:border-[#790728]/40 hover:bg-[#790728]/5"
            aria-expanded={filterDrawerOpen}
            aria-haspopup="dialog"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <img src={FilterIcon} alt="" className="h-4 w-4 shrink-0" />
            {activeFilterCount > 0 ? `Filters ${activeFilterCount}` : 'Filters'}
          </button>
        </div>
      </div>

      {loadingBranches || loadingProducts || loadError ? (
        <div
          className={`mx-4 mt-3 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] ${
            loadError ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
          role="status"
          aria-live="polite"
        >
          {loadError || (loadingBranches ? 'Loading branches...' : 'Loading products...')}
        </div>
      ) : null}

      <ProductListFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        searchColumnOptions={SEARCH_COLUMN_OPTIONS}
        rackLocations={rackLocations}
        applied={plFilters}
        onApply={setPlFilters}
      />

      <TableRowViewModal
        open={Boolean(viewProduct)}
        title="View product"
        fields={viewModalFields}
        onClose={() => setViewProduct(null)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-4 pt-3">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2">
            <CommonTable
              className="product-list-table flex min-h-0 min-w-0 flex-1 flex-col"
              fitParentWidth
              allowHorizontalScroll
              truncateHeader
              truncateBody
              onBodyRowClick={(rowIdx) => setViewProduct(paginatedRows[rowIdx] ?? null)}
              selectedBodyRowIndex={selectedRowIndex}
              columnWidthPercents={PL_COL_PCT}
              tableClassName="min-w-[1280px] w-full"
              hideVerticalCellBorders
              cellAlign="center"
              headerBackgroundColor="#e9edf0"
              headerFontSize="clamp(8px, 0.82vw, 10px)"
              headerTextColor="#334155"
              bodyFontSize="clamp(9px, 0.86vw, 11px)"
              cellPaddingClass="px-1 py-1.5 sm:px-1.5 sm:py-2"
              bodyRowHeightRem={2.55}
              maxVisibleRows={Math.min(pageSize, 24)}
              headers={[
                '',
                'Own ref',
                'Supp.ref',
                'Barcode',
                'Short desc.',
                'Supplier',
                'Brand',
                'Pkt qty',
                'Unit cost',
                'Last purch.',
                'Unit price',
                'Sell price',
                'Type',
                'Loc.',
                'Margin %',
              ]}
              rows={tableRows}
            />

            {tableRows.length === 0 ? (
              <div className="pointer-events-none absolute inset-x-4 top-28 flex justify-center">
                <div className="border border-slate-200 bg-white/95 px-5 py-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                  <p className="font-['Bahnschrift','Open_Sans',sans-serif] text-sm font-bold uppercase tracking-normal text-slate-900">
                    {emptyMessage}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">
                    {search || activeFilterCount > 0 ? 'Clear search or filters to widen the list.' : activeBranchLabel}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex min-w-0 flex-wrap items-center gap-3 justify-self-start">
              <p className="font-['Open_Sans',sans-serif] text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                <span className="text-slate-950">{rangeStart}</span>
                {'-'}
                <span className="text-slate-950">{rangeEnd}</span> of{' '}
                <span className="text-slate-950">{totalFiltered}</span>
              </p>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                Rows
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 w-12 cursor-pointer border border-slate-300 bg-white text-center text-[10px] font-bold text-slate-950 outline-none hover:border-slate-400"
                  aria-label="Rows per page"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <span className="hidden justify-self-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block">
              {activeBranchLabel}
            </span>

            <div
              className="inline-flex h-8 shrink-0 items-stretch justify-self-start overflow-hidden border border-slate-300 bg-white sm:justify-self-end"
              role="navigation"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="inline-flex w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-35"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                  <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex items-stretch border-l border-slate-300">
                {pageNumbers.map((n) => {
                  const active = n === page;
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`min-w-[2rem] border-r border-slate-300 px-2 text-center text-[10px] font-black leading-8 transition-colors ${
                        active ? 'bg-[#790728] text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setPage(n)}
                      aria-label={`Page ${n}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="inline-flex w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-35"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
