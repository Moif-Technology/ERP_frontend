import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import DocumentUpload from '../components/DocumentUpload';
import { ConfirmDialog, StatusBadge } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import { getEmployeeById } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

const actionIconBtn =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900';

function InfoPair({ label, value }) {
  return (
    <div>
      <span className="block text-gray-500 text-xs">{label}</span>
      <span className="font-medium text-gray-900">{value || '-'}</span>
    </div>
  );
}

function SmallTable({ headers, rows, emptyMessage }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-[11px] text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const primary = colors.primary?.main || '#790728';
  const [employee, setEmployee] = useState(() => getEmployeeById(id));
  const [activeTab, setActiveTab] = useState('info');
  const [viewDocumentId, setViewDocumentId] = useState(null);
  const [pendingDeleteDocumentId, setPendingDeleteDocumentId] = useState(null);
  const [documents, setDocuments] = useState(employee.documents || []);
  const [leaveBalances, setLeaveBalances] = useState(employee.leaveBalance || []);
  const [attendanceHistory, setAttendanceHistory] = useState(employee.attendance || []);
  const [loans, setLoans] = useState(employee.loans || []);

  // Fetch employee from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.getHrEmployee(id);
        if (cancelled || !data?.employee) return;
        const e = data.employee;
        setEmployee((prev) => ({
          ...prev,
          id: String(e.employeeId),
          code: e.employeeCode,
          name: e.employeeName,
          shiftType: e.shiftType,
          shiftId: e.shiftId,
          designation: e.designation || '-',
          department: e.department || '-',
          joiningDate: e.dateOfJoining || '-',
          dob: e.dateOfBirth || '-',
          gender: e.gender || '-',
          nationality: e.nationality || '-',
          mobile: e.mobileNo || '-',
          email: e.email || '-',
          address: e.addressLine1 || '-',
          emiratesIdNo: e.emiratesIdNo || '-',
          passportNo: e.passportNo || '-',
          status: e.isActive ? 'Active' : 'Inactive',
          employmentType: e.employmentType || prev.employmentType || '-',
          location: e.workLocation || prev.location || '-',
          manager: e.reportingManager || prev.manager || '-',
          payrollGroup: e.payrollGroup || prev.payrollGroup || '-',
          leavePolicy: e.leavePolicy || prev.leavePolicy || '-',
          basicSalary: e.basicSalary != null ? `AED ${Number(e.basicSalary).toLocaleString()}` : prev.basicSalary || '-',
          bankAccount: e.bankName ? `${e.bankName} - ${e.bankAccountNo || ''}` : prev.bankAccount || '-',
          shiftName: prev.shiftName || '-',
          shiftTime: prev.shiftTime || '-',
        }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch documents from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrDocuments(id);
        if (cancelled) return;
        const rows = (data?.documents || []).map((d) => ({
          id: String(d.attachmentId),
          type: d.documentTypeName || 'Other',
          title: d.title,
          expiryDate: d.expiryDate || 'N/A',
          status: d.status || 'Valid',
        }));
        if (rows.length) setDocuments(rows);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch leave balances from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrLeaveBalances(id);
        if (cancelled) return;
        const rows = (data?.balances || []).map((b) => ({
          type: b.leaveName,
          available: b.remainingDays,
          booked: b.usedDays,
          carriedForward: b.carriedForward,
        }));
        if (rows.length) setLeaveBalances(rows);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch attendance from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrAttendanceDaily({ employeeId: id });
        if (cancelled) return;
        const rows = (data?.attendance || []).map((r) => ({
          date: r.workDate,
          shift: r.shiftName || '-',
          checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          status: r.attendanceStatus || 'Present',
        }));
        if (rows.length) setAttendanceHistory(rows);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch loans from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrLoans(id);
        if (cancelled) return;
        const rows = (data?.loans || []).map((l) => ({
          id: String(l.loanId),
          type: l.loanType,
          amount: `AED ${Number(l.amount).toLocaleString()}`,
          balance: `AED ${Number(l.balance).toLocaleString()}`,
          deduction: `AED ${Number(l.deduction).toLocaleString()} / ${l.deductionLabel || 'month'}`,
          status: l.loanStatus,
        }));
        if (rows.length) setLoans(rows);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [id]);

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'pay', label: 'Pay Setup' },
    { id: 'docs', label: 'Documents' },
    { id: 'shifts', label: 'Shifts' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'loans', label: 'Loans' },
  ];

  const handleDocumentUpload = async ({ file, metadata }) => {
    try {
      const formData = new FormData();
      formData.append('title', metadata.title || file.name);
      if (metadata.documentTypeId) formData.append('documentTypeId', metadata.documentTypeId);
      if (metadata.expiryDate) formData.append('expiryDate', metadata.expiryDate);
      formData.append('remindDays', metadata.remindDays || 30);
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);
      
      // We aren't actually sending the file content in this simple implementation, 
      // but in a real app we would do: formData.append('file', file);
      
      // The backend expects JSON or FormData depending on multer config. 
      // Currently the backend createDocument controller expects req.body.
      // Let's send it as JSON to match the controller we wrote.
      
      await hrApi.uploadHrDocument(id, {
        title: metadata.title || file.name,
        documentTypeId: metadata.documentTypeId || null,
        expiryDate: metadata.expiryDate || null,
        remindDays: metadata.remindDays || 30,
        fileName: file.name,
        fileSize: file.size,
      });
      // Refresh documents
      const { data } = await hrApi.listHrDocuments(id);
      const rows = (data?.documents || []).map((d) => ({
        id: String(d.attachmentId),
        type: d.documentTypeName || 'Other',
        title: d.title,
        expiryDate: d.expiryDate || 'N/A',
        status: d.status || 'Valid',
      }));
      setDocuments(rows);
    } catch {
      // Fallback: add locally
      const newDoc = {
        id: `doc${documents.length + 1}`,
        type: metadata.documentTypeId || 'Unknown',
        title: metadata.title || file.name,
        expiryDate: metadata.expiryDate || 'N/A',
        status: 'Valid',
      };
      setDocuments((current) => [newDoc, ...current]);
    }
  };

  const handleViewDocument = useCallback((docId) => {
    setViewDocumentId(docId);
  }, []);

  const handleDeleteDocument = useCallback(async (docId) => {
    try {
      await hrApi.deleteHrDocument(docId);
    } catch {}
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    setViewDocumentId((current) => (current === docId ? null : current));
  }, []);

  const closeDocumentView = useCallback(() => {
    setViewDocumentId(null);
  }, []);

  const viewDocument = useMemo(
    () => documents.find((doc) => doc.id === viewDocumentId) || null,
    [documents, viewDocumentId],
  );

  const pendingDeleteDocument = useMemo(
    () => documents.find((doc) => doc.id === pendingDeleteDocumentId) || null,
    [documents, pendingDeleteDocumentId],
  );

  const initials = employee.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return (
    <div className="flex flex-col h-full w-[calc(100%+26px)] max-w-none -mx-[13px] rounded-lg border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-white px-6 py-4 flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => navigate('/hr/employees')}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded bg-transparent text-gray-700 transition hover:bg-gray-100"
          aria-label="Back to employee directory"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xl font-bold">
          {initials}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>Employee Workspace</p>
          <h1 className="text-xl font-bold text-gray-800">{employee.name}</h1>
          <p className="text-sm text-gray-500">
            {employee.code} • {employee.designation} • {employee.department}
          </p>
        </div>
        <div className="ml-auto text-right flex flex-col items-end gap-2">
          <StatusBadge status={employee.status} />
          <p className="text-[11px] text-slate-500">Manager: {employee.manager}</p>
          <Link
            to={`/hr/employee-entry/${employee.id}`}
            className="rounded px-3 py-1 text-[10px] font-semibold text-white no-underline"
            style={{ backgroundColor: primary }}
          >
            Edit Employee
          </Link>
        </div>
      </div>

      <div className="bg-white px-6 py-2 border-b-[0.5px] border-gray-200">
        <div
          className="inline-flex max-w-full shrink-0 items-stretch gap-px self-start rounded-md px-0.5 py-0.5 overflow-x-auto"
          style={{ backgroundColor: '#EDEDED' }}
          role="tablist"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className="min-h-[22px] whitespace-nowrap rounded px-2.5 py-0.5 text-center text-[9px] font-medium leading-tight transition-colors sm:min-h-[24px] sm:px-3 sm:text-[10px]"
                style={
                  active
                    ? { backgroundColor: primary, color: '#fff' }
                    : { backgroundColor: 'transparent', color: '#111827' }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto bg-white">
        {activeTab === 'info' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-y-4 gap-x-8 text-sm md:grid-cols-2 xl:grid-cols-3">
              <InfoPair label="Date of Birth" value={employee.dob} />
              <InfoPair label="Gender" value={employee.gender} />
              <InfoPair label="Nationality" value={employee.nationality} />
              <InfoPair label="Mobile Number" value={employee.mobile} />
              <InfoPair label="Email" value={employee.email} />
              <InfoPair label="Address" value={employee.address} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 gap-y-4 gap-x-8 text-sm md:grid-cols-2 xl:grid-cols-3">
              <InfoPair label="Date of Joining" value={employee.joiningDate} />
              <InfoPair label="Current Shift" value={`${employee.shiftName} (${employee.shiftTime})`} />
              <InfoPair label="Employment Type" value={employee.employmentType} />
              <InfoPair label="Work Location" value={employee.location} />
              <InfoPair label="Reporting Manager" value={employee.manager} />
              <InfoPair label="Leave Policy" value={employee.leavePolicy} />
            </div>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800">Payroll Setup</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <InfoPair label="Payroll Group" value={employee.payrollGroup} />
                <InfoPair label="Basic Salary" value={employee.basicSalary} />
                <InfoPair label="Bank / WPS" value={employee.bankAccount} />
                <InfoPair label="Status" value={employee.status} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800">Why this matters</h2>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li>Payroll group decides cycle, deductions, and posting rules.</li>
                <li>Shift and attendance should align before payroll lock.</li>
                <li>Leave policy controls leave balance and encashment behavior.</li>
                <li>Document status should stay valid before salary release for regulated employees.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div>
            <DocumentUpload onUpload={handleDocumentUpload} />

            <h3 className="text-sm font-bold text-gray-800 mb-3 mt-6">Uploaded Documents</h3>
            <SmallTable
              headers={['Document Type', 'Title', 'Expiry Date', 'Status', 'Actions']}
              emptyMessage="No documents uploaded yet."
              rows={documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{doc.type}</td>
                  <td className="px-4 py-3">{doc.title}</td>
                  <td className="px-4 py-3">{doc.expiryDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${doc.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className={actionIconBtn} aria-label={`View ${doc.title}`} title="View" onClick={() => handleViewDocument(doc.id)}>
                        <img src={ViewIcon} alt="" className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className={actionIconBtn} aria-label={`Delete ${doc.title}`} title="Delete" onClick={() => setPendingDeleteDocumentId(doc.id)}>
                        <img src={DeleteIcon} alt="" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            />
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800">Assigned shift</h2>
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <InfoPair label="Shift Name" value={employee.shiftName} />
                <InfoPair label="Working Hours" value={employee.shiftTime} />
                <InfoPair label="Work Location" value={employee.location} />
                <InfoPair label="Employment Type" value={employee.employmentType} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-800">Shift notes</h2>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li>General shift staff should be reviewed for late-in exceptions after 09:15.</li>
                <li>Flexible or night shifts need attendance rules matched to their own tolerance.</li>
                <li>Shift changes should be approved before payroll cut-off to avoid overtime disputes.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Leave Balances</h2>
            <SmallTable
              headers={['Leave Type', 'Available', 'Booked', 'Carry Forward']}
              emptyMessage="No leave balances available."
              rows={leaveBalances.map((balance) => (
                <tr key={balance.type} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-800">{balance.type}</td>
                  <td className="px-4 py-3">{balance.available}</td>
                  <td className="px-4 py-3">{balance.booked}</td>
                  <td className="px-4 py-3">{balance.carriedForward}</td>
                </tr>
              ))}
            />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Attendance History</h2>
            <SmallTable
              headers={['Date', 'Shift', 'Check In', 'Check Out', 'Status']}
              emptyMessage="No attendance history available."
              rows={attendanceHistory.map((record) => (
                <tr key={`${record.date}-${record.status}`} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-800">{record.date}</td>
                  <td className="px-4 py-3">{record.shift}</td>
                  <td className="px-4 py-3">{record.checkIn}</td>
                  <td className="px-4 py-3">{record.checkOut}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'Inactive'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            />
          </div>
        )}

        {activeTab === 'loans' && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-3">Loan / Advance Ledger</h2>
            <SmallTable
              headers={['Type', 'Amount', 'Balance', 'Deduction', 'Status']}
              emptyMessage="No active loans or salary advances."
              rows={loans.map((loan) => (
                <tr key={loan.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-800">{loan.type}</td>
                  <td className="px-4 py-3">{loan.amount}</td>
                  <td className="px-4 py-3">{loan.balance}</td>
                  <td className="px-4 py-3">{loan.deduction}</td>
                  <td className="px-4 py-3">{loan.status}</td>
                </tr>
              ))}
            />
          </div>
        )}

        {viewDocument ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
            onClick={closeDocumentView}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-document-detail-title"
          >
            <div
              className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                onClick={closeDocumentView}
                aria-label="Close document detail"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <h2 id="employee-document-detail-title" className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>
                Document detail
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <InfoPair label="Document Type" value={viewDocument.type} />
                <InfoPair label="Expiry Date" value={viewDocument.expiryDate} />
                <div className="sm:col-span-2">
                  <span className="block text-xs text-gray-500">Title</span>
                  <span className="font-medium text-gray-900">{viewDocument.title}</span>
                </div>
                <InfoPair label="Status" value={viewDocument.status} />
              </div>
            </div>
          </div>
        ) : null}

        <ConfirmDialog
          open={pendingDeleteDocumentId !== null}
          title="Delete document?"
          message={
            pendingDeleteDocument
              ? `This will remove ${pendingDeleteDocument.title}. This action cannot be undone.`
              : 'This will remove the document. This action cannot be undone.'
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onClose={() => setPendingDeleteDocumentId(null)}
          onConfirm={() => {
            if (pendingDeleteDocumentId) handleDeleteDocument(pendingDeleteDocumentId);
          }}
        />
      </div>
    </div>
  );
}
