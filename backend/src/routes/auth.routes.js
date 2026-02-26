const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password')
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
            .withMessage('Password must be strong'),
        body('role').optional().isIn(['user', 'creator', 'admin']).withMessage('Invalid role')
    ],
    validateRequest,
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 */
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validateRequest,
    authController.login
);

module.exports = router;
