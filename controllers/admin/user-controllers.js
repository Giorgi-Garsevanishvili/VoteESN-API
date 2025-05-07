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

const createUser = async (req, res) => {
  const user = new User({ ...req.body, section: req.user.section });
  const token = user.createJWT();
  await user.save();
  emailNotification(
    user.email,
    "New User Created / VoteESN",
    `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
      <h2 style="color: #2c3e50;">🎉 Welcome to the System!</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>You’ve been successfully registered by an admin in VoteESN Election system.</p>
      <p>If you didn’t expect this registration, you can ignore this email.</p>
      <br>
      <p style="font-size: 14px; color: #888;">– Your Admin Team</p>
    </div>`
  );
  res
    .status(StatusCodes.CREATED)
    .json({ success: true, user: { userName: user.name, userSection: user.section }, token });
};

const getUser = async (req, res) => {
  const user = await User.find({section: [req.user.section, "Demo"]});
  if (!user) {
    throw new NotFoundError("Currently there is no any user");
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { id: userID } = req.params;

  if (req.body.password) {
    req.body.password = String(req.body.password);
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const user = await User.findOneAndUpdate({ _id: userID, section: req.user.section }, req.body, {
    new: true,
    runValidators: true,
  });

  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  if (!user) {
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

  const changesHtml = updatedFields.map(field => `<li>${field}</li>`).join("")

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

const deleteUser = async (req, res) => {
  const { id: userID } = req.params;

  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  const user = await User.findOneAndDelete({_id: userID, section: [req.user.section, "Demo"] });

  if (!user) {
    throw new NotFoundError(`user with id:${userID} not found in your section!`);
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
