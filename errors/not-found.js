// Not Found Error Module
// This module defines a custom error class for handling not found errors in an API.

const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-err");

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;
