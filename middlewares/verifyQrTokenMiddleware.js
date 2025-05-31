const { BadRequestError } = require("../errors");
const voterToken = require("../models/voterToken");
const Election = require("../models/election-model");

const verifyQrTokenMiddleware = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { id } = req.params;

    if (!token) {
      throw new BadRequestError("Access code is required!");
    }

    if (!id) {
      throw new BadRequestError("Election ID is required!");
    }

    const voterQR = await voterToken.findOne({
      token,
      used: false,
      electionId: id,
      section: req.user.section,
    });

    if (!voterQR) {
      throw new BadRequestError(
        "Token is Invalid for this Election, Expired or Already Used! Please Contact Admin."
      );
    }

    req.voterQR = voterQR;

    const ongoingElection = await Election.findById(id);

    if (ongoingElection.status === "Draft") {
      throw new BadRequestError("Election is not Launched");
    } else if (ongoingElection.status === "Completed") {
      throw new BadRequestError("Election is Completed");
    }

    next();
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = verifyQrTokenMiddleware;
