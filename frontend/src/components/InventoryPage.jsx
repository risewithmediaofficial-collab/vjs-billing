import React, { useState } from 'react';
import {
  Package, Plus, Edit3, Trash2, Search, X, Save,
  AlertTriangle, CheckCircle2, Barcode, Lock, Image as ImageIcon,
} from 'lucide-react';
import { formatCurrency, calculateBillAmounts, STORES } from '../data.js';

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Chains', 'Pendants', 'Anklets', 'Other'];

const emptyProduct = {
  id: '', barcode: '', name: '', category: 'Rings', weight: '',
  purity: '22K', makingCharge: '', stoneCharge: '', goldRate: 7500, stock: '', image: null,
  metalType: 'gold',
};

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function InventoryPage({ products, onCreateProduct, onUpdateProduct, onDeleteProduct, currentStore, currentStaff, goldRate = 7500, silverRate = 85 }) {
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]               = useState(emptyProduct);
  const [success, setSuccess]         = useState('');
  const [formError, setFormError]     = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const isAdminOrManager = currentStaff?.role === 'Admin' || currentStaff?.role === 'Manager';

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const pid     = (p._id || p.id || '').toString().toLowerCase();
    const barcode = (p.barcode || '').toLowerCase();
    return p.name.toLowerCase().includes(q) || pid.includes(q) || barcode.includes(q) || p.category.toLowerCase().includes(q);
  });

  const openAdd = () => {
    const nextNum = String(products.length + 1).padStart(3, '0');
    setForm({ ...emptyProduct, id: `PRD-${nextNum}`, barcode: `89012345${nextNum}`, storeId: currentStore, goldRate, metalType: 'gold' });
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
    setForm({ ...product, metalType: metal });
    setImagePreview(product.image || null);
    setEditProduct(product._id || product.id);
    setFormError('');
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

  const handleSave = async () => {
    if (!form.name.trim() || !form.weight || !form.stock) {
      setFormError('Please fill all required fields: Product Name, Weight, and Stock.');
      return;
    }
    setFormError('');
    const productData = {
      ...form,
      weight:       parseFloat(form.weight),
      makingCharge: parseFloat(form.makingCharge) || 0,
      stoneCharge:  parseFloat(form.stoneCharge)  || 0,
      goldRate:     parseFloat(form.goldRate)      || goldRate,
      stock:        parseInt(form.stock),
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
      setShowForm(false);
      setImagePreview(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError('Failed to save product: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await onDeleteProduct(id);
        setSuccess('Product deleted');
        setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
        setFormError('Failed to delete: ' + err.message);
      }
    }
  };

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
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Success banner */}
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
                                <Barcode size={10} />{product.barcode}
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
                                    <Barcode size={10} />{product.barcode}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in text-gray-800">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-gray-800 font-bold text-xl">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => { setShowForm(false); setImagePreview(null); setFormError(''); }} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

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
                { key: 'barcode', label: 'Barcode',     type: 'text', placeholder: '8901234567890', full: false },
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
