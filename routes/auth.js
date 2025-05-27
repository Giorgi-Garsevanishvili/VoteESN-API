const express = require("express");
const { register, login, resetPasswordRequest, resetPassword } = require("../controllers/auth");
const route = express.Router();

route.post("/register",register);
route.post("/login", login);
route.post("/reset-password-request", resetPasswordRequest)
route.post("/reset-password", resetPassword)

module.exports = route;
