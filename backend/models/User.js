const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    identifier: { type: String, required: true, unique: true }, // Email or Phone Number
    password: { type: String, required: true },
    otp: { type: String }, // For OTP login verification
    otpExpires: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);