import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import httpClient from '../../../services/http/httpClient';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import SearchIcon from '../../../shared/assets/icons/search2.svg';

const primary = colors.primary?.main || '#790728';
const primaryLite = colors.primary?.[50] || '#F2E6EA';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('en-GB') : '-';
}

function formatMoney(value) {
  if (value == null || value === '') return '-';
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '-';
}

function StatusPill({ children }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
      style={{ background: primaryLite, color: primary }}
    >
      {children}
    </span>
  );
}

export default function VehicleList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await httpClient.get('/api/garage/vehicles');
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVehicles(); }, []);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((vehicle) => [
      vehicle.regNo,
      vehicle.model,
      vehicle.carGroupName,
      vehicle.carSubGroupName,
      vehicle.chassisNo,
      vehicle.engineNo,
      vehicle.emirates,
      vehicle.purchaseInvoiceNo,
      vehicle.insuranceNo,
    ].some((value) => String(value || '').toLowerCase().includes(q)));
  }, [search, vehicles]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white" style={{ margin: '0 -13px' }}>
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h1 className="text-[15px] font-bold tracking-tight" style={{ color: primary }}>Vehicle List</h1>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Saved vehicle master records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Print"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50"
          >
            <img src={PrinterIcon} alt="" className="h-3 w-3 opacity-70" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/garage/vehicle-entry')}
            className="inline-flex h-7 items-center rounded px-3 text-[10px] font-semibold text-white"
            style={{ background: primary }}
          >
            New Vehicle
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex h-8 flex-1 items-center gap-2 rounded border border-slate-200 bg-white px-2">
          <img src={SearchIcon} alt="" className="h-3.5 w-3.5 opacity-70" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reg no, model, group, chassis, engine..."
            className="flex-1 border-0 bg-transparent text-[11px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={loadVehicles}
          className="inline-flex h-8 items-center rounded border border-slate-200 px-3 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-[10px] font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {['Reg No', 'Model', 'Group', 'Sub Group', 'Emirates', 'Chassis No', 'Engine No', 'Purchase', 'Insurance', 'Warranty KM', 'Status'].map((header) => (
                <th key={header} className="border-b border-slate-200 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-[11px] font-medium text-slate-400">
                  No vehicles found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-[11px] font-medium text-slate-400">
                  Loading vehicles...
                </td>
              </tr>
            )}
            {!loading && filteredVehicles.map((vehicle, index) => (
              <tr
                key={vehicle.id}
                onClick={() => navigate(`/garage/vehicle-entry/${vehicle.id}`)}
                className={`cursor-pointer transition-colors hover:bg-rose-50/40 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
              >
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] font-bold text-slate-800">{vehicle.regNo || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] font-medium text-slate-700">{vehicle.model || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">{vehicle.carGroupName || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">{vehicle.carSubGroupName || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">{vehicle.emirates || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">{vehicle.chassisNo || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">{vehicle.engineNo || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">
                  {vehicle.purchaseInvoiceNo ? `${vehicle.purchaseInvoiceNo} · ${formatMoney(vehicle.purchaseAmount)}` : '-'}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">
                  {vehicle.insuranceNo ? `${vehicle.insuranceNo} · ${formatMoney(vehicle.insuranceAmount)}` : '-'}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px] text-slate-600">{vehicle.warrantyKm || '-'}</td>
                <td className="border-b border-slate-100 px-4 py-3 text-[11px]">
                  <div className="flex flex-col gap-1">
                    <StatusPill>{vehicle.vehicleStatus || 'ACTIVE'}</StatusPill>
                    <span className="text-[9px] text-slate-400">{formatDate(vehicle.regDate)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
