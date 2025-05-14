const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const User = require("../../models/user-model");
const emailNotification = require("../../utils/mailNotification.js");

const getAccountInfo = async (req, res) => {
  try {
    const { userID } = req.user;

    if (!userID) {
      throw new BadRequestError("Please log in again!");
    }

    const user = await User.findOne({ _id: userID }).select("-password");

    if (!user) {
      throw new BadRequestError(`user with id:${userID} not found!`);
    }

    res.status(StatusCodes.OK).json({ user: user });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const updateAccount = async (req, res) => {
  try {
    const { userID } = req.user;
    if (!userID) {
      throw new BadRequestError("Please log in again!");
    }

    if (req.body.password) {
      req.body.password = String(req.body.password);
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findOneAndUpdate({ _id: userID }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new BadRequestError(`user with id:${userID} not found!`);
    }

    emailNotification(
      user.email,
      "Account updated / VoteESN",
      `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fcfcfc; color: #333;">
          <h2 style="color: #2980b9;">✏️ Your Profile Has Been Updated</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>You successfully update your account.</p>
          <p>If it was not you please secure your account and contact system administrator.</p>
          <br>
          <p style="font-size: 14px; color: #999;">– Admin Team</p>
        </div>`
    );

    res.status(StatusCodes.OK).json({ success: true, updated: true });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { userID } = req.user;

    const user = await User.findOneAndDelete({ _id: userID });

    if (!user) {
      throw new NotFoundError(`user with id:${userID} not found!`);
    }

    emailNotification(
      user.email,
      "⚠️ Account Deleted",
      `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff8f8; color: #333;">
      <h2 style="color: #c0392b;">⚠️ Account Deleted</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Your account has been removed from the system</p>
      <p>If you believe this was a mistake or have any questions, please contact the admin team.</p>
      <br>
      <p style="font-size: 14px; color: #999;">– Your Admin Team</p>
    </div>`
    );

    res.status(StatusCodes.OK).json({
      success: true,
      msg: `User with id:${userID}, successfully deleted!`,
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = {
  deleteAccount,
  updateAccount,
  getAccountInfo,
};
