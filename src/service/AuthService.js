const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const bcryptjs = require("bcryptjs");
const JWTService = require("../utils/JwtService");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transaction.model");
const { all } = require("../router/account");

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
    if(!found_user){
      throw new ApiError(401, "Profile Not Found")
    }
    
    let all_user_transactions = await TransactionModel.find({account_id: found_account._id})


    return {user: found_account, tran_history: all_user_transactions}
  }
}

module.exports = AuthService;
