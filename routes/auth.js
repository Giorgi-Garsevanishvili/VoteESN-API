const express = require("express");
const { register, login } = require("../controllers/auth");
const authenticationMiddleware = require("../middlewares/authentication");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const route = express.Router();

route.post("/register", authenticationMiddleware,authorizationMiddleware('admin'),register);
route.post("/login", login);

module.exports = route;
