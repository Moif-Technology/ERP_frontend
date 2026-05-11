import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { CommonTable, DropdownInput, InputField } from '../../../shared/components/ui';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { useNavigate } from 'react-router-dom';
import { listLeads, updateLead, deleteLead } from '../api/crmLeads.api';
import { listLeadSources } from '../api/crmLeadSources.api';
import { listLeadStatuses } from '../api/crmLeadStatuses.api';

const LEAD_COL_PCT = [10, 18, 14, 12, 10, 10, 12, 14, 10];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function mapApiRow(r, sourceById, statusById) {
  return {
    id: r.id,
    leadNo: r.leadCode,
    leadName: r.companyName || r.leadName || '',
    contactPerson: r.leadName || '',
    mobile: r.mobileNo || '',
    email: r.email || '',
    sourceId: r.leadSourceId,
    source: r.leadSourceId ? (sourceById.get(r.leadSourceId) || '') : '',
    statusId: r.leadStatusId,
    status: r.leadStatusId ? (statusById.get(r.leadStatusId) || '') : '',
    assignedToStaffId: r.assignedToStaffId,
    assignedTo: r.assignedToStaffId ? String(r.assignedToStaffId) : '',
    priority: r.priority || 'MEDIUM',
    nextFollowup: r.nextFollowupAt ? String(r.nextFollowupAt).slice(0, 10) : '',
    _raw: r,
  };
}

