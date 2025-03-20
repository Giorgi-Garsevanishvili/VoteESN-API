const nodemailer = require("nodemailer");

const emailNotification = (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_CODE,
    },
  });

  transporter
    .sendMail({
      to: to,
      subject: subject,
      html: html,
    })
    .then(() => {
      console.log("mail sent");
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = emailNotification