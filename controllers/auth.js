// Description : File manages user authentication and account management in the VoteESN application.

const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/user-model.js");
const { StatusCodes } = require("http-status-codes");
const emailNotification = require("../utils/mailNotification.js");
const UAParser = require("ua-parser-js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// Function to parse user agent string and extract OS and browser information
const parseUserAgent = (uaString) => {
  const parser = new UAParser();
  parser.setUA(uaString);
  const result = parser.getResult();

  return {
    os: `${result.os.name} ${result.os.version}`,
    browser: `${result.browser.name} ${result.browser.version}`,
  };
};

// Function to register a new user. publicly accessible, puts the user in the "Demo" section by default.
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

// Function to log in a user. It checks the provided email and password, updates the last login time,
const login = async (req, res) => {
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
    user: {
      name: user.name,
      role: user.role,
      lastLogin: user.lastLogin,
      section: user.section,
      id: user.id,
    },
    token,
  });
};

// Function to handle password reset requests. It generates a JWT token and sends a reset link to the user's email.
const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("Email is required");
  }

  try {
    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      throw new BadRequestError("User with entered email dosn`t exist");
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `https://voteesn.qirvex.dev/src/views/reset-password.html?token=${token}`;

    emailNotification(
      user.email,
      "voteESN - Reset Your Password ",
      `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f4f8; color: #333;">
        <h2 style="color: #2d3e50;">🔒 Password Reset Request</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>We received a request to reset the password for your account.</p>
        <p>Click the button below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; background-color: #2d3e50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p>If the button doesn't work, copy and paste the link below into your browser:</p>
        <p><a href="${resetLink}" style="color: #2d3e50;">${resetLink}</a></p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br>
        <p style="font-size: 14px; color: #777;">– Security Team</p>
      </div>
      `
    );

    res.status(StatusCodes.OK).send("Link sent");
  } catch (error) {
    throw new BadRequestError(error);
  }
};

// Function to reset the user's password using a token. It verifies the token, checks if the password has been changed after the token was issued, and updates the password.
const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;

  if (!password) {
    throw new BadRequestError("Password in missing!");
  }

  if (!token) {
    throw new BadRequestError("Token Is not Provided!");
  }

  const isPasswordChangedAfter = (user, tokenIat) => {
    if (!user.passwordchangedAt) return false;

    const changeTimeStamp = parseInt(
      user.passwordchangedAt.getTime() / 1000,
      10
    );
    return changeTimeStamp > tokenIat;
  };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userPayload = {
      id: payload.userId,
    };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findById(userPayload.id);

    if (!user) {
      throw new BadRequestError("User Not Found");
    }

    if (isPasswordChangedAfter(user, payload.iat)) {
      throw new UnauthenticatedError(
        "Token is no longer valid. Password was changed."
      );
    }

    await User.findByIdAndUpdate(
      userPayload.id,
      { password: hashedPassword, passwordchangedAt: new Date() },
      {
        new: true,
        runValidators: true,
      }
    );

    emailNotification(
      user.email,
      "Your VoteESN Password Has Been Set",
      `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
        <h2 style="color: #2c3e50;">✅ Password Set Successfully</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your password has been successfully set for your VoteESN account.</p>
        <p>If you did not perform this action, please contact your admin immediately.</p>
        <br>
        <p style="font-size: 14px; color: #888;">– VoteESN Security Team</p>
      </div>`
    );

    res.status(StatusCodes.OK).send("Password Updated");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthenticatedError("Token has expired");
    }
    throw new BadRequestError(error);
  }
};

module.exports = { register, login, resetPasswordRequest, resetPassword };
