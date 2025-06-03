// Description : File to handle various custom errors in the VoteESN application.
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