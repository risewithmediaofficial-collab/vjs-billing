import React, { useState, useEffect } from 'react';
import { 
  Wallet, Search, Plus, X, IndianRupee, Clock, 
  CheckCircle2, AlertTriangle, FileText, Printer, Camera, Image as ImageIcon, Loader2, User,
  CreditCard, Calendar
} from 'lucide-react';
import { calculateLoanInterest, generateLoanNumber, generateInvoiceNumber, formatCurrency, formatDate, SHOP_INFO, JEWEL_LOAN_TERMS } from '../data.js';

// ─── Printable Jewel Loan Card Bill (Pledge Passbook / Card) ─────────────────
function LoanCardBillPreview({ loan, onClose }) {
  const calc = calculateLoanInterest(
    loan.loanAmount,
    loan.interestRate,
    loan.issueDate,
    new Date().toISOString(),
    loan.overdueInterestRate,
    loan.dueDate
  );

  const handlePrint = () => {
    const printContent = document.getElementById('loan-card-print-area').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>CARD-BILL-${loan.loanNumber} - ${SHOP_INFO.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 15px; }
        .card-box { width: 100%; max-width: 620px; margin: 0 auto; border: 2px solid #111; padding: 20px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
        @media print { @page { margin: 0.5cm; } }
      </style>
      </head><body>${printContent}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 animate-fade-in">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-gray-800 font-bold text-xl flex items-center gap-2">
            <CreditCard className="text-amber-500" /> Jewel Loan Card Bill (Pledge Card)
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <button onClick={handlePrint} className="mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-sm w-full">
          <Printer size={16} /> Print Card Bill
        </button>

        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-4">
          <div id="loan-card-print-area" className="bg-white text-gray-900 p-6 max-w-[600px] mx-auto border-2 border-gray-900 rounded-lg shadow-sm">
            {/* Store Header */}
            <div className="text-center border-b-2 border-gray-900 pb-3 mb-3">
              <div className="font-extrabold text-2xl tracking-wide uppercase text-amber-700">{SHOP_INFO.name}</div>
              <div className="text-xs text-gray-600">{SHOP_INFO.address}</div>
              <div className="text-xs text-gray-600">Ph: {SHOP_INFO.phone} | GST: {SHOP_INFO.gstNumber}</div>
              <div className="mt-2 inline-block bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded tracking-wider uppercase">
                JEWEL LOAN CARD BILL / PLEDGE PASSBOOK
              </div>
            </div>

            {/* Top Loan Summary Row */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-gray-300 pb-3 mb-3 bg-amber-50/60 p-2.5 rounded border border-amber-200">
              <div><span className="font-bold">CARD / LOAN NO:</span> <span className="font-mono text-sm font-extrabold text-amber-900">{loan.loanNumber}</span></div>
              <div className="text-right"><span className="font-bold">ISSUE DATE:</span> <span>{formatDate(loan.issueDate)}</span></div>
              <div><span className="font-bold">TENURE:</span> <span>{loan.tenureMonths || 12} Months (1 Year)</span></div>
              <div className="text-right"><span className="font-bold text-red-700">DUE DATE:</span> <span className="font-bold text-red-700">{loan.dueDate ? formatDate(loan.dueDate) : '1 Year from Issue'}</span></div>
              <div><span className="font-bold">ISSUED BY STAFF:</span> <span>{loan.staffName}</span></div>
              <div className="text-right"><span className="font-bold">LOAN STATUS:</span> <span className="uppercase font-bold text-emerald-700">{loan.status}</span></div>
            </div>

            {/* Grid for Customer & Article */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              {/* Customer Box */}
              <div className="border border-gray-300 rounded p-2.5 bg-gray-50">
                <div className="font-bold text-[11px] uppercase border-b border-gray-300 pb-1 mb-2 text-gray-700">Customer Information</div>
                <p className="font-bold text-sm text-gray-900">{loan.customerName}</p>
                <p className="text-gray-600">Mobile: {loan.customerMobile}</p>
                {loan.govtProof && <p className="text-gray-600">Govt ID: {loan.govtProof}</p>}
                {loan.customerPhoto && (
                  <div className="mt-2 text-center">
                    <img src={loan.customerPhoto} alt="Customer" className="max-h-24 mx-auto rounded border border-gray-300" />
                  </div>
                )}
              </div>

              {/* Article Box */}
              <div className="border border-gray-300 rounded p-2.5 bg-gray-50">
                <div className="font-bold text-[11px] uppercase border-b border-gray-300 pb-1 mb-2 text-gray-700">Pledged Article Details</div>
                <p className="font-bold text-sm text-amber-900">{loan.pledgeItem}</p>
                <p className="text-gray-700"><span className="font-semibold">Weight:</span> {loan.weight}g | <span className="font-semibold">Purity:</span> {loan.purity}</p>
                {loan.huid && <p className="text-gray-700"><span className="font-semibold">HUID:</span> {loan.huid}</p>}
                {loan.damagePercentage && <p className="text-amber-800"><span className="font-semibold">Damage %:</span> {loan.damagePercentage}</p>}
                {loan.goldImage && (
                  <div className="mt-2 text-center">
                    <img src={loan.goldImage} alt="Article" className="max-h-24 mx-auto rounded border border-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Financial Terms Box */}
            <div className="border border-amber-300 bg-amber-50 rounded p-3 mb-3 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-base text-gray-900">
                <span>PLEDGE PRINCIPAL AMOUNT:</span>
                <span className="text-amber-700">{formatCurrency(loan.loanAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Standard Monthly Interest Rate:</span>
                <span className="font-semibold">{loan.interestRate}% per month</span>
              </div>
              <div className="flex justify-between text-red-800 font-semibold border-t border-amber-200 pt-1">
                <span>Overdue Interest Rate (After Due Date):</span>
                <span>{loan.overdueInterestRate || loan.interestRate}% per month</span>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t border-gray-400 pt-2 mb-4">
              <div className="font-bold text-[10px] uppercase text-gray-800 mb-1">Terms & Conditions:</div>
              <ol className="text-[10px] text-gray-700 space-y-0.5 pl-3 list-decimal leading-tight">
                {JEWEL_LOAN_TERMS.map((t, idx) => (
                  <li key={idx}>{t.replace(/^[0-9]+\.\s*/, '')}</li>
                ))}
              </ol>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-6 mt-4 border-t border-dashed border-gray-400 text-xs">
              <div className="text-center">
                <div className="border-t border-gray-800 w-36 pt-1 font-bold">Customer Signature</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 w-36 pt-1 font-bold">For {SHOP_INFO.name}</div>
                <div className="text-[10px] text-gray-500">Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Printable Loan Receipt Modal ─────────────────────────────────────────────
function LoanPreview({ loan, onClose, isSettlement = false }) {
  const calc = calculateLoanInterest(
    loan.loanAmount,
    loan.interestRate,
    loan.issueDate,
    isSettlement ? (loan.closingDate || new Date().toISOString()) : new Date().toISOString(),
    loan.overdueInterestRate,
    loan.dueDate
  );

  const handlePrint = () => {
    const printContent = document.getElementById('loan-print-area').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>${loan.loanNumber} - ${SHOP_INFO.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; }
        @media print { @page { margin: 1cm; } }
      </style>
      </head><body>${printContent}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 animate-fade-in">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-gray-800 font-bold text-xl">{isSettlement ? 'Settlement Receipt' : 'Loan Receipt'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <button onClick={handlePrint} className="mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-sm w-full">
          <Printer size={16} /> Print Receipt
        </button>

        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-4">
          <div id="loan-print-area" className="font-mono text-sm bg-white text-gray-900 p-6 max-w-[420px] mx-auto border border-gray-300">
            <div className="text-center mb-4 border-b-2 border-gray-800 pb-4">
              <div className="font-bold text-xl mb-1">{SHOP_INFO.name}</div>
              <div className="text-xs text-gray-600">{SHOP_INFO.address}</div>
              <div className="text-xs text-gray-600">Ph: {SHOP_INFO.phone}</div>
              <div className="text-xs font-bold mt-2 border border-gray-800 p-1 uppercase">
                {isSettlement ? 'JEWEL LOAN SETTLEMENT RECEIPT' : 'JEWEL LOAN RECEIPT'}
              </div>
            </div>

            <div className="mb-4 text-xs space-y-1">
              <div className="flex justify-between"><span className="font-semibold">Loan No:</span><span>{loan.loanNumber}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Issue Date:</span><span>{formatDate(loan.issueDate)}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Due Date:</span><span className="font-bold">{loan.dueDate ? formatDate(loan.dueDate) : '1 Year'}</span></div>
              {isSettlement && <div className="flex justify-between"><span className="font-semibold">Settled Date:</span><span>{formatDate(loan.closingDate)}</span></div>}
              <div className="flex justify-between"><span className="font-semibold">Customer:</span><span>{loan.customerName}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Mobile:</span><span>{loan.customerMobile}</span></div>
              {loan.govtProof && <div className="flex justify-between"><span className="font-semibold">Govt Proof:</span><span>{loan.govtProof}</span></div>}
              {loan.huid && <div className="flex justify-between"><span className="font-semibold">HUID No:</span><span>{loan.huid}</span></div>}
              <div className="flex justify-between"><span className="font-semibold">Staff:</span><span>{loan.staffName}</span></div>
            </div>

            {/* Customer & Article Photos */}
            {(loan.goldImage || loan.customerPhoto) && (
              <div className={`mb-4 border border-gray-300 rounded p-2 text-center bg-gray-50 grid ${loan.goldImage && loan.customerPhoto ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
                {loan.customerPhoto && (
                  <div className="text-center">
                    <img src={loan.customerPhoto} alt="Customer Photo" className="max-h-24 mx-auto object-contain rounded" />
                    <p className="text-[10px] text-gray-500 mt-1">Customer Photo</p>
                  </div>
                )}
                {loan.goldImage && (
                  <div className="text-center">
                    <img src={loan.goldImage} alt="Pledged Item" className="max-h-24 mx-auto object-contain rounded" />
                    <p className="text-[10px] text-gray-500 mt-1">Article Photo</p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-b border-gray-400 py-3 mb-3 text-xs space-y-2">
              <div><span className="font-semibold">Item Pledged:</span><br/>{loan.pledgeItem} ({loan.weight}g / {loan.purity})</div>
              {loan.damagePercentage && <div><span className="font-semibold">Damage:</span> {loan.damagePercentage}</div>}
              
              {!isSettlement ? (
                <>
                  <div className="flex justify-between mt-2"><span className="font-semibold">Loan Principal:</span><span className="font-bold">{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Standard Interest:</span><span>{loan.interestRate}% per month</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Overdue Interest:</span><span>{loan.overdueInterestRate || loan.interestRate}% per month</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between mt-2"><span className="font-semibold">Principal Amount:</span><span>{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Duration:</span><span>{loan.monthsCalculated || calc.months} months</span></div>
                  {calc.isOverdue && (
                    <div className="text-[11px] text-red-600 font-semibold my-1 border-y border-red-200 py-1">
                      ⚠️ OVERDUE SETTLEMENT (Overdue rate: {loan.overdueInterestRate || loan.interestRate}%/mo applied)
                    </div>
                  )}
                  <div className="flex justify-between"><span className="font-semibold">Total Interest:</span><span>{formatCurrency(loan.interestAccrued || calc.interestAmount)}</span></div>
                  <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold text-base"><span className="font-semibold">TOTAL REPAID:</span><span>{formatCurrency(loan.totalRepaid || calc.totalRepayment)}</span></div>
                </>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="border-t border-gray-300 pt-2 mb-4 text-[9px] text-gray-700 space-y-1">
              <p className="font-bold uppercase text-[10px] text-gray-800">Terms & Conditions:</p>
              {JEWEL_LOAN_TERMS.map((term, i) => (
                <p key={i}>{term}</p>
              ))}
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-400 text-xs">
              <div className="text-center">
                <div className="border-t border-gray-800 w-28 pt-1">Customer Sign</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 w-28 pt-1">Authorized Sign</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyLoan = {
  customerName: '', customerMobile: '', govtProof: '',
  pledgeItem: '', huid: '', weight: '', purity: '22K', 
  loanAmount: '', interestRate: '1.5', overdueInterestRate: '2.0',
  tenureMonths: '12', damagePercentage: '',
};

export default function LoansPage({ loans, bills = [], onSaveLoan, onUpdateLoan, onGenerateBill, currentStaff, currentStore }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyLoan);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [goldImage, setGoldImage] = useState(null);
  const [goldImagePreview, setGoldImagePreview] = useState(null);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
  
  const [settleLoanId, setSettleLoanId] = useState(null);
  const [previewLoan, setPreviewLoan] = useState(null);
  const [previewIsSettlement, setPreviewIsSettlement] = useState(false);
  const [previewCardBill, setPreviewCardBill] = useState(null);
  const [loanSaveLoading, setLoanSaveLoading] = useState(false);

  // Lock body scroll when popup modals are active
  useEffect(() => {
    if (showForm || settleLoanId || previewLoan || previewCardBill) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showForm, settleLoanId, previewLoan, previewCardBill]);

  const filtered = loans.filter(l => {
    if (filter === 'Overdue') {
      const isPastDue = l.dueDate ? new Date() > new Date(l.dueDate) : false;
      return l.status === 'Active' && isPastDue;
    }
    if (filter !== 'All' && l.status !== filter) {
      return false;
    }
    const q = search.toLowerCase();
    const huid = (l.huid || '').toLowerCase();
    const govt = (l.govtProof || '').toLowerCase();
    return l.customerName.toLowerCase().includes(q) ||
           l.customerMobile.includes(q) ||
           l.loanNumber.toLowerCase().includes(q) ||
           huid.includes(q) ||
           govt.includes(q);
  }).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const totalActiveLoansAmount = loans.filter(l => l.status === 'Active').reduce((s, l) => s + l.loanAmount, 0);

  const handleGoldImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setGoldImage(reader.result);
      setGoldImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomerPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomerPhoto(reader.result);
      setCustomerPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!form.customerName || !form.customerMobile || !form.pledgeItem || !form.weight || !form.loanAmount) {
      setFormError('Please fill all required fields: Customer Name, Mobile, Item, Weight, and Loan Amount.');
      return;
    }
    setFormError('');
    setLoanSaveLoading(true);

    const issueDate = new Date();
    const tenureMonths = parseInt(form.tenureMonths || '12', 10);
    const dueDate = new Date(issueDate);
    dueDate.setMonth(dueDate.getMonth() + tenureMonths);

    const newLoan = {
      storeId: currentStore,
      loanNumber: generateLoanNumber(loans),
      customerName: form.customerName,
      customerMobile: form.customerMobile,
      govtProof: form.govtProof || '',
      pledgeItem: form.pledgeItem,
      huid: form.huid || '',
      damagePercentage: form.damagePercentage || '',
      weight: parseFloat(form.weight),
      purity: form.purity,
      loanAmount: parseFloat(form.loanAmount),
      interestRate: parseFloat(form.interestRate),
      overdueInterestRate: parseFloat(form.overdueInterestRate || form.interestRate),
      tenureMonths: tenureMonths,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'Active',
      staffId: currentStaff?.id || currentStaff?._id,
      staffName: currentStaff?.name || 'Staff',
      goldImage: goldImage || null,
      customerPhoto: customerPhoto || null,
    };

    try {
      await onSaveLoan(newLoan);

      setShowForm(false);
      setForm(emptyLoan);
      setGoldImage(null);
      setGoldImagePreview(null);
      setCustomerPhoto(null);
      setCustomerPhotoPreview(null);
      setSuccess('Jewel Loan issued successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setPreviewLoan(newLoan);
      setPreviewIsSettlement(false);
    } catch (err) {
      setFormError('Failed to issue loan: ' + (err.message || 'Unknown error'));
    } finally {
      setLoanSaveLoading(false);
    }
  };

  const handleSettle = async () => {
    const loan = loans.find(l => (l.id || l._id) === settleLoanId);
    if (!loan) return;
    
    const now = new Date().toISOString();
    const calc = calculateLoanInterest(
      loan.loanAmount,
      loan.interestRate,
      loan.issueDate,
      now,
      loan.overdueInterestRate,
      loan.dueDate
    );
    
    const updatedLoan = {
      ...loan,
      status: 'Closed',
      closingDate: now,
      monthsCalculated: calc.months,
      interestAccrued: calc.interestAmount,
      totalRepaid: calc.totalRepayment
    };
    
    try {
      await onUpdateLoan(updatedLoan);

      setSettleLoanId(null);
      setSuccess('Jewel Loan settled successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setPreviewLoan(updatedLoan);
      setPreviewIsSettlement(true);
    } catch (err) {
      setFormError('Failed to settle loan: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-amber-500" />
            Jewel Loan Solutions
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage pledged items, interest rates & card billing</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-gray-450 text-xs font-medium">Total Active Loans</p>
            <p className="text-amber-600 font-bold">{formatCurrency(totalActiveLoansAmount)}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
          >
            <Plus size={16} /> Issue Loan
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by loan no, name, mobile, HUID or Govt ID..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-gray-850 text-sm focus:outline-none focus:border-amber-450 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Active', 'Overdue', 'Closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5
                  ${filter === f 
                    ? f === 'Overdue' ? 'bg-red-600 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
              >
                {f === 'Overdue' && <AlertTriangle size={14} />}
                {f === 'All' ? 'All Loans' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(loan => {
          const isOverdue = loan.dueDate && loan.status === 'Active' ? new Date() > new Date(loan.dueDate) : false;

          return (
            <div key={loan.id || loan._id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
              {loan.status === 'Closed' && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">CLOSED</div>
              )}
              {loan.status === 'SettlePending' && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg animate-pulse">PENDING APPROVAL</div>
              )}
              {isOverdue && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <AlertTriangle size={11} /> OVERDUE
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {/* Customer & Article thumbnails */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {loan.customerPhoto && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-blue-200 shrink-0 relative shadow-sm" title="Customer Photo">
                        <img src={loan.customerPhoto} alt="Customer" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {loan.goldImage ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-300 shrink-0 relative shadow-sm" title="Article Photo">
                        <img src={loan.goldImage} alt="Article item" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      !loan.customerPhoto && (
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                          <Wallet size={20} className="text-amber-500" />
                        </div>
                      )
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-bold">{loan.customerName}</h3>
                    <p className="text-gray-400 text-xs">{loan.customerMobile}</p>
                    {loan.govtProof && <p className="text-amber-700/80 text-[11px] font-medium">Govt ID: {loan.govtProof}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 font-mono text-sm font-semibold">{loan.loanNumber}</p>
                  <p className="text-gray-400 text-[11px]">Issued: {formatDate(loan.issueDate)}</p>
                  <p className={`text-[11px] font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                    Due: {loan.dueDate ? formatDate(loan.dueDate) : '1 Year'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <p className="text-gray-400 mb-0.5 font-medium">Item Pledged</p>
                  <p className="text-gray-700 font-bold">{loan.pledgeItem} ({loan.purity}){loan.huid ? ` • HUID: ${loan.huid}` : ''}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <p className="text-gray-400 mb-0.5 font-medium">Weight</p>
                  <p className="text-gray-700 font-bold">{loan.weight}g</p>
                </div>
              </div>

              {/* Interest Info Row */}
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Interest Rate: </span>
                  <span className="font-bold text-gray-800">{loan.interestRate}%/mo</span>
                  {loan.overdueInterestRate && loan.overdueInterestRate !== loan.interestRate && (
                    <span className="text-red-600 font-semibold ml-2">(Overdue: {loan.overdueInterestRate}%/mo)</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <p className="text-gray-450 text-xs mb-0.5 font-medium font-sans">Principal Amount</p>
                  <p className="text-amber-600 font-bold text-lg">{formatCurrency(loan.loanAmount)}</p>
                </div>
                
                <div className="flex gap-1.5 flex-wrap justify-end">
                  <button
                    onClick={() => setPreviewCardBill(loan)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                    title="Print Jewel Loan Card Bill"
                  >
                    <CreditCard size={14} /> Card Bill
                  </button>

                  <button
                    onClick={() => { setPreviewLoan(loan); setPreviewIsSettlement(loan.status === 'Closed' || loan.status === 'SettlePending'); }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-xs font-semibold transition-all flex items-center gap-1"
                    title="Print Detailed Receipt"
                  >
                    <Printer size={14} /> Receipt
                  </button>

                  {loan.status === 'Active' && (
                    <button
                      onClick={() => setSettleLoanId(loan.id || loan._id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-all shadow-sm"
                    >
                      Settle
                    </button>
                  )}

                  {loan.status === 'SettlePending' && (
                    <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200 font-semibold animate-pulse">
                      Pending Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-sm animate-fade-in">
            <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">No loans found</p>
          </div>
        )}
      </div>

      {/* Settle Loan Confirmation Modal */}
      {settleLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <h2 className="text-gray-800 font-bold text-xl mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <CheckCircle2 className="text-emerald-500" /> Settle Jewel Loan
            </h2>
            
            {(() => {
              const loan = loans.find(l => (l.id || l._id) === settleLoanId);
              const calc = calculateLoanInterest(
                loan.loanAmount, 
                loan.interestRate, 
                loan.issueDate, 
                new Date().toISOString(),
                loan.overdueInterestRate,
                loan.dueDate
              );
              
              return (
                <div className="space-y-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Principal:</span> <span className="font-semibold">{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Duration:</span> <span className="font-semibold">{calc.months} months</span></div>
                  <div className="flex justify-between text-gray-500"><span>Standard Interest ({loan.interestRate}%/mo):</span> <span className="font-semibold">{formatCurrency(calc.normalInterest)}</span></div>
                  {calc.isOverdue && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Overdue Extra ({loan.overdueInterestRate || loan.interestRate}%/mo):</span> <span>{formatCurrency(calc.overdueInterest)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-800 font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total Amount to Collect:</span> <span className="text-amber-600">{formatCurrency(calc.totalRepayment)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button onClick={() => setSettleLoanId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-650 font-semibold hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSettle} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all shadow-sm">Confirm Settlement</button>
            </div>
          </div>
        </div>
      )}

      {/* Issue New Gold Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-gray-800 font-bold text-xl">Issue New Jewel Loan</h2>
              <button 
                onClick={() => { 
                  setShowForm(false); 
                  setGoldImage(null); 
                  setGoldImagePreview(null); 
                  setCustomerPhoto(null); 
                  setCustomerPhotoPreview(null);
                }} 
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Customer Name *</label>
                <input type="text" value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Mobile Number *</label>
                <input type="tel" value={form.customerMobile} onChange={e => setForm(p => ({ ...p, customerMobile: e.target.value }))} maxLength={10} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Govt Proof ID</label>
                <input type="text" placeholder="Aadhaar / PAN / Voter ID" value={form.govtProof} onChange={e => setForm(p => ({ ...p, govtProof: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Item Pledged *</label>
                <input type="text" placeholder="e.g. Gold Bangle 22K" value={form.pledgeItem} onChange={e => setForm(p => ({ ...p, pledgeItem: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">HUID No (optional)</label>
                <input type="text" placeholder="e.g. HUID-8901234" value={form.huid} onChange={e => setForm(p => ({ ...p, huid: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Weight (g) *</label>
                <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Purity</label>
                <select value={form.purity} onChange={e => setForm(p => ({ ...p, purity: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none">
                  {['24K', '22K', '18K', '14K'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">If Any Damage Description</label>
                <input type="text" placeholder="Scratch on lock / None" value={form.damagePercentage} onChange={e => setForm(p => ({ ...p, damagePercentage: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Loan Principal (₹) *</label>
                <input type="number" value={form.loanAmount} onChange={e => setForm(p => ({ ...p, loanAmount: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Tenure (Months)</label>
                <select value={form.tenureMonths} onChange={e => setForm(p => ({ ...p, tenureMonths: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none">
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Standard Rate (%/mo) *</label>
                <input type="number" step="0.1" value={form.interestRate} onChange={e => setForm(p => ({ ...p, interestRate: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Overdue Rate (%/mo)</label>
                <input type="number" step="0.1" value={form.overdueInterestRate} onChange={e => setForm(p => ({ ...p, overdueInterestRate: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              {/* Photo Uploads */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-blue-500" /> Customer Photo
                  </label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl p-3.5">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        {customerPhotoPreview ? (
                          <img src={customerPhotoPreview} alt="Customer" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all text-xs font-semibold shadow-sm">
                        <Camera size={13} />
                        {customerPhotoPreview ? 'Change' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleCustomerPhotoChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={13} className="text-amber-500" /> Article Photo (Jewel)
                  </label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl p-3.5">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        {goldImagePreview ? (
                          <img src={goldImagePreview} alt="Article item" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={32} className="text-gray-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all text-xs font-semibold shadow-sm">
                        <Camera size={13} />
                        {goldImagePreview ? 'Change' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleGoldImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4 text-xs font-medium animate-fade-in">
                <span>⚠️</span> {formError}
              </div>
            )}

            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button 
                onClick={() => { 
                  setShowForm(false); 
                  setGoldImage(null); 
                  setGoldImagePreview(null); 
                  setCustomerPhoto(null); 
                  setCustomerPhotoPreview(null); 
                  setFormError(''); 
                }} 
                disabled={loanSaveLoading} 
                className="flex-1 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-650 font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button onClick={handleCreate} disabled={loanSaveLoading} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {loanSaveLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loanSaveLoading ? 'Issuing Loan...' : 'Issue Loan & Card'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Card Bill Modal */}
      {previewCardBill && (
        <LoanCardBillPreview loan={previewCardBill} onClose={() => setPreviewCardBill(null)} />
      )}

      {/* Receipt Modal */}
      {previewLoan && (
        <LoanPreview loan={previewLoan} isSettlement={previewIsSettlement} onClose={() => setPreviewLoan(null)} />
      )}
    </div>
  );
}
