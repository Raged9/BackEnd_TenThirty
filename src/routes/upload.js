const express = require('express')
const router = express.Router()

// 1. PASTIKAN getImages DI-IMPORT DARI CONTROLLER
const { uploadImage, deleteImage, getImages } = require('../controllers/uploadController')
const { protect } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

// 2. TAMBAHKAN ROUTER GET UNTUK MENGAMBIL DAFTAR GAMBAR
router.get('/', protect, getImages)

// Router bawaan Anda sebelumnya
router.post('/', protect, upload.single('image'), uploadImage)
router.delete('/:public_id', protect, deleteImage)

module.exports = router