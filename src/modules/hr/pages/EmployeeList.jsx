import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import StatusBadge from '../../../shared/components/ui/StatusBadge';
import SearchIcon from '../../../shared/assets/icons/search2.svg';
import DashboardIcon from '../../../shared/assets/icons/dashboard.svg';
import EmployeeDirectoryIcon from '../../../shared/assets/icons/employee-directory.svg';
import { employees as employeeRecords } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

const primary = colors.primary?.main || '#790728';

const CL_COL_PCT = [4, 6, 12, 20, 15, 15, 15, 13];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaSearchBox =
  `flex h-7 min-h-7 w-full min-w-0 flex-1 items-center gap-1 py-[3px] pl-1.5 pr-2 ${figmaOutline} sm:min-w-[280px] sm:max-w-[640px] sm:pr-3 md:min-w-[360px] md:max-w-[320px]`;
const employeeToolbarBtn =
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 no-underline transition hover:border-neutral-300 hover:bg-neutral-50';
const employeePrimaryToolbarBtn =
  'inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium text-white no-underline transition hover:opacity-95';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rowsData, setRowsData] = useState(employeeRecords);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrEmployees();
        if (cancelled) return;
        const rows = (data?.employees || []).map((e) => ({
          id: String(e.employeeId),
          code: e.employeeCode,
          name: e.employeeName,
          designation: e.designation || '-',
          department: e.department || '-',
          mobile: e.mobileNo || '-',
          status: e.isActive ? 'Active' : 'Inactive',
        }));
        if (rows.length) setRowsData(rows);
      } catch {
        // Keep fallback mock rows when HR tables are not installed yet.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!q) return rowsData;
    return rowsData.filter((r) =>
      Object.values(r).join(' ').toLowerCase().includes(q)
    );
  }, [search, rowsData]);

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
        <div>
          <h1 className="shrink-0 text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
            EMPLOYEE DIRECTORY
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Link to="/hr/dashboard" className={employeeToolbarBtn}>
            <img src={DashboardIcon} alt="" className="h-3 w-3" />
            HR Dashboard
          </Link>
          <Link to="/hr/employee-entry" className={employeePrimaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }}>
            <img src={EmployeeDirectoryIcon} alt="" className="h-3 w-3 brightness-0 invert" />
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
