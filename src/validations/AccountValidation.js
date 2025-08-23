const {body} = require("express-validator")

class AccountValidation {
  static create = [
    body("address").notEmpty().withMessage("Address is required"),
    body("birth_date").notEmpty().withMessage("Birth Date is required"),
    body("bvn").notEmpty().withMessage("bvn is required"),
    body("docs_upload").notEmpty().withMessage("Document Upload is required"),
  ];
  static register = [

    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("acc_type").notEmpty().withMessage("Account Type is required"),
    body("birth_date").notEmpty().withMessage("Birth Date is required"),
    body("bvn").notEmpty().withMessage("bvn is required"),
    body("docs_upload").notEmpty().withMessage("Document Upload is required"),
  ];
  static changePin = [
    body("current_pin").notEmpty().withMessage("Current Pin is required"),
    body("new_pin").notEmpty().withMessage("New Pin is required"),
];
static singleTransfer = [
    // body("sender_acc_number").notEmpty().withMessage("Sender's Account Number is required"),
    body("receiver_acc_number").notEmpty().withMessage("Receiver's Account Number is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
    body("narration").notEmpty().withMessage("Narration is required"),
    body("sender_pin").notEmpty().withMessage("Sender's Pin is required"),
  ]
}

module.exports = AccountValidation