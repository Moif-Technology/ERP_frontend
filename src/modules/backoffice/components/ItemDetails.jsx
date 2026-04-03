import React, { useMemo, useState } from 'react';
import { colors, tableUi } from '../../../shared/constants/theme';
import { InputField, DropdownInput, SubInputField, Switch, CommonTable } from '../../../shared/components/ui';

const primary = colors.primary?.main || '#790728';
const headerPink = tableUi.header.backgroundColor;

const PRODUCT_CODE_OPTIONS = [
  { value: '10000000004902', label: '10000000004902 - Mango Juice' },
  { value: '10000000004903', label: '10000000004903 - Sample SKU' },
];

const PRODUCT_BRAND_OPTIONS = [{ value: '-', label: '-' }];

const panelClass = 'rounded-lg border border-gray-200 bg-white p-2.5 sm:p-3';
const panelTitleClass = 'mb-2 text-[10px] font-bold uppercase tracking-wide sm:text-[11px]';
const tableProps = {
  fitParentWidth: true,
  allowHorizontalScroll: true,
  headerBackgroundColor: headerPink,
  headerTextColor: '#000',
  headerFontSize: 'clamp(7px, 0.75vw, 9px)',
  bodyFontSize: 'clamp(8px, 0.85vw, 10px)',
  cellPaddingClass: 'px-1 py-1 sm:px-1.5 sm:py-1.5',
  hideVerticalCellBorders: true,
  cellAlign: 'center',
};

function ItemDetailsForm({ form, setForm, set, dailyTxn, setDailyTxn }) {
  return (
    <div className="flex flex-col gap-3 sm:gap-3.5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-3">
        <InputField label="Packet Details" fullWidth value={form.packetDetails} onChange={set('packetDetails')} />
        <InputField label="Pack Qty" fullWidth value={form.packQty} onChange={set('packQty')} />
        <InputField label="Unit" fullWidth value={form.unit} onChange={set('unit')} />
        <InputField label="Re Order Level" fullWidth value={form.reOrderLevel} onChange={set('reOrderLevel')} />
        <InputField label="Re Order Qty" fullWidth value={form.reOrderQty} onChange={set('reOrderQty')} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-3">
        <InputField label="Origin" fullWidth value={form.origin} onChange={set('origin')} />
        <InputField label="Remark" fullWidth value={form.remark} onChange={set('remark')} />
        <InputField label="ETA" fullWidth value={form.eta} onChange={set('eta')} />
        <InputField label="ETQty on hand" fullWidth value={form.etQtyOnHand} onChange={set('etQtyOnHand')} />
        <InputField label="Product Type" fullWidth value={form.productType} onChange={set('productType')} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 sm:gap-3">
        <InputField label="Supplier Ref. No" fullWidth value={form.supplierRefNo} onChange={set('supplierRefNo')} />
        <InputField label="Last Supplier" fullWidth value={form.lastSupplier} onChange={set('lastSupplier')} />
        <InputField label="Last Purch. Cost" fullWidth value={form.lastPurchCost} onChange={set('lastPurchCost')} />
        <InputField label="Avg. Cost" fullWidth value={form.avgCost} onChange={set('avgCost')} />
        <InputField label="Location" fullWidth value={form.location} onChange={set('location')} />
        <InputField label="Stock Type" fullWidth value={form.stockType} onChange={set('stockType')} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-3 lg:items-end">
        <InputField label="Min Unit Price" fullWidth value={form.minUnitPrice} onChange={set('minUnitPrice')} />
        <InputField label="Unit Price" fullWidth value={form.unitPrice} onChange={set('unitPrice')} />
        <SubInputField label="Margin %" fullWidth suffix="%" value={form.marginPct} onChange={set('marginPct')} />
        <SubInputField label="VAT Out" fullWidth suffix="%" value={form.vatOut} onChange={set('vatOut')} />
        <InputField label="Selling Price" fullWidth value={form.sellingPrice} onChange={set('sellingPrice')} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
        <Switch size="sm" checked={dailyTxn} onChange={setDailyTxn} description="Daily Transaction Item" />
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
    ],
    []
  );

  const procurementRows = useMemo(() => [['—', '—', '—', '—', '—', '—']], []);
  const revenueRows = useMemo(
    () => [
      ['BILL-001', '02/01/2026', 'Walk-in', 'PCS', '120.00'],
      ['BILL-002', '03/01/2026', 'Walk-in', 'PCS', '85.50'],
    ],
    []
  );
  const poArchiveRows = useMemo(() => [['—', '—', '—', '—', '—', '—']], []);

  const metaLine =
    'Created By: CASHIER, Created On: 07/01/2026, Modified By: CASHIER, Modified On: 07/01/2026';

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          ITEM DETAILS
        </h1>
        <p className="max-w-full text-left text-[9px] leading-snug text-neutral-600 sm:text-right sm:text-[10px] lg:max-w-[55%]">
          {metaLine}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4">
        <div className={`${panelClass} min-w-0 lg:min-h-0 lg:min-w-0 lg:flex-[3]`}>
          <ItemDetailsForm
            form={form}
            setForm={setForm}
            set={set}
            dailyTxn={dailyTxn}
            setDailyTxn={setDailyTxn}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:min-w-0 lg:max-w-full lg:flex-1 lg:basis-0">
          <div className={panelClass}>
            <h2 className={panelTitleClass} style={{ color: primary }}>
              Alternate products
            </h2>
            <CommonTable
              {...tableProps}
              tableClassName="min-w-0"
              headers={['Part no', 'Manufacture']}
              rows={alternateRows}
            />
          </div>

          <div className={panelClass}>
            <h2 className={panelTitleClass} style={{ color: primary }}>
              Multi location
            </h2>
            <CommonTable
              {...tableProps}
              tableClassName="min-w-0"
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

      <div className={panelClass}>
        <h2 className={panelTitleClass} style={{ color: primary }}>
          Multi location
        </h2>
        <CommonTable
          {...tableProps}
          tableClassName="min-w-[1200px]"
          headers={multiLocationMainHeaders}
          rows={multiLocationMainRows}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
        <div className={panelClass}>
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Procurement log
          </h2>
          <CommonTable
            {...tableProps}
            tableClassName="min-w-0"
            headers={['GRN no', 'Purchase date', 'Supplier', 'Qty', 'Unit price', 'Total']}
            rows={procurementRows}
          />
        </div>
        <div className={panelClass}>
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Revenue log
          </h2>
          <CommonTable
            {...tableProps}
            tableClassName="min-w-0"
            headers={['Bill no', 'Bill date', 'Customer', 'Unit', 'Total']}
            rows={revenueRows}
          />
        </div>
        <div className={panelClass}>
          <h2 className={panelTitleClass} style={{ color: primary }}>
            Purchase order archive
          </h2>
          <CommonTable
            {...tableProps}
            tableClassName="min-w-0"
            headers={['LPO no', 'LPO date', 'Supplier', 'Qty', 'Unit price', 'Total']}
            rows={poArchiveRows}
          />
        </div>
      </div>
    </div>
  );
}
