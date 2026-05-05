import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import { employees, leaveRequests, leaveTypes } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';
import { disabledIfNoAccess } from '../../../shared/components/ui/PermissionGate.jsx';

const panel = 'rounded-2xl border border-rose-100 bg-white p-4 shadow-sm';

export default function LeaveManagement() {
  const primary = colors.primary?.main || '#790728';
  const [statusFilter, setStatusFilter] = useState('All');
  const [requests, setRequests] = useState(leaveRequests);
  const [types, setTypes] = useState(leaveTypes);
  const [employeesData, setEmployeesData] = useState(employees);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ employeeId: '', leaveTypeId: '', fromDate: '', toDate: '', totalDays: '' });

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'All') return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [statusFilter, requests]);

  const totalPending = requests.filter((request) => request.status?.includes('Pending')).length;
  const employeesOnAnnualLeave = employeesData.filter((employee) =>
    employee.leaveBalance?.some((balance) => balance.type === 'Annual Leave' && balance.booked > 0),
  ).length;

  const statuses = ['All', 'Pending Approval', 'Pending HR Review', 'Approved', 'Rejected', 'Closed'];

  const fetchAll = async () => {
    try {
      const [{ data: lr }, { data: lt }, { data: emps }] = await Promise.all([
        hrApi.listHrLeaveRequests(),
        hrApi.listHrLeaveTypes(),
        hrApi.listHrEmployees(),
      ]);
      const reqRows = (lr?.leaveRequests || []).map((r) => ({
        id: `LV-${r.leaveRequestId}`,
        rawId: r.leaveRequestId,
        employeeId: String(r.employeeId),
        employeeName: r.employeeName || `Employee #${r.employeeId}`,
        type: r.leaveName || `Type #${r.leaveTypeId}`,
        from: r.fromDate,
        to: r.toDate,
        days: r.totalDays,
        status: r.requestStatus,
        relief: 'N/A',
      }));
      if (reqRows.length) setRequests(reqRows);
      const typeRows = (lt?.leaveTypes || []).map((t) => ({
        id: t.leaveTypeId,
        name: t.leaveName,
        days: t.maxDaysPerYear,
        carryForward: 'Yes',
        requiresApproval: 'Manager + HR',
      }));
      if (typeRows.length) setTypes(typeRows);
      const empRows = (emps?.employees || []).map((e) => ({
        id: String(e.employeeId),
        name: e.employeeName,
        department: e.department || '-',
        leaveBalance: [{ type: 'Annual Leave', available: 0, booked: 0, carriedForward: 0 }],
      }));
      if (empRows.length) setEmployeesData(empRows);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await hrApi.updateHrLeaveRequestStatus(requestId, { requestStatus: newStatus });
      await fetchAll();
    } catch {}
  };

  const handleCreateLeave = async () => {
    setFormError('');
    if (!form.employeeId || !form.leaveTypeId || !form.fromDate || !form.toDate) {
      setFormError('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      await hrApi.createHrLeaveRequest({
        employeeId: Number(form.employeeId),
        leaveTypeId: Number(form.leaveTypeId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        totalDays: Number(form.totalDays) || 1,
      });
      setForm({ employeeId: '', leaveTypeId: '', fromDate: '', toDate: '', totalDays: '' });
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create leave request.');
    } finally {
      setSaving(false);
    }
  };

  const employeeOptions = useMemo(() => employeesData.map((e) => ({ label: e.name, value: e.id })), [employeesData]);
  const leaveTypeOptions = useMemo(() => types.map((t) => ({ label: t.name, value: String(t.id) })), [types]);

  return (
    <div className="mx-3 flex flex-col gap-4">
      <section className="rounded-[28px] border border-rose-200 bg-[linear-gradient(135deg,#fff_0%,#fff6f8_55%,#f9e6ec_100%)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">Leave Management</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Control requests, balances, and approvals</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              A practical HR leave screen should show pending approvals, policy setup, and employee leave exposure in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: primary }}
            >
              {showForm ? 'Cancel' : 'New Leave Request'}
            </button>
            <Link
              to="/hr/leave-type-master"
              className="inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 no-underline"
            >
              Open Leave Type Master
            </Link>
          </div>
        </div>
      </section>

      {showForm && (
        <section className={panel}>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Create Leave Request</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <DropdownInput label="Employee" fullWidth value={form.employeeId} onChange={(v) => setForm((p) => ({ ...p, employeeId: v }))}
              options={employeeOptions.map((o) => o.label)} placeholder="Select employee"
              onChangeRaw={(label) => { const match = employeeOptions.find((o) => o.label === label); if (match) setForm((p) => ({ ...p, employeeId: match.value })); }} />
            <DropdownInput label="Leave Type" fullWidth value={form.leaveTypeId} onChange={(v) => setForm((p) => ({ ...p, leaveTypeId: v }))}
              options={leaveTypeOptions.map((o) => o.label)} placeholder="Select type"
              onChangeRaw={(label) => { const match = leaveTypeOptions.find((o) => o.label === label); if (match) setForm((p) => ({ ...p, leaveTypeId: match.value })); }} />
            <InputField label="From Date" type="date" fullWidth value={form.fromDate} onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))} />
            <InputField label="To Date" type="date" fullWidth value={form.toDate} onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))} />
            <InputField label="Total Days" type="number" fullWidth value={form.totalDays} onChange={(e) => setForm((p) => ({ ...p, totalDays: e.target.value }))} />
          </div>
          <div className="mt-3 flex items-center justify-end gap-3">
            {formError && <p className="text-xs text-red-700">{formError}</p>}
            <button type="button" onClick={handleCreateLeave} disabled={saving}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-3">
        <article className={panel}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Pending queue</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{totalPending}</p>
          <p className="mt-1 text-xs text-slate-500">Requests needing manager or HR action.</p>
        </article>
        <article className={panel}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Policies configured</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{types.length}</p>
          <p className="mt-1 text-xs text-slate-500">Leave rules currently available to assign.</p>
        </article>
        <article className={panel}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Employees with leave usage</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{employeesOnAnnualLeave}</p>
          <p className="mt-1 text-xs text-slate-500">Useful for manpower and roster planning.</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className={panel}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Leave request board</h2>
              <p className="mt-1 text-xs text-slate-500">Approvals, reviews, and closed requests.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => {
                const active = statusFilter === status;
                return (
                  <button key={status} type="button" onClick={() => setStatusFilter(status)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${active ? 'text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                    style={active ? { backgroundColor: primary, borderColor: primary } : undefined}>
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {filteredRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{request.employeeName}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {request.type} • {request.days} day(s) • Relief: {request.relief}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {request.from} to {request.to}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                      {request.status}
                    </span>
                    {request.rawId && request.status?.includes('Pending') && (() => {
                      const gate = disabledIfNoAccess({ permission: 'hr.leave.approve' });
                      return (
                        <div className="flex gap-1">
                          <button type="button" disabled={gate.disabled} title={gate.title}
                            onClick={() => handleStatusChange(request.rawId, 'Approved')}
                            className="rounded bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white hover:bg-emerald-700 disabled:opacity-40">
                            Approve
                          </button>
                          <button type="button" disabled={gate.disabled} title={gate.title}
                            onClick={() => handleStatusChange(request.rawId, 'Rejected')}
                            className="rounded bg-rose-600 px-2 py-1 text-[9px] font-bold text-white hover:bg-rose-700 disabled:opacity-40">
                            Reject
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={panel}>
            <h2 className="text-sm font-bold text-slate-900">Leave policy matrix</h2>
            <div className="mt-3 space-y-2">
              {types.map((type) => (
                <div key={type.name} className="rounded-xl border border-slate-100 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{type.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">Carry forward: {type.carryForward}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{type.days}</p>
                      <p className="text-[10px] text-slate-500">days/year</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Approval chain: {type.requiresApproval}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={panel}>
            <h2 className="text-sm font-bold text-slate-900">Employee leave balances</h2>
            <div className="mt-3 space-y-2">
              {employeesData.slice(0, 3).map((employee) => {
                const annual = employee.leaveBalance?.find((balance) => balance.type === 'Annual Leave');
                return (
                  <Link
                    key={employee.id}
                    to={`/hr/employee-profile/${employee.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 no-underline hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{employee.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{employee.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{annual?.available ?? 0} days</p>
                      <p className="text-[10px] text-slate-500">Annual leave available</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
