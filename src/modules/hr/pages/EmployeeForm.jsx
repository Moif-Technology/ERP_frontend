import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';

export default function EmployeeForm() {
  const primary = colors.primary?.main || '#790728';
  const [form, setForm] = useState({
    employeeCode: '',
    employeeName: '',
    shiftType: '',
    shiftId: '',
    designation: '',
    department: '',
    dateOfJoining: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    mobileNo: '',
    email: '',
    addressLine1: '',
    emiratesIdNo: '',
    passportNo: '',
  });

  const genders = useMemo(() => ['Male', 'Female'], []);
  const departments = useMemo(() => ['HR', 'IT', 'Finance', 'Operations', 'Sales'], []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    console.log('Employee entry save', form);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 mx-3">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        EMPLOYEE ENTRY 
      </h1>

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
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
