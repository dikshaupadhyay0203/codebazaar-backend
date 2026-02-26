const express = require('express');
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'CodeBazaar backend is healthy' });
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
