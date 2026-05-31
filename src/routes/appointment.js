const express = require('express')
const router = express.Router()
const { createAppointment, getAllAppointments, updateStatus } = require('../controllers/appointmentController')
const { protect } = require('../middleware/auth')

router.post('/', createAppointment)                          // public - user booking
router.get('/', protect, getAllAppointments)                 // admin - lihat semua
router.put('/:id/status', protect, updateStatus)            // admin - update status

module.exports = router