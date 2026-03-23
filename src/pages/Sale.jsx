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

      <div className="my-[15px] mx-[-10px]">
        <div className="rounded-lg bg-white shadow-sm p-4 flex flex-col gap-4">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg sm:text-xl font-bold" style={{ color: primary }}>
              Sales
            </h1>

            <div className="flex gap-2 flex-wrap items-center">
              <button className="sale-btn-outline w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white">
                <img src={PrinterIcon} alt="" className="w-4 h-4" />
              </button>

              {[{ icon: CancelIcon, label: 'Cancel' },
                { icon: PostIcon, label: 'Post' },
                { icon: UnpostIcon, label: 'Unpost' }
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="sale-btn-outline flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-gray-300 bg-white"
                >
                  <img src={btn.icon} alt="" className="w-4 h-4" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col xl:flex-row gap-3">

            {/* LEFT */}
            <div className="w-full xl:w-3/4 bg-white p-3 border border-gray-200 rounded overflow-hidden">

              <div className="flex flex-col gap-2">

                {/* Row 1: Short Description + numeric fields */}
                <div className="flex gap-[2px] flex-wrap xl:flex-nowrap items-end [&>*]:shrink-0 overflow-hidden">
                  <InputField label="Short Description" />
                  <SubInputField label="Hs Code/Wt" type="number" />
                  <SubInputField label="Qty" type="number" />
                  <SubInputField label="Unit Price" type="number" />
                  <SubInputField label="Disc.%" type="number" />
                  <SubInputField label="Disc Price" type="number" />
                  <SubInputField label="Disc.Amt" type="number" />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-[6px] items-end">
                  <SubInputField label="Sub total" />
                  <SubInputField label="Tax%" />
                  <SubInputField label="T.Amt" />
                  <SubInputField label="Total" />

                  <DropdownInput label="Qutn. no" options={['QTN-001']} />
                  <DropdownInput label="DO. no" options={['DO-001']} />

                  <div className="flex items-center gap-2">
                    <Switch checked={accept} onChange={setAccept} description="Accept" />
                    <button
                      className="px-2 py-1 text-[10px] text-white rounded"
                      style={{ backgroundColor: primary }}
                    >
                      Save
                    </button>
                  </div>
                </div>

                <CommonTable
                  className="mt-[8px]"
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
                      <div className="flex justify-center"><input type="checkbox" /></div>,
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
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" className="p-0.5"><img src={ViewActionIcon} alt="View" className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={EditActionIcon} alt="Edit" className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={DeleteActionIcon} alt="Delete" className="w-3.5 h-3.5" /></button>
                      </div>,
                    ],
                    [
                      <div className="flex justify-center"><input type="checkbox" /></div>,
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
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" className="p-0.5"><img src={ViewActionIcon} alt="View" className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={EditActionIcon} alt="Edit" className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={DeleteActionIcon} alt="Delete" className="w-3.5 h-3.5" /></button>
                      </div>,
                    ],
                    [
                      <div className="flex justify-center"><input type="checkbox" /></div>,
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
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" className="p-0.5"><img src={ViewActionIcon} alt="View" className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={EditActionIcon} alt="Edit" className="w-3.5 h-3.5" /></button>
                        <button type="button" className="p-0.5"><img src={DeleteActionIcon} alt="Delete" className="w-3.5 h-3.5" /></button>
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

           <div className="w-full xl:w-1/4">
  <div className="bg-white p-3 border border-gray-200 rounded">
    <div className="flex flex-col gap-[8px]">

      {/* Row 1 */}
      <div className="flex gap-[6px] items-end">
        <SubInputField label="Sub Total" type="number" />
        <SubInputField label="Discount Amount" type="number" />
        <SubInputField label="Discount %" type="number" suffix="%" />
      </div>

      {/* Row 2 */}
      <div className="flex gap-[6px] items-end">
        <InputField label="Total Amount" type="number" />
        <SubInputField label="Tax" type="number" />
        <SubInputField label="Tax %" type="number" suffix="%" />
      </div>

      {/* Row 3 */}
      <div className="flex gap-[6px] items-end">
        <InputField label="Round off" type="number" />
        <InputField label="Net Amount" type="number" />
      </div>

    </div>
  </div>

  {/* Button */}
  <button
    type="button"
    className="sale-btn-primary w-full mt-[6px] px-3 py-2 text-[11px] font-medium rounded border transition-all duration-150 hover:shadow-sm active:scale-[0.98]"
    style={{ backgroundColor: primary, color: '#fff', borderColor: primary }}
  >
    Sales terms
  </button>

  {/* New bordered section below the button */}
  <div className="mt-[8px] bg-white p-3 border border-gray-200 rounded overflow-hidden">
    <div className="flex flex-col gap-[8px]">
      {/* Row 1: Bill no + 2 sub fields */}
      <div className="flex gap-[6px] items-end flex-wrap xl:flex-nowrap">
        <div className="flex-none">
          <InputField label="Bill no" />
        </div>
        <SubInputField label="Cust.Lpo 3" />
        <SubInputField label="Local bill no" />
      </div>

      {/* Row 2: Customer name + Payment mode */}
      <div className="flex gap-[6px] items-end flex-wrap xl:flex-nowrap">
        <InputField label="Customer name" />
        <DropdownInput
          label=""
          options={['000001']}
          placeholder="000001"
          className="w-28 min-w-[100px]"
        />
      </div>

      {/* Row 4: Account head + creditcard no + credit card type */}
      <div className="flex gap-[6px] items-end flex-wrap xl:flex-nowrap">
        <InputField label="Account head" />
        <SubInputField label="Creditcard no" />
        <SubInputField label="Credit card type" />
      </div>

      {/* Row 5: Cashier name (dropdown) + Invoice amt */}
      <div className="flex gap-[6px] items-end flex-wrap xl:flex-nowrap">
        <DropdownInput
          label="Cashier name"
          options={['Cashier 1', 'Cashier 2']}
          placeholder="Select"
        />
        <InputField label="Invoice amt" type="number" />
      </div>

      {/* Row 7: Station + Counter */}
      <div className="flex gap-[6px] items-end flex-wrap xl:flex-nowrap">
        <InputField label="Station" />
        <InputField label="Counter" />
      </div>

      {/* Row 8: Edit + New invoice buttons */}
      <div className="flex gap-[6px] mt-[8px]">
        <button
          type="button"
          className="sale-btn-red-outline flex-1 px-2 py-2 text-[11px] font-medium rounded border transition-all duration-150 hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
        >
          <img src={EditIcon} alt="" className="w-4 h-4" />
          Edit
        </button>

        <button
          type="button"
          className="sale-btn-red-outline flex-1 px-2 py-2 text-[11px] font-medium rounded border transition-all duration-150 hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ backgroundColor: 'transparent', color: primary, borderColor: primary }}
        >
          <img src={SaleIcon} alt="" className="w-4 h-4" />
          New invoice
        </button>
      </div>
    </div>
  </div>






  <div className="mt-[8px] bg-white p-3 border border-gray-200 rounded overflow-hidden">
  <div className="bg-white p-3 border border-gray-200 rounded">
    
    <div className="flex flex-col gap-[8px]">

      {/* Paid Amount */}
      <div className="flex items-center justify-between gap-[10px]">
        <label className="text-[10px] text-gray-700 w-[120px]">
          Paid Amount
        </label>
        <input
          type="number"
         
          className="w-[200px] h-[28px] border border-gray-300 rounded px-2 text-[10px] bg-gray-100 outline-none"
        />
      </div>

      {/* Balance Amount */}
      <div className="flex items-center justify-between gap-[10px]">
        <label className="text-[10px] text-gray-700 w-[120px]">
          Balance Amount
        </label>
        <input
          type="number"
         
          className="w-[200px] h-[28px] border border-gray-300 rounded px-2 text-[10px] bg-gray-100 outline-none"
        />
      </div>

      {/* Paid by card */}
      <div className="flex items-center justify-between gap-[10px]">
        <label className="text-[10px] text-gray-700 w-[120px]">
          Paid by card
        </label>
        <input
          type="number"
          
          className="w-[200px] h-[28px] border border-gray-300 rounded px-2 text-[10px] bg-gray-100 outline-none"
        />
      </div>

      {/* Paid by cash */}
      <div className="flex items-center justify-between gap-[10px]">
        <label className="text-[10px] text-gray-700 w-[120px]">
          Paid by cash
        </label>
        <input
          type="number"
          
          className="w-[200px] h-[28px] border border-gray-300 rounded px-2 text-[10px] bg-gray-100 outline-none"
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