const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  productId:   { type: String },
  name:        { type: String, required: true },
  category:    { type: String },
  weight:      { type: Number },
  purity:      { type: String },
  goldRate:    { type: Number },
  makingCharge:{ type: Number },
  stoneCharge: { type: Number },
  quantity:    { type: Number, default: 1 },
  goldValue:   { type: Number },
  subtotal:    { type: Number },
});

const BillSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: {
      name:    { type: String, default: 'Walk-in Customer' },
      phone:   { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items:         [BillItemSchema],
    goldValue:     { type: Number, default: 0 },
    makingTotal:   { type: Number, default: 0 },
    stoneTotal:    { type: Number, default: 0 },
    subtotal:      { type: Number, default: 0 },
    gstAmount:     { type: Number, default: 0 },
    gstRate:       { type: Number, default: 0.03 },
    totalAmount:   { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    amountPaid:    { type: Number, default: 0 },
    change:        { type: Number, default: 0 },
    staffId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffName:     { type: String },
    storeId:       { type: String, required: true },
    notes:         { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', BillSchema);
