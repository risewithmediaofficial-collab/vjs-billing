import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Barcode, Plus, Minus, Trash2,
  User, Phone, Tag, CreditCard, Printer,
  CheckCircle2, ScanLine, ShoppingCart,
  IndianRupee, Package
} from 'lucide-react';
import { calculateBillAmounts, generateInvoiceNumber, formatCurrency, GST_RATE } from '../data.js';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Cheque', 'Bank Transfer'];

export default function BillingPage({ products, bills, currentStaff, onGenerateBill }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [success, setSuccess] = useState(false);
  const searchRef = useRef(null);
  const barcodeTimer = useRef(null);

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
    if (!searchQuery.trim()) { setFilteredProducts([]); return; }
    const q = searchQuery.toLowerCase();
    const results = products.filter(p => {
      if (searchType === 'name') return p.name.toLowerCase().includes(q);
      if (searchType === 'id') return p.id.toLowerCase().includes(q);
      if (searchType === 'barcode') return p.barcode.includes(q);
      return false;
    }).filter(p => p.stock > 0);
    setFilteredProducts(results);
  }, [searchQuery, searchType, products]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchQuery('');
    setFilteredProducts([]);
    setShowSearch(false);
  };

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.stock) return i;
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

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

          {/* Search Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 font-bold mb-4 flex items-center gap-2">
              <Search size={16} className="text-amber-500" />
              Add Products
            </p>

            <div className="flex gap-2 mb-4">
              {[
                { key: 'name', label: 'By Name', icon: Search },
                { key: 'id', label: 'By ID', icon: Tag },
                { key: 'barcode', label: 'By Barcode', icon: Barcode },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSearchType(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${searchType === key
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                    }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder={`Search by ${searchType}...`}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm
                  placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50"
              />
            </div>

            {showSearch && filteredProducts.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden animate-fade-in shadow-sm">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-amber-50 transition-all border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-gray-400 text-xs">{product.id} • {product.category} • {product.purity} • {product.weight}g</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-amber-600 font-bold text-sm">{formatCurrency(calculateBillAmounts(product).totalAmount)}</p>
                      <p className="text-gray-400 text-xs">Stock: {product.stock}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSearch && searchQuery && filteredProducts.length === 0 && (
              <div className="mt-2 p-4 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
                <Package size={24} className="mx-auto mb-2 opacity-40" />
                No products found
              </div>
            )}
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
                    <div key={item.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 animate-slide-in">
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
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="text-gray-800 font-bold w-6 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors">
                            <Plus size={14} />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors ml-1">
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
    </div>
  );
}
