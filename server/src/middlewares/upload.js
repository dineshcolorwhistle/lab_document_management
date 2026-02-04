const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { AppError } = require('../utils/AppError')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, `${uuidv4()}${ext}`)
    },
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images.', { statusCode: 400 }), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
})

module.exports = {
    uploadProfileImage: upload.single('profileImage'),
}
