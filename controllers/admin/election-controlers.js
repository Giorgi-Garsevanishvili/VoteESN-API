const { StatusCodes } = require("http-status-codes");
const Election = require("../../models/election-model");
const {
  UnauthenticatedError,
  BadRequestError,
  NotFoundError,
} = require("../../errors");

const createElection = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      throw new UnauthenticatedError("Only admin can make a election");
    }

    const election = await Election.create({
      ...req.body,
      createdBy: req.user.userID,
    });
    res.status(StatusCodes.CREATED).json({ election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

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
    if(!election){
      throw new NotFoundError(`Election with id:${electionID} not found!`)
    }
    res.status(StatusCodes.OK).json({ success: true, data: election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const updateElection = async (req, res) => {
  try {
    const { id: electionID } = req.params;

    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to update Elections");
    }

    const election = await Election.findOneAndUpdate(
      {
        _id: electionID,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if(!election){
      throw new NotFoundError(`Election with id:${electionID} not found!`)
    }
    res.status(StatusCodes.OK).json({ election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteElection = async (req, res) => {
  try {
    const { id: electionID } = req.params;
    const election = await Election.findByIdAndDelete(electionID);

    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to update Elections");
    }

    if (!election) {
      throw new BadRequestError(`No election found by ID: ${electionID}`);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      msg: `Election By ID:${electionID}, successfully deleted!`,
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = {
  getAllElection,
  getOneElection,
  createElection,
  updateElection,
  deleteElection,
};
