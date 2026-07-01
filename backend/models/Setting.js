const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    storeId:    { type: String, required: true, unique: true },
    goldRate:   { type: Number, default: 7500 },
    silverRate: { type: Number, default: 85 },
    shopInfo: {
      name:      { type: String, default: 'VJS Jewellery' },
      address:   { type: String, default: '123, Gold Market Street, Hyderabad - 500001' },
      phone:     { type: String, default: '+91 98765 43210' },
      email:     { type: String, default: 'vjsjewellery@gmail.com' },
      gstNumber: { type: String, default: '36AABCV1234M1Z5' },
      logo:      { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
