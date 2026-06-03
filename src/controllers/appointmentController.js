const Appointment = require('../models/Appointment')
const Schedule = require('../models/Schedule')
const sendEmail = require('../utils/sendEmail')

// POST /api/appointments  (public - user buat booking)
const createAppointment = async (req, res) => {
  try {
    // 1. Dapatkan location dan captchaToken dari request body
    const { name, email, phone, service, location, scheduleId, notes, captchaToken } = req.body

    // 2. Validasi field wajib (tambahkan location)
    if (!name || !email || !phone || !service || !location || !scheduleId) {
      return res.status(400).json({ message: 'Semua field wajib diisi' })
    }

    // 3. --- VERIFIKASI RECAPTCHA ---
    if (!captchaToken) {
      return res.status(400).json({ message: 'Validasi CAPTCHA diperlukan' })
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    // Node 18+ memiliki built-in fetch
    const googleResponse = await fetch(verifyUrl, { method: 'POST' });
    const googleData = await googleResponse.json();

    if (!googleData.success) {
      return res.status(400).json({ 
        message: "Verifikasi CAPTCHA gagal. Silakan coba lagi." 
      });
    }
    // --------------------------------

    // 4. Cek jadwal masih tersedia
    const schedule = await Schedule.findById(scheduleId)
    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' })
    }
    if (!schedule.isAvailable || schedule.bookedBy) {
      return res.status(400).json({ message: 'Jadwal ini sudah tidak tersedia' })
    }

    // 5. Buat appointment (tambahkan location)
    const appointment = await Appointment.create({
      name, email, phone, service, location, schedule: scheduleId, notes,
    })

    // 6. Tandai jadwal sudah dibooking
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

// PUT /api/appointments/:id/status (protected - admin update status)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    
    // Gunakan populate('schedule') agar kita bisa mengambil tanggal dan waktu untuk isi email
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('schedule')

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment tidak ditemukan' })
    }

    // Kalau dibatalkan, kembalikan jadwal jadi available
    if (status === 'cancelled') {
      await Schedule.findByIdAndUpdate(appointment.schedule._id, {
        isAvailable: true,
        bookedBy: null,
      })
    }

    // --- LOGIK KIRIM EMAIL ---
    const dateObj = new Date(appointment.schedule.date);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = `${appointment.schedule.startTime} - ${appointment.schedule.endTime}`;
    
    let emailSubject = '';
    let emailText = '';

    if (status === 'confirmed') {
      emailSubject = '✅ Appointment Disetujui - Ten Thirty Solutions';
      emailText = `Halo ${appointment.name},\n\nAppointment Anda telah DISETUJUI oleh admin kami.\n\nBerikut detail jadwal Anda:\nLayanan: ${appointment.service}\nTanggal: ${dateStr}\nWaktu: ${timeStr}\n\nTerima kasih telah mempercayakan layanan Anda kepada kami.`;
    } else if (status === 'cancelled') {
      emailSubject = '❌ Appointment Ditolak - Ten Thirty Solutions';
      emailText = `Halo ${appointment.name},\n\nMohon maaf, appointment Anda terpaksa DITOLAK/DIBATALKAN oleh admin kami karena satu dan lain hal.\n\nDetail pengajuan Anda:\nLayanan: ${appointment.service}\nTanggal: ${dateStr}\nWaktu: ${timeStr}\n\nSilakan hubungi kami atau buat jadwal ulang jika diperlukan.`;
    }

    // Kirim email jika statusnya confirmed atau cancelled
    if (emailSubject && emailText) {
      try {
        await sendEmail({
          to: appointment.email,
          subject: emailSubject,
          text: emailText
        });
      } catch (emailError) {
        console.error('Gagal mengirim email:', emailError);
        // Kita tidak mereturn error agar status appointment tetap tersimpan meski email gagal
      }
    }
    // -------------------------

    res.json({ message: 'Status berhasil diupdate dan email notifikasi terkirim', data: appointment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createAppointment, getAllAppointments, updateStatus }

// done