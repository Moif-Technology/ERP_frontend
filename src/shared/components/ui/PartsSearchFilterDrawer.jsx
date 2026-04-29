import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { colors } from '../../constants/theme';

const primary = colors.primary?.main || '#790728';

export const MAKE_TYPE_TREE = [
  {
    make: 'BMW',
    models: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'M3', 'M5', 'Z4'],
  },
  {
    make: 'NISSAN',
    models: ['Altima', 'Maxima', 'Pathfinder', 'Patrol', 'Sunny', 'X-Trail', 'Tiida'],
  },
  {
    make: 'MERCEDES',
    models: ['C200', 'C300', 'E200', 'E300', 'S500', 'GLE', 'GLS', 'A180'],
  },
  {
    make: 'AUDI',
    models: ['4S', 'A8', 'S8', 'A3', 'S4', 'A6', '80', '100', 'A 100', 'A4', 'Q7', '2.7 T', 'ALLROAD', 'A5', 'Q5', 'TT', 'XG', 'RS 350', 'RS6', 'Q3', 'A1', 'A7', 'Q 8'],
  },
  {
    make: 'TOYOTA',
    models: ['Camry', 'Corolla', 'Land Cruiser', 'Hilux', 'Prado', 'RAV4', 'Yaris', 'Fortuner'],
  },
  {
    make: 'CHRYSLER',
    models: ['300C', 'Voyager', 'Grand Cherokee', 'Sebring', 'PT Cruiser'],
  },
  {
    make: 'HYUNDAI',
    models: ['Sonata', 'Elantra', 'Tucson', 'Santa Fe', 'Accent', 'i30', 'Kona'],
  },
];

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

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}

