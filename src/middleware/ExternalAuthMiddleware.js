const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const JWTService = require("../utils/JwtService");

const ExternalAuthMiddleware = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      throw new ApiError(401, "Email is required");
    }
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(404, "Invalid Email Address");
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = ExternalAuthMiddleware;