export default function LeadListPage() {
  const primary = colors.primary?.main || '#790728';
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '', source: '', status: '', assignedTo: '', priority: '', dateFrom: '', dateTo: '',
  });

  const [rows, setRows] = useState([]);
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  const sourceById = useMemo(() => {
    const m = new Map();
    sources.forEach((s) => m.set(s.id, s.sourceName || s.source_name));
    return m;
  }, [sources]);
  const sourceByName = useMemo(() => {
    const m = new Map();
    sources.forEach((s) => m.set(s.sourceName || s.source_name, s.id));
    return m;
  }, [sources]);
  const statusById = useMemo(() => {
    const m = new Map();
    statuses.forEach((s) => m.set(s.id, s.statusName || s.status_name));
    return m;
  }, [statuses]);
  const statusByName = useMemo(() => {
    const m = new Map();
    statuses.forEach((s) => m.set(s.statusName || s.status_name, s.id));
    return m;
  }, [statuses]);

  const sourceOptions = useMemo(() => sources.map((s) => s.sourceName || s.source_name).filter(Boolean), [sources]);
  const statusOptions = useMemo(() => statuses.map((s) => s.statusName || s.status_name).filter(Boolean), [statuses]);

  async function loadAll() {
    setLoading(true);
    try {
      const [src, st] = await Promise.all([listLeadSources(), listLeadStatuses()]);
      setSources(src);
      setStatuses(st);
      const apiFilters = {
        search: filters.search || undefined,
        sourceId: filters.source ? (src.find((x) => (x.sourceName || x.source_name) === filters.source)?.id) : undefined,
        statusId: filters.status ? (st.find((x) => (x.statusName || x.status_name) === filters.status)?.id) : undefined,
        priority: filters.priority || undefined,
        from: filters.dateFrom || undefined,
        to: filters.dateTo || undefined,
      };
      const items = await listLeads(apiFilters);
      const sById = new Map(src.map((x) => [x.id, x.sourceName || x.source_name]));
      const stById = new Map(st.map((x) => [x.id, x.statusName || x.status_name]));
      setRows(items.map((r) => mapApiRow(r, sById, stById)));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const startEdit = (row) => { setEditingId(row.id); setEditDraft({ ...row }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const saveEdit = async () => {
    setSavingId(editingId);
    try {
      const payload = {
        leadName: editDraft.contactPerson || editDraft.leadName,
        companyName: editDraft.leadName,
        mobileNo: editDraft.mobile,
        leadSourceId: editDraft.source ? sourceByName.get(editDraft.source) : null,
        leadStatusId: editDraft.status ? statusByName.get(editDraft.status) : null,
        priority: editDraft.priority,
        nextFollowupAt: editDraft.nextFollowup || null,
        assignedToStaffId: editDraft.assignedTo ? Number(editDraft.assignedTo) : null,
        email: editDraft._raw?.email,
        whatsappNo: editDraft._raw?.whatsappNo,
        customerId: editDraft._raw?.customerId,
        expectedValue: editDraft._raw?.expectedValue,
        probabilityPercent: editDraft._raw?.probabilityPercent,
        address: editDraft._raw?.address,
        city: editDraft._raw?.city,
        country: editDraft._raw?.country,
        remarks: editDraft._raw?.remarks,
        leadDate: editDraft._raw?.leadDate,
        leadTitle: editDraft._raw?.leadTitle,
      };
      await updateLead(editingId, payload);
      setEditingId(null); setEditDraft({});
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete lead ${row.leadNo}?`)) return;
    try {
      await deleteLead(row.id);
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const updateDraft = (key, value) => setEditDraft((prev) => ({ ...prev, [key]: value }));
  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filteredRows = rows;

  const totalLeads = rows.length;
  const openLeads = rows.filter((r) => !['Lost', 'Converted'].includes(r.status)).length;
  const convertedLeads = rows.filter((r) => r.status === 'Converted').length;
  const highPriority = rows.filter((r) => r.priority === 'HIGH' || r.priority === 'URGENT').length;

  const badgeStyle = (value, type = 'status') => {
    if (type === 'status') {
      if (value === 'New') return { background: '#FEF3C7', color: '#92400E' };
      if (value === 'Qualified') return { background: '#DBEAFE', color: '#1D4ED8' };
      if (value === 'Converted') return { background: '#DCFCE7', color: '#166534' };
      if (value === 'Lost') return { background: '#FEE2E2', color: '#991B1B' };
      return { background: '#F3F4F6', color: '#374151' };
    }
    return { background: '#F3F4F6', color: '#374151' };
  };

  const cellInput = 'w-full rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] text-gray-800 outline-none focus:border-[#790728]';
  const cellSelect = 'w-full rounded border border-gray-300 bg-white px-1 py-0.5 text-[10px] text-gray-800 outline-none focus:border-[#790728]';

  const tableBodyRows = filteredRows.map((row) => {
    const isEditing = editingId === row.id;
    return [
      row.leadNo,
      isEditing
        ? <input key={`ln-${row.id}`} className={cellInput} value={editDraft.leadName} onChange={(e) => updateDraft('leadName', e.target.value)} />
        : row.leadName,
      isEditing
        ? <input key={`cp-${row.id}`} className={cellInput} value={editDraft.contactPerson} onChange={(e) => updateDraft('contactPerson', e.target.value)} />
        : row.contactPerson,
      isEditing
        ? <input key={`mb-${row.id}`} className={cellInput} value={editDraft.mobile} onChange={(e) => updateDraft('mobile', e.target.value)} />
        : row.mobile,
      isEditing
        ? <select key={`src-${row.id}`} className={cellSelect} value={editDraft.source} onChange={(e) => updateDraft('source', e.target.value)}>
            <option value=""></option>
            {sourceOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        : row.source,
      isEditing
        ? <select key={`st-${row.id}`} className={cellSelect} value={editDraft.status} onChange={(e) => updateDraft('status', e.target.value)}>
            <option value=""></option>
            {statusOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        : <span key={`status-${row.id}`} className="inline-flex whitespace-nowrap rounded px-2 py-1 text-[10px] font-semibold" style={badgeStyle(row.status, 'status')}>{row.status}</span>,
      isEditing
        ? <input key={`asgn-${row.id}`} className={cellInput} value={editDraft.assignedTo} onChange={(e) => updateDraft('assignedTo', e.target.value)} />
        : row.assignedTo,
      isEditing
        ? <input key={`nf-${row.id}`} type="date" className={cellInput} value={editDraft.nextFollowup} onChange={(e) => updateDraft('nextFollowup', e.target.value)} />
        : row.nextFollowup,
      isEditing
        ? <div key={`actions-${row.id}`} className="flex items-center justify-center gap-1 whitespace-nowrap">
            <button type="button" onClick={saveEdit} disabled={savingId === row.id} className="rounded px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: primary }}>{savingId === row.id ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={cancelEdit} className="rounded border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-600">Cancel</button>
          </div>
        : <div key={`actions-${row.id}`} className="flex items-center justify-center gap-2 whitespace-nowrap">
            <button type="button" onClick={() => navigate(`/crm/lead-workspace/${row.id}`)} className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50" title="View">
              <img src={ViewActionIcon} alt="View" className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => navigate(`/crm/lead-entry/${row.id}`)} className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50" title="Edit">
              <img src={EditActionIcon} alt="Edit" className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => handleDelete(row)} className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50" title="Delete">
              <img src={DeleteActionIcon} alt="Delete" className="h-3.5 w-3.5" />
            </button>
          </div>,
    ];
  });

  const tableFooterRow = [
    '', '', '', '', '', '',
    <span key="footer-count-label" className="text-[11px] font-semibold text-gray-700">Total Leads</span>,
    '',
    <span key="footer-count" className="text-[11px] font-bold" style={{ color: primary }}>{filteredRows.length}</span>,
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>LEAD LIST</h1>
          <p className="mt-1 text-xs text-gray-500">Manage and track all CRM leads {loading && '· Loading...'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/crm/lead-entry')} className="flex items-center gap-1 rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add
          </button>
          <button type="button" onClick={loadAll} className="flex items-center gap-1 rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700">
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3"><div className="text-[11px] text-gray-500">Total Leads</div><div className="mt-1 text-lg font-bold" style={{ color: primary }}>{totalLeads}</div></div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3"><div className="text-[11px] text-gray-500">Open Leads</div><div className="mt-1 text-lg font-bold" style={{ color: primary }}>{openLeads}</div></div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3"><div className="text-[11px] text-gray-500">Converted</div><div className="mt-1 text-lg font-bold" style={{ color: primary }}>{convertedLeads}</div></div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3"><div className="text-[11px] text-gray-500">High Priority</div><div className="mt-1 text-lg font-bold" style={{ color: primary }}>{highPriority}</div></div>
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputField label="Search" fullWidth value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} />
          <DropdownInput label="Lead source" fullWidth value={filters.source} onChange={(v) => updateFilter('source', v)} options={sourceOptions} placeholder="All sources" />
          <DropdownInput label="Lead status" fullWidth value={filters.status} onChange={(v) => updateFilter('status', v)} options={statusOptions} placeholder="All statuses" />
          <DropdownInput label="Priority" fullWidth value={filters.priority} onChange={(v) => updateFilter('priority', v)} options={PRIORITY_OPTIONS} placeholder="All priorities" />
          <InputField label="Date from" type="date" fullWidth value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
          <InputField label="Date to" type="date" fullWidth value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} />
          <div className="flex items-end">
            <button type="button" onClick={loadAll} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Apply Filters</button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="lead-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={false}
          truncateHeader
          truncateBody
          columnWidthPercents={LEAD_COL_PCT}
          tableClassName="min-w-0 w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={10}
          headers={['Lead No', 'Lead Name', 'Contact Person', 'Mobile', 'Source', 'Status', 'Assigned To', 'Next Follow-up', 'Action']}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
        />
      </div>
    </div>
  );
}
