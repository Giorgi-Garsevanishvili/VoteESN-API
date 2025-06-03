// Routes for user authentication
const express = require("express");
const { register, login, resetPasswordRequest, resetPassword } = require("../controllers/auth");
const route = express.Router();

// These routes handle user registration, login, and password reset requests.

// Route for user registration and login
route.post("/register",register);
route.post("/login", login);

// Routes for password reset requests
route.post("/reset-password-request", resetPasswordRequest)

// Route for resetting the password using the token sent to the user's email
route.post("/reset-password", resetPassword)

module.exports = route;
