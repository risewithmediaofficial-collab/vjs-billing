import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { STORES } from './data.js';
import { ToastProvider, useToast } from './ToastContext.jsx';
import { Menu, X, Lock, ShieldAlert, Key, Eye, EyeOff, Loader2, AlertCircle, Keyboard } from 'lucide-react';
import {
  authApi, productsApi, billsApi, loansApi, staffApi, settingsApi, schemesApi, activityLogsApi,
  getToken, getCurrentUser, setCurrentUser, clearToken,
} from './api.js';
import LoginScreen from './components/LoginScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import BillingPage from './components/BillingPage.jsx';
import InvoicesPage from './components/InvoicesPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import SecretInventoryPage from './components/SecretInventoryPage.jsx';
import StaffPage from './components/StaffPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import BillPreview from './components/BillPreview.jsx';
import LoansPage from './components/LoansPage.jsx';
import SchemesPage from './components/SchemesPage.jsx';
import AuditTrailPage from './components/AuditTrailPage.jsx';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.jsx';
import useScrollLock, { getScrollLockCount } from './useScrollLock.js';

// ── Inner app wrapped by ToastProvider ────────────────────────────────────────
function AppInner() {
  const toast = useToast();

  const [currentStaff, setCurrentStaff] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Auto-collapse sidebar if user resizes down to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Global Keyboard Shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl?.tagName);

      // 1. Toggle Shortcuts Help with ? or Shift+/ (when not typing in an input field)
      if (!isInputActive && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // 2. Escape closes the shortcuts modal if open
      if (e.key === 'Escape' && showShortcutsModal) {
        e.preventDefault();
        setShowShortcutsModal(false);
        return;
      }

      // 3. Navigation shortcuts with Alt + [Key] (always accessible across any page)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === 'b') {
          e.preventDefault();
          setActiveTab('billing');
        } else if (k === 'i') {
          e.preventDefault();
          setActiveTab('inventory');
        } else if (k === 'h') {
          e.preventDefault();
          setActiveTab('invoices');
        } else if (k === 'd') {
          e.preventDefault();
          setActiveTab('dashboard');
        } else if (k === 'l') {
          e.preventDefault();
          setActiveTab('loans');
        } else if (k === 'g') {
          e.preventDefault();
          setActiveTab('schemes');
        } else if (k === 't') {
          if (currentStaff?.role === 'Admin' || currentStaff?.role === 'Manager') {
            e.preventDefault();
            setActiveTab('audit-trail');
          }
        } else if (k === 'u') {
          if (currentStaff?.role === 'Admin' || currentStaff?.role === 'Manager') {
            e.preventDefault();
            setActiveTab('staff');
          }
        } else if (k === 'e') {
          if (currentStaff?.role === 'Admin' || currentStaff?.role === 'Manager') {
            e.preventDefault();
            setActiveTab('settings');
          }
        }
        return;
      }

      // 4. Function keys (F1 - F4) for instant standard POS navigation
      if (!isInputActive && ['F1', 'F2', 'F3', 'F4'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'F1') setActiveTab('billing');
        else if (e.key === 'F2') setActiveTab('inventory');
        else if (e.key === 'F3') setActiveTab('invoices');
        else if (e.key === 'F4') setActiveTab('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, currentStaff]);

  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loans, setLoans] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [goldRate, setGoldRateState] = useState(7500);
  const [silverRate, setSilverRateState] = useState(85);
  const [previewBill, setPreviewBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [currentStore, setCurrentStore] = useState(
    () => getCurrentUser()?.storeId || STORES[0].id
  );

  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState('');

  // ── Secret Vault Auth & Path handling ─────────────────────────────────────────
  const [isSecretVaultAuth, setIsSecretVaultAuth] = useState(false);
  const [showSecretAuthModal, setShowSecretAuthModal] = useState(false);
  const [secretUserInput, setSecretUserInput] = useState('System Admin');
  const [secretPinInput, setSecretPinInput] = useState('');
  const [secretAuthError, setSecretAuthError] = useState('');
  const [secretAuthLoading, setSecretAuthLoading] = useState(false);
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  const checkUrlPathForSecret = useCallback(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const isSecretPath = path.includes('inventory1') || path.includes('invetory1') || path.includes('secret-inventory') ||
                         hash.includes('inventory1') || hash.includes('invetory1') || hash.includes('secret-inventory');

    if (isSecretPath) {
      if (!isSecretVaultAuth) {
        setShowSecretAuthModal(true);
      } else {
        setActiveTab('secret-inventory');
      }
    }
  }, [isSecretVaultAuth]);

  useEffect(() => {
    checkUrlPathForSecret();
    window.addEventListener('popstate', checkUrlPathForSecret);
    window.addEventListener('hashchange', checkUrlPathForSecret);
    return () => {
      window.removeEventListener('popstate', checkUrlPathForSecret);
      window.removeEventListener('hashchange', checkUrlPathForSecret);
    };
  }, [checkUrlPathForSecret]);

  // Lock screen scroll when preview bill or secret vault modal is open
  useScrollLock(!!previewBill || showSecretAuthModal);



  const handleVerifySecretVault = async (e) => {
    if (e) e.preventDefault();
    const user = secretUserInput.trim() || 'System Admin';
    const pin = secretPinInput.trim();
    if (!pin) {
      setSecretAuthError('Please enter password or PIN.');
      return;
    }
    setSecretAuthLoading(true);
    setSecretAuthError('');
    try {
      let authenticated = false;
      try {
        await authApi.login(user, pin);
        authenticated = true;
      } catch {
        if (currentStaff?.role === 'Admin') {
          try {
            await authApi.login(currentStaff.name, pin);
            authenticated = true;
          } catch {
            authenticated = false;
          }
        }
      }

      if (authenticated) {
        setIsSecretVaultAuth(true);
        setShowSecretAuthModal(false);
        setSecretPinInput('');
        setActiveTab('secret-inventory');
        if (!window.location.pathname.includes('inventory1')) {
          window.history.pushState(null, '', '/inventory1');
        }
        toast.success('Login successful!');
      } else {
        setSecretAuthError('Invalid username or password.');
      }
    } catch (err) {
      setSecretAuthError(err.message || 'Authentication error.');
    } finally {
      setSecretAuthLoading(false);
    }
  };

  const handleCancelSecretAuth = () => {
    setShowSecretAuthModal(false);
    setSecretPinInput('');
    setSecretAuthError('');
    if (activeTab === 'secret-inventory') {
      setActiveTab('dashboard');
    }
    if (window.location.pathname.includes('inventory1') || window.location.pathname.includes('invetory1')) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLockSecretVault = () => {
    setIsSecretVaultAuth(false);
    setActiveTab('dashboard');
    if (window.location.pathname.includes('inventory1') || window.location.pathname.includes('invetory1')) {
      window.history.pushState(null, '', '/');
    }
    toast.info('Secret Vault locked.');
  };

  // ── Load all data from backend ─────────────────────────────────────────────
  const loadData = useCallback(async (storeId) => {
    if (!getToken()) return;
    setLoading(true);
    setDbError('');
    try {
      const isAdmin = getCurrentUser()?.role === 'Admin';
      const [prods, bls, stf, lns, settings, schs, logs] = await Promise.all([
        productsApi.getAll(storeId),
        billsApi.getAll(storeId),
        staffApi.getAll(),
        loansApi.getAll(storeId),
        settingsApi.get(storeId),
        schemesApi.getAll(storeId),
        isAdmin ? activityLogsApi.getAll(storeId) : Promise.resolve([]),
      ]);
      setProducts(prods || []);
      setBills(bls || []);
      setStaff(stf || []);
      setLoans(lns || []);
      setSchemes(schs || []);
      setGoldRateState(settings?.goldRate || 7500);
      setSilverRateState(settings?.silverRate || 85);
      setActivityLogs(logs || []);
    } catch (err) {
      const msg = err.message || 'Unable to connect to server.';
      setDbError(msg);
      toast.error(msg, 'Connection Error');
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

  // Lock body scroll when bill preview modal is open
  useEffect(() => {
    if (previewBill) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [previewBill]);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleLogin = (staffMember) => {
    setCurrentStaff(staffMember);
    setCurrentUser(staffMember);
    if (staffMember.storeId) setCurrentStore(staffMember.storeId);
    toast.success(`Welcome back, ${staffMember.name}!`);
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
    setActivityLogs([]);
    // Toast won't show after logout since LoginScreen replaces the app —
    // but we keep the call for completeness (it's harmless)
  };

  // ── Bill creation ──────────────────────────────────────────────────────────
  const handleGenerateBill = async (bill, autoNavigate = true) => {
    try {
      const newBill = await billsApi.create({ ...bill, storeId: currentStore });
      setBills(prev => [newBill, ...prev]);
      // Refresh products to get updated stock
      const updatedProducts = await productsApi.getAll(currentStore);
      setProducts(updatedProducts || []);
      setPreviewBill(newBill);
      if (autoNavigate) {
        setActiveTab('invoices');
      }
      toast.success(`Bill ${newBill.invoiceNumber || ''} generated successfully!`);
      return newBill;
    } catch (err) {
      toast.error(err.message || 'Failed to generate bill. Please try again.', 'Billing Error');
      throw err;
    }
  };

  // ── Bill action (Refund / Exchange with stock restoration, logged for Admin) ──
  const handleProcessBillAction = async (billId, { action, reason }) => {
    try {
      const res = await billsApi.processAction(billId, { action, reason });
      setBills(prev => prev.map(b => (b._id === billId || b.id === billId) ? res.bill : b));
      // Refresh products to reflect restored inventory stock
      const updatedProducts = await productsApi.getAll(currentStore);
      setProducts(updatedProducts || []);
      // Refresh activity logs so Admin dashboard reflects it immediately
      if (currentStaff?.role === 'Admin') {
        const logs = await activityLogsApi.getAll(currentStore);
        setActivityLogs(logs || []);
      }
      toast.success(res.message || `Bill ${action === 'refund' ? 'refunded' : 'exchanged'} successfully!`);
      return res.bill;
    } catch (err) {
      toast.error(err.message || `Failed to process ${action}.`, 'Action Error');
      throw err;
    }
  };

  // ── Bill Editing Handlers ──────────────────────────────────────────────────
  const handleStartEditBill = (bill) => {
    setEditingBill(bill);
    setActiveTab('billing');
  };

  const handleUpdateBill = async (billId, updatedData) => {
    try {
      const res = await billsApi.update(billId, updatedData);
      const updatedBill = res.bill || res;
      setBills(prev => prev.map(b => (b._id === billId || b.id === billId) ? updatedBill : b));
      // Refresh products to reflect updated inventory stock
      const updatedProducts = await productsApi.getAll(currentStore);
      setProducts(updatedProducts || []);
      // Refresh activity logs for Admin
      if (currentStaff?.role === 'Admin') {
        const logs = await activityLogsApi.getAll(currentStore);
        setActivityLogs(logs || []);
      }
      setEditingBill(null);
      setActiveTab('invoices');
      toast.success(`Invoice ${updatedBill.invoiceNumber || ''} updated successfully!`);
      return updatedBill;
    } catch (err) {
      toast.error(err.message || 'Failed to update invoice.', 'Update Error');
      throw err;
    }
  };

  // ── Loan handlers ──────────────────────────────────────────────────────────
  const handleSaveLoan = async (loan) => {
    try {
      const newLoan = await loansApi.create({ ...loan, storeId: currentStore });
      setLoans(prev => [newLoan, ...prev]);
      toast.success('Gold loan created successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save loan.', 'Loan Error');
    }
  };

  const handleUpdateLoan = async (updatedLoan) => {
    try {
      const saved = await loansApi.update(updatedLoan._id || updatedLoan.id, updatedLoan);
      setLoans(prev => prev.map(l => (l._id === saved._id ? saved : l)));
      if (updatedLoan.status === 'Closed') {
        toast.success('Loan settled and closed successfully!');
      } else if (updatedLoan.status === 'SettlePending') {
        toast.info('Settlement request submitted for Admin approval.');
      } else if (updatedLoan.lastRenewalDate && updatedLoan.renewals?.length) {
        toast.success(`Loan #${updatedLoan.loanNumber} renewed successfully!`);
      } else {
        toast.success('Loan updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update loan.', 'Loan Error');
    }
  };

  // ── Schemes handlers ────────────────────────────────────────────────────────
  const handleEnrollScheme = async (data) => {
    try {
      const newScheme = await schemesApi.create({ ...data, storeId: currentStore });
      setSchemes(prev => [newScheme, ...prev]);
      toast.success('Scheme enrollment successful!');
    } catch (err) {
      toast.error(err.message || 'Failed to enroll scheme.', 'Scheme Error');
      throw err;
    }
  };

  const handlePayScheme = async (id, data) => {
    try {
      const updated = await schemesApi.pay(id, data);
      setSchemes(prev => prev.map(s => (s._id === id ? updated : s)));
      toast.success('Installment payment recorded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to record installment.', 'Payment Error');
      throw err;
    }
  };

  const handleRedeemScheme = async (id, payload = {}) => {
    try {
      const updated = await schemesApi.redeem(id, payload);
      setSchemes(prev => prev.map(s => (s._id === id ? updated : s)));
      if (payload?.status === 'active') {
        toast.warning('Redemption request rejected — scheme restored to active.');
      } else if (payload?.status === 'completed') {
        toast.success('Scheme redemption approved successfully!');
      } else {
        toast.success('Scheme redeemed successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to redeem scheme.', 'Scheme Error');
      throw err;
    }
  };

  const handleCancelScheme = async (id, payload = {}) => {
    try {
      const updated = await schemesApi.cancel(id, payload);
      setSchemes(prev => prev.map(s => (s._id === id ? updated : s)));
      if (payload?.status === 'active') {
        toast.warning('Cancellation request rejected — scheme restored to active.');
      } else {
        toast.success('Scheme cancelled successfully.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel scheme.', 'Scheme Error');
      throw err;
    }
  };

  // ── Product CRUD handlers ──────────────────────────────────────────────────
  const handleCreateProduct = async (data) => {
    try {
      const saved = await productsApi.create(data);
      const fresh = await productsApi.getAll(currentStore);
      setProducts(fresh || []);
      toast.success('Product added to inventory successfully!');
      return saved;
    } catch (err) {
      toast.error(err.message || 'Failed to add product.', 'Inventory Error');
      throw err;
    }
  };

  const handleUpdateProduct = async (id, data) => {
    try {
      await productsApi.update(id, data);
      const fresh = await productsApi.getAll(currentStore);
      setProducts(fresh || []);
      toast.success('Product updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update product.', 'Inventory Error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      toast.success('Product removed from inventory.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.', 'Inventory Error');
      throw err;
    }
  };

  // ── Gold rate update ───────────────────────────────────────────────────────
  const handleUpdateGoldRate = async (rate) => {
    setGoldRateState(rate);
    try {
      await settingsApi.update(currentStore, { goldRate: rate });
      toast.success('Gold rate updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save gold rate.', 'Settings Error');
    }
  };

  // ── Silver rate update ─────────────────────────────────────────────────────
  const handleUpdateSilverRate = async (rate) => {
    setSilverRateState(rate);
    try {
      await settingsApi.update(currentStore, { silverRate: rate });
      toast.success('Silver rate updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save silver rate.', 'Settings Error');
    }
  };

  // ── Staff CRUD handlers ────────────────────────────────────────────────────
  const handleCreateStaff = async (data) => {
    try {
      await staffApi.create(data);
      const fresh = await staffApi.getAll();
      setStaff(fresh || []);
      toast.success(`${data.name} added to the team successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to create staff member.', 'Staff Error');
      throw err;
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      await staffApi.delete(id);
      setStaff(prev => prev.filter(s => (s._id || s.id) !== id));
      toast.success('Staff member removed successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff member.', 'Staff Error');
    }
  };

  const handleUpdateStaff = async (id, data) => {
    try {
      const updated = await staffApi.update(id, data);
      setStaff(prev => prev.map(s => (s._id === id || s.id === id ? updated : s)));
      toast.success('Staff member updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update staff member.', 'Staff Error');
      throw err;
    }
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
  const sidebarWidth   = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStaff={currentStaff}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onHover={setIsSidebarHovered}
      />

      <main className={`transition-all duration-300 ${sidebarWidth} min-h-screen w-full max-w-full overflow-x-hidden min-w-0`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isSidebarHovered && sidebarCollapsed
                    ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 scale-105'
                    : 'bg-gray-100 hover:bg-amber-100 hover:text-amber-600 text-gray-600 border border-gray-200'
                }`}
                title={sidebarCollapsed ? "Open Menu" : "Close Menu"}
              >
                {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <h2 className="text-gray-800 font-bold text-sm sm:text-lg capitalize font-display truncate">
                  {activeTab === 'billing'          ? 'New Bill'  :
                   activeTab === 'invoices'         ? 'Invoices'  :
                   activeTab === 'inventory'        ? 'Inventory' :
                   activeTab === 'loans'            ? 'Jewel Loans' :
                   activeTab === 'schemes'          ? 'Gold Schemes' :
                   activeTab === 'audit-trail'      ? 'Audit Trail' :
                   activeTab}
                </h2>

                {/* Store Selector */}
                {canSwitchStore ? (
                  <select
                    value={currentStore}
                    onChange={(e) => setCurrentStore(e.target.value)}
                    className="bg-amber-50 border border-amber-300 text-amber-800 text-xs sm:text-sm rounded-lg px-2 sm:px-2.5 py-1 focus:outline-none focus:border-amber-500 font-medium max-w-[110px] sm:max-w-[160px] truncate"
                  >
                    {STORES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-500 text-xs sm:text-sm hidden md:inline-block bg-gray-100 px-2.5 py-1 rounded-lg">
                    {STORES.find(s => s.id === currentStore)?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* DB status */}
              {dbError && (
                <span className="text-[10px] sm:text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{dbError}</span>
                </span>
              )}
              {loading && (
                <svg className="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {/* Compact Gold rate pill on mobile */}
              <div className="sm:hidden flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-800 font-bold text-[11px]">₹{goldRate.toLocaleString('en-IN')}/g</span>
              </div>
              {/* Gold rate badge for desktop */}
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-700 font-semibold text-sm">Gold ₹{goldRate.toLocaleString('en-IN')}/g</span>
              </div>
              {/* Silver rate badge for desktop */}
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-blue-200 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-700 font-semibold text-sm">Silver ₹{silverRate.toLocaleString('en-IN')}/g</span>
              </div>
              {/* Staff badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 border border-gray-200 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentStaff.name.charAt(0)}
                </div>
                <span className="text-gray-700 text-xs sm:text-sm font-medium hidden sm:block truncate max-w-[100px]">{currentStaff.name}</span>
              </div>

              {/* Keyboard Shortcuts Trigger Button */}
              <button
                type="button"
                onClick={() => setShowShortcutsModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-gray-100 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300 text-gray-600 border border-gray-200 rounded-xl font-semibold text-xs transition-all shadow-2xs"
                title="Keyboard Shortcuts (Press ?)"
              >
                <Keyboard size={14} className="text-amber-600 shrink-0" />
                <span className="hidden md:inline">Shortcuts</span>
                <kbd className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-white border border-gray-300 rounded shadow-xs text-gray-500">?</kbd>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-5 max-w-full min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              bills={storeBills}
              products={storeProducts.filter(p => !p.isSecret)}
              staff={staff}
              currentStaff={currentStaff}
              onViewBill={setPreviewBill}
              activityLogs={activityLogs}
              onRefreshData={() => loadData(currentStore)}
            />
          )}
          {activeTab === 'billing' && (
            <BillingPage
              products={storeProducts.filter(p => !p.isSecret)}
              bills={storeBills}
              currentStaff={currentStaff}
              onGenerateBill={handleGenerateBill}
              onAddProduct={handleCreateProduct}
              currentStore={currentStore}
              goldRate={goldRate}
              silverRate={silverRate}
              editingBill={editingBill}
              onCancelEdit={() => setEditingBill(null)}
              onUpdateBill={handleUpdateBill}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesPage
              bills={storeBills}
              onProcessBillAction={handleProcessBillAction}
              onEditBill={handleStartEditBill}
              currentStaff={currentStaff}
            />
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
              currentStaff={currentStaff}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryPage
              products={products.filter(p => !p.isSecret)}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              currentStore={currentStore}
              currentStaff={currentStaff}
              goldRate={goldRate}
              silverRate={silverRate}
            />
          )}
          {activeTab === 'secret-inventory' && (
            <SecretInventoryPage
              products={products}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              currentStore={currentStore}
              currentStaff={currentStaff}
              goldRate={goldRate}
              silverRate={silverRate}
              onLockVault={handleLockSecretVault}
            />
          )}
          {activeTab === 'audit-trail' && (
            <AuditTrailPage
              activityLogs={activityLogs}
              currentStaff={currentStaff}
              staff={staff}
              onRefreshData={() => loadData(currentStore)}
            />
          )}
          {activeTab === 'staff' && (
            <StaffPage
              staff={staff}
              onCreateStaff={handleCreateStaff}
              onDeleteStaff={handleDeleteStaff}
              onUpdateStaff={handleUpdateStaff}
              currentStaff={currentStaff}
              bills={storeBills}
              products={storeProducts}
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

      {/* User Login Modal for Path Authentication */}
      {showSecretAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-6 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white mx-auto mb-3 shadow-inner">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-bold font-display text-white">User Verification</h3>
              <p className="text-xs text-amber-100 mt-1">
                Please enter your login username and password to access this page.
              </p>
            </div>

            <form onSubmit={handleVerifySecretVault} className="p-6 space-y-4">
              {secretAuthError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0 text-red-600" />
                  {secretAuthError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={secretUserInput}
                  onChange={(e) => setSecretUserInput(e.target.value)}
                  placeholder="Enter Username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password / PIN
                </label>
                <div className="relative">
                  <input
                    type={showPasswordToggle ? "text" : "password"}
                    value={secretPinInput}
                    onChange={(e) => setSecretPinInput(e.target.value)}
                    placeholder="Enter Password or PIN"
                    autoFocus
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordToggle ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelSecretAuth}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={secretAuthLoading}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {secretAuthLoading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}

// ── Root export — wraps everything in ToastProvider ───────────────────────────
export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
