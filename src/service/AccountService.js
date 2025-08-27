const { default: mongoose } = require("mongoose");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const {
  getAge,
  generateAccountNumber,
  generateRefId,
  generateVirtualAccountNumber,
  generatePin,
  generateCardNumber,
  generateCvv,
  generateCardExpiryDate,
  encrypt,
  decrypt,
  dbCardExpiryDate,
} = require("../utils/function");
const eventBus = require("../events/eventBus");
const { VirtualAccountModel } = require("../models/VirtualAccount.model");
const { CardModel } = require("../models/Card.model");

const ALLOWED_EMAILS = ["judexfrayo@gmail.com", "techygarage@gmail.com"];
const MAIN_BANK_ACCOUNT = 5015203826;
const LEAST_AMOUNT = 1000;
const TRANSFER_TAX = 25.0;
const CARD_EXPIRY_MONTH = 1;
const CARD_FEE = 500;

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
    let pin = generatePin();
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
      pin,
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

    const virtual_account = await VirtualAccountModel.findOne({
      acc_number: receiver_acc_number,
    });

    if (senderAccount.acc_number === receiver_acc_number) {
      console.error("Receiver account cannot be your own account");
      throw new ApiError(401, "Receiver account cannot be your own account");
    }

    console.log("checking if receiver account number exist");
    if (!receiverAccount && !virtual_account) {
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

    if (receiverAccount) {
      let sender_balance_before = senderAccount.acc_balance;
      let receiver_balance_before = receiverAccount.acc_balance;
      let main_bank_balance_before = main_bank.acc_balance;

      main_bank.acc_balance += TRANSFER_TAX;
      senderAccount.acc_balance -= amount;
      let actual_amount = amount - TRANSFER_TAX;
      receiverAccount.acc_balance += actual_amount;

      let sender_balance_after = senderAccount.acc_balance;
      let receiver_balance_after = receiverAccount.acc_balance;
      let main_bank_balance_after = main_bank.acc_balance;

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
        meta_data: {
          recipient_bank: "Blinkpay Bank",
          recipient_acc_num: receiver_acc_number,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
        },
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
        meta_data: {
          recipient_bank: "Blinkpay Bank",
          recipient_acc_num: receiver_acc_number,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
        },
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
        meta_data: {
          recipient_bank: "Blinkpay Bank",
          recipient_acc_num: receiver_acc_number,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
        },
      });

      // update tran history
      main_bank.tran_history.push(mainBankTransaction._id);
      receiverAccount.tran_history.push(recieverTransaction._id);
      senderAccount.tran_history.push(senderTransaction._id);

      main_bank.save();
      receiverAccount.save();
      senderAccount.save();

      eventBus.emit("money:sent", {
        name,
        email,
        amount,
        narration,
        transactionId: senderTransaction._id,
      });

      eventBus.emit("money:paid", {
        bank: "Blinkpay Bank",
        transfer_tax: TRANSFER_TAX,
        narration: mainBankTransaction.narration,
        email: main_bank.email,
        transactionId: mainBankTransaction._id,
      });

      eventBus.emit("money:receieved", {
        receiver_name: receiverAccount.name,
        amount: actual_amount,
        narration,
        email: receiverAccount.email,
        transactionId: recieverTransaction._id,
      });
      console.log("✅ Transfer successfully", { amount_left });
      return {
        msg: `Money sent successfully to ${receiverAccount.name}`,
        tran_details: senderTransaction,
      };
    } else {
      narration =
        "Payverge Virtual account - " +
        receiver_acc_number +
        " - Payment from " +
        name;
      let actual_receiver = await AccountModel.findOne({
        userId: virtual_account.userId,
      });
      amount -= TRANSFER_TAX;
      if (amount !== virtual_account.amount) {
        await VirtualAccountModel.deleteOne({ userId: virtual_account.userId });
        throw new ApiError(
          401,
          `Error wrong amount: ${amount} provided instead of ${virtual_account.amount}`
        );
      }
      let sender_balance_before = senderAccount.acc_balance;
      let receiver_balance_before = actual_receiver.acc_balance;
      let main_bank_balance_before = main_bank.acc_balance;
      
      main_bank.acc_balance += TRANSFER_TAX;
      
      let main_bank_balance_after = main_bank.acc_balance;

      const ref_id = generateRefId();

      let actual_amount = amount - TRANSFER_TAX;
      if(senderAccount.acc_number !== actual_receiver.acc_number){
        senderAccount.acc_balance -= amount;
        actual_receiver.acc_balance += actual_amount;
      }else{
        senderAccount.acc_balance -= TRANSFER_TAX
      }



         console.log({actual_receiver, main_bank, senderAccount})

         let sender_balance_after = senderAccount.acc_balance;
         let receiver_balance_after = actual_receiver.acc_balance;
        

         //add to transaction
         const mainBankTransaction = await TransactionModel.create({
           account_id: main_bank._id,
           tran_type: "credit",
           amount: TRANSFER_TAX,
           currency: "NGN",
           status: "successful",
           ref_id,
           narration: `Transfer tax for ${name}`,
           balance_before: main_bank_balance_before,
           balance_after: main_bank_balance_after,
           channel: "web",
           meta_data: {
             recipient_bank: "Blinkpay Bank",
             recipient_acc_num: actual_receiver.acc_number,
             deviceInfo: {
               userAgent: navigator.userAgent,
               platform: navigator.platform,
               language: navigator.language,
             },
           },
         });
         const senderTransaction = await TransactionModel.create({
           account_id: senderAccount._id,
           tran_type: "debit",
           amount,
           currency: "NGN",
           status: "successful",
           narration,
           ref_id,
           balance_before: sender_balance_before,
           balance_after: sender_balance_after,
           channel: "web",
           meta_data: {
             recipient_bank: "Blinkpay Bank",
             recipient_acc_num: receiver_acc_number,
             deviceInfo: {
               userAgent: navigator.userAgent,
               platform: navigator.platform,
               language: navigator.language,
             },
           },
         });
         const recieverTransaction = await TransactionModel.create({
           account_id: actual_receiver._id,
           tran_type: "credit",
           amount: actual_amount,
           currency: "NGN",
           status: "successful",
           narration,
           ref_id,
           balance_before: receiver_balance_before,
           balance_after: receiver_balance_after,
           channel: "web",
           meta_data: {
             recipient_bank: "Blinkpay Bank",
             recipient_acc_num: actual_receiver.acc_number,
             deviceInfo: {
               userAgent: navigator.userAgent,
               platform: navigator.platform,
               language: navigator.language,
             },
           },
         });

         // update tran history
         main_bank.tran_history.push(mainBankTransaction._id);
         actual_receiver.tran_history.push(recieverTransaction._id);
         senderAccount.tran_history.push(senderTransaction._id);

         main_bank.save();
         actual_receiver.save();
         senderAccount.save();

         eventBus.emit("money:sent", {
           name,
           email,
           amount,
           narration,
           transactionId: senderTransaction._id,
         });

         eventBus.emit("money:paid", {
           bank: "Blinkpay Bank",
           transfer_tax: TRANSFER_TAX,
           narration: mainBankTransaction.narration,
           email: main_bank.email,
           transactionId: mainBankTransaction._id,
         });

         eventBus.emit("money:receieved", {
           receiver_name: actual_receiver.name,
           amount: actual_amount,
           narration,
           email: actual_receiver.email,
           transactionId: recieverTransaction._id,
         });
         await VirtualAccountModel.deleteOne({
           userId: virtual_account.userId,
         });
         console.log("✅ Virtual Transfer successfully", { amount_left });
         return {
           msg: `Virtual Money sent successfully to ${virtual_account.name}`,
           tran_details: senderTransaction,
         };
      }

     
    
  }
  static async bulkTransfer(body, user, account) {
    let { receiver_acc_numbers, sender_pin, amount, narration } = body;
    const { _id, name, email } = user;
    let { acc_number, transfer_limit, acc_balance, pin } = account;

    if (sender_pin !== pin) {
      throw new ApiError(400, "Invalid Pin Provided");
    }

    //checking receiver_acc_numbers length and debiting the owner the amount first then crediting the users each amount
    let totalAmountForTax = TRANSFER_TAX * receiver_acc_numbers.length;
    let total_amount_to_be_debited =
      acc_number === MAIN_BANK_ACCOUNT
        ? amount * receiver_acc_numbers.length
        : amount * receiver_acc_numbers.length + totalAmountForTax;

    //get bank account and check if bank is doing the transaction or not
    // const sender = await AccountModel.findOne({userId: _id});

    //check if total can be deducted from the sender and it is not more than the transfer limit
    if (total_amount_to_be_debited > transfer_limit) {
      throw new ApiError(
        400,
        `Total Amount should not be greater than ₦${transfer_limit.toLocaleString()}`
      );
    }

    let preDebit = acc_balance - total_amount_to_be_debited;
    // console.log(preDebit);
    // console.log(acc_balance)
    if (preDebit < LEAST_AMOUNT) {
      throw new ApiError(
        400,
        `Invalid Request - ₦${LEAST_AMOUNT.toLocaleString()} should be left in the account`
      );
    }

    //check all receivers
    const accounts = receiver_acc_numbers.map(Number);

    const all_accounts = await AccountModel.find({
      acc_number: { $in: accounts },
    }).select("acc_number");

    const same_with_sender = accounts.filter((acc) => acc === acc_number);
    const valid_accounts = all_accounts.map((acc) => acc.acc_number);
    const invalid_accounts = accounts.filter(
      (acc) => !valid_accounts.includes(acc)
    );

    if (same_with_sender[0] === acc_number) {
      throw new ApiError(
        400,
        "Receiver account numbers must not contain your account number: " +
          same_with_sender
      );
    }

    if (invalid_accounts.length > 0) {
      throw new ApiError(
        404,
        `Not Found - The following account number(s) are invalid: ${invalid_accounts.join(
          ","
        )}`
      );
    }

    // transfer to all valid accounts
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      //debit from sender
      const sender = await AccountModel.findOne({ acc_number }).session(
        session
      );
      const ref_id = generateRefId();
      const sender_balance_before = sender.acc_balance;
      const sender_balance_after = preDebit;
      const senderTran = new TransactionModel({
        account_id: sender._id,
        tran_type: "debit",
        amount: total_amount_to_be_debited,
        status: "successful",
        narration,
        ref_id,
        channel: "web",
        balance_before: sender_balance_before,
        balance_after: sender_balance_after,
        meta_data: {
          recipient_bank: "Blinkpay",
          recipient_acc_num: receiver_acc_numbers.join(","),
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      });

      let bank_account = await AccountModel.findOne({
        acc_number: MAIN_BANK_ACCOUNT,
      }).session(session);
      let main_bank_balance_before = bank_account.acc_balance;
      if (acc_number !== MAIN_BANK_ACCOUNT) {
        bank_account.acc_balance += totalAmountForTax;
      }

      let main_bank_balance_after = bank_account.acc_balance;

      const mainBankTran = new TransactionModel({
        account_id: bank_account._id,
        tran_type: "credit",
        amount: totalAmountForTax,
        status: "successful",
        narration: `Transfer Tax paid from ${name}`,
        channel: "web",
        ref_id,
        balance_before: main_bank_balance_before,
        balance_after: main_bank_balance_after,
        meta_data: {
          recipient_bank: "Blinkpay",
          recipient_acc_num: receiver_acc_numbers.join(","),
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      });

      await senderTran.save({ session });
      await mainBankTran.save({ session });
      sender.acc_balance = preDebit;
      sender.tran_history.push(senderTran._id);
      bank_account.tran_history.push(mainBankTran._id);
      await sender.save({ session });
      await bank_account.save({ session });

      let bulkAccountOps = [];
      let transactionDocs = [];

      for (const acc of valid_accounts) {
        console.log({ acc, valid_accounts });
        const account = await AccountModel.findOne({ acc_number: acc }).session(
          session
        );

        const balance_before = account.acc_balance;
        const balance_after = balance_before + amount;

        const tran = new TransactionModel({
          account_id: account._id,
          tran_type: "credit",
          amount,
          status: "successful",
          narration,
          ref_id,
          channel: "web",
          balance_before,
          balance_after,
          meta_data: {
            sender_acc_num: acc_number,
          },
        });

        transactionDocs.push(tran);

        bulkAccountOps.push({
          updateOne: {
            filter: { _id: account._id },
            update: {
              $inc: { amount: amount },
              $push: { tran_history: tran._id },
            },
          },
        });
      }

      await TransactionModel.insertMany(transactionDocs, { session });

      // Bulk update receiver accounts
      if (bulkAccountOps.length > 0) {
        await AccountModel.bulkWrite(bulkAccountOps, { session });
      }

      // 4. Commit transaction
      await session.commitTransaction();
      session.endSession();

      return {
        msg: "Bulk Transfer was successful",
        success: true,
        sender: acc_number,
        receivers: receiver_acc_numbers.join(","),
        sender_transaction: senderTran,
        receiver_transactions: transactionDocs,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async createVirtualAccount(body, user, account) {
    const { _id, name } = user;
    const { amount } = body;
    const EXPIRES_IN = 2; // mins
    const ACCOUNT_NAME = "Payverge_Checkout_" + name.slice(0, 2);

    if (amount < LEAST_AMOUNT) {
      throw new ApiError(
        400,
        `Amount must be at least ₦${LEAST_AMOUNT.toLocaleString()}`
      );
    }

    //check if virtual account already exist for the user
    const existing_v_acc = await VirtualAccountModel.findOne({ userId: _id });

    if (existing_v_acc) {
      throw new ApiError(
        400,
        "Cannot create new virtual account - " +
          existing_v_acc.name +
          " has already been generated on your account!"
      );
    }
    const acc_number = generateVirtualAccountNumber();
    //creating a virtual account,
    const newAccount = await VirtualAccountModel.create({
      name: ACCOUNT_NAME,
      userId: _id,
      acc_number,
      amount: Number(amount) + TRANSFER_TAX,
      expiresAt: new Date(Date.now() + EXPIRES_IN * 60 * 1000), // expires in the expires_in minutes
    });

    return {
      msg: "Virtual account generated successfully",
      virtual_account: newAccount,
    };
  }

  static async createDigitalCard(body, user, account) {
    const { card_name, card_type } = body;
    const {
      acc_balance,
      acc_number,
      acc_type,
      _id: account_id,
      pin: account_pin,
    } = account;
    const { _id: user_id, email, name } = user;

    //check if user already hhas a card
    const hasCard = await CardModel.findOne({ accountId: account_id });
    if (hasCard) {
      throw new ApiError(
        400,
        "Can't create a new card - You already have a card"
      );
    }

    let card_pan = generateCardNumber(acc_type);
    let card_cvv = generateCvv();
    let card_expiry = generateCardExpiryDate(CARD_EXPIRY_MONTH);

    let card_pan_encrypted = encrypt(card_pan);
    let card_cvv_encyrpted = encrypt(card_cvv);
    let card_pin_encrypted = encrypt(account_pin);

    console.log({ card_cvv, card_pan, card_expiry, account_pin });

    //create card and debit user
    if (acc_balance < LEAST_AMOUNT || acc_balance === LEAST_AMOUNT) {
      throw new ApiError(400, "Insufficient funds to generate card");
    }
    let user_account = await AccountModel.findOne({ acc_number });

    let sender_balance_before = user_account.acc_balance;
    user_account.acc_balance -= LEAST_AMOUNT;
    let sender_balance_after = user_account.acc_balance;

    let bank = await AccountModel.findOne({
      acc_number: MAIN_BANK_ACCOUNT,
    });

    let bank_balance_before = bank.acc_balance;
    bank.acc_balance += LEAST_AMOUNT;
    let bank_balance_after = bank.acc_balance;

    const newCard = await CardModel.create({
      card_name,
      acc_type,
      card_type,
      accountId: account_id,
      card_pan: card_pan_encrypted,
      card_cvv: card_cvv_encyrpted,
      pin: card_pin_encrypted,
      card_expiry,
      expiresAt: dbCardExpiryDate(CARD_EXPIRY_MONTH),
    });

    let narration = "Card Creation";
    let ref_id = generateRefId();

    const user_tran = await TransactionModel.create({
      account_id,
      tran_type: "debit",
      amount: LEAST_AMOUNT,
      status: "successful",
      narration,
      ref_id,
      balance_before: sender_balance_before,
      balance_after: sender_balance_after,
      channel: "web",
    });
    const bank_tran = await TransactionModel.create({
      account_id: bank._id,
      tran_type: "credit",
      amount: LEAST_AMOUNT,
      status: "successful",
      narration,
      ref_id,
      balance_before: bank_balance_before,
      balance_after: bank_balance_after,
      channel: "web",
    });

    user_account.tran_history.push(user_tran._id);
    bank.tran_history.push(bank_tran._id);

    await user_account.save();
    await bank.save();

    return {
      msg: "Card created successfully",
      card: newCard,
    };
  }

  static async showCard(account) {
    const { _id } = account;

    const hasCard = await CardModel.findOne({ accountId: _id });
    if (!hasCard) {
      throw new ApiError(404, "Invalid Request- You don't have a card");
    }

   
    //show card
    let decrypted_pan_number =  decrypt(hasCard.card_pan);
    let decrypted_cvv =  decrypt(hasCard.card_cvv);
    const expiry_date = hasCard.card_expiry;
    const card_name = hasCard.card_name;

    return {
      msg: "Card details",
      card: {
        card_name,
        pan_number: decrypted_pan_number,
        cvv: decrypted_cvv,
        expiry_date,
      },
    };
    // return{
    //   hasCard
    // }
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
