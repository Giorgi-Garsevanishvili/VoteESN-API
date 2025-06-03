// BadRequest Error Module
// This module defines a custom error class for handling bad request errors in an API.

const CustomAPIError = require("./custom-err");
const { StatusCodes } = require("http-status-codes");

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError
