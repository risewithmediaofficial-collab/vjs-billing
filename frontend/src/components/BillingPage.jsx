import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Barcode, Plus, Minus, Trash2,
  User, Phone, Tag, CreditCard, Printer,
  CheckCircle2, ShoppingCart,
  IndianRupee, Package, X, Save, Image as ImageIcon, ChevronDown, Loader2,
  AlertCircle, Split as SplitIcon, Sparkles, Check, FileText, Receipt
} from 'lucide-react';
import { calculateBillAmounts, generateInvoiceNumber, formatCurrency, GST_RATE } from '../data.js';
import BillPreview from './BillPreview.jsx';
import useScrollLock from '../useScrollLock.js';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer'];
const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];
const PURITIES = ['24K', '22K', '18K', '14K', 'Platinum', 'Silver'];

const emptyNewProduct = {
  barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null,
  metalType: 'gold', gstPercent: 3,
};

export default function BillingPage({ products, bills, currentStaff, onGenerateBill, onAddProduct, currentStore, goldRate, silverRate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const billItems = cartItems;
  const setBillItems = setCartItems;
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);
  const [discountPercent, setDiscountPercent] = useState('');
  const [chargeGst, setChargeGst] = useState(true); // Toggle to charge GST or generate without GST
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentSplits, setPaymentSplits] = useState([
    { method: 'Cash', amount: '', reference: '' },
    { method: 'UPI', amount: '', reference: '' },
  ]);
  const [splitMatchStatus, setSplitMatchStatus] = useState(null); // 'matched' | 'under' | 'over'
  const [fieldErrors, setFieldErrors] = useState({ name: false, mobile: false });
  const isCustomerDetailsExpanded = showCustomerDetails || fieldErrors.name || fieldErrors.mobile;
  const [toastMessage, setToastMessage] = useState('');
  const [localPreviewBill, setLocalPreviewBill] = useState(null);
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
  const [mobileTab, setMobileTab] = useState('products'); // 'products' | 'bill' for responsive screens < lg

  // Lock screen scroll when Add Product modal or Rough Bill preview is active
  useScrollLock(showAddProduct || !!localPreviewBill);
  const searchRef = useRef(null);
  const barcodeTimer = useRef(null);
  const toastTimer = useRef(null);
  const customerNameRef = useRef(null);
  const customerMobileRef = useRef(null);

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
    if (file.size > 1024 * 1024) {
      setModalError(`Image exceeds 1MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select an image under 1MB.`);
      e.target.value = '';
      return;
    }
    setModalError('');
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
        gstPercent: Number(addForm.gstPercent !== undefined ? addForm.gstPercent : 3),
        storeId: currentStore,
      };
      const saved = await onAddProduct(productData);
      setShowAddProduct(false);
      setAddImagePreview(null);
      // Auto-add the new product to bill
      if (saved) addToBill({ ...saved, stock: saved.stock || parseInt(addForm.stock) });
    } catch (err) {
      setModalError('Failed to add product: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Save Only — saves to inventory, does NOT add to bill
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
        gstPercent: Number(addForm.gstPercent !== undefined ? addForm.gstPercent : 3),
        storeId: currentStore,
      };
      await onAddProduct(productData);
      // Reset form but keep modal open so user can add another
      setAddForm({ ...emptyNewProduct, goldRate: goldRate, metalType: 'gold', gstPercent: 3 });
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
    let results = products;
    if (selectedCategory !== 'All') {
      results = results.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p => {
        const pid = (p._id || p.id || '').toString().toLowerCase();
        const barcode = (p.barcode || '').toLowerCase();
        if (searchType === 'name')    return p.name.toLowerCase().includes(q);
        if (searchType === 'id')      return pid.includes(q);
        if (searchType === 'barcode') return barcode.includes(q);
        return false;
      });
    }
    setFilteredProducts(results);
  }, [searchQuery, searchType, selectedCategory, products]);

  const addToBill = (product) => {
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
  };
  const addToCart = addToBill;

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
    const calc = calculateBillAmounts(item, item.quantity, getLiveRate(item), chargeGst);
    return { ...calc, itemId: item.id };
  });

  const totalGrossWeight = subtotals.reduce((s, c) => s + c.grossWeight, 0);
  const totalNetWeight = subtotals.reduce((s, c) => s + c.netWeight, 0);
  const totalGoldValue = subtotals.reduce((s, c) => s + c.goldValue, 0);
  const totalMaking = subtotals.reduce((s, c) => s + c.makingCharge, 0);
  const totalStone = subtotals.reduce((s, c) => s + c.stoneCharge, 0);
  const taxableValue = totalGoldValue + totalMaking + totalStone;
  const totalCGST = subtotals.reduce((s, c) => s + c.cgstAmount, 0);
  const totalSGST = subtotals.reduce((s, c) => s + c.sgstAmount, 0);
  const totalGST = totalCGST + totalSGST;
  const grossTotal = taxableValue + totalGST;
  const discountAmount = discountPercent
    ? Math.min((parseFloat(discountPercent) || 0) / 100 * grossTotal, grossTotal)
    : 0;
  const finalTotal = grossTotal - discountAmount;
  const netPayable = Math.round(finalTotal);
  const roundOff = Math.round((netPayable - finalTotal) * 100) / 100;

  // Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 4500);
  };

  // Split payment helpers
  const totalSplitAllocated = paymentSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const remainingToAllocate = Math.round((finalTotal - totalSplitAllocated) * 100) / 100;
  const isSplitExactMatch = Math.abs(remainingToAllocate) <= 0.05 && finalTotal > 0 && totalSplitAllocated > 0;

  const handleSplit5050 = () => {
    if (finalTotal <= 0) return;
    const half = Math.round((finalTotal / 2) * 100) / 100;
    const secondHalf = Math.round((finalTotal - half) * 100) / 100;
    setPaymentSplits(prev => {
      const updated = [...prev];
      if (updated.length >= 2) {
        updated[0] = { ...updated[0], amount: half };
        updated[1] = { ...updated[1], amount: secondHalf };
        return updated;
      }
      return [
        { method: 'Cash', amount: half, reference: '' },
        { method: 'UPI', amount: secondHalf, reference: '' },
      ];
    });
    setFormError('');
  };

  const fillRemaining = (targetIndex) => {
    const allocatedOthers = paymentSplits
      .filter((_, idx) => idx !== targetIndex)
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const rem = Math.max(0, Math.round((finalTotal - allocatedOthers) * 100) / 100);
    setPaymentSplits(prev => prev.map((s, idx) => idx === targetIndex ? { ...s, amount: rem } : s));
    setFormError('');
  };

  const addSplitRow = () => {
    const existingMethods = paymentSplits.map(s => s.method);
    const nextMethod = PAYMENT_METHODS.find(m => !existingMethods.includes(m)) || 'Card';
    setPaymentSplits(prev => [...prev, { method: nextMethod, amount: '', reference: '' }]);
  };

  const removeSplitRow = (index) => {
    if (paymentSplits.length <= 2) return;
    setPaymentSplits(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateSplit = (index, field, value) => {
    setPaymentSplits(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: value } : s));
    setFormError('');
  };

  // ── Handle Rough Bill / Quotation Generation ──────────────────
  const handleGenerateQuotation = () => {
    setFormError('');
    setError('');

    if (cartItems.length === 0) {
      const msg = 'Please add at least one product to create a quotation.';
      setFormError(msg);
      showToast(msg);
      return;
    }

    const quotation = {
      invoiceNumber: generateInvoiceNumber(bills, true),
      customer: {
        name: customer.name.trim() || 'Walk-in Customer',
        phone: customer.mobile.trim() || '',
        address: customer.address.trim() || '',
      },
      customerName: customer.name.trim() || 'Walk-in Customer',
      customerMobile: customer.mobile.trim() || '',
      customerAddress: customer.address.trim() || '',
      items: cartItems.map((item, idx) => ({
        productId: item._id || item.id,
        name: item.name,
        category: item.category,
        weight: item.weight,
        grossWeight: item.grossWeight || item.weight,
        netWeight: item.netWeight || item.weight,
        hsn: item.hsn || (item.purity === 'Silver' ? '7114' : '711319'),
        purity: item.purity,
        goldRate: getLiveRate(item),
        makingCharge: item.makingCharge || 0,
        vaPerGram: subtotals[idx].vaPerGram,
        vaPercent: subtotals[idx].vaPercent,
        stoneCharge: item.stoneCharge || 0,
        quantity: item.quantity,
        goldValue: subtotals[idx].goldValue,
        subtotal: subtotals[idx].subtotal,
      })),
      totalGrossWeight,
      totalNetWeight,
      goldValue: totalGoldValue,
      makingTotal: totalMaking,
      stoneTotal: totalStone,
      taxableValue,
      subtotal: taxableValue,
      cgstAmount: 0,
      sgstAmount: 0,
      gstAmount: 0,
      totalAmount: taxableValue - discountAmount,
      finalTotal: taxableValue - discountAmount,
      netPayable: Math.round(taxableValue - discountAmount),
      roundOff: 0,
      discount: discountAmount,
      discountPercent: parseFloat(discountPercent) || 0,
      paymentMethod: 'Quotation',
      paymentSplits: [],
      isRoughBill: true,
      billType: 'quotation',
      staffId: currentStaff?.id,
      staffName: currentStaff?.name,
      createdAt: new Date().toISOString(),
    };

    setLocalPreviewBill(quotation);
  };

  // ── Handle Main Bill (Tax Invoice) Generation ─────────────────
  const handleGenerate = async () => {
    setFormError('');
    setError('');
    setFieldErrors({ name: false, mobile: false });

    // Validation 1: Customer Name
    if (!customer.name.trim()) {
      setShowCustomerDetails(true);
      setFieldErrors(prev => ({ ...prev, name: true }));
      const msg = 'Please enter customer name.';
      setFormError(msg);
      showToast(msg);
      customerNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      customerNameRef.current?.focus();
      return;
    }

    // Validation 2: Mobile Number
    if (!customer.mobile.trim() || customer.mobile.length < 10) {
      setShowCustomerDetails(true);
      setFieldErrors(prev => ({ ...prev, mobile: true }));
      const msg = 'Please enter a valid 10-digit mobile number.';
      setFormError(msg);
      showToast(msg);
      customerMobileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      customerMobileRef.current?.focus();
      return;
    }

    // Validation 3: Bill Items
    if (cartItems.length === 0) {
      const msg = 'Please add at least one product to the bill.';
      setFormError(msg);
      showToast(msg);
      return;
    }

    // Validation 4: Split Payment validation
    if (paymentMethod === 'Split') {
      const hasInvalidAmount = paymentSplits.some(s => !s.amount || parseFloat(s.amount) <= 0);
      if (hasInvalidAmount) {
        const msg = 'Please enter a valid amount for each split payment method.';
        setFormError(msg);
        showToast(msg);
        return;
      }
      const totalSplit = paymentSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      const diff = Math.abs(totalSplit - finalTotal);
      if (diff > 1) {
        const rem = finalTotal - totalSplit;
        const msg = rem > 0
          ? `Split total (₹${totalSplit.toLocaleString('en-IN')}) is less than bill total (₹${finalTotal.toLocaleString('en-IN')}). Remaining: ₹${rem.toLocaleString('en-IN')}`
          : `Split total (₹${totalSplit.toLocaleString('en-IN')}) exceeds bill total (₹${finalTotal.toLocaleString('en-IN')}) by ₹${Math.abs(rem).toLocaleString('en-IN')}`;
        setFormError(msg);
        showToast(msg);
        return;
      }
    }

    const invoiceNumber = generateInvoiceNumber(bills);
    const validSplits = paymentMethod === 'Split'
      ? paymentSplits.map(s => ({
          method: s.method,
          amount: parseFloat(s.amount) || 0,
          reference: s.reference?.trim() || '',
        }))
      : [{ method: paymentMethod, amount: netPayable, reference: '' }];

    const bill = {
      invoiceNumber,
      customer: {
        name: customer.name,
        phone: customer.mobile,
        address: customer.address,
      },
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      items: cartItems.map((item, idx) => ({
        productId: item._id || item.id,
        name: item.name,
        category: item.category,
        weight: item.weight,
        grossWeight: item.grossWeight || item.weight,
        netWeight: item.netWeight || item.weight,
        hsn: item.hsn || (item.purity === 'Silver' ? '7114' : '711319'),
        purity: item.purity,
        goldRate: item.goldRate || getLiveRate(item),
        makingCharge: item.makingCharge || 0,
        vaPerGram: subtotals[idx].vaPerGram,
        vaPercent: subtotals[idx].vaPercent,
        stoneCharge: item.stoneCharge || 0,
        quantity: item.quantity,
        goldValue: subtotals[idx].goldValue,
        gstPercent: subtotals[idx].gstPercent,
        gstAmount: subtotals[idx].gstAmount,
        subtotal: subtotals[idx].totalAmount,
      })),
      totalGrossWeight,
      totalNetWeight,
      goldValue: totalGoldValue,
      makingTotal: totalMaking,
      stoneTotal: totalStone,
      taxableValue,
      includeGst: chargeGst,
      cgstAmount: chargeGst ? totalCGST : 0,
      sgstAmount: chargeGst ? totalSGST : 0,
      gstAmount: chargeGst ? totalGST : 0,
      gstRate: chargeGst ? GST_RATE : 0,
      subtotal: grossTotal,
      totalAmount: finalTotal,
      finalTotal,
      roundOff,
      netPayable,
      discount: discountAmount,
      discountPercent: parseFloat(discountPercent) || 0,
      paymentMethod,
      paymentSplits: validSplits,
      isRoughBill: false,
      billType: chargeGst ? 'tax_invoice' : 'bill_of_supply',
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
      setPaymentSplits([
        { method: 'Cash', amount: '', reference: '' },
        { method: 'UPI', amount: '', reference: '' },
      ]);
      setFieldErrors({ name: false, mobile: false });
    } catch (err) {
      setError(err.message || 'Failed to generate bill. Please try again.');
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 animate-fade-in relative w-full max-w-full min-w-0">
      {/* Floating Toast Notification for immediate feedback anywhere on screen */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-fade-in max-w-md border border-red-500">
          <AlertCircle size={20} className="shrink-0 text-white" />
          <p className="text-sm font-semibold flex-1">{toastMessage}</p>
          <button onClick={() => setToastMessage('')} className="text-white/80 hover:text-white p-1 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible only on screens < 1024px) */}
      <div className="lg:hidden flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
        <button
          type="button"
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'products'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package size={15} className={mobileTab === 'products' ? 'text-amber-500' : ''} />
          <span>Product Catalog</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{filteredProducts.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('bill')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'bill'
              ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Receipt size={15} className={mobileTab === 'bill' ? 'text-amber-500' : ''} />
          <span>Customer & Bill</span>
          {cartItems.length > 0 && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {cartItems.length}
            </span>
          )}
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_370px] 2xl:grid-cols-[1fr_420px] gap-4 lg:gap-4 xl:gap-5 items-start w-full min-w-0">
        {/* ═══════════════ LEFT: Product List ═══════════════ */}
        <div className={`space-y-4 min-w-0 lg:sticky lg:top-3 ${mobileTab === 'bill' ? 'hidden lg:block' : 'block'}`}>
          {/* Product Catalog */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
              <p className="text-gray-700 font-bold flex items-center gap-2 text-sm sm:text-base">
                <Package size={17} className="text-amber-500" />
                <span>Products</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">{filteredProducts.length}</span>
              </p>
              <button
                onClick={openAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500
                  text-white text-xs font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-sm active:scale-95"
              >
                <Plus size={13} />
                <span>Add New</span>
              </button>
            </div>

            {/* Search + Filters */}
            <div className="px-3 sm:px-5 py-3 space-y-2.5 border-b border-gray-100 bg-gray-50/50">
              {/* Search type tabs */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                <div className="flex gap-1.5 shrink-0">
                  {[
                    { key: 'name',    label: 'Name',    icon: Search },
                    { key: 'id',      label: 'ID',      icon: Tag },
                    { key: 'barcode', label: 'HUID No', icon: Barcode },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSearchType(key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        searchType === key
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon size={11} />
                      {label}
                    </button>
                  ))}
                </div>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 shrink-0"
                  >
                    <span>{selectedCategory}</span>
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${searchType === 'barcode' ? 'HUID / Barcode' : searchType}...`}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-9 py-2 text-gray-800 text-base sm:text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
                {['All', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Product List View ─── */}
            <div className="divide-y divide-gray-100 max-h-[calc(100vh-210px)] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="py-14 text-center">
                  <Package size={40} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">
                    {products.length === 0 ? 'No products in inventory' : 'No matching products found'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {searchQuery ? `Try clearing "${searchQuery}"` : 'Click "Add New" to create one'}
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const price = calculateBillAmounts(product, 1, getLiveRate(product)).totalAmount;
                  const outOfStock = product.stock <= 0;
                  const pid = product._id || product.id;
                  const inBill = billItems.find(i => (i._id || i.id) === pid);

                  return (
                    <div
                      key={pid}
                      className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-all ${
                        outOfStock
                          ? 'opacity-50 bg-gray-50/60'
                          : inBill
                            ? 'bg-amber-50/60 border-l-4 border-amber-400'
                            : 'hover:bg-gray-50/70 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={18} className="text-amber-400" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="text-gray-800 font-semibold text-xs sm:text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                          <span className="bg-gray-100 text-gray-700 px-1.5 py-px rounded font-medium">{product.purity}</span>
                          <span className="text-gray-300 hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{product.category}</span>
                          <span className="text-gray-300">•</span>
                          <span>{product.weight}g</span>
                          <span className="text-gray-300">•</span>
                          {outOfStock ? (
                            <span className="text-red-500 font-semibold">Out of Stock</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">{product.stock} in stock</span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-400 uppercase font-medium block leading-tight hidden sm:block">Est.</span>
                        <span className="text-amber-600 font-bold text-xs sm:text-sm font-mono whitespace-nowrap">{formatCurrency(price)}</span>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {outOfStock ? (
                          <span className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed">N/A</span>
                        ) : inBill ? (
                          <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-100 p-0.5 rounded-lg border border-amber-200">
                            <button
                              onClick={() => updateQty(pid, -1)}
                              className="w-6 h-6 rounded bg-white hover:bg-amber-200 text-amber-800 font-bold flex items-center justify-center transition-colors"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-bold text-amber-900 px-1 sm:px-1.5 min-w-[16px] sm:min-w-[18px] text-center font-mono">{inBill.quantity}</span>
                            <button
                              onClick={() => updateQty(pid, 1)}
                              disabled={inBill.quantity >= product.stock}
                              className="w-6 h-6 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToBill(product)}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95
                              text-white text-xs font-bold transition-all shadow-sm hover:shadow-amber-200 whitespace-nowrap"
                          >
                            <Plus size={12} />
                            <span className="hidden sm:inline">Add to Bill</span>
                            <span className="sm:hidden">Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════ RIGHT: Unified Bill Panel ═══════════════ */}
        <div
          id="bill-panel"
          className={`min-w-0 w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:sticky lg:top-3 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto ${
            mobileTab === 'products' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mobile Back Button (Only on < lg screens when viewing bill) */}
          <div className="lg:hidden px-4 pt-3.5 pb-2 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileTab('products')}
              className="text-xs text-amber-800 font-bold flex items-center gap-1.5 hover:underline"
            >
              <span>← Back to Products</span>
            </button>
            <span className="text-[11px] font-semibold text-gray-500">
              {billItems.length} item{billItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* ── Section 1: Customer Details ── */}
          <div className="px-4 sm:px-5 pt-4 pb-3.5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-bold flex items-center gap-2 text-sm">
                <User size={15} className="text-amber-500" />
                <span>Customer Details</span>
              </p>
              <button
                type="button"
                onClick={() => setShowCustomerDetails(p => !p)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
              >
                <span>{isCustomerDetailsExpanded ? 'Show Less' : 'Show More'}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isCustomerDetailsExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {isCustomerDetailsExpanded ? (
              <div className="space-y-3 animate-fade-in">
                {/* Name */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Customer Name *</label>
                  <input
                    ref={customerNameRef}
                    type="text"
                    value={customer.name}
                    onChange={e => {
                      setCustomer(p => ({ ...p, name: e.target.value }));
                      if (fieldErrors.name && e.target.value.trim()) {
                        setFieldErrors(p => ({ ...p, name: false }));
                        setFormError('');
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        customerMobileRef.current?.focus();
                      }
                    }}
                    placeholder="Enter customer name"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-gray-800 text-sm placeholder-gray-400 transition-all bg-gray-50/70 focus:outline-none ${
                      fieldErrors.name
                        ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium animate-fade-in">
                      <AlertCircle size={12} className="shrink-0" />
                      Customer name is required
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Mobile Number *</label>
                  <input
                    ref={customerMobileRef}
                    type="tel"
                    value={customer.mobile}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCustomer(p => ({ ...p, mobile: digits }));
                      if (fieldErrors.mobile && digits.length >= 10) {
                        setFieldErrors(p => ({ ...p, mobile: false }));
                        setFormError('');
                      }
                    }}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-gray-800 text-sm placeholder-gray-400 transition-all bg-gray-50/70 focus:outline-none ${
                      fieldErrors.mobile
                        ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                    }`}
                  />
                  {fieldErrors.mobile && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium animate-fade-in">
                      <AlertCircle size={12} className="shrink-0" />
                      Valid 10-digit number required
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    value={customer.address}
                    onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                    placeholder="Customer address"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none bg-gray-50/70"
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => setShowCustomerDetails(true)}
                className="bg-gray-50 hover:bg-amber-50/50 border border-gray-200 hover:border-amber-300 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between group animate-fade-in"
                title="Click to expand customer details"
              >
                <div className="min-w-0 flex-1">
                  {customer.name ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-800 truncate">{customer.name}</p>
                        {customer.mobile && (
                          <span className="text-[11px] text-gray-500 font-mono font-medium">({customer.mobile})</span>
                        )}
                      </div>
                      {customer.address && (
                        <p className="text-[11px] text-gray-400 truncate">{customer.address}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No customer details entered</p>
                  )}
                </div>
                <span className="text-xs font-semibold text-amber-600 group-hover:underline shrink-0 ml-2">
                  Edit
                </span>
              </div>
            )}
          </div>

          {/* ── Section 2: Bill Items ── */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-bold flex items-center gap-2">
                <Receipt size={15} className="text-amber-500" />
                Bill Items
                {billItems.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{billItems.length}</span>
                )}
              </p>
              {billItems.length > 0 && (
                <button
                  onClick={() => setBillItems([])}
                  className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  Clear All
                </button>
              )}
            </div>

            {billItems.length === 0 ? (
              <div className="text-center py-7 px-4 bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                <Receipt size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 text-sm font-semibold">Bill is empty</p>
                <p className="text-gray-400 text-xs mt-1">Click "+ Add to Bill" on products from the left</p>
              </div>
            ) : (
              <div className="space-y-2">
                {billItems.map((item, idx) => {
                  const calc = subtotals[idx];
                  const pid = item._id || item.id;
                  return (
                    <div key={pid} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100 group">
                      {/* Thumb */}
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={14} className="text-amber-400" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-semibold text-xs truncate">{item.name}</p>
                        <p className="text-gray-400 text-[11px]">{item.purity} • {item.weight}g</p>
                      </div>
                      {/* Qty */}
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQty(pid, -1)}
                          className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-gray-800 font-bold w-5 text-center text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(pid, 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors disabled:opacity-40"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      {/* Amount */}
                      <span className="text-amber-600 font-bold font-mono text-sm shrink-0">{formatCurrency(calc.totalAmount)}</span>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(pid)}
                        className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-colors shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 3: Bill Summary ── */}
          <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/40">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-bold flex items-center gap-2">
                <IndianRupee size={15} className="text-amber-600" />
                Bill Summary
              </p>
              {/* GST Toggle */}
              <button
                type="button"
                onClick={() => setChargeGst(!chargeGst)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shadow-xs select-none ${
                  chargeGst
                    ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
                title={chargeGst ? 'Click to remove GST' : 'Click to add 3% GST'}
              >
                <span className={`w-2 h-2 rounded-full ${chargeGst ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                {chargeGst ? 'GST 3%' : 'No GST'}
              </button>
            </div>

            {billItems.length === 0 ? (
              <div className="text-center py-4 px-3 bg-white/60 rounded-xl border border-dashed border-amber-200/80">
                <p className="text-xs text-amber-700/80 font-medium">Add products to bill to calculate bill total</p>
              </div>
            ) : (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600 text-xs"><span>Gold Value</span><span className="font-mono font-semibold">{formatCurrency(totalGoldValue)}</span></div>
                {totalMaking > 0 && <div className="flex justify-between text-gray-600 text-xs"><span>Making Charge</span><span className="font-mono font-semibold">{formatCurrency(totalMaking)}</span></div>}
                {totalStone > 0 && <div className="flex justify-between text-gray-600 text-xs"><span>Stone Charge</span><span className="font-mono font-semibold">{formatCurrency(totalStone)}</span></div>}
                <div className="flex justify-between text-gray-700 font-semibold text-xs pt-1 border-t border-amber-100">
                  <span>Taxable Value</span><span className="font-mono">{formatCurrency(taxableValue)}</span>
                </div>
                {chargeGst ? (
                  <>
                    <div className="flex justify-between text-gray-500 text-xs pl-2"><span>+ CGST (1.50%)</span><span className="font-mono">{formatCurrency(totalCGST)}</span></div>
                    <div className="flex justify-between text-gray-500 text-xs pl-2"><span>+ SGST (1.50%)</span><span className="font-mono">{formatCurrency(totalSGST)}</span></div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs px-2 py-1 bg-amber-100/60 rounded-lg text-amber-800 font-medium">
                    <span>GST (Exempt)</span><span className="font-mono">₹0.00</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium text-xs">
                    <span>Discount ({parseFloat(discountPercent).toFixed(1)}%)</span>
                    <span className="font-mono">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div className="flex justify-between text-gray-500 text-xs pl-2">
                    <span>Round off</span>
                    <span className="font-mono">{roundOff < 0 ? `- ₹${Math.abs(roundOff).toFixed(2)}` : `+ ₹${roundOff.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-2 mt-1 flex justify-between items-center">
                  <span className="text-gray-800 font-bold text-sm">Net Payable</span>
                  <span className="text-amber-600 text-xl font-black font-mono">{formatCurrency(netPayable)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 4: Payment ── */}
          <div className="px-5 py-4 space-y-3.5">
            <p className="text-gray-700 font-bold flex items-center gap-2">
              <CreditCard size={15} className="text-amber-500" />
              Payment
            </p>

            {/* Discount */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Discount (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(e.target.value)}
                  placeholder="0"
                  min={0}
                  max={100}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 pr-8 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">%</span>
              </div>
              {discountPercent > 0 && grossTotal > 0 && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">= {formatCurrency(discountAmount)} off</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-2 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => { setPaymentMethod(method); setFormError(''); }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      paymentMethod === method
                        ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <span>{method}</span>
                  </button>
                ))}
                {/* Split Pay */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Split');
                    setFormError('');
                    if (finalTotal > 0 && !paymentSplits[0]?.amount && !paymentSplits[1]?.amount) {
                      handleSplit5050();
                    }
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Split'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300'
                      : 'bg-amber-50/80 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <SplitIcon size={13} />
                  <span>Split Pay</span>
                </button>
              </div>
            </div>

            {/* Split Details Panel */}
            {paymentMethod === 'Split' && (
              <div className="border-t border-gray-100 pt-3 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <SplitIcon size={13} className="text-amber-500" />
                    Split Allocation
                  </span>
                  {finalTotal > 0 && (
                    <button
                      type="button"
                      onClick={handleSplit5050}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                      <Sparkles size={10} />
                      50/50 Split
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {paymentSplits.map((split, index) => (
                    <div key={index} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={split.method}
                          onChange={(e) => updateSplit(index, 'method', e.target.value)}
                          className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:border-amber-400"
                        >
                          {PAYMENT_METHODS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>

                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={split.amount}
                            onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                            placeholder="Amount"
                            min={0}
                            step="any"
                            className="w-full bg-white border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 text-xs text-gray-800 font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {remainingToAllocate !== 0 && finalTotal > 0 && (
                          <button
                            type="button"
                            onClick={() => fillRemaining(index)}
                            className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-gray-200 hover:bg-amber-100 text-gray-700 hover:text-amber-800 transition-colors shrink-0"
                            title="Fill remaining"
                          >
                            Fill
                          </button>
                        )}

                        {paymentSplits.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeSplitRow(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={split.reference || ''}
                        onChange={(e) => updateSplit(index, 'reference', e.target.value)}
                        placeholder={`Ref / Note (${split.method === 'UPI' ? 'UPI UTR' : split.method === 'Card' ? 'Last 4 digits' : 'Cheque No'}) — optional`}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] text-gray-600 focus:outline-none focus:border-amber-400 placeholder-gray-300"
                      />
                    </div>
                  ))}
                </div>

                {paymentSplits.length < PAYMENT_METHODS.length && (
                  <button
                    type="button"
                    onClick={addSplitRow}
                    className="w-full py-1.5 border border-dashed border-gray-300 hover:border-amber-400 rounded-xl text-xs font-semibold text-gray-500 hover:text-amber-600 flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus size={12} />
                    Add Payment Method
                  </button>
                )}

                {/* Split balance indicator */}
                <div className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                  isSplitExactMatch
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : remainingToAllocate > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className="font-semibold flex items-center gap-1">
                    {isSplitExactMatch ? <Check size={13} className="text-emerald-600" /> : <AlertCircle size={13} />}
                    {isSplitExactMatch
                      ? 'Matched'
                      : remainingToAllocate > 0
                        ? `Rem: ₹${remainingToAllocate.toLocaleString('en-IN')}`
                        : `Over by ₹${Math.abs(remainingToAllocate).toLocaleString('en-IN')}`
                    }
                  </span>
                  <span className="font-bold">₹{totalSplitAllocated.toLocaleString('en-IN')} / ₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Inline validation error above buttons */}
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-medium animate-shake">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span className="flex-1 font-semibold">{formError}</span>
                <button onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 shrink-0"><X size={13} /></button>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="space-y-2 pt-1">
              {/* Generate Bill */}
              <button
                onClick={handleGenerate}
                disabled={cartItems.length === 0 || generateLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base
                  hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-200
                  active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {generateLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Printer size={18} />
                )}
                {generateLoading ? 'Generating...' : 'Generate Bill (Tax Invoice)'}
              </button>

              {/* Rough Bill / Quotation */}
              <button
                type="button"
                onClick={handleGenerateQuotation}
                disabled={cartItems.length === 0}
                className="w-full py-2.5 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:bg-blue-100/80 text-blue-800 font-bold text-sm
                  transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 shadow-sm"
                title="Generate quotation estimate without deducting stock"
              >
                <FileText size={15} className="text-blue-600" />
                Rough Bill / Quotation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Floating Summary Bar (only when on products tab with items in cart) ── */}
      {cartItems.length > 0 && mobileTab === 'products' && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-gray-700 flex items-center justify-between gap-3 animate-fade-in">
          <div className="min-w-0 pl-1">
            <p className="text-[11px] text-gray-300 font-medium truncate">
              {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in bill
            </p>
            <p className="text-base font-black text-amber-400 font-mono leading-tight truncate">
              {formatCurrency(netPayable)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileTab('bill')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <span>Review & Pay</span>
            <Receipt size={14} />
          </button>
        </div>
      )}

      {/* ── Add New Product Modal ───────────────────────────────────────────── */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in text-gray-800">
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

              {/* GST Rate (%) */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">GST Rate (%)</label>
                <select
                  value={addForm.gstPercent ?? 3}
                  onChange={e => setAddForm(p => ({ ...p, gstPercent: Number(e.target.value) }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value={3}>3% (Standard Jewellery GST)</option>
                  <option value={0}>0% (Exempt / No GST)</option>
                  <option value={5}>5% (Stones / Other)</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Making / Artificial)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowAddProduct(false); setAddImagePreview(null); }}
                className="py-2.5 px-4 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all text-center"
              >
                Cancel
              </button>
              {/* Save Only — saves to inventory, does NOT add to bill */}
              <button
                onClick={handleSaveOnly}
                disabled={addLoading}
                className="flex-1 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-amber-700 font-bold text-sm
                  hover:bg-amber-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save size={14} />
                Save Only
              </button>
              {/* Save & Add to Bill */}
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
                ) : <Receipt size={14} />}
                {addLoading ? 'Saving...' : 'Save & Add to Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Preview Modal for Rough Bill / Quotation */}
      {localPreviewBill && (
        <BillPreview bill={localPreviewBill} onClose={() => setLocalPreviewBill(null)} />
      )}
    </div>
  );
}
