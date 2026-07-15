const express = require('express');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();

// GET /api/loans?storeId=store-1
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    const loans = await Loan.find(filter).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch loans.' });
  }
});

// GET /api/loans/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch loan.' });
  }
});

// POST /api/loans
router.post('/', auth, async (req, res) => {
  try {
    const loan = new Loan({
      ...req.body,
      // Fall back to JWT user if frontend didn't send staff info
      staffId:   req.body.staffId   || req.user.id,
      staffName: req.body.staffName || req.user.name,
    });
    await loan.save();

    // Log Activity
    await logActivity(req, 'Issue Loan', `Issued Gold Loan ${loan.loanNumber} to ${loan.customerName} (Amount: ₹${loan.loanAmount.toLocaleString('en-IN')})`);

    res.status(201).json(loan);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Loan number already exists.' });
    }
    res.status(500).json({ message: 'Failed to create loan.', error: err.message });
  }
});

// PUT /api/loans/:id — update loan (status change, repayment, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const oldLoan = await Loan.findById(req.params.id);
    if (!oldLoan) return res.status(404).json({ message: 'Loan not found.' });

    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    // Log status transitions
    if (oldLoan.status !== loan.status) {
      if (loan.status === 'SettlePending') {
        await logActivity(req, 'Request Loan Settlement', `Requested settlement for Loan ${loan.loanNumber} (Customer: ${loan.customerName})`);
      } else if (loan.status === 'Closed') {
        await logActivity(req, 'Approve Loan Settlement', `Approved settlement & closed Loan ${loan.loanNumber} (Customer: ${loan.customerName}, Repaid: ₹${(loan.totalRepaid || 0).toLocaleString('en-IN')})`);
      } else if (oldLoan.status === 'SettlePending' && loan.status === 'Active') {
        await logActivity(req, 'Reject Loan Settlement', `Rejected settlement request for Loan ${loan.loanNumber} (Customer: ${loan.customerName})`);
      }
    } else {
      // General updates
      await logActivity(req, 'Update Loan', `Updated details of Loan ${loan.loanNumber}`);
    }

    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update loan.', error: err.message });
  }
});

// DELETE /api/loans/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can delete loans.' });
    }
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });

    // Log Activity
    await logActivity(req, 'Delete Loan', `Deleted Gold Loan ${loan.loanNumber}`);

    res.json({ message: 'Loan deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete loan.' });
  }
});

module.exports = router;
