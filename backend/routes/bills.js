const express = require('express');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();

// Helper to safely check if an ID is a valid 24-character hex MongoDB ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  const str = String(id);
  return /^[0-9a-fA-F]{24}$/.test(str);
};

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
    // ── Generate a guaranteed-unique invoice/quotation number server-side ──
    const isQuotation = req.body.billType === 'quotation' || req.body.isRoughBill === true;
    const year = new Date().getFullYear();
    const prefix = isQuotation ? `EST-${year}-` : `INV-${year}-`;

    // Find the highest existing sequence number this year across ALL stores
    const lastBill = await Bill.findOne(
      { invoiceNumber: { $regex: `^${prefix}` } },
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
      isRoughBill: isQuotation,
      billType: isQuotation ? 'quotation' : (req.body.billType || 'tax_invoice'),
      staffId: req.user.id,
      staffName: req.user.name,
    });
    await bill.save();

    // Deduct stock for each item that has a real inventory productId (tax invoices only)
    if (!isQuotation) {
      const stockOps = (req.body.items || [])
        .map(item => ({ pid: item.productId || item.id, qty: item.quantity || 1 }))
        .filter(item => isValidObjectId(item.pid))
        .map(item => ({
          updateOne: {
            filter: { _id: item.pid },
            update: { $inc: { stock: -item.qty } },
          },
        }));

      if (stockOps.length > 0) {
        await Product.bulkWrite(stockOps);
      }
    }

    // Log Activity
    const actionName = isQuotation ? 'Generate Quotation' : 'Generate Bill';
    await logActivity(req, actionName, `Generated ${isQuotation ? 'quotation' : 'invoice'} ${bill.invoiceNumber} for ${bill.customer?.name || 'Walk-in Customer'} (Amount: ₹${(bill.totalAmount ?? bill.finalTotal ?? 0).toLocaleString('en-IN')})`);

    res.status(201).json(bill);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Invoice number conflict — please try again.' });
    }
    res.status(500).json({ message: 'Failed to create bill.', error: err.message });
  }
});

// POST /api/bills/:id/process-action — Refund or Exchange with stock restoration (no PIN required; activity logged for Admin)
router.post('/:id/process-action', auth, async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'refund' | 'exchange'
    if (!['refund', 'exchange'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "refund" or "exchange".' });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    if (bill.status === 'refunded' || bill.status === 'exchanged') {
      return res.status(400).json({ message: `This bill has already been marked as ${bill.status}.` });
    }

    // Restore stock for each item if it was a tax invoice (real inventory products only)
    if (!bill.isRoughBill && bill.billType !== 'quotation') {
      const stockOps = (bill.items || [])
        .map(item => ({ pid: item.productId || item.id, qty: item.quantity || 1 }))
        .filter(item => isValidObjectId(item.pid))
        .map(item => ({
          updateOne: {
            filter: { _id: item.pid },
            update: { $inc: { stock: +item.qty } },
          },
        }));

      if (stockOps.length > 0) {
        await Product.bulkWrite(stockOps);
      }
    }

    bill.status = action === 'refund' ? 'refunded' : 'exchanged';
    bill.statusAction = action;
    bill.actionReason = reason || '';
    bill.actionDate = new Date();
    bill.actionBy = req.user?.name || 'Staff';
    await bill.save();

    // Log Activity for Admin view
    const logTitle = action === 'refund' ? 'Refund Bill' : 'Exchange Bill';
    const amountStr = (bill.totalAmount ?? bill.finalTotal ?? 0).toLocaleString('en-IN');
    const itemCount = (bill.items || []).length;
    await logActivity(
      req,
      logTitle,
      `${action === 'refund' ? 'Refunded' : 'Exchanged'} invoice ${bill.invoiceNumber} for ${bill.customer?.name || 'Walk-in'} (₹${amountStr}, ${itemCount} items returned to stock). Reason: ${reason || 'None provided'}`
    );

    res.json({ bill, message: `Invoice ${bill.invoiceNumber} successfully ${bill.status} and inventory stock restored.` });
  } catch (err) {
    console.error('Bill action error:', err);
    res.status(500).json({ message: 'Failed to process bill action.', error: err.message });
  }
});

