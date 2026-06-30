const mongoose = require('mongoose');

const PledgedItemSchema = new mongoose.Schema({
  description: { type: String },
  weight:      { type: Number },
  purity:      { type: String },
  value:       { type: Number },
});

const RepaymentSchema = new mongoose.Schema({
  date:   { type: Date, default: Date.now },
  amount: { type: Number },
  note:   { type: String },
});

const LoanSchema = new mongoose.Schema(
  {
    loanNumber:     { type: String, required: true, unique: true },
    customer: {
      name:    { type: String, required: true },
      phone:   { type: String },
      address: { type: String },
    },
    pledgedItems:   [PledgedItemSchema],
    principal:      { type: Number, required: true },
    interestRate:   { type: Number, required: true },    // % per month
    issueDate:      { type: Date, required: true },
    dueDate:        { type: Date },
    status:         { type: String, enum: ['Active', 'Settled', 'Overdue'], default: 'Active' },
    settledDate:    { type: Date, default: null },
    repayments:     [RepaymentSchema],
    staffId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffName:      { type: String },
    storeId:        { type: String, required: true },
    notes:          { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', LoanSchema);
