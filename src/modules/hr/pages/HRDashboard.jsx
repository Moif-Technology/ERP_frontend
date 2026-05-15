import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import {
  attendanceRecords,
  documentAlerts,
  employees,
  hrStats,
  leaveRequests,
  quickFlow,
} from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

const cardClass = 'rounded-2xl border border-rose-100 bg-white p-4 shadow-sm';

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

export default function HRDashboard() {
  const primary = colors.primary?.main || '#790728';
  const [summary, setSummary] = useState(hrStats);
  const [requests, setRequests] = useState(leaveRequests);
  const [attendance, setAttendance] = useState(attendanceRecords);
  const [joiners, setJoiners] = useState(employees);

  const pendingApprovals = useMemo(
    () => requests.filter((request) => request.status.includes('Pending')),
    [requests],
  );

  const attendanceExceptions = useMemo(
    () => attendance.filter((record) => record.status !== 'Present'),
    [attendance],
  );

  const newJoiners = useMemo(
    () => [...joiners].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate)).slice(0, 4),
    [joiners],
  );

  const statCards = [
    { label: 'Total employees', value: summary.totalEmployees, hint: `${summary.activeEmployees} active on payroll` },
    { label: 'On leave queue', value: summary.pendingLeaves ?? summary.onLeaveToday ?? 0, hint: `${pendingApprovals.length} requests awaiting action` },
    { label: 'Document alerts', value: summary.expiringDocuments, hint: `${documentAlerts.filter((item) => item.severity === 'High').length} high priority` },
    { label: 'Attendance issues', value: summary.attendanceIssues, hint: `${attendanceExceptions.length} exception records` },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: ds }, { data: lr }, { data: ad }, { data: emps }] = await Promise.all([
          hrApi.getHrDashboardSummary(),
          hrApi.listHrLeaveRequests(),
          hrApi.listHrAttendanceDaily(),
          hrApi.listHrEmployees(),
        ]);
        if (cancelled) return;
        if (ds?.summary) setSummary((prev) => ({ ...prev, ...ds.summary }));
        const reqRows = (lr?.leaveRequests || []).map((r) => ({
          id: `LV-${r.leaveRequestId}`,
          employeeName: r.employeeName || `Employee #${r.employeeId}`,
          type: r.leaveName || `Type #${r.leaveTypeId}`,
          from: r.fromDate,
          to: r.toDate,
          status: r.requestStatus,
        }));
        if (reqRows.length) setRequests(reqRows);
        const attendanceRows = (ad?.attendance || []).map((r) => ({
          employeeId: String(r.employeeId),
          employeeName: r.employeeName || `Employee #${r.employeeId}`,
          department: r.department || '-',
          shift: r.shiftName || '-',
          checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          status: r.attendanceStatus || 'Present',
        }));
        if (attendanceRows.length) setAttendance(attendanceRows);
        const empRows = (emps?.employees || []).map((e) => ({
          id: String(e.employeeId),
          name: e.employeeName,
          designation: e.designation || '-',
          department: e.department || '-',
          joiningDate: e.dateOfJoining || '1900-01-01',
        }));
        if (empRows.length) setJoiners(empRows);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="box-border flex w-[calc(100%+26px)] max-w-none -mx-[13px] flex-col gap-4 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <section className="overflow-hidden bg-[linear-gradient(135deg,#fff7f9_0%,#fff_45%,#f7e7ec_100%)]">
        <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: primary }}>Human Resources</p>
            <h1 className="mt-2 max-w-2xl text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              HR operations now have a proper command center, not just employee masters.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This workspace brings together employee records, attendance exceptions, leave approvals,
              and compliance reminders so HR can act from one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/hr/employee-entry"
                className="rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: primary }}
              >
                Add Employee
              </Link>
              <Link
                to="/hr/leave-management"
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
              >
                Review Leave Queue
              </Link>
              <Link
                to="/hr/attendance"
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
              >
                Check Attendance
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur">
            <SectionHeader
              title="Suggested HR flow"
              subtitle="A clean operating sequence for onboarding and daily HR control."
            />
            <ol className="space-y-2 text-xs text-slate-600">
              {quickFlow.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className={cardClass}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={`${cardClass} overflow-hidden`}>
          <SectionHeader
            title="Pending leave approvals"
            subtitle="Requests that need action from managers or HR."
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-2 py-2 font-bold">Employee</th>
                  <th className="px-2 py-2 font-bold">Leave Type</th>
                  <th className="px-2 py-2 font-bold">Period</th>
                  <th className="px-2 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((request) => (
                  <tr key={request.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3 font-semibold text-slate-900">{request.employeeName}</td>
                    <td className="px-2 py-3 text-slate-600">{request.type}</td>
                    <td className="px-2 py-3 text-slate-600">
                      {request.from} to {request.to}
                    </td>
                    <td className="px-2 py-3">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${cardClass} overflow-hidden`}>
          <SectionHeader
            title="Document expiry watch"
            subtitle="Keep visas, passports, and IDs from turning into compliance issues."
          />
          <div className="space-y-2">
            {documentAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{alert.employeeName}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {alert.type} expires on {alert.expiryDate}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      alert.severity === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {alert.daysLeft} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={cardClass}>
          <SectionHeader
            title="Attendance exceptions"
            subtitle="The records that need HR follow-up before payroll closes."
          />
          <div className="space-y-2">
            {attendanceExceptions.map((record) => (
              <div key={`${record.employeeId}-${record.status}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">{record.employeeName}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {record.department} • {record.shift}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-700">{record.checkIn} / {record.checkOut}</p>
                  <p className="mt-1 text-[10px] font-bold text-rose-700">{record.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <SectionHeader
            title="Recent joiners"
            subtitle="Useful for onboarding, document checks, and probation follow-up."
          />
          <div className="space-y-3">
            {newJoiners.map((employee) => (
              <Link
                key={employee.id}
                to={`/hr/employee-profile/${employee.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 no-underline transition hover:border-rose-200 hover:bg-rose-50/40"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{employee.name}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {employee.designation} • {employee.department}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p>Joined</p>
                  <p className="font-semibold text-slate-700">{employee.joiningDate}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
