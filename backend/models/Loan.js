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
    // Settlement details (populated when loan is closed)
    monthsCalculated: { type: Number, default: null },
    interestAccrued:  { type: Number, default: null },
    totalRepaid:      { type: Number, default: null },
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

module.exports = mongoose.model('Loan', LoanSchema);
