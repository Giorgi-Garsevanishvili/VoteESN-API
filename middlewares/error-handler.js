const { StatusCodes } = require("http-status-codes");

const customErrorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong please try again later!",
  };

  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((itme) => itme.message)
      .join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Dublicate value entered in ${Object.keys(
      err.keyValue
    )} field, please try another!`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  return res.status(customError.statusCode).json({ message: customError.msg });
};

module.exports = customErrorHandler;
