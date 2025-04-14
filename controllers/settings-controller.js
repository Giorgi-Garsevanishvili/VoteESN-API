const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const Settings = require("../models/setting-model");

const getSettingsFromDB = async (req, res) => {
  try {
    const settings = await Settings.find({});
    if (settings.length < 1) {
      return res
        .status(StatusCodes.OK)
        .json({ message: "No settings to display!" });
    }
    res.status(StatusCodes.OK).json({ settings });
  } catch (error) {
    console.log(error);
  }
};

const createSettings = async (req, res) => {
  try {
    const settingsData = req.body;

    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to create Elections");
    }

    if (!settingsData || Object.keys(settingsData).length === 0) {
      return res
        .status(400)
        .json({ error: "Settings data required and cannot be empty!" });
    }

    const settings = await Settings.create(settingsData);

    res.status(StatusCodes.CREATED).json({ settings });
  } catch (error) {
    res.status(400).json({ error: error.message || "Invalid settings data" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { id: settingID } = req.params;
    const update = req.body;

    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to update Elections");
    }

    if (!update || Object.keys(update).length === 0) {
      throw new BadRequestError("Settings data required and cannot be empty!");
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: settingID },
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSettings) {
      throw new NotFoundError(
        `Currently there is no any settings with id: ${settingID}`
      );
    }

    res.status(StatusCodes.OK).json({ updatedSettings });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteSettings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to delete Elections");
    }
    const { id: settingsID } = req.params;
    const deleteted = await Settings.findOneAndDelete({ _id: settingsID });

    if (!deleteted) {
      throw new NotFoundError(
        `Currently there is no any settings with id: ${settingsID}`
      );
    }

    res.status(StatusCodes.OK).json({
      message: `settings with id: ${settingsID}, successfully deleted!`,
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = {
  getSettingsFromDB,
  createSettings,
  updateSettings,
  deleteSettings,
};