// PUT /api/bills/:id — Edit existing bill (updates stock difference, recalculates totals, logs activity)
router.put('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });

    if (bill.status === 'refunded' || bill.status === 'exchanged') {
      return res.status(400).json({ message: `Cannot edit a bill that is already ${bill.status}.` });
    }

    const wasTaxInvoice = !bill.isRoughBill && bill.billType !== 'quotation';
    const isTaxInvoice = req.body.billType !== 'quotation' && !req.body.isRoughBill;

    // Reconcile Inventory Stock if tax invoice
    if (wasTaxInvoice) {
      // 1. Revert previous items stock (real inventory products only)
      const revertOps = (bill.items || [])
        .map(item => ({ pid: item.productId || item.id, qty: item.quantity || 1 }))
        .filter(item => isValidObjectId(item.pid))
        .map(item => ({
          updateOne: {
            filter: { _id: item.pid },
            update: { $inc: { stock: +item.qty } },
          },
        }));
      if (revertOps.length > 0) {
        await Product.bulkWrite(revertOps);
      }
    }

    if (isTaxInvoice && req.body.items) {
      // 2. Deduct new items stock (real inventory products only)
      const deductOps = req.body.items
        .map(item => ({ pid: item.productId || item.id, qty: item.quantity || 1 }))
        .filter(item => isValidObjectId(item.pid))
        .map(item => ({
          updateOne: {
            filter: { _id: item.pid },
            update: { $inc: { stock: -item.qty } },
          },
        }));
      if (deductOps.length > 0) {
        await Product.bulkWrite(deductOps);
      }
    }

    // Update fields
    if (req.body.customer) bill.customer = req.body.customer;
    if (req.body.items) bill.items = req.body.items;
    if (req.body.goldValue !== undefined) bill.goldValue = req.body.goldValue;
    if (req.body.makingTotal !== undefined) bill.makingTotal = req.body.makingTotal;
    if (req.body.stoneTotal !== undefined) bill.stoneTotal = req.body.stoneTotal;
    if (req.body.subtotal !== undefined) bill.subtotal = req.body.subtotal;
    if (req.body.taxableValue !== undefined) bill.taxableValue = req.body.taxableValue;
    if (req.body.includeGst !== undefined) bill.includeGst = req.body.includeGst;
    if (req.body.cgstAmount !== undefined) bill.cgstAmount = req.body.cgstAmount;
    if (req.body.sgstAmount !== undefined) bill.sgstAmount = req.body.sgstAmount;
    if (req.body.gstAmount !== undefined) bill.gstAmount = req.body.gstAmount;
    if (req.body.gstRate !== undefined) bill.gstRate = req.body.gstRate;
    if (req.body.totalAmount !== undefined || req.body.finalTotal !== undefined) {
      bill.totalAmount = req.body.totalAmount ?? req.body.finalTotal;
    }
    if (req.body.roundOff !== undefined) bill.roundOff = req.body.roundOff;
    if (req.body.netPayable !== undefined) bill.netPayable = req.body.netPayable;
    if (req.body.paymentMethod) bill.paymentMethod = req.body.paymentMethod;
    if (req.body.paymentSplits) bill.paymentSplits = req.body.paymentSplits;
    if (req.body.amountPaid !== undefined) bill.amountPaid = req.body.amountPaid;
    if (req.body.change !== undefined) bill.change = req.body.change;
    if (req.body.notes !== undefined) bill.notes = req.body.notes;
    if (req.body.exchangeDetails) bill.exchangeDetails = req.body.exchangeDetails;

    // Edit tracking
    bill.isEdited = true;
    bill.lastEditedAt = new Date();
    bill.lastEditedBy = req.user?.name || 'Staff';

    await bill.save();

    // Log Activity for Admin view
    const newAmountStr = (bill.totalAmount ?? bill.finalTotal ?? 0).toLocaleString('en-IN');
    await logActivity(
      req,
      'Edit Bill',
      `Edited invoice ${bill.invoiceNumber} for ${bill.customer?.name || 'Walk-in'} by ${bill.lastEditedBy} (Updated Total: ₹${newAmountStr})`
    );

    res.json({ bill, message: `Invoice ${bill.invoiceNumber} updated successfully.` });
  } catch (err) {
    console.error('Bill edit error:', err);
    res.status(500).json({ message: 'Failed to update bill.', error: err.message });
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

    // Log Activity
    await logActivity(req, 'Delete Bill', `Deleted invoice ${bill.invoiceNumber}`);

    res.json({ message: 'Bill deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete bill.' });
  }
});

module.exports = router;
