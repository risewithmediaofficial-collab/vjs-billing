const mongoose = require('mongoose');

const bullionRateSchema = new mongoose.Schema(
  {
    rates: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    date: {
      type: String,
      default: '',
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BullionRate', bullionRateSchema);
