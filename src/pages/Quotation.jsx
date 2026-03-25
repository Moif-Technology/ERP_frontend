/**
 * Quotation screen – Modern, readable layout. Effective space use.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, inputField } from '../constants/theme';
import { InputField, SubInputField, CommonTable } from '../components/ui';
import PrinterIcon from '../assets/icons/printer.svg';
import SearchIcon from '../assets/icons/search2.svg';

const primary = colors.primary?.main || '#790728';
const primaryHover = colors.primary?.[50] || '#F2E6EA';

const MOCK_CUSTOMERS = [
  { value: 1, label: 'Customer A' },
  { value: 2, label: 'Customer B' },
  { value: 3, label: 'Customer C' },
];

const MOCK_PRODUCTS = [
  { productId: 1, shortDescription: 'Product 1', unitPrice: 100, barCode: 'P001', unit: 'PCS' },
  { productId: 2, shortDescription: 'Product 2', unitPrice: 250, barCode: 'P002', unit: 'PCS' },
  { productId: 3, shortDescription: 'Product 3', unitPrice: 75, barCode: 'P003', unit: 'KG' },
];

const DUMMY_ITEMS = [
  {
    ownRefNo: 'P001',
    productCode: 'P001',
    shortDescription: 'Product 1',
    location: 'LOC-01',
    unit: 'PCS',
    qty: 2,
    unitPrice: 100,
    discPct: 0,
    discAmt: 0,
    subTotal: 200,
    taxPct: 5,
    taxAmount: 10,
    lineTotal: 210,
    origin: 'Local',
    stockStatus: '0',
  },
  {
    ownRefNo: 'P002',
    productCode: 'P002',
    shortDescription: 'Product 2',
    location: 'LOC-02',
    unit: 'PCS',
    qty: 1,
    unitPrice: 250,
    discPct: 0,
    discAmt: 0,
    subTotal: 250,
    taxPct: 5,
    taxAmount: 12.5,
    lineTotal: 262.5,
    origin: 'Local',
    stockStatus: '0',
  },
  {
    ownRefNo: 'P003',
    productCode: 'P003',
    shortDescription: 'Product 3',
    location: 'LOC-03',
    unit: 'KG',
    qty: 3,
    unitPrice: 75,
    discPct: 0,
    discAmt: 0,
    subTotal: 225,
    taxPct: 5,
    taxAmount: 11.25,
    lineTotal: 236.25,
    origin: 'Local',
    stockStatus: '0',
  },
];

export default function Quotation() {
  const navigate = useNavigate();

  const [quotationNo, setQuotationNo] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [custRefNo, setCustRefNo] = useState('');
  const [custRefDate, setCustRefDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState(0);
  const [customerAddress, setCustomerAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [ownRefNo, setOwnRefNo] = useState('');
  const [productCode, setProductCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discPct, setDiscPct] = useState(0);
  const [discAmt, setDiscAmt] = useState(0);
  const [taxPct, setTaxPct] = useState(5);

  const [items, setItems] = useState(() => DUMMY_ITEMS.map((it, i) => ({ ...it, slNo: i + 1 })));
  const [subTotal, setSubTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const [quotationTerms, setQuotationTerms] = useState('');
  const [saveTerms, setSaveTerms] = useState(false);
  const [printLocn, setPrintLocn] = useState(false);
  const [printOwnRefNo, setPrintOwnRefNo] = useState(true);
  const [printOtherFormat, setPrintOtherFormat] = useState(false);

  const [productInfo, setProductInfo] = useState({ lastCost: '', origin: '', minPrice: '', stock: '', loc: '' });
  const [attachments, setAttachments] = useState(false);

  const getFilteredProducts = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_PRODUCTS.filter((p) => {
      const shortDesc = String(p.shortDescription ?? '').toLowerCase();
      const code = String(p.barCode ?? '').toLowerCase();
      const unit = String(p.unit ?? '').toLowerCase();
      return shortDesc.includes(q) || code.includes(q) || unit.includes(q);
    });
  };

  const handleProductSearch = () => {
    const term = productSearch.trim();
    const filtered = getFilteredProducts(term);
    setProductResults(filtered);
    setShowSearchDropdown(true);
  };

  const selectProduct = (p) => {
    setOwnRefNo(p.barCode ?? '');
    setProductCode(p.barCode ?? '');
    setShortDescription(p.shortDescription ?? '');
    setUnit(p.unit ?? '');
    setUnitPrice(Number(p.unitPrice ?? 0));
    setProductInfo({ lastCost: '', origin: '', minPrice: '', stock: '0', loc: '' });
    setProductResults([]);
    setShowSearchDropdown(false);
    setProductSearch('');
  };

  const addItem = () => {
    if (!shortDescription || qty <= 0) return;
    const sub = qty * unitPrice - discAmt;
    const tax = Math.round(sub * (taxPct / 100) * 100) / 100;
    const lineTotal = sub + tax;
    const newItem = {
      ownRefNo,
      productCode,
      shortDescription,
      location: location || productInfo.loc,
      unit,
      qty,
      unitPrice,
      discPct,
      discAmt,
      subTotal: sub,
      taxPct,
      taxAmount: tax,
      lineTotal,
      origin: productInfo.origin,
      stockStatus: productInfo.stock,
    };

    // Add to the TOP and re-number the table rows.
    setItems((prev) => [
      { ...newItem, slNo: 1 },
      ...prev.map((r, i) => ({ ...r, slNo: i + 2 })),
    ]);
    setQty(1);
    setUnitPrice(0);
    setDiscPct(0);
    setDiscAmt(0);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, slNo: i + 1 })));
  };

  useEffect(() => {
    let sub = 0;
    let tax = 0;
    items.forEach((r) => {
      sub += r.subTotal;
      tax += r.taxAmount ?? 0;
    });
    const tot = sub - discountAmount + tax;
    setSubTotal(sub);
    setTaxAmount(tax);
    setTotalAmount(tot);
    setNetAmount(Math.round((tot + Number(roundOff || 0)) * 100) / 100);
  }, [items, discountAmount, roundOff]);

  const inputBase = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#790728] focus:outline-none focus:ring-2 focus:ring-[#790728]/20 transition-colors';

  /** Sale.jsx Paid Amount row pattern — label + gray field (labels right-aligned in column) */
  const detailRowLabel =
    'min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-right sm:text-[10px]';
  /** Quote Details — labels flush left */
  const quoteDetailRowLabel =
    'min-w-0 shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:w-[120px] sm:text-[10px]';
  const detailRowInput =
    'min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <style>{`
        .qtn-outline:hover { border-color: ${primary} !important; background: ${primaryHover} !important; color: ${primary} !important; }
        .qtn-primary:hover { filter: brightness(1.05); }
      `}</style>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between bg-white px-5 py-3">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: primary }}>Quotation</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="qtn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <img src={PrinterIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
              Print
            </button>
            <button
              type="button"
              className="qtn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] font-medium transition-colors sm:px-2 sm:py-1 sm:text-[11px]"
            >
              Save
            </button>
            {/* <button type="button" onClick={() => navigate(-1)} className="qtn-outline flex h-9 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors">Close</button> */}
          </div>
        </header>

        {/* Main */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 lg:flex-row lg:gap-5">
          {/* Left */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            {/* Quote & Customer — same row layout as Sale.jsx Paid Amount section */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>
                  Quote Details
                </h2>
                <div className="flex flex-col gap-1 sm:gap-[8px]">
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Quotation No</label>
                    <input
                      type="text"
                      value={quotationNo}
                      onChange={(e) => setQuotationNo(e.target.value)}
                      className={detailRowInput}
                    />
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Quotation Date</label>
                    <input
                      type="date"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                      className={detailRowInput}
                    />
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Cust. Ref No</label>
                    <input
                      type="text"
                      value={custRefNo}
                      onChange={(e) => setCustRefNo(e.target.value)}
                      className={detailRowInput}
                    />
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Cust. Ref Date</label>
                    <input
                      type="date"
                      value={custRefDate}
                      onChange={(e) => setCustRefDate(e.target.value)}
                      className={detailRowInput}
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
                <h2 className="mb-2 text-sm font-semibold" style={{ color: primary }}>
                  Customer
                </h2>
                <div className="flex flex-col gap-1 sm:gap-[8px]">
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Customer Name</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(Number(e.target.value))}
                      className={`${detailRowInput} cursor-pointer`}
                      style={{ accentColor: primary }}
                    >
                      <option value={0}>— Select Customer —</option>
                      {MOCK_CUSTOMERS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex w-full items-start justify-start gap-2 sm:gap-[10px]">
                    <label className={`${quoteDetailRowLabel} pt-1`}>Address</label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows={2}
                      className={`${detailRowInput} min-h-[48px] resize-y`}
                    />
                  </div>
                  <div className="flex w-full items-center justify-start gap-2 sm:gap-[10px]">
                    <label className={quoteDetailRowLabel}>Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={detailRowInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Add Item — heading row with search on right */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold" style={{ color: primary }}>
                  Add Item
                </h2>
                <div className="relative w-full max-w-[300px] min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductSearch(val);
                      setProductResults(getFilteredProducts(val));
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => {
                      setProductResults(getFilteredProducts(productSearch));
                      setShowSearchDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleProductSearch();
                      }
                    }}
                    className="h-[24px] w-full rounded border border-gray-300 bg-white pl-2 pr-[60px] text-[9px] outline-none focus:border-[#790728] sm:h-[28px] sm:text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={handleProductSearch}
                    className="absolute right-1 top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded bg-transparent sm:h-[20px] sm:w-[20px]"
                    aria-label="Search"
                  >
                    <img src={SearchIcon} alt="" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>

                  {showSearchDropdown && productResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-[180px] overflow-auto rounded border border-gray-200 bg-white shadow-md">
                      {productResults.length > 0 && (
                        <div className="border-b border-gray-100 px-2 py-1 text-[8px] font-semibold text-gray-500 sm:text-[9px]">
                          Products
                        </div>
                      )}
                      {productResults.map((p) => (
                        <button
                          key={p.productId}
                          type="button"
                          onClick={() => selectProduct(p)}
                          className="block w-full px-2 py-1 text-left text-[8px] text-gray-700 hover:bg-gray-100 sm:text-[9px]"
                        >
                          {p.shortDescription} - {p.unitPrice} / {p.unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <SubInputField label="Own Ref" value={ownRefNo} onChange={(e) => setOwnRefNo(e.target.value)} />
                <InputField label="Product Code" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
                <InputField
                  label="Short Desc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
                <InputField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                <SubInputField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
                <SubInputField
                  label="Qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
                <SubInputField
                  label="Unit Price"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                />
                <SubInputField
                  label="Disc.%"
                  type="number"
                  value={discPct}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDiscPct(v);
                    setDiscAmt(qty * unitPrice * (v / 100));
                  }}
                />
                <SubInputField label="Disc" type="number" value={discAmt} onChange={(e) => setDiscAmt(Number(e.target.value))} />
                <SubInputField label="Tax%" type="number" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} />
                <div className="ml-auto flex shrink-0 items-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                    style={{ backgroundColor: primary }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="min-h-[140px] flex-1 overflow-auto p-2 sm:p-3">
              <CommonTable
                headers={['Sl', 'Own Ref', 'Product Code', 'Description', 'Loc', 'Unit', 'Qty', 'Price', 'Disc%', 'Disc', 'Tax%', 'Tax', 'Total', 'Origin', 'Stock', '']}
                rows={items.map((r, i) => [
                  r.slNo, r.ownRefNo, r.productCode, r.shortDescription, r.location, r.unit, r.qty,
                  r.unitPrice?.toFixed(2), r.discPct, r.discAmt?.toFixed(2), r.taxPct, r.taxAmount?.toFixed(2), r.lineTotal?.toFixed(2), r.origin, r.stockStatus,
                  <button key={i} type="button" onClick={() => removeItem(i)} className="rounded p-1.5 text-red-600 hover:bg-red-50">✕</button>,
                ])}
              />
            </div>

            {/* Terms */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Quotation Terms</h2>
                <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={saveTerms} onChange={(e) => setSaveTerms(e.target.checked)} className="h-4 w-4 rounded" /><span className="text-sm">Save Terms</span></label>
              </div>
              <textarea value={quotationTerms} onChange={(e) => setQuotationTerms(e.target.value)} rows={2} placeholder="Enter terms and conditions..." className={`mb-3 w-full resize-none ${inputBase}`} />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="qtn-outline rounded-md border border-gray-300 px-3 py-1.5 text-sm text-red-600">EDIT</button>
                <button type="button" className="qtn-outline rounded-md border border-gray-300 px-3 py-1.5 text-sm text-green-600">Duplicate</button>
                <button type="button" className="qtn-outline rounded-md border border-gray-300 px-3 py-1.5 text-sm text-purple-600">Print Proforma</button>
                <div className="flex gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={printLocn} onChange={(e) => setPrintLocn(e.target.checked)} className="h-4 w-4 rounded" /> Print Loctn.</label>
                  <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={printOwnRefNo} onChange={(e) => setPrintOwnRefNo(e.target.checked)} className="h-4 w-4 rounded" /> Print Own Ref No.</label>
                  <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={printOtherFormat} onChange={(e) => setPrintOtherFormat(e.target.checked)} className="h-4 w-4 rounded" /> Other Format</label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Info + Totals */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[260px]">
            <div className="rounded-lg border border-gray-200 bg-[#F2E6EA]/30 p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold" style={{ color: primary }}>Product Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Last Purchase Cost</span><span className="font-medium">{productInfo.lastCost || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Origin</span><span>{productInfo.origin || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Product Code</span><span>{productCode || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Min. Unit Price</span><span>{productInfo.minPrice || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Stock On Hand</span><span>{productInfo.stock || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Location</span><span>{productInfo.loc || '—'}</span></div>
                <label className="flex cursor-pointer items-center gap-2 pt-2"><input type="checkbox" checked={attachments} onChange={(e) => setAttachments(e.target.checked)} className="h-4 w-4 rounded" /><span>Attachments</span></label>
              </div>
            </div>
            <div className="rounded-lg border-2 border-[#790728]/50 bg-[#F2E6EA]/40 p-4 shadow-md">
              <h2 className="mb-3 text-sm font-bold" style={{ color: primary }}>Totals</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Sub Total</span><span className="font-semibold">{subTotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-gray-600">Discount Amount</span><input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-right text-sm" /></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Amount</span><span className="font-semibold">{totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Tax 5%</span><span>{taxAmount.toFixed(2)}</span></div>
                <div className="flex items-center justify-between gap-2"><span className="text-gray-600">Round Off</span><input type="number" value={roundOff} onChange={(e) => setRoundOff(e.target.value)} className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-right text-sm" /></div>
                <div className="flex justify-between border-t-2 border-gray-300 pt-3"><span className="text-base font-bold text-gray-800">Net Amount</span><span className="text-lg font-bold" style={{ color: primary }}>{netAmount.toFixed(2)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
