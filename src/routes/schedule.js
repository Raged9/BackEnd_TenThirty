const express = require('express')
const router = express.Router()
const {
  getAvailableSchedules,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bookAppointment
} = require('../controllers/scheduleController')
const { protect } = require('../middleware/auth')

router.get('/', getAvailableSchedules)
router.post('/book', bookAppointment)
router.get('/all', protect, getAllSchedules)
router.post('/', protect, createSchedule)  
router.put('/:id', protect, updateSchedule)
router.delete('/:id', protect, deleteSchedule)

module.exports = router
