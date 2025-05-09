const { StatusCodes } = require("http-status-codes");
const JSZip = require("jszip");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const VoterToken = require("../../models/voterToken");
const { BadRequestError } = require("../../errors");
const emailNotification = require("../../utils/mailNotification");
const UAParser = require("ua-parser-js");
const Election = require("../../models/election-model.js")

const parseUserAgent = (uaString) => {
  const parser = new UAParser();
  parser.setUA(uaString);
  const result = parser.getResult();

  return {
    os: `${result.os.name} ${result.os.version}`,
    browser: `${result.browser.name} ${result.browser.version}`,
  };
};

const generateQrCodes = async (req, res) => {
  try {
    const { numToken } = req.body;
    const { id: electionId } = req.params;
    const { section } = req.user;
    if (!numToken || !electionId) {
      throw new BadRequestError("QR code amount or ElectionID is missing");
    }

    const draftElection = await Election.findOne({_id:electionId, status: "Draft"})

    if(!draftElection){
      throw new BadRequestError("To Generate Tokens Election Status Must Be Draft")
    }

    const accessToken = [];
    const qrCodes = [];
    for (let i = 0; i < numToken; i++) {
      const token = uuidv4();
      const qrCodeImage = await QRCode.toDataURL(token);
      await VoterToken.create({ token, electionId, qrCodeImage, section });

      accessToken.push(token);
      qrCodes.push(qrCodeImage);
    }
    res.status(StatusCodes.CREATED).json({
      success: true,
      QRcodes: { qrCodes },
      AccessTokens: { accessToken },
      Section: section,
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const getQRCodes = async (req, res) => {
  try {
    const { id: electionId } = req.params;
    const qrData = await VoterToken.find({ electionId, section: req.user.section });

    if (!qrData.length) {
      return res
        .status(404)
        .json({ error: "No tokens found for this election in your section" });
    }

    const zip = new JSZip();
    const timestamp = Date.now();

    for (const [index, item] of qrData.entries()) {
      const tokenID = item._id;
      const updatedToken = await VoterToken.findOneAndUpdate(
        { _id: tokenID },
        { sent: true },
        { new: true, runValidators: true }
      );

      const base64Data = item.qrCodeImage.replace(
        /^data:image\/png;base64,/,
        ""
      );
      const buffer = Buffer.from(base64Data, "base64");
      zip.file(`access_QR_${index + 1}.png`, buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=qrcodes_${timestamp}.zip`
    );

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.status(200).send(zipBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate QR codes" });
  }
};

const getAccessCodes = async (req, res) => {
  try {
    const { id: electionId } = req.params;
    const accessTokens = await VoterToken.find({ electionId, section: req.user.section });

    if (!accessTokens.length) {
      return res
        .status(404)
        .json({ error: "No tokens found for this election in your section" });
    }

    const tokens = accessTokens.map((el) => ({
      tokenId: el._id,
      used: el.used,
      sent: el.sent,
      section: req.user.section
    }));

    res.status(StatusCodes.OK).json({ tokens });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteAccessQR = async (req, res) => {
  const { id: electionId } = req.params;

  const deletedTokens = await VoterToken.deleteMany({ electionId, section: req.user.section });

  if (deletedTokens.deletedCount === 0) {
    throw new BadRequestError("Failed to delete tokens");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    msg: `Access QR Codes for Election with id: ${electionId}, succcessfully deleted`,
  });
};

const revealToken = async (req, res) => {
  try {
    const { tokenId, form, lsdata } = req.body;

    if (!tokenId || !form || !lsdata) {
      throw new BadRequestError(
        "All the required information must be provided."
      );
    }

    const token = await VoterToken.findById(tokenId).exec();

    if (!token) {
      return res
        .status(StatusCodes.OK)
        .json({ message: "No token to display" });
    }

    const clientIP = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    const userAgent = req.get("User-Agent");
    const { os, browser } = parseUserAgent(userAgent);

    const timestamp = new Date().toISOString();
    const to = ["support-vote@esn.lv", "webmaster-riga@esn.lv"];
    const subject = "⚠️ Voter Token Reveal Detected! ⚠️";
    const attachment = [
      {
        filename: "Qirvex-logo.png",
        path: "./Qirvex-Branding-Kit/Qirvex-stamp.png",
        cid: "qirvexlogo",
      },
    ];

    function renderObjectAsRows(obj) {
      return Object.entries(obj)
        .map(
          ([key, value]) => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><strong>${key}</strong></td>
              <td style="border: 1px solid #ccc; padding: 8px;">${
                value ?? "N/A"
              }</td>
            </tr>
          `
        )
        .join("");
    }

    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:qirvexlogo" alt="Qirvex Logo" style="height: 50px;" />
        <h1 style="color: #34495e; margin-top: 10px;">voteESN Security Alert</h1>
      </div>

      <h2 style="color: #d9534f;">⚠️ Voter Token Reveal Detected! ⚠️</h2>
      <p><strong>A voter token was accessed with the following details:</strong></p>
      
      <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>Token</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${token.token}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>Token Status</strong></td>
          <td style="border: 1px solid #ccc; color: white; padding: 8px; background-color: ${
            token.used === true ? "#e74c3c" : "#27ae60"
          }; ">${token.used === true ? "Invalid" : "Valid"}</td>
        </tr>
       <tr>
        <td style="border: 1px solid #ccc; padding: 8px;"><strong>Form</strong></td>
        <td style="border: 1px solid #ccc; padding: 8px;">
          <table style="border-collapse: collapse; width: 100%;">
            ${renderObjectAsRows(form)}
          </table>
        </td>
      </tr>

      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;"><strong>LS Data</strong></td>
        <td style="border: 1px solid #ccc; padding: 8px;">
          <table style="border-collapse: collapse; width: 100%;">
            ${renderObjectAsRows(lsdata)}
          </table>
        </td>
      </tr>

        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>Timestamp</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${timestamp}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>IP Address</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${clientIP}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>OS</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${os}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>Browser</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${browser}</td>
        </tr>
      </table>

      <p style="margin-top: 20px;">Please verify if this action was authorized. If unexpected, consider investigating immediately.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

      <footer style="text-align: center; font-size: 12px; color: #888;">
        <p>This message was generated by the Qirvex™ Voting System.</p>
        <p>© ${new Date().getFullYear()} Qirvex™. All rights reserved.</p>
      </footer>
    </div>
`;

    emailNotification(to, subject, html, attachment);

    if (token.used === true) {
      throw new BadRequestError("Vote Already Recorded. Reveal Restricted!");
    }

    res.status(StatusCodes.OK).json({ token: token.token });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

module.exports = {
  getQRCodes,
  getAccessCodes,
  generateQrCodes,
  deleteAccessQR,
  revealToken,
};
