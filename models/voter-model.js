const mongoose = require("mongoose");

const VoterSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    answer: [
      {
        question: { type: String, required: true },
        selectedOption: { type: String, required: true },
      },
    ],
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
        ],
        message: "{value} Doesn`t exist or Is not Available",
      },
      default: "Demo",
    },
  },
  {
    timestamps: { createdAt: "record_time", updatedAt: "update_time" },
  }
);

module.exports = mongoose.model("VoterModel", VoterSchema);
