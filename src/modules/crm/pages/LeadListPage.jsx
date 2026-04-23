import React, { useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { CommonTable, DropdownInput, InputField } from '../../../shared/components/ui';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import FollowupActionIcon from '../../../shared/assets/icons/calendar.svg';
import { useNavigate } from 'react-router-dom';

const LEAD_COL_PCT = [10, 18, 14, 12, 10, 10, 12, 14, 10];
export default function LeadListPage() {
  const primary = colors.primary?.main || '#790728';
const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    status: '',
    assignedTo: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
  });

  const [rows] = useState([
    {
      id: 1,
      leadNo: 'LD-0001',
      leadName: 'Al Noor Trading',
      contactPerson: 'Fahad',
      mobile: '971500000001',
      email: 'fahad@alnoor.com',
      source: 'Website',
      status: 'New',
      assignedTo: 'Sabeeh',
      priority: 'High',
      nextFollowup: '2026-04-23',
    },
    {
      id: 2,
      leadNo: 'LD-0002',
      leadName: 'Blue Star Garage',
      contactPerson: 'Rashid',
      mobile: '971500000002',
      email: 'rashid@bluestar.com',
      source: 'Reference',
      status: 'Qualified',
      assignedTo: 'Swetha',
      priority: 'Medium',
      nextFollowup: '2026-04-24',
    },
  ]);

  const sourceOptions = ['Website', 'Reference', 'Walk-in', 'Campaign', 'Sales Call'];
  const statusOptions = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
  const assignedOptions = ['Sabeeh', 'Swetha', 'Sonu'];
  const priorityOptions = ['High', 'Medium', 'Low'];

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const searchText = filters.search.toLowerCase();

      const matchesSearch =
        !searchText ||
        row.leadNo.toLowerCase().includes(searchText) ||
        row.leadName.toLowerCase().includes(searchText) ||
        row.contactPerson.toLowerCase().includes(searchText) ||
        row.mobile.toLowerCase().includes(searchText) ||
        row.email.toLowerCase().includes(searchText);

      const matchesSource = !filters.source || row.source === filters.source;
      const matchesStatus = !filters.status || row.status === filters.status;
      const matchesAssigned = !filters.assignedTo || row.assignedTo === filters.assignedTo;
      const matchesPriority = !filters.priority || row.priority === filters.priority;

      return matchesSearch && matchesSource && matchesStatus && matchesAssigned && matchesPriority;
    });
  }, [rows, filters]);

  const totalLeads = rows.length;
  const openLeads = rows.filter((r) => !['Lost', 'Converted'].includes(r.status)).length;
  const convertedLeads = rows.filter((r) => r.status === 'Converted').length;
  const highPriority = rows.filter((r) => r.priority === 'High').length;

  const badgeStyle = (value, type = 'status') => {
    if (type === 'status') {
      if (value === 'New') return { background: '#FEF3C7', color: '#92400E' };
      if (value === 'Qualified') return { background: '#DBEAFE', color: '#1D4ED8' };
      if (value === 'Converted') return { background: '#DCFCE7', color: '#166534' };
      if (value === 'Lost') return { background: '#FEE2E2', color: '#991B1B' };
      return { background: '#F3F4F6', color: '#374151' };
    }

    if (type === 'priority') {
      if (value === 'High') return { background: '#FEE2E2', color: '#991B1B' };
      if (value === 'Medium') return { background: '#FEF3C7', color: '#92400E' };
      return { background: '#E5E7EB', color: '#374151' };
    }

    return { background: '#F3F4F6', color: '#374151' };
  };

