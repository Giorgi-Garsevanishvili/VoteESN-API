// Description : This file contains the controllers for managing elections in an admin section of an application.
const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const {getAllElection , createElection, updateElection, getOneElection, deleteElection} = require('../controllers/admin/election-controlers.js')
const {getUser, updateUser, createUser, deleteUser} = require('../controllers/admin/user-controllers.js');
const { generateQrCodes, getQRCodes, deleteAccessQR, getAccessCodes, revealToken } = require("../controllers/admin/accessqr-controllers.js");
const { getResults, deleteResults } = require("../controllers/admin/results.js");
const { getSettingsFromDB, createSettings, updateSettings,deleteSettings } = require("../controllers/settings-controller.js");
const { sendCodes } = require("../controllers/admin/mailer.js");


// route for managing elections
router.route('/election').get(getAllElection).post(createElection)
router.route('/election/:id').get(getOneElection).patch(updateElection).delete(deleteElection)

// route for managing users
router.route('/system/users').get(getUser).post(createUser)
router.route('/system/users/:id').patch(updateUser).delete(deleteUser)

// route for managing access QR codes and tokens
router.route('/election/:id/generate-qr').post(generateQrCodes).get(getQRCodes).delete(deleteAccessQR)
router.route('/election/tokens/:id').get(getAccessCodes)
router.route('/election/email').post(sendCodes)

// route for revealing tokens
router.route('/election/revealToken').post(revealToken)

// route for managing results
router.route('/election/:id/results').get(getResults).delete(deleteResults)

// route for managing settings
router.route('/voter/settings').get(getSettingsFromDB).post(createSettings)
router.route('/voter/settings/:id').patch(updateSettings).delete(deleteSettings)


module.exports = router