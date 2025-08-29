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

  static async bulkTransfer(req, res){
    const user = req.user;
    const account = req.account;
    const res_obj = await AccountService.bulkTransfer(req.body, user, account);
    res.status(200).send(res_obj);
  }
  static async createVirtualAccount(req, res){
    const user = req.user;
    const account = req.account;
    const res_obj = await AccountService.createVirtualAccount(req.body, user, account);
    res.status(201).send(res_obj);
  }
  static async createDigitalCard(req, res){
    const user = req.user;
    const account = req.account;
    const res_obj = await AccountService.createDigitalCard(req.body, user, account);
    res.status(201).send(res_obj);
  }
  static async showCard(req, res){
    const account = req.account;
    const res_obj = await AccountService.showCard(account);
    res.status(200).send(res_obj);
  }
  static async deleteCard(req, res){
    const account = req.account;
    const card = req.card;
    const res_obj = await AccountService.deleteCard(req.body, account, card);
    res.status(200).send(res_obj);
  }
  static async cardPayment(req, res){
    const account = req.account;
    const card = req.card;
    const res_obj = await AccountService.cardPayment(req.body, account, card);
    res.status(200).send(res_obj);
  }


  






  static async changePin(req, res) {
    const user = req.user;
    const res_obj = await AccountService.changePin(req.body, user)
    res.status(201).send(res_obj)
  }
}

module.exports = AccountController;
