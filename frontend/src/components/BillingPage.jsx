import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Barcode, Plus, Minus, Trash2,
  User, Phone, Tag, CreditCard, Printer,
  CheckCircle2, ScanLine, ShoppingCart,
  IndianRupee, Package, X, Save, Image as ImageIcon
} from 'lucide-react';
import { calculateBillAmounts, generateInvoiceNumber, formatCurrency, GST_RATE } from '../data.js';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer'];
const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];
const PURITIES = ['24K', '22K', '18K', '14K', 'Platinum', 'Silver'];

const emptyNewProduct = {
  barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null
};

export default function BillingPage({ products, bills, currentStaff, onGenerateBill, onAddProduct, currentStore }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addForm, setAddForm] = useState(emptyNewProduct);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const searchRef = useRef(null);
  const barcodeTimer = useRef(null);

  const openAddProduct = () => {
    setAddForm({ ...emptyNewProduct, goldRate: 7500 });
    setAddImagePreview(null);
    setShowAddProduct(true);
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
      alert('Please fill: Product Name, Weight, and Stock');
      return;
    }
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
      alert('Failed to add product: ' + err.message);
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

  const subtotals = cartItems.map(item => {
    const calc = calculateBillAmounts(item, item.quantity);
    return { ...calc, itemId: item.id };
  });

  const totalGoldValue = subtotals.reduce((s, c) => s + c.goldValue, 0);
  const totalMaking = subtotals.reduce((s, c) => s + c.makingCharge, 0);
  const totalStone = subtotals.reduce((s, c) => s + c.stoneCharge, 0);
  const totalGST = subtotals.reduce((s, c) => s + c.gstAmount, 0);
  const grossTotal = subtotals.reduce((s, c) => s + c.totalAmount, 0);
  const discountAmount = discount ? Math.min(parseFloat(discount) || 0, grossTotal) : 0;
  const finalTotal = grossTotal - discountAmount;

  const handleGenerate = () => {
    if (!customer.name.trim()) { alert('Please enter customer name'); return; }
    if (!customer.mobile.trim() || customer.mobile.length < 10) { alert('Please enter valid mobile number'); return; }
    if (cartItems.length === 0) { alert('Please add at least one product'); return; }

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
        productId: item.id,
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
      totalAmount: finalTotal,   // matches DB schema field name
      finalTotal,                // kept for BillPreview compatibility
      discount: discountAmount,
      paymentMethod,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      createdAt: new Date().toISOString(),
    };
    onGenerateBill(bill);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setCartItems([]);
    setCustomer({ name: '', mobile: '', address: '' });
    setDiscount('');
    setPaymentMethod('Cash');
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Product Search + Cart */}
        <div className="xl:col-span-2 space-y-5">
          {/* Barcode hint */}
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <ScanLine size={14} className="text-amber-500" />
            <span>USB Barcode scanner ready — scan to add products instantly</span>
          </div>

          {/* Product Browser — always-visible list with search */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
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
            <div className="px-5 pb-3 space-y-2">
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
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${searchType}...`}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
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
            </div>

            {/* Scrollable Product List */}
            <div className="overflow-y-auto max-h-72 border-t border-gray-100">
              {filteredProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <Package size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    {products.length === 0 ? 'No products in inventory' : 'No products found'}
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const price = calculateBillAmounts(product).totalAmount;
                  const outOfStock = product.stock <= 0;
                  const pid = product._id || product.id;
                  const inCart = cartItems.find(i => (i._id || i.id) === pid);
                  return (
                    <div
                      key={pid}
                      className={`flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 transition-colors
                        ${outOfStock ? 'opacity-50' : 'hover:bg-amber-50 cursor-pointer'}`}
                      onClick={() => !outOfStock && addToCart(product)}
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
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Discount (₹)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="0"
                  min={0}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                    placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
                />
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
                  <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatCurrency(discountAmount)}</span></div>
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
            disabled={cartItems.length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg
              hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-200
              active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Generate Bill
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
                onClick={() => { setShowAddProduct(false); setAddImagePreview(null); }}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image Upload */}
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

              {/* Category */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Category</label>
                <select value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Purity */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Purity</label>
                <select value={addForm.purity} onChange={e => setAddForm(p => ({ ...p, purity: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400">
                  {PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Number fields */}
              {[
                { key: 'weight',      label: 'Weight (grams) *', placeholder: '5.5' },
                { key: 'goldRate',    label: 'Gold Rate (₹/g)',   placeholder: '7500' },
                { key: 'makingCharge',label: 'Making Charge (₹)', placeholder: '2500' },
                { key: 'stoneCharge', label: 'Stone Charge (₹)',  placeholder: '0' },
                { key: 'stock',       label: 'Stock Quantity *',   placeholder: '10' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">{field.label}</label>
                  <input
                    type="number"
                    value={addForm[field.key]}
                    onChange={e => setAddForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    min={0}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowAddProduct(false); setAddImagePreview(null); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
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
                ) : <Save size={14} />}
                {addLoading ? 'Saving...' : 'Save & Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
