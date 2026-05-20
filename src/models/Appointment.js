const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  service: {
    type: String,
    required: true,
    enum: ['septic-design', 'inspection', 'environmental-consulting'],
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
  },
  notes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true })

module.exports = mongoose.model('Appointment', appointmentSchema)
