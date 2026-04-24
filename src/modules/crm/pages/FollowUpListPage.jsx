import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, DropdownInput, CommonTable } from '../../../shared/components/ui';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import CalendarIcon from '../../../shared/assets/icons/calendar.svg';

const primary = '#790728';

// ─── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_FOLLOWUPS = [
  { id: 1,  dueDate: '2026-04-22', time: '09:00', subject: 'Discuss renewal terms',    linkedType: 'Customer',     linkedName: 'Al Noor Trading',     priority: 'High',   status: 'Overdue',   assignedTo: 'Ahmed',  mode: 'Call' },
  { id: 2,  dueDate: '2026-04-22', time: '11:30', subject: 'Send product catalogue',   linkedType: 'Lead',         linkedName: 'Blue Star Garage',    priority: 'Medium', status: 'Overdue',   assignedTo: 'Priya',  mode: 'Email' },
  { id: 3,  dueDate: '2026-04-23', time: '10:00', subject: 'Demo walkthrough call',    linkedType: 'Opportunity',  linkedName: 'Gulf Auto Parts',     priority: 'High',   status: 'Pending',   assignedTo: 'Ahmed',  mode: 'Call' },
  { id: 4,  dueDate: '2026-04-23', time: '14:00', subject: 'Proposal follow-up',       linkedType: 'Lead',         linkedName: 'TechWave Solutions',  priority: 'High',   status: 'Pending',   assignedTo: 'Ravi',    mode: 'Email' },
  { id: 5,  dueDate: '2026-04-23', time: '15:30', subject: 'Confirm meeting slot',     linkedType: 'Customer',     linkedName: 'Prime Logistics',     priority: 'Low',    status: 'Pending',   assignedTo: 'Priya',  mode: 'Meeting' },
  { id: 6,  dueDate: '2026-04-24', time: '09:30', subject: 'Quarterly review prep',    linkedType: 'Customer',     linkedName: 'Al Rawabi Group',     priority: 'Medium', status: 'Pending',   assignedTo: 'Ahmed',  mode: 'Meeting' },
  { id: 7,  dueDate: '2026-04-24', time: '12:00', subject: 'Budget discussion',        linkedType: 'Opportunity',  linkedName: 'Skyline Contracting', priority: 'High',   status: 'Pending',   assignedTo: 'Priya',  mode: 'Call' },
  { id: 8,  dueDate: '2026-04-25', time: '10:00', subject: 'Site visit scheduling',    linkedType: 'Lead',         linkedName: 'Falcon Industries',   priority: 'Medium', status: 'Pending',   assignedTo: 'Ravi',    mode: 'Visit' },
  { id: 9,  dueDate: '2026-04-27', time: '11:00', subject: 'Contract finalisation',    linkedType: 'Opportunity',  linkedName: 'Horizon Real Estate', priority: 'High',   status: 'Pending',   assignedTo: 'Ahmed',  mode: 'Meeting' },
  { id: 10, dueDate: '2026-04-29', time: '14:30', subject: 'Check payment status',     linkedType: 'Customer',     linkedName: 'Nova Electronics',    priority: 'Low',    status: 'Cancelled', assignedTo: 'Priya',  mode: 'Email' },
];

const SAMPLE_LINKED = {
  Lead:        ['Blue Star Garage', 'TechWave Solutions', 'Falcon Industries'],
  Opportunity: ['Gulf Auto Parts', 'Skyline Contracting', 'Horizon Real Estate'],
  Customer:    ['Al Noor Trading', 'Prime Logistics', 'Al Rawabi Group', 'Nova Electronics'],
};

const ASSIGNED_OPTIONS  = ['Ahmed', 'Priya', 'Ravi'];
const PRIORITY_OPTIONS  = ['High', 'Medium', 'Low'];
const STATUS_OPTIONS    = ['Pending', 'Completed', 'Cancelled'];
const MODE_OPTIONS      = ['Call', 'Email', 'Meeting', 'Visit'];
const LINKED_TYPE_OPT   = ['Lead', 'Opportunity', 'Customer'];
const DATE_FILTER_OPT   = ['Today', 'Tomorrow', 'This Week', 'Custom Range'];

const TODAY = '2026-04-23';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function priorityBadge(val) {
  if (val === 'High')   return { background: '#FEE2E2', color: '#991B1B' };
  if (val === 'Medium') return { background: '#FEF3C7', color: '#92400E' };
  return                       { background: '#E5E7EB', color: '#374151' };
}

function statusBadge(val) {
  if (val === 'Completed')  return { background: '#DCFCE7', color: '#166534' };
  if (val === 'Overdue')    return { background: '#FEE2E2', color: '#991B1B' };
  if (val === 'Cancelled')  return { background: '#F3F4F6', color: '#6B7280' };
  return                           { background: '#DBEAFE', color: '#1D4ED8' };
}