const tableBodyRows = filteredRows.map((row) => [
  row.leadNo,
  row.leadName,
  row.contactPerson,
  row.mobile,
  row.source,
  <span
    key={`status-${row.id}`}
    className="inline-flex whitespace-nowrap rounded px-2 py-1 text-[10px] font-semibold"
    style={badgeStyle(row.status, 'status')}
  >
    {row.status}
  </span>,
  row.assignedTo,
  row.nextFollowup,
<div key={`actions-${row.id}`} className="flex items-center justify-center gap-2 whitespace-nowrap">
  <button
  type="button"
  onClick={() => navigate(`/crm/lead-workspace/${row.id}`)}
  className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50"
  title="View"
>
  <img src={ViewActionIcon} alt="View" className="h-3.5 w-3.5" />
</button>

  <button
    type="button"
    className="flex h-7 w-7 items-center justify-center rounded  bg-white hover:bg-gray-50"
    title="Edit"
  >
    <img src={EditActionIcon} alt="Edit" className="h-3.5 w-3.5" />
  </button>

  <button
    type="button"
    className="flex h-7 w-7 items-center justify-center rounded  bg-white hover:bg-gray-50"
    title="Follow-up"
  >
    <img src={FollowupActionIcon} alt="Follow-up" className="h-3.5 w-3.5" />
  </button>
</div>
]);
const tableFooterRow = [
  '',
  '',
  '',
  '',
  '',
  '',
  <span key="footer-count-label" className="text-[11px] font-semibold text-gray-700">
    Total Leads
  </span>,
  '',
  <span key="footer-count" className="text-[11px] font-bold" style={{ color: primary }}>
    {filteredRows.length}
  </span>,
];

  return (
    <div className="mx-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            LEAD LIST
          </h1>
          <p className="mt-1 text-xs text-gray-500">Manage and track all CRM leads</p>
        </div>

        <div className="flex flex-wrap gap-2">
 <button
  type="button"
  onClick={() => navigate('/crm/lead-entry')}
  className="flex items-center gap-1 rounded px-4 py-2 text-[11px] font-semibold text-white"
  style={{ backgroundColor: primary }}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
  Add
</button>
          <button
            type="button"
            className="flex items-center gap-1 rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Total Leads</div>
          <div className="mt-1 text-lg font-bold" style={{ color: primary }}>{totalLeads}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Open Leads</div>
          <div className="mt-1 text-lg font-bold" style={{ color: primary }}>{openLeads}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Converted</div>
          <div className="mt-1 text-lg font-bold" style={{ color: primary }}>{convertedLeads}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">High Priority</div>
          <div className="mt-1 text-lg font-bold" style={{ color: primary }}>{highPriority}</div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="Search"
            fullWidth
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <DropdownInput
            label="Lead source"
            fullWidth
            value={filters.source}
            onChange={(v) => updateFilter('source', v)}
            options={sourceOptions}
            placeholder="All sources"
          />
          <DropdownInput
            label="Lead status"
            fullWidth
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            options={statusOptions}
            placeholder="All statuses"
          />
          <DropdownInput
            label="Assigned to"
            fullWidth
            value={filters.assignedTo}
            onChange={(v) => updateFilter('assignedTo', v)}
            options={assignedOptions}
            placeholder="All users"
          />
          <DropdownInput
            label="Priority"
            fullWidth
            value={filters.priority}
            onChange={(v) => updateFilter('priority', v)}
            options={priorityOptions}
            placeholder="All priorities"
          />
          <InputField
            label="Date from"
            type="date"
            fullWidth
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
          />
          <InputField
            label="Date to"
            type="date"
            fullWidth
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* <CommonTable
          className="lead-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll
          truncateHeader
          truncateBody
          columnWidthPercents={LEAD_COL_PCT}
          tableClassName="min-w-[76rem] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.4}
          maxVisibleRows={10}
          headers={[
            'Lead No',
            'Lead Name',
            'Contact Person',
            'Mobile',
            'Email',
            'Source',
            'Status',
            'Assigned To',
            'Priority',
            'Next Follow-up',
            '',
          ]}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
        /> */}

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
  headers={[
    'Lead No',
    'Lead Name',
    'Contact Person',
    'Mobile',
    'Source',
    'Status',
    'Assigned To',
    'Next Follow-up',
    'Action',
  ]}
  rows={tableBodyRows}
  footerRow={tableFooterRow}
/>
      </div>
    </div>
  );
}