function MakeTypeTree({ selectedMake, selectedModel, onSelect }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (make) => setExpanded((prev) => ({ ...prev, [make]: !prev[make] }));

  return (
    <div className="overflow-hidden rounded-lg border border-rose-200 bg-white shadow-sm">
      <div className="max-h-[240px] overflow-y-auto divide-y divide-rose-100">
        {MAKE_TYPE_TREE.map(({ make, models }) => {
          const makeSelected = selectedMake === make && !selectedModel;
          const hasModelSel  = selectedMake === make && !!selectedModel;
          const open         = !!expanded[make];
          const anySelected  = makeSelected || hasModelSel;

          return (
            <div key={make}>
              {/* Brand row */}
              <div
                className={`flex items-center gap-2 px-3 py-2 transition-colors ${anySelected ? 'bg-rose-50' : 'hover:bg-rose-50/50'}`}
              >
                {/* Expand toggle */}
                <button
                  type="button"
                  onClick={() => toggle(make)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    open
                      ? 'border-rose-300 bg-rose-100 text-[#790728]'
                      : 'border-neutral-300 bg-white text-neutral-500 hover:border-rose-300 hover:text-[#790728]'
                  }`}
                  aria-label={open ? `Collapse ${make}` : `Expand ${make}`}
                >
                  <ChevronIcon open={open} />
                </button>

                {/* Brand name — clicking selects the whole make */}
                <button
                  type="button"
                  onClick={() => onSelect(make, null)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <span className={`text-[10px] font-bold tracking-wide transition-colors ${anySelected ? 'text-[#790728]' : 'text-neutral-700 hover:text-[#790728]'}`}>
                    {make}
                  </span>
                  <span className="text-[8px] font-medium text-neutral-400">
                    ({models.length})
                  </span>
                </button>

                {/* Selected indicator */}
                {anySelected && (
                  <span
                    className="inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {makeSelected ? 'All' : selectedModel}
                  </span>
                )}
              </div>

              {/* Model list */}
              {open && (
                <div className="bg-rose-50/40 pb-1 pt-0.5">
                  <div className="ml-8 mr-2 flex flex-wrap gap-1.5 py-1.5 px-1">
                    {models.map((model) => {
                      const modelSel = selectedMake === make && selectedModel === model;
                      return (
                        <button
                          key={model}
                          type="button"
                          onClick={() => onSelect(make, model)}
                          className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold transition-all ${
                            modelSel
                              ? 'border-[#790728] text-white shadow-sm'
                              : 'border-neutral-200 bg-white text-neutral-600 hover:border-rose-300 hover:text-[#790728]'
                          }`}
                          style={modelSel ? { backgroundColor: primary, borderColor: primary } : undefined}
                        >
                          {model}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PartsSearchFilterDrawer({
  open,
  onClose,
  onApply,
  partsFamilies = [],
  applied = { makeType: '', makeModel: '', partsFamily: '', qtyMin: '', qtyMax: '' },
}) {
  const titleId = useId();
  const [makeType,     setMakeType]     = useState('');
  const [makeModel,    setMakeModel]    = useState('');
  const [partsFamily,  setPartsFamily]  = useState('');
  const [qtyMin,       setQtyMin]       = useState('');
  const [qtyMax,       setQtyMax]       = useState('');

  useEffect(() => {
    if (!open) return;
    setMakeType(applied.makeType ?? '');
    setMakeModel(applied.makeModel ?? '');
    setPartsFamily(applied.partsFamily ?? '');
    setQtyMin(applied.qtyMin ?? '');
    setQtyMax(applied.qtyMax ?? '');
  }, [open, applied.makeType, applied.makeModel, applied.partsFamily, applied.qtyMin, applied.qtyMax]);

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

  const handleMakeSelect = (make, model) => {
    if (makeType === make && makeModel === (model ?? '') && !model) {
      setMakeType(''); setMakeModel('');
    } else {
      setMakeType(make);
      setMakeModel(model ?? '');
    }
  };

  const handleApply = () => {
    onApply({ makeType, makeModel, partsFamily, qtyMin, qtyMax });
    onClose();
  };

  const handleClear = () => {
    setMakeType(''); setMakeModel(''); setPartsFamily(''); setQtyMin(''); setQtyMax('');
  };

  const selectedLabel = makeType
    ? makeModel ? `${makeType} — ${makeModel}` : makeType
    : 'None selected';

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
        className={`relative flex h-[90vh] max-h-[90vh] w-full max-w-[min(100vw,340px)] flex-col overflow-hidden bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out sm:rounded-l-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5 sm:px-5 sm:pt-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 id={titleId} className="font-serif text-base font-bold sm:text-lg" style={{ color: primary }}>
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

          <div className="flex flex-col gap-5">
            {/* Make Type — tree */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className={labelCls + ' mb-0'}>Product Make Type</p>
                {makeType && (
                  <button
                    type="button"
                    onClick={() => { setMakeType(''); setMakeModel(''); }}
                    className="text-[8px] font-semibold text-neutral-400 underline underline-offset-2 hover:text-neutral-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <MakeTypeTree
                selectedMake={makeType}
                selectedModel={makeModel}
                onSelect={handleMakeSelect}
              />
            </div>

            {/* Parts Family */}
            <div>
              <label className={labelCls} htmlFor="ps-filter-family">Parts Family</label>
              <div className={selectWrap}>
                <select
                  id="ps-filter-family"
                  className={selectCls}
                  value={partsFamily}
                  onChange={(e) => setPartsFamily(e.target.value)}
                >
                  <option value="">All Families</option>
                  {partsFamilies.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"><SelectChevron /></span>
              </div>
            </div>

            {/* Qty on Hand range */}
            <div>
              <p className={labelCls}>Qty on Hand</p>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-col gap-0.5">
                  <label className="text-[8px] font-semibold text-neutral-500" htmlFor="ps-qty-min">Min</label>
                  <input
                    id="ps-qty-min"
                    type="number"
                    min="0"
                    value={qtyMin}
                    onChange={(e) => setQtyMin(e.target.value)}
                    placeholder="0"
                    className="h-8 w-full rounded border border-neutral-300 bg-white px-2 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-neutral-800 outline-none focus:border-neutral-400 sm:text-[11px]"
                  />
                </div>
                <span className="mt-4 text-[10px] font-bold text-neutral-400">—</span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <label className="text-[8px] font-semibold text-neutral-500" htmlFor="ps-qty-max">Max</label>
                  <input
                    id="ps-qty-max"
                    type="number"
                    min="0"
                    value={qtyMax}
                    onChange={(e) => setQtyMax(e.target.value)}
                    placeholder="∞"
                    className="h-8 w-full rounded border border-neutral-300 bg-white px-2 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-neutral-800 outline-none focus:border-neutral-400 sm:text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
