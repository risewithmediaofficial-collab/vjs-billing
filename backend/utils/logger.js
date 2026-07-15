const ActivityLog = require('../models/ActivityLog');

async function logActivity(req, action, details, customStoreId = null) {
  try {
    const storeId = customStoreId || req.user?.storeId || 'store-1';
    const log = new ActivityLog({
      action,
      staffId: req.user?.id || 'system',
      staffName: req.user?.name || 'System',
      details,
      storeId
    });
    await log.save();
  } catch (err) {
    console.error('Failed to save activity log:', err);
  }
}

module.exports = { logActivity };
