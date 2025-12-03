// Description: Controller to send voter token codes via email

const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const emailNotification = require("../../utils/mailNotification.js");
const voterToken = require("../../models/voterToken.js");
const Election = require("../../models/election-model.js");

// Sends voter token codes via email to the specified recipient
const sendCodes = async (req, res) => {
  const { to, tokenId } = req.body;

  if (!to || !tokenId) {
    throw new BadRequestError("All fields are required!");
  }

  const tokenCont = await voterToken.findOneAndUpdate(
    { _id: tokenId, section: req.user.section },
    { sent: true },
    { new: true, runValidators: true }
  );

  if (!tokenCont) {
    throw new BadRequestError("Token wasn't found!");
  }

  const electionName = await Election.findOne({
    _id: tokenCont.electionId,
    section: req.user.section,
  });

  // Prepare QR code as base64 string for inline display
  const base64Image = tokenCont.qrCodeImage.replace(
    /^data:image\/\w+;base64,/,
    ""
  );
  const imgBuffer = Buffer.from(base64Image, "base64"); 

  const subject = "Election Access – Your Voter Token Inside";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
      <h2 style="color: #2c3e50;">🗳️ Voting Access Token ${
        electionName ? "for " + electionName.title : ""
      }</h2>
      <p>Dear Voter,</p>
      <p>To participate in the ${
        electionName ? electionName.title : "Upcoming Election"
      }, please use the following access token:</p>
      <div style="margin: 20px 0; font-size: 22px; font-weight: bold; background-color: #ffffff; border: 1px solid #ccc; padding: 12px 20px; display: inline-block;">
        ${tokenCont.token}
      </div>
      <p>You can also scan the QR code attached below to auto-fill your token</p>
      <p>This token is unique to you and required to cast your vote.</p>
      <p>If you have any issues or did not request this, please contact the election organizer.</p>
      <br>
      <p style="font-size: 14px; color: #888;">Thank you for participating in the election.</p>
      <p style="font-size: 14px; color: #888;">– VoteESN Election System</p>
    </div>
  `;

  const attachments = [
    {
      filename: `QRCode_${electionName.title}.png`,
      content: imgBuffer,
      contentType: "image/png",
      cid: "QRCodeCID", // this must match the HTML reference
    },
  ];

  await emailNotification(to, subject, html, attachments);

  res.status(StatusCodes.OK).json({ message: "Email is being sent" });
};

module.exports = {
  sendCodes,
};
