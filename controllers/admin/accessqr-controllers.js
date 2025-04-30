const { StatusCodes } = require("http-status-codes");
const JSZip = require("jszip");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const VoterToken = require("../../models/voterToken");
const { BadRequestError } = require("../../errors");

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
      sent: el.sent
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

module.exports = {
  getQRCodes,
  getAccessCodes,
  generateQrCodes,
  deleteAccessQR,
};
