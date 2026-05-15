import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';
import { leaveTypes as fallbackLeaveTypes, shiftTemplates as fallbackShifts } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

export default function EmployeeForm() {
  const primary = colors.primary?.main || '#790728';
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [error, setError] = useState('');
  const [apiShifts, setApiShifts] = useState([]);
  const [apiLeaveTypes, setApiLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    employeeCode: '',
    employeeName: '',
    shiftName: '',
    designation: '',
    department: '',
    reportingManager: '',
    employmentType: '',
    workLocation: '',
    dateOfJoining: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    mobileNo: '',
    email: '',
    addressLine1: '',
    emiratesIdNo: '',
    passportNo: '',
    payrollGroup: '',
    leavePolicy: '',
    basicSalary: '',
    bankName: '',
    bankAccountNo: '',
  });

  const genders = useMemo(() => ['Male', 'Female'], []);
  const departments = useMemo(() => ['HR', 'IT', 'Finance', 'Operations', 'Sales'], []);
  const employmentTypes = useMemo(() => ['Full Time', 'Part Time', 'Contract', 'Probation'], []);
  const workLocations = useMemo(() => ['Dubai HQ', 'Sharjah Branch', 'Ajman Warehouse', 'Remote'], []);
  const payrollGroups = useMemo(() => ['Monthly Staff', 'Weekly Wages', 'Management Payroll'], []);
  const shiftOptions = useMemo(
    () => apiShifts.length ? apiShifts.map((s) => s.shiftName) : fallbackShifts.map((s) => s.name),
    [apiShifts],
  );
  const leavePolicyOptions = useMemo(
    () => apiLeaveTypes.length ? apiLeaveTypes.map((t) => t.leaveName) : fallbackLeaveTypes.map((t) => t.name),
    [apiLeaveTypes],
  );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Fetch shifts, leave types, and (if editing) existing employee
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: shiftsData }, { data: ltData }] = await Promise.all([
          hrApi.listHrShifts(),
          hrApi.listHrLeaveTypes(),
        ]);
        if (cancelled) return;
        if (shiftsData?.shifts?.length) setApiShifts(shiftsData.shifts);
        if (ltData?.leaveTypes?.length) setApiLeaveTypes(ltData.leaveTypes);

        if (editId) {
          const { data: empData } = await hrApi.getHrEmployee(editId);
          if (cancelled) return;
          const e = empData?.employee;
          if (e) {
            setForm({
              employeeCode: e.employeeCode || '',
              employeeName: e.employeeName || '',
              shiftName: e.shiftName || '',
              designation: e.designation || '',
              department: e.department || '',
              reportingManager: e.reportingManager || '',
              employmentType: e.employmentType || '',
              workLocation: e.workLocation || '',
              dateOfJoining: e.dateOfJoining || '',
              dateOfBirth: e.dateOfBirth || '',
              gender: e.gender || '',
              nationality: e.nationality || '',
              mobileNo: e.mobileNo || '',
              email: e.email || '',
              addressLine1: e.addressLine1 || '',
              emiratesIdNo: e.emiratesIdNo || '',
              passportNo: e.passportNo || '',
              payrollGroup: e.payrollGroup || '',
              leavePolicy: e.leavePolicy || '',
              basicSalary: e.basicSalary != null ? String(e.basicSalary) : '',
              bankName: e.bankName || '',
              bankAccountNo: e.bankAccountNo || '',
            });
          }
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [editId]);

  const handleSave = async () => {
    setError('');
    if (!form.employeeName.trim()) {
      setError('Employee name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        employeeCode: form.employeeCode || undefined,
        employeeName: form.employeeName,
        shiftType: form.shiftName ? 'Regular' : 'Regular',
        designation: form.designation || undefined,
        department: form.department || undefined,
        dateOfJoining: form.dateOfJoining || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        nationality: form.nationality || undefined,
        mobileNo: form.mobileNo || undefined,
        email: form.email || undefined,
        addressLine1: form.addressLine1 || undefined,
        emiratesIdNo: form.emiratesIdNo || undefined,
        passportNo: form.passportNo || undefined,
        employmentType: form.employmentType || undefined,
        workLocation: form.workLocation || undefined,
        reportingManager: form.reportingManager || undefined,
        payrollGroup: form.payrollGroup || undefined,
        leavePolicy: form.leavePolicy || undefined,
        basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
        bankName: form.bankName || undefined,
        bankAccountNo: form.bankAccountNo || undefined,
      };
      if (editId) {
        await hrApi.updateHrEmployee(editId, payload);
      } else {
        await hrApi.createHrEmployee(payload);
      }
      navigate('/hr/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save employee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="box-border w-[calc(100%+26px)] max-w-none -mx-[13px] rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>Human Resources</p>
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        {editId ? 'EDIT EMPLOYEE' : 'EMPLOYEE ENTRY'}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        A practical ERP employee screen should capture identity, assignment, payroll, and leave policy in one pass.
      </p>

      <div className="mt-3 flex justify-center">
        <div className="w-full max-w-4xl p-3 sm:p-4">
          <h2 className="font-semibold text-gray-700 border-b pb-1 mb-3 text-sm">Personal Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
            <InputField label="Employee name" fullWidth value={form.employeeName} onChange={(e) => update('employeeName', e.target.value)} />
            <InputField label="Date of Birth" type="date" fullWidth value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
            <DropdownInput label="Gender" fullWidth value={form.gender} onChange={(v) => update('gender', v)} options={genders} placeholder="Select" />
            <InputField label="Nationality" fullWidth value={form.nationality} onChange={(e) => update('nationality', e.target.value)} />
            <InputField label="Emirates ID No" fullWidth value={form.emiratesIdNo} onChange={(e) => update('emiratesIdNo', e.target.value)} />
            <InputField label="Passport No" fullWidth value={form.passportNo} onChange={(e) => update('passportNo', e.target.value)} />
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-1 mb-3 text-sm">Employment Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
            <InputField label="Employee code" fullWidth value={form.employeeCode} onChange={(e) => update('employeeCode', e.target.value)} />
            <InputField label="Date of Joining" type="date" fullWidth value={form.dateOfJoining} onChange={(e) => update('dateOfJoining', e.target.value)} />
            <InputField label="Designation" fullWidth value={form.designation} onChange={(e) => update('designation', e.target.value)} />
            <DropdownInput label="Department" fullWidth value={form.department} onChange={(v) => update('department', v)} options={departments} placeholder="Select" />
            <DropdownInput label="Shift" fullWidth value={form.shiftName} onChange={(v) => update('shiftName', v)} options={shiftOptions} placeholder="Assign shift" />
            <DropdownInput label="Employment Type" fullWidth value={form.employmentType} onChange={(v) => update('employmentType', v)} options={employmentTypes} placeholder="Select type" />
            <InputField label="Reporting Manager" fullWidth value={form.reportingManager} onChange={(e) => update('reportingManager', e.target.value)} />
            <DropdownInput label="Work Location" fullWidth value={form.workLocation} onChange={(v) => update('workLocation', v)} options={workLocations} placeholder="Select location" />
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-1 mb-3 text-sm">Payroll and Policy</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
            <DropdownInput label="Payroll Group" fullWidth value={form.payrollGroup} onChange={(v) => update('payrollGroup', v)} options={payrollGroups} placeholder="Select payroll" />
            <DropdownInput label="Leave Policy" fullWidth value={form.leavePolicy} onChange={(v) => update('leavePolicy', v)} options={leavePolicyOptions} placeholder="Select leave policy" />
            <InputField label="Basic Salary" fullWidth value={form.basicSalary} onChange={(e) => update('basicSalary', e.target.value)} />
            <InputField label="Bank Name" fullWidth value={form.bankName} onChange={(e) => update('bankName', e.target.value)} />
            <InputField label="Bank Account No" fullWidth value={form.bankAccountNo} onChange={(e) => update('bankAccountNo', e.target.value)} />
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-1 mb-3 text-sm">Contact Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InputField label="Mobile no" fullWidth value={form.mobileNo} onChange={(e) => update('mobileNo', e.target.value)} />
            <InputField label="Email" type="email" fullWidth value={form.email} onChange={(e) => update('email', e.target.value)} />
            <div className="flex flex-col gap-0.5 min-w-0 w-full sm:col-span-3">
              <label className="text-[9px] leading-tight text-black sm:text-[11px]">Address</label>
              <textarea
                value={form.addressLine1}
                onChange={(e) => update('addressLine1', e.target.value)}
                rows={2}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px] outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            {error ? <p className="mr-3 self-center text-xs text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving...' : editId ? 'Update Employee' : 'Save Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
