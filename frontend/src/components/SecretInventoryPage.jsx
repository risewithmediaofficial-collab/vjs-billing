import React, { useState } from 'react';
import {
  Package, Plus, Edit3, Trash2, Search, X, Save,
  AlertTriangle, CheckCircle2, Barcode, Image as ImageIcon, Loader2,
  Sparkles, Database
} from 'lucide-react';
import { formatCurrency } from '../data.js';
import useScrollLock from '../useScrollLock.js';

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];

const emptyProduct = {
  id: '', barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null,
  metalType: 'gold', isSecret: true, gstPercent: 3,
};

export default function SecretInventoryPage({
  products = [],
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  currentStore,
  currentStaff,
  goldRate = 7500,
  silverRate = 85,
  onLockVault
}) {
  const [search, setSearch]           = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]               = useState(emptyProduct);
  const [success, setSuccess]         = useState('');
  const [formError, setFormError]     = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Lock screen scroll when product form modal or delete confirmation is active
  useScrollLock(showForm || !!deleteConfirm);

  // Filter secret products
  const secretProducts = products.filter(p => p.isSecret === true);

  const filtered = secretProducts.filter(p => {
    const q = search.toLowerCase();
    const pid = (p._id || p.id || '').toString().toLowerCase();
    const barcode = (p.barcode || '').toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || pid.includes(q) || barcode.includes(q) || p.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate Metrics
  const totalStockCount = secretProducts.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalStockWeight = secretProducts.reduce((acc, p) => acc + ((Number(p.weight) || 0) * (Number(p.stock) || 0)), 0);
  const totalInventoryValue = secretProducts.reduce((acc, p) => {
    const rate = (p.purity || '').toLowerCase() === 'silver' ? silverRate : goldRate;
    const baseVal = (Number(p.weight) || 0) * rate;
    const making = Number(p.makingCharge) || 0;
    const stone = Number(p.stoneCharge) || 0;
    const unitVal = baseVal + making + stone;
    return acc + (unitVal * (Number(p.stock) || 0));
  }, 0);

  const openAdd = () => {
    const nextNum = String(secretProducts.length + 1).padStart(3, '0');
    setForm({
      ...emptyProduct,
      id: `PRD-${nextNum}`,
      barcode: `HUID-${nextNum}`,
      storeId: currentStore,
      goldRate,
      metalType: 'gold',
      isSecret: true,
      gstPercent: 3,
    });
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
    setForm({ ...product, metalType: metal, isSecret: true, gstPercent: product.gstPercent !== undefined ? product.gstPercent : 3 });
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
    if (!form.name.trim() || !form.weight || form.stock === '') {
      setFormError('Please fill required fields: Product Name, Weight, and Stock.');
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
      isSecret:     true,
    };
    try {
      if (editProduct) {
        await onUpdateProduct(editProduct, productData);
        setSuccess('Product updated successfully!');
      } else {
        await onCreateProduct(productData);
        setSuccess('Product added successfully!');
      }
      setShowForm(false);
      setImagePreview(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError('Failed to save product: ' + err.message);
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
      setSuccess('Product deleted successfully.');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900">
              Inventory
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage store products, stock levels, and pricing details.
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalStockCount} <span className="text-xs font-normal text-gray-400">units</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Weight</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalStockWeight.toFixed(2)} <span className="text-xs font-normal text-gray-400">grams</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Inventory Value</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalInventoryValue)}</p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {/* Controls: Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name, HUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Category:</span>
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              categoryFilter === 'All'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({secretProducts.length})
          </button>
          {CATEGORIES.map(cat => {
            const cnt = secretProducts.filter(p => p.category === cat).length;
            if (cnt === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat} ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Item Detail</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Purity & Metal</th>
                <th className="px-6 py-4 text-right">Weight (g)</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-right">Est. Unit Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={36} className="text-gray-300 stroke-1" />
                      <p className="font-medium text-gray-600 text-base">No products found</p>
                      <p className="text-xs text-gray-400">Add a new product to update inventory list.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const rate = (product.purity || '').toLowerCase() === 'silver' ? silverRate : goldRate;
                  const baseVal = (Number(product.weight) || 0) * rate;
                  const unitPrice = baseVal + (Number(product.makingCharge) || 0) + (Number(product.stoneCharge) || 0);

                  return (
                    <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                              <Package size={18} />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900">{product.name}</span>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              {product.barcode || product._id || product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{product.purity}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-800">
                        {Number(product.weight).toFixed(2)} g
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          product.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id || product.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8 animate-scale-up">
            <div className="bg-amber-500 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-display">
                    {editProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-amber-100">Enter product specifications and inventory stock.</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  {formError}
                </div>
              )}

              {/* Metal Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Metal Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleMetalTypeChange('gold')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      form.metalType !== 'silver'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles size={16} /> Gold Item
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMetalTypeChange('silver')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      form.metalType === 'silver'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-700/20'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles size={16} /> Silver Item
                  </button>
                </div>
              </div>

              {/* Name & HUID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Gold Necklace"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">HUID / Barcode</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => setForm(f => ({ ...f, barcode: e.target.value }))}
                    placeholder="HUID-001"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category & Purity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purity</label>
                  {form.metalType === 'silver' ? (
                    <input
                      type="text"
                      disabled
                      value="Silver"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 font-semibold"
                    />
                  ) : (
                    <select
                      value={form.purity}
                      onChange={(e) => setForm(f => ({ ...f, purity: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 bg-white font-semibold"
                    >
                      <option value="24K">24K (99.9%)</option>
                      <option value="22K">22K (91.6%)</option>
                      <option value="18K">18K (75.0%)</option>
                      <option value="14K">14K (58.5%)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Weight & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weight (Grams) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="1"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Making & Stone Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Making Charge (₹)</label>
                  <input
                    type="number"
                    value={form.makingCharge}
                    onChange={(e) => setForm(f => ({ ...f, makingCharge: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stone Charge (₹)</label>
                  <input
                    type="number"
                    value={form.stoneCharge}
                    onChange={(e) => setForm(f => ({ ...f, stoneCharge: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* GST Rate (%) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">GST Rate (%)</label>
                <select
                  value={form.gstPercent ?? 3}
                  onChange={(e) => setForm(f => ({ ...f, gstPercent: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 bg-white font-medium"
                >
                  <option value={3}>3% (Standard Jewellery GST)</option>
                  <option value={0}>0% (Exempt / No GST)</option>
                  <option value={5}>5% (Stones / Other)</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Making / Artificial)</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Photo</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image: null })); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 flex flex-col items-center justify-center text-gray-400 hover:text-amber-600 cursor-pointer transition-colors">
                      <ImageIcon size={20} />
                      <span className="text-xs font-medium mt-1">Upload Product Image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-scale-up border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Remove Product?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This stock record will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md shadow-red-600/20"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
