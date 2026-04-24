import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonTable, ConfirmDialog } from '../../../shared/components/ui';

const primary = '#790728';

const INITIAL_ROWS = [
  { stage_id: 1, stage_name: 'Prospect',    color_code: '#94A3B8', probability_percent: 10,  description: 'Initial stage; potential opportunity identified',    display_order: 1, is_active: true },
  { stage_id: 2, stage_name: 'Qualified',   color_code: '#60A5FA', probability_percent: 25,  description: 'Opportunity qualified; budget and need confirmed',    display_order: 2, is_active: true },
  { stage_id: 3, stage_name: 'Proposal',    color_code: '#FBBF24', probability_percent: 50,  description: 'Proposal or quotation submitted to the customer',    display_order: 3, is_active: true },
  { stage_id: 4, stage_name: 'Negotiation', color_code: '#F97316', probability_percent: 75,  description: 'Terms being negotiated; close to agreement',         display_order: 4, is_active: true },
  { stage_id: 5, stage_name: 'Won',         color_code: '#22C55E', probability_percent: 100, description: 'Deal closed successfully',                          display_order: 5, is_active: true },
  { stage_id: 6, stage_name: 'Lost',        color_code: '#EF4444', probability_percent: 0,   description: 'Opportunity lost to competitor or dropped',         display_order: 6, is_active: true },
  { stage_id: 7, stage_name: 'On Hold',     color_code: '#A78BFA', probability_percent: 50,  description: 'Opportunity paused; pending decision from customer', display_order: 7, is_active: true },
];

const EMPTY_FORM = {
  stage_name: '',
  probability_percent: '',
  color_code: '#60A5FA',
  description: '',
  display_order: '',
  is_active: true,
};

export default function OpportunityStageMasterPage() {
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
    setForm({
      stage_name:          item.stage_name,
      probability_percent: item.probability_percent,
      color_code:          item.color_code,
      description:         item.description,
      display_order:       item.display_order,
      is_active:           item.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.stage_name.trim()) return;
    if (editItem) {
      const updated = {
        ...editItem,
        ...form,
        probability_percent: Number(form.probability_percent) ?? editItem.probability_percent,
        display_order:       Number(form.display_order)       || editItem.display_order,
      };
      console.log('[OpportunityStageMaster] update', updated);
      setRows((prev) => prev.map((r) => (r.stage_id === editItem.stage_id ? updated : r)));
    } else {
      const newRow = {
        stage_id:            Date.now(),
        ...form,
        probability_percent: Number(form.probability_percent) ?? 0,
        display_order:       Number(form.display_order)       || rows.length + 1,
      };
      console.log('[OpportunityStageMaster] insert', newRow);
      setRows((prev) => [...prev, newRow]);
    }
    closeDialog();
  };

  /* ── delete helpers ── */
  const handleDelete = (id) => setDeleteConfirm({ open: true, id });

  const confirmDelete = () => {
    console.log('[OpportunityStageMaster] delete id:', deleteConfirm.id);
    setRows((prev) => prev.filter((r) => r.stage_id !== deleteConfirm.id));
    setDeleteConfirm({ open: false, id: null });
  };

  /* ── probability clamp ── */
  const handleProbabilityChange = (e) => {
    let val = e.target.value;
    if (val !== '') {
      const n = Math.min(100, Math.max(0, Number(val)));
      val = String(n);
    }
    setForm((f) => ({ ...f, probability_percent: val }));
  };

  /* ── table ── */
  const headers = ['Sl No', 'Stage Name', 'Probability %', 'Description', 'Order', 'Active', 'Action'];

  const tableRows = rows.map((row, idx) => [
    idx + 1,
    row.stage_name,
    <span className="font-medium text-gray-700">{row.probability_percent}%</span>,
    row.description || '—',
    row.display_order,
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${
        row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {row.is_active ? 'Yes' : 'No'}
    </span>,
    <span className="flex items-center gap-2">
      <button title="Edit" onClick={() => openEdit(row)} className="text-gray-500 hover:text-blue-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button title="Delete" onClick={() => handleDelete(row.stage_id)} className="text-gray-500 hover:text-red-600 transition-colors">
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
          <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>OPPORTUNITY STAGE MASTER</h1>
          <p className="mt-0.5 text-[10px] text-gray-500">Manage opportunity pipeline stages · biz.opportunity_stage_master</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: primary }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Stage
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden">
        <CommonTable
          headers={headers}
          rows={tableRows}
          fitParentWidth
          allowHorizontalScroll={false}
          truncateHeader
          hideVerticalCellBorders
          cellAlign="center"
          columnWidthPercents={[4, 14, 11, 43, 7, 9, 12]}
          headerTextColor="#6b7280"
          headerFontSize="clamp(7px, 0.85vw, 10px)"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-1 py-1 sm:px-1.5 sm:py-1.5"
          bodyRowHeightRem={2.6}
          maxVisibleRows={10}
        />
      </div>

      {/* Add / Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                {editItem ? 'Edit Opportunity Stage' : 'Add Opportunity Stage'}
              </h3>
              <button onClick={closeDialog} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              {/* Stage Name */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.stage_name}
                  onChange={(e) => setForm((f) => ({ ...f, stage_name: e.target.value }))}
                  placeholder="e.g. Proposal"
                  className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
                />
              </div>

              {/* Probability % */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Probability %</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.probability_percent}
                    onChange={handleProbabilityChange}
                    placeholder="0"
                    className="w-20 rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
                  />
                  <span className="text-[11px] text-gray-500">% (0 – 100)</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this stage..."
                  className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400 resize-none"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                  placeholder="1"
                  className="w-24 rounded border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  id="os-is-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-3.5 w-3.5 rounded"
                  style={{ accentColor: primary }}
                />
                <label htmlFor="os-is-active" className="text-[11px] font-medium text-gray-700 cursor-pointer">Active</label>
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
        title="Delete Opportunity Stage"
        message="Are you sure you want to delete this opportunity stage? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
