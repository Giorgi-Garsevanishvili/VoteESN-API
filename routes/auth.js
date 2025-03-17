const express = require("express");
const route = express.Router();

route.post("/register");
route.post("/login");

module.exports = route;
