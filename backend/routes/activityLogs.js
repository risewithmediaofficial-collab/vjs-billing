const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/activity-logs
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can access activity logs.' });
    }
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity logs.' });
  }
});

module.exports = router;
