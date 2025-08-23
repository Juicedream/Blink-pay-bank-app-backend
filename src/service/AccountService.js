const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const { getAge, generateAccountNumber } = require("../utils/function");
const ALLOWED_EMAILS = ["judexfrayo@gmail.com", "techygarage@gmail.com"];
const MAIN_BANK_ACCOUNT = 5015203826;
const LEAST_AMOUNT = 1000;
const TRANSFER_TAX = 25.00;


class AccountService {
  static async createAccount(body, user) {
    const { _id, name, email, acc_type } = user;
    const { address, birth_date, bvn, docs_upload } = body;

    const check_exist = await AccountModel.findOne({ email });
    if (check_exist) {
      throw new ApiError(400, "Account already Exists");
    }
    let age = getAge(birth_date);
    let acc_number = generateAccountNumber(acc_type);
    // create account
    const newAccount = await AccountModel.create({
      name,
      email,
      acc_type,
      is_onboarded: true,
      address,
      age,
      birth_date,
      bvn,
      docs_upload,
      userId: _id,
      acc_number,
      created_by: name,
    });

    return {
      msg: acc_type + " account created successfully",
      account: newAccount,
    };

    // return {user}
  }
  static async registerAccount(body, user) {
    const { name: creator_name, email: creator_email } = user;
    const { name, email, acc_type, address, birth_date, bvn, docs_upload } =
      body;

    if (!ALLOWED_EMAILS.includes(creator_email)) {
      throw new ApiError(401, "You are not authorized to register an account");
    }
    const check_exist = await AccountModel.findOne({ email });
    if (check_exist) {
      throw new ApiError(400, "Account already Exists");
    }
    //registering new user
    let age = getAge(birth_date);
    let acc_number = generateAccountNumber(acc_type);
    let year = new Date().getFullYear();

    // create account and user account
    const userAccount = await UserModel.create({
      name,
      email,
      acc_type,
      password: `newAccount${year}`,
    });
    const newAccount = await AccountModel.create({
      name,
      email,
      acc_type,
      is_onboarded: true,
      address,
      age,
      birth_date,
      bvn,
      docs_upload,
      userId: userAccount._id,
      acc_number,
      created_by: creator_name,
    });

    return {
      msg: acc_type + " account registered successfully",
      account: newAccount,
      user: userAccount,
    };

    // return {user}
  }
  static async singleTransfer(body, user) {
    let { receiver_acc_number, sender_pin, amount, narration } = body;
    const { _id, name, email } = user;

    amount += TRANSFER_TAX;
    console.log({ amount });

    //retreive sender account number
    console.log("retreiving sender account details from logged in user");
    const senderAccount = await AccountModel.findOne({ userId: _id });
    //retreive reciver account number
    console.log("retreiving receiver account details");
    const receiverAccount = await AccountModel.findOne({
      acc_number: receiver_acc_number,
    });

    if (senderAccount.acc_number === receiver_acc_number) {
      console.error("Receiver account cannot be your own account");
      throw new ApiError(401, "Receiver account cannot be your own account");
    }

    console.log("checking if receiver account number exist");
    if (!receiverAccount) {
      console.error("Receiver Account does not exist");
      throw new ApiError(404, "Receiver Account does not exist");
    }
    //check senders pin
    console.log("Cheking senders pin");
    if (sender_pin !== senderAccount.pin) {
      console.error("Invalid Pin Provided");
      throw new ApiError(400, "Invalid Pin Provided");
    }

    //checking transaction limit
    console.log("Checking Transaction limit");
    if (amount > senderAccount.transfer_limit) {
      console.error(
        `Amount cannot be greater than ₦${senderAccount.transfer_limit.toLocaleString()}`
      );
      throw new ApiError(
        400,
        `Amount cannot be greater than ₦${senderAccount.transfer_limit.toLocaleString()}`
      );
    }

    console.log("Checking if the sender can send amount to receiver");

    if (senderAccount.acc_balance < LEAST_AMOUNT) {
      console.error(`Insufficient Funds`);
      throw new ApiError(400, `Insufficient Funds`);
    }
    if (amount < LEAST_AMOUNT) {
      console.error(
        `Amount cannot be lesser than ₦${LEAST_AMOUNT.toLocaleString()}`
      );
      throw new ApiError(
        400,
        `Amount cannot be lesser than ₦${LEAST_AMOUNT.toLocaleString()}`
      );
    }

    let amount_left = senderAccount.acc_balance - amount;
    if (amount_left < LEAST_AMOUNT) {
      console.error(
        `₦${LEAST_AMOUNT.toLocaleString()} must be left in the account`
      );
      throw new ApiError(
        400,
        `₦${LEAST_AMOUNT.toLocaleString()} must be left in the account`
      );
    }

    //actually send
    const main_bank = await AccountModel.findOne({
      acc_number: MAIN_BANK_ACCOUNT,
    });
    let sender_balance_before = senderAccount.acc_balance;
    let receiver_balance_before = receiverAccount.acc_balance;
    let main_bank_balance_before = main_bank.acc_balance;

    main_bank.acc_balance += TRANSFER_TAX;
    senderAccount.acc_balance -= amount;
    let actual_amount =    amount - TRANSFER_TAX;
    receiverAccount.acc_balance += actual_amount;

    let sender_balance_after= senderAccount.acc_balance;
    let receiver_balance_after= receiverAccount.acc_balance;
    let main_bank_balance_after= main_bank.acc_balance;

    
    //add to transaction
    
    const mainBankTransaction = await TransactionModel.create({
        account_id: main_bank._id,
        tran_type: "credit",
        amount: TRANSFER_TAX,
        currency: "NGN",
        status: "successful",
      narration: `Transfer tax for ${name}`,
      balance_before: main_bank_balance_before,
      balance_after: main_bank_balance_after,
      channel: "web",
      meta_data:{
        recipient_bank: "Blinkpay Bank",
        recipient_acc_num: receiver_acc_number,
        deviceInfo:{
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
        }
      }
    });
    const senderTransaction = await TransactionModel.create({
      account_id: senderAccount._id,
      tran_type: "debit",
      amount,
      currency: "NGN",
      status: "successful",
      narration,
      balance_before: sender_balance_before,
      balance_after: sender_balance_after,
      channel: "web",
      meta_data:{
        recipient_bank: "Blinkpay Bank",
        recipient_acc_num: receiver_acc_number,
        deviceInfo:{
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
        }
      }
    });
    const recieverTransaction = await TransactionModel.create({
      account_id: receiverAccount._id,
      tran_type: "credit",
      amount: actual_amount,
      currency: "NGN",
      status: "successful",
      narration,
      balance_before: receiver_balance_before,
      balance_after: receiver_balance_after,
      channel: "web",
      meta_data:{
          recipient_bank: "Blinkpay Bank",
        recipient_acc_num: receiver_acc_number,
        deviceInfo:{
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
        }
      }
    });

    // update tran history
    main_bank.tran_history.push(mainBankTransaction._id)
    receiverAccount.tran_history.push(recieverTransaction._id)
    senderAccount.tran_history.push(senderTransaction._id)
    
    main_bank.save()
    receiverAccount.save()
    senderAccount.save()

    console.log("✅ Transfer successfully", { amount_left });
    return {
      msg: `Money sent successfully to ${receiverAccount.name}`,
      tran_details: senderTransaction
    };
  }

  

  static async changePin(body, user) {
    const { email } = user;
    const { current_pin, new_pin } = body;

    //check current_pin
    const account = await AccountModel.findOne({ email });

    if (current_pin === account.pin) {
      account.pin = new_pin;

      await account.save();

      return {
        msg: "Pin Changed successfully",
        account,
      };
    } else {
      throw new ApiError(400, "Invalid Pin Provided");
    }
  }
}

module.exports = AccountService;
