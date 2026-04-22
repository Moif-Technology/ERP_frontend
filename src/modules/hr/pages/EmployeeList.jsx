import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import SearchIcon from '../../../shared/assets/icons/search2.svg';

const primary = colors.primary?.main || '#790728';

const CL_COL_PCT = [4, 6, 12, 20, 15, 15, 15, 13];

const DUMMY_EMPLOYEES = [
  { id: '1', code: 'EMP-001', name: 'John Doe', designation: 'Software Engineer', department: 'IT', mobile: '0501234567', status: 'Active' },
  { id: '2', code: 'EMP-002', name: 'Jane Smith', designation: 'HR Manager', department: 'HR', mobile: '0509876543', status: 'Active' },
  { id: '3', code: 'EMP-003', name: 'Ali Khan', designation: 'Accountant', department: 'Finance', mobile: '0561112222', status: 'Inactive' },
];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaSearchBox = `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[240px]`;
const primaryLinkBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white no-underline shadow-sm transition-opacity hover:opacity-95';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleRowSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DUMMY_EMPLOYEES;
    return DUMMY_EMPLOYEES.filter((r) => 
      Object.values(r).join(' ').toLowerCase().includes(q)
    );
  }, [search]);

  const handleRowClick = useCallback((rowIdx) => {
    const employee = filteredRows[rowIdx];
    if (employee) {
      navigate(`/hr/employee-profile/${employee.id}`);
    }
  }, [filteredRows, navigate]);

  const tableRows = useMemo(() => {
    return filteredRows.map((r, idx) => {
      const checked = selectedIds.has(r.id);
      return [
        <div key={`chk-${r.id}`} className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelected(r.id)}
            className={listTableCheckboxClass}
            style={{ accentColor: primary }}
          />
        </div>,
        idx + 1,
        <span key={`code-${r.id}`} className="font-semibold text-black">{r.code}</span>,
        r.name,
        r.designation,
        r.department,
        r.mobile,
        <StatusBadge key={`status-${r.id}`} status={r.status} />,
      ];
    });
  }, [filteredRows, selectedIds, toggleRowSelected]);

  return (
    <div className="box-border flex min-h-0 w-[calc(100%+26px)] max-w-none flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          EMPLOYEE DIRECTORY
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/hr/employee-entry" className={primaryLinkBtn} style={{ backgroundColor: primary, borderColor: primary }}>
            Add Employee
          </Link>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-2 sm:h-7 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
        <div className={figmaSearchBox}>
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 shrink-0 opacity-90" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="min-w-0 flex-1 border-0 bg-transparent font-['Open_Sans',sans-serif] text-[10px] font-semibold leading-5 text-black outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth
          columnWidthPercents={CL_COL_PCT}
          tableClassName="min-w-[800px] w-full"
          hideVerticalCellBorders
          cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35}
          headers={['', 'Sl. no', 'Employee code', 'Employee name', 'Designation', 'Department', 'Mobile no', 'Status']}
          rows={tableRows}
          onBodyRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
