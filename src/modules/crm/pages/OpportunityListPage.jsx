import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonTable, DropdownInput, InputField } from '../../../shared/components/ui';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { listOpportunities, deleteOpportunity } from '../api/crmOpportunities.api';
import { listOpportunityStages } from '../api/crmOpportunityStages.api';
import { listCustomers } from '../../../services/customerEntry.api';
import { listStaffMembers } from '../../../services/staffEntry.api';

const primary = '#790728';
const OPP_COL_PCT = [10, 15, 18, 10, 9, 10, 10, 8, 10];
const STATUS_STYLE = {
  OPEN: { bg: '#DBEAFE', color: '#1D4ED8' },
  WON: { bg: '#DCFCE7', color: '#166534' },
  LOST: { bg: '#FEE2E2', color: '#991B1B' },
  CANCELLED: { bg: '#F3F4F6', color: '#374151' },
};

export default function OpportunityListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', stage: '', assignedTo: '', status: '', dateFrom: '', dateTo: '' });
  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const stageById = useMemo(() => new Map(stages.map((x) => [x.id, x.stageName || x.stage_name])), [stages]);
  const customerById = useMemo(() => new Map(customers.map((x) => [x.customerId, x.customerName])), [customers]);
  const staffById = useMemo(() => new Map(staff.map((x) => [x.staffId, x.staffName])), [staff]);
  const stageOptions = useMemo(() => stages.map((x) => x.stageName || x.stage_name).filter(Boolean), [stages]);
  const staffOptions = useMemo(() => staff.map((x) => `${x.staffId} - ${x.staffName}`), [staff]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  async function loadAll() {
    setLoading(true);
    try {
      const [stageItems, customerRes, staffRes] = await Promise.all([
        listOpportunityStages(),
        listCustomers({ limit: 500 }),
        listStaffMembers({ limit: 500 }),
      ]);
      setStages(stageItems);
      setCustomers(customerRes.data?.customers || []);
      setStaff(staffRes.data?.staff || []);

      const stageId = filters.stage
        ? stageItems.find((x) => (x.stageName || x.stage_name) === filters.stage)?.id
        : undefined;
      const assignedTo = filters.assignedTo ? Number(String(filters.assignedTo).split(' - ')[0]) : undefined;

      const items = await listOpportunities({
        search: filters.search || undefined,
        stageId,
        assignedTo,
        status: filters.status || undefined,
        from: filters.dateFrom || undefined,
        to: filters.dateTo || undefined,
      });
      setRows(items);
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const mappedRows = useMemo(() => rows.map((r) => ({
    id: r.id,
    oppNo: r.opportunityCode,
    customer: r.customerId ? (customerById.get(r.customerId) || `Customer #${r.customerId}`) : '—',
    title: r.opportunityName || '',
    stage: r.opportunityStageId ? (stageById.get(r.opportunityStageId) || `Stage #${r.opportunityStageId}`) : '—',
    value: Number(r.estimatedValue || 0),
    closeDate: r.expectedCloseDate ? String(r.expectedCloseDate).slice(0, 10) : '—',
    assignedTo: r.assignedToStaffId ? (staffById.get(r.assignedToStaffId) || String(r.assignedToStaffId)) : '—',
    probability: Number(r.probabilityPercent || 0),
    status: r.status || 'OPEN',
  })), [rows, customerById, stageById, staffById]);

  const totalValue = mappedRows.reduce((sum, row) => sum + row.value, 0);
  const kpiTotal = mappedRows.length;
  const kpiOpen = mappedRows.filter((row) => row.status === 'OPEN').length;
  const kpiWon = mappedRows.filter((row) => row.status === 'WON').length;
  const kpiLost = mappedRows.filter((row) => row.status === 'LOST').length;

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete opportunity ${row.oppNo}?`)) return;
    try {
      await deleteOpportunity(row.id);
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const tableBodyRows = mappedRows.map((row) => [
    row.oppNo,
    row.customer,
    row.title,
    <span key={`stage-${row.id}`} className="inline-flex whitespace-nowrap rounded px-2 py-1 text-[10px] font-semibold" style={{ background: STATUS_STYLE[row.status]?.bg || '#F3F4F6', color: STATUS_STYLE[row.status]?.color || '#374151' }}>
      {row.stage}
    </span>,
    `Rs ${row.value.toLocaleString('en-IN')}`,
    row.closeDate,
    row.assignedTo,
    `${row.probability}%`,
    <div key={`actions-${row.id}`} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
      <button type="button" onClick={() => navigate(`/crm/opportunity-workspace/${row.id}`)} className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50" title="View">
        <img src={ViewActionIcon} alt="View" className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => navigate(`/crm/opportunity-entry/${row.id}`)} className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50" title="Edit">
        <img src={EditActionIcon} alt="Edit" className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => handleDelete(row)} className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50" title="Delete">
        <img src={DeleteActionIcon} alt="Delete" className="h-3.5 w-3.5" />
      </button>
    </div>,
  ]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>Opportunity List</h1>
          <p className="mt-1 text-xs text-gray-500">Manage and track all CRM opportunities {loading && '· Loading...'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate('/crm/opportunity-entry')} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Add Opportunity</button>
          <button type="button" onClick={loadAll} className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total Opportunities', value: kpiTotal },
          { label: 'Open', value: kpiOpen },
          { label: 'Won', value: kpiWon },
          { label: 'Lost', value: kpiLost },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="text-[11px] text-gray-500">{kpi.label}</div>
            <div className="mt-1 text-lg font-bold" style={{ color: primary }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputField label="Search" fullWidth value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Code, customer, title..." />
          <DropdownInput label="Stage" fullWidth value={filters.stage} onChange={(v) => updateFilter('stage', v)} options={stageOptions} placeholder="All stages" />
          <DropdownInput label="Assigned To" fullWidth value={filters.assignedTo} onChange={(v) => updateFilter('assignedTo', v)} options={staffOptions} placeholder="All users" />
          <DropdownInput label="Status" fullWidth value={filters.status} onChange={(v) => updateFilter('status', v)} options={['OPEN', 'WON', 'LOST']} placeholder="All statuses" />
          <InputField label="Date From" type="date" fullWidth value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
          <InputField label="Date To" type="date" fullWidth value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} />
          <div className="flex items-end">
            <button type="button" onClick={loadAll} className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>Apply Filters</button>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="opp-list-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          allowHorizontalScroll={false}
          truncateHeader
          truncateBody
          columnWidthPercents={OPP_COL_PCT}
          tableClassName="min-w-0 w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
          bodyRowHeightRem={2.35}
          maxVisibleRows={10}
          headers={['Opp No', 'Customer Name', 'Opp Title', 'Stage', 'Value', 'Expected Close', 'Assigned To', 'Probability %', 'Action']}
          rows={tableBodyRows}
          footerRow={['', '', '', '', <span key="total" className="text-[11px] font-bold" style={{ color: primary }}>Rs {totalValue.toLocaleString('en-IN')}</span>, '', <span key="label" className="text-[11px] font-semibold text-gray-700">Total</span>, '', '']}
        />
      </div>
    </div>
  );
}
