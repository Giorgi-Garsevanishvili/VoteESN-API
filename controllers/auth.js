const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/user-model.js");
const { StatusCodes } = require("http-status-codes");
const emailNotification = require("../utils/mailNotification.js");
const UAParser = require("ua-parser-js");

const parseUserAgent = (uaString) => {
  const parser = new UAParser();
  parser.setUA(uaString);
  const result = parser.getResult();

  return {
    os: `${result.os.name} ${result.os.version}`,
    browser: `${result.browser.name} ${result.browser.version}`,
  };
};

const register = async (req, res) => {
  const user = new User({ ...req.body, section: "Demo" });
  const token = user.createJWT();
  await user.save();
  emailNotification(
    user.email,
    "successfully registered",
    `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Registration Successful</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
        <div style="max-width: 600px; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: auto;">
          <h1 style="color: #333;">Dear ${user.name},</h1>
          <p style="font-size: 16px; color: #555;">
            You have successfully registered on the <strong>VoteESN</strong> platform with the email: <strong>${user.email}</strong>.
          </p>
          <p style="font-size: 16px; color: #555;">
            Your current section is: <strong>${user.section}</strong>.
          </p>
          <p style="font-size: 16px; color: #555;">
            Please ask your section admin to add you to the local section.
          </p>
          <p style="font-size: 16px; color: #555;">
            In case of any concerns, feel free to contact <strong>Qirvex™</strong>.
          </p>
          <p style="margin-top: 30px; font-size: 14px; color: #999;">Thank you for being part of the ESN community!</p>
        </div>
      </body>
      </html>
      `
  );
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name, section: user.section }, token: token });
};

const login = async (req, res, next) => {
  const normalisedEmail = req.body.email.toLowerCase();
  const { password } = req.body;

  if (!normalisedEmail || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email: normalisedEmail });
  if (!user) {
    throw new BadRequestError("No user found!");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Wrong Password!");
  }

  await User.findByIdAndUpdate(user.id, { lastLogin: new Date() });

  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  const token = user.createJWT();
  const userAgent = req.get("User-Agent");
  const { os, browser } = parseUserAgent(userAgent);
  const date = new Date();

  emailNotification(
    user.email,
    "Login Alert!",
    `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f4f8; color: #333;">
      <h2 style="color: #2d3e50;">🔐 Login Alert!</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>We detected a login to your account with the following details:</p>
      <ul style="line-height: 1.6;">
        <li><strong>IP Address:</strong> ${clientIP}</li>
        <li><strong>Operating System:</strong> ${os}</li>
        <li><strong>Browser:</strong> ${browser}</li>
        <li><strong>Date & Time:</strong> ${date}</li>
      </ul>
      <p>If this was you, you can safely ignore this email. If not, please secure your account immediately.</p>
      <br>
      <p style="font-size: 14px; color: #777;">– Security Team</p>
    </div>`
  );
  res.status(StatusCodes.OK).json({
    user: { name: user.name, role: user.role, lastLogin: user.lastLogin, section: user.section },
    token,
  });
};

module.exports = { register, login };