function typeBadge(val) {
  if (val === 'Lead')        return { background: '#EDE9FE', color: '#5B21B6' };
  if (val === 'Opportunity') return { background: '#FEF3C7', color: '#92400E' };
  return                            { background: '#DCFCE7', color: '#166534' };
}

function Badge({ label, style }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-semibold" style={style}>
      {label}
    </span>
  );
}

// ─── Dialog ──────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  subject: '', linkedType: 'Lead', linkedTo: '', dueDate: '', time: '',
  priority: 'Medium', assignedTo: '', mode: 'Call', notes: '',
};

function FollowUpDialog({ open, editItem, onClose, onSave }) {
  const [form, setForm] = useState(editItem ?? EMPTY_FORM);

  React.useEffect(() => {
    setForm(editItem ?? EMPTY_FORM);
  }, [editItem, open]);

  if (!open) return null;

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const linkedOptions = SAMPLE_LINKED[form.linkedType] ?? [];

  const handleSave = () => {
    console.log('[FollowUpListPage] Save follow-up:', form);
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Dialog header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-bold" style={{ color: primary }}>
            {editItem ? 'Edit Follow-up' : 'Add Follow-up'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        {/* Dialog body */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Subject – full width */}
            <div className="sm:col-span-2">
              <InputField
                label="Subject"
                fullWidth
                value={form.subject}
                onChange={(e) => set('subject', e.target.value)}
                placeholder="Enter follow-up subject"
              />
            </div>

            <DropdownInput
              label="Linked To Type"
              fullWidth
              value={form.linkedType}
              onChange={(v) => set('linkedType', v)}
              options={LINKED_TYPE_OPT}
            />

            <DropdownInput
              label="Linked To"
              fullWidth
              value={form.linkedTo}
              onChange={(v) => set('linkedTo', v)}
              options={linkedOptions}
              placeholder="Select…"
            />

            <InputField
              label="Follow-up Date"
              type="date"
              fullWidth
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />

            <InputField
              label="Follow-up Time"
              type="time"
              fullWidth
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
            />

            <DropdownInput
              label="Priority"
              fullWidth
              value={form.priority}
              onChange={(v) => set('priority', v)}
              options={PRIORITY_OPTIONS}
            />

            <DropdownInput
              label="Assigned To"
              fullWidth
              value={form.assignedTo}
              onChange={(v) => set('assignedTo', v)}
              options={ASSIGNED_OPTIONS}
              placeholder="Select user"
            />

            <DropdownInput
              label="Mode"
              fullWidth
              value={form.mode}
              onChange={(v) => set('mode', v)}
              options={MODE_OPTIONS}
            />

            {/* Notes – full width */}
            <div className="sm:col-span-2">
              <label className="mb-0.5 block text-[9px] leading-tight text-gray-600 sm:text-[11px]">Notes</label>
              <textarea
                rows={3}
                className="w-full rounded border border-gray-200 px-2 py-1.5 text-[9px] outline-none sm:text-[10px]"
                placeholder="Add any notes…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Dialog footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded px-4 py-1.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const FOLLOW_COL_PCT = [14, 7, 17, 18, 8, 10, 13, 13];

export default function FollowUpListPage() {
  const navigate = useNavigate();

  const [rows, setRows]           = useState(SAMPLE_FOLLOWUPS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [filters, setFilters] = useState({
    dateFilter: 'Today',
    dateFrom: '',
    dateTo: '',
    linkedType: '',
    priority: '',
    status: '',
    assignedTo: '',
  });

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  // ── Stat cards ──
  const todayFollowups  = rows.filter((r) => r.dueDate === TODAY && r.status !== 'Cancelled').length;
  const overdueCount    = rows.filter((r) => r.status === 'Overdue').length;
  const upcomingCount   = rows.filter((r) => r.dueDate > TODAY && r.status === 'Pending').length;

  // ── Filtered rows ──
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.linkedType && r.linkedType !== filters.linkedType) return false;
      if (filters.priority   && r.priority   !== filters.priority)   return false;
      if (filters.status     && r.status     !== filters.status)     return false;
      if (filters.assignedTo && r.assignedTo !== filters.assignedTo) return false;

      if (filters.dateFilter === 'Today'    && r.dueDate !== TODAY)  return false;
      if (filters.dateFilter === 'Tomorrow' && r.dueDate !== '2026-04-24') return false;
      if (filters.dateFilter === 'This Week') {
        if (r.dueDate < TODAY || r.dueDate > '2026-04-29') return false;
      }
      if (filters.dateFilter === 'Custom Range') {
        if (filters.dateFrom && r.dueDate < filters.dateFrom) return false;
        if (filters.dateTo   && r.dueDate > filters.dateTo)   return false;
      }
      return true;
    });
  }, [rows, filters]);

  // ── Dialog handlers ──
  const openAdd  = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit = (row) => { setEditItem(row); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditItem(null); };

  const handleSave = (form) => {
    if (editItem) {
      setRows((prev) => prev.map((r) => (r.id === editItem.id ? { ...r, ...form } : r)));
    } else {
      setRows((prev) => [...prev, { ...form, id: Date.now(), status: 'Pending' }]);
    }
    closeDialog();
    setSuccessMsg(editItem ? 'Follow-up updated.' : 'Follow-up added.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id) => {
    console.log('[FollowUpListPage] Delete follow-up id:', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleMarkDone = (id) => {
    console.log('[FollowUpListPage] Mark done id:', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Completed' } : r)));
  };

  // ── Table rows ──
  const tableBodyRows = filteredRows.map((row) => {
    const isOverdue = row.status === 'Overdue';
    return [
      <span key={`date-${row.id}`} className={`font-medium ${isOverdue ? 'text-red-600' : ''}`} style={{ fontSize: 'clamp(8px,1vw,10px)' }}>
        {row.dueDate}
      </span>,
      <span key={`time-${row.id}`} style={{ fontSize: 'clamp(8px,1vw,10px)' }}>{row.time}</span>,
      <span key={`subj-${row.id}`} className="font-medium" style={{ fontSize: 'clamp(8px,1vw,10px)' }}>{row.subject}</span>,
      <div key={`linked-${row.id}`} className="flex flex-col gap-0.5">
        <span style={{ fontSize: 'clamp(8px,1vw,10px)', fontWeight: 500 }}>{row.linkedName}</span>
        <Badge label={row.linkedType} style={typeBadge(row.linkedType)} />
      </div>,
      <Badge key={`pri-${row.id}`}    label={row.priority} style={priorityBadge(row.priority)} />,
      <Badge key={`sts-${row.id}`}    label={row.status}   style={statusBadge(row.status)} />,
      <span key={`asgn-${row.id}`} style={{ fontSize: 'clamp(8px,1vw,10px)' }}>{row.assignedTo}</span>,
      <div key={`act-${row.id}`} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
        <button type="button" onClick={() => openEdit(row)} title="Edit"
          className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50">
          <img src={EditActionIcon} alt="Edit" className="h-3 w-3" />
        </button>
        <button type="button" onClick={() => handleDelete(row.id)} title="Delete"
          className="flex h-6 w-6 items-center justify-center rounded bg-white hover:bg-gray-50">
          <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3" />
        </button>
        {row.status === 'Pending' && (
          <button type="button" onClick={() => handleMarkDone(row.id)}
            className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-white"
            style={{ backgroundColor: '#166534', fontSize: '9px' }}>
            Done
          </button>
        )}
      </div>,
    ];
  });

  return (
    <>
      <FollowUpDialog open={dialogOpen} editItem={editItem} onClose={closeDialog} onSave={handleSave} />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
              FOLLOW-UP LIST
            </h1>
            <p className="mt-1 text-xs text-gray-500">Track and manage all scheduled follow-ups</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {successMsg && (
              <span className="rounded bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">{successMsg}</span>
            )}
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-1 rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Follow-up
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="text-[11px] text-gray-500">Today's Follow-ups</div>
            <div className="mt-1 text-lg font-bold" style={{ color: primary }}>{todayFollowups}</div>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 p-3">
            <div className="text-[11px] text-red-500">Overdue</div>
            <div className="mt-1 text-lg font-bold text-red-600">{overdueCount}</div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="text-[11px] text-blue-500">Upcoming (7 days)</div>
            <div className="mt-1 text-lg font-bold text-blue-700">{upcomingCount}</div>
          </div>
        </div>

        {/* ── Filter panel ── */}
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <DropdownInput
              label="Date"
              fullWidth
              value={filters.dateFilter}
              onChange={(v) => setF('dateFilter', v)}
              options={DATE_FILTER_OPT}
            />

            {filters.dateFilter === 'Custom Range' && (
              <>
                {/* Date From */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-gray-500">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setF('dateFrom', e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                {/* Date To */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-gray-500">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setF('dateTo', e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </>
            )}

            <DropdownInput
              label="Linked To Type"
              fullWidth
              value={filters.linkedType}
              onChange={(v) => setF('linkedType', v)}
              options={LINKED_TYPE_OPT}
              placeholder="All"
            />

            <DropdownInput
              label="Priority"
              fullWidth
              value={filters.priority}
              onChange={(v) => setF('priority', v)}
              options={PRIORITY_OPTIONS}
              placeholder="All"
            />

            <DropdownInput
              label="Status"
              fullWidth
              value={filters.status}
              onChange={(v) => setF('status', v)}
              options={STATUS_OPTIONS}
              placeholder="All"
            />

            <DropdownInput
              label="Assigned To"
              fullWidth
              value={filters.assignedTo}
              onChange={(v) => setF('assignedTo', v)}
              options={ASSIGNED_OPTIONS}
              placeholder="All users"
            />
          </div>
        </div>

        {/* ── Table ── */}
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
            rows={tableBodyRows}
          />
          {filteredRows.length === 0 && (
            <div className="mt-4 text-center text-[12px] text-gray-400">No follow-ups match the selected filters.</div>
          )}
        </div>
      </div>
    </>
  );
}
