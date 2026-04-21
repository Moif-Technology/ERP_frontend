import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../../shared/constants/theme';

export default function ExpiringDocumentsWidget() {
  const primary = colors.primary?.main || '#790728';

  const expiringDocs = [
    { id: '1', empName: 'John Doe', type: 'Visa', expiry: 'In 5 days', date: '26 Oct 2026', urgent: true },
    { id: '2', empName: 'Jane Smith', type: 'Passport', expiry: 'In 12 days', date: '02 Nov 2026', urgent: true },
    { id: '3', empName: 'Ali Khan', type: 'Emirates ID', expiry: 'In 28 days', date: '18 Nov 2026', urgent: false },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-xs font-bold text-gray-800 uppercase" style={{ color: primary }}>
          Expiring Documents
        </h3>
        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {expiringDocs.filter(d => d.urgent).length} Urgent
        </span>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <ul className="space-y-2">
          {expiringDocs.map((doc) => (
            <li key={doc.id} className="p-3 bg-white border border-gray-100 rounded-md shadow-sm hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-gray-800">{doc.empName}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${doc.urgent ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                  {doc.expiry}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-gray-500">{doc.type}</span>
                <span className="text-[10px] text-gray-500">{doc.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
        <Link to="/hr/employees" className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline">
          View all in Employee Directory &rarr;
        </Link>
      </div>
    </div>
  );
}
