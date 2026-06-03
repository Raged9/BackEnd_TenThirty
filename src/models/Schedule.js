const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // format: "07:30"
    required: true,
  },
  endTime: {
    type: String, // format: "15:00"
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },
}, { timestamps: true })

// Pastikan satu tanggal tidak duplikat
scheduleSchema.index({ date: 1 }, { unique: true })

module.exports = mongoose.model('Schedule', scheduleSchema)
