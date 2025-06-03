// Description : VoterToken model for the VoteESN application.
// This model defines the structure of a voter's token, including the token string, election ID, QR code image, and metadata like used status and section.

const mongoose = require("mongoose");

// shcema for voter token
// includes token string, election ID, QR code image, used status, sent status, and section
const voterTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    qrCodeImage: { type: String, required: true },
    used: { type: Boolean, default: false },
    sent: { type: Boolean, default: false },
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
  },
  {
    timestamps: { createdAt: "record_time" },
  }
);

module.exports = mongoose.model("VoterToken", voterTokenSchema);
