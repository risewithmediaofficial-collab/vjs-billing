const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/staff — all staff (Admin sees all, others see their store)
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'Admin') filter.storeId = req.user.storeId;
    const staff = await User.find(filter, '-pin').sort({ createdAt: -1 }); // exclude PIN hash
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch staff.' });
  }
});

// POST /api/staff — Admin / Manager only
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
    return res.status(403).json({ message: 'Only Admin or Manager can add staff.' });
  }
  try {
    const staff = new User(req.body);
    await staff.save();
    const { pin, ...safeData } = staff.toObject();
    res.status(201).json(safeData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create staff.', error: err.message });
  }
});

// PUT /api/staff/:id — update staff info or PIN
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Unauthorized.' });
  }
  try {
    const updates = { ...req.body };
    // If PIN is being changed, hash it
    if (updates.pin) {
      updates.pin = await bcrypt.hash(updates.pin, 10);
    }
    const staff = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!staff) return res.status(404).json({ message: 'Staff not found.' });
    const { pin, ...safeData } = staff.toObject();
    res.json(safeData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update staff.', error: err.message });
  }
});

// DELETE /api/staff/:id — Admin only
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Admin can delete staff.' });
  }
  try {
    const staff = await User.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found.' });
    res.json({ message: 'Staff deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete staff.' });
  }
});

module.exports = router;
