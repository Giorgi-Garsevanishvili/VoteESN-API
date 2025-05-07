const { UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      name: payload.name,
      userID: payload.userID,
      role: payload.role,
      section: payload.section
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthenticatedError("Token has expired");
    }
    throw new UnauthenticatedError("Not Authorized to acces this route");
  }
};

module.exports = authenticationMiddleware;
