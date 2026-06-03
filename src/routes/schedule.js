const express = require('express')
const router = express.Router()
const {
  getAvailableSchedules,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController')
const { protect } = require('../middleware/auth')

router.get('/', getAvailableSchedules)
router.get('/all', protect, getAllSchedules)
router.post('/', protect, createSchedule)  
router.put('/:id', protect, updateSchedule)
router.delete('/:id', protect, deleteSchedule)

module.exports = router
