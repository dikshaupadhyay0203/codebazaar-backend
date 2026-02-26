const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const creatorDashboard = asyncHandler(async (req, res) => {
    const data = await dashboardService.getCreatorDashboard(req.user._id);
    res.status(200).json(new ApiResponse(200, 'Creator dashboard data fetched', data));
});

module.exports = { creatorDashboard };
