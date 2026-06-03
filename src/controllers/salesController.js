const Appointment = require('../models/Appointment');

// GET /api/sales/stats (Protected - Admin Only)
const getSalesStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    // 1. Calculate Top Metrics based on Appointment Status
    // Confirmed = Klien Aktif
    const totalClients = await Appointment.countDocuments({ status: 'confirmed' });
    
    // Schedules created this month that are confirmed
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const monthlySchedules = await Appointment.countDocuments({ 
      status: 'confirmed',
      createdAt: { $gte: startOfMonth }
    });

    // Pending = Prospek Baru
    const newProspects = await Appointment.countDocuments({ status: 'pending' });

    // 2. Chart Data (Monthly Fluctuation)
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
    ]);

    // Format array to directly send 12 numbers: [0, 0, 0...] for the graph
    const monthlyDataArray = Array(12).fill(0);
    stats.forEach((item) => {
      monthlyDataArray[item._id - 1] = item.count;
    });

    res.json({ 
      success: true, 
      totalClients,
      monthlySchedules,
      newProspects,
      monthlyData: monthlyDataArray 
    });
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
      // Search by name or email
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ],
      };
    }

    const clients = await Appointment.find(query)
      .select('name email phone service status createdAt')
      .limit(5) // Limit to 5 so the dropdown doesn't get too long
      .sort({ createdAt: -1 });

    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mencari data klien', error: error.message });
  }
};

module.exports = { getSalesStats, searchClients };