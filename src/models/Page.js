const mongoose = require('mongoose')

const pageSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true })

module.exports = mongoose.model('Page', pageSchema)
