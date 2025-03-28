const { StatusCodes } = require("http-status-codes");
const User = require("../../models/user-model");
const jwt = require("jsonwebtoken");
const {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} = require("../../errors");
const emailNotification = require("../../utils/mailNotification");

const createUser = async (req, res) => {
  const user = new User({ ...req.body });
  const token = user.createJWT();
  await user.save();
  emailNotification(
    user.email,
    "New User Created / VoteESN",
    `<h3>New user created by admin of VoteESN for you email: ${user.email}</h3>`
  );
  res
    .status(StatusCodes.CREATED)
    .json({ success: true, user: { userName: user.name }, token });
};

const getUser = async (req, res) => {
  const user = await User.find();
  if (!user) {
    throw new NotFoundError("Currently there is no any user");
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { id: userID } = req.params;
  const user = await User.findOneAndUpdate({ _id: userID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  if (!user) {
    throw new NotFoundError(
      `Currently there is no any user with id: ${userID}`
    );
  }

  emailNotification(
    user.email,
    "Account updated by admin / VoteESN",
    `<h3>Admin update your account</h3>`
  );

  res.status(StatusCodes.OK).json({ success: true, data: { user } });
};

const deleteUser = async (req, res) => {
  const { id: userID } = req.params;
  
  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  const user = await User.findByIdAndDelete(userID);
  
  if(!user){
    throw new NotFoundError(`user with id:${userID} not found!`)
  }

  emailNotification(
    user.email,
    "Account deleted!",
    "<h3>Admin of VoteESN deleted your account, if you think it`s wrong please contact admin</h3>"
  );
  res.status(StatusCodes.OK).json({
    success: true,
    msg: `User with id:${user.id}, successfully deleted!`,
  });
};

module.exports = { getUser, updateUser, createUser, deleteUser };
