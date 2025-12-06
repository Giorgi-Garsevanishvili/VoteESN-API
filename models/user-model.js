// Description : User model for managing elections in the VoteESN application.
// Defines the structure of a user, including their name, email, password, role, section, and methods for authentication and JWT creation.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { required } = require("joi");

// This schema defines the structure of a user in the VoteESN application.
// It includes fields for name, email, password, role, section, last login time, and password change timestamp.
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide Name"],
    minlength: [3, "Name must be minimum 3 symbols"],
    maxlength: [30, "Name must be maximum 30 symbols"],
  },
  email: {
    type: String,
    required: [true, "Please Provide Email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please Provide Correct email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Provide Password"],
    minlength: [8, "Password must be minimum 8 symbols"],
  },
  role: {
    type: String,
    required: [true, "Role is not set"],
    enum: {
      values: ["admin", "voter"],
      message: "{value} is not correct, available roles are: admin, voter",
    },
    default: "voter",
  },
  section: {
    type: String,
    required: true,
    enum: {
      values: [
        "Latvia",
        "Riga",
        "Jelgava",
        "Valmiera",
        "Global",
        "Demo",
        "Requested Latvia",
        "Requested Riga",
        "Requested Jelgava",
        "Requested Valmiera",
        "Requested Global",
        "Requested Demo",
      ],
      message: "{value} Doesn`t exist or Is not Available",
    },
    default: "Demo",
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  consentAccepted: {
    type: Boolean,
    default: null,
  },
  consentTimeStamp: {
    type: Date,
    default: null,
  },
  termsVersion: {
    type: String,
    default: null,
  },
  consentLog: [
    {
      accepted: { type: Boolean, required: true },
      timestamp: { type: Date, default: Date.now },
      version: { type: String, required: true },
    },
  ],
  passwordchangedAt: Date,
});

// Pre-save hook to hash the password before saving the user document.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.email = this.email.toLowerCase();
  next();
});

// Method to create a JWT token for the user.
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userID: this._id,
      name: this.name,
      role: this.role,
      section: this.section,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

// Check if the password is correct by comparing the candidate password with the hashed password stored in the database.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
