const express = require("express");
const { register, login } = require("../controllers/auth");
const redirectByRole = require("../middlewares/redirect-role");
const route = express.Router();

route.post("/register", register);
route.post("/login", login, redirectByRole);

module.exports = route;
