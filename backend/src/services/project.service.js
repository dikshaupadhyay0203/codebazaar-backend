const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

const createProject = async ({ body, files, user }) => {
    if (!files?.projectZip?.[0]) {
        throw new ApiError(400, 'Project ZIP file is required');
    }

    const zipFile = files.projectZip[0];
    const imageFile = files.projectImage?.[0];
    const additionalImageFiles = files.projectImages || [];
    const additionalImageUrls = additionalImageFiles.map((file) => `${env.BASE_URL}/uploads/${file.filename}`);
    const coverImageUrl = imageFile ? `${env.BASE_URL}/uploads/${imageFile.filename}` : additionalImageUrls[0] || '';

    const techStack = Array.isArray(body.techStack)
        ? body.techStack
        : String(body.techStack || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

    const project = await Project.create({
        title: body.title,
        description: body.description,
        price: Number(body.price),
        techStack,
        category: body.category,
        uploadedBy: user._id,
        fileUrl: `${env.BASE_URL}/uploads/${zipFile.filename}`,
        projectLink: body.projectLink || '',
        imageUrl: coverImageUrl,
        projectImages: additionalImageUrls,
        status: 'approved'
    });

    return project;
};

const approveProject = async (projectId) => {
    const project = await Project.findByIdAndUpdate(projectId, { status: 'approved' }, { new: true });
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    return project;
};

const getApprovedProjects = async ({ page = 1, limit = 10, techStack, category, minPrice, maxPrice, q }) => {
    const query = { status: 'approved' };

    if (techStack) {
        query.techStack = { $regex: techStack, $options: 'i' };
    }

    if (category) {
        query.category = { $regex: category, $options: 'i' };
    }

    if (q) {
        query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
        ];
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const safeLimit = Math.min(Number(limit) || 10, 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [projects, total] = await Promise.all([
        Project.find(query)
            .populate('uploadedBy', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit),
        Project.countDocuments(query)
    ]);

    return {
        projects,
        pagination: {
            total,
            page: safePage,
            limit: safeLimit,
            pages: Math.ceil(total / safeLimit)
        }
    };
};

const getProjectDetails = async (projectId) => {
    const project = await Project.findOne({ _id: projectId, status: 'approved' }).populate('uploadedBy', 'name email avatar');

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    const reviews = await Review.find({ projectId }).populate('userId', 'name avatar').sort({ createdAt: -1 });

    return { project, reviews };
};

const getDownloadDetails = async (projectId) => {
    const project = await Project.findById(projectId).select('+fileUrl');

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    const fileName = project.fileUrl.split('/uploads/')[1];
    const primaryPath = path.resolve(__dirname, '../../', env.UPLOAD_DIR, fileName);
    const legacyPath = path.join(process.cwd(), env.UPLOAD_DIR, fileName);
    const filePath = fs.existsSync(primaryPath) ? primaryPath : legacyPath;

    return { filePath, fileName };
};

const getPurchasedProjectAssets = async ({ projectId }) => {
    const project = await Project.findOne({ _id: projectId, status: 'approved' }).select('+projectLink');

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    return {
        projectId: project._id,
        title: project.title,
        projectLink: project.projectLink || '',
        downloadUrl: `${env.BASE_URL}/api/projects/${project._id}/download`
    };
};

const getMyUploads = async (userId) => {
    return Project.find({ uploadedBy: userId }).sort({ createdAt: -1 });
};

const getMyPurchases = async (userId) => {
    return Purchase.find({ buyerId: userId }).populate('projectId').sort({ createdAt: -1 });
};

const getPendingProjects = async () => {
    return Project.find({ status: 'pending' }).populate('uploadedBy', 'name email').sort({ createdAt: -1 });
};

module.exports = {
    createProject,
    approveProject,
    getApprovedProjects,
    getProjectDetails,
    getDownloadDetails,
    getPurchasedProjectAssets,
    getMyUploads,
    getMyPurchases,
    getPendingProjects
};
