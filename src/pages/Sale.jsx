import React, { useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import PostIcon from '../assets/icons/post.svg';
import UnpostIcon from '../assets/icons/unpost.svg';
import EditIcon from '../assets/icons/edit3.svg';
import SaleIcon from '../assets/icons/invoice.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import { InputField, SubInputField, DropdownInput, Switch, CommonTable } from '../components/ui';

export default function Sale() {
  const [accept, setAccept] = useState(false);
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  return (
    <>
      <style>{`
        .sale-btn-outline:hover {
          border-color: ${primary} !important;
          background: ${primaryHover} !important;
          color: ${primary} !important;
        }
        .sale-btn-outline:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-primary:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-primary:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-red-outline:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-red-outline:active {
          background: ${primaryActive} !important;
        }
      `}</style>

      <div className="my-2 flex flex-1 min-h-0 flex-col overflow-hidden px-1 sm:my-[15px] sm:mx-[-10px] sm:px-0">
        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden rounded-lg bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

          {/* Header */}
          <div className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              Sales
            </h1>

            <div className="flex gap-2 flex-wrap items-center">
              <button className="sale-btn-outline flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white sm:h-8 sm:w-8">
                <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              {[{ icon: CancelIcon, label: 'Cancel' },
                { icon: PostIcon, label: 'Post' },
                { icon: UnpostIcon, label: 'Unpost' }
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                >
                  <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content: fills viewport; xl = side-by-side with internal scroll; stacked = scroll inside main */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto xl:flex-row xl:overflow-hidden">

            {/* LEFT */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-3/4">
              {/* Form section - bordered */}
              <div className="shrink-0 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex flex-col gap-2">
                  {/* Row 1: Short Description + numeric fields */}
                  <div className="flex flex-wrap items-end gap-1 overflow-hidden sm:gap-[6px] xl:flex-nowrap [&>*]:min-w-0">
                    <InputField label="Short Description" />
                    <SubInputField label="Hs Code/Wt" type="number" />
                    <SubInputField label="Qty" type="number" />
                    <SubInputField label="Unit Price" type="number" />
                    <SubInputField label="Disc.%" type="number" />
                    <SubInputField label="Disc Price" type="number" />
                    <SubInputField label="Disc.Amt" type="number" />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 items-end gap-1 sm:grid-cols-3 sm:gap-[6px] md:grid-cols-4 lg:grid-cols-7">
                    <SubInputField label="Sub total" />
                    <SubInputField label="Tax%" />
                    <SubInputField label="T.Amt" />
                    <SubInputField label="Total" />

                    <DropdownInput label="Qutn. no" options={['QTN-001']} />
                    <DropdownInput label="DO. no" options={['DO-001']} />

                    <div className="flex items-center gap-2">
                      <Switch checked={accept} onChange={setAccept} description="Accept" />
                      <button
                        className="rounded px-1.5 py-0.5 text-[9px] text-white sm:px-2 sm:py-1 sm:text-[10px]"
                        style={{ backgroundColor: primary }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table section - separate bordered; only this area scrolls on xl */}
              <div className="min-h-[120px] flex-1 overflow-auto rounded border border-gray-200 bg-white p-2 sm:p-3 xl:min-h-0">
                <CommonTable
                  headers={[
                    '',
                    'Short Description',
                    'HS Code/Wt',
                    'Qty',
                    'Selling price',
                    'Disc %',
                    'Disc Amt',
                    'Sub total',
                    'Tax %',
                    'Tax amt',
                    'Line total',
                    'Action',
                  ]}
                  rows={[
                    [
                      <div className="flex justify-center"><input type="checkbox" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></div>,
                      'Product A',
                      'HS-1001',
                      '2',
                      '120.00',
                      '5',
                      '12.00',
                      '228.00',
                      '18',
                      '41.04',
                      '269.04',
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <button type="button" className="p-0.5"><img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                      </div>,
                    ],
                    [
                      <div className="flex justify-center"><input type="checkbox" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></div>,
                      'Product B',
                      'HS-2034',
                      '1',
                      '450.00',
                      '10',
                      '45.00',
                      '405.00',
                      '18',
                      '72.90',
                      '477.90',
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <button type="button" className="p-0.5"><img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                      </div>,
                    ],
                    [
                      <div className="flex justify-center"><input type="checkbox" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></div>,
                      'Service C',
                      'HS-9090',
                      '3',
                      '80.00',
                      '0',
                      '0.00',
                      '240.00',
                      '5',
                      '12.00',
                      '252.00',
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <button type="button" className="p-0.5"><img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
                      </div>,
                    ],
                  ]}
                />

              </div>
            </div>

            {/* RIGHT */}
            {/* <div className="w-full xl:w-1/4 bg-white p-3 border border-gray-200 rounded">

              <div className="flex flex-col gap-2">

              
         <div className="flex gap-2 items-end border-b border-gray-200 pb-2 flex-wrap">
  <SubInputField label="Sub Total" readOnly className="flex-1 min-w-[100px]" />
  <SubInputField label="Discount Amount" type="number" className="flex-1 min-w-[100px]" />
  <SubInputField label="Discount %" type="number" suffix="%" className="flex-1 min-w-[100px]" />
</div>

       
                  <InputField label="Total Amount" />
               

                <div className="grid grid-cols-2 ">
                  <SubInputField label="Tax" />
                  <SubInputField label="Tax %" suffix="%" />
                </div>

                <div className="grid grid-cols-2 ">
                  <SubInputField label="Round off" />
                  <SubInputField label="Net Amount" />
                </div>

              </div>
            </div> */}

           <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-1/4 xl:min-h-0 xl:overflow-hidden">
  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto sm:gap-3">
  <div className="shrink-0 rounded border border-gray-200 bg-white p-2 sm:p-3">
    <div className="flex flex-col gap-1 sm:gap-[8px]">

      {/* Row 1 */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px]">
        <SubInputField label="Sub Total" type="number" />
        <SubInputField label="Discount Amount" type="number" />
        <SubInputField label="Discount %" type="number" suffix="%" />
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px]">
        <InputField label="Total Amount" type="number" />
        <SubInputField label="Tax" type="number" />
        <SubInputField label="Tax %" type="number" suffix="%" />
      </div>

      {/* Row 3 */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px]">
        <InputField label="Round off" type="number" />
        <InputField label="Net Amount" type="number" />
      </div>

    </div>
  </div>

  {/* Button */}
  <button
    type="button"
    className="sale-btn-primary mt-1 w-full rounded border px-2 py-1.5 text-[9px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:mt-[6px] sm:px-3 sm:py-2 sm:text-[11px]"
    style={{ backgroundColor: primary, color: '#fff', borderColor: primary }}
  >
    Sales terms
  </button>

  {/* New bordered section below the button */}
  <div className="mt-1 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:mt-[8px] sm:p-3">
    <div className="flex flex-col gap-1 sm:gap-[8px]">
      {/* Row 1: Bill no + 2 sub fields */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
        <div className="flex-none">
          <InputField label="Bill no" />
        </div>
        <SubInputField label="Cust.Lpo 3" />
        <SubInputField label="Local bill no" />
      </div>

      {/* Row 2: Customer name + Payment mode */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
        <InputField label="Customer name" />
        <DropdownInput
          label=""
          options={['000001']}
          placeholder="000001"
          className="min-w-[80px] sm:min-w-[100px]"
        />
      </div>

      {/* Row 4: Account head + creditcard no + credit card type */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
        <InputField label="Account head" />
        <SubInputField label="Creditcard no" />
        <SubInputField label="Credit card type" />
      </div>

      {/* Row 5: Cashier name (dropdown) + Invoice amt */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
        <DropdownInput
          label="Cashier name"
          options={['Cashier 1', 'Cashier 2']}
          placeholder="Select"
        />
        <InputField label="Invoice amt" type="number" />
      </div>

      {/* Row 7: Station + Counter */}
      <div className="flex flex-wrap items-end gap-1 sm:gap-[6px] xl:flex-nowrap">
        <InputField label="Station" />
        <InputField label="Counter" />
      </div>

      {/* Row 8: Edit + New invoice buttons */}
      <div className="mt-1 flex gap-1 sm:mt-[8px] sm:gap-[6px]">
        <button
          type="button"
          className="sale-btn-red-outline flex flex-1 items-center justify-center gap-1 rounded border px-1.5 py-1.5 text-[9px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:px-2 sm:py-2 sm:text-[11px]"
          style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
        >
          <img src={EditIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
          Edit
        </button>

        <button
          type="button"
          className="sale-btn-red-outline flex flex-1 items-center justify-center gap-1 rounded border px-1.5 py-1.5 text-[9px] font-medium transition-all duration-150 hover:shadow-sm active:scale-[0.98] sm:px-2 sm:py-2 sm:text-[11px]"
          style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
        >
          <img src={SaleIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
          New invoice
        </button>
      </div>
    </div>
  </div>






  <div className="mt-1 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:mt-[8px] sm:p-3">
    <div className="flex flex-col gap-1 sm:gap-[8px]">

      {/* Paid Amount */}
      <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
        <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
          Paid Amount
        </label>
        <input
          type="number"
          className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
        />
      </div>

      {/* Balance Amount */}
      <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
        <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
          Balance Amount
        </label>
        <input
          type="number"
          className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
        />
      </div>

      {/* Paid by card */}
      <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
        <label className="min-w-0 shrink-0 text-[9px] text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
          Paid by card
        </label>
        <input
          type="number"
          className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
        />
      </div>

      {/* Paid by cash */}
      <div className="flex items-center justify-center gap-2 sm:gap-[10px]">
        <label className="min-w-0 shrink-0 text-[9px] text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]">
          Paid by cash
        </label>
        <input
          type="number"
          className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
        />
      </div>

    </div>
  </div>
  </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}