const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Unauthorized: missing access token'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return next(new ApiError(401, 'Unauthorized: user not found'));
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(new ApiError(401, 'Unauthorized: invalid or expired token'));
    }
};

module.exports = { authMiddleware };
