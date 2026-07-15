const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// The protected superadmin — can never be deleted
const PROTECTED_NAME = 'System Admin';

// GET /api/staff — all staff (Admin sees all, others see their store)
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'Admin') filter.storeId = req.user.storeId;
    const staff = await User.find(filter, '-pin').sort({ createdAt: -1 });
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
    const name = (req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    // Block creating another "System Admin"
    if (name.toLowerCase() === PROTECTED_NAME.toLowerCase()) {
      return res.status(403).json({ message: '"System Admin" is a protected account and cannot be recreated.' });
    }

    // Check for duplicate name (case-insensitive)
    const existing = await User.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existing) {
      return res.status(409).json({ message: `A staff member named "${name}" already exists.` });
    }

    const staff = new User({ ...req.body, name });
    await staff.save();
    const { pin, ...safeData } = staff.toObject();
    res.status(201).json(safeData);
  } catch (err) {
    console.error('Create staff error:', err);
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
    if (updates.pin) {
      updates.rawPin = updates.pin; // Keep the plain text PIN
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

// POST /api/staff/:id/reveal-pin — reveal raw text PIN after verifying Admin PIN
router.post('/:id/reveal-pin', auth, async (req, res) => {
  try {
    const { adminPin } = req.body;
    if (!adminPin) {
      return res.status(400).json({ message: 'Admin verification PIN is required.' });
    }

    // Verify logged-in user is Admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Verify Admin's PIN
    const isMatch = await admin.comparePin(adminPin);
    if (!isMatch) {
      return res.status(400).json({ message: 'Verification failed. Incorrect Admin password.' });
    }

    // Find target staff member
    const staffMember = await User.findById(req.params.id);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found.' });
    }

    res.json({ rawPin: staffMember.rawPin || 'No plaintext password stored yet' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve staff password.', error: err.message });
  }
});

// DELETE /api/staff/:id — Admin only, System Admin is protected
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Admin can delete staff.' });
  }
  try {
    // Find first to check if it's the protected account
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'Staff not found.' });

    if (target.name.toLowerCase() === PROTECTED_NAME.toLowerCase()) {
      return res.status(403).json({ message: '"System Admin" is a protected account and cannot be deleted.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete staff.' });
  }
});

module.exports = router;
