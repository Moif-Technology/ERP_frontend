import React, { useMemo, useState } from 'react';
import { colors, itemDetailsTablePreset } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, InputField, SubInputField } from '../../../shared/components/ui';
import SearchIcon from '../../../shared/assets/icons/search3.svg';
import RefreshIcon from '../../../shared/assets/icons/refresh.svg';
import EditIcon from '../../../shared/assets/icons/edit2.svg';
import DeleteIcon from '../../../shared/assets/icons/delete.svg';
import VendorIcon from '../../../shared/assets/icons/vendor.svg';
import LedgerIcon from '../../../shared/assets/icons/ledger.svg';
import PricingIcon from '../../../shared/assets/icons/pricing.svg';
import AltIcon from '../../../shared/assets/icons/alternative.svg';

const primary = colors.primary?.main || '#790728';

const shellClass =
  'box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-2 rounded-lg border-2 border-gray-200 bg-gray-100/95 p-2 shadow-sm sm:gap-3 sm:p-3';

const cardClass = 'min-w-0 rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm sm:p-2';

const itemDetailsRootClass = 'min-w-0 min-h-0 rounded-lg bg-white';

const panelTitleClass = 'mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-800 sm:text-[11px]';

const selectOpts = ['—', 'Select…'];
const brandOpts = ['—', 'Brand A', 'Brand B'];
const groupOpts = ['—', 'Group 1', 'Group 2'];
const productTypeOpts = ['—', 'Stock', 'Non-stock', 'Service'];
const stockTypeOpts = ['—', 'Normal', 'Batch', 'Serial'];
const unitOpts = ['—', 'PCS', 'KG', 'BOX'];

const MULTI_LOC_HEADERS = [
  'Own ref No',
  'Barcode',
  'Short Description',
  'Unit',
  'Pack Qty',
  'Packet Details',
  'Base Cost',
  'Disc %',
  'Unit Cost',
  'Last Purch. Cost',
  'Margin %',
  'Selling Price',
  'Offer Disc. %',
  'Offer Disc. From',
  'Offer Disc. To',
  'Print',
  'VAT%',
  'VAT AMT',
  'Price + VAT',
];

const MULTI_LOC_COL_PCT = Array.from({ length: 19 }, () => 100 / 19);

const PROCUREMENT_HEADERS = ['GRN No', 'Purchase Date', 'Supplier', 'Qty', 'Unit price', 'Total'];
const REVENUE_HEADERS = ['Bill no', 'Bill Date', 'Customer', 'Unit', 'Total'];
const PO_HEADERS = ['LPO No', 'LPO Date', 'Supplier', 'Qty', 'Unit price', 'Total'];

const HOME_TOOL_ITEMS = [
  { label: 'Multi vendors', icon: VendorIcon },
  { label: 'Item Ledger', icon: LedgerIcon },
  { label: 'Pricing', icon: PricingIcon },
  { label: 'Alternative', icon: AltIcon },
];

const HOME_ACTION_ITEMS = [
  { label: 'Search', icon: SearchIcon },
  { label: 'Refresh', icon: RefreshIcon },
  { label: 'Edit', icon: EditIcon },
];

const altProductRows = [
  ['ALT-1001', 'Mfg A'],
  ['ALT-1002', 'Mfg B'],
];

const smallMultiLocRows = [
  ['Main', '—', '120', 'A-01'],
  ['Branch', '—', '45', 'B-12'],
];

const COL2 = [50, 50];
const COL4 = [25, 25, 25, 25];
const COL5 = [20, 20, 20, 20, 20];
const COL6 = Array.from({ length: 6 }, () => 100 / 6);

function ItemDetailsPanelTable({ title, headers, rows, columnWidthPercents }) {
  return (
    <div className={cardClass}>
      <h3 className={panelTitleClass}>{title}</h3>
      <CommonTable
        {...itemDetailsTablePreset}
        className="min-h-0 min-w-0 flex flex-col"
        tableClassName="min-w-0 w-full"
        columnWidthPercents={columnWidthPercents}
        bodyRowHeightRem={1.85}
        headers={headers}
        rows={rows}
      />
    </div>
  );
}

