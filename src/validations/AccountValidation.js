const { body } = require("express-validator");


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
    body("receiver_acc_number")
      .notEmpty()
      .withMessage("Receiver's Account Number is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
    body("narration").notEmpty().withMessage("Narration is required"),
    body("sender_pin").notEmpty().withMessage("Sender's Pin is required"),
  ];
  static bulkTransfer = [
    // body("sender_acc_number").notEmpty().withMessage("Sender's Account Number is required"),
    body("receiver_acc_numbers")
      .isArray()
      .withMessage(
        "Receiver account numbers must be an array of account numbers"
      )
      .custom((value) => {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error("At least two reciever account numbers are required");
        }
        value.map((acc_num) => {
          if (isNaN(acc_num)) {
            throw new Error(
              "Reciever account numbers must only contain numbers"
            );
          }
          if (acc_num.length < 10 || acc_num.length > 10) {
            throw new Error(
              "Reciever account numbers must have 10 digits each"
            );
          }
        });

        if (new Set(value).size !== value.length) {
          throw new Error("Duplicate account numbers");
        }

        return true;
      }),
    body("amount").notEmpty().withMessage("Amount is required"),
    body("narration").notEmpty().withMessage("Narration is required"),
    body("sender_pin").notEmpty().withMessage("Sender's Pin is required"),
  ];

  static virtualAccount = [
    body("amount").notEmpty().withMessage("Amount is required")
  ];

  static createDigitalCard = [
    body("card_name").notEmpty().withMessage("Card Name is required"),
    body("card_type").notEmpty().withMessage("Card type is required").custom((value) => {
      const types = ['platinum', 'women', 'regular', 'vintage']
      if(!types.includes(value)){
        throw new Error(`Card type must be one of these: ${types.join(",")}.`)
      }
      return true
    })
  ]
}

module.exports = AccountValidation;
