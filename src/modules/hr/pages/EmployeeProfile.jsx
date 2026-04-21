import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import DocumentUpload from '../components/DocumentUpload';
import { StatusBadge } from '../../../shared/components/ui';

export default function EmployeeProfile() {
  const { id } = useParams();
  const primary = colors.primary?.main || '#790728';
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'pay', label: 'Pay Setup' },
    { id: 'docs', label: 'Documents' },
    { id: 'shifts', label: 'Shifts' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'loans', label: 'Loans' },
  ];

  const [documents, setDocuments] = useState([
    { id: 'doc1', type: 'Passport', title: 'Passport Copy', expiryDate: '2028-10-15', status: 'Valid' },
    { id: 'doc2', type: 'Visa', title: 'UAE Resident Visa', expiryDate: '2026-05-10', status: 'Expiring Soon' },
  ]);

  const handleDocumentUpload = ({ file, metadata }) => {
    const newDoc = {
      id: `doc${documents.length + 1}`,
      type: metadata.documentTypeId || 'Unknown',
      title: metadata.title || file.name,
      expiryDate: metadata.expiryDate || 'N/A',
      status: 'Valid',
    };
    setDocuments([newDoc, ...documents]);
  };

  return (
    <div className="flex flex-col h-full w-[calc(100%+26px)] max-w-none -mx-[13px] bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
          JD
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">John Doe</h1>
          <p className="text-sm text-gray-500">EMP-001 • Software Engineer • IT Department</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status="Active" />
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto bg-white">
        {activeTab === 'info' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="block text-gray-500 text-xs">Date of Birth</span>
                <span className="font-medium text-gray-900">15 Jan 1990</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Gender</span>
                <span className="font-medium text-gray-900">Male</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Nationality</span>
                <span className="font-medium text-gray-900">UAE</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Mobile Number</span>
                <span className="font-medium text-gray-900">0501234567</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Email</span>
                <span className="font-medium text-gray-900">john.doe@company.com</span>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Employment Details</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="block text-gray-500 text-xs">Date of Joining</span>
                <span className="font-medium text-gray-900">01 Mar 2023</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Current Shift</span>
                <span className="font-medium text-gray-900">Regular (09:00 - 18:00)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div>
            <DocumentUpload onUpload={handleDocumentUpload} />
            
            <h3 className="text-sm font-bold text-gray-800 mb-3 mt-6">Uploaded Documents</h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-[11px] text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Document Type</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Expiry Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No documents uploaded yet.</td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{doc.type}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                          {doc.title}
                        </td>
                        <td className="px-4 py-3">{doc.expiryDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${doc.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">View</button>
                          <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab !== 'info' && activeTab !== 'docs' && (
          <div className="h-full flex items-center justify-center text-gray-400">
            {tabs.find(t => t.id === activeTab)?.label} section under construction
          </div>
        )}
      </div>
    </div>
  );
}
