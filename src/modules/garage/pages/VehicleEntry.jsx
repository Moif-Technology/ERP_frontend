import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import httpClient from '../../../services/http/httpClient';

const P   = colors.primary?.main || '#790728';
const Plt = colors.primary?.[50] || '#F2E6EA';

/* ─── field primitives ─────────────────────────────────────── */

const LABEL = {
  fontSize: 8.5, color: '#94a3b8', fontWeight: 600,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  lineHeight: 1, display: 'block', marginBottom: 3,
};

const BASE = {
  height: 26,
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  background: '#fff',
  fontSize: 11, color: '#0f172a',
  fontWeight: 450, padding: '0 7px',
  outline: 'none',
  transition: 'border-color 0.12s, box-shadow 0.12s',
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04)',
};

const FOCUS = (focused) => ({
  borderColor: focused ? P : '#e2e8f0',
  boxShadow: focused
    ? `0 0 0 2.5px ${P}20, 0 1px 2px 0 rgba(0,0,0,0.04)`
    : '0 1px 2px 0 rgba(0,0,0,0.04)',
});

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={LABEL}>{label}</span>
      {children}
    </div>
  );
}

function Input({ label, widthPx = 120, ...rest }) {
  const [f, setF] = useState(false);
  return (
    <Field label={label}>
      <input
        style={{ ...BASE, width: widthPx, ...FOCUS(f) }}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        {...rest}
      />
    </Field>
  );
}

