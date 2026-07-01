import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { STORES } from './data.js';
import {
  authApi, productsApi, billsApi, loansApi, staffApi, settingsApi, schemesApi,
  getToken, getCurrentUser, setCurrentUser, clearToken,
} from './api.js';
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
import SchemesPage from './components/SchemesPage.jsx';

export default function App() {
  const [currentStaff, setCurrentStaff] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loans, setLoans] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [goldRate, setGoldRateState] = useState(7500);
  const [silverRate, setSilverRateState] = useState(85);
  const [previewBill, setPreviewBill] = useState(null);
  const [currentStore, setCurrentStore] = useState(
    () => getCurrentUser()?.storeId || STORES[0].id
  );

  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState('');

  // ── Load all data from backend ─────────────────────────────────────────────
  const loadData = useCallback(async (storeId) => {
    if (!getToken()) return;
    setLoading(true);
    setDbError('');
    try {
      const [prods, bls, stf, lns, settings, schs] = await Promise.all([
        productsApi.getAll(storeId),
        billsApi.getAll(storeId),
        staffApi.getAll(),
        loansApi.getAll(storeId),
        settingsApi.get(storeId),
        schemesApi.getAll(storeId),
      ]);
      setProducts(prods || []);
      setBills(bls || []);
      setStaff(stf || []);
      setLoans(lns || []);
      setSchemes(schs || []);
      setGoldRateState(settings?.goldRate || 7500);
      setSilverRateState(settings?.silverRate || 85);
    } catch (err) {
      setDbError('⚠️ Cannot connect to backend. Make sure the server is running on port 5000.');
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount / store change
  useEffect(() => {
    if (currentStaff) {
      loadData(currentStore);
    }
  }, [currentStaff, currentStore, loadData]);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleLogin = (staffMember) => {
    setCurrentStaff(staffMember);
    setCurrentUser(staffMember);
    if (staffMember.storeId) setCurrentStore(staffMember.storeId);
  };

  const handleLogout = () => {
    clearToken();
    setCurrentStaff(null);
    setActiveTab('dashboard');
    setProducts([]);
    setBills([]);
    setStaff([]);
    setLoans([]);
    setSchemes([]);
  };

  // ── Bill creation ──────────────────────────────────────────────────────────
  const handleGenerateBill = async (bill) => {
    try {
      const newBill = await billsApi.create({ ...bill, storeId: currentStore });
      setBills(prev => [newBill, ...prev]);
      // Refresh products to get updated stock
      const updatedProducts = await productsApi.getAll(currentStore);
      setProducts(updatedProducts || []);
      setPreviewBill(bill);
      setActiveTab('invoices');
    } catch (err) {
      // Re-throw so BillingPage's catch block shows an inline error banner
      throw err;
    }
  };

  // ── Loan handlers ──────────────────────────────────────────────────────────
  const handleSaveLoan = async (loan) => {
    try {
      const newLoan = await loansApi.create({ ...loan, storeId: currentStore });
      setLoans(prev => [newLoan, ...prev]);
    } catch (err) {
      alert('Failed to save loan: ' + err.message);
    }
  };

  const handleUpdateLoan = async (updatedLoan) => {
    try {
      const saved = await loansApi.update(updatedLoan._id || updatedLoan.id, updatedLoan);
      setLoans(prev => prev.map(l => (l._id === saved._id ? saved : l)));
    } catch (err) {
      alert('Failed to update loan: ' + err.message);
    }
  };

  // ── Schemes handlers ────────────────────────────────────────────────────────
  const handleEnrollScheme = async (data) => {
    const newScheme = await schemesApi.create({ ...data, storeId: currentStore });
    setSchemes(prev => [newScheme, ...prev]);
  };

  const handlePayScheme = async (id, data) => {
    const updated = await schemesApi.pay(id, data);
    setSchemes(prev => prev.map(s => (s._id === id ? updated : s)));
  };

  const handleRedeemScheme = async (id) => {
    const updated = await schemesApi.redeem(id);
    setSchemes(prev => prev.map(s => (s._id === id ? updated : s)));
  };

  const handleCancelScheme = async (id) => {
    const updated = await schemesApi.cancel(id);
    setSchemes(prev => prev.map(s => (s._id === id ? updated : s)));
  };

  // ── Product CRUD handlers (all call MongoDB API) ──────────────────────────────
  const handleCreateProduct = async (data) => {
    const saved = await productsApi.create(data);
    const fresh = await productsApi.getAll(currentStore);
    setProducts(fresh || []);
    return saved;
  };

  const handleUpdateProduct = async (id, data) => {
    await productsApi.update(id, data);
    const fresh = await productsApi.getAll(currentStore);
    setProducts(fresh || []);
  };

  const handleDeleteProduct = async (id) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
  };

  // ── Gold rate update ───────────────────────────────────────────────────────
  const handleUpdateGoldRate = async (rate) => {
    setGoldRateState(rate);
    try {
      await settingsApi.update(currentStore, { goldRate: rate });
    } catch (err) {
      console.error('Failed to save gold rate:', err);
    }
  };

  // ── Silver rate update ─────────────────────────────────────────────────────
  const handleUpdateSilverRate = async (rate) => {
    setSilverRateState(rate);
    try {
      await settingsApi.update(currentStore, { silverRate: rate });
    } catch (err) {
      console.error('Failed to save silver rate:', err);
    }
  };

  // ── Staff update (from StaffPage) ──────────────────────────────────────────
  const handleUpdateStaff = async () => {
    try {
      const fresh = await staffApi.getAll();
      setStaff(fresh || []);
    } catch {}
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!currentStaff) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const storeProducts = products.filter(p => p.storeId === currentStore);
  const storeBills    = bills.filter(b => b.storeId === currentStore);
  const storeLoans    = loans.filter(l => l.storeId === currentStore);
  const storeSchemes  = schemes.filter(s => s.storeId === currentStore);
  const canSwitchStore = currentStaff.role === 'Admin';
  const sidebarWidth   = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStaff={currentStaff}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <main className={`transition-all duration-300 ${sidebarWidth} min-h-screen`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect y="2" width="16" height="2" rx="1" />
                    <rect y="7" width="16" height="2" rx="1" />
                    <rect y="12" width="16" height="2" rx="1" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <h2 className="text-gray-800 font-bold text-lg capitalize lg:block hidden">
                  {activeTab === 'billing'   ? 'New Bill'  :
                   activeTab === 'invoices'  ? 'Invoices'  :
                   activeTab === 'inventory' ? 'Inventory' :
                   activeTab === 'loans'     ? 'Gold Loans' :
                   activeTab === 'schemes'   ? 'Gold Schemes' :
                   activeTab}
                </h2>

                {/* Store Selector */}
                {canSwitchStore ? (
                  <select
                    value={currentStore}
                    onChange={(e) => setCurrentStore(e.target.value)}
                    className="bg-amber-50 border border-amber-300 text-amber-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {STORES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-500 text-sm hidden sm:inline-block bg-gray-100 px-3 py-1 rounded-lg">
                    {STORES.find(s => s.id === currentStore)?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* DB status */}
              {dbError && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg hidden sm:block">
                  {dbError}
                </span>
              )}
              {loading && (
                <svg className="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {/* Gold rate badge */}
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-700 font-semibold text-sm">Gold ₹{goldRate.toLocaleString('en-IN')}/g</span>
              </div>
              {/* Silver rate badge */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-blue-200 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-700 font-semibold text-sm">Silver ₹{silverRate.toLocaleString('en-IN')}/g</span>
              </div>
              {/* Staff badge */}
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <span className="text-gray-700 text-sm font-medium hidden sm:block">{currentStaff.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <Dashboard bills={storeBills} products={storeProducts} staff={staff} currentStaff={currentStaff} />
          )}
          {activeTab === 'billing' && (
            <BillingPage
              products={storeProducts}
              bills={storeBills}
              currentStaff={currentStaff}
              onGenerateBill={handleGenerateBill}
              onAddProduct={handleCreateProduct}
              currentStore={currentStore}
              goldRate={goldRate}
              silverRate={silverRate}
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
          {activeTab === 'schemes' && (
            <SchemesPage
              schemes={storeSchemes}
              onEnrollScheme={handleEnrollScheme}
              onPayScheme={handlePayScheme}
              onRedeemScheme={handleRedeemScheme}
              onCancelScheme={handleCancelScheme}
              currentStore={currentStore}
              goldRate={goldRate}
              silverRate={silverRate}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryPage
              products={products}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              currentStore={currentStore}
              currentStaff={currentStaff}
              goldRate={goldRate}
              silverRate={silverRate}
            />
          )}
          {activeTab === 'staff' && (
            <StaffPage
              staff={staff}
              onUpdateStaff={handleUpdateStaff}
              currentStaff={currentStaff}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsPage
              goldRate={goldRate}
              onUpdateGoldRate={handleUpdateGoldRate}
              silverRate={silverRate}
              onUpdateSilverRate={handleUpdateSilverRate}
            />
          )}
        </div>
      </main>

      {/* Bill Preview Modal */}
      {previewBill && (
        <BillPreview bill={previewBill} onClose={() => setPreviewBill(null)} />
      )}
    </div>
  );
}
