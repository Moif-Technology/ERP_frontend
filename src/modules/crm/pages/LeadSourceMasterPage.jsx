import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, CommonTable, ConfirmDialog } from '../../../shared/components/ui';

const primary = '#790728';

const INITIAL_ROWS = [
  { source_id: 1, source_name: 'Direct Visit',           description: 'Customer visits the office directly',              is_active: true  },
  { source_id: 2, source_name: 'Referral',               description: 'Lead referred by an existing customer or contact', is_active: true  },
  { source_id: 3, source_name: 'Website Enquiry',        description: 'Enquiry submitted through the company website',    is_active: true  },
  { source_id: 4, source_name: 'Cold Call',              description: 'Outbound call initiated by the sales team',        is_active: true  },
  { source_id: 5, source_name: 'Exhibition / Trade Show','description': 'Lead acquired at an exhibition or trade event',  is_active: true  },
  { source_id: 6, source_name: 'Social Media',           description: 'Lead from LinkedIn, Instagram, or similar',       is_active: true  },
  { source_id: 7, source_name: 'Email Campaign',         description: 'Response to a bulk email marketing campaign',     is_active: false },
  { source_id: 8, source_name: 'Partner / Agent',        description: 'Lead introduced by a business partner or agent',  is_active: true  },
];

const EMPTY_FORM = { source_name: '', description: '', is_active: true };

export default function LeadSourceMasterPage() {
  const navigate = useNavigate(); // available for future routing
  const [rows, setRows]               = useState(INITIAL_ROWS);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  /* ── dialog helpers ── */
  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ source_name: item.source_name, description: item.description, is_active: item.is_active });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.source_name.trim()) return;
    if (editItem) {
      const updated = { ...editItem, ...form };
      console.log('[LeadSourceMaster] update', updated);
      setRows((prev) => prev.map((r) => (r.source_id === editItem.source_id ? updated : r)));
    } else {
      const newRow = { source_id: Date.now(), ...form };
      console.log('[LeadSourceMaster] insert', newRow);
      setRows((prev) => [...prev, newRow]);
    }
    closeDialog();
  };

  /* ── delete helpers ── */
  const handleDelete = (id) => setDeleteConfirm({ open: true, id });

  const confirmDelete = () => {
    console.log('[LeadSourceMaster] delete id:', deleteConfirm.id);
    setRows((prev) => prev.filter((r) => r.source_id !== deleteConfirm.id));
    setDeleteConfirm({ open: false, id: null });
  };

  /* ── table data ── */
  const headers = ['Sl No', 'Source Name', 'Description', 'Active', 'Action'];

  const tableRows = rows.map((row, idx) => [
    idx + 1,
    row.source_name,
    row.description || '—',
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${
        row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {row.is_active ? 'Yes' : 'No'}
    </span>,
    <span className="flex items-center gap-2">
      <button
        title="Edit"
        onClick={() => openEdit(row)}
        className="text-gray-500 hover:text-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button
        title="Delete"
        onClick={() => handleDelete(row.source_id)}
        className="text-gray-500 hover:text-red-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </span>,
  ]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 -mx-[13px] w-[calc(100%+26px)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>LEAD SOURCE MASTER</h1>
          <p className="mt-0.5 text-[10px] text-gray-500">Manage lead source types · biz.lead_source_master</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: primary }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Source
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <CommonTable
          headers={headers}
          rows={tableRows}
          fitParentWidth
          columnWidthPercents={[5, 20, 45, 10, 10]}
          headerBackgroundColor={primary}
          headerTextColor="#fff"
          cellPaddingClass="px-3 py-2"
          bodyFontSize="11px"
          headerFontSize="11px"
        />
      </div>

      {/* Add / Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                {editItem ? 'Edit Lead Source' : 'Add Lead Source'}
              </h3>
              <button onClick={closeDialog} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              {/* Source Name */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  Source Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.source_name}
                  onChange={(e) => setForm((f) => ({ ...f, source_name: e.target.value }))}
                  placeholder="e.g. Direct Visit"
                  className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this source..."
                  className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400 resize-none"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  id="ls-is-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-3.5 w-3.5 rounded accent-current"
                  style={{ accentColor: primary }}
                />
                <label htmlFor="ls-is-active" className="text-[11px] font-medium text-gray-700 cursor-pointer">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeDialog}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primary }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Lead Source"
        message="Are you sure you want to delete this lead source? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
