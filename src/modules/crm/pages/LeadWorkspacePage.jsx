import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';

export default function LeadWorkspacePage() {
  const primary = colors.primary?.main || '#790728';

  const [activeTab, setActiveTab] = useState('Summary');

  const tabs = [
    'Summary',
    'Interactions',
    'Follow-ups',
    'Notes',
    'Linked Opportunity',
    'Conversion History',
  ];

  const interactions = [
    {
      id: 1,
      date: '2026-04-20',
      type: 'Call',
      mode: 'Phone',
      subject: 'Initial discussion',
      outcome: 'Interested in demo',
      by: 'Sabeeh',
    },
  ];

  const followups = [
    {
      id: 1,
      dueDate: '2026-04-23',
      subject: 'Send proposal',
      assignedTo: 'Swetha',
      priority: 'High',
      status: 'Pending',
    },
  ];

  const notes = [
    {
      id: 1,
      title: 'Requirement Note',
      note: 'Customer interested in ERP + POS package.',
      createdBy: 'Sabeeh',
      createdOn: '2026-04-21',
    },
  ];

  return (
    <div className="mx-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
            LEAD WORKSPACE
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Al Noor Trading</span>
            <span className="rounded px-2 py-1 text-[10px] font-semibold" style={{ background: '#FEF3C7', color: '#92400E' }}>
              New
            </span>
            <span className="rounded px-2 py-1 text-[10px] font-semibold" style={{ background: '#FEE2E2', color: '#991B1B' }}>
              High Priority
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Lead No: LD-0001 | Assigned to: Sabeeh</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: primary }}>
            Add Interaction
          </button>
          <button type="button" className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700">
            Add Follow-up
          </button>
          <button type="button" className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700">
            Edit Lead
          </button>
          <button type="button" className="rounded border border-gray-300 px-4 py-2 text-[11px] font-semibold text-gray-700">
            Convert
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Source</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">Website</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Last Interaction</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">2026-04-20</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Next Follow-up</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">2026-04-23</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] text-gray-500">Linked Opportunity</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">Not Linked</div>
        </div>
      </div>

      <div className="mt-5 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="rounded-t px-4 py-2 text-[11px] font-semibold"
                style={{
                  backgroundColor: active ? primary : '#F3F4F6',
                  color: active ? '#fff' : '#374151',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'Summary' && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-bold" style={{ color: primary }}>Lead Summary</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div><span className="font-semibold text-gray-600">Lead Name:</span> Al Noor Trading</div>
              <div><span className="font-semibold text-gray-600">Contact Person:</span> Fahad</div>
              <div><span className="font-semibold text-gray-600">Mobile:</span> 971500000001</div>
              <div><span className="font-semibold text-gray-600">Email:</span> fahad@alnoor.com</div>
              <div><span className="font-semibold text-gray-600">Status:</span> New</div>
              <div><span className="font-semibold text-gray-600">Assigned To:</span> Sabeeh</div>
              <div><span className="font-semibold text-gray-600">Source:</span> Website</div>
              <div><span className="font-semibold text-gray-600">Priority:</span> High</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-bold" style={{ color: primary }}>Address & Remarks</h2>
            <div className="mt-3 space-y-3 text-xs">
              <div><span className="font-semibold text-gray-600">Address:</span> Dubai, UAE</div>
              <div><span className="font-semibold text-gray-600">Interested Product:</span> ERP + POS</div>
              <div><span className="font-semibold text-gray-600">Remarks:</span> Interested in complete business software package.</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Interactions' && (
        <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full border-collapse text-left">
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                {['Date', 'Type', 'Mode', 'Subject', 'Outcome', 'By'].map((head) => (
                  <th key={head} className="border-b border-gray-200 px-3 py-3 text-[11px] font-semibold text-gray-600">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interactions.map((row) => (
                <tr key={row.id}>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.date}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.type}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.mode}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.subject}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.outcome}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Follow-ups' && (
        <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full border-collapse text-left">
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                {['Due Date', 'Subject', 'Assigned To', 'Priority', 'Status'].map((head) => (
                  <th key={head} className="border-b border-gray-200 px-3 py-3 text-[11px] font-semibold text-gray-600">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {followups.map((row) => (
                <tr key={row.id}>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.dueDate}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.subject}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.assignedTo}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.priority}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Notes' && (
        <div className="mt-5 space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: primary }}>{note.title}</h3>
                <span className="text-[11px] text-gray-500">{note.createdOn}</span>
              </div>
              <p className="mt-2 text-xs text-gray-700">{note.note}</p>
              <div className="mt-2 text-[11px] text-gray-500">By: {note.createdBy}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Linked Opportunity' && (
        <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No linked opportunity found
        </div>
      )}

      {activeTab === 'Conversion History' && (
        <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No conversion history available
        </div>
      )}
    </div>
  );
}