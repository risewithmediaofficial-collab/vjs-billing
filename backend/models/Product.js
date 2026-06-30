const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    barcode:     { type: String, unique: true, sparse: true },
    name:        { type: String, required: true },
    category:    { type: String, required: true },
    weight:      { type: Number, required: true },       // in grams
    purity:      { type: String, required: true },       // e.g. '22K', '18K', 'Platinum'
    makingCharge:{ type: Number, default: 0 },
    stoneCharge: { type: Number, default: 0 },
    goldRate:    { type: Number, required: true },
    stock:       { type: Number, default: 0 },
    storeId:     { type: String, required: true },
    image:       { type: String, default: null },        // base64 or URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
