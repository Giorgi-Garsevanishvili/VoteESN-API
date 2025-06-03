const { StatusCodes } = require("http-status-codes");

// not found middleware
// This middleware handles requests to routes that do not exist, returning a 404 status code.
const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send("Route doesn't exist");
};

module.exports = notFound
