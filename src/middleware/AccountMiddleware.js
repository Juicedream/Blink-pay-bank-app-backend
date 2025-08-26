const { AccountModel } = require("../models/Account.model");

const AccountMiddleware = async (req, res, next) => {
    const {_id} = req.user;
    const hasAccount = await AccountModel.findOne({userId: _id})
    if(!hasAccount){
        throw new Error(401, "Unauthorized - You need to create an account")
    }

    req.account = hasAccount;
    next();

}


module.exports = AccountMiddleware