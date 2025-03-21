const express = require("express");
const router = express.Router();
const {getAllElection , createElection, updateElection, getOneElection, deleteElection, generateQrCodes} = require('../controllers/admin/election-controlers.js')
const {getUser, updateUser, createUser, deleteUser} = require('../controllers/admin/user-controllers.js')

router.route('/election').get(getAllElection).post(createElection)
router.route('/election/:id').get(getOneElection).patch(updateElection).delete(deleteElection)

router.post('/election/:id/generate-qr', generateQrCodes)

router.route('/system/users').get(getUser).post(createUser)
router.route('/system/users/:id').patch(updateUser).delete(deleteUser)

module.exports = router