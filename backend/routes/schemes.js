const express = require('express');
const SchemeEnrollment = require('../models/SchemeEnrollment');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/schemes?storeId=store-1
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    const enrollments = await SchemeEnrollment.find(filter).sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scheme enrollments.' });
  }
});

// POST /api/schemes — enroll new customer
router.post('/', auth, async (req, res) => {
  try {
    const enrollment = new SchemeEnrollment({
      ...req.body,
      enrolledBy: req.user.name,
    });
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to enroll scheme.', error: err.message });
  }
});

// PUT /api/schemes/:id/pay — record payment
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const { amount, monthIndex } = req.body;
    const enrollment = await SchemeEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Scheme enrollment not found.' });

    // Check if month already paid
    const alreadyPaid = enrollment.payments.some(p => p.monthIndex === monthIndex);
    if (alreadyPaid) {
      return res.status(400).json({ message: `Month ${monthIndex + 1} is already marked as paid.` });
    }

    enrollment.payments.push({
      monthIndex,
      amount,
      paidDate: new Date(),
      paidBy: req.user.name,
    });

    // Check if fully paid (all installments paid)
    if (enrollment.payments.length >= enrollment.totalMonths) {
      enrollment.status = 'redeemable';
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record payment.', error: err.message });
  }
});

// PUT /api/schemes/:id/redeem — redeem scheme
router.put('/:id/redeem', auth, async (req, res) => {
  try {
    const { redemptionBillId } = req.body;
    const enrollment = await SchemeEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Scheme enrollment not found.' });

    enrollment.status = 'completed';
    enrollment.redeemedAt = new Date();
    if (redemptionBillId) enrollment.redemptionBillId = redemptionBillId;

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to redeem scheme.', error: err.message });
  }
});

// PUT /api/schemes/:id/cancel — cancel scheme
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const enrollment = await SchemeEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Scheme enrollment not found.' });

    enrollment.status = 'cancelled';
    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel scheme.', error: err.message });
  }
});

module.exports = router;
