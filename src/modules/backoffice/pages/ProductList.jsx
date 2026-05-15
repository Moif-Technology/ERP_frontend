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

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[280px] sm:max-w-[640px] sm:pr-3 md:min-w-[360px] md:max-w-[320px]`;
const toolbarBtn =
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50';
const toolbarSelect =
  'relative inline-flex h-7 min-h-7 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50';

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

  const emptyMessage = loadingBranches || loadingProducts
    ? 'Loading inventory records...'
    : loadError || 'No products match the current view.';

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          PRODUCT LISTING
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Link
            to="/data-entry/product-entry"
            className={`${toolbarBtn} no-underline`}
            title="New product"
          >
            + New product
          </Link>
          <button type="button" className={toolbarBtn} title="Print" aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3 w-3" />
            Print
          </button>
          <button type="button" className={toolbarBtn} title="Cancel" aria-label="Cancel">
            <img src={CancelIcon} alt="" className="h-3 w-3" />
            Cancel
          </button>
          <button
            type="button"
            className={toolbarBtn}
            disabled={selectedRowCount !== 1}
            title="Edit"
            aria-label="Edit selected product"
            onClick={() => {
              const selectedId = [...selectedIds].find((id) => filteredIdSet.has(id));
              const selectedRow = filteredRows.find((row) => row.id === selectedId);
              if (selectedRow?.productId) {
                navigate(`/data-entry/product-entry?productId=${selectedRow.productId}&branchId=${branchId}`);
              }
            }}
          >
            <img src={EditIcon} alt="" className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            className={toolbarBtn}
            title="Refresh"
            aria-label="Refresh products"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loadingBranches || loadingProducts}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400 placeholder:font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:h-7 sm:shrink-0 sm:flex-nowrap">
          {branchOptions.length > 1 ? (
            <div className={toolbarSelect}>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="h-7 min-w-[8.5rem] max-w-[13rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-xs font-medium text-neutral-700 outline-none"
                aria-label="Branch"
                disabled={loadingBranches || loadingProducts}
              >
                {branchOptions.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                <ToolbarChevron />
              </span>
            </div>
          ) : null}

          <div className={toolbarSelect}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[11rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-xs font-medium text-neutral-700 outline-none sm:min-w-[7.5rem]"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="supplier">Sort: Supplier</option>
              <option value="desc">Sort: Description</option>
              <option value="sellHigh">Sort: Sell price high</option>
              <option value="marginHigh">Sort: Margin high</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>

          <button
            type="button"
            className={toolbarBtn}
            aria-expanded={filterDrawerOpen}
            aria-haspopup="dialog"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <img src={FilterIcon} alt="" className="h-3 w-3 shrink-0" />
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </button>
        </div>
      </div>

      {loadingBranches || loadingProducts || loadError ? (
        <div
          className={`shrink-0 rounded border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] ${
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
          headerFontSize="clamp(7px, 0.9vw, 9px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(9px, 1.25vw, 12px)"
          cellPaddingClass="px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5"
          bodyRowHeightRem={2.35}
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

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of{' '}
              <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300"
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

          {selectedRowCount >= 1 ? (
            <p
              className="justify-self-center text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold sm:text-[11px]"
              style={{ color: primary }}
              role="status"
              aria-live="polite"
            >
              {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} selected
            </p>
          ) : (
            <span className="hidden sm:block" aria-hidden />
          )}

          <div
            className="inline-flex h-7 shrink-0 items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end"
            role="navigation"
            aria-label="Pagination"
          >
            <button
              type="button"
              className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${
                      active ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                    } ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                    style={active ? { backgroundColor: primary } : undefined}
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
              className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35"
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
  );
}
