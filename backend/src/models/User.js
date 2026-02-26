const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: true },
        role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
        avatar: { type: String, default: '' }
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('User', userSchema);
