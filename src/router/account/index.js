const express = require("express");
const AccountValidation = require("../../validations/AccountValidation");
const ValidationMiddleware = require("../../middleware/ValidationMiddleware");
const AuthMiddleware = require("../../middleware/AuthMiddleware");
const AccountController = require("../../controller/AccountController");
const AccountMiddleware = require("../../middleware/AccountMiddleware");
const router = express.Router();

// create account for logged in user
router
  .route("/create")
  .post(AccountValidation.create, AuthMiddleware, ValidationMiddleware, AccountController.createAccount);
  
// register account for any one from scratch
router
  .route("/registration")
  .post(AccountValidation.register, AuthMiddleware, ValidationMiddleware, AccountController.registerAccount);
  
  //create virtual account
  router
    .route("/create-virtual-account")
    .post(AccountValidation.virtualAccount, AuthMiddleware, ValidationMiddleware, AccountController.createVirtualAccount);

  router
  .route("/change-pin")
  .post(AccountValidation.changePin, AuthMiddleware, ValidationMiddleware, AccountMiddleware, AccountController.changePin)

  router
  .route("/single-transfer")
  .post(AccountValidation.singleTransfer, AuthMiddleware, ValidationMiddleware, AccountMiddleware, AccountController.singleTransfer)

  router
  .route("/bulk-transfer")
  .post(AccountValidation.bulkTransfer, AuthMiddleware, ValidationMiddleware, AccountMiddleware, AccountController.bulkTransfer)

  router
  .route("/create-digital-card")
  .post(AccountValidation.createDigitalCard, AuthMiddleware, ValidationMiddleware, AccountMiddleware, AccountController.createDigitalCard)

  router
  .route("/create-digital-card")
  .post(AccountValidation.createDigitalCard, AuthMiddleware, ValidationMiddleware, AccountMiddleware, AccountController.createDigitalCard)











module.exports = router;