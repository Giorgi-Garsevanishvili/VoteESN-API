const BadRequestError = require("../errors/bad-request.js");
const User = require("../models/user.js");
const { StatusCodes } = require("http-status-codes");

const register = async (req, res) => {
  const user = new User({ ...req.body });
  const token = user.createJWT();
  await user.save();
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name }, token: token });
};

const login = async (req, res, next) => {
  const normalisedEmail = req.body.email.toLowerCase();
  const { password } = req.body;

  if (!normalisedEmail || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Provide Credintials" });
  }

  const user = await User.findOne({ email: normalisedEmail });
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "No user" });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Incorrect Password" });
  }

  const token = user.createJWT();
  res
    .status(StatusCodes.OK)
    .json({ user: { name: user.name, role: user.role }, token });
};

module.exports = { register, login };
