import React, { useState } from 'react';
import {
  Package, Plus, Edit3, Trash2, Search, X, Save,
  AlertTriangle, CheckCircle2, Barcode
} from 'lucide-react';
import { formatCurrency, calculateBillAmounts } from '../data.js';

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];
const PURITIES = ['24K', '22K', '18K', '14K', 'Platinum', 'Silver'];

const emptyProduct = {
  id: '', barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: ''
};

export default function InventoryPage({ products, onUpdateProducts, currentStore }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [success, setSuccess] = useState('');

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.barcode.includes(q) || p.category.toLowerCase().includes(q);
  });

  const openAdd = () => {
    const nextNum = String(products.length + 1).padStart(3, '0');
    setForm({ ...emptyProduct, id: `PRD-${nextNum}`, barcode: `89012345${nextNum}`, storeId: currentStore });
    setEditProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({ ...product });
    setEditProduct(product.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.id.trim() || !form.weight || !form.stock) {
      alert('Please fill all required fields');
      return;
    }
    const updated = { ...form, weight: parseFloat(form.weight), makingCharge: parseFloat(form.makingCharge) || 0, stoneCharge: parseFloat(form.stoneCharge) || 0, goldRate: parseFloat(form.goldRate) || 7500, stock: parseInt(form.stock), storeId: form.storeId || currentStore };
    if (editProduct) {
      onUpdateProducts(products.map(p => p.id === editProduct ? updated : p));
      setSuccess('Product updated successfully!');
    } else {
      if (products.find(p => p.id === form.id)) { alert('Product ID already exists'); return; }
      onUpdateProducts([...products, updated]);
      setSuccess('Product added successfully!');
    }
    setShowForm(false);
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
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-purple-400 text-sm mt-1">{products.length} products in stock</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, barcode or category..."
          className="w-full bg-white/5 border border-purple-800/40 rounded-xl pl-11 pr-4 py-3 text-white text-sm
            placeholder-purple-500 focus:outline-none focus:border-amber-400/60 transition-all"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(product => {
          const price = calculateBillAmounts(product).totalAmount;
          const isLowStock = product.stock <= 2;
          return (
            <div key={product.id} className="bg-white/5 border border-purple-900/30 rounded-2xl p-5 hover:bg-white/8 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center">
                  <Package size={22} className="text-amber-400" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-lg bg-purple-900/50 hover:bg-purple-700 text-purple-300 hover:text-white flex items-center justify-center transition-all">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-lg bg-red-900/30 hover:bg-red-800 text-red-400 hover:text-white flex items-center justify-center transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-semibold mb-1">{product.name}</h3>
              <p className="text-purple-400 text-xs mb-3">{product.id} • {product.category}</p>

              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-purple-500 mb-0.5">Purity</p>
                  <p className="text-white font-medium">{product.purity}</p>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-purple-500 mb-0.5">Weight</p>
                  <p className="text-white font-medium">{product.weight}g</p>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-purple-500 mb-0.5">Gold Rate</p>
                  <p className="text-white font-medium">₹{product.goldRate}/g</p>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-purple-500 mb-0.5">Making</p>
                  <p className="text-white font-medium">₹{product.makingCharge}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLowStock && <AlertTriangle size={14} className="text-amber-400" />}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    product.stock === 0 ? 'bg-red-900/40 text-red-400' :
                    isLowStock ? 'bg-amber-900/40 text-amber-400' :
                    'bg-emerald-900/40 text-emerald-400'
                  }`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                  </span>
                </div>
                <p className="text-amber-400 font-bold">{formatCurrency(price)}</p>
              </div>

              {/* Barcode */}
              <div className="mt-3 flex items-center gap-1.5 text-purple-600 text-xs">
                <Barcode size={12} />
                <span className="font-mono">{product.barcode}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white/5 border border-purple-900/30 rounded-2xl">
          <Package size={48} className="text-purple-700 mx-auto mb-4" />
          <p className="text-purple-400">No products found</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#0f0c1e] border border-purple-800/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'id', label: 'Product ID *', type: 'text', placeholder: 'PRD-001', full: false },
                { key: 'barcode', label: 'Barcode', type: 'text', placeholder: '8901234567890', full: false },
                { key: 'name', label: 'Product Name *', type: 'text', placeholder: 'Gold Ring 22K', full: true },
              ].map(field => (
                <div key={field.key} className={field.full ? 'col-span-2' : ''}>
                  <label className="text-xs text-purple-400 font-medium mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm
                      placeholder-purple-500 focus:outline-none focus:border-amber-400/60 transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#0f0c1e] border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/60">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Purity</label>
                <select value={form.purity} onChange={e => setForm(p => ({ ...p, purity: e.target.value }))}
                  className="w-full bg-[#0f0c1e] border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/60">
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
                  <label className="text-xs text-purple-400 font-medium mb-1.5 block">{field.label}</label>
                  <input
                    type="number"
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    min={0}
                    className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm
                      placeholder-purple-500 focus:outline-none focus:border-amber-400/60 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-purple-800/40 text-purple-300 font-medium hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2">
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
