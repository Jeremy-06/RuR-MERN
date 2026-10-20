const multer = require("multer");
const path = require("path");

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']

// Files stay in memory and are streamed to Cloudinary by the controller
module.exports = multer({
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
        fieldSize: 10 * 1024 * 1024
    },
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
            const error = new Error(`Unsupported file type for ${file.originalname}. Allowed: jpg, jpeg, png, webp`)
            error.statusCode = 400
            return cb(error);
        }
        cb(null, true);
    },
});
