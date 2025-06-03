// Description : Mail notification utility for sending emails using Nodemailer.
// This utility function allows sending emails with attachments using a Gmail account.

const nodemailer = require("nodemailer");

const emailNotification = (to, subject, html, attachment = []) => {
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
      attachments: attachment
    })
    .then(() => {
      console.log("mail sent");
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = emailNotification