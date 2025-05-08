const ipRangeCheck = require("ip-range-check");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");
const Settings = require("../models/setting-model");

const fetchSettings = async (req) => {
  const settings = await Settings.find({ section: req.user.section });
  if (settings.length === 0) return null;
  return settings[0];
};

const voterAccessMiddlware = async (req, res, next) => {
  try {
    const settings = await fetchSettings(req); 

    if (!settings){
      return res.status(StatusCodes.BAD_REQUEST).send("Your section is not setted up.")
    }

    if (settings?.ipRestrictionEnabled) {
      const clientIP = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
      const allowed = ipRangeCheck(clientIP, settings.allowedIPs);

      if (!allowed) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send("Access Denied: IP not Allowed.");
      }
    }

    next();
  } catch (error) {
    console.log(error);

    throw new BadRequestError(error);
  }
};

module.exports = voterAccessMiddlware;
