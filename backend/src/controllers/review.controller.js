const reviewService = require('../services/review.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const addReview = asyncHandler(async (req, res) => {
    const review = await reviewService.addReview({
        userId: req.user._id,
        projectId: req.params.projectId,
        rating: req.body.rating,
        comment: req.body.comment
    });

    res.status(201).json(new ApiResponse(201, 'Review saved', review));
});

module.exports = { addReview };
