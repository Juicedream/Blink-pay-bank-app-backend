const { body } = require("express-validator")

class AuthValidation {
   static loginUser = [
        body("email").notEmpty().withMessage("Email is required").toLowerCase(),
        body("password").notEmpty().withMessage("Password is required"),
    ]
   static registerUser = [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").notEmpty().withMessage("Email is required"),
        body("password").notEmpty().withMessage("Password is required"),
        body("acc_type").notEmpty().withMessage("Account Type is required").isIn(["savings", "current"]).withMessage("Accout should be savings or current account"),
    ]
}

module.exports = AuthValidation