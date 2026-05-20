const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
}, { timestamps: true })

// Hash password sebelum disimpan
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; 
  this.password = await bcrypt.hash(this.password, 12);
});

// Method cek password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
