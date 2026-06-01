// File: BackEnd_TenThirty/src/controllers/salesController.js
const Appointment = require('../models/Appointment');

// GET /api/sales/stats (Protected - Admin Only)
const getSalesStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Agregasi jumlah appointment per bulan untuk tahun berjalan
    const stats = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Format array isi 12 bulan (Jan - Des) dengan nilai default 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('id-ID', { month: 'short' }),
      value: 0,
    }));

    // Masukkan hasil agregasi database ke dalam array formatan
    stats.forEach((item) => {
      monthlyData[item._id - 1].value = item.count;
    });

    res.json({ success: true, year: currentYear, data: monthlyData });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat statistik sales', error: error.message });
  }
};

// GET /api/sales/clients?search=keyword (Protected - Admin Only)
const searchClients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Mencari berdasarkan nama klien, nama UMKM, atau email (case-insensitive)
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }, // Sesuaikan dengan field model Anda
        ],
      };
    }

    const clients = await Appointment.find(query)
      .select('name email phone service status createdAt')
      .limit(10) // Batasi 10 hasil untuk efisiensi dropdown pencarian
      .sort({ createdAt: -1 });

    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mencari data klien', error: error.message });
  }
};

module.exports = { getSalesStats, searchClients };