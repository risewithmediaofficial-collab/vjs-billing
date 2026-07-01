const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/bills?storeId=store-1
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bills.' });
  }
});

// GET /api/bills/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bill.' });
  }
});

// POST /api/bills — create new bill and deduct stock
router.post('/', auth, async (req, res) => {
  try {
    // ── Generate a guaranteed-unique invoice number server-side ──────────────
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Find the highest existing sequence number this year across ALL stores
    const lastBill = await Bill.findOne(
      { invoiceNumber: { $regex: `^INV-${year}-` } },
      { invoiceNumber: 1 },
      { sort: { invoiceNumber: -1 } }
    );

    let nextSeq = 1;
    if (lastBill) {
      const seq = parseInt(lastBill.invoiceNumber.slice(prefix.length), 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }

    const invoiceNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    // ────────────────────────────────────────────────────────────────────────

    const bill = new Bill({
      ...req.body,
      invoiceNumber,          // always use server-generated number
      staffId: req.user.id,
      staffName: req.user.name,
    });
    await bill.save();

    // Deduct stock for each item that has a productId
    const stockOps = (req.body.items || [])
      .filter(item => item.productId || item.id)
      .map(item => ({
        updateOne: {
          filter: { _id: item.productId || item.id },
          update: { $inc: { stock: -(item.quantity || 1) } },
        },
      }));

    if (stockOps.length > 0) {
      await Product.bulkWrite(stockOps);
    }

    res.status(201).json(bill);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Invoice number conflict — please try again.' });
    }
    res.status(500).json({ message: 'Failed to create bill.', error: err.message });
  }
});

// DELETE /api/bills/:id  (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can delete bills.' });
    }
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json({ message: 'Bill deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete bill.' });
  }
});

module.exports = router;
