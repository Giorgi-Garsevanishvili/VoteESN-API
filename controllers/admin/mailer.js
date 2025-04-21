const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const emailNotification = require("../../utils/mailNotification.js");
const voterToken = require("../../models/voterToken.js");
const Election = require("../../models/election-model.js");

const sendCodes = async (req, res) => {
  const { to, token } = req.body;

  if (!to || !token) {
    throw new BadRequestError("All field is required!");
  }

  const tokenCont = await voterToken.findOneAndUpdate(
    { token: token },
    { sent: true },
    { new: true, runValidators: true }
  );

  if (tokenCont) {
    const electionName = await Election.findById(tokenCont.electionId);

    const base64Image = tokenCont.qrCodeImage.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const imgBuffer = Buffer.from(base64Image, "base64");

    let qrName = `QR code for ${electionName.title}`;
    let Content = imgBuffer;
    let subject = "Election Access – Your Voter Token Inside";

    let html = `
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
        <p>You can also scan the QR code below to auto-fill your token:</p>
        <div style="margin: 20px 0;">
          <img src="cid:QRCode" alt="QR Code" style="max-width: 200px; border: 1px solid #ccc; padding: 5px;" />
        </div>
        <p>This token is unique to you and required to cast your vote.</p>
        <p>If you have any issues or did not request this, please contact the election organizer.</p>
        <br>
        <p style="font-size: 14px; color: #888;">Thank you for participating in the election.</p>
        <p style="font-size: 14px; color: #888;">– VoteESN Election System</p>
      </div>
      `;

    let attachment = [
      {
        filename: `${qrName}.png`,
        content: Content,
        cid: "QRCode",
        contentType: "image/png"
      },{
        filename: `${qrName}_downlaod.png`,
        content: Content,
        contentType: "image/png"
      }
    ];

    emailNotification(to, subject, html, attachment);
  } else {
    throw new BadRequestError("Token Wan't found!");
  }
  res.status(StatusCodes.OK).json({ message: "Email is being sent" });
};

module.exports = {
  sendCodes,
};
