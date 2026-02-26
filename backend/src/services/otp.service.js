const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');

const OTP_EXPIRY_MINUTES = 5;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtp = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified !== false) {
        throw new ApiError(409, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OtpVerification.findOneAndUpdate(
        { email },
        {
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            otp,
            otpExpiry
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await emailService.sendOtpEmail({ email, otp });

    return { email };
};

const verifyOtp = async ({ email, otp }) => {
    const otpRecord = await OtpVerification.findOne({ email });
    if (!otpRecord) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    if (otpRecord.otp !== String(otp) || otpRecord.otpExpiry.getTime() < Date.now()) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified !== false) {
        await OtpVerification.deleteOne({ _id: otpRecord._id });
        throw new ApiError(409, 'Email already exists');
    }

    if (existingUser && existingUser.isVerified === false) {
        existingUser.name = otpRecord.name;
        existingUser.password = otpRecord.password;
        existingUser.role = otpRecord.role || 'user';
        existingUser.isVerified = true;
        await existingUser.save();
    } else {
        await User.create({
            name: otpRecord.name,
            email: otpRecord.email,
            password: otpRecord.password,
            role: otpRecord.role || 'user',
            isVerified: true
        });
    }

    await OtpVerification.deleteOne({ _id: otpRecord._id });

    return { email };
};

const resendOtp = async ({ email }) => {
    const otpRecord = await OtpVerification.findOne({ email });
    if (!otpRecord) {
        throw new ApiError(404, 'OTP request not found. Please register again');
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    otpRecord.otp = otp;
    otpRecord.otpExpiry = otpExpiry;
    await otpRecord.save();

    await emailService.sendOtpEmail({ email, otp });

    return { email };
};

module.exports = {
    sendOtp,
    verifyOtp,
    resendOtp
};