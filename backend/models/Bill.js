const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  productId:    { type: String },
  name:         { type: String, required: true },
  category:     { type: String },
  weight:       { type: Number },
  grossWeight:  { type: Number },
  netWeight:    { type: Number },
  hsn:          { type: String, default: '711319' },
  purity:       { type: String },
  goldRate:     { type: Number },
  makingCharge: { type: Number },
  vaPerGram:    { type: Number },
  vaPercent:    { type: Number },
  stoneCharge:  { type: Number },
  quantity:     { type: Number, default: 1 },
  goldValue:    { type: Number },
  gstPercent:   { type: Number, default: 3 },
  gstAmount:    { type: Number, default: 0 },
  subtotal:     { type: Number },
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
    taxableValue:  { type: Number, default: 0 },
    includeGst:    { type: Boolean, default: true },
    cgstAmount:    { type: Number, default: 0 },
    sgstAmount:    { type: Number, default: 0 },
    gstAmount:     { type: Number, default: 0 },
    gstRate:       { type: Number, default: 0.03 },
    totalAmount:   { type: Number, default: 0 },
    roundOff:      { type: Number, default: 0 },
    netPayable:    { type: Number, default: 0 },
    billType:      { type: String, default: 'tax_invoice' }, // 'tax_invoice' | 'bill_of_supply' | 'quotation'
    isRoughBill:   { type: Boolean, default: false },
    paymentMethod: { type: String, default: 'Cash' },
    paymentSplits: [
      {
        method: { type: String },
        amount: { type: Number },
        reference: { type: String, default: '' },
      }
    ],
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
