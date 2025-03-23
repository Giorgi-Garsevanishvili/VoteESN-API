const {StatusCodes} = require('http-status-codes')
const JSZip = require('jszip')
const QRCode = require('qrcode')
const { v4: uuidv4 } = require("uuid");
const VoterToken = require('../../models/voterToken')

const generateQrCodes = async (req, res) => {
  try {
    const { numToken } = req.body;
    const { id: electionId } = req.params;

    if (!numToken || !electionId) {
      throw new BadRequestError("QR code amount or ElectionID is missing");
    }

    const qrCodes = [];
    for (let i = 0; i < numToken; i++) {
      const token = uuidv4();
      const qrCodeImage = await QRCode.toDataURL(token);
      await VoterToken.create({ token, electionId, qrCodeImage });

      qrCodes.push(qrCodeImage);
    }
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, QRcodes: { qrCodes } });
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

    res.status(200).send(zipBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate QR codes" });
  }
};

const deleteAccessQR = async( req, res) => {
  res.send('delete QR access')
}

module.exports = {
  getQRCodes,
  generateQrCodes,
  deleteAccessQR
}