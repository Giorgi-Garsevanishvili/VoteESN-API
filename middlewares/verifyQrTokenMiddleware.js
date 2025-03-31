const { BadRequestError } = require("../errors");
const voterToken = require("../models/voterToken");

const verifyQrTokenMiddleware = async (req, res, next) => {
  try {
    const { token } = req.query;

    if(!token){
      throw new BadRequestError("Access code is required!")
    }

    const voterQR = await voterToken.findOne({ token, used: false });

    if (!voterQR) {
      throw new BadRequestError(
        "No Voter Founded or Acces code is already used."
      );
    }

    req.voterQR = voterQR
    
    next();  
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = verifyQrTokenMiddleware