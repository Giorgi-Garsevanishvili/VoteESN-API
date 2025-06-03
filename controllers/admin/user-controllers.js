// File to manage user-related operations in the admin section of the VoteESN application.

const { StatusCodes } = require("http-status-codes");
const User = require("../../models/user-model");
const jwt = require("jsonwebtoken");
const {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} = require("../../errors");
const emailNotification = require("../../utils/mailNotification");
const bcrypt = require("bcryptjs");
const cryptoRandomString = require("crypto-random-string").default;


// createUser function creates a new user with a randomly generated password,
// sends a welcome email with a link to set their password, and returns the user data along with a JWT token. section assigned to the user is taken from the authenticated admin section.
const createUser = async (req, res) => {
  const password = cryptoRandomString({
    length: 32,
    type: "alphanumeric",
  });
  if (!password) {
    throw new BadRequestError("Failed To Generate Password");
  }
  const user = new User({ ...req.body, password, section: req.user.section });
  const token = user.createJWT();
  await user.save();

  const tokenCode = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `https://voteesn.qirvex.dev/src/views/reset-password.html?token=${tokenCode}`;

  emailNotification(
    user.email,
    "Welcome to VoteESN – Set Your Password",
    `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
    <h2 style="color: #2c3e50;">🎉 Welcome to VoteESN!</h2>
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>You have been successfully registered by an admin in the <strong>VoteESN Election System</strong>.</p>
    <p>To complete your registration, please set your account password by clicking the button below:</p>
    <p>
      <a href="${resetLink}" style="display: inline-block; background-color: #2c3e50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Set Your Password
      </a>
    </p>
    <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
    <p><a href="${resetLink}" style="color: #2c3e50;">${resetLink}</a></p>
    <p>If you weren’t expecting this registration, you can safely ignore this email.</p>

    <br><br>
    <p style="font-size: 14px; color: #888;">– VoteESN Admin Team</p>
  </div>`
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    user: { userName: user.name, userSection: user.section },
    token,
  });
};

// getUser function retrieves all users in the same section as the authenticated user,
// including those in the "Requested" section or "Demo" section, and returns them in the response.
const getUser = async (req, res) => {
  const user = await User.find({
    section: {
      $in: [req.user.section, `Requested ${req.user.section}`, "Demo"],
    },
  });

  if (!user || user.length === 0) {
    throw new NotFoundError("Currently there is no any user");
  }

  res.status(StatusCodes.OK).json({ user });
};

// updateUser function updates the user details based on the provided user ID,
// hashes the password if it is provided, and sends an email notification about the changes made.
const updateUser = async (req, res) => {
  const { id: userID } = req.params;

  if (req.body.password) {
    req.body.password = String(req.body.password);
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const user = await User.findOneAndUpdate(
    {
      _id: userID,
      section: {
        $in: [req.user.section, `Requested ${req.user.section}`, "Demo"],
      },
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  if (!user || user.length === 0) {
    throw new NotFoundError(
      `Currently there is no any user with id: ${userID} in your section`
    );
  }

  const updatedFields = [];

  const { name, email, role, password } = req.body;

  if (name) {
    updatedFields.push(`Name: ${req.body.name}`);
  }

  if (email) {
    updatedFields.push(`Email: ${req.body.email}`);
  }

  if (role) {
    updatedFields.push(`Role: ${req.body.role}`);
  }

  if (password) {
    updatedFields.push("Password: Please contact Admin if you need it.");
  }

  const changesHtml = updatedFields
    .map((field) => `<li>${field}</li>`)
    .join("");

  emailNotification(
    user.email,
    "Account updated by admin / VoteESN",
    `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fcfcfc; color: #333;">
      <h2 style="color: #2980b9;">✏️ Your Profile Has Been Updated</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>An administrator has made updates to your account. The following fields were changed:</p>
       <ul style="line-height: 1.6;">
        ${changesHtml}
      </ul>
      <p>If you have any questions or did not expect this change, please contact the support team.</p>
      <br>
      <p style="font-size: 14px; color: #999;">– Admin Team</p>
    </div>`
  );

  res.status(StatusCodes.OK).json({ success: true, data: { user } });
};

// deleteUser function deletes a user by their ID, ensuring that only admins can perform this action. 
const deleteUser = async (req, res) => {
  const { id: userID } = req.params;

  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  const user = await User.findOneAndDelete({
    _id: userID,
    section: {
      $in: [req.user.section, `Requested ${req.user.section}`, "Demo"],
    },
  });

  if (!user || user.length === 0) {
    throw new NotFoundError(
      `user with id:${userID} not found in your section!`
    );
  }

  emailNotification(
    user.email,
    "⚠️ Account Deleted",
    `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff8f8; color: #333;">
      <h2 style="color: #c0392b;">⚠️ Account Deleted</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Your account has been removed from the system by an administrator.</p>
      <p>If you believe this was a mistake or have any questions, please contact the admin team.</p>
      <br>
      <p style="font-size: 14px; color: #999;">– Your Admin Team</p>
    </div>`
  );
  res.status(StatusCodes.OK).json({
    success: true,
    msg: `User with id:${user.id}, successfully deleted!`,
  });
};

module.exports = { getUser, updateUser, createUser, deleteUser };
