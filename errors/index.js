const BadRequestError = require("./bad-request");
const UnauthenticatedError = require("./not-authorized");
const NotFoundError = require("./not-found");
const CustomAPIError = require("./custom-err")

module.exports= {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
  CustomAPIError
}