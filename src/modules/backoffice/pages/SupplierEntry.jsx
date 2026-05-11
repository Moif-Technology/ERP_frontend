/**
 * SupplierEntry - B2B ERP backoffice supplier data entry form
 *
 * Visual source of truth: CustomerEntry.jsx
 *  - Style    : Minimalism/flat enterprise data-entry surface
 *  - Colors   : Slate neutrals + single primary accent #790728
 *  - Type     : Open Sans / system-ui; 10px uppercase labels; 13px inputs
 *  - Layout   : 2-panel grid (lg+); compact section cards; no nested page scroll
 *  - Density  : gap-x-4 gap-y-3 within sections; space-y-3 between cards
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import * as supplierEntryApi from '../../../services/supplierEntry.api.js';
import { DropdownInput, SubInputField } from '../../../shared/components/ui';
import { colors } from '../../../shared/constants/theme';

// Design tokens copied from CustomerEntry.jsx.
const primary = colors.primary?.main || '#790728';

const LBL =
  'flex h-4 items-center truncate text-[11px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-500';

const IN_CLS =
  'rounded-md px-2.5 !text-[14px] font-medium text-slate-800 placeholder:font-normal ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#79072820]';

const CTRL = { borderRadius: 6, background: '#fff', borderColor: '#d1d5db' };

const H = 34;

const primaryBtn =
  'inline-flex h-8 min-h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-4 ' +
  'text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

const secondaryBtn =
  'inline-flex h-8 min-h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 ' +
  'text-[11px] font-semibold text-slate-600 shadow-sm transition-opacity hover:opacity-90';

const COUNTRIES = ['UNITED ARAB EMIRATES', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'India'];
const CITIES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Riyadh', 'Doha', 'Muscat'];
const PAYMENT_MODES = ['CREDIT', 'CASH', 'CARD', 'BANK TRANSFER', 'CHEQUE'];

function toOptions(list) {
  return list.map((s) => ({ value: s, label: s }));
}

function digitsOnly(v) {
  return String(v ?? '').replace(/[^\d]/g, '');
}

function SectionCard({ title, children, accent = false }) {
  return (
    <section
      className="rounded-lg border bg-white"
      style={{
        borderColor: accent ? `${primary}28` : '#e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(15,23,42,0.06)',
      }}
    >
      <div
        className="px-4 pb-2.5 pt-3"
        style={{ borderBottom: '1px solid #f1f5f9' }}
      >
        <h2
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: accent ? primary : '#64748b' }}
        >
          {title}
        </h2>
      </div>

      <div className="px-4 pb-3.5 pt-3">
        {children}
      </div>
    </section>
  );
}

function SupplierInput({ disabled: dis, ...props }) {
  return (
    <SubInputField
      fullWidth
      heightPx={H}
      labelClassName={LBL}
      className={IN_CLS + (dis ? ' cursor-not-allowed' : '')}
      inputStyle={CTRL}
      disabled={dis}
      {...props}
    />
  );
}

function SupplierDropdown(props) {
  return (
    <DropdownInput
      fullWidth
      heightPx={H}
      labelClassName={LBL}
      className={IN_CLS}
      boxStyle={CTRL}
      {...props}
    />
  );
}

function SupplierTextarea({ label, id, rows = 2, ...props }) {
  return (
    <div className="flex w-full flex-col gap-0.5">
      {label && <label htmlFor={id} className={LBL}>{label}</label>}
      <textarea
        id={id}
        rows={rows}
        className={
          'w-full resize-none border bg-white px-2.5 py-1.5 text-[14px] font-medium ' +
          'leading-5 text-slate-800 outline-none placeholder:font-normal ' +
          'placeholder:text-slate-400 transition-colors focus:border-slate-300 ' +
          'focus:ring-2 focus:ring-[#79072820]'
        }
        style={{ borderRadius: 6, borderColor: '#d1d5db', minHeight: `${H + 10}px` }}
        {...props}
      />
    </div>
  );
}

/**
 * Supplier master currently persists code, name, mobile, and email (see API).
 * Extra fields are captured for display / future columns only.
 */
