// File: BackEnd_TenThirty/src/routes/sales.js
const express = require('express');
const router = express.Router();
const { getSalesStats, searchClients } = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getSalesStats);
router.get('/clients', protect, searchClients);

module.exports = router;