require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

connectDB()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/content', require('./routes/content'))
app.use('/api/schedules', require('./routes/schedule'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/appointments', require('./routes/appointment'))
app.use('/api/sales', require('./routes/sales'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ten Thirty Backend running' })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
