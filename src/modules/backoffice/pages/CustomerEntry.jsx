/**
 * CustomerEntry — B2B ERP backoffice customer data entry form
 *
 * Design (ui-ux-pro-max · impeccable distill + layout, product register):
 *  - Style    : Minimalism/flat — enterprise tool; design disappears into task
 *  - Colors   : Restrained — slate neutrals + single accent #790728
 *  - Type     : Open Sans / system-ui; 10px uppercase tracking labels; 13px inputs
 *  - Layout   : 2-panel grid (lg+); 3 cards left / 3 cards right; compact gap-y-3
 *  - Density  : gap-x-4 gap-y-3 within sections; space-y-3 between cards
 *  - Auto-code: "Auto" toggle inline with Customer Code label (distill — remove
 *               Classification card, embed the one toggle where it matters)
 *  - Scroll   : Layout <main> (overflowY:auto) owns page scroll — no nested scroll
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, SubInputField, Switch } from '../../../shared/components/ui';
import * as customerEntryApi from '../../../services/customerEntry.api.js';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const primary = colors.primary?.main || '#790728';

// Label: 10px bold uppercase tracking — dense ERP readability standard
const LBL =
  'flex h-4 items-center truncate text-[11px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-500';

// Input/select text: 13px medium slate-800
const IN_CLS =
  'rounded-md px-2.5 !text-[14px] font-medium text-slate-800 placeholder:font-normal ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#79072820]';

// Field border: gray-300 — visible without being loud
const CTRL = { borderRadius: 6, background: '#fff', borderColor: '#d1d5db' };
const CTRL_DIM = { borderRadius: 6, background: '#f1f5f9', borderColor: '#e2e8f0' };

const H = 34; // input height (34px + 16px label ≈ 50px total — meets 44pt a11y target)

// Toolbar button styles matching job card pattern
const primaryBtn =
  'inline-flex h-8 min-h-8 shrink-0 items-center gap-1.5 rounded-md border px-4 ' +
  'text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50';

// ─── Static data ───────────────────────────────────────────────────────────────
const COUNTRIES          = ['UNITED ARAB EMIRATES', 'KSA', 'Qatar', 'Oman', 'Bahrain', 'India'];
const CITIES             = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Riyadh', 'Doha', 'Muscat'];
const PAYMENT_MODES      = ['CREDIT', 'CASH', 'CARD', 'BANK TRANSFER', 'CHEQUE'];
const CUSTOMER_TYPES     = ['Retail', 'Wholesale', 'Corporate'];
const MANAGED_BY_OPTIONS = ['Admin', 'User 1', 'User 2'];
const LOYALTY_OPTIONS    = ['Yes', 'No'];
const CREDIT_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'HOLD'];

const EMPTY_FORM = {
  customerCode: '', newBarcode: false, customerName: '', companyName: '',
  taxRegNo: '', contactPerson: '', designation: '', address: '',
  poBox: '', country: '', city: '', telephone: '', mobileNo: '',
  faxNo: '', email: '', paymentMode: '', creditLimit: '',
  creditPeriodDays: '', creditBalance: '', customerType: '',
  managedBy: '', loyaltyCustStatus: '', creditStatus: 'ACTIVE', remarks: '',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const toOptions  = (list) => list.map((s) => ({ value: s, label: s }));
const digitsOnly = (v)    => String(v ?? '').replace(/[^\d]/g, '');

// ─── Section card ──────────────────────────────────────────────────────────────
// White card with 1px border; accent variant uses primary-tinted border for Basic Info
function SectionCard({ title, children, accent = false }) {
  return (
    <section
      className="rounded-lg border bg-white"
      style={{
        borderColor: accent ? `${primary}28` : '#e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(15,23,42,0.06)',
      }}
    >
      {/* Card title — minimal separator line, no heavy padding */}
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

      {/* Card fields */}
      <div className="px-4 pb-3.5 pt-3">
        {children}
      </div>
    </section>
  );
}

// ─── Field wrappers ────────────────────────────────────────────────────────────
function CustInput({ disabled: dis, ...props }) {
  return (
    <SubInputField
      fullWidth heightPx={H}
      labelClassName={LBL}
      className={IN_CLS + (dis ? ' cursor-not-allowed' : '')}
      inputStyle={dis ? CTRL_DIM : CTRL}
      disabled={dis}
      {...props}
    />
  );
}

