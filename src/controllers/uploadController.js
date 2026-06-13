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

// 1. TAMBAHKAN FUNGSI INI UNTUK MENGAMBIL GAMBAR DARI CLOUDINARY
const getImages = async (req, res) => {
  try {
    const { resources } = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();
      
    const images = resources.map((file) => ({
      url: file.secure_url,
      public_id: file.public_id,
    }));
    
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil gambar', error: error.message });
  }
};

// 2. PASTIKAN getImages DITAMBAHKAN DI SINI (DI EKSPOR)
module.exports = { uploadImage, deleteImage, getImages }