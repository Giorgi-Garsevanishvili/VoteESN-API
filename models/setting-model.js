// Description : Settings model for the VoteESN application.
// This model defines the structure of settings, including section, IP restrictions, and allowed IPs.

const mongoose = require("mongoose");

const ipv4Regex =
  /^(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)$/;

  // Define the schema for settings 
  // This schema includes the section, IP restrictions, and allowed IPs.
  // The section can be one of several predefined values, and allowedIPs must be an array of valid IPv4 addresses.
  // The ipRestrictionEnabled field indicates whether IP restrictions are enabled.
const SettingsSchema = new mongoose.Schema({
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
  ipRestrictionEnabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  allowedIPs: {
    type: [String],
    required: true,
    default: [],
    validate: {
      validator: function (value) {
        return (
          Array.isArray(value) &&
          value.every((ip) => typeof ip === "string" && ipv4Regex.test(ip))
        );
      },
      message: "allowedIPs must be an array of valid IP address strings",
    },
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
