import React, { useState, useEffect } from 'react';
import './index.css';
import { initialProducts, initialStaff, STORES } from './data.js';
import LoginScreen from './components/LoginScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import BillingPage from './components/BillingPage.jsx';
import InvoicesPage from './components/InvoicesPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import StaffPage from './components/StaffPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import BillPreview from './components/BillPreview.jsx';
import LoansPage from './components/LoansPage.jsx';

const STORAGE_KEYS = {
  products: 'vjs_products',
  bills: 'vjs_bills',
  staff: 'vjs_staff',
  goldRate: 'vjs_gold_rate',
  loans: 'vjs_loans',
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  const [currentStaff, setCurrentStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.products, initialProducts);
    return (saved || []).map(p => ({ ...p, storeId: p.storeId || STORES[0].id }));
  });
  const [bills, setBills] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.bills, []);
    return (saved || []).map(b => ({ ...b, storeId: b.storeId || STORES[0].id }));
  });
  const [staff, setStaff] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.staff, initialStaff) || [];
    const savedStaff = saved.map(s => ({ ...s, storeId: s.storeId || STORES[0].id }));
    const hasAdmin = savedStaff.some(s => s.role === 'Admin');
    if (!hasAdmin) {
      const adminStaff = initialStaff.find(s => s.role === 'Admin');
      if (adminStaff) return [...savedStaff, adminStaff];
    }
    return savedStaff;
  });
  const [goldRate, setGoldRate] = useState(() => loadFromStorage(STORAGE_KEYS.goldRate, 7500));
  const [loans, setLoans] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.loans, []);
    return (saved || []).map(l => ({ ...l, storeId: l.storeId || STORES[0].id }));
  });
  const [previewBill, setPreviewBill] = useState(null);
  
  // Store context
  const [currentStore, setCurrentStore] = useState(STORES[0].id);

  // Persist to localStorage on change
  useEffect(() => saveToStorage(STORAGE_KEYS.products, products), [products]);
  useEffect(() => saveToStorage(STORAGE_KEYS.bills, bills), [bills]);
  useEffect(() => saveToStorage(STORAGE_KEYS.staff, staff), [staff]);
  useEffect(() => saveToStorage(STORAGE_KEYS.goldRate, goldRate), [goldRate]);
  useEffect(() => saveToStorage(STORAGE_KEYS.loans, loans), [loans]);

  const handleLogin = (staffMember) => {
    setCurrentStaff(staffMember);
    if (staffMember.storeId) {
      setCurrentStore(staffMember.storeId);
    }
  };

  const handleLogout = () => {
    setCurrentStaff(null);
    setActiveTab('dashboard');
  };

  const handleGenerateBill = (bill) => {
    // Attach current store to bill
    const newBill = { ...bill, storeId: currentStore };
    // Add bill to storage
    setBills(prev => [newBill, ...prev]);
    // Deduct stock from inventory
    setProducts(prev => prev.map(p => {
      const soldItem = newBill.items.find(i => i.id === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    }));
    // Show preview
    setPreviewBill(bill);
    // Switch to invoices tab
    setActiveTab('invoices');
  };

  const handleSaveLoan = (loan) => {
    setLoans(prev => [loan, ...prev]);
  };

  const handleUpdateLoan = (updatedLoan) => {
    setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
  };

  if (!currentStaff) {
    return <LoginScreen staff={staff} onLogin={handleLogin} />;
  }

  // Derived state for current store
  const storeProducts = products.filter(p => p.storeId === currentStore);
  const storeBills = bills.filter(b => b.storeId === currentStore);
  const storeLoans = loans.filter(l => l.storeId === currentStore);

  const sidebarWidth = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72';
  
  const canSwitchStore = currentStaff.role === 'Admin' || currentStaff.role === 'Manager';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0718] via-[#0f0c1e] to-[#130d22]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStaff={currentStaff}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarWidth} min-h-screen`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/20 border-b border-purple-900/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile is in Sidebar */}
              <div className="hidden lg:block">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-purple-400 flex items-center justify-center transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect y="2" width="16" height="2" rx="1" />
                    <rect y="7" width="16" height="2" rx="1" />
                    <rect y="12" width="16" height="2" rx="1" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <h2 className="text-white font-semibold capitalize lg:block hidden">
                  {activeTab === 'billing' ? 'New Bill' :
                   activeTab === 'invoices' ? 'Invoices' :
                   activeTab === 'inventory' ? 'Inventory' :
                   activeTab === 'loans' ? 'Gold Loans' :
                   activeTab}
                </h2>
                
                {/* Store Selector */}
                {canSwitchStore ? (
                  <select
                    value={currentStore}
                    onChange={(e) => setCurrentStore(e.target.value)}
                    className="bg-white/5 border border-purple-800/40 text-purple-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400/60"
                  >
                    {STORES.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#0f0c1e] text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-purple-400 text-sm hidden sm:inline-block">
                    {STORES.find(s => s.id === currentStore)?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Gold rate badge */}
              <div className="hidden sm:flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 font-semibold text-sm">₹{goldRate.toLocaleString('en-IN')}/g</span>
              </div>

              {/* Staff badge */}
              <div className="flex items-center gap-2 bg-white/5 border border-purple-800/40 rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">{currentStaff.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <Dashboard bills={storeBills} products={storeProducts} staff={staff} />
          )}
          {activeTab === 'billing' && (
            <BillingPage
              products={storeProducts}
              bills={storeBills}
              currentStaff={currentStaff}
              onGenerateBill={handleGenerateBill}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesPage bills={storeBills} />
          )}
          {activeTab === 'loans' && (
            <LoansPage 
              loans={storeLoans} 
              onSaveLoan={handleSaveLoan} 
              onUpdateLoan={handleUpdateLoan}
              currentStaff={currentStaff}
              currentStore={currentStore}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryPage 
              products={products} 
              onUpdateProducts={setProducts} 
              currentStore={currentStore} 
            />
          )}
          {activeTab === 'staff' && (
            <StaffPage staff={staff} onUpdateStaff={setStaff} />
          )}
          {activeTab === 'settings' && (
            <SettingsPage goldRate={goldRate} onUpdateGoldRate={setGoldRate} />
          )}
        </div>
      </main>

      {/* Bill Preview Modal (auto-shown after generating bill) */}
      {previewBill && (
        <BillPreview bill={previewBill} onClose={() => setPreviewBill(null)} />
      )}
    </div>
  );
}
