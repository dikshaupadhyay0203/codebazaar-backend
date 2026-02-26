const aiChatService = require('../services/aiChat.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const chat = asyncHandler(async (req, res) => {
    const result = await aiChatService.getChatCompletion({ messages: req.body.messages });
    res.status(200).json(new ApiResponse(200, 'AI response generated', result));
});

module.exports = { chat };
