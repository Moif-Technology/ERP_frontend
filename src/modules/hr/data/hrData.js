export const hrStats = {
  totalEmployees: 148,
  activeEmployees: 139,
  onLeaveToday: 7,
  openRequests: 11,
  expiringDocuments: 5,
  attendanceAlerts: 9,
};

export const employees = [
  {
    id: '1',
    code: 'EMP-001',
    name: 'John Doe',
    designation: 'Software Engineer',
    department: 'IT',
    mobile: '0501234567',
    email: 'john.doe@company.com',
    status: 'Active',
    gender: 'Male',
    nationality: 'UAE',
    manager: 'Sarah Johnson',
    location: 'Dubai HQ',
    joiningDate: '2023-03-01',
    dob: '1990-01-15',
    shiftName: 'General Shift',
    shiftTime: '09:00 - 18:00',
    employmentType: 'Full Time',
    leavePolicy: 'Standard Annual Leave',
    payrollGroup: 'Monthly Staff',
    basicSalary: 'AED 8,500',
    bankAccount: 'WPS - ENBD',
    address: 'Al Nahda, Dubai',
    documents: [
      { id: 'doc1', type: 'Passport', title: 'Passport Copy', expiryDate: '2028-10-15', status: 'Valid' },
      { id: 'doc2', type: 'Visa', title: 'UAE Resident Visa', expiryDate: '2026-05-10', status: 'Expiring Soon' },
    ],
    leaveBalance: [
      { type: 'Annual Leave', available: 18, booked: 4, carriedForward: 3 },
      { type: 'Sick Leave', available: 9, booked: 1, carriedForward: 0 },
    ],
    attendance: [
      { date: '2026-04-28', shift: 'General Shift', checkIn: '09:06', checkOut: '18:14', status: 'Present' },
      { date: '2026-04-27', shift: 'General Shift', checkIn: '09:18', checkOut: '18:05', status: 'Late In' },
      { date: '2026-04-26', shift: 'General Shift', checkIn: '09:01', checkOut: '18:02', status: 'Present' },
    ],
    loans: [
      { id: 'loan-1', type: 'Salary Advance', amount: 'AED 2,000', balance: 'AED 800', deduction: 'AED 400 / month', status: 'Running' },
    ],
  },
  {
    id: '2',
    code: 'EMP-002',
    name: 'Jane Smith',
    designation: 'HR Manager',
    department: 'HR',
    mobile: '0509876543',
    email: 'jane.smith@company.com',
    status: 'Active',
    gender: 'Female',
    nationality: 'India',
    manager: 'Operations Director',
    location: 'Dubai HQ',
    joiningDate: '2022-08-18',
    dob: '1989-06-02',
    shiftName: 'General Shift',
    shiftTime: '09:00 - 18:00',
    employmentType: 'Full Time',
    leavePolicy: 'Managerial Leave',
    payrollGroup: 'Monthly Staff',
    basicSalary: 'AED 12,400',
    bankAccount: 'WPS - ADCB',
    address: 'Al Qusais, Dubai',
    documents: [
      { id: 'doc3', type: 'Passport', title: 'Passport Copy', expiryDate: '2026-11-02', status: 'Expiring Soon' },
      { id: 'doc4', type: 'Emirates ID', title: 'EID Front & Back', expiryDate: '2027-12-12', status: 'Valid' },
    ],
    leaveBalance: [
      { type: 'Annual Leave', available: 22, booked: 2, carriedForward: 4 },
      { type: 'Sick Leave', available: 10, booked: 0, carriedForward: 0 },
    ],
    attendance: [
      { date: '2026-04-28', shift: 'General Shift', checkIn: '08:55', checkOut: '18:21', status: 'Present' },
      { date: '2026-04-27', shift: 'General Shift', checkIn: '09:02', checkOut: '18:07', status: 'Present' },
      { date: '2026-04-26', shift: 'General Shift', checkIn: '08:58', checkOut: '18:00', status: 'Present' },
    ],
    loans: [],
  },
  {
    id: '3',
    code: 'EMP-003',
    name: 'Ali Khan',
    designation: 'Accountant',
    department: 'Finance',
    mobile: '0561112222',
    email: 'ali.khan@company.com',
    status: 'Inactive',
    gender: 'Male',
    nationality: 'Pakistan',
    manager: 'Finance Manager',
    location: 'Sharjah Branch',
    joiningDate: '2021-12-11',
    dob: '1992-03-21',
    shiftName: 'Flexible Shift',
    shiftTime: '08:30 - 17:30',
    employmentType: 'Full Time',
    leavePolicy: 'Standard Annual Leave',
    payrollGroup: 'Monthly Staff',
    basicSalary: 'AED 6,900',
    bankAccount: 'WPS - FAB',
    address: 'Al Majaz, Sharjah',
    documents: [
      { id: 'doc5', type: 'Visa', title: 'Visa Copy', expiryDate: '2026-06-15', status: 'Expiring Soon' },
    ],
    leaveBalance: [
      { type: 'Annual Leave', available: 6, booked: 18, carriedForward: 0 },
      { type: 'Sick Leave', available: 8, booked: 2, carriedForward: 0 },
    ],
    attendance: [
      { date: '2026-04-28', shift: 'Flexible Shift', checkIn: '-', checkOut: '-', status: 'Inactive' },
      { date: '2026-04-27', shift: 'Flexible Shift', checkIn: '08:44', checkOut: '17:29', status: 'Present' },
      { date: '2026-04-26', shift: 'Flexible Shift', checkIn: '08:59', checkOut: '17:12', status: 'Early Out' },
    ],
    loans: [],
  },
  {
    id: '4',
    code: 'EMP-004',
    name: 'Mariam Yusuf',
    designation: 'Store Supervisor',
    department: 'Operations',
    mobile: '0553128890',
    email: 'mariam.yusuf@company.com',
    status: 'Active',
    gender: 'Female',
    nationality: 'UAE',
    manager: 'Operations Manager',
    location: 'Ajman Warehouse',
    joiningDate: '2024-01-08',
    dob: '1994-09-10',
    shiftName: 'Morning Shift',
    shiftTime: '07:30 - 16:30',
    employmentType: 'Full Time',
    leavePolicy: 'Operations Leave',
    payrollGroup: 'Monthly Staff',
    basicSalary: 'AED 7,300',
    bankAccount: 'WPS - Mashreq',
    address: 'Al Jurf, Ajman',
    documents: [
      { id: 'doc6', type: 'Contract', title: 'Employment Contract', expiryDate: '2027-01-07', status: 'Valid' },
    ],
    leaveBalance: [
      { type: 'Annual Leave', available: 15, booked: 5, carriedForward: 1 },
      { type: 'Emergency Leave', available: 2, booked: 0, carriedForward: 0 },
    ],
    attendance: [
      { date: '2026-04-28', shift: 'Morning Shift', checkIn: '07:25', checkOut: '16:38', status: 'Present' },
      { date: '2026-04-27', shift: 'Morning Shift', checkIn: '07:42', checkOut: '16:27', status: 'Late In' },
    ],
    loans: [
      { id: 'loan-2', type: 'Medical Advance', amount: 'AED 3,500', balance: 'AED 2,000', deduction: 'AED 500 / month', status: 'Running' },
    ],
  },
];

