// Unauthorized access error class 
// This module defines a custom error class for handling unauthorized access errors in an API.
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-err");

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthenticatedError;
