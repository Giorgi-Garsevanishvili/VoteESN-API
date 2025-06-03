// Description : File to manage elections in the voter section of the VoteESN application.

const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const Election = require("../../models/election-model");
const voterToken = require("../../models/voterToken");
const VoterModel = require("../../models/voter-model");
const { default: mongoose } = require("mongoose");
const User = require("../../models/user-model");

// getAllElection function retrieves all elections for the user's section and returns them in the response.
const getAllElection = async (req, res) => {
  try {
    const allElections = await Election.find({ section: req.user.section });
    res.status(StatusCodes.OK).json({
      success: true,
      nbHits: allElections.length,
      data: { allElections },
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

// getOneElection function retrieves a specific election by its ID in the user's section and returns it in the response.
const getOneElection = async (req, res) => {
  try {
    const { id: electionID } = req.params;
    const election = await Election.findOne({
      _id: electionID,
      section: req.user.section,
    });
    res.status(StatusCodes.OK).json({ success: true, data: election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

// submitVote function allows a voter to submit their vote for a specific election.
// It creates a new vote record and marks the used QR code as used.
const submitVote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: electionId } = req.params;
    const usedQRCode = req.voterQR.token;
    const answer = req.body;
    const vote = await VoterModel.create(
      [{ electionId, answer, section: req.user.section }],
      {
        session,
      }
    );

    await voterToken.findOneAndUpdate(
      { token: usedQRCode, section: req.user.section },
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

// validateToken function checks if the provided token is valid and not used,
// and returns the election ID and section if valid.
const validateToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new BadRequestError("Token must be presented!");
  }
  
  const candidateToken = await voterToken.findOne({
    token,
    used: false,
    section: req.user.section,
  });

  if (!candidateToken) {
    throw new BadRequestError("Invalid Token");
  }

  const validatedToken = {
    token : candidateToken.token,
    electionId : candidateToken.electionId,
    section : candidateToken.section
  }

  const ongoingElection = await Election.findOne({_id: validatedToken.electionId})

  if (ongoingElection.status === "Draft") {
    throw new BadRequestError("Election is not Launched");
  } else if (ongoingElection.status === "Completed") {
    throw new BadRequestError("Election is Completed");
  }

  res.status(StatusCodes.OK).json({ data: validatedToken });
};

module.exports = {
  getAllElection,
  getOneElection,
  submitVote,
  validateToken,
};
