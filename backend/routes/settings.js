const express = require('express');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/settings/:storeId
router.get('/:storeId', auth, async (req, res) => {
  try {
    let setting = await Setting.findOne({ storeId: req.params.storeId });
    if (!setting) {
      // Auto-create default settings for this store
      setting = await Setting.create({ storeId: req.params.storeId });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings/:storeId — update gold rate / shop info
router.put('/:storeId', auth, async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
    return res.status(403).json({ message: 'Only Admin or Manager can change settings.' });
  }
  try {
    const setting = await Setting.findOneAndUpdate(
      { storeId: req.params.storeId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings.', error: err.message });
  }
});

module.exports = router;
