const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const emailNotification = require("../../utils/mailNotification.js");

const sendCodes = async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    throw new BadRequestError("All field is required!");
  }

  emailNotification(to, subject, html);

  res.status(StatusCodes.OK).json({ message: "Email is being sent" });
};

module.exports = {
  sendCodes,
};
