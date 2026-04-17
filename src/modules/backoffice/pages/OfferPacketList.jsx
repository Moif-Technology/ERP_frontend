import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import FilterIcon from '../../../shared/assets/icons/filter.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const primary = colors.primary?.main || '#790728';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];

const OP_COL_PCT = [7, 7, 7, 10, 10, 5, 4, 6, 6, 7, 6, 7, 6, 5, 4, 3];

const PACKET_NAMES = ['Weekend Combo', 'Family Saver', 'Snack Bundle', 'Office Pack', 'Fresh Picks'];
const BRANDS = ['Nova', 'Vertex', 'Apex', 'Pulse', 'Zenith'];
const GROUPS = ['Grocery', 'Beverages', 'Household', 'Personal care', 'Snacks'];
const SUPPLIERS = ['Gulf Supplies LLC', 'Prime Trade House', 'Apex Distribution', 'Blue Ocean Foods', 'Retail Source'];
const PRODUCT_TYPES = ['Offer packet', 'Bundle', 'Combo', 'Promo item', 'Seasonal'];
const LOCATIONS = ['Dubai Main', 'Sharjah Hub', 'Abu Dhabi WH', 'Ajman Store', 'RAK Depot'];

function buildDummyOfferPackets(count) {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const unitCost = (6 + (i % 7) * 1.35).toFixed(2);
    const lastPurchase = (Number(unitCost) + 0.65).toFixed(2);
    const unitPrice = (Number(unitCost) + 2.4).toFixed(2);
    const sellingPrice = (Number(unitPrice) + 1.75).toFixed(2);
    const margin = (((Number(sellingPrice) - Number(unitCost)) / Number(sellingPrice)) * 100).toFixed(2);
    rows.push({
      id: String(i + 1),
      ownRefNo: `OPL-${String(1001 + i).padStart(5, '0')}`,
      supplierRefNo: `SUP-${String(301 + i).padStart(4, '0')}`,
      barcode: `628${String(1000000 + i * 173).slice(-10)}`,
      shortDescription: `${PACKET_NAMES[i % PACKET_NAMES.length]} ${i + 1}`,
      supplierName: SUPPLIERS[i % SUPPLIERS.length],
      productBrand: BRANDS[i % BRANDS.length],
      pktQty: String(4 + (i % 8)),
      pktDetails: GROUPS[i % GROUPS.length],
      unitCost,
      lastPurchase,
      unitPrice,
      sellingPrice,
      productType: PRODUCT_TYPES[i % PRODUCT_TYPES.length],
      location: LOCATIONS[i % LOCATIONS.length],
      marginPct: margin,
      packetQty: String(4 + (i % 8)),
    });
  }
  return rows;
}

const DUMMY_PACKETS = buildDummyOfferPackets(36);

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';

const figmaToolbarBtn =
  `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;

const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px] sm:max-w-[520px] sm:pr-3 md:min-w-[280px] md:max-w-[320px]`;

const primaryLinkBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';

