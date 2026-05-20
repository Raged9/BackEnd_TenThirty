require('dotenv').config()
const mongoose = require('mongoose')

const User = require('./models/User')
const Page = require('./models/Page')

const DEFAULT_CONTENT = {
  hero: {
    headline: 'Septic System and Environmental Compliance Solutions',
    subtext: 'Helping Florida homeowners and businesses solve complex and critical environmental and compliance issues at affordable prices.',
    stat1_number: '250+',
    stat1_label: '250 Revenue Monthly Donations to Homelessness',
    stat2_number: '10%',
    stat2_label: '10% Profits Annual Donation to Ten Thirty House',
    stat3_number: 'CAD',
    stat3_label: 'Certified, Advanced Designer & Inspector (FPI)',
    hero_image: null,
  },
  about: {
    title: 'More Than Just a Business',
    description: 'We are committed to protecting public health through our expert environmental solutions.',
    points: [
      { title: 'Expertise with a Purpose', desc: 'Delivering certified septic designs and inspections that safeguard the ecosystem.' },
      { title: 'Donations that Make an Impact', desc: '5% of our monthly revenue is donated directly to help address homelessness in Anoka County.' },
      { title: 'Partners in Progress.', desc: 'We support Ten Thirty House to provide essential services to families in need.' },
    ],
    image: null,
  },
  location: {
    address: 'Ruko Peterongan Plaza Blok C-2, Jalan MT. Haryono Nomor 719, Desa/Kelurahan Wonodri, Kec. Semarang Selatan, Kota Semarang, Provinsi Jawa Tengah, Kode Pos: 50242',
    map_image: null,
  },
  tentang_kami: {
    team: [],
  },
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Buat admin user
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (existing) {
      console.log('⚠️  Admin sudah ada, skip.')
    } else {
      await User.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      })
      console.log(`Admin dibuat: ${process.env.ADMIN_EMAIL}`)
    }

    // Seed default content
    for (const [section, content] of Object.entries(DEFAULT_CONTENT)) {
      const existing = await Page.findOne({ section })
      if (!existing) {
        await Page.create({ section, content })
        console.log(`Content seeded: ${section}`)
      } else {
        console.log(`Content sudah ada: ${section}, skip.`)
      }
    }

    console.log('\nSeed selesai!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()
