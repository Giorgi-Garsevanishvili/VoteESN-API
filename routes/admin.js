const express = require("express");
const router = express.Router();
const {getAllElection , createElection, updateElection, getOneElection, deleteElection, generateQrCodes, getUser, updateUser} = require('../controllers/admin')

router.route('/election').get(getAllElection).post(createElection)
router.route('/election/:id').get(getOneElection).patch(updateElection).delete(deleteElection)
router.post('/election/:id/generate-qr', generateQrCodes)
router.route('/system/users',getUser)
router.patch('/system/users/:id',updateUser)

module.exports = router