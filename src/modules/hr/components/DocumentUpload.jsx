import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { DropdownInput, InputField } from '../../../shared/components/ui';

export default function DocumentUpload({ onUpload }) {
  const primary = colors.primary?.main || '#790728';
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    documentTypeId: '',
    title: '',
    remarks: '',
    expiryDate: '',
    remindDays: '30',
  });

  const docTypes = ['Passport', 'Visa', 'Emirates ID', 'Contract', 'Certificate'];

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    if (onUpload) {
      onUpload({ file, metadata: form });
    }
    // reset
    setFile(null);
    setForm({
      documentTypeId: '',
      title: '',
      remarks: '',
      expiryDate: '',
      remindDays: '30',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
      <h3 className="text-sm font-bold mb-3" style={{ color: primary }}>Upload New Document</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Dropzone */}
        <div>
          <label
            htmlFor="doc-upload"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${
              dragActive ? 'border-[#790728] bg-rose-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-xs text-gray-500 font-semibold">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-[10px] text-gray-500">PDF, JPG, PNG (MAX. 10MB)</p>
            </div>
            <input id="doc-upload" type="file" className="hidden" onChange={handleChange} />
          </label>
        </div>

        {/* Right: Metadata Form */}
        <div className="flex flex-col gap-3">
          <DropdownInput label="Document Type" fullWidth value={form.documentTypeId} onChange={(v) => update('documentTypeId', v)} options={docTypes} placeholder="Select type" />
          <InputField label="Document Title" fullWidth value={form.title} onChange={(e) => update('title', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Expiry Date" type="date" fullWidth value={form.expiryDate} onChange={(e) => update('expiryDate', e.target.value)} />
            <InputField label="Remind before (days)" type="number" fullWidth value={form.remindDays} onChange={(e) => update('remindDays', e.target.value)} />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file}
              className={`rounded px-4 py-2 text-[11px] font-semibold text-white transition-opacity ${!file ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{ backgroundColor: primary }}
            >
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
