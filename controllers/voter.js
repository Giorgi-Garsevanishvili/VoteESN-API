const { StatusCodes } = require("http-status-codes");

const getAllElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "all elections" });
};

const getOneElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "get one election" });
};

const submitVote = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "vote" });
};

const verifyQrToken = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "verify QR code" });
};

module.exports = {
  getAllElection,
  getOneElection,
  submitVote,
  verifyQrToken,
};
