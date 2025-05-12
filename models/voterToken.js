const mongoose = require("mongoose");

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
        values: ["Latvia", "Riga", "Jelgava", "Valmiera", "Global", "Demo"],
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
