import React, { useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField } from '../../../shared/components/ui';

export default function DocumentTypeMaster() {
  const primary = colors.primary?.main || '#790728';
  const [form, setForm] = useState({
    documentTypeName: '',
    allowedExtensions: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    console.log('Document Type Save', form);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 mx-3">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        DOCUMENT TYPE MASTER
      </h1>

      <div className="mt-3 flex justify-center">
        <div className="w-full max-w-lg p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4">
            <InputField label="Document type name" fullWidth value={form.documentTypeName} onChange={(e) => update('documentTypeName', e.target.value)} />
            <InputField label="Allowed extensions (e.g. pdf,jpg,png)" fullWidth value={form.allowedExtensions} onChange={(e) => update('allowedExtensions', e.target.value)} />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Save Document Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
