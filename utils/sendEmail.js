const nodemailer = require('nodemailer');

module.exports = sendEmail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS
    },
    secure: true,
    port: 465
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject,
    html
  };

  return await transporter.sendMail(mailOptions);
}