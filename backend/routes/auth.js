const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // Accept either 'username' or 'name' — supports both old and new frontend builds
  const loginName = (req.body.username || req.body.name || '').trim();
  const pin = (req.body.pin || '').trim();

  if (!loginName || !pin) {
    return res.status(400).json({ message: 'Name and password are required.' });
  }

  try {
    // Find user by name (case-insensitive)
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${loginName}$`, 'i') },
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid name or password.' });
    }

    const pinMatch = await user.comparePin(pin.trim());
    if (!pinMatch) {
      return res.status(401).json({ message: 'Invalid name or password.' });
    }

    // Generate JWT token valid for 8 hours
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role, storeId: user.storeId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
