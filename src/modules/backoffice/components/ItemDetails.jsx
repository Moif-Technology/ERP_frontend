import React, { useMemo, useState } from 'react';
import { colors, itemDetailsTablePreset } from '../../../shared/constants/theme';
import { InputField, DropdownInput, SubInputField, Switch, CommonTable } from '../../../shared/components/ui';

const primary = colors.primary?.main || '#790728';

const COL2 = [50, 50];
const COL4 = [25, 25, 25, 25];
const COL5 = [20, 20, 20, 20, 20];
const COL6 = Array.from({ length: 6 }, () => 100 / 6);
const COL19 = Array.from({ length: 19 }, () => 100 / 19);

const PRODUCT_CODE_OPTIONS = [
  { value: '10000000004902', label: '10000000004902 - Mango Juice' },
  { value: '10000000004903', label: '10000000004903 - Sample SKU' },
];

const PRODUCT_BRAND_OPTIONS = [{ value: '-', label: '-' }];

const panelClass = 'rounded-lg border border-gray-200 bg-white p-1.5 sm:p-2';

const itemDetailsRootClass = 'min-w-0 rounded-lg bg-white p-2 sm:p-2.5';
const panelTitleClass = 'mb-1 text-[10px] font-bold uppercase tracking-wide sm:text-[11px]';

function ItemDetailsForm({ form, setForm, set, dailyTxn, setDailyTxn }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        <DropdownInput
          label="Product Code"
          fullWidth
          value={form.productCode}
          onChange={(v) => setForm((f) => ({ ...f, productCode: v }))}
          options={PRODUCT_CODE_OPTIONS}
        />
        <InputField label="Description" fullWidth value={form.description} onChange={set('description')} />
        <InputField label="Own Ref No" fullWidth value={form.ownRefNo} onChange={set('ownRefNo')} />
        <InputField label="Specification" fullWidth value={form.specification} onChange={set('specification')} />
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        <DropdownInput
          label="Product Brand"
          fullWidth
          value={form.productBrand}
          onChange={(v) => setForm((f) => ({ ...f, productBrand: v }))}
          options={PRODUCT_BRAND_OPTIONS}
        />
        <InputField label="Group" fullWidth value={form.group} onChange={set('group')} />
        <InputField label="SubGroup" fullWidth value={form.subGroup} onChange={set('subGroup')} />
        <InputField label="SubSubGroup" fullWidth value={form.subSubGroup} onChange={set('subSubGroup')} />
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
        <InputField label="Packet Details" fullWidth value={form.packetDetails} onChange={set('packetDetails')} />
        <InputField label="Pack Qty" fullWidth value={form.packQty} onChange={set('packQty')} />
        <InputField label="Unit" fullWidth value={form.unit} onChange={set('unit')} />
        <InputField label="Re Order Level" fullWidth value={form.reOrderLevel} onChange={set('reOrderLevel')} />
        <InputField label="Re Order Qty" fullWidth value={form.reOrderQty} onChange={set('reOrderQty')} />
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
        <InputField label="Origin" fullWidth value={form.origin} onChange={set('origin')} />
        <InputField label="Remark" fullWidth value={form.remark} onChange={set('remark')} />
        <InputField label="ETA" fullWidth value={form.eta} onChange={set('eta')} />
        <InputField label="ETQty on hand" fullWidth value={form.etQtyOnHand} onChange={set('etQtyOnHand')} />
        <InputField label="Product Type" fullWidth value={form.productType} onChange={set('productType')} />
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-6">
        <InputField label="Supplier Ref. No" fullWidth value={form.supplierRefNo} onChange={set('supplierRefNo')} />
        <InputField label="Last Supplier" fullWidth value={form.lastSupplier} onChange={set('lastSupplier')} />
        <InputField label="Last Purch. Cost" fullWidth value={form.lastPurchCost} onChange={set('lastPurchCost')} />
        <InputField label="Avg. Cost" fullWidth value={form.avgCost} onChange={set('avgCost')} />
        <InputField label="Location" fullWidth value={form.location} onChange={set('location')} />
        <InputField label="Stock Type" fullWidth value={form.stockType} onChange={set('stockType')} />
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <InputField label="Min Unit Price" fullWidth value={form.minUnitPrice} onChange={set('minUnitPrice')} />
          <InputField label="Unit Price" fullWidth value={form.unitPrice} onChange={set('unitPrice')} />
          <SubInputField label="Margin %" fullWidth suffix="%" value={form.marginPct} onChange={set('marginPct')} />
          <SubInputField label="VAT Out" fullWidth suffix="%" value={form.vatOut} onChange={set('vatOut')} />
          <InputField label="Selling Price" fullWidth value={form.sellingPrice} onChange={set('sellingPrice')} />
        </div>
        <div className="flex w-full shrink-0 items-center lg:w-auto lg:self-end lg:pb-px">
          <Switch size="xs" checked={dailyTxn} onChange={setDailyTxn} description="Daily Transaction Item" />
        </div>
      </div>
    </div>
  );
}

