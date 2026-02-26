const express = require('express');
const { body, param, query } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');
const { uploadProjectAssets } = require('../middlewares/upload.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');
const { cacheResponse } = require('../middlewares/cache.middleware');
const { ensurePurchased } = require('../middlewares/purchase.middleware');

const router = express.Router();

const objectIdValidation = param('projectId').isMongoId().withMessage('Invalid project id');

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all approved projects with pagination and filters
 */
router.get(
    '/',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
        query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be >= 0'),
        query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be >= 0')
    ],
    validateRequest,
    cacheResponse(60),
    projectController.getApprovedProjects
);

router.get('/user/my-uploads', authMiddleware, projectController.myUploads);
router.get('/user/my-purchases', authMiddleware, projectController.myPurchases);
router.get('/admin/pending', authMiddleware, allowRoles('admin'), projectController.pendingProjects);

router.post(
    '/',
    authMiddleware,
    uploadProjectAssets,
    [
        body('title').trim().notEmpty().withMessage('title is required'),
        body('description').trim().notEmpty().withMessage('description is required'),
        body('price').isFloat({ min: 0 }).withMessage('price must be >= 0'),
        body('category').trim().notEmpty().withMessage('category is required'),
        body('projectLink').optional().isURL().withMessage('projectLink must be a valid URL')
    ],
    validateRequest,
    projectController.uploadProject
);

router.patch(
    '/:projectId/approve',
    authMiddleware,
    allowRoles('admin'),
    [objectIdValidation],
    validateRequest,
    projectController.approveProject
);

router.get(
    '/:projectId/download',
    authMiddleware,
    [objectIdValidation],
    validateRequest,
    ensurePurchased,
    projectController.downloadProject
);

router.get(
    '/:projectId/assets',
    authMiddleware,
    [objectIdValidation],
    validateRequest,
    ensurePurchased,
    projectController.purchasedProjectAssets
);

router.get('/:projectId', [objectIdValidation], validateRequest, projectController.getProjectDetails);

module.exports = router;
