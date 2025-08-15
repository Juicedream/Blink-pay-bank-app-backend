const express = require("express");
const router = express.Router();
const AuthRoute = require("./auth");

const routes = [{
    path: "/auth",
    route: AuthRoute
}];

routes.forEach((curr) => {
    router.use(curr.path, curr.route)
})



module.exports = router;