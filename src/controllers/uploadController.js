const { cloudinary } = require('../config/cloudinary')

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' })
    }

    res.json({
      message: 'Upload berhasil',
      url: req.file.path,
      public_id: req.file.filename,
    })
  } catch (error) {
    res.status(500).json({ message: 'Upload gagal', error: error.message })
  }
}

const deleteImage = async (req, res) => {
  try {
    const public_id = decodeURIComponent(req.params.public_id)
    await cloudinary.uploader.destroy(public_id)
    res.json({ message: 'Gambar berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ message: 'Hapus gambar gagal', error: error.message })
  }
}

module.exports = { uploadImage, deleteImage }
