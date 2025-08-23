const express = require("express");
const router = express.Router();
const AuthRoute = require("./auth");
const AccountRoute = require("./account")

const routes = [
{
    path: "/auth",
    route: AuthRoute
},
{
    path: "/account",
    route: AccountRoute
}
];

routes.forEach((curr) => {
    router.use(curr.path, curr.route)
})



module.exports = router;