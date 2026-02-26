const Review = require('../models/Review');
const Project = require('../models/Project');
const Purchase = require('../models/Purchase');
const ApiError = require('../utils/ApiError');

const addReview = async ({ userId, projectId, rating, comment }) => {
    const project = await Project.findById(projectId);
    if (!project || project.status !== 'approved') {
        throw new ApiError(404, 'Project not found');
    }

    const purchase = await Purchase.findOne({ buyerId: userId, projectId });
    if (!purchase) {
        throw new ApiError(403, 'Purchase required before review');
    }

    const review = await Review.findOneAndUpdate(
        { userId, projectId },
        { rating, comment },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return review;
};

module.exports = { addReview };
