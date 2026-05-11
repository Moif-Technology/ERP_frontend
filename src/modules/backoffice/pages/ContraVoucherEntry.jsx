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
const LINE_COL_PCT = [7, 36, 18.5, 18.5, 20];
const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn = 'inline-flex h-7 min-h-7 shrink-0 items-center gap-1 rounded-[3px] border px-2 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';
const actionIconBtn = 'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';
const cellInputClass = 'box-border w-full min-w-0 max-w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-center text-[clamp(8px,1vw,10px)] outline-none focus:border-gray-400 sm:px-1.5';

function fmt(n) { return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function parse(s) { const n = Number(String(s ?? '').replace(/,/g, '')); return Number.isFinite(n) ? n : 0; }
function SaveIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>; }
function PlusIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>; }
function freshLine() { return { id: `cv-${Date.now()}-${Math.random().toString(36).slice(2)}`, accountId: '', accountLabel: '', debit: '0.00', credit: '0.00' }; }

export default function ContraVoucherEntry() {
  const [accountOptions, setAccountOptions] = useState([]);
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [tableData, setTableData] = useState([freshLine()]);
  const [voucherType, setVoucherType] = useState('');
  const [voucherTypeId, setVoucherTypeId] = useState(null);
  const [voucherNo, setVoucherNo] = useState('');
  const [loadedVoucherId, setLoadedVoucherId] = useState(null);
  const [refNo, setRefNo] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [detailRowId, setDetailRowId] = useState(null);

  useEffect(() => {
    accountsApi.listAccountHeads({ postingOnly: true }).then((r) => setAccountOptions(r.data?.accountHeads || [])).catch(() => {});
    accountsApi.listVoucherTypes().then((r) => setVoucherTypes(r.data?.voucherTypes || [])).catch(() => {});
  }, []);

  const updateLine = useCallback((id, patch) => setTableData((p) => p.map((r) => r.id === id ? { ...r, ...patch } : r)), []);
  const handleAddLine = useCallback(() => setTableData((p) => [...p, freshLine()]), []);
  const handleViewLine = useCallback((id) => { setEditingRowId(null); setDetailRowId(id); }, []);
  const handleEditLine = useCallback((id) => { setDetailRowId(null); setEditingRowId((p) => p === id ? null : id); }, []);
  const handleDeleteLine = useCallback((id) => { setTableData((p) => p.filter((r) => r.id !== id)); setDetailRowId((c) => c === id ? null : c); setEditingRowId((c) => c === id ? null : c); }, []);
  const closeDetailModal = useCallback(() => setDetailRowId(null), []);
  const detailRow = useMemo(() => detailRowId ? tableData.find((r) => r.id === detailRowId) : null, [detailRowId, tableData]);
  useEffect(() => { if (!detailRowId) return; const h = (e) => { if (e.key === 'Escape') setDetailRowId(null); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [detailRowId]);

  const resetForm = useCallback(() => { setTableData([freshLine()]); setVoucherType(''); setVoucherTypeId(null); setVoucherNo(''); setLoadedVoucherId(null); setRefNo(''); setEntryDate(''); setRemark(''); setStatusMsg(''); setPage(1); setEditingRowId(null); setDetailRowId(null); }, []);

  const handleSave = useCallback(async () => {
    setStatusMsg('');
    if (!voucherTypeId) { setStatusMsg('Select a voucher type'); return; }
    const lines = tableData.filter((l) => l.accountId && (parse(l.debit) > 0 || parse(l.credit) > 0));
    if (!lines.length) { setStatusMsg('Add at least one line with account and amount'); return; }
    const totalDr = lines.reduce((s, l) => s + parse(l.debit), 0);
    const totalCr = lines.reduce((s, l) => s + parse(l.credit), 0);
    if (Math.abs(totalDr - totalCr) > 0.01) { setStatusMsg(`Debit (${fmt(totalDr)}) and Credit (${fmt(totalCr)}) must balance`); return; }
    setSaving(true);
    try {
      const payload = { voucherTypeId, referenceNo: refNo || null, remarks: remark || null, voucherDate: entryDate || undefined, lines: lines.map((l) => ({ accountId: Number(l.accountId), debitAmount: parse(l.debit), creditAmount: parse(l.credit), narration: remark || null })) };
      if (loadedVoucherId) { await accountsApi.updateVoucher(loadedVoucherId, payload); setStatusMsg('Voucher updated'); }
      else { const res = await accountsApi.createVoucher(payload); const d = res.data; setVoucherNo(d.voucherNo || `${d.voucherPrefix}${d.autoVoucherNo}`); setLoadedVoucherId(d.voucherMasterId); setStatusMsg('Voucher saved'); }
    } catch (e) { setStatusMsg(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  }, [voucherTypeId, tableData, refNo, remark, entryDate, loadedVoucherId]);

  const handlePost = useCallback(async () => { if (!loadedVoucherId) { setStatusMsg('Save the voucher first'); return; } try { await accountsApi.postVoucher(loadedVoucherId); setStatusMsg('Voucher posted'); } catch (e) { setStatusMsg(e.response?.data?.message || 'Failed to post'); } }, [loadedVoucherId]);
  const handleUnpost = useCallback(async () => { if (!loadedVoucherId) { setStatusMsg('No voucher loaded'); return; } try { await accountsApi.unpostVoucher(loadedVoucherId); setStatusMsg('Voucher unposted'); } catch (e) { setStatusMsg(e.response?.data?.message || 'Failed to unpost'); } }, [loadedVoucherId]);
  const handleDelete = useCallback(async () => { if (loadedVoucherId) { if (!window.confirm('Delete this voucher?')) return; try { await accountsApi.deleteVoucher(loadedVoucherId); } catch (e) { setStatusMsg(e.response?.data?.message || 'Failed to delete'); return; } } resetForm(); }, [loadedVoucherId, resetForm]);

  const totalDebit = useMemo(() => tableData.reduce((s, r) => s + parse(r.debit), 0), [tableData]);
  const totalCredit = useMemo(() => tableData.reduce((s, r) => s + parse(r.credit), 0), [tableData]);
  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize));
  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);
  const paginatedRows = useMemo(() => { const s = (page - 1) * pageSize; return tableData.slice(s, s + pageSize); }, [tableData, page, pageSize]);
  const rangeStart = tableData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, tableData.length);
  const pageNumbers = useMemo(() => { if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1); let s = Math.max(1, page - 1); let e = Math.min(totalPages, s + 2); s = Math.max(1, e - 2); return Array.from({ length: e - s + 1 }, (_, i) => s + i); }, [page, totalPages]);

  const tableBodyRows = useMemo(() => paginatedRows.map((r, idx) => {
    const slNo = (page - 1) * pageSize + idx + 1;
    const isEdit = editingRowId === r.id;
    const accountCell = isEdit ? (<select key={`a-${r.id}`} value={r.accountId} className={`${cellInputClass} text-left`} onChange={(e) => { const acc = accountOptions.find((a) => String(a.accountId) === e.target.value); updateLine(r.id, { accountId: e.target.value, accountLabel: acc ? `${acc.accountNo} – ${acc.accountHead}` : '' }); }}><option value="">— Select —</option>{accountOptions.map((a) => <option key={a.accountId} value={a.accountId}>{a.accountNo} – {a.accountHead}</option>)}</select>) : <span key={`a-${r.id}`} className="block w-full text-left">{r.accountLabel || '(select account)'}</span>;
    const drCell = isEdit ? <input key={`d-${r.id}`} type="text" inputMode="decimal" className={cellInputClass} value={r.debit} onChange={(e) => updateLine(r.id, { debit: e.target.value })} /> : fmt(parse(r.debit));
    const crCell = isEdit ? <input key={`c-${r.id}`} type="text" inputMode="decimal" className={cellInputClass} value={r.credit} onChange={(e) => updateLine(r.id, { credit: e.target.value })} /> : fmt(parse(r.credit));
    return [slNo, accountCell, drCell, crCell, <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1"><button type="button" className={actionIconBtn} onClick={() => handleViewLine(r.id)}><img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button><button type="button" className={actionIconBtn} onClick={() => handleEditLine(r.id)}><img src={EditIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button><button type="button" className={actionIconBtn} onClick={() => handleDeleteLine(r.id)}><img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></button></div>];
  }), [paginatedRows, page, pageSize, editingRowId, accountOptions, updateLine, handleViewLine, handleEditLine, handleDeleteLine]);

  const tableFooterRow = useMemo(() => [{ content: <div key="tot" className="text-left font-bold">Total</div>, colSpan: 2, className: 'align-middle font-bold' }, <span key="dr" className="font-bold">Dr {fmt(totalDebit)}</span>, <span key="cr" className="font-bold">Cr {fmt(totalCredit)}</span>, ''], [totalDebit, totalCredit]);
  const isOk = (m) => m.includes('saved') || m.includes('updated') || m.includes('posted') || m.includes('unposted');

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>CONTRA VOUCHER ENTRY</h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`}><img src={PrinterIcon} alt="" className="h-3.5 w-3.5" /></button>
          <button type="button" className={figmaToolbarBtn} onClick={handlePost}><img src={PostIcon} alt="" className="h-3.5 w-3.5" /> Post</button>
          <button type="button" className={figmaToolbarBtn} onClick={handleUnpost}><img src={UnpostIcon} alt="" className="h-3.5 w-3.5" /> Unpost</button>
          <button type="button" className={`${figmaToolbarBtn} font-semibold text-black`} onClick={handleDelete}><img src={DeleteIcon} alt="" className="h-3.5 w-3.5 brightness-0" /> Delete</button>
          <button type="button" className={figmaToolbarBtn} onClick={handleSave} disabled={saving}><SaveIcon className="h-3.5 w-3.5 shrink-0" /> {saving ? 'Saving...' : 'Save'}</button>
          <button type="button" className={primaryToolbarBtn} style={{ backgroundColor: primary, borderColor: primary }} onClick={resetForm}><PlusIcon className="h-3.5 w-3.5 shrink-0 text-white" /> <span className="hidden sm:inline">New Contra Voucher</span><span className="sm:hidden">New</span></button>
        </div>
      </div>
      {statusMsg && <div className={`rounded px-3 py-1.5 text-xs font-semibold ${isOk(statusMsg) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{statusMsg}</div>}
      <div className="flex min-w-0 flex-nowrap items-end gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-3 sm:p-3">
        <div className="shrink-0"><DropdownInput label="Voucher Type" value={voucherType} onChange={(val) => { setVoucherType(val); const m = voucherTypes.find((t) => t.voucherName === val); setVoucherTypeId(m ? m.voucherTypeId : null); }} options={voucherTypes.map((t) => t.voucherName)} placeholder="Select" /></div>
        <div className="shrink-0"><SubInputField label="Voucher No" value={voucherNo} readOnly placeholder="Auto" /></div>
        <div className="shrink-0"><SubInputField label="Ref No" value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="Reference" /></div>
        <div className="shrink-0"><DateInputField label="Contra Date" value={entryDate} onChange={setEntryDate} /></div>
        <div className="ml-auto flex shrink-0 items-end"><button type="button" onClick={handleAddLine} className="inline-flex h-[26px] min-h-[26px] shrink-0 items-center justify-center rounded border px-2.5 py-0 text-[10px] font-semibold leading-none text-white" style={{ backgroundColor: primary, borderColor: primary }}>Add Line</button></div>
      </div>
      <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2 sm:p-3">
        <div className="w-full max-w-xs sm:max-w-sm">
          <label className="text-[9px] font-semibold sm:text-[11px]" style={{ color: '#374151' }}>Remark</label>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} placeholder="Remarks..." className="mt-1 box-border min-h-[3rem] w-full max-w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-[9px] outline-none focus:border-gray-400 sm:text-[10px]" />
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CommonTable fitParentWidth allowHorizontalScroll columnWidthPercents={LINE_COL_PCT} hideVerticalCellBorders cellAlign="center" headerFontSize="clamp(7px,0.85vw,10px)" headerTextColor="#6b7280" bodyFontSize="clamp(8px,1vw,10px)" cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5" bodyRowHeightRem={2.35} maxVisibleRows={pageSize} headers={['Sl no', 'Account name', 'Debit', 'Credit', 'Actions']} rows={tableBodyRows} footerRow={tableFooterRow} />
        <div className="mt-2 grid w-full shrink-0 grid-cols-1 items-center gap-y-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 sm:gap-y-0">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <p className="text-[10px] font-semibold text-gray-700">Showing <span className="text-black">{rangeStart}-{rangeEnd}</span> of <span className="text-black">{tableData.length}</span></p>
            <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-700">Rows<select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-6 w-10 rounded border border-gray-200 bg-white text-center text-[10px] font-semibold outline-none">{PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          </div>
          <span className="hidden sm:block" aria-hidden />
          <div className="inline-flex h-7 w-max max-w-full shrink-0 items-stretch overflow-hidden rounded-[3px] border border-gray-200 bg-white sm:justify-self-end" role="navigation">
            <button type="button" className="inline-flex w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-35" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <div className="flex items-stretch border-l border-gray-200">{pageNumbers.map((n) => <button key={n} type="button" onClick={() => setPage(n)} className={`min-w-[1.75rem] px-2 text-[10px] font-semibold leading-7 ${n === page ? 'text-white' : 'text-gray-700 hover:bg-gray-50'} ${n !== pageNumbers[0] ? 'border-l border-gray-200' : ''}`} style={n === page ? { backgroundColor: primary } : undefined}>{n}</button>)}</div>
            <button type="button" className="inline-flex w-8 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-35" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>
        </div>
      </div>
      {detailRowId && detailRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100" onClick={closeDetailModal}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Line detail</h2>
            <div className="mt-3 flex flex-col gap-3"><InputField label="Account" fullWidth readOnly value={detailRow.accountLabel || '-'} /><InputField label="Debit" fullWidth readOnly value={fmt(parse(detailRow.debit))} /><InputField label="Credit" fullWidth readOnly value={fmt(parse(detailRow.credit))} /></div>
          </div>
        </div>
      )}
    </div>
  );
}