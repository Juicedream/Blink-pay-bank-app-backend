const express = require("express");
const AuthController = require("../../controller/AuthController");
const AuthValidation = require("../../validations/AuthValidation");
const ValidationMiddleware = require("../../middleware/ValidationMiddleware");
const AuthMiddleware = require("../../middleware/AuthMiddleware");

const router = express.Router();


router
.route("/login").post(
  AuthValidation.loginUser,
  ValidationMiddleware,
  AuthController.loginUser);
router
.route("/passwordless-login").post(
  AuthValidation.passwordlessLogin,
  ValidationMiddleware,
  AuthController.passwordlessLogin);
router
  .route("/verify-otp")
  .post(
    AuthValidation.verfiyOtp,
    ValidationMiddleware,
    AuthController.verfiyOtp
  );

router
  .route("/register")
  .post(
    AuthValidation.registerUser,
    ValidationMiddleware,
    AuthController.registerUser
  );
router
  .route("/profile")
  .get(
    AuthMiddleware,
    AuthController.profileUser
  );



module.exports = router;