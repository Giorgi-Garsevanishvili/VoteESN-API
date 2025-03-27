const mongoose = require("mongoose");

const VoterSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  answer: [
    {
      question: { type: String, required: true },
      selectedOption: {type:String, required: true}
    },
  ],
  usedQRCode: {type:String, required:true, unique:true}
});

module.exports = mongoose.model("VoterModel", VoterSchema)
