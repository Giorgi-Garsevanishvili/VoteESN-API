require("dotenv").config();
require("express-async-errors");

const authRoute = require("./routes/auth");
const voterRoute = require("./routes/voter");
const adminRoute = require("./routes/admin");

const connectDB = require("./db/connect");
const notFoundMiddleware = require("./middlewares/not-found");

const express = require("express");
const app = express();

const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const ratelimitter = require("express-rate-limit");
const { StatusCodes } = require("http-status-codes");
const ErrorHandlerMiddleware = require("./middlewares/error-handler");
const authenticationMiddleware = require("./middlewares/authentication");
const authorization = require('./middlewares/authorizationMiddleware')
const voterAccessMiddlware = require("./middlewares/voterAccessMiddleware");

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

//extra backages 
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml')

app.get("/", (req, res) => {
  res.redirect('/api-docs')
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", authenticationMiddleware,authorization('voter'),voterAccessMiddlware, voterRoute);
app.use("/api/v1/admin", authenticationMiddleware,authorization('admin'), adminRoute);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.use(notFoundMiddleware);
app.use(ErrorHandlerMiddleware);

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
