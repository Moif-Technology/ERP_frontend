import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { CommonTable, DropdownInput, InputField } from '../../../shared/components/ui';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';

const primary = '#790728';

const OPP_COL_PCT = [8, 14, 16, 10, 9, 10, 11, 9, 13];

const SAMPLE_DATA = [
  { id: 1, oppNo: 'OPP-0001', customer: 'Al Noor Trading LLC', title: 'ERP + POS Implementation', stage: 'Proposal', value: 285000, closeDate: '2026-05-30', assignedTo: 'Ahmed', probability: 60 },
  { id: 2, oppNo: 'OPP-0002', customer: 'Gulf Star Automotive', title: 'Garage Management System', stage: 'Qualified', value: 140000, closeDate: '2026-06-15', assignedTo: 'Priya', probability: 40 },
  { id: 3, oppNo: 'OPP-0003', customer: 'Masdar Trading Co.', title: 'Inventory & Accounting Suite', stage: 'Negotiation', value: 320000, closeDate: '2026-05-10', assignedTo: 'Ravi', probability: 75 },
  { id: 4, oppNo: 'OPP-0004', customer: 'Al Baraka Retail', title: 'Retail POS Rollout – 5 Branches', stage: 'Won', value: 195000, closeDate: '2026-04-01', assignedTo: 'Ahmed', probability: 100 },
  { id: 5, oppNo: 'OPP-0005', customer: 'Emirates Gate Group', title: 'HR & Payroll Module', stage: 'Prospect', value: 75000, closeDate: '2026-07-20', assignedTo: 'Priya', probability: 20 },
  { id: 6, oppNo: 'OPP-0006', customer: 'Rimal Foodstuff LLC', title: 'Supply Chain & Distribution', stage: 'Lost', value: 210000, closeDate: '2026-03-15', assignedTo: 'Ravi', probability: 0 },
  { id: 7, oppNo: 'OPP-0007', customer: 'Blue Falcon Engineering', title: 'Project Costing Module', stage: 'Proposal', value: 98000, closeDate: '2026-06-01', assignedTo: 'Ahmed', probability: 55 },
  { id: 8, oppNo: 'OPP-0008', customer: 'Al Waha Auto Parts', title: 'Spare Parts Inventory ERP', stage: 'Qualified', value: 162000, closeDate: '2026-06-30', assignedTo: 'Priya', probability: 45 },
  { id: 9, oppNo: 'OPP-0009', customer: 'Zayed Contracting LLC', title: 'Construction ERP Full Suite', stage: 'Negotiation', value: 480000, closeDate: '2026-05-20', assignedTo: 'Ravi', probability: 80 },
  { id: 10, oppNo: 'OPP-0010', customer: 'Pearl Coast Trading', title: 'CRM + Sales Module', stage: 'Won', value: 110000, closeDate: '2026-04-10', assignedTo: 'Ahmed', probability: 100 },
];

const STAGE_BADGE = {
  Prospect:    { bg: '#F3F4F6', color: '#374151' },
  Qualified:   { bg: '#DBEAFE', color: '#1D4ED8' },
  Proposal:    { bg: '#FEF3C7', color: '#92400E' },
  Negotiation: { bg: '#FED7AA', color: '#9A3412' },
  Won:         { bg: '#DCFCE7', color: '#166534' },
  Lost:        { bg: '#FEE2E2', color: '#991B1B' },
};

const stageOptions = ['All', 'Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const assignedOptions = ['Ahmed', 'Priya', 'Ravi'];

export default function OpportunityListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', stage: '', assignedTo: '', dateFrom: '', dateTo: '' });

  const updateFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  const filteredRows = useMemo(() => {
    return SAMPLE_DATA.filter((r) => {
      const q = filters.search.toLowerCase();
      const matchSearch = !q || r.customer.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.oppNo.toLowerCase().includes(q);
      const matchStage = !filters.stage || filters.stage === 'All' || r.stage === filters.stage;
      const matchAssigned = !filters.assignedTo || r.assignedTo === filters.assignedTo;
      const matchFrom = !filters.dateFrom || r.closeDate >= filters.dateFrom;
      const matchTo = !filters.dateTo || r.closeDate <= filters.dateTo;
      return matchSearch && matchStage && matchAssigned && matchFrom && matchTo;
    });
  }, [filters]);

  const totalValue = filteredRows.reduce((s, r) => s + r.value, 0);
  const kpiTotal = SAMPLE_DATA.length;
  const kpiOpen = SAMPLE_DATA.filter((r) => !['Won', 'Lost'].includes(r.stage)).length;
  const kpiWon = SAMPLE_DATA.filter((r) => r.stage === 'Won').length;
  const kpiLost = SAMPLE_DATA.filter((r) => r.stage === 'Lost').length;

  const tableBodyRows = filteredRows.map((row) => [
    row.oppNo,
    row.customer,
    row.title,
    <span
      key={`stage-${row.id}`}
      className="inline-flex whitespace-nowrap rounded px-2 py-1 text-[10px] font-semibold"
      style={{ background: STAGE_BADGE[row.stage]?.bg, color: STAGE_BADGE[row.stage]?.color }}
    >
      {row.stage}
    </span>,
    `₹${row.value.toLocaleString('en-IN')}`,
    row.closeDate,
    row.assignedTo,
    `${row.probability}%`,
    <div key={`actions-${row.id}`} className="flex items-center justify-center gap-1.5 whitespace-nowrap">
      <button
        type="button"
        onClick={() => navigate(`/crm/opportunity-workspace/${row.id}`)}
        className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50"
        title="View"
      >
        <img src={ViewActionIcon} alt="View" className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => navigate('/crm/opportunity-entry', { state: { opp: row } })}
        className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50"
        title="Edit"
      >
        <img src={EditActionIcon} alt="Edit" className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded bg-white hover:bg-gray-50"
        title="Delete"
      >
        <img src={DeleteActionIcon} alt="Delete" className="h-3.5 w-3.5" />
      </button>
    </div>,
  ]);

  const tableFooterRow = [
    '',
    '',
    '',
    '',
    <span key="footer-val" className="text-[11px] font-bold" style={{ color: primary }}>
      ₹{totalValue.toLocaleString('en-IN')}
    </span>,
    '',
    <span key="footer-label" className="text-[11px] font-semibold text-gray-700">Total</span>,
    '',
    '',
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            Opportunity List
          </h1>
          <p className="mt-1 text-xs text-gray-500">Manage and track all CRM opportunities</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/crm/opportunity-entry')}
            className="flex items-center gap-1 rounded px-4 py-2 text-[11px] font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Opportunity 
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Filter Panel */}
      <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="Search"
            fullWidth
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Opp no, customer, title…"
          />
          <DropdownInput
            label="Stage"
            fullWidth
            value={filters.stage}
            onChange={(v) => updateFilter('stage', v)}
            options={stageOptions}
            placeholder="All stages"
          />
          <DropdownInput
            label="Assigned To"
            fullWidth
            value={filters.assignedTo}
            onChange={(v) => updateFilter('assignedTo', v)}
            options={assignedOptions}
            placeholder="All users"
          />
          <div className="flex flex-col gap-1 w-full">
            <label className="text-[11px] font-medium text-gray-600">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-[11px] text-gray-800 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <label className="text-[11px] font-medium text-gray-600">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-[11px] text-gray-800 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
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
          headers={[
            'Opp No',
            'Customer Name',
            'Opp Title',
            'Stage',
            'Value (₹)',
            'Expected Close',
            'Assigned To',
            'Probability %',
            'Action',
          ]}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
        />
      </div>
    </div>
  );
}
