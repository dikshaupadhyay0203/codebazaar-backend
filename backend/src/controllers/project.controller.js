const fs = require('fs');
const projectService = require('../services/project.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const uploadProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject({ body: req.body, files: req.files, user: req.user });
    res.status(201).json(new ApiResponse(201, 'Project uploaded and visible to all users', project));
});

const approveProject = asyncHandler(async (req, res) => {
    const project = await projectService.approveProject(req.params.projectId);
    res.status(200).json(new ApiResponse(200, 'Project approved', project));
});

const getApprovedProjects = asyncHandler(async (req, res) => {
    const data = await projectService.getApprovedProjects(req.query);
    res.status(200).json(new ApiResponse(200, 'Approved projects fetched', data));
});

const getProjectDetails = asyncHandler(async (req, res) => {
    const data = await projectService.getProjectDetails(req.params.projectId);
    res.status(200).json(new ApiResponse(200, 'Project details fetched', data));
});

const downloadProject = asyncHandler(async (req, res) => {
    const { filePath, fileName } = await projectService.getDownloadDetails(req.params.projectId);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json(new ApiResponse(404, 'Project file not found'));
    }

    return res.download(filePath, fileName);
});

const purchasedProjectAssets = asyncHandler(async (req, res) => {
    const assets = await projectService.getPurchasedProjectAssets({ projectId: req.params.projectId });
    res.status(200).json(new ApiResponse(200, 'Purchased project assets fetched', assets));
});

const myUploads = asyncHandler(async (req, res) => {
    const uploads = await projectService.getMyUploads(req.user._id);
    res.status(200).json(new ApiResponse(200, 'My uploads fetched', uploads));
});

const myPurchases = asyncHandler(async (req, res) => {
    const purchases = await projectService.getMyPurchases(req.user._id);
    res.status(200).json(new ApiResponse(200, 'My purchases fetched', purchases));
});

const pendingProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getPendingProjects();
    res.status(200).json(new ApiResponse(200, 'Pending projects fetched', projects));
});

module.exports = {
    uploadProject,
    approveProject,
    getApprovedProjects,
    getProjectDetails,
    downloadProject,
    purchasedProjectAssets,
    myUploads,
    myPurchases,
    pendingProjects
};
