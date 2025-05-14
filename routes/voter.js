const express = require("express");
const router = express.Router();
const {getAllElection, getOneElection, submitVote, validateToken,} = require('../controllers/voter/election');
const verifyQrTokenMiddleware = require("../middlewares/verifyQrTokenMiddleware");
const { getAccountInfo, updateAccount, deleteAccount } = require("../controllers/voter/user");

router.route('/voter').get(getAllElection)
router.route('/voter/:id').get(verifyQrTokenMiddleware,getOneElection).post(verifyQrTokenMiddleware,submitVote)
router.route('/tokenvalidation').post(validateToken)
router.route('/account').get(getAccountInfo)
router.route('/account/:id').patch(updateAccount).delete(deleteAccount)

module.exports = router
