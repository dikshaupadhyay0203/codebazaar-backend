const Purchase = require('../models/Purchase');
const ApiError = require('../utils/ApiError');

const ensurePurchased = async (req, res, next) => {
    const { projectId } = req.params;

    const purchase = await Purchase.findOne({ buyerId: req.user._id, projectId });

    if (!purchase) {
        return next(new ApiError(403, 'Purchase required before download'));
    }

    return next();
};

module.exports = { ensurePurchased };
