const express = require('express');
const { body } = require('express-validator');
const aiChatController = require('../controllers/aiChat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post(
    '/chat',
    authMiddleware,
    [
        body('messages').isArray({ min: 1 }).withMessage('messages must be a non-empty array'),
        body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
        body('messages.*.content').isString().trim().notEmpty().withMessage('Message content is required')
    ],
    validateRequest,
    aiChatController.chat
);

module.exports = router;
