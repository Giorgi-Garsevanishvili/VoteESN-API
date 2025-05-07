const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");
const VoterModel = require("../../models/voter-model");
const voterModel = require("../../models/voter-model");

const getResults = async (req, res) => {
  try {
    const { id: electionId } = req.params;
    const vote = await VoterModel.find({ electionId, section: req.user.section });
    if (vote.length < 1) {
      throw new NotFoundError("Results not found!");
    }
    const result = vote.map((item) => item.answer);

    res.status(StatusCodes.OK).json({ result });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteResults = async (req, res) => {
  const { id: electionId } = req.params;
  const deletedResults = await voterModel.deleteMany({ electionId, section: req.user.section });

  if (!deletedResults) {
    throw new BadRequestError(
      `Result for Election ID: ${electionId} not found! `
    );
  }

  if (deletedResults.deletedCount === 0) {
    throw new BadRequestError("Failed to delete results");
  }
  res.status(StatusCodes.OK).send("Results Successfully deleted!");
};

module.exports = {
  getResults,
  deleteResults,
};
