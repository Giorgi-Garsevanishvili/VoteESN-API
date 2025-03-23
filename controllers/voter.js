const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");
const Election = require("../models/election-model");
const voterToken = require("../models/voterToken");

const getAllElection = async (req, res) => {
  try {
    const allElections = await Election.find({});
    res.status(StatusCodes.OK).json({
      success: true,
      nbHits: allElections.length,
      data: { allElections },
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const getOneElection = async (req, res) => {
  try {
    const { id: electionID } = req.params;
    const election = await Election.findOne({ _id: electionID });
    res.status(StatusCodes.OK).json({ success: true, data: election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const submitVote = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "vote" });
};

const verifyQrToken = async (req, res) => {
  try {
    const { token } = req.query;
    const voterQR = await voterToken.findOne({ token, used: false });

    if (!voterQR) {
      throw new BadRequestError(
        "No Voter Founded or Acces code is already used."
      );
    }

    const updateToken = voterQR.token.toString();

    await markTokenAsUsed(updateToken);

    res
      .status(StatusCodes.OK)
      .json({
        success: true,
        electionId: voterQR.electionId,
        status: voterQR.used,
      });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const markTokenAsUsed = async (token) => {
  await voterToken.findOneAndUpdate(
    { token },
    { used: true },
    { new: true, runValidators: true }
  );
};

module.exports = {
  markTokenAsUsed,
  getAllElection,
  getOneElection,
  submitVote,
  verifyQrToken,
};
