const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const {getAllElection , createElection, updateElection, getOneElection, deleteElection} = require('../controllers/admin/election-controlers.js')
const {getUser, updateUser, createUser, deleteUser} = require('../controllers/admin/user-controllers.js');
const { generateQrCodes, getQRCodes, deleteAccessQR } = require("../controllers/admin/accessqr-controllers.js");

router.route('/election').get(getAllElection).post(createElection)
router.route('/election/:id').get(getOneElection).patch(updateElection).delete(deleteElection)

router.route('/system/users').get(getUser).post(createUser)
router.route('/system/users/:id').patch(updateUser).delete(deleteUser)
router.route('/election/generate-qr/:id').post(generateQrCodes).get(getQRCodes).delete(deleteAccessQR)


module.exports = router