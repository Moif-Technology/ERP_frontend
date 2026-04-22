import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import DocumentUpload from '../components/DocumentUpload';
import { ConfirmDialog, StatusBadge } from '../../../shared/components/ui';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';

const actionIconBtn =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const primary = colors.primary?.main || '#790728';
  const [activeTab, setActiveTab] = useState('info');
  const [viewDocumentId, setViewDocumentId] = useState(null);
  const [pendingDeleteDocumentId, setPendingDeleteDocumentId] = useState(null);

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

  const handleViewDocument = useCallback((docId) => {
    setViewDocumentId(docId);
  }, []);

  const handleDeleteDocument = useCallback((docId) => {
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

  return (
    <div className="flex flex-col h-full w-[calc(100%+26px)] max-w-none -mx-[13px] rounded-lg border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
      {/* Header */}
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className={actionIconBtn}
                              aria-label={`View ${doc.title}`}
                              title="View"
                              onClick={() => handleViewDocument(doc.id)}
                            >
                              <img src={ViewIcon} alt="" className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className={actionIconBtn}
                              aria-label={`Delete ${doc.title}`}
                              title="Delete"
                              onClick={() => setPendingDeleteDocumentId(doc.id)}
                            >
                              <img src={DeleteIcon} alt="" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
              <h2
                id="employee-document-detail-title"
                className="pr-10 text-sm font-bold sm:text-base"
                style={{ color: primary }}
              >
                Document detail
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="block text-xs text-gray-500">Document Type</span>
                  <span className="font-medium text-gray-900">{viewDocument.type}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Expiry Date</span>
                  <span className="font-medium text-gray-900">{viewDocument.expiryDate}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs text-gray-500">Title</span>
                  <span className="font-medium text-gray-900">{viewDocument.title}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">{viewDocument.status}</span>
                </div>
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
        
        {activeTab !== 'info' && activeTab !== 'docs' && (
          <div className="h-full flex items-center justify-center text-gray-400">
            {tabs.find(t => t.id === activeTab)?.label} section under construction
          </div>
        )}
      </div>
    </div>
  );
}
