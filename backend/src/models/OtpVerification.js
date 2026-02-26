const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
        otp: { type: String, required: true },
        otpExpiry: { type: Date, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);