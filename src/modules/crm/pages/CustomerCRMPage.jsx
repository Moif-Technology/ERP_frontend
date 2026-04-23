import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputField, DropdownInput, CommonTable, ConfirmDialog } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';

const primary = '#790728';

// ─── Sample Data ──────────────────────────────────────────────────────────────

const CUSTOMER = {
  id: 42,
  code: 'CUST-0042',
  name: 'Al Rashid Trading LLC',
  type: 'Corporate',
  industry: 'Trading & Distribution',
  registrationNo: 'DED-2018-44820',
  taxNo: 'TRN100348291200003',
  website: 'www.alrashidtrading.ae',
  creditLimit: 500000,
  paymentTerms: 'Net 30',
  currency: 'AED',
  language: 'English',
  assignedRep: 'Sabeeh Ahmed',
  customerSince: '2018-03-15',
  city: 'Dubai',
  state: 'Dubai',
  country: 'UAE',
  phone: '+971 4 234 5678',
  email: 'accounts@alrashidtrading.ae',
  lastInteraction: '2026-04-18',
  lastFollowup: '2026-04-20',
  nextFollowup: '2026-04-25',
};

const CRM_STATS = {
  totalLeads: 6,
  openOpportunities: 3,
  wonDeals: 4,
  totalInteractions: 22,
  pendingFollowups: 2,
};

const INIT_CONTACTS = [
  { id: 1, name: 'Khalid Al Rashid', designation: 'CEO', department: 'Executive', mobile: '+971 50 100 0001', email: 'khalid@alrashidtrading.ae', isPrimary: true, notes: 'Main decision maker' },
  { id: 2, name: 'Fatima Hussain', designation: 'Finance Manager', department: 'Finance', mobile: '+971 50 100 0002', email: 'fatima@alrashidtrading.ae', isPrimary: false, notes: '' },
  { id: 3, name: 'Mohammed Salim', designation: 'Procurement Head', department: 'Procurement', mobile: '+971 50 100 0003', email: 'msalim@alrashidtrading.ae', isPrimary: false, notes: 'Handles all PO negotiations' },
  { id: 4, name: 'Amina Qasim', designation: 'Accounts Executive', department: 'Finance', mobile: '+971 50 100 0004', email: 'amina@alrashidtrading.ae', isPrimary: false, notes: '' },
];

