const Schedule = require('../models/Schedule')

const getAvailableSchedules = async (req, res) => {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    today.setUTCDate(today.getUTCDate() - 1)

    const schedules = await Schedule.find({
      date: { $gte: today },
      isAvailable: true,
    }).sort({ date: 1 })

    res.json(schedules)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllSchedules = async (req, res) => {
  try {
    const { month, year } = req.query
    const filter = {}

    if (month && year) {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 0, 23, 59, 59)
      filter.date = { $gte: start, $lte: end }
    }

    const schedules = await Schedule.find(filter).sort({ date: 1 })
    res.json(schedules)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, startTime, endTime wajib diisi' })
    }

    const existing = await Schedule.findOne({ date: new Date(date) })
    if (existing) {
      return res.status(400).json({ message: 'Jadwal untuk tanggal ini sudah ada' })
    }

    const schedule = await Schedule.create({
      date: new Date(date),
      startTime,
      endTime,
    })

    res.status(201).json({ message: 'Jadwal berhasil dibuat', data: schedule })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateSchedule = async (req, res) => {
  try {
    const { startTime, endTime, isAvailable } = req.body

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { startTime, endTime, isAvailable },
      { new: true }
    )

    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' })
    }

    res.json({ message: 'Jadwal berhasil diupdate', data: schedule })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)

    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' })
    }

    if (schedule.bookedBy) {
      return res.status(400).json({ message: 'Jadwal ini sudah dibooking, tidak bisa dihapus' })
    }

    await schedule.deleteOne()
    res.json({ message: 'Jadwal berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getAvailableSchedules,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
}
