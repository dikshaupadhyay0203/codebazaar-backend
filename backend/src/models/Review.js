const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, default: '' }
    },
    { timestamps: true }
);

reviewSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
