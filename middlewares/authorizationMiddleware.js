const { StatusCodes } = require("http-status-codes");

const authorizationMiddleware = (requiredRole) => (req, res, next) => {
  if (req.user.role !== requiredRole) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: `Forbidden: You do not have access to this resource.` });
  }
  next();
};

module.exports = authorizationMiddleware;
