const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        "Requseted Demo",
      ],
      message: "{value} Doesn`t exist or Is not Available",
    },
    default: "Demo",
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.email = this.email.toLowerCase();
});

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

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
