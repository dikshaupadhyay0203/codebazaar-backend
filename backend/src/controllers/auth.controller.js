const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, 'User registered successfully', result));
});

const login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.status(200).json(new ApiResponse(200, 'Login successful', result));
});

const sendOtp = asyncHandler(async (req, res) => {
    const result = await otpService.sendOtp(req.body);
    res.status(200).json(new ApiResponse(200, 'OTP sent to your email', result));
});

const verifyOtp = asyncHandler(async (req, res) => {
    const result = await otpService.verifyOtp(req.body);
    res.status(200).json(new ApiResponse(200, 'Account Verified Successfully', result));
});

const resendOtp = asyncHandler(async (req, res) => {
    const result = await otpService.resendOtp(req.body);
    res.status(200).json(new ApiResponse(200, 'OTP sent to your email', result));
});

module.exports = { register, login, sendOtp, verifyOtp, resendOtp };
