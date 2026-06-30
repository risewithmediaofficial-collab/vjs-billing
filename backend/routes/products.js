const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/products?storeId=store-1
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
});

// POST /api/products  (Admin / Manager only)
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Barcode already exists.' });
    res.status(500).json({ message: 'Failed to create product.', error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product.', error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
});

// PATCH /api/products/deduct-stock — deduct multiple products stock on bill generation
router.patch('/deduct-stock', auth, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, quantity }]
    const ops = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(ops);
    res.json({ message: 'Stock updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update stock.' });
  }
});

module.exports = router;
