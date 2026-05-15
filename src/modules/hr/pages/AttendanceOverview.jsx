import React, { useEffect, useMemo, useState } from 'react';
import { colors, listTableCheckboxClass } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { attendanceRecords } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

const CL_COL_PCT = [5, 8, 20, 13, 16, 12, 12, 14];
const cardClass = 'rounded-2xl border border-rose-100 bg-white p-4 shadow-sm';
const attendanceToolbarSelect =
  'relative inline-flex h-7 min-h-7 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50';

function ToolbarChevron({ className = 'h-2 w-2 shrink-0 text-black' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AttendanceOverview() {
  const primary = colors.primary?.main || '#790728';
  const [statusFilter, setStatusFilter] = useState('All');
  const [records, setRecords] = useState(attendanceRecords);

  const filters = ['All', 'Present', 'Late In', 'Early Out', 'Absent'];

  const filteredRows = useMemo(() => {
    if (statusFilter === 'All') return records;
    return records.filter((record) => record.status === statusFilter);
  }, [statusFilter, records]);

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

  return (
    <div className="box-border flex w-[calc(100%+26px)] max-w-none -mx-[13px] flex-col gap-4 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
          DAILY ATTENDANCE REVIEW
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <div className={attendanceToolbarSelect}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 min-w-[7.5rem] flex-1 cursor-pointer appearance-none border-0 bg-transparent py-0 pl-0 pr-5 text-xs font-medium text-neutral-700 outline-none"
              aria-label="Attendance status filter"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
              <ToolbarChevron />
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className={cardClass}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Present</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {records.filter((item) => item.status === 'Present').length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Employees marked present today.</p>
        </article>
        <article className={cardClass}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Late / Early</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {records.filter((item) => item.status === 'Late In' || item.status === 'Early Out').length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Late arrivals or early exits.</p>
        </article>
        <article className={cardClass}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Absent</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {records.filter((item) => item.status === 'Absent').length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Employees absent from attendance.</p>
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
