import { useEffect, useMemo, useState } from 'react';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, InputField, Switch } from '../../../shared/components/ui';
import * as customerEntryApi from '../../../services/customerEntry.api.js';

const COUNTRIES = ['UNITED ARAB EMIRATES', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'India'];
const CITIES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Riyadh', 'Doha', 'Muscat'];
const PAYMENT_MODES = ['CREDIT', 'CASH', 'CARD', 'BANK TRANSFER', 'CHEQUE'];
const CUSTOMER_TYPES = ['Retail', 'Wholesale', 'Corporate'];
const MANAGED_BY_OPTIONS = ['Admin', 'User 1', 'User 2'];
const LOYALTY_OPTIONS = ['Yes', 'No'];
const CREDIT_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'HOLD'];

function toOptions(list) {
  return list.map((s) => ({ value: s, label: s }));
}

function digitsOnly(v) {
  return String(v ?? '').replace(/[^\d]/g, '');
}

/** Fill column 1 top→bottom, then column 2, … */
function splitIntoColumns(items, colCount) {
  if (colCount < 2) return [items];
  const per = Math.ceil(items.length / colCount);
  return Array.from({ length: colCount }, (_, c) =>
    items.slice(c * per, Math.min((c + 1) * per, items.length))
  );
}

function useColumnCount() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      if (w >= 1280) setN(3);
      else if (w >= 768) setN(2);
      else setN(1);
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  return n;
}

