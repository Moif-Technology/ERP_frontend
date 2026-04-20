import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, inputField } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';

const COUNTRIES = ['UNITED ARAB EMIRATES', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'India'];
const CITIES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Riyadh', 'Doha', 'Muscat'];
const PAYMENT_MODES = ['CREDIT', 'CASH', 'CARD', 'BANK TRANSFER', 'CHEQUE'];

function toOptions(list) {
  return list.map((s) => ({ value: s, label: s }));
}

function digitsOnly(v) {
  return String(v ?? '').replace(/[^\d]/g, '');
}

/**
 * Supplier master currently persists code, name, mobile, and email (see API).
 * Extra fields are captured for display / future columns only.
 */
export default function SupplierEntry() {
  const primary = colors.primary?.main || '#790728';
  const navigate = useNavigate();
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
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  const countryOptions = useMemo(() => toOptions(COUNTRIES), []);
  const cityOptions = useMemo(() => toOptions(CITIES), []);
  const paymentModeOptions = useMemo(() => toOptions(PAYMENT_MODES), []);

  const boxRadius = inputField.box.borderRadius;
  const fieldHeight = 32;
  const inputClass =
    '!text-[13px] placeholder:text-gray-400 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#790728]/25';
  const labelClassName = '!text-[11px] !font-medium !text-gray-600 !leading-tight';

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError('');
    setSuccess('');
  };

  const handleSave = async () => {
    const code = form.supplierCode.trim();
    const name = form.supplierName.trim();
    if (!code) {
      setSaveError('Enter a supplier code.');
      return;
    }
    if (!name) {
      setSaveError('Enter a supplier name.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSuccess('');
    setLastSaved(null);
    try {
      const { data } = await supplierEntryApi.createSupplier({
        supplierCode: code,
        supplierName: name,
        mobileNo: form.mobileNo.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      const sid = data?.supplierId;
      setLastSaved({ supplierId: sid, supplierName: data.supplierName, supplierCode: data.supplierCode });
      setSuccess(`Saved “${data.supplierName}” (code ${data.supplierCode}, id ${sid}).`);
      setForm((prev) => ({
        ...prev,
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
      }));
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Could not save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const goToPurchase = () => {
    navigate('/purchase');
  };

  const goToPurchaseWithLastSaved = (supplierId) => {
    if (supplierId == null) return;
    navigate('/purchase', { state: { selectSupplierId: supplierId } });
  };

  return (
    <div className="min-h-0 rounded-xl border border-stone-200/90 bg-gradient-to-br from-white via-stone-50/40 to-white p-4 shadow-sm sm:p-7">
      <div className="flex flex-col gap-1 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Procurement</p>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">New supplier</h1>
          <p className="mt-1 max-w-xl text-[13px] leading-snug text-stone-600">
            Register a vendor before recording purchases. Code and name are required; mobile and email sync to the ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
          <Link
            to="/purchase"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-300 bg-white px-3 text-[12px] font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Back to purchase
          </Link>
          <Link
            to="/lists/supplier-list"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent px-3 text-[12px] font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            Supplier list
          </Link>
        </div>
      </div>

      {saveError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800" role="alert">
          {saveError}
        </div>
      ) : null}
      {success ? (
        <div
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-900"
          role="status"
        >
          <p>{success}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-white"
              style={{ backgroundColor: primary }}
              onClick={() => {
                if (lastSaved?.supplierId != null) goToPurchaseWithLastSaved(lastSaved.supplierId);
                else goToPurchase();
              }}
            >
              Use on purchase
            </button>
            <button
              type="button"
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-800"
              onClick={goToPurchase}
            >
              Open purchase screen
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Identity</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label={
                  <span>
                    Supplier code <span className="text-red-500">*</span>
                  </span>
                }
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.supplierCode}
                onChange={(e) => update('supplierCode', e.target.value)}
                maxLength={25}
              />
              <InputField
                label={
                  <span>
                    Supplier name <span className="text-red-500">*</span>
                  </span>
                }
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.supplierName}
                onChange={(e) => update('supplierName', e.target.value)}
              />
              <InputField
                label="Tax registration no."
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.taxRegNo}
                onChange={(e) => update('taxRegNo', e.target.value)}
              />
              <InputField
                label="Contact person"
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.contactPerson}
                onChange={(e) => update('contactPerson', e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Contact & location</h2>
            <p className="mt-1 text-[11px] text-stone-500">Saved to server today: mobile and email only (other fields stay on this form for your records).</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-0.5 block text-[11px] font-medium leading-tight text-gray-600" htmlFor="sup-address">
                  Address
                </label>
                <textarea
                  id="sup-address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="box-border w-full resize-none border border-gray-200 px-2 py-1.5 text-[13px] leading-snug text-gray-900 outline-none focus-visible:ring-1 focus-visible:ring-[#790728]/25"
                  style={{ borderRadius: boxRadius, minHeight: '48px' }}
                />
              </div>
              <InputField
                label="P.O. box"
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.poBox}
                onChange={(e) => update('poBox', e.target.value)}
              />
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
              <InputField
                label="Telephone"
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.telephone}
                onChange={(e) => update('telephone', e.target.value)}
              />
              <InputField
                label="Mobile (saved)"
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                inputMode="numeric"
                value={form.mobileNo}
                onChange={(e) => update('mobileNo', digitsOnly(e.target.value))}
              />
              <InputField
                label="Fax"
                fullWidth
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.fax}
                onChange={(e) => update('fax', e.target.value)}
              />
              <InputField
                label="Email (saved)"
                fullWidth
                type="email"
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Terms (local notes)</h2>
            <p className="mt-1 text-[11px] text-stone-500">Not stored in supplier_master yet — use for desk notes until finance extends the schema.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              <InputField
                label="Credit limit"
                fullWidth
                type="number"
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.creditLimit}
                onChange={(e) => update('creditLimit', e.target.value)}
              />
              <InputField
                label="Credit balance"
                fullWidth
                type="number"
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.creditBalance}
                onChange={(e) => update('creditBalance', e.target.value)}
              />
              <InputField
                label="Credit period (days)"
                fullWidth
                type="number"
                heightPx={fieldHeight}
                className={inputClass}
                labelClassName={labelClassName}
                value={form.creditPeriodDays}
                onChange={(e) => update('creditPeriodDays', e.target.value)}
              />
              <div className="sm:col-span-2">
                <label className="mb-0.5 block text-[11px] font-medium leading-tight text-gray-600" htmlFor="sup-remark">
                  Remark
                </label>
                <textarea
                  id="sup-remark"
                  rows={2}
                  value={form.remark}
                  onChange={(e) => update('remark', e.target.value)}
                  className="box-border w-full resize-none border border-gray-200 px-2 py-1.5 text-[13px] leading-snug text-gray-900 outline-none focus-visible:ring-1 focus-visible:ring-[#790728]/25"
                  style={{ borderRadius: boxRadius, minHeight: '44px' }}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-900 p-4 text-stone-100 shadow-inner sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Checklist</p>
          <ul className="list-inside list-disc space-y-2 text-[12px] leading-relaxed text-stone-200">
            <li>Unique supplier code per company (max 25 characters).</li>
            <li>Name prints on purchase documents and ageing.</li>
            <li>After saving, jump to Purchase and pick this vendor from the list.</li>
          </ul>
          <div className="mt-auto border-t border-stone-700 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white shadow-md transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving…' : 'Save supplier'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
