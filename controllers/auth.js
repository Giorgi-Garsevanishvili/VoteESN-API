const { BadRequestError, UnauthenticatedError } = require("../errors");
const User = require("../models/user-model.js");
const { StatusCodes } = require("http-status-codes");
const  emailNotification  = require("../utils/mailNotification.js");

const register = async (req, res) => {
  const user = new User({ ...req.body });
  const token = user.createJWT();
  await user.save();
  emailNotification(
    user.email,
    "successfully registered",
    `<h1>Dear ${user.name}, you successfully registered on ESN Riga voting system with email: ${user.email}. In case of any concern please contact ESN Riga</h1>`
  );
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name }, token: token });
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

  const token = user.createJWT();
  const userAgent = req.get("User-Agent");
  const date = new Date();

  emailNotification(
    user.email,
    "Login Alert!",
    `<h3>Dear ${user.name}, <div>New Login From:</div> <div>Client IP: ${req.ip}.</div> <div>OS/Browser: ${userAgent}.</div><div> Date: ${date}</div> </h3>`
  );
  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, role: user.role }, token });
};

module.exports = { register, login };