export default function Home() {
  const [dailyTxn, setDailyTxn] = useState(false);
  const [activeTool, setActiveTool] = useState('Multi vendors');

  const multiLocRows = useMemo(
    () => [
      [
        'REF-001',
        '8901234567890',
        'Sample SKU description',
        'PCS',
        '12',
        '12 / Carton',
        '10.50',
        '0',
        '10.50',
        '10.50',
        '15',
        '12.08',
        '0',
        '—',
        '—',
        '—',
        '5',
        '0.60',
        '12.68',
      ],
      [
        'REF-002',
        '8901234567901',
        'Alternate pack size',
        'BOX',
        '6',
        '6 / Pack',
        '8.00',
        '5',
        '7.60',
        '7.50',
        '12',
        '11.20',
        '2',
        '01/02/2026',
        '28/02/2026',
        '—',
        '5',
        '0.56',
        '11.76',
      ],
      [
        'REF-003',
        '8901234567902',
        'Promo bundle line',
        'PCS',
        '24',
        '24 / Case',
        '9.75',
        '0',
        '9.75',
        '9.80',
        '10',
        '10.73',
        '0',
        '—',
        '—',
        '—',
        '5',
        '0.54',
        '11.27',
      ],
      [
        'REF-004',
        '8901234567903',
        'Outlet-only SKU',
        'KG',
        '1',
        'Bulk',
        '22.00',
        '0',
        '22.00',
        '21.50',
        '8',
        '23.22',
        '0',
        '—',
        '—',
        '—',
        '5',
        '1.16',
        '24.38',
      ],
    ],
    [],
  );

  const procurementRows = useMemo(
    () => [
      ['GRN-2401', '02/01/2026', 'Supplier X', '100', '5.00', '500.00'],
      ['GRN-2402', '05/01/2026', 'Supplier A', '80', '4.50', '360.00'],
      ['GRN-2403', '08/01/2026', 'Supplier B', '200', '3.20', '640.00'],
      ['GRN-2404', '10/01/2026', 'Supplier C', '50', '6.00', '300.00'],
    ],
    [],
  );
  const revenueRows = useMemo(
    () => [
      ['INV-001', '01/01/2026', 'Walk-in', '2', '0.00'],
      ['INV-002', '04/01/2026', 'Acme Ltd', '5', '150.00'],
      ['INV-003', '06/01/2026', 'Walk-in', '1', '45.00'],
      ['INV-004', '07/01/2026', 'Retail Co', '3', '220.50'],
    ],
    [],
  );
  const poRows = useMemo(
    () => [
      ['LPO-889', '28/12/2025', 'Supplier Y', '50', '4.20', '210.00'],
      ['LPO-890', '03/01/2026', 'Supplier Y', '30', '4.00', '120.00'],
      ['LPO-891', '05/01/2026', 'Supplier A', '75', '3.85', '288.75'],
      ['LPO-892', '09/01/2026', 'Supplier B', '40', '5.50', '220.00'],
    ],
    [],
  );

  const multiLocTableRows = useMemo(() => multiLocRows.map((cells) => [...cells]), [multiLocRows]);

  return (
    <div className={shellClass}>
      <div className={itemDetailsRootClass}>
        <div className="mb-2 flex min-w-0 flex-col gap-2 rounded-md border border-gray-200 bg-white p-1.5 sm:flex-row sm:items-center sm:justify-between sm:p-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {HOME_TOOL_ITEMS.map((item) => {
              const isActive = activeTool === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveTool(item.label)}
                  className={`flex h-7 flex-shrink-0 items-center gap-1 rounded-md border px-2 text-[9px] font-medium transition-colors sm:text-[10px] ${
                    isActive ? 'bg-white shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                  style={{
                    borderColor: isActive ? primary : undefined,
                    color: isActive ? primary : '#334155',
                  }}
                >
                  <img src={item.icon} alt="" className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-shrink-0 gap-1.5">
            {HOME_ACTION_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                title={item.label}
                className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <img src={item.icon} alt="" className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              aria-label="Delete"
              title="Delete"
              className="flex h-7 w-7 items-center justify-center rounded bg-red-600 transition-colors hover:bg-red-700"
            >
              <img src={DeleteIcon} alt="" className="h-3 w-3 brightness-0 invert" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 pb-1 mb-2 sm:flex-row sm:items-start sm:justify-between">
          <h1
            className="shrink-0 text-sm font-bold leading-tight sm:text-base md:text-lg"
            style={{ color: primary }}
          >
            ITEM DETAILS
          </h1>
          <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[9px] text-gray-700 sm:text-[10px]">
            <span>
              <span className="font-semibold text-gray-600">Created By:</span> CASHIER
            </span>
            <span>
              <span className="font-semibold text-gray-600">Created On:</span> 07/01/2026
            </span>
            <span>
              <span className="font-semibold text-gray-600">Modified By:</span> CASHIER
            </span>
            <span>
              <span className="font-semibold text-gray-600">Modified On:</span> 07/01/2026
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-3">
          <div className="min-w-0 flex-1 space-y-2.5 rounded-lg border border-gray-200 bg-slate-50/50 p-2 sm:p-2.5">
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              <DropdownInput
                label="Product Code"
                fullWidth
                value=""
                onChange={() => {}}
                options={selectOpts}
                placeholder="Search"
              />
              <InputField label="Description" fullWidth placeholder="" />
              <SubInputField label="Own Ref No" fullWidth placeholder="" />
              <SubInputField label="Specification" fullWidth placeholder="" />
            </div>
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              <DropdownInput label="Product Brand" fullWidth value="" onChange={() => {}} options={brandOpts} placeholder="Select" />
              <DropdownInput label="Group" fullWidth value="" onChange={() => {}} options={groupOpts} placeholder="Select" />
              <DropdownInput label="SubGroup" fullWidth value="" onChange={() => {}} options={groupOpts} placeholder="Select" />
              <DropdownInput label="SubSubGroup" fullWidth value="" onChange={() => {}} options={groupOpts} placeholder="Select" />
            </div>
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
              <SubInputField label="Packet Details" fullWidth placeholder="" />
              <SubInputField label="Pack Qty" fullWidth placeholder="0" />
              <DropdownInput label="Unit" fullWidth value="" onChange={() => {}} options={unitOpts} placeholder="Select" />
              <SubInputField label="Re Order Level" fullWidth placeholder="0" />
              <SubInputField label="Re Order Qty" fullWidth placeholder="0" />
            </div>
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
              <SubInputField label="Origin" fullWidth placeholder="" />
              <InputField label="Remark" fullWidth placeholder="" />
              <SubInputField label="ETA" fullWidth placeholder="" />
              <SubInputField label="EtQty On Hand" fullWidth placeholder="0" />
              <DropdownInput label="Product Type" fullWidth value="" onChange={() => {}} options={productTypeOpts} placeholder="Select" />
            </div>
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-6">
              <SubInputField label="Supplier Ref. No" fullWidth placeholder="" />
              <SubInputField label="Last Supplier" fullWidth placeholder="" />
              <SubInputField label="Last Purch. Cost" fullWidth placeholder="0.00" />
              <SubInputField label="Avg. Cost" fullWidth placeholder="0.00" />
              <SubInputField label="Location" fullWidth placeholder="" />
              <DropdownInput label="Stock Type" fullWidth value="" onChange={() => {}} options={stockTypeOpts} placeholder="Select" />
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-3">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
                <SubInputField label="Min Unit Price" fullWidth placeholder="0.00" />
                <SubInputField label="Unit Price" fullWidth placeholder="0.00" />
                <SubInputField label="Margin %" fullWidth placeholder="0" />
                <SubInputField label="VAT Out" fullWidth placeholder="0" />
                <SubInputField label="Selling Price" fullWidth placeholder="0.00" />
              </div>
              <label className="flex w-full shrink-0 cursor-pointer items-center gap-1.5 lg:w-auto lg:max-w-[9rem] lg:self-end lg:pb-px">
                <button
                  type="button"
                  role="switch"
                  aria-checked={dailyTxn}
                  aria-label="Daily transaction item"
                  onClick={() => setDailyTxn((v) => !v)}
                  className={`relative h-3.5 w-7 shrink-0 rounded-full border-0 outline-none ring-0 transition-colors focus-visible:outline-none ${
                    dailyTxn ? '' : 'bg-gray-300'
                  }`}
                  style={dailyTxn ? { backgroundColor: primary } : undefined}
                >
                  <span
                    className={`absolute top-px h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                      dailyTxn ? 'left-3.5' : 'left-px'
                    }`}
                  />
                </button>
                <span className="text-[7px] font-medium leading-tight text-gray-700 sm:text-[8px]">
                  Daily Transaction Item
                </span>
              </label>
            </div>
          </div>

          <div className="flex min-w-0 w-full shrink-0 flex-col gap-2 lg:w-56 xl:w-64">
            <ItemDetailsPanelTable
              title="Alternate products"
              headers={['Part No', 'Manufacture']}
              rows={altProductRows}
              columnWidthPercents={COL2}
            />
            <ItemDetailsPanelTable
              title="Multi location"
              headers={['Store', 'Last', 'Qty', 'Location']}
              rows={smallMultiLocRows}
              columnWidthPercents={COL4}
            />
            <div className={`${cardClass} space-y-2`}>
              <SubInputField label="Barcode" fullWidth placeholder="0.00" />
              <SubInputField label="Shelftag" fullWidth placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="mt-2 min-w-0 pt-1">
          <h2 className={panelTitleClass}>Multi Location</h2>
          <CommonTable
            {...itemDetailsTablePreset}
            className="item-details-multi-loc flex min-h-0 min-w-0 flex-col"
            columnWidthPercents={MULTI_LOC_COL_PCT}
            tableClassName="min-w-[72rem] w-full"
            cellPaddingClass="px-0.5 py-1 sm:px-1"
            bodyRowHeightRem={2}
            headers={MULTI_LOC_HEADERS}
            rows={multiLocTableRows}
          />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-3">
        <div className={cardClass}>
          <h3 className={`${panelTitleClass} text-center`}>Procurement log</h3>
          <CommonTable
            {...itemDetailsTablePreset}
            className="min-h-0 min-w-0 flex flex-col"
            tableClassName="min-w-0 w-full"
            columnWidthPercents={COL6}
            bodyRowHeightRem={1.85}
            headers={PROCUREMENT_HEADERS}
            rows={procurementRows}
          />
        </div>
        <div className={cardClass}>
          <h3 className={`${panelTitleClass} text-center`}>Revenue log</h3>
          <CommonTable
            {...itemDetailsTablePreset}
            className="min-h-0 min-w-0 flex flex-col"
            tableClassName="min-w-0 w-full"
            columnWidthPercents={COL5}
            bodyRowHeightRem={1.85}
            headers={REVENUE_HEADERS}
            rows={revenueRows}
          />
        </div>
        <div className={cardClass}>
          <h3 className={`${panelTitleClass} text-center`}>Purchase order archive</h3>
          <CommonTable
            {...itemDetailsTablePreset}
            className="min-h-0 min-w-0 flex flex-col"
            tableClassName="min-w-0 w-full"
            columnWidthPercents={COL6}
            bodyRowHeightRem={1.85}
            headers={PO_HEADERS}
            rows={poRows}
          />
        </div>
      </div>
    </div>
  );
}
