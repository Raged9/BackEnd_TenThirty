const Schedule = require('../models/Schedule')
const Appointment = require('../models/Appointment'); // Asumsi model ini sudah ada
const sendEmail = require('../utils/sendEmail');

// Ganti getAvailableSchedules dengan fungsi ini untuk mengambil semua jadwal publik
const getAvailableSchedules = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Ambil jadwal mulai hari ini ke depan (Hanya kembalikan tanggal dan waktu demi privasi)
    const schedules = await Schedule.find({ date: { $gte: today } })
      .select('date startTime endTime isAvailable')
      .sort({ date: 1 })

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

const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId, isApproved } = req.body;
    
    const appointment = await Appointment.findById(appointmentId).populate('schedule');
    if (!appointment) return res.status(404).json({ message: 'Permintaan tidak ditemukan' });

    if (isApproved) {
      appointment.status = 'confirmed';
      await appointment.save();

      // Kirim Email Konfirmasi
      const message = `Halo ${appointment.name},\n\nJadwal Anda pada tanggal ${new Date(appointment.schedule.date).toLocaleDateString()} jam ${appointment.schedule.startTime} telah KAMI KONFIRMASI.\n\nTerima kasih.`;
      
      try {
        await sendEmail({
          email: appointment.email,
          subject: 'Konfirmasi Jadwal - Ten Thirty Solutions',
          message: message
        });
      } catch (err) {
        console.error("Gagal mengirim email:", err);
      }

      res.json({ message: 'Jadwal dikonfirmasi dan email terkirim.' });
    } else {
      appointment.status = 'cancelled';
      await appointment.save();
      // Bisa tambahkan email pembatalan di sini jika perlu
      res.json({ message: 'Jadwal dibatalkan.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Update fungsi bookAppointment agar membuat jadwal dinamis dari sisi user
const bookAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, notes, date, time } = req.body;

    if (!name || !email || !phone || !service || !date || !time) {
      return res.status(400).json({ message: 'Harap lengkapi form, tanggal, dan waktu.' });
    }

    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);

    // 1. Cek apakah di tanggal dan jam tersebut sudah ada yang booking
    const existingSchedule = await Schedule.findOne({ date: scheduleDate, startTime: time });
    if (existingSchedule) {
      return res.status(400).json({ message: `Maaf, jam ${time} di tanggal ini sudah dibooking.` });
    }

    // 2. Buat jadwal baru (Dibuat otomatis oleh user)
    const schedule = await Schedule.create({
      date: scheduleDate,
      startTime: time,
      endTime: time, // Anda bisa menambah durasi jika diperlukan
      isAvailable: false
    });

    // 3. Buat Appointment terkait
    const appointment = await Appointment.create({
      name, email, phone, service, schedule: schedule._id, notes
    });

    // 4. Update relasi
    schedule.bookedBy = appointment._id;
    await schedule.save();

    res.status(201).json({ message: 'Permintaan jadwal berhasil dikirim!', data: appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAvailableSchedules,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  confirmAppointment,
  bookAppointment,
}
