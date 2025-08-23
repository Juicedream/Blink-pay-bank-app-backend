const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const JWTService = require("../utils/JwtService");

const AuthMiddleware = async(req, res, next) => {
    try{
        const headers = req.headers['authorization'] || "";
        if(!headers || !headers.startsWith('Bearer ')){
            throw new ApiError(401, "Please Login First");
        }


        const token = headers.split(" ")[1]
        if(!token){
            throw new ApiError(401, "Enter Valid Details")
        }
        const payload = JWTService.validateToken(token)
        // get users details from db
        const user = await UserModel.findById(payload.user)
        console.log(user)
           
        req.user = user;
       

        next()
    }catch(error){
        next(error)
    }
}

module.exports = AuthMiddleware