const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

const createTransporter = () => {
    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
        throw new ApiError(503, 'Email service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    }

    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
        }
    });
};

const sendOtpEmail = async ({ email, otp }) => {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER || 'no-reply@codebazar.local',
        to: email,
        subject: 'CodeBazar OTP Verification',
        text: `Your CodeBazar OTP is ${otp}. It will expire in 5 minutes.`,
        html: `<p>Your <strong>CodeBazar OTP</strong> is <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`
    });

    return info;
};

module.exports = { sendOtpEmail };