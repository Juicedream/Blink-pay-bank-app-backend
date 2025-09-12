const { body } = require("express-validator")

class AuthValidation {
  static loginUser = [
    body("email").notEmpty().withMessage("Email is required").toLowerCase(),
    body("password").notEmpty().withMessage("Password is required"),
  ];
  static passwordlessLogin = [
    body("email").notEmpty().withMessage("Email is required").toLowerCase(),
  ];
  static verfiyOtp = [
    body("email").notEmpty().withMessage("Email is required").toLowerCase(),
    body("otp").notEmpty().withMessage("Otp is required").custom((value) => {
        const regex = /^\d{6}$/;
        if (!regex.test(value)) {
          throw new Error("Otp must be a 6 digit number");
        }
        return true;
    },)
  ];
  static registerUser = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("acc_type")
      .notEmpty()
      .withMessage("Account Type is required")
      .isIn(["savings", "current"])
      .withMessage("Accout should be savings or current account"),
  ];
}

module.exports = AuthValidation