export default function ItemDetails() {
  const [dailyTxn, setDailyTxn] = useState(false);
  const [barcode, setBarcode] = useState('0.00');
  const [shelfTag, setShelfTag] = useState('0.00');
  const [form, setForm] = useState({
    productCode: '10000000004902',
    description: 'Mango juice',
    ownRefNo: '0',
    specification: '',
    productBrand: '-',
    group: 'PACKAGE',
    subGroup: '0',
    subSubGroup: '',
    packetDetails: 'Pcs',
    packQty: '1',
    unit: 'PCS',
    reOrderLevel: '0.0000',
    reOrderQty: '0.0000',
    origin: '',
    remark: '',
    eta: '',
    etQtyOnHand: '-64',
    productType: 'NORMAL',
    supplierRefNo: '',
    lastSupplier: '',
    lastPurchCost: '0.00',
    avgCost: '',
    location: '',
    stockType: 'INVENTORY',
    minUnitPrice: '0.0000',
    unitPrice: '0.00',
    marginPct: '0.00',
    vatOut: '5.00',
    sellingPrice: '0.00',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const alternateRows = useMemo(
    () => [
      ['—', '—'],
      ['—', '—'],
    ],
    []
  );

  const multiLocSmallRows = useMemo(
    () => [
      ['Main', '—', '0', '—'],
      ['North', '—', '0', '—'],
    ],
    []
  );

  const multiLocationMainHeaders = [
    'Own ref No',
    'Barcode',
    'Short description',
    'Unit',
    'Pack Qty',
    'Packet details',
    'Base cost',
    'Disc %',
    'Unit cost',
    'Last purch. cost',
    'Margin %',
    'Selling price',
    'Offer disc. %',
    'Offer disc. from',
    'Offer disc. to',
    'Print',
    'VAT%',
    'VAT amt',
    'Price + VAT',
  ];

  const multiLocationMainRows = useMemo(
    () => [
      [
        '0',
        '—',
        'Mango juice',
        'PCS',
        '1',
        'Pcs',
        '0.00',
        '0',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0',
        '—',
        '—',
        '—',
        '5',
        '0.00',
        '0.00',
      ],
      [
        '1',
        '890111',
        'Mango juice — carton',
        'BOX',
        '12',
        '12 pcs',
        '0.00',
        '0',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0',
        '—',
        '—',
        '—',
        '5',
        '0.00',
        '0.00',
      ],
      [
        '2',
        '890222',
        'Mango juice — promo',
        'PCS',
        '6',
        '6 pack',
        '0.00',
        '0',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0',
        '—',
        '—',
        '—',
        '5',
        '0.00',
        '0.00',
      ],
      [
        '3',
        '890333',
        'Mango juice — outlet',
        'PCS',
        '1',
        'Single',
        '0.00',
        '0',
        '0.00',
        '0.00',
        '0.00',
        '0.00',
        '0',
        '—',
        '—',
        '—',
        '5',
        '0.00',
        '0.00',
      ],
    ],
    []
  );

  const procurementRows = useMemo(
    () => [
      ['GRN-9001', '02/01/2026', 'Fresh Foods', '120', '4.20', '504.00'],
      ['GRN-9002', '04/01/2026', 'Metro Supply', '60', '5.00', '300.00'],
      ['GRN-9003', '06/01/2026', 'Walk-in vendor', '24', '3.50', '84.00'],
      ['GRN-9004', '08/01/2026', 'Fresh Foods', '200', '4.10', '820.00'],
    ],
    []
  );
  const revenueRows = useMemo(
    () => [
      ['BILL-001', '02/01/2026', 'Walk-in', 'PCS', '120.00'],
      ['BILL-002', '03/01/2026', 'Walk-in', 'PCS', '85.50'],
      ['BILL-003', '05/01/2026', 'Cafe Central', 'PCS', '64.00'],
      ['BILL-004', '06/01/2026', 'Walk-in', 'BOX', '210.00'],
      ['BILL-005', '07/01/2026', 'Hotel Plaza', 'PCS', '432.75'],
    ],
    []
  );
  const poArchiveRows = useMemo(
    () => [
      ['LPO-7001', '15/12/2025', 'Metro Supply', '100', '4.25', '425.00'],
      ['LPO-7002', '18/12/2025', 'Fresh Foods', '80', '4.50', '360.00'],
      ['LPO-7003', '22/12/2025', 'Metro Supply', '50', '4.00', '200.00'],
      ['LPO-7004', '27/12/2025', 'Global Trade', '120', '3.90', '468.00'],
    ],
    []
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-3">
      <div className={itemDetailsRootClass}>
        <div className="flex min-w-0 flex-col gap-2 pb-1 mb-2 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            ITEM DETAILS
          </h1>
          <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-[9px] text-neutral-600 sm:text-[10px] lg:justify-end">
            <span>
              <span className="font-semibold text-neutral-500">Created By:</span> CASHIER
            </span>
            <span>
              <span className="font-semibold text-neutral-500">Created On:</span> 07/01/2026
            </span>
            <span>
              <span className="font-semibold text-neutral-500">Modified By:</span> CASHIER
            </span>
            <span>
              <span className="font-semibold text-neutral-500">Modified On:</span> 07/01/2026
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-3">
          <div className="min-w-0 rounded-lg border border-gray-200 bg-slate-50/50 p-2 sm:p-2.5 lg:min-h-0 lg:min-w-0 lg:flex-[3]">
            <ItemDetailsForm
              form={form}
              setForm={setForm}
              set={set}
              dailyTxn={dailyTxn}
              setDailyTxn={setDailyTxn}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 lg:min-w-0 lg:max-w-full lg:flex-1 lg:basis-0">
            <div className={panelClass}>
              <h2 className={panelTitleClass} style={{ color: primary }}>
                Alternate products
              </h2>
              <CommonTable
                {...itemDetailsTablePreset}
                className="min-h-0 min-w-0 flex flex-col"
                tableClassName="min-w-0 w-full"
                columnWidthPercents={COL2}
                bodyRowHeightRem={1.85}
                headers={['Part no', 'Manufacture']}
                rows={alternateRows}
              />
            </div>

            <div className={panelClass}>
              <h2 className={panelTitleClass} style={{ color: primary }}>
                Multi location
              </h2>
              <CommonTable
                {...itemDetailsTablePreset}
                className="min-h-0 min-w-0 flex flex-col"
                tableClassName="min-w-0 w-full"
                columnWidthPercents={COL4}
                bodyRowHeightRem={1.85}
                headers={['Store', 'Last', 'Qty', 'Location']}
                rows={multiLocSmallRows}
              />
            </div>

            <div className={panelClass}>
              <h2 className={panelTitleClass} style={{ color: primary }}>
                Barcode / Shelf tag
              </h2>
              <div className="flex flex-col gap-2">
                <InputField label="Barcode" fullWidth value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                <InputField label="Shelf tag" fullWidth value={shelfTag} onChange={(e) => setShelfTag(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 min-w-0 pt-1">
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Multi location
          </h2>
          <CommonTable
            {...itemDetailsTablePreset}
            className="flex min-h-0 min-w-0 flex-col"
            tableClassName="min-w-[72rem] w-full"
            columnWidthPercents={COL19}
            bodyRowHeightRem={2}
            headers={multiLocationMainHeaders}
            rows={multiLocationMainRows}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-3">
        <div className={panelClass}>
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Procurement log
          </h2>
          <CommonTable
            {...itemDetailsTablePreset}
            className="min-h-0 min-w-0 flex flex-col"
            tableClassName="min-w-0 w-full"
            columnWidthPercents={COL6}
            bodyRowHeightRem={1.85}
            headers={['GRN no', 'Purchase date', 'Supplier', 'Qty', 'Unit price', 'Total']}
            rows={procurementRows}
          />
        </div>
        <div className={panelClass}>
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Revenue log
          </h2>
          <CommonTable
            {...itemDetailsTablePreset}
            className="min-h-0 min-w-0 flex flex-col"
            tableClassName="min-w-0 w-full"
            columnWidthPercents={COL5}
            bodyRowHeightRem={1.85}
            headers={['Bill no', 'Bill date', 'Customer', 'Unit', 'Total']}
            rows={revenueRows}
          />
        </div>
        <div className={panelClass}>
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Purchase order archive
          </h2>
          <CommonTable
            {...itemDetailsTablePreset}
            className="min-h-0 min-w-0 flex flex-col"
            tableClassName="min-w-0 w-full"
            columnWidthPercents={COL6}
            bodyRowHeightRem={1.85}
            headers={['LPO no', 'LPO date', 'Supplier', 'Qty', 'Unit price', 'Total']}
            rows={poArchiveRows}
          />
        </div>
      </div>
    </div>
  );
}
