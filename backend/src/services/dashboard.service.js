const Project = require('../models/Project');
const Purchase = require('../models/Purchase');

const getCreatorDashboard = async (creatorId) => {
    const creatorProjects = await Project.find({ uploadedBy: creatorId });
    const projectIds = creatorProjects.map((project) => project._id);

    const [salesStats, recentSales] = await Promise.all([
        Purchase.aggregate([
            { $match: { projectId: { $in: projectIds } } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]),
        Purchase.find({ projectId: { $in: projectIds } })
            .populate('projectId', 'title')
            .populate('buyerId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
    ]);

    return {
        totalUploads: creatorProjects.length,
        approvedUploads: creatorProjects.filter((project) => project.status === 'approved').length,
        pendingUploads: creatorProjects.filter((project) => project.status === 'pending').length,
        totalSales: salesStats[0]?.totalSales || 0,
        totalRevenue: salesStats[0]?.totalRevenue || 0,
        recentSales
    };
};

module.exports = { getCreatorDashboard };
