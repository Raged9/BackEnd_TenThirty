const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: '"Ten Thirty Solutions" <no-reply@tenthirty.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  }

  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail