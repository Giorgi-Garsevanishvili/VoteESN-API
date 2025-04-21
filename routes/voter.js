const express = require("express");
const router = express.Router();
const {getAllElection, getOneElection, submitVote, validateToken,} = require('../controllers/voter');
const verifyQrTokenMiddleware = require("../middlewares/verifyQrTokenMiddleware");

router.route('/voter').get(getAllElection)
router.route('/voter/:id').get(verifyQrTokenMiddleware,getOneElection).post(verifyQrTokenMiddleware,submitVote)
router.route('/tokenvalidation').post(validateToken)

module.exports = router
