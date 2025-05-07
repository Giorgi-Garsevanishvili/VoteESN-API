const mongoose = require("mongoose");

const OptionsSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: [OptionsSchema],
});

const ElectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topics: [TopicSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
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
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Election", ElectionSchema);
