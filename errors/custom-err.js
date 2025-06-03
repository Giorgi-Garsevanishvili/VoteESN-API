// Custom error class for API errors
// It extends the built-in Error class and can be used to create custom error messages.

class CustomAPIError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = CustomAPIError;
