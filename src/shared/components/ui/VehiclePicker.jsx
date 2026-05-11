import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../constants/theme';
import { listVehicles } from '../../../modules/garage/api/vehicleLookup.api';

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

function CarIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4v4h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M12 7v4" />
    </svg>
  );
}

/**
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onSelect: ({ vehicleId, regNo, chassisNo, model, customerId, linkedCustomerName, linkedCustomerCode }) => void
 */
export default function VehiclePicker({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const fetchVehicles = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const data = await listVehicles(q);
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setVehicles([]);
    fetchVehicles('');
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, fetchVehicles]);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVehicles(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, open, fetchVehicles]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (v) => {
    onSelect({
      vehicleId: v.vehicleId ?? v.id,
      regNo: v.regNo ?? '',
      chassisNo: v.chassisNo ?? '',
      model: v.model ?? '',
      customerId: v.customerId ?? null,
      linkedCustomerName: v.linkedCustomerName ?? '',
      linkedCustomerCode: v.linkedCustomerCode ?? '',
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
          <div className="flex items-center gap-2">
            <CarIcon />
            <span className="text-[13px] font-semibold text-white">Select Vehicle</span>
          </div>
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
              placeholder="Search by reg no, model, chassis…"
              className="min-w-0 flex-1 bg-transparent text-[11px] text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-neutral-400 hover:text-neutral-600">
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* Vehicle list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8 text-[11px] text-neutral-400">
              Loading…
            </div>
          )}
          {!loading && error && (
            <div className="px-4 py-6 text-center text-[11px] text-red-500">{error}</div>
          )}
          {!loading && !error && vehicles.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-neutral-400">
              No vehicles found.
            </div>
          )}
          {!loading && !error && vehicles.map((v, i) => (
            <button
              key={v.id ?? v.vehicleId ?? i}
              onClick={() => handleSelect(v)}
              className="flex w-full flex-col gap-0.5 border-b border-neutral-100 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-100"
            >
              {/* Reg No + Model */}
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide"
                  style={{ background: `${primary}15`, color: primary }}
                >
                  {v.regNo || '—'}
                </span>
                {v.model && (
                  <span className="text-[11px] font-semibold text-neutral-800">{v.model}</span>
                )}
              </div>
              {/* Chassis + Customer */}
              <div className="flex flex-wrap gap-3 text-[10px] text-neutral-500">
                {v.chassisNo && <span>Chassis: {v.chassisNo}</span>}
                {v.linkedCustomerName && (
                  <span className="font-medium text-neutral-600">{v.linkedCustomerName}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-neutral-200 px-4 py-2 text-center">
          <span className="text-[9px] text-neutral-400">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
