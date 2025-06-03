// Description : Election model for the VoteESN application.
// This model defines the structure of an election, including its title, topics, options, and metadata like status and section.

const mongoose = require("mongoose");

// Define the schema for options within a topic
// This schema includes the text of the option and the number of votes it has received.
const OptionsSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

// Define the schema for topics within an election
// Each topic has a title and an array of options.
const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: [OptionsSchema],
});

// Define the main schema for an election
// This schema includes the election title, topics, creator, updater, section, and status.
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
        values: ["Draft", "Ongoing", "Completed"],
        message: "Status can be Draft, Ongoing or Completed ",
      },
      default: "Draft",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Pre-save hook to ensure that the election update is allowed based on its current status.
ElectionSchema.pre("findOneAndUpdate", async function (next) {
  const query = this.getQuery();
  const docToUpdate = await this.model.findOne(query);
  const update = this.getUpdate();

  if (!docToUpdate) {
    return next();
  }

  const currentStatus = docToUpdate.status;

  if (currentStatus === "Completed") {
    const err = new Error(`${docToUpdate.status} elections cannot be updated.`);
    err.status = 400;
    return next(err);
  }

  if (currentStatus === "Ongoing") {
    const allowedUpdateFields = ["status", "updatedBy", "$set", "$setOnInsert"];
    const updateKeys = Object.keys(update);
    const onlyAllowedKeys = updateKeys.every((key) =>
      allowedUpdateFields.includes(key)
    );

    const statusIsCompleted =
      update.status === "Completed" || update.$set?.status === "Completed";

    if (!(onlyAllowedKeys && statusIsCompleted)) {
      const err = new Error(
        "Ongoing elections can only be updated to 'Completed' along with metadata fields."
      );
      err.status = 400;
      return next(err);
    }
  }

  next();
});

module.exports = mongoose.model("Election", ElectionSchema);
