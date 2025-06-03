// voteESN Application Entry Point
// Description: Initializes the Express app, connects to MongoDB, configures middlewares, routes, error handling, and Swagger documentation.

require("dotenv").config(); // Load environment variables
require("express-async-errors"); // Handle async errors in Express

// Core modules
const express = require("express");
const app = express();

// Database connection
const connectDB = require("./db/connect");

// Route files
const authRoute = require("./routes/auth");
const voterRoute = require("./routes/voter");
const adminRoute = require("./routes/admin");

// Middleware
const notFoundMiddleware = require("./middlewares/not-found");
const ErrorHandlerMiddleware = require("./middlewares/error-handler");
const authenticationMiddleware = require("./middlewares/authentication");
const authorization = require('./middlewares/authorizationMiddleware');
const voterAccessMiddlware = require("./middlewares/voterAccessMiddleware");

// Security and utility middlewares
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const ratelimitter = require("express-rate-limit");
const { StatusCodes } = require("http-status-codes");

// Swagger documentation setup
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Rate limiting configuration
app.set("trust proxy", 1); // Trust first proxy (for production setups like Heroku)
app.use(
  ratelimitter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parser and security middlewares
app.use(express.json());       // Parses incoming JSON requests
app.use(cors());               // Enables CORS
app.use(xss());                // Prevents XSS attacks
app.use(helmet());             // Sets secure HTTP headers

// Redirect root to API docs
app.get("/", (req, res) => {
  res.redirect('/api-docs');
});

// Route registration
app.use("/api/v1/auth", authRoute);
app.use(
  "/api/v1/user",
  authenticationMiddleware,
  authorization('voter'),
  voterAccessMiddlware,
  voterRoute
);
app.use(
  "/api/v1/admin",
  authenticationMiddleware,
  authorization('admin'),
  adminRoute
);

// Swagger route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Error handling middlewares
app.use(notFoundMiddleware);
app.use(ErrorHandlerMiddleware);

// Start server
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port: ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
