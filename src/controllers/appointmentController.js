const Appointment = require('../models/Appointment')
const Schedule = require('../models/Schedule')

// POST /api/appointments  (public - user buat booking)
const createAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, scheduleId, notes } = req.body

    if (!name || !email || !phone || !service || !scheduleId) {
      return res.status(400).json({ message: 'Semua field wajib diisi' })
    }

    // Cek jadwal masih tersedia
    const schedule = await Schedule.findById(scheduleId)
    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' })
    }
    if (!schedule.isAvailable || schedule.bookedBy) {
      return res.status(400).json({ message: 'Jadwal ini sudah tidak tersedia' })
    }

    // Buat appointment
    const appointment = await Appointment.create({
      name, email, phone, service, schedule: scheduleId, notes,
    })

    // Tandai jadwal sudah dibooking
    await Schedule.findByIdAndUpdate(scheduleId, {
      isAvailable: false,
      bookedBy: appointment._id,
    })

    res.status(201).json({
      message: 'Appointment berhasil dibuat',
      data: appointment,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/appointments  (protected - admin lihat semua)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('schedule')
      .sort({ createdAt: -1 })
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/appointments/:id/status  (protected - admin update status)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' })
    }

    // Kalau dibatalkan, kembalikan jadwal jadi available
    if (status === 'cancelled') {
      await Schedule.findByIdAndUpdate(appointment.schedule, {
        isAvailable: true,
        bookedBy: null,
      })
    }

    res.json({ message: 'Status berhasil diupdate', data: appointment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createAppointment, getAllAppointments, updateStatus }
