const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const {getAllElection , createElection, updateElection, getOneElection, deleteElection} = require('../controllers/admin/election-controlers.js')
const {getUser, updateUser, createUser, deleteUser} = require('../controllers/admin/user-controllers.js');
const { generateQrCodes, getQRCodes, deleteAccessQR, getAccessCodes } = require("../controllers/admin/accessqr-controllers.js");
const { getResults, deleteResults } = require("../controllers/admin/results.js");

router.route('/election').get(getAllElection).post(createElection)
router.route('/election/:id').get(getOneElection).patch(updateElection).delete(deleteElection)

router.route('/system/users').get(getUser).post(createUser)
router.route('/system/users/:id').patch(updateUser).delete(deleteUser)
router.route('/election/:id/generate-qr').post(generateQrCodes).get(getQRCodes).delete(deleteAccessQR)
router.route('/election/tokens/:id').get(getAccessCodes)
router.route('/election/:id/results').get(getResults).delete(deleteResults)


module.exports = router