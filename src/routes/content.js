const express = require('express')
const router = express.Router()
const { getContent, getAllContent, updateContent } = require('../controllers/contentController')
const { protect } = require('../middleware/auth')

router.get('/', getAllContent)
router.get('/:section', getContent)
router.put('/:section', protect, updateContent)

module.exports = router
