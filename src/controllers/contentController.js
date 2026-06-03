const Page = require('../models/Page')

const getContent = async (req, res) => {
  try {
    const page = await Page.findOne({ section: req.params.section })
    if (!page) {
      return res.status(404).json({ message: 'Konten tidak ditemukan' })
    }
    res.json(page.content)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllContent = async (req, res) => {
  try {
    const pages = await Page.find()
    const result = {}
    pages.forEach(p => { result[p.section] = p.content })
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateContent = async (req, res) => {
  try {
    const { section } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ message: 'Content wajib diisi' })
    }

    const page = await Page.findOneAndUpdate(
      { section },
      { content, updatedBy: req.user._id },
      { new: true, upsert: true }
    )

    res.json({ message: 'Konten berhasil diupdate', data: page.content })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getContent, getAllContent, updateContent }
