const express = require("express");
const router = express.Router();
const {getAllElection , createElection, updateElection, getOneElection, deleteElection, generateQrCodes} = require('../controllers/admin')

router.route('/election').get(getAllElection).post(createElection)
router.route('/election/:id').get(getOneElection).patch(updateElection).delete(deleteElection)
router.post('/election/:id/generate-qr', generateQrCodes)

module.exports = router