export const leaveRequests = [
  { id: 'LV-1001', employeeId: '4', employeeName: 'Mariam Yusuf', type: 'Annual Leave', from: '2026-05-03', to: '2026-05-08', days: 6, status: 'Pending Approval', relief: 'Afsal P' },
  { id: 'LV-1002', employeeId: '1', employeeName: 'John Doe', type: 'Work From Home', from: '2026-04-30', to: '2026-04-30', days: 1, status: 'Approved', relief: 'N/A' },
  { id: 'LV-1003', employeeId: '2', employeeName: 'Jane Smith', type: 'Business Travel', from: '2026-05-12', to: '2026-05-14', days: 3, status: 'Pending HR Review', relief: 'N/A' },
  { id: 'LV-1004', employeeId: '3', employeeName: 'Ali Khan', type: 'Sick Leave', from: '2026-04-24', to: '2026-04-25', days: 2, status: 'Closed', relief: 'N/A' },
];

export const attendanceRecords = [
  { employeeId: '1', employeeName: 'John Doe', department: 'IT', shift: 'General Shift', checkIn: '09:18', checkOut: '18:05', overtime: '00:00', status: 'Late In' },
  { employeeId: '2', employeeName: 'Jane Smith', department: 'HR', shift: 'General Shift', checkIn: '08:55', checkOut: '18:21', overtime: '00:21', status: 'Present' },
  { employeeId: '4', employeeName: 'Mariam Yusuf', department: 'Operations', shift: 'Morning Shift', checkIn: '07:42', checkOut: '16:27', overtime: '00:00', status: 'Late In' },
  { employeeId: '7', employeeName: 'Ahmed R', department: 'Sales', shift: 'Field Shift', checkIn: '-', checkOut: '-', overtime: '00:00', status: 'Absent' },
  { employeeId: '9', employeeName: 'Rashid N', department: 'Warehouse', shift: 'Night Shift', checkIn: '22:01', checkOut: '06:12', overtime: '00:12', status: 'Present' },
];

