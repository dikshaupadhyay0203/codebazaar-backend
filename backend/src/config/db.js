const mongoose = require('mongoose');
const { env } = require('./env');

const connectDB = async () => {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');
};

module.exports = connectDB;
