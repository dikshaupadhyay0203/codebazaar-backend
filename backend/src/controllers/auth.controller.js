const authService = require('../services/auth.service');
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

module.exports = { register, login };
