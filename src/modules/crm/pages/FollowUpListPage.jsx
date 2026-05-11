import React, { useEffect, useMemo, useState } from 'react';
import { InputField, DropdownInput, CommonTable } from '../../../shared/components/ui';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { listFollowups, createFollowup, updateFollowup, deleteFollowup, completeFollowup } from '../api/crmFollowups.api';
import { listCustomers } from '../../../services/customerEntry.api';
import { listLeads } from '../api/crmLeads.api';
import { listOpportunities } from '../api/crmOpportunities.api';
import { listStaffMembers } from '../../../services/staffEntry.api';

const primary = '#790728';
const FOLLOW_COL_PCT = [14, 8, 18, 20, 8, 10, 12, 10];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];
const LINKED_TYPE_OPT = ['Lead', 'Opportunity', 'Customer'];

const EMPTY_FORM = {
  subject: '',
  linkedType: 'Lead',
  linkedTo: '',
  dueDate: '',
  time: '',
  priority: 'Medium',
  assignedTo: '',
  mode: 'Call',
  notes: '',
};

function Badge({ label, color }) {
  return <span className="inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold" style={color}>{label}</span>;
}

function FollowUpDialog({ open, editItem, onClose, onSave, linkedOptionsByType, staffOptions }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(editItem || EMPTY_FORM);
  }, [editItem]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-bold" style={{ color: primary }}>{editItem ? 'Edit Follow-up' : 'Add Follow-up'}</h2>
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
          <InputField label="Subject" fullWidth value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          <DropdownInput label="Linked Type" fullWidth value={form.linkedType} onChange={(v) => setForm((p) => ({ ...p, linkedType: v, linkedTo: '' }))} options={LINKED_TYPE_OPT} />
          <DropdownInput label="Linked To" fullWidth value={form.linkedTo} onChange={(v) => setForm((p) => ({ ...p, linkedTo: v }))} options={linkedOptionsByType[form.linkedType] || []} placeholder="Select..." />
          <InputField label="Follow-up Date" type="date" fullWidth value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
          <InputField label="Follow-up Time" type="time" fullWidth value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
          <DropdownInput label="Priority" fullWidth value={form.priority} onChange={(v) => setForm((p) => ({ ...p, priority: v }))} options={PRIORITY_OPTIONS} />
          <DropdownInput label="Assigned To" fullWidth value={form.assignedTo} onChange={(v) => setForm((p) => ({ ...p, assignedTo: v }))} options={staffOptions} placeholder="Select user" />
          <InputField label="Mode" fullWidth value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-gray-600">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-800" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-600">Cancel</button>
          <button type="button" onClick={() => onSave(form)} className="rounded px-4 py-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function FollowUpListPage() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filters, setFilters] = useState({ search: '', linkedType: '', priority: '', status: '', assignedTo: '', dateFrom: '', dateTo: '' });

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
  const today = new Date().toISOString().slice(0, 10);

  const linkedOptionsByType = useMemo(() => ({
    Lead: leads.map((x) => `${x.leadId || x.id}|${x.leadCode} - ${x.companyName || x.leadName}`),
    Opportunity: opportunities.map((x) => `${x.opportunityId || x.id}|${x.opportunityCode} - ${x.opportunityName}`),
    Customer: customers.map((x) => `${x.customerId}|${x.customerName}`),
  }), [customers, leads, opportunities]);
  const staffOptions = useMemo(() => staff.map((x) => `${x.staffId}|${x.staffName}`), [staff]);

  async function loadAll() {
    try {
      const [followupItems, customerRes, leadItems, opportunityItems, staffRes] = await Promise.all([
        listFollowups({
          search: filters.search || undefined,
          status: filters.status ? filters.status.toUpperCase() : undefined,
          priority: filters.priority ? filters.priority.toUpperCase() : undefined,
          assignedTo: filters.assignedTo ? Number(String(filters.assignedTo).split('|')[0]) : undefined,
          from: filters.dateFrom || undefined,
          to: filters.dateTo || undefined,
        }),
        listCustomers({ limit: 500 }),
        listLeads(),
        listOpportunities(),
        listStaffMembers({ limit: 500 }),
      ]);
      setRows(followupItems);
      setCustomers(customerRes.data?.customers || []);
      setLeads(leadItems);
      setOpportunities(opportunityItems);
      setStaff(staffRes.data?.staff || []);
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  function toDisplay(row) {
    let linkedType = '—';
    let linkedName = '—';
    if (row.customerId) {
      linkedType = 'Customer';
      linkedName = customers.find((x) => x.customerId === row.customerId)?.customerName || `Customer #${row.customerId}`;
    } else if (row.leadId) {
      linkedType = 'Lead';
      const item = leads.find((x) => (x.leadId || x.id) === row.leadId);
      linkedName = item ? `${item.leadCode} - ${item.companyName || item.leadName}` : `Lead #${row.leadId}`;
    } else if (row.opportunityId) {
      linkedType = 'Opportunity';
      const item = opportunities.find((x) => (x.opportunityId || x.id) === row.opportunityId);
      linkedName = item ? `${item.opportunityCode} - ${item.opportunityName}` : `Opportunity #${row.opportunityId}`;
    }
    const status = row.status === 'PENDING' && String(row.followupDate || '').slice(0, 10) < today ? 'Overdue' : (row.status ? `${row.status[0]}${row.status.slice(1).toLowerCase()}` : 'Pending');
    return {
      id: row.id,
      dueDate: String(row.followupDate || '').slice(0, 10),
      time: String(row.followupDate || '').slice(11, 16),
      subject: row.subject,
      linkedType,
      linkedName,
      priority: row.priority ? `${row.priority[0]}${row.priority.slice(1).toLowerCase()}` : 'Medium',
      status,
      assignedTo: row.assignedToStaffId ? (staff.find((x) => x.staffId === row.assignedToStaffId)?.staffName || String(row.assignedToStaffId)) : '—',
      mode: row.followupType,
      raw: row,
    };
  }

  const displayRows = rows.map(toDisplay).filter((row) => {
    if (filters.linkedType && row.linkedType !== filters.linkedType) return false;
    return true;
  });

  const todayCount = displayRows.filter((x) => x.dueDate === today && x.status !== 'Cancelled').length;
  const overdueCount = displayRows.filter((x) => x.status === 'Overdue').length;
  const upcomingCount = displayRows.filter((x) => x.dueDate > today && x.status === 'Pending').length;

  const openAdd = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit = (row) => {
    const linkedId = row.raw.customerId || row.raw.leadId || row.raw.opportunityId || '';
    setEditItem({
      subject: row.subject,
      linkedType: row.linkedType,
      linkedTo: `${linkedId}|${row.linkedName}`,
      dueDate: row.dueDate,
      time: row.time,
      priority: row.priority,
      assignedTo: row.raw.assignedToStaffId ? `${row.raw.assignedToStaffId}|${row.assignedTo}` : '',
      mode: row.mode,
      notes: row.raw.notes || '',
      id: row.id,
      raw: row.raw,
    });
    setDialogOpen(true);
  };

  const saveDialog = async (form) => {
    try {
      const [linkedId] = String(form.linkedTo || '').split('|');
      const payload = {
        subject: form.subject,
        followupDate: form.time ? `${form.dueDate}T${form.time}:00` : form.dueDate,
        followupType: form.mode.toUpperCase(),
        priority: form.priority.toUpperCase(),
        assignedToStaffId: form.assignedTo ? Number(String(form.assignedTo).split('|')[0]) : null,
        notes: form.notes || null,
        customerId: form.linkedType === 'Customer' ? Number(linkedId) : null,
        leadId: form.linkedType === 'Lead' ? Number(linkedId) : null,
        opportunityId: form.linkedType === 'Opportunity' ? Number(linkedId) : null,
        status: editItem?.raw?.status || 'PENDING',
      };
      if (editItem?.id) await updateFollowup(editItem.id, payload);
      else await createFollowup(payload);
      setDialogOpen(false);
      setEditItem(null);
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const tableRows = displayRows.map((row) => [
    row.dueDate,
    row.time || '—',
    row.subject,
    <div key={`linked-${row.id}`} className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium">{row.linkedName}</span>
      <span className="text-[9px] text-gray-500">{row.linkedType}</span>
    </div>,
    <Badge key={`pri-${row.id}`} label={row.priority} color={row.priority === 'High' ? { background: '#FEE2E2', color: '#991B1B' } : row.priority === 'Medium' ? { background: '#FEF3C7', color: '#92400E' } : { background: '#E5E7EB', color: '#374151' }} />,
    <Badge key={`sts-${row.id}`} label={row.status} color={row.status === 'Completed' ? { background: '#DCFCE7', color: '#166534' } : row.status === 'Overdue' ? { background: '#FEE2E2', color: '#991B1B' } : { background: '#DBEAFE', color: '#1D4ED8' }} />,
    row.assignedTo,
    <div key={`act-${row.id}`} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
      <button type="button" onClick={() => openEdit(row)} className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50"><img src={EditActionIcon} alt="Edit" className="h-3 w-3" /></button>
      <button type="button" onClick={() => deleteFollowup(row.id).then(loadAll).catch((err) => alert(err?.response?.data?.message || err.message))} className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50"><img src={DeleteActionIcon} alt="Delete" className="h-3 w-3" /></button>
      {row.status !== 'Completed' && (
        <button type="button" onClick={() => completeFollowup(row.id).then(loadAll).catch((err) => alert(err?.response?.data?.message || err.message))} className="rounded bg-green-700 px-1.5 py-0.5 text-[9px] font-semibold text-white">Done</button>
      )}
    </div>,
  ]);

  return (
    <>
      <FollowUpDialog open={dialogOpen} editItem={editItem} onClose={() => { setDialogOpen(false); setEditItem(null); }} onSave={saveDialog} linkedOptionsByType={linkedOptionsByType} staffOptions={staffOptions} />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>FOLLOW-UP LIST</h1>
            <p className="mt-1 text-xs text-gray-500">Track and manage all scheduled follow-ups</p>
          </div>
          <button type="button" onClick={openAdd} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Add Follow-up</button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="Today's Follow-ups" value={todayCount} />
          <StatCard label="Overdue" value={overdueCount} danger />
          <StatCard label="Upcoming" value={upcomingCount} info />
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <InputField label="Search" fullWidth value={filters.search} onChange={(e) => setF('search', e.target.value)} />
            <DropdownInput label="Linked Type" fullWidth value={filters.linkedType} onChange={(v) => setF('linkedType', v)} options={LINKED_TYPE_OPT} placeholder="All" />
            <DropdownInput label="Priority" fullWidth value={filters.priority} onChange={(v) => setF('priority', v)} options={PRIORITY_OPTIONS} placeholder="All" />
            <DropdownInput label="Status" fullWidth value={filters.status} onChange={(v) => setF('status', v)} options={STATUS_OPTIONS} placeholder="All" />
            <DropdownInput label="Assigned To" fullWidth value={filters.assignedTo} onChange={(v) => setF('assignedTo', v)} options={staffOptions} placeholder="All users" />
            <InputField label="Date From" type="date" fullWidth value={filters.dateFrom} onChange={(e) => setF('dateFrom', e.target.value)} />
            <InputField label="Date To" type="date" fullWidth value={filters.dateTo} onChange={(e) => setF('dateTo', e.target.value)} />
            <div className="flex items-end">
              <button type="button" onClick={loadAll} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Apply Filters</button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CommonTable
            fitParentWidth
            allowHorizontalScroll={false}
            truncateHeader
            columnWidthPercents={FOLLOW_COL_PCT}
            tableClassName="min-w-0 w-full"
            hideVerticalCellBorders
            cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)"
            headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
            bodyRowHeightRem={2.6}
            maxVisibleRows={10}
            headers={['Due Date', 'Time', 'Subject', 'Linked To', 'Priority', 'Status', 'Assigned To', 'Action']}
            rows={tableRows}
          />
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, danger = false, info = false }) {
  const style = danger ? 'border-red-100 bg-red-50 text-red-600' : info ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50';
  return (
    <div className={`rounded-lg border p-3 ${style}`}>
      <div className="text-[11px]">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