export const shiftTemplates = [
  { name: 'General Shift', type: 'Regular', time: '09:00 - 18:00', workHours: '8h', grace: '15m', overtime: 'After 30m' },
  { name: 'Morning Shift', type: 'Regular', time: '07:30 - 16:30', workHours: '8h', grace: '10m', overtime: 'After 20m' },
  { name: 'Night Shift', type: 'Night', time: '22:00 - 06:00', workHours: '8h', grace: '10m', overtime: 'After 15m' },
];

export const leaveTypes = [
  { name: 'Annual Leave', days: 30, carryForward: 'Yes', requiresApproval: 'Manager + HR' },
  { name: 'Sick Leave', days: 12, carryForward: 'No', requiresApproval: 'Manager' },
  { name: 'Emergency Leave', days: 3, carryForward: 'No', requiresApproval: 'HR' },
  { name: 'Business Travel', days: 0, carryForward: 'No', requiresApproval: 'Department Head' },
];

export const documentTypes = [
  { name: 'Passport', required: 'Yes', reminderDays: 30, allowed: 'pdf,jpg,png' },
  { name: 'Visa', required: 'Yes', reminderDays: 45, allowed: 'pdf,jpg,png' },
  { name: 'Emirates ID', required: 'Yes', reminderDays: 30, allowed: 'pdf,jpg,png' },
  { name: 'Contract', required: 'Optional', reminderDays: 15, allowed: 'pdf,docx' },
];

export const documentAlerts = [
  { id: 'a1', employeeName: 'John Doe', type: 'Visa', expiryDate: '2026-05-10', daysLeft: 12, severity: 'High' },
  { id: 'a2', employeeName: 'Jane Smith', type: 'Passport', expiryDate: '2026-11-02', daysLeft: 188, severity: 'Medium' },
  { id: 'a3', employeeName: 'Ali Khan', type: 'Visa', expiryDate: '2026-06-15', daysLeft: 48, severity: 'High' },
];

export const quickFlow = [
  'Create shift, leave, and document masters.',
  'Register employee and assign department, reporting manager, shift, and payroll group.',
  'Upload statutory documents and monitor expiry reminders.',
  'Track daily attendance exceptions and overtime.',
  'Process leave requests and update balances.',
  'Review employee profile for pay setup, attendance history, and compliance.',
];

export function getEmployeeById(id) {
  return employees.find((employee) => employee.id === id) || employees[0];
}
