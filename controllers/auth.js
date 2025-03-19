const BadRequestError = require("../errors/bad-request.js");
const User = require("../models/user.js");
const { StatusCodes } = require("http-status-codes");
const nodemailer = require("nodemailer");

const emailNotification = (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_CODE,
    },
  });

  transporter
    .sendMail({
      to: to,
      subject: subject,
      html: html,
    })
    .then(() => {
      console.log("mail sent");
    })
    .catch((err) => {
      console.error(err);
    });
};

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
