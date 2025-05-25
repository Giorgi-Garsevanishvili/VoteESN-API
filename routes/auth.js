const express = require("express");
const { register, login, resetPasswordRequest } = require("../controllers/auth");
const route = express.Router();

route.post("/register",register);
route.post("/login", login);
route.post("/reset-password-request", resetPasswordRequest)

module.exports = route;
