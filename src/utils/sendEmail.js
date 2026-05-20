// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Gunakan akun Gmail (Atur App Password di setelan keamanan Google Anda)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // e.g., emailanda@gmail.com
      pass: process.env.EMAIL_PASS, // e.g., xxxx xxxx xxxx xxxx (App Password)
    },
  });

  const mailOptions = {
    from: 'Ten Thirty Solutions <no-reply@tenthirtysolutions.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;