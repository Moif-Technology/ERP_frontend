import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../constants/theme';

const primary = colors.primary?.main || '#790728';

function SelectChevron() {
  return (
    <svg className="h-2.5 w-2.5 shrink-0 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApplyCheckIcon() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: primary }} aria-hidden>
      <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

const selectWrap = 'relative flex h-8 w-full items-center rounded border border-neutral-300 bg-white pr-1.5 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]';
const selectCls  = 'h-full w-full cursor-pointer appearance-none rounded border-0 bg-transparent py-0 pl-2 pr-6 font-["Open_Sans",sans-serif] text-[10px] font-semibold text-neutral-800 outline-none focus:ring-0 sm:text-[11px]';
const labelCls   = 'mb-1 block text-left text-[8px] font-bold uppercase tracking-wide text-neutral-600 sm:text-[9px]';

export default function WorkshopMonitorFilterDrawer({
  open,
  onClose,
  onApply,
  statuses = [],
  serviceAdvisors = [],
  customerTypes = [],
  applied = { jobStatus: '', serviceAdvisor: '', customerType: '' },
}) {
  const titleId = useId();
  const [jobStatus,       setJobStatus]       = useState('');
  const [serviceAdvisor,  setServiceAdvisor]  = useState('');
  const [customerType,    setCustomerType]    = useState('');

  useEffect(() => {
    if (!open) return;
    setJobStatus(applied.jobStatus ?? '');
    setServiceAdvisor(applied.serviceAdvisor ?? '');
    setCustomerType(applied.customerType ?? '');
  }, [open, applied.jobStatus, applied.serviceAdvisor, applied.customerType]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleApply = () => {
    onApply({
      jobStatus:      jobStatus || '',
      serviceAdvisor: serviceAdvisor || '',
      customerType:   customerType || '',
    });
    onClose();
  };

  const handleClear = () => {
    setJobStatus('');
    setServiceAdvisor('');
    setCustomerType('');
  };

  const node = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-end transition-[visibility] duration-300 ${open ? 'visible' : 'invisible pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-neutral-900/45 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Close filter"
        onClick={onClose}
      />
      <aside
        className={`relative flex h-[70vh] max-h-[70vh] w-full max-w-[min(100vw,340px)] flex-col overflow-hidden bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out sm:rounded-l-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5 sm:px-5 sm:pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id={titleId} className="text-center font-serif text-base font-bold sm:text-lg" style={{ color: primary }}>
              Filter
            </h2>
            <button
              type="button"
              onClick={handleClear}
              className="text-[9px] font-semibold text-neutral-400 underline underline-offset-2 hover:text-neutral-600"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Job Status */}
            <div>
              <label className={labelCls} htmlFor="wm-filter-job-status">Job Status</label>
              <div className={selectWrap}>
                <select
                  id="wm-filter-job-status"
                  className={selectCls}
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><SelectChevron /></span>
              </div>
            </div>

            {/* Service Advisor */}
            <div>
              <label className={labelCls} htmlFor="wm-filter-advisor">Service Advisor</label>
              <div className={selectWrap}>
                <select
                  id="wm-filter-advisor"
                  className={selectCls}
                  value={serviceAdvisor}
                  onChange={(e) => setServiceAdvisor(e.target.value)}
                >
                  <option value="">All Advisors</option>
                  {serviceAdvisors.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><SelectChevron /></span>
              </div>
            </div>

            {/* Customer Type */}
            <div>
              <label className={labelCls} htmlFor="wm-filter-customer-type">Customer Type</label>
              <div className={selectWrap}>
                <select
                  id="wm-filter-customer-type"
                  className={selectCls}
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {customerTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><SelectChevron /></span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={handleApply}
            className="mx-auto flex w-full max-w-[180px] items-center justify-center gap-1.5 rounded-md border-2 bg-white px-3 py-2 font-['Open_Sans',sans-serif] text-[10px] font-bold transition-colors hover:bg-rose-50/50 sm:max-w-[200px] sm:text-[11px]"
            style={{ borderColor: primary, color: primary }}
          >
            <ApplyCheckIcon />
            Apply
          </button>
        </div>
      </aside>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}
