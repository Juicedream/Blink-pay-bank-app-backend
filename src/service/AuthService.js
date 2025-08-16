const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const bcryptjs = require("bcryptjs");

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

    return {
      msg: "Login Successful" + "! Welcome back " + check_exist.name,
      token: "123"
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

    return {
      msg: "User registered successfully",
      user,
    };
  }
}

module.exports = AuthService;
