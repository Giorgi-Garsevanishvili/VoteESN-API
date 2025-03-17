require("dotenv").config();
require("express-async-errors");

const connectDB = require("./db/connect");

const express = require("express");
const app = express();

const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const ratelimitter = require("express-rate-limit");
const { StatusCodes } = require("http-status-codes");

app.set("trust proxy", 1);
app.use(
  ratelimitter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Allow 500 requests per 15 minutes
    message: "Too many requests, please try again later.",
    standardHeaders: true, // Return `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  })
);

app.use(express.json());
app.use(cors());
app.use(xss());
app.use(helmet());

const date = new Date();

app.get("/", (req, res) => {
  res.status(StatusCodes.OK).json({status: 'works', date: date })
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`server is listening on port:${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
