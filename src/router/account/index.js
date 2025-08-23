const express = require("express");
const AccountValidation = require("../../validations/AccountValidation");
const ValidationMiddleware = require("../../middleware/ValidationMiddleware");
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const AccountController = require("../../controller/AccountController");
const router = express.Router();

// create account for logged in user
router
  .route("/create")
  .post(AccountValidation.create, AuthMiddleware, ValidationMiddleware, AccountController.createAccount);
  
// register account for any one from scratch
router
  .route("/registration")
  .post(AccountValidation.register, AuthMiddleware, ValidationMiddleware, AccountController.registerAccount);
  

  router
  .route("/change-pin")
  .post(AccountValidation.changePin, AuthMiddleware, ValidationMiddleware, AccountController.changePin)

  router
  .route("/single-transfer")
  .post(AccountValidation.singleTransfer, AuthMiddleware, ValidationMiddleware, AccountController.singleTransfer)












module.exports = router;