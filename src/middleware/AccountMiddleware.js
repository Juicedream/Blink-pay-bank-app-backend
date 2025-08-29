const { AccountModel } = require("../models/Account.model");
const { CardModel } = require("../models/Card.model");

const AccountMiddleware = async (req, res, next) => {
    const {_id} = req.user;
    const hasAccount = await AccountModel.findOne({userId: _id})
    if(!hasAccount){
        throw new Error(401, "Unauthorized - You need to create an account")
    }
    const hasCard = await CardModel.findOne({accountId: hasAccount._id})

    req.account = hasAccount;
    req.card = hasCard;
    next();

}


module.exports = AccountMiddleware