function Select({ label, widthPx = 130, options = [], value, onChange }) {
  const [f, setF] = useState(false);
  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={{
          ...BASE, width: widthPx, ...FOCUS(f),
          cursor: 'pointer', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: 22,
        }}
      >
        {normalized.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function Textarea({ label, rows = 3, widthPx = 180, value, onChange }) {
  const [f, setF] = useState(false);
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        style={{
          width: widthPx,
          border: `1px solid ${f ? P : '#e2e8f0'}`,
          borderRadius: 6,
          background: '#fff',
          boxShadow: f
            ? `0 0 0 2.5px ${P}20, 0 1px 2px 0 rgba(0,0,0,0.04)`
            : '0 1px 2px 0 rgba(0,0,0,0.04)',
          fontSize: 10.5, color: '#0f172a',
          padding: '5px 7px',
          resize: 'vertical', outline: 'none',
          transition: 'border-color 0.12s, box-shadow 0.12s',
          lineHeight: 1.55, fontFamily: 'inherit',
        }}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
      />
    </Field>
  );
}

/* ─── section divider ──────────────────────────────────────── */

function SectionHead({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Row({ children }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2.5 items-end">
      {children}
    </div>
  );
}

/* ─── constants ─────────────────────────────────────────────── */

const EMIRATES       = ['ABU DHABI','DUBAI','SHARJAH','AJMAN','UMM AL QUWAIN','RAS AL KHAIMAH','FUJAIRAH','OTHER GCC'];
const CAR_CATEGORIES = ['OUTSIDE','INSIDE','FLEET','RENTAL','DEALER'];

const today    = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({
  regNo: '', plateCode: '', plateColor: '', emirates: 'ABU DHABI',
  bodyColor: '', engineNo: '',
  model: '', chassisNo: '', carCategory: 'OUTSIDE', carGroup: '', carSubGroup: '', doorIgKey: '',
  regDate: today(), regExpOn: today(),
  purchaseInvoiceNo: '', purchaseAmount: '', purchaseDate: today(),
  insuranceNo: '', insuranceCompany: '', insuranceAmount: '',
  warrantyKm: '', remarks: '', warrantyPolicy: '',
});

function toDateInput(value) {
  if (!value) return today();
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : today();
}

function mapVehicleToForm(vehicle) {
  return {
    regNo: vehicle.regNo || '',
    plateCode: vehicle.plateCode || '',
    plateColor: vehicle.plateColor || '',
    emirates: vehicle.emirates || 'ABU DHABI',
    bodyColor: vehicle.bodyColor || '',
    engineNo: vehicle.engineNo || '',
    model: vehicle.model || '',
    chassisNo: vehicle.chassisNo || '',
    carCategory: vehicle.carCategory || 'OUTSIDE',
    carGroup: vehicle.carGroupId == null ? '' : String(vehicle.carGroupId),
    carSubGroup: vehicle.carSubGroupId == null ? '' : String(vehicle.carSubGroupId),
    doorIgKey: vehicle.doorIgKey || '',
    regDate: toDateInput(vehicle.regDate),
    regExpOn: toDateInput(vehicle.regExpOn),
    purchaseInvoiceNo: vehicle.purchaseInvoiceNo || '',
    purchaseAmount: vehicle.purchaseAmount == null ? '' : String(vehicle.purchaseAmount),
    purchaseDate: toDateInput(vehicle.purchaseDate),
    insuranceNo: vehicle.insuranceNo || '',
    insuranceCompany: vehicle.insuranceCompany || '',
    insuranceAmount: vehicle.insuranceAmount == null ? '' : String(vehicle.insuranceAmount),
    warrantyKm: vehicle.warrantyKm == null ? '' : String(vehicle.warrantyKm),
    remarks: vehicle.remarks || '',
    warrantyPolicy: vehicle.warrantyPolicy || '',
  };
}

/* ─── main ──────────────────────────────────────────────────── */

export default function VehicleEntry() {
  const navigate = useNavigate();
  const { id: vehicleIdParam } = useParams();
  const [form, setForm]           = useState(emptyForm());
  const [carGroups, setCarGroups] = useState([]);
  const [carSubGroups, setCarSubGroups] = useState([]);
  const [vehicleColors, setVehicleColors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const isEditMode = Boolean(vehicleIdParam);

  const set     = (key) => (e)   => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setDrop = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));
  const reset   = useCallback(() => {
    setForm(emptyForm());
    setSaveError('');
    setSaveMessage('');
    if (isEditMode) navigate('/garage/vehicle-entry');
  }, [isEditMode, navigate]);
  const handleSave = useCallback(async () => {
    setSaveError('');
    setSaveMessage('');
    setSaving(true);
    try {
      const request = isEditMode
        ? httpClient.put(`/api/garage/vehicles/${vehicleIdParam}`, form)
        : httpClient.post('/api/garage/vehicles', form);
      const { data } = await request;
      setSaveMessage(
        isEditMode
          ? `Vehicle updated successfully${data?.vehicleId ? ` (ID ${data.vehicleId})` : ''}`
          : `Vehicle saved successfully${data?.vehicleId ? ` (ID ${data.vehicleId})` : ''}`
      );
      setForm(mapVehicleToForm(data));
      if (!isEditMode && data?.id) navigate(`/garage/vehicle-entry/${data.id}`, { replace: true });
    } catch (error) {
      setSaveError(error.response?.data?.message || 'Could not save vehicle');
    } finally {
      setSaving(false);
    }
  }, [form, isEditMode, navigate, vehicleIdParam]);

  useEffect(() => {
    httpClient.get('/api/garage/car-groups')
      .then(({ data }) => setCarGroups(data.carGroups || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    httpClient.get('/api/garage/colors')
      .then(({ data }) => setVehicleColors(data.colors || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.carGroup) { setCarSubGroups([]); return; }
    httpClient.get(`/api/garage/car-sub-groups?groupId=${form.carGroup}`)
      .then(({ data }) => setCarSubGroups(data.carSubGroups || []))
      .catch(() => {});
  }, [form.carGroup]);

  useEffect(() => {
    if (!vehicleIdParam) {
      setForm(emptyForm());
      setLoadingVehicle(false);
      return;
    }
    setLoadingVehicle(true);
    setSaveError('');
    setSaveMessage('');
    httpClient.get(`/api/garage/vehicles/${vehicleIdParam}`)
      .then(({ data }) => setForm(mapVehicleToForm(data)))
      .catch((error) => setSaveError(error.response?.data?.message || 'Could not load vehicle'))
      .finally(() => setLoadingVehicle(false));
  }, [vehicleIdParam]);

  const colorOptions = [
    { value: '', label: '— Select —' },
    ...vehicleColors
      .map((c) => String(c?.colorName || '').trim())
      .filter(Boolean)
      .map((name) => ({ value: name, label: name })),
  ];

  return (
    <div
      className="flex flex-col min-h-0 flex-1 bg-white overflow-hidden"
      style={{ margin: '0 -13px' }}
    >

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7 rounded shrink-0"
            style={{ background: Plt }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-slate-800 tracking-tight">Vehicle Master Entry</span>
            <span className="text-[9px] text-slate-400 tracking-widest uppercase">
              {isEditMode ? 'Vehicle Details & Editing' : 'Fleet & Vehicle Registry'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Print"
            className="inline-flex items-center justify-center w-7 h-6.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#790728] focus-visible:ring-offset-1"
          >
            <img src={PrinterIcon} alt="" className="w-3 h-3 opacity-60" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 h-6.5 px-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#790728] focus-visible:ring-offset-1"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-6.5 px-3 rounded text-[10px] font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#790728] focus-visible:ring-offset-2"
            style={{ background: P }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {(saveError || saveMessage || loadingVehicle) && (
        <div
          className="px-4 py-2 text-[10px] font-medium border-b"
          style={{
            color: saveError ? '#b91c1c' : '#166534',
            background: saveError ? '#fef2f2' : '#f0fdf4',
            borderColor: saveError ? '#fecaca' : '#bbf7d0',
          }}
        >
          {saveError || saveMessage || (loadingVehicle ? 'Loading vehicle...' : '')}
        </div>
      )}

      {/* ── Reg No peek strip ───────────────────────────────── */}
      {form.regNo && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 shrink-0 border-b"
          style={{ background: Plt, borderColor: `${P}1A` }}
        >
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: P }} />
          <span className="text-[10px] font-bold" style={{ color: P }}>{form.regNo}</span>
          {form.model && <span className="text-[10px] text-slate-500">{form.model}</span>}
          {form.emirates && (
            <span className="ml-auto text-[9px] text-slate-400">{form.emirates}</span>
          )}
        </div>
      )}

      {/* ── Body: two-column scroll ──────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-y-auto">

        {/* LEFT: Vehicle Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-5 px-4 py-3 border-r border-slate-100">

          <div>
            <SectionHead>Identification</SectionHead>
            <Row>
              <Input label="Reg No" widthPx={110} value={form.regNo} onChange={set('regNo')} placeholder="e.g. AB-12345" />
              <Input label="Plate Code" widthPx={80} value={form.plateCode} onChange={set('plateCode')} placeholder="Code" />
              <Select label="Plate Color" widthPx={110} value={form.plateColor} onChange={setDrop('plateColor')} options={colorOptions} />
              <Select label="Emirates / GCC" widthPx={130} value={form.emirates} onChange={setDrop('emirates')} options={EMIRATES} />
            </Row>
          </div>

          <div>
            <SectionHead>Vehicle Info</SectionHead>
            <Row>
              <Input label="Model" widthPx={110} value={form.model} onChange={set('model')} placeholder="Model" />
              <Select label="Body Color" widthPx={110} value={form.bodyColor} onChange={setDrop('bodyColor')} options={colorOptions} />
              <Input label="Engine No" widthPx={120} value={form.engineNo} onChange={set('engineNo')} placeholder="Engine no." />
              <Input label="Chassis No" widthPx={130} value={form.chassisNo} onChange={set('chassisNo')} placeholder="Chassis no." />
              <Input label="Door / IG Key" widthPx={80} value={form.doorIgKey} onChange={set('doorIgKey')} placeholder="Key" />
            </Row>
          </div>

          <div>
            <SectionHead>Classification</SectionHead>
            <Row>
              <Select label="Car Category" widthPx={120} value={form.carCategory} onChange={setDrop('carCategory')} options={CAR_CATEGORIES} />
              <Select
                label="Car Group"
                widthPx={140}
                value={form.carGroup}
                onChange={(val) => { setDrop('carGroup')(val); setDrop('carSubGroup')(''); }}
                options={[
                  { value: '', label: '— Select —' },
                  ...carGroups.map((g) => ({ value: String(g.carGroupId), label: g.carGroupName })),
                ]}
              />
              <Select
                label="Car Sub Group"
                widthPx={140}
                value={form.carSubGroup}
                onChange={setDrop('carSubGroup')}
                options={[
                  { value: '', label: '— Select —' },
                  ...carSubGroups.map((s) => ({ value: String(s.carSubGroupId), label: s.carSubGroupName })),
                ]}
              />
            </Row>
          </div>

        </div>

        {/* RIGHT: Fleet Details */}
        <div className="flex flex-col gap-5 px-4 py-3 shrink-0" style={{ width: 296 }}>

          <div>
            <SectionHead>Registration</SectionHead>
            <Row>
              <Input label="Reg. Date" widthPx={110} type="date" value={form.regDate} onChange={set('regDate')} />
              <Input label="Reg. Exp. On" widthPx={110} type="date" value={form.regExpOn} onChange={set('regExpOn')} />
            </Row>
          </div>

          <div>
            <SectionHead>Purchase</SectionHead>
            <Row>
              <Input label="Invoice No" widthPx={120} value={form.purchaseInvoiceNo} onChange={set('purchaseInvoiceNo')} placeholder="Invoice no." />
              <Input label="Amount" widthPx={80} type="number" value={form.purchaseAmount} onChange={set('purchaseAmount')} placeholder="0.00" />
              <Input label="Purchase Date" widthPx={110} type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
            </Row>
          </div>

          <div>
            <SectionHead>Insurance</SectionHead>
            <Row>
              <Input label="Insurance No" widthPx={120} value={form.insuranceNo} onChange={set('insuranceNo')} placeholder="Policy no." />
              <Input label="Company" widthPx={140} value={form.insuranceCompany} onChange={set('insuranceCompany')} placeholder="Company name" />
              <Input label="Amount" widthPx={80} type="number" value={form.insuranceAmount} onChange={set('insuranceAmount')} placeholder="0.00" />
            </Row>
          </div>

          <div>
            <SectionHead>Warranty &amp; Notes</SectionHead>
            <Row>
              <Input label="Warranty KM" widthPx={90} type="number" value={form.warrantyKm} onChange={set('warrantyKm')} placeholder="KM" />
              <Textarea label="Remarks" widthPx={252} rows={3} value={form.remarks} onChange={set('remarks')} />
              <Textarea label="Warranty Policy" widthPx={252} rows={3} value={form.warrantyPolicy} onChange={set('warrantyPolicy')} />
            </Row>
          </div>

        </div>
      </div>
    </div>
  );
}
