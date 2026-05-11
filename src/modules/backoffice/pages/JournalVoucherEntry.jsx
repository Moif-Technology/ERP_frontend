import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, InputField, SubInputField, DateInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import UnpostIcon from '../../../shared/assets/icons/unpost.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [8, 34, 18, 18, 22];

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const tableCellInputClass =
  'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseMoney(s) {
  const n = Number(String(s ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function SaveDiskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function useViewportMaxWidth(maxPx) {
  const query = `(max-width: ${maxPx}px)`;
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function buildFreshLine() {
  return { id: `jv-${Date.now()}-${Math.random().toString(36).slice(2)}`, accountId: '', accountLabel: '', debit: '0.00', credit: '0.00' };
}

export default function JournalVoucherEntry() {
  const [accountOptions, setAccountOptions] = useState([]);
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [tableData, setTableData] = useState([buildFreshLine()]);

  const [voucherType, setVoucherType] = useState('');
  const [voucherTypeId, setVoucherTypeId] = useState(null);
  const [voucherNo, setVoucherNo] = useState('');
  const [loadedVoucherId, setLoadedVoucherId] = useState(null);
  const [refNo, setRefNo] = useState('');
  const [journalDate, setJournalDate] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);
  const isCompactTable = useViewportMaxWidth(1023);

  useEffect(() => {
    accountsApi.listAccountHeads({ postingOnly: true }).then((res) => {
      setAccountOptions(res.data?.accountHeads || []);
    }).catch(() => {});
    accountsApi.listVoucherTypes().then((res) => {
      setVoucherTypes(res.data?.voucherTypes || []);
    }).catch(() => {});
  }, []);

  const filteredRows = tableData;

  const updateLine = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleAddLine = useCallback(() => {
    setTableData((prev) => [...prev, buildFreshLine()]);
  }, []);

  const handleViewLine = useCallback((id) => { setEditingRowId(null); setDetailRowId(id); }, []);
  const handleEditLine = useCallback((id) => { setDetailRowId(null); setEditingRowId((prev) => (prev === id ? null : id)); }, []);
  const handleDeleteLine = useCallback((id) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    setDetailRowId((c) => (c === id ? null : c));
    setEditingRowId((c) => (c === id ? null : c));
  }, []);

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);
  const detailRow = useMemo(() => (detailRowId ? filteredRows.find((r) => r.id === detailRowId) : null), [detailRowId, filteredRows]);

  const handleSave = useCallback(async () => {
    setStatusMsg('');
    if (!voucherTypeId) { setStatusMsg('Select a voucher type'); return; }
    const lines = tableData.filter((l) => l.accountId && (parseMoney(l.debit) > 0 || parseMoney(l.credit) > 0));
    if (lines.length === 0) { setStatusMsg('Add at least one line with an account and amount'); return; }

    const totalDr = lines.reduce((s, l) => s + parseMoney(l.debit), 0);
    const totalCr = lines.reduce((s, l) => s + parseMoney(l.credit), 0);
    if (Math.abs(totalDr - totalCr) > 0.01) {
      setStatusMsg(`Debit (${formatMoney(totalDr)}) and Credit (${formatMoney(totalCr)}) must balance`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        voucherTypeId,
        referenceNo: refNo || null,
        remarks: remark || null,
        voucherDate: journalDate || undefined,
        lines: lines.map((l) => ({
          accountId: Number(l.accountId),
          debitAmount: parseMoney(l.debit),
          creditAmount: parseMoney(l.credit),
          narration: remark || null,
        })),
      };

      if (loadedVoucherId) {
        await accountsApi.updateVoucher(loadedVoucherId, payload);
        setStatusMsg('Voucher updated successfully');
      } else {
        const res = await accountsApi.createVoucher(payload);
        const d = res.data;
        setVoucherNo(d.voucherNo || `${d.voucherPrefix}${d.autoVoucherNo}`);
        setLoadedVoucherId(d.voucherMasterId);
        setStatusMsg('Voucher saved successfully');
      }
    } catch (e) {
      setStatusMsg(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [voucherTypeId, tableData, refNo, remark, journalDate, loadedVoucherId]);

  const handlePost = useCallback(async () => {
    if (!loadedVoucherId) { setStatusMsg('Save the voucher first'); return; }
    try {
      await accountsApi.postVoucher(loadedVoucherId);
      setStatusMsg('Voucher posted');
    } catch (e) { setStatusMsg(e.response?.data?.message || 'Failed to post'); }
  }, [loadedVoucherId]);

  const handleUnpost = useCallback(async () => {
    if (!loadedVoucherId) { setStatusMsg('No voucher loaded'); return; }
    try {
      await accountsApi.unpostVoucher(loadedVoucherId);
      setStatusMsg('Voucher unposted');
    } catch (e) { setStatusMsg(e.response?.data?.message || 'Failed to unpost'); }
  }, [loadedVoucherId]);

  const handleDeleteDocument = useCallback(async () => {
    if (loadedVoucherId) {
      if (!window.confirm('Delete this voucher?')) return;
      try {
        await accountsApi.deleteVoucher(loadedVoucherId);
      } catch (e) {
        setStatusMsg(e.response?.data?.message || 'Failed to delete');
        return;
      }
    }
    setTableData([buildFreshLine()]);
    setVoucherType(''); setVoucherTypeId(null); setVoucherNo(''); setRefNo('');
    setJournalDate(''); setRemark(''); setLoadedVoucherId(null); setStatusMsg('');
    setPage(1); setEditingRowId(null); setDetailRowId(null);
  }, [loadedVoucherId]);

  const handleNew = useCallback(() => {
    setTableData([buildFreshLine()]);
    setVoucherType(''); setVoucherTypeId(null); setVoucherNo(''); setRefNo('');
    setJournalDate(''); setRemark(''); setLoadedVoucherId(null); setStatusMsg('');
    setPage(1); setEditingRowId(null); setDetailRowId(null);
  }, []);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);
  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const totalDebit = useMemo(() => filteredRows.reduce((s, r) => s + parseMoney(r.debit), 0), [filteredRows]);
  const totalCredit = useMemo(() => filteredRows.reduce((s, r) => s + parseMoney(r.credit), 0), [filteredRows]);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r, idx) => {
      const slNo = (page - 1) * pageSize + idx + 1;
      const rowIsEditing = editingRowId === r.id;
      const accountCell = rowIsEditing ? (
        <select key={`acc-${r.id}`} value={r.accountId}
          onChange={(e) => {
            const acc = accountOptions.find((a) => String(a.accountId) === e.target.value);
            updateLine(r.id, { accountId: e.target.value, accountLabel: acc ? `${acc.accountNo} – ${acc.accountHead}` : '' });
          }}
          className={`${tableCellInputClass} text-left`}>
          <option value="">— Select —</option>
          {accountOptions.map((a) => <option key={a.accountId} value={a.accountId}>{a.accountNo} – {a.accountHead}</option>)}
        </select>
      ) : (
        <span key={`acc-${r.id}`} className="block w-full text-left">{r.accountLabel || '(select account)'}</span>
      );
      const debitCell = rowIsEditing ? (
        <input key={`dr-${r.id}`} type="text" inputMode="decimal" className={tableCellInputClass}
          value={r.debit} onChange={(e) => updateLine(r.id, { debit: e.target.value })} />
      ) : formatMoney(parseMoney(r.debit));
      const creditCell = rowIsEditing ? (
        <input key={`cr-${r.id}`} type="text" inputMode="decimal" className={tableCellInputClass}
          value={r.credit} onChange={(e) => updateLine(r.id, { credit: e.target.value })} />
      ) : formatMoney(parseMoney(r.credit));
      return [
        slNo, accountCell, debitCell, creditCell,
        <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className={actionIconBtn} onClick={() => handleViewLine(r.id)}><img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
          <button type="button" className={actionIconBtn} onClick={() => handleEditLine(r.id)}><img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
          <button type="button" className={actionIconBtn} onClick={() => handleDeleteLine(r.id)}><img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button>
        </div>,
      ];
    });
  }, [paginatedRows, page, pageSize, editingRowId, accountOptions, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const tableFooterRow = useMemo(() => [
    { content: <div key="t" className="text-left font-bold">Total</div>, colSpan: 2, className: 'align-middle font-bold' },
    <span key="dr" className="font-bold">Dr {formatMoney(totalDebit)}</span>,
    <span key="cr" className="font-bold">Cr {formatMoney(totalCredit)}</span>,
    '',
  ], [totalDebit, totalCredit]);

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          JOURNAL VOUCHER ENTRY
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`}><img src={PrinterIcon} alt="" className="h-3.5 w-3.5" /></button>
          <button type="button" className={figmaToolbarBtn} onClick={handlePost}><img src={PostIcon} alt="" className="h-3.5 w-3.5" /> Post</button>
          <button type="button" className={figmaToolbarBtn} onClick={handleUnpost}><img src={UnpostIcon} alt="" className="h-3.5 w-3.5" /> Unpost</button>
          <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDeleteDocument}>
            <img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" /> Delete
          </button>
          <button type="button" className={figmaToolbarBtn} onClick={handleSave} disabled={saving}>
            <SaveDiskIcon className="h-3.5 w-3.5 shrink-0" /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={handleNew}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" /> <span className="hidden sm:inline">New Journal Voucher</span><span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`rounded px-3 py-1.5 text-xs font-semibold ${statusMsg.includes('success') || statusMsg.includes('posted') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {statusMsg}
        </div>
      )}

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="shrink-0">
          <DropdownInput label="Voucher Type" value={voucherType}
            onChange={(val) => {
              setVoucherType(val);
              const match = voucherTypes.find((t) => t.voucherName === val);
              setVoucherTypeId(match ? match.voucherTypeId : null);
            }}
            options={voucherTypes.map((t) => t.voucherName)} placeholder="Select" />
        </div>
        <div className="shrink-0">
          <SubInputField label="Voucher No" value={voucherNo} readOnly placeholder="Auto" />
        </div>
        <div className="shrink-0">
          <SubInputField label="Ref No" value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="Reference" />
        </div>
        <div className="shrink-0">
          <DateInputField label="Journal Date" value={journalDate} onChange={setJournalDate} />
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={handleAddLine}
            className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white"
            style={{ backgroundColor: primary, borderColor: primary }}>Add Line</button>
        </div>
      </div>

      <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
        <div className="w-full max-w-xs sm:max-w-sm">
          <label className="text-[9px] font-semibold text-black sm:text-[11px]" style={{ color: '#374151' }}>Remark</label>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} placeholder="Remarks…"
            className="mt-1 box-border min-h-[3rem] w-full max-w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[9px] outline-none focus:border-gray-400 sm:text-[10px]"
            style={{ background: colors.input?.background ?? '#fff' }} />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable
          className="journal-voucher-entry-table flex min-h-0 min-w-0 flex-1 flex-col"
          fitParentWidth allowHorizontalScroll={isCompactTable} truncateHeader truncateBody={editingRowId == null}
          columnWidthPercents={LINE_COL_PCT}
          tableClassName={isCompactTable ? 'min-w-[42rem] w-full' : 'min-w-0 w-full'}
          hideVerticalCellBorders cellAlign="center"
          headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
          bodyFontSize="clamp(8px, 1vw, 10px)"
          cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
          bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
          headers={['Sl', 'Account', 'Debit', 'Credit', 'Action']}
          rows={tableBodyRows}
          footerRow={tableFooterRow}
        />

        <div className="mt-2 grid w-full min-w-0 shrink-0 grid-cols-1 items-center justify-items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-x-2 sm:gap-y-0">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-center font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700 sm:text-left">
              Showing <span className="text-black">{rangeStart}</span>–<span className="text-black">{rangeEnd}</span> of <span className="text-black">{totalFiltered}</span>
            </p>
            <label className="flex items-center gap-1 font-['Open_Sans',sans-serif] text-[10px] font-semibold text-gray-700">
              Rows
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-6 w-10 min-w-0 cursor-pointer rounded border border-gray-200 bg-white px-0.5 py-0 text-center text-[10px] font-semibold text-black outline-none hover:border-gray-300">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <span className="hidden sm:block" aria-hidden />
          <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch justify-self-center overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-stretch border-l border-gray-200">
              {pageNumbers.map((n) => (
                <button key={n} type="button"
                  className={`min-w-[1.75rem] px-2 text-center text-[10px] font-semibold leading-7 transition-colors ${n === page ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`}
                  style={n === page ? { backgroundColor: primary } : undefined}
                  onClick={() => setPage(n)}>{n}</button>
              ))}
            </div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={closeDetailModal}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Line Detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Account" fullWidth readOnly value={detailRow.accountLabel || '—'} />
              <InputField label="Debit" fullWidth readOnly value={formatMoney(parseMoney(detailRow.debit))} />
              <InputField label="Credit" fullWidth readOnly value={formatMoney(parseMoney(detailRow.credit))} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
