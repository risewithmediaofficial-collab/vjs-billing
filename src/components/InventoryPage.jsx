import React, { useState } from 'react';
import {
  Package, Plus, Edit3, Trash2, Search, X, Save,
  AlertTriangle, CheckCircle2, Barcode, Lock, Image as ImageIcon,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { formatCurrency, calculateBillAmounts, STORES } from '../data.js';

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];
const PURITIES = ['24K', '22K', '18K', '14K', 'Platinum', 'Silver'];

const emptyProduct = {
  id: '', barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null
};

export default function InventoryPage({ products, onUpdateProducts, currentStore, currentStaff }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [expandedProductId, setExpandedProductId] = useState(null);

  const isAdminOrManager = currentStaff?.role === 'Admin' || currentStaff?.role === 'Manager';

  const toggleExpand = (productId) => {
    setExpandedProductId(prev => prev === productId ? null : productId);
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.barcode.includes(q) || p.category.toLowerCase().includes(q);
  });

  const openAdd = () => {
    const nextNum = String(products.length + 1).padStart(3, '0');
    setForm({ ...emptyProduct, id: `PRD-${nextNum}`, barcode: `89012345${nextNum}`, storeId: currentStore });
    setImagePreview(null);
    setEditProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({ ...product });
    setImagePreview(product.image || null);
    setEditProduct(product.id);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm(p => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.id.trim() || !form.weight || !form.stock) {
      alert('Please fill all required fields');
      return;
    }
    const updated = {
      ...form,
      weight: parseFloat(form.weight),
      makingCharge: parseFloat(form.makingCharge) || 0,
      stoneCharge: parseFloat(form.stoneCharge) || 0,
      goldRate: parseFloat(form.goldRate) || 7500,
      stock: parseInt(form.stock),
      storeId: form.storeId || currentStore
    };
    if (editProduct) {
      onUpdateProducts(products.map(p => p.id === editProduct ? updated : p));
      setSuccess('Product updated successfully!');
    } else {
      if (products.find(p => p.id === form.id)) { alert('Product ID already exists'); return; }
      onUpdateProducts([...products, updated]);
      setSuccess('Product added successfully!');
    }
    setShowForm(false);
    setImagePreview(null);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
      setSuccess('Product deleted');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} products in stock</p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdminOrManager && (
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5">
              <Lock size={13} className="text-gray-400" />
              <span className="text-gray-500 text-xs">View & Add only</span>
            </div>
          )}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, barcode or category..."
          className="w-full border border-gray-200 bg-white rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm
            placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(product => {
          const price = calculateBillAmounts(product).totalAmount;
          const isLowStock = product.stock <= 2;
          const isExpanded = product.id && expandedProductId === product.id;
          return (
            <div 
              key={product.id} 
              onClick={() => toggleExpand(product.id)}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all group shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Product thumbnail or icon */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-gray-850 font-bold text-sm truncate">{product.name}</h3>
                    <p className="text-gray-450 text-xs truncate">{product.id} • {product.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Action buttons — admin/manager only & visible when expanded */}
                  {isAdminOrManager && isExpanded && (
                    <div className="flex gap-1.5 animate-fade-in" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(product)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all border border-gray-200">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all border border-red-200">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Elaborated Specs */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <p className="text-gray-400 mb-0.5 font-medium">Purity</p>
                      <p className="text-gray-700 font-bold">{product.purity}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <p className="text-gray-400 mb-0.5 font-medium">Weight</p>
                      <p className="text-gray-700 font-bold">{product.weight}g</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <p className="text-gray-400 mb-0.5 font-medium">Gold Rate</p>
                      <p className="text-gray-700 font-bold">₹{product.goldRate}/g</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <p className="text-gray-400 mb-0.5 font-medium">Making</p>
                      <p className="text-gray-700 font-bold">₹{product.makingCharge}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isLowStock && <AlertTriangle size={14} className="text-amber-500" />}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        product.stock === 0 ? 'bg-red-50 text-red-600 border border-red-200' :
                        isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                      </span>
                    </div>
                    <p className="text-amber-600 font-bold">{formatCurrency(price)}</p>
                  </div>

                  {/* Barcode */}
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Barcode size={12} />
                    <span className="font-mono">{product.barcode}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No products found</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in text-gray-800">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-gray-800 font-bold text-xl">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => { setShowForm(false); setImagePreview(null); }} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Product Image Upload */}
            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">Product Image (optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all text-sm w-fit font-medium shadow-sm">
                    <ImageIcon size={14} />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <button
                      onClick={() => { setImagePreview(null); setForm(p => ({ ...p, image: null })); }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors font-medium block"
                    >
                      Remove image
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP. Displayed in inventory.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'id', label: 'Product ID *', type: 'text', placeholder: 'PRD-001', full: false, disabled: !!editProduct },
                { key: 'barcode', label: 'Barcode', type: 'text', placeholder: '8901234567890', full: false },
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
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all disabled:opacity-50"
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
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Purity</label>
                <select value={form.purity} onChange={e => setForm(p => ({ ...p, purity: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                  {PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {[
                { key: 'weight', label: 'Weight (grams) *', placeholder: '5.5' },
                { key: 'goldRate', label: 'Gold Rate (₹/g)', placeholder: '7500' },
                { key: 'makingCharge', label: 'Making Charge (₹)', placeholder: '2500' },
                { key: 'stoneCharge', label: 'Stone Charge (₹)', placeholder: '0' },
                { key: 'stock', label: 'Stock Quantity *', placeholder: '10' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">{field.label}</label>
                  <input
                    type="number"
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    min={0}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
              ))}

              {/* Store assignment — admin/manager only */}
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

            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button onClick={() => { setShowForm(false); setImagePreview(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Save size={16} />
                {editProduct ? 'Update' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
