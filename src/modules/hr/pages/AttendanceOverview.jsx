import React, { useEffect, useMemo, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { attendanceRecords } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

const CL_COL_PCT = [5, 8, 20, 13, 16, 12, 12, 14];

export default function AttendanceOverview() {
  const primary = colors.primary?.main || '#790728';
  const [selectedStatuses, setSelectedStatuses] = useState(['All']);
  const [records, setRecords] = useState(attendanceRecords);

  const filters = ['All', 'Present', 'Late In', 'Early Out', 'Absent'];

  const filteredRows = useMemo(() => {
    if (selectedStatuses.includes('All')) return records;
    return records.filter((record) => selectedStatuses.includes(record.status));
  }, [selectedStatuses, records]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrAttendanceDaily();
        if (cancelled) return;
        const rows = (data?.attendance || []).map((r) => ({
          employeeId: String(r.employeeId),
          employeeName: r.employeeName || '-',
          department: r.department || '-',
          shift: r.shiftName || '-',
          checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          overtime: String(r.overtimeHours || 0),
          status: r.attendanceStatus || 'Present',
        }));
        if (rows.length) setRecords(rows);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tableRows = useMemo(
    () =>
      filteredRows.map((record, index) => [
        <input key={`${record.employeeId}-check`} type="checkbox" className={listTableCheckboxClass} style={{ accentColor: primary }} />,
        index + 1,
        <span key={`${record.employeeId}-name`} className="font-semibold text-slate-900">{record.employeeName}</span>,
        record.department,
        record.shift,
        record.checkIn,
        record.checkOut,
        <span
          key={`${record.employeeId}-status`}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            record.status === 'Present'
              ? 'bg-emerald-100 text-emerald-800'
              : record.status === 'Absent'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
          }`}
        >
          {record.status}
        </span>,
      ]),
    [filteredRows, primary],
  );

  const toggleStatus = (filter) => {
    if (filter === 'All') {
      setSelectedStatuses(['All']);
      return;
    }
    setSelectedStatuses((current) => {
      const next = current.includes('All') ? [] : [...current];
      if (next.includes(filter)) {
        const without = next.filter((item) => item !== filter);
        return without.length ? without : ['All'];
      }
      return [...next, filter];
    });
  };

  return (
    <div className="mx-3 flex flex-col gap-4 rounded-3xl border border-rose-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">Attendance Control</p>
          <h1 className="mt-1 text-xl font-black text-slate-900">Daily attendance review</h1>
          <p className="mt-1 text-sm text-slate-500">
            Use this screen to isolate late arrivals, absentees, and exception records before payroll is processed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = selectedStatuses.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                onClick={() => toggleStatus(filter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  active ? 'text-white' : 'border-slate-200 bg-white text-slate-600'
                }`}
                style={active ? { backgroundColor: primary, borderColor: primary } : undefined}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Present</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {records.filter((item) => item.status === 'Present').length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Late / Early</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {records.filter((item) => item.status === 'Late In' || item.status === 'Early Out').length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Absent</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {records.filter((item) => item.status === 'Absent').length}
          </p>
        </article>
      </div>

      <CommonTable
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        fitParentWidth
        columnWidthPercents={CL_COL_PCT}
        tableClassName="min-w-[820px] w-full"
        hideVerticalCellBorders
        cellAlign="center"
        headerFontSize="clamp(7px, 0.85vw, 10px)"
        bodyFontSize="clamp(8px, 1vw, 10px)"
        cellPaddingClass="px-1 py-1.5 sm:px-1.5 sm:py-2"
        bodyRowHeightRem={2.5}
        headers={['', 'Sl. no', 'Employee', 'Department', 'Shift', 'Check in', 'Check out', 'Status']}
        rows={tableRows}
      />
    </div>
  );
}
