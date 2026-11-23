import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import {
  Package, Plus, Edit3, Trash2, Search, X, Save,
  AlertTriangle, CheckCircle2, Barcode, Lock, Image as ImageIcon, Loader2,
  Calendar, ArrowUpDown, RotateCcw, Sparkles, Coins, CalendarRange
} from 'lucide-react';
import { formatCurrency, calculateBillAmounts, STORES } from '../data.js';
import useScrollLock from '../useScrollLock.js';

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];

const emptyProduct = {
  id: '', barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null,
  metalType: 'gold', gstPercent: 3,
};

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getProductDate(product) {
  if (product.createdAt) return new Date(product.createdAt);
  if (product.dateAdded) return new Date(product.dateAdded);
  if (product._id && typeof product._id === 'string' && product._id.length === 24) {
    try {
      return new Date(parseInt(product._id.substring(0, 8), 16) * 1000);
    } catch {
      return null;
    }
  }
  return null;
}

function InventoryPage({ products, onCreateProduct, onUpdateProduct, onDeleteProduct, currentStore, currentStaff, goldRate = 7500, silverRate = 85 }) {
  const [search, setSearch]                   = useState('');
  const [dateFilter, setDateFilter]           = useState('All'); // All, Today, This Month, This Year, Custom
  const [startDate, setStartDate]             = useState('');
  const [endDate, setEndDate]                 = useState('');
  const [metalFilter, setMetalFilter]         = useState('all'); // all, gold, silver
  const [categoryFilter, setCategoryFilter]   = useState('all');
  const [stockFilter, setStockFilter]         = useState('all'); // all, in_stock, low_stock, out_of_stock
  const [sortBy, setSortBy]                   = useState('weight_desc'); // weight_desc, weight_asc, price_desc, price_asc, stock_desc, stock_asc, name_asc, date_desc

  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]               = useState(emptyProduct);
  const [success, setSuccess]         = useState('');
  const [formError, setFormError]     = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // product id pending delete
  const searchRef = useRef(null);
  const isAdminOrManager = currentStaff?.role === 'Admin' || currentStaff?.role === 'Manager';

  // Lock screen scroll when product modal form or delete confirmation is active
  useScrollLock(showForm || !!deleteConfirm);

  const deferredSearch = useDeferredValue(search);

  const { filtered, filteredGoldWeight, filteredSilverWeight, filteredTotalValue } = useMemo(() => {
    const list = products.filter(p => {
      // 1. Search filter
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase();
        const pid     = (p._id || p.id || '').toString().toLowerCase();
        const barcode = (p.barcode || '').toLowerCase();
        const name    = (p.name || '').toLowerCase();
        const cat     = (p.category || '').toLowerCase();
        if (!name.includes(q) && !pid.includes(q) && !barcode.includes(q) && !cat.includes(q)) {
          return false;
        }
      }

      // 2. Metal Filter
      const isSilver = (p.purity || '').toLowerCase() === 'silver' || p.metalType === 'silver';
      if (metalFilter === 'gold' && isSilver) return false;
      if (metalFilter === 'silver' && !isSilver) return false;

      // 3. Category Filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }

      // 4. Stock Status Filter
      const stk = Number(p.stock) || 0;
      if (stockFilter === 'in_stock' && stk <= 0) return false;
      if (stockFilter === 'low_stock' && (stk <= 0 || stk > 3)) return false;
      if (stockFilter === 'out_of_stock' && stk > 0) return false;

      // 5. Date Added Filter
      if (dateFilter !== 'All') {
        const pDate = getProductDate(p);
        if (!pDate) return true; // Keep if date cannot be resolved
        const now = new Date();

        if (dateFilter === 'Today') {
          if (pDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'This Month') {
          if (pDate.getMonth() !== now.getMonth() || pDate.getFullYear() !== now.getFullYear()) return false;
        } else if (dateFilter === 'This Year') {
          if (pDate.getFullYear() !== now.getFullYear()) return false;
        } else if (dateFilter === 'Custom') {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (pDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (pDate > end) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      const weightA = Number(a.weight) || 0;
      const weightB = Number(b.weight) || 0;
      const stockA  = Number(a.stock) || 0;
      const stockB  = Number(b.stock) || 0;
      const priceA  = calculateBillAmounts(a).totalAmount;
      const priceB  = calculateBillAmounts(b).totalAmount;
      const dateA   = getProductDate(a) || new Date(0);
      const dateB   = getProductDate(b) || new Date(0);

      if (sortBy === 'weight_asc') return weightA - weightB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'price_asc')  return priceA - priceB;
      if (sortBy === 'stock_desc') return stockB - stockA;
      if (sortBy === 'stock_asc')  return stockA - stockB;
      if (sortBy === 'name_asc')   return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'date_desc')  return dateB - dateA;
      // Default: weight_desc (Heaviest jewel first)
      return weightB - weightA;
    });

    let goldWt = 0;
    let silverWt = 0;
    let val = 0;

    for (const p of list) {
      const isSilver = (p.purity || '').toLowerCase() === 'silver' || p.metalType === 'silver';
      const wt = (Number(p.weight) || 0) * (Number(p.stock) || 0);
      if (isSilver) {
        silverWt += wt;
      } else {
        goldWt += wt;
      }
      val += calculateBillAmounts(p).totalAmount * (Number(p.stock) || 0);
    }

    return {
      filtered: list,
      filteredGoldWeight: goldWt,
      filteredSilverWeight: silverWt,
      filteredTotalValue: val,
    };
  }, [products, deferredSearch, metalFilter, categoryFilter, stockFilter, dateFilter, startDate, endDate, sortBy]);

  const hasActiveFilters = search !== '' || dateFilter !== 'All' || startDate !== '' || endDate !== '' || metalFilter !== 'all' || categoryFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'weight_desc';

  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('All');
    setStartDate('');
    setEndDate('');
    setMetalFilter('all');
    setCategoryFilter('all');
    setStockFilter('all');
    setSortBy('weight_desc');
  };

  const openAdd = () => {
    const nextNum = String(products.length + 1).padStart(3, '0');
    setForm({ ...emptyProduct, id: `PRD-${nextNum}`, barcode: `HUID-${nextNum}`, storeId: currentStore, goldRate, metalType: 'gold', gstPercent: 3 });
    setImagePreview(null);
    setEditProduct(null);
    setFormError('');
    setShowForm(true);
  };

  const handleMetalTypeChange = (metal) => {
    if (metal === 'silver') {
      setForm(p => ({ ...p, metalType: 'silver', purity: 'Silver', goldRate: silverRate }));
    } else {
      setForm(p => ({ ...p, metalType: 'gold', purity: '22K', goldRate: goldRate }));
    }
  };

  const openEdit = (product) => {
    const metal = (product.purity || '').toLowerCase() === 'silver' ? 'silver' : 'gold';
    setForm({ ...product, metalType: metal, gstPercent: product.gstPercent !== undefined ? product.gstPercent : 3 });
    setImagePreview(product.image || null);
    setEditProduct(product._id || product.id);
    setFormError('');
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setFormError(`Image exceeds 1MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select an image under 1MB.`);
      e.target.value = '';
      return;
    }
    setFormError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm(p => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.weight || !form.stock) {
      setFormError('Please fill all required fields: Product Name, Weight, and Stock.');
      return;
    }
    setFormError('');
    setSaveLoading(true);
    const productData = {
      ...form,
      weight:       parseFloat(form.weight),
      makingCharge: parseFloat(form.makingCharge) || 0,
      stoneCharge:  parseFloat(form.stoneCharge)  || 0,
      goldRate:     parseFloat(form.goldRate)      || goldRate,
      stock:        parseInt(form.stock),
      gstPercent:   Number(form.gstPercent !== undefined ? form.gstPercent : 3),
      storeId:      form.storeId || currentStore,
    };
    try {
      if (editProduct) {
        await onUpdateProduct(editProduct, productData);
        setSuccess('Product updated successfully!');
      } else {
        await onCreateProduct(productData);
        setSuccess('Product added successfully!');
      }
      setTimeout(() => setSuccess(''), 2500);
      setShowForm(false);
      setImagePreview(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await onDeleteProduct(deleteConfirm);
      setSuccess('Product removed from inventory.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setFormError('Failed to delete product: ' + err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const inventoryStateRef = useRef({});
  inventoryStateRef.current = {
    isAdminOrManager,
    showForm,
    deleteConfirm,
    search,
    openAdd,
    handleSave,
  };

  // ── Keyboard Shortcuts for Inventory Page ─────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl?.tagName);
      const state = inventoryStateRef.current;

      // 1. Alt + N or Insert: Add Product
      if ((e.altKey && (e.key === 'n' || e.key === 'N')) || e.key === 'Insert') {
        if (state.isAdminOrManager) {
          e.preventDefault();
          state.openAdd();
          return;
        }
      }

      // 2. Alt + S or / (when not typing in an input): Focus Search Bar
      if ((e.altKey && (e.key === 's' || e.key === 'S')) || (!isInput && e.key === '/')) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      // 3. Ctrl + Enter inside Add/Edit Form: Save Product
      if (state.showForm && e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        state.handleSave();
        return;
      }

      // 4. Escape: Close Form / Cancel Delete / Clear Search
      if (e.key === 'Escape') {
        if (state.showForm) {
          e.preventDefault();
          setShowForm(false);
          setImagePreview(null);
          setFormError('');
          return;
        }
        if (state.deleteConfirm) {
          e.preventDefault();
          setDeleteConfirm(null);
          return;
        }
        if (state.search) {
          e.preventDefault();
          setSearch('');
          searchRef.current?.blur();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const stockBadge = (stock) => {
    if (stock === 0)  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Out of Stock</span>;
    if (stock <= 2)   return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle size={10} />{stock} Low</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">{stock} In Stock</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in stock</p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdminOrManager && (
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5">
              <Lock size={13} className="text-gray-400" />
              <span className="text-gray-500 text-xs">View only</span>
            </div>
          )}
          {isAdminOrManager && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
              title="Add Product (Alt+N or Insert)"
            >
              <Plus size={16} />
              <span>Add Product</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono font-bold bg-white/20 text-white rounded ml-1">Alt+N</kbd>
            </button>
          )}
        </div>
      </div>

      {/* Low stock warning banner */}
      {products.filter(p => p.stock > 0 && p.stock <= 3).length > 0 && (() => {
        const lowList = products.filter(p => p.stock > 0 && p.stock <= 3);
        return (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-800 font-semibold text-sm">Low Stock Alert</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {lowList.length} item{lowList.length !== 1 ? 's are' : ' is'} running low:{' '}
                <span className="font-medium">{lowList.map(p => `${p.name} (${p.stock})`).join(', ')}</span>
              </p>
            </div>
          </div>
        );
      })()}

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Form error banner */}
      {formError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <AlertTriangle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm flex-1">{formError}</p>
          <button onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 ml-2"><X size={14} /></button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 overflow-hidden animate-drawer-right rounded-l-2xl sm:rounded-l-3xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Delete Product</h3>
                  <p className="text-gray-500 text-xs">This action cannot be undone</p>
                </div>
              </div>
              <button onClick={() => setDeleteConfirm(null)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 py-6">
              <p className="text-gray-600 text-sm">
                Are you sure you want to remove this product from inventory? All associated stock data will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold hover:bg-gray-200 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sorting Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, HUID No or category... (Alt+S or /)"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-14 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-850 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs font-mono font-semibold">
                Alt+S
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Metal Filter */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMetalFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  metalFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All Metals
              </button>
              <button
                onClick={() => setMetalFilter('gold')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  metalFilter === 'gold' ? 'bg-amber-500 text-white shadow-2xs font-bold' : 'text-gray-500 hover:text-amber-700'
                }`}
              >
                <Coins size={12} /> Gold
              </button>
              <button
                onClick={() => setMetalFilter('silver')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  metalFilter === 'silver' ? 'bg-slate-700 text-white shadow-2xs font-bold' : 'text-gray-500 hover:text-slate-800'
                }`}
              >
                <Sparkles size={12} /> Silver
              </button>
            </div>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&gt;0)</option>
              <option value="low_stock">Low Stock (≤3)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filters & Sorting Controls */}
        <div className="pt-2 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Date Range Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar size={13} className="text-amber-600" /> Added:
            </span>
            {[
              { id: 'All', label: 'All Time' },
              { id: 'Today', label: 'Today' },
              { id: 'This Month', label: 'This Month' },
              { id: 'This Year', label: 'This Year' },
              { id: 'Custom', label: 'Date to Date' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateFilter === tab.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown size={13} className="text-amber-600" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
            >
              <option value="weight_desc">Weight: Heaviest First</option>
              <option value="weight_asc">Weight: Lightest First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="stock_desc">Stock: Highest First</option>
              <option value="stock_asc">Stock: Lowest First</option>
              <option value="name_asc">Product Name: A to Z</option>
              <option value="date_desc">Date Added: Newest First</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers (shown when Custom is active) */}
        {dateFilter === 'Custom' && (
          <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex-wrap text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-850 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">To Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-850 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[11px] text-amber-800 font-bold hover:underline ml-auto"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}

        {/* KPI Summary / Active Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500">
              Showing <strong className="text-gray-900 font-mono">{filtered.length}</strong> products
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">
              Total Gold Stock: <strong className="text-amber-700 font-mono font-bold">{filteredGoldWeight.toFixed(2)}g</strong>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">
              Total Silver Stock: <strong className="text-slate-700 font-mono font-bold">{filteredSilverWeight.toFixed(2)}g</strong>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">
              Est. Stock Value: <strong className="text-emerald-700 font-mono font-bold">{formatCurrency(filteredTotalValue)}</strong>
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-semibold transition-colors"
            >
              <RotateCcw size={12} />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">No products found</p>
            <p className="text-gray-300 text-sm mt-1">Add your first product using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Product Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">SKU / Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Metal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Purity</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Weight (g)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Making (₹)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Qty</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date Added</th>
                  {isAdminOrManager && (
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product, idx) => {
                  const price    = calculateBillAmounts(product).totalAmount;
                  const metalLabel = (product.purity || '').toLowerCase() === 'silver' ? 'Silver' : 'Gold';
                  return (
                    <tr
                      key={product._id || product.id}
                      className={`hover:bg-amber-50/40 transition-colors ${product.stock === 0 ? 'bg-red-50/50 hover:bg-red-100/40 text-red-900 border-l-4 border-red-500' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      {/* Product Name + image */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <Package size={16} className="text-amber-400" />}
                          </div>
                          <div>
                            <p className="text-gray-800 font-semibold text-sm leading-tight">{product.name}</p>
                            {product.barcode && (
                              <p className="text-gray-400 text-xs flex items-center gap-0.5 mt-0.5">
                                <Barcode size={10} />HUID: {product.barcode}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {(product._id || product.id || '—').toString().slice(-8).toUpperCase()}
                        </span>
                      </td>

                      {/* Category & GST */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-700 text-sm">{product.category}</span>
                          {product.gstPercent !== undefined && product.gstPercent !== 3 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              product.gstPercent === 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {product.gstPercent}% GST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Metal */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          metalLabel === 'Silver'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {metalLabel}
                        </span>
                      </td>

                      {/* Purity */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm font-medium">
                        {product.purity}
                      </td>

                      {/* Weight */}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 text-sm font-semibold">
                        {product.weight}g
                      </td>

                      {/* Making */}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600 text-sm">
                        {formatCurrency(product.makingCharge || 0)}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="text-amber-700 font-bold text-sm">{formatCurrency(price)}</span>
                      </td>

                      {/* Qty */}
                      <td className={`px-4 py-3 whitespace-nowrap text-center font-bold text-sm ${product.stock === 0 ? 'text-red-700 bg-red-100/50 rounded-lg' : 'text-gray-700'}`}>
                        {product.stock}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {stockBadge(product.stock)}
                      </td>

                      {/* Date Added */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">
                        {formatShortDate(product.createdAt)}
                      </td>

                      {/* Actions */}
                      {isAdminOrManager && (
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEdit(product)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all border border-gray-200"
                              title="Edit"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id || product.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all border border-red-200"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sold Out / Out of Stock Table Section */}
      {(() => {
        const soldOutProducts = products.filter(p => p.stock === 0);
        // Also apply text search filter to the sold-out list so they filter in sync
        const filteredSoldOut = soldOutProducts.filter(p => {
          const q = search.toLowerCase();
          const pid = (p._id || p.id || '').toString().toLowerCase();
          const barcode = (p.barcode || '').toLowerCase();
          return p.name.toLowerCase().includes(q) || pid.includes(q) || barcode.includes(q) || p.category.toLowerCase().includes(q);
        });

        return (
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden mt-8">
            <div className="bg-red-50/40 border-b border-red-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500 animate-pulse" size={18} />
                <h2 className="text-red-800 font-bold text-base">Sold Out / Out of Stock Items</h2>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold">
                {soldOutProducts.length} total sold out
              </span>
            </div>

            {soldOutProducts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-700 font-semibold text-sm">No items are sold out!</p>
                <p className="text-gray-400 text-xs mt-0.5">All products in inventory have active stock levels.</p>
              </div>
            ) : filteredSoldOut.length === 0 ? (
              <div className="text-center py-10">
                <Search size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-semibold">No sold out items match your search query</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50/10 border-b border-red-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Product Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">SKU / Code</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Metal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Purity</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Weight (g)</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Making (₹)</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Qty</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date Added</th>
                      {isAdminOrManager && (
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {filteredSoldOut.map((product, idx) => {
                      const price = calculateBillAmounts(product).totalAmount;
                      const metalLabel = (product.purity || '').toLowerCase() === 'silver' ? 'Silver' : 'Gold';
                      return (
                        <tr
                          key={product._id || product.id}
                          className={`hover:bg-red-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-red-50/10'}`}
                        >
                          {/* Product Name */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                {product.image
                                  ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  : <Package size={16} className="text-red-400" />}
                              </div>
                              <div>
                                <p className="text-gray-800 font-semibold text-sm leading-tight">{product.name}</p>
                                {product.barcode && (
                                  <p className="text-gray-400 text-xs flex items-center gap-0.5 mt-0.5">
                                    <Barcode size={10} />HUID: {product.barcode}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {(product._id || product.id || '—').toString().slice(-8).toUpperCase()}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-gray-700 text-sm">{product.category}</span>
                          </td>

                          {/* Metal */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              metalLabel === 'Silver'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {metalLabel}
                            </span>
                          </td>

                          {/* Purity */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm font-medium">
                            {product.purity}
                          </td>

                          {/* Weight */}
                          <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 text-sm font-semibold">
                            {product.weight}g
                          </td>

                          {/* Making */}
                          <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600 text-sm">
                            {formatCurrency(product.makingCharge || 0)}
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className="text-amber-700 font-bold text-sm">{formatCurrency(price)}</span>
                          </td>

                          {/* Qty */}
                          <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-sm text-red-600 bg-red-100/40">
                            {product.stock}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Out of Stock</span>
                          </td>

                          {/* Date Added */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">
                            {formatShortDate(product.createdAt)}
                          </td>

                          {/* Actions */}
                          {isAdminOrManager && (
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => openEdit(product)}
                                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all border border-gray-200"
                                  title="Edit"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id || product.id)}
                                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all border border-red-200"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saveLoading) {
              setShowForm(false); setImagePreview(null); setFormError('');
            }
          }}
        >
          <div className="w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 overflow-hidden animate-drawer-right rounded-l-2xl sm:rounded-l-3xl text-gray-800">
            <div className="shrink-0 p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-gray-800 font-bold text-lg sm:text-xl">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => { setShowForm(false); setImagePreview(null); setFormError(''); }} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <svg className="shrink-0 mt-0.5 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-red-600 text-sm flex-1">{formError}</p>
                <button onClick={() => setFormError('')} className="text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            )}

            {/* Product Image Upload */}
            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">Product Image (optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    : <ImageIcon size={24} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all text-sm w-fit font-medium shadow-sm">
                    <ImageIcon size={14} />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <button onClick={() => { setImagePreview(null); setForm(p => ({ ...p, image: null })); }} className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium block">
                      Remove image
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'id',   label: 'Product ID *',   type: 'text', placeholder: 'PRD-001', full: false, disabled: !!editProduct },
                { key: 'barcode', label: 'HUID No',     type: 'text', placeholder: 'e.g. HUID-8901234', full: false },
                { key: 'name', label: 'Product Name *', type: 'text', placeholder: 'Gold Ring 22K', full: true },
              ].map(field => (
                <div key={field.key} className={field.full ? 'col-span-2' : ''}>
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all disabled:opacity-50"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-2 block">Metal Type *</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="metalType" value="gold" checked={form.metalType === 'gold'} onChange={() => handleMetalTypeChange('gold')} className="accent-amber-500" />
                    <span className="text-gray-700 text-sm font-medium">Gold</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="metalType" value="silver" checked={form.metalType === 'silver'} onChange={() => handleMetalTypeChange('silver')} className="accent-blue-500" />
                    <span className="text-gray-700 text-sm font-medium">Silver</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Purity</label>
                {form.metalType === 'silver' ? (
                  <input type="text" value="Silver" readOnly className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed" />
                ) : (
                  <select value={form.purity} onChange={e => setForm(p => ({ ...p, purity: e.target.value }))}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                    {['24K', '22K', '18K', '14K', 'Platinum'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">
                  {form.metalType === 'silver' ? 'Silver Rate' : 'Gold Rate'} (from Settings)
                </label>
                <input type="text" value={`₹${Number(form.goldRate).toLocaleString('en-IN')} per gram`} readOnly
                  className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed" />
              </div>

              {[
                { key: 'weight',       label: 'Weight (grams) *', placeholder: '5.5' },
                { key: 'stock',        label: 'Stock Quantity *',  placeholder: '10' },
                { key: 'makingCharge', label: 'Making Charge (₹)', placeholder: '2500' },
                { key: 'stoneCharge',  label: 'Stone Charge (₹)',  placeholder: '0' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">{field.label}</label>
                  <input
                    type="number"
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    min={0}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
              ))}

              {/* GST Rate (%) */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">GST Rate (%)</label>
                <select
                  value={form.gstPercent ?? 3}
                  onChange={e => setForm(p => ({ ...p, gstPercent: Number(e.target.value) }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-medium"
                >
                  <option value={3}>3% (Standard Jewellery GST)</option>
                  <option value={0}>0% (Exempt / No GST)</option>
                  <option value={5}>5% (Stones / Other)</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Making / Artificial)</option>
                </select>
              </div>

              {isAdminOrManager && (
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Store Assignment</label>
                  <select value={form.storeId || currentStore} onChange={e => setForm(p => ({ ...p, storeId: e.target.value }))}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                    {STORES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                  </select>
                </div>
              )}
            </div>
            </div>

            <div className="shrink-0 p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={() => { setShowForm(false); setImagePreview(null); }} disabled={saveLoading} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saveLoading} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60" title="Save Product (Ctrl+Enter)">
                {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saveLoading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}</span>
                <kbd className="px-1.5 py-0.5 bg-black/20 text-white rounded text-[10px] font-mono font-bold ml-1">Ctrl+Enter</kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(InventoryPage);

