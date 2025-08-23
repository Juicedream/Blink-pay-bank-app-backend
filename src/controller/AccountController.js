const AccountService = require("../service/AccountService");


class AccountController {
  static async createAccount(req, res) {
    const user = req.user;
    const res_obj = await AccountService.createAccount(req.body, user);
    res.status(201).send(res_obj)
  }

  static async registerAccount(req, res){
     const user = req.user;
     const res_obj = await AccountService.registerAccount(req.body, user);
     res.status(201).send(res_obj);
  }

  static async singleTransfer(req, res){
    const user = req.user;
    const res_obj = await AccountService.singleTransfer(req.body, user);
    res.status(200).send(res_obj);  
  }







  static async changePin(req, res) {
    const user = req.user;
    const res_obj = await AccountService.changePin(req.body, user)
    res.status(201).send(res_obj)
  }
}

module.exports = AccountController;
