const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema(
  {
    loanNumber:       { type: String, required: true, unique: true },
    // Flat customer fields (matching frontend)
    customerName:     { type: String, required: true },
    customerMobile:   { type: String },
    govtProof:        { type: String, default: '' },
    // Pledge details
    pledgeItem:       { type: String },
    huid:             { type: String, default: '' },
    weight:           { type: Number },
    purity:           { type: String },
    damagePercentage: { type: String, default: '' },
    goldImage:        { type: String, default: null },
    customerPhoto:    { type: String, default: null },
    // Financials
    loanAmount:          { type: Number, required: true },
    interestRate:        { type: Number, required: true },   // % per month
    overdueInterestRate: { type: Number, default: null },    // % per month after due date
    tenureMonths:        { type: Number, default: 12 },      // default 12 months (1 year)
    // Dates
    issueDate:           { type: Date, required: true },
    dueDate:             { type: Date },
    closingDate:         { type: Date, default: null },
    // Settlement details (populated when loan is closed or payments made)
    monthsCalculated: { type: Number, default: null },
    interestAccrued:  { type: Number, default: null },
    fine:             { type: Number, default: 0 },
    totalRepaid:      { type: Number, default: null },
    payments: [
      {
        date:        { type: Date, default: Date.now },
        amount:      { type: Number, required: true },
        paymentMode: { type: String, default: 'Cash' },
        reference:   { type: String, default: '' },
        note:        { type: String, default: '' },
        receivedBy:  { type: String, default: '' },
      }
    ],
    settleNotes:      { type: String, default: '' },
    // Status
    status:           { type: String, enum: ['Active', 'Closed', 'SettlePending'], default: 'Active' },
    // Staff & Store
    staffId:          { type: String },
    staffName:        { type: String },
    storeId:          { type: String, required: true },
    notes:            { type: String, default: '' },
  },
  { timestamps: true }
);

// High-performance compound indexes for instant sorting & filtering
LoanSchema.index({ storeId: 1, createdAt: -1 });
LoanSchema.index({ storeId: 1, status: 1 });
LoanSchema.index({ customerMobile: 1 });
LoanSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Loan', LoanSchema);
