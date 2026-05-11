import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import CommonTable from '../../../shared/components/ui/CommonTable';
import { DropdownInput, InputField, SubInputField, DateInputField } from '../../../shared/components/ui';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import ViewIcon from '../../../shared/assets/icons/view.svg';
import EditIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteIcon from '../../../shared/assets/icons/delete2.svg';
import * as accountsApi from '../../../services/accounts.api';

const primary = colors.primary?.main || '#790728';
const PAGE_SIZE_OPTIONS = [10, 15, 20, 30];
const LINE_COL_PCT = [36, 18, 18, 28];

const actionIconBtn =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-transparent p-0 text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 sm:h-7 sm:w-7';

const figmaOutline = 'rounded-[3px] bg-white outline outline-[0.5px] outline-offset-[-0.5px] outline-black';
const figmaToolbarBtn = `inline-flex h-7 min-h-7 shrink-0 items-center gap-1 px-1.5 py-[3px] text-[10px] font-semibold leading-5 text-black ${figmaOutline} hover:bg-neutral-50`;
const primaryToolbarBtn =
  'inline-flex h-7 min-h-7 shrink-0 items-center justify-center rounded-[3px] border px-2.5 py-[3px] text-[10px] font-semibold leading-5 text-white shadow-sm transition-opacity hover:opacity-95';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useViewportMaxWidth(maxPx) {
  const query = `(max-width: ${maxPx}px)`;
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function AccountGroupDetails() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trialData, setTrialData] = useState([]);
  const [groupFilter, setGroupFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const isCompactTable = useViewportMaxWidth(1023);
  const [detailRowId, setDetailRowId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newAccountHead, setNewAccountHead] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [newPosting, setNewPosting] = useState('Yes');
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsApi.getAccountTree();
      const flat = res.data?.flat || [];
      setAccounts(flat);
    } catch (e) {
      console.error('Failed to load account tree', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrialBalance = useCallback(async () => {
    try {
      const res = await accountsApi.getTrialBalance({});
      setTrialData(res.data?.accounts || []);
    } catch { /* trial balance may not exist yet */ }
  }, []);

  useEffect(() => { loadTree(); loadTrialBalance(); }, [loadTree, loadTrialBalance]);

  const filteredRows = useMemo(() => {
    let rows = accounts.map((a) => {
      const tb = trialData.find((t) => t.accountId === a.accountId);
      return {
        id: `ag-${a.accountId}`,
        accountId: a.accountId,
        particular: `${a.accountNo} – ${a.accountHead}`,
        accountNo: a.accountNo,
        accountHead: a.accountHead,
        accountType: a.accountType || '',
        parentAccId: a.parentAccId,
        postingAllowed: a.postingAllowed,
        debit: tb ? tb.totalDebit : 0,
        credit: tb ? tb.totalCredit : 0,
      };
    });
    if (groupFilter.trim()) {
      const q = groupFilter.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.particular.toLowerCase().includes(q) || (r.accountType || '').toLowerCase().includes(q)
      );
    }
    return rows;
  }, [accounts, trialData, groupFilter]);

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => { setPage((p) => Math.min(Math.max(1, p), totalPages)); }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const totalDebit = useMemo(() => filteredRows.reduce((s, r) => s + r.debit, 0), [filteredRows]);
  const totalCredit = useMemo(() => filteredRows.reduce((s, r) => s + r.credit, 0), [filteredRows]);

  const handleDelete = useCallback(async (accountId) => {
    if (!window.confirm('Delete this account head?')) return;
    try {
      await accountsApi.deleteAccountHead(accountId);
      loadTree();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not delete');
    }
  }, [loadTree]);

  const detailRow = useMemo(
    () => (detailRowId ? filteredRows.find((r) => r.id === detailRowId) : null),
    [detailRowId, filteredRows],
  );

  const closeDetailModal = useCallback(() => setDetailRowId(null), []);

  const tableBodyRows = useMemo(() => {
    return paginatedRows.map((r) => [
      <span key={`p-${r.id}`} className="block w-full text-left">{r.particular}</span>,
      formatMoney(r.debit),
      formatMoney(r.credit),
      <div key={`act-${r.id}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
        <button type="button" className={actionIconBtn} aria-label="View" onClick={() => setDetailRowId(r.id)}>
          <img src={ViewIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        <button type="button" className={actionIconBtn} aria-label="Delete" onClick={() => handleDelete(r.accountId)}>
          <img src={DeleteIcon} alt="" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>,
    ]);
  }, [paginatedRows, handleDelete]);

  const tableFooterRow = useMemo(
    () => [
      { content: <div key="ft" className="text-left font-bold">Grand total</div>, colSpan: 1, className: 'align-middle font-bold' },
      <span key="dr" className="font-bold">{formatMoney(totalDebit)}</span>,
      <span key="cr" className="font-bold">{formatMoney(totalCredit)}</span>,
      '',
    ],
    [totalDebit, totalCredit],
  );

  const pageNumbers = useMemo(() => {
    const maxBtns = 3;
    if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const handleCreate = useCallback(async () => {
    setErrMsg('');
    if (!newAccountNo.trim() || !newAccountHead.trim()) {
      setErrMsg('Account No and Account Head are required');
      return;
    }
    setSaving(true);
    try {
      await accountsApi.createAccountHead({
        accountNo: newAccountNo.trim(),
        accountHead: newAccountHead.trim(),
        accountType: newAccountType.trim() || null,
        parentAccId: newParentId ? Number(newParentId) : null,
        postingAllowed: newPosting === 'Yes',
      });
      setShowCreateModal(false);
      setNewAccountNo('');
      setNewAccountHead('');
      setNewAccountType('');
      setNewParentId('');
      setNewPosting('Yes');
      loadTree();
    } catch (e) {
      setErrMsg(e.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  }, [newAccountNo, newAccountHead, newAccountType, newParentId, newPosting, loadTree]);

  return (
    <div className="box-border flex h-full min-h-0 w-[calc(100%+26px)] max-w-none min-w-0 flex-1 -mx-[13px] flex-col gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-sm font-bold leading-tight sm:text-base md:text-lg xl:text-xl" style={{ color: primary }}>
          CHART OF ACCOUNTS
        </h1>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button type="button" className={`${figmaToolbarBtn} px-2`} aria-label="Print">
            <img src={PrinterIcon} alt="" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${primaryToolbarBtn}`}
            style={{ backgroundColor: primary, borderColor: primary }}
            onClick={() => setShowCreateModal(true)}
          >
            + New Account
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-3 rounded-lg border border-gray-200 bg-slate-50/70 p-2 sm:gap-x-3 sm:gap-y-3 sm:p-3">
        <div className="min-w-[16rem] w-full max-w-full shrink-0 sm:min-w-[22rem] sm:w-[22rem]">
          <SubInputField label="Search" fullWidth value={groupFilter} onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }} placeholder="Filter by name or type…" />
        </div>
        <div className="ml-auto flex shrink-0 items-end">
          <button type="button" onClick={() => { loadTree(); loadTrialBalance(); }} className={`${primaryToolbarBtn} h-[26px] min-h-[26px]`} style={{ backgroundColor: primary, borderColor: primary }}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">Loading accounts…</div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CommonTable
            className="account-group-details-table flex min-h-0 min-w-0 flex-1 flex-col"
            fitParentWidth allowHorizontalScroll={isCompactTable} truncateHeader truncateBody
            columnWidthPercents={LINE_COL_PCT}
            tableClassName={isCompactTable ? 'min-w-[40rem] w-full' : 'min-w-0 w-full'}
            hideVerticalCellBorders cellAlign="center"
            headerFontSize="clamp(7px, 0.85vw, 10px)" headerTextColor="#6b7280"
            bodyFontSize="clamp(8px, 1vw, 10px)"
            cellPaddingClass="px-0.5 py-1 sm:px-1 sm:py-1.5"
            bodyRowHeightRem={2.35} maxVisibleRows={pageSize}
            headers={['Account', 'Total Debit', 'Total Credit', 'Action']}
            rows={tableBodyRows}
            footerRow={totalFiltered > 0 ? tableFooterRow : null}
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
      )}

      {/* View detail modal */}
      {detailRowId && detailRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={closeDetailModal} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={closeDetailModal}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Account Detail</h2>
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Account No" fullWidth readOnly value={detailRow.accountNo} />
              <InputField label="Account Head" fullWidth readOnly value={detailRow.accountHead} />
              <InputField label="Type" fullWidth readOnly value={detailRow.accountType || '—'} />
              <InputField label="Posting Allowed" fullWidth readOnly value={detailRow.postingAllowed ? 'Yes' : 'No'} />
              <InputField label="Total Debit" fullWidth readOnly value={formatMoney(detailRow.debit)} />
              <InputField label="Total Credit" fullWidth readOnly value={formatMoney(detailRow.credit)} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Create account modal */}
      {showCreateModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 pt-5 shadow-xl sm:max-w-lg sm:p-5 sm:pt-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" onClick={() => setShowCreateModal(false)}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <h2 className="pr-10 text-sm font-bold sm:text-base" style={{ color: primary }}>Create Account Head</h2>
            {errMsg && <p className="mt-2 text-xs text-red-600">{errMsg}</p>}
            <div className="mt-3 flex flex-col gap-3 sm:mt-4">
              <InputField label="Account No *" fullWidth value={newAccountNo} onChange={(e) => setNewAccountNo(e.target.value)} placeholder="e.g. 03-02-003" />
              <InputField label="Account Head *" fullWidth value={newAccountHead} onChange={(e) => setNewAccountHead(e.target.value)} placeholder="e.g. CASH IN HAND" />
              <InputField label="Account Type" fullWidth value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)} placeholder="e.g. ASSET, LIABILITY, INCOME, EXPENSE" />
              <DropdownInput label="Parent Account" value={newParentId ? accounts.find(a => a.accountId === Number(newParentId))?.accountHead || newParentId : ''}
                onChange={(val) => {
                  const match = accounts.find(a => a.accountHead === val || `${a.accountNo} – ${a.accountHead}` === val);
                  setNewParentId(match ? String(match.accountId) : '');
                }}
                options={accounts.filter(a => !a.postingAllowed).map(a => `${a.accountNo} – ${a.accountHead}`)}
                placeholder="None (root)" />
              <DropdownInput label="Posting Allowed" value={newPosting} onChange={setNewPosting} options={['Yes', 'No']} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="rounded border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleCreate} disabled={saving}
                  className="rounded px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ backgroundColor: primary }}>
                  {saving ? 'Saving…' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
