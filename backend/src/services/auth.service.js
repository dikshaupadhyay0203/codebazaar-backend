const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signAccessToken } = require('../utils/token.util');

const registerUser = async ({ name, email, password, role, avatar }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        avatar: avatar || ''
    });

    const accessToken = signAccessToken({ userId: user._id, role: user.role });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt
        },
        accessToken
    };
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    if (user.isVerified === false) {
        throw new ApiError(403, 'Please verify your email before login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken = signAccessToken({ userId: user._id, role: user.role });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt
        },
        accessToken
    };
};

module.exports = { registerUser, loginUser };
