const express = require("express");
const router = express.Router();
const {getAllElection, getOneElection, submitVote, verifyQrToken} = require('../controllers/voter')

router.route('/voter').get(getAllElection)
router.route('/voter/:id').get(getOneElection).post(submitVote)
router.get('/voter/:id/verify', verifyQrToken)

module.exports = router