export default function CustomerEntry() {
  const primary = colors.primary?.main || '#790728';
  const colCount = useColumnCount();

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
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const countryOptions = useMemo(() => toOptions(COUNTRIES), []);
  const cityOptions = useMemo(() => toOptions(CITIES), []);
  const paymentModeOptions = useMemo(() => toOptions(PAYMENT_MODES), []);
  const customerTypeOptions = useMemo(() => toOptions(CUSTOMER_TYPES), []);
  const managedByOpts = useMemo(() => toOptions(MANAGED_BY_OPTIONS), []);
  const loyaltyOpts = useMemo(() => toOptions(LOYALTY_OPTIONS), []);
  const creditStatusOpts = useMemo(() => toOptions(CREDIT_STATUS_OPTIONS), []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError('');
    setSuccess('');
  };

  const handleSave = async () => {
    const code = form.customerCode.trim();
    const name = form.customerName.trim();
    if (!code) {
      setSaveError('Enter a customer code.');
      return;
    }
    if (!name) {
      setSaveError('Enter a customer name.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSuccess('');
    try {
      const { data } = await customerEntryApi.createCustomer({
        customerCode: code,
        customerName: name,
        companyName: form.companyName.trim() || undefined,
        taxRegNo: form.taxRegNo.trim() || undefined,
        contactPerson: form.contactPerson.trim() || undefined,
        designation: form.designation.trim() || undefined,
        address: form.address.trim() || undefined,
        poBox: form.poBox.trim() || undefined,
        country: form.country.trim() || undefined,
        city: form.city.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
        mobileNo: form.mobileNo.trim() || undefined,
        faxNo: form.faxNo.trim() || undefined,
        email: form.email.trim() || undefined,
        paymentMode: form.paymentMode.trim() || undefined,
        creditLimit: form.creditLimit === '' ? undefined : form.creditLimit,
        creditPeriodDays: form.creditPeriodDays === '' ? undefined : form.creditPeriodDays,
        creditBalance: form.creditBalance === '' ? undefined : form.creditBalance,
        customerType: form.customerType.trim() || undefined,
        loyaltyCustStatus: form.loyaltyCustStatus.trim() || undefined,
        creditStatus: form.creditStatus.trim() || 'ACTIVE',
        remarks: form.remarks.trim() || undefined,
        newBarcode: form.newBarcode,
      });
      setSuccess(`Saved “${data.customerName}” (code ${data.customerCode}, id ${data.customerId}).`);
      setForm((prev) => ({
        ...prev,
        customerCode: '',
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
        newBarcode: false,
      }));
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save customer.');
    } finally {
      setSaving(false);
    }
  };

  const boxRadius = inputField.box.borderRadius;
  const fieldHeight = 32;
  const inputClass =
    '!text-[13px] placeholder:text-gray-400 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#790728]/25';
  const labelClassName = '!text-[11px] !font-medium !text-gray-600 !leading-tight';

  const req = (text) => (
    <span>
      {text} <span className="text-red-500">*</span>
    </span>
  );

  const fieldNodes = [
    <div key="code" className="min-w-0">
      <InputField
        label={req('Customer code')}
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.customerCode}
        onChange={(e) => update('customerCode', e.target.value)}
      />
    </div>,
    <div key="name" className="min-w-0">
      <InputField
        label={req('Customer name')}
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.customerName}
        onChange={(e) => update('customerName', e.target.value)}
      />
    </div>,
    <div key="company" className="min-w-0">
      <InputField
        label="Company / trading name"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.companyName}
        onChange={(e) => update('companyName', e.target.value)}
      />
    </div>,
    <div key="tax" className="min-w-0">
      <InputField
        label="Tax registration no."
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.taxRegNo}
        onChange={(e) => update('taxRegNo', e.target.value)}
      />
    </div>,
    <div key="contact" className="min-w-0">
      <InputField
        label="Contact person"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.contactPerson}
        onChange={(e) => update('contactPerson', e.target.value)}
      />
    </div>,
    <div key="desig" className="min-w-0">
      <InputField
        label="Designation"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.designation}
        onChange={(e) => update('designation', e.target.value)}
      />
    </div>,
    <div key="addr" className="min-w-0">
      <label
        className="mb-0.5 block text-[11px] font-medium leading-tight text-gray-600"
        style={{ color: inputField.label.color }}
        htmlFor="cust-address"
      >
        Address
      </label>
      <textarea
        id="cust-address"
        rows={2}
        value={form.address}
        onChange={(e) => update('address', e.target.value)}
        className="box-border w-full resize-none border border-gray-200 px-2 py-1 text-[13px] leading-snug text-gray-900 outline-none focus-visible:ring-1 focus-visible:ring-[#790728]/25"
        style={{ borderRadius: boxRadius, minHeight: '44px' }}
      />
    </div>,
    <div key="po" className="min-w-0">
      <InputField
        label="P.O. box"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.poBox}
        onChange={(e) => update('poBox', e.target.value)}
      />
    </div>,
    <div key="country" className="min-w-0">
      <DropdownInput
        label="Country"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.country}
        onChange={(v) => update('country', v)}
        options={countryOptions}
        placeholder="Select"
      />
    </div>,
    <div key="city" className="min-w-0">
      <DropdownInput
        label="City"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.city}
        onChange={(v) => update('city', v)}
        options={cityOptions}
        placeholder="Select"
      />
    </div>,
    <div key="tel" className="min-w-0">
      <InputField
        label="Telephone"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.telephone}
        onChange={(e) => update('telephone', e.target.value)}
      />
    </div>,
    <div key="mob" className="min-w-0">
      <InputField
        label="Mobile no."
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        inputMode="numeric"
        value={form.mobileNo}
        onChange={(e) => update('mobileNo', digitsOnly(e.target.value))}
      />
    </div>,
    <div key="fax" className="min-w-0">
      <InputField
        label="Fax"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.faxNo}
        onChange={(e) => update('faxNo', e.target.value)}
      />
    </div>,
    <div key="email" className="min-w-0">
      <InputField
        label="Email"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        type="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
      />
    </div>,
    <div key="pay" className="min-w-0">
      <DropdownInput
        label="Payment mode"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.paymentMode}
        onChange={(v) => update('paymentMode', v)}
        options={paymentModeOptions}
        placeholder="Select"
      />
    </div>,
    <div key="ctype" className="min-w-0">
      <DropdownInput
        label="Customer type"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.customerType}
        onChange={(v) => update('customerType', v)}
        options={customerTypeOptions}
        placeholder="Select"
      />
    </div>,
    <div key="clim" className="min-w-0">
      <InputField
        label="Credit limit"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        type="number"
        value={form.creditLimit}
        onChange={(e) => update('creditLimit', e.target.value)}
      />
    </div>,
    <div key="cper" className="min-w-0">
      <InputField
        label="Credit period (days)"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        type="number"
        value={form.creditPeriodDays}
        onChange={(e) => update('creditPeriodDays', e.target.value)}
      />
    </div>,
    <div key="cbal" className="min-w-0">
      <InputField
        label="Credit balance"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        type="number"
        value={form.creditBalance}
        onChange={(e) => update('creditBalance', e.target.value)}
      />
    </div>,
    <div key="man" className="min-w-0">
      <DropdownInput
        label="Managed by"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.managedBy}
        onChange={(v) => update('managedBy', v)}
        options={managedByOpts}
        placeholder="Select"
      />
    </div>,
    <div key="loy" className="min-w-0">
      <DropdownInput
        label="Loyalty customer"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.loyaltyCustStatus}
        onChange={(v) => update('loyaltyCustStatus', v)}
        options={loyaltyOpts}
        placeholder="Select"
      />
    </div>,
    <div key="cstat" className="min-w-0">
      <DropdownInput
        label="Credit status"
        fullWidth
        heightPx={fieldHeight}
        className={inputClass}
        labelClassName={labelClassName}
        value={form.creditStatus}
        onChange={(v) => update('creditStatus', v)}
        options={creditStatusOpts}
        placeholder="Select"
      />
    </div>,
    <div key="rem" className="min-w-0">
      <label className="mb-0.5 block text-[11px] font-medium leading-tight text-gray-600" htmlFor="cust-remarks">
        Remarks
      </label>
      <textarea
        id="cust-remarks"
        rows={2}
        value={form.remarks}
        onChange={(e) => update('remarks', e.target.value)}
        className="box-border w-full resize-none border border-gray-200 px-2 py-1 text-[13px] leading-snug text-gray-900 outline-none focus-visible:ring-1 focus-visible:ring-[#790728]/25"
        style={{ borderRadius: boxRadius, minHeight: '44px' }}
      />
    </div>,
    <div key="barcode" className="flex min-h-[36px] min-w-0 items-center rounded border border-gray-100 bg-gray-50/90 px-2 py-1">
      <Switch
        checked={form.newBarcode}
        onChange={(v) => update('newBarcode', v)}
        description="New barcode"
        size="xs"
      />
    </div>,
  ];

  const columns = splitIntoColumns(fieldNodes, colCount);

  return (
    <div className="flex h-[calc(100dvh-4.25rem)] max-h-[calc(100dvh-4.25rem)] w-full min-h-0 flex-col sm:h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-3.5rem)]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-2.5 sm:px-5 sm:py-3">
          {colCount === 1 ? (
            <div className="mx-auto flex w-full max-w-[520px] flex-col gap-2">{fieldNodes}</div>
          ) : (
            <div
              className="mx-auto grid w-full max-w-[1360px] items-start gap-x-7"
              style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
              {columns.map((cells, idx) => (
                <div key={idx} className="flex min-w-0 flex-col gap-2">
                  {cells}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 border-t border-gray-200 bg-gray-50/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-h-[1.25rem] min-w-0 flex-1 text-[11px] text-gray-500">
            {saveError ? (
              <p className="font-medium text-red-600" role="alert">
                {saveError}
              </p>
            ) : success ? (
              <p className="font-medium text-emerald-700" role="status">
                {success}
              </p>
            ) : (
              <span>
                <span className="text-gray-600">Required:</span> customer code & name (
                <span className="text-red-500">*</span>)
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-8 shrink-0 rounded-md px-5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-45"
            style={{ backgroundColor: primary }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
