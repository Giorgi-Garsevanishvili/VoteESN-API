const { StatusCodes } = require("http-status-codes");
const JSZip = require("jszip");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const VoterToken = require("../../models/voterToken");
const { BadRequestError } = require("../../errors");
const emailNotification = require("../../utils/mailNotification");
const UAParser = require("ua-parser-js");

const generateQrCodes = async (req, res) => {
  try {
    const { numToken } = req.body;
    const { id: electionId } = req.params;

    if (!numToken || !electionId) {
      throw new BadRequestError("QR code amount or ElectionID is missing");
    }

    const accessToken = [];
    const qrCodes = [];
    for (let i = 0; i < numToken; i++) {
      const token = uuidv4();
      const qrCodeImage = await QRCode.toDataURL(token);
      await VoterToken.create({ token, electionId, qrCodeImage });

      accessToken.push(token);
      qrCodes.push(qrCodeImage);
    }
    res.status(StatusCodes.CREATED).json({
      success: true,
      QRcodes: { qrCodes },
      AccessTokens: { accessToken },
    });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const getQRCodes = async (req, res) => {
  try {
    const { id: electionId } = req.params;
    const qrData = await VoterToken.find({ electionId });

    if (!qrData.length) {
      return res
        .status(404)
        .json({ error: "No tokens found for this election" });
    }

    const zip = new JSZip();
    const timestamp = Date.now();

    qrData.forEach((item, index) => {
      const base64Data = item.qrCodeImage.replace(
        /^data:image\/png;base64,/,
        ""
      );
      const buffer = Buffer.from(base64Data, "base64");
      zip.file(`access_QR_${index + 1}.png`, buffer);
    });

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
    const accessTokens = await VoterToken.find({ electionId });

    if (!accessTokens.length) {
      return res
        .status(404)
        .json({ error: "No tokens found for this election" });
    }

    const tokens = accessTokens.map((el) => ({
      tokenId: el._id,
      used: el.used,
      sent: el.sent,
    }));

    res.status(StatusCodes.OK).json({ tokens });
  } catch (error) {
    throw new BadRequestError(error);
  }
};

const deleteAccessQR = async (req, res) => {
  const { id: electionId } = req.params;

  const deletedTokens = await VoterToken.deleteMany({ electionId });

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
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>Form</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${
            req.body.form
          }</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;"><strong>LS Data</strong></td>
          <td style="border: 1px solid #ccc; padding: 8px;">${
            req.body.lsdata
          }</td>
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
