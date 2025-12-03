const fetch = require("node-fetch");
const FormData = require("form-data");

const emailNotification = async (to, subject, html, attachments = []) => {
  const form = new FormData();

  form.append(
    "from",
    `VoteESN 🛡️ Qirvex™ <postmaster@${process.env.MAILGUN_DOMAIN}>`
  );
  form.append("to", to);
  form.append("subject", subject);

  // 🔥 FIX #1: Add inline attachments BEFORE html
  attachments.forEach((att) => {
    const options = {
      filename: att.filename,
      contentType: att.contentType,
    };

    if (att.inline && att.cid) {
      options.header = {
        "Content-ID": `<${att.cid}>`,
        "Content-Disposition": "inline",
      };

      form.append("inline", att.content, options);
    }
  });

  // NOW append the HTML
  form.append("html", html);

  // Add regular attachments
  attachments.forEach((att) => {
    if (!att.inline) {
      form.append("attachment", att.content, {
        filename: att.filename,
        contentType: att.contentType,
      });
    }
  });

  try {
    const response = await fetch(
      `https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64"),
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    console.log("Mail sent successfully");
  } catch (err) {
    console.error("Email sending error:", err);
  }
};

module.exports = emailNotification;
