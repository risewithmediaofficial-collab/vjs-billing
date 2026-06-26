import React, { useState } from 'react';
import { 
  Wallet, Search, Plus, X, IndianRupee, Clock, 
  CheckCircle2, AlertTriangle, FileText, Printer 
} from 'lucide-react';
import { calculateLoanInterest, generateLoanNumber, formatCurrency, formatDate, SHOP_INFO } from '../data.js';

function LoanPreview({ loan, onClose, isSettlement = false }) {
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">{isSettlement ? 'Settlement Receipt' : 'Loan Receipt'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <button onClick={handlePrint} className="mb-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg w-full">
          <Printer size={16} /> Print Receipt
        </button>

        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
          <div id="loan-print-area" className="font-mono text-sm bg-white text-gray-900 p-8 max-w-[400px] mx-auto">
            <div className="text-center mb-4 border-b-2 border-gray-800 pb-4">
              <div className="font-bold text-xl mb-1">{SHOP_INFO.name}</div>
              <div className="text-xs text-gray-600">{SHOP_INFO.address}</div>
              <div className="text-xs text-gray-600">Ph: {SHOP_INFO.phone}</div>
              <div className="text-xs font-bold mt-2 border border-gray-800 p-1">
                {isSettlement ? 'GOLD LOAN SETTLEMENT' : 'GOLD LOAN RECEIPT'}
              </div>
            </div>

            <div className="mb-4 text-xs space-y-1">
              <div className="flex justify-between"><span className="font-semibold">Loan No:</span><span>{loan.loanNumber}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Date:</span><span>{formatDate(isSettlement ? loan.closingDate : loan.issueDate)}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Customer:</span><span>{loan.customerName}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Mobile:</span><span>{loan.customerMobile}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Staff:</span><span>{loan.staffName}</span></div>
            </div>

            <div className="border-t border-b border-gray-400 py-3 mb-3 text-xs space-y-2">
              <div><span className="font-semibold">Item Pledged:</span><br/>{loan.pledgeItem} ({loan.weight}g / {loan.purity})</div>
              
              {!isSettlement ? (
                <>
                  <div className="flex justify-between mt-2"><span className="font-semibold">Loan Amount:</span><span className="font-bold">{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Interest Rate:</span><span>{loan.interestRate}% per month</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between mt-2"><span className="font-semibold">Principal Amount:</span><span>{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Months:</span><span>{loan.monthsCalculated}</span></div>
                  <div className="flex justify-between"><span className="font-semibold">Interest Accrued:</span><span>{formatCurrency(loan.interestAccrued)}</span></div>
                  <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold text-base"><span className="font-semibold">TOTAL PAID:</span><span>{formatCurrency(loan.totalRepaid)}</span></div>
                </>
              )}
            </div>

            <div className="text-center mt-6 text-xs text-gray-500 border-t border-gray-300 pt-4">
              <p>Safe Custody Guaranteed.</p>
              <p className="mt-1">Please bring this receipt for settlement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyLoan = {
  customerName: '', customerMobile: '', 
  pledgeItem: '', weight: '', purity: '22K', 
  loanAmount: '', interestRate: '1.5'
};

export default function LoansPage({ loans, onSaveLoan, onUpdateLoan, currentStaff, currentStore }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Active'); // Active, Closed, All
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyLoan);
  const [success, setSuccess] = useState('');
  
  const [settleLoanId, setSettleLoanId] = useState(null);
  const [previewLoan, setPreviewLoan] = useState(null);
  const [previewIsSettlement, setPreviewIsSettlement] = useState(false);

  const filtered = loans.filter(l => {
    if (filter !== 'All' && l.status !== filter) return false;
    const q = search.toLowerCase();
    return l.customerName.toLowerCase().includes(q) || l.loanNumber.toLowerCase().includes(q) || l.customerMobile.includes(q);
  }).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const totalActiveLoansAmount = loans.filter(l => l.status === 'Active').reduce((s, l) => s + l.loanAmount, 0);

  const handleCreate = () => {
    if (!form.customerName || !form.customerMobile || !form.pledgeItem || !form.weight || !form.loanAmount) {
      alert('Please fill all required fields');
      return;
    }
    const newLoan = {
      id: `LOAN-${Date.now()}`,
      storeId: currentStore,
      loanNumber: generateLoanNumber(loans),
      customerName: form.customerName,
      customerMobile: form.customerMobile,
      pledgeItem: form.pledgeItem,
      weight: parseFloat(form.weight),
      purity: form.purity,
      loanAmount: parseFloat(form.loanAmount),
      interestRate: parseFloat(form.interestRate),
      issueDate: new Date().toISOString(),
      status: 'Active',
      staffId: currentStaff.id,
      staffName: currentStaff.name
    };
    onSaveLoan(newLoan);
    setShowForm(false);
    setForm(emptyLoan);
    setSuccess('Loan issued successfully!');
    setTimeout(() => setSuccess(''), 3000);
    setPreviewLoan(newLoan);
    setPreviewIsSettlement(false);
  };

  const handleSettle = () => {
    const loan = loans.find(l => l.id === settleLoanId);
    if (!loan) return;
    
    const now = new Date().toISOString();
    const calc = calculateLoanInterest(loan.loanAmount, loan.interestRate, loan.issueDate, now);
    
    const updatedLoan = {
      ...loan,
      status: 'Closed',
      closingDate: now,
      monthsCalculated: calc.months,
      interestAccrued: calc.interestAmount,
      totalRepaid: calc.totalRepayment
    };
    
    onUpdateLoan(updatedLoan);
    setSettleLoanId(null);
    setSuccess('Loan settled successfully!');
    setTimeout(() => setSuccess(''), 3000);
    
    setPreviewLoan(updatedLoan);
    setPreviewIsSettlement(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-amber-400" />
            Gold Loans
          </h1>
          <p className="text-purple-400 text-sm mt-1">Manage pledged items and loans</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-purple-400 text-xs">Total Active Loans</p>
            <p className="text-amber-400 font-bold">{formatCurrency(totalActiveLoansAmount)}</p>
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
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by loan no, name or mobile..."
              className="w-full bg-white/5 border border-purple-800/40 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/60 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['Active', 'Closed', 'All'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${filter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-purple-400 border border-purple-800/40 hover:border-purple-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(loan => (
          <div key={loan.id} className="bg-white/5 border border-purple-900/30 rounded-2xl p-5 hover:bg-white/8 transition-all relative overflow-hidden">
            {loan.status === 'Closed' && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">CLOSED</div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold">{loan.customerName}</h3>
                <p className="text-purple-400 text-xs">{loan.customerMobile}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-300 font-mono text-sm font-medium">{loan.loanNumber}</p>
                <p className="text-purple-500 text-xs">{formatDate(loan.issueDate)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-purple-500 mb-0.5">Item Pledged</p>
                <p className="text-white font-medium">{loan.pledgeItem} ({loan.purity})</p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-purple-500 mb-0.5">Weight</p>
                <p className="text-white font-medium">{loan.weight}g</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-purple-800/40 pt-4">
              <div>
                <p className="text-purple-400 text-xs mb-0.5">Principal Amount</p>
                <p className="text-amber-400 font-bold text-lg">{formatCurrency(loan.loanAmount)}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => { setPreviewLoan(loan); setPreviewIsSettlement(loan.status === 'Closed'); }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-purple-800/40 text-purple-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
                >
                  <Printer size={14} className="inline mr-1" /> Receipt
                </button>
                {loan.status === 'Active' && (
                  <button
                    onClick={() => setSettleLoanId(loan.id)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-lg"
                  >
                    Settle Loan
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-12 bg-white/5 border border-purple-900/30 rounded-2xl">
            <Wallet size={48} className="text-purple-700 mx-auto mb-4" />
            <p className="text-purple-400">No loans found</p>
          </div>
        )}
      </div>

      {/* Settle Loan Confirmation Modal */}
      {settleLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0f0c1e] border border-purple-800/40 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" /> Settle Loan
            </h2>
            
            {(() => {
              const loan = loans.find(l => l.id === settleLoanId);
              const calc = calculateLoanInterest(loan.loanAmount, loan.interestRate, loan.issueDate, new Date().toISOString());
              
              return (
                <div className="space-y-3 mb-6 bg-white/5 rounded-xl p-4 border border-purple-800/40 text-sm">
                  <div className="flex justify-between text-purple-300"><span>Principal:</span> <span>{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between text-purple-300"><span>Duration:</span> <span>{calc.months} months</span></div>
                  <div className="flex justify-between text-purple-300"><span>Interest ({loan.interestRate}%/mo):</span> <span>{formatCurrency(calc.interestAmount)}</span></div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-purple-800/40">
                    <span>Total to Collect:</span> <span className="text-amber-400">{formatCurrency(calc.totalRepayment)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button onClick={() => setSettleLoanId(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-purple-800/40 text-purple-300 hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleSettle} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all">Confirm Settlement</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0f0c1e] border border-purple-800/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">Issue New Gold Loan</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Customer Name *</label>
                <input type="text" value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Mobile Number *</label>
                <input type="tel" value={form.customerMobile} onChange={e => setForm(p => ({ ...p, customerMobile: e.target.value }))} maxLength={10} className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Item Pledged (e.g. Gold Chain) *</label>
                <input type="text" value={form.pledgeItem} onChange={e => setForm(p => ({ ...p, pledgeItem: e.target.value }))} className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60" />
              </div>
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Weight (g) *</label>
                <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60" />
              </div>
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Purity</label>
                <select value={form.purity} onChange={e => setForm(p => ({ ...p, purity: e.target.value }))} className="w-full bg-[#0f0c1e] border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60">
                  {['24K', '22K', '18K', '14K'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Loan Amount (₹) *</label>
                <input type="number" value={form.loanAmount} onChange={e => setForm(p => ({ ...p, loanAmount: e.target.value }))} className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60" />
              </div>
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Interest Rate (%/mo) *</label>
                <input type="number" step="0.1" value={form.interestRate} onChange={e => setForm(p => ({ ...p, interestRate: e.target.value }))} className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400/60" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-purple-800/40 text-purple-300 hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-400 hover:to-orange-400 transition-all">Issue Loan</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {previewLoan && (
        <LoanPreview loan={previewLoan} isSettlement={previewIsSettlement} onClose={() => setPreviewLoan(null)} />
      )}
    </div>
  );
}
