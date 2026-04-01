import React, { useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField, SubInputField } from '../../../shared/components/ui';

export default function SupplierEntry() {
  const primary = colors.primary?.main || '#790728';
  const [form, setForm] = useState({
    supplierCode: '',
    supplierName: '',
    taxRegNo: '',
    contactPerson: '',
    address: '',
    poBox: '',
    country: '',
    city: '',
    telephone: '',
    mobileNo: '',
    fax: '',
    email: '',
    paymentMode: '',
    creditLimit: '',
    creditBalance: '',
    creditPeriodDays: '',
    remark: '',
  });

  const countries = useMemo(() => ['UAE', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'India'], []);
  const cities = useMemo(() => ['Dubai', 'Abu Dhabi', 'Sharjah', 'Riyadh', 'Doha', 'Muscat'], []);
  const paymentModes = useMemo(() => ['Cash', 'Card', 'Bank Transfer', 'Credit', 'Cheque'], []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const digitsOnly = (v) => String(v ?? '').replace(/[^\d]/g, '');

  const handleSave = () => {
    // Placeholder: wire to API later
    // eslint-disable-next-line no-console
    console.log('Supplier entry save', form);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        SUPPLIER ENTRY 
      </h1>

      <div className="mt-3 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InputField label="Supplier code" fullWidth value={form.supplierCode} onChange={(e) => update('supplierCode', e.target.value)} />
            <InputField label="Supplier name" fullWidth value={form.supplierName} onChange={(e) => update('supplierName', e.target.value)} />
            <InputField label="Tax reg no" fullWidth value={form.taxRegNo} onChange={(e) => update('taxRegNo', e.target.value)} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InputField label="Contact person" fullWidth value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />

            <div className="flex flex-col gap-0.5 min-w-0 w-full sm:col-span-2">
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
            <InputField label="Telephone" fullWidth value={form.telephone} onChange={(e) => update('telephone', e.target.value)} />
            <InputField
              label="Mobile no"
              fullWidth
              inputMode="numeric"
              value={form.mobileNo}
              onChange={(e) => update('mobileNo', digitsOnly(e.target.value))}
            />
            <InputField label="Fax" fullWidth value={form.fax} onChange={(e) => update('fax', e.target.value)} />
            <InputField label="Email" fullWidth type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <DropdownInput label="Payment mode" fullWidth value={form.paymentMode} onChange={(v) => update('paymentMode', v)} options={paymentModes} placeholder="Select" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InputField label="Credit limit" fullWidth type="number" value={form.creditLimit} onChange={(e) => update('creditLimit', e.target.value)} />
            <InputField label="Credit balance" fullWidth type="number" value={form.creditBalance} onChange={(e) => update('creditBalance', e.target.value)} />
            <SubInputField
              label="Credit period"
              fullWidth
              type="number"
              suffix="days"
              value={form.creditPeriodDays}
              onChange={(e) => update('creditPeriodDays', e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-col gap-0.5 min-w-0 w-full">
            <label className="text-[9px] leading-tight text-black sm:text-[11px] sm:leading-[15px]">Remark</label>
            <textarea
              value={form.remark}
              onChange={(e) => update('remark', e.target.value)}
              rows={3}
              className="min-h-[56px] w-full rounded border border-gray-200 bg-white px-2 py-1 text-[9px] outline-none sm:text-[10px]"
            />
          </div>

          <div className="mt-4 flex justify-end">
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

