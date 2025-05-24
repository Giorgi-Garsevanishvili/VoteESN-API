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
    status: {
      type: String,
      enum: {
        values: ["Draft", "Ongoing", "Completed", "Archive"],
        message: "Status can be Draft, Ongoing, Completed or Archive",
      },
      default: "Draft",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

ElectionSchema.pre("findOneAndUpdate", async function (next) {
  const query = this.getQuery();
  const docToUpdate = await this.model.findOne(query);

  if (!docToUpdate) {
    return next();
  }

  if (
    docToUpdate.status === "Archive" ||
    docToUpdate.status === "Ongoing" ||
    docToUpdate.status === "Completed"
  ) {
    const err = new Error(`${docToUpdate.status} elections cannot be updated.`);
    err.status = 400;
    return next(err);
  }

  next();
});

module.exports = mongoose.model("Election", ElectionSchema);
