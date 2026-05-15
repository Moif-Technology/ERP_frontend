import React, { useEffect, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import { InputField } from '../../../shared/components/ui';
import { documentTypes as fallbackDocTypes } from '../data/hrData';
import * as hrApi from '../../../services/hr.api.js';

export default function DocumentTypeMaster() {
  const primary = colors.primary?.main || '#790728';
  const [types, setTypes] = useState(fallbackDocTypes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    documentTypeName: '',
    allowedExtensions: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await hrApi.listHrDocumentTypes();
        if (cancelled) return;
        const rows = (data?.documentTypes || []).map((d) => ({
          name: d.documentTypeName,
          required: d.isRequired ? 'Yes' : 'Optional',
          reminderDays: d.reminderDays,
          allowed: d.allowedExtensions || 'pdf,jpg,png',
        }));
        if (rows.length) setTypes(rows);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setError('');
    if (!form.documentTypeName.trim()) {
      setError('Document type name is required.');
      return;
    }
    setSaving(true);
    try {
      await hrApi.createHrDocumentType({
        documentTypeName: form.documentTypeName,
        allowedExtensions: form.allowedExtensions || 'pdf,jpg,png',
      });
      const { data } = await hrApi.listHrDocumentTypes();
      const rows = (data?.documentTypes || []).map((d) => ({
        name: d.documentTypeName,
        required: d.isRequired ? 'Yes' : 'Optional',
        reminderDays: d.reminderDays,
        allowed: d.allowedExtensions || 'pdf,jpg,png',
      }));
      if (rows.length) setTypes(rows);
      setForm({ documentTypeName: '', allowedExtensions: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save document type.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="box-border w-[calc(100%+26px)] max-w-none -mx-[13px] rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        DOCUMENT TYPE MASTER
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Document rules help HR control statutory compliance and renewal reminders.
      </p>

      <div className="mt-3 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="w-full p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4">
            <InputField label="Document type name" fullWidth value={form.documentTypeName} onChange={(e) => update('documentTypeName', e.target.value)} />
            <InputField label="Allowed extensions (e.g. pdf,jpg,png)" fullWidth value={form.allowedExtensions} onChange={(e) => update('allowedExtensions', e.target.value)} />
          </div>

          <div className="mt-4 flex justify-end">
            {error ? <p className="mr-3 self-center text-xs text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded px-4 py-2 text-[11px] font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              {saving ? 'Saving...' : 'Save Document Type'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-bold text-slate-900">Document policy map</h2>
          <div className="mt-3 space-y-2">
            {types.map((doc) => (
              <div key={doc.name} className="rounded-xl border border-white bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                  <span className="text-[10px] font-bold text-slate-500">{doc.required}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Remind before {doc.reminderDays} days • Allowed: {doc.allowed}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