const INIT_ADDRESSES = [
  { id: 1, type: 'Office', line1: '404, Deira Gold Centre', line2: 'Al Ras Road', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', isDefault: true },
  { id: 2, type: 'Billing', line1: 'P.O. Box 5821', line2: '', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '5821', isDefault: false },
  { id: 3, type: 'Delivery', line1: 'Warehouse 12, Al Quoz Industrial', line2: 'Street 4', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', isDefault: false },
];

const INIT_INTERACTIONS = [
  { id: 1, date: '2026-04-18', time: '10:30', type: 'Meeting', mode: 'In-Person', subject: 'Q2 Contract Renewal Discussion', summary: 'Discussed renewal terms. Customer wants 5% discount on bulk orders.', outcome: 'Positive – proposal to be sent', nextAction: 'Send revised proposal', by: 'Sabeeh Ahmed' },
  { id: 2, date: '2026-04-10', time: '14:00', type: 'Call', mode: 'Phone', subject: 'Payment follow-up for INV-2024', summary: 'Reminded about overdue invoice. Customer confirmed payment by 15th.', outcome: 'Payment committed', nextAction: 'Confirm receipt', by: 'Swetha R' },
  { id: 3, date: '2026-03-28', time: '11:00', type: 'Email', mode: 'Email', subject: 'Product catalog sent', summary: 'Sent updated 2026 product catalog as requested.', outcome: 'Awaiting feedback', nextAction: 'Follow up in 1 week', by: 'Sabeeh Ahmed' },
  { id: 4, date: '2026-03-15', time: '09:00', type: 'Meeting', mode: 'Video Call', subject: 'Annual review meeting', summary: 'Reviewed last year performance. Customer is satisfied overall.', outcome: 'Relationship strengthened', nextAction: 'Prepare MoU for next year', by: 'Sabeeh Ahmed' },
  { id: 5, date: '2026-03-05', time: '16:00', type: 'Call', mode: 'Phone', subject: 'Complaint – delayed shipment', summary: 'Customer raised issue on delayed delivery. Logged complaint.', outcome: 'Complaint logged', nextAction: 'Coordinate with logistics', by: 'Swetha R' },
];

const INIT_FOLLOWUPS = [
  { id: 1, dueDate: '2026-04-25', subject: 'Send revised proposal for Q2 contract', priority: 'High', status: 'Pending', assignedTo: 'Sabeeh Ahmed', mode: 'Email', notes: 'Include bulk discount slab' },
  { id: 2, dueDate: '2026-04-22', subject: 'Confirm payment receipt for INV-2024', priority: 'High', status: 'Overdue', assignedTo: 'Swetha R', mode: 'Phone', notes: '' },
  { id: 3, dueDate: '2026-04-30', subject: 'Share 2026 product catalog follow-up', priority: 'Medium', status: 'Pending', assignedTo: 'Sabeeh Ahmed', mode: 'Email', notes: '' },
  { id: 4, dueDate: '2026-04-10', subject: 'Annual MoU draft for review', priority: 'Low', status: 'Completed', assignedTo: 'Sabeeh Ahmed', mode: 'Meeting', notes: 'Sent draft on 10th Apr' },
];

const INIT_OPPORTUNITIES = [
  { id: 1, oppNo: 'OPP-0021', title: 'Q2 2026 Bulk Supply Contract', stage: 'Proposal', value: 280000, closeDate: '2026-05-15', assignedTo: 'Sabeeh Ahmed' },
  { id: 2, oppNo: 'OPP-0018', title: 'ERP Add-on Module Sale', stage: 'Negotiation', value: 75000, closeDate: '2026-04-30', assignedTo: 'Swetha R' },
  { id: 3, oppNo: 'OPP-0015', title: 'Annual AMC Renewal 2026', stage: 'Won', value: 48000, closeDate: '2026-03-31', assignedTo: 'Sabeeh Ahmed' },
];

const INIT_NOTES = [
  { id: 1, title: 'Credit Policy Exception Approved', note: 'Board approved 10% credit limit increase for this customer based on 3-year payment history. Valid until Dec 2026.', createdBy: 'Sabeeh Ahmed', createdOn: '2026-03-01' },
  { id: 2, title: 'Key Contact Preference', note: 'Khalid Al Rashid prefers WhatsApp over email for quick communications. Always copy Fatima Hussain in all formal correspondence.', createdBy: 'Swetha R', createdOn: '2026-02-14' },
  { id: 3, title: 'Logistics Note', note: 'Deliveries must be scheduled between 8am–12pm only. Contact Mohammed Salim 24hrs before delivery.', createdBy: 'Sabeeh Ahmed', createdOn: '2026-01-20' },
];

const INVOICES = [
  { no: 'INV-20260418', date: '2026-04-18', amount: 42500, status: 'Pending' },
  { no: 'INV-20260330', date: '2026-03-30', amount: 87000, status: 'Overdue' },
  { no: 'INV-20260310', date: '2026-03-10', amount: 31200, status: 'Paid' },
  { no: 'INV-20260215', date: '2026-02-15', amount: 56800, status: 'Paid' },
  { no: 'INV-20260120', date: '2026-01-20', amount: 23100, status: 'Paid' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(val) {
  return 'AED ' + Number(val).toLocaleString('en-AE', { minimumFractionDigits: 2 });
}

function stageBadge(stage) {
  const map = {
    Prospect:    { bg: '#F3F4F6', color: '#374151' },
    Proposal:    { bg: '#DBEAFE', color: '#1D4ED8' },
    Negotiation: { bg: '#FEF3C7', color: '#92400E' },
    Won:         { bg: '#DCFCE7', color: '#166534' },
    Lost:        { bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[stage] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.color }}>
      {stage}
    </span>
  );
}

function priorityBadge(p) {
  const map = { High: { bg: '#FEE2E2', color: '#991B1B' }, Medium: { bg: '#FEF3C7', color: '#92400E' }, Low: { bg: '#E5E7EB', color: '#374151' } };
  const s = map[p] || { bg: '#F3F4F6', color: '#374151' };
  return <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.color }}>{p}</span>;
}

function statusBadge(s) {
  const map = { Pending: { bg: '#FEF3C7', color: '#92400E' }, Overdue: { bg: '#FEE2E2', color: '#991B1B' }, Completed: { bg: '#DCFCE7', color: '#166534' } };
  const st = map[s] || { bg: '#F3F4F6', color: '#374151' };
  return <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: st.bg, color: st.color }}>{s}</span>;
}

function invoiceStatusBadge(s) {
  const map = { Paid: { bg: '#DCFCE7', color: '#166534' }, Pending: { bg: '#FEF3C7', color: '#92400E' }, Overdue: { bg: '#FEE2E2', color: '#991B1B' } };
  const st = map[s] || { bg: '#F3F4F6', color: '#374151' };
  return <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: st.bg, color: st.color }}>{s}</span>;
}

// ─── Dialog Shell ─────────────────────────────────────────────────────────────