export default function SupplierEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editSupplierId = searchParams.get('supplierId');
  const isEditMode = Boolean(editSupplierId);
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

  useEffect(() => {
    if (!isEditMode) return;
    const s = location.state?.supplier;
    if (!s) return;
    setForm((prev) => ({
      ...prev,
      supplierCode: s.supplierCode === '—' ? '' : (s.supplierCode ?? ''),
      supplierName: s.supplierName === '—' ? '' : (s.supplierName ?? ''),
      mobileNo: s.mobile === '—' ? '' : (s.mobile ?? ''),
    }));
  }, [isEditMode, editSupplierId]); // eslint-disable-line react-hooks/exhaustive-deps

  const countryOptions = useMemo(() => toOptions(COUNTRIES), []);
  const cityOptions = useMemo(() => toOptions(CITIES), []);
  const paymentModeOptions = useMemo(() => toOptions(PAYMENT_MODES), []);

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
    const payload = {
      supplierCode: code,
      supplierName: name,
      mobileNo: form.mobileNo.trim() || undefined,
      email: form.email.trim() || undefined,
    };
    try {
      const { data } = isEditMode
        ? await supplierEntryApi.updateSupplier(editSupplierId, payload)
        : await supplierEntryApi.createSupplier(payload);
      const sid = data?.supplierId;
      setLastSaved({ supplierId: sid, supplierName: data.supplierName, supplierCode: data.supplierCode });
      setSuccess(`${isEditMode ? 'Updated' : 'Saved'} "${data.supplierName}" (code ${data.supplierCode}, id ${sid}).`);
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

  const g2 = 'grid grid-cols-2 gap-x-4 gap-y-3';
  const g3 = 'grid grid-cols-3 gap-x-3 gap-y-3';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200"
        style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.08)' }}
      >
        <div
          className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-2.5"
          style={{ background: '#f8fafc' }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Data Entry / Suppliers
            </p>
            <h1 className="text-[13px] font-bold leading-tight text-slate-800">
              {isEditMode ? 'Edit Supplier' : 'New Supplier'}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {saveError && (
              <p className="max-w-xs truncate text-[11px] font-medium text-red-600" role="alert">
                {saveError}
              </p>
            )}
            {success && (
              <p className="max-w-70 truncate text-[11px] font-medium text-emerald-600" role="status">
                {success}
              </p>
            )}
            <Link
              to="/lists/supplier-list"
              className={secondaryBtn}
            >
              Supplier list
            </Link>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className={primaryBtn}
              style={{ backgroundColor: primary, borderColor: `${primary}99` }}
            >
              {saving
                ? (isEditMode ? 'Updating...' : 'Saving...')
                : (isEditMode ? 'Update supplier' : 'Save supplier')}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#faf8f9] p-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              <SectionCard title="Basic info" accent>
                <div className={g2}>
                  <SupplierInput
                    label={<span>Supplier code <span style={{ color: '#dc2626' }}>*</span></span>}
                    value={form.supplierCode}
                    onChange={(e) => update('supplierCode', e.target.value)}
                    placeholder="e.g. SUP-001"
                    maxLength={25}
                  />
                  <SupplierInput
                    label={<span>Supplier name <span style={{ color: '#dc2626' }}>*</span></span>}
                    value={form.supplierName}
                    onChange={(e) => update('supplierName', e.target.value)}
                    placeholder="Full name or business name"
                  />
                  <SupplierInput
                    label="Tax registration no."
                    value={form.taxRegNo}
                    onChange={(e) => update('taxRegNo', e.target.value)}
                    placeholder="TRN / VAT number"
                  />
                  <SupplierInput
                    label="Contact person"
                    value={form.contactPerson}
                    onChange={(e) => update('contactPerson', e.target.value)}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Contact details">
                <div className={g2}>
                  <SupplierInput
                    label="Telephone"
                    value={form.telephone}
                    onChange={(e) => update('telephone', e.target.value)}
                    placeholder="+971 xx xxx xxxx"
                  />
                  <SupplierInput
                    label="Mobile no."
                    inputMode="numeric"
                    value={form.mobileNo}
                    onChange={(e) => update('mobileNo', digitsOnly(e.target.value))}
                    placeholder="Numbers only"
                  />
                  <SupplierInput
                    label="Fax"
                    value={form.fax}
                    onChange={(e) => update('fax', e.target.value)}
                  />
                  <SupplierInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-3">
              <SectionCard title="Address">
                <div className="space-y-3">
                  <SupplierTextarea
                    id="sup-address"
                    label="Street address"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Building, street, district..."
                  />
                  <div className={g3}>
                    <SupplierInput
                      label="P.O. box"
                      value={form.poBox}
                      onChange={(e) => update('poBox', e.target.value)}
                    />
                    <SupplierDropdown
                      label="Country"
                      value={form.country}
                      onChange={(v) => update('country', v)}
                      options={countryOptions}
                      placeholder="Select"
                    />
                    <SupplierDropdown
                      label="City"
                      value={form.city}
                      onChange={(v) => update('city', v)}
                      options={cityOptions}
                      placeholder="Select"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Payment &amp; credit">
                <div className={g3}>
                  <SupplierDropdown
                    label="Payment mode"
                    value={form.paymentMode}
                    onChange={(v) => update('paymentMode', v)}
                    options={paymentModeOptions}
                    placeholder="Select"
                  />
                  <SupplierInput
                    label="Credit limit"
                    type="number"
                    value={form.creditLimit}
                    onChange={(e) => update('creditLimit', e.target.value)}
                    placeholder="0.00"
                  />
                  <SupplierInput
                    label="Credit balance"
                    type="number"
                    value={form.creditBalance}
                    onChange={(e) => update('creditBalance', e.target.value)}
                    placeholder="0.00"
                  />
                  <SupplierInput
                    label="Credit period (days)"
                    type="number"
                    value={form.creditPeriodDays}
                    onChange={(e) => update('creditPeriodDays', e.target.value)}
                    placeholder="e.g. 30"
                  />
                </div>
              </SectionCard>

              <SectionCard title="Remarks">
                <SupplierTextarea
                  id="sup-remark"
                  value={form.remark}
                  onChange={(e) => update('remark', e.target.value)}
                  placeholder="Any additional notes about this supplier..."
                  rows={2}
                />
              </SectionCard>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-5 py-2"
          style={{ background: '#f8fafc' }}
        >
          <span className="text-[11px] text-slate-400">
            Fields marked <span style={{ color: '#dc2626' }}>*</span> are required.
          </span>
          {success && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className={secondaryBtn}
                onClick={() => {
                  if (lastSaved?.supplierId != null) goToPurchaseWithLastSaved(lastSaved.supplierId);
                  else goToPurchase();
                }}
              >
                Use on purchase
              </button>
              <Link
                to="/purchase"
                className={secondaryBtn}
              >
                Open purchase screen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
