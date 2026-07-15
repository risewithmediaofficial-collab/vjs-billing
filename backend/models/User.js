const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    role:     { type: String, enum: ['Admin', 'Manager', 'Senior Staff', 'Staff'], default: 'Staff' },
    pin:      { type: String, required: true },       // stored as bcrypt hash (password)
    rawPin:   { type: String },                       // stored in plain text for admin recovery
    storeId:  { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash the PIN before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  this.rawPin = this.pin;
  this.pin = await bcrypt.hash(this.pin, 10);
  next();
});

// Method to compare PIN at login
UserSchema.methods.comparePin = function (inputPin) {
  return bcrypt.compare(inputPin, this.pin);
};

module.exports = mongoose.model('User', UserSchema);
