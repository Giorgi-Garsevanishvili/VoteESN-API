const mongoose = require("mongoose");

const ipv4Regex =
  /^(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4][0-9]|1\d\d|[1-9]?\d)$/;

const SettingsSchema = new mongoose.Schema({
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
