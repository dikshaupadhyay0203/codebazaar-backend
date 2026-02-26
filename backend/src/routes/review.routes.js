const express = require('express');
const { body, param } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post(
    '/:projectId',
    authMiddleware,
    [
        param('projectId').isMongoId().withMessage('Valid projectId required'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be from 1 to 5'),
        body('comment').optional().isString().trim()
    ],
    validateRequest,
    reviewController.addReview
);

module.exports = router;
