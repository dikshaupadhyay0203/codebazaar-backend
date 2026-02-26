const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        techStack: [{ type: String, trim: true }],
        category: { type: String, required: true, trim: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        fileUrl: { type: String, required: true, select: false },
        projectLink: { type: String, default: '', trim: true, select: false },
        imageUrl: { type: String, default: '' },
        projectImages: [{ type: String }],
        status: { type: String, enum: ['pending', 'approved'], default: 'approved' }
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Project', projectSchema);
