const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const bcryptjs = require("bcryptjs");
const JWTService = require("../utils/JwtService");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const { all } = require("../router/account");
const { CardModel } = require("../models/Card.model");
const { generateOtpCode } = require("../utils/function");

class AuthService {
  static async loginUser(body) {
    const { email, password } = body;
    const check_exist = await UserModel.findOne({
      email
    });
    if (!check_exist) {
      throw new ApiError(404, "No account Found");
    }
    const isMatch = await bcryptjs.compare(password, check_exist.password);
    if(!isMatch){
      throw new ApiError(400, "Invalid Credentials");
    }

    const token = JWTService.generateToken(check_exist._id);

    return {
      msg: "Login Successful" + "! Welcome back " + check_exist.name,
      token
    }
  }

  static async passwordlessLogin(body){
    const { email } = body;
    const check_exist = await AccountModel.findOne({
      email
    });
    if(!check_exist){
      throw new ApiError(404, "No account Found");
    }

    check_exist.otp = generateOtpCode();
    await check_exist.save();
    return {
      msg: "Otp sent to your email",
      otp: check_exist.otp
    }
  }

  static async verfiyOtp(body){
    const { email, otp } = body;
    const check_exist = await AccountModel.findOne({
      email
    });
    if(!check_exist){
      throw new ApiError(404, "No account Found");
    }
    if(check_exist.otp === "" || null){
      throw new ApiError(400, "No Otp found on this account, please request for a new one");
    }
    if(check_exist.otp !== otp){
      throw new ApiError(400, "Invalid Otp");
    }


    const userAccount = await UserModel.findOne({email});
    

    const token = JWTService.generateToken(userAccount._id);

    check_exist.otp = "";
    await check_exist.save();

    return {
      msg: "Login Successful" + "! Welcome back " + check_exist.name,
      token,
    };
  }
  static async registerUser(body) {
    const { name, email, password, acc_type } = body;

    const check_exist = await UserModel.findOne({
      email: email.toLowerCase(),
    });
    if (check_exist) {
      throw new ApiError(400, "Email Already Exist");
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      acc_type,
    });

    const token = JWTService.generateToken(user._id);


    return {
      msg: "User registered successfully",
      token
    };
  }

  static async profileUser(user){
    const found_user = await UserModel.findById(user).select("name email acc_type createdAt -_id");
    const found_account = await AccountModel.findOne({userId: user})
    const card = await CardModel.findOne({accountId: found_account._id})
    if(!found_user){
      throw new ApiError(401, "Profile Not Found")
    }
    
    let all_user_transactions = await TransactionModel.find({account_id: found_account._id})


    return {user: found_account, tran_history: all_user_transactions, card}
  }
}

module.exports = AuthService;
