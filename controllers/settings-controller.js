// Description : File contains the controller functions for managing settings in the VoteESN application, like IP restrictions. 

const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const Settings = require("../models/setting-model");


// Function to retrieve settings from the database for the user's section
const getSettingsFromDB = async (req, res) => {
  try {
    const settings = await Settings.find({section: req.user.section});
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

// Function to create new settings in the database for the user's section
const createSettings = async (req, res) => {
  try {
    const settingsData = { ...req.body, section: req.user.section };

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

// Function to update existing settings in the database for the user's section
const updateSettings = async (req, res) => {
  try {
    const { id: settingID } = req.params;
    const update = { ...req.body };

    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to update Elections");
    }

    if (!update || Object.keys(update).length === 0) {
      throw new BadRequestError("Settings data required and cannot be empty!");
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: settingID, section: req.user.section },
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

// Function to delete settings from the database for the user's section
const deleteSettings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return UnauthenticatedError("Only admin is able to delete Elections");
    }
    const { id: settingsID } = req.params;
    const deleteted = await Settings.findOneAndDelete({ _id: settingsID, section: req.user.section });

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