function CustDropdown(props) {
  return (
    <DropdownInput
      fullWidth heightPx={H}
      labelClassName={LBL}
      className={IN_CLS}
      boxStyle={CTRL}
      {...props}
    />
  );
}

function CustTextarea({ label, id, rows = 2, ...props }) {
  return (
    <div className="flex w-full flex-col gap-0.5">
      {label && <label htmlFor={id} className={LBL}>{label}</label>}
      <textarea
        id={id} rows={rows}
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

// ─── Customer Code with inline Auto-code toggle ────────────────────────────────
// Distill principle: embed the toggle at the field it controls, not in a
// separate Classification section 3 cards away.
function CustomerCodeField({ value, onChange, autoOn, onAutoChange }) {
  return (
    <div className="min-w-0">
      {/* Label row — toggle on the right */}
      <div className="mb-0.5 flex h-4 items-center justify-between">
        <span className={LBL}>
          Customer code&nbsp;<span style={{ color: '#dc2626' }}>*</span>
        </span>
        {/* Pill toggle: "AUTO" label + switch */}
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-px">
          <span
            className="text-[9px] font-bold uppercase tracking-wide"
            style={{ color: autoOn ? primary : '#94a3b8' }}
          >
            Auto
          </span>
          <Switch
            checked={autoOn}
            onChange={onAutoChange}
            size="xs"
          />
        </div>
      </div>
      {/* Input — disabled when auto is on */}
      <SubInputField
        fullWidth heightPx={H}
        className={IN_CLS + (autoOn ? ' cursor-not-allowed' : '')}
        inputStyle={autoOn ? CTRL_DIM : CTRL}
        disabled={autoOn}
        value={autoOn ? '' : value}
        onChange={onChange}
        placeholder={autoOn ? 'Generated on save' : 'e.g. CUST-001'}
      />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CustomerEntry() {
  const [searchParams] = useSearchParams();
  const location       = useLocation();
  const editCustomerId = searchParams.get('customerId');
  const isEditMode     = Boolean(editCustomerId);

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saveError, setSaveError] = useState('');
  const [success,   setSuccess]   = useState('');
  const [saving,    setSaving]    = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (!isEditMode) return;
    const c = location.state?.customer;
    if (!c) return;
    const clean = (v) => (v === '—' ? '' : (v ?? ''));
    setForm((prev) => ({
      ...prev,
      customerCode:      clean(c.customerCode),
      customerName:      clean(c.customerName),
      companyName:       clean(c.customerNameAlt),
      contactPerson:     clean(c.contactPerson),
      telephone:         clean(c.telephone),
      mobileNo:          clean(c.mobile),
      country:           clean(c.country),
      city:              clean(c.city),
      customerType:      clean(c.customerTx),
      loyaltyCustStatus: clean(c.loyaltyStatus),
    }));
  }, [isEditMode, editCustomerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoised dropdown options
  const countryOptions      = useMemo(() => toOptions(COUNTRIES), []);
  const cityOptions         = useMemo(() => toOptions(CITIES), []);
  const paymentModeOptions  = useMemo(() => toOptions(PAYMENT_MODES), []);
  const customerTypeOptions = useMemo(() => toOptions(CUSTOMER_TYPES), []);
  const managedByOpts       = useMemo(() => toOptions(MANAGED_BY_OPTIONS), []);
  const loyaltyOpts         = useMemo(() => toOptions(LOYALTY_OPTIONS), []);
  const creditStatusOpts    = useMemo(() => toOptions(CREDIT_STATUS_OPTIONS), []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError('');
    setSuccess('');
  };

  const handleSave = async () => {
    const code = form.customerCode.trim();
    const name = form.customerName.trim();
    if (!form.newBarcode && !code) { setSaveError('Enter a customer code.'); return; }
    if (!name) { setSaveError('Enter a customer name.'); return; }

    setSaving(true);
    setSaveError('');
    setSuccess('');

    const payload = {
      customerCode:      form.newBarcode ? undefined : code,
      customerName:      name,
      companyName:       form.companyName.trim()       || undefined,
      taxRegNo:          form.taxRegNo.trim()           || undefined,
      contactPerson:     form.contactPerson.trim()      || undefined,
      designation:       form.designation.trim()        || undefined,
      address:           form.address.trim()            || undefined,
      poBox:             form.poBox.trim()              || undefined,
      country:           form.country.trim()            || undefined,
      city:              form.city.trim()               || undefined,
      telephone:         form.telephone.trim()          || undefined,
      mobileNo:          form.mobileNo.trim()           || undefined,
      faxNo:             form.faxNo.trim()              || undefined,
      email:             form.email.trim()              || undefined,
      paymentMode:       form.paymentMode.trim()        || undefined,
      creditLimit:       form.creditLimit      === '' ? undefined : form.creditLimit,
      creditPeriodDays:  form.creditPeriodDays === '' ? undefined : form.creditPeriodDays,
      creditBalance:     form.creditBalance    === '' ? undefined : form.creditBalance,
      customerType:      form.customerType.trim()       || undefined,
      loyaltyCustStatus: form.loyaltyCustStatus.trim()  || undefined,
      creditStatus:      form.creditStatus.trim()       || 'ACTIVE',
      remarks:           form.remarks.trim()            || undefined,
      newBarcode:        form.newBarcode,
    };

    try {
      const { data } = isEditMode
        ? await customerEntryApi.updateCustomer(editCustomerId, payload)
        : await customerEntryApi.createCustomer(payload);
      setSuccess(
        `${isEditMode ? 'Updated' : 'Saved'} "${data.customerName}" ` +
        `(code ${data.customerCode}, id ${data.customerId}).`
      );
      setForm(EMPTY_FORM);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save customer.');
    } finally {
      setSaving(false);
    }
  };

  // Grid layout classes
  const g2 = 'grid grid-cols-2 gap-x-4 gap-y-3';   // 2-col: 16px / 12px
  const g3 = 'grid grid-cols-3 gap-x-3 gap-y-3';   // 3-col: 12px / 12px

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200"
        style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.08)' }}
      >

        {/* ── TOP TOOLBAR ──────────────────────────────────────────────────── */}
        <div
          className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-2.5"
          style={{ background: '#f8fafc' }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Data Entry / Customers
            </p>
            <h1 className="text-[13px] font-bold leading-tight text-slate-800">
              {isEditMode ? 'Edit Customer' : 'New Customer'}
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
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className={primaryBtn}
              style={{ backgroundColor: primary, borderColor: `${primary}99` }}
            >
              {saving
                ? (isEditMode ? 'Updating…' : 'Saving…')
                : (isEditMode ? 'Update customer' : 'Save customer')}
            </button>
          </div>
        </div>

        {/* ── FORM BODY ─────────────────────────────────────────────────────── */}
        <div className="flex-1 bg-[#faf8f9] p-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">

            {/* ── LEFT PANEL: Basic info + Contact ─────────────────────────── */}
            <div className="space-y-3">

              {/* Basic info — accent card; most critical fields */}
              <SectionCard title="Basic info" accent>
                <div className={g2}>
                  {/* Customer code with inline Auto-code toggle */}
                  <CustomerCodeField
                    value={form.customerCode}
                    onChange={(e) => update('customerCode', e.target.value)}
                    autoOn={form.newBarcode}
                    onAutoChange={(v) => update('newBarcode', v)}
                  />
                  <CustInput
                    label={<span>Customer name <span style={{ color: '#dc2626' }}>*</span></span>}
                    value={form.customerName}
                    onChange={(e) => update('customerName', e.target.value)}
                    placeholder="Full name or business name"
                  />
                  <CustInput
                    label="Company / trading name"
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    placeholder="Trading or legal name"
                  />
                  <CustInput
                    label="Tax registration no."
                    value={form.taxRegNo}
                    onChange={(e) => update('taxRegNo', e.target.value)}
                    placeholder="TRN / VAT number"
                  />
                </div>
              </SectionCard>

              {/* Contact details */}
              <SectionCard title="Contact details">
                <div className={g2}>
                  <CustInput label="Contact person"  value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
                  <CustInput label="Designation"     value={form.designation}   onChange={(e) => update('designation',   e.target.value)} />
                  <CustInput label="Telephone"        value={form.telephone}    onChange={(e) => update('telephone',     e.target.value)} placeholder="+971 xx xxx xxxx" />
                  <CustInput label="Mobile no."       inputMode="numeric" value={form.mobileNo} onChange={(e) => update('mobileNo', digitsOnly(e.target.value))} placeholder="Numbers only" />
                  <CustInput label="Fax"              value={form.faxNo}        onChange={(e) => update('faxNo',         e.target.value)} />
                  <CustInput label="Email"            type="email" value={form.email} onChange={(e) => update('email',  e.target.value)} placeholder="name@company.com" />
                </div>
              </SectionCard>

            </div>

            {/* ── RIGHT PANEL: Address + Payment/Credit/Settings + Remarks ─── */}
            <div className="space-y-3">

              {/* Address */}
              <SectionCard title="Address">
                <div className="space-y-3">
                  <CustTextarea
                    id="cust-address" label="Street address"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Building, street, district…"
                  />
                  <div className={g3}>
                    <CustInput    label="P.O. box" value={form.poBox}    onChange={(e) => update('poBox',   e.target.value)} />
                    <CustDropdown label="Country"  value={form.country}  onChange={(v) => update('country', v)} options={countryOptions} placeholder="Select" />
                    <CustDropdown label="City"     value={form.city}     onChange={(v) => update('city',    v)} options={cityOptions}   placeholder="Select" />
                  </div>
                </div>
              </SectionCard>

              {/* Payment, credit & settings — merged card (distill: fewer sections = less scroll) */}
              {/* Row 1 (3-col): Payment mode | Credit status | Customer type                      */}
              {/* Row 2 (3-col): Credit limit | Credit period | Credit balance                     */}
              {/* Row 3 (2-col): Managed by   | Loyalty customer                                   */}
              <SectionCard title="Payment, credit &amp; settings">
                <div className={g3}>
                  <CustDropdown label="Payment mode"    value={form.paymentMode}    onChange={(v) => update('paymentMode',    v)} options={paymentModeOptions}  placeholder="Select" />
                  <CustDropdown label="Credit status"   value={form.creditStatus}   onChange={(v) => update('creditStatus',   v)} options={creditStatusOpts}   placeholder="Select" />
                  <CustDropdown label="Customer type"   value={form.customerType}   onChange={(v) => update('customerType',   v)} options={customerTypeOptions} placeholder="Select" />
                  <CustInput    label="Credit limit"    type="number" value={form.creditLimit}      onChange={(e) => update('creditLimit',      e.target.value)} placeholder="0.00" />
                  <CustInput    label="Credit period (days)" type="number" value={form.creditPeriodDays} onChange={(e) => update('creditPeriodDays', e.target.value)} placeholder="e.g. 30" />
                  <CustInput    label="Credit balance"  type="number" value={form.creditBalance}    onChange={(e) => update('creditBalance',    e.target.value)} placeholder="0.00" />
                  <CustDropdown label="Managed by"      value={form.managedBy}      onChange={(v) => update('managedBy',      v)} options={managedByOpts}       placeholder="Select" />
                  <CustDropdown label="Loyalty customer" value={form.loyaltyCustStatus} onChange={(v) => update('loyaltyCustStatus', v)} options={loyaltyOpts}  placeholder="Select" />
                </div>
              </SectionCard>

              {/* Remarks */}
              <SectionCard title="Remarks">
                <CustTextarea
                  id="cust-remarks"
                  value={form.remarks}
                  onChange={(e) => update('remarks', e.target.value)}
                  placeholder="Any additional notes about this customer…"
                  rows={2}
                />
              </SectionCard>

            </div>
          </div>
        </div>

        {/* ── FOOTER HINT ───────────────────────────────────────────────────── */}
        <div
          className="flex shrink-0 items-center border-t border-gray-100 px-5 py-2"
          style={{ background: '#f8fafc' }}
        >
          <span className="text-[11px] text-slate-400">
            Fields marked <span style={{ color: '#dc2626' }}>*</span> are required.
            Toggle <strong className="font-semibold text-slate-500">Auto</strong> on Customer code to auto-generate.
          </span>
        </div>

      </div>
    </div>
  );
}
