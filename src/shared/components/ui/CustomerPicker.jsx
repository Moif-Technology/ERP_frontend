import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../constants/theme';
import { listCustomers } from '../../../services/customerEntry.api';

const primary = colors.primary?.main || '#790728';

function SearchIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function CustomerPicker({ open, onClose, onSelect, allowCreate = false }) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const fetchCustomers = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await listCustomers(q ? { search: q } : {});
      setCustomers(Array.isArray(data) ? data : (data?.customers ?? []));
    } catch {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setCustomers([]);
    fetchCustomers('');
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, fetchCustomers]);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, open, fetchCustomers]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (c) => {
    onSelect({
      customerId: c.customerId ?? c.id,
      customerName: c.customerName,
      customerCode: c.customerCode,
      mobileNo: c.mobileNo ?? c.mobile ?? '',
    });
    onClose();
  };

  const drawer = (
    <div className="fixed inset-0 z-[9999] flex justify-end" aria-modal role="dialog">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{ background: primary }}
        >
          <span className="text-[13px] font-semibold text-white">Select Customer</span>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-white/80 hover:text-white"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-neutral-200 px-3 py-2">
          <div className="flex items-center gap-2 rounded border border-neutral-300 bg-neutral-50 px-2 py-1.5">
            <SearchIcon />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or mobile…"
              className="min-w-0 flex-1 bg-transparent text-[11px] text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-neutral-400 hover:text-neutral-600">
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* New Customer button */}
        {allowCreate && (
          <div className="shrink-0 border-b border-neutral-200 px-3 py-1.5">
            <button
              onClick={() => window.open('/customers/entry', '_blank')}
              className="w-full rounded border py-1.5 text-[10px] font-semibold transition-colors hover:bg-neutral-50"
              style={{ borderColor: primary, color: primary }}
            >
              + New Customer
            </button>
          </div>
        )}

        {/* Customer list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8 text-[11px] text-neutral-400">
              Loading…
            </div>
          )}
          {!loading && error && (
            <div className="px-4 py-6 text-center text-[11px] text-red-500">{error}</div>
          )}
          {!loading && !error && customers.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-neutral-400">
              No customers found.
            </div>
          )}
          {!loading && !error && customers.map((c, i) => (
            <button
              key={c.customerId ?? c.id ?? i}
              onClick={() => handleSelect(c)}
              className="flex w-full flex-col gap-0.5 border-b border-neutral-100 px-4 py-2 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-100"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-neutral-800">{c.customerName}</span>
                {c.customerCode && (
                  <span className="rounded bg-neutral-100 px-1 py-0.5 text-[9px] text-neutral-500">
                    {c.customerCode}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-[10px] text-neutral-500">
                {(c.mobileNo ?? c.mobile) && <span>{c.mobileNo ?? c.mobile}</span>}
                {c.customerType && <span>{c.customerType}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-neutral-200 px-4 py-2 text-center">
          <span className="text-[9px] text-neutral-400">
            {customers.length} customer{customers.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
