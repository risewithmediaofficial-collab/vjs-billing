const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    action:    { type: String, required: true }, // e.g. 'Add Product', 'Generate Bill', etc.
    staffId:   { type: String, required: true },
    staffName: { type: String, required: true },
    details:   { type: String, default: '' },
    storeId:   { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
