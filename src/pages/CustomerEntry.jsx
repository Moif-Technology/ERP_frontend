import React, { useMemo, useState } from 'react';
import { colors } from '../constants/theme';
import { DropdownInput, InputField, SubInputField, Switch } from '../components/ui';

export default function CustomerEntry() {
  const primary = colors.primary?.main || '#790728';
  const [form, setForm] = useState({
    customerCode: '',
    newBarcode: false,
    customerName: '',
    companyName: '',
    taxRegNo: '',
    contactPerson: '',
    designation: '',
    address: '',
    poBox: '',
    country: '',
    city: '',
    telephone: '',
    mobileNo: '',
    faxNo: '',
    email: '',
    paymentMode: '',
    creditLimit: '',
    creditPeriodDays: '',
    creditBalance: '',
    customerType: '',
    managedBy: '',
    loyaltyCustStatus: '',
    creditStatus: 'ACTIVE',
    remarks: '',
  });

  const countries = useMemo(() => ['UNITED ARAB EMIRATES', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'India'], []);
  const cities = useMemo(() => ['Abu Dhabi', 'Dubai', 'Sharjah', 'Riyadh', 'Doha', 'Muscat'], []);
  const paymentModes = useMemo(() => ['CREDIT', 'CASH', 'CARD', 'BANK TRANSFER', 'CHEQUE'], []);
  const customerTypes = useMemo(() => ['Retail', 'Wholesale', 'Corporate'], []);
  const managedByOptions = useMemo(() => ['Admin', 'User 1', 'User 2'], []);
  const loyaltyOptions = useMemo(() => ['Yes', 'No'], []);
  const creditStatusOptions = useMemo(() => ['ACTIVE', 'INACTIVE', 'HOLD'], []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const digitsOnly = (v) => String(v ?? '').replace(/[^\d]/g, '');

  const handleSave = () => {
    // Placeholder: wire to API later
    // eslint-disable-next-line no-console
    console.log('Customer entry save', form);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        CUSTOMER ENTRY 
      </h1>

      <div className="mt-3 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InputField label="Customer code" fullWidth value={form.customerCode} onChange={(e) => update('customerCode', e.target.value)} />
            <InputField label="Customer name" fullWidth value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
            <InputField label="Company name" fullWidth value={form.companyName} onChange={(e) => update('companyName', e.target.value)} />
            <InputField label="Tax Reg No." fullWidth value={form.taxRegNo} onChange={(e) => update('taxRegNo', e.target.value)} />
            <InputField label="Contact person" fullWidth value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
            <InputField label="Designation" fullWidth value={form.designation} onChange={(e) => update('designation', e.target.value)} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-0.5 min-w-0 w-full sm:col-span-3">
              <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                rows={3}
                className="min-h-[56px] w-full rounded border border-gray-200 bg-white px-2 py-1 text-[9px] outline-none sm:text-[10px]"
              />
            </div>

            <InputField label="P.O Box" fullWidth value={form.poBox} onChange={(e) => update('poBox', e.target.value)} />
            <DropdownInput label="Country" fullWidth value={form.country} onChange={(v) => update('country', v)} options={countries} placeholder="Select" />
            <DropdownInput label="City" fullWidth value={form.city} onChange={(v) => update('city', v)} options={cities} placeholder="Select" />

            <InputField label="TelePhone" fullWidth value={form.telephone} onChange={(e) => update('telephone', e.target.value)} />
            <InputField
              label="Mobile No"
              fullWidth
              inputMode="numeric"
              value={form.mobileNo}
              onChange={(e) => update('mobileNo', digitsOnly(e.target.value))}
            />
            <InputField label="Fax No" fullWidth value={form.faxNo} onChange={(e) => update('faxNo', e.target.value)} />

            <InputField label="eMail" fullWidth type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <DropdownInput label="Payment Mode" fullWidth value={form.paymentMode} onChange={(v) => update('paymentMode', v)} options={paymentModes} placeholder="Select" />
            <DropdownInput label="Customer Type" fullWidth value={form.customerType} onChange={(v) => update('customerType', v)} options={customerTypes} placeholder="Select" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InputField label="Credit Limit" fullWidth type="number" value={form.creditLimit} onChange={(e) => update('creditLimit', e.target.value)} />
            <SubInputField
              label="Credit Period"
              fullWidth
              type="number"
              
              value={form.creditPeriodDays}
              onChange={(e) => update('creditPeriodDays', e.target.value)}
            />
            <InputField label="Credit Balance" fullWidth type="number" value={form.creditBalance} onChange={(e) => update('creditBalance', e.target.value)} />

            <DropdownInput label="Managed By" fullWidth value={form.managedBy} onChange={(v) => update('managedBy', v)} options={managedByOptions} placeholder="Select" />
            <DropdownInput
              label="Loyality Cust. Status"
              fullWidth
              value={form.loyaltyCustStatus}
              onChange={(v) => update('loyaltyCustStatus', v)}
              options={loyaltyOptions}
              placeholder="Select"
            />
            <DropdownInput
              label="Credit Status"
              fullWidth
              value={form.creditStatus}
              onChange={(v) => update('creditStatus', v)}
              options={creditStatusOptions}
            />
          </div>

          <div className="mt-3 flex flex-col gap-0.5 min-w-0 w-full">
            <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              rows={3}
              className="min-h-[56px] w-full rounded border border-gray-200 bg-white px-2 py-1 text-[9px] outline-none sm:text-[10px]"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <Switch checked={form.newBarcode} onChange={(v) => update('newBarcode', v)} description="New Barcode" size="xs" />
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

