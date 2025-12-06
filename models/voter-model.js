// Description : Voter model for the VoteESN application.
// defines the structure of a voter's response to an election, including the election ID, answers, and section.

const mongoose = require("mongoose");

// This schema defines the structure of a voter's response to an election.
// It includes the election ID, answers to questions, record time stamp, and the section in which the voter is participating.
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
          "Requested Demo",
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
