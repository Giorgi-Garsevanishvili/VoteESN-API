const mongoose = require("mongoose");

const voterTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    qrCodeImage: {type:String, required:true},
    used: { type: Boolean, default: false },
});

module.exports = mongoose.model("VoterToken", voterTokenSchema);
