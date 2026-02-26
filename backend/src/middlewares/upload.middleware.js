const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'projectZip' && file.mimetype !== 'application/zip' && !file.originalname.endsWith('.zip')) {
        return cb(new ApiError(400, 'projectZip must be a ZIP file'));
    }

    if (file.fieldname === 'projectImage' && !file.mimetype.startsWith('image/')) {
        return cb(new ApiError(400, 'projectImage must be an image'));
    }

    return cb(null, true);
};

const uploadProjectAssets = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }).fields([
    { name: 'projectZip', maxCount: 1 },
    { name: 'projectImage', maxCount: 1 }
]);

module.exports = { uploadProjectAssets };
