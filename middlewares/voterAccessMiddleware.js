const ipRangeCheck = require("ip-range-check");
const { getSettingsFromDB } = require("../controllers/settings-controller");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");
const Settings = require("../models/setting-model");

const fetchSettings = async () => {
  const settings = await Settings.find({});
  if (settings.length === 0) return null;
  return settings[0];
};

const voterAccessMiddlware = async (req, res, next) => {
  try {
    const settings = await fetchSettings();

    if (settings) {
      if (settings.ipRestrictionEnabled) {
        const clientIP = req.ip;
        const allowed = ipRangeCheck(clientIP, settings.allowedIPs);

        if (!allowed) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .send("Access Denied: IP not Allowd.");
        }
      }
    }

    next();
  } catch (error) {
    console.log(error);

    throw new BadRequestError(error);
  }
};

module.exports = voterAccessMiddlware;
