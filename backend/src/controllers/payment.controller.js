const paymentService = require('../services/payment.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const buyProject = asyncHandler(async (req, res) => {
    const result = await paymentService.createBuyOrder({
        projectId: req.body.projectId,
        buyerId: req.user._id
    });

    res.status(200).json(new ApiResponse(200, 'Order created', result));
});

const verifyPayment = asyncHandler(async (req, res) => {
    const purchase = await paymentService.verifyPayment({
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId,
        razorpaySignature: req.body.razorpaySignature,
        projectId: req.body.projectId,
        buyerId: req.user._id
    });

    res.status(201).json(new ApiResponse(201, 'Payment verified and purchase unlocked', purchase));
});

module.exports = { buyProject, verifyPayment };
