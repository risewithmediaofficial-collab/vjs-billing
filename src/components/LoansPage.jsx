import React, { useState } from 'react';
import { 
  Wallet, Search, Plus, X, IndianRupee, Clock, 
  CheckCircle2, AlertTriangle, FileText, Printer, Camera, Image as ImageIcon
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 animate-fade-in">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-gray-805 font-bold text-xl">{isSettlement ? 'Settlement Receipt' : 'Loan Receipt'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <button onClick={handlePrint} className="mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all shadow-sm w-full">
          <Printer size={16} /> Print Receipt
        </button>

        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-4">
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

            {/* Gold image in receipt */}
            {loan.goldImage && (
              <div className="mb-4 border border-gray-300 rounded p-2 text-center bg-gray-50">
                <img src={loan.goldImage} alt="Pledged Item" className="max-h-32 mx-auto object-contain" />
                <p className="text-xs text-gray-500 mt-1">Pledged Item Photo</p>
              </div>
            )}

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
  const [filter, setFilter] = useState('Active');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyLoan);
  const [success, setSuccess] = useState('');
  const [goldImage, setGoldImage] = useState(null);
  const [goldImagePreview, setGoldImagePreview] = useState(null);
  
  const [settleLoanId, setSettleLoanId] = useState(null);
  const [previewLoan, setPreviewLoan] = useState(null);
  const [previewIsSettlement, setPreviewIsSettlement] = useState(false);

  const filtered = loans.filter(l => {
    if (filter !== 'All' && l.status !== filter) return false;
    const q = search.toLowerCase();
    return l.customerName.toLowerCase().includes(q) || l.loanNumber.toLowerCase().includes(q) || l.customerMobile.includes(q);
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
      staffName: currentStaff.name,
      goldImage: goldImage || null,
    };
    onSaveLoan(newLoan);
    setShowForm(false);
    setForm(emptyLoan);
    setGoldImage(null);
    setGoldImagePreview(null);
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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-amber-500" />
            Gold Loans
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage pledged items and loans</p>
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
              placeholder="Search by loan no, name or mobile..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-gray-850 text-sm focus:outline-none focus:border-amber-450 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['Active', 'Closed', 'All'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${filter === f ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-550 border border-gray-200 hover:bg-gray-200'}`}
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
          <div key={loan.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden shadow-sm">
            {loan.status === 'Closed' && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">CLOSED</div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {/* Gold item thumbnail */}
                {loan.goldImage ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-300 shrink-0">
                    <img src={loan.goldImage} alt="Gold item" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <Wallet size={20} className="text-amber-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-gray-800 font-bold">{loan.customerName}</h3>
                  <p className="text-gray-400 text-xs">{loan.customerMobile}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600 font-mono text-sm font-semibold">{loan.loanNumber}</p>
                <p className="text-gray-405 text-xs">{formatDate(loan.issueDate)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <p className="text-gray-400 mb-0.5 font-medium">Item Pledged</p>
                <p className="text-gray-700 font-bold">{loan.pledgeItem} ({loan.purity})</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <p className="text-gray-400 mb-0.5 font-medium">Weight</p>
                <p className="text-gray-700 font-bold">{loan.weight}g</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <p className="text-gray-450 text-xs mb-0.5 font-medium">Principal Amount</p>
                <p className="text-amber-600 font-bold text-lg">{formatCurrency(loan.loanAmount)}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => { setPreviewLoan(loan); setPreviewIsSettlement(loan.status === 'Closed'); }}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-all"
                >
                  <Printer size={14} className="inline mr-1" /> Receipt
                </button>
                {loan.status === 'Active' && (
                  <button
                    onClick={() => setSettleLoanId(loan.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    Settle Loan
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
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
              <CheckCircle2 className="text-emerald-500" /> Settle Loan
            </h2>
            
            {(() => {
              const loan = loans.find(l => l.id === settleLoanId);
              const calc = calculateLoanInterest(loan.loanAmount, loan.interestRate, loan.issueDate, new Date().toISOString());
              
              return (
                <div className="space-y-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Principal:</span> <span className="font-semibold">{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Duration:</span> <span className="font-semibold">{calc.months} months</span></div>
                  <div className="flex justify-between text-gray-500"><span>Interest ({loan.interestRate}%/mo):</span> <span className="font-semibold">{formatCurrency(calc.interestAmount)}</span></div>
                  <div className="flex justify-between text-gray-800 font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total to Collect:</span> <span className="text-amber-600">{formatCurrency(calc.totalRepayment)}</span>
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

      {/* Add Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-gray-800 font-bold text-xl">Issue New Gold Loan</h2>
              <button onClick={() => { setShowForm(false); setGoldImage(null); setGoldImagePreview(null); }} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Customer Name *</label>
                <input type="text" value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Mobile Number *</label>
                <input type="tel" value={form.customerMobile} onChange={e => setForm(p => ({ ...p, customerMobile: e.target.value }))} maxLength={10} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Item Pledged (e.g. Gold Chain) *</label>
                <input type="text" value={form.pledgeItem} onChange={e => setForm(p => ({ ...p, pledgeItem: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
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
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Loan Amount (₹) *</label>
                <input type="number" value={form.loanAmount} onChange={e => setForm(p => ({ ...p, loanAmount: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Interest Rate (%/mo) *</label>
                <input type="number" step="0.1" value={form.interestRate} onChange={e => setForm(p => ({ ...p, interestRate: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              {/* Gold Item Image Upload */}
              <div className="col-span-2">
                <label className="text-xs text-gray-600 font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
                  <Camera size={12} className="text-amber-500" />
                  Gold Item Photo (recommended)
                </label>
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                      {goldImagePreview ? (
                        <img src={goldImagePreview} alt="Gold item" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all text-sm w-fit font-semibold shadow-sm">
                        <Camera size={15} />
                        {goldImagePreview ? 'Change Photo' : 'Upload Photo'}
                        <input type="file" accept="image/*" onChange={handleGoldImageChange} className="hidden" />
                      </label>
                      {goldImagePreview && (
                        <button
                          onClick={() => { setGoldImage(null); setGoldImagePreview(null); }}
                          className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors block font-semibold"
                        >
                          Remove photo
                        </button>
                      )}
                      <p className="text-xs text-gray-450 mt-1.5">Photo stored with loan record & printed on receipt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button onClick={() => { setShowForm(false); setGoldImage(null); setGoldImagePreview(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-650 font-semibold hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-all shadow-sm">Issue Loan</button>
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
