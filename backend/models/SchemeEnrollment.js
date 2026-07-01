const mongoose = require('mongoose');

const SchemeEnrollmentSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, default: '' },
    schemeName: { type: String, required: true, default: 'VJS Gold Savings Scheme' },
    schemeType: { type: String, enum: ['classic_11_1', 'interest_plan'], default: 'classic_11_1' },
    monthlyAmount: { type: Number, required: true },
    totalMonths: { type: Number, required: true, default: 11 },
    bonusMonths: { type: Number, required: true, default: 1 },
    interestRate: { type: Number, default: 0 }, // Interest rate % (e.g. 5 for 5% interest)
    goldRateAtEnrollment: { type: Number, required: true },
    payments: [
      {
        monthIndex: { type: Number, required: true }, // 0 to totalMonths - 1
        amount: { type: Number, required: true },
        paidDate: { type: Date, required: true },
        paidBy: { type: String, required: true }, // Staff name or id
      }
    ],
    status: {
      type: String,
      enum: ['active', 'redeemable', 'completed', 'cancelled'],
      default: 'active',
    },
    storeId: { type: String, required: true },
    enrolledBy: { type: String, required: true }, // Staff name
    enrolledAt: { type: Date, default: Date.now },
    redeemedAt: { type: Date },
    redemptionBillId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchemeEnrollment', SchemeEnrollmentSchema);
