const { StatusCodes } = require("http-status-codes");
const Election = require("../models/election-model");
const User = require('../models/user-model')
const {
  UnauthenticatedError,
  BadRequestError,
  NotFoundError,
} = require("../errors");
const notFound = require("../middlewares/not-found");

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
    res.status(StatusCodes.OK).json({ success: true, data: election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const updateElection = async (req, res) => {
  try {
    const { id: electionID } = req.params;

    let election = await Election.findOne({ _id: electionID });
    console.log(election);

    if (!election) {
      return NotFoundError("No Election founded");
    }

    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to update Elections");
    }

    election = await Election.findOneAndUpdate(
      {
        _id: electionID,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(StatusCodes.OK).json({ election });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteElection = async (req, res) => {
  const { id: electionID } = req.params;
  const election = await Election.findByIdAndDelete(electionID);

  if (req.user.role !== "admin") {
    return UnauthenticatedError("Only admin is able to update Elections");
  }

  if (!election) {
    throw new BadRequestError(`No election found by ID: ${electionID}`);
  }

  res
    .status(StatusCodes.OK)
    .json({
      success: true,
      msg: `Election By ID:${electionID}, successfully deleted!`,
    });
};

const generateQrCodes = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "generate QR / admin" });
};

const getUser = async (req, res) => {
  const user = await User.find()
  if(!user){
    throw new NotFoundError('Currently there is no any user')
  }

  res.status(StatusCodes.OK).json({user})
}

const updateUser = async (req,res)=> {
  const {id: userID} = req.params
  const user = await User.findOneAndUpdate({_id: userID},req.body,{
    new: true,
    runValidators: true,
  })
  if(!user){
    throw new NotFoundError('Currently there is no any user')
  }

  res.status(StatusCodes.OK).json({success: true, data: {user}})
}

module.exports = {
  generateQrCodes,
  getAllElection,
  getOneElection,
  createElection,
  updateElection,
  deleteElection,
  updateUser,
  getUser
};
