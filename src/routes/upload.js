const express = require('express')
const router = express.Router()
const { uploadImage, deleteImage } = require('../controllers/uploadController')
const { protect } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

router.post('/', protect, upload.single('image'), uploadImage)
router.delete('/:public_id', protect, deleteImage)

module.exports = router
