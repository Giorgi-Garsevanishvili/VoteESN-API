// Description : Mail notification utility for sending emails using Nodemailer.
// This utility function allows sending emails with attachments using a Gmail account.

// const nodemailer = require("nodemailer");

// const emailNotification = (to, subject, html, attachment = []) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true, // upgrade later with STARTTLS
//     auth: {
//       user: process.env.GMAIL_USER,
//       pass: process.env.GMAIL_CODE,
//     },
//   });

//   transporter
//     .sendMail({
//       to: to,
//       subject: subject,
//       html: html,
//       attachments: attachment
//     })
//     .then(() => {
//       console.log("mail sent");
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// };

// module.exports = emailNotification

const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

const emailNotification = async (to, subject, html, attachments = []) => {
  const form = new FormData();

  form.append('from', `VoteESN 🛡️ Qirvex™ <postmaster@${process.env.MAILGUN_DOMAIN}>`);
  form.append('to', to);
  form.append('subject', subject);
  form.append('html', html);

  attachments.forEach(filePath => {
    form.append('attachment', fs.createReadStream(filePath));
  });

  try {
    const response = await fetch(`https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64'),
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${text}`);
    }

    const result = await response.json();
    console.log('Mail sent:', result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

module.exports = emailNotification;