const SEARCH_PLACEHOLDER = 'Search…';

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OfferPacketList() {
  const [packets, setPackets] = useState(() => DUMMY_PACKETS.map((r) => ({ ...r })));
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [brandFilter, setBrandFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, brandFilter]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = packets;
    if (q) {
      list = packets.filter((r) =>
        [
          r.ownRefNo,
          r.supplierRefNo,
          r.barcode,
          r.shortDescription,
          r.supplierName,
          r.productBrand,
          r.pktQty,
          r.pktDetails,
          r.unitCost,
          r.lastPurchase,
          r.unitPrice,
          r.sellingPrice,
          r.productType,
          r.location,
          r.marginPct,
        ]
          .map((x) => String(x ?? '').toLowerCase())
          .join(' ')
          .includes(q),
      );
    }
    if (brandFilter !== 'all') {
      list = list.filter((r) => String(r.productBrand).toLowerCase() === brandFilter);
    }
    const sorted = [...list];
    if (sortBy === 'ownRefNo') {
      sorted.sort((a, b) => String(a.ownRefNo).localeCompare(String(b.ownRefNo)));
    } else if (sortBy === 'shortDescription') {
      sorted.sort((a, b) => String(a.shortDescription).localeCompare(String(b.shortDescription)));
    } else if (sortBy === 'supplierName') {
      sorted.sort((a, b) => String(a.supplierName).localeCompare(String(b.supplierName)));
    }
    return sorted;
  }, [packets, search, sortBy, brandFilter]);

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

  const tableRows = useMemo(() => {
    return paginatedRows.map((r) => {
      return [
        r.ownRefNo,
        r.supplierRefNo,
        r.barcode,
        <span key={`sd-${r.id}`} className="block w-full text-left">
          {r.shortDescription}
        </span>,
        <span key={`sn-${r.id}`} className="block w-full text-left">
          {r.supplierName}
        </span>,
        r.productBrand,
        r.pktQty,
        r.pktDetails,
        r.unitCost,
        r.lastPurchase,
        r.unitPrice,
        r.sellingPrice,
        r.productType,
        r.location,
        `${r.marginPct}%`,
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className={actionIconBtn}
            aria-label="View offer packet"
            onClick={() => {}}
          >
            <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button
            type="button"
            className={actionIconBtn}
            aria-label="Edit offer packet"
            onClick={() => {}}
          >
            <img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button
            type="button"
            className={actionIconBtn}
            aria-label="Delete offer packet"
            onClick={() => setPackets((prev) => prev.filter((row) => row.id !== r.id))}
          >
            <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ];
    });
  }, [paginatedRows]);

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

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1
          className="shrink-0 text-base font-bold sm:text-lg xl:text-xl"
          style={{ color: primary }}
        >
          OFFER PACKET LIST
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/deals-offers/offer-packet-creation"
            className={primaryLinkBtn}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            New offer packet
          </Link>
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={CancelIcon} alt="" className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button type="button" className={figmaToolbarBtn}>
            <img src={EditIcon} alt="" className="h-3.5 w-3.5" />
            Edit
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
          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[12rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none sm:min-w-[7.5rem]"
              aria-label="Sort"
            >
              <option value="default">Sort: Default</option>
              <option value="ownRefNo">Sort: Own Ref No</option>
              <option value="shortDescription">Sort: Short description</option>
              <option value="supplierName">Sort: Supplier name</option>
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>

          <div className={`relative inline-flex h-7 min-h-7 items-center gap-1 px-1.5 py-[3px] ${figmaOutline}`}>
            <img src={FilterIcon} alt="" className="h-3.5 w-3.5 shrink-0" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="h-7 min-w-[6.5rem] max-w-[12rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none sm:min-w-[7.5rem]"
              aria-label="Filter"
            >
              <option value="all">Filter: All</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand.toLowerCase()}>
                  Filter: {brand}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="offer-packet-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          columnWidthPercents={OP_COL_PCT}
          tableClassName="min-w-[1180px] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={Math.min(pageSize, 24)}
          headers={[
            'Own Ref No',
            'Supp. Ref No',
            'Bar Code',
            'Short Descriotion',
            'Supplier Name',
            'Brand',
            'Pkt Qty',
            'Pkt. Details',
            'Unit Cost',
            'Last Purchase',
            'Unit Price',
            'Selling Price',
            'Product Type',
            'Location',
            'Margin %',
            'Action',
          ]}
          rows={tableRows}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center gap-y-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start sm:gap-3">
            <p className="font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Showing{' '}
              <span className="text-black">{rangeStart}</span>
              {'–'}
              <span className="text-black">{rangeEnd}</span> of{' '}
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

          <span className="hidden sm:block" aria-hidden />

          <div
            className="inline-flex h-7 w-max max-w-full items-stretch justify-self-start overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end"
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
