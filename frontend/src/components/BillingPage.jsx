import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Barcode, Plus, Minus, Trash2,
  User, Phone, Tag, CreditCard, Printer,
  CheckCircle2, ScanLine, ShoppingCart,
  IndianRupee, Package, X, Save, Image as ImageIcon, ChevronDown, Loader2
} from 'lucide-react';
import { calculateBillAmounts, generateInvoiceNumber, formatCurrency, GST_RATE } from '../data.js';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer'];
const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];
const PURITIES = ['24K', '22K', '18K', '14K', 'Platinum', 'Silver'];

const emptyNewProduct = {
  barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null,
  metalType: 'gold',
};

export default function BillingPage({ products, bills, currentStaff, onGenerateBill, onAddProduct, currentStore, goldRate, silverRate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [discountPercent, setDiscountPercent] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');        // API / server errors
  const [formError, setFormError] = useState(''); // validation errors
  const [modalError, setModalError] = useState('');   // errors inside modal
  const [modalSuccess, setModalSuccess] = useState(''); // save-only success inside modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addForm, setAddForm] = useState(emptyNewProduct);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const searchRef = useRef(null);
  const searchWrapRef = useRef(null);
  const barcodeTimer = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowProductList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAddProduct = () => {
    setAddForm({ ...emptyNewProduct, goldRate: goldRate, metalType: 'gold' });
    setAddImagePreview(null);
    setShowAddProduct(true);
  };

  // When metal type changes: reset purity and auto-fill rate
  const handleMetalTypeChange = (metal) => {
    if (metal === 'silver') {
      setAddForm(p => ({ ...p, metalType: 'silver', purity: 'Silver', goldRate: silverRate }));
    } else {
      setAddForm(p => ({ ...p, metalType: 'gold', purity: '22K', goldRate: goldRate }));
    }
  };

  // Auto-fill rate when purity changes (only relevant for gold sub-types)
  const handlePurityChange = (purity) => {
    setAddForm(p => ({ ...p, purity }));
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAddImagePreview(reader.result);
      setAddForm(p => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewProduct = async () => {
    if (!addForm.name.trim() || !addForm.weight || !addForm.stock) {
      setModalError('Please fill in: Product Name, Weight, and Stock Quantity');
      return;
    }
    setModalError('');
    setAddLoading(true);
    try {
      const productData = {
        ...addForm,
        weight: parseFloat(addForm.weight),
        makingCharge: parseFloat(addForm.makingCharge) || 0,
        stoneCharge: parseFloat(addForm.stoneCharge) || 0,
        goldRate: parseFloat(addForm.goldRate) || 7500,
        stock: parseInt(addForm.stock),
        storeId: currentStore,
      };
      const saved = await onAddProduct(productData);
      setShowAddProduct(false);
      setAddImagePreview(null);
      // Auto-add the new product to cart
      if (saved) addToCart({ ...saved, stock: saved.stock || parseInt(addForm.stock) });
    } catch (err) {
      setModalError('Failed to add product: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Save Only — saves to inventory, does NOT add to cart
  const handleSaveOnly = async () => {
    if (!addForm.name.trim() || !addForm.weight || !addForm.stock) {
      setModalError('Please fill in: Product Name, Weight, and Stock Quantity');
      return;
    }
    setModalError('');
    setAddLoading(true);
    try {
      const productData = {
        ...addForm,
        weight: parseFloat(addForm.weight),
        makingCharge: parseFloat(addForm.makingCharge) || 0,
        stoneCharge: parseFloat(addForm.stoneCharge) || 0,
        goldRate: parseFloat(addForm.goldRate) || 7500,
        stock: parseInt(addForm.stock),
        storeId: currentStore,
      };
      await onAddProduct(productData);
      // Reset form but keep modal open so user can add another
      setAddForm({ ...emptyNewProduct, goldRate: goldRate, metalType: 'gold' });
      setAddImagePreview(null);
      setModalError('');
      setModalSuccess('Product saved successfully.');
      setTimeout(() => setModalSuccess(''), 3000);
    } catch (err) {
      setModalError('Failed to save product: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter' && barcodeBuffer.length > 3) {
        const found = products.find(p => p.barcode === barcodeBuffer || p.id === barcodeBuffer);
        if (found) addToCart(found);
        setBarcodeBuffer('');
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
        clearTimeout(barcodeTimer.current);
        setBarcodeBuffer(prev => prev + e.key);
        barcodeTimer.current = setTimeout(() => setBarcodeBuffer(''), 300);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [barcodeBuffer, products]);

  useEffect(() => {
    // When no search query, show all products (both in-stock and out-of-stock)
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = products.filter(p => {
      const pid = (p._id || p.id || '').toString().toLowerCase();
      const barcode = (p.barcode || '').toLowerCase();
      if (searchType === 'name')    return p.name.toLowerCase().includes(q);
      if (searchType === 'id')      return pid.includes(q);
      if (searchType === 'barcode') return barcode.includes(q);
      return false;
    });
    setFilteredProducts(results);
  }, [searchQuery, searchType, products]);

  const addToCart = (product) => {
    if (product.stock <= 0) return; // don't add out-of-stock
    setCartItems(prev => {
      const pid = product._id || product.id;
      const existing = prev.find(i => (i._id || i.id) === pid);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => (i._id || i.id) === pid ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Don't clear search — keep list visible
  };

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => {
      const iid = i._id || i.id;
      if (iid !== id) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.stock) return i;
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(i => (i._id || i.id) !== id));

  // Resolve the correct live rate for a product based on its purity
  const getLiveRate = (product) => {
    const purity = (product.purity || '').toLowerCase();
    if (purity === 'silver') return silverRate;
    if (purity === 'platinum') return product.goldRate; // platinum uses its own stored rate
    return goldRate; // all gold purities (22K, 18K, 24K, 14K, etc.)
  };

  const subtotals = cartItems.map(item => {
    const calc = calculateBillAmounts(item, item.quantity, getLiveRate(item));
    return { ...calc, itemId: item.id };
  });

  const totalGoldValue = subtotals.reduce((s, c) => s + c.goldValue, 0);
  const totalMaking = subtotals.reduce((s, c) => s + c.makingCharge, 0);
  const totalStone = subtotals.reduce((s, c) => s + c.stoneCharge, 0);
  const totalGST = subtotals.reduce((s, c) => s + c.gstAmount, 0);
  const grossTotal = subtotals.reduce((s, c) => s + c.totalAmount, 0);
  const discountAmount = discountPercent
    ? Math.min((parseFloat(discountPercent) || 0) / 100 * grossTotal, grossTotal)
    : 0;
  const finalTotal = grossTotal - discountAmount;

  const handleGenerate = async () => {
    setFormError('');
    setError('');

    // Inline validation — no alerts
    if (!customer.name.trim()) {
      setFormError('Please enter customer name.');
      return;
    }
    if (!customer.mobile.trim() || customer.mobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cartItems.length === 0) {
      setFormError('Please add at least one product to the cart.');
      return;
    }

    const invoiceNumber = generateInvoiceNumber(bills);
    const bill = {
      invoiceNumber,
      customer: {
        name: customer.name,
        phone: customer.mobile,
        address: customer.address,
      },
      // Keep flat fields for BillPreview (which may still use them)
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      items: cartItems.map((item, idx) => ({
        productId: item._id || item.id,
        name: item.name,
        category: item.category,
        weight: item.weight,
        purity: item.purity,
        goldRate: item.goldRate,
        makingCharge: item.makingCharge,
        stoneCharge: item.stoneCharge,
        quantity: item.quantity,
        goldValue: subtotals[idx].goldValue,
        subtotal: subtotals[idx].totalAmount,
      })),
      goldValue: totalGoldValue,
      makingTotal: totalMaking,
      stoneTotal: totalStone,
      gstAmount: totalGST,
      gstRate: GST_RATE,
      subtotal: grossTotal,
      totalAmount: finalTotal,
      finalTotal,
      discount: discountAmount,
      discountPercent: parseFloat(discountPercent) || 0,
      paymentMethod,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      createdAt: new Date().toISOString(),
    };

    try {
      setGenerateLoading(true);
      await onGenerateBill(bill);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setCartItems([]);
      setCustomer({ name: '', mobile: '', address: '' });
      setDiscountPercent('');
      setPaymentMethod('Cash');
    } catch (err) {
      setError(err.message || 'Failed to generate bill. Please try again.');
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">New Bill</h1>
        <p className="text-gray-400 text-sm mt-0.5">Create a new jewellery invoice</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="text-emerald-700 font-medium">Bill generated successfully! Check the Invoices tab.</p>
        </div>
      )}

      {/* API / server error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <svg className="shrink-0 mt-0.5 text-red-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">Error generating bill</p>
            <p className="text-red-600 text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Validation warning */}
      {formError && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-fade-in">
          <svg className="shrink-0 mt-0.5 text-amber-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p className="text-amber-700 text-sm font-medium flex-1">{formError}</p>
          <button onClick={() => setFormError('')} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Product Search + Cart */}
        <div className="xl:col-span-2 space-y-5">
          {/* Live Rates Info Panel */}
          <div className="flex gap-3">
            {/* Gold Rate */}
            <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">Au</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-600/70 text-xs font-semibold uppercase tracking-wider">Gold Rate</p>
                <p className="text-amber-700 font-bold text-base">₹{goldRate.toLocaleString('en-IN')}<span className="text-xs font-normal">/g</span></p>
              </div>
              <div className="flex items-center gap-1 text-amber-400" title="Update in Settings">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </div>
            {/* Silver Rate */}
            <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">Ag</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">Silver Rate</p>
                <p className="text-blue-700 font-bold text-base">₹{silverRate.toLocaleString('en-IN')}<span className="text-xs font-normal">/g</span></p>
              </div>
              <div className="flex items-center gap-1 text-blue-400" title="Update in Settings">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </div>
          </div>

          {/* Barcode hint */}
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <ScanLine size={14} className="text-amber-500" />
            <span>USB Barcode scanner ready — scan to add products instantly</span>
          </div>

          {/* Product Browser — Dropdown search */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-visible" ref={searchWrapRef}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="text-gray-700 font-bold flex items-center gap-2">
                <Package size={16} className="text-amber-500" />
                Products
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                  {filteredProducts.length}
                </span>
              </p>
              <button
                onClick={openAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500
                  text-white text-xs font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-sm"
              >
                <Plus size={13} />
                Add New Product
              </button>
            </div>

            {/* Search bar + filter buttons */}
            <div className="px-5 pb-4 space-y-2 relative">
              <div className="flex gap-1.5">
                {[
                  { key: 'name',    label: 'Name',    icon: Search },
                  { key: 'id',      label: 'ID',      icon: Tag },
                  { key: 'barcode', label: 'Barcode', icon: Barcode },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSearchType(key)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                      ${searchType === key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                      }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Search input with dropdown toggle */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setShowProductList(true)}
                  placeholder={`Search by ${searchType}...`}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-16 py-2 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowProductList(v => !v)}
                    className={`p-1 rounded-lg transition-all ${
                      showProductList ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title="Toggle product list"
                  >
                    <ChevronDown size={15} className={`transition-transform duration-200 ${showProductList ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Dropdown Product List */}
              {showProductList && (
                <div className="absolute left-0 right-0 z-30 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto max-h-72 mt-1">
                  {filteredProducts.length === 0 ? (
                    <div className="py-10 text-center">
                      <Package size={32} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        {products.length === 0 ? 'No products in inventory' : 'No products found'}
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map(product => {
                      const price = calculateBillAmounts(product, 1, getLiveRate(product)).totalAmount;
                      const outOfStock = product.stock <= 0;
                      const pid = product._id || product.id;
                      const inCart = cartItems.find(i => (i._id || i.id) === pid);
                      return (
                        <div
                          key={pid}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors
                            ${outOfStock ? 'opacity-50' : 'hover:bg-amber-50 cursor-pointer'}`}
                          onMouseDown={e => {
                            e.preventDefault(); // prevent blur before click
                            if (!outOfStock) {
                              addToCart(product);
                              setShowProductList(false);
                            }
                          }}
                        >
                          {/* Thumbnail */}
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <Package size={15} className="text-amber-400" />}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 font-semibold text-sm truncate">{product.name}</p>
                            <p className="text-gray-400 text-xs">
                              {product.category} • {product.purity} • {product.weight}g
                              {outOfStock
                                ? <span className="ml-1 text-red-400 font-medium"> • Out of Stock</span>
                                : <span className="ml-1 text-emerald-500"> • {product.stock} left</span>}
                            </p>
                          </div>
                          {/* Price + Add */}
                          <div className="text-right shrink-0">
                            <p className="text-amber-600 font-bold text-sm">{formatCurrency(price)}</p>
                            {!outOfStock && (
                              <span className={`text-xs font-semibold ${
                                inCart ? 'text-emerald-600' : 'text-amber-500'
                              }`}>
                                {inCart ? `✓ In cart (${inCart.quantity})` : '+ Add'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 font-bold mb-4 flex items-center gap-2">
              <ShoppingCart size={16} className="text-amber-500" />
              Cart
              {cartItems.length > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartItems.length}</span>
              )}
            </p>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Cart is empty</p>
                <p className="text-gray-300 text-sm mt-1">Search and add products above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, idx) => {
                  const calc = subtotals[idx];
                  return (
                    <div key={item._id || item.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 animate-slide-in">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={18} className="text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-semibold text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs">{item.category} • {item.purity} • {item.weight}g</p>
                          <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-400">
                            <span>Gold: {formatCurrency(calc.goldValue / item.quantity)}</span>
                            {item.makingCharge > 0 && <span>• Making: {formatCurrency(item.makingCharge)}</span>}
                            {item.stoneCharge > 0 && <span>• Stone: {formatCurrency(item.stoneCharge)}</span>}
                            <span>• GST(3%): {formatCurrency(calc.gstAmount / item.quantity)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateQty(item._id || item.id, -1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="text-gray-800 font-bold w-6 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQty(item._id || item.id, 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors">
                            <Plus size={14} />
                          </button>
                          <button onClick={() => removeItem(item._id || item.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors ml-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <span className="text-amber-600 font-bold">{formatCurrency(calc.totalAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Customer + Summary */}
        <div className="space-y-4">
          {/* Customer Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 font-bold mb-4 flex items-center gap-2">
              <User size={16} className="text-amber-500" />
              Customer Details
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Customer Name *</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter customer name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Mobile Number *</label>
                <input
                  type="tel"
                  value={customer.mobile}
                  onChange={e => setCustomer(p => ({ ...p, mobile: e.target.value }))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Address (Optional)</label>
                <textarea
                  value={customer.address}
                  onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                  placeholder="Customer address"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 font-bold mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-amber-500" />
              Payment
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all
                        ${paymentMethod === method
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-700'
                        }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    placeholder="0"
                    min={0}
                    max={100}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-gray-800 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">%</span>
                </div>
                {discountPercent > 0 && grossTotal > 0 && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    = {formatCurrency(discountAmount)} off
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          {cartItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 animate-fade-in">
              <p className="text-gray-700 font-bold mb-4 flex items-center gap-2">
                <IndianRupee size={16} className="text-amber-600" />
                Bill Summary
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Gold Value</span><span>{formatCurrency(totalGoldValue)}</span></div>
                {totalMaking > 0 && <div className="flex justify-between text-gray-500"><span>Making Charge</span><span>{formatCurrency(totalMaking)}</span></div>}
                {totalStone > 0 && <div className="flex justify-between text-gray-500"><span>Stone Charge</span><span>{formatCurrency(totalStone)}</span></div>}
                <div className="flex justify-between text-gray-500"><span>GST (3%)</span><span>{formatCurrency(totalGST)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({parseFloat(discountPercent).toFixed(1)}%)</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between text-gray-800 font-bold text-base">
                  <span>Final Total</span>
                  <span className="text-amber-600 text-lg">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Generate Bill Button */}
          <button
            onClick={handleGenerate}
            disabled={cartItems.length === 0 || generateLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg
              hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-200
              active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {generateLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Printer size={20} />
            )}
            {generateLoading ? 'Generating Bill...' : 'Generate Bill'}
          </button>
        </div>
      </div>

      {/* ── Add New Product Modal ───────────────────────────────────────────── */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in text-gray-800">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-gray-800 font-bold text-lg">Add New Product</h2>
                <p className="text-gray-400 text-xs mt-0.5">Product will be saved to inventory</p>
              </div>
              <button
                onClick={() => { setShowAddProduct(false); setAddImagePreview(null); setModalError(''); }}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal inline error */}
            {modalError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 animate-fade-in">
                <svg className="shrink-0 mt-0.5 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-red-600 text-sm flex-1">{modalError}</p>
                <button onClick={() => setModalError('')} className="text-red-400 hover:text-red-600">
                  <X size={14} />
                </button>
              </div>
            )}
            {/* Modal inline success — shown after Save Only */}
            {modalSuccess && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <p className="text-emerald-700 text-sm font-semibold flex-1">{modalSuccess}</p>
              </div>
            )}
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">Product Image (optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  {addImagePreview
                    ? <img src={addImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    : <ImageIcon size={22} className="text-gray-400" />}
                </div>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-medium shadow-sm">
                  <ImageIcon size={13} />
                  {addImagePreview ? 'Change' : 'Upload'}
                  <input type="file" accept="image/*" onChange={handleAddImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Name */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Product Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Gold Ring 22K"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
              </div>

              {/* Barcode */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Barcode (optional)</label>
                <input
                  type="text"
                  value={addForm.barcode}
                  onChange={e => setAddForm(p => ({ ...p, barcode: e.target.value }))}
                  placeholder="8901234567890"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
              </div>

              {/* Step 1: Metal type — simple question */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-2 block">Is this product Gold or Silver? *</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="metalType"
                      value="gold"
                      checked={addForm.metalType === 'gold'}
                      onChange={() => handleMetalTypeChange('gold')}
                      className="accent-amber-500"
                    />
                    <span className="text-gray-700 text-sm font-medium">Gold</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="metalType"
                      value="silver"
                      checked={addForm.metalType === 'silver'}
                      onChange={() => handleMetalTypeChange('silver')}
                      className="accent-blue-500"
                    />
                    <span className="text-gray-700 text-sm font-medium">Silver</span>
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Category</label>
                <select value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Purity — filtered by metal type */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Purity</label>
                {addForm.metalType === 'silver' ? (
                  <input
                    type="text"
                    value="Silver"
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={addForm.purity}
                    onChange={e => handlePurityChange(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  >
                    {['24K', '22K', '18K', '14K', 'Platinum'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>

              {/* Rate — read-only, auto from Settings */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">
                  {addForm.metalType === 'silver' ? 'Silver Rate' : 'Gold Rate'} (from Settings, not editable here)
                </label>
                <input
                  type="text"
                  value={`₹${Number(addForm.goldRate).toLocaleString('en-IN')} per gram`}
                  readOnly
                  className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Weight (grams) *</label>
                <input type="number" value={addForm.weight}
                  onChange={e => setAddForm(p => ({ ...p, weight: e.target.value }))}
                  placeholder="5.5" min={0}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>

              {/* Stock */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Stock Quantity *</label>
                <input type="number" value={addForm.stock}
                  onChange={e => setAddForm(p => ({ ...p, stock: e.target.value }))}
                  placeholder="10" min={0}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>

              {/* Making Charge */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Making Charge (₹)</label>
                <input type="number" value={addForm.makingCharge}
                  onChange={e => setAddForm(p => ({ ...p, makingCharge: e.target.value }))}
                  placeholder="2500" min={0}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>

              {/* Stone Charge */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Stone Charge (₹)</label>
                <input type="number" value={addForm.stoneCharge}
                  onChange={e => setAddForm(p => ({ ...p, stoneCharge: e.target.value }))}
                  placeholder="0" min={0}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowAddProduct(false); setAddImagePreview(null); }}
                className="py-2.5 px-4 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              {/* Save Only — saves to inventory, does NOT add to cart */}
              <button
                onClick={handleSaveOnly}
                disabled={addLoading}
                className="flex-1 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-amber-700 font-bold text-sm
                  hover:bg-amber-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save size={14} />
                Save Only
              </button>
              {/* Save & Add to Cart */}
              <button
                onClick={handleSaveNewProduct}
                disabled={addLoading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm
                  hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {addLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : <ShoppingCart size={14} />}
                {addLoading ? 'Saving...' : 'Save & Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
