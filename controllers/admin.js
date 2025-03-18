const { StatusCodes } = require("http-status-codes");

const createElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "create election / admin" });
};
const getAllElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "get all election / admin" });
};

const getOneElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "get one election / admin" });
};

const updateElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "update election / admin" });
};

const deleteElection = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "delete election / admin" });
};

const generateQrCodes =async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "generate QR / admin" });
}

module.exports = {
  generateQrCodes,
  getAllElection,
  getOneElection,
  createElection,
  updateElection,
  deleteElection
}
