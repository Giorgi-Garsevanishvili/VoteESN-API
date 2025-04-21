const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");
const Election = require("../models/election-model");
const voterToken = require("../models/voterToken");
const VoterModel = require("../models/voter-model");
const { default: mongoose } = require("mongoose");

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: electionId } = req.params;
    const usedQRCode = req.voterQR.token;
    const answer = req.body;
    const vote = await VoterModel.create([{ electionId, answer, usedQRCode }], {
      session,
    });

    await voterToken.findOneAndUpdate(
      { token: usedQRCode },
      { used: true },
      { new: true, runValidators: true }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({ success: true, data: vote });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new BadRequestError(error);
  }
};

const validateToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new BadRequestError("Token must be presented!");
  }

  const candidateToken = await voterToken.find({ token, used: false });

  if (!candidateToken.length) {
    throw new BadRequestError("Invalid Token");
  }

  const validatedToken = candidateToken.map((el) => ({
    token: el.token,
    electionId: el.electionId
  }));

  res.status(StatusCodes.OK).json({ data: validatedToken });
};

module.exports = {
  getAllElection,
  getOneElection,
  submitVote,
  validateToken,
};