function Dialog({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`relative max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DialogFooter({ onSave, onCancel }) {
  return (
    <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
      <button onClick={onCancel} className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
      <button onClick={onSave} className="rounded px-4 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
        Save
      </button>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0 overflow-x-auto border-b border-gray-200">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`shrink-0 px-4 py-2.5 text-[11px] font-semibold transition-colors ${
            active === t
              ? 'border-b-2 text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={
            active === t
              ? { borderBottomColor: primary, color: primary, borderBottom: `2px solid ${primary}` }
              : {}
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Read-only Field ──────────────────────────────────────────────────────────

function ROField({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">{label}</span>
      <span className="text-[11px] font-semibold text-gray-800">{value || '—'}</span>
    </div>
  );
}

// ─── Action icon buttons ──────────────────────────────────────────────────────

function ActionBtn({ icon, alt, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50"
    >
      <img src={icon} alt={alt} className="h-3.5 w-3.5" />
    </button>
  );
}

// ─── Stat mini card ───────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <span className="text-base font-bold" style={{ color: primary }}>{value}</span>
      <span className="mt-0.5 text-center text-[9px] text-gray-500">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 – Profile Summary
// ═══════════════════════════════════════════════════════════════════════════════

function TabProfile() {
  const fields = [
    ['Customer Code', CUSTOMER.code],
    ['Customer Name', CUSTOMER.name],
    ['Customer Type', CUSTOMER.type],
    ['Industry', CUSTOMER.industry],
    ['Registration No', CUSTOMER.registrationNo],
    ['Tax No', CUSTOMER.taxNo],
    ['Website', CUSTOMER.website],
    ['Credit Limit', fmtCurrency(CUSTOMER.creditLimit)],
    ['Payment Terms', CUSTOMER.paymentTerms],
    ['Currency', CUSTOMER.currency],
    ['Language', CUSTOMER.language],
    ['Assigned Rep', CUSTOMER.assignedRep],
  ];

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left – Customer Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-600">Customer Details</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {fields.map(([label, value]) => (
            <ROField key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-4">
        {/* CRM Stats */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-600">CRM Stats</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <StatCard label="Total Leads" value={CRM_STATS.totalLeads} />
            <StatCard label="Open Opportunities" value={CRM_STATS.openOpportunities} />
            <StatCard label="Won Deals" value={CRM_STATS.wonDeals} />
            <StatCard label="Total Interactions" value={CRM_STATS.totalInteractions} />
            <StatCard label="Pending Follow-ups" value={CRM_STATS.pendingFollowups} />
          </div>
        </div>

        {/* Last Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-600">Last Activity</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ROField label="Last Interaction" value={CUSTOMER.lastInteraction} />
            <ROField label="Last Follow-up" value={CUSTOMER.lastFollowup} />
            <ROField label="Next Scheduled Follow-up" value={CUSTOMER.nextFollowup} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 – Contacts
// ═══════════════════════════════════════════════════════════════════════════════

const BLANK_CONTACT = { id: null, name: '', designation: '', department: '', mobile: '', altMobile: '', email: '', isPrimary: false, notes: '' };

function TabContacts() {
  const [contacts, setContacts] = useState(INIT_CONTACTS);
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(BLANK_CONTACT);

  const openAdd = () => { setForm(BLANK_CONTACT); setDialog({ open: true, item: null }); };
  const openEdit = (item) => { setForm({ ...item }); setDialog({ open: true, item }); };
  const closeDialog = () => setDialog({ open: false, item: null });

  const handleSave = () => {
    if (dialog.item) {
      setContacts((prev) => prev.map((c) => (c.id === form.id ? { ...form } : c)));
    } else {
      setContacts((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeDialog();
  };

  const handleDelete = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setConfirmId(null);
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fCheck = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));

  const COL_PCT = [18, 14, 12, 15, 20, 10, 11];
  const tableRows = contacts.map((c) => [
    c.name,
    c.designation,
    c.department,
    c.mobile,
    c.email,
    c.isPrimary ? <span key={c.id} className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: '#DCFCE7', color: '#166534' }}>Yes</span> : '—',
    <div key={c.id} className="flex items-center justify-center gap-1">
      <ActionBtn icon={EditIcon} alt="Edit" title="Edit" onClick={() => openEdit(c)} />
      <ActionBtn icon={DeleteIcon} alt="Delete" title="Delete" onClick={() => setConfirmId(c.id)} />
    </div>,
  ]);

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600">Customer Contacts</span>
        <button onClick={openAdd} className="rounded px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
          + Add Contact
        </button>
      </div>

      <CommonTable
        fitParentWidth
        columnWidthPercents={COL_PCT}
        headers={['Name', 'Designation', 'Department', 'Mobile', 'Email', 'Primary', 'Action']}
        rows={tableRows}
        hideVerticalCellBorders
        cellAlign="center"
        headerFontSize="10px"
        bodyFontSize="10px"
        cellPaddingClass="px-2 py-1.5"
        bodyRowHeightRem={2.4}
      />

      {dialog.open && (
        <Dialog title={dialog.item ? 'Edit Contact' : 'Add Contact'} onClose={closeDialog}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InputField label="Full Name" fullWidth value={form.name} onChange={f('name')} />
            </div>
            <InputField label="Designation" fullWidth value={form.designation} onChange={f('designation')} />
            <InputField label="Department" fullWidth value={form.department} onChange={f('department')} />
            <InputField label="Mobile" fullWidth value={form.mobile} onChange={f('mobile')} />
            <InputField label="Alt Mobile" fullWidth value={form.altMobile} onChange={f('altMobile')} />
            <div className="col-span-2">
              <InputField label="Email" fullWidth value={form.email} onChange={f('email')} />
            </div>
            <div className="col-span-2">
              <InputField label="Notes" fullWidth value={form.notes} onChange={f('notes')} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isPrimary" checked={form.isPrimary} onChange={fCheck('isPrimary')} className="h-3.5 w-3.5 accent-[#790728]" />
              <label htmlFor="isPrimary" className="text-[11px] text-gray-700">Is Primary Contact</label>
            </div>
          </div>
          <DialogFooter onSave={handleSave} onCancel={closeDialog} />
        </Dialog>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          open
          title="Delete Contact"
          message="Are you sure you want to delete this contact?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 – Addresses
// ═══════════════════════════════════════════════════════════════════════════════

const BLANK_ADDRESS = { id: null, type: 'Office', line1: '', line2: '', city: '', state: '', country: '', postalCode: '', isDefault: false };
const ADDRESS_TYPES = ['Office', 'Billing', 'Shipping', 'Delivery'];

function TabAddresses() {
  const [addresses, setAddresses] = useState(INIT_ADDRESSES);
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(BLANK_ADDRESS);

  const openAdd = () => { setForm(BLANK_ADDRESS); setDialog({ open: true, item: null }); };
  const openEdit = (item) => { setForm({ ...item }); setDialog({ open: true, item }); };
  const closeDialog = () => setDialog({ open: false, item: null });

  const handleSave = () => {
    if (dialog.item) {
      setAddresses((prev) => prev.map((a) => (a.id === form.id ? { ...form } : a)));
    } else {
      setAddresses((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeDialog();
  };

  const handleDelete = (id) => { setAddresses((prev) => prev.filter((a) => a.id !== id)); setConfirmId(null); };
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fCheck = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));

  const COL_PCT = [10, 22, 12, 10, 10, 10, 10, 16];
  const tableRows = addresses.map((a) => [
    a.type,
    a.line1,
    a.city,
    a.state,
    a.country,
    a.postalCode,
    a.isDefault ? <span key={a.id} className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: '#DCFCE7', color: '#166534' }}>Yes</span> : '—',
    <div key={a.id} className="flex items-center justify-center gap-1">
      <ActionBtn icon={EditIcon} alt="Edit" title="Edit" onClick={() => openEdit(a)} />
      <ActionBtn icon={DeleteIcon} alt="Delete" title="Delete" onClick={() => setConfirmId(a.id)} />
    </div>,
  ]);

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600">Customer Addresses</span>
        <button onClick={openAdd} className="rounded px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
          + Add Address
        </button>
      </div>

      <CommonTable
        fitParentWidth
        columnWidthPercents={COL_PCT}
        headers={['Type', 'Address Line 1', 'City', 'State', 'Country', 'Postal Code', 'Default', 'Action']}
        rows={tableRows}
        hideVerticalCellBorders
        cellAlign="center"
        headerFontSize="10px"
        bodyFontSize="10px"
        cellPaddingClass="px-2 py-1.5"
        bodyRowHeightRem={2.4}
      />

      {dialog.open && (
        <Dialog title={dialog.item ? 'Edit Address' : 'Add Address'} onClose={closeDialog}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <DropdownInput label="Address Type" fullWidth value={form.type} onChange={(v) => setForm((p) => ({ ...p, type: v }))} options={ADDRESS_TYPES} />
            </div>
            <div className="col-span-2">
              <InputField label="Address Line 1" fullWidth value={form.line1} onChange={f('line1')} />
            </div>
            <div className="col-span-2">
              <InputField label="Address Line 2" fullWidth value={form.line2} onChange={f('line2')} />
            </div>
            <InputField label="City" fullWidth value={form.city} onChange={f('city')} />
            <InputField label="State" fullWidth value={form.state} onChange={f('state')} />
            <InputField label="Country" fullWidth value={form.country} onChange={f('country')} />
            <InputField label="Postal Code" fullWidth value={form.postalCode} onChange={f('postalCode')} />
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={fCheck('isDefault')} className="h-3.5 w-3.5 accent-[#790728]" />
              <label htmlFor="isDefault" className="text-[11px] text-gray-700">Set as Default Address</label>
            </div>
          </div>
          <DialogFooter onSave={handleSave} onCancel={closeDialog} />
        </Dialog>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          open
          title="Delete Address"
          message="Are you sure you want to delete this address?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 – Interactions (Timeline)
// ═══════════════════════════════════════════════════════════════════════════════

const BLANK_INTERACTION = { id: null, date: '', time: '', type: 'Call', mode: 'Phone', subject: '', summary: '', outcome: '', nextAction: '', by: '' };
const INTERACTION_TYPES = ['Call', 'Meeting', 'Email', 'WhatsApp', 'Visit'];
const INTERACTION_MODES = ['Phone', 'In-Person', 'Video Call', 'Email', 'WhatsApp'];

function TimelineCard({ item, onEdit, onDelete }) {
  const typeColors = { Call: '#DBEAFE', Meeting: '#DCFCE7', Email: '#FEF3C7', Visit: '#F3E8FF', WhatsApp: '#D1FAE5' };
  const typeText  = { Call: '#1D4ED8', Meeting: '#166534', Email: '#92400E', Visit: '#7C3AED', WhatsApp: '#065F46' };
  return (
    <div className="relative flex gap-3">
      {/* timeline line */}
      <div className="flex flex-col items-center">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: typeColors[item.type] || '#F3F4F6' }}>
          <img src={CalendarIcon} alt="" className="h-4 w-4" style={{ filter: 'opacity(0.7)' }} />
        </div>
        <div className="w-px flex-1 bg-gray-200" />
      </div>
      {/* card */}
      <div className="mb-4 flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: typeColors[item.type] || '#F3F4F6', color: typeText[item.type] || '#374151' }}>{item.type}</span>
            <span className="text-[11px] font-bold text-gray-800">{item.subject}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ActionBtn icon={EditIcon} alt="Edit" title="Edit" onClick={() => onEdit(item)} />
            <ActionBtn icon={DeleteIcon} alt="Delete" title="Delete" onClick={() => onDelete(item.id)} />
          </div>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-600">{item.summary}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
          <span><span className="font-medium">Mode:</span> {item.mode}</span>
          <span><span className="font-medium">Outcome:</span> {item.outcome}</span>
          <span><span className="font-medium">Next Action:</span> {item.nextAction}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 text-[10px] text-gray-400">
          <span>{item.date} {item.time}</span>
          <span>By: {item.by}</span>
        </div>
      </div>
    </div>
  );
}

function TabInteractions({ onOpenInteractionDialog }) {
  const [interactions, setInteractions] = useState(INIT_INTERACTIONS);
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(BLANK_INTERACTION);

  const openAdd = () => { setForm(BLANK_INTERACTION); setDialog({ open: true, item: null }); };
  const openEdit = (item) => { setForm({ ...item }); setDialog({ open: true, item }); };
  const closeDialog = () => setDialog({ open: false, item: null });

  const handleSave = () => {
    if (dialog.item) {
      setInteractions((prev) => prev.map((i) => (i.id === form.id ? { ...form } : i)));
    } else {
      setInteractions((prev) => [{ ...form, id: Date.now() }, ...prev]);
    }
    closeDialog();
  };

  const handleDelete = (id) => { setInteractions((prev) => prev.filter((i) => i.id !== id)); setConfirmId(null); };
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600">Interaction Timeline</span>
        <button onClick={openAdd} className="rounded px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
          + Add Interaction
        </button>
      </div>

      <div className="pl-2">
        {interactions.map((item) => (
          <TimelineCard key={item.id} item={item} onEdit={openEdit} onDelete={(id) => setConfirmId(id)} />
        ))}
      </div>

      {dialog.open && (
        <Dialog title={dialog.item ? 'Edit Interaction' : 'Add Interaction'} onClose={closeDialog} wide>
          <div className="grid grid-cols-2 gap-3">
            <DropdownInput label="Interaction Type" fullWidth value={form.type} onChange={(v) => setForm((p) => ({ ...p, type: v }))} options={INTERACTION_TYPES} />
            <DropdownInput label="Mode" fullWidth value={form.mode} onChange={(v) => setForm((p) => ({ ...p, mode: v }))} options={INTERACTION_MODES} />
            <InputField label="Date" type="date" fullWidth value={form.date} onChange={f('date')} />
            <InputField label="Time" type="time" fullWidth value={form.time} onChange={f('time')} />
            <div className="col-span-2">
              <InputField label="Subject" fullWidth value={form.subject} onChange={f('subject')} />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5">
              <label className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Summary</label>
              <textarea rows={3} className="w-full rounded border border-gray-200 px-2 py-1 text-[11px] outline-none" value={form.summary} onChange={f('summary')} />
            </div>
            <InputField label="Outcome" fullWidth value={form.outcome} onChange={f('outcome')} />
            <InputField label="Next Action" fullWidth value={form.nextAction} onChange={f('nextAction')} />
            <div className="col-span-2">
              <InputField label="By (Rep Name)" fullWidth value={form.by} onChange={f('by')} />
            </div>
          </div>
          <DialogFooter onSave={handleSave} onCancel={closeDialog} />
        </Dialog>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          open
          title="Delete Interaction"
          message="Are you sure you want to delete this interaction?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 – Follow-ups
// ═══════════════════════════════════════════════════════════════════════════════

const BLANK_FOLLOWUP = { id: null, dueDate: '', subject: '', priority: 'Medium', status: 'Pending', assignedTo: '', mode: 'Phone', notes: '' };
const FOLLOWUP_MODES = ['Phone', 'Email', 'Meeting', 'WhatsApp', 'Visit'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const FU_STATUSES = ['Pending', 'Completed', 'Overdue'];

function TabFollowups() {
  const [followups, setFollowups] = useState(INIT_FOLLOWUPS);
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(BLANK_FOLLOWUP);

  const openAdd = () => { setForm(BLANK_FOLLOWUP); setDialog({ open: true, item: null }); };
  const openEdit = (item) => { setForm({ ...item }); setDialog({ open: true, item }); };
  const closeDialog = () => setDialog({ open: false, item: null });

  const handleSave = () => {
    if (dialog.item) {
      setFollowups((prev) => prev.map((f) => (f.id === form.id ? { ...form } : f)));
    } else {
      setFollowups((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeDialog();
  };

  const handleDelete = (id) => { setFollowups((prev) => prev.filter((f) => f.id !== id)); setConfirmId(null); };
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const COL_PCT = [12, 30, 10, 12, 16, 20];
  const tableRows = followups.map((fu) => [
    fu.dueDate,
    fu.subject,
    priorityBadge(fu.priority),
    statusBadge(fu.status),
    fu.assignedTo,
    <div key={fu.id} className="flex items-center justify-center gap-1">
      <ActionBtn icon={EditIcon} alt="Edit" title="Edit" onClick={() => openEdit(fu)} />
      <ActionBtn icon={DeleteIcon} alt="Delete" title="Delete" onClick={() => setConfirmId(fu.id)} />
    </div>,
  ]);

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600">Follow-ups</span>
        <button onClick={openAdd} className="rounded px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
          + Add Follow-up
        </button>
      </div>

      <CommonTable
        fitParentWidth
        columnWidthPercents={COL_PCT}
        headers={['Due Date', 'Subject', 'Priority', 'Status', 'Assigned To', 'Action']}
        rows={tableRows}
        hideVerticalCellBorders
        cellAlign="center"
        headerFontSize="10px"
        bodyFontSize="10px"
        cellPaddingClass="px-2 py-1.5"
        bodyRowHeightRem={2.4}
      />

      {dialog.open && (
        <Dialog title={dialog.item ? 'Edit Follow-up' : 'Add Follow-up'} onClose={closeDialog}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InputField label="Subject" fullWidth value={form.subject} onChange={f('subject')} />
            </div>
            <InputField label="Due Date" type="date" fullWidth value={form.dueDate} onChange={f('dueDate')} />
            <DropdownInput label="Priority" fullWidth value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v }))} options={PRIORITIES} />
            <DropdownInput label="Status" fullWidth value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: v }))} options={FU_STATUSES} />
            <DropdownInput label="Mode" fullWidth value={form.mode} onChange={(v) => setForm((p) => ({ ...p, mode: v }))} options={FOLLOWUP_MODES} />
            <div className="col-span-2">
              <InputField label="Assigned To" fullWidth value={form.assignedTo} onChange={f('assignedTo')} />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5">
              <label className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Notes</label>
              <textarea rows={2} className="w-full rounded border border-gray-200 px-2 py-1 text-[11px] outline-none" value={form.notes} onChange={f('notes')} />
            </div>
          </div>
          <DialogFooter onSave={handleSave} onCancel={closeDialog} />
        </Dialog>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          open
          title="Delete Follow-up"
          message="Are you sure you want to delete this follow-up?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6 – Opportunities
// ═══════════════════════════════════════════════════════════════════════════════

function TabOpportunities() {
  const navigate = useNavigate();
  const COL_PCT = [12, 28, 12, 14, 12, 14, 8];
  const tableRows = INIT_OPPORTUNITIES.map((o) => [
    o.oppNo,
    o.title,
    stageBadge(o.stage),
    fmtCurrency(o.value),
    o.closeDate,
    o.assignedTo,
    <div key={o.id} className="flex items-center justify-center">
      <ActionBtn icon={ViewIcon} alt="View" title="View" onClick={() => navigate(`/crm/opportunity-entry?id=${o.id}`)} />
    </div>,
  ]);

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600">Linked Opportunities</span>
        <button
          onClick={() => navigate(`/crm/opportunity-entry?customerId=${CUSTOMER.id}`)}
          className="rounded px-3 py-1.5 text-[11px] font-semibold text-white"
          style={{ backgroundColor: primary }}
        >
          + New Opportunity
        </button>
      </div>

      <CommonTable
        fitParentWidth
        columnWidthPercents={COL_PCT}
        headers={['Opp No', 'Title', 'Stage', 'Value', 'Close Date', 'Assigned To', 'Action']}
        rows={tableRows}
        hideVerticalCellBorders
        cellAlign="center"
        headerFontSize="10px"
        bodyFontSize="10px"
        cellPaddingClass="px-2 py-1.5"
        bodyRowHeightRem={2.4}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7 – Notes
// ═══════════════════════════════════════════════════════════════════════════════

const BLANK_NOTE = { id: null, title: '', note: '', createdBy: '', createdOn: '' };

function NoteCard({ item, onEdit, onDelete }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-bold text-gray-800">{item.title}</span>
        <div className="flex shrink-0 gap-1">
          <ActionBtn icon={EditIcon} alt="Edit" title="Edit" onClick={() => onEdit(item)} />
          <ActionBtn icon={DeleteIcon} alt="Delete" title="Delete" onClick={() => onDelete(item.id)} />
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-gray-600">{item.note}</p>
      <div className="mt-3 flex gap-3 text-[10px] text-gray-400">
        <span>By: {item.createdBy}</span>
        <span>{item.createdOn}</span>
      </div>
    </div>
  );
}

function TabNotes() {
  const [notes, setNotes] = useState(INIT_NOTES);
  const [dialog, setDialog] = useState({ open: false, item: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(BLANK_NOTE);

  const openAdd = () => { setForm(BLANK_NOTE); setDialog({ open: true, item: null }); };
  const openEdit = (item) => { setForm({ ...item }); setDialog({ open: true, item }); };
  const closeDialog = () => setDialog({ open: false, item: null });

  const handleSave = () => {
    if (dialog.item) {
      setNotes((prev) => prev.map((n) => (n.id === form.id ? { ...form } : n)));
    } else {
      setNotes((prev) => [{ ...form, id: Date.now(), createdOn: new Date().toISOString().slice(0, 10) }, ...prev]);
    }
    closeDialog();
  };

  const handleDelete = (id) => { setNotes((prev) => prev.filter((n) => n.id !== id)); setConfirmId(null); };
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600">Customer Notes</span>
        <button onClick={openAdd} className="rounded px-3 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
          + Add Note
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {notes.map((n) => (
          <NoteCard key={n.id} item={n} onEdit={openEdit} onDelete={(id) => setConfirmId(id)} />
        ))}
      </div>

      {dialog.open && (
        <Dialog title={dialog.item ? 'Edit Note' : 'Add Note'} onClose={closeDialog}>
          <div className="flex flex-col gap-3">
            <InputField label="Title" fullWidth value={form.title} onChange={f('title')} />
            <InputField label="Created By" fullWidth value={form.createdBy} onChange={f('createdBy')} />
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Note</label>
              <textarea rows={5} className="w-full rounded border border-gray-200 px-2 py-1.5 text-[11px] outline-none" value={form.note} onChange={f('note')} />
            </div>
          </div>
          <DialogFooter onSave={handleSave} onCancel={closeDialog} />
        </Dialog>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          open
          title="Delete Note"
          message="Are you sure you want to delete this note?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8 – Financial Snapshot
// ═══════════════════════════════════════════════════════════════════════════════

function TabFinancial() {
  const COL_PCT = [25, 20, 25, 30];
  const tableRows = INVOICES.map((inv) => [
    inv.no,
    inv.date,
    fmtCurrency(inv.amount),
    invoiceStatusBadge(inv.status),
  ]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Notice */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-[11px] text-blue-700">
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        Financial data sourced from Accounts module. This view is read-only.
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Outstanding Balance', value: 'AED 1,29,500.00', warn: true },
          { label: 'Credit Limit', value: fmtCurrency(CUSTOMER.creditLimit) },
          { label: 'Overdue Amount', value: 'AED 87,000.00', danger: true },
          { label: 'Payment Terms', value: CUSTOMER.paymentTerms },
        ].map(({ label, value, warn, danger }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="text-[10px] text-gray-500">{label}</div>
            <div
              className="mt-1 text-sm font-bold"
              style={{ color: danger ? '#991B1B' : warn ? '#92400E' : primary }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Last payment */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-600">Last Payment</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ROField label="Payment Date" value="2026-04-05" />
          <ROField label="Amount" value="AED 56,800.00" />
          <ROField label="Reference" value="PAY-20260405" />
          <ROField label="Mode" value="Bank Transfer" />
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-600">Recent Invoices (Top 5)</h4>
        <CommonTable
          fitParentWidth
          columnWidthPercents={COL_PCT}
          headers={['Invoice No', 'Date', 'Amount', 'Status']}
          rows={tableRows}
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="10px"
          bodyFontSize="10px"
          cellPaddingClass="px-2 py-1.5"
          bodyRowHeightRem={2.4}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = ['Profile Summary', 'Contacts', 'Addresses', 'Interactions', 'Follow-ups', 'Opportunities', 'Notes', 'Financial Snapshot'];

export default function CustomerCRMPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('Profile Summary');

  // Quick-action interaction dialog (from header button)
  const [interactionDialog, setInteractionDialog] = useState(false);
  const [intForm, setIntForm] = useState({ date: '', time: '', type: 'Call', mode: 'Phone', subject: '', summary: '', outcome: '', nextAction: '', by: '' });

  // Quick-action follow-up dialog
  const [followupDialog, setFollowupDialog] = useState(false);
  const [fuForm, setFuForm] = useState({ dueDate: '', subject: '', priority: 'Medium', assignedTo: '', mode: 'Phone', notes: '' });

  // Quick-action note dialog
  const [noteDialog, setNoteDialog] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', note: '', createdBy: '' });

  const iF = (k) => (e) => setIntForm((p) => ({ ...p, [k]: e.target.value }));
  const fF = (k) => (e) => setFuForm((p) => ({ ...p, [k]: e.target.value }));
  const nF = (k) => (e) => setNoteForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="mx-3 flex flex-col gap-0 rounded-lg border border-gray-200 bg-white shadow-sm">

      {/* ── TOP HEADER CARD ────────────────────────────────────────────── */}
      <div className="rounded-t-lg px-5 py-4" style={{ background: `linear-gradient(135deg, ${primary} 0%, #4a0418 100%)` }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {/* Left – name / code / badge */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-white sm:text-xl">{CUSTOMER.name}</h1>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white">{CUSTOMER.type}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-white/70">{CUSTOMER.code}</p>
          </div>

          {/* Right – action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInteractionDialog(true)}
              className="rounded border border-white/40 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
            >
              + Add Interaction
            </button>
            <button
              type="button"
              onClick={() => setFollowupDialog(true)}
              className="rounded border border-white/40 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
            >
              + Add Follow-up
            </button>
            <button
              type="button"
              onClick={() => setNoteDialog(true)}
              className="rounded border border-white/40 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
            >
              + Add Note
            </button>
            <button
              type="button"
              onClick={() => navigate(`/customers/entry?id=${CUSTOMER.id}`)}
              className="rounded bg-white px-3 py-1.5 text-[11px] font-semibold hover:bg-gray-100"
              style={{ color: primary }}
            >
              Edit Customer
            </button>
          </div>
        </div>

        {/* ── PROFILE STRIP ──────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-3">
          {[
            ['Industry', CUSTOMER.industry],
            ['City', CUSTOMER.city],
            ['Country', CUSTOMER.country],
            ['Phone', CUSTOMER.phone],
            ['Email', CUSTOMER.email],
            ['CRM Rep', CUSTOMER.assignedRep],
            ['Customer Since', CUSTOMER.customerSince],
            ['Last Interaction', CUSTOMER.lastInteraction],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <span className="text-[9px] font-medium uppercase tracking-wide text-white/50">{label}</span>
              <span className="text-[11px] font-semibold text-white/90">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAB BAR ────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-2">
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────────── */}
      <div className="min-h-[400px] px-5 pb-6">
        {activeTab === 'Profile Summary'     && <TabProfile />}
        {activeTab === 'Contacts'            && <TabContacts />}
        {activeTab === 'Addresses'           && <TabAddresses />}
        {activeTab === 'Interactions'        && <TabInteractions />}
        {activeTab === 'Follow-ups'          && <TabFollowups />}
        {activeTab === 'Opportunities'       && <TabOpportunities />}
        {activeTab === 'Notes'               && <TabNotes />}
        {activeTab === 'Financial Snapshot'  && <TabFinancial />}
      </div>

      {/* ── QUICK ADD INTERACTION DIALOG ───────────────────────────────── */}
      {interactionDialog && (
        <Dialog title="Add Interaction" onClose={() => setInteractionDialog(false)} wide>
          <div className="grid grid-cols-2 gap-3">
            <DropdownInput label="Interaction Type" fullWidth value={intForm.type} onChange={(v) => setIntForm((p) => ({ ...p, type: v }))} options={INTERACTION_TYPES} />
            <DropdownInput label="Mode" fullWidth value={intForm.mode} onChange={(v) => setIntForm((p) => ({ ...p, mode: v }))} options={INTERACTION_MODES} />
            <InputField label="Date" type="date" fullWidth value={intForm.date} onChange={iF('date')} />
            <InputField label="Time" type="time" fullWidth value={intForm.time} onChange={iF('time')} />
            <div className="col-span-2">
              <InputField label="Subject" fullWidth value={intForm.subject} onChange={iF('subject')} />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5">
              <label className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Summary</label>
              <textarea rows={3} className="w-full rounded border border-gray-200 px-2 py-1 text-[11px] outline-none" value={intForm.summary} onChange={iF('summary')} />
            </div>
            <InputField label="Outcome" fullWidth value={intForm.outcome} onChange={iF('outcome')} />
            <InputField label="Next Action" fullWidth value={intForm.nextAction} onChange={iF('nextAction')} />
            <div className="col-span-2">
              <InputField label="By (Rep Name)" fullWidth value={intForm.by} onChange={iF('by')} />
            </div>
          </div>
          <DialogFooter onSave={() => setInteractionDialog(false)} onCancel={() => setInteractionDialog(false)} />
        </Dialog>
      )}

      {/* ── QUICK ADD FOLLOW-UP DIALOG ─────────────────────────────────── */}
      {followupDialog && (
        <Dialog title="Add Follow-up" onClose={() => setFollowupDialog(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InputField label="Subject" fullWidth value={fuForm.subject} onChange={fF('subject')} />
            </div>
            <InputField label="Due Date" type="date" fullWidth value={fuForm.dueDate} onChange={fF('dueDate')} />
            <DropdownInput label="Priority" fullWidth value={fuForm.priority} onChange={(v) => setFuForm((p) => ({ ...p, priority: v }))} options={PRIORITIES} />
            <DropdownInput label="Mode" fullWidth value={fuForm.mode} onChange={(v) => setFuForm((p) => ({ ...p, mode: v }))} options={FOLLOWUP_MODES} />
            <InputField label="Assigned To" fullWidth value={fuForm.assignedTo} onChange={fF('assignedTo')} />
            <div className="col-span-2 flex flex-col gap-0.5">
              <label className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Notes</label>
              <textarea rows={2} className="w-full rounded border border-gray-200 px-2 py-1 text-[11px] outline-none" value={fuForm.notes} onChange={fF('notes')} />
            </div>
          </div>
          <DialogFooter onSave={() => setFollowupDialog(false)} onCancel={() => setFollowupDialog(false)} />
        </Dialog>
      )}

      {/* ── QUICK ADD NOTE DIALOG ──────────────────────────────────────── */}
      {noteDialog && (
        <Dialog title="Add Note" onClose={() => setNoteDialog(false)}>
          <div className="flex flex-col gap-3">
            <InputField label="Title" fullWidth value={noteForm.title} onChange={nF('title')} />
            <InputField label="Created By" fullWidth value={noteForm.createdBy} onChange={nF('createdBy')} />
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Note</label>
              <textarea rows={5} className="w-full rounded border border-gray-200 px-2 py-1.5 text-[11px] outline-none" value={noteForm.note} onChange={nF('note')} />
            </div>
          </div>
          <DialogFooter onSave={() => setNoteDialog(false)} onCancel={() => setNoteDialog(false)} />
        </Dialog>
      )}
    </div>
  );
}
