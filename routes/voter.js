// Route for voter-related operations

const express = require("express");
const router = express.Router();
const {getAllElection, getOneElection, submitVote, validateToken,} = require('../controllers/voter/election');
const verifyQrTokenMiddleware = require("../middlewares/verifyQrTokenMiddleware");
const { getAccountInfo, updateAccount, deleteAccount } = require("../controllers/voter/user");

// route for getting all elections
router.route('/voter').get(getAllElection)

// protected routes for getting one election, submitting a vote.
router.route('/voter/:id').get(verifyQrTokenMiddleware,getOneElection).post(verifyQrTokenMiddleware,submitVote)

// route for validating token
router.route('/tokenvalidation').post(validateToken)

// route for getting account info, updating account, and deleting account
router.route('/account').get(getAccountInfo).patch(updateAccount).delete(deleteAccount)

module.exports = router
