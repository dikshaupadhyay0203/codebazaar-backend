const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/creator', authMiddleware, allowRoles('creator', 'admin'), dashboardController.creatorDashboard);

module.exports = router;
