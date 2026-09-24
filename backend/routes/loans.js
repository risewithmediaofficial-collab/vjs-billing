const express = require('express');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();

// Calculate loan due date: exactly 1 day before the tenure mark (e.g. 1 year from 28/07/2026 is 27/07/2027)
function calculateDueDate(issueDate, tenureMonths = 12) {
  if (!issueDate) return null;
  const d = new Date(issueDate);
  if (isNaN(d.getTime())) return null;

  const originalDay = d.getDate();
  const originalHours = d.getHours();
  const originalMinutes = d.getMinutes();
  const originalSeconds = d.getSeconds();

  d.setDate(1);
  d.setMonth(d.getMonth() + Number(tenureMonths));
  const lastDayOfTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  // 1 day before the full tenure/year mark
  d.setDate(d.getDate() - 1);
  d.setHours(originalHours, originalMinutes, originalSeconds);

  return d;
}

// GET /api/loans?storeId=store-1
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    const loans = await Loan.find(filter).sort({ createdAt: -1 });

    // Ensure all loans have correct dueDate (- 1 day rule) and backfill legacy loans
    const updatedLoans = await Promise.all(loans.map(async (loan) => {
      const tenure = Number(loan.tenureMonths || 12);
      let needsUpdate = false;

      if (!loan.dueDate && loan.issueDate) {
        loan.dueDate = calculateDueDate(loan.issueDate, tenure);
        needsUpdate = true;
      } else if (loan.dueDate && loan.issueDate) {
        const d = new Date(loan.dueDate);
        const issue = new Date(loan.issueDate);
        if (!isNaN(d.getTime()) && !isNaN(issue.getTime()) && d.getDate() === issue.getDate()) {
          loan.dueDate = calculateDueDate(loan.issueDate, tenure);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        try {
          await Loan.updateOne({ _id: loan._id }, { dueDate: loan.dueDate });
        } catch (e) {
          console.error('Failed to auto-update loan dueDate:', e);
        }
      }
      return loan;
    }));

    res.json(updatedLoans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch loans.' });
  }
});

// GET /api/loans/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });

    const tenure = Number(loan.tenureMonths || 12);
    let needsUpdate = false;
    if (!loan.dueDate && loan.issueDate) {
      loan.dueDate = calculateDueDate(loan.issueDate, tenure);
      needsUpdate = true;
    } else if (loan.dueDate && loan.issueDate) {
      const d = new Date(loan.dueDate);
      const issue = new Date(loan.issueDate);
      if (!isNaN(d.getTime()) && !isNaN(issue.getTime()) && d.getDate() === issue.getDate()) {
        loan.dueDate = calculateDueDate(loan.issueDate, tenure);
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      try {
        await Loan.updateOne({ _id: loan._id }, { dueDate: loan.dueDate });
      } catch (e) {
        console.error('Failed to auto-update loan dueDate:', e);
      }
    }

    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch loan.' });
  }
});

// POST /api/loans
router.post('/', auth, async (req, res) => {
  try {
    const issueDate = req.body.issueDate ? new Date(req.body.issueDate) : new Date();
    const tenureMonths = req.body.tenureMonths ? Number(req.body.tenureMonths) : 12;
    let dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (!dueDate || isNaN(dueDate.getTime()) || (dueDate.getDate() === issueDate.getDate())) {
      dueDate = calculateDueDate(issueDate, tenureMonths);
    }

    let loanNumber = req.body.loanNumber;
    if (!loanNumber) {
      const year = new Date().getFullYear();
      const prefix = `GL-${year}-`;
      const lastLoan = await Loan.findOne(
        { loanNumber: { $regex: `^${prefix}` } },
        { loanNumber: 1 },
        { sort: { loanNumber: -1 } }
      );
      let nextSeq = 1;
      if (lastLoan && lastLoan.loanNumber) {
        const seq = parseInt(lastLoan.loanNumber.slice(prefix.length), 10);
        if (!isNaN(seq)) nextSeq = seq + 1;
      }
      loanNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    }

    const loan = new Loan({
      ...req.body,
      loanNumber,
      issueDate,
      tenureMonths,
      dueDate,
      overdueInterestRate: req.body.overdueInterestRate !== undefined ? req.body.overdueInterestRate : (req.body.interestRate || 1.5),
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
        await logActivity(req, 'Settle Loan', `Settled & closed Loan ${loan.loanNumber} (Customer: ${loan.customerName}, Repaid: ₹${(loan.totalRepaid || 0).toLocaleString('en-IN')})`);
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
