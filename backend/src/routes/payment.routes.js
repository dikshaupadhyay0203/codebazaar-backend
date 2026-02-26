const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * @swagger
 * /payments/buy:
 *   post:
 *     summary: Create Razorpay order for project purchase
 */
router.post(
    '/buy',
    authMiddleware,
    [body('projectId').isMongoId().withMessage('Valid projectId required')],
    validateRequest,
    paymentController.buyProject
);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify payment and unlock project download
 */
router.post(
    '/verify',
    authMiddleware,
    [
        body('projectId').isMongoId().withMessage('Valid projectId required'),
        body('razorpayOrderId').trim().notEmpty().withMessage('razorpayOrderId is required'),
        body('razorpayPaymentId').trim().notEmpty().withMessage('razorpayPaymentId is required'),
        body('razorpaySignature').trim().notEmpty().withMessage('razorpaySignature is required')
    ],
    validateRequest,
    paymentController.verifyPayment
);

module.exports = router;
