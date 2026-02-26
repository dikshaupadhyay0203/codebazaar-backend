const crypto = require('crypto');
const Purchase = require('../models/Purchase');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const { razorpay } = require('../config/razorpay');
const { env } = require('../config/env');

const createBuyOrder = async ({ projectId, buyerId }) => {
    const project = await Project.findOne({ _id: projectId, status: 'approved' });

    if (!project) {
        throw new ApiError(404, 'Project not available for purchase');
    }

    const existingPurchase = await Purchase.findOne({ buyerId, projectId });
    if (existingPurchase) {
        throw new ApiError(409, 'Project already purchased');
    }

    const receipt = `cb_${String(project._id).slice(-10)}_${Date.now().toString(36)}`;

    let order;
    try {
        order = await razorpay.orders.create({
            amount: Math.round(project.price * 100),
            currency: 'INR',
            receipt,
            notes: { projectId: String(project._id), buyerId: String(buyerId) }
        });
    } catch (error) {
        const providerMessage = error?.error?.description || error?.message || 'Unable to create Razorpay order';
        throw new ApiError(400, providerMessage);
    }

    return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: env.RAZORPAY_KEY_ID,
        project
    };
};

const verifyPayment = async ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    projectId,
    buyerId
}) => {
    const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    if (generatedSignature !== razorpaySignature) {
        throw new ApiError(400, 'Payment verification failed');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    const purchase = await Purchase.create({
        buyerId,
        projectId,
        paymentId: razorpayPaymentId,
        amount: project.price,
        purchaseDate: new Date()
    });

    return purchase;
};

module.exports = { createBuyOrder, verifyPayment };
